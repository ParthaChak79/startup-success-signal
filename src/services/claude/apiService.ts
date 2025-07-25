
import { supabase } from '@/integrations/supabase/client';

interface AnalysisResult {
  parameters: Record<string, number>;
  explanations: Record<string, string>;
}

export const analyzeWithClaude = async (
  text: string,
  file: File
): Promise<AnalysisResult> => {
  const { data: profileData } = await supabase.auth.getUser();
  const userId = profileData.user?.id;

  // Get API key from localStorage or from user profile
  let claudeApiKey = localStorage.getItem('claude_api_key');
  
  // If user is logged in, check their profile for API key as well
  if (userId) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('claude_api_key, free_analyses_used')
      .eq('id', userId)
      .single();

    if (!profileError && profile?.claude_api_key) {
      claudeApiKey = profile.claude_api_key;
    }
    
    // Check if user still has free analyses
    const freeAnalysesUsed = profile?.free_analyses_used || 0;
    const FREE_USAGE_LIMIT = 3;
    
    if (!claudeApiKey && freeAnalysesUsed >= FREE_USAGE_LIMIT) {
      throw new Error('You have used all your free analyses. Please provide your Claude API key to continue.');
    }
    
    // If using free tier, increment usage count
    if (!claudeApiKey) {
      await incrementFreeUsage(userId);
    }
  } else if (!claudeApiKey) {
    throw new Error('Please sign in to use this feature or provide a Claude API key.');
  }

  try {
    // Mock response for testing purposes
    // In a real implementation, this would call the Claude API
    const mockResponse: AnalysisResult = {
      parameters: {
        marketSize: 0.7,
        barrierToEntry: 0.6,
        defensibility: 0.8,
        insightFactor: 0.6,
        complexity: 0.5,
        riskFactor: 0.4,
        teamFactor: 0.8,
        marketTiming: 0.7,
        competitionIntensity: 0.6,
        capitalEfficiency: 0.7,
        distributionAdvantage: 0.6,
        businessModelViability: 0.7
      },
      explanations: {
        marketSize: "The pitch deck shows a large addressable market with clear growth potential.",
        barrierToEntry: "There are some technological barriers that competitors would need to overcome.",
        defensibility: "The startup has strong intellectual property protection with patents pending.",
        insightFactor: "The founders demonstrate deep domain expertise and novel market insights.",
        complexity: "The business model has moderate complexity with some technical challenges.",
        riskFactor: "The business has moderate risk factors including regulatory considerations.",
        teamFactor: "The team has strong relevant experience and complementary skill sets.",
        marketTiming: "The market timing appears favorable with growing demand for this solution.",
        competitionIntensity: "There is moderate competition but with clear differentiation possibilities.",
        capitalEfficiency: "The startup has a reasonable path to profitability requiring moderate capital.",
        distributionAdvantage: "The go-to-market strategy leverages existing channels effectively.",
        businessModelViability: "The business model shows strong unit economics and scalability."
      }
    };

    // Here you would actually call the Claude API
    return mockResponse;
  } catch (error) {
    console.error('Error analyzing with Claude:', error);
    throw error;
  }
};

export const saveClaudeApiKey = async (apiKey: string): Promise<void> => {
  // Always save to localStorage
  localStorage.setItem('claude_api_key', apiKey);
  
  // Try to save to user profile if authenticated
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;

  if (userId) {
    const { error } = await supabase
      .from('profiles')
      .update({ claude_api_key: apiKey })
      .eq('id', userId);

    if (error) {
      console.error('Error saving API key to profile:', error);
      // Don't throw error - we've already saved to localStorage
    }
  }
};

export const incrementFreeUsage = async (userId: string): Promise<void> => {
  try {
    // First get the current count
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('free_analyses_used')
      .eq('id', userId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching usage data:', fetchError);
      throw new Error('Could not update usage count');
    }
    
    // Get current count or default to 0
    const currentCount = profile?.free_analyses_used || 0;
    
    // Update with incremented count
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ free_analyses_used: currentCount + 1 })
      .eq('id', userId);
    
    if (updateError) {
      console.error('Failed to increment free usage:', updateError);
      throw new Error('Could not update usage count');
    }
  } catch (error) {
    console.error('Failed to increment free usage:', error);
    // Don't throw here - we want the analysis to continue even if tracking fails
  }
};
