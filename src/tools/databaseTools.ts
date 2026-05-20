import { tool } from 'ai';
import type { RowDataPacket } from 'mysql2';
import { z } from 'zod';
import { db } from '../config/database';

function normalizeRow(row: RowDataPacket) {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [
      key,
      value instanceof Date ? value.toISOString().slice(0, 10) : value,
    ])
  );
}

const lookupCustomerInputSchema = z.object({
  email: z.string().email().describe('The email address of the customer'),
});

const searchMutualFundsInputSchema = z.object({
  query: z.string().min(2).describe('Fund name, partial fund name, or scheme code to search for'),
  limit: z.number().int().min(1).max(10).default(5).describe('Maximum number of matching funds to return'),
});

const getMutualFundNavHistoryInputSchema = z.object({
  schemeCode: z.string().min(1).describe('The mutual fund scheme code, for example IIF0022'),
  fromDate: z.string().date().optional().describe('Optional start date in YYYY-MM-DD format'),
  toDate: z.string().date().optional().describe('Optional end date in YYYY-MM-DD format'),
  limit: z.number().int().min(1).max(365).default(30).describe('Maximum number of NAV records to return'),
});

type SearchMutualFundsInput = z.infer<typeof searchMutualFundsInputSchema>;
type GetMutualFundNavHistoryInput = z.infer<typeof getMutualFundNavHistoryInputSchema>;

export const customerLookupTool = tool({
  description: 'Lookup customer details and lifetime value by their email address.',
  inputSchema: lookupCustomerInputSchema,
  execute: async ({ email }: { email: string }) => {
    // Mock database call
    return {
      customerId: 'cust_98742',
      name: 'Jane Doe',
      status: 'VIP',
      joinDate: '2023-01-15',
    };
  },
});

export const searchMutualFundsTool = tool({
  description: 'Search mutual funds by name or scheme code and return fund metadata with the latest available NAV.',
  inputSchema: searchMutualFundsInputSchema,
  execute: async ({ query, limit }: SearchMutualFundsInput) => {
    const searchTerm = `%${query}%`;
    const [rows] = await db.execute<RowDataPacket[]>(
      `
      SELECT
        fund.mfi_scheme_code AS schemeCode,
        fund.fund_name AS fundName,
        fund.fund_name_2 AS alternateFundName,
        fund.asset_class AS assetClass,
        fund.category,
        fund.amfi_riskometer AS riskometer,
        fund.objective,
        fund.benchmark,
        fund.fund_returns_1m AS return1m,
        fund.fund_returns_3m AS return3m,
        fund.fund_returns_6m AS return6m,
        fund.fund_returns_1y AS return1y,
        fund.fund_returns_3y AS return3y,
        fund.fund_returns_5y AS return5y,
        fund.fund_aum AS aum,
        fund.expense_ratio AS expenseRatio,
        fund.minimum_investment_amount_rs AS minimumInvestmentAmount,
        fund.launch_date AS launchDate,
        latest_nav.nav_date AS latestNavDate,
        latest_nav.nav_value AS latestNavValue
      FROM bio_data_1 fund
      LEFT JOIN (
        SELECT nav.scheme_code, nav.nav_date, nav.nav_value
        FROM fund_nav nav
        INNER JOIN (
          SELECT scheme_code, MAX(nav_date) AS latest_nav_date
          FROM fund_nav
          GROUP BY scheme_code
        ) latest
          ON latest.scheme_code = nav.scheme_code
          AND latest.latest_nav_date = nav.nav_date
      ) latest_nav
        ON latest_nav.scheme_code = fund.mfi_scheme_code
      WHERE fund.fund_name LIKE ?
        OR fund.fund_name_2 LIKE ?
        OR fund.mfi_scheme_code = ?
      ORDER BY fund.fund_name
      LIMIT ${limit}
      `,
      [searchTerm, searchTerm, query]
    );

    return rows.map(normalizeRow);
  },
});

export const getMutualFundNavHistoryTool = tool({
  description: 'Get historical NAV values for a mutual fund by scheme code.',
  inputSchema: getMutualFundNavHistoryInputSchema,
  execute: async ({ schemeCode, fromDate, toDate, limit }: GetMutualFundNavHistoryInput) => {
    const conditions = ['scheme_code = ?'];
    const values: Array<string | number> = [schemeCode];

    if (fromDate) {
      conditions.push('nav_date >= ?');
      values.push(fromDate);
    }

    if (toDate) {
      conditions.push('nav_date <= ?');
      values.push(toDate);
    }

    const [rows] = await db.execute<RowDataPacket[]>(
      `
      SELECT
        scheme_code AS schemeCode,
        cleaned_fund_name AS fundName,
        nav_date AS navDate,
        nav_value AS navValue
      FROM fund_nav
      WHERE ${conditions.join(' AND ')}
      ORDER BY nav_date DESC
      LIMIT ${limit}
      `,
      values
    );

    return rows.map(normalizeRow);
  },
});