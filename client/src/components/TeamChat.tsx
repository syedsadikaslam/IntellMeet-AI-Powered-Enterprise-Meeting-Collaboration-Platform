import { useState, useEffect, useRef } from 'react';
import { Send, X, MessageSquare, User, AtSign } from 'lucide-react';
import api from '../utils/api';
import { socket, connectSocket } from '../utils/socket';
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

export default function TeamChat({ teamId, teamName, onClose }: TeamChatProps) {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();

    // Initialize/Connect Socket
    connectSocket();
    socket.emit('join-team', teamId);

    socket.on('receive-team-message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off('receive-team-message');
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
      socket.emit('send-team-message', {
        teamId,
        message: response.data,
      });

      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message', error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0a0f1d] border-l border-border w-full sm:w-80 md:w-96 shadow-2xl animate-in slide-in-from-right duration-300 relative z-[130]">
      {/* Header */}
      <div className="p-6 border-b border-border flex items-center justify-between bg-muted/50 dark:bg-muted/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
            <MessageSquare size={18} />
          </div>
          <div>
            <h3 className="font-black text-sm uppercase tracking-tighter text-slate-900 dark:text-slate-100">{teamName} Chat</h3>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest">Team Pipeline</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground">
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide"
      >
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-lg bg-muted shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-2 bg-muted rounded w-1/4" />
                  <div className="h-10 bg-muted/60 rounded-2xl w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-30">
            <div className="p-6 bg-muted rounded-[32px] shadow-inner">
               <AtSign size={48} className="text-muted-foreground" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">No transmissions yet</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg._id} className={`flex gap-3 ${msg.sender._id === user?._id ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2`}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/10">
                {msg.sender.avatar ? (
                  <img src={msg.sender.avatar} className="w-full h-full rounded-xl object-cover" />
                ) : (
                  <User size={16} className="text-white" />
                )}
              </div>
              <div className={`flex flex-col ${msg.sender._id === user?._id ? 'items-end' : ''} max-w-[80%]`}>
                <div className="flex items-center gap-2 mb-1.5 px-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{msg.sender.name}</span>
                  <span className="text-[8px] text-muted-foreground/40 font-black">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className={`px-4 py-3 rounded-2xl text-sm font-medium shadow-sm transition-all ${
                  msg.sender._id === user?._id 
                    ? 'bg-blue-600 text-white rounded-tr-none shadow-blue-600/10' 
                    : 'bg-muted text-foreground border border-border shadow-inner rounded-tl-none'
                }`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-border bg-muted/10">
        <form onSubmit={handleSendMessage} className="relative">
          <input 
            type="text"
            placeholder="Broadcast a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="w-full bg-muted border border-border rounded-2xl py-4 pl-5 pr-14 text-sm font-bold text-foreground focus:outline-none focus:border-blue-500/50 shadow-inner transition-all placeholder:text-muted-foreground/30"
          />
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-blue-600 disabled:opacity-20 disabled:bg-muted text-white rounded-xl hover:bg-blue-500 transition-all shadow-lg active:scale-95 shadow-blue-600/20"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
