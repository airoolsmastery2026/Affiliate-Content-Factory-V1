
import { GeneratedResult, Platform, VideoSettings, AnalysisResult } from "../types";
import { OPENAI_GENERATE_PROMPT_TEMPLATE } from "../lib/prompts";

export const generateScripts = async (
  analysis: AnalysisResult,
  niche: string,
  platforms: Platform[],
  tone: string,
  videoSettings: VideoSettings,
  apiKey?: string // Optional: Allow client provided key
): Promise<GeneratedResult> => {
  
  // Logic: Use provided key -> Fallback to Env -> Error
  const keyToUse = apiKey || process.env.OPENAI_API_KEY;

  if (!keyToUse) throw new Error("OpenAI API Key is missing. Please set it in Settings or .env");

  const prompt = OPENAI_GENERATE_PROMPT_TEMPLATE
    .replace('{{NICHE}}', niche)
    .replace('{{PLATFORMS}}', JSON.stringify(platforms))
    .replace('{{GEMINI_JSON}}', JSON.stringify(analysis))
    .replace('{{TONE}}', tone)
    .replace('{{DURATION}}', videoSettings.duration)
    .replace('{{ASPECT_RATIO}}', videoSettings.aspectRatio)
    .replace('{{VISUAL_STYLE}}', videoSettings.visualStyle)
    .replace('{{CONTENT_FOCUS}}', videoSettings.contentFocus);

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${keyToUse}`
      },
      body: JSON.stringify({
        model: "gpt-4o", // Strong model for creative writing
        messages: [
          { role: "system", content: "You are an expert viral content creator and scriptwriter." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.8 // Higher temperature for creativity
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || "OpenAI API failed.");
    }

    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("OpenAI returned empty content.");

    return JSON.parse(content) as GeneratedResult;
  } catch (error: any) {
    console.error("OpenAI Generation Error:", error);
    throw new Error(`Script Generation Failed: ${error.message}`);
  }
};
