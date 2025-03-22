
import { useState, useEffect, useRef } from 'react';
import InfoTooltip from './InfoTooltip';

interface SliderInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  infoContent: React.ReactNode;
  description: string;
  valueText: string;
}

const SliderInput = ({
  label,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
  infoContent,
  description,
  valueText
}: SliderInputProps) => {
  const [displayValue, setDisplayValue] = useState<string>(value.toFixed(2));
  const rangeRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    // Update the slider's background to show the fill
    if (rangeRef.current) {
      const percentage = ((value - min) / (max - min)) * 100;
      rangeRef.current.style.background = `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${percentage}%, hsl(var(--accent)) ${percentage}%, hsl(var(--accent)) 100%)`;
    }
    
    setDisplayValue(value.toFixed(2));
  }, [value, min, max]);

  return (
    <div className="w-full mb-8 animate-slide-up">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-2">
          <h3 className="font-medium text-lg">{label}</h3>
          <InfoTooltip content={infoContent} />
        </div>
        <div className="text-2xl font-bold text-primary">{displayValue}</div>
      </div>
      
      <input
        ref={rangeRef}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
      />

      <div className="mt-2">
        <div className="font-medium text-base text-foreground/90">{valueText}</div>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  );
};

export default SliderInput;
