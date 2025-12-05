
import React from 'react';
import { AnalysisResult } from '../types';

interface AnalysisResultProps {
  data: AnalysisResult;
}

const AnalysisResultView: React.FC<AnalysisResultProps> = ({ data }) => {
  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-lg animate-fade-in-up">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-4 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white flex items-center">
          <svg className="w-6 h-6 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Deep Insight Engine (Gemini)
        </h2>
        <span className="text-xs bg-purple-900 text-purple-200 px-2 py-1 rounded border border-purple-700 font-mono">
          Tone: {data.tone_of_voice}
        </span>
      </div>
      
      <div className="p-6 grid gap-8">
        
        {/* 1. Summary & Structure */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
            <h3 className="text-purple-400 text-xs font-bold uppercase tracking-wider mb-2">Executive Summary</h3>
            <p className="text-gray-300 text-sm leading-relaxed">{data.summary}</p>
          </div>
          <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
             <h3 className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">Structure Breakdown</h3>
             <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start"><span className="text-gray-200 font-semibold w-16 shrink-0">Format:</span> {data.structure.format_type}</li>
                <li className="flex items-start"><span className="text-gray-200 font-semibold w-16 shrink-0">Hook:</span> {data.structure.hook_analysis}</li>
                <li className="flex items-start"><span className="text-gray-200 font-semibold w-16 shrink-0">CTA:</span> {data.structure.cta_analysis}</li>
             </ul>
          </div>
        </div>

        {/* 2. Customer Psychology Map (The Core Value) */}
        <div className="bg-gray-900 p-5 rounded-xl border border-gray-600 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
             <svg className="w-32 h-32 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
          </div>
          <h3 className="text-white text-lg font-bold mb-4 flex items-center relative z-10">
            🧠 Customer Psychology Map
          </h3>
          <div className="grid md:grid-cols-3 gap-4 relative z-10">
            
            {/* Pains */}
            <div className="bg-red-950/30 p-4 rounded-lg border border-red-900/50">
               <h4 className="text-red-400 text-xs font-bold uppercase mb-3 flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span> Deep Pains
               </h4>
               <ul className="space-y-2">
                  {data.insights.pains.map((p, i) => (
                    <li key={i} className="text-xs text-red-200 flex items-start">
                      <span className="mr-2 text-red-500">•</span> {p}
                    </li>
                  ))}
               </ul>
            </div>

            {/* Desires */}
            <div className="bg-green-950/30 p-4 rounded-lg border border-green-900/50">
               <h4 className="text-green-400 text-xs font-bold uppercase mb-3 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span> Ultimate Desires
               </h4>
               <ul className="space-y-2">
                  {data.insights.desires.map((d, i) => (
                    <li key={i} className="text-xs text-green-200 flex items-start">
                      <span className="mr-2 text-green-500">•</span> {d}
                    </li>
                  ))}
               </ul>
            </div>

            {/* False Beliefs */}
            <div className="bg-yellow-950/30 p-4 rounded-lg border border-yellow-900/50">
               <h4 className="text-yellow-400 text-xs font-bold uppercase mb-3 flex items-center">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span> False Beliefs
               </h4>
               <ul className="space-y-2">
                  {data.insights.false_beliefs.map((f, i) => (
                    <li key={i} className="text-xs text-yellow-200 flex items-start">
                      <span className="mr-2 text-yellow-500">•</span> {f}
                    </li>
                  ))}
               </ul>
            </div>
          </div>
        </div>

        {/* 3. Proposed Ideas */}
        <div>
           <h3 className="text-yellow-400 text-sm font-semibold uppercase tracking-wider mb-3 flex items-center">
             💡 Proposed Content Angles
           </h3>
           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.ideas.map((idea, i) => (
                <div key={i} className="bg-gray-700/30 p-3 rounded border border-gray-600 hover:bg-gray-700/50 transition">
                   <div className="flex justify-between items-start mb-2">
                      <span className="text-white font-bold text-sm leading-tight pr-2">{idea.title}</span>
                      <span className="text-[10px] bg-gray-900 text-gray-400 px-1.5 py-0.5 rounded uppercase whitespace-nowrap">{idea.video_type}</span>
                   </div>
                   <p className="text-xs text-gray-400 line-clamp-2">{idea.short_description}</p>
                </div>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
};

export default AnalysisResultView;
