/**
 * @file DiagnosisView.tsx
 * @description View for crop diagnosis, including image capture and result display.
 */

import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, Loader2, CheckCircle2, AlertCircle, RefreshCcw, Crop as CropIcon, Check, ZoomIn, ZoomOut, X } from 'lucide-react';
import { motion } from 'motion/react';
import Cropper, { Area } from 'react-easy-crop';
import { diagnoseCrop } from '../services/geminiService';
import { DiagnosisResult } from '../types';
import { getCroppedImg } from '../lib/cropImage';
import { saveDiagnosis } from '../services/firebaseService';
import { auth } from '../lib/firebase';

export function DiagnosisView() {
  const [loading, setLoading] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [fileType, setFileType] = useState<string>('image/jpeg');
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Explicitly requests camera permission before triggering the file input.
   */
  const handleCaptureClick = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        stream.getTracks().forEach(track => track.stop());
        setPermissionDenied(false);
        triggerFileInput();
      } catch (err) {
        setPermissionDenied(true);
      }
    } else {
      // Fallback for environments without mediaDevices support
      triggerFileInput();
    }
  };

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleConfirmCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    
    setIsCropping(false);
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const base64 = await getCroppedImg(imageSrc, croppedAreaPixels);
      const fullDataUrl = `data:${fileType};base64,${base64}`;
      setImagePreview(fullDataUrl);
      
      const diagnosis = await diagnoseCrop(base64, fileType);
      setResult(diagnosis);

      // Save to Firestore if authenticated
      if (auth.currentUser) {
        await saveDiagnosis(diagnosis, fullDataUrl);
      }
    } catch (err) {
      if (!navigator.onLine) {
        setError("You are currently offline. AgriAssist needs an internet connection to send your photo to our experts. Please move to an area with better signal and try again.");
      } else {
        setError("We're having trouble reaching our AI experts. This might be a temporary service issue. Please wait a few minutes and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles file selection.
   */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError("Please select an image file.");
      return;
    }

    setFileType(file.type);
    const reader = new FileReader();
    reader.onload = async () => {
      setImageSrc(reader.result as string);
      setIsCropping(true);
      setError(null);
      setResult(null);
      setImagePreview(null);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  const reset = () => {
    setImageSrc(null);
    setImagePreview(null);
    setIsCropping(false);
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

      {isCropping && imageSrc ? (
        <div className="fixed inset-0 z-[110] bg-bg flex flex-col p-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-serif text-ink italic">Refine Sample</h3>
              <span className="section-label">Center the affected part</span>
            </div>
            <button 
              onClick={() => setIsCropping(false)} 
              className="p-2 rounded-full border border-black/5 text-ink/40 hover:text-ink transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 relative bg-zinc-100 border border-black/[0.03] rounded-sm overflow-hidden mb-10 shadow-inner">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={4 / 3}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              showGrid={true}
              classes={{
                containerClassName: 'bg-zinc-100',
              }}
            />
          </div>

          <div className="space-y-8 bg-surface/50 p-6 -mx-6 -mb-6 backdrop-blur-md border-t border-black/[0.03]">
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="section-label !mb-0">Magnification</span>
                <span className="text-[10px] font-black font-sans text-accent uppercase tracking-widest">{zoom.toFixed(1)}x</span>
              </div>
              
              <div className="flex items-center gap-5">
                <button 
                  onClick={() => setZoom(Math.max(1, zoom - 0.1))}
                  className="p-3 border border-black/5 bg-white text-ink/40 active:scale-95 transition-all shadow-sm"
                >
                  <ZoomOut size={18} />
                </button>
                
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.01}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="flex-1 h-1.5 bg-black/5 rounded-full appearance-none accent-accent cursor-pointer"
                />

                <button 
                  onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                  className="p-3 border border-black/5 bg-white text-ink/40 active:scale-95 transition-all shadow-sm"
                >
                  <ZoomIn size={18} />
                </button>
              </div>
            </div>

            <button 
              onClick={handleConfirmCrop}
              className="btn-primary"
            >
              <Check size={16} />
              Process Sample
            </button>
          </div>
        </div>
      ) : !imagePreview ? (
        <div className="space-y-4">
          <div 
            id="upload-area"
            onClick={handleCaptureClick}
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
              capture="environment"
              className="hidden" 
              id="file-input"
            />
          </div>

          {permissionDenied && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="editorial-card !border-clay bg-clay/5"
            >
              <span className="section-label text-clay">Camera Access Needed</span>
              <p className="text-sm text-ink/70 leading-relaxed italic mb-4">
                AgriAssist needs permission to use your camera to see your crops. 
                Please tap "Allow" when your browser asks, or use the button below to select a photo from your gallery.
              </p>
              <button 
                onClick={triggerFileInput}
                className="flex items-center gap-2 bg-clay text-white px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-md"
              >
                <Upload size={14} />
                Select Photo from Gallery
              </button>
            </motion.div>
          )}
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
              className="space-y-10 pb-16"
            >
              {/* Confidence Indicator */}
              <div className="flex items-center justify-between px-4 py-3 bg-bg border border-black/5 rounded-full">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${result.confidence > 0.85 ? 'bg-emerald-500' : result.confidence > 0.7 ? 'bg-amber-500' : 'bg-clay'}`} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-ink/40">
                    Confidence: {(result.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                {result.confidence < 0.7 && (
                  <span className="text-[10px] font-bold text-clay uppercase animate-pulse">Low Confidence</span>
                )}
              </div>

              {/* Problem Identification */}
              <div className="editorial-card relative overflow-hidden">
                {result.confidence < 0.7 && (
                  <div className="absolute top-0 right-0 p-2">
                    <AlertCircle size={16} className="text-clay" />
                  </div>
                )}
                <span className="section-label">Likely Issue</span>
                <h3 className="text-4xl font-serif text-accent mb-3">{result.problem}</h3>
                <p className="text-sm text-ink/60 leading-relaxed italic">{result.cause}</p>
                {result.cropType !== 'Unknown' && (
                  <div className="mt-4 pt-4 border-t border-black/5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-ink/30">Detected Crop: {result.cropType}</span>
                  </div>
                )}
              </div>

              {/* Low Confidence Warning */}
              {result.confidence < 0.7 && (
                <div className="p-6 bg-clay/5 border border-clay/20 rounded-sm space-y-3">
                  <div className="flex items-center gap-2 text-clay">
                    <AlertCircle size={18} />
                    <h4 className="text-xs font-bold uppercase tracking-widest">Expert Consultation Required</h4>
                  </div>
                  <p className="text-sm text-ink/70 leading-relaxed font-serif italic">
                    "I am not fully sure of this diagnosis. These results are for guidance only. 
                    Please consult a local agricultural officer or extension expert before taking major actions."
                  </p>
                </div>
              )}

              {/* What to do */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="section-label">Immediate Actions</span>
                  <div className="bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Organic Pref.</div>
                </div>
                <ul className="action-list">
                  {result.whatToDo.map((step, i) => (
                    <li key={i} className="action-list-item italic font-serif text-lg text-ink">
                      {step}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Long-term Prevention */}
              <section className="space-y-4">
                <span className="section-label">Safe Farming Tips</span>
                <div className="bg-bg p-6 border border-black/5 italic text-sm text-ink/70 leading-relaxed font-sans shadow-sm">
                  {result.prevention.join(". ")}
                </div>
              </section>

              <div className="pt-4 space-y-6">
                <button 
                  id="redo-btn"
                  onClick={reset}
                  className="btn-primary"
                >
                  <RefreshCcw size={16} />
                  New Diagnosis
                </button>

                {/* Safety Disclaimer */}
                <div className="text-center space-y-2 opacity-40 px-8">
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] leading-tight">
                    AgriAssist provides general farming advice and does not replace professional agricultural experts or laboratory testing.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {error && (
            <div className="editorial-card border-clay bg-clay/5">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="text-clay" size={20} />
                <span className="section-label text-clay !mb-0">Connection Issue</span>
              </div>
              <p className="font-serif text-lg italic mb-6 text-ink/80 leading-relaxed">{error}</p>
              <div className="flex gap-4">
                <button 
                  onClick={reset} 
                  className="flex-1 bg-clay text-white py-3 rounded-full text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-md"
                >
                  Try Again
                </button>
                <button 
                  onClick={() => setError(null)} 
                  className="flex-1 border border-black/10 text-ink/40 py-3 rounded-full text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
