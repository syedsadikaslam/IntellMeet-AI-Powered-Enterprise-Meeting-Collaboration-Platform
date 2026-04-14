import { Send, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface ChatSidebarProps {
  messages: any[]
  onSendMessage: (message: string) => void
  onClose: () => void
  onTyping: () => void
  onStopTyping: () => void
  typingUsers: { userId: string, userName: string }[]
}

export default function ChatSidebar({ 
  messages, 
  onSendMessage, 
  onClose,
  onTyping,
  onStopTyping,
  typingUsers
}: ChatSidebarProps) {
  const [inputText, setInputText] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, typingUsers])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value)
    
    // Typing logic
    onTyping()

    // Clear existing timeout
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)

    // Set new timeout to stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      onStopTyping()
    }, 2000)
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputText.trim()) {
      onSendMessage(inputText)
      setInputText('')
      onStopTyping()
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#0a0f1d] border-l border-white/10 w-full sm:w-80 shadow-2xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#0d1425]">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          Meeting Chat
          <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-full">
            {messages.length}
          </span>
        </h2>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-white/5 rounded-lg transition-colors text-white/50 hover:text-white"
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-40">
            <div className="p-3 bg-white/5 rounded-2xl">
              <Send size={24} className="text-white" />
            </div>
            <p className="text-sm text-white px-8">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="flex flex-col gap-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-xs font-bold text-blue-400 truncate max-w-[120px]">
                  {msg.senderName}
                </span>
                <span className="text-[10px] text-white/30">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="bg-white/5 rounded-2xl rounded-tl-none p-3 border border-white/5">
                <p className="text-sm text-white/90 leading-relaxed break-words">{msg.text}</p>
              </div>
            </div>
          ))
        )}

        {/* Typing Indicators */}
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 px-1">
             <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
             </div>
             <p className="text-[10px] font-bold text-white/40 italic">
                {typingUsers.length === 1 
                  ? `${typingUsers[0].userName} is typing...`
                  : typingUsers.length === 2
                  ? `${typingUsers[0].userName} and ${typingUsers[1].userName} are typing...`
                  : `${typingUsers[0].userName} and ${typingUsers.length - 1} others are typing...`}
             </p>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 bg-[#0d1425] border-t border-white/10">
        <div className="relative group">
          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all font-medium"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:bg-white/10 rounded-lg text-white transition-all shadow-lg shadow-blue-500/10"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  )
}
