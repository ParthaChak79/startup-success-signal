
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import ThemeToggle from '@/components/ThemeToggle';
import StartupCard from '@/components/StartupCard';
import { startupExamples } from '@/data/startupExamples';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

const GlobalStartups = () => {
  const navigate = useNavigate();
  
  const handleLoadStartup = (startup: any) => {
    toast({
      title: `${startup.name} selected`,
      description: `SVI Score: ${startup.score.toFixed(2)}`,
    });
    // Navigate to the calculator with this startup's values
    navigate('/', { state: { startupFactors: startup.factors } });
  };

  return (
    <div className="min-h-screen w-full bg-background text-foreground transition-colors duration-300">
      <div className="container px-4 py-8 max-w-6xl mx-auto">
        <header className="w-full flex flex-col items-center justify-center text-center mb-8 pb-8 animate-fade-in">
          <div className="absolute top-4 right-4 flex items-center space-x-4">
            <ThemeToggle />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-2">
            <span className="svi-gradient-text">Global</span>
            <br />
            <span className="text-foreground">Startups</span>
          </h1>
          
          <p className="text-muted-foreground max-w-2xl mx-auto mt-4 text-sm md:text-base">
            Explore global unicorns and startups across various industries.
            Select any startup to load its values into the calculator.
          </p>
          
          <div className="mt-6 flex gap-4">
            <Button 
              onClick={() => navigate('/')}
              variant="outline"
            >
              Back to Calculator
            </Button>
            <Button 
              onClick={() => navigate('/indian-startups')}
              className="flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              Indian Startups
            </Button>
          </div>
        </header>

        <div className="glass-panel rounded-xl p-6 animate-fade-in">
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-emerald-500">Global Unicorns</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {startupExamples.unicorn.map((startup) => (
                  <StartupCard
                    key={startup.name}
                    startup={startup}
                    onSelect={handleLoadStartup}
                  />
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4 text-blue-500">Successful Global Startups</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {startupExamples.medium.map((startup) => (
                  <StartupCard
                    key={startup.name}
                    startup={startup}
                    onSelect={handleLoadStartup}
                  />
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4 text-red-500">Failed Global Startups</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {startupExamples.failed.map((startup) => (
                  <StartupCard
                    key={startup.name}
                    startup={startup}
                    onSelect={handleLoadStartup}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalStartups;
