
import { GoogleGenAI } from "@google/genai";
import { AnalysisResult } from "../types";
import { GEMINI_ANALYZE_PROMPT_TEMPLATE } from "../lib/prompts";

export const analyzeContent = async (
  rawText: string, 
  niche: string, 
  apiKey?: string // Optional: Allow client provided key
): Promise<AnalysisResult> => {
  
  // Logic: Use provided key -> Fallback to Env -> Error
  // Note: We use process.env.API_KEY as the primary system env var for Gemini per guidelines, 
  // but allow fallback to GEMINI_API_KEY for legacy support.
  const keyToUse = apiKey || process.env.API_KEY || process.env.GEMINI_API_KEY;
  
  if (!keyToUse) throw new Error("Google Gemini API Key is missing. Please set it in Settings or .env");

  const ai = new GoogleGenAI({ apiKey: keyToUse });
  const model = "gemini-2.5-flash"; // Use the latest flash model for speed and context
  
  const prompt = GEMINI_ANALYZE_PROMPT_TEMPLATE
    .replace('{{NICHE}}', niche)
    .replace('{{RAW_TEXT}}', rawText);

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const text = response.text;
    if (!text) throw new Error("Gemini returned empty response.");

    // Clean up any potential markdown formatting in the JSON response
    const cleanedText = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    
    return JSON.parse(cleanedText) as AnalysisResult;
  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    throw new Error(`Gemini Analysis Failed: ${error.message}`);
  }
};
