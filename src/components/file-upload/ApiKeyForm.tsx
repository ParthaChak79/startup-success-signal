
import React from 'react';
import { Button } from "@/components/ui/button";
import { ApiKeyForm as OriginalApiKeyForm } from '@/utils/claudeService';

interface ApiKeyFormProps {
  onApiKeySaved: () => void;
  fileName?: string;
  fileType?: string;
}

const ApiKeyForm: React.FC<ApiKeyFormProps> = ({ onApiKeySaved, fileName, fileType }) => {
  return (
    <div>
      <OriginalApiKeyForm onApiKeySaved={onApiKeySaved} />
      {fileName && fileType && (
        <p className="text-sm text-gray-600 mt-4">
          Selected file: {fileName} ({fileType})
        </p>
      )}
    </div>
  );
};

export default ApiKeyForm;
