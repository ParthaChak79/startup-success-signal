import {supabase} from '../integrations/supabase/client';
import {SVIFactors} from '../utils/sviCalculator';

interface ClaudeAnalysis {
  isPitchDeck: boolean;
  parameters: Partial<SVIFactors>;
  explanations?: Record<string, string>;
  message?: string;
}

export const analyzeWithClaude = async (
  text: string,
  fileName: string,
): Promise<ClaudeAnalysis> => {
  console.log(`Analyzing file with Claude: ${fileName}, text length: ${text.length} chars`);

  try {
    const {data: userData} = await supabase.auth.getSession();
    if (!userData.session) {
      throw new Error('Authentication required');
    }

    const {data, error} = await supabase.functions.invoke('analyze-pitch-deck', {
      body: {text, fileName},
    });

    if (error) {
      console.error('Error invoking Edge Function:', error);
      throw new Error(`Error analyzing pitch deck: ${error.message}`);
    }

    if (!data || !data.result) {
      console.error('No data returned from Edge Function');
      throw new Error('No analysis results received');
    }

    try {
      let analysisData: any;

      try {
        analysisData = JSON.parse(data.result);
      } catch (parseError) {
        const jsonMatch = data.result.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysisData = JSON.parse(jsonMatch[0]);
        } else {
          throw parseError;
        }
      }

      if (!analysisData) {
        throw new Error('Invalid format received from analysis');
      }

      return {
        isPitchDeck: analysisData.isPitchDeck !== false,
        parameters: analysisData.parameters || {},
        explanations: analysisData.explanation || {},
        message: analysisData.message,
      };
    } catch (parseError) {
      console.error('Error parsing Claude response:', parseError, data.result);
      throw new Error('Error parsing analysis results');
    }
  } catch (error: any) {
    console.error('Error in analyzeWithClaude:', error);
    throw error;
  }
};