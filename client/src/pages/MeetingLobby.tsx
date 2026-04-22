import { Camera, Mic, MicOff, Settings, VideoOff, X, Check, Headphones, Speaker, User as UserIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useMeetingStore } from '../store/useMeetingStore'
import api from '../utils/api'

interface MeetingDetails {
  title: string
  host: { name: string }
}

export default function MeetingLobby({ meetingCode }: { meetingCode: string }) {
  const [meeting, setMeeting] = useState<MeetingDetails | null>(null)
  const [error, setError] = useState('')
  const [hardwareWarning, setHardwareWarning] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedVideo, setSelectedVideo] = useState('')
  const [selectedAudio, setSelectedAudio] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  
  const { 
    stream, 
    setStream, 
    isMicOn, 
    isVideoOn, 
    toggleMic, 
    toggleVideo 
  } = useMeetingStore()

  useEffect(() => {
    fetchMeeting()
    startPreview()
    fetchDevices()
    
    return () => {
      // Don't stop the stream here, we want to keep it for the meeting!
    }
  }, [meetingCode])

  const fetchMeeting = async () => {
    try {
      const response = await api.get(`/meetings/${meetingCode}`)
      setMeeting(response.data)
    } catch (err: any) {
      setError('Meeting not found or invalid code.')
    }
  }

  const fetchDevices = async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices()
      setDevices(allDevices)
      
      // Select defaults if not set
      if (!selectedVideo) {
        const videoDevice = allDevices.find(d => d.kind === 'videoinput')
        if (videoDevice) setSelectedVideo(videoDevice.deviceId)
      }
      if (!selectedAudio) {
        const audioDevice = allDevices.find(d => d.kind === 'audioinput')
        if (audioDevice) setSelectedAudio(audioDevice.deviceId)
      }
    } catch (err) {
      console.error('Error fetching devices:', err)
    }
  }

  const startPreview = async (vId?: string, aId?: string) => {
    try {
      const constraints = {
        video: vId ? { deviceId: { exact: vId } } : (selectedVideo ? { deviceId: { exact: selectedVideo } } : true),
        audio: aId ? { deviceId: { exact: aId } } : (selectedAudio ? { deviceId: { exact: selectedAudio } } : true)
      }

      // If we already have a stream and we're just updating, stop old tracks
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(mediaStream)
      if (videoRef.current) videoRef.current.srcObject = mediaStream
      
      // Refresh devices list after permission is granted to get labels
      const allDevices = await navigator.mediaDevices.enumerateDevices()
      setDevices(allDevices)
    } catch (err: any) {
      console.error('Error accessing devices:', err)
      // Don't block the whole join flow, just warn about hardware conflict
      setHardwareWarning('Camera or Microphone is currently in use by another application or blocked. You can still join the meeting.')
      if (isVideoOn) toggleVideo()
      if (isMicOn) toggleMic()
    }
  }

  const handleDeviceChange = (type: 'video' | 'audio', deviceId: string) => {
    if (type === 'video') {
      setSelectedVideo(deviceId)
      startPreview(deviceId, selectedAudio)
    } else {
      setSelectedAudio(deviceId)
      startPreview(selectedVideo, deviceId)
    }
  }

  const handleJoin = () => {
    window.location.hash = `#/meeting/${meetingCode}/room`
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 md:p-12 font-sans selection:bg-blue-500/30 transition-colors duration-300">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-center">
        
        {/* Left Side: Preview */}
        <div className="space-y-4 md:space-y-6">
          <div className="relative aspect-video rounded-3xl md:rounded-[40px] bg-muted/30 border border-border shadow-2xl group transition-all duration-500 hover:border-blue-500/30 overflow-hidden">
             {(!isVideoOn || hardwareWarning) && (
               <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm z-10 transition-all px-8 text-center">
                  <div className="p-6 bg-muted rounded-full border border-border mb-4 animate-scale-in">
                    <VideoOff size={48} className={hardwareWarning ? 'text-red-500/60' : 'text-muted-foreground/40'} />
                  </div>
                  <p className="text-muted-foreground text-[10px] font-black tracking-widest uppercase mb-2">
                    {hardwareWarning ? 'Hardware in Use' : 'Video is Off'}
                  </p>
                  {hardwareWarning && (
                    <p className="text-red-600 dark:text-red-400 text-xs font-medium leading-relaxed max-w-[280px]">
                      {hardwareWarning}
                    </p>
                  )}
               </div>
             )}
             
             <video 
               ref={videoRef} 
               autoPlay 
               muted 
               playsInline
               className={`w-full h-full object-cover transition-opacity duration-500 ${(isVideoOn && !hardwareWarning) ? 'opacity-100' : 'opacity-0'}`}
             />

             {/* Bottom Controls */}
             <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
                <button 
                  onClick={toggleMic}
                  className={`p-4 rounded-2xl transition-all shadow-xl active:scale-90 ${isMicOn ? 'bg-background/80 hover:bg-background text-foreground border border-border backdrop-blur-md' : 'bg-red-600 text-white shadow-red-600/20'}`}
                >
                  {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
                </button>
                <button 
                  onClick={toggleVideo}
                  className={`p-4 rounded-2xl transition-all shadow-xl active:scale-90 ${isVideoOn ? 'bg-background/80 hover:bg-background text-foreground border border-border backdrop-blur-md' : 'bg-red-600 text-white shadow-red-600/20'}`}
                >
                   {isVideoOn ? <Camera size={24} /> : <VideoOff size={24} />}
                </button>
                <button 
                  onClick={() => setShowSettings(true)}
                  className="p-4 rounded-2xl bg-background/80 hover:bg-background text-foreground border border-border backdrop-blur-md transition-all shadow-xl active:scale-90"
                >
                  <Settings size={24} />
                </button>
             </div>

             {/* Visualizer overlay */}
             {isMicOn && (
               <div className="absolute top-6 right-6 flex items-end gap-1 h-8 px-3 py-2 bg-background/40 backdrop-blur-md rounded-xl border border-border blur-0 scale-75 md:scale-100">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-1 bg-blue-500 rounded-full animate-audio-bar" style={{ animationDelay: `${i * 0.1}s` }} />
                  ))}
               </div>
             )}
          </div>
          
        </div>

        {/* Right Side: Join Form */}
        <div className="bg-card border border-border rounded-[32px] md:rounded-[48px] p-6 md:p-10 lg:p-14 shadow-2xl relative overflow-hidden transition-colors">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
          
          {error ? (
            <div className="text-center py-12 space-y-6 relative z-10">
               <div className="inline-flex p-4 bg-red-500/10 border border-red-500/20 rounded-3xl text-red-500 mb-4 animate-shake">
                  <VideoOff size={40} />
               </div>
               <h2 className="text-2xl font-black text-foreground">{error}</h2>
               <button 
                 onClick={() => window.location.hash = '#/dashboard'}
                 className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
                >
                  Return to Dashboard
                </button>
            </div>
          ) : (
            <div className="relative z-10">
              <h2 className="text-[10px] md:text-sm font-black uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400 mb-2 md:mb-4">Joining Meeting</h2>
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-black mb-4 md:mb-6 tracking-tight leading-[1.1] text-foreground">
                {meeting?.title || 'Sync Session'}
              </h1>
              <div className="flex items-center gap-3 mb-6 pb-6 md:mb-10 md:pb-10 border-b border-border">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-muted border border-border flex items-center justify-center">
                  <UserIcon size={16} className="text-muted-foreground" />
                </div>
                <div>
                  <p className="text-muted-foreground text-[8px] md:text-[10px] font-bold uppercase tracking-widest">Hosted by</p>
                  <p className="text-sm md:text-base text-foreground font-bold">{meeting?.host.name || 'Admin User'}</p>
                </div>
              </div>

              <div className="space-y-4 md:space-y-6">
                <div className="bg-muted/50 border border-border rounded-2xl md:rounded-3xl p-4 md:p-6 transition-all hover:bg-muted/80">
                  <p className="text-[11px] md:text-[13px] leading-relaxed text-muted-foreground">
                    Your camera and microphone are ready. Make sure you are in a quiet environment for the best experience.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <button 
                    onClick={handleJoin}
                    className="group relative bg-foreground text-background font-black text-xs md:text-sm py-4 md:py-5 rounded-xl md:rounded-[22px] shadow-xl overflow-hidden active:scale-95 transition-all"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                       Join Meeting
                    </span>
                    <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  </button>
                  <a 
                    href="#/dashboard"
                    className="flex items-center justify-center py-4 md:py-5 border border-border rounded-xl md:rounded-[22px] text-xs md:text-sm font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                  >
                    Cancel
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in">
           <div className="bg-card border border-border rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl relative transition-colors">
              {/* Header */}
              <div className="p-8 border-b border-border flex items-center justify-between">
                 <div>
                    <h2 className="text-2xl font-black tracking-tight text-foreground">Meeting Settings</h2>
                    <p className="text-muted-foreground text-sm font-medium">Configure your hardware for the session</p>
                 </div>
                 <button 
                   onClick={() => setShowSettings(false)}
                   className="p-3 bg-muted hover:bg-muted/80 rounded-2xl text-muted-foreground hover:text-foreground transition-all"
                 >
                   <X size={24} />
                 </button>
              </div>

              {/* Body */}
              <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto scrollbar-hide">
                 {/* Video Section */}
                 <div className="space-y-4">
                    <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
                       <Camera size={18} />
                       <span className="text-[10px] font-black uppercase tracking-[0.2em]">Video Input</span>
                    </div>
                    <div className="grid gap-2">
                       {devices.filter(d => d.kind === 'videoinput').map(device => (
                          <button 
                            key={device.deviceId}
                            onClick={() => handleDeviceChange('video', device.deviceId)}
                            className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${selectedVideo === device.deviceId ? 'bg-blue-600/10 border-blue-500/50 text-foreground' : 'bg-muted/50 border-border text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                          >
                             <span className="text-sm font-bold truncate max-w-[400px]">{device.label || `Camera ${device.deviceId.slice(0, 5)}`}</span>
                             {selectedVideo === device.deviceId && <Check size={18} className="text-blue-500" />}
                          </button>
                       ))}
                    </div>
                 </div>

                 {/* Audio Section */}
                 <div className="space-y-4">
                    <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
                       <Mic size={18} />
                       <span className="text-[10px] font-black uppercase tracking-[0.2em]">Audio Input</span>
                    </div>
                    <div className="grid gap-2">
                       {devices.filter(d => d.kind === 'audioinput').map(device => (
                          <button 
                            key={device.deviceId}
                            onClick={() => handleDeviceChange('audio', device.deviceId)}
                            className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${selectedAudio === device.deviceId ? 'bg-purple-600/10 border-purple-500/50 text-foreground' : 'bg-muted/50 border-border text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                          >
                             <span className="text-sm font-bold truncate max-w-[400px]">{device.label || `Microphone ${device.deviceId.slice(0, 5)}`}</span>
                             {selectedAudio === device.deviceId && <Check size={18} className="text-purple-500" />}
                          </button>
                       ))}
                    </div>
                 </div>
              </div>

              {/* Footer */}
              <div className="p-8 bg-muted/20 border-t border-border flex justify-end">
                 <button 
                   onClick={() => setShowSettings(false)}
                   className="px-8 py-4 bg-foreground text-background font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-foreground/90 transition-all active:scale-95 shadow-xl"
                 >
                   Done
                 </button>
              </div>
           </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes audioBar {
          0%, 100% { height: 4px; }
          50% { height: 16px; }
        }
        .animate-audio-bar {
          animation: audioBar 0.8s ease-in-out infinite;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out infinite;
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  )
}
