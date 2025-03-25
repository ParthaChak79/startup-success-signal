
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
    // Simulate an API call for now
    console.log('Analyzing with OpenAI:', fileName);
    console.log('Text length:', text.length);
    
    // Wait for a simulated analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulated response - making sure to use the correct property names from SVIFactors
    return {
      isPitchDeck: true,
      parameters: {
        marketSize: 0.65,
        barrierToEntry: 0.72,
        defensibility: 0.58,
        insightFactor: 0.80,
        complexity: 0.45,
        riskFactor: 0.55,
        teamFactor: 0.62,
        marketTiming: 0.70,
        competitionIntensity: 0.55,
        capitalEfficiency: 0.68,
        distributionAdvantage: 0.75,
        businessModelViability: 0.60
      }
    };
    
    // In the real implementation, you would make an API call to OpenAI:
    /*
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a startup pitch deck analyzer. Extract key information about market size, business model, etc.'
          },
          {
            role: 'user',
            content: `Analyze this pitch deck: ${text.substring(0, 8000)}... (from ${fileName})`
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Error calling OpenAI API');
    }

    // Parse the OpenAI response and extract SVI parameters
    const analysis = data.choices[0].message.content;
    
    // Check if it's actually a pitch deck
    if (!isPitchDeck(analysis)) {
      return {
        isPitchDeck: false,
        message: "This doesn't appear to be a startup pitch deck",
        parameters: getDefaultParameters() // Return default parameters anyway
      };
    }
    
    // Extract and return the parameters from the analysis
    return {
      isPitchDeck: true,
      parameters: extractParametersFromAnalysis(analysis)
    };
    */
  } catch (error) {
    console.error('Error analyzing with OpenAI:', error);
    throw error;
  }
};
