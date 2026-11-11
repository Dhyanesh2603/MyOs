import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Calendar,
  Tag,
  AlertTriangle,
  Search,
  CheckSquare,
  Sparkles,
  Flame,
  Clock,
} from 'lucide-react';
import {
  usePersonalOsStore,
  type TaskPriority,
  type TaskCategory,
} from '@core/personal-os/personalOsStore';
import { soundEngine } from '@core/audio/soundEngine';

const PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  critical: {
    label: 'Critical',
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
    dot: 'bg-rose-500',
  },
  high: {
    label: 'High',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    dot: 'bg-amber-500',
  },
  medium: {
    label: 'Medium',
    bg: 'bg-sky-500/10',
    text: 'text-sky-400',
    border: 'border-sky-500/30',
    dot: 'bg-sky-500',
  },
  low: {
    label: 'Low',
    bg: 'bg-neutral-500/10',
    text: 'text-neutral-400',
    border: 'border-neutral-500/30',
    dot: 'bg-neutral-400',
  },
};

const CATEGORIES: { id: TaskCategory; label: string }[] = [
  { id: 'engineering', label: 'Engineering' },
  { id: 'dsa', label: 'DSA & Code' },
  { id: 'career', label: 'Career' },
  { id: 'academics', label: 'Academics' },
  { id: 'personal', label: 'Personal' },
];

export const TasksTodosView: React.FC = () => {
  const { tasks, addTask, toggleTask, deleteTask, startFocusMode } = usePersonalOsStore();

  const [inputTitle, setInputTitle] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority>('high');
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory>('engineering');
  const [inputDueDate, setInputDueDate] = useState('');
  const [inputTag, setInputTag] = useState('');

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const criticalCount = tasks.filter((t) => !t.completed && (t.priority === 'critical' || t.priority === 'high')).length;

  const handleCreateTask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputTitle.trim();
    if (!trimmed) return;

    soundEngine.playSnap();
    addTask({
      title: trimmed,
      priority: selectedPriority,
      category: selectedCategory,
      completed: false,
      dueDate: inputDueDate.trim() || undefined,
      tags: inputTag.trim() ? [inputTag.trim()] : undefined,
    });

    setInputTitle('');
    setInputDueDate('');
    setInputTag('');
  };

  const handleToggle = (id: string, currentlyCompleted: boolean) => {
    if (!currentlyCompleted) {
      soundEngine.playChime();
    } else {
      soundEngine.playClick();
    }
    toggleTask(id);
  };

  const filteredTasks = tasks.filter((task) => {
    if (filterCategory !== 'all' && task.category !== filterCategory) return false;
    if (filterStatus === 'pending' && task.completed) return false;
    if (filterStatus === 'completed' && !task.completed) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchTag = task.tags?.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchTag) return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-6 p-6 font-sans">
      {/* Executive Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-white">Tasks & Sprint Execution</h2>
            <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] text-neutral-400">
              LEDGER ACTIVE
            </span>
          </div>
          <p className="mt-1 text-xs text-neutral-400">
            High-leverage engineering action items, algorithmic drills, and critical milestones.
          </p>
        </div>

        {/* Action Button: Start Focus on Next Critical Task */}
        {criticalCount > 0 && (
          <button
            onClick={() => {
              const topTask = tasks.find((t) => !t.completed && (t.priority === 'critical' || t.priority === 'high'));
              if (topTask) {
                soundEngine.playClick();
                startFocusMode(topTask.title, 25);
              }
            }}
            className="flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2 text-xs font-semibold text-neutral-950 shadow-md hover:bg-amber-300 transition-colors cursor-pointer shrink-0"
          >
            <Flame className="h-4 w-4 fill-current text-neutral-950" />
            <span>Deep Work on Top Priority</span>
          </button>
        )}
      </div>

      {/* Telemetry Metric Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Total Tasks */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#11131c] p-4 shadow-sm">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-medium">
            <span>Total Tasks</span>
            <CheckSquare className="h-4 w-4 text-neutral-500" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-white">{totalTasks}</div>
          <div className="mt-1 text-[11px] text-neutral-500">{pendingTasks} remaining in queue</div>
        </div>

        {/* Completion Rate */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#11131c] p-4 shadow-sm">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-medium">
            <span>Completion Rate</span>
            <Sparkles className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-white">{completionRate}%</div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-emerald-400 transition-all duration-500 rounded-full"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* Critical & High In Queue */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#11131c] p-4 shadow-sm">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-medium">
            <span>High Priority</span>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-amber-400">{criticalCount}</div>
          <div className="mt-1 text-[11px] text-neutral-500">Requires focus execution</div>
        </div>

        {/* Completed */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#11131c] p-4 shadow-sm">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-medium">
            <span>Completed</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-emerald-400">{completedTasks}</div>
          <div className="mt-1 text-[11px] text-neutral-500">Logged to momentum ledger</div>
        </div>
      </div>

      {/* Quick Add Task Input Card */}
      <form
        onSubmit={handleCreateTask}
        className="rounded-2xl border border-white/[0.1] bg-[#11131c] p-4 shadow-md transition-all focus-within:border-white/20"
      >
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputTitle}
            onChange={(e) => setInputTitle(e.target.value)}
            placeholder="Add new high-priority engineering todo or action item... (Press Enter)"
            className="flex-1 bg-transparent text-sm text-white placeholder:text-neutral-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputTitle.trim()}
            className="flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-1.5 text-xs font-semibold text-neutral-950 transition-all hover:bg-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Task</span>
          </button>
        </div>

        {/* Attributes: Priority, Category, Due Date, Tag */}
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-3 text-xs">
          {/* Priority Picker */}
          <div className="flex items-center gap-1">
            <span className="font-mono text-[10px] text-neutral-400 mr-1">PRIORITY:</span>
            {(['critical', 'high', 'medium', 'low'] as TaskPriority[]).map((p) => {
              const cfg = PRIORITY_CONFIG[p] ?? PRIORITY_CONFIG.medium;
              const isSelected = selectedPriority === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setSelectedPriority(p)}
                  className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors cursor-pointer border ${
                    isSelected
                      ? `${cfg.bg} ${cfg.text} ${cfg.border} font-bold shadow-sm`
                      : 'border-transparent text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                  <span>{cfg.label}</span>
                </button>
              );
            })}
          </div>

          <div className="h-3 w-px bg-white/10 mx-1 hidden sm:block" />

          {/* Category Picker */}
          <div className="flex items-center gap-1">
            <span className="font-mono text-[10px] text-neutral-400 mr-1">CATEGORY:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as TaskCategory)}
              className="rounded-md border border-white/10 bg-[#171924] px-2 py-0.5 font-mono text-[10px] text-neutral-200 focus:outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Due Date Input */}
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-neutral-500 ml-1" />
            <input
              type="text"
              value={inputDueDate}
              onChange={(e) => setInputDueDate(e.target.value)}
              placeholder="Due date (e.g. Today)"
              className="w-24 rounded-md border border-white/10 bg-transparent px-2 py-0.5 text-[10px] text-neutral-300 placeholder:text-neutral-600 focus:outline-none"
            />
          </div>

          {/* Tag Input */}
          <div className="flex items-center gap-1">
            <Tag className="h-3 w-3 text-neutral-500 ml-1" />
            <input
              type="text"
              value={inputTag}
              onChange={(e) => setInputTag(e.target.value)}
              placeholder="Tag (e.g. React)"
              className="w-24 rounded-md border border-white/10 bg-transparent px-2 py-0.5 text-[10px] text-neutral-300 placeholder:text-neutral-600 focus:outline-none"
            />
          </div>
        </div>
      </form>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
        {/* Category Filter Chips */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none no-scrollbar">
          <button
            onClick={() => setFilterCategory('all')}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
              filterCategory === 'all'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-neutral-400 hover:bg-white/[0.05] hover:text-white'
            }`}
          >
            All Categories
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setFilterCategory(c.id)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                filterCategory === c.id
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-neutral-400 hover:bg-white/[0.05] hover:text-white'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Status Toggle & Search Box */}
        <div className="flex items-center gap-2">
          {/* Status Segment */}
          <div className="flex items-center rounded-lg border border-white/10 bg-white/[0.03] p-0.5 text-[11px]">
            {(['all', 'pending', 'completed'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`rounded px-2 py-0.5 capitalize transition-colors cursor-pointer ${
                  filterStatus === st
                    ? 'bg-white/15 text-white font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/30 px-2.5 py-1 text-xs text-neutral-300">
            <Search className="h-3 w-3 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-28 bg-transparent text-xs text-white placeholder:text-neutral-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Task List Items */}
      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-[#11131c]/50 p-12 text-center text-neutral-400">
            <CheckSquare className="h-10 w-10 text-neutral-600 mb-3" />
            <div className="text-sm font-semibold text-white">No tasks matching criteria</div>
            <p className="mt-1 text-xs text-neutral-500">
              Create a new action item above or adjust your search filters.
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const pConfig = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.medium;
            return (
              <div
                key={task.id}
                className={`group flex items-center justify-between rounded-xl border p-3.5 transition-all ${
                  task.completed
                    ? 'border-white/[0.04] bg-white/[0.01] opacity-60'
                    : 'border-white/[0.08] bg-[#11131c] hover:border-white/20 hover:bg-[#141622] shadow-sm'
                }`}
              >
                {/* Left: Checkbox & Task Title */}
                <div className="flex items-center gap-3 overflow-hidden pr-3">
                  <button
                    onClick={() => handleToggle(task.id, task.completed)}
                    className="cursor-pointer text-neutral-400 hover:text-white transition-colors shrink-0"
                    title={task.completed ? 'Mark pending' : 'Mark completed'}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <Circle className="h-5 w-5 hover:text-amber-400" />
                    )}
                  </button>

                  <div className="flex flex-col min-w-0">
                    <span
                      className={`text-xs font-medium tracking-tight transition-all truncate ${
                        task.completed ? 'line-through text-neutral-500' : 'text-neutral-100'
                      }`}
                    >
                      {task.title}
                    </span>
                    {task.notes && (
                      <span className="text-[10px] text-neutral-500 truncate mt-0.5">{task.notes}</span>
                    )}
                  </div>
                </div>

                {/* Right: Badges & Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Category Badge */}
                  <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[9px] text-neutral-400 capitalize hidden sm:inline">
                    {task.category}
                  </span>

                  {/* Priority Badge */}
                  <span
                    className={`flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[9px] font-semibold ${pConfig.bg} ${pConfig.text} ${pConfig.border}`}
                  >
                    <span className={`h-1 w-1 rounded-full ${pConfig.dot}`} />
                    <span>{pConfig.label}</span>
                  </span>

                  {/* Due Date Indicator */}
                  {task.dueDate && (
                    <span className="flex items-center gap-1 font-mono text-[9px] text-neutral-400 hidden md:flex">
                      <Clock className="h-2.5 w-2.5 text-neutral-500" />
                      <span>{task.dueDate}</span>
                    </span>
                  )}

                  {/* Tag Chip */}
                  {task.tags && task.tags[0] && (
                    <span className="rounded bg-sky-500/10 border border-sky-500/20 px-1.5 py-0.5 font-mono text-[9px] text-sky-400 hidden lg:inline">
                      #{task.tags[0]}
                    </span>
                  )}

                  {/* Focus Action */}
                  {!task.completed && (
                    <button
                      onClick={() => {
                        soundEngine.playClick();
                        startFocusMode(task.title, 25);
                      }}
                      title="Focus on this task in deep work block"
                      className="rounded-lg p-1.5 text-neutral-500 hover:text-amber-400 hover:bg-white/[0.05] transition-colors cursor-pointer hidden sm:block"
                    >
                      <Flame className="h-3.5 w-3.5" />
                    </button>
                  )}

                  {/* Delete Button */}
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      deleteTask(task.id);
                    }}
                    title="Delete task"
                    className="opacity-0 group-hover:opacity-100 rounded-lg p-1.5 text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
