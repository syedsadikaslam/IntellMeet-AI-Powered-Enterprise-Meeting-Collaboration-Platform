import { Send, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface ChatSidebarProps {
  messages: any[]
  onSendMessage: (message: string) => void
  onClose: () => void
  onTyping: () => void
  onStopTyping: () => void
  typingUsers: { userId: string, userName: string }[]
  isDisabled?: boolean
}

export default function ChatSidebar({ 
  messages, 
  onSendMessage, 
  onClose,
  onTyping,
  onStopTyping,
  typingUsers,
  isDisabled = false
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
    <div className="flex flex-col h-full bg-card border-l border-border w-full sm:w-80 shadow-2xl transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          Meeting Chat
          <span className="bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs px-2 py-0.5 rounded-full font-black">
            {messages.length}
          </span>
        </h2>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-40">
            <div className="p-3 bg-muted rounded-2xl">
              <Send size={24} className="text-foreground" />
            </div>
            <p className="text-sm text-foreground px-8 font-medium">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="flex flex-col gap-1 group">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 truncate max-w-[120px]">
                  {msg.senderName}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="bg-muted/50 rounded-2xl rounded-tl-none p-3 border border-border group-hover:border-blue-500/20 transition-all">
                <p className="text-sm text-foreground leading-relaxed break-words">{msg.text}</p>
              </div>
            </div>
          ))
        )}

        {/* Typing Indicators */}
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 px-1 animate-fade-in">
             <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
             </div>
             <p className="text-[10px] font-bold text-muted-foreground italic transition-colors">
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
      <form onSubmit={handleSend} className="p-4 bg-muted/30 border-t border-border mt-auto">
        <div className="relative group">
          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            disabled={isDisabled}
            placeholder={isDisabled ? "Chat disabled by host" : "Type a message..."}
            className={`w-full bg-muted border border-border rounded-xl py-3 pl-4 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500 focus:bg-background transition-all font-medium ${isDisabled ? 'opacity-50 cursor-not-allowed bg-red-500/5 border-red-500/20' : ''}`}
          />
          <button
            type="submit"
            disabled={isDisabled || !inputText.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:bg-muted rounded-lg text-white transition-all shadow-lg shadow-blue-600/20"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  )
}
