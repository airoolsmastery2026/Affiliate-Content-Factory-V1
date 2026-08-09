import type { NextApiRequest, NextApiResponse } from 'next';
import { reportVideoJob } from '../../../lib/video-os/store';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const workerToken = String(req.headers['x-video-worker-token'] || req.body?.workerToken || '');
  const { jobId, lockToken, outcome, result, error, qaScore } = req.body || {};
  if (!workerToken) return res.status(401).json({ error: 'Missing worker token.' });
  if (!jobId || !lockToken || !outcome) return res.status(400).json({ error: 'Missing jobId, lockToken or outcome.' });

  try {
    const job = await reportVideoJob({
      workerToken,
      jobId: String(jobId),
      lockToken: String(lockToken),
      outcome,
      result: result || null,
      error: error ? String(error) : null,
      qaScore: qaScore == null ? null : Number(qaScore),
    });
    return res.status(200).json(job);
  } catch (err: any) {
    const message = String(err?.message || 'Unable to report job.');
    const unauthorized = message.includes('unauthorized_worker');
    const invalidLock = message.includes('invalid_job_lock');
    return res.status(unauthorized ? 401 : invalidLock ? 409 : 500).json({ error: message });
  }
}
