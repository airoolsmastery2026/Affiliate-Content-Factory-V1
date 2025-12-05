
// GEMINI PROMPT: INSIGHT ENGINE
export const GEMINI_ANALYZE_PROMPT_TEMPLATE = `
Vai trò: Bạn là chuyên gia phân tích tâm lý khách hàng và chiến lược nội dung (Content Strategist).
Nhiệm vụ: Phân tích sâu nội dung đối thủ để tìm ra Insight tâm lý đắt giá nhất.

INPUT:
- Niche (Ngách): {{NICHE}}
- Raw text (Nội dung đối thủ):
"""
{{RAW_TEXT}}
"""

YÊU CẦU TRẢ VỀ JSON (KHÔNG MÔ TẢ THÊM):
{
  "summary": "Tóm tắt 5-10 câu",
  "structure": {
    "format_type": "Review/Story/Tips/...",
    "hook_analysis": "Phân tích 3s đầu",
    "body_points": ["Luận điểm 1", "..."],
    "closing_cta": "Phân tích CTA"
  },
  "attraction_factors": ["Yếu tố thu hút 1", "..."],
  "tone_of_voice": "Mô tả giọng điệu",
  "insights": {
    "pains": ["Nỗi đau thầm kín 1", "Nỗi đau 2"],
    "desires": ["Khao khát cháy bỏng 1", "Khao khát 2"],
    "false_beliefs": ["Niềm tin sai lầm 1", "Rào cản tâm lý 2"]
  },
  "ideas": [
    {
      "id": "idea_1",
      "title": "Tiêu đề ý tưởng mới",
      "short_description": "Mô tả ngắn gọn",
      "video_type": "review|story|tips"
    }
  ]
}
`;

// OPENAI PROMPT: CONTENT GENERATOR
export const OPENAI_GENERATE_PROMPT_TEMPLATE = `
Vai trò: Bạn là chuyên gia sáng tạo nội dung video ngắn. Dưới đây là JSON phân tích từ Gemini: {{GEMINI_JSON}}.

INPUT SETTINGS:
- Niche: {{NICHE}}
- Platforms: {{PLATFORMS}}
- Tone: {{TONE}}
- Duration: {{DURATION}}
- Aspect Ratio: {{ASPECT_RATIO}}
- Visual Style: {{VISUAL_STYLE}}
- Content Focus: {{CONTENT_FOCUS}}

NHIỆM VỤ:
1. Chọn 2-3 ý tưởng tốt nhất từ Gemini.
2. Với mỗi Platform, tạo ít nhất 2 variants.
3. Hook phải cực mạnh trong 3s đầu.
4. Lồng ghép Insight (Pains/Desires) vào kịch bản.

YÊU CẦU TRẢ VỀ JSON (KHÔNG MÔ TẢ THÊM):
{
  "platform_contents": [
    {
      "platform": "tiktok", // hoặc youtube_shorts, facebook_reels
      "items": [
        {
          "idea_id": "idea_1",
          "variant_index": 1,
          "title": "Tiêu đề tối ưu click",
          "script": "Kịch bản chi tiết (gồm Lời thoại + Mô tả cảnh quay)...",
          "caption": "Caption thu hút + CTA [LINK_AFFILIATE]",
          "hashtags": ["#tag1", "#tag2"],
          "visual_ideas": {
            "thumbnail_description": "Mô tả text/hình ảnh thumbnail",
            "ai_image_prompt": "Prompt tiếng Anh cho Midjourney tạo thumbnail tỷ lệ {{ASPECT_RATIO}}, phong cách {{VISUAL_STYLE}}"
          }
        }
      ]
    }
  ]
}
`;
