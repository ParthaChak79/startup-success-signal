
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import Index from "./pages/Index";
import PitchDeckAnalysis from "./pages/PitchDeckAnalysis";
import NotFound from "./pages/NotFound";
import GlobalStartups from "./pages/GlobalStartups";
import IndianStartups from "./pages/IndianStartups";
import BuyMeCoffeeButton from "./components/BuyMeCoffeeButton";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <BrowserRouter>
            <BuyMeCoffeeButton />
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/pitch-deck-analysis" element={<PitchDeckAnalysis />} />
              <Route path="/global-startups" element={<GlobalStartups />} />
              <Route path="/indian-startups" element={<IndianStartups />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;

