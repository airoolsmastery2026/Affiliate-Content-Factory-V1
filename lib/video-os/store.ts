const SUPABASE_URL = process.env.VIDEO_OS_SUPABASE_URL || 'https://arzoyejaiuglmsyjjymu.supabase.co';
const SUPABASE_KEY = process.env.VIDEO_OS_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_msXKIm4uGP3a7hwBhctx7Q_soyFaKe1';

async function rpc<T>(name: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!response.ok) {
    const message = data?.message || data?.error || text || `Supabase RPC ${name} failed`;
    throw new Error(message);
  }
  return data as T;
}

export interface EnqueueInput {
  sourceApp: string;
  content: Record<string, unknown>;
  platforms: string[];
  viralScore?: number | null;
  renderAttempts?: number;
}

export async function enqueueVideoJob(input: EnqueueInput) {
  const rows = await rpc<any[]>('video_os_enqueue', {
    p_source_app: input.sourceApp,
    p_content: input.content,
    p_platforms: input.platforms,
    p_viral_score: input.viralScore ?? null,
    p_render_attempts: input.renderAttempts ?? 0,
  });
  return rows?.[0] || null;
}

export async function getVideoJob(id: string, accessToken: string) {
  const rows = await rpc<any[]>('video_os_get_job', {
    p_job_id: id,
    p_access_token: accessToken,
  });
  return rows?.[0] || null;
}

export async function claimVideoJob(workerToken: string) {
  const rows = await rpc<any[]>('video_os_claim', { p_worker_token: workerToken });
  return rows?.[0] || null;
}

export interface ReportInput {
  workerToken: string;
  jobId: string;
  lockToken: string;
  outcome: 'qa_passed' | 'qa_failed' | 'rendered' | 'failed';
  result?: Record<string, unknown> | null;
  error?: string | null;
  qaScore?: number | null;
}

export async function reportVideoJob(input: ReportInput) {
  const rows = await rpc<any[]>('video_os_report', {
    p_worker_token: input.workerToken,
    p_job_id: input.jobId,
    p_lock_token: input.lockToken,
    p_outcome: input.outcome,
    p_result: input.result ?? null,
    p_error: input.error ?? null,
    p_qa_score: input.qaScore ?? null,
  });
  return rows?.[0] || null;
}
