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

  return (
    <div className="flex flex-col gap-8 p-8 font-sans text-neutral-100 bg-[#0a0b10] min-h-full">
      {/* ─── 1. Asymmetrical Editorial Bento Section ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left (8 cols): Executive Recommended Action Card */}
        <div className="lg:col-span-8 rounded-2xl border border-white/[0.08] bg-[#10121a] p-7 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-medium uppercase tracking-wider text-neutral-400">
                  Momentum Engine • Recommended Action
                </span>
              </div>
              <span
                className={`rounded-md px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${
                  recommended.urgency === 'critical'
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    : recommended.urgency === 'high'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}
              >
                {recommended.urgency} Priority
              </span>
            </div>

            <div className="mt-6 space-y-2">
              <h2 className="text-2xl lg:text-3xl font-semibold tracking-tight text-white">
                {recommended.title}
              </h2>
              <p className="text-sm text-neutral-400 leading-relaxed max-w-2xl font-normal">
                {recommended.context}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-white/[0.06]">
            <div className="flex items-center gap-2 font-mono text-xs text-neutral-400">
              <span className="rounded border border-white/10 bg-white/[0.03] px-2 py-0.5 text-neutral-300">
                Target: {recommended.targetTab.toUpperCase()}
              </span>
              <span>•</span>
              <span className="text-neutral-400">{recommended.metadata || 'Ready to resume'}</span>
            </div>

            <button
              onClick={handleQuickResume}
              className="flex items-center justify-center gap-2 rounded-xl bg-white text-black hover:bg-neutral-200 px-5 py-2.5 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>{recommended.actionLabel}</span>
            </button>
          </div>
        </div>

        {/* Right (4 cols): Deep Work Velocity Gauge */}
        <div className="lg:col-span-4 rounded-2xl border border-white/[0.08] bg-[#10121a] p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-neutral-400" />
                <span className="font-mono text-xs font-medium uppercase tracking-wider text-neutral-400">
                  Deep Work Block
                </span>
              </div>
              <span className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 font-mono text-[10px] font-medium text-neutral-300">
                {deepWorkPct}% Goal
              </span>
            </div>

            <div className="my-6">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl lg:text-5xl font-light font-mono text-white tracking-tight">
                  {Math.floor(dailyPlan.deepWorkLoggedMinutes / 60)}h {dailyPlan.deepWorkLoggedMinutes % 60}m
                </span>
                <span className="text-xs font-mono text-neutral-500">
                  / {Math.floor(dailyPlan.deepWorkTargetMinutes / 60)}h
                </span>
              </div>

              {/* Minimalist Hairline Progress Bar */}
              <div className="mt-5 h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full bg-white transition-all duration-500"
                  style={{ width: `${deepWorkPct}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/[0.06]">
            <button
              onClick={() => {
                soundEngine.playClick();
                startFocusMode('Deep Engineering Sprint', 25);
              }}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 py-2.5 text-xs font-semibold text-neutral-950 transition-colors cursor-pointer"
            >
              <Zap className="h-3.5 w-3.5 fill-current" />
              <span>Launch Focus Session (25m)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── 2. Asymmetrical Split: Focus Priorities (7 cols) vs Tactical Rail (5 cols) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Today's Focus Priorities (7 cols) */}
        <div className="lg:col-span-7 flex flex-col rounded-2xl border border-white/[0.08] bg-[#10121a] p-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-medium uppercase tracking-wider text-neutral-400">
                Today's Intentional Priorities
              </span>
            </div>
            <span className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 font-mono text-[10px] text-neutral-300">
              {completedPrioritiesCount} of {totalPrioritiesCount || 0} Cleared
            </span>
          </div>

          <div className="mt-5 flex flex-col gap-2.5">
            {dailyPlan.morningPriorities.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-neutral-500 border border-dashed border-white/10 rounded-xl">
                No priorities logged today. Set an intentional target below to initiate momentum.
              </div>
            ) : (
              dailyPlan.morningPriorities.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    soundEngine.playClick();
                    toggleMorningPriority(item.id);
                  }}
                  className={`flex items-center justify-between rounded-xl border p-3.5 cursor-pointer transition-colors ${
                    item.completed
                      ? 'border-emerald-500/20 bg-emerald-500/[0.03] text-neutral-400'
                      : 'border-white/[0.06] bg-black/30 hover:border-white/20 text-white'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button className="shrink-0 text-neutral-400">
                      {item.completed ? (
                        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
                      ) : (
                        <Circle className="h-4.5 w-4.5 text-neutral-600 hover:text-neutral-400" />
                      )}
                    </button>
                    <span
                      className={`text-xs font-medium leading-snug truncate ${
                        item.completed ? 'line-through text-neutral-500' : 'text-neutral-200'
                      }`}
                    >
                      {item.text}
                    </span>
                  </div>

                  <span className="shrink-0 rounded border border-white/10 bg-white/[0.03] px-2 py-0.5 font-mono text-[9px] text-neutral-400 uppercase">
                    {item.tag || 'FOCUS'}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Quick-Add Priority Input */}
          <form onSubmit={handleAddPriority} className="mt-5 flex items-center gap-2">
            <input
              type="text"
              placeholder="+ Add an intentional priority for today..."
              value={newPriorityText}
              onChange={(e) => setNewPriorityText(e.target.value)}
              className="flex-1 rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 font-sans text-xs text-white placeholder-neutral-500 outline-none focus:border-white/30 transition-colors"
            />
            <button
              type="submit"
              className="rounded-xl bg-white text-black hover:bg-neutral-200 px-4 py-2 text-xs font-semibold transition-colors cursor-pointer"
            >
              Add
            </button>
          </form>
        </div>

        {/* Right: Academic Compliance & Urgent Deadlines (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Academic Compliance */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#10121a] p-6">
            <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.06] mb-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-neutral-400" />
                <span className="font-mono text-xs font-medium uppercase tracking-wider text-neutral-400">
                  Academic Compliance
                </span>
              </div>
              <span className="font-mono text-[10px] text-neutral-400">
                {cgpaPlan.currentCgpa > 0 ? `CGPA ${cgpaPlan.currentCgpa}` : 'Active'}
              </span>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              {lowAttendanceSubject ? (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/[0.05] p-3 text-rose-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
                    <span className="font-medium">{lowAttendanceSubject.code} Attendance: {Math.round((lowAttendanceSubject.attendance.attended / lowAttendanceSubject.attendance.total) * 100)}%</span>
                  </div>
                  <span className="rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 text-[9px] font-semibold uppercase">
                    &lt;75% ALERT
                  </span>
                </div>
              ) : subjects.length > 0 ? (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-3 text-emerald-300 flex items-center justify-between">
                  <span className="font-medium">All {subjects.length} Subjects Compliant</span>
                  <span className="rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[9px] font-semibold uppercase">
                    &ge;75% OK
                  </span>
                </div>
              ) : (
                <p className="text-neutral-500 text-xs">No coursework logged yet.</p>
              )}
            </div>
          </div>

          {/* Upcoming Deadlines Rail */}
          <div className="rounded-2xl border border-amber-500/20 bg-[#141210] p-6">
            <div className="flex items-center justify-between pb-3.5 border-b border-amber-500/15 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-amber-400" />
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-amber-300">
                  Critical Deadlines
                </span>
              </div>
              <span className="font-mono text-[10px] text-amber-300/80">
                {upcomingDeadlines.length} Upcoming
              </span>
            </div>

            <div className="space-y-2.5">
              {upcomingDeadlines.length === 0 ? (
                <p className="text-xs font-mono text-neutral-500 text-center py-4">
                  No upcoming deadlines detected across academics or milestones.
                </p>
              ) : (
                upcomingDeadlines.map((dl, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      soundEngine.playClick();
                      setActiveTab(dl.tab);
                    }}
                    className="flex items-center justify-between rounded-xl border border-amber-500/15 bg-black/40 p-3 hover:border-amber-500/40 transition-colors cursor-pointer group"
                  >
                    <div className="min-w-0 pr-2">
                      <h4 className="text-xs font-medium text-white group-hover:text-amber-200 transition-colors truncate">
                        {dl.title}
                      </h4>
                      <p className="text-[10px] font-mono text-neutral-500 truncate mt-0.5">
                        {dl.sub}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="rounded border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 font-mono text-[9px] text-amber-300 block mb-0.5">
                        {dl.type}
                      </span>
                      <span className="font-mono text-[10px] text-neutral-400">
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
