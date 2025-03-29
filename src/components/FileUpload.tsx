
import React, { useState, useRef, useEffect } from 'react';
import { toast as sonnerToast } from "sonner";
import { SVIFactors } from '@/utils/sviCalculator';
import { analyzeWithClaude } from '@/utils/claudeService';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

// Import refactored components
import DropZone from './file-upload/DropZone';
import UsageStatus from './file-upload/UsageStatus';
import ApiKeyForm from './file-upload/ApiKeyForm';
import { validateFileContent } from './file-upload/FileValidator';
import { extractTextFromPDF, extractTextFromImage } from './file-upload/TextExtractor';
import { determineFileType, FileType, ProcessingStage } from '@/utils/fileUtils';

interface FileUploadProps {
  onFileProcessed: (parameters: SVIFactors, explanations?: Record<string, string>) => void;
  onFileSelected: (file: File) => void;
  onTextExtracted?: (text: string) => void;
  onError?: (error: string, details?: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileProcessed, 
  onFileSelected, 
  onTextExtracted,
  onError 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState<number>(0);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [needsApiKey, setNeedsApiKey] = useState(false);
  const [apiKeyProvided, setApiKeyProvided] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<FileType>('unknown');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState<ProcessingStage>('idle');
  const [ocrMode, setOcrMode] = useState(false);
  const { user } = useAuthContext();
  const [freeUsageRemaining, setFreeUsageRemaining] = useState<number>(0);

  useEffect(() => {
    const checkApiKeyAndUsage = async () => {
      if (!user) {
        const claudeKey = localStorage.getItem('claude_api_key');
        setApiKeyProvided(!!claudeKey);
        return;
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('claude_api_key, free_analyses_used')
        .eq('id', user.id)
        .single();
      
      if (!error && data) {
        setApiKeyProvided(!!data.claude_api_key);
        
        const FREE_USAGE_LIMIT = 3;
        const usedCount = data.free_analyses_used || 0;
        setFreeUsageRemaining(Math.max(0, FREE_USAGE_LIMIT - usedCount));
      }
    };
    
    checkApiKeyAndUsage();
  }, [user]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleClick = () => {
    // This is delegated to the DropZone component
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = async (file: File) => {
    setIsUploading(true);
    setAnalysisError(null);
    setErrorDetails(null);
    setProcessingProgress(0);
    
    const fileTypeDetected = determineFileType(file);
    setFileType(fileTypeDetected);
    setFileName(file.name);
    setFileSize(file.size);
    
    if (fileTypeDetected === 'unknown') {
      setIsUploading(false);
      setProcessingStage('error');
      const errorMsg = "Unsupported file format. Please upload a PDF, image, presentation, or document file.";
      setAnalysisError(errorMsg);
      sonnerToast.error(errorMsg);
      if (onError) onError(errorMsg);
      return;
    }
    
    const validationResult = await validateFileContent(file, fileTypeDetected, setOcrMode);
    if (!validationResult.valid) {
      setIsUploading(false);
      setProcessingStage('error');
      setAnalysisError(validationResult.reason || "Invalid file");
      setErrorDetails("Please check the file and try again with a different one.");
      sonnerToast.error(validationResult.reason || "Invalid file");
      if (onError) onError(validationResult.reason || "Invalid file");
      return;
    }
    
    onFileSelected(file);
    
    if (user && freeUsageRemaining <= 0 && !apiKeyProvided) {
      setNeedsApiKey(true);
      setSelectedFile(file);
      setIsUploading(false);
      sonnerToast.info("You've used all your free analyses", {
        description: "Please provide your Claude API key to continue"
      });
      return;
    }
    
    if (!user) {
      setNeedsApiKey(true);
      setSelectedFile(file);
      setIsUploading(false);
      sonnerToast.info("Please sign in to use this feature", {
        description: "Sign in for 3 free analyses or to use your Claude API key"
      });
      return;
    }
    
    handleFile(file);
  };

  const handleFile = async (file: File) => {
    setIsUploading(true);
    setAnalysisError(null);
    setErrorDetails(null);
    setProcessingProgress(5);

    try {
      let text = '';
      let ocrUsed = false;
      
      if (fileType === 'pdf') {
        const result = await extractTextFromPDF(file, setProcessingStage, setProcessingProgress);
        text = result.text;
        ocrUsed = result.isOcr;
      } else if (fileType === 'image') {
        text = await extractTextFromImage(file, setProcessingStage, setProcessingProgress);
        ocrUsed = true;
      } else if (fileType === 'presentation' || fileType === 'document') {
        sonnerToast.info(`Processing ${fileType} using OCR`, {
          description: "This may take a moment"
        });
        
        try {
          text = await extractTextFromImage(file, setProcessingStage, setProcessingProgress);
        } catch (err) {
          console.error('Direct OCR failed, treating as scanned content:', err);
          sonnerToast.error("Could not process this file format directly", {
            description: "Try uploading a PDF version if available"
          });
          throw new Error(`Could not process this ${fileType} file format. Try converting to PDF first.`);
        }
        ocrUsed = true;
      }
      
      if (!text || text.trim().length < 50) {
        console.warn("Limited text content extracted:", text ? text.length : 0, "characters");
        sonnerToast.warning("Limited text content detected", {
          description: "The analysis may not be accurate or complete"
        });
        
        if (text.trim().length === 0) {
          text = `[Limited text content extracted from ${fileType}]`;
        }
      }

      if (onTextExtracted) {
        onTextExtracted(text);
      }

      setProcessingProgress(60);
      setProcessingStage('analyzing');
      sonnerToast.info("Analyzing content with Claude...");
      console.info("Analyzing with Claude:", file.name);
      console.info("Text length extracted:", text.length);
      console.info("OCR used:", ocrUsed);
      
      const analysis = await analyzeWithClaude(text, file.name);
      setProcessingProgress(95);
      
      if (analysis.parameters) {
        onFileProcessed(
          analysis.parameters, 
          analysis.explanations as Record<string, string>
        );
        
        const allZeros = Object.values(analysis.parameters).every(val => val === 0);
        if (allZeros) {
          const errorMsg = "This doesn't appear to be a startup pitch deck. No relevant information was found.";
          setAnalysisError(errorMsg);
          sonnerToast.error(errorMsg);
          if (onError) onError(errorMsg);
        } else {
          setProcessingStage('complete');
          if (ocrUsed) {
            sonnerToast.success("Analysis complete using OCR technology!");
          } else {
            sonnerToast.success("Analysis complete!");
          }
          
          if (user && !apiKeyProvided && freeUsageRemaining > 0) {
            setFreeUsageRemaining(prev => Math.max(0, prev - 1));
          }
        }
      } else {
        const zeroFactors: SVIFactors = {
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
        
        onFileProcessed(zeroFactors);
        const errorMsg = "This doesn't appear to be a startup pitch deck";
        setAnalysisError(errorMsg);
        sonnerToast.error(errorMsg);
        if (onError) onError(errorMsg);
      }
      
      setProcessingProgress(100);
      setIsUploading(false);
      
    } catch (error: any) {
      console.error('Error processing file:', error);
      setIsUploading(false);
      setProcessingStage('error');
      
      if (error.message?.includes('API key') || error.message?.includes('free analyses')) {
        setNeedsApiKey(true);
        setSelectedFile(file);
        sonnerToast.error("API key required", {
          description: error.message
        });
        return;
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Error analyzing file content';
      setAnalysisError(errorMessage);
      setErrorDetails("Try uploading a different file or a different format if available.");
      sonnerToast.error(errorMessage);
      if (onError) onError(errorMessage);
      
      const zeroFactors: SVIFactors = {
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
      
      onFileProcessed(zeroFactors);
    }
  };

  const handleApiKeySaved = () => {
    setNeedsApiKey(false);
    setApiKeyProvided(true);
    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  // Render the component based on the state
  if (needsApiKey) {
    return (
      <ApiKeyForm 
        onApiKeySaved={handleApiKeySaved} 
        fileName={fileName} 
        fileType={fileType}
      />
    );
  }

  return (
    <div>
      <UsageStatus 
        user={user}
        freeUsageRemaining={freeUsageRemaining}
        hasClaudeApiKey={apiKeyProvided}
        analysisError={analysisError}
        errorDetails={errorDetails}
        setApiKeyProvided={setApiKeyProvided}
      />
      
      <DropZone 
        isDragging={isDragging}
        fileName={fileName}
        fileSize={fileSize}
        fileType={fileType}
        isUploading={isUploading}
        processingProgress={processingProgress}
        processingStage={processingStage}
        ocrMode={ocrMode}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onFileInputChange={handleFileChange}
        onClick={handleClick}
      />
    </div>
  );
};

export default FileUpload;
