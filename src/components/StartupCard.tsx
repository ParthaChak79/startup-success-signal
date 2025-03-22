
import { useState } from 'react';

export interface StartupExample {
  name: string;
  score: number;
  description: string;
  category: 'unicorn' | 'medium' | 'failed';
  factors: {
    marketSize: number;
    barrierToEntry: number;
    defensibility: number;
    insightFactor: number;
    complexity: number;
    riskFactor: number;
    teamFactor: number;
    marketTiming: number;
    competitionIntensity: number;
    capitalEfficiency: number;
    distributionAdvantage: number;
  };
}

interface StartupCardProps {
  startup: StartupExample;
  onSelect: (startup: StartupExample) => void;
}

const StartupCard = ({ startup, onSelect }: StartupCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Get category styling
  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'unicorn':
        return {
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/20',
          text: 'text-emerald-500'
        };
      case 'medium':
        return {
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/20',
          text: 'text-blue-500'
        };
      case 'failed':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500/20',
          text: 'text-red-500'
        };
      default:
        return {
          bg: 'bg-gray-500/10',
          border: 'border-gray-500/20',
          text: 'text-gray-500'
        };
    }
  };

  const styles = getCategoryStyles(startup.category);

  return (
    <button
      className={`group w-full glass-panel rounded-xl p-4 transition-all duration-300 ${styles.border} ${styles.bg} hover:shadow-md hover:-translate-y-1 active:translate-y-0 active:shadow-sm`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(startup)}
    >
      <div className="flex justify-between items-start">
        <div className="text-left">
          <h3 className="font-medium text-lg">{startup.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{startup.description}</p>
        </div>
        <div className={`text-xl font-bold ${styles.text}`}>
          {startup.score.toFixed(2)}
        </div>
      </div>
      
      <div className={`mt-3 text-xs text-right transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-60'}`}>
        Click to apply values
      </div>
    </button>
  );
};

export default StartupCard;
