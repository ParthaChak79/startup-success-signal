
import React, { useState } from 'react';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

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
const incrementFreeUsage = async () => {
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
 * Form component for providing a Claude API key
 */
export const ApiKeyForm: React.FC<{
  onApiKeySaved: () => void;
}> = ({ onApiKeySaved }) => {
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);
  const { user } = useAuthContext();
  
  const handleSave = async () => {
    if (!apiKey.trim()) {
      toast.error("Please enter a valid API key");
      return;
    }
    
    setSaving(true);
    
    try {
      // Always save to localStorage for local usage
      localStorage.setItem('claude_api_key', apiKey);
      
      // If user is authenticated, also save to their profile
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({ claude_api_key: apiKey })
          .eq('id', user.id);
          
        if (error) throw error;
      }
      
      toast.success("API key saved successfully");
      onApiKeySaved();
    } catch (error) {
      console.error("Error saving API key:", error);
      toast.error("Failed to save API key");
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Claude API Key Required</h2>
      <p className="text-sm text-gray-500 mb-4">
        Please provide your Claude API key to analyze pitch decks. Your key allows secure access to Claude's AI for pitch deck analysis.
      </p>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="api-key">Claude API Key</Label>
          <Input
            id="api-key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your Claude API key"
            type="password"
            autoComplete="off"
          />
        </div>
        
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="w-full"
        >
          {saving ? 'Saving...' : 'Save API Key'}
        </Button>
        
        <p className="text-xs text-gray-500">
          Your API key is stored securely and only used for pitch deck analysis.
          <br />
          <a 
            href="https://console.anthropic.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Get a Claude API key here
          </a>
        </p>
      </div>
    </Card>
  );
};
