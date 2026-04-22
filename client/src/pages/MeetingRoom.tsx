import { Mic, MicOff, Video, VideoOff, PhoneOff, Users, MessageSquare, Info, Layout, Plus, Hand, Circle, Square, MonitorUp, Bot, Sparkles, Trash2, Maximize, Minimize, Target, Zap, ShieldCheck } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import Peer from 'simple-peer'
import ChatSidebar from '../components/ChatSidebar'
import ParticipantSidebar from '../components/ParticipantSidebar'
import AIChat from '../components/AIChat'
import MeetingCollaboration from '../components/MeetingCollaboration'
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
  const { 
    stream: localStream, 
    isMicOn, 
    isVideoOn, 
    toggleMic: toggleMicStore, 
    toggleVideo: toggleVideoStore,
    setAudioEnabled,
    setVideoEnabled
  } = useMeetingStore()
  
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
  const [isCollaborationOpen, setIsCollaborationOpen] = useState(false)
  const [typingUsers, setTypingUsers] = useState<{ userId: string, userName: string }[]>([])
  const [participantStates, setParticipantStates] = useState<Record<string, { isMicOn: boolean, isVideoOn: boolean, micAllowed?: boolean, videoAllowed?: boolean, chatAllowed?: boolean }>>({})
  const [meetingData, setMeetingData] = useState<any>(null)
  const [permissions, setPermissions] = useState({ micAllowed: true, videoAllowed: true, chatAllowed: true })
  const [pinnedId, setPinnedId] = useState<string | null>(null)
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
  const participantsRef = useRef<Participant[]>([])

  // Sync ref with state for socket listeners
  useEffect(() => {
    participantsRef.current = participants
  }, [participants])

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
      
      // Cleanup peer using latest data from Ref
      const sId = socketId || participantsRef.current.find(p => p.userId === userId)?.socketId
      if (sId && peersRef.current[sId]) {
        console.log('Destroying peer for socketId:', sId)
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
      }, 5000)
    })

    socket.on('force-video-off', () => setVideoEnabled(false))
    socket.on('force-mute', () => setAudioEnabled(false))

    socket.on('transcript-update', (chunk) => {
      setTranscripts(prev => [...prev, chunk])
    })

    socket.on('transcript-history', (history) => {
      setTranscripts(history)
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
    // Optimistic local update for admin UI — keeps video grid indicators in sync
    setParticipantStates(prev => ({
      ...prev,
      [targetUserId]: { ...prev[targetUserId], ...pms }
    }))
    socket.emit('update-permissions', { 
      meetingId: meetingCode, 
      targetUserId, 
      permissions: pms 
    })
  }

  const handleCopyInviteLink = () => {
    const inviteText = `Join my IntellMeet session!\nMeeting Code: ${meetingCode}\nLink: ${window.location.href.split('#')[0]}#/meeting/${meetingCode}`
    navigator.clipboard.writeText(inviteText).then(() => {
      const nId = Date.now()
      setNotifications(prev => [...prev, { message: '✓ Invite link copied to clipboard!', id: nId }])
      setTimeout(() => setNotifications(prev => prev.filter(x => x.id !== nId)), 3000)
    }).catch(() => {
      alert(`Meeting Code: ${meetingCode}`)
    })
  }

  const toggleFullscreen = () => {
    const elem = containerRef.current as any
    if (!elem) return

    if (!document.fullscreenElement && !(document as any).webkitFullscreenElement && !(document as any).mozFullScreenElement && !(document as any).msFullscreenElement) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen()
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen()
      } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen()
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen()
      }
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen()
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen()
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen()
      }
      setIsFullscreen(false)
    }
  }

  // Handle hardware enforcement when permissions change
  useEffect(() => {
    if (!permissions.micAllowed && isMicOn) {
      setAudioEnabled(false)
    }
    if (!permissions.videoAllowed && isVideoOn) {
      setVideoEnabled(false)
    }
  }, [permissions, isMicOn, isVideoOn, setAudioEnabled, setVideoEnabled])

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

  // AI Transcription Logic (Web Speech API - Free & Real-time)
  const recognitionRef = useRef<any>(null)

  const toggleTranscription = () => {
    if (!isTranscribing) {
      startTranscription()
    } else {
      stopTranscription()
    }
  }

  const startTranscription = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Web Speech API is not supported in this browser. Please use Chrome.")
      return
    }

    try {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      
      recognition.continuous = true
      recognition.interimResults = false
      recognition.lang = 'en-IN' // Better for Indian accents and Hinglish

      recognition.onresult = (event: any) => {
        const last = event.results.length - 1
        const text = event.results[last][0].transcript

        if (text && text.trim()) {
          // Send transcribed text to server instantly
          socket.emit('text-stream', { meetingId: meetingCode, text: text.trim() })
        }
      }

      recognition.onerror = (event: any) => {
        console.error('[SPEECH_RECOGNITION] Error:', event.error)
        if (event.error === 'network') {
          alert('Network error in Speech Recognition. Please check your connection.')
        }
      }

      recognition.onend = () => {
        // Auto-restart if still marked as transcribing
        if (isTranscribing && recognitionRef.current) {
          try {
            recognitionRef.current.start()
          } catch (e) {
            console.error('[SPEECH_RECOGNITION] Restart failed:', e)
            // If it fails to restart (common on mobile if not triggered by gesture)
            // we'll try again after a short delay
            setTimeout(() => {
               if (isTranscribing && recognitionRef.current) {
                  try { recognitionRef.current.start() } catch(err) { console.error('Delayed restart failed', err) }
               }
            }, 1000)
          }
        }
      }

      recognition.start()
      recognitionRef.current = recognition
      setIsTranscribing(true)
      setIsTranscriptOpen(true)
    } catch (error) {
      console.error('[TRANSCRIPTION] Failed to start:', error)
    }
  }

  const stopTranscription = () => {
    setIsTranscribing(false) // Set this first to prevent auto-restart in onend
    if (recognitionRef.current) {
      recognitionRef.current.onend = null
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
  }

  return (
    <div ref={containerRef} className="dark flex h-screen bg-background text-foreground overflow-hidden font-sans transition-colors duration-300">
      {/* Notifications Layer */}
      <div className="fixed top-20 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {notifications.map(n => (
          <div key={n.id} className="bg-blue-600/90 backdrop-blur-md px-4 py-3 rounded-xl shadow-2xl border border-white/20 animate-slide-in-right pointer-events-auto">
            <p className="text-sm font-medium text-white">{n.message}</p>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative min-w-0">
        {/* Top Header */}
        <div className="h-16 flex items-center justify-between px-6 bg-muted/30 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 text-white rounded-lg shadow-md">
              <Users size={18} />
            </div>
            <div>
              <h1 className="text-sm font-bold truncate max-w-[200px] text-foreground transition-colors">Live Session • {meetingCode}</h1>
              <p className="text-[10px] text-muted-foreground transition-colors">{participants.length} participants connected</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-red-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              Live
            </span>
          </div>
        </div>

        {/* Video Grid / Spotlight Layout */}
        <div className="flex-1 min-h-0 relative bg-background/20">
          {(() => {
            const allFeeds = [
              {
                id: user?.id || 'local',
                socketId: socket.id || 'local-socket',
                userName: user?.name ? `${user.name} (You)` : 'You',
                stream: localStream,
                isLocal: true,
                isVideoOn: isVideoOn,
                isHandRaised: !!raisedHands[user?.id || '']
              },
              ...peers.map(p => {
                const part = participants.find(part => part.socketId === p.peerId);
                const uId = part?.userId || '';
                return {
                  id: p.peerId, // Use peerId (socketId) as the unique key to be absolutely safe
                  userId: uId,
                  socketId: p.peerId,
                  userName: p.userName || 'Participant',
                  stream: p.stream,
                  isLocal: false,
                  isVideoOn: !!p.stream,
                  isHandRaised: !!raisedHands[uId]
                }
              })
            ];

            const currentPinned = allFeeds.find(f => f.id === pinnedId || (f.socketId && f.socketId === pinnedId));

              /* Spotlight View */
              return (
                <div className="h-full w-full flex flex-col md:flex-row gap-0 md:gap-4 p-0 md:p-4 overflow-hidden">
                  {/* Main Stage - Full Screen Style */}
                  <div className="flex-[4] md:flex-[5] flex items-center justify-center bg-background relative group overflow-hidden">
                    <div className="w-full h-full relative">
                      <VideoCard 
                        stream={currentPinned.stream!} 
                        label={currentPinned.userName} 
                        isMuted={currentPinned.isLocal} 
                        isOff={!currentPinned.isVideoOn} 
                        isHandRaised={currentPinned.isHandRaised} 
                        onClick={() => setPinnedId(null)}
                        isPinned={true}
                      />
                      {/* Explicit Unpin Button */}
                      <button 
                        onClick={(e) => { e.stopPropagation(); setPinnedId(null); }}
                        className="absolute top-6 right-6 z-40 bg-black/50 hover:bg-black/70 backdrop-blur-xl text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-2xl"
                      >
                         Exit Spotlight
                      </button>
                    </div>
                  </div>

                  {/* Side Gallery - Slimmer & Tighter */}
                  <div className="flex-1 min-w-0 w-full md:w-64 lg:w-72 flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto p-2 md:p-1 scrollbar-hide">
                    {allFeeds.filter(f => f.id !== currentPinned.id).map(f => (
                      <div key={f.id} className="flex-none w-36 md:w-full aspect-video rounded-xl md:rounded-2xl overflow-hidden shadow-lg border border-border/40">
                        <VideoCard 
                          stream={f.stream!} 
                          label={f.userName} 
                          isMuted={f.isLocal} 
                          isOff={!f.isVideoOn} 
                          isHandRaised={f.isHandRaised} 
                          compact 
                          onClick={() => setPinnedId(f.id)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            /* Grid View */
            return (
              <div className="h-full w-full overflow-hidden flex flex-col bg-background/10">
                {/* Mobile: 2x2 Paginated Grid (Sliding) */}
                <div className="md:hidden h-full w-full flex overflow-x-auto snap-x snap-mandatory scrollbar-hide">
                  {(() => {
                    const chunks = [];
                    for (let i = 0; i < allFeeds.length; i += 4) {
                      chunks.push(allFeeds.slice(i, i + 4));
                    }
                    return chunks.map((chunk, idx) => (
                      <div 
                        key={idx} 
                        className={`flex-none w-full h-full p-4 snap-center grid gap-3 ${
                          allFeeds.length === 2 ? 'grid-cols-1 grid-rows-2' : 'grid-cols-2 grid-rows-2'
                        }`}
                      >
                        {chunk.map(f => (
                          <VideoCard 
                            key={f.id} 
                            stream={f.stream!} 
                            label={f.userName} 
                            isMuted={f.isLocal} 
                            isOff={!f.isVideoOn} 
                            isHandRaised={f.isHandRaised} 
                            onClick={() => setPinnedId(f.id)}
                          />
                        ))}
                        {/* Empty placeholders */}
                        {allFeeds.length !== 2 && chunk.length < 4 && Array.from({ length: 4 - chunk.length }).map((_, i) => (
                          <div key={`empty-${i}`} className="bg-muted/5 rounded-2xl border border-dashed border-border/10" />
                        ))}
                      </div>
                    ));
                  })()}
                </div>

                {/* Desktop: Professional Auto Grid */}
                <div className="hidden md:flex h-full w-full p-8 items-center justify-center overflow-y-auto custom-scrollbar">
                  <div 
                    className="grid gap-6 w-full max-w-[1600px] mx-auto auto-rows-fr"
                    style={{
                      gridTemplateColumns: `repeat(auto-fit, minmax(${
                        allFeeds.length === 1 ? '100%' : 
                        allFeeds.length === 2 ? '45%' : 
                        allFeeds.length <= 4 ? '45%' : 
                        '30%'
                      }, 1fr))`,
                    }}
                  >
                    {allFeeds.map(f => (
                      <div key={f.id} className="aspect-video w-full">
                        <VideoCard 
                          stream={f.stream!} 
                          label={f.userName} 
                          isMuted={f.isLocal} 
                          isOff={!f.isVideoOn} 
                          isHandRaised={f.isHandRaised} 
                          onClick={() => setPinnedId(f.id)}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pagination Dots for Mobile */}
                <div className="md:hidden absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
                  {Array.from({ length: Math.ceil(allFeeds.length / 4) }).map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-600/40" />
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Bottom Bar */}
        <div className="min-h-[5rem] md:h-24 bg-background/80 backdrop-blur-xl border-t border-border flex items-center px-2 md:px-6 relative shadow-[0_-10px_40px_rgba(0,0,0,0.05)] transition-colors duration-300">

          {/* Details Button — desktop only, left side */}
          <div className="hidden sm:flex items-center flex-none mr-2 md:mr-4">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className={`flex items-center gap-2 md:gap-3 px-3 md:px-5 py-2 md:py-3 rounded-xl md:rounded-2xl transition-all ${showDetails ? 'bg-blue-600/20 text-blue-600 border border-blue-500/30' : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'}`}
            >
              <Info size={18} className={showDetails ? 'animate-pulse' : ''} />
              <span className="text-[10px] md:text-[11px] font-black uppercase tracking-wider hidden lg:block">Details</span>
            </button>
          </div>

          {/* All Controls — scrollable row, centered */}
          <div className="flex-1 flex items-center justify-start md:justify-center gap-1.5 md:gap-3 overflow-x-auto no-scrollbar whitespace-nowrap py-2">

            {/* Core meeting controls */}
            <ControlBtn active={isMicOn} onClick={toggleMic} onIcon={<Mic className="w-5 h-5 md:w-[22px] md:h-[22px]" />} offIcon={<MicOff className="w-5 h-5 md:w-[22px] md:h-[22px]" />} />
            <ControlBtn active={isVideoOn} onClick={toggleVideo} onIcon={<Video className="w-5 h-5 md:w-[22px] md:h-[22px]" />} offIcon={<VideoOff className="w-5 h-5 md:w-[22px] md:h-[22px]" />} />

            <button
              onClick={handleRaiseHand}
              className={`p-2.5 md:p-4 rounded-2xl md:rounded-3xl transition-all flex-none ${raisedHands[user?.id || ''] ? 'bg-yellow-400 text-black shadow-xl shadow-yellow-400/20 animate-bounce' : 'bg-muted hover:bg-muted/80 text-foreground'}`}
              title="Raise Hand"
            >
              <Hand className="w-5 h-5 md:w-[22px] md:h-[22px]" />
            </button>

            {/* Leave */}
            <button
              onClick={() => window.location.hash = '#/dashboard'}
              className="flex-none p-2.5 md:p-4 bg-red-600 hover:bg-red-500 rounded-2xl md:rounded-3xl text-white transition-all shadow-2xl shadow-red-600/20 transform hover:scale-105 active:scale-95"
              title="Leave Meeting"
            >
              <PhoneOff className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            {/* Delete Meeting — visible on ALL screens for host */}
            {user?.id === (meetingData?.host?._id || meetingData?.host) && (
              <button
                onClick={handleDeleteMeeting}
                className="flex-none flex items-center justify-center p-2.5 md:p-4 bg-red-900 border border-red-800/50 hover:bg-red-800 rounded-2xl md:rounded-3xl text-white transition-all shadow-2xl shadow-red-900/20 transform hover:scale-105 active:scale-95"
                title="End & Delete Meeting"
              >
                <Trash2 className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            )}

            {/* Divider */}
            <div className="hidden md:block w-px h-8 bg-border mx-1 flex-none" />

            {/* Tool buttons */}
            <button
              onClick={() => { setIsCollaborationOpen(!isCollaborationOpen); setIsChatOpen(false); setIsParticipantsOpen(false); setIsTranscriptOpen(false); setIsAIAssistantOpen(false); }}
              className={`flex-none p-2.5 md:p-4 rounded-2xl md:rounded-3xl transition-all relative ${isCollaborationOpen ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'}`}
              title="Collaboration & Notes"
            >
              <Target className="w-5 h-5 md:w-[22px] md:h-[22px]" />
            </button>

            <button
              onClick={() => { setIsChatOpen(!isChatOpen); setIsParticipantsOpen(false); setIsTranscriptOpen(false); setIsAIAssistantOpen(false); setIsCollaborationOpen(false); }}
              className={`flex-none p-2.5 md:p-4 rounded-2xl md:rounded-3xl transition-all relative ${isChatOpen ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'}`}
              title="Chat"
            >
              <MessageSquare className="w-5 h-5 md:w-[22px] md:h-[22px]" />
              {messages.length > 0 && !isChatOpen && (
                <span className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-blue-600 text-white rounded-full text-[9px] md:text-[10px] flex items-center justify-center border-2 border-background font-black animate-slide-in-up transition-colors">{messages.length}</span>
              )}
            </button>

            <button
              onClick={() => { setIsTranscriptOpen(!isTranscriptOpen); setIsChatOpen(false); setIsParticipantsOpen(false); setIsAIAssistantOpen(false); setIsCollaborationOpen(false); }}
              className={`flex-none p-2.5 md:p-4 rounded-2xl md:rounded-3xl transition-all relative ${isTranscriptOpen ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'}`}
              title="Live Transcription"
            >
              <Layout className="w-5 h-5 md:w-[22px] md:h-[22px]" />
              {isTranscribing && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.4)]" />}
            </button>

            <button
              onClick={() => { setIsParticipantsOpen(!isParticipantsOpen); setIsChatOpen(false); setIsTranscriptOpen(false); setIsAIAssistantOpen(false); setIsCollaborationOpen(false); }}
              className={`flex-none p-2.5 md:p-4 rounded-2xl md:rounded-3xl transition-all relative ${isParticipantsOpen ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'}`}
              title="Participants"
            >
              <Users className="w-5 h-5 md:w-[22px] md:h-[22px]" />
            </button>

            <button
              onClick={toggleFullscreen}
              className={`flex-none p-2.5 md:p-4 rounded-2xl md:rounded-3xl transition-all relative ${isFullscreen ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'}`}
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize className="w-5 h-5 md:w-[22px] md:h-[22px]" /> : <Maximize className="w-5 h-5 md:w-[22px] md:h-[22px]" />}
            </button>

            <button
              onClick={() => { setIsAIAssistantOpen(!isAIAssistantOpen); setIsChatOpen(false); setIsTranscriptOpen(false); setIsParticipantsOpen(false); setIsCollaborationOpen(false); }}
              className={`flex-none p-2.5 md:p-4 rounded-2xl md:rounded-3xl transition-all relative ${isAIAssistantOpen ? 'bg-purple-600 dark:bg-purple-500 text-white shadow-xl shadow-purple-600/20' : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'}`}
              title="AI Assistant"
            >
              <Bot className="w-5 h-5 md:w-[22px] md:h-[22px]" />
            </button>

          </div>
        </div>

        {/* Meeting Details Modal: GMeet style */}
        {showDetails && (
          <div className="absolute bottom-28 left-8 w-80 bg-card border border-border rounded-[32px] p-6 shadow-2xl animate-slide-in-up z-50 overflow-hidden transition-colors duration-300">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2" />
             
             <div className="relative z-10 space-y-5">
                <div>
                   <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-1">Joining Info</h3>
                   <p className="text-lg font-black text-foreground truncate transition-colors">{meetingData?.title}</p>
                </div>

                <div className="space-y-3">
                   <div className="bg-muted border border-border p-4 rounded-2xl transition-colors">
                      <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2 font-bold">Meeting Link</p>
                      <p className="text-xs text-muted-foreground truncate mb-4 transition-colors">{window.location.href.split('/room')[0]}</p>
                      <button 
                        onClick={copyJoiningInfo}
                        className="w-full py-3 bg-card border border-border hover:bg-blue-600 hover:text-white text-foreground rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                      >
                         Copy Joining Info
                      </button>
                   </div>
                   <div className="flex items-center justify-between px-4">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Dial-in Node</span>
                      <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">{meetingCode}</span>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>

      {isTranscriptOpen && (
        <aside className="fixed md:relative top-0 right-0 z-[60] w-full sm:w-80 h-full bg-card border-l border-border p-4 md:p-6 flex flex-col gap-4 md:gap-6 animate-slide-in-right overflow-hidden shadow-2xl transition-colors duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Layout size={16} /> Live Transcript
            </h3>
            <button onClick={() => setIsTranscriptOpen(false)} className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-all">
              <Plus size={18} className="rotate-45" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 scrollbar-hide pr-2">
            {transcripts.map((t, i) => (
              <div key={i} className="animate-fade-in">
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-1">{t.userName}</p>
                <p className="text-xs text-foreground leading-relaxed bg-muted/50 p-3 rounded-2xl border border-border transition-colors">{t.text}</p>
              </div>
            ))}
            {transcripts.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                <Sparkles className="text-muted-foreground mb-4" size={32} />
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Waiting for speech...</p>
              </div>
            )}
          </div>

          <button 
            onClick={toggleTranscription}
            className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${isTranscribing ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-blue-600 text-white border border-blue-500/20 shadow-lg shadow-blue-600/20 hover:bg-blue-500'}`}
          >
            {isTranscribing ? 'Stop Intelligence' : 'Start Live Analysis'}
          </button>
        </aside>
      )}

      {isChatOpen && (
        <aside className="fixed md:relative top-0 right-0 z-[60] w-full sm:w-80 h-full bg-card border-l border-border animate-slide-in-right shadow-2xl overflow-hidden transition-colors duration-300">
          <ChatSidebar 
            meetingId={meetingCode}
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
         <aside className="fixed md:relative top-0 right-0 z-[60] w-full sm:w-80 h-full bg-card border-l border-border animate-slide-in-right shadow-2xl overflow-hidden transition-colors duration-300">
         <ParticipantSidebar 
              participants={participants}
              participantStates={participantStates}
              localUserId={user?.id || ''}
              hostId={meetingData?.host?._id || meetingData?.host}
              onMuteParticipant={handleMuteParticipant}
              onRemoveParticipant={handleRemoveParticipant}
              onUpdatePermission={handleUpdateParticipantPermission}
              onInviteLink={handleCopyInviteLink}
              onClose={() => setIsParticipantsOpen(false)}
            />
         </aside>
      )}

      {isCollaborationOpen && (
        <aside className="fixed md:relative top-0 right-0 z-[60] w-full sm:w-80 h-full bg-card border-l border-border animate-slide-in-right shadow-2xl overflow-hidden transition-colors duration-300">
           <MeetingCollaboration 
             meetingId={meetingCode} 
             userName={user?.name || 'User'} 
             isAdmin={user?.id === (meetingData?.host?._id || meetingData?.host)}
             onClose={() => setIsCollaborationOpen(false)} 
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
        @keyframes slideInUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-slide-in-right { animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slide-in-up { animation: slideInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fade-in { animation: fadeIn 0.4s ease forwards; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(59, 130, 246, 0.4); }
      `}} />
    </div>
  )
}

function VideoCard({ stream, label, isMuted = false, isOff = false, isHandRaised = false, compact = false, onClick, isPinned = false }: { stream?: MediaStream, label: string, isMuted?: boolean, isOff?: boolean, isHandRaised?: boolean, compact?: boolean, onClick?: () => void, isPinned?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current && stream && !isOff) {
      videoRef.current.srcObject = stream
    }
  }, [stream, isOff])

  // Truncate long names for compact thumbnail view
  const displayLabel = label ? (compact && label.length > 12 ? label.slice(0, 10) + '…' : label) : 'User'

  return (
    <div 
      onClick={onClick}
      className={`relative group w-full h-full rounded-2xl ${ compact ? '' : 'md:rounded-[32px]'} bg-muted/50 border transition-all duration-500 overflow-hidden shadow-2xl cursor-pointer ${isHandRaised ? 'border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.2)] scale-[1.01]' : 'border-border hover:border-blue-500/40 hover:bg-muted/80'} ${isPinned ? 'ring-4 ring-blue-600/20' : ''}`}
    >
      {(!stream || isOff) ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-card z-10">
           <div className={`${ compact ? 'w-10 h-10' : 'w-20 h-20' } rounded-full flex items-center justify-center border transition-all ${ isHandRaised ? 'border-yellow-400/30 bg-yellow-400/5 shadow-[0_0_15px_rgba(250,204,21,0.1)]' : 'bg-muted border-border'}`}>
              <p className={`${ compact ? 'text-base' : 'text-2xl'} font-black transition-colors ${isHandRaised ? 'text-yellow-400' : 'text-muted-foreground'}`}>{label.charAt(0).toUpperCase()}</p>
           </div>
           {!compact && <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-4">Camera Offline</p>}
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
      
      {isHandRaised && !compact && (
         <div className="absolute top-4 left-4 z-30 bg-yellow-400 text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 animate-bounce shadow-lg">
            <Hand size={12} fill="currentColor" />
            Hand Raised
         </div>
      )}

      {isPinned && !compact && (
        <div className="absolute top-4 right-4 z-30 bg-blue-600 text-white p-2 rounded-full shadow-lg">
           <Minimize size={14} />
        </div>
      )}

      <div className={`absolute ${ compact ? 'bottom-1 left-1' : 'bottom-2 md:bottom-4 left-2 md:left-4'} z-20`}>
        <span className={`backdrop-blur-md rounded-lg border transition-all ${ compact ? 'px-1.5 py-0.5 text-[8px] tracking-wide' : 'px-3 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl text-[10px] md:text-[11px] tracking-widest'} font-black uppercase ${isHandRaised ? 'bg-yellow-400/20 border-yellow-400/50 text-yellow-500' : 'bg-background/60 dark:bg-black/60 border-white/10 text-foreground dark:text-white'}`}>
          {displayLabel}
        </span>
      </div>
    </div>
  )
}

function ControlBtn({ active, onClick, onIcon, offIcon }: { active: boolean, onClick: () => void, onIcon: any, offIcon: any }) {
  return (
    <button 
      onClick={onClick}
      className={`p-3.5 md:p-5 rounded-2xl md:rounded-3xl transition-all shadow-xl ${active ? 'bg-muted border border-border hover:bg-muted/80 text-foreground' : 'bg-red-500/20 text-red-600 dark:text-red-500 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]'}`}
    >
      {active ? onIcon : offIcon}
    </button>
  )
}
