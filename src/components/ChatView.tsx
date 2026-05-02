import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Sprout } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessage } from '../types';

/**
 * Simulated AI advisor function.
 * Provides context-aware responses without external API calls for the buildathon demo.
 */
async function simulateAdvisorResponse(question: string): Promise<string> {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const lowerQ = question.toLowerCase();
  
  if (lowerQ.includes('pest') || lowerQ.includes('bug') || lowerQ.includes('insect')) {
    return "It sounds like you might be dealing with a pest infestation. Organic solutions like neem oil or a simple soapy water spray can often help without damaging the soil. Have you noticed any specific leaf shape changes?";
  }
  
  if (lowerQ.includes('fertilizer') || lowerQ.includes('nutrient') || lowerQ.includes('yellow')) {
    return "For nutrient deficiencies, I recommend starting with compost or well-rotted manure. If you suspect nitrogen deficiency (yellowing leaves), try a liquid organic fertilizer. Ensure the soil is not too packed so roots can breathe.";
  }

  if (lowerQ.includes('water') || lowerQ.includes('dry') || lowerQ.includes('thirsty')) {
    return "Consistent soil moisture is key. Check the top 2 inches of soil; if dry, water deeply at the base early in the morning to prevent evaporation and fungal growth.";
  }
  
  return "That is a great question. For most smallholder farmers, maintaining consistent soil moisture and using organic mulches like rice straw are the best ways to ensure healthy growth. Is there a specific crop you are worried about?";
}

export function ChatView() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  /**
   * Automatically scroll to the bottom when messages change or loading state toggles.
   * Ensures the latest exchange is always visible to the user.
   */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await simulateAdvisorResponse(userMsg.content);
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error("Advisor Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header */}
      <div className="px-6 py-4 border-b border-black/5 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex flex-col">
          <h2 className="text-2xl font-serif text-ink italic leading-none">Field Advisor</h2>
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mt-1">Live Assistant</span>
        </div>
        <div className="p-2 border border-black/5 rounded-full">
          <Bot size={20} className="text-accent" />
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-8 space-y-8 no-scrollbar pb-32"
      >
        <AnimatePresence initial={false}>
          {messages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30 select-none pt-20"
            >
              <Sprout size={48} strokeWidth={1} />
              <p className="font-serif italic">Ask anything about your crops.</p>
            </motion.div>
          )}

          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border border-black/5 ${msg.role === 'user' ? 'bg-accent/10' : 'bg-clay/10'}`}>
                  {msg.role === 'user' ? <User size={14} className="text-accent" /> : <Bot size={14} className="text-clay" />}
                </div>
                <div className={`p-4 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-accent text-white rounded-tr-none' 
                    : 'bg-surface border border-black/5 text-ink rounded-tl-none font-serif italic text-lg shadow-sm'
                }`}>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="flex justify-start gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-clay/10 flex items-center justify-center border border-black/5">
              <Loader2 size={14} className="text-clay animate-spin" />
            </div>
            <div className="bg-surface border border-black/5 p-4 rounded-2xl rounded-tl-none shadow-sm">
              <div className="flex gap-1">
                <span className="w-1 h-1 bg-ink/20 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1 h-1 bg-ink/20 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1 h-1 bg-ink/20 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-black/5 bg-white sticky bottom-0 z-20">
        <form onSubmit={handleSend} className="relative flex items-center max-w-xl mx-auto w-full">
          <input
            type="text"
            id="chat-input"
            autoComplete="off"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question..."
            className="w-full bg-surface border border-black/5 rounded-full px-6 py-4 pr-14 text-sm focus:outline-none focus:border-accent transition-colors shadow-inner"
          />
          <button
            type="submit"
            id="chat-send"
            disabled={!input.trim() || loading}
            className="absolute right-2 p-3 bg-accent text-white rounded-full disabled:opacity-30 disabled:grayscale transition-all active:scale-95 shadow-md"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
