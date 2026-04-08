import { Mic, MicOff, Search, User as UserIcon, Video, VideoOff, X, Shield, Trash2, MicOff as MicOffIcon } from 'lucide-react'
import { useState } from 'react'

interface Participant {
  userId: string
  userName: string
  socketId: string
}

interface ParticipantStates {
  [userId: string]: {
    isMicOn: boolean
    isVideoOn: boolean
  }
}

interface ParticipantSidebarProps {
  participants: Participant[]
  participantStates: ParticipantStates
  localUserId: string
  hostId: string
  onMuteParticipant: (userId: string) => void
  onRemoveParticipant: (userId: string) => void
  onClose: () => void
}

export default function ParticipantSidebar({ 
  participants, 
  participantStates, 
  localUserId, 
  hostId,
  onMuteParticipant,
  onRemoveParticipant,
  onClose 
}: ParticipantSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredParticipants = participants.filter(p => 
    p.userName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full bg-[#0a0f1d] border-l border-white/10 w-80 shadow-2xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#0d1425]">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          Participants
          <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-full">
            {participants.length}
          </span>
        </h2>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-white/5 rounded-lg transition-colors text-white/50 hover:text-white"
        >
          <X size={20} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4">
        <div className="relative group">
           <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-400 transition-colors" />
           <input 
             type="text" 
             placeholder="Search people..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-all font-medium"
           />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1 scrollbar-thin scrollbar-thumb-white/10">
        {filteredParticipants.map((p) => {
          const state = participantStates[p.userId] || { isMicOn: true, isVideoOn: true }
          const isLocal = p.userId === localUserId
          const isHost = p.userId === hostId
          const isAdmin = localUserId === hostId

          return (
            <div 
              key={p.userId} 
              className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 transition-colors group cursor-default"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${isHost ? 'bg-blue-600/20 border-blue-500/30' : 'bg-white/5 border-white/10'}`}>
                    {isHost ? <Shield size={18} className="text-blue-400" /> : <UserIcon size={20} className="text-white/40" />}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#0a0f1d]" />
                </div>
                <div className="truncate">
                  <p className="text-sm font-bold text-white/90 truncate flex items-center gap-1.5">
                    {p.userName} 
                    {isLocal && <span className="text-[10px] text-blue-400 font-black uppercase">(You)</span>}
                  </p>
                  <p className={`text-[10px] font-bold uppercase tracking-widest leading-none ${isHost ? 'text-blue-400' : 'text-white/30'}`}>
                    {isHost ? 'Host / Admin' : 'Participant'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                 {/* Admin Controls */}
                 {isAdmin && !isHost && (
                   <div className="flex items-center gap-1.5 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onMuteParticipant(p.userId)}
                        title="Mute Participant"
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-all"
                      >
                         <MicOffIcon size={14} />
                      </button>
                      <button 
                        onClick={() => onRemoveParticipant(p.userId)}
                        title="Remove Participant"
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-red-600/20 text-white/40 hover:text-red-500 transition-all"
                      >
                         <Trash2 size={14} />
                      </button>
                   </div>
                 )}

                 <div className={`p-1.5 rounded-lg border transition-all ${state.isMicOn ? 'bg-white/5 border-white/5 text-white/40' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                    {state.isMicOn ? <Mic size={14} /> : <MicOff size={14} />}
                 </div>
                 <div className={`p-1.5 rounded-lg border transition-all ${state.isVideoOn ? 'bg-white/5 border-white/5 text-white/40' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                    {state.isVideoOn ? <Video size={14} /> : <VideoOff size={14} />}
                 </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer Info */}
      <div className="p-4 bg-[#0d1425] border-t border-white/10">
         <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white/60 hover:text-white hover:bg-white/10 transition-all active:scale-95">
            Invite Link
         </button>
      </div>
    </div>
  )
}
