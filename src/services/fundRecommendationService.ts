import type { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import type { FundRecommendationRequest, InvestmentHorizon, RiskTolerance } from '../schemas/fundRecommendation';

type AssetClassKey = 'equity' | 'debt' | 'metals';
type RecommendationBucketKey = AssetClassKey | 'taxSaver' | 'shortTerm';
type SubAssetClassKey =
  | 'largeCap'
  | 'flexiCap'
  | 'midCap'
  | 'smallCap'
  | 'elssTaxSaver'
  | 'liquidFund'
  | 'ultraShortDurationDebt'
  | 'shortDurationDebt'
  | 'corporateBond'
  | 'goldOrSilver';

type Allocation = Partial<Record<AssetClassKey, number>>;
type SubAllocation = Partial<Record<SubAssetClassKey, number>>;

const fundRecommendationSelect = {
  fund_id: true,
  mfi_scheme_code: true,
  fund_name: true,
  fund_name_2: true,
  asset_class: true,
  category: true,
  amfi_riskometer: true,
  objective: true,
  benchmark: true,
  direct_plan: true,
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
  active_passive: true,
  exit_load: true,
  fund_lock_in: true,
  tax_benefit: true,
  scheme_isin: true,
  international_fund: true,
  bio_data_2: {
    orderBy: [
      { collection_date: 'desc' },
      { id: 'desc' },
    ],
    take: 1,
    select: {
      fund_house_name: true,
      fund_manager: true,
      asset_class_split_equity: true,
      asset_class_split_debt: true,
      asset_class_split_cash_others: true,
      asset_class_split_precious_metals: true,
      equity_market_cap_split_large_cap: true,
      equity_market_cap_split_mid_cap: true,
      equity_market_cap_split_small_cap: true,
      debt_credit_quality_split_sovereign: true,
      debt_credit_quality_split_aaa_a1: true,
      debt_credit_quality_split_aa_aa_aa: true,
      debt_credit_quality_split_a_a_a: true,
      debt_credit_quality_split_bbb_and_below: true,
      debt_credit_quality_split_unrated: true,
      ytm: true,
    },
  },
} satisfies Prisma.bio_data_1Select;

type CandidateFund = Prisma.bio_data_1GetPayload<{ select: typeof fundRecommendationSelect }>;

const rankSelect = {
  fund_id: true,
  unique_identifier_mfi_scheme_code: true,
  rank_equity_normal_case: true,
  rank_equity_special_case: true,
  rank_equity_nifty_50_case: true,
  rank_equity_nifty_500_case: true,
  rank_debt_core_portfolio: true,
  rank_debt_tactical: true,
  rank_debt_short_term_parking: true,
  rank_precious_metals_category: true,
  rank_precious_metals_category_median: true,
} satisfies Prisma.ranksSelect;

const smartRecommendationSelect = {
  scheme_code: true,
  equity_fund_upside_capture: true,
  equity_category_median_upside_capture: true,
  equity_fund_jansens_alpha: true,
  equity_category_median_jansens_alpha: true,
  equity_fund_sharpe_ratio: true,
  equity_category_median_sharpe_ratio: true,
  equity_fund_downside_capture: true,
  equity_category_median_downside_capture: true,
  equity_fund_consistency: true,
  equity_category_median_consistency: true,
  equity_fund_impact_cost_days: true,
  equity_category_median_impact_cost_days: true,
  debt_fund_sharpe_ratio: true,
  debt_category_median_sharpe_ratio: true,
  debt_fund_interest_rate_sensitivity: true,
  debt_category_median_interest_rate_sensitivity: true,
  debt_fund_credit_safety: true,
  debt_category_median_credit_safety: true,
  debt_fund_cash_cushion: true,
  debt_category_median_cash_cushion: true,
  precious_metals_fund_tracking_error: true,
  precious_metals_category_median_tracking_error: true,
} satisfies Prisma.smart_recommendationSelect;

const smartRedemptionSelect = {
  scheme_code: true,
  lock_in_days: true,
  tax_days: true,
  exit_load_days_1: true,
  exit_load_percentage_1: true,
  exit_load_days_2: true,
  exit_load_percentage_2: true,
  exit_load_days_3: true,
  exit_load_percentage_3: true,
  stcg_percentage: true,
  ltcg_percentage: true,
} satisfies Prisma.smart_redemptionSelect;

const investableUniverseSelect = {
  mfi_scheme_code: true,
  asset_class: true,
  sub_asset_class: true,
  tactical_call_for_debt: true,
  rank: true,
  equity: true,
  debt_cash_and_other: true,
  large_cap: true,
  mid_cap: true,
  small_cap: true,
} satisfies Prisma.investable_universeSelect;

type RankRow = Prisma.ranksGetPayload<{ select: typeof rankSelect }>;
type SmartRecommendationRow = Prisma.smart_recommendationGetPayload<{ select: typeof smartRecommendationSelect }>;
type SmartRedemptionRow = Prisma.smart_redemptionGetPayload<{ select: typeof smartRedemptionSelect }>;
type InvestableUniverseRow = Prisma.investable_universeGetPayload<{ select: typeof investableUniverseSelect }>;

type EnrichedCandidate = {
  fund: CandidateFund;
  rank: RankRow | undefined;
  smartRecommendation: SmartRecommendationRow | undefined;
  smartRedemption: SmartRedemptionRow | undefined;
  investableUniverse: InvestableUniverseRow | undefined;
};

type RankField = keyof Pick<RankRow,
  | 'rank_equity_normal_case'
  | 'rank_equity_special_case'
  | 'rank_equity_nifty_50_case'
  | 'rank_equity_nifty_500_case'
  | 'rank_debt_core_portfolio'
  | 'rank_debt_tactical'
  | 'rank_debt_short_term_parking'
  | 'rank_precious_metals_category'
>;

type BucketDefinition = {
  key: RecommendationBucketKey | SubAssetClassKey;
  label: string;
  assetClass: AssetClassKey;
  keywords: string[];
  excludeKeywords?: string[];
  reason: string;
};

const fundBucketDefinitions: Record<RecommendationBucketKey, BucketDefinition> = {
  equity: {
    key: 'equity',
    label: 'Equity Funds',
    assetClass: 'equity',
    keywords: ['equity', 'large cap', 'largecap', 'flexi cap', 'flexicap', 'multi cap', 'multicap', 'mid cap', 'midcap', 'small cap', 'smallcap', 'value', 'focused'],
    excludeKeywords: ['elss', 'tax saver', 'tax saving', 'tax plan'],
    reason: 'Core growth allocation selected from equity funds, with sub-asset mix handled by allocation policy.',
  },
  debt: {
    key: 'debt',
    label: 'Debt Funds',
    assetClass: 'debt',
    keywords: ['debt', 'bond', 'corporate bond', 'banking and psu', 'banking & psu', 'psu', 'income', 'gilt', 'dynamic bond', 'credit risk'],
    excludeKeywords: ['liquid', 'overnight', 'ultra short', 'low duration', 'money market'],
    reason: 'Stability and income allocation selected from debt funds, separate from short-term parking.',
  },
  metals: {
    key: 'metals',
    label: 'Metals Funds',
    assetClass: 'metals',
    keywords: ['gold', 'silver', 'precious metals', 'commodity'],
    reason: 'Satellite diversification allocation selected from metals funds.',
  },
  taxSaver: {
    key: 'taxSaver',
    label: 'Tax Saver Funds',
    assetClass: 'equity',
    keywords: ['elss', 'tax saver', 'tax saving', 'tax plan'],
    reason: 'Separate tax-saving allocation selected from ELSS/tax-saver funds only.',
  },
  shortTerm: {
    key: 'shortTerm',
    label: 'Short-Term Funds',
    assetClass: 'debt',
    keywords: ['liquid', 'overnight', 'ultra short', 'low duration', 'money market', 'short duration', 'short term', 'short-term'],
    reason: 'Separate short-term allocation selected from liquid, overnight, ultra-short, and short-duration funds.',
  },
};

const bucketDefinitions: Record<SubAssetClassKey, BucketDefinition> = {
  largeCap: {
    key: 'largeCap',
    label: 'Large Cap Equity',
    assetClass: 'equity',
    keywords: ['large cap', 'largecap', 'bluechip', 'blue chip'],
    reason: 'Core equity exposure with relatively steadier large-company participation.',
  },
  flexiCap: {
    key: 'flexiCap',
    label: 'Flexi/Multi Cap Equity',
    assetClass: 'equity',
    keywords: ['flexi cap', 'flexicap', 'multi cap', 'multicap', 'focused fund'],
    reason: 'Diversified equity exposure across market capitalizations.',
  },
  midCap: {
    key: 'midCap',
    label: 'Mid Cap Equity',
    assetClass: 'equity',
    keywords: ['mid cap', 'midcap'],
    reason: 'Growth-oriented equity exposure, capped because volatility is higher than large cap.',
  },
  smallCap: {
    key: 'smallCap',
    label: 'Small Cap Equity',
    assetClass: 'equity',
    keywords: ['small cap', 'smallcap'],
    reason: 'Higher-growth equity exposure, used only within market-standard risk limits.',
  },
  elssTaxSaver: {
    key: 'elssTaxSaver',
    label: 'ELSS Tax Saver',
    assetClass: 'equity',
    keywords: ['elss', 'tax saver', 'tax saving', 'tax plan'],
    reason: 'Tax-saving equity allocation for investors who explicitly need tax benefits.',
  },
  liquidFund: {
    key: 'liquidFund',
    label: 'Liquid/Overnight Debt',
    assetClass: 'debt',
    keywords: ['liquid', 'overnight'],
    reason: 'High-liquidity debt allocation for near-term needs and capital stability.',
  },
  ultraShortDurationDebt: {
    key: 'ultraShortDurationDebt',
    label: 'Ultra Short/Low Duration Debt',
    assetClass: 'debt',
    keywords: ['ultra short', 'low duration', 'money market', 'savings fund'],
    reason: 'Short-duration debt allocation intended to reduce interest-rate volatility.',
  },
  shortDurationDebt: {
    key: 'shortDurationDebt',
    label: 'Short Duration Debt',
    assetClass: 'debt',
    keywords: ['short duration', 'short term', 'short-term', 'duration'],
    reason: 'Debt allocation for stability with a measured duration profile.',
  },
  corporateBond: {
    key: 'corporateBond',
    label: 'Corporate Bond/Banking PSU Debt',
    assetClass: 'debt',
    keywords: ['corporate bond', 'banking and psu', 'banking & psu', 'psu', 'bond fund'],
    reason: 'Quality debt allocation for income and portfolio stability.',
  },
  goldOrSilver: {
    key: 'goldOrSilver',
    label: 'Gold/Silver/Precious Metals',
    assetClass: 'metals',
    keywords: ['gold', 'silver', 'precious metals', 'commodity'],
    reason: 'Diversifier and inflation hedge, kept as a satellite allocation.',
  },
};

function roundPercent(value: number) {
  return Number(value.toFixed(2));
}

function parseNumber(value: unknown) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === 'bigint') {
    return Number(value);
  }

  if (value && typeof value === 'object' && 'toString' in value) {
    return parseNumber(value.toString());
  }

  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.replace(/,/g, '').trim();
  const match = normalized.match(/-?\d+(\.\d+)?/);

  return match ? Number(match[0]) : null;
}

function normalizeValue(value: unknown) {
  if (typeof value === 'bigint') {
    return Number(value);
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  if (value && typeof value === 'object' && 'toString' in value) {
    return value.toString();
  }

  return value;
}

function cleanAllocation<T extends string>(allocation: Partial<Record<T, number>>) {
  return Object.fromEntries(
    Object.entries(allocation)
      .filter(([, percentage]) => typeof percentage === 'number' && percentage > 0)
      .map(([key, percentage]) => [key, roundPercent(percentage as number)])
  ) as Partial<Record<T, number>>;
}

function buildAssetClassAllocation(request: FundRecommendationRequest): Allocation {
  const wantsTaxSaving = request.needsTaxSaving || request.goal === 'tax_saving' || request.preferredAssets.includes('tax_saver');
  let allocation: Allocation;

  if (wantsTaxSaving) {
    if (request.riskTolerance === 'low') {
      allocation = { equity: 60, debt: 30, metals: 10 };
      return applyAssetPreferences(request, allocation);
    }

    if (request.riskTolerance === 'high') {
      allocation = { equity: 80, debt: 10, metals: 10 };
      return applyAssetPreferences(request, allocation);
    }

    allocation = { equity: 70, debt: 20, metals: 10 };
    return applyAssetPreferences(request, allocation);
  }

  if (request.investmentHorizon === 'short_term') {
    allocation = { equity: request.riskTolerance === 'high' ? 10 : 0, debt: request.riskTolerance === 'low' ? 90 : 85, metals: 10 };
    return applyAssetPreferences(request, allocation);
  }

  if (request.investmentHorizon === 'medium_term') {
    if (request.riskTolerance === 'low') {
      allocation = { equity: 20, debt: 70, metals: 10 };
      return applyAssetPreferences(request, allocation);
    }

    if (request.riskTolerance === 'high') {
      allocation = { equity: 50, debt: 40, metals: 10 };
      return applyAssetPreferences(request, allocation);
    }

    allocation = { equity: 35, debt: 55, metals: 10 };
    return applyAssetPreferences(request, allocation);
  }

  if (request.riskTolerance === 'low') {
    allocation = { equity: 35, debt: 55, metals: 10 };
    return applyAssetPreferences(request, allocation);
  }

  if (request.riskTolerance === 'high') {
    allocation = { equity: 80, debt: 10, metals: 10 };
    return applyAssetPreferences(request, allocation);
  }

  allocation = { equity: 65, debt: 25, metals: 10 };
  return applyAssetPreferences(request, allocation);
}

function getMinimumDebtAllocation(request: FundRecommendationRequest) {
  if (request.investmentHorizon === 'short_term') {
    return 75;
  }

  if (request.riskTolerance === 'low') {
    return 35;
  }

  return 10;
}

function getMinimumEquityAllocation(request: FundRecommendationRequest) {
  if (request.needsTaxSaving || request.goal === 'tax_saving' || request.preferredAssets.includes('tax_saver')) {
    return request.riskTolerance === 'low' ? 45 : 50;
  }

  if (request.investmentHorizon === 'long_term' && request.riskTolerance !== 'low') {
    return 20;
  }

  return 0;
}

function applyAssetPreferences(request: FundRecommendationRequest, allocation: Allocation): Allocation {
  const adjusted: Required<Allocation> = {
    equity: allocation.equity ?? 0,
    debt: allocation.debt ?? 0,
    metals: allocation.metals ?? 0,
  };
  const preferredAssets = new Set(request.preferredAssets);

  if (!preferredAssets.has('metals') && adjusted.metals > 5) {
    const reduction = adjusted.metals - 5;
    adjusted.metals -= reduction;
    adjusted.debt += reduction;
  }

  if (!preferredAssets.has('equity') && !preferredAssets.has('tax_saver') && adjusted.equity > 0) {
    const minimumEquity = getMinimumEquityAllocation(request);
    const reduction = Math.max(0, adjusted.equity - minimumEquity);
    adjusted.equity -= reduction;
    adjusted.debt += reduction;
  }

  if (!preferredAssets.has('debt') && !preferredAssets.has('short_term') && adjusted.debt > 0) {
    const minimumDebt = getMinimumDebtAllocation(request);
    const reduction = Math.max(0, adjusted.debt - minimumDebt);
    adjusted.debt -= reduction;
    adjusted.equity += reduction;
  }

  if (preferredAssets.has('short_term') && request.investmentHorizon !== 'short_term' && adjusted.equity > 20) {
    const shiftToDebt = Math.min(10, adjusted.equity - 20);
    adjusted.equity -= shiftToDebt;
    adjusted.debt += shiftToDebt;
  }

  return adjusted;
}

function addSubAllocation(allocation: SubAllocation, key: SubAssetClassKey, percentage: number) {
  if (percentage > 0) {
    allocation[key] = (allocation[key] ?? 0) + percentage;
  }
}

function splitEquityAllocation(request: FundRecommendationRequest, equityAllocation: number, allocation: SubAllocation) {
  const wantsTaxSaving = request.needsTaxSaving || request.goal === 'tax_saving' || request.preferredAssets.includes('tax_saver');
  let remainingEquity = equityAllocation;

  if (wantsTaxSaving) {
    const taxSaverAllocation = Math.min(equityAllocation, request.riskTolerance === 'low' ? 45 : 50);
    addSubAllocation(allocation, 'elssTaxSaver', taxSaverAllocation);
    remainingEquity -= taxSaverAllocation;
  }

  if (remainingEquity <= 0) {
    return;
  }

  if (request.riskTolerance === 'low' || request.experienceLevel === 'beginner') {
    addSubAllocation(allocation, 'largeCap', remainingEquity * 0.75);
    addSubAllocation(allocation, 'flexiCap', remainingEquity * 0.25);
    return;
  }

  if (request.riskTolerance === 'high' && request.investmentHorizon === 'long_term') {
    addSubAllocation(allocation, 'largeCap', remainingEquity * 0.45);
    addSubAllocation(allocation, 'flexiCap', remainingEquity * 0.25);
    addSubAllocation(allocation, 'midCap', remainingEquity * 0.2);
    addSubAllocation(allocation, 'smallCap', remainingEquity * 0.1);
    return;
  }

  addSubAllocation(allocation, 'largeCap', remainingEquity * 0.55);
  addSubAllocation(allocation, 'flexiCap', remainingEquity * 0.25);
  addSubAllocation(allocation, 'midCap', remainingEquity * 0.15);

  if (request.investmentHorizon === 'long_term') {
    addSubAllocation(allocation, 'smallCap', remainingEquity * 0.05);
  } else {
    addSubAllocation(allocation, 'largeCap', remainingEquity * 0.05);
  }
}

function splitDebtAllocation(request: FundRecommendationRequest, debtAllocation: number, allocation: SubAllocation) {
  if (debtAllocation <= 0) {
    return;
  }

  if (request.investmentHorizon === 'short_term' || request.liquidityNeed === 'high' || request.preferredAssets.includes('short_term')) {
    addSubAllocation(allocation, 'liquidFund', debtAllocation * 0.4);
    addSubAllocation(allocation, 'ultraShortDurationDebt', debtAllocation * 0.35);
    addSubAllocation(allocation, 'shortDurationDebt', debtAllocation * 0.25);
    return;
  }

  if (request.incomePreference === 'regular_income') {
    addSubAllocation(allocation, 'corporateBond', debtAllocation * 0.55);
    addSubAllocation(allocation, 'shortDurationDebt', debtAllocation * 0.3);
    addSubAllocation(allocation, 'liquidFund', debtAllocation * 0.15);
    return;
  }

  addSubAllocation(allocation, 'corporateBond', debtAllocation * 0.5);
  addSubAllocation(allocation, 'shortDurationDebt', debtAllocation * 0.35);
  addSubAllocation(allocation, 'liquidFund', debtAllocation * 0.15);
}

function buildSubAssetClassAllocation(request: FundRecommendationRequest, assetClassAllocation: Allocation): SubAllocation {
  const allocation: SubAllocation = {};

  splitEquityAllocation(request, assetClassAllocation.equity ?? 0, allocation);
  splitDebtAllocation(request, assetClassAllocation.debt ?? 0, allocation);
  addSubAllocation(allocation, 'goldOrSilver', assetClassAllocation.metals ?? 0);

  return cleanAllocation(allocation);
}

function buildRecommendationBucketAllocation(
  request: FundRecommendationRequest,
  assetClassAllocation: Allocation,
  subAssetClassAllocation: SubAllocation
) {
  const taxSaverAllocation = subAssetClassAllocation.elssTaxSaver ?? 0;
  const shortTermAllocation = (request.investmentHorizon === 'short_term' || request.liquidityNeed === 'high' || request.preferredAssets.includes('short_term'))
    ? (subAssetClassAllocation.liquidFund ?? 0) +
      (subAssetClassAllocation.ultraShortDurationDebt ?? 0) +
      (subAssetClassAllocation.shortDurationDebt ?? 0)
    : (subAssetClassAllocation.liquidFund ?? 0) + (subAssetClassAllocation.ultraShortDurationDebt ?? 0);
  const equityAllocation = Math.max(0, (assetClassAllocation.equity ?? 0) - taxSaverAllocation);
  const debtAllocation = Math.max(0, (assetClassAllocation.debt ?? 0) - shortTermAllocation);
  const metalsAllocation = assetClassAllocation.metals ?? subAssetClassAllocation.goldOrSilver ?? 0;

  return cleanAllocation<RecommendationBucketKey>({
    equity: equityAllocation,
    debt: debtAllocation,
    metals: metalsAllocation,
    taxSaver: taxSaverAllocation,
    shortTerm: shortTermAllocation,
  });
}

function buildInvestorType(request: FundRecommendationRequest) {
  if (request.needsTaxSaving || request.goal === 'tax_saving' || request.preferredAssets.includes('tax_saver')) {
    return `${request.riskTolerance}_tax_saver_${request.investmentHorizon}`;
  }

  return `${request.riskTolerance}_${request.investmentHorizon}_${request.goal}`;
}

function getPolicyNotes(request: FundRecommendationRequest) {
  const notes = [
    'Asset allocation is chosen before fund selection so funds fill a suitable portfolio rather than chasing isolated returns.',
    'Metals are treated as a diversifier and are capped as a satellite allocation.',
  ];

  if (request.investmentHorizon === 'short_term') {
    notes.push('Short-term profiles prioritize debt, liquidity, and capital stability over equity exposure.');
  }

  if (request.needsTaxSaving || request.goal === 'tax_saving' || request.preferredAssets.includes('tax_saver')) {
    notes.push('ELSS tax-saver funds are considered only because tax saving was requested; they carry a lock-in period.');
  }

  if (request.liquidityNeed === 'high') {
    notes.push('High liquidity need increases liquid and ultra-short duration debt exposure.');
  }

  if (request.preferredAssets.length > 0) {
    notes.push('Preferred assets tilt the allocation, while suitability guardrails still cap risky or illiquid exposure.');
  }

  notes.push('AMC exposure is capped against the investment amount; additional funds may be added when a fund house reaches its limit.');
  notes.push('Holdings-level analysis is reserved until all_holdings has a reliable scheme-code mapping in Prisma.');

  return notes;
}

function buildBucketWhere(definition: BucketDefinition): Prisma.bio_data_1WhereInput {
  const keywordFilters = definition.keywords.flatMap((keyword) => [
    { fund_name: { contains: keyword } },
    { fund_name_2: { contains: keyword } },
    { category: { contains: keyword } },
    { asset_class: { contains: keyword } },
    { objective: { contains: keyword } },
  ]);
  const excludedKeywordFilters = definition.excludeKeywords?.flatMap((keyword) => [
    { fund_name: { contains: keyword } },
    { fund_name_2: { contains: keyword } },
    { category: { contains: keyword } },
    { asset_class: { contains: keyword } },
    { objective: { contains: keyword } },
  ]) ?? [];

  return {
    OR: keywordFilters,
    ...(excludedKeywordFilters.length > 0 ? { NOT: { OR: excludedKeywordFilters } } : {}),
  };
}

function mapBySchemeCode<T>(rows: T[], getSchemeCode: (row: T) => string | null | undefined) {
  const map = new Map<string, T>();

  for (const row of rows) {
    const schemeCode = getSchemeCode(row);

    if (schemeCode && !map.has(schemeCode)) {
      map.set(schemeCode, row);
    }
  }

  return map;
}

function buildRankMap(rows: RankRow[]) {
  const map = new Map<string, RankRow>();

  for (const row of rows) {
    if (row.unique_identifier_mfi_scheme_code && !map.has(row.unique_identifier_mfi_scheme_code)) {
      map.set(row.unique_identifier_mfi_scheme_code, row);
    }
  }

  for (const row of rows) {
    const fundId = row.fund_id.toString();

    if (!map.has(fundId)) {
      map.set(fundId, row);
    }
  }

  return map;
}

async function enrichCandidates(funds: CandidateFund[]): Promise<EnrichedCandidate[]> {
  const schemeCodes = funds.map((fund) => fund.mfi_scheme_code);
  const fundIds = funds.map((fund) => fund.fund_id);
  const [rankRows, smartRecommendationRows, smartRedemptionRows, investableUniverseRows] = await Promise.all([
    prisma.ranks.findMany({
      where: {
        OR: [
          { unique_identifier_mfi_scheme_code: { in: schemeCodes } },
          { fund_id: { in: fundIds } },
        ],
      },
      select: rankSelect,
      orderBy: [
        { collection_date: 'desc' },
        { id: 'desc' },
      ],
    }),
    prisma.smart_recommendation.findMany({
      where: {
        scheme_code: { in: schemeCodes },
      },
      select: smartRecommendationSelect,
      orderBy: [
        { collection_date: 'desc' },
        { id: 'desc' },
      ],
    }),
    prisma.smart_redemption.findMany({
      where: {
        scheme_code: { in: schemeCodes },
      },
      select: smartRedemptionSelect,
      orderBy: [
        { collection_date: 'desc' },
        { id: 'desc' },
      ],
    }),
    prisma.investable_universe.findMany({
      where: {
        mfi_scheme_code: { in: schemeCodes },
      },
      select: investableUniverseSelect,
      orderBy: [
        { collection_date: 'desc' },
        { id: 'desc' },
      ],
    }),
  ]);

  const rankBySchemeOrFundId = buildRankMap(rankRows);
  const smartRecommendationBySchemeCode = mapBySchemeCode(smartRecommendationRows, (row) => row.scheme_code);
  const smartRedemptionBySchemeCode = mapBySchemeCode(smartRedemptionRows, (row) => row.scheme_code);
  const investableUniverseBySchemeCode = mapBySchemeCode(investableUniverseRows, (row) => row.mfi_scheme_code);

  return funds.map((fund) => ({
    fund,
    rank: rankBySchemeOrFundId.get(fund.mfi_scheme_code) ?? rankBySchemeOrFundId.get(fund.fund_id.toString()),
    smartRecommendation: smartRecommendationBySchemeCode.get(fund.mfi_scheme_code),
    smartRedemption: smartRedemptionBySchemeCode.get(fund.mfi_scheme_code),
    investableUniverse: investableUniverseBySchemeCode.get(fund.mfi_scheme_code),
  }));
}

function getTextForClassification(candidate: EnrichedCandidate, bucket: BucketDefinition) {
  return [
    bucket.key,
    bucket.label,
    bucket.assetClass,
    candidate.fund.fund_name,
    candidate.fund.fund_name_2,
    candidate.fund.category,
    candidate.fund.asset_class,
    candidate.fund.objective,
    candidate.investableUniverse?.asset_class,
    candidate.investableUniverse?.sub_asset_class,
    candidate.investableUniverse?.tactical_call_for_debt,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function getRankFieldForFund(candidate: EnrichedCandidate, bucket: BucketDefinition): RankField {
  const text = getTextForClassification(candidate, bucket);

  if (bucket.assetClass === 'metals') {
    return 'rank_precious_metals_category';
  }

  if (bucket.assetClass === 'debt') {
    if (bucket.key === 'shortTerm' || bucket.key === 'liquidFund' || bucket.key === 'ultraShortDurationDebt' || text.includes('parking')) {
      return 'rank_debt_short_term_parking';
    }

    if (text.includes('tactical') || text.includes('gilt') || text.includes('dynamic bond')) {
      return 'rank_debt_tactical';
    }

    return 'rank_debt_core_portfolio';
  }

  if (text.includes('nifty 50') || text.includes('sensex')) {
    return 'rank_equity_nifty_50_case';
  }

  if (text.includes('nifty 500') || text.includes('total market') || text.includes('broad')) {
    return 'rank_equity_nifty_500_case';
  }

  if (
    text.includes('sector') ||
    text.includes('thematic') ||
    text.includes('international') ||
    text.includes('global') ||
    text.includes('contra') ||
    text.includes('dividend yield')
  ) {
    return 'rank_equity_special_case';
  }

  return 'rank_equity_normal_case';
}

function getReturnTargets(assetClass: AssetClassKey) {
  if (assetClass === 'debt') {
    return { return1m: 0.8, return3m: 2, return6m: 3.5, return1y: 6, return3y: 7, return5y: 7 };
  }

  if (assetClass === 'metals') {
    return { return1m: 2, return3m: 6, return6m: 10, return1y: 14, return3y: 12, return5y: 10 };
  }

  return { return1m: 2, return3m: 6, return6m: 10, return1y: 15, return3y: 14, return5y: 12 };
}

function scoreMetric(value: unknown, target: number, weight: number) {
  const parsedValue = parseNumber(value);

  if (parsedValue === null || parsedValue <= 0) {
    return 0;
  }

  return Math.min(parsedValue / target, 1) * weight;
}

function scorePerformance(fund: CandidateFund, horizon: InvestmentHorizon, assetClass: AssetClassKey) {
  const targets = getReturnTargets(assetClass);

  if (horizon === 'short_term') {
    return scoreMetric(fund.fund_returns_1m, targets.return1m, 8) +
      scoreMetric(fund.fund_returns_3m, targets.return3m, 12) +
      scoreMetric(fund.fund_returns_6m, targets.return6m, 15) +
      scoreMetric(fund.fund_returns_1y, targets.return1y, 10);
  }

  if (horizon === 'medium_term') {
    return scoreMetric(fund.fund_returns_6m, targets.return6m, 8) +
      scoreMetric(fund.fund_returns_1y, targets.return1y, 17) +
      scoreMetric(fund.fund_returns_3y, targets.return3y, 20);
  }

  return scoreMetric(fund.fund_returns_1y, targets.return1y, 10) +
    scoreMetric(fund.fund_returns_3y, targets.return3y, 17) +
    scoreMetric(fund.fund_returns_5y, targets.return5y, 18);
}

function scoreRiskMatch(riskometer: string | null, riskTolerance: RiskTolerance) {
  const riskText = riskometer?.toLowerCase() ?? '';

  if (riskTolerance === 'low') {
    if (riskText.includes('low') || riskText.includes('moderate')) {
      return riskText.includes('high') ? 8 : 20;
    }

    return 6;
  }

  if (riskTolerance === 'moderate') {
    if (riskText.includes('moderate')) {
      return 20;
    }

    if (riskText.includes('low')) {
      return 15;
    }

    if (riskText.includes('high')) {
      return riskText.includes('very') ? 6 : 10;
    }

    return 10;
  }

  if (riskText.includes('high')) {
    return 20;
  }

  if (riskText.includes('moderate')) {
    return 15;
  }

  return 8;
}

function scoreExpenseRatio(expenseRatio: string | null) {
  const expense = parseNumber(expenseRatio);

  if (expense === null) {
    return 7;
  }

  if (expense <= 0.5) {
    return 15;
  }

  if (expense <= 1) {
    return 12;
  }

  if (expense <= 1.5) {
    return 8;
  }

  if (expense <= 2) {
    return 4;
  }

  return 0;
}

function scoreAum(aum: string | null) {
  const parsedAum = parseNumber(aum);

  if (parsedAum === null) {
    return 5;
  }

  if (parsedAum >= 5000) {
    return 10;
  }

  if (parsedAum >= 1000) {
    return 8;
  }

  if (parsedAum >= 500) {
    return 6;
  }

  return parsedAum > 0 ? 3 : 0;
}

function scoreMinimumInvestment(fund: CandidateFund, investmentAmount: number) {
  const minimumInvestment = parseNumber(fund.minimum_investment_amount_rs);

  if (minimumInvestment === null) {
    return 6;
  }

  if (minimumInvestment <= investmentAmount) {
    return 10;
  }

  return minimumInvestment <= investmentAmount * 1.1 ? 5 : 0;
}

function scoreRank(candidate: EnrichedCandidate, bucket: BucketDefinition) {
  if (!candidate.rank) {
    return {
      rankField: getRankFieldForFund(candidate, bucket),
      rankValue: null,
      score: 4,
    };
  }

  const rankField = getRankFieldForFund(candidate, bucket);
  const rankValue = parseNumber(candidate.rank[rankField]);

  if (rankValue === null) {
    return {
      rankField,
      rankValue: null,
      score: 4,
    };
  }

  if (rankValue <= 1) {
    return { rankField, rankValue, score: 18 };
  }

  if (rankValue <= 3) {
    return { rankField, rankValue, score: 16 };
  }

  if (rankValue <= 5) {
    return { rankField, rankValue, score: 13 };
  }

  if (rankValue <= 10) {
    return { rankField, rankValue, score: 9 };
  }

  if (rankValue <= 20) {
    return { rankField, rankValue, score: 5 };
  }

  return { rankField, rankValue, score: 1 };
}

function scoreHigherThanMedian(value: unknown, median: unknown, weight: number) {
  const parsedValue = parseNumber(value);
  const parsedMedian = parseNumber(median);

  if (parsedValue === null || parsedMedian === null) {
    return weight * 0.35;
  }

  if (parsedMedian === 0) {
    return parsedValue > 0 ? weight : 0;
  }

  return Math.max(0, Math.min(parsedValue / parsedMedian, 1.25) / 1.25) * weight;
}

function scoreLowerThanMedian(value: unknown, median: unknown, weight: number) {
  const parsedValue = parseNumber(value);
  const parsedMedian = parseNumber(median);

  if (parsedValue === null || parsedMedian === null) {
    return weight * 0.35;
  }

  if (parsedValue <= 0) {
    return weight;
  }

  return Math.max(0, Math.min(parsedMedian / parsedValue, 1.25) / 1.25) * weight;
}

function scoreSmartMetrics(candidate: EnrichedCandidate, bucket: BucketDefinition) {
  const smart = candidate.smartRecommendation;

  if (!smart) {
    return 5;
  }

  if (bucket.assetClass === 'debt') {
    return scoreHigherThanMedian(smart.debt_fund_sharpe_ratio, smart.debt_category_median_sharpe_ratio, 5) +
      scoreLowerThanMedian(smart.debt_fund_interest_rate_sensitivity, smart.debt_category_median_interest_rate_sensitivity, 4) +
      scoreHigherThanMedian(smart.debt_fund_credit_safety, smart.debt_category_median_credit_safety, 5) +
      scoreHigherThanMedian(smart.debt_fund_cash_cushion, smart.debt_category_median_cash_cushion, 3);
  }

  if (bucket.assetClass === 'metals') {
    return scoreLowerThanMedian(
      smart.precious_metals_fund_tracking_error,
      smart.precious_metals_category_median_tracking_error,
      17
    );
  }

  return scoreHigherThanMedian(smart.equity_fund_upside_capture, smart.equity_category_median_upside_capture, 3) +
    scoreHigherThanMedian(smart.equity_fund_jansens_alpha, smart.equity_category_median_jansens_alpha, 4) +
    scoreHigherThanMedian(smart.equity_fund_sharpe_ratio, smart.equity_category_median_sharpe_ratio, 4) +
    scoreLowerThanMedian(smart.equity_fund_downside_capture, smart.equity_category_median_downside_capture, 3) +
    scoreHigherThanMedian(smart.equity_fund_consistency, smart.equity_category_median_consistency, 2) +
    scoreLowerThanMedian(smart.equity_fund_impact_cost_days, smart.equity_category_median_impact_cost_days, 1);
}

function scoreRedemptionFit(candidate: EnrichedCandidate, request: FundRecommendationRequest) {
  const redemption = candidate.smartRedemption;

  if (!redemption) {
    return 6;
  }

  let score = 10;
  const lockInDays = parseNumber(redemption.lock_in_days) ?? 0;
  const taxDays = parseNumber(redemption.tax_days) ?? 0;
  const exitLoadDays = [redemption.exit_load_days_1, redemption.exit_load_days_2, redemption.exit_load_days_3]
    .map(parseNumber)
    .filter((value): value is number => value !== null);
  const exitLoadPercentages = [redemption.exit_load_percentage_1, redemption.exit_load_percentage_2, redemption.exit_load_percentage_3]
    .map(parseNumber)
    .filter((value): value is number => value !== null);

  if (request.investmentHorizon === 'short_term' || request.liquidityNeed === 'high') {
    if (lockInDays > 0) {
      score -= 4;
    }

    if (Math.max(0, ...exitLoadDays) > 30) {
      score -= 2;
    }

    if (Math.max(0, ...exitLoadPercentages) > 0.5) {
      score -= 2;
    }

    if (taxDays > 365) {
      score -= 1;
    }
  } else if (lockInDays > 0 && !(request.needsTaxSaving || request.goal === 'tax_saving')) {
    score -= 2;
  }

  return Math.max(0, score);
}

function getBioData2(candidate: EnrichedCandidate) {
  return candidate.fund.bio_data_2[0];
}

function scoreBioData2Fit(candidate: EnrichedCandidate, bucket: BucketDefinition) {
  const bioData2 = getBioData2(candidate);

  if (!bioData2) {
    return 4;
  }

  if (bucket.key === 'largeCap') {
    return scoreMetric(bioData2.equity_market_cap_split_large_cap, 50, 10);
  }

  if (bucket.key === 'midCap') {
    return scoreMetric(bioData2.equity_market_cap_split_mid_cap, 35, 10);
  }

  if (bucket.key === 'smallCap') {
    return scoreMetric(bioData2.equity_market_cap_split_small_cap, 35, 10);
  }

  if (bucket.key === 'equity' || bucket.key === 'taxSaver') {
    return scoreMetric(bioData2.asset_class_split_equity, 80, 10);
  }

  if (bucket.key === 'shortTerm') {
    return scoreMetric(bioData2.asset_class_split_debt, 70, 7) +
      scoreMetric(bioData2.asset_class_split_cash_others, 20, 3);
  }

  if (bucket.assetClass === 'debt') {
    const highQualityDebt = (parseNumber(bioData2.debt_credit_quality_split_sovereign) ?? 0) +
      (parseNumber(bioData2.debt_credit_quality_split_aaa_a1) ?? 0) +
      (parseNumber(bioData2.debt_credit_quality_split_aa_aa_aa) ?? 0);
    const lowQualityDebt = (parseNumber(bioData2.debt_credit_quality_split_bbb_and_below) ?? 0) +
      (parseNumber(bioData2.debt_credit_quality_split_unrated) ?? 0);

    return Math.max(0, Math.min(highQualityDebt / 70, 1) * 8 - Math.min(lowQualityDebt / 20, 1) * 3 + 2);
  }

  if (bucket.assetClass === 'metals') {
    return scoreMetric(bioData2.asset_class_split_precious_metals, 80, 10);
  }

  return 5;
}

function getFundHouse(candidate: EnrichedCandidate) {
  return getBioData2(candidate)?.fund_house_name ?? 'Unknown AMC';
}

function buildReasons(candidate: EnrichedCandidate, bucket: BucketDefinition, score: number, request: FundRecommendationRequest) {
  const fund = candidate.fund;
  const rankScore = scoreRank(candidate, bucket);
  const reasons = [bucket.reason];

  const performanceValue = request.investmentHorizon === 'long_term'
    ? fund.fund_returns_5y ?? fund.fund_returns_3y
    : request.investmentHorizon === 'medium_term'
      ? fund.fund_returns_3y ?? fund.fund_returns_1y
      : fund.fund_returns_1y ?? fund.fund_returns_6m;

  if (performanceValue) {
    reasons.push(`Relevant historical return is ${performanceValue}.`);
  }

  if (fund.expense_ratio) {
    reasons.push(`Expense ratio is ${fund.expense_ratio}.`);
  }

  if (fund.amfi_riskometer) {
    reasons.push(`Riskometer is ${fund.amfi_riskometer}, checked against ${request.riskTolerance} risk tolerance.`);
  }

  if (rankScore.rankValue !== null) {
    reasons.push(`Category rank uses ${rankScore.rankField} with rank ${rankScore.rankValue}.`);
  }

  if (candidate.smartRecommendation) {
    reasons.push('Smart recommendation metrics were compared with category medians.');
  }

  if (candidate.smartRedemption && (request.investmentHorizon === 'short_term' || request.liquidityNeed === 'high')) {
    reasons.push('Redemption friction was checked for lock-in, tax days, and exit load fit.');
  }

  reasons.push(`Overall suitability score: ${Math.round(score)}/100.`);

  return reasons;
}

function scoreFund(candidate: EnrichedCandidate, bucket: BucketDefinition, request: FundRecommendationRequest) {
  const fund = candidate.fund;
  const performanceScore = scorePerformance(fund, request.investmentHorizon, bucket.assetClass);
  const riskScore = scoreRiskMatch(fund.amfi_riskometer, request.riskTolerance);
  const expenseScore = scoreExpenseRatio(fund.expense_ratio);
  const aumScore = scoreAum(fund.fund_aum);
  const minimumInvestmentScore = scoreMinimumInvestment(fund, request.investmentAmount);
  const rankScore = scoreRank(candidate, bucket);
  const smartScore = scoreSmartMetrics(candidate, bucket);
  const redemptionScore = scoreRedemptionFit(candidate, request);
  const bioData2FitScore = scoreBioData2Fit(candidate, bucket);
  const rawScore = performanceScore + riskScore + expenseScore + aumScore + minimumInvestmentScore +
    rankScore.score + smartScore + redemptionScore + bioData2FitScore;
  const score = (rawScore / 155) * 100;

  return {
    score: roundPercent(Math.min(score, 100)),
    performanceScore: roundPercent(performanceScore),
    rankField: rankScore.rankField,
    rankValue: rankScore.rankValue,
    scoreBreakdown: {
      performance: roundPercent(performanceScore),
      risk: roundPercent(riskScore),
      expense: roundPercent(expenseScore),
      aum: roundPercent(aumScore),
      minimumInvestment: roundPercent(minimumInvestmentScore),
      rank: roundPercent(rankScore.score),
      smartMetrics: roundPercent(smartScore),
      redemption: roundPercent(redemptionScore),
      portfolioFit: roundPercent(bioData2FitScore),
    },
  };
}

function toRecommendedFund(
  candidate: EnrichedCandidate,
  bucket: BucketDefinition,
  score: number,
  request: FundRecommendationRequest,
  scoreDetails: ReturnType<typeof scoreFund>,
  allocationAmount: number,
  allocationPercentage: number
) {
  const fund = candidate.fund;
  const bioData2 = getBioData2(candidate);

  return Object.fromEntries(
    Object.entries({
      fundId: fund.fund_id,
      schemeCode: fund.mfi_scheme_code,
      fundName: fund.fund_name,
      alternateFundName: fund.fund_name_2,
      fundHouse: getFundHouse(candidate),
      assetClass: fund.asset_class,
      category: fund.category,
      riskometer: fund.amfi_riskometer,
      objective: fund.objective,
      benchmark: fund.benchmark,
      directPlan: fund.direct_plan,
      activePassive: fund.active_passive,
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
      schemeIsin: fund.scheme_isin,
      fundManager: bioData2?.fund_manager ?? null,
      allocationAmount,
      allocationPercentage,
      rankField: scoreDetails.rankField,
      rankValue: scoreDetails.rankValue,
      score,
      scoreBreakdown: scoreDetails.scoreBreakdown,
      smartMetricsAvailable: Boolean(candidate.smartRecommendation),
      redemptionMetricsAvailable: Boolean(candidate.smartRedemption),
      holdingsSummary: {
        status: 'scheme_code_mapping_required',
        message: 'all_holdings is not used yet because the Prisma model does not expose a scheme-code join key.',
      },
      redemptionWarnings: buildRedemptionWarnings(candidate, request),
      reasons: buildReasons(candidate, bucket, score, request),
    }).map(([key, value]) => [key, normalizeValue(value)])
  );
}

function buildRedemptionWarnings(candidate: EnrichedCandidate, request: FundRecommendationRequest) {
  const redemption = candidate.smartRedemption;

  if (!redemption) {
    return [];
  }

  const warnings = [];
  const lockInDays = parseNumber(redemption.lock_in_days) ?? 0;
  const maxExitLoadDays = Math.max(
    0,
    parseNumber(redemption.exit_load_days_1) ?? 0,
    parseNumber(redemption.exit_load_days_2) ?? 0,
    parseNumber(redemption.exit_load_days_3) ?? 0
  );

  if (lockInDays > 0 && !(request.needsTaxSaving || request.goal === 'tax_saving')) {
    warnings.push(`Lock-in period detected: ${lockInDays} days.`);
  }

  if ((request.investmentHorizon === 'short_term' || request.liquidityNeed === 'high') && maxExitLoadDays > 30) {
    warnings.push(`Exit load window may extend up to ${maxExitLoadDays} days.`);
  }

  return warnings;
}

type ScoredCandidate = {
  candidate: EnrichedCandidate;
  score: number;
  performanceScore: number;
  scoreDetails: ReturnType<typeof scoreFund>;
};

type ScoredBucket = {
  definition: BucketDefinition;
  allocationPercentage: number;
  allocationAmount: number;
  scoredFunds: ScoredCandidate[];
};

type BucketRecommendation = {
  bucket: RecommendationBucketKey;
  label: string;
  assetClass: AssetClassKey;
  allocationPercentage: number;
  allocationAmount: number;
  bucketReason: string;
  unallocatedAmount: number;
  funds: Record<string, unknown>[];
};

function getDefaultTargetFundCount(request: FundRecommendationRequest) {
  if (request.investmentAmount < 50000) {
    return 3;
  }

  if (request.investmentAmount <= 200000) {
    return 5;
  }

  if (request.investmentAmount <= 1000000) {
    return 7;
  }

  return request.experienceLevel === 'experienced' ? 9 : 8;
}

function getPortfolioFundLimits(request: FundRecommendationRequest) {
  const targetFundCount = getDefaultTargetFundCount(request);
  const maxFundCount = Math.max(targetFundCount, request.investmentAmount > 1000000 ? 12 : 10);

  return {
    targetFundCount,
    maxFundCount,
  };
}

function normalizePercentLimit(value: unknown) {
  const parsedValue = parseNumber(value);

  if (parsedValue === null || parsedValue <= 0) {
    return null;
  }

  return parsedValue <= 1 ? parsedValue * 100 : parsedValue;
}

async function getEffectiveAmcLimitPercent(request: FundRecommendationRequest) {
  if (!request.useOptimizerPolicy) {
    return request.amcExposureLimitPercent;
  }

  const optimizerLimits = await prisma.optimizer_limits.findFirst({
    orderBy: [
      { collection_date: 'desc' },
      { id: 'desc' },
    ],
    select: {
      amc_percentage_limit: true,
    },
  });
  const optimizerAmcLimit = normalizePercentLimit(optimizerLimits?.amc_percentage_limit);

  return optimizerAmcLimit ?? request.amcExposureLimitPercent;
}

function addAmcExposure(amcExposure: Map<string, number>, fundHouse: string, amount: number) {
  amcExposure.set(fundHouse, roundPercent((amcExposure.get(fundHouse) ?? 0) + amount));
}

function allocatePortfolioBuckets(
  buckets: ScoredBucket[],
  request: FundRecommendationRequest,
  amcLimitPercent: number
) {
  const { targetFundCount, maxFundCount } = getPortfolioFundLimits(request);
  const amcLimitAmount = (request.investmentAmount * amcLimitPercent) / 100;
  const amcExposure = new Map<string, number>();
  const selectedSchemeCodes = new Set<string>();
  const limitBreaches: string[] = [];
  const recommendations: BucketRecommendation[] = [];

  for (const bucket of buckets) {
    let remainingAmount = bucket.allocationAmount;
    const selectedFunds: Record<string, unknown>[] = [];

    for (const scoredFund of bucket.scoredFunds) {
      if (remainingAmount <= 0) {
        break;
      }

      if (selectedSchemeCodes.has(scoredFund.candidate.fund.mfi_scheme_code)) {
        continue;
      }

      if (selectedSchemeCodes.size >= maxFundCount) {
        break;
      }

      const fundHouse = getFundHouse(scoredFund.candidate);
      const currentAmcExposure = amcExposure.get(fundHouse) ?? 0;
      const availableAmcCapacity = amcLimitAmount - currentAmcExposure;

      if (availableAmcCapacity <= 0) {
        continue;
      }

      const allocationAmount = roundPercent(Math.min(remainingAmount, availableAmcCapacity));

      if (allocationAmount <= 0) {
        continue;
      }

      selectedSchemeCodes.add(scoredFund.candidate.fund.mfi_scheme_code);
      addAmcExposure(amcExposure, fundHouse, allocationAmount);
      remainingAmount = roundPercent(remainingAmount - allocationAmount);
      selectedFunds.push(
        toRecommendedFund(
          scoredFund.candidate,
          bucket.definition,
          scoredFund.score,
          request,
          scoredFund.scoreDetails,
          allocationAmount,
          roundPercent((allocationAmount / request.investmentAmount) * 100)
        )
      );
    }

    if (remainingAmount > 0 && !request.strictMode && bucket.scoredFunds.length > 0) {
      const fallback = bucket.scoredFunds.find((scoredFund) =>
        !selectedSchemeCodes.has(scoredFund.candidate.fund.mfi_scheme_code)
      );

      if (fallback && selectedSchemeCodes.size < maxFundCount) {
        const fundHouse = getFundHouse(fallback.candidate);
        selectedSchemeCodes.add(fallback.candidate.fund.mfi_scheme_code);
        addAmcExposure(amcExposure, fundHouse, remainingAmount);
        selectedFunds.push(
          toRecommendedFund(
            fallback.candidate,
            bucket.definition,
            fallback.score,
            request,
            fallback.scoreDetails,
            remainingAmount,
            roundPercent((remainingAmount / request.investmentAmount) * 100)
          )
        );
        limitBreaches.push(`${fundHouse} exceeded the AMC limit to complete ${bucket.definition.label} allocation in relaxed mode.`);
        remainingAmount = 0;
      }
    }

    if (remainingAmount > 0) {
      limitBreaches.push(`${bucket.definition.label} has ${remainingAmount} unallocated because eligible funds could not fit within AMC/fund-count constraints.`);
    }

    recommendations.push({
      bucket: bucket.definition.key as RecommendationBucketKey,
      label: bucket.definition.label,
      assetClass: bucket.definition.assetClass,
      allocationPercentage: bucket.allocationPercentage,
      allocationAmount: bucket.allocationAmount,
      bucketReason: bucket.definition.reason,
      unallocatedAmount: roundPercent(remainingAmount),
      funds: selectedFunds,
    });
  }

  const amcExposureObject = Object.fromEntries(
    Array.from(amcExposure.entries()).map(([fundHouse, amount]) => [
      fundHouse,
      {
        amount: roundPercent(amount),
        percentage: roundPercent((amount / request.investmentAmount) * 100),
      },
    ])
  );

  if (selectedSchemeCodes.size > targetFundCount) {
    limitBreaches.push(`Portfolio uses ${selectedSchemeCodes.size} funds, above the target ${targetFundCount}, to satisfy allocation and AMC constraints.`);
  }

  return {
    recommendations,
    amcExposure: amcExposureObject,
    limitBreaches,
    fundCountPolicy: {
      targetFundCount,
      maxFundCount,
      selectedFundCount: selectedSchemeCodes.size,
      amcLimitPercent,
      amcLimitAmount: roundPercent(amcLimitAmount),
    },
  };
}

export class FundRecommendationService {
  async recommendFunds(request: FundRecommendationRequest) {
    const assetClassAllocation = cleanAllocation(buildAssetClassAllocation(request));
    const subAssetClassAllocation = buildSubAssetClassAllocation(request, assetClassAllocation);
    const recommendationBucketAllocation = buildRecommendationBucketAllocation(request, assetClassAllocation, subAssetClassAllocation);
    const amcLimitPercent = await getEffectiveAmcLimitPercent(request);
    const scoredBuckets: ScoredBucket[] = [];

    for (const [bucketKey, allocationPercentage] of Object.entries(recommendationBucketAllocation)) {
      const definition = fundBucketDefinitions[bucketKey as RecommendationBucketKey];
      const candidateFunds = await prisma.bio_data_1.findMany({
        where: buildBucketWhere(definition),
        select: fundRecommendationSelect,
        orderBy: {
          fund_name: 'asc',
        },
        take: 250,
      });
      const enrichedCandidates = await enrichCandidates(candidateFunds);

      const scoredFunds = enrichedCandidates
        .map((candidate) => {
          const score = scoreFund(candidate, definition, request);

          return {
            candidate,
            score: score.score,
            performanceScore: score.performanceScore,
            scoreDetails: score,
          };
        })
        .filter((fund) => fund.score >= 45 && fund.performanceScore > 0)
        .sort((first, second) => second.score - first.score);

      scoredBuckets.push({
        definition,
        allocationPercentage,
        allocationAmount: roundPercent((request.investmentAmount * allocationPercentage) / 100),
        scoredFunds,
      });
    }

    const allocatedPortfolio = allocatePortfolioBuckets(scoredBuckets, request, amcLimitPercent);

    return {
      profile: {
        investorType: buildInvestorType(request),
        riskTolerance: request.riskTolerance,
        investmentHorizon: request.investmentHorizon,
        goal: request.goal,
        investmentMode: request.investmentMode,
        liquidityNeed: request.liquidityNeed,
        incomePreference: request.incomePreference,
        experienceLevel: request.experienceLevel,
        preferredAssets: request.preferredAssets,
      },
      allocation: {
        assetClassAllocation,
        subAssetClassAllocation,
        recommendationBucketAllocation,
      },
      fundCountPolicy: allocatedPortfolio.fundCountPolicy,
      amcExposure: allocatedPortfolio.amcExposure,
      limitBreaches: allocatedPortfolio.limitBreaches,
      policyNotes: getPolicyNotes(request),
      recommendations: allocatedPortfolio.recommendations.filter((bucket) => bucket.funds.length > 0),
      disclaimer: 'These suggestions are based on profile suitability and historical fund data. They are not guaranteed returns or personalized financial advice.',
    };
  }
}
