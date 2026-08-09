import type { NextApiRequest, NextApiResponse } from 'next';
import { markVideoPublished } from '../../../lib/video-os/store';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { id, token, platform, externalId, externalUrl } = req.body || {};
  if (!id || !token || !platform) {
    return res.status(400).json({ error: 'Missing id, token or platform.' });
  }

  try {
    const result = await markVideoPublished({
      jobId: String(id),
      accessToken: String(token),
      platform: String(platform),
      externalId: externalId ? String(externalId) : null,
      externalUrl: externalUrl ? String(externalUrl) : null,
    });
    return res.status(200).json(result);
  } catch (error: any) {
    const message = error?.message || 'Unable to mark job as published.';
    const status = message.includes('publish_gate_rejected') || message.includes('qa_score_below') ? 409 : message.includes('job_not_found') ? 404 : 500;
    return res.status(status).json({ error: message });
  }
}
