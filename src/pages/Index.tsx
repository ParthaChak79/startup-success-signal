import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/ThemeToggle';
import SliderInput from '@/components/SliderInput';
import ResultCard from '@/components/ResultCard';
import StartupCard, { StartupExample } from '@/components/StartupCard';
import { 
  calculateSVI, 
  getFactorText, 
  getLabelForFactor, 
  getTooltipForFactor,
  getFactorDescription,
  type SVIFactors 
} from '@/utils/sviCalculator';
import { startupExamples, defaultFactors } from '@/data/startupExamples';
import { RefreshCcw, FileText } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const [factors, setFactors] = useState<SVIFactors>(defaultFactors);
  const [score, setScore] = useState<number>(0);
  const [calculating, setCalculating] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<'calculator' | 'examples'>('calculator');

  useEffect(() => {
    const sviScore = calculateSVI(factors);
    setScore(sviScore);
  }, [factors]);

  const handleFactorChange = (factor: keyof SVIFactors, value: number) => {
    setFactors(prev => ({
      ...prev,
      [factor]: value
    }));
  };

  const handleReset = () => {
    setCalculating(true);
    setTimeout(() => {
      setFactors(defaultFactors);
      setCalculating(false);
      toast({
        title: "Values Reset",
        description: "All factors have been reset to default values.",
      });
    }, 400);
  };

  const loadStartupExample = (startup: StartupExample) => {
    setCalculating(true);
    setTimeout(() => {
      setFactors(startup.factors);
      setCalculating(false);
      toast({
        title: `${startup.name} values loaded`,
        description: `SVI Score: ${startup.score.toFixed(4)}`,
      });
    }, 400);
  };

  const factorKeys: (keyof SVIFactors)[] = [
    'marketSize',
    'barrierToEntry',
    'defensibility',
    'insightFactor',
    'complexity',
    'riskFactor',
    'teamFactor',
    'marketTiming',
    'competitionIntensity',
    'capitalEfficiency',
    'distributionAdvantage',
    'businessModelViability'
  ];

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: 'Logout Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen w-full bg-background text-foreground transition-colors duration-300">
      <div className="container px-4 py-8 max-w-6xl mx-auto">
        <header className="w-full flex flex-col items-center justify-center text-center mb-8 pb-8 animate-fade-in">
          <div className="absolute top-4 right-4 flex items-center space-x-4">
            <ThemeToggle />
            <Button 
              variant="destructive" 
              className="flex items-center gap-2"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-2">
            <span className="svi-gradient-text">Startup</span>
            <br />
            <span className="text-foreground">Viability Index</span>
          </h1>
          
          <p className="text-muted-foreground max-w-2xl mx-auto mt-4 text-sm md:text-base">
            The Startup Viability Index (SVI) is a quantitative framework for evaluating 
            startup potential by measuring the balance between opportunity factors and 
            execution challenges. It produces a score from 0 to 1 using a sophisticated formula.
          </p>
          
          <div className="mt-6">
            <Button 
              onClick={() => navigate('/pitch-deck-analysis')}
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Upload Pitch Deck
            </Button>
          </div>
        </header>

        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1 rounded-lg bg-accent">
            <button
              className={`px-6 py-3 text-sm font-medium rounded-md transition-all ${
                activeSection === 'calculator'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveSection('calculator')}
            >
              Calculator
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium rounded-md transition-all ${
                activeSection === 'examples'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveSection('examples')}
            >
              Examples
            </button>
          </div>
        </div>

        <div className="animate-fade-in">
          {activeSection === 'calculator' ? (
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="w-full lg:w-3/4 glass-panel rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  {factorKeys.map((factor) => (
                    <SliderInput
                      key={factor}
                      label={getLabelForFactor(factor)}
                      value={factors[factor]}
                      onChange={(value) => handleFactorChange(factor, value)}
                      infoContent={<p>{getTooltipForFactor(factor)}</p>}
                      valueText={getFactorText(factor, factors[factor])}
                      description={getFactorDescription(factor, factors[factor])}
                    />
                  ))}
                </div>
                
                <div className="flex justify-between items-center mt-8">
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                  >
                    <RefreshCcw className="w-4 h-4" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              <div className="w-full lg:w-1/4 space-y-6">
                <ResultCard score={score} calculating={calculating} />
                
                <div className="glass-panel rounded-xl p-6">
                  <h3 className="text-lg font-medium mb-4">Compare With Examples</h3>
                  <div className="space-y-3">
                    <StartupCard
                      startup={startupExamples.unicorn[0]}
                      onSelect={loadStartupExample}
                    />
                    <StartupCard
                      startup={startupExamples.unicorn[1]}
                      onSelect={loadStartupExample}
                    />
                    
                    <StartupCard
                      startup={startupExamples.medium[0]}
                      onSelect={loadStartupExample}
                    />
                    
                    <StartupCard
                      startup={startupExamples.failed[0]}
                      onSelect={loadStartupExample}
                    />
                    <StartupCard
                      startup={startupExamples.failed[1]}
                      onSelect={loadStartupExample}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-xl p-6 animate-fade-in">
              <h2 className="text-2xl font-bold mb-6">Startup Examples</h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-emerald-500">Unicorn Startups (Highest SVI)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {startupExamples.unicorn.map((startup) => (
                      <StartupCard
                        key={startup.name}
                        startup={startup}
                        onSelect={loadStartupExample}
                      />
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-blue-500">Successful but Smaller Startups</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {startupExamples.medium.map((startup) => (
                      <StartupCard
                        key={startup.name}
                        startup={startup}
                        onSelect={loadStartupExample}
                      />
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-red-500">Failed Startups (Lowest SVI)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {startupExamples.failed.map((startup) => (
                      <StartupCard
                        key={startup.name}
                        startup={startup}
                        onSelect={loadStartupExample}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
