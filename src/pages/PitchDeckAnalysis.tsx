import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { toast as sonnerToast } from "sonner";
import { ArrowLeft, Eye, EyeOff, AlertTriangle, Info, FileWarning } from 'lucide-react';
import { calculateSVI, type SVIFactors, getFactorText, getLabelForFactor, getTooltipForFactor } from '@/utils/sviCalculator';
import ResultCard from '@/components/ResultCard';
import PdfViewer from '@/components/PdfViewer';
import FileUpload from '@/components/FileUpload';
import InfoTooltip from '@/components/InfoTooltip';
import { supabase } from '@/integrations/supabase/client';
import StartupForm from '@/components/StartupForm';
import { useAuthContext } from '@/contexts/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const PitchDeckAnalysis = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuthContext();
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [factors, setFactors] = useState<SVIFactors | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [showExtractedText, setShowExtractedText] = useState(false);
  const [explanations, setExplanations] = useState<Record<string, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showStartupForm, setShowStartupForm] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isOcrMode, setIsOcrMode] = useState(false);
  const [isPreviewAvailable, setIsPreviewAvailable] = useState(true);

  useEffect(() => {
    if (!authLoading && !user && file) {
      sonnerToast.info("Please sign in to analyze pitch decks", {
        description: "You need to be signed in to save your startup analysis"
      });
      navigate('/auth', { 
        state: { returnUrl: '/pitch-deck-analysis' }
      });
    }
  }, [user, authLoading, file, navigate]);

  const handleFileProcessed = (parameters: SVIFactors, explanationData?: Record<string, string>) => {
    setFactors(parameters);
    const calculatedScore = calculateSVI(parameters);
    setScore(calculatedScore);
    setIsAnalyzing(false);
    
    if (explanationData) {
      setExplanations(explanationData);
    }
    
    let analysisText = generateAnalysis(calculatedScore);
    
    const allZeros = Object.values(parameters).every(val => val === 0);
    if (allZeros) {
      analysisText = "This doesn't appear to be a startup pitch deck. No relevant information was found to calculate a meaningful score.";
    }
    
    setAnalysis(analysisText);
    
    toast({
      title: "Analysis Complete",
      description: allZeros 
        ? "No pitch deck information found" 
        : `Your pitch deck has been analyzed with a SVI score of ${calculatedScore.toFixed(4)}`,
    });

    if (user && !allZeros) {
      setShowStartupForm(true);
    }
  };

  const generateAnalysis = (score: number): string => {
    if (score >= 0.8) {
      return "Your startup has exceptional potential. The pitch deck demonstrates strong market fit, a solid business model, and impressive traction. Consider seeking significant investment to accelerate growth.";
    } else if (score >= 0.6) {
      return "Your startup shows good potential. The pitch deck presents a clear value proposition and market opportunity. Focus on strengthening your competitive advantage and business model validation.";
    } else if (score >= 0.4) {
      return "Your startup has moderate potential. The pitch deck needs improvement in key areas such as market sizing, business model clarity, or competitive positioning. Consider refining your strategy.";
    } else if (score > 0) {
      return "Your startup faces significant challenges. The pitch deck needs substantial improvement across multiple areas. Consider rethinking your core value proposition and market fit.";
    } else {
      return "No relevant pitch deck information was found in the document. Please make sure you're uploading a startup pitch deck.";
    }
  };

  const toggleExtractedText = () => {
    setShowExtractedText(prev => !prev);
  };

  const handleFileSelected = (selectedFile: File) => {
    setFile(selectedFile);
    setUploadError(null);
    
    const fileType = selectedFile.type.toLowerCase();
    const fileExt = selectedFile.name.split('.').pop()?.toLowerCase() || '';
    
    const isPdf = fileType.includes('pdf') || fileExt === 'pdf';
    setIsPreviewAvailable(isPdf);
    
    if (isPdf) {
      const url = URL.createObjectURL(selectedFile);
      setFileUrl(url);
    } else {
      setFileUrl(null);
    }
    
    setIsAnalyzing(true);
    
    if (!user && !authLoading) {
      sonnerToast.info("Please sign in to analyze pitch decks", {
        description: "You need to be signed in to save your startup analysis"
      });
      navigate('/auth', { 
        state: { returnUrl: '/pitch-deck-analysis' }
      });
    }
  };

  const handleTextExtracted = (text: string) => {
    setExtractedText(text);
  };

  const handleUploadError = (error: string, details?: string) => {
    setUploadError(error);
    if (details) {
      console.error('Upload error details:', details);
    }
  };

  const handleStartupSaved = () => {
    setShowStartupForm(false);
    sonnerToast.success("Startup saved successfully", {
      description: "You can view all your startups in your dashboard"
    });
  };

  const isNonPitchDeck = factors && Object.values(factors).every(val => val === 0);

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <div className="container px-4 py-8 max-w-6xl mx-auto">
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mr-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Calculator
          </Button>
          <h1 className="text-3xl font-bold">Pitch Deck Analysis</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card className="p-6 glass-panel">
              <h2 className="text-xl font-semibold mb-4">Upload Your Pitch Deck</h2>
              <p className="text-muted-foreground mb-6">
                Upload your startup pitch deck as a PDF, presentation, or image file and we'll analyze it with OpenAI to calculate your 
                Startup Viability Index score. We support various file types including PDFs, presentations, and images.
              </p>
              
              <FileUpload 
                onFileProcessed={handleFileProcessed} 
                onFileSelected={handleFileSelected}
                onTextExtracted={handleTextExtracted}
                onError={handleUploadError}
              />
            </Card>

            {showStartupForm && factors && score !== null && file && (
              <StartupForm 
                file={file}
                factors={factors}
                score={score}
                explanations={explanations}
                onSaved={handleStartupSaved}
              />
            )}
          </div>

          <div className="space-y-6">
            {uploadError && (
              <Alert variant="destructive">
                <FileWarning className="h-4 w-4" />
                <AlertTitle>File Upload Issue</AlertTitle>
                <AlertDescription>
                  {uploadError}
                </AlertDescription>
              </Alert>
            )}
            
            {file && !isPreviewAvailable && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>File Preview Unavailable</AlertTitle>
                <AlertDescription>
                  Preview is only available for PDF documents. Your {file.type || "non-PDF"} file will be processed using OCR technology.
                </AlertDescription>
              </Alert>
            )}
            
            {fileUrl && isPreviewAvailable && (
              <Card className="glass-panel overflow-hidden">
                <div className="h-[300px]">
                  <PdfViewer fileUrl={fileUrl} />
                </div>
              </Card>
            )}
            
            {isAnalyzing && (
              <Card className="p-4 glass-panel">
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
                  <p className="text-center text-muted-foreground">Analyzing your pitch deck using AI...</p>
                  <p className="text-center text-sm text-muted-foreground mt-2">This may take a few moments.</p>
                </div>
              </Card>
            )}
            
            {score !== null && factors && !isAnalyzing && (
              <div className="space-y-4">
                <ResultCard score={score} calculating={false} />
                
                {analysis && (
                  <Card className="p-4 glass-panel">
                    <h3 className="text-lg font-medium mb-2">Analysis Summary</h3>
                    <p className="text-sm text-muted-foreground">{analysis}</p>
                  </Card>
                )}
                
                {isNonPitchDeck ? (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Not a Pitch Deck</AlertTitle>
                    <AlertDescription>
                      This document doesn't appear to be a startup pitch deck. No relevant startup information was found.
                    </AlertDescription>
                  </Alert>
                ) : null}
                
                <Card className="p-4 glass-panel">
                  <h3 className="text-lg font-medium mb-4">Parameter Analysis</h3>
                  
                  <div className="space-y-3">
                    {Object.entries(factors).map(([key, value]) => (
                      <div key={key} className="border-b border-border pb-3 last:border-0 last:pb-0">
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center">
                            <span className="font-medium">{getLabelForFactor(key as keyof SVIFactors)}</span>
                            <InfoTooltip content={getTooltipForFactor(key as keyof SVIFactors)} />
                          </div>
                          <span className={`font-bold ${value === 0 ? 'text-red-500' : value >= 0.7 ? 'text-green-600' : value >= 0.4 ? 'text-amber-600' : 'text-orange-600'}`}>
                            {value.toFixed(2)}
                          </span>
                        </div>
                        <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${value === 0 ? 'bg-red-500' : value >= 0.7 ? 'bg-green-500' : value >= 0.4 ? 'bg-amber-500' : 'bg-orange-500'}`}
                            style={{ width: `${value * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {value === 0 
                            ? "No information found" 
                            : explanations[key] || getFactorText(key as keyof SVIFactors, value)}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>
                
                {extractedText && (
                  <Card className="p-4 glass-panel">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-medium">Extracted Content</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={toggleExtractedText}
                      >
                        {showExtractedText ? (
                          <><EyeOff className="h-4 w-4 mr-2" /> Hide</>
                        ) : (
                          <><Eye className="h-4 w-4 mr-2" /> Show</>
                        )}
                      </Button>
                    </div>
                    {showExtractedText && (
                      <div className="mt-2 text-sm text-muted-foreground max-h-[200px] overflow-y-auto p-2 bg-accent/50 rounded-md">
                        {extractedText}
                      </div>
                    )}
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PitchDeckAnalysis;
