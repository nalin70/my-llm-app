import type { Request, Response } from 'express';
import { z } from 'zod';
import { fundRecommendationRequestSchema } from '../schemas/fundRecommendation';
import { FundRecommendationService } from '../services/fundRecommendationService';
import { FundService } from '../services/fundService';

const searchFundsQuerySchema = z.object({
  fundName: z.string().min(2, 'fundName must be at least 2 characters'),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const fundService = new FundService();
const fundRecommendationService = new FundRecommendationService();

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

  async recommendFunds(request: Request, response: Response) {
    const parsedBody = fundRecommendationRequestSchema.safeParse(request.body);

    if (!parsedBody.success) {
      return response.status(400).json({
        error: 'Invalid recommendation request',
        details: parsedBody.error.flatten().fieldErrors,
      });
    }

    const recommendation = await fundRecommendationService.recommendFunds(parsedBody.data);

    console.log(
      `Fund recommendation completed amount=${parsedBody.data.investmentAmount} horizon=${parsedBody.data.investmentHorizon} risk=${parsedBody.data.riskTolerance} buckets=${recommendation.recommendations.length}`
    );

    return response.json(recommendation);
  }
}
