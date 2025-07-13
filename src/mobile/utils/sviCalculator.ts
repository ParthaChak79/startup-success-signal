export interface SVIFactors {
  marketSize: number;
  barrierToEntry: number;
  defensibility: number;
  insightFactor: number;
  complexity: number;
  riskFactor: number;
  teamFactor: number;
  marketTiming: number;
  competitionIntensity: number;
  capitalEfficiency: number;
  distributionAdvantage: number;
  businessModelViability: number;
  [key: string]: number;
}

export const calculateSVI = (factors: SVIFactors): number => {
  const {
    marketSize,
    barrierToEntry,
    defensibility,
    insightFactor,
    complexity,
    riskFactor,
    teamFactor,
    marketTiming,
    competitionIntensity,
    capitalEfficiency,
    distributionAdvantage,
    businessModelViability,
  } = factors;

  let adjustedMarketTiming = marketTiming;
  if (marketTiming <= 0.2) {
    adjustedMarketTiming = 0.2;
  } else if (marketTiming <= 0.4) {
    adjustedMarketTiming = 0.5;
  } else if (marketTiming <= 0.7) {
    adjustedMarketTiming = marketTiming;
  } else if (marketTiming <= 0.9) {
    adjustedMarketTiming = 0.5;
  } else {
    adjustedMarketTiming = 0.2;
  }

  const weighted_sum =
    1.2 * marketSize +
    1.0 * barrierToEntry +
    1.2 * defensibility +
    1.1 * insightFactor +
    0.8 * (1 - complexity) +
    1.3 * (1 - riskFactor) +
    1.2 * teamFactor +
    1.1 * adjustedMarketTiming +
    0.9 * (1 - competitionIntensity) +
    1.0 * capitalEfficiency +
    1.1 * distributionAdvantage +
    1.3 * businessModelViability;

  const svi = weighted_sum / 12;
  return Math.max(0, Math.min(1, svi));
};

export const getFactorText = (factor: keyof SVIFactors, value: number): string => {
  if (factor === 'marketSize') {
    if (value <= 0.2) return 'Tiny market (<$10M)';
    if (value <= 0.4) return 'Small market ($10M-$100M)';
    if (value <= 0.6) return 'Medium market ($100M-$1B)';
    if (value <= 0.8) return 'Large market ($1B-$10B)';
    return 'Massive market (>$10B)';
  }

  if (factor === 'barrierToEntry') {
    if (value <= 0.2) return 'Almost no barriers';
    if (value <= 0.4) return 'Low barriers';
    if (value <= 0.6) return 'Moderate barriers';
    if (value <= 0.8) return 'High barriers';
    return 'Extreme barriers';
  }

  if (factor === 'defensibility') {
    if (value <= 0.2) return 'No unique advantage';
    if (value <= 0.4) return 'Weak advantages';
    if (value <= 0.6) return 'Some advantages';
    if (value <= 0.8) return 'Strong advantages';
    return 'Exceptional advantages';
  }

  if (factor === 'insightFactor') {
    if (value <= 0.2) return 'Obvious solution';
    if (value <= 0.4) return 'Minor improvement';
    if (value <= 0.6) return 'Novel combination';
    if (value <= 0.8) return 'Unique insight';
    return 'Revolutionary insight';
  }

  if (factor === 'complexity') {
    if (value <= 0.2) return 'Very simple';
    if (value <= 0.4) return 'Simple';
    if (value <= 0.6) return 'Moderate';
    if (value <= 0.8) return 'Complex';
    return 'Extremely complex';
  }

  if (factor === 'riskFactor') {
    if (value <= 0.2) return 'Minimal risk';
    if (value <= 0.4) return 'Low risk';
    if (value <= 0.6) return 'Moderate risk';
    if (value <= 0.8) return 'High risk';
    return 'Extreme risk';
  }

  if (factor === 'teamFactor') {
    if (value <= 0.2) return 'Weak team';
    if (value <= 0.4) return 'Basic team';
    if (value <= 0.6) return 'Solid team';
    if (value <= 0.8) return 'Strong team';
    return 'Exceptional team';
  }

  if (factor === 'marketTiming') {
    if (value <= 0.2) return 'Significantly too early';
    if (value <= 0.4) return 'Somewhat early';
    if (value <= 0.7) return 'Optimal timing';
    if (value <= 0.9) return 'Slightly late';
    return 'Very late';
  }

  if (factor === 'competitionIntensity') {
    if (value <= 0.2) return 'Minimal competition';
    if (value <= 0.4) return 'Limited competition';
    if (value <= 0.6) return 'Moderate competition';
    if (value <= 0.8) return 'Strong competition';
    return 'Intense competition';
  }

  if (factor === 'capitalEfficiency') {
    if (value <= 0.2) return 'Extremely capital intensive';
    if (value <= 0.4) return 'Moderately capital intensive';
    if (value <= 0.6) return 'Average capital efficiency';
    if (value <= 0.8) return 'Good capital efficiency';
    return 'Exceptional capital efficiency';
  }

  if (factor === 'distributionAdvantage') {
    if (value <= 0.2) return 'Extremely difficult distribution';
    if (value <= 0.4) return 'Challenging distribution';
    if (value <= 0.6) return 'Moderate distribution advantage';
    if (value <= 0.8) return 'Strong distribution advantage';
    return 'Exceptional distribution advantage';
  }

  if (factor === 'businessModelViability') {
    if (value <= 0.2) return 'Flawed model';
    if (value <= 0.4) return 'Weak economics';
    if (value <= 0.6) return 'Standard model';
    if (value <= 0.8) return 'Strong economics';
    return 'Exceptional model';
  }

  return 'Unknown factor';
};

export const getLabelForFactor = (factor: keyof SVIFactors): string => {
  const labels: Record<keyof SVIFactors, string> = {
    marketSize: 'Market Size',
    barrierToEntry: 'Barrier to Entry',
    defensibility: 'Defensibility',
    insightFactor: 'Insight Factor',
    complexity: 'Complexity',
    riskFactor: 'Risk Factor',
    teamFactor: 'Team Factor',
    marketTiming: 'Market Timing',
    competitionIntensity: 'Competition Intensity',
    capitalEfficiency: 'Capital Efficiency',
    distributionAdvantage: 'Distribution Advantage',
    businessModelViability: 'Business Model Viability',
  };

  return labels[factor];
};

export const getTooltipForFactor = (factor: keyof SVIFactors): string => {
  const tooltips: Record<keyof SVIFactors, string> = {
    marketSize: 'The total addressable market for your product or service.',
    barrierToEntry: 'How difficult it is for new competitors to enter your market.',
    defensibility: 'How effectively you can defend your position once established.',
    insightFactor: 'The uniqueness and value of your core insight.',
    complexity: 'How complicated your product, technology, or business model is.',
    riskFactor: 'The overall risk profile including technology, market, and regulatory risk.',
    teamFactor: 'The quality, experience, and domain expertise of your founding team.',
    marketTiming: 'Whether the market is ready for your solution.',
    competitionIntensity: 'The number and strength of competitors in your space.',
    capitalEfficiency: 'How efficiently you can convert investment capital into growth.',
    distributionAdvantage: 'Your ability to efficiently reach and acquire customers.',
    businessModelViability: 'The fundamental economic viability of your business model.',
  };

  return tooltips[factor];
};

export const getFactorDescription = (factor: keyof SVIFactors, value: number): string => {
  if (factor === 'marketSize') {
    if (value <= 0.2) return 'Very small market opportunity limiting growth potential.';
    if (value <= 0.4) return 'Modest market size with limited growth ceiling.';
    if (value <= 0.6) return 'Healthy market size with room for multiple successful players.';
    if (value <= 0.8) return 'Substantial market opportunity supporting significant scale.';
    return 'Enormous market potential allowing for extensive growth.';
  }

  // Add other factor descriptions as needed...
  return '';
};