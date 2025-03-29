
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, FileText, ExternalLink } from 'lucide-react';
import ResultCard from '@/components/ResultCard';
import { SVIFactors, calculateSVI, getLabelForFactor, getTooltipForFactor, getFactorText } from '@/utils/sviCalculator';
import InfoTooltip from '@/components/InfoTooltip';

interface Startup {
  id: string;
  name: string;
  description: string | null;
  factors: SVIFactors;
  score: number;
  created_at: string;
}

interface PitchDeck {
  id: string;
  file_name: string;
  file_url: string;
  analysis_results: {
    factors: SVIFactors;
    score: number;
    explanations?: Record<string, string>;
  };
  created_at: string;
}

const StartupDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuthContext();
  const [startup, setStartup] = useState<Startup | null>(null);
  const [pitchDecks, setPitchDecks] = useState<PitchDeck[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth', { state: { returnUrl: `/startups/${id}` } });
    }
  }, [user, authLoading, navigate, id]);

  // Fetch startup details
  useEffect(() => {
    const fetchStartupDetails = async () => {
      if (!user || !id) return;

      try {
        setIsLoading(true);
        
        // Fetch startup
        const { data: startupData, error: startupError } = await supabase
          .from('startups')
          .select('*')
          .eq('id', id)
          .single();

        if (startupError) throw startupError;
        if (!startupData) {
          toast.error('Startup not found');
          navigate('/my-startups');
          return;
        }

        setStartup(startupData);

        // Fetch pitch decks
        const { data: pitchDeckData, error: pitchDeckError } = await supabase
          .from('pitch_decks')
          .select('*')
          .eq('startup_id', id)
          .order('created_at', { ascending: false });

        if (pitchDeckError) throw pitchDeckError;
        setPitchDecks(pitchDeckData || []);

      } catch (error: any) {
        console.error('Error fetching startup details:', error);
        toast.error('Failed to load startup details', {
          description: error.message
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user && id) {
      fetchStartupDetails();
    }
  }, [user, id, navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!startup) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4">Startup not found</h2>
        <Button onClick={() => navigate('/my-startups')}>
          Back to My Startups
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/my-startups')}
            className="mr-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to My Startups
          </Button>
        </div>

        <div className="flex flex-col gap-8">
          {/* Startup Header */}
          <div>
            <h1 className="text-3xl font-bold">{startup.name}</h1>
            {startup.description && (
              <p className="text-muted-foreground mt-2 max-w-3xl">{startup.description}</p>
            )}
            <div className="mt-4 text-sm text-muted-foreground">
              Created: {new Date(startup.created_at).toLocaleDateString()}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Score Card */}
            <div className="lg:col-span-1">
              <ResultCard score={startup.score} calculating={false} />
              
              {/* Pitch Decks */}
              {pitchDecks.length > 0 && (
                <Card className="mt-6 p-6">
                  <h3 className="text-lg font-medium mb-4">Pitch Decks</h3>
                  <div className="space-y-4">
                    {pitchDecks.map(deck => (
                      <div key={deck.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-sm">{deck.file_name}</span>
                        </div>
                        <a 
                          href={deck.file_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View
                        </a>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            {/* Parameters Analysis */}
            <Card className="p-6 lg:col-span-2">
              <h3 className="text-lg font-medium mb-4">Parameters Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(startup.factors).map(([key, value]) => (
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
                        : pitchDecks.length > 0 && pitchDecks[0].analysis_results?.explanations?.[key] 
                          ? pitchDecks[0].analysis_results.explanations[key]
                          : getFactorText(key as keyof SVIFactors, value)}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartupDetails;
