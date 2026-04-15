import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, Sparkles, X, ChevronRight, MessageSquare, ListCheck, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface AIChatProps {
  socket: any;
  meetingCode: string;
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_PROMPTS = [
  { id: 'summary', text: 'Summarize the meeting so far', icon: FileText },
  { id: 'tasks', text: 'List all action items', icon: ListCheck },
  { id: 'key-points', text: 'What were the key points?', icon: Sparkles },
];

const AIChat: React.FC<AIChatProps> = ({ socket, meetingCode, isOpen, onClose }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (!socket) return;

    const handleAIAnswer = (data: { answer: string }) => {
      setIsTyping(false);
      const aiMessage: Message = {
        id: Date.now().toString(),
        text: data.answer,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    };

    socket.on('ai-answer', handleAIAnswer);
    return () => {
      socket.off('ai-answer', handleAIAnswer);
    };
  }, [socket]);

  const handleSend = (text: string = input) => {
    if (!text.trim() || !socket) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    socket.emit('ask-ai', {
      meetingCode,
      question: text
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed right-0 md:right-4 top-0 md:top-24 bottom-0 md:bottom-24 w-full md:w-96 z-[70] flex flex-col bg-background md:bg-card/90 backdrop-blur-2xl border-l md:border border-border md:rounded-3xl shadow-2xl overflow-hidden transition-colors duration-300"
        >
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <Bot size={24} />
              </div>
              <div>
                <h3 className="font-bold text-foreground">AI Assistant</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Online</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide"
          >
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400/50">
                  <MessageSquare size={32} />
                </div>
                <div>
                  <h4 className="text-foreground font-medium mb-1">How can I help?</h4>
                  <p className="text-sm text-muted-foreground">Ask me anything about the ongoing discussion, or try a quick prompt.</p>
                </div>
                <div className="w-full space-y-2">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt.id}
                      onClick={() => handleSend(prompt.text)}
                      className="w-full p-3 rounded-xl bg-muted border border-border hover:bg-muted/80 hover:border-blue-500/30 transition-all text-left text-xs text-foreground flex items-center gap-3 group"
                    >
                      <prompt.icon size={14} className="text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                      {prompt.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-sm transition-colors ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none shadow-md'
                      : 'bg-muted border border-border text-foreground rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted p-3 rounded-2xl rounded-tl-none border border-border flex gap-1">
                  <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border bg-muted/20">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask something..."
                className="w-full bg-muted border border-border rounded-xl py-3 pl-4 pr-12 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:hover:bg-blue-600 text-white rounded-lg transition-all shadow-md"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AIChat;
