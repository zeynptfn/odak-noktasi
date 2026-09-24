import React, { useState, useEffect, useCallback } from 'react';
import { TimerMode, Task, DEFAULT_TIMES, SubTask } from './types';
import CircularTimer from './components/CircularTimer';
import TaskItem from './components/TaskItem';
import { getMotivation } from './services/assistant';
import {
  Plus,
  BrainCircuit,
  Volume2,
  VolumeX,
  Layout,
  Coffee,
  Zap
} from 'lucide-react';

const App: React.FC = () => {
  // -- State --
  const [mode, setMode] = useState<TimerMode>(TimerMode.FOCUS);
  const [timeLeft, setTimeLeft] = useState<number>(DEFAULT_TIMES[TimerMode.FOCUS]);
  const [isActive, setIsActive] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [motivation, setMotivation] = useState<string>("Hazır mısın? Hedefini belirle ve başla.");
  const [dailyCompleted, setDailyCompleted] = useState(0);

  // -- Audio --
  const playNotification = useCallback(() => {
    if (!soundEnabled) return;
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'); // Short bell
    audio.volume = 0.5;
    audio.play().catch(e => console.log("Audio play failed (interaction required first)", e));
  }, [soundEnabled]);

  // -- Timer Logic --
  // A session completes only while the timer is running, and the timer is
  // rewound right away, so neither the effect re-running after the stop nor
  // pressing start at 00:00 can count the same session twice.
  useEffect(() => {
    if (!isActive) return;

    if (timeLeft === 0) {
      setIsActive(false);
      setTimeLeft(DEFAULT_TIMES[mode]);
      handleTimerComplete();
      return;
    }

    const interval = window.setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // -- Handlers --

  const handleTimerComplete = async () => {
    playNotification();
    
    if (mode === TimerMode.FOCUS) {
      setDailyCompleted(prev => prev + 1);
      
      // Update active task stats
      if (activeTaskId) {
        setTasks(prev => prev.map(t => 
          t.id === activeTaskId 
            ? { ...t, completedPomodoros: t.completedPomodoros + 1 } 
            : t
        ));
      }

      const quote = await getMotivation(dailyCompleted + 1);
      setMotivation(quote);
    }
  };

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(DEFAULT_TIMES[newMode]);
  };

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(DEFAULT_TIMES[mode]);
  };

  // -- Task Handlers --

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: newTaskTitle,
      completed: false,
      estimatedPomodoros: 1,
      completedPomodoros: 0,
      subtasks: []
    };

    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
    if (!activeTaskId) setActiveTaskId(newTask.id);
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
    if (activeTaskId === id) setActiveTaskId(null);
  };

  const addSubtasks = (taskId: string, subtasks: SubTask[]) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, subtasks } : t));
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(tasks.map(t => {
        if (t.id !== taskId) return t;
        const updatedSubtasks = t.subtasks?.map(s => s.id === subtaskId ? {...s, completed: !s.completed} : s);
        return { ...t, subtasks: updatedSubtasks };
    }));
  }

  return (
    <div className="h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-200 flex flex-col md:flex-row overflow-hidden">
      
      {/* Sidebar / Left Panel - Stats & Info */}
      <aside className="md:w-80 p-6 border-r border-slate-700/50 bg-slate-900/50 backdrop-blur-sm hidden md:flex flex-col h-full">
        <div className="flex items-center gap-2 mb-8 text-indigo-400">
          <BrainCircuit size={28} />
          <h1 className="text-xl font-bold tracking-tight text-white">Odak Noktası</h1>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
             <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Günlük Başarı</h3>
             <div className="flex items-end gap-2">
               <span className="text-4xl font-bold text-white">{dailyCompleted}</span>
               <span className="text-sm text-slate-500 mb-1">tamamlanan döngü</span>
             </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 p-4 rounded-xl border border-indigo-500/20">
            <div className="flex items-start gap-2">
              <Zap size={16} className="text-yellow-400 mt-1 flex-shrink-0" />
              <p className="text-sm text-indigo-100 italic leading-relaxed">
                "{motivation}"
              </p>
            </div>
          </div>
        </div>

        <div className="mt-auto text-xs text-slate-500">
            <p>Odaklan, üret, tekrarla.</p>
            <p>© 2024 Odak Noktası</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-2xl mx-auto space-y-8 pb-20 md:pb-0">
            
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between mb-4 pt-2">
                <div className="flex items-center gap-2 text-indigo-400">
                    <BrainCircuit size={24} />
                    <h1 className="font-bold text-white">Odak Noktası</h1>
                </div>
                <div className="bg-slate-800 px-3 py-1 rounded-full text-xs">
                    {dailyCompleted} tamamlandı
                </div>
            </div>

            {/* Timer Section */}
            <div className="bg-slate-800/30 rounded-3xl p-8 border border-slate-700/50 shadow-2xl relative overflow-hidden">
                {/* Background Glow */}
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-[100px] opacity-20 pointer-events-none transition-colors duration-1000 ${mode === TimerMode.FOCUS ? 'bg-indigo-500' : mode === TimerMode.SHORT_BREAK ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>

                <div className="relative z-10 flex flex-col items-center">
                    {/* Mode Toggle */}
                    <div className="flex items-center bg-slate-900/80 p-1 rounded-full mb-8 shadow-inner border border-slate-700">
                    {[
                        { id: TimerMode.FOCUS, label: 'Odaklan', icon: Zap },
                        { id: TimerMode.SHORT_BREAK, label: 'Kısa Mola', icon: Coffee },
                        { id: TimerMode.LONG_BREAK, label: 'Uzun Mola', icon: Layout }
                    ].map((m) => (
                        <button
                        key={m.id}
                        onClick={() => switchMode(m.id as TimerMode)}
                        className={`
                            px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all duration-300
                            ${mode === m.id 
                            ? 'bg-slate-700 text-white shadow-md' 
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}
                        `}
                        >
                        <m.icon size={14} />
                        <span className="hidden sm:inline">{m.label}</span>
                        </button>
                    ))}
                    </div>

                    <CircularTimer 
                    timeLeft={timeLeft} 
                    totalTime={DEFAULT_TIMES[mode]} 
                    mode={mode} 
                    isActive={isActive} 
                    />

                    {/* Controls */}
                    <div className="flex items-center gap-4 mt-8">
                    <button 
                        onClick={toggleTimer}
                        className={`
                        h-14 px-8 rounded-2xl font-bold text-lg tracking-wide transition-all transform hover:scale-105 active:scale-95 shadow-lg
                        ${mode === TimerMode.FOCUS 
                            ? (isActive ? 'bg-slate-700 text-white border border-slate-600' : 'bg-indigo-500 text-white hover:bg-indigo-400')
                            : (isActive ? 'bg-slate-700 text-white' : 'bg-emerald-500 text-white hover:bg-emerald-400')}
                        `}
                    >
                        {isActive ? 'DURAKLAT' : 'BAŞLAT'}
                    </button>
                    <button 
                        onClick={resetTimer}
                        className="h-14 w-14 flex items-center justify-center rounded-2xl bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700"
                        title="Sıfırla"
                    >
                        <div className="w-3 h-3 rounded-sm bg-current" />
                    </button>
                    <button
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className="h-14 w-14 flex items-center justify-center rounded-2xl bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700"
                    >
                        {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                    </button>
                    </div>
                </div>
            </div>

            {/* Tasks Section */}
            <div>
                <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Görevler</h2>
                <span className="text-sm text-slate-400">
                    {activeTaskId ? '1 Aktif' : 'Seçili Yok'}
                </span>
                </div>

                {/* Add Task Input */}
                <form onSubmit={addTask} className="relative mb-6 group">
                <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Ne üzerinde çalışacaksın?"
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-4 pl-5 pr-12 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:bg-slate-800 transition-all"
                />
                <button 
                    type="submit"
                    disabled={!newTaskTitle.trim()}
                    className="absolute right-2 top-2 bottom-2 w-10 flex items-center justify-center bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg transition-all disabled:opacity-0 disabled:scale-90"
                >
                    <Plus size={20} />
                </button>
                </form>

                {/* Task List */}
                <div className="space-y-1">
                {tasks.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-xl">
                    <p className="text-slate-500 mb-2">Henüz görev eklenmedi.</p>
                    <p className="text-sm text-slate-600">Bugün neyi başarmak istiyorsun?</p>
                    </div>
                ) : (
                    tasks.map(task => (
                    <TaskItem
                        key={task.id}
                        task={task}
                        activeTaskId={activeTaskId}
                        onToggle={toggleTask}
                        onDelete={deleteTask}
                        onSelect={setActiveTaskId}
                        onAddSubtasks={addSubtasks}
                        onToggleSubtask={toggleSubtask}
                    />
                    ))
                )}
                </div>
            </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default App;
