
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { calculateSVI } from '@/utils/sviCalculator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  BadgeCheck, Lightbulb, Loader2, ArrowLeft, Save, Rocket
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { SVIFactors, getLabelForFactor, getFactorText, getFactorDescription } from '@/utils/sviCalculator';
import { ApiKeyForm } from '@/utils/openaiService';

interface StartupIdeaResponse {
  name: string;
  description: string;
  overview: string;
  factors: SVIFactors;
  explanations: Record<string, string>;
}

const StartupIdeasGenerator = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuthContext();
  const [industry, setIndustry] = useState('');
  const [focus, setFocus] = useState('');
  const [loading, setLoading] = useState(false);
  const [idea, setIdea] = useState<StartupIdeaResponse | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [savingIdea, setSavingIdea] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

  // Check if OpenAI API key is set on component mount
  useEffect(() => {
    const checkApiKey = () => {
      const key = localStorage.getItem('openai_api_key');
      setApiKeyMissing(!key);
    };
    checkApiKey();
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth', { state: { returnUrl: '/startup-ideas-generator' } });
    }
  }, [user, authLoading, navigate]);

  const handleApiKeySaved = () => {
    setApiKeyMissing(false);
  };

  const generateStartupIdea = async () => {
    try {
      setLoading(true);
      setIdea(null);
      setScore(null);

      const { data, error } = await supabase.functions.invoke('generate-startup-idea', {
        body: { industry, focus },
      });

      if (error) throw error;

      // Generate score from factors
      const sviScore = calculateSVI(data.factors);
      
      setIdea(data);
      setScore(sviScore);
    } catch (error: any) {
      console.error('Error generating idea:', error);
      
      // Check for API key issues
      if (error.message?.includes('API key')) {
        setApiKeyMissing(true);
        toast.error('OpenAI API Key is required', {
          description: 'Please provide your OpenAI API key to generate ideas'
        });
      } else {
        toast.error('Failed to generate startup idea', {
          description: error.message || 'Please try again later'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const saveStartupIdea = async () => {
    if (!idea || !user) return;

    try {
      setSavingIdea(true);
      
      const { data: startup, error: startupError } = await supabase
        .from('startups')
        .insert({
          name: idea.name,
          description: idea.description,
          user_id: user.id,
          factors: idea.factors,
          score: score || 0,
        })
        .select()
        .single();

      if (startupError) throw startupError;

      toast.success('Startup idea saved successfully');
      setSaveDialogOpen(false);
      navigate(`/startups/${startup.id}`);
    } catch (error: any) {
      console.error('Error saving startup idea:', error);
      toast.error('Failed to save startup idea', {
        description: error.message || 'Please try again later'
      });
    } finally {
      setSavingIdea(false);
    }
  };

  // Get color for score
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "text-emerald-500";
    if (score >= 0.6) return "text-green-500";
    if (score >= 0.4) return "text-yellow-500";
    if (score >= 0.2) return "text-orange-500";
    return "text-red-500";
  };

  if (apiKeyMissing) {
    return (
      <div className="min-h-screen w-full bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-8">
            <Button variant="ghost" onClick={() => navigate('/')} className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Calculator
            </Button>
            <h1 className="text-3xl font-bold">Startup Ideas Generator</h1>
          </div>
          
          <Card className="max-w-md mx-auto mt-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="h-5 w-5 mr-2" />
                OpenAI API Key Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-muted-foreground">
                To generate startup ideas, you need to provide your OpenAI API key.
                Your key is stored locally and never sent to our servers.
              </p>
              <ApiKeyForm onApiKeySaved={handleApiKeySaved} />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Button variant="ghost" onClick={() => navigate('/')} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Calculator
          </Button>
          <h1 className="text-3xl font-bold">Startup Ideas Generator</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Generator Controls */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="h-5 w-5 mr-2" />
                Generate New Ideas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="industry">Industry (Optional)</Label>
                <Input 
                  id="industry" 
                  placeholder="e.g. Fintech, Healthcare, Education" 
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="focus">Focus Area (Optional)</Label>
                <Input 
                  id="focus" 
                  placeholder="e.g. AI, Sustainability, Remote Work" 
                  value={focus}
                  onChange={(e) => setFocus(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full"
                onClick={generateStartupIdea}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Rocket className="mr-2 h-4 w-4" />
                    Generate Idea
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
          
          {/* Generated Idea Display */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Your Startup Idea</span>
                {idea && score !== null && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">SSI Score:</span>
                    <span className={`text-xl font-bold ${getScoreColor(score)}`}>
                      {score.toFixed(4)}
                    </span>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="mt-4 text-lg">Generating your startup idea...</p>
                </div>
              ) : idea ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold">{idea.name}</h3>
                    <p className="mt-2 text-lg">{idea.description}</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="text-lg font-semibold mb-2">Overview</h4>
                    <p>{idea.overview}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold mb-3">Factor Analysis</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(idea.factors).map(([key, value]) => (
                        <div key={key} className="border rounded-md p-3">
                          <div className="flex justify-between mb-1">
                            <span className="font-medium">{getLabelForFactor(key as keyof SVIFactors)}</span>
                            <span className={`font-bold ${getScoreColor(value)}`}>{value.toFixed(2)}</span>
                          </div>
                          <div className="w-full bg-secondary h-2 rounded-full">
                            <div 
                              className={`h-2 rounded-full ${getScoreColor(value)}`} 
                              style={{ width: `${value * 100}%` }}
                            ></div>
                          </div>
                          <p className="text-xs mt-1 text-muted-foreground">
                            {getFactorText(key as keyof SVIFactors, value)}
                          </p>
                          {idea.explanations && idea.explanations[key] && (
                            <p className="text-sm mt-2">{idea.explanations[key]}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-4">
                    <Button onClick={() => setSaveDialogOpen(true)}>
                      <Save className="mr-2 h-4 w-4" />
                      Save to My Startups
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center space-y-4">
                  <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-lg">Generate a new startup idea to see it here</p>
                  <p className="text-sm text-muted-foreground">
                    You can optionally specify an industry or focus area to guide the AI
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Save Dialog */}
        <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Startup Idea</DialogTitle>
              <DialogDescription>
                This will save "{idea?.name}" to your My Startups collection.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <p className="flex items-center">
                <BadgeCheck className="h-5 w-5 mr-2 text-green-500" />
                Startup details and parameters will be saved
              </p>
              {score !== null && (
                <p className="mt-2 flex items-center">
                  <BadgeCheck className="h-5 w-5 mr-2 text-green-500" />
                  SSI Score: <span className={`font-bold ml-1 ${getScoreColor(score)}`}>{score.toFixed(4)}</span>
                </p>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveStartupIdea} disabled={savingIdea}>
                {savingIdea ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Startup Idea'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default StartupIdeasGenerator;
