import { z } from 'zod';

export const investmentModeSchema = z.enum(['lumpsum', 'sip', 'both']);
export const riskToleranceSchema = z.enum(['low', 'moderate', 'high']);
export const investmentHorizonSchema = z.enum(['short_term', 'medium_term', 'long_term']);
export const investmentGoalSchema = z.enum([
  'capital_safety',
  'regular_income',
  'wealth_creation',
  'tax_saving',
  'portfolio_diversification',
]);
export const preferredAssetSchema = z.enum(['equity', 'debt', 'metals', 'short_term', 'tax_saver']);
export const liquidityNeedSchema = z.enum(['high', 'medium', 'low']);
export const incomePreferenceSchema = z.enum(['growth', 'regular_income', 'balanced']);
export const experienceLevelSchema = z.enum(['beginner', 'intermediate', 'experienced']);

export const fundRecommendationRequestSchema = z.object({
  investmentAmount: z.coerce.number().positive('investmentAmount must be greater than 0'),
  investmentMode: investmentModeSchema.default('lumpsum'),
  riskTolerance: riskToleranceSchema,
  investmentHorizon: investmentHorizonSchema,
  goal: investmentGoalSchema.default('wealth_creation'),
  needsTaxSaving: z.coerce.boolean().default(false),
  preferredAssets: z.array(preferredAssetSchema).min(1).default(['equity', 'debt']),
  liquidityNeed: liquidityNeedSchema.default('medium'),
  incomePreference: incomePreferenceSchema.default('growth'),
  experienceLevel: experienceLevelSchema.default('beginner'),
  amcExposureLimitPercent: z.coerce.number().positive().max(100).default(30),
  strictMode: z.coerce.boolean().default(true),
  useOptimizerPolicy: z.coerce.boolean().default(true),
}).strict();

export type FundRecommendationRequest = z.infer<typeof fundRecommendationRequestSchema>;
export type PreferredAsset = z.infer<typeof preferredAssetSchema>;
export type RiskTolerance = z.infer<typeof riskToleranceSchema>;
export type InvestmentHorizon = z.infer<typeof investmentHorizonSchema>;
export type InvestmentGoal = z.infer<typeof investmentGoalSchema>;
export type LiquidityNeed = z.infer<typeof liquidityNeedSchema>;
