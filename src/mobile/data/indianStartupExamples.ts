import {StartupExample} from '../components/StartupCard';
import {calculateSVI} from '../utils/sviCalculator';

const createStartupWithFactors = (
  name: string,
  values: number[],
  category: 'unicorn' | 'medium' | 'failed',
  description: string,
): StartupExample => {
  const factors = {
    marketSize: values[0],
    barrierToEntry: values[1],
    defensibility: values[2],
    insightFactor: values[3],
    complexity: values[4],
    riskFactor: values[5],
    teamFactor: values[6],
    marketTiming: values[7],
    competitionIntensity: values[8],
    capitalEfficiency: values[9],
    distributionAdvantage: values[10],
    businessModelViability: values[11],
  };

  return {
    name,
    score: calculateSVI(factors),
    description,
    category,
    factors,
  };
};

const unicornStartups: StartupExample[] = [
  createStartupWithFactors(
    'Flipkart',
    [0.9, 0.7, 0.8, 0.7, 0.6, 0.5, 0.8, 0.8, 0.6, 0.7, 0.8, 0.7],
    'unicorn',
    "India's largest e-commerce marketplace with a valuation over $37B.",
  ),
  createStartupWithFactors(
    'Zomato',
    [0.9, 0.7, 0.8, 0.7, 0.6, 0.6, 0.9, 0.8, 0.7, 0.7, 0.9, 0.8],
    'unicorn',
    'Food delivery platform that transformed restaurant discovery.',
  ),
];

const mediumStartups: StartupExample[] = [
  createStartupWithFactors(
    'Dunzo',
    [0.8, 0.6, 0.7, 0.6, 0.6, 0.6, 0.8, 0.7, 0.7, 0.7, 0.8, 0.7],
    'medium',
    'Hyperlocal delivery service for everything from groceries to keys.',
  ),
];

const failedStartups: StartupExample[] = [
  createStartupWithFactors(
    'Dazo',
    [0.6, 0.4, 0.3, 0.4, 0.5, 0.7, 0.6, 0.5, 0.6, 0.5, 0.6, 0.4],
    'failed',
    'Food delivery startup that shut down within a year.',
  ),
];

export const indianStartupExamples = {
  unicorn: unicornStartups,
  medium: mediumStartups,
  failed: failedStartups,
};