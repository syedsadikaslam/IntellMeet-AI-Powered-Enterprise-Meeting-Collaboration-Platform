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
      setTasks(syncedTasks);
    });

    socket.on('live-task-added', (task: Task) => {
      setTasks((prev) => [...prev, task]);
    });

    return () => {
      socket.off('note-update');
      socket.off('tasks-sync');
      socket.off('live-task-added');
    };
  }, []);

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
    <div className="flex flex-col h-full bg-[#0a0f1d] border-l border-white/10 w-80 sm:w-96 shadow-2xl animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
            <Target size={18} />
          </div>
          <div>
            <h3 className="font-black text-sm uppercase tracking-tighter">Collaboration</h3>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] text-white/30 font-bold uppercase">Real-time Sync</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-white/40 hover:text-white">
          <X size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex p-2 bg-white/[0.02] border-b border-white/5">
        <button 
          onClick={() => setActiveTab('notes')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'notes' ? 'bg-blue-600 text-white' : 'text-white/30 hover:bg-white/5'}`}
        >
          <Edit3 size={14} /> Shared Notes
        </button>
        <button 
          onClick={() => setActiveTab('tasks')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'tasks' ? 'bg-blue-600 text-white' : 'text-white/30 hover:bg-white/5'}`}
        >
          <CheckSquare size={14} /> Meeting Tasks
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
        {activeTab === 'notes' ? (
          <div className="h-full flex flex-col space-y-4">
            <div className="flex items-center justify-between">
               <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">Collaborative Notepad</span>
               {isSaving && (
                 <span className="flex items-center gap-1.5 text-[9px] font-bold text-blue-400 uppercase">
                    <Save size={10} className="animate-pulse" /> Saving...
                 </span>
               )}
            </div>
            <textarea 
              value={notes}
              onChange={handleNotesChange}
              placeholder="Start drafting shared notes here..."
              className="flex-1 w-full bg-white/[0.03] border border-white/5 rounded-2xl p-5 text-sm font-medium leading-relaxed text-white/80 focus:outline-none focus:border-blue-500/30 transition-all resize-none placeholder:text-white/5"
            />
          </div>
        ) : (
          <div className="space-y-6">
            <form onSubmit={handleAddTask} className="space-y-3 p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
              <input 
                type="text"
                placeholder="Task description..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs font-bold focus:outline-none focus:border-blue-500/30 transition-all"
              />
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="Assign to..."
                  value={newTaskAssignee}
                  onChange={(e) => setNewTaskAssignee(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs font-bold focus:outline-none focus:border-blue-500/30 transition-all"
                />
                <button type="submit" className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all shadow-lg active:scale-95">
                  <Plus size={18} />
                </button>
              </div>
            </form>

            <div className="space-y-4">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">Current Action Items</span>
              <div className="space-y-3">
                {tasks.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 opacity-20">
                     <CheckSquare size={32} />
                     <p className="text-[10px] font-black uppercase tracking-widest">No tasks defined yet</p>
                  </div>
                ) : (
                  tasks.map((task) => (
                    <div key={task.id} className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl group hover:border-blue-500/20 transition-all">
                       <div className="flex items-start justify-between gap-3">
                          <p className="text-xs font-bold text-white/90 leading-relaxed">{task.title}</p>
                          <div className="w-4 h-4 rounded border border-white/20 shrink-0 mt-0.5 group-hover:border-blue-500/50 transition-colors" />
                       </div>
                       <div className="flex items-center gap-2 mt-3">
                          <div className="p-1 px-2 bg-white/5 rounded-lg flex items-center gap-1.5">
                             <User size={10} className="text-blue-400" />
                             <span className="text-[9px] font-black uppercase tracking-widest text-white/40">{task.assignee}</span>
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
