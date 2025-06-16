
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import OpenAI from "npm:openai";

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return new Response(JSON.stringify({ error: "imageUrl is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this restaurant menu image. For each food item, identify its name, a brief description, its FODMAP level (low, moderate, or high), a list of potential FODMAP concerns (e.g., "Garlic in dressing", "Wheat pasta"), and a list of potential alternatives or modifications (e.g., "Ask for dressing on side", "Replace croutons with nuts"). Structure the output as a JSON array of objects, where each object has the following keys: "name", "description", "fodmapLevel", "concerns", "alternatives". If you cannot determine some information, use an empty string or array as appropriate. Focus on common FODMAP triggers. Example: { "name": "Caesar Salad", "description": "Romaine lettuce, parmesan, croutons, caesar dressing", "fodmapLevel": "moderate", "concerns": ["Garlic in dressing", "Wheat croutons"], "alternatives": ["Ask for dressing on side", "Replace croutons with nuts"] }`,
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 2000,
    });

    const aiResponse = response.choices[0]?.message?.content;

    if (!aiResponse) {
      return new Response(JSON.stringify({ error: "Failed to get response from AI" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // Attempt to parse the JSON from the AI response
    // The AI might return text before or after the JSON block, so we need to extract it.
    const jsonMatch = aiResponse.match(/\s*(\[.*?\]|\{.*?\})\s*/s);
    let menuItems = [];
    if (jsonMatch && jsonMatch[1]) {
      try {
        menuItems = JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.error("Failed to parse AI response JSON:", e);
        console.error("Original AI response string:", aiResponse);
        return new Response(JSON.stringify({ error: "Failed to parse AI response JSON", details: aiResponse }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }
    } else {
      console.error("No JSON found in AI response.");
      console.error("Original AI response string:", aiResponse);
      return new Response(JSON.stringify({ error: "No JSON found in AI response", details: aiResponse }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
    

    return new Response(JSON.stringify(menuItems), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
