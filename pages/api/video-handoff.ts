import type { NextApiRequest, NextApiResponse } from 'next';
import { evaluateRenderGate } from '../../lib/loop/policy';

function makeId() {
  return `vh_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { sourceApp, content, platforms, viralScore, renderAttempts } = req.body || {};
  const normalizedPlatforms = Array.isArray(platforms)
    ? platforms
    : Array.isArray(content?.platforms)
      ? content.platforms
      : [];

  const gate = evaluateRenderGate({
    title: content?.title,
    script: content?.script,
    platforms: normalizedPlatforms,
    viralScore,
    renderAttempts,
  });

  if (!gate.allowed) {
    const retryBudgetExhausted = gate.reasons.includes('render_retry_budget_exhausted');
    return res.status(retryBudgetExhausted ? 409 : 422).json({
      error: retryBudgetExhausted ? 'Render retry budget exhausted.' : 'Render gate rejected the job.',
      stage: gate.stage,
      gate,
    });
  }

  const job = {
    id: makeId(),
    mode: 'cloud_preview',
    status: 'ready_for_local_worker',
    stage: gate.stage,
    sourceApp: sourceApp || 'unknown',
    createdAt: new Date().toISOString(),
    loop: {
      version: 1,
      gate: 'render',
      viralScore: viralScore ?? null,
      renderAttempts: Number(renderAttempts || 0),
      budget: gate.budget,
    },
    content: {
      title: String(content.title),
      script: String(content.script),
      caption: String(content.caption || ''),
      hashtags: Array.isArray(content.hashtags) ? content.hashtags.map(String) : [],
    },
    platforms: normalizedPlatforms.map(String),
    worker: {
      type: 'dhp-video-studio-local',
      endpoint: 'http://127.0.0.1:4173/api/niche/render',
      requiredForFinalRender: true,
    },
  };

  return res.status(200).json(job);
}
