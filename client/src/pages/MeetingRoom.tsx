import { Mic, MicOff, Video, VideoOff, PhoneOff, Users, MessageSquare, Info, Layout, Plus, Hand, Circle, Square, MonitorUp, Bot, Sparkles, Trash2, Maximize, Minimize } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import Peer from 'simple-peer'
import ChatSidebar from '../components/ChatSidebar'
import ParticipantSidebar from '../components/ParticipantSidebar'
import AIChat from '../components/AIChat'
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
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false)
  const [typingUsers, setTypingUsers] = useState<{ userId: string, userName: string }[]>([])
  const [participantStates, setParticipantStates] = useState<Record<string, { isMicOn: boolean, isVideoOn: boolean, micAllowed?: boolean, videoAllowed?: boolean, chatAllowed?: boolean }>>({})
  const [meetingData, setMeetingData] = useState<any>(null)
  const [permissions, setPermissions] = useState({ micAllowed: true, videoAllowed: true, chatAllowed: true })
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Screen Sharing State
  const [isSharingScreen, setIsSharingScreen] = useState(false)
  const screenStreamRef = useRef<MediaStream | null>(null)

  // Raise Hand State
  const [showDetails, setShowDetails] = useState(false)
  const [raisedHands, setRaisedHands] = useState<Record<string, boolean>>({})

  // Recording State
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])

  // Transcription State
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcripts, setTranscripts] = useState<any[]>([])
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false)
  const transcribeRecorderRef = useRef<MediaRecorder | null>(null)

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

    const joinMeeting = () => {
      if (!socket.id) return
      
      console.log('Emitting join-meeting with socket ID:', socket.id)
      socket.emit('join-meeting', {
        meetingId: meetingCode,
        userId: user?.id,
        userName: user?.name
      })
    }

    if (socket.connected) {
      joinMeeting()
    } else {
      connectSocket()
      socket.once('connect', joinMeeting)
    }

    socket.on('all-participants', (users: Participant[]) => {
      console.log('Received all-participants:', users)
      setParticipants(users)
      
      const newPeers: PeerConnection[] = []
      users.forEach((p) => {
        // Only initiate if NOT ourselves AND we don't have a peer for them yet
        if (p.socketId !== socket.id && !peersRef.current[p.socketId]) {
          console.log('Creating initiator peer for:', p.userName)
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
      console.log('User joined event received:', { userName, socketId })
      setParticipants(prev => {
        if (prev.find(p => p.socketId === socketId)) return prev
        return [...prev, { userId, userName, socketId }]
      })
      
      // Someone joined, they will initiate (if they are newcomer) or we will (if we are)
      // Actually, in our logic, the newcomer initiates to everyone in 'all-participants'
      // And existing members wait for the 'user-joined' to prepare for the incoming signal.
      if (!peersRef.current[socketId]) {
        console.log('Adding non-initiator peer for incoming join:', userName)
        const peer = addPeer(socketId, localStream)
        peersRef.current[socketId] = peer
        setPeers(prev => [...prev, { peerId: socketId, peer, userName }])
      }
    })

    socket.on('signal', ({ signal, from }) => {
      console.log('Received signal from:', from)
      const peer = peersRef.current[from]
      if (peer) {
        peer.signal(signal)
      } else {
        console.warn('Received signal from unknown peer:', from)
      }
    })

    socket.on('user-left', ({ userId, socketId }) => {
      console.log('User left event received:', { userId, socketId })
      
      // Cleanup peer
      const sId = socketId || participants.find(p => p.userId === userId)?.socketId
      if (sId && peersRef.current[sId]) {
        peersRef.current[sId].destroy()
        delete peersRef.current[sId]
      }

      setPeers(prev => prev.filter(p => p.peerId !== sId))
      setParticipants(prev => prev.filter(p => p.userId !== userId))
      setTypingUsers(prev => prev.filter(u => u.userId !== userId))
    })

    socket.on('permission-update', (newPermissions) => {
      setPermissions(newPermissions)
      
      // Enforce immediately
      if (!newPermissions.micAllowed && isMicOn) toggleMicStore()
      if (!newPermissions.videoAllowed && isVideoOn) toggleVideoStore()
      
      const nId = Date.now()
      setNotifications(prev => [...prev, { message: 'Permissions updated by host', id: nId }])
      setTimeout(() => setNotifications(prev => prev.filter(x => x.id !== nId)), 3000)
    })

    socket.on('user-permission-changed', ({ userId, permissions: pms }) => {
      setParticipantStates(prev => ({
        ...prev,
        [userId]: { ...prev[userId], ...pms }
      }))
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

    socket.on('user-raised-hand', ({ userId }) => {
      setRaisedHands(prev => ({ ...prev, [userId]: true }))
      setTimeout(() => {
        setRaisedHands(prev => ({ ...prev, [userId]: false }))
      }, 5000) // Lower hand after 5s
    })

    socket.on('transcript-update', (chunk) => {
      setTranscripts(prev => [...prev, chunk])
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
      socket.off('transcript-update')
      if (transcribeRecorderRef.current) transcribeRecorderRef.current.stop()
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

  const handleRaiseHand = () => {
    socket.emit('raise-hand', { meetingId: meetingCode, userId: user?.id })
    const nId = Date.now()
    setNotifications(prev => [...prev, { message: 'You raised your hand', id: nId }])
    setTimeout(() => setNotifications(prev => prev.filter(x => x.id !== nId)), 3000)
  }

  const copyJoiningInfo = () => {
    const url = window.location.href.split('/room')[0]
    navigator.clipboard.writeText(`Meeting Title: ${meetingData?.title}\nJoin Link: ${url}\nMeeting Code: ${meetingCode}`)
    alert('Joining info copied to clipboard!')
  }

  const handleMuteParticipant = (targetUserId: string) => {
    socket.emit('mute-participant', { meetingId: meetingCode, targetUserId })
  }

  const handleRemoveParticipant = (targetUserId: string) => {
    socket.emit('remove-participant', { meetingId: meetingCode, targetUserId })
  }

  const handleUpdateParticipantPermission = (targetUserId: string, pms: any) => {
    socket.emit('update-permissions', { 
      meetingId: meetingCode, 
      targetUserId, 
      permissions: pms 
    })
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`)
      })
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
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

  // AI Transcription Logic
  const toggleTranscription = () => {
    if (!isTranscribing) {
      startTranscription()
    } else {
      stopTranscription()
    }
  }

  const startTranscription = () => {
    if (!localStream) return
    
    // Use the local audio stream to record chunks every 5s
    const recorder = new MediaRecorder(localStream, { mimeType: 'audio/webm' })
    
    recorder.ondataavailable = async (event) => {
      if (event.data.size > 0) {
        const audioBlob = event.data
        // Send to server via socket
        socket.emit('audio-stream', { meetingId: meetingCode, audioBlob })
      }
    }

    recorder.start(5000) // Send a chunk every 5 seconds
    transcribeRecorderRef.current = recorder
    setIsTranscribing(true)
    setIsTranscriptOpen(true)
  }

  const stopTranscription = () => {
    if (transcribeRecorderRef.current) {
      transcribeRecorderRef.current.stop()
      transcribeRecorderRef.current = null
      setIsTranscribing(false)
    }
  }

  return (
    <div ref={containerRef} className="flex h-screen bg-[#030507] text-white overflow-hidden font-sans">
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
        <div className="flex-1 p-3 md:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 auto-rows-fr overflow-y-auto scrollbar-hide">
          {/* Local Feed */}
          <VideoCard 
            stream={localStream!} 
            label={`${user?.name} (You)`} 
            isMuted 
            isOff={!isVideoOn} 
            isHandRaised={raisedHands[user?.id || '']} 
          />

          {/* Remote Feeds */}
          {peers.map(p => {
             const participant = participants.find(part => part.socketId === p.peerId);
             const uId = participant?.userId || '';
             return (
               <VideoCard 
                 key={p.peerId} 
                 stream={p.stream} 
                 label={p.userName} 
                 isOff={!p.stream} 
                 isHandRaised={raisedHands[uId]} 
               />
             )
          })}

          {participants.length < 2 && (
             <div className="relative rounded-3xl bg-white/2 border-2 border-dashed border-white/5 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center animate-pulse">
                   <Users size={20} className="text-white/20" />
                </div>
                <p className="text-white/10 text-[10px] font-black uppercase tracking-[0.3em]">Waiting for others</p>
             </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="h-20 md:h-24 bg-[rgba(3,5,7,0.92)] backdrop-blur-xl border-t border-white/5 flex items-center px-1 md:px-8 relative justify-between overflow-hidden">
            <div className="flex items-center gap-2 md:gap-4 flex-none">
               <button 
                 onClick={() => setShowDetails(!showDetails)}
                 className={`flex items-center gap-2 md:gap-3 px-3 md:px-5 py-2 md:py-3 rounded-xl md:rounded-2xl transition-all ${showDetails ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'bg-white/5 text-white/50 hover:text-white'} hidden sm:flex`}
               >
                 <Info size={18} className={`md:w-5 md:h-5 ${showDetails ? 'animate-pulse' : ''}`} />
                 <span className="text-[10px] md:text-[11px] font-black uppercase tracking-wider hidden lg:block">Details</span>
               </button>
            </div>

           {/* Tools & Controls Container */}
           <div className="flex-1 flex items-center justify-start md:justify-center gap-1 md:gap-4 overflow-x-auto no-scrollbar whitespace-nowrap py-1 px-1">
              {/* Main Meeting Controls */}
              <div className="flex flex-none items-center gap-1 md:gap-4">
                <ControlBtn active={isMicOn} onClick={toggleMic} onIcon={<Mic className="w-5 h-5 md:w-[22px] md:h-[22px]" />} offIcon={<MicOff className="w-5 h-5 md:w-[22px] md:h-[22px]" />} />
                <ControlBtn active={isVideoOn} onClick={toggleVideo} onIcon={<Video className="w-5 h-5 md:w-[22px] md:h-[22px]" />} offIcon={<VideoOff className="w-5 h-5 md:w-[22px] md:h-[22px]" />} />
                
                <button 
                  onClick={handleRaiseHand}
                  className={`p-2.5 md:p-5 rounded-2xl md:rounded-3xl transition-all ${raisedHands[user?.id || ''] ? 'bg-yellow-400 text-black shadow-xl shadow-yellow-400/20 animate-bounce' : 'bg-white/5 hover:bg-white/10 text-white'}`}
                  title="Raise Hand"
                >
                  <Hand className="w-5 h-5 md:w-[22px] md:h-[22px]" />
                </button>

                <button 
                  onClick={() => window.location.hash = '#/dashboard'}
                  className="p-2.5 md:p-5 bg-red-600 hover:bg-red-500 rounded-2xl md:rounded-3xl text-white transition-all shadow-2xl shadow-red-600/20 transform hover:scale-105 active:scale-95"
                  title="Leave Meeting"
                >
                  <PhoneOff className="w-5 h-5 md:w-6 md:h-6" />
                </button>

                {user?.id === (meetingData?.host?._id || meetingData?.host) && (
                  <button 
                    onClick={handleDeleteMeeting}
                    className="p-3 md:p-5 bg-red-900 hover:bg-red-800 rounded-2xl md:rounded-3xl text-white transition-all shadow-2xl shadow-red-900/20 transform hover:scale-105 active:scale-95 hidden sm:flex"
                    title="End & Delete Meeting"
                  >
                    <Trash2 className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                )}
              </div>

              {/* Side Tools (Integrated for mobile) */}
              <div className="flex flex-none items-center gap-1 md:gap-3 md:absolute md:right-8">
                <button 
                  onClick={() => { setIsChatOpen(!isChatOpen); setIsParticipantsOpen(false); setIsTranscriptOpen(false); setIsAIAssistantOpen(false); }}
                  className={`p-2.5 md:p-5 rounded-2xl md:rounded-3xl transition-all relative ${isChatOpen ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'bg-white/5 text-white/50 hover:text-white'}`}
                >
                  <MessageSquare className="w-5 h-5 md:w-[22px] md:h-[22px]" />
                  {messages.length > 0 && !isChatOpen && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-blue-500 rounded-full text-[9px] md:text-[10px] flex items-center justify-center border-2 border-[#030507] font-black">{messages.length}</span>
                  )}
                </button>

                <button 
                  onClick={() => { setIsTranscriptOpen(!isTranscriptOpen); setIsChatOpen(false); setIsParticipantsOpen(false); setIsAIAssistantOpen(false); }}
                  className={`p-2.5 md:p-5 rounded-2xl md:rounded-3xl transition-all relative ${isTranscriptOpen ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'bg-white/5 text-white/50 hover:text-white'}`}
                  title="Live Transcription"
                >
                  <Layout className="w-5 h-5 md:w-[22px] md:h-[22px]" />
                  {isTranscribing && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                </button>

                <button 
                  onClick={() => { setIsParticipantsOpen(!isParticipantsOpen); setIsChatOpen(false); setIsTranscriptOpen(false); setIsAIAssistantOpen(false); }}
                  className={`p-2.5 md:p-5 rounded-2xl md:rounded-3xl transition-all relative ${isParticipantsOpen ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'bg-white/5 text-white/50 hover:text-white'}`}
                >
                  <Users className="w-5 h-5 md:w-[22px] md:h-[22px]" />
                </button>

                <button 
                  onClick={toggleFullscreen}
                  className={`p-2.5 md:p-5 rounded-2xl md:rounded-3xl transition-all relative ${isFullscreen ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/50 hover:text-white'}`}
                  title="Toggle Fullscreen"
                >
                  {isFullscreen ? <Minimize className="w-5 h-5 md:w-[22px] md:h-[22px]" /> : <Maximize className="w-5 h-5 md:w-[22px] md:h-[22px]" />}
                </button>

                <button 
                  onClick={() => { setIsAIAssistantOpen(!isAIAssistantOpen); setIsChatOpen(false); setIsTranscriptOpen(false); setIsParticipantsOpen(false); }}
                  className={`p-2.5 md:p-5 rounded-2xl md:rounded-3xl transition-all relative ${isAIAssistantOpen ? 'bg-purple-600 text-white shadow-xl shadow-purple-600/20' : 'bg-white/5 text-white/50 hover:text-white'}`}
                  title="AI Assistant"
                >
                  <Bot className="w-5 h-5 md:w-[22px] md:h-[22px]" />
                </button>
              </div>
           </div>


        </div>

        {/* Meeting Details Modal: GMeet style */}
        {showDetails && (
          <div className="absolute bottom-28 left-8 w-80 bg-[#0d1425] border border-white/10 rounded-[32px] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.6)] animate-slide-in-up z-50 overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2" />
             
             <div className="relative z-10 space-y-5">
                <div>
                   <h3 className="text-sm font-black uppercase tracking-widest text-white/30 mb-1">Joining Info</h3>
                   <p className="text-lg font-black text-white truncate">{meetingData?.title}</p>
                </div>

                <div className="space-y-3">
                   <div className="bg-black/40 border border-white/5 p-4 rounded-2xl">
                      <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2">Meeting Link</p>
                      <p className="text-xs text-white/60 truncate mb-4">{window.location.href.split('/room')[0]}</p>
                      <button 
                        onClick={copyJoiningInfo}
                        className="w-full py-3 bg-white/5 hover:bg-white text-white/50 hover:text-black rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-white/10 hover:border-white"
                      >
                         Copy Joining Info
                      </button>
                   </div>
                   <div className="flex items-center justify-between px-4">
                      <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Dial-in Node</span>
                      <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{meetingCode}</span>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>

      {isTranscriptOpen && (
        <aside className="fixed md:relative top-0 right-0 z-[60] w-full sm:w-80 h-full bg-[#0a0f1d] border-l border-white/10 p-6 flex flex-col gap-6 animate-slide-in-right overflow-hidden">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-widest text-white/50 flex items-center gap-2">
              <Layout size={16} /> Live Transcript
            </h3>
            <button onClick={() => setIsTranscriptOpen(false)} className="p-2 hover:bg-white/5 rounded-lg text-white/20 hover:text-white transition-all">
              <Plus size={18} className="rotate-45" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 scrollbar-hide pr-2">
            {transcripts.map((t, i) => (
              <div key={i} className="animate-fade-in">
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">{t.userName}</p>
                <p className="text-xs text-white/70 leading-relaxed bg-white/5 p-3 rounded-2xl border border-white/5">{t.text}</p>
              </div>
            ))}
            {transcripts.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                <Layout size={40} className="mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest">No Transcripts yet</p>
              </div>
            )}
          </div>

          <button 
            onClick={toggleTranscription}
            className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${isTranscribing ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-blue-600 text-white border border-blue-500/20 shadow-lg shadow-blue-600/20'}`}
          >
            {isTranscribing ? 'Stop Intelligence' : 'Start Live Analysis'}
          </button>
        </aside>
      )}

      {isChatOpen && (
        <aside className="fixed md:relative top-0 right-0 z-[60] w-full sm:w-80 animate-slide-in-right">
          <ChatSidebar 
            messages={messages} 
            onSendMessage={handleSendMessage} 
            onClose={() => setIsChatOpen(false)} 
            onTyping={handleTyping}
            onStopTyping={handleStopTyping}
            typingUsers={typingUsers}
            isDisabled={!permissions.chatAllowed}
          />
        </aside>
      )}

      {isParticipantsOpen && (
         <aside className="fixed md:relative top-0 right-0 z-[60] w-full sm:w-80 animate-slide-in-right">
            <ParticipantSidebar 
              participants={participants}
              participantStates={participantStates}
              localUserId={user?.id || ''}
              hostId={meetingData?.host?._id || meetingData?.host}
              onMuteParticipant={handleMuteParticipant}
              onRemoveParticipant={handleRemoveParticipant}
              onUpdatePermission={handleUpdateParticipantPermission}
              onClose={() => setIsParticipantsOpen(false)}
            />
         </aside>
      )}

      <AIChat 
        socket={socket}
        meetingCode={meetingCode}
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)} 
      />

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

function VideoCard({ stream, label, isMuted = false, isOff = false, isHandRaised = false }: { stream?: MediaStream, label: string, isMuted?: boolean, isOff?: boolean, isHandRaised?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  return (
    <div className={`relative group rounded-2xl md:rounded-[32px] bg-white/5 border transition-all duration-500 overflow-hidden shadow-2xl ${isHandRaised ? 'border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.2)] scale-[1.02]' : 'border-white/5 hover:border-blue-500/30'}`}>
      {(!stream || isOff) ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0f1d] z-10">
           <div className={`w-20 h-20 rounded-full flex items-center justify-center border transition-all ${isHandRaised ? 'border-yellow-400/30 bg-yellow-400/5' : 'bg-white/5 border-white/10'}`}>
              <p className={`text-2xl font-black transition-colors ${isHandRaised ? 'text-yellow-400' : 'text-white/20'}`}>{label.charAt(0)}</p>
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
      
      {isHandRaised && (
         <div className="absolute top-4 left-4 z-30 bg-yellow-400 text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 animate-bounce">
            <Hand size={12} fill="currentColor" />
            Hand Raised
         </div>
      )}

      <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 z-20">
        <span className={`px-3 md:px-4 py-1.5 md:py-2 backdrop-blur-md rounded-xl md:rounded-2xl text-[10px] md:text-[11px] font-black uppercase tracking-widest border transition-all ${isHandRaised ? 'bg-yellow-400/20 border-yellow-400/50 text-yellow-400' : 'bg-black/40 border-white/10 text-white'}`}>
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
      className={`p-3.5 md:p-5 rounded-2xl md:rounded-3xl transition-all shadow-xl ${active ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-red-500/20 text-red-500 border border-red-500/20'}`}
    >
      {active ? onIcon : offIcon}
    </button>
  )
}
