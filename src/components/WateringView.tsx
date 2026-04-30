import React, { useState, useEffect } from 'react';
import { Droplets, CloudRain, Sun, Thermometer, Loader2, AlertCircle, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getLocalWeather, WeatherData } from '../services/weatherService';
import { getWateringAdvice } from '../services/geminiService';
import { AdviceResult } from '../types';

export function WateringView() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [advice, setAdvice] = useState<AdviceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches local weather and requests AI-driven watering recommendations.
   * This handles the multi-step process: Weather API -> Gemini Analysis.
   */
  const fetchAdvice = async () => {
    setLoading(true);
    setError(null);
    try {
      // Step 1: Get the actual weather conditions for the region
      // In production, this would use a standard Weather API with user GPS.
      const weatherData = await getLocalWeather();
      setWeather(weatherData);
      
      // Step 2: Pass weather variables to the AI Watering Expert
      const adviceData = await getWateringAdvice({
        temperature: weatherData.temperature,
        rainProbability: weatherData.rainProbability,
        humidity: weatherData.humidity
      });
      
      // Step 3: Present the actionable advice
      setAdvice(adviceData);
    } catch (err: any) {
      console.error("Watering Advisor Failure:", err);
      setError("Unable to sync weather data correctly. Please check your internet signal.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvice();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-black/5 pb-4 mb-2">
        <h2 className="text-3xl font-serif text-ink italic">Watering</h2>
        <span className="section-label">Smart Advisor</span>
      </div>

      {loading && !advice ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <Loader2 size={32} className="animate-spin text-accent" />
          <p className="font-serif italic text-lg text-ink/60">Checking local weather and soil conditions...</p>
        </div>
      ) : error ? (
        <div className="editorial-card !border-clay bg-clay/5 space-y-4">
          <div className="flex items-center gap-2 text-clay">
            <AlertCircle size={20} />
            <span className="text-xs font-black uppercase tracking-widest">Network Error</span>
          </div>
          <p className="text-sm text-ink/70 font-serif italic">{error}</p>
          <button onClick={fetchAdvice} className="btn-primary w-full">
            <RefreshCcw size={16} />
            Try Again
          </button>
        </div>
      ) : (
        <AnimatePresence>
          {advice && weather && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 pb-20"
            >
              {/* Weather Banner */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white border border-black/5 p-4 rounded-xl flex flex-col items-center justify-center text-center">
                  <Thermometer size={20} className="text-clay mb-1" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-ink/30 mb-1">Temp</span>
                  <span className="text-xl font-serif text-ink">{weather.temperature}°C</span>
                </div>
                <div className="bg-white border border-black/5 p-4 rounded-xl flex flex-col items-center justify-center text-center">
                  <CloudRain size={20} className="text-accent mb-1" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-ink/30 mb-1">Rain</span>
                  <span className="text-xl font-serif text-ink">{weather.rainProbability}%</span>
                </div>
                <div className="bg-white border border-black/5 p-4 rounded-xl flex flex-col items-center justify-center text-center">
                  <Droplets size={20} className="text-emerald-500 mb-1" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-ink/30 mb-1">Humidity</span>
                  <span className="text-xl font-serif text-ink">{weather.humidity}%</span>
                </div>
              </div>

              {/* AI Advice Card */}
              <div className="editorial-card relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <Droplets size={120} strokeWidth={1} />
                </div>
                <span className="section-label">AI Recommendation</span>
                <h3 className="text-3xl font-serif text-accent mb-4 leading-tight">{advice.answer}</h3>
                
                <div className="space-y-4">
                  <span className="section-label text-[10px]">What you should do</span>
                  <ul className="space-y-3">
                    {advice.whatYouShouldDo.map((step, i) => (
                      <li key={i} className="flex gap-3">
                        <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-accent">
                          {i + 1}
                        </div>
                        <p className="text-[13px] text-ink/70 italic font-serif leading-relaxed">{step}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Water Conservation Note */}
              <div className="p-6 border border-emerald-500/10 bg-emerald-500/5 rounded-2xl flex items-start gap-4">
                <Sun size={24} className="text-emerald-600 flex-shrink-0" />
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Conservation Tip</h4>
                  <p className="text-[11px] text-emerald-800/70 leading-relaxed font-sans italic">
                    Watering in the early morning or evening reduces evaporation and helps your crops grow stronger while saving water.
                  </p>
                </div>
              </div>

              <button 
                onClick={fetchAdvice}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? <Loader2 className="animate-spin" /> : <RefreshCcw size={16} />}
                Update Advice
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
