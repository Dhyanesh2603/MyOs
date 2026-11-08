import React, { useState } from 'react';
import {
  Zap,
  Play,
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  AlertTriangle,
  GraduationCap,
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
        date: m.deadline || 'Ongoing',
        type: 'CAMPAIGN',
        tab: 'missions' as PersonalOsTab,
      })),
  ].slice(0, 5);

  const completedPrioritiesCount = dailyPlan.morningPriorities.filter((p) => p.completed).length;
  const totalPrioritiesCount = dailyPlan.morningPriorities.length;

  const deepWorkPct = Math.min(
    100,
    Math.round((dailyPlan.deepWorkLoggedMinutes / (dailyPlan.deepWorkTargetMinutes || 240)) * 100)
  );

  const lowAttendanceSubject = subjects.find(
    (s) => s.attendance.total > 0 && (s.attendance.attended / s.attendance.total) * 100 < s.attendance.minimumTarget
  );

  // Recent commits across all user projects

  return (
    <div className="flex flex-col gap-6 p-6 font-sans text-white bg-[#060913] min-h-full">
      {/* ─── 1. Asymmetrical Hero Bento Section ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left (8 cols): High-Contrast Recommendation Hero Card */}
        <div className="lg:col-span-8 relative overflow-hidden rounded-3xl border-2 border-cyan-400/80 bg-gradient-to-br from-[#0c1836] via-[#09152b] to-[#060c18] p-7 shadow-[0_0_40px_rgba(6,182,212,0.22)] flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b-2 border-indigo-900/60">
              <div className="flex items-center gap-2.5">
                <span className="flex h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-ping" />
                <span className="font-mono text-xs font-black tracking-widest uppercase text-cyan-300">
                  Momentum Engine • Optimal Next Action
                </span>
              </div>
              <span
                className={`rounded-xl px-3 py-1 font-mono text-[10px] font-black uppercase tracking-wider ${
                  recommended.urgency === 'critical'
                    ? 'bg-rose-500 text-white shadow-[0_0_12px_#f43f5e]'
                    : recommended.urgency === 'high'
                    ? 'bg-amber-400 text-black shadow-[0_0_12px_#f59e0b]'
                    : 'bg-emerald-400 text-black shadow-[0_0_12px_#34d399]'
                }`}
              >
                {recommended.urgency} Priority
              </span>
            </div>

            <div className="mt-5 space-y-2">
              <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-white drop-shadow-md">
                {recommended.title}
              </h2>
              <p className="text-sm font-medium text-cyan-100/90 leading-relaxed max-w-2xl">
                {recommended.context}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-indigo-900/60">
            <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
              <span className="rounded-lg bg-indigo-900/80 border border-indigo-700/80 px-2.5 py-1 font-bold text-cyan-300">
                Target: {recommended.targetTab.toUpperCase()}
              </span>
              <span>•</span>
              <span className="text-emerald-300 font-bold">{recommended.metadata || 'Ready to resume'}</span>
            </div>

            <button
              onClick={handleQuickResume}
              className="flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 px-6 py-3 text-xs font-black font-mono text-black shadow-[0_0_25px_rgba(6,182,212,0.5)] hover:scale-105 active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              <Play className="h-4 w-4 fill-black" />
              <span>{recommended.actionLabel}</span>
            </button>
          </div>
        </div>

        {/* Right (4 cols): Deep Work Velocity Gauge */}
        <div className="lg:col-span-4 relative overflow-hidden rounded-3xl border-2 border-emerald-500/70 bg-gradient-to-br from-[#061e18] via-[#081820] to-[#040e16] p-6 shadow-[0_0_40px_rgba(16,185,129,0.2)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-emerald-900/60">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-400" />
                <span className="font-mono text-xs font-black uppercase tracking-widest text-emerald-300">
                  Deep Work Block
                </span>
              </div>
              <span className="rounded-xl bg-emerald-500/20 border border-emerald-400/50 px-2 py-0.5 font-mono text-[10px] font-black text-emerald-300">
                {deepWorkPct}% Goal
              </span>
            </div>

            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black font-mono text-white tracking-tight drop-shadow">
                  {Math.floor(dailyPlan.deepWorkLoggedMinutes / 60)}h {dailyPlan.deepWorkLoggedMinutes % 60}m
                </span>
                <span className="text-xs font-bold font-mono text-emerald-300">
                  / {Math.floor(dailyPlan.deepWorkTargetMinutes / 60)}h Target
                </span>
              </div>

              {/* High-Contrast Progress Bar */}
              <div className="mt-4 flex h-3 w-full rounded-full bg-black/60 p-0.5 border border-emerald-500/50 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 shadow-[0_0_15px_#34d399] transition-all duration-500"
                  style={{ width: `${deepWorkPct}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-emerald-900/60">
            <button
              onClick={() => {
                soundEngine.playClick();
                startFocusMode('Deep Engineering Sprint', 25);
              }}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-400 py-2.5 text-xs font-black font-mono text-black shadow-[0_0_20px_#34d399] hover:scale-102 active:scale-98 transition-all"
            >
              <Zap className="h-4 w-4 fill-black stroke-black" />
              <span>Launch Focus Timer (25m)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── 2. Asymmetrical Split: Focus Priorities (7 cols) vs Tactical Radar (5 cols) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Today's Focus Priorities (7 cols) */}
        <div className="lg:col-span-7 flex flex-col rounded-3xl border-2 border-indigo-800/80 bg-gradient-to-br from-[#0c1328] to-[#070b16] p-6 shadow-xl">
          <div className="flex items-center justify-between pb-3.5 border-b-2 border-indigo-900/60">
            <div className="flex items-center gap-2.5">
              <Zap className="h-4 w-4 text-cyan-400" />
              <h3 className="text-sm font-black tracking-wide text-white uppercase">
                Today's Intentional Priorities
              </h3>
            </div>
            <span className="rounded-xl bg-cyan-400/20 border border-cyan-400/50 px-2.5 py-0.5 font-mono text-[11px] font-black text-cyan-300">
              {completedPrioritiesCount} of {totalPrioritiesCount || 0} Cleared
            </span>
          </div>

          <div className="mt-4 flex flex-col gap-2.5">
            {dailyPlan.morningPriorities.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-slate-400 border-2 border-dashed border-indigo-800/80 rounded-2xl">
                No priorities logged today. Set an intentional target below to ignite momentum.
              </div>
            ) : (
              dailyPlan.morningPriorities.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    soundEngine.playClick();
                    toggleMorningPriority(item.id);
                  }}
                  className={`flex items-center justify-between rounded-2xl border-2 p-3.5 cursor-pointer transition-all ${
                    item.completed
                      ? 'border-emerald-500/40 bg-emerald-950/20 text-slate-400'
                      : 'border-indigo-800/80 bg-[#070c18] text-white hover:border-cyan-400 hover:bg-[#0c1428]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button className="shrink-0">
                      {item.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      ) : (
                        <Circle className="h-5 w-5 text-cyan-400" />
                      )}
                    </button>
                    <span
                      className={`text-xs font-bold leading-snug truncate ${
                        item.completed ? 'line-through text-slate-500' : 'text-white'
                      }`}
                    >
                      {item.text}
                    </span>
                  </div>

                  <span className="shrink-0 rounded-lg bg-indigo-900/80 border border-indigo-700/80 px-2 py-0.5 font-mono text-[9px] font-black text-cyan-300 uppercase">
                    {item.tag || 'FOCUS'}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Quick-Add Priority Input */}
          <form onSubmit={handleAddPriority} className="mt-4 flex items-center gap-2">
            <input
              type="text"
              placeholder="+ Add a critical priority for today..."
              value={newPriorityText}
              onChange={(e) => setNewPriorityText(e.target.value)}
              className="flex-1 rounded-2xl border-2 border-indigo-800/80 bg-[#070b16] px-4 py-2.5 font-sans text-xs font-semibold text-white placeholder-slate-500 outline-none focus:border-cyan-400 transition-colors"
            />
            <button
              type="submit"
              className="rounded-2xl bg-cyan-400 px-4 py-2.5 text-xs font-black text-black shadow-[0_0_15px_#22d3ee] hover:scale-105 active:scale-95 transition-all"
            >
              Add
            </button>
          </form>
        </div>

        {/* Right: Academic Regulatory Status & Urgent Deadlines (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Academic Regulatory Status */}
          <div className="rounded-3xl border-2 border-indigo-800/80 bg-gradient-to-br from-[#0c142a] to-[#070b16] p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b-2 border-indigo-900/60 mb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-cyan-400" />
                <h3 className="font-mono text-xs font-black uppercase tracking-wider text-white">
                  Academic Compliance
                </h3>
              </div>
              <span className="font-mono text-[10px] font-bold text-cyan-300">
                {cgpaPlan.currentCgpa > 0 ? `CGPA ${cgpaPlan.currentCgpa}` : 'Active'}
              </span>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              {lowAttendanceSubject ? (
                <div className="rounded-2xl border-2 border-rose-500/80 bg-rose-950/30 p-3 text-rose-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
                    <span className="font-bold">{lowAttendanceSubject.code} Attendance: {Math.round((lowAttendanceSubject.attendance.attended / lowAttendanceSubject.attendance.total) * 100)}%</span>
                  </div>
                  <span className="rounded-lg bg-rose-500 text-black px-2 py-0.5 text-[9px] font-black uppercase">
                    &lt;75% ALERT
                  </span>
                </div>
              ) : subjects.length > 0 ? (
                <div className="rounded-2xl border-2 border-emerald-500/60 bg-emerald-950/20 p-3 text-emerald-200 flex items-center justify-between">
                  <span className="font-bold">All {subjects.length} Subjects Compliant</span>
                  <span className="rounded-lg bg-emerald-400 text-black px-2 py-0.5 text-[9px] font-black uppercase">
                    &ge;75% OK
                  </span>
                </div>
              ) : (
                <p className="text-slate-400 text-xs">No coursework logged yet.</p>
              )}
            </div>
          </div>

          {/* Upcoming Deadlines Rail */}
          <div className="rounded-3xl border-2 border-amber-400/80 bg-gradient-to-br from-[#1a1005] to-[#0d0802] p-6 shadow-[0_0_30px_rgba(245,158,11,0.15)]">
            <div className="flex items-center justify-between pb-3 border-b-2 border-amber-900/60 mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-amber-400" />
                <h3 className="font-mono text-xs font-black uppercase tracking-wider text-amber-200">
                  Critical Deadlines & Exams
                </h3>
              </div>
              <span className="font-mono text-[10px] font-bold text-amber-300">
                {upcomingDeadlines.length} Upcoming
              </span>
            </div>

            <div className="space-y-2.5">
              {upcomingDeadlines.length === 0 ? (
                <p className="text-xs font-mono text-amber-200/60 text-center py-4">
                  No upcoming deadlines detected across academics or missions.
                </p>
              ) : (
                upcomingDeadlines.map((dl, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      soundEngine.playClick();
                      setActiveTab(dl.tab);
                    }}
                    className="flex items-center justify-between rounded-2xl border border-amber-500/40 bg-black/50 p-3 hover:border-amber-400 transition-all cursor-pointer group"
                  >
                    <div className="min-w-0 pr-2">
                      <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                        {dl.title}
                      </h4>
                      <p className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
                        {dl.sub}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="rounded-lg bg-amber-400/20 border border-amber-400 px-2 py-0.5 font-mono text-[9px] font-black text-amber-200 block mb-0.5">
                        {dl.type}
                      </span>
                      <span className="font-mono text-[10px] text-slate-300">
                        {dl.date}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
