/**
 * @file App.tsx
 * @description Main application controller for AgriAssist.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home as HomeIcon, 
  Camera, 
  MessageSquare, 
  Sprout, 
  ChevronRight,
  Info,
  WifiOff,
  Loader2
} from 'lucide-react';
import { HomeView } from './components/HomeView';
import { DiagnosisView } from './components/DiagnosisView';
import { AboutView } from './components/AboutView';
import { HistoryView } from './components/HistoryView';
import { OnboardingFlow, UserPreferences } from './components/OnboardingFlow';
import { auth, ensureSignedIn } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { saveUserProfile } from './services/firebaseService';

/**
 * Views available in the application.
 */
type ViewType = 'home' | 'diagnosis' | 'resources' | 'about' | 'history';

export default function App() {
  const [activeView, setActiveView] = useState<ViewType>('home');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('agriassist_onboarding_done');
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Anonymous Sign-in on mount
    ensureSignedIn().finally(() => setLoading(false));

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, []);

  /**
   * Handles completion of onboarding.
   */
  const handleOnboardingComplete = async (prefs: UserPreferences) => {
    localStorage.setItem('agriassist_onboarding_done', 'true');
    localStorage.setItem('agriassist_prefs', JSON.stringify(prefs));
    
    // Save to Firestore if authenticated
    if (auth.currentUser) {
      await saveUserProfile(prefs.language, prefs.primaryCrop);
    }
    
    setShowOnboarding(false);
  };

  /**
   * Renders the current active view with a transition.
   */
  const renderView = () => {
    switch (activeView) {
      case 'home':
        return <HomeView onNavigate={(view) => setActiveView(view)} />;
      case 'diagnosis':
        return <DiagnosisView />;
      case 'resources':
        return <AboutView />; // Placeholder for resources
      case 'history':
        return <HistoryView />;
      case 'about':
        return <AboutView />;
      default:
        return <HomeView onNavigate={(view) => setActiveView(view)} />;
    }
  };

  if (loading) {
    return (
      <div className="app-container flex items-center justify-center bg-bg">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="text-accent animate-spin" size={32} />
          <p className="section-label">Initializing AgriAssist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container" id="agriassist-root">
      {/* Offline Banner */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 inset-x-0 bg-clay text-white text-[10px] uppercase font-black tracking-[0.2em] py-2 text-center z-[100] flex items-center justify-center gap-2"
          >
            <WifiOff size={12} />
            Offline Mode Active • Saved Insights Available
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showOnboarding && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="absolute inset-0 z-[100]"
          >
            <OnboardingFlow onComplete={handleOnboardingComplete} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Accessibility / About Trigger */}
      <button 
        id="info-trigger"
        onClick={() => setActiveView(activeView === 'about' ? 'home' : 'about')}
        className={`absolute top-6 right-6 z-[60] transition-all duration-300 ${
          activeView === 'about' ? 'text-clay rotate-90' : 'text-ink/20 hover:text-accent'
        }`}
      >
        {activeView === 'about' ? (
          <div className="bg-white/50 backdrop-blur-sm p-1 rounded-full shadow-sm">
            <ChevronRight size={24} />
          </div>
        ) : (
          <Info size={20} strokeWidth={2} />
        )}
      </button>

      {/* Dynamic Content Area */}
      <div className="scrollarea">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="h-full"
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <motion.button 
          id="nav-home"
          onClick={() => setActiveView('home')}
          whileTap={{ scale: 0.9 }}
          className={`bottom-nav-item ${activeView === 'home' ? 'active' : ''}`}
        >
          <HomeIcon size={22} strokeWidth={activeView === 'home' ? 2.5 : 2} />
          <span>Home</span>
        </motion.button>
        
        <motion.button 
          id="nav-diagnosis"
          onClick={() => setActiveView('diagnosis')}
          whileTap={{ scale: 0.9 }}
          className={`bottom-nav-item ${activeView === 'diagnosis' ? 'active' : ''}`}
        >
          <div className={`p-4 rounded-full -mt-10 transition-all duration-300 ${activeView === 'diagnosis' ? 'bg-accent text-white shadow-xl shadow-accent/20' : 'bg-bg text-ink/20 border border-black/5'}`}>
            <Camera size={26} />
          </div>
          <span className="mt-1">Field Log</span>
        </motion.button>
        
        <motion.button 
          id="nav-resources"
          onClick={() => setActiveView('resources')}
          whileTap={{ scale: 0.9 }}
          className={`bottom-nav-item ${activeView === 'resources' ? 'active' : ''}`}
        >
          <Info size={22} strokeWidth={activeView === 'resources' ? 2.5 : 2} />
          <span>Help</span>
        </motion.button>

        <motion.button 
          id="nav-history"
          onClick={() => setActiveView('history')}
          whileTap={{ scale: 0.9 }}
          className={`bottom-nav-item ${activeView === 'history' ? 'active' : ''}`}
        >
          <Sprout size={22} strokeWidth={activeView === 'history' ? 2.5 : 2} />
          <span>Saved</span>
        </motion.button>
      </nav>
    </div>
  );
}
