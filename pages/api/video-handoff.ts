import type { NextApiRequest, NextApiResponse } from 'next';

function makeId() {
  return `vh_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { sourceApp, content, platforms } = req.body || {};
  if (!content?.title || !content?.script) {
    return res.status(400).json({ error: 'Missing title or script.' });
  }

  const normalizedPlatforms = Array.isArray(platforms)
    ? platforms
    : Array.isArray(content.platforms)
      ? content.platforms
      : [];

  const job = {
    id: makeId(),
    mode: 'cloud_preview',
    status: 'ready_for_local_worker',
    sourceApp: sourceApp || 'unknown',
    createdAt: new Date().toISOString(),
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
