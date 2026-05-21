
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { getUXConsultation } from '../services/geminiService';
import GlassButton from './GlassButton';

const AIStrategist: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: "Hello! I'm the AI UX Strategist. I can help you brainstorm solutions, explain design patterns, or tell you more about JT's design philosophy. What's on your mind?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const response = await getUXConsultation([...messages, userMsg]);
    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setIsTyping(false);
  };

  return (
    <section id="ai" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Interactive UX Strategist</h2>
          <p className="text-white/50 max-w-2xl mx-auto">
            Experience design strategy in real-time. Chat with our AI model to brainstorm user flows or technical implementations.
          </p>
        </div>

        <div className="glass rounded-3xl overflow-hidden flex flex-col h-[600px] border border-white/10 shadow-2xl">
          {/* Chat Header */}
          <div className="p-6 border-b border-white/10 flex items-center gap-4 bg-white/5">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            <div className="text-sm font-bold uppercase tracking-widest opacity-80">System Online: Gemini 3 Flash</div>
          </div>

          {/* Messages Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-white/10 rounded-tr-none' 
                    : 'glass rounded-tl-none border-white/5'
                }`}>
                  <p className="text-sm md:text-base leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="glass p-4 rounded-2xl rounded-tl-none border-white/5 flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-white/20 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-white/20 animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 rounded-full bg-white/20 animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-6 bg-white/5 border-t border-white/10">
            <div className="flex gap-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about accessibility, flows, or case studies..."
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-6 py-3 outline-none focus:border-white/30 transition-all"
              />
              <GlassButton type="submit" className="w-12 h-12 !px-0 rounded-full" disabled={isTyping}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </GlassButton>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default AIStrategist;
