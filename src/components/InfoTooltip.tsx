
import React, { useState, useRef } from 'react';
import { Info } from 'lucide-react';

interface InfoTooltipProps {
  content: React.ReactNode;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ content }) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const showTooltip = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    setIsVisible(true);
  };

  const hideTooltip = () => {
    timeoutRef.current = window.setTimeout(() => {
      setIsVisible(false);
    }, 200);
  };

  return (
    <div className="relative inline-block">
      <button
        className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        aria-label="Information"
      >
        <Info className="w-5 h-5" />
      </button>
      
      {isVisible && (
        <div 
          className="absolute z-50 left-full ml-2 top-0 w-64 p-3 bg-popover text-popover-foreground text-sm rounded-lg shadow-lg border border-border/60 backdrop-blur-md animate-fade-in"
          onMouseEnter={showTooltip}
          onMouseLeave={hideTooltip}
        >
          {content}
        </div>
      )}
    </div>
  );
};

export default InfoTooltip;
