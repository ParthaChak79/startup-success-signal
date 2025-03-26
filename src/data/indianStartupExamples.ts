
import { StartupExample } from '@/components/StartupCard';
import { calculateSVI } from '@/utils/sviCalculator';

// Convert the raw values into the proper format
const createStartupWithFactors = (
  name: string, 
  values: number[], 
  category: 'unicorn' | 'medium' | 'failed',
  description: string
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
    businessModelViability: values[11]
  };
  
  return {
    name,
    score: calculateSVI(factors),
    description,
    category,
    factors
  };
};

// Unicorn Startups
const unicornStartups: StartupExample[] = [
  createStartupWithFactors(
    'Flipkart', 
    [0.9, 0.7, 0.8, 0.7, 0.6, 0.5, 0.8, 0.8, 0.6, 0.7, 0.8, 0.7],
    'unicorn',
    'India\'s largest e-commerce marketplace with a valuation over $37B, acquired by Walmart.'
  ),
  createStartupWithFactors(
    'Zomato', 
    [0.9, 0.7, 0.8, 0.7, 0.6, 0.6, 0.9, 0.8, 0.7, 0.7, 0.9, 0.8],
    'unicorn',
    'Food delivery platform that transformed restaurant discovery and delivery in India.'
  ),
  createStartupWithFactors(
    'Paytm', 
    [0.9, 0.6, 0.7, 0.7, 0.7, 0.6, 0.8, 0.8, 0.8, 0.6, 0.8, 0.7],
    'unicorn',
    'Digital payments and financial services company that revolutionized mobile payments in India.'
  ),
  createStartupWithFactors(
    'Ola', 
    [0.9, 0.6, 0.7, 0.6, 0.6, 0.7, 0.8, 0.7, 0.8, 0.6, 0.8, 0.7],
    'unicorn',
    'Ride-hailing platform competing with global players like Uber in the Indian market.'
  ),
  createStartupWithFactors(
    'Swiggy', 
    [0.9, 0.7, 0.8, 0.7, 0.6, 0.6, 0.9, 0.8, 0.7, 0.7, 0.9, 0.8],
    'unicorn',
    'Food delivery service that scaled rapidly across Indian cities with innovative logistics.'
  ),
  createStartupWithFactors(
    'BYJU\'S', 
    [0.9, 0.6, 0.7, 0.7, 0.7, 0.6, 0.8, 0.8, 0.8, 0.6, 0.8, 0.7],
    'unicorn',
    'EdTech giant that became India\'s most valuable startup with its digital learning platform.'
  ),
  createStartupWithFactors(
    'Razorpay', 
    [0.8, 0.7, 0.8, 0.8, 0.5, 0.5, 0.9, 0.8, 0.6, 0.8, 0.9, 0.8],
    'unicorn',
    'Payment gateway solution that simplified online payments for Indian businesses.'
  )
];

// Medium Startups
const mediumStartups: StartupExample[] = [
  createStartupWithFactors(
    'Dunzo', 
    [0.8, 0.6, 0.7, 0.6, 0.6, 0.6, 0.8, 0.7, 0.7, 0.7, 0.8, 0.7],
    'medium',
    'Hyperlocal delivery service that delivers everything from groceries to forgotten keys.'
  ),
  createStartupWithFactors(
    'Meesho', 
    [0.8, 0.7, 0.8, 0.7, 0.6, 0.5, 0.8, 0.8, 0.7, 0.7, 0.8, 0.7],
    'medium',
    'Social commerce platform enabling small businesses and individuals to start online stores.'
  ),
  createStartupWithFactors(
    'CRED', 
    [0.8, 0.6, 0.7, 0.7, 0.6, 0.5, 0.8, 0.8, 0.6, 0.7, 0.8, 0.7],
    'medium',
    'Credit card bill payment platform that rewards users for paying bills on time.'
  ),
  createStartupWithFactors(
    'Nykaa', 
    [0.8, 0.7, 0.8, 0.7, 0.6, 0.5, 0.8, 0.8, 0.7, 0.7, 0.8, 0.7],
    'medium',
    'Beauty and personal care e-commerce platform that went public with a successful IPO.'
  ),
  createStartupWithFactors(
    'Udaan', 
    [0.8, 0.7, 0.7, 0.7, 0.6, 0.5, 0.8, 0.8, 0.7, 0.7, 0.8, 0.7],
    'medium',
    'B2B e-commerce platform connecting small retailers with manufacturers and wholesalers.'
  ),
  createStartupWithFactors(
    'PharmEasy', 
    [0.8, 0.6, 0.7, 0.7, 0.6, 0.6, 0.8, 0.7, 0.7, 0.7, 0.8, 0.7],
    'medium',
    'Online pharmacy and healthcare platform delivering medicines across India.'
  )
];

// Failed Startups
const failedStartups: StartupExample[] = [
  createStartupWithFactors(
    'Dazo', 
    [0.6, 0.4, 0.3, 0.4, 0.5, 0.7, 0.6, 0.5, 0.6, 0.5, 0.6, 0.4],
    'failed',
    'Food delivery startup that shut down within a year due to operational challenges.'
  ),
  createStartupWithFactors(
    'PepperTap', 
    [0.7, 0.5, 0.4, 0.5, 0.5, 0.7, 0.6, 0.6, 0.6, 0.5, 0.7, 0.5],
    'failed',
    'Grocery delivery service that closed after failing to secure funding and manage logistics.'
  ),
  createStartupWithFactors(
    'Stayzilla', 
    [0.7, 0.5, 0.4, 0.5, 0.5, 0.7, 0.6, 0.6, 0.6, 0.5, 0.7, 0.5],
    'failed',
    'Hotel aggregator startup that suspended operations due to market challenges.'
  ),
  createStartupWithFactors(
    'Yumist', 
    [0.6, 0.4, 0.3, 0.4, 0.5, 0.7, 0.6, 0.5, 0.6, 0.5, 0.6, 0.4],
    'failed',
    'Food tech startup that offered home-style meals but shut down due to high costs.'
  ),
  createStartupWithFactors(
    'Koinex', 
    [0.7, 0.5, 0.4, 0.5, 0.5, 0.7, 0.6, 0.6, 0.6, 0.5, 0.7, 0.5],
    'failed',
    'Cryptocurrency exchange that closed after regulatory challenges in India.'
  ),
  createStartupWithFactors(
    'TinyOwl', 
    [0.6, 0.4, 0.3, 0.4, 0.5, 0.7, 0.6, 0.5, 0.6, 0.5, 0.6, 0.4],
    'failed',
    'Food ordering app that collapsed despite significant funding due to aggressive expansion.'
  )
];

export const indianStartupExamples = {
  unicorn: unicornStartups,
  medium: mediumStartups,
  failed: failedStartups
};
