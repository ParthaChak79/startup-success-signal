
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
    distributionAdvantage
  } = factors;

  // Calculate S component of the formula
  const S = (
    marketSize + 
    (barrierToEntry * defensibility * 1.2) + 
    (2.4 * insightFactor) - 
    (0.8 * complexity) - 
    riskFactor + 
    teamFactor + 
    (capitalEfficiency * 0.8) + 
    (distributionAdvantage * 0.8)
  ) * marketTiming - (competitionIntensity * 0.8);

  // Calculate k component
  const k = (S - 0.75) / 0.8125;

  // Final SVI calculation with sigmoid function
  const svi = 1 / (1 + Math.exp(-k));

  // Ensure the value is between 0 and 1
  return Math.max(0, Math.min(1, svi));
};

// Get description text for each factor based on value
export const getFactorText = (factor: keyof SVIFactors, value: number): string => {
  if (factor === 'marketSize') {
    if (value <= 0.2) return 'Tiny market (<$10M)';
    if (value <= 0.4) return 'Small market ($10M-$100M)';
    if (value <= 0.6) return 'Medium market ($100M-$1B)';
    if (value <= 0.8) return 'Large market ($1B-$10B)';
    return 'Massive market (>$10B)';
  }
  
  if (factor === 'barrierToEntry') {
    if (value <= 0.2) return 'Almost no barriers (e.g., basic website)';
    if (value <= 0.4) return 'Low barriers (simple tech, no regulations)';
    if (value <= 0.6) return 'Moderate barriers (some tech/regulatory requirements)';
    if (value <= 0.8) return 'High barriers (significant tech/regulatory/network effects)';
    return 'Extreme barriers (deep tech, heavy regulation, strong network effects)';
  }
  
  if (factor === 'defensibility') {
    if (value <= 0.2) return 'No unique advantage';
    if (value <= 0.4) return 'Weak advantages (easily replicable)';
    if (value <= 0.6) return 'Some advantages (head start, partnerships)';
    if (value <= 0.8) return 'Strong advantages (patents, exclusive deals, network effects)';
    return 'Exceptional advantages (breakthrough tech, strong moats)';
  }
  
  if (factor === 'insightFactor') {
    if (value <= 0.2) return 'Obvious solution/common knowledge';
    if (value <= 0.4) return 'Minor improvement on existing solutions';
    if (value <= 0.6) return 'Novel combination of existing ideas';
    if (value <= 0.8) return 'Unique insight others missed';
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
    if (value <= 0.2) return 'Minimal risk (proven technology/market)';
    if (value <= 0.4) return 'Low risk (established patterns)';
    if (value <= 0.6) return 'Moderate risk (some uncertainties)';
    if (value <= 0.8) return 'High risk (significant unknowns)';
    return 'Extreme risk (unproven tech/market/regulations)';
  }
  
  if (factor === 'teamFactor') {
    if (value <= 0.2) return 'Weak team (no relevant experience, skill gaps)';
    if (value <= 0.4) return 'Basic team (some experience but limited domain expertise)';
    if (value <= 0.6) return 'Solid team (good domain expertise, complementary skills)';
    if (value <= 0.8) return 'Strong team (proven domain experts, prior successes)';
    return 'Exceptional team (serial successful founders, deep expertise)';
  }
  
  if (factor === 'marketTiming') {
    if (value <= 0.2) return 'Significantly too early (5+ years ahead of market)';
    if (value <= 0.4) return 'Somewhat early (market emerging but adoption hurdles remain)';
    if (value <= 0.6) return 'Optimal timing (technology, regulations, and market aligned)';
    if (value <= 0.8) return 'Slightly late (established competition but market share available)';
    return 'Very late (market mature, dominant players established)';
  }
  
  if (factor === 'competitionIntensity') {
    if (value <= 0.2) return 'Minimal competition (blue ocean, no direct competitors)';
    if (value <= 0.4) return 'Limited competition (few underfunded competitors)';
    if (value <= 0.6) return 'Moderate competition (several competitors but no dominant player)';
    if (value <= 0.8) return 'Strong competition (multiple well-funded competitors)';
    return 'Intense competition (dominated by large incumbents)';
  }
  
  if (factor === 'capitalEfficiency') {
    if (value <= 0.2) return 'Extremely capital intensive (years to profitability)';
    if (value <= 0.4) return 'Moderately capital intensive (18+ months to profitability)';
    if (value <= 0.6) return 'Average capital efficiency (12-18 months to profitability)';
    if (value <= 0.8) return 'Good capital efficiency (6-12 months to profitability)';
    return 'Exceptional capital efficiency (quick path to profitability)';
  }
  
  if (factor === 'distributionAdvantage') {
    if (value <= 0.2) return 'Extremely difficult distribution (high friction, costly CAC)';
    if (value <= 0.4) return 'Challenging distribution (limited channel access, high touch sales)';
    if (value <= 0.6) return 'Moderate distribution advantage (established channels available)';
    if (value <= 0.8) return 'Strong distribution advantage (efficient channels, viral potential)';
    return 'Exceptional distribution advantage (existing channels, high virality)';
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
    distributionAdvantage: 'Distribution Advantage'
  };
  
  return labels[factor];
};

export const getTooltipForFactor = (factor: keyof SVIFactors): string => {
  const tooltips: Record<keyof SVIFactors, string> = {
    marketSize: 'The total addressable market (TAM) for your product or service. Larger markets typically offer more opportunity but may attract more competition.',
    barrierToEntry: 'How difficult it is for new competitors to enter your market. Higher barriers provide better protection for early movers.',
    defensibility: 'How effectively you can defend your position once established. This includes patents, network effects, scale advantages, etc.',
    insightFactor: 'The uniqueness and value of your core insight. Revolutionary insights that others have missed can create outsized returns.',
    complexity: 'How complicated your product, technology, or business model is. Higher complexity increases execution risk.',
    riskFactor: 'The overall risk profile including technology risk, market risk, regulatory risk, etc.',
    teamFactor: 'The quality, experience, and domain expertise of your founding team. Strong teams can navigate challenges better.',
    marketTiming: 'Whether the market is ready for your solution. Too early means educating customers; too late means fighting established competitors.',
    competitionIntensity: 'The number and strength of competitors in your space. Higher intensity means more resources needed to win.',
    capitalEfficiency: 'How efficiently you can convert investment capital into growth and profitability. Better efficiency means less dilution.',
    distributionAdvantage: 'Your ability to efficiently reach and acquire customers. Strong distribution advantages lower customer acquisition costs.'
  };
  
  return tooltips[factor];
};

export const getFactorDescription = (factor: keyof SVIFactors, value: number): string => {
  // Market size descriptions
  if (factor === 'marketSize') {
    if (value <= 0.2) return 'Very small market opportunity limiting growth potential.';
    if (value <= 0.4) return 'Modest market size with limited growth ceiling.';
    if (value <= 0.6) return 'Healthy market size with room for multiple successful players.';
    if (value <= 0.8) return 'Substantial market opportunity supporting significant scale.';
    return 'Enormous market potential allowing for extensive growth.';
  }

  // Barrier to entry descriptions
  if (factor === 'barrierToEntry') {
    if (value <= 0.2) return 'Anyone can easily enter this market with minimal investment.';
    if (value <= 0.4) return 'Some investment needed but relatively easy to copy.';
    if (value <= 0.6) return 'Noticeable hurdles exist for new entrants.';
    if (value <= 0.8) return 'Significant obstacles exist for potential competitors.';
    return 'Very difficult for new competitors to enter this space.';
  }

  // Defensibility descriptions
  if (factor === 'defensibility') {
    if (value <= 0.2) return 'No meaningful way to defend position once established.';
    if (value <= 0.4) return 'Limited ability to protect position from competitors.';
    if (value <= 0.6) return 'Moderate moats providing some competitive protection.';
    if (value <= 0.8) return 'Strong barriers protecting established position.';
    return 'Extremely difficult for competitors to displace once established.';
  }

  // Insight factor descriptions
  if (factor === 'insightFactor') {
    if (value <= 0.2) return 'Common idea that many others are likely executing on.';
    if (value <= 0.4) return 'Small improvement on existing solutions in the market.';
    if (value <= 0.6) return 'Creative recombination of existing ideas in a fresh way.';
    if (value <= 0.8) return 'Original approach that creates meaningful differentiation.';
    return 'Transformative insight creating new market category.';
  }

  // Complexity descriptions
  if (factor === 'complexity') {
    if (value <= 0.2) return 'Straightforward solution with minimal moving parts.';
    if (value <= 0.4) return 'Relatively simple implementation with few components.';
    if (value <= 0.6) return 'Moderate complexity requiring careful management.';
    if (value <= 0.8) return 'Sophisticated system with many interdependent elements.';
    return 'Highly complex with numerous technical challenges.';
  }

  // Risk factor descriptions
  if (factor === 'riskFactor') {
    if (value <= 0.2) return 'Very low risk profile with proven approaches.';
    if (value <= 0.4) return 'Modest risk with established patterns to follow.';
    if (value <= 0.6) return 'Average risk level with known challenges to address.';
    if (value <= 0.8) return 'Significant risk requiring careful mitigation strategies.';
    return 'Extreme risk profile with major uncertainties.';
  }

  // Team factor descriptions
  if (factor === 'teamFactor') {
    if (value <= 0.2) return 'Team lacks essential skills or relevant experience.';
    if (value <= 0.4) return 'Basic capability but missing important expertise.';
    if (value <= 0.6) return 'Competent team with relevant domain knowledge.';
    if (value <= 0.8) return 'High-performing team with proven track record.';
    return 'World-class team with exceptional domain expertise.';
  }

  // Market timing descriptions
  if (factor === 'marketTiming') {
    if (value <= 0.2) return 'Market not ready, requiring extensive education.';
    if (value <= 0.4) return 'Early stage market with adoption challenges.';
    if (value <= 0.6) return 'Perfect timing with market readiness matching solution.';
    if (value <= 0.8) return 'Market established but still has growth potential.';
    return 'Mature market with established buying patterns.';
  }

  // Competition intensity descriptions
  if (factor === 'competitionIntensity') {
    if (value <= 0.2) return 'Virtually no direct competition in this space.';
    if (value <= 0.4) return 'Limited competition with few established players.';
    if (value <= 0.6) return 'Moderate competition with differentiated offerings.';
    if (value <= 0.8) return 'Significant competition requiring clear differentiation.';
    return 'Extremely competitive market dominated by established players.';
  }

  // Capital efficiency descriptions
  if (factor === 'capitalEfficiency') {
    if (value <= 0.2) return 'Requires massive capital investment before revenue.';
    if (value <= 0.4) return 'Significant funding needed for extended period.';
    if (value <= 0.6) return 'Normal capital requirements with standard payback period.';
    if (value <= 0.8) return 'Capital-efficient with relatively quick path to revenue.';
    return 'Highly efficient capital utilization with fast returns.';
  }

  // Distribution advantage descriptions
  if (factor === 'distributionAdvantage') {
    if (value <= 0.2) return 'Very difficult to reach target customers cost-effectively.';
    if (value <= 0.4) return 'Challenging distribution requiring significant resources.';
    if (value <= 0.6) return 'Standard distribution channels with average CAC.';
    if (value <= 0.8) return 'Effective distribution with below-average acquisition costs.';
    return 'Exceptional distribution advantages with viral potential.';
  }

  return '';
};
