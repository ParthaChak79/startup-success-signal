
import { StartupExample } from '@/components/StartupCard';

// Unicorn Startups
const unicornStartups: StartupExample[] = [
  {
    name: 'Stripe',
    score: 0.8337,
    description: 'Online payment processing for internet businesses. Succeeded by simplifying payment integration for developers.',
    category: 'unicorn',
    factors: {
      marketSize: 0.9,
      barrierToEntry: 0.8,
      defensibility: 0.7,
      insightFactor: 0.9,
      complexity: 0.7,
      riskFactor: 0.6,
      teamFactor: 0.9,
      marketTiming: 0.9,
      competitionIntensity: 0.7,
      capitalEfficiency: 0.7,
      distributionAdvantage: 0.8
    }
  },
  {
    name: 'Airbnb',
    score: 0.7948,
    description: 'Marketplace for short-term accommodations. Created a new market category by enabling people to rent out their homes.',
    category: 'unicorn',
    factors: {
      marketSize: 0.9,
      barrierToEntry: 0.6,
      defensibility: 0.8,
      insightFactor: 0.8,
      complexity: 0.5,
      riskFactor: 0.7,
      teamFactor: 0.8,
      marketTiming: 0.9,
      competitionIntensity: 0.4,
      capitalEfficiency: 0.6,
      distributionAdvantage: 0.7
    }
  },
  {
    name: 'Snowflake',
    score: 0.7761,
    description: 'Cloud-based data warehousing. Revolutionized how businesses store and analyze data in the cloud.',
    category: 'unicorn',
    factors: {
      marketSize: 0.8,
      barrierToEntry: 0.7,
      defensibility: 0.7,
      insightFactor: 0.7,
      complexity: 0.8,
      riskFactor: 0.5,
      teamFactor: 0.8,
      marketTiming: 0.9,
      competitionIntensity: 0.6,
      capitalEfficiency: 0.6,
      distributionAdvantage: 0.6
    }
  }
];

// Medium Startups
const mediumStartups: StartupExample[] = [
  {
    name: 'Basecamp',
    score: 0.6900,
    description: 'Project management and team communication software. Built a profitable business with minimal outside funding.',
    category: 'medium',
    factors: {
      marketSize: 0.6,
      barrierToEntry: 0.4,
      defensibility: 0.5,
      insightFactor: 0.7,
      complexity: 0.4,
      riskFactor: 0.3,
      teamFactor: 0.8,
      marketTiming: 0.7,
      competitionIntensity: 0.7,
      capitalEfficiency: 0.9,
      distributionAdvantage: 0.6
    }
  },
  {
    name: 'Calendly',
    score: 0.6767,
    description: 'Scheduling automation platform. Simplified meeting scheduling with a freemium distribution model.',
    category: 'medium',
    factors: {
      marketSize: 0.5,
      barrierToEntry: 0.3,
      defensibility: 0.5,
      insightFactor: 0.6,
      complexity: 0.3,
      riskFactor: 0.3,
      teamFactor: 0.7,
      marketTiming: 0.8,
      competitionIntensity: 0.6,
      capitalEfficiency: 0.8,
      distributionAdvantage: 0.8
    }
  },
  {
    name: 'Transistor.fm',
    score: 0.5521,
    description: 'Podcast hosting and analytics platform. Built a sustainable business in a niche market.',
    category: 'medium',
    factors: {
      marketSize: 0.4,
      barrierToEntry: 0.4,
      defensibility: 0.5,
      insightFactor: 0.5,
      complexity: 0.4,
      riskFactor: 0.3,
      teamFactor: 0.6,
      marketTiming: 0.7,
      competitionIntensity: 0.5,
      capitalEfficiency: 0.8,
      distributionAdvantage: 0.7
    }
  }
];

// Failed Startups
const failedStartups: StartupExample[] = [
  {
    name: 'Theranos',
    score: 0.1531,
    description: 'Blood testing company that claimed to run tests with tiny amounts of blood. Failed due to fraudulent technology claims.',
    category: 'failed',
    factors: {
      marketSize: 0.8,
      barrierToEntry: 0.9,
      defensibility: 0.7,
      insightFactor: 0.1,
      complexity: 0.9,
      riskFactor: 0.9,
      teamFactor: 0.3,
      marketTiming: 0.5,
      competitionIntensity: 0.6,
      capitalEfficiency: 0.1,
      distributionAdvantage: 0.2
    }
  },
  {
    name: 'Juicero',
    score: 0.2282,
    description: 'Wi-Fi connected juice press that squeezed proprietary juice packets. Failed due to high cost and limited value proposition.',
    category: 'failed',
    factors: {
      marketSize: 0.3,
      barrierToEntry: 0.4,
      defensibility: 0.3,
      insightFactor: 0.2,
      complexity: 0.7,
      riskFactor: 0.7,
      teamFactor: 0.6,
      marketTiming: 0.4,
      competitionIntensity: 0.5,
      capitalEfficiency: 0.2,
      distributionAdvantage: 0.3
    }
  },
  {
    name: 'MoviePass',
    score: 0.4662,
    description: 'Subscription service offering unlimited movie tickets for a flat monthly fee. Failed due to unsustainable business model.',
    category: 'failed',
    factors: {
      marketSize: 0.7,
      barrierToEntry: 0.3,
      defensibility: 0.2,
      insightFactor: 0.7,
      complexity: 0.4,
      riskFactor: 0.8,
      teamFactor: 0.5,
      marketTiming: 0.6,
      competitionIntensity: 0.6,
      capitalEfficiency: 0.1,
      distributionAdvantage: 0.5
    }
  }
];

export const startupExamples = {
  unicorn: unicornStartups,
  medium: mediumStartups,
  failed: failedStartups
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
  distributionAdvantage: 0.5
};
