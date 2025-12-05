import React, { useState } from 'react';
import { Platform, VideoSettings } from '../types';

interface InputSectionProps {
  inputMode: 'text' | 'url';
  url: string;
  rawText: string;
  niche: string;
  selectedPlatforms: Platform[];
  videoSettings: VideoSettings;
  isLoading: boolean;
  onInputModeChange: (mode: 'text' | 'url') => void;
  onUrlChange: (val: string) => void;
  onRawTextChange: (val: string) => void;
  onNicheChange: (val: string) => void;
  onPlatformToggle: (platform: Platform) => void;
  onVideoSettingsChange: (settings: VideoSettings) => void;
  onGenerate: () => void;
}

const InputSection: React.FC<InputSectionProps> = ({
  inputMode,
  url,
  rawText,
  niche,
  selectedPlatforms,
  videoSettings,
  isLoading,
  onInputModeChange,
  onUrlChange,
  onRawTextChange,
  onNicheChange,
  onPlatformToggle,
  onVideoSettingsChange,
  onGenerate,
}) => {
  const platforms = Object.values(Platform);
  
  // Validation logic
  const isUrlValid = inputMode === 'url' && url.length > 5;
  const isTextValid = inputMode === 'text' && rawText.length > 10;
  const isSourceReady = isUrlValid || isTextValid;
  const isReady = isSourceReady && niche.length > 2 && selectedPlatforms.length > 0;

  const handleSettingChange = (key: keyof VideoSettings, value: string) => {
    onVideoSettingsChange({
      ...videoSettings,
      [key]: value
    });
  };

  return (
    <div className="space-y-6 bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-xl">
      
      {/* 1. Source Input */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          1. Competitor Source
        </label>
        
        {/* Toggle Switches */}
        <div className="flex bg-gray-900 p-1 rounded-lg mb-3">
          <button
            onClick={() => onInputModeChange('url')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              inputMode === 'url' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Paste Link 🔗
          </button>
          <button
            onClick={() => onInputModeChange('text')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              inputMode === 'text' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Paste Text 📝
          </button>
        </div>

        {inputMode === 'url' ? (
          <div>
            <input
              type="url"
              disabled={isLoading}
              value={url}
              onChange={(e) => onUrlChange(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100 placeholder-gray-500 transition-all"
            />
            <p className="text-xs text-gray-500 mt-2 ml-1">
              Supports YouTube Videos and generic blog posts. <br/>
              <span className="text-yellow-600">Note: If fetching fails due to browser security, try pasting text.</span>
            </p>
          </div>
        ) : (
          <textarea
            disabled={isLoading}
            value={rawText}
            onChange={(e) => onRawTextChange(e.target.value)}
            placeholder="Paste transcript or article text here..."
            className="w-full h-40 p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100 placeholder-gray-500 resize-none transition-all"
          />
        )}
      </div>

      {/* 2. Niche Input */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          2. Your Niche
        </label>
        <input
          type="text"
          disabled={isLoading}
          value={niche}
          onChange={(e) => onNicheChange(e.target.value)}
          placeholder="e.g., Digital Marketing, Keto Diet, Pet Care..."
          className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-100"
        />
      </div>

      {/* 3. Platforms */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          3. Target Platforms
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {platforms.map((p) => {
            const isSelected = selectedPlatforms.includes(p);
            return (
              <button
                key={p}
                onClick={() => !isLoading && onPlatformToggle(p)}
                className={`flex items-center justify-center px-4 py-3 rounded-lg border transition-all duration-200 ${
                  isSelected
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className="font-medium text-xs sm:text-sm">{p}</span>
                {isSelected && (
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Video Configuration (Advanced Settings) */}
      <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700">
        <label className="block text-sm font-medium text-blue-400 mb-4 uppercase tracking-wide flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          4. Video Technical Specs
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Aspect Ratio */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Tỷ lệ khung hình</label>
            <select
              value={videoSettings.aspectRatio}
              onChange={(e) => handleSettingChange('aspectRatio', e.target.value)}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-sm text-gray-200 focus:border-blue-500"
            >
              <option value="9:16">9:16 (TikTok/Reels/Shorts)</option>
              <option value="16:9">16:9 (YouTube Landscape)</option>
              <option value="1:1">1:1 (Facebook/Insta Post)</option>
              <option value="4:5">4:5 (Facebook/Insta Portrait)</option>
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Độ dài video</label>
            <select
              value={videoSettings.duration}
              onChange={(e) => handleSettingChange('duration', e.target.value)}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-sm text-gray-200 focus:border-blue-500"
            >
              <option value="short">Ngắn (15s - 30s) - Tiết tấu nhanh</option>
              <option value="medium">Trung bình (30s - 60s) - Tiêu chuẩn</option>
              <option value="long">Dài (60s - 90s) - Chi tiết</option>
            </select>
          </div>

          {/* Visual Style */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Phong cách Visual</label>
            <select
              value={videoSettings.visualStyle}
              onChange={(e) => handleSettingChange('visualStyle', e.target.value)}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-sm text-gray-200 focus:border-blue-500"
            >
              <option value="Cinematic">Điện ảnh (Cinematic)</option>
              <option value="UGC">UGC (Tự nhiên, quay bằng điện thoại)</option>
              <option value="Minimalist">Tối giản (Minimalist)</option>
              <option value="Animated">Hoạt hình / Minh hoạ (Animated)</option>
              <option value="Corporate">Chuyên nghiệp / Doanh nghiệp</option>
              <option value="Cyberpunk">Công nghệ cao / Neon (Cyberpunk)</option>
            </select>
          </div>

          {/* Content Focus */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Trọng tâm nội dung (Focus)</label>
            <input
              type="text"
              value={videoSettings.contentFocus}
              onChange={(e) => handleSettingChange('contentFocus', e.target.value)}
              placeholder="VD: Giáo dục, Giải trí, Review..."
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-sm text-gray-200 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="sticky bottom-4 z-10">
        <button
          onClick={onGenerate}
          disabled={!isReady || isLoading}
          className={`w-full py-4 px-6 rounded-lg font-bold text-lg shadow-xl transition-all transform duration-200 flex items-center justify-center ${
            isReady && !isLoading
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white hover:scale-[1.01]'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating Assets...
            </>
          ) : (
            'Generate Content'
          )}
        </button>
      </div>
    </div>
  );
};

export default InputSection;