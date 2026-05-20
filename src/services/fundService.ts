import { prisma } from '../config/prisma';

export type SearchFundsByNameOptions = {
  fundName: string;
  limit: number;
};

function normalizeRow(row: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [
      key,
      typeof value === 'bigint' ? Number(value) :
      value instanceof Date ? value.toISOString().slice(0, 10) : value,
    ])
  );
}

export class FundService {
  async searchFundsByName({ fundName, limit }: SearchFundsByNameOptions) {
    const funds = await prisma.bio_data_1.findMany({
      where: {
        OR: [
          { fund_name: { contains: fundName } },
          { fund_name_2: { contains: fundName } },
        ],
      },
      orderBy: {
        fund_name: 'asc',
      },
      take: limit,
    });

    return funds.map((fund) => normalizeRow(fund));
  }
}
