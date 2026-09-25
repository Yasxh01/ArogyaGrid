import React, { useState } from 'react';
import { Bot, Sparkles, X, MessageSquare, Zap } from 'lucide-react';

export default function FloatingChatBot({ isOpen, onToggle }) {
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end select-none">
      
      {/* Interactive 3D Speech Bubble Tooltip */}
      {!isOpen && (
        <div
          className={`mb-3.5 transition-all duration-300 transform origin-bottom-right ${
            isHovered
              ? 'scale-105 -translate-y-1 opacity-100'
              : 'scale-95 opacity-90 hover:opacity-100'
          }`}
        >
          <div 
            onClick={onToggle}
            className="cursor-pointer relative bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white text-xs font-bold px-3.5 py-2 rounded-2xl shadow-[0_12px_24px_-4px_rgba(15,23,42,0.4)] border border-indigo-500/30 flex items-center space-x-2 backdrop-blur-md group"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute -top-0.5 -right-0.5" />
            <div className="w-2 h-2 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5" />
            
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span className="bg-gradient-to-r from-white via-indigo-100 to-indigo-200 bg-clip-text text-transparent">
              AI Health Copilot
            </span>
            <span className="text-[10px] font-black uppercase px-1.5 py-0.5 bg-indigo-500/30 text-indigo-300 rounded-md border border-indigo-400/20">
              Ask AI
            </span>

            {/* Bubble Tail */}
            <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-slate-900 rotate-45 border-r border-b border-indigo-500/30" />
          </div>
        </div>
      )}

      {/* 3D Interactive Floating Button */}
      <button
        onClick={onToggle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Open AI Healthcare Copilot"
        className={`group relative rounded-2xl p-0.5 focus:outline-none transition-all duration-300 ease-out cursor-pointer ${
          isOpen
            ? 'rotate-90 scale-95'
            : 'hover:-translate-y-2 hover:scale-105 active:translate-y-1 active:scale-95'
        }`}
        style={{
          perspective: '800px',
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Ambient Glowing Aura */}
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-teal-400 rounded-3xl blur-md opacity-60 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />

        {/* 3D Button Container with Edge Depth */}
        <div
          className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center transition-all duration-200 overflow-hidden shadow-[0_16px_32px_-6px_rgba(79,70,229,0.55),0_6px_12px_-3px_rgba(0,0,0,0.2)] ${
            isOpen
              ? 'bg-gradient-to-br from-rose-500 to-rose-700 border-b-4 border-rose-900'
              : 'bg-gradient-to-br from-indigo-500 via-indigo-600 to-teal-600 border-b-[5px] border-r-[2px] border-indigo-950 active:border-b-0 active:border-r-0'
          }`}
        >
          {/* 3D Gloss Highlight Overlay (Top Half Specular Reflection) */}
          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/35 to-transparent rounded-t-2xl pointer-events-none" />

          {/* Radial Center Light Flare */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.4),transparent_60%)] pointer-events-none" />

          {/* Bot / Close Icon with 3D Depth */}
          <div className="relative z-10 flex items-center justify-center transform transition-transform duration-300 group-hover:scale-110">
            {isOpen ? (
              <X className="w-6 h-6 sm:w-7 sm:h-7 text-white stroke-[2.5] drop-shadow-md" />
            ) : (
              <div className="relative">
                <Bot className="w-7 h-7 sm:w-8 sm:h-8 text-white stroke-[2.2] drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]" />
                
                {/* Glowing Antenna Sparkle */}
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-300 border-2 border-indigo-700 animate-ping opacity-80" />
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-300 border border-white shadow-xs" />
              </div>
            )}
          </div>

          {/* Bottom Rim Highlight */}
          <div className="absolute inset-x-0 bottom-0 h-1 bg-black/20 pointer-events-none" />
        </div>
      </button>

    </div>
  );
}
