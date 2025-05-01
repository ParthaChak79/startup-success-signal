
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import ThemeToggle from '@/components/ThemeToggle';
import StartupCard from '@/components/StartupCard';
import { indianStartupExamples } from '@/data/indianStartupExamples';
import { Button } from '@/components/ui/button';
import { Globe, BookOpen } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const IndianStartups = () => {
  const navigate = useNavigate();
  
  const handleLoadStartup = (startup: any) => {
    toast({
      title: `${startup.name} selected`,
      description: `SVI Score: ${startup.score.toFixed(2)}`,
    });
    // Navigate to the calculator with this startup's values
    navigate('/', { state: { startupFactors: startup.factors } });
  };

  const navigateToExternalBlog = () => {
    window.open('https://tactyqal.com/blog', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen w-full bg-background text-foreground transition-colors duration-300">
      <div className="container px-4 py-8 max-w-6xl mx-auto">
        <header className="w-full flex flex-col items-center justify-center text-center mb-8 pb-8 animate-fade-in">
          <div className="absolute top-4 right-4 flex items-center space-x-4">
            <ThemeToggle />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-2">
            <span className="svi-gradient-text">Indian</span>
            <br />
            <span className="text-foreground">Startups</span>
          </h1>
          
          <p className="text-muted-foreground max-w-2xl mx-auto mt-4 text-sm md:text-base">
            Explore Indian startups across various sectors and their success factors.
            Select any startup to load its values into the calculator.
          </p>
          
          <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center">
            <Button 
              onClick={() => navigate('/')}
              variant="outline"
            >
              Back to Calculator
            </Button>
            <Button 
              onClick={() => navigate('/global-startups')}
              className="flex items-center gap-2"
            >
              <Globe className="w-4 h-4" />
              Global Startups
            </Button>
          </div>

          <div className="mt-6">
            <Tabs defaultValue="startups" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="startups">Indian Startups</TabsTrigger>
                <TabsTrigger value="blog" onClick={navigateToExternalBlog} className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  Startup Blog
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </header>

        <div className="glass-panel rounded-xl p-6 animate-fade-in">
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-emerald-500">Indian Unicorns</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {indianStartupExamples.unicorn.map((startup) => (
                  <StartupCard
                    key={startup.name}
                    startup={startup}
                    onSelect={handleLoadStartup}
                  />
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4 text-blue-500">Successful Indian Startups</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {indianStartupExamples.medium.map((startup) => (
                  <StartupCard
                    key={startup.name}
                    startup={startup}
                    onSelect={handleLoadStartup}
                  />
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4 text-red-500">Failed Indian Startups</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {indianStartupExamples.failed.map((startup) => (
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

export default IndianStartups;
