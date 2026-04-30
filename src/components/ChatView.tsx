/**
 * @file ChatView.tsx
 * @description Agricultural assistant chat view for AgriAssist.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageSquare, Send, Bot, User, Loader2, Sparkles, Mic, MicOff, AlertCircle } from 'lucide-react';
import { getFarmingAdvice } from '../services/geminiService';
import { ChatMessage, AdviceResult } from '../types';
import { saveChatMessage } from '../services/firebaseService';
import { auth } from '../lib/firebase';

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
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  /**
   * Initialize speech recognition
   */
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  }, [isListening]);

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

    // Save to Firestore if authenticated
    if (auth.currentUser) {
      await saveChatMessage('user', text);
    }

    try {
      const advice: AdviceResult = await getFarmingAdvice(text);
      const adviceContent = `**Answer:**\n${advice.answer}\n\n**What you should do:**\n${advice.whatYouShouldDo.map(step => `- ${step}`).join('\n')}`;
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: adviceContent,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (auth.currentUser) {
        await saveChatMessage('assistant', adviceContent);
      }
    } catch (error) {
      let errorMessageContent = "I'm sorry, I'm having trouble connecting to the advisory service. Please check your internet connection and try again.";
      
      if (!navigator.onLine) {
        errorMessageContent = "You are currently offline. I can't reach the agricultural knowledge base without internet. Please check your network and try again.";
      }

      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorMessageContent,
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
        <div className="flex gap-4 p-4 bg-white border border-black/10 rounded-sm items-center">
          <input 
            id="chat-input"
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
            placeholder="Type your question..."
            className="flex-1 bg-transparent text-sm font-sans placeholder:text-ink/20 focus:outline-none"
          />
          {speechSupported && (
            <button 
              onClick={toggleListening}
              className={`transition-colors ${isListening ? 'text-clay animate-pulse' : 'text-ink/20 hover:text-accent'}`}
            >
              <Mic size={20} />
            </button>
          )}
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5 text-[9px] font-bold text-ink/30 uppercase tracking-widest leading-none">
            <AlertCircle size={10} /> Experts only verified in demo
          </div>
          <button 
            id="send-chat-btn"
            onClick={() => handleSendMessage(inputText)}
            disabled={!inputText.trim() || loading || isListening || !navigator.onLine}
            className={`btn-primary w-fit ${
              (!inputText.trim() || loading || isListening || !navigator.onLine) && 'opacity-30'
            }`}
          >
            {navigator.onLine ? 'Send' : 'Offline'}
          </button>
        </div>
        <p className="text-[10px] text-ink/20 text-center uppercase tracking-widest leading-tight">
          AI advice is general. Consult local experts for critical matters.
        </p>
      </div>
    </div>
  );
}
