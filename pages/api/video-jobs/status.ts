import type { NextApiRequest, NextApiResponse } from 'next';
import { getVideoJob } from '../../../lib/video-os/store';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const id = String(req.query.id || '');
  const token = String(req.query.token || '');
  if (!id || !token) return res.status(400).json({ error: 'Missing id or token.' });

  try {
    const job = await getVideoJob(id, token);
    if (!job) return res.status(404).json({ error: 'Job not found.' });
    return res.status(200).json(job);
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Unable to read job.' });
  }
}
