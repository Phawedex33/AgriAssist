/**
 * @file OnboardingFlow.tsx
 * @description A multi-step onboarding experience for new AgriAssist users.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, MessageSquare, Sprout, Check, ChevronRight, Globe } from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: (preferences: UserPreferences) => void;
}

export interface UserPreferences {
  language: string;
  primaryCrop: string;
}

type OnboardingStep = 'welcome' | 'diagnosis' | 'chat' | 'preferences';

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [preferences, setPreferences] = useState<UserPreferences>({
    language: 'English',
    primaryCrop: 'Maize'
  });

  const steps: OnboardingStep[] = ['welcome', 'diagnosis', 'chat', 'preferences'];
  const currentIndex = steps.indexOf(step);

  const nextStep = () => {
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    } else {
      onComplete(preferences);
    }
  };

  const renderWelcome = () => (
    <div className="space-y-8 text-center px-4">
      <div className="flex justify-center">
        <div className="bg-accent/10 p-6 rounded-full text-accent">
          <Sprout size={48} strokeWidth={1} />
        </div>
      </div>
      <div className="space-y-4">
        <span className="section-label">Foundation</span>
        <h2 className="text-4xl font-serif italic text-ink leading-tight">Welcome to AgriAssist</h2>
        <p className="text-sm text-ink/60 leading-relaxed font-sans">
          A production prototype designed to support smallholder farmers with AI-driven insights and expert guidance.
        </p>
      </div>
    </div>
  );

  const renderDiagnosis = () => (
    <div className="space-y-8 text-center px-4">
      <div className="flex justify-center">
        <div className="bg-accent/10 p-6 rounded-full text-accent">
          <Camera size={48} strokeWidth={1} />
        </div>
      </div>
      <div className="space-y-4">
        <span className="section-label">Feature 01</span>
        <h2 className="text-4xl font-serif italic text-ink leading-tight">Instant Diagnosis</h2>
        <p className="text-sm text-ink/60 leading-relaxed font-sans">
          Take a photo of your crop to identify diseases, pests, and nutrient deficiencies. Works even with weak signals.
        </p>
      </div>
    </div>
  );

  const renderChat = () => (
    <div className="space-y-8 text-center px-4">
      <div className="flex justify-center">
        <div className="bg-accent/10 p-6 rounded-full text-accent">
          <MessageSquare size={48} strokeWidth={1} />
        </div>
      </div>
      <div className="space-y-4">
        <span className="section-label">Feature 02</span>
        <h2 className="text-4xl font-serif italic text-ink leading-tight">Expert Advisor</h2>
        <p className="text-sm text-ink/60 leading-relaxed font-sans">
          Chat with our AI agricultural officer for tailored advice on planting, soil health, and sustainable practices.
        </p>
      </div>
    </div>
  );

  const renderPreferences = () => (
    <div className="space-y-8 text-left px-4">
      <div className="space-y-6">
        <span className="section-label text-center block">Configuration</span>
        <h2 className="text-3xl font-serif italic text-ink leading-tight text-center">Personalize Advice</h2>
        
        <div className="space-y-6 pt-4">
          {/* Language Selector */}
          <div className="space-y-3">
            <label className="text-[10px] uppercase font-bold tracking-widest text-ink/40 flex items-center gap-2">
              <Globe size={12} /> Language
            </label>
            <div className="grid grid-cols-2 gap-3">
              {['English', 'Swahili'].map(lang => (
                <button
                  key={lang}
                  onClick={() => setPreferences(prev => ({ ...prev, language: lang }))}
                  className={`p-4 border text-sm font-bold uppercase tracking-wider transition-all ${
                    preferences.language === lang 
                    ? 'border-accent bg-accent/5 text-accent' 
                    : 'border-black/5 text-ink/30'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Core Crop Selector */}
          <div className="space-y-3">
            <label className="text-[10px] uppercase font-bold tracking-widest text-ink/40 flex items-center gap-2">
              <Sprout size={12} /> Primary Crop
            </label>
            <div className="grid grid-cols-2 gap-3">
              {['Maize', 'Sorghum', 'Beans', 'Rice'].map(crop => (
                <button
                  key={crop}
                  onClick={() => setPreferences(prev => ({ ...prev, primaryCrop: crop }))}
                  className={`p-4 border text-sm font-bold uppercase tracking-wider transition-all ${
                    preferences.primaryCrop === crop 
                    ? 'border-accent bg-accent/5 text-accent' 
                    : 'border-black/5 text-ink/30'
                  }`}
                >
                  {crop}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 'welcome': return renderWelcome();
      case 'diagnosis': return renderDiagnosis();
      case 'chat': return renderChat();
      case 'preferences': return renderPreferences();
    }
  };

  return (
    <div className="absolute inset-0 bg-bg z-[100] flex flex-col p-8 pt-24">
      {/* Progress Indicator */}
      <div className="flex gap-2 mb-12 justify-center">
        {steps.map((s, i) => (
          <div 
            key={s} 
            className={`h-1 transition-all duration-500 ${
              i <= currentIndex ? 'w-8 bg-accent' : 'w-4 bg-black/5'
            }`} 
          />
        ))}
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="pt-12">
        <button 
          onClick={nextStep}
          className="btn-primary"
        >
          {currentIndex === steps.length - 1 ? 'Start Farming' : 'Continue'}
          <ChevronRight size={18} />
        </button>
        {step === 'welcome' && (
          <button 
            disabled
            className="w-full text-center mt-6 text-[10px] uppercase font-bold tracking-widest text-ink/20"
          >
            v1.0 Hackathon Build
          </button>
        )}
      </div>
    </div>
  );
}
