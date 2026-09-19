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
} from 'lucide-react';
import { usePersonalOsStore } from '@core/personal-os/personalOsStore';
import { soundEngine } from '@core/audio/soundEngine';

export const DailyTimelineView: React.FC = () => {
  const {
    dailyPlan,
    timeline,
    toggleMorningPriority,
    addMorningPriority,
    logDeepWorkMinutes,
    startFocusMode,
  } = usePersonalOsStore();

  const [activeTab, setActiveTab] = useState<'planner' | 'timeline'>('planner');
  const [priorityText, setPriorityText] = useState('');
  const [priorityTag, setPriorityTag] = useState('ENGINEERING');

  const handleAddPriority = (e: React.FormEvent) => {
    e.preventDefault();
    if (!priorityText.trim()) return;
    soundEngine.playClick();
    addMorningPriority(priorityText.trim(), priorityTag);
    setPriorityText('');
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
                {dailyPlan.morningPriorities.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      soundEngine.playClick();
                      toggleMorningPriority(item.id);
                    }}
                    className={`flex items-center justify-between rounded-xl border p-3 transition-all cursor-pointer ${
                      item.completed
                        ? 'border-white/5 bg-white/[0.01] text-neutral-500 line-through'
                        : 'border-white/10 bg-white/[0.02] text-neutral-200 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {item.completed ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-neutral-400" />
                      ) : (
                        <Circle className="h-4 w-4 shrink-0 text-neutral-500" />
                      )}
                      <span className="text-xs">{item.text}</span>
                    </div>
                    {item.tag && (
                      <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-neutral-300">
                        {item.tag}
                      </span>
                    )}
                  </div>
                ))}
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
                  className="rounded-xl border border-white/10 bg-neutral-900 px-2.5 py-2 text-xs font-mono text-neutral-300 outline-none"
                >
                  <option value="ENGINEERING">ENG</option>
                  <option value="DSA">DSA</option>
                  <option value="ACADEMICS">ACAD</option>
                  <option value="CAREER">CAREER</option>
                </select>
                <button
                  type="submit"
                  className="flex items-center gap-1 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-medium text-white hover:bg-white/20 transition-all"
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

              {/* Wins */}
              <div className="mt-3.5">
                <div className="text-[10px] font-mono uppercase text-emerald-400 mb-1.5">What went exceptionally well (Wins)</div>
                <div className="flex flex-col gap-1.5">
                  {dailyPlan.eveningReflection.wins.map((w, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-neutral-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mistakes */}
              <div className="mt-4 pt-3 border-t border-white/10">
                <div className="text-[10px] font-mono uppercase text-rose-400 mb-1.5">Mistakes & Anti-Patterns to Prevent</div>
                <div className="flex flex-col gap-1.5">
                  {dailyPlan.eveningReflection.mistakes.map((m, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-neutral-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                      <span>{m}</span>
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
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <div className="text-[10px] text-neutral-400 uppercase">Focus Level</div>
                  <div className="text-lg font-bold text-white mt-1">
                    {dailyPlan.eveningReflection.focusLevel} / 5
                  </div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">High Intensity</div>
                </div>

                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <div className="text-[10px] text-neutral-400 uppercase">Energy Level</div>
                  <div className="text-lg font-bold text-white mt-1">
                    {dailyPlan.eveningReflection.energyLevel} / 5
                  </div>
                  <div className="text-[10px] text-sky-400 mt-0.5">Sustained</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 2. Unified Chronological Timeline Stream */
        <div className="flex flex-col gap-3">
          <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 pb-2 border-b border-white/5">
            Chronological Activity Log
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
    </div>
  );
};
