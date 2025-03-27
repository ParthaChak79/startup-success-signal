
import { useEffect, useState } from 'react';

interface ResultCardProps {
  score: number;
  calculating: boolean;
}

const ResultCard = ({ score, calculating }: ResultCardProps) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  
  // Get interpretation based on score
  const getInterpretation = (score: number) => {
    if (score >= 0.8) return "Exceptional Viability";
    if (score >= 0.6) return "Strong Viability";
    if (score >= 0.4) return "Moderate Viability";
    if (score >= 0.2) return "Challenging Viability";
    return "Minimal Viability";
  };

  // Get color based on score
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "text-emerald-500";
    if (score >= 0.6) return "text-green-500";
    if (score >= 0.4) return "text-yellow-500";
    if (score >= 0.2) return "text-orange-500";
    return "text-red-500";
  };

  // Get description based on score
  const getDescription = (score: number) => {
    if (score >= 0.8) {
      return "Revolutionary insight with large market and strong defensible position.";
    }
    if (score >= 0.6) {
      return "Strong market position with clear competitive advantages.";
    }
    if (score >= 0.4) {
      return "Good market opportunity with some competitive advantages.";
    }
    if (score >= 0.2) {
      return "Limited market or advantages with high execution complexity.";
    }
    return "Small market or no advantages with extreme complexity or risk.";
  };

  // Animate the score counter
  useEffect(() => {
    if (calculating) {
      setAnimatedScore(0);
      return;
    }
    
    const duration = 1000; // Animation duration in ms
    const steps = 30; // Number of steps in the animation
    const increment = score / steps;
    let current = 0;
    
    const interval = setInterval(() => {
      current += increment;
      if (current >= score) {
        current = score;
        clearInterval(interval);
      }
      
      setAnimatedScore(current);
    }, duration / steps);
    
    return () => clearInterval(interval);
  }, [score, calculating]);

  return (
    <div className={`glass-panel rounded-xl p-6 transition-all duration-500 ${calculating ? 'opacity-50' : 'opacity-100'}`}>
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-foreground/80">Startup Success Score</h3>
        
        <div className="flex items-baseline space-x-2">
          <span className={`text-5xl font-bold ${getScoreColor(score)}`}>
            {animatedScore.toFixed(4)}
          </span>
          <span className="text-muted-foreground">/1.0</span>
        </div>
        
        <div>
          <div className="text-xl font-semibold mt-1">
            {getInterpretation(score)}
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            {getDescription(score)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
