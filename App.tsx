import React, { useState, useCallback } from 'react';
import { Platform, AppState, VideoSettings } from './types';
import InputSection from './components/InputSection';
import AnalysisResultView from './components/AnalysisResult';
import ScriptResultView from './components/ScriptResult';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    inputMode: 'url',
    url: '',
    rawText: '',
    niche: '',
    tone: 'Professional',
    selectedPlatforms: [],
    videoSettings: {
      aspectRatio: '9:16',
      duration: 'medium',
      visualStyle: 'Cinematic',
      contentFocus: ''
    },
    isAnalyzing: false,
    isGenerating: false,
    analysis: null,
    scripts: [],
    error: null,
  });

  const handlePlatformToggle = (platform: Platform) => {
    setState((prev) => {
      const exists = prev.selectedPlatforms.includes(platform);
      return {
        ...prev,
        selectedPlatforms: exists
          ? prev.selectedPlatforms.filter((p) => p !== platform)
          : [...prev.selectedPlatforms, platform],
      };
    });
  };

  const handleGenerate = useCallback(async () => {
    // Validate inputs
    if (state.inputMode === 'url' && !state.url) return;
    if (state.inputMode === 'text' && !state.rawText) return;
    if (!state.niche || state.selectedPlatforms.length === 0) return;

    // Reset results and set loading state
    setState((prev) => ({ ...prev, isAnalyzing: true, error: null, analysis: null, scripts: [] }));

    try {
      // Call the Next.js API Route
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputMode: state.inputMode,
          url: state.url,
          rawText: state.rawText,
          niche: state.niche,
          tone: state.tone,
          platforms: state.selectedPlatforms,
          videoSettings: state.videoSettings, // Pass technical settings
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate content. Please check inputs or API keys.');
      }

      // Map the API response format to our App state format
      // API returns { analysis: ..., generated: { platform_contents: [...] } }
      const analysisData = data.analysis;
      
      // Transform generated content to match PlatformResult[]
      const generatedScripts = data.generated.platform_contents.map((pc: any) => ({
        platform: pc.platform,
        variants: pc.items // pc.items matches the ScriptVariant structure mostly
      }));

      setState((prev) => ({
        ...prev,
        isAnalyzing: false, // API returns everything at once now
        isGenerating: false,
        analysis: analysisData,
        scripts: generatedScripts
      }));

    } catch (err: any) {
      console.error("Generation Error:", err);
      setState((prev) => ({
        ...prev,
        isAnalyzing: false,
        isGenerating: false,
        error: err.message || "An unexpected error occurred.",
      }));
    }
  }, [state.inputMode, state.url, state.rawText, state.niche, state.selectedPlatforms, state.tone, state.videoSettings]);

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
              <span className="font-bold text-white">AF</span>
            </div>
            <h1 className="text-xl font-bold text-gray-100">Affiliate Content Factory</h1>
          </div>
          <div className="text-xs text-gray-500 hidden sm:block">
             Powered by <span className="text-blue-400 font-semibold">Gemini 2.5</span> & <span className="text-green-400 font-semibold">OpenAI</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Error Notification */}
        {state.error && (
          <div className="mb-6 bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg flex items-center animate-pulse">
            <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="flex-1 text-sm md:text-base">{state.error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Column */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit">
             <InputSection
                inputMode={state.inputMode}
                url={state.url}
                rawText={state.rawText}
                niche={state.niche}
                selectedPlatforms={state.selectedPlatforms}
                videoSettings={state.videoSettings}
                isLoading={state.isAnalyzing || state.isGenerating}
                onInputModeChange={(mode) => setState(prev => ({...prev, inputMode: mode}))}
                onUrlChange={(val) => setState(prev => ({ ...prev, url: val }))}
                onRawTextChange={(val) => setState(prev => ({ ...prev, rawText: val }))}
                onNicheChange={(val) => setState(prev => ({ ...prev, niche: val }))}
                onPlatformToggle={handlePlatformToggle}
                onVideoSettingsChange={(settings) => setState(prev => ({ ...prev, videoSettings: settings }))}
                onGenerate={handleGenerate}
             />
          </div>

          {/* Results Column */}
          <div className="lg:col-span-8 space-y-8">
            {/* Initial State / Placeholder */}
            {!state.analysis && !state.isAnalyzing && !state.error && (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-gray-800 rounded-xl text-gray-500 min-h-[400px]">
                <svg className="w-16 h-16 mb-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-400">Content Engine Ready</h3>
                <p className="max-w-sm mt-2">Paste a competitor URL or text to generate viral affiliate scripts and visual prompts.</p>
              </div>
            )}

            {/* Analysis Loading */}
            {state.isAnalyzing && (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                <div className="h-32 bg-gray-800 rounded"></div>
                <div className="h-4 bg-gray-800 rounded w-1/2"></div>
                <div className="text-center text-blue-400 font-mono text-sm mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-900/50">
                  <p className="font-bold mb-1">Processing...</p>
                  <p className="text-xs text-blue-300">Scraping Content → Deep Psychology Analysis → Generating Scripts</p>
                </div>
              </div>
            )}

            {/* Analysis Results */}
            {state.analysis && <AnalysisResultView data={state.analysis} />}

            {/* Script Results */}
            <div className="space-y-8">
              {state.scripts.map((scriptData) => (
                <ScriptResultView key={scriptData.platform} result={scriptData} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;