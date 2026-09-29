import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Flame,
  Zap,
  GitCommit,
  Award,
  Plus,
  Play,
  Trash2,
  Save,
  X,
} from 'lucide-react';
import { usePersonalOsStore } from '@core/personal-os/personalOsStore';
import { soundEngine } from '@core/audio/soundEngine';

export const DailyTimelineView: React.FC = () => {
  const {
    dailyPlan,
    timeline,
    toggleMorningPriority,
    addMorningPriority,
    deleteMorningPriority,
    logDeepWorkMinutes,
    startFocusMode,
    updateEveningReflection,
    addDailyWin,
    deleteDailyWin,
    addDailyMistake,
    deleteDailyMistake,
    updateDailyLevels,
    addTimelineEvent,
  } = usePersonalOsStore();

  const [activeTab, setActiveTab] = useState<'planner' | 'timeline'>('planner');
  const [priorityText, setPriorityText] = useState('');
  const [priorityTag, setPriorityTag] = useState('ENGINEERING');

  // Evening Reflection States
  const [reflectionNotes, setReflectionNotes] = useState(dailyPlan.eveningReflection.notes || '');
  const [isNotesSaved, setIsNotesSaved] = useState(false);
  const [newWinText, setNewWinText] = useState('');
  const [newMistakeText, setNewMistakeText] = useState('');

  // Timeline Event Modal
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventSubtitle, setEventSubtitle] = useState('');
  const [eventType, setEventType] = useState<'assignment' | 'dsa' | 'commit' | 'task' | 'milestone' | 'reflection'>('commit');

  const handleAddPriority = (e: React.FormEvent) => {
    e.preventDefault();
    if (!priorityText.trim()) return;
    soundEngine.playClick();
    addMorningPriority(priorityText.trim(), priorityTag);
    setPriorityText('');
  };

  const handleSaveNotes = (e: React.FormEvent) => {
    e.preventDefault();
    soundEngine.playClick();
    updateEveningReflection(reflectionNotes);
    setIsNotesSaved(true);
    setTimeout(() => setIsNotesSaved(false), 2000);
  };

  const handleAddWin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWinText.trim()) return;
    soundEngine.playClick();
    addDailyWin(newWinText.trim());
    setNewWinText('');
  };

  const handleAddMistake = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMistakeText.trim()) return;
    soundEngine.playClick();
    addDailyMistake(newMistakeText.trim());
    setNewMistakeText('');
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;
    soundEngine.playClick();
    addTimelineEvent({
      type: eventType,
      title: eventTitle.trim(),
      subtitle: eventSubtitle.trim() || undefined,
    });
    setEventTitle('');
    setEventSubtitle('');
    setIsEventModalOpen(false);
  };

  const completedPriorities = dailyPlan.morningPriorities.filter((p) => p.completed).length;
  const totalPriorities = dailyPlan.morningPriorities.length || 1;
  const deepWorkHours = (dailyPlan.deepWorkLoggedMinutes / 60).toFixed(1);
  const targetHours = (dailyPlan.deepWorkTargetMinutes / 60).toFixed(1);

  return (
    <div className="flex flex-col gap-6 p-6 font-sans text-neutral-200">
      {/* 1. Header & Section Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-neutral-300" />
            <h2 className="text-xl font-medium tracking-tight text-white">
              Daily System & Unified Timeline
            </h2>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Morning intentional planning, deep work timer, evening reflection, and unified chronological stream.
          </p>
        </div>

        {/* Switcher */}
        <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.02] p-1">
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('planner');
            }}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-mono transition-all ${
              activeTab === 'planner'
                ? 'bg-white/15 text-white font-medium shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Daily Planner</span>
          </button>
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('timeline');
            }}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-mono transition-all ${
              activeTab === 'timeline'
                ? 'bg-white/15 text-white font-medium shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <GitCommit className="h-3.5 w-3.5" />
            <span>Unified Timeline</span>
          </button>
        </div>
      </div>

      {activeTab === 'planner' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Morning Plan & Priorities (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {/* Today's Goals Card */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-neutral-300" />
                  <h3 className="text-sm font-semibold tracking-wide text-white">
                    Morning Plan & Core Priorities
                  </h3>
                </div>
                <span className="font-mono text-xs text-neutral-400">
                  {completedPriorities} of {totalPriorities} cleared
                </span>
              </div>

              <div className="mt-3.5 flex flex-col gap-2">
                {dailyPlan.morningPriorities.length === 0 ? (
                  <div className="p-4 text-center text-xs font-mono text-neutral-500 border border-dashed border-white/10 rounded-xl">
                    No morning priorities set yet. Add your critical targets below.
                  </div>
                ) : (
                  dailyPlan.morningPriorities.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        soundEngine.playClick();
                        toggleMorningPriority(item.id);
                      }}
                      className={`group flex items-center justify-between rounded-xl border p-3 transition-all cursor-pointer ${
                        item.completed
                          ? 'border-white/5 bg-white/[0.01] text-neutral-500 line-through'
                          : 'border-white/10 bg-white/[0.02] text-neutral-200 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {item.completed ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-neutral-400" />
                        ) : (
                          <Circle className="h-4 w-4 shrink-0 text-neutral-500" />
                        )}
                        <span className="text-xs truncate">{item.text}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.tag && (
                          <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-neutral-300">
                            {item.tag}
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            soundEngine.playClick();
                            deleteMorningPriority(item.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-rose-400 transition-opacity"
                          title="Delete Priority"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Priority Input Form */}
              <form onSubmit={handleAddPriority} className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Set an intentional priority for today..."
                  value={priorityText}
                  onChange={(e) => setPriorityText(e.target.value)}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-neutral-500 outline-none focus:border-white/30"
                />
                <select
                  value={priorityTag}
                  onChange={(e) => setPriorityTag(e.target.value)}
                  className="rounded-xl border border-white/10 bg-neutral-900 px-2.5 py-2 text-xs font-mono text-neutral-300 outline-none cursor-pointer"
                >
                  <option value="ENGINEERING">ENG</option>
                  <option value="DSA">DSA</option>
                  <option value="ACADEMICS">ACAD</option>
                  <option value="CAREER">CAREER</option>
                </select>
                <button
                  type="submit"
                  className="flex items-center gap-1 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-medium text-white hover:bg-white/20 transition-all font-mono"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add</span>
                </button>
              </form>
            </div>

            {/* Evening Reflection Card */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-neutral-300" />
                  <h3 className="text-sm font-semibold tracking-wide text-white">
                    Evening Reflection & Takeaways
                  </h3>
                </div>
                <span className="font-mono text-[11px] text-neutral-400">{dailyPlan.date}</span>
              </div>

              {/* Reflection Notes Textarea */}
              <form onSubmit={handleSaveNotes} className="mt-3.5">
                <div className="flex items-center justify-between mb-1.5 text-[10px] font-mono uppercase text-neutral-400">
                  <span>General Synthesis & Notes</span>
                  {isNotesSaved && <span className="text-emerald-400 font-semibold">Saved!</span>}
                </div>
                <textarea
                  rows={2}
                  placeholder="Record overall reflections, insights, or mental state..."
                  value={reflectionNotes}
                  onChange={(e) => setReflectionNotes(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs text-neutral-200 outline-none focus:border-white/30 font-mono"
                />
                <div className="flex justify-end mt-1.5">
                  <button
                    type="submit"
                    className="flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-mono text-neutral-200 hover:bg-white/10 transition-colors"
                  >
                    <Save className="h-3 w-3" />
                    <span>Save Notes</span>
                  </button>
                </div>
              </form>

              {/* Wins */}
              <div className="mt-4 pt-3 border-t border-white/10">
                <div className="text-[10px] font-mono uppercase text-emerald-400 mb-1.5">What went exceptionally well (Wins)</div>
                <form onSubmit={handleAddWin} className="mb-2 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Log an engineering win or breakthrough..."
                    value={newWinText}
                    onChange={(e) => setNewWinText(e.target.value)}
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-white/30 font-mono"
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-1 rounded-xl border border-white/20 bg-white/10 px-2.5 py-1.5 text-xs font-mono text-white hover:bg-white/20 transition-all"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add</span>
                  </button>
                </form>

                <div className="flex flex-col gap-1.5">
                  {dailyPlan.eveningReflection.wins.map((w, i) => (
                    <div key={i} className="group flex items-center justify-between gap-2 text-xs text-neutral-300 rounded-lg p-1.5 hover:bg-white/[0.02]">
                      <div className="flex items-start gap-2 min-w-0 flex-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                        <span className="truncate">{w}</span>
                      </div>
                      <button
                        onClick={() => {
                          soundEngine.playClick();
                          deleteDailyWin(i);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-rose-400 transition-opacity"
                        title="Delete Win"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mistakes */}
              <div className="mt-4 pt-3 border-t border-white/10">
                <div className="text-[10px] font-mono uppercase text-rose-400 mb-1.5">Mistakes & Anti-Patterns to Prevent</div>
                <form onSubmit={handleAddMistake} className="mb-2 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Log a mistake, bug, or anti-pattern..."
                    value={newMistakeText}
                    onChange={(e) => setNewMistakeText(e.target.value)}
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-white/30 font-mono"
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-1 rounded-xl border border-white/20 bg-white/10 px-2.5 py-1.5 text-xs font-mono text-white hover:bg-white/20 transition-all"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add</span>
                  </button>
                </form>

                <div className="flex flex-col gap-1.5">
                  {dailyPlan.eveningReflection.mistakes.map((m, i) => (
                    <div key={i} className="group flex items-center justify-between gap-2 text-xs text-neutral-300 rounded-lg p-1.5 hover:bg-white/[0.02]">
                      <div className="flex items-start gap-2 min-w-0 flex-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                        <span className="truncate">{m}</span>
                      </div>
                      <button
                        onClick={() => {
                          soundEngine.playClick();
                          deleteDailyMistake(i);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-rose-400 transition-opacity"
                        title="Delete Mistake"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Deep Work Engine & Telemetry (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Deep Work Engine Card */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-neutral-300" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-300 font-mono">
                    Deep Work Engine
                  </h4>
                </div>
                <span className="font-mono text-xs text-white font-semibold">
                  {deepWorkHours}h / {targetHours}h
                </span>
              </div>

              <div className="mt-4 flex flex-col gap-3">
                <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-mono uppercase text-neutral-400">Total Logged Today</div>
                    <div className="text-3xl font-bold text-white font-mono mt-0.5">
                      {dailyPlan.deepWorkLoggedMinutes} <span className="text-sm font-normal text-neutral-400">mins</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      startFocusMode('Core Deep Work Block', 25);
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold font-mono text-black hover:bg-neutral-200 transition-all shadow-md"
                  >
                    <Play className="h-3.5 w-3.5 fill-black" />
                    <span>Start 25m Focus</span>
                  </button>
                </div>

                {/* Quick Add Minutes */}
                <div className="flex items-center gap-2 pt-1 font-mono text-xs">
                  <span className="text-neutral-400 text-[10px] uppercase">Quick Log:</span>
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      logDeepWorkMinutes(15);
                    }}
                    className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-neutral-300 hover:bg-white/10"
                  >
                    +15m
                  </button>
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      logDeepWorkMinutes(30);
                    }}
                    className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-neutral-300 hover:bg-white/10"
                  >
                    +30m
                  </button>
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      logDeepWorkMinutes(60);
                    }}
                    className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-neutral-300 hover:bg-white/10"
                  >
                    +60m
                  </button>
                </div>
              </div>
            </div>

            {/* Daily Telemetry Gauges */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                <Flame className="h-4 w-4 text-amber-400" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-300 font-mono">
                  Productivity Telemetry
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 text-xs font-mono">
                {/* Focus Level Interactive Rating */}
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <div className="text-[10px] text-neutral-400 uppercase">Focus Level</div>
                  <div className="text-lg font-bold text-white mt-1">
                    {dailyPlan.eveningReflection.focusLevel} / 5
                  </div>
                  <div className="mt-2 flex items-center gap-1">
                    {([1, 2, 3, 4, 5] as const).map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => {
                          soundEngine.playClick();
                          updateDailyLevels(lvl, dailyPlan.eveningReflection.energyLevel);
                        }}
                        className={`h-6 w-6 rounded text-[10px] font-semibold transition-all ${
                          dailyPlan.eveningReflection.focusLevel === lvl
                            ? 'bg-emerald-400 text-black shadow-sm'
                            : 'bg-white/10 text-neutral-400 hover:bg-white/20'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Energy Level Interactive Rating */}
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <div className="text-[10px] text-neutral-400 uppercase">Energy Level</div>
                  <div className="text-lg font-bold text-white mt-1">
                    {dailyPlan.eveningReflection.energyLevel} / 5
                  </div>
                  <div className="mt-2 flex items-center gap-1">
                    {([1, 2, 3, 4, 5] as const).map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => {
                          soundEngine.playClick();
                          updateDailyLevels(dailyPlan.eveningReflection.focusLevel, lvl);
                        }}
                        className={`h-6 w-6 rounded text-[10px] font-semibold transition-all ${
                          dailyPlan.eveningReflection.energyLevel === lvl
                            ? 'bg-sky-400 text-black shadow-sm'
                            : 'bg-white/10 text-neutral-400 hover:bg-white/20'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 2. Unified Chronological Timeline Stream */
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
              Chronological Activity Log
            </span>
            <button
              onClick={() => {
                soundEngine.playClick();
                setEventTitle('');
                setEventSubtitle('');
                setEventType('commit');
                setIsEventModalOpen(true);
              }}
              className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-1 text-xs font-mono text-white hover:bg-white/20 transition-all"
            >
              <Plus className="h-3 w-3" />
              <span>Log Activity</span>
            </button>
          </div>

          <div className="relative pl-6 border-l border-white/10 flex flex-col gap-5 mt-2">
            {timeline.map((event) => (
              <div key={event.id} className="relative group">
                {/* Timeline node dot */}
                <div className="absolute -left-[31px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-[#0f141e] bg-white group-hover:scale-125 transition-transform" />

                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5 hover:border-white/15 hover:bg-white/[0.03] transition-all">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-white/10 px-1.5 py-0.2 font-mono text-[9px] uppercase tracking-wider text-neutral-300">
                        {event.type}
                      </span>
                      <span className="text-xs font-semibold text-white">{event.title}</span>
                    </div>
                    <span className="font-mono text-[10px] text-neutral-500 shrink-0">
                      {event.timestamp.slice(0, 16).replace('T', ' ')}
                    </span>
                  </div>
                  {event.subtitle && (
                    <div className="text-xs text-neutral-400 mt-0.5 font-mono">{event.subtitle}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Log Activity Event */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/20 bg-neutral-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-semibold text-white font-mono">Log Timeline Event</h3>
              <button
                onClick={() => setIsEventModalOpen(false)}
                className="rounded-lg p-1 text-neutral-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="mt-4 flex flex-col gap-3 font-mono text-xs">
              <div>
                <label className="text-neutral-400 uppercase text-[10px]">Event Type</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value as 'assignment' | 'dsa' | 'commit' | 'task' | 'milestone' | 'reflection')}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-neutral-900 px-3 py-2 text-white outline-none"
                >
                  <option value="commit">Git Commit</option>
                  <option value="dsa">DSA Solved</option>
                  <option value="assignment">Coursework Assignment</option>
                  <option value="milestone">Milestone Achieved</option>
                  <option value="task">Engineering Task</option>
                  <option value="reflection">Evening Reflection</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-400 uppercase text-[10px]">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Completed NeuralCache benchmark suite"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="text-neutral-400 uppercase text-[10px]">Subtitle / Details</label>
                <input
                  type="text"
                  placeholder="e.g. 5,000 req/sec sustained throughput"
                  value={eventSubtitle}
                  onChange={(e) => setEventSubtitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-white/30"
                />
              </div>

              <div className="mt-2 flex justify-end gap-2 border-t border-white/10 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="rounded-xl border border-white/10 px-3 py-1.5 text-neutral-400 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1 rounded-xl bg-white px-3 py-1.5 font-medium text-black hover:bg-neutral-200 shadow-md"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Log Activity</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
