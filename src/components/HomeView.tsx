/**
 * @file HomeView.tsx
 * @description The landing view for AgriAssist.
 */

import { Sprout, Camera, MessageSquare, ShieldCheck, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface HomeViewProps {
  onNavigate: (view: 'diagnosis' | 'chat' | 'about') => void;
}

export function HomeView({ onNavigate }: HomeViewProps) {
  return (
    <div className="space-y-12">
      {/* Header Section */}
      <div className="flex items-baseline justify-between border-b border-black/5 pb-6">
        <div>
          <h1 className="logo-editorial">AgriAssist</h1>
        </div>
        <div className="flex items-center gap-2 text-clay">
          <div className="w-2 h-2 bg-clay rounded-full" />
          <span className="text-[10px] uppercase tracking-widest font-bold">Offline Ready</span>
        </div>
      </div>

      {/* Hero Welcome */}
      <div className="space-y-6">
        <span className="section-label">Field Companion</span>
        <h2 className="text-5xl leading-tight font-serif text-ink">Modern solutions for your farm.</h2>
        <p className="text-ink/60 leading-relaxed font-sans text-sm">
          Diagnose crop diseases instantly using AI or consult our expert agricultural advisor for localized farming guidance.
        </p>
        <button 
          id="hero-diagnose-btn"
          onClick={() => onNavigate('diagnosis')}
          className="btn-primary"
        >
          <Camera size={18} />
          Start Diagnosis
        </button>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <span className="section-label">Consultation</span>
        <div className="grid grid-cols-1 gap-4">
          <motion.button
            id="action-chat"
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('chat')}
            className="editorial-card flex items-center justify-between group cursor-pointer w-full text-left"
          >
            <div className="flex flex-col items-start gap-1">
              <span className="font-serif text-2xl group-hover:text-accent transition-colors">Ask for Advice</span>
              <span className="text-xs text-ink/40 font-medium">Expert agricultural guidance</span>
            </div>
            <MessageSquare size={24} className="text-accent opacity-20 group-hover:opacity-100 transition-opacity" strokeWidth={1} />
          </motion.button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-8 border-t border-black/5 flex flex-col items-center gap-4">
        <button 
          onClick={() => onNavigate('about')}
          className="text-[10px] text-accent font-black uppercase tracking-[0.2em] hover:clay transition-colors"
        >
          About Project
        </button>
        <p className="text-[10px] text-ink/30 leading-normal uppercase tracking-wider text-center">
          AgriAssist Prototype • AI Studio Hackathon 2026
        </p>
      </div>
    </div>
  );
}
