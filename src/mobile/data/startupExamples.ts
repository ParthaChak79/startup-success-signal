import {StartupExample} from '../components/StartupCard';

const unicornStartups: StartupExample[] = [
  {
    name: 'Stripe',
    score: 0.86,
    description: 'Online payment processing for internet businesses.',
    category: 'unicorn',
    factors: {
      marketSize: 0.8,
      barrierToEntry: 0.6,
      defensibility: 0.8,
      insightFactor: 0.8,
      complexity: 0.4,
      riskFactor: 0.3,
      teamFactor: 0.9,
      marketTiming: 0.8,
      competitionIntensity: 0.4,
      capitalEfficiency: 0.9,
      distributionAdvantage: 0.9,
      businessModelViability: 0.9,
    },
  },
  {
    name: 'Airbnb',
    score: 0.78,
    description: 'Marketplace for short-term accommodations.',
    category: 'unicorn',
    factors: {
      marketSize: 0.8,
      barrierToEntry: 0.6,
      defensibility: 0.6,
      insightFactor: 0.8,
      complexity: 0.4,
      riskFactor: 0.4,
      teamFactor: 0.9,
      marketTiming: 0.8,
      competitionIntensity: 0.6,
      capitalEfficiency: 0.7,
      distributionAdvantage: 0.8,
      businessModelViability: 0.8,
    },
  },
];

const mediumStartups: StartupExample[] = [
  {
    name: 'Basecamp',
    score: 0.77,
    description: 'Project management and team communication software.',
    category: 'medium',
    factors: {
      marketSize: 0.6,
      barrierToEntry: 0.7,
      defensibility: 0.7,
      insightFactor: 0.6,
      complexity: 0.3,
      riskFactor: 0.3,
      teamFactor: 0.8,
      marketTiming: 0.7,
      competitionIntensity: 0.5,
      capitalEfficiency: 0.8,
      distributionAdvantage: 0.7,
      businessModelViability: 0.8,
    },
  },
];

const failedStartups: StartupExample[] = [
  {
    name: 'Theranos',
    score: 0.45,
    description: 'Blood testing company with fraudulent technology claims.',
    category: 'failed',
    factors: {
      marketSize: 0.8,
      barrierToEntry: 0.8,
      defensibility: 0.1,
      insightFactor: 0.8,
      complexity: 0.9,
      riskFactor: 0.9,
      teamFactor: 0.4,
      marketTiming: 0.6,
      competitionIntensity: 0.6,
      capitalEfficiency: 0.3,
      distributionAdvantage: 0.5,
      businessModelViability: 0.1,
    },
  },
];

export const startupExamples = {
  unicorn: unicornStartups,
  medium: mediumStartups,
  failed: failedStartups,
};

export const defaultFactors = {
  marketSize: 0.5,
  barrierToEntry: 0.5,
  defensibility: 0.5,
  insightFactor: 0.5,
  complexity: 0.5,
  riskFactor: 0.5,
  teamFactor: 0.5,
  marketTiming: 0.5,
  competitionIntensity: 0.5,
  capitalEfficiency: 0.5,
  distributionAdvantage: 0.5,
  businessModelViability: 0.5,
};