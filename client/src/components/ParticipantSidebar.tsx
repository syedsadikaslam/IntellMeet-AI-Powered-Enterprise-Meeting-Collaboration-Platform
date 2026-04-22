import { Mic, MicOff, Search, User as UserIcon, Video, VideoOff, X, Shield, Trash2, Link } from 'lucide-react'
import { useState } from 'react'

interface Participant {
  userId: string
  userName: string
  socketId: string
  avatar?: string
}

interface ParticipantStates {
  [userId: string]: {
    isMicOn: boolean
    isVideoOn: boolean
    micAllowed?: boolean
    videoAllowed?: boolean
  }
}

interface ParticipantSidebarProps {
  participants: Participant[]
  participantStates: ParticipantStates
  localUserId: string
  hostId: string
  onMuteParticipant: (userId: string) => void
  onRemoveParticipant: (userId: string) => void
  onUpdatePermission: (userId: string, permissions: { micAllowed?: boolean, videoAllowed?: boolean }) => void
  onInviteLink: () => void
  onClose: () => void
}

export default function ParticipantSidebar({ 
  participants, 
  participantStates, 
  localUserId, 
  hostId,
  onMuteParticipant,
  onRemoveParticipant,
  onUpdatePermission,
  onInviteLink,
  onClose 
}: ParticipantSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('')
  // Local optimistic state for permissions so admin sees instant feedback
  const [localPermOverrides, setLocalPermOverrides] = useState<Record<string, { micAllowed?: boolean, videoAllowed?: boolean }>>({});

  const handlePermission = (userId: string, key: 'micAllowed' | 'videoAllowed', currentValue: boolean) => {
    const newVal = !currentValue;
    setLocalPermOverrides(prev => ({ ...prev, [userId]: { ...prev[userId], [key]: newVal } }));
    onUpdatePermission(userId, { [key]: newVal });
  }

  const filteredParticipants = participants.filter(p => 
    p.userName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full bg-card border-l border-border w-full sm:w-80 shadow-2xl transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          Participants
          <span className="bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs px-2 py-0.5 rounded-full font-black">
            {participants.length}
          </span>
        </h2>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
        >
          <X size={20} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4">
        <div className="relative group">
           <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
           <input 
             type="text" 
             placeholder="Search people..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full bg-muted border border-border rounded-xl py-2.5 pl-10 pr-4 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500/50 focus:bg-background transition-all font-medium"
           />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1 scrollbar-hide">
        {filteredParticipants.map((p) => {
          const baseState = participantStates[p.userId] || { isMicOn: true, isVideoOn: true }
          // Merge with local optimistic overrides so admin sees instant visual feedback
          const override = localPermOverrides[p.userId] || {}
          const state = { ...baseState, ...override }
          const isLocal = p.userId === localUserId
          const isHost = p.userId === hostId
          const isAdmin = localUserId === hostId

          // Derived: mic is restricted if micAllowed was explicitly set to false
          const micRestricted = state.micAllowed === false
          const videoRestricted = state.videoAllowed === false

          return (
            <div 
              key={p.userId} 
              className="flex items-center justify-between p-3 rounded-2xl hover:bg-muted/50 transition-colors group cursor-default"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all overflow-hidden ${
                    isHost ? 'bg-blue-600/20 border-blue-500/30' :
                    (micRestricted || videoRestricted) ? 'bg-red-500/10 border-red-500/20' :
                    'bg-muted border-border'
                  }`}>
                    {p.avatar ? (
                       <img src={p.avatar} alt={p.userName} className="w-full h-full object-cover" />
                    ) : isHost ? (
                       <Shield size={18} className="text-blue-600 dark:text-blue-400" />
                    ) : (
                       <UserIcon size={20} className={micRestricted || videoRestricted ? 'text-red-500' : 'text-muted-foreground'} />
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-card" />
                </div>
                <div className="truncate">
                  <p className="text-sm font-bold text-foreground truncate flex items-center gap-1.5 transition-colors">
                    {p.userName} 
                    {isLocal && <span className="text-[10px] text-blue-600 dark:text-blue-400 font-black uppercase">(You)</span>}
                  </p>
                  <p className={`text-[10px] font-bold uppercase tracking-widest leading-none transition-colors ${
                    isHost ? 'text-blue-600 dark:text-blue-400' :
                    (micRestricted || videoRestricted) ? 'text-red-500' :
                    'text-muted-foreground'
                  }`}>
                    {isHost ? 'Host / Admin' : (micRestricted || videoRestricted) ? 'Restricted' : 'Participant'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                 {/* Admin Controls — only for non-host participants */}
                  {isAdmin && !isLocal && !isHost && (
                    <div className="flex items-center gap-1 mr-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                       {/* Toggle Mic Permission */}
                       <button 
                         onClick={() => handlePermission(p.userId, 'micAllowed', state.micAllowed !== false)}
                         title={micRestricted ? 'Unmute Microphone' : 'Mute Microphone'}
                         className={`p-1.5 rounded-lg transition-all border ${
                           micRestricted
                             ? 'bg-red-500/20 text-red-600 border-red-500/30'
                             : 'bg-muted text-muted-foreground hover:text-orange-500 hover:bg-orange-500/10 hover:border-orange-500/30 border-transparent'
                         }`}
                       >
                          {micRestricted ? <MicOff size={14} /> : <Mic size={14} />}
                       </button>
                       {/* Toggle Camera Permission */}
                       <button 
                         onClick={() => handlePermission(p.userId, 'videoAllowed', state.videoAllowed !== false)}
                         title={videoRestricted ? 'Unblock Camera' : 'Disable Camera'}
                         className={`p-1.5 rounded-lg transition-all border ${
                           videoRestricted
                             ? 'bg-red-500/20 text-red-600 border-red-500/30'
                             : 'bg-muted text-muted-foreground hover:text-orange-500 hover:bg-orange-500/10 hover:border-orange-500/30 border-transparent'
                         }`}
                       >
                          {videoRestricted ? <VideoOff size={14} /> : <Video size={14} />}
                       </button>
                       {/* Remove Participant */}
                       <button 
                         onClick={() => onRemoveParticipant(p.userId)}
                         title="Remove Participant"
                         className="p-1.5 rounded-lg bg-muted hover:bg-red-600/20 text-muted-foreground hover:text-red-600 transition-all border border-transparent hover:border-red-500/30"
                       >
                          <Trash2 size={14} />
                       </button>
                    </div>
                  )}

                 {/* Live mic/video status indicators */}
                 <div className={`p-1.5 rounded-lg border transition-all ${
                   micRestricted
                     ? 'bg-red-500/15 border-red-500/30 text-red-600 dark:text-red-400'
                     : state.isMicOn
                       ? 'bg-muted border-border text-muted-foreground'
                       : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
                 }`}>
                    {(micRestricted || !state.isMicOn) ? <MicOff size={14} /> : <Mic size={14} />}
                 </div>
                 <div className={`p-1.5 rounded-lg border transition-all ${
                   videoRestricted
                     ? 'bg-red-500/15 border-red-500/30 text-red-600 dark:text-red-400'
                     : state.isVideoOn
                       ? 'bg-muted border-border text-muted-foreground'
                       : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
                 }`}>
                    {(videoRestricted || !state.isVideoOn) ? <VideoOff size={14} /> : <Video size={14} />}
                 </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer — Invite Link */}
      <div className="p-4 bg-muted/30 border-t border-border mt-auto">
         <button
           onClick={onInviteLink}
           className="w-full py-3 flex items-center justify-center gap-2 bg-blue-600/10 border border-blue-500/30 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-all active:scale-95 shadow-sm"
         >
           <Link size={14} />
           Invite Link
         </button>
      </div>
    </div>
  )
}
