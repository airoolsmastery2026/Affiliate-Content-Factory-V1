
import React, { useState } from 'react';
import { Platform, VideoSettings } from '../types';

interface InputSectionProps {
  inputMode: 'text' | 'url';
  url: string;
  rawText: string;
  niche: string;
  geminiApiKey: string;
  openaiApiKey: string;
  selectedPlatforms: Platform[];
  videoSettings: VideoSettings;
  isLoading: boolean;
  onInputModeChange: (mode: 'text' | 'url') => void;
  onUrlChange: (val: string) => void;
  onRawTextChange: (val: string) => void;
  onNicheChange: (val: string) => void;
  onKeysChange: (gemini: string, openai: string) => void;
  onPlatformToggle: (platform: Platform) => void;
  onVideoSettingsChange: (settings: VideoSettings) => void;
  onGenerate: () => void;
}

const InputSection: React.FC<InputSectionProps> = ({
  inputMode,
  url,
  rawText,
  niche,
  geminiApiKey,
  openaiApiKey,
  selectedPlatforms,
  videoSettings,
  isLoading,
  onInputModeChange,
  onUrlChange,
  onRawTextChange,
  onNicheChange,
  onKeysChange,
  onPlatformToggle,
  onVideoSettingsChange,
  onGenerate,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const platforms = Object.values(Platform);
  
  const isSourceReady = (inputMode === 'url' && url.length > 5) || (inputMode === 'text' && rawText.length > 10);
  const isReady = isSourceReady && niche.length > 2 && selectedPlatforms.length > 0;

  const handleSettingChange = (key: keyof VideoSettings, value: string) => {
    onVideoSettingsChange({ ...videoSettings, [key]: value });
  };

  return (
    <div className="space-y-6 bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-xl">
      
      {/* API Key Configuration Toggle */}
      <div className="flex justify-end">
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="text-xs text-blue-400 hover:text-blue-300 underline flex items-center"
        >
          {showSettings ? 'Hide API Settings' : '⚙️ Configure Custom API Keys'}
        </button>
      </div>

      {showSettings && (
        <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 space-y-4 animate-fade-in-down">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Custom API Keys (Optional)</h3>
          <p className="text-[10px] text-gray-500">If provided, these keys will be used instead of the server defaults.</p>
          
          <div>
            <label className="block text-xs text-gray-400 mb-1">Gemini API Key</label>
            <input 
              type="password" 
              value={geminiApiKey} 
              onChange={(e) => onKeysChange(e.target.value, openaiApiKey)}
              placeholder="AIzaSy..."
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-xs text-white focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">OpenAI API Key</label>
            <input 
              type="password" 
              value={openaiApiKey} 
              onChange={(e) => onKeysChange(geminiApiKey, e.target.value)}
              placeholder="sk-..."
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-xs text-white focus:border-green-500"
            />
          </div>
        </div>
      )}

      {/* 1. Source Input */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">1. Competitor Source</label>
        <div className="flex bg-gray-900 p-1 rounded-lg mb-3">
          <button onClick={() => onInputModeChange('url')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${inputMode === 'url' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}>Paste Link 🔗</button>
          <button onClick={() => onInputModeChange('text')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${inputMode === 'text' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}>Paste Text 📝</button>
        </div>
        {inputMode === 'url' ? (
          <div>
            <input type="url" disabled={isLoading} value={url} onChange={(e) => onUrlChange(e.target.value)} placeholder="https://youtube.com/watch?v=..." className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-100" />
            <p className="text-xs text-gray-500 mt-2">Supports YouTube & Blogs. <span className="text-yellow-600">Try text paste if link fails.</span></p>
          </div>
        ) : (
          <textarea disabled={isLoading} value={rawText} onChange={(e) => onRawTextChange(e.target.value)} placeholder="Paste transcript here..." className="w-full h-32 p-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-100" />
        )}
      </div>

      {/* 2. Niche */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">2. Niche</label>
        <input type="text" disabled={isLoading} value={niche} onChange={(e) => onNicheChange(e.target.value)} placeholder="e.g., AI Tools, Weight Loss..." className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-100" />
      </div>

      {/* 3. Platforms */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">3. Platforms</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {platforms.map((p) => (
            <button key={p} onClick={() => !isLoading && onPlatformToggle(p)} className={`px-2 py-3 rounded-lg border text-xs font-medium ${selectedPlatforms.includes(p) ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-900 border-gray-700 text-gray-400'}`}>{p}</button>
          ))}
        </div>
      </div>

      {/* 4. Tech Specs */}
      <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700">
        <label className="block text-sm font-medium text-blue-400 mb-4 uppercase tracking-wide">4. Video Specs</label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Aspect Ratio</label>
            <select value={videoSettings.aspectRatio} onChange={(e) => handleSettingChange('aspectRatio', e.target.value)} className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-sm text-gray-200">
              <option value="9:16">9:16 (TikTok/Shorts)</option>
              <option value="16:9">16:9 (YouTube)</option>
              <option value="1:1">1:1 (FB Post)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Visual Style</label>
            <select value={videoSettings.visualStyle} onChange={(e) => handleSettingChange('visualStyle', e.target.value)} className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-sm text-gray-200">
              <option value="Cinematic">Cinematic</option>
              <option value="UGC">UGC (Phone)</option>
              <option value="Animated">Animated</option>
              <option value="Minimalist">Minimalist</option>
            </select>
          </div>
        </div>
      </div>

      {/* Generate */}
      <button onClick={onGenerate} disabled={!isReady || isLoading} className={`w-full py-4 rounded-lg font-bold text-lg shadow-xl transition-all ${isReady && !isLoading ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-[1.01] text-white' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}>
        {isLoading ? 'Generating...' : 'Generate Content 🚀'}
      </button>
    </div>
  );
};

export default InputSection;
