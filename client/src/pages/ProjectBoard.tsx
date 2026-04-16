import { useState, useEffect } from 'react'
import { Plus, MoreVertical, Calendar, User, ArrowRight, Layout, Search, Filter, Settings, ShieldCheck } from 'lucide-react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import api from '../utils/api'
import { useParams } from 'react-router-dom'
import { socket, connectSocket } from '../utils/socket'

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
}

const COLUMNS = [
  { id: 'todo', title: 'To Do', color: 'bg-blue-500' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-yellow-500' },
  { id: 'done', title: 'Done', color: 'bg-green-500' },
]

export default function ProjectBoard() {
  const { projectId } = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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

  if (isLoading) return <div className="h-screen bg-[#030507] flex items-center justify-center"><div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>

  const getTasksByStatus = (status: string) => project?.tasks.filter(t => t.status === status) || []

  return (
    <div className="min-h-screen bg-[#030507] text-white font-sans selection:bg-blue-500/30">
      <header className="h-20 border-b border-white/5 bg-white/2 backdrop-blur-xl sticky top-0 z-50 px-8 flex items-center justify-between">
         <div className="flex items-center gap-6">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-violet-600 rounded-2xl shadow-lg shadow-blue-600/20">
               <Layout size={20} />
            </div>
            <div>
               <h1 className="text-xl font-black tracking-tighter uppercase">{project?.name || 'Workspace Board'}</h1>
               <p className="text-[10px] text-white/30 font-black uppercase tracking-widest flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                 Active Sector
               </p>
            </div>
         </div>

         <div className="flex items-center gap-4">
            <div className="relative group hidden sm:block">
               <input 
                 type="text" 
                 placeholder="Search Tasks..." 
                 className="bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-blue-500/50 w-64 transition-all"
               />
               <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <button 
              onClick={() => window.location.hash = '#/dashboard'}
              className="px-6 py-2.5 bg-blue-600 text-white hover:bg-blue-500 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20"
            >
               Return Dashboard
            </button>
         </div>
      </header>

      <main className="p-8">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start max-w-7xl mx-auto">
            {COLUMNS.map(column => (
              <Droppable key={column.id} droppableId={column.id}>
                {(provided, snapshot) => (
                  <div 
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`flex flex-col gap-6 p-4 rounded-[40px] transition-all min-h-[500px] border border-transparent ${snapshot.isDraggingOver ? 'bg-white/[0.03] border-white/5' : ''}`}
                  >
                    <div className="flex items-center justify-between px-4">
                       <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${column.color}`} />
                          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white/40">{column.title}</h2>
                          <span className="text-[10px] font-mono text-white/10 bg-white/5 px-2 py-0.5 rounded-md">{getTasksByStatus(column.id).length}</span>
                       </div>
                    </div>

                    <div className="space-y-4">
                      {getTasksByStatus(column.id).map((task, index) => (
                        <Draggable key={task._id} draggableId={task._id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-[#0d121f] border border-white/5 p-6 rounded-[32px] group hover:border-blue-500/30 transition-all shadow-xl ${snapshot.isDragging ? 'shadow-2xl shadow-blue-600/20 scale-[1.02] border-blue-500/50 z-50' : ''}`}
                            >
                               <div className="flex justify-between items-start mb-4">
                                  <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                                    task.priority === 'high' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                                    task.priority === 'medium' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 
                                    'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                  }`}>
                                    {task.priority}
                                  </span>
                                  {task.status === 'done' && <ShieldCheck size={14} className="text-green-500" />}
                               </div>
                               
                               <h3 className={`text-sm font-bold text-white/90 mb-5 leading-relaxed ${task.status === 'done' ? 'line-through opacity-50' : ''}`}>{task.title}</h3>
                               
                               <div className="flex items-center justify-between border-t border-white/5 pt-4">
                                  <div className="flex items-center gap-2">
                                     <div className="w-6 h-6 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center overflow-hidden">
                                        <User size={12} className="text-blue-400" />
                                     </div>
                                     <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{task.assignee?.name || 'Unassigned'}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-white/20">
                                     <Calendar size={12} />
                                     <span className="text-[9px] font-black">2d</span>
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

      <style dangerouslySetInnerHTML={{ __html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  )
}
