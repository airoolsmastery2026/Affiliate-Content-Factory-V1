import React, { useState } from 'react';

export default function ResultSection({ data }) {
  const { analysis, generated } = data;
  const [activeTab, setActiveTab] = useState('generated'); // Default to Generated for faster value

  return (
    <div className="space-y-6 animate-fade-in-up">
      
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 bg-white rounded-t-xl overflow-hidden">
        <button
          className={`flex-1 py-4 font-bold text-sm uppercase tracking-wide transition ${activeTab === 'generated' ? 'bg-blue-50 border-b-2 border-blue-600 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}
          onClick={() => setActiveTab('generated')}
        >
          ✨ Kịch bản & Visuals (OpenAI)
        </button>
        <button
          className={`flex-1 py-4 font-bold text-sm uppercase tracking-wide transition ${activeTab === 'analysis' ? 'bg-purple-50 border-b-2 border-purple-600 text-purple-700' : 'text-gray-500 hover:bg-gray-50'}`}
          onClick={() => setActiveTab('analysis')}
        >
          🔍 Insight Đối thủ (Gemini)
        </button>
      </div>

      {/* Content: Generated Scripts & Visuals */}
      {activeTab === 'generated' && (
        <div className="space-y-8">
          {generated.platform_contents?.map((platformData, pIdx) => (
            <div key={pIdx} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-3 font-bold uppercase tracking-wide flex items-center">
                <span className="mr-2 text-xl">📱</span> {platformData.platform}
              </div>
              
              <div className="p-6 grid gap-10">
                {platformData.items?.map((item, itemIdx) => (
                  <div key={itemIdx} className="relative group">
                    <div className="absolute -left-3 top-0 bottom-0 w-1 bg-gray-200 rounded-full"></div>
                    
                    <div className="pl-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                        <h4 className="font-extrabold text-xl text-gray-900 leading-tight">{item.title}</h4>
                        <span className="mt-2 md:mt-0 bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded uppercase">Variant {item.variant_index}</span>
                      </div>

                      <div className="grid lg:grid-cols-2 gap-8">
                        {/* Left: Script */}
                        <div className="space-y-4">
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Kịch bản chi tiết</label>
                            <div className="mt-2 bg-gray-50 p-5 rounded-lg border border-gray-200 text-sm whitespace-pre-wrap font-mono text-gray-800 leading-relaxed shadow-inner">
                              {item.script}
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Caption & CTA</label>
                            <div className="mt-2 bg-white p-3 rounded border border-gray-200 text-sm text-gray-700">
                              {item.caption}
                            </div>
                          </div>
                        </div>

                        {/* Right: Visuals & Metadata */}
                        <div className="space-y-6">
                          {/* Visual Ideas Box */}
                          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
                            <h5 className="font-bold text-indigo-900 flex items-center mb-3">
                              <span className="text-xl mr-2">🎨</span> Visual Engine
                            </h5>
                            
                            <div className="space-y-4">
                              <div>
                                <p className="text-xs font-bold text-indigo-400 uppercase mb-1">Ý tưởng Thumbnail</p>
                                <p className="text-sm text-indigo-800">{item.visual_ideas?.thumbnail_description || "Chưa có dữ liệu"}</p>
                              </div>
                              
                              <div>
                                <p className="text-xs font-bold text-indigo-400 uppercase mb-1">AI Image Prompt (Midjourney/DALL-E)</p>
                                <div className="bg-white p-2 rounded border border-indigo-200 text-xs text-gray-600 font-mono break-words select-all cursor-pointer hover:bg-gray-50" title="Click để copy">
                                  {item.visual_ideas?.ai_image_prompt || "Chưa có dữ liệu"}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Hashtags */}
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Hashtags</label>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {item.hashtags?.map((tag, tIdx) => (
                                <span key={tIdx} className="text-blue-600 text-xs bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition">
                                  #{tag.replace('#', '')}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Content: Analysis */}
      {activeTab === 'analysis' && (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <div className="mb-8 border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Phân tích Chiến Lược</h2>
            <p className="text-gray-500">{analysis.summary}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">🏗️ Cấu trúc nội dung</h3>
              <ul className="space-y-3 text-sm text-gray-700">
                <li><span className="font-semibold text-blue-600">Format:</span> {analysis.structure?.format_type}</li>
                <li><span className="font-semibold text-blue-600">Hook:</span> {analysis.structure?.hook_analysis}</li>
                <li><span className="font-semibold text-blue-600">Body:</span> {analysis.structure?.body_analysis}</li>
                <li><span className="font-semibold text-blue-600">CTA:</span> {analysis.structure?.cta_analysis}</li>
              </ul>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">🧠 Insight Khách hàng</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold mr-2">PAIN</span>
                  {analysis.insights?.pains?.join(', ')}
                </div>
                <div>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold mr-2">DESIRE</span>
                  {analysis.insights?.desires?.join(', ')}
                </div>
                <div>
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold mr-2">BELIEF</span>
                  {analysis.insights?.false_beliefs?.join(', ')}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-purple-700 mb-4 flex items-center">💡 Ý tưởng mới đề xuất</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analysis.ideas?.map((idea, idx) => (
                <div key={idx} className="border border-purple-100 bg-purple-50/50 p-4 rounded-lg hover:border-purple-300 transition">
                  <div className="font-bold text-gray-900 mb-1">{idea.title}</div>
                  <div className="text-xs text-gray-600 mb-2">{idea.angle}</div>
                  <span className="inline-block bg-white border border-purple-100 text-purple-600 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                    {idea.video_type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}