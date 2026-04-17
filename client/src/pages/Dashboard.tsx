import { 
  Calendar, Layout, Plus, Search, Video, ArrowRight, Clock, 
  ShieldCheck, MessageSquare, Activity, Globe, Zap, FileText, BarChart3, Star
} from 'lucide-react'
import React, { useEffect, useState, useRef } from 'react'
import api from '../utils/api'
import { useAuthStore } from '../store/useAuthStore'
import { io, Socket } from 'socket.io-client'
import PerformanceChart from '../components/PerformanceChart'
import TeamChat from '../components/TeamChat'
import { generateMeetingReport } from '../utils/ReportGenerator'
import { SOCKET_URL } from '../utils/socket'

interface Meeting {
  _id: string;
  meetingCode: string;
  title: string;
  description?: string;
  createdAt: string;
  summary?: string;
  transcript?: string;
  sentiment?: string;
  highlights?: string[];
  actionItems?: Array<{ task: string, suggestedAssignee: string, status: string }>;
}

interface Project {
  _id: string
  name: string
  team: string
}

interface GlobalStats {
  onlineUsers: number
  activeRooms: number
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newMeeting, setNewMeeting] = useState({ title: '', description: '' })
  const [joinCode, setJoinCode] = useState('')
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [isPushing, setIsPushing] = useState(false)
  const [stats, setStats] = useState<GlobalStats>({ onlineUsers: 0, activeRooms: 0 })
  const [showChat, setShowChat] = useState(false)
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null)
  const [performanceData, setPerformanceData] = useState<any[]>([])
  const [isCreatingProject, setIsCreatingProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [joinTeamCode, setJoinTeamCode] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    fetchMeetings()
    fetchProjects()
    fetchAnalytics()

    // Initialize Global Stats Socket
    socketRef.current = io(SOCKET_URL);
    socketRef.current.on('stats-update', (newStats: GlobalStats) => {
      setStats(newStats);
    });

    return () => {
      socketRef.current?.disconnect();
    };
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

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects')
      setProjects(response.data)
      if (response.data.length > 0) {
        if (!activeTeamId) setActiveTeamId(response.data[0].team);
        setSelectedProjectId(response.data[0]._id);
      }
    } catch (error) {
      console.error('Failed to fetch projects', error)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/meetings/analytics')
      if (response.data && response.data.frequencyData) {
        setPerformanceData(response.data.frequencyData)
      }
    } catch (err) {
      console.error('Failed to fetch analytics', err)
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

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinTeamCode.trim()) return;
    try {
      await api.post('/teams/join', { code: joinTeamCode });
      setJoinTeamCode('');
      fetchProjects();
      alert('Successfully joined the workspace!');
    } catch (error: any) {
      console.error('Failed to join team', error);
      alert(error.response?.data?.message || 'Failed to join workspace.');
    }
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    try {
      const teamRes = await api.post('/teams', { 
        name: `${newProjectName} Team`, 
        description: `Workspace for ${newProjectName}` 
      });
      const teamId = teamRes.data._id;

      await api.post('/projects', { name: newProjectName, teamId });
      setNewProjectName('');
      setIsCreatingProject(false);
      fetchProjects();
    } catch (error) {
      console.error('Failed to create project', error);
      alert('Error creating project workspace.');
    }
  }

  const handleAnalyzeMeeting = async (meetingId: string) => {
    try {
      const response = await api.post(`/meetings/${meetingId}/analyze`);
      const updatedMeeting = response.data;
      setMeetings(prev => prev.map(m => m._id === meetingId ? updatedMeeting : m));
      setSelectedMeeting(updatedMeeting);
    } catch (error) {
      console.error('Failed to analyze meeting', error);
      alert('Failed to generate AI insights. Make sure there is a transcript available.');
    }
  }

  const handleToggleActionItem = async (index: number) => {
    if (!selectedMeeting) return;
    const updatedItems = [...(selectedMeeting.actionItems || [])];
    updatedItems[index].status = updatedItems[index].status === 'completed' ? 'pending' : 'completed';
    
    try {
      const response = await api.put(`/meetings/${selectedMeeting._id}/action-items`, { actionItems: updatedItems });
      setMeetings(prev => prev.map(m => m._id === selectedMeeting._id ? response.data : m));
      setSelectedMeeting(response.data);
    } catch (error) {
       console.error('Failed to update action item', error);
    }
  }

  const handlePushToProject = async () => {
    if (!selectedMeeting?.actionItems?.length || !selectedProjectId) {
       alert('Please select a project and ensure there are action items.');
       return;
    }
    setIsPushing(true);
    try {
      for (const item of selectedMeeting.actionItems) {
        await api.post(`/projects/${selectedProjectId}/tasks`, {
          title: item.task,
          description: `Action item from meeting: ${selectedMeeting.title}`,
          status: 'todo',
          priority: 'medium',
          meetingOrigin: selectedMeeting._id
        });
      }
      alert(`Successfully pushed ${selectedMeeting.actionItems.length} tasks to selected project.`);
    } catch (error) {
      console.error('Failed to push tasks', error);
      alert('Failed to push tasks to project board.');
    } finally {
      setIsPushing(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden font-sans selection:bg-blue-500/30 flex transition-colors duration-300">
      <main className="flex-1 pt-6 sm:pt-10 pb-20 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto relative">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

        {/* Welcome Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-12 sm:mb-20">
           <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-600 dark:text-blue-400 text-[9px] sm:text-[10px] font-black uppercase tracking-widest animate-fade-in">
                 <ShieldCheck size={12} className="animate-pulse" />
                 Verified Workspace
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter mb-4 leading-[0.9] sm:leading-[1.1]">
                Session Ready,<br/>
                <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-blue-600 bg-clip-text text-transparent animate-gradient-x inline-block">
                  {user?.name?.split(' ')[0]}!
                </span>
              </h1>
              <p className="text-muted-foreground text-base sm:text-lg max-w-md leading-relaxed font-medium">
                Connect with your team instantly or deploy a high-performance meeting instance.
              </p>
              
              <div className="flex gap-4 pt-4">
                <div className="bg-card border border-border px-6 py-4 rounded-3xl shadow-sm">
                  <span className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Active Operatives</span>
                  <span className="text-2xl font-black text-blue-600">{stats.onlineUsers}</span>
                </div>
                <div className="bg-card border border-border px-6 py-4 rounded-3xl shadow-sm">
                  <span className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Live Sectors</span>
                  <span className="text-2xl font-black text-violet-600">{stats.activeRooms}</span>
                </div>
              </div>
           </div>
           
           <div className="flex flex-col gap-4">
               <div className="w-full bg-card border border-border p-6 sm:p-8 rounded-[36px] sm:rounded-[48px] backdrop-blur-xl shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground font-mono">Operations Console</h3>
                    <button 
                      onClick={() => setIsCreatingProject(true)}
                      className="p-2 bg-blue-500/10 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                      title="New Project Board"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                   <div className="space-y-6">
                     <form onSubmit={handleJoinByCode} className="relative group/join">
                        <input 
                          type="text"
                          placeholder="Enter Room Code..."
                          value={joinCode}
                          onChange={(e) => setJoinCode(e.target.value)}
                          className="w-full bg-muted border border-border rounded-2xl py-4 pl-12 pr-4 text-xs focus:outline-none focus:border-blue-500/50 focus:bg-muted/80 transition-all font-bold placeholder:text-muted-foreground/30 text-foreground"
                        />
                        <Video size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within/join:text-blue-500 transition-colors" />
                        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all shadow-lg active:scale-95">
                           <ArrowRight size={18} />
                        </button>
                        <span className="absolute -top-6 left-2 text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest">Meeting Portal</span>
                     </form>

                     <form onSubmit={handleJoinTeam} className="relative group/join-team">
                        <input 
                          type="text"
                          placeholder="Enter Workspace Code..."
                          value={joinTeamCode}
                          onChange={(e) => setJoinTeamCode(e.target.value)}
                          className="w-full bg-muted border border-border rounded-2xl py-4 pl-12 pr-4 text-xs focus:outline-none focus:border-blue-500/50 focus:bg-muted/80 transition-all font-bold placeholder:text-muted-foreground/30 text-foreground shadow-sm"
                        />
                        <Layout size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within/join-team:text-blue-500 transition-colors" />
                        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-500 transition-all shadow-lg active:scale-95">
                           <ArrowRight size={18} />
                        </button>
                        <span className="absolute -top-6 left-2 text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest">Collab Infrastructure</span>
                     </form>
                     
                     <div className="grid grid-cols-2 gap-4">
                       <button 
                         onClick={() => setShowCreateModal(true)}
                         className="flex items-center justify-center gap-3 bg-blue-600 text-white py-4 rounded-2xl font-black text-[10px] tracking-widest hover:bg-blue-500 transition-all active:scale-95 shadow-lg group"
                       >
                         <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                         DEPLOY
                       </button>
                       <button 
                         onClick={() => setShowChat(!showChat)}
                         className={`flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-[10px] tracking-widest transition-all active:scale-95 border ${
                           showChat ? 'bg-blue-600 text-white border-blue-500' : 'bg-muted text-foreground border-border hover:bg-muted/80'
                         }`}
                       >
                         <MessageSquare size={18} />
                         TEAM CHAT
                       </button>
                     </div>

                     <div className="pt-4 border-t border-border space-y-3">
                         <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2 font-mono">Workspaces</h4>
                         {projects.length > 0 ? projects.map(p => (
                            <a 
                              key={p._id}
                              href={`#/projects/${p._id}`} 
                              className="flex items-center justify-between p-4 bg-muted/50 hover:bg-card rounded-2xl transition-all group border border-border"
                            >
                               <div className="flex items-center gap-3">
                                 <div className="p-2 bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-lg group-hover:bg-violet-600 group-hover:text-white transition-all">
                                    <Layout size={16} />
                                 </div>
                                 <div className="flex flex-col">
                                    <span className="text-xs font-black truncate text-foreground uppercase tracking-tight">{(p as any).name}</span>
                                    <span className="text-[8px] font-bold text-muted-foreground/60 uppercase">Code: {(p as any).team?.joinCode || 'N/A'}</span>
                                 </div>
                               </div>
                               <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-foreground" />
                            </a>
                         )) : (
                            <div className="p-4 text-center border border-dashed border-border rounded-2xl">
                               <p className="text-[10px] text-muted-foreground font-bold uppercase">No active projects</p>
                            </div>
                         )}
                      </div>
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
                  History
                  <div className="h-px w-20 bg-gradient-to-r from-blue-500/20 to-transparent" />
                </h2>
                <div className="relative group/search w-full sm:w-64">
                   <input 
                     type="text" 
                     placeholder="Search Sessions..." 
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full bg-card border border-border rounded-2xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-blue-500/50 transition-all font-bold"
                   />
                   <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within/search:text-blue-500 transition-colors" />
                </div>
              </div>

              {isLoading ? (
                <div className="space-y-4">
                   {[1,2,3].map(i => <div key={i} className="h-28 sm:h-32 bg-card rounded-[32px] animate-pulse border border-border" />)}
                </div>
              ) : meetings.length === 0 ? (
                <div className="bg-card border border-border border-dashed rounded-[48px] p-12 sm:p-24 text-center flex flex-col items-center justify-center shadow-sm">
                   <div className="w-20 h-20 bg-blue-600/10 rounded-[32px] flex items-center justify-center mb-8 border border-blue-500/20 group hover:border-blue-500/40 transition-colors cursor-pointer">
                      <Video size={32} className="text-blue-600 group-hover:scale-110 transition-transform" />
                   </div>
                   <h3 className="text-xl sm:text-2xl font-black mb-3">No Active Channels</h3>
                   <p className="text-muted-foreground text-sm sm:text-base max-w-[280px] leading-relaxed mb-10 font-medium">Your organization&apos;s stream is empty. Start a session to begin.</p>
                   <button 
                     onClick={() => setShowCreateModal(true)}
                     className="px-10 py-4 bg-blue-600 text-white hover:bg-blue-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg"
                   >
                     Initialize First Room
                   </button>
                </div>
              ) : (
                <div className="grid gap-5">
                   {meetings
                    .filter(m => 
                      m.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      m.meetingCode.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((meeting) => (
                    <article key={meeting.meetingCode} className="group relative bg-card border border-border hover:bg-card/80 hover:border-blue-500/30 p-5 sm:p-6 rounded-[32px] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6 overflow-hidden shadow-sm hover:shadow-md">
                       <div className="absolute -top-12 -right-12 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                       
                       <div className="flex items-center gap-5 sm:gap-6 min-w-0 relative z-10">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-500/5 rounded-2xl flex items-center justify-center border border-border flex-shrink-0 group-hover:scale-105 transition-all">
                           <Video className="text-blue-600 group-hover:text-blue-500 transition-colors" size={26} />
                        </div>
                        <div className="min-w-0 space-y-1.5">
                          <h3 className="font-black text-lg sm:text-xl truncate group-hover:text-blue-600 transition-colors uppercase tracking-tight text-foreground">{meeting.title}</h3>
                          <div className="flex flex-wrap items-center gap-3">
                             <span className="text-[10px] text-blue-600 font-black tracking-widest font-mono bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">{meeting.meetingCode}</span>
                             <div className="w-1 h-1 bg-border rounded-full" />
                             <span className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.15em] flex items-center gap-1.5 whitespace-nowrap">
                                 <Clock size={12} className="text-muted-foreground/50" />
                                 {new Date(meeting.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                             {meeting.sentiment && (
                               <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${ 
                                 meeting.sentiment === 'positive' ? 'bg-green-500/10 text-green-600 border-green-500/20' : 
                                 meeting.sentiment === 'negative' ? 'bg-red-500/10 text-red-600 border-red-500/20' : 
                                 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                               }`}>
                                 {meeting.sentiment}
                               </span>
                             )}
                          </div>
                          {meeting.summary && (
                            <p className="text-[11px] text-muted-foreground line-clamp-1 mt-2 max-w-sm">
                              <span className="text-blue-600 font-black mr-2 uppercase tracking-tighter">AI Summary:</span>
                              {meeting.summary}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 relative z-10">
                        {meeting.summary && (
                          <button 
                            onClick={() => setSelectedMeeting(meeting)}
                            className="bg-muted text-foreground hover:bg-muted/80 px-6 py-4 sm:py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-border"
                          >
                            Intelligence
                          </button>
                        )}
                        <a 
                          href={`#/meeting/${meeting.meetingCode}`}
                          className="w-full sm:w-auto text-center bg-blue-600 text-white hover:bg-blue-500 px-8 py-4 sm:py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95"
                        >
                          Launch Visuals
                        </a>
                      </div>
                    </article>
                   ))}
                </div>
              )}
           </div>

           {/* Stats/Calendar Sidebar */}
           <div className="space-y-10 sm:space-y-12">
              <div className="space-y-8">
                <h2 className="text-xl sm:text-2xl font-black flex items-center gap-4">
                  Intelligence
                  <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
                </h2>

                <div className="bg-gradient-to-br from-blue-600/40 via-violet-600/40 to-transparent p-[1px] rounded-[48px] group transition-all shadow-xl">
                   <div className="bg-card rounded-[47px] p-8 sm:p-10 h-full relative overflow-hidden backdrop-blur-3xl shadow-inner">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2" />
                      
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                           <div className="p-3.5 bg-blue-500/10 w-fit rounded-2xl border border-blue-500/20">
                              <Activity size={24} className="text-blue-600 dark:text-blue-400" />
                           </div>
                           <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Efficiency Protocol</span>
                        </div>
                        
                        <h3 className="text-xl font-black mb-2 tracking-tight uppercase text-foreground">Performance Velocity</h3>
                        <PerformanceChart data={performanceData} />
                        
                        <div className="grid grid-cols-2 gap-4 mt-8">
                           <div className="bg-muted p-4 rounded-2xl border border-border">
                              <span className="block text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Weekly Delta</span>
                              <span className="text-lg font-black text-green-600">+24.8%</span>
                           </div>
                           <div className="bg-muted p-4 rounded-2xl border border-border">
                              <span className="block text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Optimization</span>
                              <span className="text-lg font-black text-blue-600">Stable</span>
                           </div>
                        </div>
                      </div>
                   </div>
                </div>

                <div className="bg-card border border-border rounded-[40px] p-8 sm:p-10 relative overflow-hidden shadow-sm">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-8 flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#50e3c2] animate-pulse shadow-[0_0_8px_#50e3c2]" />
                      Deployment Nodes
                   </h3>
                   <div className="space-y-8">
                      <StatusItem label="Signal Relay L1" status="Active" active icon={<Globe size={14} />} />
                      <StatusItem label="Inference Engine" status="Online" active icon={<Zap size={14} />} />
                      <StatusItem label="Media Edge NYC" status="Idle" active={false} icon={<Activity size={14} />} />
                   </div>
                </div>
              </div>
           </div>
        </div>
      </main>

      {/* Team Chat Slide-over */}
      {showChat && activeTeamId && (
        <div className="fixed inset-y-0 right-0 z-[120] flex">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowChat(false)} />
          <TeamChat 
            teamId={activeTeamId} 
            teamName={projects.find(p => p.team === activeTeamId)?.name || 'Team'} 
            onClose={() => setShowChat(false)} 
          />
        </div>
      )}

      {/* Create Project Modal */}
      {isCreatingProject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-background/80 backdrop-blur-2xl animate-fade-in transition-colors duration-300">
          <div className="bg-card border border-border rounded-[48px] p-8 sm:p-12 w-full max-w-xl shadow-2xl relative overflow-hidden text-foreground">
             <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl font-black tracking-tighter uppercase">New Project</h2>
                <button onClick={() => setIsCreatingProject(false)} className="p-4 bg-muted hover:bg-muted/80 rounded-2xl text-muted-foreground transition-all">
                   <Plus size={24} className="rotate-45" />
                </button>
             </div>
             <form onSubmit={handleCreateProject} className="space-y-8">
                <div className="space-y-3">
                   <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 ml-1">Board Name</label>
                   <input 
                     autoFocus
                     required
                     type="text"
                     placeholder="e.g. Q2 Strategic Roadmap"
                     value={newProjectName}
                     onChange={(e) => setNewProjectName(e.target.value)}
                     className="w-full bg-muted border border-border rounded-2xl p-5 text-lg text-foreground focus:outline-none focus:border-blue-500 focus:bg-muted/80 transition-all font-bold"
                   />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:bg-blue-500 transition-all shadow-lg">
                   INITIALIZE WORKSPACE
                </button>
             </form>
          </div>
        </div>
      )}

      {/* Create Meeting Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-background/80 backdrop-blur-2xl animate-fade-in transition-colors duration-300">
          <div className="bg-card border border-border rounded-[48px] p-8 sm:p-12 w-full max-w-xl shadow-2xl relative overflow-hidden">
            <div className="absolute -top-32 -right-32 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px]" />
            
            <div className="relative z-10 text-foreground">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="text-3xl sm:text-4xl font-black mb-2 tracking-tighter uppercase text-foreground">Initialize</h2>
                  <p className="text-muted-foreground text-sm font-medium tracking-wide">Configure a high-performance meeting node.</p>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="p-4 bg-muted hover:bg-red-500/10 hover:text-red-500 rounded-2xl text-muted-foreground transition-all border border-border hover:border-red-500/20 group">
                   <Plus className="rotate-45 group-hover:rotate-[135deg] transition-transform" size={24} />
                </button>
              </div>
              
              <form onSubmit={handleCreateMeeting} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 ml-1">Instance Identifier</label>
                  <input 
                    autoFocus
                    required
                    type="text"
                    placeholder="e.g. ALPHA_CLUSTER_01"
                    value={newMeeting.title}
                    onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                    className="w-full bg-muted border border-border rounded-2xl p-5 text-lg text-foreground focus:outline-none focus:border-blue-500 focus:bg-muted/80 transition-all font-bold placeholder:text-muted-foreground/30"
                  />
                </div>
                
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 ml-1">Briefing Scope</label>
                  <textarea 
                    rows={2}
                    placeholder="Strategic alignment for next sprint..."
                    value={newMeeting.description}
                    onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })}
                    className="w-full bg-muted border border-border rounded-2xl p-5 text-sm text-foreground focus:outline-none focus:border-blue-500 focus:bg-muted/80 transition-all font-medium resize-none placeholder:text-muted-foreground/30"
                  />
                </div>

                <div className="flex gap-4 pt-6">
                  <button 
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-5 sm:py-6 rounded-2xl font-black text-xs sm:text-sm tracking-[0.3em] uppercase hover:bg-blue-500 transition-all shadow-lg active:scale-[0.98]"
                  >
                    DEPLOY NODE
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Meeting Intelligence Modal */}
      {selectedMeeting && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 bg-background/90 backdrop-blur-3xl animate-fade-in transition-colors duration-300">
          <div className="bg-card border border-border rounded-[48px] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative text-foreground">
            <div className="p-8 sm:p-12 border-b border-border flex items-center justify-between bg-muted/50">
               <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest">Post-Session Intelligence</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{selectedMeeting.meetingCode}</span>
                  </div>
                  <h2 className="text-3xl font-black tracking-tighter uppercase text-foreground">{selectedMeeting.title}</h2>
               </div>
               <button onClick={() => setSelectedMeeting(null)} className="p-4 bg-muted hover:bg-red-500/10 hover:text-red-500 rounded-2xl text-muted-foreground transition-all border border-border">
                  <Plus className="rotate-45" size={24} />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 sm:p-12 space-y-12">
               {/* Sentiment & Quick Stats */}
               <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-muted border border-border p-6 rounded-[32px] flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Tone Analysis</span>
                    <div className={`p-4 rounded-2xl mb-2 ${
                      selectedMeeting.sentiment === 'positive' ? 'bg-green-500/10 text-green-600' :
                      selectedMeeting.sentiment === 'negative' ? 'bg-red-500/10 text-red-600' :
                      selectedMeeting.sentiment === 'mixed' ? 'bg-orange-500/10 text-orange-600' :
                      'bg-blue-500/10 text-blue-600'
                    }`}>
                      <Activity size={32} />
                    </div>
                    <span className="text-xl font-black uppercase tracking-tighter text-foreground">
                      {selectedMeeting.sentiment || 'Analyzing...'}
                    </span>
                  </div>

                  <div className="md:col-span-2 bg-muted border border-border p-6 rounded-[32px] space-y-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Key Highlights</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedMeeting.highlights?.map((h, i) => (
                        <span key={i} className="px-3 py-1.5 bg-card border border-border rounded-xl text-xs font-medium text-foreground">
                          {h}
                        </span>
                      )) || <span className="text-muted-foreground italic text-sm">No highlights available yet.</span>}
                    </div>
                  </div>
               </section>

               {/* Summary Section */}
               <section className="space-y-6">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 flex items-center gap-3">
                    <Layout size={14} /> Executive Summary
                  </h3>
                  <div className="bg-muted border border-border p-8 rounded-[32px] relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl" />
                     <p className="text-foreground leading-relaxed text-lg font-medium relative z-10 transition-colors">
                        {selectedMeeting.summary || 'Summary not generated yet. Click analyze to process the transcript.'}
                     </p>
                  </div>
               </section>

               {/* Action Items Section */}
               {selectedMeeting.actionItems && selectedMeeting.actionItems.length > 0 && (
                 <section className="space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-600 flex items-center gap-3">
                      <Plus size={14} /> Action Items
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {selectedMeeting.actionItems.map((item, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => handleToggleActionItem(idx)}
                            className={`p-6 rounded-3xl flex items-start gap-4 transition-all shadow-sm cursor-pointer border ${
                              item.status === 'completed' ? 'bg-green-500/5 border-green-500/20' : 'bg-muted border-border hover:bg-card'
                            }`}
                          >
                             <div className={`w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 mt-1 transition-all ${
                               item.status === 'completed' ? 'bg-green-500 border-green-500 text-white' : 'bg-violet-500/10 border-violet-500/30 text-violet-600'
                             }`}>
                                {item.status === 'completed' ? <ShieldCheck size={12} /> : <ArrowRight size={12} />}
                             </div>
                             <div className="space-y-1">
                                <p className={`text-sm font-bold transition-colors ${item.status === 'completed' ? 'text-green-600 line-through opacity-60' : 'text-foreground'}`}>{item.task}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground truncate">Assignee: {item.suggestedAssignee}</p>
                             </div>
                          </div>
                       ))}
                    </div>
                 </section>
               )}

               {/* Full Transcript Preview */}
               <section className="space-y-6">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-3">
                    <Clock size={14} /> Transcript Stream
                  </h3>
                  <div className="bg-muted border border-border p-8 rounded-[32px] h-60 overflow-y-auto scrollbar-hide shadow-inner">
                     <p className="text-xs text-muted-foreground leading-loose font-mono">{selectedMeeting.transcript || 'No transcript data available.'}</p>
                  </div>
               </section>
            </div>

            <div className="p-8 border-t border-border bg-muted/50 flex flex-col sm:flex-row gap-4">
               {!selectedMeeting.summary && (
                 <button 
                   onClick={() => handleAnalyzeMeeting(selectedMeeting._id)}
                   className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black text-[10px] tracking-[0.2em] uppercase transition-all hover:bg-blue-500 active:scale-95 flex items-center justify-center gap-2"
                 >
                   <Zap size={14} />
                   INITIALIZE AI ANALYSIS
                 </button>
               )}
               
               {selectedMeeting.summary && (
                 <button 
                   onClick={() => generateMeetingReport(selectedMeeting)}
                   className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black text-[10px] tracking-[0.2em] uppercase transition-all hover:bg-blue-500 active:scale-95 flex items-center justify-center gap-2"
                 >
                   <FileText size={14} />
                   EXPORT PDF Dossier
                 </button>
               )}
               
               {projects.length > 0 && selectedMeeting.actionItems && selectedMeeting.actionItems.length > 0 && (
                 <div className="flex-1 flex gap-2">
                    <select 
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      className="bg-muted border border-border rounded-2xl px-4 py-3 text-xs font-bold text-foreground focus:outline-none focus:border-blue-500 transition-all font-mono"
                    >
                      {projects.map(p => (
                        <option key={p._id} value={p._id} className="bg-card text-foreground">
                          Push to: {p.name}
                        </option>
                      ))}
                    </select>
                    <button 
                      onClick={handlePushToProject}
                      disabled={isPushing}
                      className="flex-1 bg-violet-600 text-white py-4 rounded-2xl font-black text-[10px] tracking-[0.2em] uppercase transition-all hover:bg-violet-500 active:scale-95 disabled:opacity-50 inline-flex items-center justify-center gap-2 shadow-lg"
                    >
                      <Plus size={14} />
                      {isPushing ? 'DEPLOYING...' : 'PUSH TO BOARD'}
                    </button>
                 </div>
               )}
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
           animation: gradient-x 6s ease;
           animation-iteration-count: infinite;
         }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  )
}

function StatusItem({ label, status, active, icon }: { label: string, status: string, active: boolean, icon?: React.ReactNode }) {
   return (
      <div className="flex items-center justify-between group cursor-help transition-colors">
         <div className="flex items-center gap-3">
            <span className="text-muted-foreground/60 group-hover:text-blue-500 transition-colors uppercase">{icon}</span>
            <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] group-hover:text-foreground transition-colors">{label}</span>
         </div>
         <div className="flex items-center gap-3 bg-muted/50 px-3 py-1.5 rounded-xl border border-border group-hover:border-blue-500/30 transition-colors">
            <span className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-[#50e3c2]' : 'text-orange-400'}`}>{status}</span>
            <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-[#50e3c2] shadow-[0_0_10px_#50e3c2]' : 'bg-orange-500 animate-pulse'}`} />
         </div>
      </div>
   )
}
