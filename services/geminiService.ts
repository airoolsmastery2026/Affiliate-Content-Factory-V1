
import { GoogleGenAI } from "@google/genai";
import { AnalysisResult } from "../types";
import { GEMINI_ANALYZE_PROMPT_TEMPLATE } from "../lib/prompts";

export const analyzeContent = async (rawText: string, niche: string): Promise<AnalysisResult> => {
  if (!process.env.API_KEY) throw new Error("API Key is missing.");

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-2.5-flash";
  
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

    // Clean markdown if present (though responseMimeType should handle it)
    const cleanedText = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    
    return JSON.parse(cleanedText) as AnalysisResult;
  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    throw new Error(`Gemini Analysis Failed: ${error.message}`);
  }
};
