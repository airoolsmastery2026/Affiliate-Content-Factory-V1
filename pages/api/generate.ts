
import type { NextApiRequest, NextApiResponse } from 'next';
import { scrapeContent } from '../../services/scraper';
import { analyzeContent } from '../../services/geminiService';
import { generateScripts } from '../../services/openaiService';
import { VideoSettings, Platform, ContentJobResult } from '../../types';

// Simple in-memory rate limit (Reset on server restart)
const rateLimit = new Map<string, { count: number; startTime: number }>();
const LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10;

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
    return res.status(429).json({ error: 'Too many requests. Please try again in a minute.' });
  }

  // 2. Validate Inputs
  const { 
    inputMode, 
    url, 
    rawText, 
    niche, 
    platforms, 
    tone, 
    videoSettings 
  } = req.body;

  if (!niche || !platforms || platforms.length === 0) {
    return res.status(400).json({ error: 'Missing niche or platforms.' });
  }

  try {
    // 3. Orchestration Step 1: Input Processing (Scraping)
    let textToAnalyze = rawText;
    if (inputMode === 'url') {
      if (!url) return res.status(400).json({ error: 'URL is missing.' });
      try {
        textToAnalyze = await scrapeContent(url);
      } catch (e: any) {
        return res.status(400).json({ error: `Scraping failed: ${e.message}` });
      }
    }

    if (!textToAnalyze || textToAnalyze.length < 50) {
      return res.status(400).json({ error: 'Content is too short to analyze.' });
    }

    // 4. Orchestration Step 2: Insight Engine (Gemini)
    const analysis = await analyzeContent(textToAnalyze, niche);

    // 5. Orchestration Step 3: Content Generator (OpenAI)
    const generated = await generateScripts(
      analysis, 
      niche, 
      platforms as Platform[], 
      tone, 
      videoSettings as VideoSettings
    );

    // 6. Return Result
    return res.status(200).json({
      analysis,
      generated
    });

  } catch (error: any) {
    console.error('API Orchestration Error:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal Server Error',
      detail: error.toString() 
    });
  }
}
