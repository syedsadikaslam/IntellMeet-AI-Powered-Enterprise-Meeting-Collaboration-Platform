import { MessageSquare, Mic, MicOff, PhoneOff, Users, Video, VideoOff, MonitorUp, Square, Circle, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import Peer from 'simple-peer'
import ChatSidebar from '../components/ChatSidebar'
import ParticipantSidebar from '../components/ParticipantSidebar'
import { useAuthStore } from '../store/useAuthStore'
import { useMeetingStore } from '../store/useMeetingStore'
import { connectSocket, disconnectSocket, socket } from '../utils/socket'
import api from '../utils/api'

interface Participant {
  userId: string
  userName: string
  socketId: string
}

interface PeerConnection {
  peerId: string
  peer: Peer.Instance
  stream?: MediaStream
  userName: string
}

export default function MeetingRoom({ meetingCode }: { meetingCode: string }) {
  const { user } = useAuthStore()
  const { stream: localStream, isMicOn, isVideoOn, toggleMic: toggleMicStore, toggleVideo: toggleVideoStore } = useMeetingStore()
  
  const toggleMic = () => {
    toggleMicStore()
    socket.emit('toggle-audio', { meetingId: meetingCode, userId: user?.id, isMicOn: !isMicOn })
  }

  const toggleVideo = () => {
    toggleVideoStore()
    socket.emit('toggle-video', { meetingId: meetingCode, userId: user?.id, isVideoOn: !isVideoOn })
  }
  
  const [peers, setPeers] = useState<PeerConnection[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false)
  const [typingUsers, setTypingUsers] = useState<{ userId: string, userName: string }[]>([])
  const [participantStates, setParticipantStates] = useState<Record<string, { isMicOn: boolean, isVideoOn: boolean }>>({})
  const [meetingData, setMeetingData] = useState<any>(null)
  
  // Screen Sharing State
  const [isSharingScreen, setIsSharingScreen] = useState(false)
  const screenStreamRef = useRef<MediaStream | null>(null)

  // Recording State
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])

  const peersRef = useRef<Record<string, Peer.Instance>>({})

  useEffect(() => {
    if (!localStream) {
      window.location.hash = `#/meeting/${meetingCode}`
      return
    }

    const fetchMeeting = async () => {
      try {
        const response = await api.get(`/meetings/${meetingCode}`)
        setMeetingData(response.data)
      } catch (err) {
        console.error('Error fetching meeting data:', err)
      }
    }
    fetchMeeting()

    connectSocket()

    socket.emit('join-meeting', {
      meetingId: meetingCode,
      userId: user?.id,
      userName: user?.name
    })

    socket.on('all-participants', (users: Participant[]) => {
      setParticipants(users)
      // Create peers for all existing users (we are the initiator)
      const newPeers: PeerConnection[] = []
      users.forEach((p) => {
        if (p.socketId !== socket.id) {
          const peer = createPeer(p.socketId, socket.id!, localStream)
          peersRef.current[p.socketId] = peer
          newPeers.push({
            peerId: p.socketId,
            peer,
            userName: p.userName
          })
        }
      })
      setPeers(newPeers)
    })

    socket.on('user-joined', ({ userId, userName, socketId }) => {
      setParticipants(prev => [...prev, { userId, userName, socketId }])
      
      // Someone joined, they will initiate the peer and we will respond
      const peer = addPeer(socketId, localStream)
      peersRef.current[socketId] = peer
      setPeers(prev => [...prev, { peerId: socketId, peer, userName }])
    })

    socket.on('signal', ({ signal, from }) => {
      const peer = peersRef.current[from]
      if (peer) {
        peer.signal(signal)
      }
    })

    socket.on('user-left', ({ userId }) => {
      // Find the socketId for this userId to cleanup the peer
      const participant = participants.find(p => p.userId === userId)
      if (participant) {
         if (peersRef.current[participant.socketId]) {
           peersRef.current[participant.socketId].destroy()
           delete peersRef.current[participant.socketId]
         }
         setPeers(prev => prev.filter(p => p.peerId !== participant.socketId))
      }
      setParticipants(prev => prev.filter(p => p.userId !== userId))
      setTypingUsers(prev => prev.filter(u => u.userId !== userId))
    })

    socket.on('receive-message', (msg) => setMessages(prev => [...prev, msg]))
    
    socket.on('user-typing', ({ userId, userName }) => {
      setTypingUsers(prev => {
        if (prev.find(u => u.userId === userId)) return prev
        return [...prev, { userId, userName }]
      })
    })

    socket.on('user-stop-typing', ({ userId }) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== userId))
    })

    socket.on('user-toggle-audio', ({ userId, isMicOn }) => {
      setParticipantStates(prev => ({ ...prev, [userId]: { ...prev[userId], isMicOn } }))
    })

    socket.on('user-toggle-video', ({ userId, isVideoOn }) => {
      setParticipantStates(prev => ({ ...prev, [userId]: { ...prev[userId], isVideoOn } }))
    })

    socket.on('notification', (n) => {
      const id = Date.now()
      setNotifications(prev => [...prev, { ...n, id }])
      setTimeout(() => setNotifications(prev => prev.filter(x => x.id !== id)), 5000)
    })

    socket.on('force-mute', () => {
      if (isMicOn) {
        toggleMic()
      }
    })

    socket.on('force-remove', () => {
      window.location.hash = '#/dashboard'
    })

    socket.on('meeting-ended', () => {
      alert('The host has ended the meeting.')
      window.location.hash = '#/dashboard'
    })

    return () => {
      socket.emit('leave-meeting', { meetingId: meetingCode, userId: user?.id })
      Object.values(peersRef.current).forEach(peer => peer.destroy())
      socket.off('all-participants')
      socket.off('user-joined')
      socket.off('user-left')
      socket.off('signal')
      socket.off('receive-message')
      socket.off('user-typing')
      socket.off('user-stop-typing')
      socket.off('user-toggle-audio')
      socket.off('user-toggle-video')
      socket.off('notification')
      disconnectSocket()
    }
  }, [meetingCode, localStream])

  const createPeer = (to: string, from: string, stream: MediaStream) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    })

    peer.on('signal', (signal) => {
      socket.emit('signal', { to, from, signal })
    })

    peer.on('stream', (remoteStream) => {
       updatePeerStream(to, remoteStream)
    })

    return peer
  }

  const addPeer = (from: string, stream: MediaStream) => {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    })

    peer.on('signal', (signal) => {
      socket.emit('signal', { to: from, from: socket.id!, signal })
    })

    peer.on('stream', (remoteStream) => {
      updatePeerStream(from, remoteStream)
    })

    return peer
  }

  const updatePeerStream = (peerId: string, stream: MediaStream) => {
    setPeers(prev => prev.map(p => p.peerId === peerId ? { ...p, stream } : p))
  }

  const handleSendMessage = (message: string) => {
    socket.emit('send-message', {
      meetingId: meetingCode,
      message,
      senderId: user?.id,
      senderName: user?.name
    })
  }

  const handleTyping = () => {
    socket.emit('typing', {
      meetingId: meetingCode,
      userId: user?.id,
      userName: user?.name
    })
  }

  const handleStopTyping = () => {
    socket.emit('stop-typing', {
      meetingId: meetingCode,
      userId: user?.id
    })
  }

  const handleMuteParticipant = (targetUserId: string) => {
    socket.emit('mute-participant', { meetingId: meetingCode, targetUserId })
  }

  const handleRemoveParticipant = (targetUserId: string) => {
    socket.emit('remove-participant', { meetingId: meetingCode, targetUserId })
  }

  const handleDeleteMeeting = async () => {
    if (!meetingData) return
    if (!window.confirm('Are you sure you want to end and delete this meeting for everyone?')) return

    try {
      await api.delete(`/meetings/${meetingData._id || meetingData.id}`)
      socket.emit('end-meeting', { meetingId: meetingCode })
    } catch (err) {
      console.error('Error deleting meeting:', err)
      alert('Failed to delete meeting. Only the host can do this.')
    }
  }

  const toggleScreenShare = async () => {
    try {
      if (!isSharingScreen) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true })
        screenStreamRef.current = screenStream
        const screenTrack = screenStream.getVideoTracks()[0]

        // Replace track in all peers
        Object.values(peersRef.current).forEach(peer => {
          const videoTrack = localStream?.getVideoTracks()[0]
          if (videoTrack) {
            peer.replaceTrack(videoTrack, screenTrack, localStream!)
          }
        })

        screenTrack.onended = () => {
          stopScreenShare()
        }

        setIsSharingScreen(true)
      } else {
        stopScreenShare()
      }
    } catch (err) {
      console.error('Error sharing screen:', err)
    }
  }

  const stopScreenShare = () => {
    if (screenStreamRef.current) {
      const screenTrack = screenStreamRef.current.getVideoTracks()[0]
      const videoTrack = localStream?.getVideoTracks()[0]

      Object.values(peersRef.current).forEach(peer => {
        if (videoTrack && screenTrack) {
          peer.replaceTrack(screenTrack, videoTrack, localStream!)
        }
      })

      screenStreamRef.current.getTracks().forEach(track => track.stop())
      screenStreamRef.current = null
    }
    setIsSharingScreen(false)
  }

  const handleToggleRecording = () => {
    if (!isRecording) {
      startRecording()
    } else {
      stopRecording()
    }
  }

  const startRecording = () => {
    if (!localStream) return

    recordedChunksRef.current = []
    const recorder = new MediaRecorder(localStream, { mimeType: 'video/webm' })

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data)
      }
    }

    recorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `intellmeet-recording-${Date.now()}.webm`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    }

    mediaRecorderRef.current = recorder
    recorder.start()
    setIsRecording(true)
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  return (
    <div className="flex h-screen bg-[#030507] text-white overflow-hidden font-sans">
      {/* Notifications Layer */}
      <div className="fixed top-20 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {notifications.map(n => (
          <div key={n.id} className="bg-blue-600/90 backdrop-blur-md px-4 py-3 rounded-xl shadow-2xl border border-white/20 animate-slide-in-right pointer-events-auto">
            <p className="text-sm font-medium">{n.message}</p>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative min-w-0">
        {/* Top Header */}
        <div className="h-16 flex items-center justify-between px-6 bg-white/2 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Users size={18} />
            </div>
            <div>
              <h1 className="text-sm font-bold truncate max-w-[200px]">Live Session • {meetingCode}</h1>
              <p className="text-[10px] text-white/50">{participants.length} participants connected</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/10 text-red-100 text-[10px] font-black uppercase tracking-widest rounded-full border border-red-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              Live
            </span>
          </div>
        </div>

        {/* Video Grid */}
        <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr overflow-y-auto scrollbar-hide">
          {/* Local Feed */}
          <VideoCard stream={localStream!} label={`${user?.name} (You)`} isMuted isOff={!isVideoOn} />

          {/* Remote Feeds */}
          {peers.map(p => (
            <VideoCard key={p.peerId} stream={p.stream} label={p.userName} isOff={!p.stream} />
          ))}

          {participants.length < 2 && (
             <div className="relative rounded-3xl bg-dashed border-2 border-white/5 flex flex-col items-center justify-center border-dashed gap-4">
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center animate-pulse">
                   <Users size={20} className="text-white/20" />
                </div>
                <p className="text-white/10 text-[10px] font-black uppercase tracking-[0.3em]">Waiting for others</p>
             </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="h-24 bg-white/2 backdrop-blur-xl border-t border-white/5 flex items-center justify-center px-6">
           <div className="flex items-center gap-4">
              <ControlBtn active={isMicOn} onClick={toggleMic} onIcon={<Mic size={22} />} offIcon={<MicOff size={22} />} />
              <ControlBtn active={isVideoOn} onClick={toggleVideo} onIcon={<Video size={22} />} offIcon={<VideoOff size={22} />} />
              
              <button 
                onClick={() => window.location.hash = '#/dashboard'}
                className="p-5 bg-red-600 hover:bg-red-500 rounded-3xl text-white transition-all shadow-2xl shadow-red-600/20 transform hover:scale-105 active:scale-95"
                title="Leave Meeting"
              >
                <PhoneOff size={24} />
              </button>

              {user?.id === (meetingData?.host?._id || meetingData?.host) && (
                <button 
                  onClick={handleDeleteMeeting}
                  className="p-5 bg-red-900 hover:bg-red-800 rounded-3xl text-white transition-all shadow-2xl shadow-red-900/20 transform hover:scale-105 active:scale-95"
                  title="End & Delete Meeting"
                >
                  <Trash2 size={24} />
                </button>
              )}

              <div className="w-px h-8 bg-white/10 mx-2" />

            <button 
              onClick={() => {
                setIsChatOpen(!isChatOpen)
                setIsParticipantsOpen(false)
              }}
              className={`p-5 rounded-3xl transition-all relative ${isChatOpen ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'bg-white/5 hover:bg-white/10 text-white'}`}
            >
              <MessageSquare size={22} />
              {messages.length > 0 && !isChatOpen && (
                <span className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full text-[10px] flex items-center justify-center border-2 border-[#030507] font-black">
                  {messages.length}
                </span>
              )}
            </button>

            <button 
              onClick={() => {
                setIsParticipantsOpen(!isParticipantsOpen)
                setIsChatOpen(false)
              }}
              className={`p-5 rounded-3xl transition-all relative ${isParticipantsOpen ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'bg-white/5 hover:bg-white/10 text-white'}`}
            >
              <Users size={22} />
            </button>

            <div className="w-px h-8 bg-white/10 mx-2" />

            {/* Screen Share & Record */}
            <button 
              onClick={toggleScreenShare}
              title="Share Screen"
              className={`p-5 rounded-3xl transition-all ${isSharingScreen ? 'bg-green-600 text-white shadow-xl shadow-green-600/20' : 'bg-white/5 hover:bg-white/10 text-white'}`}
            >
              <MonitorUp size={22} />
            </button>

            <button 
              onClick={handleToggleRecording}
              title={isRecording ? 'Stop Recording' : 'Start Recording'}
              className={`p-5 rounded-3xl transition-all relative ${isRecording ? 'bg-red-600 text-white shadow-xl shadow-red-600/20' : 'bg-white/5 hover:bg-white/10 text-white'}`}
            >
              {isRecording ? <Square size={22} /> : <Circle size={22} />}
              {isRecording && (
                 <span className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full animate-ping" />
              )}
            </button>
           </div>
        </div>
      </div>

      {isChatOpen && (
        <aside className="animate-slide-in-right">
          <ChatSidebar 
            messages={messages} 
            onSendMessage={handleSendMessage} 
            onClose={() => setIsChatOpen(false)} 
            onTyping={handleTyping}
            onStopTyping={handleStopTyping}
            typingUsers={typingUsers}
          />
        </aside>
      )}

      {isParticipantsOpen && (
         <aside className="animate-slide-in-right">
            <ParticipantSidebar 
              participants={participants}
              participantStates={participantStates}
              localUserId={user?.id || ''}
              hostId={meetingData?.host?._id || meetingData?.host}
              onMuteParticipant={handleMuteParticipant}
              onRemoveParticipant={handleRemoveParticipant}
              onClose={() => setIsParticipantsOpen(false)}
            />
         </aside>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />
    </div>
  )
}

function VideoCard({ stream, label, isMuted = false, isOff = false }: { stream?: MediaStream, label: string, isMuted?: boolean, isOff?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  return (
    <div className="relative group rounded-[32px] bg-white/5 border border-white/5 overflow-hidden shadow-2xl transition-all hover:border-blue-500/30">
      {(!stream || isOff) ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0f1d] z-10">
           <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <p className="text-2xl font-black text-white/20">{label.charAt(0)}</p>
           </div>
        </div>
      ) : (
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted={isMuted}
          className="w-full h-full object-cover scale-x-[-1]"
        />
      )}
      <div className="absolute bottom-4 left-4 z-20">
        <span className="px-4 py-2 bg-black/40 backdrop-blur-md rounded-2xl text-[11px] font-black uppercase tracking-widest border border-white/10">
          {label}
        </span>
      </div>
    </div>
  )
}

function ControlBtn({ active, onClick, onIcon, offIcon }: { active: boolean, onClick: () => void, onIcon: any, offIcon: any }) {
  return (
    <button 
      onClick={onClick}
      className={`p-5 rounded-3xl transition-all shadow-xl ${active ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-red-500/20 text-red-500 border border-red-500/20'}`}
    >
      {active ? onIcon : offIcon}
    </button>
  )
}
