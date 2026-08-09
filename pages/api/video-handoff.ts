import type { NextApiRequest, NextApiResponse } from 'next';
import { evaluateRenderGate } from '../../lib/loop/policy';
import { enqueueVideoJob } from '../../lib/video-os/store';
import { scoreVideoCandidate } from '../../lib/video-os/viral-score';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { sourceApp, content, platforms, viralScore, renderAttempts } = req.body || {};
  const normalizedPlatforms = Array.isArray(platforms)
    ? platforms.map(String)
    : Array.isArray(content?.platforms)
      ? content.platforms.map(String)
      : [];

  const autoScore = scoreVideoCandidate(String(content?.title || ''), String(content?.script || ''));
  const finalViralScore = Number.isFinite(Number(viralScore)) ? Number(viralScore) : autoScore.score;

  const gate = evaluateRenderGate({
    title: content?.title,
    script: content?.script,
    platforms: normalizedPlatforms,
    viralScore: finalViralScore,
    renderAttempts,
  });

  if (!gate.allowed) {
    const retryBudgetExhausted = gate.reasons.includes('render_retry_budget_exhausted');
    return res.status(retryBudgetExhausted ? 409 : 422).json({
      error: retryBudgetExhausted ? 'Render retry budget exhausted.' : 'Render gate rejected the job.',
      stage: gate.stage,
      gate,
      viral: autoScore,
    });
  }

  try {
    const job = await enqueueVideoJob({
      sourceApp: String(sourceApp || 'affiliate-content-factory'),
      content: {
        title: String(content.title),
        script: String(content.script),
        caption: String(content.caption || ''),
        hashtags: Array.isArray(content.hashtags) ? content.hashtags.map(String) : [],
      },
      platforms: normalizedPlatforms,
      viralScore: finalViralScore,
      renderAttempts: Number(renderAttempts || 0),
    });

    if (!job) throw new Error('Queue did not return a job.');

    return res.status(200).json({
      id: job.id,
      accessToken: job.access_token,
      status: job.status,
      stage: job.stage,
      mode: 'durable_queue',
      viral: { ...autoScore, score: finalViralScore },
      gate,
      statusUrl: `/api/video-jobs/status?id=${encodeURIComponent(job.id)}&token=${encodeURIComponent(job.access_token)}`,
      worker: {
        mode: 'pull',
        claimEndpoint: '/api/video-worker/claim',
        reportEndpoint: '/api/video-worker/report',
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Unable to queue video job.' });
  }
}
