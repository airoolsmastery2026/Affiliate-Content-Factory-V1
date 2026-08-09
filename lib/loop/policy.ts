export type LoopStage =
  | 'discovered'
  | 'scored'
  | 'selected'
  | 'scripted'
  | 'directed'
  | 'assets_ready'
  | 'rendering'
  | 'qa_failed'
  | 'qa_passed'
  | 'scheduled'
  | 'published'
  | 'measured'
  | 'learned'
  | 'needs_review';

export interface LoopBudget {
  maxRenderRetries: number;
  maxAssetRegenerations: number;
  maxVideosPerDay: number;
  minViralScoreToRender: number;
  minQaScoreToPublish: number;
}

export const DEFAULT_LOOP_BUDGET: LoopBudget = {
  maxRenderRetries: 3,
  maxAssetRegenerations: 2,
  maxVideosPerDay: 5,
  minViralScoreToRender: 65,
  minQaScoreToPublish: 80,
};

export interface GateInput {
  title?: unknown;
  script?: unknown;
  platforms?: unknown;
  viralScore?: unknown;
  renderAttempts?: unknown;
}

export interface GateResult {
  allowed: boolean;
  stage: LoopStage;
  reasons: string[];
  budget: LoopBudget;
}

function asNumber(value: unknown): number | undefined {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function evaluateRenderGate(input: GateInput, budget: LoopBudget = DEFAULT_LOOP_BUDGET): GateResult {
  const reasons: string[] = [];
  const title = typeof input.title === 'string' ? input.title.trim() : '';
  const script = typeof input.script === 'string' ? input.script.trim() : '';
  const platforms = Array.isArray(input.platforms) ? input.platforms.filter(Boolean) : [];
  const viralScore = asNumber(input.viralScore);
  const renderAttempts = asNumber(input.renderAttempts) ?? 0;

  if (!title) reasons.push('missing_title');
  if (script.length < 50) reasons.push('script_too_short');
  if (platforms.length === 0) reasons.push('missing_platform');
  if (viralScore !== undefined && viralScore < budget.minViralScoreToRender) reasons.push('viral_score_below_threshold');
  if (renderAttempts >= budget.maxRenderRetries) reasons.push('render_retry_budget_exhausted');

  return {
    allowed: reasons.length === 0,
    stage: reasons.includes('render_retry_budget_exhausted') ? 'needs_review' : reasons.length ? 'scripted' : 'directed',
    reasons,
    budget,
  };
}
