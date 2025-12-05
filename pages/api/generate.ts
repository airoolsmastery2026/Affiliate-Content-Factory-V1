
import type { NextApiRequest, NextApiResponse } from 'next';
import { scrapeContent } from '../../services/scraper';
import { analyzeContent } from '../../services/geminiService';
import { generateScripts } from '../../services/openaiService';
import { VideoSettings, Platform, ContentJobResult } from '../../types';

// Simple in-memory rate limit
const rateLimit = new Map<string, { count: number; startTime: number }>();
const LIMIT_WINDOW = 60 * 1000;
const MAX_REQUESTS = 20; // Increased limit for testing

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ContentJobResult | { error: string; detail?: any }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 1. Rate Limiting
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const clientLimit = rateLimit.get(ip) || { count: 0, startTime: now };

  if (now - clientLimit.startTime > LIMIT_WINDOW) {
    clientLimit.count = 1;
    clientLimit.startTime = now;
  } else {
    clientLimit.count++;
  }
  rateLimit.set(ip, clientLimit);

  if (clientLimit.count > MAX_REQUESTS) {
    return res.status(429).json({ error: 'Too many requests. Please wait a minute.' });
  }

  // 2. Validate Inputs
  const { 
    inputMode, 
    url, 
    rawText, 
    niche, 
    platforms, 
    tone, 
    videoSettings,
    geminiApiKey, 
    openaiApiKey 
  } = req.body;

  if (!niche || !platforms || platforms.length === 0) {
    return res.status(400).json({ error: 'Please provide a niche and select at least one platform.' });
  }

  try {
    // 3. Orchestration Step 1: Input Processing
    let textToAnalyze = rawText;
    
    if (inputMode === 'url') {
      if (!url) return res.status(400).json({ error: 'URL is required when Input Mode is set to URL.' });
      
      try {
        textToAnalyze = await scrapeContent(url);
      } catch (e: any) {
        console.error("Scraping failed:", e);
        return res.status(400).json({ error: `Scraping failed: ${e.message}` });
      }
    }

    if (!textToAnalyze || textToAnalyze.length < 50) {
      return res.status(400).json({ error: 'Content is too short or invalid to analyze.' });
    }

    // 4. Orchestration Step 2: Insight Engine (Gemini)
    // We pass the geminiApiKey (if provided by user) to the service
    const analysis = await analyzeContent(textToAnalyze, niche, geminiApiKey);

    // 5. Orchestration Step 3: Content Generator (OpenAI)
    // We pass the openaiApiKey (if provided by user) to the service
    const generated = await generateScripts(
      analysis, 
      niche, 
      platforms as Platform[], 
      tone, 
      videoSettings as VideoSettings,
      openaiApiKey
    );

    return res.status(200).json({
      analysis,
      generated
    });

  } catch (error: any) {
    console.error('API Orchestration Error:', error);
    
    // Check if the error object has a 'detail' property (set by our services for parsing errors)
    // If not, use the string representation of the error.
    const detail = (error as any).detail || error.toString();
    const message = error.message || 'Internal Server Error';

    return res.status(500).json({ 
      error: message,
      detail: detail 
    });
  }
}
