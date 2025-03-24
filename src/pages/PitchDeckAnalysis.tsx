
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft, Upload, FileText, Trash2, Eye, EyeOff } from 'lucide-react';
import { calculateSVI, type SVIFactors } from '@/utils/sviCalculator';
import { defaultFactors } from '@/data/startupExamples';
import ResultCard from '@/components/ResultCard';
import PdfViewer from '@/components/PdfViewer';
import { Progress } from '@/components/ui/progress';
import { analyzePitchDeck } from '@/utils/pdfAnalyzer';

const PitchDeckAnalysis = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [factors, setFactors] = useState<SVIFactors | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [showExtractedText, setShowExtractedText] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check if the file is a PDF
      if (selectedFile.type !== 'application/pdf') {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file",
          variant: "destructive",
        });
        return;
      }
      
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setFileUrl(url);
      
      // Reset analysis state
      setFactors(null);
      setScore(null);
      setAnalysis(null);
      setExtractedText(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      
      // Check if the file is a PDF
      if (droppedFile.type !== 'application/pdf') {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file",
          variant: "destructive",
        });
        return;
      }
      
      setFile(droppedFile);
      const url = URL.createObjectURL(droppedFile);
      setFileUrl(url);
      
      // Reset analysis state
      setFactors(null);
      setScore(null);
      setAnalysis(null);
      setExtractedText(null);
    }
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveFile = () => {
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
    }
    setFile(null);
    setFileUrl(null);
    setFactors(null);
    setScore(null);
    setAnalysis(null);
    setExtractedText(null);
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    
    setAnalyzing(true);
    setProgress(0);
    
    try {
      // Start analysis with progress updates
      const progressCallback = (percent: number) => {
        setProgress(percent);
      };
      
      const result = await analyzePitchDeck(file, progressCallback);
      
      // Apply the extracted factors or use defaults with adjustments
      const analyzedFactors = {
        ...defaultFactors,
        ...result.factors
      };
      
      setFactors(analyzedFactors);
      setExtractedText(result.extractedText);
      const calculatedScore = calculateSVI(analyzedFactors);
      setScore(calculatedScore);
      setAnalysis(result.analysis);
      
      toast({
        title: "Analysis Complete",
        description: `Your pitch deck has been analyzed with a SVI score of ${calculatedScore.toFixed(4)}`,
      });
    } catch (error) {
      console.error('Error analyzing PDF:', error);
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing your pitch deck. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
      setProgress(100);
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
          <Card className="p-6 glass-panel">
            <h2 className="text-xl font-semibold mb-4">Upload Your Pitch Deck</h2>
            <p className="text-muted-foreground mb-6">
              Upload your startup pitch deck as a PDF file and we'll analyze it to calculate your 
              Startup Viability Index score.
            </p>
            
            {!file ? (
              <div 
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:bg-accent/10 transition-colors"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={handleBrowseClick}
              >
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="mb-4 text-muted-foreground">
                  Drag and drop your PDF here or click to browse
                </p>
                <Button>
                  <Upload className="mr-2 h-4 w-4" />
                  Browse Files
                </Button>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept=".pdf,application/pdf" 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
                  <div className="flex items-center">
                    <FileText className="h-6 w-6 mr-3 text-primary" />
                    <div>
                      <p className="font-medium truncate max-w-[240px]">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleRemoveFile}
                    className="text-destructive hover:text-destructive/90"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={handleAnalyze}
                  disabled={analyzing}
                >
                  {analyzing ? 'Analyzing...' : 'Analyze Pitch Deck'}
                </Button>
                
                {analyzing && (
                  <div className="space-y-2">
                    <Progress value={progress} className="h-2" />
                    <p className="text-sm text-center text-muted-foreground">
                      {progress < 100 ? 'Analyzing document...' : 'Finalizing results...'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Preview and Results Section */}
          <div className="space-y-6">
            {/* PDF Preview */}
            {fileUrl && (
              <Card className="glass-panel overflow-hidden">
                <div className="h-[300px]">
                  <PdfViewer fileUrl={fileUrl} />
                </div>
              </Card>
            )}
            
            {/* Results */}
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
