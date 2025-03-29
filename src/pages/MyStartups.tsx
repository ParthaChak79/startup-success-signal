
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { calculateSVI } from '@/utils/sviCalculator';

interface Startup {
  id: string;
  name: string;
  description: string | null;
  factors: Record<string, number>;
  score: number;
  created_at: string;
}

const MyStartups = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuthContext();
  const [startups, setStartups] = useState<Startup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startupToDelete, setStartupToDelete] = useState<string | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth', { state: { returnUrl: '/my-startups' } });
    }
  }, [user, authLoading, navigate]);

  // Fetch user's startups
  useEffect(() => {
    const fetchStartups = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('startups')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        setStartups(data || []);
      } catch (error: any) {
        console.error('Error fetching startups:', error);
        toast.error('Failed to load startups', {
          description: error.message
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchStartups();
    }
  }, [user]);

  const handleDeleteStartup = async () => {
    if (!startupToDelete) return;

    try {
      const { error } = await supabase
        .from('startups')
        .delete()
        .eq('id', startupToDelete);

      if (error) throw error;

      setStartups(startups.filter(startup => startup.id !== startupToDelete));
      toast.success('Startup deleted successfully');
    } catch (error: any) {
      console.error('Error deleting startup:', error);
      toast.error('Failed to delete startup', {
        description: error.message
      });
    } finally {
      setStartupToDelete(null);
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

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="mr-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Calculator
            </Button>
            <h1 className="text-3xl font-bold">My Startups</h1>
          </div>
          
          <Button 
            onClick={() => navigate('/pitch-deck-analysis')}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Analysis
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        ) : startups.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold mb-2">No startups yet</h3>
            <p className="text-muted-foreground mb-6">
              Upload a pitch deck or create a startup manually to get started
            </p>
            <Button 
              onClick={() => navigate('/pitch-deck-analysis')}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Analysis
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {startups.map(startup => (
              <Card 
                key={startup.id} 
                className="p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/startups/${startup.id}`)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold">{startup.name}</h3>
                    {startup.description && (
                      <p className="text-muted-foreground mt-1 line-clamp-2">{startup.description}</p>
                    )}
                  </div>
                  
                  <div 
                    className="p-2 rounded-md" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setStartupToDelete(startup.id);
                    }}
                  >
                    <Trash className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </div>
                </div>
                
                <div className="mt-4 flex items-baseline justify-between">
                  <span className="text-sm text-muted-foreground">
                    {new Date(startup.created_at).toLocaleDateString()}
                  </span>
                  <div>
                    <span className="text-sm text-muted-foreground mr-2">SSI Score:</span>
                    <span className={`text-lg font-bold ${getScoreColor(startup.score)}`}>
                      {startup.score.toFixed(4)}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={!!startupToDelete} onOpenChange={(open) => !open && setStartupToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your startup and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteStartup}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyStartups;
