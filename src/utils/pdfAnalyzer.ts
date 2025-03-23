
import { pdfjs } from 'react-pdf';
import { type SVIFactors } from './sviCalculator';

// Initialize pdfjs worker with the same configuration as the PdfViewer component
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();

interface AnalysisResult {
  factors: Partial<SVIFactors>;
  analysis: string;
}

/**
 * Analyzes a pitch deck PDF to extract SVI factors and provide analysis
 */
export const analyzePitchDeck = async (
  file: File, 
  progressCallback: (progress: number) => void
): Promise<AnalysisResult> => {
  try {
    progressCallback(10);
    
    // Load the PDF document
    const fileData = await readFileAsArrayBuffer(file);
    const pdf = await pdfjs.getDocument({ data: fileData }).promise;
    const numPages = pdf.numPages;
    
    progressCallback(20);
    
    // Extract text from all pages
    let fullText = '';
    let currentPage = 1;
    
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + ' ';
      
      // Update progress (20-70%)
      currentPage = i;
      const extractionProgress = 20 + Math.floor((currentPage / numPages) * 50);
      progressCallback(extractionProgress);
    }
    
    progressCallback(70);
    
    // Analyze the extracted text to determine SVI factors
    const result = analyzeText(fullText);
    
    progressCallback(90);
    
    // Add a small delay to show progress to the user
    await new Promise(resolve => setTimeout(resolve, 500));
    
    progressCallback(100);
    
    return result;
  } catch (error) {
    console.error('Error analyzing pitch deck:', error);
    throw new Error('Failed to analyze the pitch deck');
  }
};

/**
 * Reads a file as ArrayBuffer for PDF processing
 */
const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file as ArrayBuffer'));
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Analyzes the extracted text to determine SVI factors
 * This is a simplified analysis that looks for keywords and patterns
 */
const analyzeText = (text: string): AnalysisResult => {
  const normalizedText = text.toLowerCase();
  const factors: Partial<SVIFactors> = {};
  
  // Market Size analysis
  if (containsKeywords(normalizedText, ['billion dollar market', 'huge market', 'massive opportunity', 'global market', 'growing market', 'multi-billion'])) {
    factors.marketSize = 0.8;
  } else if (containsKeywords(normalizedText, ['million dollar market', 'significant market', 'expanding market', 'substantial opportunity'])) {
    factors.marketSize = 0.6;
  } else if (containsKeywords(normalizedText, ['niche market', 'small market', 'growing segment'])) {
    factors.marketSize = 0.4;
  } else {
    factors.marketSize = 0.5; // Default value
  }
  
  // Barrier to Entry analysis
  if (containsKeywords(normalizedText, ['patent', 'proprietary technology', 'regulatory approval', 'high barrier', 'exclusive access'])) {
    factors.barrierToEntry = 0.8;
  } else if (containsKeywords(normalizedText, ['technical complexity', 'industry relationships', 'certification'])) {
    factors.barrierToEntry = 0.6;
  } else if (containsKeywords(normalizedText, ['easy to build', 'simple solution', 'low barriers'])) {
    factors.barrierToEntry = 0.3;
  } else {
    factors.barrierToEntry = 0.5; // Default value
  }
  
  // Defensibility analysis
  if (containsKeywords(normalizedText, ['network effect', 'patent protection', 'proprietary algorithm', 'exclusive', 'hard to replicate'])) {
    factors.defensibility = 0.8;
  } else if (containsKeywords(normalizedText, ['first mover advantage', 'brand loyalty', 'switching costs'])) {
    factors.defensibility = 0.6;
  } else if (containsKeywords(normalizedText, ['easily copied', 'commoditized', 'low switching cost'])) {
    factors.defensibility = 0.3;
  } else {
    factors.defensibility = 0.5; // Default value
  }
  
  // Team Factor analysis
  if (containsKeywords(normalizedText, ['experienced founder', 'serial entrepreneur', 'industry expert', 'successful exit', 'founding team'])) {
    factors.teamFactor = 0.9;
  } else if (containsKeywords(normalizedText, ['technical expertise', 'domain knowledge', 'previous startup', 'industry background'])) {
    factors.teamFactor = 0.7;
  } else if (containsKeywords(normalizedText, ['first time founder', 'learning', 'passionate', 'motivated'])) {
    factors.teamFactor = 0.5;
  } else {
    factors.teamFactor = 0.6; // Default value
  }
  
  // Competition Intensity analysis
  if (containsKeywords(normalizedText, ['no direct competitors', 'blue ocean', 'first to market', 'white space'])) {
    factors.competitionIntensity = 0.2;
  } else if (containsKeywords(normalizedText, ['fragmented market', 'outdated competitors', 'few competitors'])) {
    factors.competitionIntensity = 0.4;
  } else if (containsKeywords(normalizedText, ['competitive market', 'established players', 'many competitors'])) {
    factors.competitionIntensity = 0.7;
  } else {
    factors.competitionIntensity = 0.5; // Default value
  }
  
  // Capital Efficiency analysis
  if (containsKeywords(normalizedText, ['profitable', 'revenue generating', 'positive unit economics', 'low cost', 'bootstrap'])) {
    factors.capitalEfficiency = 0.8;
  } else if (containsKeywords(normalizedText, ['clear path to revenue', 'reasonable burn rate', 'capital efficient'])) {
    factors.capitalEfficiency = 0.6;
  } else if (containsKeywords(normalizedText, ['pre-revenue', 'heavy investment', 'long timeline', 'capital intensive'])) {
    factors.capitalEfficiency = 0.3;
  } else {
    factors.capitalEfficiency = 0.5; // Default value
  }
  
  // Generate text analysis
  const analysis = generateAnalysis(factors, normalizedText);
  
  return {
    factors,
    analysis
  };
};

/**
 * Checks if the text contains any of the specified keywords
 */
const containsKeywords = (text: string, keywords: string[]): boolean => {
  return keywords.some(keyword => text.includes(keyword));
};

/**
 * Generates a text analysis based on the extracted factors
 */
const generateAnalysis = (factors: Partial<SVIFactors>, text: string): string => {
  const insights: string[] = [];
  
  // Add insights based on market size
  if (factors.marketSize && factors.marketSize >= 0.7) {
    insights.push("Your startup is targeting a large market which is favorable for potential growth and investor interest.");
  } else if (factors.marketSize && factors.marketSize <= 0.4) {
    insights.push("The market size appears relatively small. Consider highlighting growth potential or expanding your addressable market.");
  }
  
  // Add insights based on barriers to entry and defensibility
  if (factors.barrierToEntry && factors.defensibility) {
    const avgMoat = (factors.barrierToEntry + factors.defensibility) / 2;
    if (avgMoat >= 0.7) {
      insights.push("Your startup has strong protective moats through barriers to entry and defensibility factors.");
    } else if (avgMoat <= 0.4) {
      insights.push("Your pitch could benefit from highlighting stronger differentiators or barriers that would protect from competition.");
    }
  }
  
  // Add team insights
  if (factors.teamFactor && factors.teamFactor >= 0.8) {
    insights.push("Your team's experience and expertise is a significant strength in your pitch.");
  } else if (factors.teamFactor && factors.teamFactor <= 0.5) {
    insights.push("Consider emphasizing team strengths or plans to add key expertise to strengthen your pitch.");
  }
  
  // Add capital efficiency insights
  if (factors.capitalEfficiency && factors.capitalEfficiency >= 0.7) {
    insights.push("The capital efficiency of your business model is attractive for investors looking for sustainable growth.");
  } else if (factors.capitalEfficiency && factors.capitalEfficiency <= 0.4) {
    insights.push("Your pitch might benefit from addressing capital efficiency and path to profitability more clearly.");
  }
  
  // Default analysis if no specific insights were generated
  if (insights.length === 0) {
    insights.push("Based on our analysis, your pitch deck contains standard elements but could benefit from more specific details about market size, defensibility, and team expertise.");
  }
  
  return insights.join(" ");
};
