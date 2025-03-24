
import { StartupExample } from '@/components/StartupCard';

// Unicorn Startups
const unicornStartups: StartupExample[] = [
  {
    name: 'Stripe',
    score: 0.86,
    description: 'Online payment processing for internet businesses. Succeeded by simplifying payment integration for developers.',
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
      businessModelViability: 0.9
    }
  },
  {
    name: 'Airbnb',
    score: 0.78,
    description: 'Marketplace for short-term accommodations. Created a new market category by enabling people to rent out their homes.',
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
      businessModelViability: 0.8
    }
  },
  {
    name: 'Snowflake',
    score: 0.92,
    description: 'Cloud-based data warehousing. Revolutionized how businesses store and analyze data in the cloud.',
    category: 'unicorn',
    factors: {
      marketSize: 1.0,
      barrierToEntry: 0.8,
      defensibility: 1.0,
      insightFactor: 0.9,
      complexity: 0.5,
      riskFactor: 0.3,
      teamFactor: 0.9,
      marketTiming: 0.9,
      competitionIntensity: 0.4,
      capitalEfficiency: 0.8,
      distributionAdvantage: 0.9,
      businessModelViability: 0.9
    }
  },
  {
    name: 'Zoom',
    score: 0.83,
    description: 'Video conferencing platform. Succeeded with a simple, reliable product and perfect market timing.',
    category: 'unicorn',
    factors: {
      marketSize: 0.9,
      barrierToEntry: 0.6,
      defensibility: 0.8,
      insightFactor: 0.7,
      complexity: 0.4,
      riskFactor: 0.3,
      teamFactor: 0.8,
      marketTiming: 0.8,
      competitionIntensity: 0.5,
      capitalEfficiency: 0.8,
      distributionAdvantage: 0.9,
      businessModelViability: 0.8
    }
  },
  {
    name: 'DoorDash',
    score: 0.76,
    description: 'Food delivery service that leveraged technology to optimize logistics and delivery experience.',
    category: 'unicorn',
    factors: {
      marketSize: 0.9,
      barrierToEntry: 0.6,
      defensibility: 0.7,
      insightFactor: 0.7,
      complexity: 0.5,
      riskFactor: 0.5,
      teamFactor: 0.8,
      marketTiming: 0.8,
      competitionIntensity: 0.6,
      capitalEfficiency: 0.7,
      distributionAdvantage: 0.8,
      businessModelViability: 0.8
    }
  }
];

// Medium Startups
const mediumStartups: StartupExample[] = [
  {
    name: 'Basecamp',
    score: 0.77,
    description: 'Project management and team communication software. Built a profitable business with minimal outside funding.',
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
      businessModelViability: 0.8
    }
  },
  {
    name: 'Calendly',
    score: 0.81,
    description: 'Scheduling automation platform. Simplified meeting scheduling with a freemium distribution model.',
    category: 'medium',
    factors: {
      marketSize: 0.7,
      barrierToEntry: 0.7,
      defensibility: 0.8,
      insightFactor: 0.7,
      complexity: 0.3,
      riskFactor: 0.3,
      teamFactor: 0.8,
      marketTiming: 0.8,
      competitionIntensity: 0.4,
      capitalEfficiency: 0.8,
      distributionAdvantage: 0.7,
      businessModelViability: 0.8
    }
  },
  {
    name: 'Transistor.fm',
    score: 0.72,
    description: 'Podcast hosting and analytics platform. Built a sustainable business in a niche market.',
    category: 'medium',
    factors: {
      marketSize: 0.6,
      barrierToEntry: 0.7,
      defensibility: 0.7,
      insightFactor: 0.6,
      complexity: 0.4,
      riskFactor: 0.4,
      teamFactor: 0.7,
      marketTiming: 0.7,
      competitionIntensity: 0.5,
      capitalEfficiency: 0.7,
      distributionAdvantage: 0.7,
      businessModelViability: 0.7
    }
  },
  {
    name: 'Buffer',
    score: 0.78,
    description: 'Social media management platform. Grew steadily with transparent company culture and remote-first approach.',
    category: 'medium',
    factors: {
      marketSize: 0.7,
      barrierToEntry: 0.6,
      defensibility: 0.7,
      insightFactor: 0.7,
      complexity: 0.4,
      riskFactor: 0.3,
      teamFactor: 0.8,
      marketTiming: 0.8,
      competitionIntensity: 0.5,
      capitalEfficiency: 0.8,
      distributionAdvantage: 0.7,
      businessModelViability: 0.8
    }
  },
  {
    name: 'ConvertKit',
    score: 0.80,
    description: 'Email marketing platform for creators. Found success by focusing on a specific niche audience.',
    category: 'medium',
    factors: {
      marketSize: 0.7,
      barrierToEntry: 0.7,
      defensibility: 0.7,
      insightFactor: 0.7,
      complexity: 0.4,
      riskFactor: 0.3,
      teamFactor: 0.8,
      marketTiming: 0.8,
      competitionIntensity: 0.5,
      capitalEfficiency: 0.8,
      distributionAdvantage: 0.8,
      businessModelViability: 0.8
    }
  }
];

// Failed Startups
const failedStartups: StartupExample[] = [
  {
    name: 'Theranos',
    score: 0.45,
    description: 'Blood testing company that claimed to run tests with tiny amounts of blood. Failed due to fraudulent technology claims.',
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
      businessModelViability: 0.1
    }
  },
  {
    name: 'Juicero',
    score: 0.37,
    description: 'Wi-Fi connected juice press that squeezed proprietary juice packets. Failed due to high cost and limited value proposition.',
    category: 'failed',
    factors: {
      marketSize: 0.4,
      barrierToEntry: 0.2,
      defensibility: 0.1,
      insightFactor: 0.2,
      complexity: 0.2,
      riskFactor: 0.4,
      teamFactor: 0.4,
      marketTiming: 0.2,
      competitionIntensity: 0.2,
      capitalEfficiency: 0.2,
      distributionAdvantage: 0.2,
      businessModelViability: 0.1
    }
  },
  {
    name: 'MoviePass',
    score: 0.35,
    description: 'Subscription service offering unlimited movie tickets for a flat monthly fee. Failed due to unsustainable business model.',
    category: 'failed',
    factors: {
      marketSize: 0.6,
      barrierToEntry: 0.2,
      defensibility: 0.1,
      insightFactor: 0.3,
      complexity: 0.3,
      riskFactor: 0.8,
      teamFactor: 0.3,
      marketTiming: 0.5,
      competitionIntensity: 0.6,
      capitalEfficiency: 0.2,
      distributionAdvantage: 0.2,
      businessModelViability: 0.2
    }
  },
  {
    name: 'Quibi',
    score: 0.44,
    description: 'Mobile-only streaming platform with short-form content. Failed despite $1.75B in funding due to poor product-market fit.',
    category: 'failed',
    factors: {
      marketSize: 0.6,
      barrierToEntry: 0.3,
      defensibility: 0.2,
      insightFactor: 0.2,
      complexity: 0.3,
      riskFactor: 0.8,
      teamFactor: 0.7,
      marketTiming: 0.6,
      competitionIntensity: 0.6,
      capitalEfficiency: 0.3,
      distributionAdvantage: 0.5,
      businessModelViability: 0.2
    }
  },
  {
    name: 'Pets.com',
    score: 0.39,
    description: 'Online pet supplies retailer during the dot-com bubble. Failed due to high costs and early e-commerce infrastructure.',
    category: 'failed',
    factors: {
      marketSize: 0.6,
      barrierToEntry: 0.3,
      defensibility: 0.2,
      insightFactor: 0.4,
      complexity: 0.4,
      riskFactor: 0.8,
      teamFactor: 0.5,
      marketTiming: 0.5,
      competitionIntensity: 0.6,
      capitalEfficiency: 0.3,
      distributionAdvantage: 0.2,
      businessModelViability: 0.2
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
  distributionAdvantage: 0.5,
  businessModelViability: 0.5
};
