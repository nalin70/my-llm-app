import type { RowDataPacket } from 'mysql2';
import { db } from '../config/database';

export type SearchFundsByNameOptions = {
  fundName: string;
  limit: number;
};

function normalizeRow(row: RowDataPacket) {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [
      key,
      value instanceof Date ? value.toISOString().slice(0, 10) : value,
    ])
  );
}

export class FundService {
  async searchFundsByName({ fundName, limit }: SearchFundsByNameOptions) {
    const searchTerm = `%${fundName}%`;
    const [rows] = await db.execute<RowDataPacket[]>(
      `
      SELECT *
      FROM bio_data_1
      WHERE fund_name LIKE ?
        OR fund_name_2 LIKE ?
      ORDER BY fund_name
      LIMIT ${limit}
      `,
      [searchTerm, searchTerm]
    );

    return rows.map(normalizeRow);
  }
}
