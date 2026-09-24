import React, { useState } from 'react';
import { Task, SubTask } from '../types';
import { Check, Trash2, Sparkles, ChevronDown, ChevronUp, PlayCircle } from 'lucide-react';
import { generateSubtasks } from '../services/assistant';

interface TaskItemProps {
  task: Task;
  activeTaskId: string | null;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  onAddSubtasks: (taskId: string, subtasks: SubTask[]) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  activeTaskId,
  onToggle,
  onDelete,
  onSelect,
  onAddSubtasks,
  onToggleSubtask
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const isActive = activeTaskId === task.id;

  const handleAiBreakdown = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (task.subtasks && task.subtasks.length > 0) {
      setIsExpanded(!isExpanded);
      return;
    }

    setIsGenerating(true);
    try {
      const subtaskTitles = await generateSubtasks(task.title);
      const newSubtasks: SubTask[] = subtaskTitles.map(title => ({
        id: crypto.randomUUID(),
        title,
        completed: false
      }));
      onAddSubtasks(task.id, newSubtasks);
      setIsExpanded(true);
    } catch (error) {
      console.error("Subtask generation error", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div 
      className={`
        group relative rounded-xl p-4 mb-3 transition-all duration-300 border 
        ${isActive 
          ? 'bg-indigo-900/20 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.1)]' 
          : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600 hover:bg-slate-800'}
      `}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(task.id)}
          className={`
            flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
            ${task.completed 
              ? 'bg-emerald-500 border-emerald-500 text-white' 
              : 'border-slate-500 text-transparent hover:border-emerald-400'}
          `}
        >
          <Check size={14} strokeWidth={3} />
        </button>

        {/* Title & Stats */}
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onSelect(task.id)}>
          <h3 className={`font-medium truncate ${task.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
            {task.title}
          </h3>
          <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
            <span className="bg-slate-700/50 px-2 py-0.5 rounded">
               {task.completedPomodoros} / {task.estimatedPomodoros} Pomodoro
            </span>
            {isActive && <span className="text-indigo-400 font-semibold animate-pulse">• Aktif Görev</span>}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onSelect(task.id)}
            title="Bu göreve odaklan"
            className={`p-2 rounded-lg transition-colors ${isActive ? 'text-indigo-400 bg-indigo-400/10' : 'text-slate-400 hover:text-indigo-400 hover:bg-slate-700'}`}
          >
            <PlayCircle size={18} />
          </button>

          <button
            onClick={handleAiBreakdown}
            disabled={isGenerating}
            title="Alt Görevlere Böl"
            className="p-2 text-slate-400 hover:text-purple-400 hover:bg-slate-700 rounded-lg transition-colors relative"
          >
            {isGenerating ? (
              <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles size={18} />
            )}
          </button>

          <button
            onClick={() => onDelete(task.id)}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Subtasks */}
      {isExpanded && task.subtasks && (
        <div className="mt-4 pl-9 space-y-2 border-l-2 border-slate-700 ml-3">
          {task.subtasks.map(sub => (
            <div key={sub.id} className="flex items-start gap-3 group/sub">
              <button
                 onClick={() => onToggleSubtask(task.id, sub.id)}
                 className={`
                   mt-0.5 flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors
                   ${sub.completed 
                     ? 'bg-indigo-500 border-indigo-500 text-white' 
                     : 'border-slate-500 text-transparent hover:border-indigo-400'}
                 `}
              >
                 <Check size={10} strokeWidth={3} />
              </button>
              <span className={`text-sm ${sub.completed ? 'text-slate-600 line-through' : 'text-slate-300'}`}>
                {sub.title}
              </span>
            </div>
          ))}
        </div>
      )}
      
      {/* Expand toggle if subtasks exist */}
      {task.subtasks && task.subtasks.length > 0 && !isGenerating && (
          <button 
            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 bg-slate-800 border border-slate-700 rounded-full p-0.5 text-slate-400 hover:text-white hover:border-slate-500 transition-all"
          >
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
      )}
    </div>
  );
};

export default TaskItem;
