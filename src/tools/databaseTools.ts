import { tool } from 'ai';
import type { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../config/prisma';

function normalizeRow(row: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [
      key,
      typeof value === 'bigint' ? Number(value) :
      value instanceof Date ? value.toISOString().slice(0, 10) :
      value && typeof value === 'object' && 'toString' in value ? value.toString() :
      value,
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
    const funds = await prisma.bio_data_1.findMany({
      where: {
        OR: [
          { fund_name: { contains: query } },
          { fund_name_2: { contains: query } },
          { mfi_scheme_code: query },
        ],
      },
      select: {
        mfi_scheme_code: true,
        fund_name: true,
        fund_name_2: true,
        asset_class: true,
        category: true,
        amfi_riskometer: true,
        objective: true,
        benchmark: true,
        fund_returns_1m: true,
        fund_returns_3m: true,
        fund_returns_6m: true,
        fund_returns_1y: true,
        fund_returns_3y: true,
        fund_returns_5y: true,
        fund_aum: true,
        expense_ratio: true,
        minimum_investment_amount_rs: true,
        launch_date: true,
      },
      orderBy: {
        fund_name: 'asc',
      },
      take: limit,
    });

    const latestNavRows = await Promise.all(
      funds.map((fund) =>
        prisma.fund_nav.findFirst({
          where: {
            scheme_code: fund.mfi_scheme_code,
          },
          select: {
            scheme_code: true,
            nav_date: true,
            nav_value: true,
          },
          orderBy: {
            nav_date: 'desc',
          },
        })
      )
    );

    const latestNavBySchemeCode = new Map<string, NonNullable<(typeof latestNavRows)[number]>>();

    for (const nav of latestNavRows) {
      if (nav) {
        latestNavBySchemeCode.set(nav.scheme_code, nav);
      }
    }

    return funds.map((fund) => {
      const latestNav = latestNavBySchemeCode.get(fund.mfi_scheme_code);

      return normalizeRow({
        schemeCode: fund.mfi_scheme_code,
        fundName: fund.fund_name,
        alternateFundName: fund.fund_name_2,
        assetClass: fund.asset_class,
        category: fund.category,
        riskometer: fund.amfi_riskometer,
        objective: fund.objective,
        benchmark: fund.benchmark,
        return1m: fund.fund_returns_1m,
        return3m: fund.fund_returns_3m,
        return6m: fund.fund_returns_6m,
        return1y: fund.fund_returns_1y,
        return3y: fund.fund_returns_3y,
        return5y: fund.fund_returns_5y,
        aum: fund.fund_aum,
        expenseRatio: fund.expense_ratio,
        minimumInvestmentAmount: fund.minimum_investment_amount_rs,
        launchDate: fund.launch_date,
        latestNavDate: latestNav?.nav_date ?? null,
        latestNavValue: latestNav?.nav_value ?? null,
      });
    });
  },
});

export const getMutualFundNavHistoryTool = tool({
  description: 'Get historical NAV values for a mutual fund by scheme code.',
  inputSchema: getMutualFundNavHistoryInputSchema,
  execute: async ({ schemeCode, fromDate, toDate, limit }: GetMutualFundNavHistoryInput) => {
    const where: Prisma.fund_navWhereInput = {
      scheme_code: schemeCode,
    };

    if (fromDate || toDate) {
      where.nav_date = {
        ...(fromDate ? { gte: new Date(`${fromDate}T00:00:00.000Z`) } : {}),
        ...(toDate ? { lte: new Date(`${toDate}T00:00:00.000Z`) } : {}),
      };
    }

    const rows = await prisma.fund_nav.findMany({
      where,
      select: {
        scheme_code: true,
        cleaned_fund_name: true,
        nav_date: true,
        nav_value: true,
      },
      orderBy: {
        nav_date: 'desc',
      },
      take: limit,
    });

    return rows.map((row) =>
      normalizeRow({
        schemeCode: row.scheme_code,
        fundName: row.cleaned_fund_name,
        navDate: row.nav_date,
        navValue: row.nav_value,
      })
    );
  },
});
