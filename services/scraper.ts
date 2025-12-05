import { YoutubeTranscript } from 'youtube-transcript';
import * as cheerio from 'cheerio';

export const scrapeContent = async (url: string): Promise<string> => {
  if (!url) throw new Error("URL is empty");

  try {
    // 1. YouTube Handling
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      try {
        const transcript = await YoutubeTranscript.fetchTranscript(url);
        if (!transcript || transcript.length === 0) {
          throw new Error("No transcript found for this video.");
        }
        return transcript.map(t => t.text).join(' ');
      } catch (ytError: any) {
        console.warn("YouTube transcript fetch failed:", ytError);
        throw new Error("Could not fetch YouTube transcript. The video might not have captions or is restricted.");
      }
    }

    // 2. General Website Handling
    // Note: This often hits CORS limits in client-side browsers. 
    // In a real production app, this should be done via a backend proxy.
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);

    // Cleanup: Remove scripts, styles, navs, footers to extract meaningful text
    $('script, style, nav, footer, header, noscript, iframe').remove();
    
    // Attempt to find the main article content
    let content = $('article').text() || $('main').text() || $('body').text();
    
    // Clean up whitespace
    content = content.replace(/\s+/g, ' ').trim();
    
    if (content.length < 50) {
      throw new Error("Could not extract enough text from this URL.");
    }

    return content.slice(0, 15000); // Limit to ~15k chars for token limits

  } catch (error: any) {
    console.error("Scraping Error:", error);
    // Provide a user-friendly error message regarding browser limitations
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error("Browser Security (CORS) blocked the request. Please copy/paste the text manually.");
    }
    throw error;
  }
};
