/**
 * @file HomeView.tsx
 * @description The landing view for AgriAssist.
 */

import { Sprout, Camera, MessageSquare, Droplets, Info } from 'lucide-react';
import { motion } from 'motion/react';

interface HomeViewProps {
  onNavigate: (view: 'diagnosis' | 'watering' | 'chat' | 'about') => void;
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
          <span className="text-[10px] uppercase tracking-widest font-bold text-clay">AI Active</span>
        </div>
      </div>

      {/* Hero Welcome */}
      <div className="space-y-6">
        <span className="section-label">Field Companion</span>
        <h2 className="text-5xl leading-tight font-serif text-ink">Modern solutions for your farm.</h2>
        <p className="text-ink/60 leading-relaxed font-sans text-sm">
          Diagnose crop diseases instantly using AI or consult our expert agricultural advisor for localized farming guidance.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            id="hero-diagnose-btn"
            onClick={() => onNavigate('diagnosis')}
            className="btn-primary sm:flex-1"
          >
            <Camera size={18} />
            Scan Crop
          </button>
          <button 
            id="hero-watering-btn"
            onClick={() => onNavigate('watering')}
            className="btn-primary sm:flex-1 bg-white !text-accent border border-accent shadow-none hover:bg-accent/5"
          >
            <Droplets size={18} />
            Watering Guide
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4 pb-12">
        <span className="section-label">General Help</span>
        <div className="grid grid-cols-1 gap-4">
          <motion.button
            id="action-chat"
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('chat')}
            className="editorial-card flex items-center justify-between group cursor-pointer w-full text-left"
          >
            <div className="flex flex-col items-start gap-1">
              <span className="font-serif text-2xl group-hover:text-accent transition-colors">Ask AI Assistant</span>
              <span className="text-xs text-ink/40 font-medium">Localized agricultural guidance</span>
            </div>
            <MessageSquare size={24} className="text-accent opacity-20 group-hover:opacity-100 transition-opacity" strokeWidth={1} />
          </motion.button>
          
          <motion.button
            id="action-about"
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('about')}
            className="editorial-card flex items-center justify-between group cursor-pointer w-full text-left border-dashed"
          >
            <div className="flex flex-col items-start gap-1">
              <span className="font-serif text-2xl group-hover:text-clay transition-colors">About Project</span>
              <span className="text-xs text-ink/40 font-medium">Learn more about AgriAssist</span>
            </div>
            <Info size={24} className="text-clay opacity-20 group-hover:opacity-100 transition-opacity" strokeWidth={1} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
