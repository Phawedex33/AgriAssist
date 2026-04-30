import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, MessageSquare, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getFarmingAdvice } from '../services/geminiService';
import { AdviceResult } from '../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  adviceData?: AdviceResult;
}

export function ChatView() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const advice = await getFarmingAdvice(userMessage.content);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: advice.answer,
        adviceData: advice,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError("I'm having trouble connecting to the network. Please check your signal and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between border-b border-black/5 pb-4 mb-4">
        <h2 className="text-3xl font-serif text-ink italic">Advisor</h2>
        <span className="section-label">AI Expert v1.0</span>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-6 pb-6 pr-2 scrollbar-hide"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30 px-8">
            <MessageSquare size={48} strokeWidth={1} />
            <p className="font-serif italic text-lg leading-relaxed">
              Ask about planting schedules, pest control, or soil health. I'm here to help you grow.
            </p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] rounded-2xl p-4 ${
                m.role === 'user' 
                  ? 'bg-accent text-white rounded-tr-none' 
                  : 'bg-white border border-black/5 rounded-tl-none shadow-sm'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {m.role === 'user' ? <User size={12} /> : <Bot size={12} className="text-accent" />}
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-50">
                    {m.role === 'user' ? 'You' : 'AgriAssist'}
                  </span>
                </div>
                
                <p className="text-sm leading-relaxed whitespace-pre-wrap font-sans">
                  {m.content}
                </p>

                {m.adviceData && (
                  <div className="mt-4 space-y-4 pt-4 border-t border-black/5">
                    {m.adviceData.whatYouShouldDo.length > 0 && (
                      <div className="space-y-2">
                        <span className="section-label text-[8px]">Actionable Steps</span>
                        <ul className="space-y-1">
                          {m.adviceData.whatYouShouldDo.map((step, i) => (
                            <li key={i} className="text-[13px] flex gap-2">
                              <span className="text-accent text-[10px]">•</span>
                              <span className="text-ink/70 italic font-serif">{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-white border border-black/5 rounded-2xl rounded-tl-none p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <Loader2 size={16} className="animate-spin text-accent" />
                <span className="text-[10px] font-black uppercase tracking-widest text-ink/30">Thinking...</span>
              </div>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center"
          >
            <div className="bg-clay/10 text-clay border border-clay/20 rounded-lg p-3 text-[11px] font-medium flex items-center gap-2">
              <AlertCircle size={14} />
              {error}
            </div>
          </motion.div>
        )}
      </div>

      <form 
        onSubmit={handleSubmit}
        className="relative mt-4"
      >
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your crops..."
          className="w-full bg-white border border-black/10 p-5 pr-14 text-sm font-sans rounded-full shadow-lg focus:outline-none focus:border-accent transition-all ring-accent/5 focus:ring-4"
          disabled={loading}
        />
        <button 
          type="submit"
          disabled={!input.trim() || loading}
          className={`absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-accent text-white rounded-full transition-all ${
            !input.trim() || loading ? 'opacity-20 translate-x-2' : 'opacity-100 hover:shadow-xl active:scale-90'
          }`}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
