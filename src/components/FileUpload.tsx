
import React, { useState, useRef, useEffect } from 'react';
import { toast as sonnerToast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SVIFactors } from '@/utils/sviCalculator';
import * as pdfjsLib from 'pdfjs-dist';
import { analyzeWithOpenAI, ApiKeyForm } from '@/utils/openaiService';
import { File, Scan, FileImage, FileText, UploadIcon, AlertTriangle } from 'lucide-react';
import Tesseract from 'tesseract.js';

// Use the same worker configuration as in PdfViewer
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

interface FileUploadProps {
  onFileProcessed: (parameters: SVIFactors, explanations?: Record<string, string>) => void;
  onFileSelected: (file: File) => void;
}

type FileType = 'pdf' | 'image' | 'document' | 'unknown';

const FileUpload: React.FC<FileUploadProps> = ({ onFileProcessed, onFileSelected }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [needsApiKey, setNeedsApiKey] = useState(false);
  const [apiKeyProvided, setApiKeyProvided] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<FileType>('unknown');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState('');
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

  const determineFileType = (file: File): FileType => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    const mimeType = file.type.toLowerCase();
    
    if (mimeType.includes('pdf') || fileExtension === 'pdf') {
      return 'pdf';
    } else if (
      mimeType.includes('image') || 
      ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff', 'tif'].includes(fileExtension)
    ) {
      return 'image';
    } else if (
      mimeType.includes('word') || 
      mimeType.includes('opendocument') || 
      mimeType.includes('text/plain') ||
      mimeType.includes('presentation') ||
      ['doc', 'docx', 'ppt', 'pptx', 'odt', 'txt', 'rtf'].includes(fileExtension)
    ) {
      return 'document';
    }
    
    return 'unknown';
  };

  const processSelectedFile = (file: File) => {
    const fileTypeDetected = determineFileType(file);
    setFileType(fileTypeDetected);
    
    if (fileTypeDetected === 'unknown') {
      sonnerToast.error("Unsupported file format", {
        description: "Please upload a PDF, image, or document file."
      });
      return;
    }

    setFileName(file.name);
    onFileSelected(file);
    
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
      setProcessingStep('Extracting text from PDF');
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + ' ';
        
        // Update progress for each page processed
        setProcessingProgress(20 + Math.floor((i / pdf.numPages) * 30));
      }
      
      return fullText;
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error('Error processing PDF file');
    }
  };

  const extractTextFromImage = async (file: File): Promise<string> => {
    try {
      setProcessingStep('Performing OCR on image');
      const { data } = await Tesseract.recognize(
        file,
        'eng',
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              setProcessingProgress(20 + Math.floor(m.progress * 30));
            }
          }
        }
      );
      
      return data.text;
    } catch (error) {
      console.error('Error performing OCR on image:', error);
      throw new Error('Error processing image file');
    }
  };

  const handleFile = async (file: File) => {
    setIsUploading(true);
    setAnalysisError(null);
    setProcessingProgress(10);

    try {
      // Extract text based on file type
      let text = '';
      
      if (fileType === 'pdf') {
        text = await extractTextFromPDF(file);
      } else if (fileType === 'image') {
        text = await extractTextFromImage(file);
      } else if (fileType === 'document') {
        // For simplicity, we're treating documents as images for OCR
        // In a production app, you'd want to use specific document parsing libraries
        sonnerToast.info("Processing document using OCR", {
          description: "This may take a moment"
        });
        text = await extractTextFromImage(file);
      }
      
      if (!text || text.trim().length === 0) {
        throw new Error('Could not extract text from file or file is empty');
      }

      setProcessingProgress(50);
      setProcessingStep('Analyzing content with AI');
      sonnerToast.info("Analyzing pitch deck with AI...");
      console.info("Analyzing with OpenAI:", file.name);
      console.info("Text length:", text.length);
      
      // Analyze using OpenAI
      const analysis = await analyzeWithOpenAI(text, file.name);
      setProcessingProgress(90);
      
      if (analysis.parameters) {
        // Pass the parameters to the parent component
        onFileProcessed(
          analysis.parameters, 
          analysis.explanations as Record<string, string> // Pass explanations if available
        );
        
        // Check if all parameters are 0 (not a pitch deck)
        const allZeros = Object.values(analysis.parameters).every(val => val === 0);
        if (allZeros) {
          sonnerToast.error("This doesn't appear to be a pitch deck");
        } else {
          sonnerToast.success("Analysis complete!");
        }
      } else {
        // If no proper parameters were returned, assume it's not a pitch deck
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
        sonnerToast.error("This doesn't appear to be a pitch deck");
      }
      
      setProcessingProgress(100);
      setIsUploading(false);
      
    } catch (error) {
      console.error('Error processing file:', error);
      setIsUploading(false);
      
      const errorMessage = error instanceof Error ? error.message : 'Error analyzing file content';
      sonnerToast.error(errorMessage);
      
      // If analysis fails, return all zeros to indicate it's not a valid pitch deck
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

  const getFileIcon = () => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="h-16 w-16 text-primary" />;
      case 'image':
        return <FileImage className="h-16 w-16 text-primary" />;
      case 'document':
        return <File className="h-16 w-16 text-primary" />;
      default:
        return <UploadIcon className="h-16 w-16 text-gray-400" />;
    }
  };

  const getFileTypeLabel = () => {
    switch (fileType) {
      case 'pdf':
        return 'PDF Document';
      case 'image':
        return 'Image';
      case 'document':
        return 'Document';
      default:
        return 'File';
    }
  };

  if (needsApiKey) {
    return (
      <Card className="animate-fade-in p-8 mx-auto max-w-2xl">
        <h2 className="text-lg font-semibold mb-4">API Key Required</h2>
        <ApiKeyForm onApiKeySaved={handleApiKeySaved} />
        <p className="text-sm text-gray-600 mt-4">
          Selected file: {fileName} ({getFileTypeLabel()})
        </p>
      </Card>
    );
  }

  return (
    <div>
      {!apiKeyProvided && (
        <div className="mb-4">
          <ApiKeyForm onApiKeySaved={() => setApiKeyProvided(true)} />
        </div>
      )}
      <div 
        className={`flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg transition-all duration-200 ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 bg-gray-50'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <div className="mb-4 text-center">
          {fileName ? (
            getFileIcon()
          ) : (
            <div className="flex justify-center space-x-2">
              <FileText className={`h-12 w-12 transition-colors duration-200 ${isDragging ? 'text-primary' : 'text-gray-400'}`} />
              <FileImage className={`h-12 w-12 transition-colors duration-200 ${isDragging ? 'text-primary' : 'text-gray-400'}`} />
              <Scan className={`h-12 w-12 transition-colors duration-200 ${isDragging ? 'text-primary' : 'text-gray-400'}`} />
            </div>
          )}
          
          <h3 className="text-lg font-medium text-gray-900 mt-4">
            {fileName ? fileName : 'Upload your pitch deck'}
          </h3>
          
          <p className="mt-1 text-sm text-gray-500">
            Drag and drop or click to upload (PDF, Images, Documents)
          </p>
          
          {analysisError && (
            <p className="mt-2 text-sm text-red-500">
              {analysisError}
            </p>
          )}
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.ppt,.pptx,.txt,.rtf,.gif,.bmp,.webp,.tiff,.tif"
          onChange={handleFileChange}
        />
        
        {isUploading && (
          <div className="w-full mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{processingStep}</span>
              <span>{processingProgress}%</span>
            </div>
            <Progress value={processingProgress} className="h-2" />
          </div>
        )}
        
        <Button 
          variant="outline" 
          className="mt-4"
          disabled={isUploading}
        >
          {isUploading ? 'Processing...' : 'Select file'}
        </Button>
        
        {fileType === 'image' && fileName && (
          <div className="mt-4 p-2 bg-amber-50 rounded-md flex items-center text-sm text-amber-800">
            <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>OCR technology works best with clear, high-resolution images</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
