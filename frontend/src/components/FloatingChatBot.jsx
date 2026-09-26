import React, { useState } from 'react';
import { Bot, X } from 'lucide-react';

export default function FloatingChatBot({ isOpen, onToggle }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end select-none">

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
