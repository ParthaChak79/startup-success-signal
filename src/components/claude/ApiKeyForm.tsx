
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from 'sonner';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ApiKeyFormProps {
  onApiKeySaved: () => void;
}

export const ApiKeyForm: React.FC<ApiKeyFormProps> = ({ onApiKeySaved }) => {
  const { user } = useAuthContext();
  const [apiKey, setApiKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [storedKey, setStoredKey] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing API key in localStorage
    const localApiKey = localStorage.getItem('claude_api_key');
    setStoredKey(localApiKey);
    
    // If user is logged in, also check for API key in their profile
    const checkProfileApiKey = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('claude_api_key')
          .eq('id', user.id)
          .single();
          
        if (!error && data?.claude_api_key) {
          setStoredKey(data.claude_api_key);
          // Also update localStorage for consistency
          localStorage.setItem('claude_api_key', data.claude_api_key);
        }
      } catch (err) {
        console.error("Error fetching profile API key:", err);
      }
    };
    
    checkProfileApiKey();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Always save to localStorage
      localStorage.setItem('claude_api_key', apiKey);
      
      // If user is logged in, also save to their profile
      if (user) {
        await supabase
          .from('profiles')
          .update({ claude_api_key: apiKey })
          .eq('id', user.id);
      }
      
      setStoredKey(apiKey);
      toast.success("Claude API key saved successfully");
      onApiKeySaved();
    } catch (error) {
      console.error("Error saving API key:", error);
      toast.error("Error saving API key");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    localStorage.removeItem('claude_api_key');
    setStoredKey(null);
    setApiKey('');
    
    // If user is logged in, also remove API key from their profile
    if (user) {
      supabase
        .from('profiles')
        .update({ claude_api_key: null })
        .eq('id', user.id)
        .then(({ error }) => {
          if (error) console.error("Error removing API key from profile:", error);
        });
    }
  };

  if (storedKey) {
    return (
      <Card className="p-4 bg-muted/50">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">Claude API Key Found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            You've already provided a Claude API key.
          </p>
          <div className="flex justify-between">
            <Button variant="outline" onClick={handleReset}>
              Remove API Key
            </Button>
            <Button onClick={onApiKeySaved}>
              Continue
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h3 className="text-lg font-medium mb-3">Claude API Key Required</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Please enter your Claude API key to analyze pitch decks.
        You can get an API key from the <a href="https://console.anthropic.com/keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Anthropic Console</a>.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="password"
            placeholder="Enter your Claude API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            required
            autoComplete="off"
            className="font-mono"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Your API key is stored locally and never shared.
            {user && " It will also be saved to your profile for future use."}
          </p>
        </div>
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting || !apiKey.trim()}>
            {isSubmitting ? "Saving..." : "Save API Key"}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ApiKeyForm;
