/**
 * @file AboutView.tsx
 * @description Information about the AgriAssist project, its goals, and AI technology.
 */

import { Info, Shield, Scale, ExternalLink, ChevronRight } from 'lucide-react';

export function AboutView() {
  return (
    <div className="space-y-10 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-black/5 pb-4 mb-2">
        <h2 className="text-3xl font-serif text-ink italic">About Project</h2>
        <span className="section-label">Manifesto v1.0</span>
      </div>

      {/* Purpose Section */}
      <div className="editorial-card">
        <span className="section-label">Our Purpose</span>
        <h3 className="text-3xl font-serif text-accent mb-4">Empowering Smallholders</h3>
        <p className="text-sm text-ink/70 leading-relaxed font-sans">
          AgriAssist was conceived as a response to the information gap faced by rural smallholder farmers. 
          By bringing advanced AI diagnostics and expert agricultural consultation to the smartphone, 
          we aim to reduce crop loss and increase food security in tropical farming environments.
        </p>
      </div>

      {/* AI Capabilities */}
      <section className="space-y-6">
        <span className="section-label">AI Integration</span>
        <div className="space-y-4">
          <div className="card bg-surface/30">
            <h4 className="font-serif text-xl mb-2 text-ink">Computer Vision</h4>
            <p className="text-xs text-ink/50 leading-relaxed">
              Using the Gemini 1.5 Flash model, we analyze leaf patterns, discoloration, and structural damage 
              to identify common pests and diseases with high confidence levels.
            </p>
          </div>
          <div className="card bg-surface/30">
            <h4 className="font-serif text-xl mb-2 text-ink">Natural Language Advisor</h4>
            <p className="text-xs text-ink/50 leading-relaxed">
              Our chat interface provides structured, actionable farming advice tailored to the specific constraints 
              of small-scale agriculture, focusing on low-cost and organic interventions.
            </p>
          </div>
        </div>
      </section>

      {/* Hackathon Context */}
      <div className="editorial-card !border-clay">
        <span className="section-label text-clay">Development Context</span>
        <h3 className="text-2xl font-serif text-ink mb-2">Hackathon Prototype</h3>
        <p className="text-sm text-ink/60 italic leading-relaxed font-serif">
          This application was developed as a production-quality prototype for the 2026 AI Studio Hackathon. 
          It serves as a demonstration of how low-latency AI models can solve real-world problems in 
          challenging connectivity environments.
        </p>
      </div>

      {/* Legal Links */}
      <section className="space-y-4 pt-4">
        <span className="section-label">Legal & Privacy</span>
        <div className="space-y-2">
          <button 
            onClick={() => {
              localStorage.removeItem('agriassist_onboarding_done');
              window.location.reload();
            }}
            className="flex items-center justify-between w-full p-4 border border-black/5 bg-white group hover:bg-zinc-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Info size={16} className="text-clay" />
              <span className="text-sm font-medium text-ink/80">Restart Tool Introduction</span>
            </div>
            <ChevronRight size={14} className="text-ink/20 group-hover:text-ink/40" />
          </button>
          <a href="#" className="flex items-center justify-between p-4 border border-black/5 bg-white group hover:bg-zinc-50 transition-colors">
            <div className="flex items-center gap-3">
              <Shield size={16} className="text-clay" />
              <span className="text-sm font-medium text-ink/80">Privacy Policy</span>
            </div>
            <ExternalLink size={14} className="text-ink/20 group-hover:text-ink/40" />
          </a>
          <a href="#" className="flex items-center justify-between p-4 border border-black/5 bg-white group hover:bg-zinc-50 transition-colors">
            <div className="flex items-center gap-3">
              <Scale size={16} className="text-clay" />
              <span className="text-sm font-medium text-ink/80">Terms of Service</span>
            </div>
            <ExternalLink size={14} className="text-ink/20 group-hover:text-ink/40" />
          </a>
        </div>
      </section>

      {/* Credits */}
      <div className="text-center pt-8 opacity-30">
        <p className="text-[10px] font-black uppercase tracking-[0.3em]">Built with AI Studio</p>
      </div>
    </div>
  );
}
