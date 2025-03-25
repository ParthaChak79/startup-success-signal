
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

// Function to determine if a document is actually a pitch deck
const isPitchDeck = (text: string): boolean => {
  const pitchDeckTerms = [
    'pitch', 'startup', 'funding', 'investor', 'investment', 'venture',
    'business model', 'market size', 'opportunity', 'team', 'traction',
    'revenue', 'growth', 'valuation', 'round', 'competitors', 'solution',
    'problem', 'product', 'service', 'customer', 'acquisition', 'runway'
  ];
  
  // Convert to lowercase for case-insensitive matching
  const lowerText = text.toLowerCase();
  
  // Count how many pitch deck terms are found in the text
  const foundTermsCount = pitchDeckTerms.filter(term => lowerText.includes(term)).length;
  
  // If at least 5 terms are found, consider it a pitch deck
  return foundTermsCount >= 5;
};

// Function to analyze text and extract factors
const analyzeTextForFactors = (text: string): SVIFactors => {
  const lowerText = text.toLowerCase();
  const factors: SVIFactors = {
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
  };
  
  // Market Size analysis
  if (
    lowerText.includes('market size') || 
    lowerText.includes('tam') || 
    lowerText.includes('total addressable market') ||
    lowerText.includes('market opportunity')
  ) {
    // Look for billion/million dollar market references
    if (
      lowerText.includes('billion') || 
      lowerText.match(/\$\s*\d+\s*b/) ||
      lowerText.match(/\d+\s*billion/) ||
      lowerText.includes('massive market') ||
      lowerText.includes('huge market')
    ) {
      factors.marketSize = 0.8;
    } else if (
      lowerText.includes('million') || 
      lowerText.match(/\$\s*\d+\s*m/) ||
      lowerText.match(/\d+\s*million/) ||
      lowerText.includes('large market')
    ) {
      factors.marketSize = 0.6;
    } else {
      factors.marketSize = 0.4; // Some mention of market but size not clear
    }
  }
  
  // Barrier to Entry analysis
  if (
    lowerText.includes('barrier') || 
    lowerText.includes('moat') || 
    lowerText.includes('intellectual property') ||
    lowerText.includes('patent') ||
    lowerText.includes('exclusive')
  ) {
    if (
      lowerText.includes('patent') || 
      lowerText.includes('proprietary technology') ||
      lowerText.includes('exclusive partnership')
    ) {
      factors.barrierToEntry = 0.8;
    } else if (
      lowerText.includes('difficult to replicate') ||
      lowerText.includes('specialized expertise')
    ) {
      factors.barrierToEntry = 0.6;
    } else {
      factors.barrierToEntry = 0.4;
    }
  }
  
  // Defensibility
  if (
    lowerText.includes('defensib') || 
    lowerText.includes('protect') || 
    lowerText.includes('competitor') ||
    lowerText.includes('advantage') ||
    lowerText.includes('network effect')
  ) {
    if (
      lowerText.includes('network effect') || 
      lowerText.includes('strong defensibility') ||
      lowerText.includes('patent protected')
    ) {
      factors.defensibility = 0.8;
    } else if (
      lowerText.includes('competitive advantage') ||
      lowerText.includes('unique technology')
    ) {
      factors.defensibility = 0.6;
    } else {
      factors.defensibility = 0.4;
    }
  }
  
  // Insight Factor
  if (
    lowerText.includes('unique') || 
    lowerText.includes('innovative') || 
    lowerText.includes('disrupt') ||
    lowerText.includes('revolution') ||
    lowerText.includes('novel approach')
  ) {
    if (
      lowerText.includes('revolutionary') || 
      lowerText.includes('breakthrough') ||
      lowerText.includes('game changer')
    ) {
      factors.insightFactor = 0.9;
    } else if (
      lowerText.includes('innovative') ||
      lowerText.includes('disruptive')
    ) {
      factors.insightFactor = 0.7;
    } else {
      factors.insightFactor = 0.5;
    }
  }
  
  // Complexity
  if (
    lowerText.includes('complex') || 
    lowerText.includes('technical') || 
    lowerText.includes('sophisticated') ||
    lowerText.includes('simple') ||
    lowerText.includes('easy to use')
  ) {
    if (
      lowerText.includes('highly complex') || 
      lowerText.includes('sophisticated technology')
    ) {
      factors.complexity = 0.8;
    } else if (
      lowerText.includes('moderately complex') ||
      lowerText.includes('technical solution')
    ) {
      factors.complexity = 0.6;
    } else if (
      lowerText.includes('simple') ||
      lowerText.includes('easy to use')
    ) {
      factors.complexity = 0.3;
    } else {
      factors.complexity = 0.5;
    }
  }
  
  // Risk Factor
  if (
    lowerText.includes('risk') || 
    lowerText.includes('challenge') || 
    lowerText.includes('obstacle') ||
    lowerText.includes('uncertain')
  ) {
    if (
      lowerText.includes('high risk') || 
      lowerText.includes('significant challenges')
    ) {
      factors.riskFactor = 0.8;
    } else if (
      lowerText.includes('moderate risk') ||
      lowerText.includes('manageable challenges')
    ) {
      factors.riskFactor = 0.6;
    } else if (
      lowerText.includes('low risk') ||
      lowerText.includes('minimal risk')
    ) {
      factors.riskFactor = 0.3;
    } else {
      factors.riskFactor = 0.5;
    }
  }
  
  // Team Factor
  if (
    lowerText.includes('team') || 
    lowerText.includes('founder') || 
    lowerText.includes('experience') ||
    lowerText.includes('expertise') ||
    lowerText.includes('background')
  ) {
    if (
      lowerText.includes('experienced founder') || 
      lowerText.includes('serial entrepreneur') ||
      lowerText.includes('successful exit')
    ) {
      factors.teamFactor = 0.9;
    } else if (
      lowerText.includes('experienced team') ||
      lowerText.includes('industry expertise')
    ) {
      factors.teamFactor = 0.7;
    } else if (
      lowerText.includes('passionate team') ||
      lowerText.includes('dedicated')
    ) {
      factors.teamFactor = 0.5;
    } else {
      factors.teamFactor = 0.4;
    }
  }
  
  // Market Timing
  if (
    lowerText.includes('timing') || 
    lowerText.includes('trend') || 
    lowerText.includes('moment') ||
    lowerText.includes('opportunity now')
  ) {
    if (
      lowerText.includes('perfect timing') || 
      lowerText.includes('growing trend')
    ) {
      factors.marketTiming = 0.8;
    } else if (
      lowerText.includes('good timing') ||
      lowerText.includes('positive trend')
    ) {
      factors.marketTiming = 0.6;
    } else {
      factors.marketTiming = 0.5;
    }
  }
  
  // Competition Intensity
  if (
    lowerText.includes('competition') || 
    lowerText.includes('competitor') || 
    lowerText.includes('market player') ||
    lowerText.includes('alternative')
  ) {
    if (
      lowerText.includes('no direct competitor') || 
      lowerText.includes('limited competition')
    ) {
      factors.competitionIntensity = 0.3;
    } else if (
      lowerText.includes('moderate competition') ||
      lowerText.includes('few competitors')
    ) {
      factors.competitionIntensity = 0.5;
    } else if (
      lowerText.includes('highly competitive') ||
      lowerText.includes('many competitors')
    ) {
      factors.competitionIntensity = 0.8;
    } else {
      factors.competitionIntensity = 0.6;
    }
  }
  
  // Capital Efficiency
  if (
    lowerText.includes('capital') || 
    lowerText.includes('funding') || 
    lowerText.includes('revenue') ||
    lowerText.includes('profit') ||
    lowerText.includes('cash flow')
  ) {
    if (
      lowerText.includes('profitable') || 
      lowerText.includes('positive cash flow') ||
      lowerText.includes('bootstrap')
    ) {
      factors.capitalEfficiency = 0.8;
    } else if (
      lowerText.includes('clear path to revenue') ||
      lowerText.includes('capital efficient')
    ) {
      factors.capitalEfficiency = 0.6;
    } else if (
      lowerText.includes('pre-revenue') ||
      lowerText.includes('early stage')
    ) {
      factors.capitalEfficiency = 0.4;
    } else {
      factors.capitalEfficiency = 0.5;
    }
  }
  
  // Distribution Advantage
  if (
    lowerText.includes('distribution') || 
    lowerText.includes('channel') || 
    lowerText.includes('customer acquisition') ||
    lowerText.includes('marketing') ||
    lowerText.includes('go-to-market')
  ) {
    if (
      lowerText.includes('existing channels') || 
      lowerText.includes('viral growth')
    ) {
      factors.distributionAdvantage = 0.8;
    } else if (
      lowerText.includes('established partnerships') ||
      lowerText.includes('strong go-to-market')
    ) {
      factors.distributionAdvantage = 0.6;
    } else {
      factors.distributionAdvantage = 0.4;
    }
  }
  
  // Business Model Viability
  if (
    lowerText.includes('business model') || 
    lowerText.includes('revenue model') || 
    lowerText.includes('monetization') ||
    lowerText.includes('pricing')
  ) {
    if (
      lowerText.includes('proven business model') || 
      lowerText.includes('recurring revenue')
    ) {
      factors.businessModelViability = 0.8;
    } else if (
      lowerText.includes('clear business model') ||
      lowerText.includes('proven monetization')
    ) {
      factors.businessModelViability = 0.6;
    } else {
      factors.businessModelViability = 0.4;
    }
  }
  
  return factors;
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
    
    // Check if it's actually a pitch deck
    if (!isPitchDeck(text)) {
      // If it's not a pitch deck, return all zeros
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
    
    // Analyze the text to extract SVI factors
    const parameters = analyzeTextForFactors(text);
    
    return {
      isPitchDeck: true,
      parameters
    };
    
    // In the future, once you're ready to implement the actual OpenAI API call:
    /*
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
