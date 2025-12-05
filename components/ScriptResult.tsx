
import React, { useState } from 'react';
import { PlatformContent, ScriptItem } from '../types';

interface ScriptResultProps {
  result: PlatformContent;
}

const ScriptResultView: React.FC<ScriptResultProps> = ({ result }) => {
  const [activeVariant, setActiveVariant] = useState(0);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const currentScript: ScriptItem | undefined = result.items[activeVariant];

  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  if (!currentScript) return null;

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-lg mt-6 animate-fade-in-up">
      {/* Header */}
      <div className="bg-gray-900 p-4 border-b border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h3 className="font-bold text-white flex items-center text-lg">
          <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-3 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
          {result.platform}
        </h3>
        <div className="flex space-x-2">
          {result.items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveVariant(idx)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeVariant === idx
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'
              }`}
            >
              Variant {idx + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {/* Title Section */}
        <div className="mb-6">
          <h4 className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Video Title</h4>
          <p className="text-xl md:text-2xl text-white font-bold leading-tight">{currentScript.title}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column: Script & Visual Engine */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Script Box */}
            <div>
              <h4 className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-3">Script & Direction</h4>
              <div className="bg-gray-900/80 p-5 rounded-lg text-gray-300 font-mono text-sm whitespace-pre-wrap leading-relaxed border border-gray-700/50 shadow-inner">
                {currentScript.script}
              </div>
            </div>
            
            {/* Visual Engine Box */}
            <div className="bg-gradient-to-br from-indigo-950/40 to-purple-950/40 border border-indigo-500/20 rounded-xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                 <svg className="w-24 h-24 text-indigo-200" fill="currentColor" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
              </div>
              
              <h4 className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4 flex items-center">
                <span className="text-lg mr-2">🎨</span> Visual Engine (AI Prompts)
              </h4>
              
              <div className="grid md:grid-cols-2 gap-6 relative z-10">
                {/* Thumbnail */}
                <div>
                   <p className="text-[10px] text-indigo-300 uppercase font-bold mb-2 tracking-wide">Thumbnail Concept</p>
                   <p className="text-sm text-gray-300 bg-gray-900/50 p-3 rounded border border-gray-700/30">
                     {currentScript.visual_ideas?.thumbnail_description || "N/A"}
                   </p>
                </div>
                
                {/* Midjourney/DALL-E Prompt */}
                <div>
                   <div className="flex justify-between items-center mb-2">
                     <p className="text-[10px] text-purple-300 uppercase font-bold tracking-wide">AI Image Prompt</p>
                     {copiedPrompt && <span className="text-[10px] text-green-400 font-bold animate-fade-in-up">Copied!</span>}
                   </div>
                   
                   <div 
                      className="bg-black/40 p-3 rounded border border-purple-500/30 hover:border-purple-500/60 cursor-pointer relative transition-colors group/code"
                      onClick={() => currentScript.visual_ideas?.ai_image_prompt && handleCopyPrompt(currentScript.visual_ideas.ai_image_prompt)}
                   >
                     <code className="text-xs text-purple-200 break-words block font-mono leading-relaxed">
                       {currentScript.visual_ideas?.ai_image_prompt || "N/A"}
                     </code>
                     <div className="absolute top-2 right-2 opacity-0 group-hover/code:opacity-100 transition-opacity">
                        <span className="bg-gray-700 text-white text-[10px] px-2 py-1 rounded shadow-lg">Copy</span>
                     </div>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Metadata */}
          <div className="space-y-6">
            
            {/* Caption */}
            <div>
              <h4 className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Social Caption</h4>
              <div className="bg-gray-900 p-4 rounded-lg text-gray-300 text-sm border border-gray-700">
                {currentScript.caption}
              </div>
            </div>

            {/* Hashtags */}
            <div>
              <h4 className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Hashtags</h4>
              <div className="flex flex-wrap gap-2">
                {currentScript.hashtags.map((tag, i) => (
                  <span key={i} className="text-blue-400 bg-blue-900/20 px-2.5 py-1 rounded text-xs border border-blue-500/20 hover:bg-blue-900/40 transition-colors cursor-default">
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
