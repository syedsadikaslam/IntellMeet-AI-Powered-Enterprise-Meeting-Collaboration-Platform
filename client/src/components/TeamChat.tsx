import { useState, useEffect, useRef } from 'react';
import { Send, X, MessageSquare, User, AtSign } from 'lucide-react';
import api from '../utils/api';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/useAuthStore';

interface Message {
  _id: string;
  sender: {
    _id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  createdAt: string;
}

interface TeamChatProps {
  teamId: string;
  teamName: string;
  onClose: () => void;
}

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function TeamChat({ teamId, teamName, onClose }: TeamChatProps) {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    fetchMessages();

    // Initialize Socket
    socketRef.current = io(SOCKET_URL);
    socketRef.current.emit('join-team', teamId);

    socketRef.current.on('receive-team-message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [teamId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/messages/${teamId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to fetch messages', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await api.post('/messages', {
        teamId,
        content: newMessage,
      });

      // Broadcast via socket
      socketRef.current?.emit('send-team-message', {
        teamId,
        message: response.data,
      });

      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message', error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0f1d] border-l border-white/10 w-80 sm:w-96 shadow-2xl animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
            <MessageSquare size={18} />
          </div>
          <div>
            <h3 className="font-black text-sm uppercase tracking-tighter">{teamName} Chat</h3>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-[10px] text-white/30 font-bold uppercase">Team Pipeline</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-white/40 hover:text-white">
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide"
      >
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-lg bg-white/5 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-white/5 rounded w-1/4" />
                  <div className="h-10 bg-white/5 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-20">
            <AtSign size={40} />
            <p className="text-xs font-bold uppercase tracking-widest">No transmissions yet</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg._id} className={`flex gap-3 ${msg.sender._id === user?._id ? 'flex-row-reverse' : ''}`}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shrink-0 shadow-lg">
                {msg.sender.avatar ? (
                  <img src={msg.sender.avatar} className="w-full h-full rounded-lg object-cover" />
                ) : (
                  <User size={14} className="text-white" />
                )}
              </div>
              <div className={`flex flex-col ${msg.sender._id === user?._id ? 'items-end' : ''}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase text-white/40">{msg.sender.name}</span>
                  <span className="text-[9px] text-white/20 font-mono">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className={`px-4 py-2.5 rounded-2xl text-sm font-medium max-w-[240px] shadow-sm ${
                  msg.sender._id === user?._id 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white/5 text-white/80 border border-white/5 rounded-tl-none'
                }`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-white/5 bg-white/[0.01]">
        <form onSubmit={handleSendMessage} className="relative">
          <input 
            type="text"
            placeholder="Broadcast a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-5 pr-14 text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all font-bold placeholder:text-white/10"
          />
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-blue-600 disabled:opacity-50 disabled:bg-white/5 text-white rounded-xl hover:bg-blue-500 transition-all shadow-lg active:scale-95"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
