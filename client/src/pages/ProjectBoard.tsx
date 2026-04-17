import React, { useState, useEffect } from 'react'
import { Plus, Calendar, User, Layout, Search, ShieldCheck, MessageSquare, X, CheckCircle2, Circle, Clock, MoreVertical, Briefcase, Filter, ChevronRight, AlertCircle } from 'lucide-react'
import api from '../utils/api'
import { useParams } from 'react-router-dom'
import { socket, connectSocket } from '../utils/socket'
import TeamChat from '../components/TeamChat'
import { useAuthStore } from '../store/useAuthStore'

interface Task {
  _id: string
  title: string
  description?: string
  status: string
  priority: 'low' | 'medium' | 'high'
  assignee?: {
    _id: string
    name: string
    avatar?: string
  }
}

interface Project {
  _id: string
  name: string
  tasks: Task[]
  team?: {
    _id: string
    name: string
    owner: string
    members: Array<{
      user: {
        _id: string
        name: string
        avatar?: string
      }
      role: string
    }>
  }
}

export default function ProjectBoard({ projectId: propProjectId }: { projectId?: string }) {
  const { user: currentUser } = useAuthStore()
  const { projectId: urlProjectId } = useParams()
  const projectId = propProjectId || urlProjectId;
  
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showChat, setShowChat] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [viewMode, setViewMode] = useState<'all' | 'my'>('all')
  
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', assigneeId: '' })

  const isAdmin = project?.team?.owner === currentUser?._id || project?.team?.members.find(m => m.user._id === currentUser?._id)?.role === 'Admin'

  useEffect(() => {
    fetchProject();
    connectSocket();
    socket.emit('join-project', projectId);

    socket.on('task-added-sync', (updatedProject: Project) => {
      setProject(updatedProject);
    });

    socket.on('task-updated-sync', (updatedProject: Project) => {
      setProject(updatedProject);
    });

    return () => {
      socket.off('task-added-sync');
      socket.off('task-updated-sync');
    };
  }, [projectId]);

  useEffect(() => {
    if (project && !isAdmin && viewMode === 'all') {
      setViewMode('my')
    }
  }, [project, isAdmin])

  const fetchProject = async () => {
    if (!projectId) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await api.get(`/projects/${projectId}`);
      setProject(res.data);
    } catch (err) {
      console.error('Failed to fetch project', err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title) return;
    try {
      const res = await api.post(`/projects/${projectId}/tasks`, {
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        assignee: newTask.assigneeId
      });
      setProject(res.data);
      setShowAssignModal(false);
      setNewTask({ title: '', description: '', priority: 'medium', assigneeId: '' });
      socket.emit('task-added', { projectId, project: res.data });
    } catch (err) {
      console.error('Failed to create task', err);
    }
  }

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const res = await api.put(`/projects/${projectId}/tasks/${taskId}`, { status: newStatus });
      setProject(res.data);
      socket.emit('task-updated', { projectId, project: res.data });
    } catch (err) {
      console.error('Failed to update status', err);
    }
  }

  if (isLoading) return (
    <div className="h-screen bg-background flex flex-col items-center justify-center gap-6">
      <div className="w-16 h-16 border-[6px] border-blue-600 border-t-transparent rounded-full animate-spin shadow-xl shadow-blue-600/10" />
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground animate-pulse">Building Workspace</p>
    </div>
  )

  const activeMyTasks = project?.tasks.filter(t => t.assignee?._id === currentUser?._id && t.status !== 'done') || []

  const tasksByAssignee = project?.team?.members.reduce((acc, member) => {
    acc[member.user._id] = project.tasks.filter(t => t.assignee?._id === member.user._id);
    return acc;
  }, {} as Record<string, Task[]>) || {}

  const unassignedTasks = project?.tasks.filter(t => !t.assignee) || []

  return (
    <div className="h-screen flex flex-col bg-background text-foreground font-sans selection:bg-blue-600/20 overflow-hidden">
      {/* Immersive Header */}
      <header className="h-20 sm:h-24 border-b border-border bg-background/80 backdrop-blur-2xl sticky top-0 z-50 px-3 sm:px-12 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-8">
             <div className="p-2 sm:p-3.5 bg-gradient-to-br from-blue-600 to-violet-600 rounded-[15px] sm:rounded-[22px] shadow-xl shadow-blue-600/20">
                <Briefcase size={16} className="text-white sm:w-5 sm:h-5" />
             </div>
             <div className="min-w-0">
                <h1 className="text-sm sm:text-2xl font-black tracking-tight uppercase leading-none truncate max-w-[100px] xs:max-w-[160px] sm:max-w-none">{project?.name || 'Task Controller'}</h1>
                <p className="text-[7px] sm:text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em] flex items-center gap-1.5 mt-1 sm:mt-2">
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-green-500 animate-pulse border border-green-400/50" />
                  Management Hub
                </p>
             </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-6">
             <button 
               onClick={() => setShowChat(!showChat)}
               className={`p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl transition-all shadow-lg active:scale-95 border ${
                 showChat ? 'bg-blue-600 text-white border-blue-500 shadow-blue-600/20' : 'bg-muted text-foreground border-border hover:bg-muted/80 shadow-inner'
               }`}
               title="Team Chat"
             >
                <MessageSquare size={16} className="sm:w-[18px] sm:h-[18px]" />
             </button>

             <button 
               onClick={() => window.location.hash = '#/dashboard'}
               className="px-3 sm:px-6 py-2.5 sm:py-3.5 bg-muted text-foreground hover:bg-muted/80 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest transition-all border border-border"
             >
                Dashboard
             </button>
          </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 sm:p-12 scroll-smooth">
          <div className="max-w-[1400px] mx-auto space-y-12">
            
            {/* View Selection & Stats */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-border/50">
               <div className="space-y-4">
                  <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">Project <span className="text-blue-600">Operations</span></h2>
                  <div className="flex items-center gap-2">
                     <button 
                       onClick={() => setViewMode('all')}
                       className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'all' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}
                     >
                        Team Distribution
                     </button>
                     
                     {isAdmin ? (
                        <button 
                          onClick={() => setShowAssignModal(true)}
                          className="px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-600/20 hover:scale-105 active:scale-95 transition-all border border-white/10 flex items-center gap-2"
                        >
                           <Plus size={12} />
                           Assign New Task
                        </button>
                     ) : (
                        <button 
                          onClick={() => setViewMode('my')}
                          className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'my' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}
                        >
                           My Assignments
                        </button>
                     )}
                  </div>
               </div>
               
               <div className="grid grid-cols-2 sm:flex gap-4">
                  <div className="bg-muted/30 border border-border p-4 rounded-3xl flex flex-col items-center justify-center min-w-[100px]">
                     <span className="text-2xl font-black text-blue-600">{project?.tasks.length}</span>
                     <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Total Units</span>
                  </div>
                  <div className="bg-muted/30 border border-border p-4 rounded-3xl flex flex-col items-center justify-center min-w-[100px]">
                     <span className="text-2xl font-black text-green-500">{project?.tasks.filter(t => t.status === 'done').length}</span>
                     <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Completed</span>
                  </div>
               </div>
            </div>

            {/* Tasks Container */}
            <div className="space-y-16">
              {viewMode === 'all' ? (
                <>
                  {/* Unassigned Work (Visible to Admin) */}
                  {isAdmin && unassignedTasks.length > 0 && (
                    <section className="space-y-6">
                      <div className="flex items-center gap-4 px-2">
                        <AlertCircle className="text-orange-500" size={20} />
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">Pending Distribution</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         {unassignedTasks.map(task => (
                           <TaskCard key={task._id} task={task} onStatusUpdate={updateTaskStatus} isAdmin={isAdmin} />
                         ))}
                      </div>
                    </section>
                  )}

                  {/* Team Workload */}
                  {project?.team?.members.map(member => {
                    const userTasks = tasksByAssignee[member.user._id] || []
                    return (
                      <section key={member.user._id} className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center overflow-hidden">
                               {member.user.avatar ? <img src={member.user.avatar} alt="" className="w-full h-full object-cover" /> : <User size={18} className="text-blue-600" />}
                            </div>
                            <div>
                               <h3 className="text-xs font-black uppercase tracking-widest">{member.user.name}</h3>
                               <p className="text-[9px] font-black uppercase text-blue-600/60 leading-none mt-1">{member.role} {member.user._id === currentUser?._id && '(You)'}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-black text-muted-foreground bg-muted/50 px-3 py-1 rounded-full uppercase tracking-widest">{userTasks.length} Tasks</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                           {userTasks.length > 0 ? (
                             userTasks.map(task => (
                               <TaskCard key={task._id} task={task} onStatusUpdate={updateTaskStatus} isAdmin={isAdmin} />
                             ))
                           ) : (
                             <div className="col-span-full py-8 px-10 bg-muted/5 rounded-[40px] border border-dashed border-border flex flex-col items-center justify-center gap-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">No active assignments</p>
                             </div>
                           )}
                        </div>
                      </section>
                    )
                  })}
                </>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {activeMyTasks.length ? activeMyTasks.map(task => (
                      <TaskCard key={task._id} task={task} onStatusUpdate={updateTaskStatus} isAdmin={isAdmin} />
                   )) : (
                     <div className="col-span-full py-20 bg-muted/5 rounded-[40px] border border-dashed border-border flex flex-col items-center justify-center gap-6">
                        <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center text-muted-foreground/20">
                           <ShieldCheck size={32} />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Your active queue is clear</p>
                        <p className="text-[8px] font-black uppercase tracking-widest text-blue-600/40">Check Team Distribution for completed work</p>
                     </div>
                   )}
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Dynamic Sidebar Toggle (Desktop Only) */}
        {showChat && project?.team && (
          <div className="hidden xl:block w-96 flex-shrink-0 border-l border-border bg-card animate-in slide-in-from-right duration-300">
            <TeamChat 
              teamId={project.team._id} 
              teamName={project.team.name} 
              onClose={() => setShowChat(false)} 
            />
          </div>
        )}

        {/* Mobile/Tablet Slide-over Chat */}
        {showChat && project?.team && (
          <div className="xl:hidden fixed inset-0 z-[100] flex justify-end">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowChat(false)} />
            <TeamChat 
              teamId={project.team._id} 
              teamName={project.team.name} 
              onClose={() => setShowChat(false)} 
            />
          </div>
        )}
      </div>

      {/* Assign Task Modal */}
      {showAssignModal && project?.team && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowAssignModal(false)} />
           <div className="bg-card w-full max-w-xl rounded-[40px] border border-border shadow-2xl relative z-10 p-8 sm:p-12 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-10">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600 rounded-2xl text-white">
                       <Plus size={20} />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">Assign <span className="text-blue-600">Task</span></h2>
                 </div>
                 <button onClick={() => setShowAssignModal(false)} className="p-2.5 hover:bg-muted rounded-xl transition-colors">
                    <X size={20} />
                 </button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Objective Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Implement Auth Redux Logics"
                      className="w-full bg-muted/50 border border-border rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all"
                      value={newTask.title}
                      onChange={e => setNewTask({...newTask, title: e.target.value})}
                    />
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Work Description</label>
                    <textarea 
                      placeholder="Explain the technical scope..."
                      rows={3}
                      className="w-full bg-muted/50 border border-border rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all resize-none"
                      value={newTask.description}
                      onChange={e => setNewTask({...newTask, description: e.target.value})}
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Priority</label>
                       <select 
                         className="w-full bg-muted/50 border border-border rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-blue-600/20 outline-none"
                         value={newTask.priority}
                         onChange={e => setNewTask({...newTask, priority: e.target.value as any})}
                       >
                          <option value="low">Standard</option>
                          <option value="medium">Important</option>
                          <option value="high">Critical</option>
                       </select>
                    </div>

                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Assign User</label>
                       <select 
                         className="w-full bg-muted/50 border border-border rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-blue-600/20 outline-none"
                         value={newTask.assigneeId}
                         onChange={e => setNewTask({...newTask, assigneeId: e.target.value})}
                       >
                          <option value="">Pending Assignment</option>
                          {project.team.members.map(m => (
                            <option key={m.user._id} value={m.user._id}>{m.user.name}</option>
                          ))}
                       </select>
                    </div>
                 </div>

                 <button 
                   type="submit"
                   className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-500 active:scale-95 transition-all mt-4"
                 >
                    Confirm Assignment
                 </button>
              </form>
           </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  )
}

function TaskCard({ task, onStatusUpdate, isAdmin }: { task: Task, onStatusUpdate: (id: string, s: string) => void, isAdmin: boolean }) {
  return (
    <div className={`group bg-card border border-border p-8 rounded-[40px] hover:border-blue-500/40 transition-all shadow-xl hover:shadow-2xl relative overflow-hidden ${task.status === 'done' ? 'opacity-60' : ''}`}>
       <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-2">
             <div className={`w-2 h-2 rounded-full ${task.status === 'done' ? 'bg-green-500' : task.status === 'in-progress' ? 'bg-yellow-500' : 'bg-blue-500'} animate-pulse`} />
             <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60">{task.status.replace('-', ' ')}</span>
          </div>
          <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border ${
            task.priority === 'high' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
            task.priority === 'medium' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 
            'bg-blue-500/10 text-blue-500 border-blue-500/20'
          }`}>
            {task.priority === 'high' ? 'CRITICAL' : task.priority === 'medium' ? 'IMPORTANT' : 'STANDARD'}
          </span>
       </div>
       
       <h3 className="text-lg font-black tracking-tight leading-tight mb-4">{task.title}</h3>
       <p className="text-[11px] text-muted-foreground/70 leading-relaxed mb-8 line-clamp-3 font-medium">{task.description || 'No technical walkthrough provided for this objective.'}</p>
       
       <div className="flex items-center justify-between pt-6 border-t border-border/50">
          <div className="flex -space-x-2">
             <div className="w-8 h-8 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center overflow-hidden ring-4 ring-card">
               {task.assignee?.avatar ? <img src={task.assignee.avatar} className="w-full h-full object-cover" /> : <User size={14} className="text-blue-600" />}
             </div>
             <div className="px-3 py-1.5 bg-muted/50 rounded-full flex items-center justify-center border border-border ring-4 ring-card">
                <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground truncate max-w-[60px]">{task.assignee?.name || 'Open'}</span>
             </div>
          </div>

          <div className="flex gap-2">
             {task.status === 'todo' && (
               <button 
                 onClick={() => onStatusUpdate(task._id, 'in-progress')}
                 className="p-2.5 bg-blue-600/10 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all border border-blue-600/20"
                 title="Mark as In Progress"
               >
                  <Clock size={16} />
               </button>
             )}
             {task.status === 'in-progress' && (
               <button 
                 onClick={() => onStatusUpdate(task._id, 'done')}
                 className="p-2.5 bg-green-500/10 text-green-500 rounded-xl hover:bg-green-500 hover:text-white transition-all border border-green-500/20"
                 title="Mark as Completed"
               >
                  <CheckCircle2 size={16} />
               </button>
             )}
             {task.status === 'done' && (
               <button 
                 onClick={() => onStatusUpdate(task._id, 'todo')}
                 className="p-2.5 bg-muted text-muted-foreground rounded-xl hover:bg-slate-200 transition-all border border-border"
                 title="Reset Task"
               >
                  <Circle size={16} />
               </button>
             )}
          </div>
       </div>

       {/* Decorative Gradient */}
       <div className={`absolute -bottom-10 -right-10 w-32 h-32 blur-[80px] opacity-10 rounded-full ${task.priority === 'high' ? 'bg-red-600' : 'bg-blue-600'}`} />
    </div>
  )
}
