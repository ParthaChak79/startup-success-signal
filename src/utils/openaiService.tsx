
import React, { useState } from 'react';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    localStorage.setItem('openai_api_key', values.apiKey);
    toast.success("API key saved successfully");
    onApiKeySaved();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="apiKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>OpenAI API Key</FormLabel>
              <FormControl>
                <Input
                  placeholder="sk-..."
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
          Your API key is stored locally and never sent to our servers.
        </p>
      </form>
    </Form>
  );
};

export const analyzeWithOpenAI = async (text: string, fileName: string): Promise<{
  isPitchDeck: boolean;
  message?: string;
  parameters: SVIFactors;
}> => {
  const apiKey = localStorage.getItem('openai_api_key');
  
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  try {
    console.log('Analyzing with OpenAI:', fileName);
    console.log('Text length:', text.length);
    
    // The prompt needs to be clear and specific about what we're looking for
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

    // Make the API call to OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API Error:', data);
      throw new Error(data.error?.message || 'Error calling OpenAI API');
    }

    // Parse the response
    try {
      const content = data.choices[0].message.content;
      console.log('OpenAI response:', content);
      
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
        throw new Error('Invalid response format from OpenAI');
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
      
      return {
        isPitchDeck: true,
        parameters: allFactors
      };
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      console.log('Raw response content:', data.choices[0].message.content);
      
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
    console.error('Error analyzing with OpenAI:', error);
    throw error;
  }
};
