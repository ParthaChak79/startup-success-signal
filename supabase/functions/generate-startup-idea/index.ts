
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

  console.log('Generate startup idea function called');

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
    // Extract parameters from the request
    let requestBody = {};
    try {
      requestBody = await req.json();
      console.log('Request body received:', requestBody);
    } catch (jsonError) {
      console.log('No JSON body provided, using empty object');
    }

    const { industry, focus, continent, country, timestamp } = requestBody;

    // Create the prompt for generating a startup idea with maximum creativity
    const systemPrompt = `You are an expert startup advisor with deep knowledge of venture capital, market trends, and business opportunities.
Your task is to generate HIGHLY CREATIVE and INNOVATIVE startup ideas that would score well on the following parameters:

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

IMPORTANT INSTRUCTIONS:
- Be extremely bold, unconventional and think outside the box
- Generate a COMPLETELY UNIQUE idea each time - never repeat previous ideas
- Use widely varied scores across parameters (some high, some medium, some low - make it realistic)
- Consider cross-industry innovations and unexpected combinations
- Think of problems that don't have obvious solutions yet
- Combine emerging technologies in novel ways
- The more unique and creative the idea, the better
- Do not follow safe or common startup patterns
- Be willing to suggest risky but potentially revolutionary ideas

Format your response as a valid JSON object with these fields:
- name: string (startup name)
- description: string (description of the startup)
- overview: string (explanation of why this idea would score well)
- factors: object (with each parameter as a key and its score as a numeric value)
- explanations: object (with each parameter as a key and its explanation as a string value)

CRITICAL: Each request MUST produce a completely different idea than any you've suggested before. Think of the most unexpected startup ideas possible.`;

    // Construct user prompt based on provided parameters
    let userPrompt = "Generate an extremely innovative and unique startup idea";
    
    // Add industry if provided
    if (industry && industry !== "any") {
      userPrompt += ` in the ${industry} industry`;
    }
    
    // Add focus if provided
    if (focus && focus !== "any") {
      userPrompt += ` focused on ${focus}`;
    }
    
    // Add location information if provided
    if (continent && continent !== "any") {
      userPrompt += ` based in ${continent}`;
      
      if (country && country !== "any") {
        userPrompt += `, specifically in ${country}`;
      }
    }
    
    // Add maximum randomness factors to ensure uniqueness
    const randomFactor = Math.random().toString(36).substring(2, 15);
    const randomSeed = Math.floor(Math.random() * 1000000);
    const currentTime = new Date().toISOString();
    userPrompt += `. Make this idea completely unique, unexpected, and different from any previous ideas. Think of the most unconventional startup concepts. (Request ID: ${randomFactor}, Seed: ${randomSeed}, Timestamp: ${timestamp || currentTime})`;

    console.log(`Generating startup idea with prompt: ${userPrompt.substring(0, 100)}...`);
    
    // Call Claude API with maximum temperature for creativity
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt }
        ],
        temperature: 1.0, // Maximum temperature for maximum creativity and variety
        max_tokens: 2500,
      }),
    });

    console.log('Claude API response status:', claudeResponse.status);

    if (!claudeResponse.ok) {
      const errorData = await claudeResponse.text();
      console.error('Claude API Error:', errorData);
      throw new Error(`Claude API error: ${claudeResponse.status} - ${errorData}`);
    }

    const data = await claudeResponse.json();
    console.log('Claude API response received');
    
    // Extract the AI response
    const aiContent = data.content && data.content[0] && data.content[0].text;
    if (!aiContent) {
      console.error('Invalid response format from Claude API:', JSON.stringify(data));
      throw new Error('Invalid response format from Claude API');
    }
    
    console.log('Raw AI response length:', aiContent.length);
    
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
      
      // Normalize the factors to ensure they're valid numbers between 0 and 1
      // Allow for realistic variance in scores
      if (ideaData.factors) {
        Object.keys(ideaData.factors).forEach(key => {
          const rawValue = Number(ideaData.factors[key]) || 0;
          // Ensure values are between 0 and 1, but allow natural variance
          ideaData.factors[key] = Math.min(1, Math.max(0, rawValue));
        });
      }
      
      console.log('Successfully parsed startup idea:', ideaData.name);
      
      // Return the ideaData
      return new Response(JSON.stringify(ideaData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
      
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('AI response content:', aiContent.substring(0, 500));
      return new Response(
        JSON.stringify({ 
          error: 'Failed to parse AI response', 
          details: parseError.message,
          rawResponse: aiContent.substring(0, 200) + '...'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Error in generate-startup-idea function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error occurred',
        details: error.stack || 'No stack trace available'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
