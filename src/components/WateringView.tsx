import React, { useState, useEffect } from 'react';
import { 
  Droplets, 
  CloudRain, 
  Sun, 
  Thermometer, 
  Loader2, 
  AlertCircle, 
  RefreshCcw, 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  Save, 
  X,
  MapPin,
  Navigation
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getLocalWeather, WeatherData } from '../services/weatherService';
import { 
  saveWateringSchedule, 
  getWateringSchedules, 
  deleteWateringSchedule,
  updateUserLocation,
  getUserProfile
} from '../services/firebaseService';
import { AdviceResult, WateringSchedule } from '../types';
import { auth } from '../lib/firebase';

/**
 * Simulated watering recommendation function.
 * Logic is based on provided environmental variables.
 */
async function simulateWateringAdvice(weather: { temperature: number, rainProbability: number, humidity: number }): Promise<AdviceResult> {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  if (weather.rainProbability > 60) {
    return {
      answer: "Skip watering today.",
      whatYouShouldDo: [
        "Heavy rain is expected; watering now would be wasteful.",
        "Check drainage to ensure roots don't waterlog.",
        "Wait 24 hours after rain before checking soil again."
      ]
    };
  }
  
  if (weather.temperature > 32) {
    return {
      answer: "Water heavily this evening.",
      whatYouShouldDo: [
        "High heat increases evaporation; evening watering is best.",
        "Focus water at the root zones, not the leaves.",
        "Check soil moisture depth (top 2 inches should be wet)."
      ]
    };
  }

  return {
    answer: "Standard watering needed.",
    whatYouShouldDo: [
      "Moderate conditions mean once-a-day watering is sufficient.",
      "Best to water before 9am to avoid midday sun.",
      "Check for uniform soil moisture across your main crop rows."
    ]
  };
}

export function WateringView() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [advice, setAdvice] = useState<AdviceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number, lon: number } | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Scheduling states
  const [schedules, setSchedules] = useState<WateringSchedule[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newSchedule, setNewSchedule] = useState<Omit<WateringSchedule, 'id' | 'userId' | 'createdAt'>>({
    cropName: '',
    frequency: 'daily',
    preferredTime: '06:00',
    notes: ''
  });

  /**
   * Fetches local weather and requests AI-driven watering recommendations.
   */
  const fetchAdvice = async (lat?: number, lon?: number) => {
    setLoading(true);
    setError(null);
    try {
      const latitude = lat ?? userLocation?.lat;
      const longitude = lon ?? userLocation?.lon;
      const weatherData = await getLocalWeather(latitude, longitude);
      setWeather(weatherData);
      
      const adviceData = await simulateWateringAdvice({
        temperature: weatherData.temperature,
        rainProbability: weatherData.rainProbability,
        humidity: weatherData.humidity
      });
      
      setAdvice(adviceData);
    } catch (err: any) {
      console.error("Watering Advisor Failure:", err);
      setError("Unable to sync weather data correctly. Please check your internet signal.");
    } finally {
      setLoading(false);
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const loc = { lat: latitude, lon: longitude };
        setUserLocation(loc);
        setIsDetectingLocation(false);
        
        // Save to profile
        if (auth.currentUser) {
          await updateUserLocation(latitude, longitude);
        }
        
        // Refresh weather with new location
        fetchAdvice(latitude, longitude);
      },
      (err) => {
        console.error("Geolocation Error:", err);
        setIsDetectingLocation(false);
        setError("Location access denied. Using default regional weather.");
        fetchAdvice(); // fallback to default
      },
      { timeout: 10000 }
    );
  };

  const initData = async () => {
    // 1. Try to get saved location from profile
    if (auth.currentUser) {
      const profile = await getUserProfile();
      if (profile?.location) {
        setUserLocation(profile.location);
        fetchAdvice(profile.location.lat, profile.location.lon);
      } else {
        // No saved location, try autodetection or default
        fetchAdvice();
      }
    } else {
      fetchAdvice();
    }
    
    // 2. Load schedules
    loadSchedules();
  };

  const loadSchedules = async () => {
    if (!auth.currentUser) return;
    const data = await getWateringSchedules();
    setSchedules(data);
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !newSchedule.cropName) return;
    
    setIsSaving(true);
    try {
      await saveWateringSchedule(newSchedule);
      setShowForm(false);
      setNewSchedule({
        cropName: '',
        frequency: 'daily',
        preferredTime: '06:00',
        notes: ''
      });
      await loadSchedules();
    } catch (err) {
      console.error("Save Schedule Error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!auth.currentUser) return;
    try {
      await deleteWateringSchedule(id);
      await loadSchedules();
    } catch (err) {
      console.error("Delete Schedule Error:", err);
    }
  };

  useEffect(() => {
    initData();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-black/5 pb-4 mb-2">
        <div className="flex flex-col">
          <h2 className="text-3xl font-serif text-ink italic leading-none">Watering</h2>
          <div className="flex items-center gap-2 mt-2">
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${userLocation ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-surface border-black/5 text-ink/40'}`}>
              <MapPin size={10} />
              <span className="text-[9px] font-black uppercase tracking-widest">
                {userLocation ? 'Localized' : 'Default Region'}
              </span>
            </div>
            <button 
              onClick={detectLocation}
              disabled={isDetectingLocation}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-accent/5 border border-accent/10 text-accent hover:bg-accent/10 transition-colors disabled:opacity-50"
            >
              {isDetectingLocation ? (
                <Loader2 size={10} className="animate-spin" />
              ) : (
                <Navigation size={10} />
              )}
              <span className="text-[9px] font-black uppercase tracking-widest">Update Location</span>
            </button>
          </div>
        </div>
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
          <button onClick={() => fetchAdvice()} className="btn-primary w-full">
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
                onClick={() => fetchAdvice()}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? <Loader2 className="animate-spin" /> : <RefreshCcw size={16} />}
                Update Advice
              </button>

              {/* Custom Schedules Section */}
              <div className="space-y-6 pt-6 border-t border-black/5">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="section-label">My Field Records</span>
                    <h3 className="text-2xl font-serif text-ink italic leading-tight">Irrigation Plans</h3>
                  </div>
                  <button 
                    onClick={() => setShowForm(!showForm)}
                    className="p-2 border border-black/10 rounded-full hover:bg-surface transition-colors"
                  >
                    {showForm ? <X size={20} /> : <Plus size={20} className="text-accent" />}
                  </button>
                </div>

                <AnimatePresence>
                  {showForm && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <form onSubmit={handleSaveSchedule} className="bg-surface border border-black/5 p-6 rounded-2xl space-y-4 shadow-sm">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-ink/30 ml-1">Crop Name</label>
                          <input 
                            type="text"
                            required
                            placeholder="e.g. Maize, Tomatoes"
                            className="input-field"
                            value={newSchedule.cropName}
                            onChange={e => setNewSchedule({...newSchedule, cropName: e.target.value})}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-ink/30 ml-1">Frequency</label>
                            <select 
                              className="input-field text-xs"
                              value={newSchedule.frequency}
                              onChange={e => setNewSchedule({...newSchedule, frequency: e.target.value as any})}
                            >
                              <option value="daily">Daily</option>
                              <option value="twice-daily">Twice Daily</option>
                              <option value="alternate-days">Alternate Days</option>
                              <option value="weekly">Weekly</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-ink/30 ml-1">Time</label>
                            <input 
                              type="time"
                              required
                              className="input-field"
                              value={newSchedule.preferredTime}
                              onChange={e => setNewSchedule({...newSchedule, preferredTime: e.target.value})}
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-ink/30 ml-1">Notes</label>
                          <textarea 
                            placeholder="Additional instructions..."
                            className="input-field min-h-[80px]"
                            value={newSchedule.notes}
                            onChange={e => setNewSchedule({...newSchedule, notes: e.target.value})}
                          />
                        </div>

                        <button 
                          type="submit" 
                          disabled={isSaving}
                          className="btn-primary w-full"
                        >
                          {isSaving ? <Loader2 className="animate-spin" /> : <Save size={16} />}
                          Save Plan
                        </button>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* List of Schedules */}
                <div className="grid grid-cols-1 gap-4">
                  {schedules.length === 0 ? (
                    <div className="p-10 border border-dashed border-black/10 rounded-2xl text-center space-y-2">
                      <Calendar size={24} className="mx-auto text-ink/20" />
                      <p className="text-xs text-ink/40 italic font-serif">No custom plans saved yet.</p>
                    </div>
                  ) : (
                    schedules.map(schedule => (
                      <motion.div 
                        key={schedule.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white border border-black/5 p-5 rounded-2xl flex items-start justify-between group"
                      >
                        <div className="flex gap-4">
                          <div className="bg-accent/5 p-3 rounded-xl">
                            <Droplets size={20} className="text-accent" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-serif text-lg text-ink italic leading-none">{schedule.cropName}</h4>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1 text-[10px] text-ink/40 font-medium uppercase tracking-tight">
                                <Calendar size={10} />
                                {schedule.frequency.replace('-', ' ')}
                              </div>
                              <div className="flex items-center gap-1 text-[10px] text-ink/40 font-medium uppercase tracking-tight">
                                <Clock size={10} />
                                {schedule.preferredTime}
                              </div>
                            </div>
                            {schedule.notes && (
                              <p className="text-[11px] text-ink/60 font-sans italic pt-1">{schedule.notes}</p>
                            )}
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDeleteSchedule(schedule.id)}
                          className="p-2 opacity-0 group-hover:opacity-100 text-clay hover:bg-clay/5 rounded-full transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
