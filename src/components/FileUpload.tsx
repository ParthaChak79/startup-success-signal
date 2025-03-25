
import React, { useState, useRef, useEffect } from 'react';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { type SVIFactors } from '@/utils/sviCalculator';
import * as pdfjsLib from 'pdfjs-dist';
import { analyzeWithOpenAI, ApiKeyForm } from '@/utils/openaiService';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

interface FileUploadProps {
  onFileProcessed: (parameters: SVIFactors) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileProcessed }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [needsApiKey, setNeedsApiKey] = useState(false);
  const [apiKeyProvided, setApiKeyProvided] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if API key exists on component mount
  useEffect(() => {
    const apiKey = localStorage.getItem('openai_api_key');
    setApiKeyProvided(!!apiKey);
  }, []);

  // Handle drag events
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
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = (file: File) => {
    // For simplicity, we'll only support PDF files
    const validTypes = ['application/pdf'];
    
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a PDF file");
      return;
    }

    setFileName(file.name);
    
    // Check if API key is provided
    if (!localStorage.getItem('openai_api_key')) {
      setNeedsApiKey(true);
      setSelectedFile(file);
      return;
    }
    
    handleFile(file);
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + ' ';
      }
      
      return fullText;
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error('Error processing PDF file');
    }
  };

  const handleFile = async (file: File) => {
    setIsUploading(true);
    setAnalysisError(null);

    try {
      // Extract text from PDF
      const text = await extractTextFromPDF(file);
      
      if (!text) {
        throw new Error('Could not extract text from file');
      }

      toast.info("Analyzing pitch deck with AI...");
      
      // Analyze using OpenAI
      const analysis = await analyzeWithOpenAI(text, file.name);
      
      if (!analysis.isPitchDeck) {
        setAnalysisError(analysis.message || "This doesn't appear to be a pitch deck. Please upload a startup pitch deck.");
        setIsUploading(false);
        toast.error("This doesn't appear to be a pitch deck");
        onFileProcessed(analysis.parameters); // Still pass the zero values
        return;
      }

      setIsUploading(false);
      toast.success("Pitch deck analyzed successfully!");
      onFileProcessed(analysis.parameters);
      
    } catch (error) {
      console.error('Error processing file:', error);
      setIsUploading(false);
      
      const errorMessage = error instanceof Error ? error.message : 'Error analyzing file content';
      toast.error(errorMessage);
      
      // Return all zeros if analysis fails
      const zeroParameters: SVIFactors = {
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
      
      onFileProcessed(zeroParameters);
      toast.info("Using zero scores due to processing error");
    }
  };

  const handleApiKeySaved = () => {
    setNeedsApiKey(false);
    setApiKeyProvided(true);
    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  if (needsApiKey) {
    return (
      <Card className="p-8 mx-auto max-w-2xl">
        <h2 className="text-lg font-semibold mb-4">API Key Required</h2>
        <ApiKeyForm onApiKeySaved={handleApiKeySaved} />
        <p className="text-sm text-muted-foreground mt-4">
          Selected file: {fileName}
        </p>
      </Card>
    );
  }

  return (
    <Card className={`p-8 mx-auto max-w-2xl ${isDragging ? 'border-primary' : ''}`}>
      {!apiKeyProvided && (
        <div className="mb-4">
          <ApiKeyForm onApiKeySaved={() => setApiKeyProvided(true)} />
        </div>
      )}
      <div 
        className={`flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg transition-all duration-200 ${isDragging ? 'border-primary bg-primary/5' : 'border-border bg-background/5'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <div className="mb-4 text-center">
          <svg 
            className={`mx-auto h-16 w-16 mb-4 transition-colors duration-200 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          
          <h3 className="text-lg font-medium">
            {fileName ? fileName : 'Upload your pitch deck'}
          </h3>
          
          <p className="mt-1 text-sm text-muted-foreground">
            Drag and drop or click to upload your pitch deck (PDF)
          </p>
          
          {analysisError && (
            <p className="mt-2 text-sm text-destructive">
              {analysisError}
            </p>
          )}
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf"
          onChange={handleFileChange}
        />
        
        <Button 
          variant="outline" 
          className="mt-4"
          disabled={isUploading}
        >
          {isUploading ? 'Analyzing...' : 'Select file'}
        </Button>
      </div>
    </Card>
  );
};

export default FileUpload;
