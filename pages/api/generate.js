import { YoutubeTranscript } from 'youtube-transcript';
import * as cheerio from 'cheerio';
import { GoogleGenAI } from "@google/genai";

// TEMPLATE CHO GEMINI (INSIGHT ENGINE) - UPDATED FOR DEEP PSYCHOLOGY
const GEMINI_ANALYZE_PROMPT_TEMPLATE = `
Vai trò: Bạn là chuyên gia phân tích tâm lý khách hàng và chiến lược nội dung (Content Strategist).

Nhiệm vụ: Phân tích sâu nội dung đối thủ để tìm ra Insight tâm lý đắt giá nhất.

INPUT:
- Niche (Ngách): {{NICHE}}
- Raw text (Nội dung đối thủ):
"""
{{RAW_TEXT}}
"""

YÊU CẦU PHÂN TÍCH CHI TIẾT:
1. FORMAT & CẤU TRÚC
   - Loại nội dung (Review/Story/Tips...)?
   - Phân tích Hook (3s đầu): Tại sao nó giữ chân người xem?
   - Cấu trúc thuyết phục (Persuasion Structure) được sử dụng là gì?

2. TÂM LÝ HỌC KHÁCH HÀNG (QUAN TRỌNG NHẤT)
   Hãy đi sâu vào tâm trí khách hàng mục tiêu của ngách này:
   - **Nỗi đau thầm kín (Deep Pains):** Không chỉ là vấn đề bề mặt, họ thực sự sợ hãi điều gì? (Ví dụ: Không sợ béo, mà sợ chồng chán).
   - **Khao khát cháy bỏng (Ultimate Desires):** Trạng thái lý tưởng cuối cùng họ muốn đạt được là gì? (Ví dụ: Không chỉ là kiếm tiền, mà là tự do thời gian).
   - **Niềm tin sai lầm (False Beliefs):** Những rào cản tâm lý ngăn cản họ hành động mà nội dung này đã (hoặc cần) phá bỏ? (Ví dụ: "Phải giỏi công nghệ mới làm được AI").

3. Ý TƯỞNG NỘI DUNG MỚI
   - Đề xuất 10 ý tưởng nội dung MỚI.
   - Dựa trên các Insight tâm lý vừa tìm được ở trên.

ĐỊNH DẠNG OUTPUT (JSON):
{
  "summary": "...",
  "structure": {
    "format_type": "...",
    "hook_analysis": "...",
    "body_analysis": "...",
    "cta_analysis": "..."
  },
  "attraction_factors": ["..."],
  "insights": {
    "pains": [
      "Nỗi đau 1: ...",
      "Nỗi đau 2: ...",
      "Nỗi đau 3: ..."
    ],
    "desires": [
      "Khao khát 1: ...",
      "Khao khát 2: ..."
    ],
    "false_beliefs": [
      "Niềm tin sai lầm 1: ...",
      "Niềm tin sai lầm 2: ..."
    ]
  },
  "ideas": [
    {
      "id": "idea_1",
      "title": "...",
      "angle": "...",
      "video_type": "..."
    }
  ]
}
`;

// TEMPLATE CHO OPENAI (CONTENT GENERATOR + VISUALS)
const OPENAI_GENERATE_PROMPT_TEMPLATE = `
Vai trò: Bạn là Top 1 Kịch bản gia & Đạo diễn hình ảnh cho Video ngắn.

DỮ LIỆU ĐẦU VÀO:
- Ngách (Niche): {{NICHE}}
- Nền tảng: {{PLATFORMS}}
- Giọng điệu (Brand Voice): {{TONE_LABEL}}
- Insight từ đối thủ (Gemini): {{GEMINI_JSON}}

CẤU HÌNH KỸ THUẬT VIDEO (BẮT BUỘC TUÂN THỦ):
- Độ dài (Duration): {{DURATION_LABEL}} (Số lượng từ trong kịch bản phải khớp với thời lượng này).
- Tỷ lệ khung hình (Aspect Ratio): {{ASPECT_RATIO}} (Prompt AI Image phải được tối ưu cho tỷ lệ này).
- Phong cách hình ảnh (Visual Style): {{VISUAL_STYLE}}.
- Trọng tâm nội dung (Content Focus): {{CONTENT_FOCUS}}.

NHIỆM VỤ:
1. Chọn 2-3 ý tưởng tốt nhất từ Gemini phù hợp với trọng tâm "{{CONTENT_FOCUS}}".
2. Sáng tạo nội dung GỐC (Original Content). TUYỆT ĐỐI KHÔNG REWRITE.
3. SỬ DỤNG INSIGHT TÂM LÝ: Hãy lồng ghép các "Nỗi đau" và "Khao khát" đã phân tích được vào trong lời thoại.

YÊU CẦU KỊCH BẢN CHI TIẾT:
- Tuân thủ giọng điệu: {{TONE_LABEL}}.
- Độ dài kịch bản phải phù hợp với {{DURATION_LABEL}}.
- Cấu trúc: [HOOK gây tò mò] -> [Đánh vào Nỗi đau/Khao khát] -> [Giải pháp] -> [CTA].
- Visuals: Đề xuất ý tưởng Thumbnail và Prompt tạo ảnh AI phải mô tả rõ phong cách "{{VISUAL_STYLE}}" và tỷ lệ "{{ASPECT_RATIO}}".

ĐỊNH DẠNG OUTPUT (JSON):
{
  "platform_contents": [
    {
      "platform": "tiktok" | "youtube_shorts" | "facebook_reels",
      "items": [
        {
          "idea_id": "idea_1",
          "variant_index": 1,
          "title": "Tiêu đề giật tít (tối ưu click)",
          "script": "[Cảnh quay: Mô tả hình ảnh phong cách {{VISUAL_STYLE}}...] \nLời thoại: ...",
          "caption": "Caption ngắn + [LINK_AFFILIATE]",
          "hashtags": ["#tag1", "#tag2"],
          "visual_ideas": {
            "thumbnail_description": "Mô tả text trên thumbnail và hình ảnh thu hút...",
            "ai_image_prompt": "Prompt tiếng Anh chi tiết để tạo ảnh nền/thumbnail bằng Midjourney/Dall-E theo tỷ lệ {{ASPECT_RATIO}} và phong cách {{VISUAL_STYLE}}..."
          }
        }
      ]
    }
  ]
}
`;

// Helper: Clean JSON
function cleanJsonString(str) {
  if (!str) return "{}";
  let cleaned = str.replace(/```json/g, '').replace(/```/g, '').trim();
  return cleaned;
}

// Helper: Fetch Content from URL with Fallback
async function fetchContentFromUrl(url) {
  try {
    // Case 1: YouTube Link
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      try {
        const transcriptItems = await YoutubeTranscript.fetchTranscript(url);
        if (!transcriptItems || transcriptItems.length === 0) {
           throw new Error("Empty transcript");
        }
        return transcriptItems.map(item => item.text).join(' ');
      } catch (ytError) {
        console.warn("YouTube Transcript failed, attempting metadata fallback:", ytError.message);
        
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        const html = await response.text();
        const $ = cheerio.load(html);
        
        const title = $('meta[name="title"]').attr('content') || $('title').text() || 'No Title Found';
        const description = $('meta[name="description"]').attr('content') || '';
        
        if (title === 'No Title Found' && !description) {
           throw new Error("Could not fetch YouTube metadata.");
        }

        return `[SYSTEM NOTE: Transcript unavailable. Analyzing based on Metadata]\n\nVIDEO TITLE: ${title}\n\nVIDEO DESCRIPTION:\n${description}`;
      }
    }

    // Case 2: General Website
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const html = await response.text();
    const $ = cheerio.load(html);
    
    $('script, style, nav, header, footer').remove();
    
    const content = $('article').length ? $('article').text() : $('body').text();
    const cleanedContent = content.replace(/\s+/g, ' ').trim();

    if (cleanedContent.length < 50) {
      throw new Error("Nội dung trang web quá ngắn.");
    }

    return cleanedContent.substring(0, 15000);

  } catch (error) {
    console.error("Fetch URL Error:", error);
    throw new Error("Không thể lấy nội dung từ Link này. Vui lòng copy/paste text thủ công.");
  }
}

const TONE_MAP = {
  'chuyen_gia': 'Chuyên gia, uy tín, dựa trên số liệu.',
  'hai_huoc': 'Hài hước, lầy lội, giải trí, ngôn ngữ Gen Z.',
  'than_thien': 'Thân thiện, thủ thỉ, chân thành.',
  'thang_than': 'Thẳng thắn, "bóc phốt", đi ngược đám đông.',
  'storytelling': 'Kể chuyện (Storytelling), drama, cảm xúc.'
};

const DURATION_MAP = {
  'short': '15-30 giây (Tiết tấu nhanh, gãy gọn)',
  'medium': '30-60 giây (Tiêu chuẩn video ngắn)',
  'long': '60-90 giây (Đi sâu chi tiết)'
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Nhận thêm videoSettings từ body
  const { inputMode, url, rawText: userText, niche, platforms, tone, videoSettings } = req.body;

  // Key hệ thống từ process.env
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!process.env.API_KEY) return res.status(500).json({ message: "Thiếu Gemini API Key (process.env.API_KEY)." });
  if (!OPENAI_API_KEY) return res.status(500).json({ message: "Thiếu OpenAI API Key (process.env.OPENAI_API_KEY)." });

  try {
    // ---------------------------------------------------------
    // BƯỚC 0: LẤY NỘI DUNG
    // ---------------------------------------------------------
    let contentToAnalyze = userText;

    if (inputMode === 'url') {
      if (!url) return res.status(400).json({ message: 'Vui lòng nhập Link.' });
      contentToAnalyze = await fetchContentFromUrl(url);
    }

    if (!contentToAnalyze || contentToAnalyze.length < 50) {
      return res.status(400).json({ message: 'Nội dung quá ngắn hoặc không lấy được.' });
    }

    const toneLabel = TONE_MAP[tone] || TONE_MAP['chuyen_gia'];
    
    // Parse Video Settings
    const durationLabel = DURATION_MAP[videoSettings?.duration] || DURATION_MAP['medium'];
    const aspectRatio = videoSettings?.aspectRatio || '9:16';
    const visualStyle = videoSettings?.visualStyle || 'Cinematic';
    const contentFocus = videoSettings?.contentFocus || 'Chung';

    // ---------------------------------------------------------
    // BƯỚC 1: INSIGHT ENGINE (GEMINI)
    // ---------------------------------------------------------
    const geminiPrompt = GEMINI_ANALYZE_PROMPT_TEMPLATE
      .replace('{{NICHE}}', niche)
      .replace('{{RAW_TEXT}}', contentToAnalyze);

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const geminiResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: geminiPrompt,
        config: {
            responseMimeType: "application/json",
        }
    });

    const analysisText = geminiResponse.text;
    if (!analysisText) throw new Error("Gemini không trả về kết quả.");

    const analysisJson = JSON.parse(cleanJsonString(analysisText));

    // ---------------------------------------------------------
    // BƯỚC 2: CONTENT GENERATOR (OPENAI)
    // ---------------------------------------------------------
    const openAiPrompt = OPENAI_GENERATE_PROMPT_TEMPLATE
      .replace('{{NICHE}}', niche)
      .replace('{{PLATFORMS}}', JSON.stringify(platforms))
      .replace('{{TONE_LABEL}}', toneLabel)
      .replace('{{GEMINI_JSON}}', JSON.stringify(analysisJson))
      // Inject Technical Settings
      .replace(/{{DURATION_LABEL}}/g, durationLabel)
      .replace(/{{ASPECT_RATIO}}/g, aspectRatio)
      .replace(/{{VISUAL_STYLE}}/g, visualStyle)
      .replace(/{{CONTENT_FOCUS}}/g, contentFocus);

    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "Bạn là chuyên gia Content Creator." },
          { role: "user", content: openAiPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.8
      })
    });

    const openAiData = await openAiResponse.json();
    if (openAiData.error) throw new Error("OpenAI Error: " + openAiData.error.message);

    const generatedJson = JSON.parse(cleanJsonString(openAiData.choices?.[0]?.message?.content));

    res.status(200).json({
      analysis: analysisJson,
      generated: generatedJson
    });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: error.message });
  }
}