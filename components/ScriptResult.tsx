import React, { useEffect, useRef, useState } from 'react';
import { PlatformContent, ScriptItem } from '../types';

interface ScriptResultProps {
  result: PlatformContent;
}

type VideoJob = {
  id: string;
  accessToken: string;
  status?: string;
  stage?: string;
  viralScore?: number | null;
  qaScore?: number | null;
  attempts?: number;
  result?: { videoUrl?: string; qa?: { score?: number } } | null;
  error?: string | null;
};

const ScriptResultView: React.FC<ScriptResultProps> = ({ result }) => {
  const [activeVariant, setActiveVariant] = useState(0);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [handoffStatus, setHandoffStatus] = useState('');
  const [videoJob, setVideoJob] = useState<VideoJob | null>(null);
  const pollCount = useRef(0);

  const currentScript: ScriptItem | undefined = result.items[activeVariant];

  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const buildPayload = () => ({
    sourceApp: 'affiliate-content-factory',
    content: {
      title: currentScript?.title,
      script: currentScript?.script,
      caption: currentScript?.caption,
      hashtags: currentScript?.hashtags,
      platforms: [result.platform],
    },
    platforms: [result.platform],
  });

  const queueVideo = async () => {
    if (!currentScript) return;
    setHandoffStatus('Đang chấm Viral Score và đưa vào hàng đợi...');
    setVideoJob(null);
    pollCount.current = 0;
    try {
      const response = await fetch('/api/video-handoff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Video OS không nhận được dữ liệu');
      setVideoJob({
        id: data.id,
        accessToken: data.accessToken,
        status: data.status,
        stage: data.stage,
        viralScore: data.viral?.score ?? null,
      });
      setHandoffStatus(`Đã xếp hàng · Job ${data.id} · Viral Score ${data.viral?.score ?? '—'}`);
    } catch (error: any) {
      setHandoffStatus(`Không tạo được job: ${error?.message || 'không xác định'}`);
    }
  };

  useEffect(() => {
    if (!videoJob?.id || !videoJob?.accessToken) return;
    const terminal = new Set(['qa_passed', 'needs_review', 'failed', 'published', 'learned']);
    if (videoJob.status && terminal.has(videoJob.status)) return;

    const timer = window.setInterval(async () => {
      pollCount.current += 1;
      if (pollCount.current > 240) {
        window.clearInterval(timer);
        setHandoffStatus('Job vẫn đang xử lý. Có thể kiểm tra lại sau.');
        return;
      }
      try {
        const query = new URLSearchParams({ id: videoJob.id, token: videoJob.accessToken });
        const response = await fetch(`/api/video-jobs/status?${query.toString()}`);
        if (!response.ok) return;
        const data = await response.json();
        setVideoJob(previous => previous ? {
          ...previous,
          status: data.status,
          stage: data.stage,
          viralScore: data.viral_score,
          qaScore: data.qa_score,
          attempts: data.attempts,
          result: data.result,
          error: data.error,
        } : previous);
        setHandoffStatus(`Job ${data.id} · ${data.status} · bước ${data.stage}`);
        if (terminal.has(data.status)) window.clearInterval(timer);
      } catch (_) {
        // Polling is best-effort; the durable job remains safe in the queue.
      }
    }, 5000);

    return () => window.clearInterval(timer);
  }, [videoJob?.id, videoJob?.accessToken, videoJob?.status]);

  if (!currentScript) return null;

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-lg mt-6 animate-fade-in-up">
      <div className="bg-gray-900 p-4 border-b border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h3 className="font-bold text-white flex items-center text-lg">
          <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-3 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
          {result.platform}
        </h3>
        <div className="flex flex-wrap gap-2 justify-end">
          {result.items.map((_, idx) => (
            <button key={idx} onClick={() => setActiveVariant(idx)} className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${activeVariant === idx ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'}`}>
              Variant {idx + 1}
            </button>
          ))}
          <button onClick={queueVideo} className="px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition-colors">
            Tạo video →
          </button>
        </div>
      </div>

      <div className="p-6">
        {handoffStatus && <div className="mb-5 rounded-lg border border-emerald-500/30 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-200">{handoffStatus}</div>}

        {videoJob && (
          <div className="mb-6 grid grid-cols-2 md:grid-cols-5 gap-3">
            <Metric label="Trạng thái" value={videoJob.status || 'queued'} />
            <Metric label="Bước" value={videoJob.stage || 'directed'} />
            <Metric label="Viral Score" value={videoJob.viralScore ?? '—'} />
            <Metric label="QA Score" value={videoJob.qaScore ?? videoJob.result?.qa?.score ?? '—'} />
            <Metric label="Lần render" value={videoJob.attempts ?? 0} />
            {videoJob.error && <div className="col-span-2 md:col-span-5 text-sm text-red-300 bg-red-950/30 border border-red-500/30 rounded-lg p-3">{videoJob.error}</div>}
            {videoJob.result?.videoUrl && (
              <a className="col-span-2 md:col-span-5 text-sm text-emerald-300 underline" href={videoJob.result.videoUrl} target="_blank" rel="noreferrer">Mở video đã render</a>
            )}
          </div>
        )}

        <div className="mb-6">
          <h4 className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Video Title</h4>
          <p className="text-xl md:text-2xl text-white font-bold leading-tight">{currentScript.title}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h4 className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-3">Script & Direction</h4>
              <div className="bg-gray-900/80 p-5 rounded-lg text-gray-300 font-mono text-sm whitespace-pre-wrap leading-relaxed border border-gray-700/50 shadow-inner">{currentScript.script}</div>
            </div>
            <div className="bg-gradient-to-br from-indigo-950/40 to-purple-950/40 border border-indigo-500/20 rounded-xl p-6 relative overflow-hidden group">
              <h4 className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4 flex items-center"><span className="text-lg mr-2">🎨</span> Visual Engine (AI Prompts)</h4>
              <div className="grid md:grid-cols-2 gap-6 relative z-10">
                <div>
                  <p className="text-[10px] text-indigo-300 uppercase font-bold mb-2 tracking-wide">Thumbnail Concept</p>
                  <p className="text-sm text-gray-300 bg-gray-900/50 p-3 rounded border border-gray-700/30">{currentScript.visual_ideas?.thumbnail_description || 'N/A'}</p>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2"><p className="text-[10px] text-purple-300 uppercase font-bold tracking-wide">AI Image Prompt</p>{copiedPrompt && <span className="text-[10px] text-green-400 font-bold">Copied!</span>}</div>
                  <div className="bg-black/40 p-3 rounded border border-purple-500/30 hover:border-purple-500/60 cursor-pointer" onClick={() => currentScript.visual_ideas?.ai_image_prompt && handleCopyPrompt(currentScript.visual_ideas.ai_image_prompt)}>
                    <code className="text-xs text-purple-200 break-words block font-mono leading-relaxed">{currentScript.visual_ideas?.ai_image_prompt || 'N/A'}</code>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div><h4 className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Social Caption</h4><div className="bg-gray-900 p-4 rounded-lg text-gray-300 text-sm border border-gray-700">{currentScript.caption}</div></div>
            <div><h4 className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Hashtags</h4><div className="flex flex-wrap gap-2">{currentScript.hashtags.map((tag, i) => <span key={i} className="text-blue-400 bg-blue-900/20 px-2.5 py-1 rounded text-xs border border-blue-500/20">{tag.startsWith('#') ? tag : `#${tag}`}</span>)}</div></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Metric = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2">
    <div className="text-[10px] uppercase tracking-wider text-gray-500">{label}</div>
    <div className="mt-1 text-sm font-semibold text-gray-200 break-all">{value}</div>
  </div>
);

export default ScriptResultView;
