import type { NextApiRequest, NextApiResponse } from 'next';
import { recordVideoMetrics } from '../../../lib/video-os/store';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { id, token, platform, metrics } = req.body || {};
  if (!id || !token || !platform || !metrics || typeof metrics !== 'object') {
    return res.status(400).json({ error: 'Missing id, token, platform or metrics.' });
  }

  try {
    const result = await recordVideoMetrics({
      jobId: String(id),
      accessToken: String(token),
      platform: String(platform),
      metrics,
    });
    return res.status(200).json(result);
  } catch (error: any) {
    const message = error?.message || 'Unable to record metrics.';
    const status = message.includes('job_not_published') ? 409 : message.includes('job_not_found') ? 404 : 500;
    return res.status(status).json({ error: message });
  }
}
