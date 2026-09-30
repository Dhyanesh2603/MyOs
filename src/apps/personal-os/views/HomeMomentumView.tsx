import React, { useState } from 'react';
import {
  Zap,
  Play,
  CheckCircle2,
  Circle,
  Clock,
  ArrowUpRight,
  Calendar,
  Flame,
  GitCommit,
  AlertTriangle,
  Plus,
  Compass,
} from 'lucide-react';
import { usePersonalOsStore, PersonalOsTab } from '@core/personal-os/personalOsStore';
import { soundEngine } from '@core/audio/soundEngine';

export const HomeMomentumView: React.FC = () => {
  const {
    getRecommendedNextAction,
    dailyPlan,
    toggleMorningPriority,
    addMorningPriority,
    startFocusMode,
    setActiveTab,
    projects,
    subjects,
    missions,
    companies,
    cgpaPlan,
  } = usePersonalOsStore();

  const [newPriorityText, setNewPriorityText] = useState('');
  const recommended = getRecommendedNextAction();

  const handleQuickResume = () => {
    soundEngine.playClick();
    if (recommended.targetTab === 'daily') {
      startFocusMode(recommended.title, 25);
    } else {
      setActiveTab(recommended.targetTab);
    }
  };

  const handleAddPriority = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPriorityText.trim()) return;
    soundEngine.playClick();
    addMorningPriority(newPriorityText.trim(), 'FOCUS');
    setNewPriorityText('');
  };

  // Compile upcoming deadlines across real user academics, missions, and companies
  const upcomingDeadlines = [
    ...subjects.flatMap((s) =>
      s.assignments
        .filter((a) => !a.completed)
        .map((a) => ({
          title: a.title,
          sub: `${s.code} • ${s.name}`,
          date: a.dueDate,
          type: a.type.toUpperCase(),
          tab: 'academics' as PersonalOsTab,
        }))
    ),
    ...companies
      .filter((c) => c.stage === 'technical' || c.stage === 'oa')
      .map((c) => ({
        title: `${c.companyName}: ${c.role}`,
        sub: `Stage: ${c.stage.toUpperCase()}`,
        date: c.interviewRounds[1]?.date || c.applicationDate || 'TBD',
        type: 'INTERVIEW',
        tab: 'career' as PersonalOsTab,
      })),
    ...missions
      .filter((m) => m.status === 'active')
      .map((m) => ({
        title: m.title,
        sub: m.tagline,
        date: m.deadline,
        type: 'CAMPAIGN',
        tab: 'missions' as PersonalOsTab,
      })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 5);

  const completedPrioritiesCount = dailyPlan.morningPriorities.filter((p) => p.completed).length;
  const totalPrioritiesCount = dailyPlan.morningPriorities.length;
  const deepWorkPct = Math.min(
    100,
    Math.round((dailyPlan.deepWorkLoggedMinutes / (dailyPlan.deepWorkTargetMinutes || 240)) * 100)
  );

  const activeMission = missions.find((m) => m.status === 'active') || missions[0];

  const lowAttendanceSubject = subjects.find(
    (s) => s.attendance.total > 0 && (s.attendance.attended / s.attendance.total) * 100 < s.attendance.minimumTarget
  );

  // Recent commits across all user projects
  const recentCommits = projects.flatMap((p) => (p.recentCommits || []).map((c) => ({ ...c, projectName: p.name }))).slice(0, 3);

  return (
    <div className="flex flex-col gap-6 p-6 font-sans text-neutral-200">
      {/* 1. Hero Intelligence Card: "WHAT SHOULD I WORK ON NEXT?" */}
      <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-mono text-[11px] font-semibold tracking-wider uppercase text-neutral-400">
              Momentum Engine • Recommendation
            </span>
          </div>
          <span
            className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${
              recommended.urgency === 'critical'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : recommended.urgency === 'high'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            }`}
          >
            {recommended.urgency} Priority
          </span>
        </div>

        <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-white">
              {recommended.title}
            </h2>
            <p className="text-xs md:text-sm text-neutral-300 leading-relaxed font-sans">
              {recommended.context}
            </p>
          </div>

          <button
            onClick={handleQuickResume}
            className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-xs md:text-sm font-semibold font-mono text-black shadow-xl hover:bg-neutral-200 active:scale-95 transition-all shrink-0"
          >
            <Play className="h-4 w-4 fill-black" />
            <span>{recommended.actionLabel}</span>
          </button>
        </div>
      </div>

      {/* 2. Three Momentum Telemetry Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Deep Work Gauge */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="font-mono uppercase tracking-wider text-[11px]">Deep Work Daily Progress</span>
            <Clock className="h-3.5 w-3.5 text-neutral-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-white font-mono">
              {Math.floor(dailyPlan.deepWorkLoggedMinutes / 60)}h {dailyPlan.deepWorkLoggedMinutes % 60}m
            </span>
            <span className="text-xs text-neutral-400 font-mono">
              / {Math.floor(dailyPlan.deepWorkTargetMinutes / 60)}h goal
            </span>
          </div>
          <div className="mt-3 w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${deepWorkPct}%` }}
            />
          </div>
        </div>

        {/* Sprint Milestones */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="font-mono uppercase tracking-wider text-[11px]">Active Campaign</span>
            <Flame className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-white font-mono">
              {completedPrioritiesCount}/{totalPrioritiesCount || 0}
            </span>
            <span className="text-xs text-neutral-400">Priorities Cleared</span>
          </div>
          <div className="mt-3 text-[11px] text-neutral-400 flex items-center justify-between font-mono">
            <span className="truncate pr-2">{activeMission ? activeMission.title : 'No active campaign'}</span>
            <span className={activeMission ? 'text-emerald-400' : 'text-neutral-500'}>
              {activeMission ? `${activeMission.progress}%` : 'Idle'}
            </span>
          </div>
        </div>

        {/* Academic Regulatory Status */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="font-mono uppercase tracking-wider text-[11px]">Academic Health</span>
            <AlertTriangle className="h-3.5 w-3.5 text-neutral-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-white font-mono">
              {cgpaPlan.currentCgpa > 0 ? cgpaPlan.currentCgpa : '—'}
            </span>
            <span className="text-xs text-neutral-400">
              {cgpaPlan.targetCgpa > 0 ? `CGPA (Target: ${cgpaPlan.targetCgpa})` : 'CGPA (Unset)'}
            </span>
          </div>
          <div className="mt-3 text-[11px] text-neutral-400 flex items-center justify-between font-mono">
            {lowAttendanceSubject ? (
              <>
                <span>{lowAttendanceSubject.code} Attendance: {Math.round((lowAttendanceSubject.attendance.attended / lowAttendanceSubject.attendance.total) * 100)}%</span>
                <span className="text-rose-400 font-semibold">&lt;75% Alert</span>
              </>
            ) : subjects.length > 0 ? (
              <>
                <span>All {subjects.length} Subjects Compliant</span>
                <span className="text-emerald-400 font-semibold">&ge;75% OK</span>
              </>
            ) : (
              <>
                <span>No Coursework Logged</span>
                <span className="text-neutral-500">Not Set</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 3. Two-Column Workspace Split: Today's Focus & Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Today's Focus Priorities (7 cols) */}
        <div className="lg:col-span-7 flex flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-neutral-300" />
              <h3 className="text-sm font-semibold tracking-wide text-white">Today's Focus & Priorities</h3>
            </div>
            <span className="font-mono text-[11px] text-neutral-400">
              {completedPrioritiesCount} of {totalPrioritiesCount || 0} completed
            </span>
          </div>

          <div className="mt-3.5 flex flex-col gap-2">
            {dailyPlan.morningPriorities.length === 0 ? (
              <div className="p-6 text-center text-xs font-mono text-neutral-500 border border-dashed border-white/10 rounded-xl">
                No priorities logged today. Add an intentional goal below to start your momentum.
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
                      : 'border-white/10 bg-white/[0.03] text-neutral-200 hover:border-white/20 hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {item.completed ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-neutral-400" />
                    ) : (
                      <Circle className="h-4 w-4 shrink-0 text-neutral-500 group-hover:text-white" />
                    )}
                    <span className="text-xs truncate">{item.text}</span>
                  </div>
                  {item.tag && (
                    <span className="shrink-0 rounded bg-white/10 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-neutral-300">
                      {item.tag}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Quick Add Priority Input */}
          <form onSubmit={handleAddPriority} className="mt-3.5 flex items-center gap-2">
            <input
              type="text"
              placeholder="Add next high-leverage focus task..."
              value={newPriorityText}
              onChange={(e) => setNewPriorityText(e.target.value)}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs text-white placeholder-neutral-500 outline-none focus:border-white/30 transition-colors"
            />
            <button
              type="submit"
              className="flex items-center gap-1 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-medium text-white hover:bg-white/20 transition-all font-mono"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add</span>
            </button>
          </form>
        </div>

        {/* Right: Upcoming Deadlines & Commit Ticker (5 cols) */}
        <div className="lg:col-span-5 flex flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-neutral-300" />
              <h3 className="text-sm font-semibold tracking-wide text-white">Upcoming Deadlines</h3>
            </div>
            <span className="font-mono text-[10px] text-neutral-400">CHRONOLOGICAL</span>
          </div>

          <div className="mt-3.5 flex flex-col gap-2.5">
            {upcomingDeadlines.length === 0 ? (
              <div className="p-6 text-center text-xs font-mono text-neutral-500 border border-dashed border-white/10 rounded-xl">
                No upcoming deadlines recorded. Coursework, interview dates, and mission deadlines will appear here automatically.
              </div>
            ) : (
              upcomingDeadlines.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    soundEngine.playClick();
                    setActiveTab(item.tab);
                  }}
                  className="group flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-2.5 hover:border-white/15 hover:bg-white/[0.04] transition-all cursor-pointer"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="rounded bg-white/10 px-1.5 py-0.2 font-mono text-[9px] uppercase tracking-wider text-neutral-300">
                        {item.type}
                      </span>
                      <span className="truncate text-xs font-medium text-neutral-200 group-hover:text-white">
                        {item.title}
                      </span>
                    </div>
                    <div className="truncate text-[10px] text-neutral-400 mt-0.5">{item.sub}</div>
                  </div>
                  <div className="flex items-center gap-1 pl-2 font-mono text-[11px] text-neutral-400 group-hover:text-neutral-200 shrink-0">
                    <span>{item.date}</span>
                    <ArrowUpRight className="h-3 w-3 opacity-60 group-hover:opacity-100" />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Recent Git Commits Stream */}
          <div className="mt-5 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
              <span className="font-mono text-[10px] uppercase tracking-wider">Recent Repository Activity</span>
              <GitCommit className="h-3.5 w-3.5" />
            </div>
            <div className="flex flex-col gap-1.5">
              {recentCommits.length === 0 ? (
                <div className="text-xs text-neutral-500 font-mono italic">
                  No repository commits logged yet.
                </div>
              ) : (
                recentCommits.map((c) => (
                  <div key={c.hash} className="flex items-center justify-between text-xs text-neutral-400 font-mono">
                    <span className="truncate max-w-[240px] text-neutral-300">{c.message}</span>
                    <span className="text-[10px] text-neutral-400">{c.hash}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Active Engineering Campaigns (Missions Preview) */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-neutral-300" />
            <h3 className="text-sm font-semibold tracking-wide text-white">Active Engineering Campaigns</h3>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('missions');
            }}
            className="flex items-center gap-1 font-mono text-xs text-neutral-400 hover:text-white transition-colors"
          >
            <span>View All Missions</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {missions.length === 0 ? (
          <div className="mt-4 p-8 text-center text-xs font-mono text-neutral-500 border border-dashed border-white/10 rounded-xl flex flex-col items-center gap-2">
            <p>No engineering campaigns launched yet.</p>
            <button
              onClick={() => {
                soundEngine.playClick();
                setActiveTab('missions');
              }}
              className="rounded-lg bg-white/10 px-3 py-1.5 text-neutral-200 hover:bg-white/20 transition-all font-mono"
            >
              + Launch First Campaign
            </button>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {missions.map((m) => (
              <div
                key={m.id}
                onClick={() => {
                  soundEngine.playClick();
                  setActiveTab('missions');
                }}
                className="flex flex-col justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3.5 hover:border-white/20 hover:bg-white/[0.06] transition-all cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-neutral-300">
                      {m.category}
                    </span>
                    <span className="font-mono text-xs text-white font-semibold">{m.progress}%</span>
                  </div>
                  <div className="text-xs font-semibold text-white tracking-tight line-clamp-1">{m.title}</div>
                  <div className="text-[11px] text-neutral-400 mt-1 line-clamp-2 leading-relaxed">{m.tagline}</div>
                </div>

                <div className="mt-3.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-neutral-400">
                  <span>{m.estimatedCompletion}</span>
                  <span className="capitalize text-neutral-300">{m.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Minimal Engineering Quote */}
      <div className="py-2 text-center">
        <p className="font-mono text-[11px] text-neutral-400 tracking-wide">
          &quot;Momentum is the only moat in engineering. Focus is what preserves it.&quot;
        </p>
      </div>
    </div>
  );
};
