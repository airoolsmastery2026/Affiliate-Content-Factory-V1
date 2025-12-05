
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
        console.warn("YouTube transcript fetch failed, falling back to metadata:", ytError.message);
        
        // Fallback: Fetch Title and Description if transcript fails
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        const html = await response.text();
        const $ = cheerio.load(html);
        const title = $('meta[name="title"]').attr('content') || $('title').text();
        const description = $('meta[name="description"]').attr('content') || '';
        
        if (!title && !description) {
           throw new Error("Could not fetch YouTube metadata.");
        }

        return `[TRANSCRIPT UNAVAILABLE] Analysis based on metadata:\n\nTitle: ${title}\nDescription: ${description}`;
      }
    }

    // 2. General Website Handling
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);

    // Cleanup: Remove scripts, styles, navs, footers, ads
    $('script, style, nav, footer, header, noscript, iframe, svg, button, input, form').remove();
    
    // Attempt to find the main article content
    let content = $('article').text() || $('main').text() || $('div.content').text() || $('body').text();
    
    // Clean up whitespace
    content = content.replace(/\s+/g, ' ').trim();
    
    if (content.length < 50) {
      throw new Error("Could not extract meaningful text from this URL. It might be protected or empty.");
    }

    return content.slice(0, 15000); // Limit to ~15k chars for token efficiency

  } catch (error: any) {
    console.error("Scraping Error:", error);
    if (error.message.includes('fetch') || error.message.includes('Network')) {
      throw new Error("Server could not access this URL (Network/CORS error). Please paste the text manually.");
    }
    throw error;
  }
};
