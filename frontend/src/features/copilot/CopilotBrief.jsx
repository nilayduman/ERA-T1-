import React from 'react';
import logoeva from '../../images/logoeva.jpg';

export default function CopilotBrief({ insights }) {
  if (!insights) return null;

  return (
    <div className="rounded-[2rem] border-[3px] border-white bg-gradient-to-br from-[#E2F1F8] to-white p-8 shadow-[0_15px_35px_rgba(126,178,172,0.15)] relative overflow-hidden">
      {/* Decorative Sparkles */}
      <div className="absolute top-6 right-8 text-3xl opacity-20 animate-pulse">✨</div>
      <div className="absolute bottom-6 right-20 text-2xl opacity-10 animate-bounce">🌟</div>

      <div className="flex items-start gap-6">
        {/* AI Avatar */}
        <div className="flex-shrink-0 w-16 h-16 rounded-full bg-white border-4 border-[#B2E2F2] flex items-center justify-center text-3xl shadow-sm overflow-hidden">
          <img src={logoeva} alt="era-co logo" className="w-full h-full object-cover" />
        </div>
        
        {/* Briefing Text */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl font-black text-[#2F4F4F]">era-co</h2>
            <span className="bg-[#B7D5AC]/30 text-[#689B96] text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full">
              Canlı Özet
            </span>
          </div>
          <p className="text-[#457B9D] text-lg leading-relaxed italic font-medium">
            "{insights.morning_brief}"
          </p>
        </div>
      </div>
    </div>
  );
}
