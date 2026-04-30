/**
 * @file App.tsx
 * @description Main application controller for AgriAssist.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home as HomeIcon, 
  Camera, 
  MessageSquare, 
  Sprout, 
  ChevronRight,
  Info
} from 'lucide-react';
import { HomeView } from './components/HomeView';
import { DiagnosisView } from './components/DiagnosisView';
import { ChatView } from './components/ChatView';

/**
 * Views available in the application.
 */
type ViewType = 'home' | 'diagnosis' | 'chat';

export default function App() {
  const [activeView, setActiveView] = useState<ViewType>('home');

  /**
   * Renders the current active view with a transition.
   */
  const renderView = () => {
    switch (activeView) {
      case 'home':
        return <HomeView onNavigate={(view) => setActiveView(view)} />;
      case 'diagnosis':
        return <DiagnosisView />;
      case 'chat':
        return <ChatView />;
      default:
        return <HomeView onNavigate={(view) => setActiveView(view)} />;
    }
  };

  return (
    <div className="app-container" id="agriassist-root">
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
          <span className="mt-1">Diagnose</span>
        </motion.button>
        
        <motion.button 
          id="nav-chat"
          onClick={() => setActiveView('chat')}
          whileTap={{ scale: 0.9 }}
          className={`bottom-nav-item ${activeView === 'chat' ? 'active' : ''}`}
        >
          <MessageSquare size={22} strokeWidth={activeView === 'chat' ? 2.5 : 2} />
          <span>Advisor</span>
        </motion.button>
      </nav>
    </div>
  );
}
