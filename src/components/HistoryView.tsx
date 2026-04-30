/**
 * @file HistoryView.tsx
 * @description View for past crop diagnoses.
 */

import { useState, useEffect } from 'react';
import { Clock, ChevronRight, Sprout, Loader2, AlertCircle } from 'lucide-react';
import { getDiagnosesHistory } from '../services/firebaseService';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../lib/firebase';

export function HistoryView() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAuth, setHasAuth] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) {
      setHasAuth(false);
      setLoading(false);
      return;
    }
    getDiagnosesHistory().then(data => {
      setHistory(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-24">
        <Loader2 className="animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-32">
      <div className="flex items-center justify-between border-b border-black/5 pb-4 mb-2">
        <h2 className="text-3xl font-serif text-ink italic">History</h2>
        <span className="section-label">{hasAuth ? `${history.length} Saved` : 'Guest Mode'}</span>
      </div>

      {!hasAuth && (
        <div className="editorial-card !border-clay/20 bg-clay/5">
          <div className="flex items-start gap-4">
            <AlertCircle className="text-clay mt-1 shrink-0" size={18} />
            <div>
              <span className="section-label text-clay">Cloud Sync Disabled</span>
              <p className="text-sm text-ink/70 leading-relaxed font-serif italic">
                Anonymous sign-in is not enabled. Your diagnoses will only be saved locally in this session. 
              </p>
            </div>
          </div>
        </div>
      )}

      {hasAuth && history.length === 0 ? (
        <div className="editorial-card text-center !pl-0">
          <p className="text-sm text-ink/40 font-serif italic py-8">No past diagnoses found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item, idx) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="card flex items-center gap-4 bg-white hover:bg-zinc-50 transition-colors"
            >
              <div className="w-16 h-16 bg-zinc-100 overflow-hidden border border-black/5">
                <img src={item.imageUrl} alt={item.disease} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                   <span className="text-[10px] uppercase font-black tracking-widest text-accent">{item.crop}</span>
                   <span className="text-[8px] text-ink/20">•</span>
                   <span className="text-[10px] text-ink/40 uppercase tracking-widest">
                     {item.timestamp?.toDate ? new Date(item.timestamp.toDate()).toLocaleDateString() : 'Just now'}
                   </span>
                </div>
                <h4 className="font-serif text-lg text-ink truncate italic">{item.disease}</h4>
              </div>
              <ChevronRight size={16} className="text-ink/10" />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
