/**
 * @file DiagnosisView.tsx
 * @description View for crop diagnosis, including image capture and result display.
 */

import React, { useState, useRef } from 'react';
import { Camera, Upload, Loader2, CheckCircle2, AlertCircle, RefreshCcw } from 'lucide-react';
import { motion } from 'motion/react';
import { diagnoseCrop } from '../services/geminiService';
import { DiagnosisResult } from '../types';

export function DiagnosisView() {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handles file selection and initiates diagnosis.
   */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError("Please select an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      setImagePreview(reader.result as string);
      setLoading(true);
      setError(null);
      setResult(null);

      try {
        const diagnosis = await diagnoseCrop(base64, file.type);
        setResult(diagnosis);
      } catch (err) {
        setError("Error connecting to AI. Please check your signal.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  const reset = () => {
    setImagePreview(null);
    setResult(null);
    setLoading(false);
    setError(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-black/5 pb-4 mb-2">
        <h2 className="text-3xl font-serif text-ink italic">Diagnosis</h2>
        <span className="section-label">Engine v1.0</span>
      </div>

      {!imagePreview ? (
        <div 
          id="upload-area"
          onClick={triggerFileInput}
          className="flex flex-col items-center justify-center border border-black/10 rounded-sm p-16 bg-bg cursor-pointer transition-all hover:bg-zinc-50"
        >
          <div className="text-accent mb-4">
            <Camera size={40} strokeWidth={1.5} />
          </div>
          <p className="font-serif text-xl text-ink italic">Capture Image</p>
          <p className="text-ink/40 text-[10px] uppercase tracking-widest mt-2 font-bold">Tap to access camera</p>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
            id="file-input"
          />
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Image Preview Window */}
          <div className="relative border border-black/5 p-1 bg-white">
            <div className="aspect-[4/3] overflow-hidden bg-zinc-100 flex items-center justify-center">
              <img src={imagePreview} alt="Crop to diagnose" className="w-full h-full object-cover opacity-90" />
            </div>
            
            {loading ? (
              <div className="absolute inset-0 bg-bg/80 backdrop-blur-sm flex flex-col items-center justify-center text-ink p-8 text-center">
                <Loader2 size={32} className="animate-spin text-accent mb-4" />
                <span className="section-label">Analyzing Sample</span>
                <p className="font-serif text-2xl italic">Identifying stressors...</p>
                <div className="w-full max-w-[200px] mt-6 space-y-3">
                  <div className="h-2 w-full skeleton" />
                  <div className="h-2 w-3/4 skeleton mx-auto" />
                </div>
              </div>
            ) : result && (
              <div className="absolute top-4 left-4 bg-white border border-black/5 px-4 py-2 shadow-xl rounded-full">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-clay rounded-full animate-pulse" />
                  <span className="text-[10px] font-extrabold uppercase tracking-widest">Analysis Complete</span>
                </div>
              </div>
            )}
          </div>

          {/* Results Area */}
          {loading && !result ? (
            <div className="space-y-8">
              <div className=" editorial-card !border-zinc-100">
                <div className="h-10 w-3/4 skeleton mb-4" />
                <div className="h-4 w-full skeleton" />
              </div>
              <div className="space-y-4">
                <div className="h-4 w-1/4 skeleton" />
                <div className="card h-32 w-full skeleton" />
              </div>
            </div>
          ) : result && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-10 pb-8"
            >
              {/* Problem Identification */}
              <div className="editorial-card">
                <span className="section-label">Likely Issue</span>
                <h3 className="text-4xl font-serif text-accent mb-3">{result.problem}</h3>
                <p className="text-sm text-ink/60 leading-relaxed italic">{result.cause}</p>
              </div>

              {/* What to do */}
              <section className="space-y-4">
                <span className="section-label">Immediate Actions</span>
                <ul className="action-list">
                  {result.whatToDo.map((step, i) => (
                    <li key={i} className="action-list-item italic font-serif text-lg text-ink">
                      {step}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Prevention */}
              <section className="space-y-4">
                <span className="section-label">Long-term Prevention</span>
                <div className="bg-bg p-6 border border-black/5 italic text-sm text-ink/70 leading-relaxed font-sans">
                  {result.prevention.join(". ")}
                </div>
              </section>

              <button 
                id="redo-btn"
                onClick={reset}
                className="btn-primary"
              >
                <RefreshCcw size={16} />
                New Diagnosis
              </button>
            </motion.div>
          )}

          {error && (
            <div className="editorial-card border-clay">
              <span className="section-label text-clay">System Error</span>
              <p className="font-serif text-xl italic mb-4">{error}</p>
              <button onClick={reset} className="text-[10px] font-bold uppercase tracking-widest text-clay underline">Re-initialize</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
