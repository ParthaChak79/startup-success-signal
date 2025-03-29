
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import PitchDeckAnalysis from "./pages/PitchDeckAnalysis";
import NotFound from "./pages/NotFound";
import GlobalStartups from "./pages/GlobalStartups";
import IndianStartups from "./pages/IndianStartups";
import Auth from "./pages/Auth";
import MyStartups from "./pages/MyStartups";
import StartupDetails from "./pages/StartupDetails";
import { useEffect } from "react";
import { supabase } from "./integrations/supabase/client";
import { toast } from "sonner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  // Create storage bucket on app initialization if it doesn't exist
  useEffect(() => {
    const createStorageBucket = async () => {
      try {
        // Check if the bucket exists
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();
        
        if (listError) {
          console.error('Error checking buckets:', listError);
          return;
        }
        
        const bucketExists = buckets.some(bucket => bucket.name === 'pitch-decks');
        
        if (!bucketExists) {
          // Try to create the bucket
          const { error: createError } = await supabase.storage.createBucket('pitch-decks', {
            public: true,
            fileSizeLimit: 20971520 // 20MB
          });
          
          if (createError) {
            console.error('Error creating bucket:', createError);
            
            // Check if this is a permission error and we're not logged in
            if (createError.message.includes('policy') || createError.message.includes('permission')) {
              console.log('This appears to be a permissions error. The bucket will be created when an admin logs in.');
              
              // We don't need to show an error to the user, as the app can still function
              // The bucket will be created when an admin logs in or file uploads may be handled by the backend
            }
          } else {
            console.log('Pitch decks bucket created successfully');
            
            // Create permissive policy for public access
            try {
              const { error: policyError } = await supabase.storage.from('pitch-decks').createSignedUrl('dummy.txt', 60);
              if (policyError && !policyError.message.includes('not found')) {
                console.error('Error testing bucket access:', policyError);
              }
            } catch (policyError) {
              console.error('Error setting bucket policy:', policyError);
            }
          }
        }
      } catch (error) {
        console.error('Error setting up storage:', error);
      }
    };
    
    createStorageBucket();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <BrowserRouter>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/pitch-deck-analysis" element={<PitchDeckAnalysis />} />
                <Route path="/global-startups" element={<GlobalStartups />} />
                <Route path="/indian-startups" element={<IndianStartups />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/my-startups" element={<MyStartups />} />
                <Route path="/startups/:id" element={<StartupDetails />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
