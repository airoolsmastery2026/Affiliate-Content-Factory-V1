import { spawnSync } from 'node:child_process';

const controller = process.env.VIDEO_OS_CONTROLLER_URL || 'https://affiliate-content-factory-v1.vercel.app';
const studio = process.env.DHP_VIDEO_STUDIO_URL || 'http://127.0.0.1:4173';
const workerToken = process.env.DHP_WORKER_TOKEN || '';
const pollMs = Number(process.env.VIDEO_WORKER_POLL_MS || 8000);

if (!workerToken) {
  console.error('Missing DHP_WORKER_TOKEN.');
  process.exit(1);
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function jsonFetch(url, options = {}) {
  const response = await fetch(url, options);
  if (response.status === 204) return { response, data: null };
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  return { response, data };
}

async function claim() {
  const { response, data } = await jsonFetch(`${controller}/api/video-worker/claim`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-video-worker-token': workerToken },
    body: '{}',
  });
  if (response.status === 204) return null;
  if (!response.ok) throw new Error(data?.error || `Claim failed: ${response.status}`);
  return data;
}

async function submitToStudio(job) {
  const payload = {
    sourceApp: job.source_app || 'video-os-worker',
    content: job.content,
    platforms: job.platforms,
    title: job.content?.title,
    text: job.content?.script,
    caption: job.content?.caption,
    hashtags: job.content?.hashtags,
  };
  const { response, data } = await jsonFetch(`${studio}/api/niche/render`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(data?.error || `Video Studio rejected job: ${response.status}`);
  return data;
}

async function waitForStudio(jobId) {
  const deadline = Date.now() + 20 * 60 * 1000;
  while (Date.now() < deadline) {
    const { response, data } = await jsonFetch(`${studio}/api/jobs/${encodeURIComponent(jobId)}`);
    if (!response.ok) throw new Error(data?.error || `Cannot read local job: ${response.status}`);
    if (data.status === 'done') return data;
    if (data.status === 'error') throw new Error(data.error || 'Local render failed');
    await sleep(2500);
  }
  throw new Error('Local render timeout');
}

function probeVideo(videoUrl) {
  const probe = spawnSync('ffprobe', [
    '-v', 'error', '-show_entries', 'format=duration:stream=codec_type,width,height',
    '-of', 'json', videoUrl,
  ], { encoding: 'utf8' });
  if (probe.status !== 0) return { score: 0, reasons: ['ffprobe_failed'], metadata: null };

  let metadata;
  try { metadata = JSON.parse(probe.stdout || '{}'); } catch { return { score: 0, reasons: ['ffprobe_invalid_json'], metadata: null }; }
  const streams = Array.isArray(metadata.streams) ? metadata.streams : [];
  const video = streams.find(s => s.codec_type === 'video');
  const audio = streams.find(s => s.codec_type === 'audio');
  const duration = Number(metadata.format?.duration || 0);
  let score = 50;
  const reasons = [];
  if (video) { score += 10; reasons.push('video_stream'); }
  if (audio) { score += 10; reasons.push('audio_stream'); }
  if (video?.height > video?.width) { score += 15; reasons.push('vertical_format'); }
  if (video?.height >= 960) { score += 10; reasons.push('resolution_ok'); }
  if (duration >= 8 && duration <= 120) { score += 5; reasons.push('duration_ok'); }
  return { score: Math.min(100, score), reasons, metadata };
}

async function report(job, outcome, result = null, error = null, qaScore = null) {
  const { response, data } = await jsonFetch(`${controller}/api/video-worker/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-video-worker-token': workerToken },
    body: JSON.stringify({ jobId: job.id, lockToken: job.lock_token, outcome, result, error, qaScore }),
  });
  if (!response.ok) throw new Error(data?.error || `Report failed: ${response.status}`);
  return data;
}

async function processJob(job) {
  console.log(`[worker] claimed ${job.id} attempt ${job.attempts}`);
  try {
    const local = await submitToStudio(job);
    const finished = await waitForStudio(local.id);
    const videoUrl = `${studio}${finished.videoUrl}`;
    const qa = probeVideo(videoUrl);
    const result = {
      videoUrl,
      localJobId: local.id,
      scriptUrl: finished.scriptUrl ? `${studio}${finished.scriptUrl}` : null,
      captionUrl: finished.captionUrl ? `${studio}${finished.captionUrl}` : null,
      qa,
    };
    const outcome = qa.score >= 80 ? 'qa_passed' : 'qa_failed';
    await report(job, outcome, result, qa.score >= 80 ? null : `QA score ${qa.score}`, qa.score);
    console.log(`[worker] ${job.id} ${outcome} (${qa.score})`);
  } catch (error) {
    console.error(`[worker] ${job.id} failed:`, error.message);
    await report(job, 'failed', null, error.message, null).catch(reportError => console.error('[worker] report failed:', reportError.message));
  }
}

console.log(`[worker] controller=${controller}`);
console.log(`[worker] studio=${studio}`);
while (true) {
  try {
    const job = await claim();
    if (job) await processJob(job);
    else await sleep(pollMs);
  } catch (error) {
    console.error('[worker] loop error:', error.message);
    await sleep(Math.max(pollMs, 10000));
  }
}
