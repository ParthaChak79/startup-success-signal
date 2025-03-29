
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';

/**
 * Analyze text with Claude via the Supabase Edge Function
 */
export const analyzeWithClaude = async (text: string, fileName?: string) => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;
    
    // Check if there's an API key in localStorage
    const localApiKey = localStorage.getItem('claude_api_key');
    
    // User auth check
    if (!session && !localApiKey) {
      throw new Error("You need to be signed in or provide a Claude API key");
    }
    
    // Prepare authentication for the edge function
    const headers: Record<string, string> = {};
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
    }
    
    // Call the Edge Function
    const { data, error } = await supabase.functions.invoke('analyze-pitch-deck', {
      body: { text, fileName },
      headers
    });
    
    if (error) {
      console.error("Edge function error:", error);
      throw new Error(error.message || "Error analyzing with Claude");
    }
    
    if (!data || !data.result) {
      console.error("Missing result data:", data);
      throw new Error("No result returned from analysis");
    }
    
    // Increment usage count for logged-in users using free analyses
    if (session?.user && !localApiKey) {
      await incrementFreeUsage();
    }
    
    try {
      // Parse the result which should be a JSON string from Claude
      const result = JSON.parse(data.result);
      
      // If not a pitch deck, return minimal info
      if (!result.isPitchDeck) {
        return {
          parameters: {
            marketSize: 0,
            barrierToEntry: 0,
            defensibility: 0,
            insightFactor: 0,
            complexity: 0,
            riskFactor: 0,
            teamFactor: 0,
            marketTiming: 0,
            competitionIntensity: 0,
            capitalEfficiency: 0,
            distributionAdvantage: 0,
            businessModelViability: 0
          },
          explanations: {
            overall: result.explanation || "This doesn't appear to be a startup pitch deck."
          }
        };
      }
      
      // Extract explanations if they exist
      const explanations: Record<string, string> = {};
      if (result.explanations) {
        Object.keys(result.parameters).forEach(key => {
          explanations[key] = result.explanations[key] || '';
        });
      }
      
      return {
        parameters: result.parameters,
        explanations
      };
    } catch (parseError) {
      console.error("Error parsing Claude response:", parseError, "Raw response:", data.result);
      throw new Error("Error parsing Claude response. The API may be experiencing issues.");
    }
  } catch (error: any) {
    console.error("Error in analyzeWithClaude:", error);
    
    // Handle specific error cases
    if (error.message?.includes('API key')) {
      throw new Error("Claude API key is required. Please provide a valid API key.");
    }
    
    throw error;
  }
};

/**
 * Increment the user's free analysis usage count
 */
export const incrementFreeUsage = async () => {
  // Check if user is authenticated
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;
  
  if (!session || !session.user) {
    console.warn("Cannot increment free usage: No authenticated user");
    return;
  }
  
  try {
    // Call the stored procedure to increment usage count
    const { error } = await supabase.rpc('increment_free_analysis_usage', {
      user_id: session.user.id
    });
    
    if (error) {
      console.error("Failed to increment free usage:", error);
    }
  } catch (err) {
    console.error("Error incrementing free usage count:", err);
  }
};

/**
 * Save Claude API key to local storage and optionally to user profile
 */
export const saveClaudeApiKey = async (apiKey: string, userId?: string) => {
  if (!apiKey.trim()) {
    toast.error("Please enter a valid API key");
    return false;
  }
  
  try {
    // Always save to localStorage for local usage
    localStorage.setItem('claude_api_key', apiKey);
    
    // If user ID is provided, also save to their profile
    if (userId) {
      // Define the update data with proper typing for the profiles table
      const { error } = await supabase
        .from('profiles')
        .update({ claude_api_key: apiKey })
        .eq('id', userId);
        
      if (error) throw error;
    }
    
    toast.success("API key saved successfully");
    return true;
  } catch (error) {
    console.error("Error saving API key:", error);
    toast.error("Failed to save API key");
    return false;
  }
};
