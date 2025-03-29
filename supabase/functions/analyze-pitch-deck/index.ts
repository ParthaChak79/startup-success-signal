
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY');

if (!CLAUDE_API_KEY) {
  console.error("CLAUDE_API_KEY environment variable is not set!");
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify user authentication
    const authorization = req.headers.get('Authorization');
    if (!authorization) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process the request
    const reqData = await req.text();
    let reqJson;
    
    try {
      reqJson = JSON.parse(reqData);
    } catch (error) {
      console.error("Error parsing request JSON:", error, "Raw request:", reqData);
      return new Response(
        JSON.stringify({ error: 'Invalid request format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { text, fileName } = reqJson;
    
    // Validate the request
    if (!text) {
      return new Response(
        JSON.stringify({ error: 'Missing text parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if there's enough text content to analyze (minimum 50 characters)
    if (text.trim().length < 50) {
      console.log("Insufficient text content for analysis:", text.length, "characters");
      return new Response(
        JSON.stringify({ 
          result: JSON.stringify({
            isPitchDeck: false,
            parameters: {
              marketSize: 0,
              barrierToEntry: 0,
              defensibility: 0,
              insightFactor: 0,
              complexity: 0,
              riskFactor: 0,
              teamFactor: 0,
              marketTiming: 0,
              competitionIntensity: 0,
              capitalEfficiency: 0,
              distributionAdvantage: 0,
              businessModelViability: 0
            },
            explanation: "Insufficient text content was extracted from this file. The document may contain very little text or be primarily images."
          })
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // The prompt for Claude
    const systemPrompt = `
You are an expert startup investor and pitch deck analyzer. Your task is to extract and analyze key information from a startup pitch deck.

Evaluate the document on the following parameters. For each parameter, provide a numerical score between 0 and 1, where:
- 0 means no information was provided about this parameter
- 0.1-0.3 means weak or minimal information
- 0.4-0.6 means average or adequate information
- 0.7-0.9 means strong or compelling information
- 1.0 means exceptionally strong information

Parameters to evaluate:
1. marketSize: How large is the addressable market?
2. barrierToEntry: What barriers exist for new competitors?
3. defensibility: How well can the startup defend against competition?
4. insightFactor: How unique is their core insight?
5. complexity: How complex is their solution (technical/implementation)?
6. riskFactor: What is the overall risk profile?
7. teamFactor: How strong and experienced is the team?
8. marketTiming: Is the market timing optimal for this solution?
9. competitionIntensity: How intense is the competition?
10. capitalEfficiency: How efficiently can they convert investment into growth?
11. distributionAdvantage: Do they have advantages in distribution/customer acquisition?
12. businessModelViability: How viable is their business model?

IMPORTANT: If the document is NOT a startup pitch deck, or if it doesn't provide enough startup-related information to analyze, give ALL parameters a score of 0.

Return a JSON object with these scores and a determination of whether this is a pitch deck.
`;

    const userPrompt = `Analyze this document: ${text.substring(0, 15000)}${text.length > 15000 ? '... (truncated)' : ''} 
Filename: ${fileName || 'unknown'}

Respond with a JSON object containing:
1. "isPitchDeck": boolean - whether this document is a startup pitch deck
2. "parameters": object with numerical scores (0-1) for all 12 parameters
3. "explanation": brief explanation for each parameter score

If this is not a pitch deck, set all parameters to 0.`;

    console.log(`Processing analysis request for file: ${fileName || 'unknown'}`);
    
    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `${systemPrompt}\n\n${userPrompt}`
              }
            ]
          }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Claude API error:", errorData);
      return new Response(
        JSON.stringify({ error: errorData.error?.message || 'Failed to analyze with Claude' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const claudeResponse = await response.json();
    const content = claudeResponse.content[0].text;
    
    console.log("Successfully processed analysis request");

    // Return the result
    return new Response(
      JSON.stringify({ result: content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
