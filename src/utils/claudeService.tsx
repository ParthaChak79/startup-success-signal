
import React, { useState } from 'react';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { type SVIFactors } from '@/utils/sviCalculator';

interface ApiKeyFormProps {
  onApiKeySaved: () => void;
}

const formSchema = z.object({
  apiKey: z.string().min(1, "API key is required")
});

export const ApiKeyForm: React.FC<ApiKeyFormProps> = ({ onApiKeySaved }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      apiKey: "",
    },
  });
  const { user } = useAuthContext();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (user) {
        // Save API key to the user's profile in Supabase
        const { error } = await supabase
          .from('profiles')
          .update({ claude_api_key: values.apiKey })
          .eq('id', user.id);
        
        if (error) {
          throw error;
        }
      } else {
        // Fallback to localStorage if user is not logged in
        localStorage.setItem('claude_api_key', values.apiKey);
      }
      
      toast.success("Claude API key saved successfully");
      onApiKeySaved();
    } catch (error) {
      console.error("Error saving API key:", error);
      toast.error("Failed to save API key");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="apiKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Claude API Key</FormLabel>
              <FormControl>
                <Input
                  placeholder="claude-api-key..."
                  type="password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Save API Key</Button>
        <p className="text-sm text-muted-foreground mt-2">
          {user ? 
            "Your API key is securely stored in your user profile." :
            "Your API key is stored locally and never sent to our servers."}
        </p>
      </form>
    </Form>
  );
};

const getUserApiKey = async (): Promise<string | null> => {
  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session?.user) {
    // Get API key from profile
    const { data, error } = await supabase
      .from('profiles')
      .select('claude_api_key')
      .eq('id', session.user.id)
      .single();
    
    if (!error && data?.claude_api_key) {
      return data.claude_api_key;
    }
  }
  
  // Fallback to localStorage
  return localStorage.getItem('claude_api_key');
};

const checkFreeUsage = async (): Promise<{ freeUsageAvailable: boolean, freeUsageRemaining: number }> => {
  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    // If user is not authenticated, they need to sign in to use the service
    return { freeUsageAvailable: false, freeUsageRemaining: 0 };
  }
  
  // Get free usage count from profile
  const { data, error } = await supabase
    .from('profiles')
    .select('free_analyses_used')
    .eq('id', session.user.id)
    .single();
  
  if (error) {
    console.error("Error checking free usage:", error);
    return { freeUsageAvailable: false, freeUsageRemaining: 0 };
  }
  
  const FREE_USAGE_LIMIT = 3;
  const usedCount = data?.free_analyses_used || 0;
  const remaining = Math.max(0, FREE_USAGE_LIMIT - usedCount);
  
  return { 
    freeUsageAvailable: remaining > 0,
    freeUsageRemaining: remaining
  };
};

const incrementFreeUsage = async (): Promise<void> => {
  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    return;
  }
  
  // Use Supabase RPC to increment free usage count
  try {
    const { error } = await supabase.rpc('increment_free_analysis_usage', {
      user_id: session.user.id
    });

    if (error) {
      console.error("Failed to increment free usage:", error);
    }
  } catch (error) {
    console.error("Error in incrementFreeUsage:", error);
  }
};

export const analyzeWithClaude = async (text: string, fileName: string): Promise<{
  isPitchDeck: boolean;
  message?: string;
  parameters: SVIFactors;
  explanations?: Record<string, string>;
}> => {
  // Check free usage
  const { freeUsageAvailable, freeUsageRemaining } = await checkFreeUsage();
  
  // Get API key (either from user profile or localStorage)
  let apiKey = await getUserApiKey();
  
  // If no free usage available and no API key, throw error
  if (!freeUsageAvailable && !apiKey) {
    throw new Error('You have used all your free analyses. Please provide a Claude API key to continue.');
  }
  
  // If free usage is available, don't need API key (will use our backend service)
  const usingFreeUsage = freeUsageAvailable && !apiKey;
  
  try {
    console.log('Analyzing with Claude:', fileName);
    console.log('Text length:', text.length);
    console.log('Using free usage:', usingFreeUsage);
    
    // The prompt is similar to the OpenAI one but adapted for Claude
    const systemPrompt = `
You are an expert startup investor and pitch deck analyzer. Your task is to extract and analyze key information from a startup pitch deck.

Evaluate the document on the following parameters. For each parameter, provide a numerical score between 0 and 1, where:
- 0 means no information was provided about this parameter
- 0.1-0.3 means weak or minimal information
- 0.4-0.6 means average or adequate information
- 0.7-0.9 means strong or compelling information
- 1.0 means exceptionally strong information

Parameters to evaluate:
1. marketSize: How large is the addressable market?
2. barrierToEntry: What barriers exist for new competitors?
3. defensibility: How well can the startup defend against competition?
4. insightFactor: How unique is their core insight?
5. complexity: How complex is their solution (technical/implementation)?
6. riskFactor: What is the overall risk profile?
7. teamFactor: How strong and experienced is the team?
8. marketTiming: Is the market timing optimal for this solution?
9. competitionIntensity: How intense is the competition?
10. capitalEfficiency: How efficiently can they convert investment into growth?
11. distributionAdvantage: Do they have advantages in distribution/customer acquisition?
12. businessModelViability: How viable is their business model?

IMPORTANT: If the document is NOT a startup pitch deck, or if it doesn't provide enough startup-related information to analyze, give ALL parameters a score of 0.

Return a JSON object with these scores and a determination of whether this is a pitch deck.
`;

    const userPrompt = `Analyze this document: ${text.substring(0, 15000)}${text.length > 15000 ? '... (truncated)' : ''} 
Filename: ${fileName}

Respond with a JSON object containing:
1. "isPitchDeck": boolean - whether this document is a startup pitch deck
2. "parameters": object with numerical scores (0-1) for all 12 parameters
3. "explanation": brief explanation for each parameter score

If this is not a pitch deck, set all parameters to 0.`;

    let response;
    
    if (usingFreeUsage) {
      // Use our backend service for free tier users
      response = await fetch('/api/analyze-pitch-deck', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.substring(0, 15000),
          fileName,
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error analyzing with backend service');
      }
      
      // Increment free usage count
      await incrementFreeUsage();
      
    } else {
      // Use user's Claude API key
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey!,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20240620',
          max_tokens: 4000,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `${systemPrompt}\n\n${userPrompt}`
                }
              ]
            }
          ],
          temperature: 0.3
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Error calling Claude API');
      }
    }

    const data = await response.json();
    
    // Parse the response
    try {
      let content;
      
      if (usingFreeUsage) {
        // Our backend returns direct response
        content = data.result;
      } else {
        // Claude API response format
        content = data.content[0].text;
      }
      
      console.log('Claude response:', content);
      
      // Try to extract JSON from the response
      let jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                      content.match(/```\n([\s\S]*?)\n```/) ||
                      content.match(/({[\s\S]*})/);
                      
      let analysisResult;
      
      if (jsonMatch && jsonMatch[1]) {
        // Extract JSON from code block
        analysisResult = JSON.parse(jsonMatch[1]);
      } else {
        // Try to parse the entire response as JSON
        analysisResult = JSON.parse(content);
      }
      
      // Validate that we have the right structure
      if (!analysisResult || typeof analysisResult !== 'object') {
        throw new Error('Invalid response format from Claude');
      }
      
      // If this is not a pitch deck, return all zeros
      if (analysisResult.isPitchDeck === false) {
        return {
          isPitchDeck: false,
          message: "This doesn't appear to be a startup pitch deck",
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
          }
        };
      }
      
      // Ensure all parameters are between 0 and 1
      const parameters = analysisResult.parameters || {};
      Object.keys(parameters).forEach(key => {
        parameters[key] = Math.min(1, Math.max(0, Number(parameters[key]) || 0));
      });
      
      // Fill in any missing parameters with 0
      const allFactors: SVIFactors = {
        marketSize: parameters.marketSize || 0,
        barrierToEntry: parameters.barrierToEntry || 0,
        defensibility: parameters.defensibility || 0,
        insightFactor: parameters.insightFactor || 0,
        complexity: parameters.complexity || 0,
        riskFactor: parameters.riskFactor || 0,
        teamFactor: parameters.teamFactor || 0,
        marketTiming: parameters.marketTiming || 0,
        competitionIntensity: parameters.competitionIntensity || 0,
        capitalEfficiency: parameters.capitalEfficiency || 0,
        distributionAdvantage: parameters.distributionAdvantage || 0,
        businessModelViability: parameters.businessModelViability || 0
      };
      
      // Extract explanations if they exist
      const explanations = analysisResult.explanation || {};
      
      return {
        isPitchDeck: true,
        parameters: allFactors,
        explanations: explanations
      };
    } catch (parseError) {
      console.error('Error parsing Claude response:', parseError);
      console.log('Raw response content:', data);
      
      // Return default values if parsing fails
      return {
        isPitchDeck: false,
        message: "Failed to analyze the document properly",
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
        }
      };
    }
  } catch (error) {
    console.error('Error analyzing with Claude:', error);
    throw error;
  }
};
