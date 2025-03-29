
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthContext } from '@/contexts/AuthContext';
import { saveClaudeApiKey } from '@/services/claude/apiService';

interface ApiKeyFormProps {
  onApiKeySaved: () => void;
}

export const ApiKeyForm: React.FC<ApiKeyFormProps> = ({ onApiKeySaved }) => {
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);
  const { user } = useAuthContext();
  
  const handleSave = async () => {
    if (!apiKey.trim()) {
      return;
    }
    
    setSaving(true);
    
    try {
      const success = await saveClaudeApiKey(apiKey, user?.id);
      if (success) {
        onApiKeySaved();
      }
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
