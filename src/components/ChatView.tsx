/**
 * @file ChatView.tsx
 * @description Agricultural assistant chat view for AgriAssist.
 */

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { getFarmingAdvice } from '../services/geminiService';
import { ChatMessage, AdviceResult } from '../types';

/**
 * Suggested questions to help farmers get started.
 */
const QUICK_QUESTIONS = [
  "When should I plant maize?",
  "How to stop pests naturally?",
  "Signs of healthy soil",
  "Best time to water crops"
];

export function ChatView() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  /**
   * Auto-scroll to bottom of chat when new messages arrive.
   */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  /**
   * Handles sending a user message and getting AI advice.
   */
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const advice: AdviceResult = await getFarmingAdvice(text);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `**Answer:**\n${advice.answer}\n\n**What you should do:**\n${advice.whatYouShouldDo.map(step => `- ${step}`).join('\n')}`,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting to the advisory service. Please check your internet connection and try again.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-black/5 pb-4">
        <h2 className="text-3xl font-serif text-ink italic">Advisor</h2>
        <div className="flex items-center gap-2 text-clay">
          <div className="w-1.5 h-1.5 bg-clay rounded-full animate-pulse" />
          <span className="text-[10px] uppercase tracking-widest font-bold">Expert Sync Active</span>
        </div>
      </div>

      {/* Messages Window */}
      <div 
        ref={scrollRef}
        className="flex-1 bg-bg rounded-sm p-2 overflow-y-auto min-h-[400px]"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-8">
            <div className="text-accent">
              <Bot size={48} strokeWidth={1} />
            </div>
            <div className="space-y-2">
              <span className="section-label text-center block">AgriAssist AI</span>
              <p className="font-serif text-3xl italic text-ink">How can I assist your harvest today?</p>
            </div>
            
            <div className="grid grid-cols-1 gap-3 w-full">
              {QUICK_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  id={`quick-q-${i}`}
                  onClick={() => handleSendMessage(q)}
                  className="bg-white border border-black/5 p-4 text-left text-sm font-medium text-ink/60 hover:border-accent transition-all flex items-center justify-between group"
                >
                  <span className="group-hover:text-ink transition-colors">{q}</span>
                  <span className="text-clay opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-8 mb-4">
            {messages.map((m) => (
              <div 
                key={m.id}
                className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <span className="section-label mb-2 px-1">
                  {m.role === 'user' ? 'Farmer' : 'AgriAssist Advice'}
                </span>
                <div 
                  className={m.role === 'user' ? 'bubble-user' : 'bubble-ai'}
                >
                  {m.role === 'assistant' ? (
                    <div className="space-y-5">
                      {m.content.split('\n\n').map((part, idx) => {
                        const cleanPart = part.startsWith('**') ? part.replace(/\*\*/g, '') : part;
                        
                        if (cleanPart.includes('What you should do:') || cleanPart.includes('steps')) {
                          return (
                            <div key={idx} className="editorial-card !mb-0 !py-2">
                              <span className="section-label !mb-3">Action Plan</span>
                              <ul className="action-list !mt-0">
                                {cleanPart.split('\n').filter(l => l.trim().startsWith('-')).map((li, liIdx) => (
                                  <li key={liIdx} className="action-list-item !text-sm !pb-2 font-serif italic">
                                    {li.replace('-', '').trim()}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        }

                        return (
                          <div key={idx} className={idx === 0 ? 'font-serif text-lg italic text-accent leading-relaxed' : 'text-sm text-ink/70 leading-relaxed font-sans'}>
                            {cleanPart}
                          </div>
                        );
                      })}
                    </div>
                  ) : m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex flex-col items-start italic">
                <span className="section-label mb-2">Analyzing Request</span>
                <div className="bubble-ai flex items-center gap-3">
                  <Loader2 size={16} className="animate-spin text-accent" />
                  <span className="text-ink/40 text-xs font-serif uppercase tracking-widest">Consulting Knowledge Base...</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="space-y-4">
        <span className="section-label">Consult Expert</span>
        <div className="flex gap-4 p-4 bg-white border border-black/10 rounded-sm">
          <input 
            id="chat-input"
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
            placeholder="Type your question here (e.g., 'When to plant sorghum?')..."
            className="flex-1 bg-transparent text-sm font-sans placeholder:text-ink/20 focus:outline-none"
          />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[10px] uppercase tracking-widest text-ink/30 font-bold">Voice Support Coming Soon</span>
          <button 
            id="send-chat-btn"
            onClick={() => handleSendMessage(inputText)}
            disabled={!inputText.trim() || loading}
            className={`btn-primary w-fit ${
              (!inputText.trim() || loading) && 'opacity-30'
            }`}
          >
            Send Question
          </button>
        </div>
      </div>
    </div>
  );
}
