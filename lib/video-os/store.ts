const VIDEO_OS_BRIDGE_URL = (
  process.env.VIDEO_OS_BRIDGE_URL ||
  'https://arzoyejaiuglmsyjjymu.supabase.co/functions/v1/dhp-video-os-bridge'
).replace(/\/$/, '');

function bridgeHeaders(workerToken?: string): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (workerToken) {
    headers['x-video-worker-token'] = workerToken;
    return headers;
  }

  const oidcToken = process.env.VERCEL_OIDC_TOKEN?.trim();
  if (oidcToken) {
    headers.Authorization = `Bearer ${oidcToken}`;
    return headers;
  }

  const dhpKey = process.env.VIDEO_OS_DHP_KEY?.trim();
  if (dhpKey) {
    headers.Authorization = dhpKey.startsWith('DHP-Key ') ? dhpKey : `DHP-Key ${dhpKey}`;
    return headers;
  }

  throw new Error('Video OS bridge credentials are unavailable. Enable Vercel OIDC or configure VIDEO_OS_DHP_KEY.');
}

async function bridgeRequest<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST';
    body?: Record<string, unknown>;
    workerToken?: string;
  } = {},
): Promise<T | null> {
  const response = await fetch(`${VIDEO_OS_BRIDGE_URL}${path}`, {
    method: options.method || 'GET',
    headers: bridgeHeaders(options.workerToken),
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  });

  if (response.status === 204) return null;

  const text = await response.text();
  let payload: any = null;
  try { payload = text ? JSON.parse(text) : null; } catch { payload = text; }

  if (!response.ok) {
    const message = payload?.error || payload?.message || text || `Video OS bridge failed with HTTP ${response.status}`;
    throw new Error(message);
  }

  if (payload && typeof payload === 'object' && !Array.isArray(payload) && 'data' in payload) {
    return payload.data as T;
  }
  return payload as T;
}

export interface EnqueueInput {
  sourceApp: string;
  content: Record<string, unknown>;
  platforms: string[];
  viralScore?: number | null;
  renderAttempts?: number;
}

export async function enqueueVideoJob(input: EnqueueInput) {
  return bridgeRequest<any>('/v1/video-os/jobs', {
    method: 'POST',
    body: {
      content: {
        ...input.content,
        sourceApp: input.sourceApp,
      },
      platforms: input.platforms,
      viralScore: input.viralScore ?? null,
      renderAttempts: input.renderAttempts ?? 0,
    },
  });
}

export async function getVideoJob(id: string, accessToken: string) {
  return bridgeRequest<any>(
    `/v1/video-os/jobs/${encodeURIComponent(id)}?token=${encodeURIComponent(accessToken)}`,
  );
}

export async function claimVideoJob(workerToken: string) {
  return bridgeRequest<any>('/v1/video-os/claim', {
    method: 'POST',
    body: {},
    workerToken,
  });
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
  return bridgeRequest<any>('/v1/video-os/report', {
    method: 'POST',
    workerToken: input.workerToken,
    body: {
      jobId: input.jobId,
      lockToken: input.lockToken,
      outcome: input.outcome,
      result: input.result ?? null,
      error: input.error ?? null,
      qaScore: input.qaScore ?? null,
    },
  });
}

export interface MarkPublishedInput {
  jobId: string;
  accessToken: string;
  platform: string;
  externalId?: string | null;
  externalUrl?: string | null;
}

export async function markVideoPublished(input: MarkPublishedInput) {
  return bridgeRequest<any>(`/v1/video-os/jobs/${encodeURIComponent(input.jobId)}/published`, {
    method: 'POST',
    body: {
      accessToken: input.accessToken,
      platform: input.platform,
      externalId: input.externalId ?? '',
      externalUrl: input.externalUrl ?? '',
    },
  });
}

export interface RecordMetricsInput {
  jobId: string;
  accessToken: string;
  platform: string;
  metrics: Record<string, unknown>;
}

export async function recordVideoMetrics(input: RecordMetricsInput) {
  return bridgeRequest<any>(`/v1/video-os/jobs/${encodeURIComponent(input.jobId)}/metrics`, {
    method: 'POST',
    body: {
      accessToken: input.accessToken,
      platform: input.platform,
      metrics: input.metrics,
    },
  });
}
