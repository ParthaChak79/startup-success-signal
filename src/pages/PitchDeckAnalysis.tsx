
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { calculateSVI, type SVIFactors } from '@/utils/sviCalculator';
import ResultCard from '@/components/ResultCard';
import PdfViewer from '@/components/PdfViewer';
import FileUpload from '@/components/FileUpload';

const PitchDeckAnalysis = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [factors, setFactors] = useState<SVIFactors | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [showExtractedText, setShowExtractedText] = useState(false);

  const handleFileProcessed = (parameters: SVIFactors) => {
    setFactors(parameters);
    const calculatedScore = calculateSVI(parameters);
    setScore(calculatedScore);
    
    // Generate a simple analysis based on the score
    let analysisText = generateAnalysis(calculatedScore);
    
    // Check if all parameters are zero, which means it's not a pitch deck
    const allZeros = Object.values(parameters).every(val => val === 0);
    if (allZeros) {
      analysisText = "This doesn't appear to be a startup pitch deck. No relevant information was found to calculate a meaningful score.";
    }
    
    setAnalysis(analysisText);
    
    // Show toast with the score
    toast({
      title: "Analysis Complete",
      description: allZeros 
        ? "No pitch deck information found" 
        : `Your pitch deck has been analyzed with a SVI score of ${calculatedScore.toFixed(4)}`,
    });
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

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <div className="container px-4 py-8 max-w-6xl mx-auto">
        {/* Header with back button */}
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
          {/* File Upload Section */}
          <div className="space-y-6">
            <Card className="p-6 glass-panel">
              <h2 className="text-xl font-semibold mb-4">Upload Your Pitch Deck</h2>
              <p className="text-muted-foreground mb-6">
                Upload your startup pitch deck as a PDF file and we'll analyze it to calculate your 
                Startup Viability Index score. If the document isn't a pitch deck, all scores will be zero.
              </p>
              
              <FileUpload onFileProcessed={handleFileProcessed} />
            </Card>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* PDF Preview (only shown if file is uploaded) */}
            {fileUrl && (
              <Card className="glass-panel overflow-hidden">
                <div className="h-[300px]">
                  <PdfViewer fileUrl={fileUrl} />
                </div>
              </Card>
            )}
            
            {/* Results (only shown if analysis is completed) */}
            {score !== null && factors && (
              <div className="space-y-4">
                <ResultCard score={score} calculating={false} />
                
                {analysis && (
                  <Card className="p-4 glass-panel">
                    <h3 className="text-lg font-medium mb-2">Analysis Summary</h3>
                    <p className="text-sm text-muted-foreground">{analysis}</p>
                  </Card>
                )}
                
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
