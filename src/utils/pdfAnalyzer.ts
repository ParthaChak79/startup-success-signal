
import { pdfjs } from 'react-pdf';
import { type SVIFactors } from './sviCalculator';

// Use the same worker configuration as in PdfViewer
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface AnalysisResult {
  factors: Partial<SVIFactors>;
  analysis: string;
  extractedText: string;
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
    
    return {
      ...result,
      extractedText: fullText
    };
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
 * This implementation follows a strict rule: if information about a parameter is not found,
 * a score of 0 will be applied as requested.
 */
const analyzeText = (text: string): Omit<AnalysisResult, 'extractedText'> => {
  const normalizedText = text.toLowerCase();
  const factors: Partial<SVIFactors> = {};
  const missingFactors: string[] = [];
  
  // Market Size analysis
  if (containsKeywords(normalizedText, ['billion dollar market', 'huge market', 'massive opportunity', 'global market', 'growing market', 'multi-billion'])) {
    factors.marketSize = 0.8;
  } else if (containsKeywords(normalizedText, ['million dollar market', 'significant market', 'expanding market', 'substantial opportunity'])) {
    factors.marketSize = 0.6;
  } else if (containsKeywords(normalizedText, ['niche market', 'small market', 'growing segment'])) {
    factors.marketSize = 0.4;
  } else if (normalizedText.includes('market size') || normalizedText.includes('target market') || normalizedText.includes('tam') || normalizedText.includes('addressable market')) {
    // If market is mentioned but not sized clearly, give a neutral score
    factors.marketSize = 0.5;
  } else {
    factors.marketSize = 0;
    missingFactors.push('Market Size');
  }
  
  // Barrier to Entry analysis
  if (containsKeywords(normalizedText, ['patent', 'proprietary technology', 'regulatory approval', 'high barrier', 'exclusive access'])) {
    factors.barrierToEntry = 0.8;
  } else if (containsKeywords(normalizedText, ['technical complexity', 'industry relationships', 'certification'])) {
    factors.barrierToEntry = 0.6;
  } else if (containsKeywords(normalizedText, ['easy to build', 'simple solution', 'low barriers'])) {
    factors.barrierToEntry = 0.3;
  } else if (normalizedText.includes('barrier') || normalizedText.includes('entry') || normalizedText.includes('competitive advantage')) {
    // If barriers are mentioned but not clearly described
    factors.barrierToEntry = 0.5;
  } else {
    factors.barrierToEntry = 0;
    missingFactors.push('Barrier to Entry');
  }
  
  // Defensibility analysis
  if (containsKeywords(normalizedText, ['network effect', 'patent protection', 'proprietary algorithm', 'exclusive', 'hard to replicate', 'moat'])) {
    factors.defensibility = 0.8;
  } else if (containsKeywords(normalizedText, ['first mover advantage', 'brand loyalty', 'switching costs'])) {
    factors.defensibility = 0.6;
  } else if (containsKeywords(normalizedText, ['easily copied', 'commoditized', 'low switching cost'])) {
    factors.defensibility = 0.3;
  } else if (normalizedText.includes('defensibility') || normalizedText.includes('protect') || normalizedText.includes('moat')) {
    factors.defensibility = 0.5;
  } else {
    factors.defensibility = 0;
    missingFactors.push('Defensibility');
  }
  
  // Insight Factor analysis
  if (containsKeywords(normalizedText, ['revolutionary', 'breakthrough', 'patented', 'unique insight', 'proprietary'])) {
    factors.insightFactor = 0.9;
  } else if (containsKeywords(normalizedText, ['innovative', 'novel approach', 'new solution'])) {
    factors.insightFactor = 0.7;
  } else if (containsKeywords(normalizedText, ['improvement', 'better than', 'enhancement'])) {
    factors.insightFactor = 0.5;
  } else if (normalizedText.includes('insight') || normalizedText.includes('idea') || normalizedText.includes('concept')) {
    factors.insightFactor = 0.4;
  } else {
    factors.insightFactor = 0;
    missingFactors.push('Insight Factor');
  }
  
  // Complexity analysis
  if (containsKeywords(normalizedText, ['highly complex', 'sophisticated technology', 'advanced algorithm'])) {
    factors.complexity = 0.8;
  } else if (containsKeywords(normalizedText, ['moderately complex', 'technical solution', 'specialized knowledge'])) {
    factors.complexity = 0.6;
  } else if (containsKeywords(normalizedText, ['simple', 'easy to use', 'user-friendly', 'straightforward'])) {
    factors.complexity = 0.3;
  } else if (normalizedText.includes('complex') || normalizedText.includes('technical') || normalizedText.includes('sophisticated')) {
    factors.complexity = 0.5;
  } else {
    factors.complexity = 0;
    missingFactors.push('Complexity');
  }
  
  // Risk Factor analysis
  if (containsKeywords(normalizedText, ['high risk', 'unproven', 'experimental', 'regulatory uncertainties'])) {
    factors.riskFactor = 0.8;
  } else if (containsKeywords(normalizedText, ['moderate risk', 'some challenges', 'potential obstacles'])) {
    factors.riskFactor = 0.6;
  } else if (containsKeywords(normalizedText, ['low risk', 'proven approach', 'established market'])) {
    factors.riskFactor = 0.3;
  } else if (normalizedText.includes('risk') || normalizedText.includes('challenge') || normalizedText.includes('obstacle')) {
    factors.riskFactor = 0.5;
  } else {
    factors.riskFactor = 0;
    missingFactors.push('Risk Factor');
  }
  
  // Team Factor analysis
  if (containsKeywords(normalizedText, ['experienced founder', 'serial entrepreneur', 'industry expert', 'successful exit', 'founding team'])) {
    factors.teamFactor = 0.9;
  } else if (containsKeywords(normalizedText, ['technical expertise', 'domain knowledge', 'previous startup', 'industry background'])) {
    factors.teamFactor = 0.7;
  } else if (containsKeywords(normalizedText, ['first time founder', 'learning', 'passionate', 'motivated'])) {
    factors.teamFactor = 0.5;
  } else if (normalizedText.includes('team') || normalizedText.includes('founder') || normalizedText.includes('leadership')) {
    factors.teamFactor = 0.4;
  } else {
    factors.teamFactor = 0;
    missingFactors.push('Team Factor');
  }
  
  // Market Timing analysis
  if (containsKeywords(normalizedText, ['perfect timing', 'growing trend', 'emerging market', 'increasing demand'])) {
    factors.marketTiming = 0.8;
  } else if (containsKeywords(normalizedText, ['good timing', 'favorable conditions', 'positive trend'])) {
    factors.marketTiming = 0.6;
  } else if (containsKeywords(normalizedText, ['early market', 'developing trend', 'future potential'])) {
    factors.marketTiming = 0.4;
  } else if (normalizedText.includes('timing') || normalizedText.includes('trend') || normalizedText.includes('market evolution')) {
    factors.marketTiming = 0.5;
  } else {
    factors.marketTiming = 0;
    missingFactors.push('Market Timing');
  }
  
  // Competition Intensity analysis
  if (containsKeywords(normalizedText, ['no direct competitors', 'blue ocean', 'first to market', 'white space'])) {
    factors.competitionIntensity = 0.2;
  } else if (containsKeywords(normalizedText, ['fragmented market', 'outdated competitors', 'few competitors'])) {
    factors.competitionIntensity = 0.4;
  } else if (containsKeywords(normalizedText, ['competitive market', 'established players', 'many competitors'])) {
    factors.competitionIntensity = 0.7;
  } else if (normalizedText.includes('competition') || normalizedText.includes('competitor') || normalizedText.includes('rival')) {
    factors.competitionIntensity = 0.5;
  } else {
    factors.competitionIntensity = 0;
    missingFactors.push('Competition Intensity');
  }
  
  // Capital Efficiency analysis
  if (containsKeywords(normalizedText, ['profitable', 'revenue generating', 'positive unit economics', 'low cost', 'bootstrap'])) {
    factors.capitalEfficiency = 0.8;
  } else if (containsKeywords(normalizedText, ['clear path to revenue', 'reasonable burn rate', 'capital efficient'])) {
    factors.capitalEfficiency = 0.6;
  } else if (containsKeywords(normalizedText, ['pre-revenue', 'heavy investment', 'long timeline', 'capital intensive'])) {
    factors.capitalEfficiency = 0.3;
  } else if (normalizedText.includes('revenue') || normalizedText.includes('cost') || normalizedText.includes('profit') || normalizedText.includes('funding')) {
    factors.capitalEfficiency = 0.5;
  } else {
    factors.capitalEfficiency = 0;
    missingFactors.push('Capital Efficiency');
  }
  
  // Distribution Advantage analysis
  if (containsKeywords(normalizedText, ['existing channels', 'strong distribution', 'viral growth', 'network effects'])) {
    factors.distributionAdvantage = 0.8;
  } else if (containsKeywords(normalizedText, ['established partnerships', 'go-to-market strategy', 'channel partners'])) {
    factors.distributionAdvantage = 0.6;
  } else if (containsKeywords(normalizedText, ['early traction', 'beginning to scale', 'exploring channels'])) {
    factors.distributionAdvantage = 0.4;
  } else if (normalizedText.includes('distribution') || normalizedText.includes('marketing') || normalizedText.includes('channels') || normalizedText.includes('customer acquisition')) {
    factors.distributionAdvantage = 0.5;
  } else {
    factors.distributionAdvantage = 0;
    missingFactors.push('Distribution Advantage');
  }
  
  // Business Model Viability analysis
  if (containsKeywords(normalizedText, ['proven business model', 'strong unit economics', 'highly scalable', 'recurring revenue'])) {
    factors.businessModelViability = 0.9;
  } else if (containsKeywords(normalizedText, ['clear business model', 'positive margins', 'sustainable economics'])) {
    factors.businessModelViability = 0.7;
  } else if (containsKeywords(normalizedText, ['developing business model', 'path to profitability', 'reasonable economics'])) {
    factors.businessModelViability = 0.5;
  } else if (normalizedText.includes('business model') || normalizedText.includes('revenue model') || normalizedText.includes('monetization')) {
    factors.businessModelViability = 0.4;
  } else {
    factors.businessModelViability = 0;
    missingFactors.push('Business Model Viability');
  }
  
  // Generate text analysis
  const analysis = generateAnalysis(factors, missingFactors);
  
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
const generateAnalysis = (factors: Partial<SVIFactors>, missingFactors: string[]): string => {
  const insights: string[] = [];
  
  // Add insights about missing factors
  if (missingFactors.length > 0) {
    insights.push(`Your pitch deck is missing information about: ${missingFactors.join(', ')}. Including these details could significantly improve your SVI score.`);
  }
  
  // Add insights based on market size
  if (factors.marketSize && factors.marketSize >= 0.7) {
    insights.push("Your startup is targeting a large market which is favorable for potential growth and investor interest.");
  } else if (factors.marketSize && factors.marketSize <= 0.4 && factors.marketSize > 0) {
    insights.push("The market size appears relatively small. Consider highlighting growth potential or expanding your addressable market.");
  } else if (factors.marketSize === 0) {
    insights.push("Your pitch deck doesn't clearly communicate market size. This is crucial for investors to understand the opportunity.");
  }
  
  // Add insights based on barriers to entry and defensibility
  if (factors.barrierToEntry && factors.defensibility) {
    const avgMoat = (factors.barrierToEntry + factors.defensibility) / 2;
    if (avgMoat >= 0.7) {
      insights.push("Your startup has strong protective moats through barriers to entry and defensibility factors.");
    } else if (avgMoat <= 0.4 && avgMoat > 0) {
      insights.push("Your pitch could benefit from highlighting stronger differentiators or barriers that would protect from competition.");
    }
  } else if (factors.barrierToEntry === 0 || factors.defensibility === 0) {
    insights.push("Your pitch should clearly articulate how you'll defend your market position and what barriers exist for competitors.");
  }
  
  // Add team insights
  if (factors.teamFactor && factors.teamFactor >= 0.8) {
    insights.push("Your team's experience and expertise is a significant strength in your pitch.");
  } else if (factors.teamFactor && factors.teamFactor <= 0.5 && factors.teamFactor > 0) {
    insights.push("Consider emphasizing team strengths or plans to add key expertise to strengthen your pitch.");
  } else if (factors.teamFactor === 0) {
    insights.push("Your pitch deck should highlight your team's expertise and relevant experience, as this is a key factor for investors.");
  }
  
  // Add business model insights
  if (factors.businessModelViability && factors.businessModelViability >= 0.7) {
    insights.push("Your business model appears strong and sustainable, which is attractive to investors.");
  } else if (factors.businessModelViability && factors.businessModelViability <= 0.4 && factors.businessModelViability > 0) {
    insights.push("Consider strengthening your business model explanation and unit economics to increase investor confidence.");
  } else if (factors.businessModelViability === 0) {
    insights.push("Your pitch deck should clearly explain your business model and how you plan to generate sustainable revenue.");
  }
  
  // Add capital efficiency insights
  if (factors.capitalEfficiency && factors.capitalEfficiency >= 0.7) {
    insights.push("The capital efficiency of your business model is attractive for investors looking for sustainable growth.");
  } else if (factors.capitalEfficiency && factors.capitalEfficiency <= 0.4 && factors.capitalEfficiency > 0) {
    insights.push("Your pitch might benefit from addressing capital efficiency and path to profitability more clearly.");
  } else if (factors.capitalEfficiency === 0) {
    insights.push("Include information about your capital efficiency and timeline to profitability to strengthen your pitch.");
  }
  
  // Default analysis if no specific insights were generated
  if (insights.length === 0) {
    insights.push("Based on our analysis, your pitch deck contains limited specific details about key startup factors. We recommend enhancing your pitch with more concrete information about market size, defensibility, team expertise, and business model.");
  }
  
  return insights.join(" ");
};
