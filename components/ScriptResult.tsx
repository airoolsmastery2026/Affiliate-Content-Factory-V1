
import React, { useState } from 'react';
import { PlatformContent, ScriptItem } from '../types';

interface ScriptResultProps {
  result: PlatformContent;
}

const ScriptResultView: React.FC<ScriptResultProps> = ({ result }) => {
  const [activeVariant, setActiveVariant] = useState(0);

  const currentScript: ScriptItem | undefined = result.items[activeVariant];

  if (!currentScript) return null;

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-lg mt-6 animate-fade-in-up">
      <div className="bg-gray-900 p-4 border-b border-gray-700 flex justify-between items-center">
        <h3 className="font-bold text-white flex items-center">
          <span className="inline-block w-2 h-8 bg-blue-500 rounded-full mr-3"></span>
          {result.platform}
        </h3>
        <div className="flex space-x-2">
          {result.items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveVariant(idx)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                activeVariant === idx
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              Variant {idx + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        <div className="mb-6">
          <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Video Title</h4>
          <p className="text-xl text-white font-bold">{currentScript.title}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column: Script */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Script & Direction</h4>
              <div className="bg-gray-900 p-4 rounded-lg text-gray-300 font-mono text-sm whitespace-pre-wrap leading-relaxed border border-gray-700 shadow-inner">
                {currentScript.script}
              </div>
            </div>
            
            {/* Visuals Box */}
            <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-indigo-500/30 rounded-lg p-5">
              <h4 className="text-indigo-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center">
                <span className="text-lg mr-2">🎨</span> Visual Engine
              </h4>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                   <p className="text-xs text-indigo-300 uppercase font-semibold mb-1">Thumbnail Concept</p>
                   <p className="text-sm text-gray-300 bg-gray-900/50 p-2 rounded">{currentScript.visual_ideas?.thumbnail_description || "N/A"}</p>
                </div>
                <div>
                   <p className="text-xs text-purple-300 uppercase font-semibold mb-1">AI Image Prompt (Midjourney/DALL-E)</p>
                   <div className="bg-black/40 p-3 rounded border border-gray-700/50 group cursor-pointer relative"
                        onClick={() => navigator.clipboard.writeText(currentScript.visual_ideas?.ai_image_prompt || "")}>
                     <code className="text-xs text-purple-200 break-words block font-mono">
                       {currentScript.visual_ideas?.ai_image_prompt || "N/A"}
                     </code>
                     <span className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-gray-700 text-white text-[10px] px-1 rounded">Copy</span>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Metadata */}
          <div className="space-y-6">
            <div>
              <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Caption</h4>
              <div className="bg-gray-900 p-3 rounded-lg text-gray-300 text-sm border border-gray-700">
                {currentScript.caption}
              </div>
            </div>
            <div>
              <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Hashtags</h4>
              <div className="flex flex-wrap gap-2">
                {currentScript.hashtags.map((tag, i) => (
                  <span key={i} className="text-blue-400 bg-blue-400/10 px-2 py-1 rounded text-xs border border-blue-400/20">
                    {tag.startsWith('#') ? tag : `#${tag}`}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScriptResultView;
