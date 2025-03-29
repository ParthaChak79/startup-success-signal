
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, AlertTriangle } from 'lucide-react';
import ApiKeyForm from './ApiKeyForm';

interface UsageStatusProps {
  user: any | null;
  freeUsageRemaining: number | null;
  hasClaudeApiKey: boolean;
  analysisError: string | null;
  errorDetails: string | null;
  setApiKeyProvided: (value: boolean) => void;
}

const UsageStatus: React.FC<UsageStatusProps> = ({
  user,
  freeUsageRemaining,
  hasClaudeApiKey,
  analysisError,
  errorDetails,
  setApiKeyProvided
}) => {
  return (
    <>
      {!user && (
        <Alert variant="default" className="mb-4">
          <Info className="h-4 w-4" />
          <AlertTitle>Sign in to analyze pitch decks</AlertTitle>
          <AlertDescription>
            Sign in to get 3 free pitch deck analyses or to use your own Claude API key.
          </AlertDescription>
        </Alert>
      )}
      
      {user && freeUsageRemaining !== null && freeUsageRemaining > 0 && !hasClaudeApiKey && (
        <Alert variant="default" className="mb-4 bg-green-50 border-green-200">
          <Info className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Free analyses available</AlertTitle>
          <AlertDescription className="text-green-700">
            You have {freeUsageRemaining} free {freeUsageRemaining === 1 ? 'analysis' : 'analyses'} remaining. After that, you'll need to provide your Claude API key.
          </AlertDescription>
        </Alert>
      )}
      
      {user && freeUsageRemaining === 0 && !hasClaudeApiKey && (
        <div className="mb-4">
          <ApiKeyForm onApiKeySaved={() => setApiKeyProvided(true)} />
        </div>
      )}
      
      {analysisError && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{analysisError}</AlertTitle>
          {errorDetails && (
            <AlertDescription>{errorDetails}</AlertDescription>
          )}
        </Alert>
      )}
    </>
  );
};

export default UsageStatus;
