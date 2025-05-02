
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Sparkles, Save, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { ApiKeyForm } from '@/components/claude/ApiKeyForm';
import { calculateSVI, SVIFactors } from '@/utils/sviCalculator';
import StartupForm from '@/components/StartupForm';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface StartupIdea {
  name: string;
  description: string;
  overview: string;
  factors: Record<string, number>;
  explanations: Record<string, string>;
}

const StartupIdeasGenerator = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuthContext();
  const [industry, setIndustry] = useState<string>('');
  const [focus, setFocus] = useState<string>('');
  const [continent, setContinent] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [startupIdea, setStartupIdea] = useState<StartupIdea | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [hasClaudeApiKey, setHasClaudeApiKey] = useState<boolean>(false);
  const [showStartupForm, setShowStartupForm] = useState(false);

  useEffect(() => {
    // Check if the user has a Claude API key
    const checkApiKey = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('claude_api_key')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        // Also check for local storage key as a fallback
        const localApiKey = localStorage.getItem('claude_api_key');
        
        setHasClaudeApiKey(!!(data?.claude_api_key || localApiKey));
      } catch (err) {
        console.error("Error checking for Claude API key:", err);
      }
    };
    
    checkApiKey();
  }, [user]);

  const handleGenerateIdea = async () => {
    if (!user && !authLoading) {
      toast.info("Please sign in to generate startup ideas");
      navigate('/auth', { 
        state: { returnUrl: '/startup-ideas-generator' }
      });
      return;
    }
    
    if (!hasClaudeApiKey) {
      toast.error("Claude API key required", {
        description: "Please provide your Claude API key to generate startup ideas."
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Adding timestamp to ensure each request is unique for more variety
      const timestamp = Date.now();
      
      const { data, error } = await supabase.functions.invoke('generate-startup-idea', {
        body: { industry, focus, continent, country, timestamp },
      });
      
      if (error) {
        console.error('Error generating startup idea:', error);
        toast.error('Failed to generate startup idea', {
          description: error.message
        });
        return;
      }
      
      if (!data) {
        toast.error('No data received from API');
        return;
      }
      
      setStartupIdea(data);
      
      const calculatedScore = calculateSVI(data.factors as SVIFactors);
      setScore(calculatedScore);
      
      toast.success('Startup idea generated successfully!');
    } catch (error) {
      console.error('Error generating startup idea:', error);
      toast.error('Failed to generate startup idea', {
        description: error.message
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApiKeySaved = () => {
    setHasClaudeApiKey(true);
    toast.success("Claude API key saved successfully");
  };

  const handleSaveIdea = () => {
    setShowStartupForm(true);
  };

  const handleStartupSaved = () => {
    setShowStartupForm(false);
    toast.success("Startup saved successfully", {
      description: "You can view your startups in My Startups section"
    });
  };

  const industryOptions = [
    'AI & Machine Learning',
    'AgriTech',
    'AR/VR',
    'Automotive',
    'Biotechnology',
    'Blockchain',
    'Clean Energy',
    'Climate Tech',
    'Cloud Computing',
    'Construction Tech',
    'Cybersecurity',
    'E-commerce',
    'EdTech',
    'Entertainment',
    'Fashion Tech',
    'Fintech',
    'Food Tech',
    'Gaming',
    'Healthcare',
    'HR Tech',
    'IoT',
    'Legal Tech',
    'Logistics',
    'Manufacturing',
    'Marketing Tech',
    'Mental Health',
    'PropTech',
    'Quantum Computing',
    'Retail Tech',
    'Robotics',
    'SaaS',
    'Social Media',
    'Space Tech',
    'Sports Tech',
    'Sustainability',
    'Telecom',
    'Travel & Hospitality',
    'Web3'
  ];

  const focusOptions = [
    'B2B',
    'B2C',
    'B2G'
  ];

  const continentOptions = [
    'Africa',
    'Asia',
    'Australia/Oceania',
    'Europe',
    'North America',
    'South America'
  ];

  const countryOptions = {
    'Africa': ['Egypt', 'Kenya', 'Nigeria', 'South Africa', 'Ghana', 'Morocco', 'Ethiopia'],
    'Asia': ['China', 'India', 'Japan', 'Singapore', 'South Korea', 'Thailand', 'Indonesia', 'Malaysia', 'Vietnam', 'UAE'],
    'Australia/Oceania': ['Australia', 'New Zealand', 'Fiji'],
    'Europe': ['UK', 'Germany', 'France', 'Spain', 'Italy', 'Netherlands', 'Sweden', 'Denmark', 'Finland', 'Norway', 'Switzerland', 'Poland'],
    'North America': ['USA', 'Canada', 'Mexico'],
    'South America': ['Brazil', 'Argentina', 'Colombia', 'Chile', 'Peru']
  };

  // Filter countries based on selected continent
  const availableCountries = continent ? countryOptions[continent as keyof typeof countryOptions] || [] : [];

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
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold">Startup Ideas Generator</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-6 glass-panel">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Generate New Startup Ideas</h2>
                <p className="text-muted-foreground mb-6">
                  Use AI to generate innovative startup ideas that score well on all the 12 parameters
                  of the Startup Success Index. Customize your generation by selecting an industry, focus, and location.
                </p>
              </div>

              {!hasClaudeApiKey ? (
                <ApiKeyForm onApiKeySaved={handleApiKeySaved} />
              ) : (
                <>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="industry">Industry (Optional)</Label>
                      <Select value={industry} onValueChange={setIndustry}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an industry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any Industry</SelectItem>
                          {industryOptions.map((option) => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="focus">Focus (Optional)</Label>
                      <Select value={focus} onValueChange={setFocus}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a focus" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any Focus</SelectItem>
                          {focusOptions.map((option) => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="continent">Continent (Optional)</Label>
                      <Select value={continent} onValueChange={(value) => {
                        setContinent(value);
                        setCountry(''); // Reset country when continent changes
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a continent" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any Continent</SelectItem>
                          {continentOptions.map((option) => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {continent && continent !== 'any' && (
                      <div>
                        <Label htmlFor="country">Country (Optional)</Label>
                        <Select value={country} onValueChange={setCountry}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a country" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any Country</SelectItem>
                            {availableCountries.map((option) => (
                              <SelectItem key={option} value={option}>{option}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    {user ? (
                      <Button 
                        className="w-full mt-4 flex items-center gap-2"
                        onClick={handleGenerateIdea}
                        disabled={isGenerating}
                      >
                        <Sparkles className="w-4 h-4" />
                        {isGenerating ? 'Generating...' : 'Generate Startup Idea'}
                      </Button>
                    ) : (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Authentication Required</AlertTitle>
                        <AlertDescription>
                          Please sign in to generate and save startup ideas.
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate('/auth', { state: { returnUrl: '/startup-ideas-generator' } })}
                            className="ml-2"
                          >
                            Sign In
                          </Button>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {startupIdea && showStartupForm && score !== null && (
                    <StartupForm 
                      file={new File([new Blob()], startupIdea.name + ".txt")}
                      factors={startupIdea.factors as SVIFactors}
                      score={score}
                      explanations={startupIdea.explanations}
                      onSaved={handleStartupSaved}
                    />
                  )}
                </>
              )}
            </div>
          </Card>

          <div className="space-y-6">
            {startupIdea && !showStartupForm && (
              <Card className="p-6 glass-panel">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">{startupIdea.name}</h2>
                  {user && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-1"
                      onClick={handleSaveIdea}
                    >
                      <Save className="w-4 h-4" />
                      Save Idea
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-1">Description</h3>
                    <p className="text-muted-foreground">{startupIdea.description}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-1">Overview</h3>
                    <p className="text-muted-foreground">{startupIdea.overview}</p>
                  </div>

                  {score !== null && (
                    <div className="mt-4">
                      <h3 className="text-lg font-medium mb-1">Startup Success Index Score</h3>
                      <div className="flex items-center gap-2">
                        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              score >= 0.7
                                ? 'bg-green-500'
                                : score >= 0.5
                                ? 'bg-yellow-500'
                                : 'bg-orange-500'
                            }`}
                            style={{ width: `${score * 100}%` }}
                          ></div>
                        </div>
                        <span className={`font-bold ${
                          score >= 0.7
                            ? 'text-green-600'
                            : score >= 0.5
                            ? 'text-yellow-600'
                            : 'text-orange-600'
                        }`}>
                          {score.toFixed(4)}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 border-t border-border pt-4">
                    <h3 className="text-lg font-medium mb-3">Parameter Analysis</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                      {startupIdea && Object.entries(startupIdea.factors).map(([key, value]) => (
                        <div key={key} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                            <span className={`text-xs font-bold ${
                              value >= 0.7
                                ? 'text-green-600'
                                : value >= 0.5
                                ? 'text-yellow-600'
                                : 'text-orange-600'
                            }`}>
                              {value.toFixed(2)}
                            </span>
                          </div>
                          <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                value >= 0.7
                                  ? 'bg-green-500'
                                  : value >= 0.5
                                  ? 'bg-yellow-500'
                                  : 'bg-orange-500'
                              }`}
                              style={{ width: `${value * 100}%` }}
                            ></div>
                          </div>
                          {startupIdea.explanations && startupIdea.explanations[key] && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {startupIdea.explanations[key]}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {isGenerating && (
              <Card className="p-6 glass-panel">
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                  <p className="text-center text-muted-foreground">Generating innovative startup idea...</p>
                  <p className="text-center text-sm text-muted-foreground mt-2">This may take a few moments.</p>
                </div>
              </Card>
            )}

            {!startupIdea && !isGenerating && (
              <Card className="p-6 glass-panel">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No Startup Idea Generated Yet</h3>
                  <p className="text-muted-foreground">
                    Use the form on the left to generate a new startup idea that scores well on all parameters.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartupIdeasGenerator;
