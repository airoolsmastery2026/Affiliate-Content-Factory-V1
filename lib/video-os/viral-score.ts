export interface ViralScoreResult {
  score: number;
  signals: string[];
}

export function scoreVideoCandidate(title: string, script: string): ViralScoreResult {
  const t = title.trim();
  const s = script.trim();
  let score = 45;
  const signals: string[] = [];

  if (t.length >= 20 && t.length <= 90) { score += 8; signals.push('title_length_good'); }
  if (s.length >= 220 && s.length <= 1800) { score += 10; signals.push('script_length_good'); }
  if (/\?|tại sao|vì sao|bí mật|sai lầm|đừng|cách|how|why/i.test(`${t} ${s.slice(0, 180)}`)) {
    score += 10; signals.push('curiosity_hook');
  }
  if (/\b\d+\b/.test(t)) { score += 5; signals.push('specific_number'); }
  if (/nhưng|bất ngờ|thực ra|however|instead|until/i.test(s)) { score += 5; signals.push('pattern_interrupt'); }
  if (/hãy|xem|theo dõi|bình luận|lưu lại|chia sẻ|follow|comment|save|share/i.test(s.slice(-250))) {
    score += 5; signals.push('cta_present');
  }
  const sentences = s.split(/[.!?\n]+/).map(v => v.trim()).filter(Boolean);
  if (sentences.length >= 4) { score += 5; signals.push('multi_beat_structure'); }
  if (s.length < 100) { score -= 20; signals.push('too_short'); }
  if (t.length > 120) { score -= 10; signals.push('title_too_long'); }

  return { score: Math.max(0, Math.min(100, score)), signals };
}
