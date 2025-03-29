import React, { useState, useRef, useEffect } from 'react';
import { toast as sonnerToast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SVIFactors } from '@/utils/sviCalculator';
import * as pdfjsLib from 'pdfjs-dist';
import { analyzeWithClaude, ApiKeyForm } from '@/utils/claudeService';
import { File, Scan, FileImage, FileText, UploadIcon, AlertTriangle, PresentationIcon, Info } from 'lucide-react';
import Tesseract from 'tesseract.js';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

interface FileUploadProps {
  onFileProcessed: (parameters: SVIFactors, explanations?: Record<string, string>) => void;
  onFileSelected: (file: File) => void;
  onTextExtracted?: (text: string) => void;
  onError?: (error: string, details?: string) => void;
}

type FileType = 'pdf' | 'image' | 'document' | 'presentation' | 'unknown';
type ProcessingStage = 'idle' | 'validating' | 'extracting' | 'analyzing' | 'error' | 'complete';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
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
      mimeType.includes('presentation') ||
      ['ppt', 'pptx', 'key'].includes(fileExtension)
    ) {
      return 'presentation';
    } else if (
      mimeType.includes('word') || 
      mimeType.includes('opendocument') || 
      mimeType.includes('text/plain') ||
      ['doc', 'docx', 'odt', 'txt', 'rtf'].includes(fileExtension)
    ) {
      return 'document';
    }
    
    return 'unknown';
  };

  const validateFileContent = async (file: File): Promise<{ valid: boolean; reason?: string }> => {
    setProcessingStage('validating');
    setProcessingProgress(5);
    
    if (file.size === 0) {
      return { valid: false, reason: "The file is empty (0 bytes)" };
    }
    
    if (file.size > 20 * 1024 * 1024) {
      return { valid: false, reason: "File size exceeds the 20MB limit" };
    }
    
    try {
      const fileType = determineFileType(file);
      
      if (fileType === 'pdf') {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const dataView = new DataView(arrayBuffer);
          const header = String.fromCharCode(dataView.getUint8(0), dataView.getUint8(1), dataView.getUint8(2), dataView.getUint8(3));
          
          if (header !== '%PDF') {
            return { valid: false, reason: "This file doesn't appear to be a valid PDF. It might be corrupted or improperly exported." };
          }
          
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          
          if (pdf.numPages === 0) {
            return { valid: false, reason: "This PDF doesn't contain any pages" };
          }
          
          let hasContent = false;
          
          for (let i = 1; i <= Math.min(pdf.numPages, 3); i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            if (textContent.items.length > 0) {
              hasContent = true;
              break;
            }
          }
          
          if (!hasContent) {
            setOcrMode(true);
            sonnerToast.info("This PDF appears to contain scanned content", {
              description: "We'll try to extract text using OCR technology"
            });
            return { valid: true };
          }
          
          return { valid: true };
        } catch (error) {
          console.error('PDF validation error:', error);
          return { 
            valid: false, 
            reason: "This PDF appears to be corrupted or improperly exported. Please check if it was correctly saved or exported from the design tool." 
          };
        }
      } else if (fileType === 'image') {
        return new Promise(resolve => {
          const img = new Image();
          img.onload = () => {
            if (img.width === 0 || img.height === 0) {
              resolve({ valid: false, reason: "This image has invalid dimensions" });
            } else {
              setOcrMode(true);
              sonnerToast.info("This image requires OCR processing", {
                description: "We'll extract text using OCR technology"
              });
              resolve({ valid: true });
            }
          };
          img.onerror = () => {
            resolve({ valid: false, reason: "Failed to load this image. It may be corrupted." });
          };
          img.src = URL.createObjectURL(file);
        });
      } else if (fileType === 'presentation' || fileType === 'document') {
        setOcrMode(true);
        sonnerToast.info(`This ${fileType === 'presentation' ? 'presentation' : 'document'} will be processed using OCR`, {
          description: "For best results, consider converting to PDF first"
        });
        return { valid: true };
      }
      
      return { valid: true };
    } catch (error) {
      console.error('File validation error:', error);
      return { 
        valid: false, 
        reason: "Could not properly validate this file. It might be corrupted or in an unsupported format." 
      };
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
    
    const validationResult = await validateFileContent(file);
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

  const extractTextFromPDF = async (file: File): Promise<{ text: string; isOcr: boolean }> => {
    try {
      setProcessingStage('extracting');
      setProcessingProgress(15);
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      let textExtracted = false;
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        
        if (pageText.trim().length > 0) {
          textExtracted = true;
          fullText += pageText + ' ';
        }
        
        setProcessingProgress(15 + Math.floor((i / pdf.numPages) * 25));
      }
      
      if (textExtracted && fullText.trim().length > 50) {
        console.log("PDF text extracted successfully without OCR");
        return { text: fullText, isOcr: false };
      }
      
      console.log("PDF text extraction yielded insufficient text, falling back to OCR");
      sonnerToast.info("Using OCR to extract text from PDF", {
        description: "This might take a moment"
      });
      
      let ocrText = '';
      const scale = 1.5;
      
      for (let i = 1; i <= pdf.numPages; i++) {
        try {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale });
          
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          
          if (!context) continue;
          
          await page.render({
            canvasContext: context,
            viewport: viewport
          }).promise;
          
          const { data } = await Tesseract.recognize(
            canvas.toDataURL('image/png'),
            'eng',
            {
              logger: m => {
                if (m.status === 'recognizing text') {
                  const pageProgress = (i - 1) / pdf.numPages * 25;
                  setProcessingProgress(40 + pageProgress + (m.progress * 25 / pdf.numPages));
                }
              }
            }
          );
          
          ocrText += data.text + ' ';
          setProcessingProgress(40 + (i / pdf.numPages * 25));
        } catch (err) {
          console.warn(`OCR failed for page ${i}:`, err);
          continue;
        }
      }
      
      return { text: ocrText, isOcr: true };
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error('Error processing PDF file: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const extractTextFromImage = async (file: File): Promise<string> => {
    try {
      setProcessingStage('extracting');
      setProcessingProgress(20);
      sonnerToast.info("Processing image with OCR", {
        description: "This may take a moment"
      });
      
      const preprocessImage = async (imageFile: File): Promise<string> => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
              resolve(URL.createObjectURL(imageFile));
              return;
            }
            
            canvas.width = img.width;
            canvas.height = img.height;
            
            ctx.drawImage(img, 0, 0);
            
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            for (let i = 0; i < data.length; i += 4) {
              const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
              data[i] = avg;
              data[i + 1] = avg;
              data[i + 2] = avg;
            }
            
            ctx.putImageData(imageData, 0, 0);
            
            ctx.globalCompositeOperation = 'multiply';
            ctx.fillStyle = 'white';
            ctx.globalAlpha = 0.1;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 1.0;
            
            const dataUrl = canvas.toDataURL('image/png');
            resolve(dataUrl);
          };
          
          img.onerror = () => {
            resolve(URL.createObjectURL(imageFile));
          };
          
          img.src = URL.createObjectURL(imageFile);
        });
      };
      
      const processedImageUrl = await preprocessImage(file);
      
      const { data } = await Tesseract.recognize(
        processedImageUrl,
        'eng',
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              setProcessingProgress(25 + Math.floor(m.progress * 25));
            }
          }
        }
      );
      
      if (data.text.trim().length < 50) {
        sonnerToast.warning("Limited text detected in the image", {
          description: "The analysis may not be accurate"
        });
      }
      
      return data.text;
    } catch (error) {
      console.error('Error performing OCR on image:', error);
      throw new Error('Error processing image file: ' + (error instanceof Error ? error.message : String(error)));
    }
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
        const result = await extractTextFromPDF(file);
        text = result.text;
        ocrUsed = result.isOcr;
      } else if (fileType === 'image') {
        text = await extractTextFromImage(file);
        ocrUsed = true;
      } else if (fileType === 'presentation' || fileType === 'document') {
        sonnerToast.info(`Processing ${fileType} using OCR`, {
          description: "This may take a moment"
        });
        
        try {
          text = await extractTextFromImage(file);
        } catch (err) {
          console.error('Direct OCR failed, treating as scanned content:', err);
          sonnerToast.error("Could not process this file format directly", {
            description: "Try uploading a PDF version if available"
          });
          throw new Error(`Could not process this ${fileType} file format. Try converting to PDF first.`);
        }
        ocrUsed = true;
      }
      
      if (!text || text.trim().length < 100) {
        throw new Error(`Could not extract sufficient text from the ${fileType}. The file may contain very little text or is primarily images.`);
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

  const getFileIcon = () => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="h-16 w-16 text-primary" />;
      case 'image':
        return <FileImage className="h-16 w-16 text-primary" />;
      case 'presentation':
        return <PresentationIcon className="h-16 w-16 text-primary" />;
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
        return 'Image File';
      case 'presentation':
        return 'Presentation';
      case 'document':
        return 'Document';
      default:
        return 'File';
    }
  };

  const getProcessingStageText = () => {
    switch (processingStage) {
      case 'validating':
        return 'Validating file...';
      case 'extracting':
        return ocrMode ? 'Performing OCR on file...' : 'Extracting text...';
      case 'analyzing':
        return 'Analyzing content with Claude...';
      default:
        return 'Processing...';
    }
  };

  if (needsApiKey) {
    return (
      <Card className="animate-fade-in p-8 mx-auto max-w-2xl">
        <h2 className="text-lg font-semibold mb-4">Claude API Key Required</h2>
        <ApiKeyForm onApiKeySaved={handleApiKeySaved} />
        <p className="text-sm text-gray-600 mt-4">
          Selected file: {fileName} ({getFileTypeLabel()})
        </p>
      </Card>
    );
  }

  return (
    <div>
      {!user && (
        <Alert variant="info" className="mb-4">
          <Info className="h-4 w-4" />
          <AlertTitle>Sign in to analyze pitch decks</AlertTitle>
          <AlertDescription>
            Sign in to get 3 free pitch deck analyses or to use your own Claude API key.
          </AlertDescription>
        </Alert>
      )}
      
      {user && freeUsageRemaining > 0 && !apiKeyProvided && (
        <Alert variant="default" className="mb-4 bg-green-50 border-green-200">
          <Info className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Free analyses available</AlertTitle>
          <AlertDescription className="text-green-700">
            You have {freeUsageRemaining} free {freeUsageRemaining === 1 ? 'analysis' : 'analyses'} remaining. After that, you'll need to provide your Claude API key.
          </AlertDescription>
        </Alert>
      )}
      
      {user && freeUsageRemaining === 0 && !apiKeyProvided && (
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
      
      <div 
        className={`flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg transition-all duration-200 ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 bg-gray-50'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <div className="mb-4 text-center">
          {fileName ? (
            <>
              {getFileIcon()}
              <p className="text-xs text-muted-foreground mt-1">
                {(fileSize / 1024 / 1024).toFixed(1)} MB
              </p>
            </>
          ) : (
            <div className="flex justify-center space-x-2">
              <FileText className={`h-12 w-12 transition-colors duration-200 ${isDragging ? 'text-primary' : 'text-gray-400'}`} />
              <FileImage className={`h-12 w-12 transition-colors duration-200 ${isDragging ? 'text-primary' : 'text-gray-400'}`} />
              <PresentationIcon className={`h-12 w-12 transition-colors duration-200 ${isDragging ? 'text-primary' : 'text-gray-400'}`} />
            </div>
          )}
          
          <h3 className="text-lg font-medium text-gray-900 mt-4">
            {fileName ? fileName : 'Upload your pitch deck'}
          </h3>
          
          <p className="mt-1 text-sm text-gray-500">
            Drag and drop or click to upload (PDF, Presentations, Images, Documents)
          </p>
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
              <span>{getProcessingStageText()}</span>
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
        
        {ocrMode && fileName && !isUploading && (
          <div className="mt-4 p-2 bg-blue-50 rounded-md flex items-center text-sm text-blue-800">
            <Info className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>OCR was used to extract text from this file.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
