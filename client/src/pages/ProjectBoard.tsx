import React, { useState, useEffect } from 'react'
import { Plus, Calendar, User, Layout, Search, ShieldCheck, MessageSquare, X } from 'lucide-react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import api from '../utils/api'
import { useParams } from 'react-router-dom'
import { socket, connectSocket } from '../utils/socket'
import TeamChat from '../components/TeamChat'

interface Task {
  _id: string
  title: string
  status: string
  priority: 'low' | 'medium' | 'high'
  assignee?: {
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

const COLUMNS = [
  { id: 'todo', title: 'To Do', color: 'bg-blue-500' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-yellow-500' },
  { id: 'done', title: 'Done', color: 'bg-green-500' },
]

export default function ProjectBoard({ projectId: propProjectId }: { projectId?: string }) {
  const { projectId: urlProjectId } = useParams()
  const projectId = propProjectId || urlProjectId;
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showChat, setShowChat] = useState(false)

  useEffect(() => {
    fetchProject();

    // Socket Setup
    connectSocket();
    socket.emit('join-project', projectId);

    socket.on('task-moved-sync', (result: any) => {
      syncTaskMovement(result);
    });

    socket.on('task-added-sync', (task: Task) => {
      setProject(prev => prev ? { ...prev, tasks: [...prev.tasks, task] } : null);
    });

    return () => {
      socket.off('task-moved-sync');
      socket.off('task-added-sync');
    };
  }, [projectId]);

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

  const syncTaskMovement = (result: any) => {
    const { draggableId, destination } = result;
    setProject(prev => {
      if (!prev) return null;
      const updatedTasks = [...prev.tasks];
      const taskIndex = updatedTasks.findIndex(t => t._id === draggableId);
      if (taskIndex !== -1) {
        updatedTasks[taskIndex].status = destination.droppableId;
      }
      return { ...prev, tasks: updatedTasks };
    });
  }

  const onDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    // Sync to others
    socket.emit('task-moved', { projectId, result });

    // Optimistic UI update
    syncTaskMovement(result);

    try {
      await api.put(`/projects/${projectId}/tasks/${draggableId}`, { status: destination.droppableId })
    } catch (err) {
      console.error('Failed to update task status', err)
      fetchProject() // Rollback on error
    }
  }

  if (isLoading) return (
    <div className="h-screen bg-background flex flex-col items-center justify-center gap-6">
      <div className="w-16 h-16 border-[6px] border-blue-600 border-t-transparent rounded-full animate-spin shadow-xl shadow-blue-600/10" />
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground animate-pulse">Syncing Environment</p>
    </div>
  )

  const getTasksByStatus = (status: string) => project?.tasks.filter(t => t.status === status) || []

  return (
    <div className="h-screen flex flex-col bg-background text-foreground font-sans selection:bg-blue-600/20 overflow-hidden">
      <header className="h-20 sm:h-24 border-b border-border bg-background/80 backdrop-blur-2xl sticky top-0 z-50 px-3 sm:px-12 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-8">
             <div className="p-2 sm:p-3.5 bg-gradient-to-br from-blue-600 to-violet-600 rounded-[15px] sm:rounded-[22px] shadow-xl shadow-blue-600/20">
                <Layout size={16} className="text-white sm:w-5 sm:h-5" />
             </div>
             <div className="min-w-0">
                <h1 className="text-sm sm:text-2xl font-black tracking-tight uppercase leading-none truncate max-w-[100px] xs:max-w-[160px] sm:max-w-none">{project?.name || 'Workspace Board'}</h1>
                <p className="text-[7px] sm:text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em] flex items-center gap-1.5 mt-1 sm:mt-2">
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-blue-500 animate-pulse border border-blue-400/50" />
                  Active Space
                </p>
             </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-6">
             {project?.team && (
               <div className="flex items-center gap-1.5 sm:gap-2 bg-blue-500/10 px-2.5 sm:px-3 py-1.5 rounded-full border border-blue-500/20 active:scale-95 transition-all cursor-pointer hover:bg-blue-500/20 shadow-sm" title="Workspace Members">
                 <User size={12} className="text-blue-600 dark:text-blue-400" />
                 <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400">
                   {project.team.members.length} <span className="hidden xs:inline">Members</span>
                 </span>
               </div>
             )}
             
             <button 
               onClick={() => setShowChat(!showChat)}
               className={`p-2 sm:p-3.5 rounded-xl sm:rounded-2xl transition-all shadow-lg active:scale-95 border ${
                 showChat ? 'bg-blue-600 text-white border-blue-500 shadow-blue-600/20' : 'bg-muted text-foreground border-border hover:bg-muted/80 shadow-inner'
               }`}
               title="Team Chat"
             >
                <MessageSquare size={16} className="sm:w-[18px] sm:h-[18px]" />
             </button>

             <button 
               onClick={() => window.location.hash = '#/dashboard'}
               className="px-3 sm:px-6 py-2.5 sm:py-3.5 bg-blue-600 text-white hover:bg-blue-500 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 active:scale-95 border border-blue-500/50"
             >
                Return
             </button>
          </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 sm:p-12">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-10 items-start max-w-[1700px] mx-auto pb-20">
              {COLUMNS.map(column => (
                <Droppable key={column.id} droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div 
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`flex flex-col gap-6 sm:gap-8 p-4 sm:p-8 rounded-[32px] sm:rounded-[48px] transition-all min-h-[400px] sm:min-h-[600px] border border-transparent ${snapshot.isDraggingOver ? 'bg-muted/60 border-border/50 shadow-inner scale-[1.01]' : 'bg-muted/10'}`}
                    >
                      <div className="flex items-center justify-between px-2">
                         <div className="flex items-center gap-3">
                            <div className={`w-2.5 h-2.5 rounded-full ${column.color} shadow-sm border border-white/20`} />
                            <h2 className="text-xs font-black uppercase tracking-[0.25em] text-foreground/50">{column.title}</h2>
                            <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full">{getTasksByStatus(column.id).length}</span>
                         </div>
                      </div>

                      <div className="space-y-6">
                        {getTasksByStatus(column.id).map((task, index) => (
                          <Draggable key={task._id} draggableId={task._id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-card border border-border p-6 sm:p-8 rounded-[36px] group hover:border-blue-500/40 transition-all shadow-xl ${snapshot.isDragging ? 'shadow-[0_20px_60px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_rgba(37,99,235,0.1)] scale-[1.05] border-blue-500/60 z-50 ring-4 ring-blue-500/5' : ''}`}
                              >
                                 <div className="flex justify-between items-start mb-6">
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border shadow-sm ${
                                      task.priority === 'high' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                                      task.priority === 'medium' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 
                                      'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                    }`}>
                                      {task.priority || 'standard'}
                                    </span>
                                    {task.status === 'done' && <ShieldCheck size={16} className="text-green-500 animate-pulse" />}
                                 </div>
                                 
                                 <h3 className={`text-md sm:text-lg font-black tracking-tight text-foreground/90 mb-8 leading-tight transition-all ${task.status === 'done' ? 'line-through opacity-40' : ''}`}>{task.title}</h3>
                                 
                                 <div className="flex items-center justify-between border-t border-border pt-6 mt-2">
                                    <div className="flex items-center gap-3">
                                       <div className="w-8 h-8 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center overflow-hidden shadow-sm group-hover:scale-110 transition-all">
                                          <User size={14} className="text-blue-600 dark:text-blue-400" />
                                       </div>
                                       <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{task.assignee?.name || 'Unassigned'}</span>
                                    </div>
                                    <div className="group/time flex items-center gap-2 text-muted-foreground/30 hover:text-blue-500 transition-colors">
                                       <Calendar size={12} className="group-hover/time:animate-bounce" />
                                       <span className="text-[9px] font-black tracking-widest uppercase">Target</span>
                                    </div>
                                  </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </DragDropContext>
        </main>

        {/* Integrated Team Chat Sidebar (Desktop) */}
        {showChat && project?.team && (
          <div className="hidden lg:block w-96 flex-shrink-0 border-l border-border bg-card animate-in slide-in-from-right duration-300">
            <TeamChat 
              teamId={project.team._id} 
              teamName={project.team.name} 
              onClose={() => setShowChat(false)} 
            />
          </div>
        )}

        {/* Mobile Slide-over Chat */}
        {showChat && project?.team && (
          <div className="lg:hidden fixed inset-0 z-[100] flex justify-end">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowChat(false)} />
            <TeamChat 
              teamId={project.team._id} 
              teamName={project.team.name} 
              onClose={() => setShowChat(false)} 
            />
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  )
}
