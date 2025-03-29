
// This file is kept for backward compatibility
// New code should import directly from @/services/claude
import { analyzeWithClaude, incrementFreeUsage, saveClaudeApiKey } from '@/services/claude/apiService';
import { ApiKeyForm } from '@/components/claude/ApiKeyForm';

// Re-export the functions and components
export { analyzeWithClaude, incrementFreeUsage, saveClaudeApiKey, ApiKeyForm };
