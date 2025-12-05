
export enum Platform {
  TikTok = 'TikTok',
  YouTubeShorts = 'YouTube Shorts',
  FacebookReels = 'Facebook Reels',
}

export interface VideoSettings {
  aspectRatio: '9:16' | '16:9' | '1:1' | '4:5';
  duration: 'short' | 'medium' | 'long';
  visualStyle: string;
  contentFocus: string;
}

// Sub-interfaces for Analysis
export interface StructureAnalysis {
  format_type: string;
  hook_analysis: string;
  body_analysis: string;
  cta_analysis: string;
}

export interface PsychologyInsights {
  pains: string[];
  desires: string[];
  false_beliefs: string[];
}

export interface ContentIdea {
  id: string;
  title: string;
  short_description: string;
  video_type: string;
}

export interface AnalysisResult {
  summary: string;
  structure: StructureAnalysis;
  attraction_factors: string[];
  tone_of_voice: string;
  insights: PsychologyInsights;
  ideas: ContentIdea[];
}

// Sub-interfaces for Generation
export interface VisualIdea {
  thumbnail_description: string;
  ai_image_prompt: string;
}

export interface ScriptItem {
  idea_id: string;
  variant_index: number;
  title: string;
  script: string;
  caption: string;
  hashtags: string[];
  visual_ideas?: VisualIdea;
}

export interface PlatformContent {
  platform: string;
  items: ScriptItem[];
}

export interface GeneratedResult {
  platform_contents: PlatformContent[];
}

// Combined Result for Frontend
export interface ContentJobResult {
  analysis: AnalysisResult;
  generated: GeneratedResult;
}

export interface AppState {
  inputMode: 'text' | 'url';
  url: string;
  rawText: string;
  niche: string;
  tone: string;
  selectedPlatforms: Platform[];
  videoSettings: VideoSettings;
  isAnalyzing: boolean;
  isGenerating: boolean;
  analysis: AnalysisResult | null;
  scripts: PlatformContent[];
  error: string | null;
}
