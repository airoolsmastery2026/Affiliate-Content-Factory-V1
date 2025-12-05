
import React, { useState, useCallback } from 'react';
import { Platform, AppState } from './types';
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
    geminiApiKey: '',
    openaiApiKey: '',
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
      // Call the Next.js API Route with all state including keys
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
          videoSettings: state.videoSettings,
          geminiApiKey: state.geminiApiKey, // Send custom key if set
          openaiApiKey: state.openaiApiKey  // Send custom key if set
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to generate content. Please check inputs or API keys.');
      }

      const analysisData = data.analysis;
      const generatedScripts = data.generated.platform_contents.map((pc: any) => ({
        platform: pc.platform,
        variants: pc.items
      }));

      setState((prev) => ({
        ...prev,
        isAnalyzing: false,
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
  }, [state]);

  return (
    <div className="min-h-screen pb-20 bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
              <span className="font-bold text-white">AF</span>
            </div>
            <h1 className="text-xl font-bold text-gray-100">Affiliate Content Factory</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
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
                geminiApiKey={state.geminiApiKey}
                openaiApiKey={state.openaiApiKey}
                selectedPlatforms={state.selectedPlatforms}
                videoSettings={state.videoSettings}
                isLoading={state.isAnalyzing || state.isGenerating}
                onInputModeChange={(mode) => setState(prev => ({...prev, inputMode: mode}))}
                onUrlChange={(val) => setState(prev => ({ ...prev, url: val }))}
                onRawTextChange={(val) => setState(prev => ({ ...prev, rawText: val }))}
                onNicheChange={(val) => setState(prev => ({ ...prev, niche: val }))}
                onKeysChange={(gemini, openai) => setState(prev => ({ ...prev, geminiApiKey: gemini, openaiApiKey: openai }))}
                onPlatformToggle={handlePlatformToggle}
                onVideoSettingsChange={(settings) => setState(prev => ({ ...prev, videoSettings: settings }))}
                onGenerate={handleGenerate}
             />
          </div>

          {/* Results Column */}
          <div className="lg:col-span-8 space-y-8">
            {!state.analysis && !state.isAnalyzing && !state.error && (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-gray-800 rounded-xl text-gray-500 min-h-[400px]">
                <h3 className="text-lg font-medium text-gray-400">Ready to Generate</h3>
                <p className="max-w-sm mt-2">Configure your keys (optional) and paste content to start.</p>
              </div>
            )}

            {state.isAnalyzing && (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                <div className="text-center text-blue-400 font-mono text-sm mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-900/50">
                  Running Content Engine...
                </div>
              </div>
            )}

            {state.analysis && <AnalysisResultView data={state.analysis} />}

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
