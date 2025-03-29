import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
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
import { RefreshCcw, FileText, Globe, MapPin, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [factors, setFactors] = useState<SVIFactors>(defaultFactors);
  const [score, setScore] = useState<number>(0);
  const [calculating, setCalculating] = useState<boolean>(false);

  useEffect(() => {
    if (location.state && location.state.startupFactors) {
      setFactors(location.state.startupFactors);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

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

  return (
    <div className="min-h-screen w-full bg-background text-foreground transition-colors duration-300">
      <div className="container px-4 py-8 max-w-6xl mx-auto">
        <header className="w-full flex flex-col items-center justify-center text-center mb-8 pb-8 animate-fade-in">
          <div className="absolute top-4 left-4">
            <a 
              href="https://www.linkedin.com/in/chakrabortypartha/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center bg-blue-600 rounded-full p-2 hover:bg-blue-700 transition-colors"
            >
              <Linkedin color="white" size={24} />
            </a>
          </div>
          
          <div className="absolute top-4 right-4 flex items-center space-x-4">
            <ThemeToggle />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-2">
            <span className="svi-gradient-text">Startup</span>
            <br />
            <span className="text-foreground">Success Index</span>
          </h1>
          
          <p className="text-muted-foreground max-w-2xl mx-auto mt-4 text-sm md:text-base">
            The Startup Success Index (SSI) is a quantitative framework for evaluating 
            startup potential by measuring the balance between opportunity factors and 
            execution challenges. It produces a score from 0 to 1 using a sophisticated formula.
          </p>
          
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button 
              onClick={() => navigate('/pitch-deck-analysis')}
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Upload Pitch Deck
            </Button>
            <Button 
              onClick={() => navigate('/global-startups')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Globe className="w-4 h-4" />
              Global Startups
            </Button>
            <Button 
              onClick={() => navigate('/indian-startups')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              Indian Startups
            </Button>
          </div>
        </header>

        <div className="animate-fade-in">
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
        </div>
      </div>
    </div>
  );
};

export default Index;
