import { useState, useEffect, useRef } from 'react';
import { Edit3, CheckSquare, Plus, User, Target, X, Save } from 'lucide-react';
import { socket } from '../utils/socket';

interface Task {
  id: string;
  title: string;
  assignee: string;
  status: 'pending' | 'completed';
}

interface MeetingCollaborationProps {
  meetingId: string;
  userName: string;
  onClose: () => void;
}

export default function MeetingCollaboration({ meetingId, userName, onClose }: MeetingCollaborationProps) {
  const [activeTab, setActiveTab] = useState<'notes' | 'tasks'>('notes');
  const [notes, setNotes] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const notesTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Request current state from server
    socket.emit('request-collab-state', { meetingId });

    // Socket listeners for sync
    socket.on('note-update', (content: string) => {
      setNotes(content);
    });

    socket.on('tasks-sync', (syncedTasks: Task[]) => {
      setStatusTasks(syncedTasks);
    });

    socket.on('live-task-added', (task: Task) => {
      setTasks((prev) => [...prev, task]);
    });

    return () => {
      socket.off('note-update');
      socket.off('tasks-sync');
      socket.off('live-task-added');
    };
  }, [meetingId]);

  const setStatusTasks = (incomingTasks: Task[]) => {
    setTasks(incomingTasks);
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    setNotes(content);
    setIsSaving(true);

    if (notesTimeoutRef.current) clearTimeout(notesTimeoutRef.current);
    
    notesTimeoutRef.current = setTimeout(() => {
      socket.emit('update-note', { meetingId, content });
      setIsSaving(false);
    }, 1000);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const task = {
      title: newTaskTitle,
      assignee: newTaskAssignee || 'Unassigned',
      status: 'pending' as const
    };

    socket.emit('add-live-task', { meetingId, task });
    setNewTaskTitle('');
    setNewTaskAssignee('');
  };

  return (
    <div className="flex flex-col h-full bg-card border-l border-border w-full sm:w-80 md:w-96 shadow-2xl animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
            <Target size={18} />
          </div>
          <div>
            <h3 className="font-black text-sm uppercase tracking-tighter text-foreground">Collaboration</h3>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Real-time Sync</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground">
          <X size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex p-2 bg-muted/20 border-b border-border">
        <button 
          onClick={() => setActiveTab('notes')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'notes' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
        >
          <Edit3 size={14} /> Shared Notes
        </button>
        <button 
          onClick={() => setActiveTab('tasks')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'tasks' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
        >
          <CheckSquare size={14} /> Meeting Tasks
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
        {activeTab === 'notes' ? (
          <div className="h-full flex flex-col space-y-4">
            <div className="flex items-center justify-between">
               <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Collaborative Notepad</span>
               {isSaving && (
                 <span className="flex items-center gap-1.5 text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                    <Save size={10} className="animate-bounce" /> Syncing...
                 </span>
               )}
            </div>
            <textarea 
              value={notes}
              onChange={handleNotesChange}
              placeholder="Start drafting shared notes here..."
              className="flex-1 w-full bg-muted/50 border border-border rounded-2xl p-5 text-sm font-medium leading-relaxed text-foreground focus:outline-none focus:border-blue-500/50 shadow-inner transition-all resize-none placeholder:text-muted-foreground/40"
            />
          </div>
        ) : (
          <div className="space-y-6">
            <form onSubmit={handleAddTask} className="space-y-3 p-4 bg-muted/40 border border-border rounded-2xl">
              <input 
                type="text"
                placeholder="Task description..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="w-full bg-background border border-border rounded-xl py-3 px-4 text-xs font-bold text-foreground focus:outline-none focus:border-blue-500/50 transition-all"
              />
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="Assign to..."
                  value={newTaskAssignee}
                  onChange={(e) => setNewTaskAssignee(e.target.value)}
                  className="flex-1 bg-background border border-border rounded-xl py-3 px-4 text-xs font-bold text-foreground focus:outline-none focus:border-blue-500/50 transition-all"
                />
                <button type="submit" className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 active:scale-95">
                  <Plus size={18} />
                </button>
              </div>
            </form>

            <div className="space-y-4">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Current Action Items</span>
              <div className="space-y-3">
                {tasks.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                     <div className="p-4 bg-muted rounded-3xl">
                        <CheckSquare size={32} className="text-muted-foreground" />
                     </div>
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">No active nodes defined</p>
                  </div>
                ) : (
                  tasks.map((task) => (
                    <div key={task.id} className="p-4 bg-muted/40 border border-border rounded-2xl group hover:border-blue-500/30 transition-all shadow-sm">
                       <div className="flex items-start justify-between gap-3">
                          <p className="text-xs font-bold text-foreground leading-relaxed transition-colors">{task.title}</p>
                          <div className="w-5 h-5 rounded-lg border-2 border-border shrink-0 mt-0.5 group-hover:border-blue-500/40 transition-all cursor-pointer flex items-center justify-center">
                             <div className="w-2 h-2 bg-blue-600 rounded-sm opacity-0 group-hover:opacity-20" />
                          </div>
                       </div>
                       <div className="flex items-center gap-2 mt-4">
                          <div className="p-1 px-3 bg-card border border-border rounded-xl flex items-center gap-2 shadow-sm">
                             <User size={10} className="text-blue-600 animate-pulse" />
                             <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{task.assignee}</span>
                          </div>
                       </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
