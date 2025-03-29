
import { supabase } from '@/integrations/supabase/client';
import { toast as sonnerToast } from "sonner";
import { SVIFactors } from '@/utils/sviCalculator';

interface ClaudeAnalysis {
  isPitchDeck: boolean;
  parameters: Partial<SVIFactors>;
  explanations?: Record<string, string>;
  message?: string;
}

export const analyzeWithClaude = async (text: string, fileName: string): Promise<ClaudeAnalysis> => {
  console.log(`Analyzing file with Claude: ${fileName}, text length: ${text.length} chars`);
  
  try {
    // Try using Edge Function first (preferred method)
    const { data: userData } = await supabase.auth.getSession();
    if (!userData.session) {
      throw new Error('Authentication required');
    }
    
    // Log to help with debugging
    console.log(`Sending text to analyze-pitch-deck function, first 100 chars: ${text.substring(0, 100)}...`);
    
    const { data, error } = await supabase.functions.invoke('analyze-pitch-deck', {
      body: { text, fileName },
    });
    
    if (error) {
      console.error('Error invoking Edge Function:', error);
      throw new Error(`Error analyzing pitch deck: ${error.message}`);
    }
    
    if (!data || !data.result) {
      console.error('No data returned from Edge Function');
      throw new Error('No analysis results received');
    }
    
    console.log('Analysis result received:', data.result.substring(0, 200) + '...');
    
    try {
      // First try to parse the response directly
      let analysisData: any;
      
      try {
        analysisData = JSON.parse(data.result);
      } catch (parseError) {
        // If direct parsing fails, try to extract JSON from the text
        const jsonMatch = data.result.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysisData = JSON.parse(jsonMatch[0]);
        } else {
          throw parseError;
        }
      }
      
      console.log('Parsed analysis data:', analysisData);
      
      if (!analysisData) {
        throw new Error('Invalid format received from analysis');
      }
      
      // Structure the response
      return {
        isPitchDeck: analysisData.isPitchDeck !== false,
        parameters: analysisData.parameters || {},
        explanations: analysisData.explanation || {},
        message: analysisData.message
      };
    } catch (parseError) {
      console.error('Error parsing Claude response:', parseError, data.result);
      throw new Error('Error parsing analysis results');
    }
  } catch (error: any) {
    console.error('Error in analyzeWithClaude:', error);
    
    // Try local API key as fallback if available
    const localApiKey = localStorage.getItem('claude_api_key');
    if (!localApiKey) {
      throw new Error('Claude API key required for analysis');
    }
    
    // Implement fallback direct API call if needed
    throw error;
  }
};
