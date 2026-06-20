import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { problemTitle, problemDescription } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const systemPrompt = `You are a practical problem-solving assistant for FixFare, a platform where people share daily life problems and solutions.

Your task is to provide practical, actionable solutions to everyday problems. Focus on:
1. Simple, easy-to-implement solutions
2. Product recommendations when helpful (mention generic product types, not specific brands)
3. Step-by-step instructions when needed
4. Budget-friendly options

Respond ONLY with raw JSON, no markdown fences, no preamble, in exactly this format:
{
  "solution": "Your detailed solution text here...",
  "productRecommendation": "Optional product name that could help",
  "productLink": null
}

Keep solutions concise but helpful (2-4 sentences). Be friendly and encouraging.`;

    const userPrompt = `Problem: ${problemTitle}

Details: ${problemDescription}

Please provide a practical solution.`;

    // Using Gemini's native generateContent endpoint directly with your own key.
    // Model: gemini-2.0-flash (fast + free-tier friendly). Swap below for a different model.
    const GEMINI_MODEL = "gemini-2.5-flash";
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.7,
          },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("Gemini API error:", response.status, text);
      throw new Error("Gemini API error");
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON response (strip markdown fences just in case)
    let parsed;
    try {
      const cleaned = content.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      // If JSON parsing fails, use the content as-is
      parsed = {
        solution: content,
        productRecommendation: null,
        productLink: null,
      };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Generate solution error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
