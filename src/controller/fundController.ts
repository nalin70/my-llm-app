import type { Request, Response } from 'express';
import { z } from 'zod';
import { FundService } from '../services/fundService';

const searchFundsQuerySchema = z.object({
  fundName: z.string().min(2, 'fundName must be at least 2 characters'),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const fundService = new FundService();

export class FundController {
  async searchFundsByName(request: Request, response: Response) {
    const parsedQuery = searchFundsQuerySchema.safeParse(request.query);

    if (!parsedQuery.success) {
      return response.status(400).json({
        error: 'Invalid query parameters',
        details: parsedQuery.error.flatten().fieldErrors,
      });
    }

    const funds = await fundService.searchFundsByName(parsedQuery.data);

    console.log(
      `Fund search completed fundName="${parsedQuery.data.fundName}" limit=${parsedQuery.data.limit} count=${funds.length}`
    );

    return response.json({
      query: parsedQuery.data.fundName,
      count: funds.length,
      data: funds,
    });
  }
}
