/**
 * @file HomeView.tsx
 * @description The landing view for AgriAssist.
 */

import { Sprout, Camera, MessageSquare, ShieldCheck, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface HomeViewProps {
  onNavigate: (view: 'diagnosis' | 'resources' | 'about') => void;
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
          <span className="text-[10px] uppercase tracking-widest font-bold">Log Record Mode</span>
        </div>
      </div>

      {/* Hero Welcome */}
      <div className="space-y-6">
        <span className="section-label">Field Companion</span>
        <h2 className="text-5xl leading-tight font-serif text-ink">Modern records for your farm.</h2>
        <p className="text-ink/60 leading-relaxed font-sans text-sm">
          Capture crop observations and maintain a digital field journal to track changes and growth.
        </p>
        <button 
          id="hero-diagnose-btn"
          onClick={() => onNavigate('diagnosis')}
          className="btn-primary"
        >
          <Camera size={18} />
          Log Observation
        </button>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <span className="section-label">Resources</span>
        <div className="grid grid-cols-1 gap-4">
          <motion.button
            id="action-resources"
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('resources')}
            className="editorial-card flex items-center justify-between group cursor-pointer w-full text-left"
          >
            <div className="flex flex-col items-start gap-1">
              <span className="font-serif text-2xl group-hover:text-accent transition-colors">Help Center</span>
              <span className="text-xs text-ink/40 font-medium">Agricultural guidance & tips</span>
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
          AgriAssist Prototype • Field Trials 2026
        </p>
      </div>
    </div>
  );
}
