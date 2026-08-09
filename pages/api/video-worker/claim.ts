import type { NextApiRequest, NextApiResponse } from 'next';
import { claimVideoJob } from '../../../lib/video-os/store';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const workerToken = String(req.headers['x-video-worker-token'] || req.body?.workerToken || '');
  if (!workerToken) return res.status(401).json({ error: 'Missing worker token.' });

  try {
    const job = await claimVideoJob(workerToken);
    if (!job) return res.status(204).end();
    return res.status(200).json(job);
  } catch (error: any) {
    const unauthorized = String(error?.message || '').includes('unauthorized_worker');
    return res.status(unauthorized ? 401 : 500).json({ error: error?.message || 'Unable to claim job.' });
  }
}
