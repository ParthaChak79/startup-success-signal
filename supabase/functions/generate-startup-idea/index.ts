
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// Get API key from environment variables
const claudeApiKey = Deno.env.get('CLAUDE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Check if API key is available before proceeding
  if (!claudeApiKey) {
    console.error("Claude API key is not configured");
    return new Response(
      JSON.stringify({
        error: "Claude API key is not configured in Supabase secrets",
        details: "Please add your Claude API key to the Edge Function secrets"
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }

  try {
    // Extract any specific parameters from the request
    const { industry, focus } = await req.json().catch(() => ({}));

    // Create the prompt for generating a startup idea
    const systemPrompt = `You are an expert startup advisor with deep knowledge of venture capital, market trends, and business opportunities.
Your task is to generate innovative startup ideas that would score well on the following parameters:

1. marketSize: How large is the addressable market? (0-1 scale)
2. barrierToEntry: What barriers exist for new competitors? (0-1 scale)
3. defensibility: How well can the startup defend against competition? (0-1 scale) 
4. insightFactor: How unique is their core insight? (0-1 scale)
5. complexity: How complex is their solution (technical/implementation)? (0-1 scale) 
6. riskFactor: What is the overall risk profile? (0-1 scale, lower is better)
7. teamFactor: How strong and experienced is the team? (0-1 scale)
8. marketTiming: Is the market timing optimal for this solution? (0-1 scale)
9. competitionIntensity: How intense is the competition? (0-1 scale, lower is better)
10. capitalEfficiency: How efficiently can they convert investment into growth? (0-1 scale)
11. distributionAdvantage: Do they have advantages in distribution/customer acquisition? (0-1 scale)
12. businessModelViability: How viable is their business model? (0-1 scale)

Create a detailed startup idea that would perform well across these parameters. For the idea, provide:
1. A clear startup name
2. A concise description of what the startup does
3. A brief explanation of why this idea would score well
4. Specific scores for each of the 12 parameters (on a 0-1 scale)
5. A short explanation for each parameter score

Format your response as a valid JSON object with these fields:
- name: string (startup name)
- description: string (description of the startup)
- overview: string (explanation of why this idea would score well)
- factors: object (with each parameter as a key and its score as a numeric value)
- explanations: object (with each parameter as a key and its explanation as a string value)
`;

    const userPrompt = industry || focus 
      ? `Generate a startup idea ${industry && industry !== "any" ? `in the ${industry} industry` : ""}${focus && focus !== "any" ? ` focused on ${focus}` : ""}.`
      : "Generate an innovative startup idea that would score well across all the evaluation parameters.";

    console.log(`Generating startup idea with prompt: ${userPrompt}`);
    
    // Call Claude API with the correct format (system as a top-level parameter)
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        system: systemPrompt,  // System prompt as a top-level parameter
        messages: [
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Claude API Error:', data);
      throw new Error(data.error?.message || 'Error calling Claude API');
    }

    // Extract the AI response
    const aiContent = data.content && data.content[0] && data.content[0].text;
    if (!aiContent) {
      throw new Error('Invalid response format from Claude API');
    }
    
    console.log('Raw AI response:', aiContent.substring(0, 200) + '...');
    
    // Parse the JSON from the AI response
    let ideaData;
    try {
      // Try to extract JSON from the response if it's wrapped in markdown code blocks
      const jsonMatch = aiContent.match(/```json\n([\s\S]*?)\n```/) || 
                        aiContent.match(/```\n([\s\S]*?)\n```/) ||
                        aiContent.match(/({[\s\S]*})/);
                        
      if (jsonMatch && jsonMatch[1]) {
        ideaData = JSON.parse(jsonMatch[1]);
      } else {
        ideaData = JSON.parse(aiContent);
      }
      
      // Ensure all factors are numbers between 0 and 1
      if (ideaData.factors) {
        Object.keys(ideaData.factors).forEach(key => {
          ideaData.factors[key] = Math.min(1, Math.max(0, Number(ideaData.factors[key]) || 0));
        });
      }
      
      // Return the ideaData
      return new Response(JSON.stringify(ideaData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
      
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      return new Response(
        JSON.stringify({ error: 'Failed to parse AI response', details: parseError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Error in generate-startup-idea function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
