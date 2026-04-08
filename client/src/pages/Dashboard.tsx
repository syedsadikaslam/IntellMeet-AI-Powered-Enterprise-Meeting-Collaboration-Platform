import { Calendar, Layout, Plus, Search, Video, LogOut, ArrowRight, Clock, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '../utils/api'
import { useAuthStore } from '../store/useAuthStore'

interface Meeting {
  meetingCode: string
  title: string
  description?: string
  createdAt: string
}

export default function Dashboard() {
  const { user, logout } = useAuthStore()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newMeeting, setNewMeeting] = useState({ title: '', description: '' })
  const [joinCode, setJoinCode] = useState('')

  useEffect(() => {
    fetchMeetings()
  }, [])

  const fetchMeetings = async () => {
    try {
      const response = await api.get('/meetings')
      setMeetings(response.data)
    } catch (error) {
      console.error('Failed to fetch meetings', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await api.post('/meetings', newMeeting)
      window.location.hash = `#/meeting/${response.data.meetingCode}`
    } catch (error) {
      console.error('Failed to create meeting', error)
      alert('Failed to create meeting. Please try again.')
    }
  }

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault()
    if (joinCode.trim()) {
      window.location.hash = `#/meeting/${joinCode}`
    }
  }

  const handleExportLogs = () => {
    if (meetings.length === 0) {
      alert('No meeting logs available to export.')
      return
    }

    const dataStr = JSON.stringify(meetings, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `intellmeet_logs_${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  return (
    <div className="min-h-screen bg-[#030507] text-white overflow-x-hidden font-sans selection:bg-blue-500/30">
      <main className="pt-6 sm:pt-10 pb-20 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto relative">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

        {/* Welcome Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-12 sm:mb-20">
           <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[9px] sm:text-[10px] font-black uppercase tracking-widest animate-fade-in">
                 <ShieldCheck size={12} className="animate-pulse" />
                 Verified Workspace
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter mb-4 leading-[0.9] sm:leading-[1.1]">
                Session Ready,<br/>
                <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-blue-400 bg-clip-text text-transparent animate-gradient-x inline-block">
                  {user?.name?.split(' ')[0]}!
                </span>
              </h1>
              <p className="text-white/40 text-base sm:text-lg max-w-md leading-relaxed font-medium">
                Connect with your team instantly or deploy a high-performance meeting instance.
              </p>
           </div>
           
           <div className="flex flex-col gap-4">
               <div className="w-full bg-white/[0.03] border border-white/10 p-6 sm:p-8 rounded-[36px] sm:rounded-[48px] backdrop-blur-xl shadow-2xl">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-6 font-mono">Operations Console</h3>
                  <div className="space-y-4">
                     <form onSubmit={handleJoinByCode} className="relative group/join">
                        <input 
                          type="text"
                          placeholder="Enter Room Code..."
                          value={joinCode}
                          onChange={(e) => setJoinCode(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all font-bold placeholder:text-white/10"
                        />
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/join:text-blue-500 transition-colors" />
                        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-blue-600 rounded-xl hover:bg-blue-500 transition-all shadow-lg active:scale-95">
                           <ArrowRight size={18} />
                        </button>
                     </form>
                     
                     <button 
                       onClick={() => setShowCreateModal(true)}
                       className="w-full flex items-center justify-center gap-3 bg-white text-black py-4 sm:py-4.5 rounded-2xl font-black text-xs sm:text-sm tracking-widest hover:bg-blue-50 transition-all active:scale-95 shadow-[0_8px_32px_rgba(255,255,255,0.1)] group"
                     >
                       <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                       DEPLOY NEW INSTANCE
                     </button>
                  </div>
               </div>
           </div>
        </div>

        {/* Content Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 sm:gap-16">
           {/* Meetings List */}
           <div className="lg:col-span-2 space-y-8 sm:space-y-10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-black flex items-center gap-4">
                  Recent Stream
                  <div className="h-px w-20 bg-gradient-to-r from-blue-500/20 to-transparent" />
                </h2>
                {!isLoading && meetings.length > 0 && (
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/20">{meetings.length} rooms active</span>
                )}
              </div>

              {isLoading ? (
                <div className="space-y-4">
                   {[1,2,3].map(i => <div key={i} className="h-28 sm:h-32 bg-white/5 rounded-[32px] animate-pulse" />)}
                </div>
              ) : meetings.length === 0 ? (
                <div className="bg-white/[0.02] border border-white/5 border-dashed rounded-[48px] p-12 sm:p-24 text-center flex flex-col items-center justify-center">
                   <div className="w-20 h-20 bg-blue-600/10 rounded-[32px] flex items-center justify-center mb-8 border border-blue-500/20 group hover:border-blue-500/40 transition-colors cursor-pointer">
                      <Video size={32} className="text-blue-500 group-hover:scale-110 transition-transform" />
                   </div>
                   <h3 className="text-xl sm:text-2xl font-black mb-3">No Active Channels</h3>
                   <p className="text-white/30 text-sm sm:text-base max-w-[280px] leading-relaxed mb-10 font-medium">Your organization&apos;s stream is empty. Start a session to begin.</p>
                   <button 
                     onClick={() => setShowCreateModal(true)}
                     className="px-10 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5"
                   >
                     Initialize First Room
                   </button>
                </div>
              ) : (
                <div className="grid gap-5">
                  {meetings.map((meeting) => (
                    <article key={meeting.meetingCode} className="group relative bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-blue-500/30 p-5 sm:p-6 rounded-[32px] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6 overflow-hidden">
                       <div className="absolute -top-12 -right-12 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                       
                       <div className="flex items-center gap-5 sm:gap-6 min-w-0 relative z-10">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600/10 to-violet-600/10 rounded-2xl flex items-center justify-center border border-white/5 flex-shrink-0 group-hover:scale-105 transition-all shadow-inner">
                           <Video className="text-blue-500 group-hover:text-blue-400 transition-colors" size={26} />
                        </div>
                        <div className="min-w-0 space-y-1.5">
                          <h3 className="font-black text-lg sm:text-xl truncate group-hover:text-blue-400 transition-colors uppercase tracking-tight">{meeting.title}</h3>
                          <div className="flex items-center gap-3">
                             <span className="text-[10px] text-blue-500/60 font-black tracking-widest font-mono bg-blue-500/5 px-2 py-0.5 rounded-md border border-blue-500/10">{meeting.meetingCode}</span>
                             <div className="w-1 h-1 bg-white/10 rounded-full" />
                             <span className="text-[10px] text-white/30 font-black uppercase tracking-[0.15em] flex items-center gap-1.5 whitespace-nowrap">
                                <Clock size={12} className="text-white/20" />
                                {new Date(meeting.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                             </span>
                          </div>
                        </div>
                      </div>
                      <a 
                        href={`#/meeting/${meeting.meetingCode}`}
                        className="w-full sm:w-auto text-center bg-white text-black hover:bg-blue-50 px-8 py-4 sm:py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-[0_8px_24px_rgba(255,255,255,0.05)] active:scale-95 relative z-10 border border-white/10"
                      >
                        Launch Visuals
                      </a>
                    </article>
                  ))}
                </div>
              )}
           </div>

           {/* Stats/Calendar Sidebar */}
           <div className="space-y-10 sm:space-y-12">
              <div className="space-y-8">
                <h2 className="text-xl sm:text-2xl font-black flex items-center gap-4">
                  Analytics
                  <div className="h-px flex-1 bg-gradient-to-r from-white/5 to-transparent" />
                </h2>

                <div className="bg-gradient-to-br from-blue-600/40 via-violet-600/40 to-transparent p-[1px] rounded-[48px] group transition-all shadow-2xl">
                   <div className="bg-[#0a0f1d] rounded-[47px] p-8 sm:p-10 h-full relative overflow-hidden backdrop-blur-3xl">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2" />
                      
                      {(() => {
                        const totalMeetings = meetings.length;
                        const reclaimedMinutes = totalMeetings * 35; // Estimate 35 mins saved per meeting
                        const reclaimedHours = (reclaimedMinutes / 60).toFixed(1);
                        const throughput = totalMeetings > 0 ? Math.min(Math.floor((totalMeetings / 5) * 14 + 8), 98) : 0;

                        return (
                          <div className="relative z-10">
                            <div className="p-3.5 bg-blue-500/10 w-fit rounded-2xl mb-8 border border-blue-500/20 shadow-inner">
                               <Calendar size={24} className="text-blue-400" />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-black mb-4 tracking-tight uppercase">High-Flow Metrics</h3>
                            <p className="text-sm sm:text-base text-white/40 leading-relaxed mb-10 font-medium">
                               Your workspace throughput is up <strong>{throughput}%</strong>. You&apos;ve reclaimed <strong>{reclaimedHours}h</strong> this month via AI synthesis.
                            </p>
                            <button 
                              onClick={handleExportLogs}
                              className="w-full bg-white/5 hover:bg-white text-white/70 hover:text-black py-4.5 rounded-2xl font-black text-[10px] tracking-[0.2em] uppercase transition-all border border-white/10 hover:border-white group/btn"
                            >
                               EXPORT LOGS
                            </button>
                          </div>
                        );
                      })()}
                   </div>
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-[40px] p-8 sm:p-10 relative overflow-hidden">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-8 flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#50e3c2] animate-pulse shadow-[0_0_8px_#50e3c2]" />
                      Deployment Nodes
                   </h3>
                   <div className="space-y-8">
                      <StatusItem label="Signal Relay L1" status="Peak" active />
                      <StatusItem label="Media Edge NYC" status="Stable" active />
                      <StatusItem label="AI Inference Node" status="Indexing" active={false} />
                   </div>
                </div>
              </div>
           </div>
        </div>
      </main>

      {/* Create Meeting Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-2xl animate-fade-in">
          <div className="bg-[#0a0f1d] border border-white/10 rounded-[48px] p-8 sm:p-12 w-full max-w-xl shadow-[0_0_120px_rgba(37,99,235,0.15)] relative overflow-hidden">
            <div className="absolute -top-32 -right-32 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px]" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="text-3xl sm:text-4xl font-black mb-2 tracking-tighter uppercase">Initialize</h2>
                  <p className="text-white/30 text-sm font-medium tracking-wide">Configure a high-performance meeting node.</p>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="p-4 bg-white/5 hover:bg-red-500/10 hover:text-red-500 rounded-2xl text-white/20 transition-all border border-white/5 hover:border-red-500/20 group">
                   <Plus className="rotate-45 group-hover:rotate-[135deg] transition-transform" size={24} />
                </button>
              </div>
              
              <form onSubmit={handleCreateMeeting} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500/60 ml-1">Instance Identifier</label>
                  <input 
                    autoFocus
                    required
                    type="text"
                    placeholder="e.g. ALPHA_CLUSTER_01"
                    value={newMeeting.title}
                    onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-lg text-white focus:outline-none focus:border-blue-500 focus:bg-white/[0.08] transition-all font-bold placeholder:text-white/10"
                  />
                </div>
                
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500/60 ml-1">Briefing Scope</label>
                  <textarea 
                    rows={2}
                    placeholder="Strategic alignment for next sprint..."
                    value={newMeeting.description}
                    onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-white focus:outline-none focus:border-blue-500 focus:bg-white/[0.08] transition-all font-medium resize-none placeholder:text-white/10"
                  />
                </div>

                <div className="flex gap-4 pt-6">
                  <button 
                    type="submit"
                    className="flex-1 bg-white text-black py-5 sm:py-6 rounded-2xl font-black text-xs sm:text-sm tracking-[0.3em] uppercase hover:bg-blue-50 transition-all shadow-[0_12px_48px_rgba(255,255,255,0.1)] active:scale-[0.98] border border-white/10"
                  >
                    DEPLOY NODE
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes gradient-x {
           0%, 100% { background-position: 0% 50%; }
           50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
           background-size: 200% 200%;
           animation: gradient-x 6s ease-infinite;
        }
      `}} />
    </div>
  )
}

function StatusItem({ label, status, active }: { label: string, status: string, active: boolean }) {
   return (
      <div className="flex items-center justify-between group cursor-help">
         <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] group-hover:text-white transition-colors">{label}</span>
         <div className="flex items-center gap-3 bg-white/2 px-3 py-1.5 rounded-xl border border-white/5 group-hover:border-white/10 transition-colors">
            <span className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-[#50e3c2]' : 'text-orange-400'}`}>{status}</span>
            <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-[#50e3c2] shadow-[0_0_10px_#50e3c2]' : 'bg-orange-500 animate-pulse'}`} />
         </div>
      </div>
   )
}
