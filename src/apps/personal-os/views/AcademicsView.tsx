import React, { useState } from 'react';
import {
  GraduationCap,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Calendar,
  Calculator,
  BookOpen,
  Award,
} from 'lucide-react';
import { usePersonalOsStore } from '@core/personal-os/personalOsStore';
import { soundEngine } from '@core/audio/soundEngine';

export const AcademicsView: React.FC = () => {
  const {
    subjects,
    cgpaPlan,
    logAttendance,
    toggleAssignment,
    updateRevisionStatus,
  } = usePersonalOsStore();

  const [simulatedSemesterGpa, setSimulatedSemesterGpa] = useState<number>(9.5);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');

  const activeSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  // Calculate projected CGPA based on simulated semester GPA
  const simulatedCgpa = (
    (cgpaPlan.currentCgpa * cgpaPlan.totalCreditsCompleted +
      simulatedSemesterGpa * cgpaPlan.semesterTargetCredits) /
    (cgpaPlan.totalCreditsCompleted + cgpaPlan.semesterTargetCredits)
  ).toFixed(2);

  const lowAttendanceSubjects = subjects.filter(
    (s) => (s.attendance.attended / (s.attendance.total || 1)) * 100 < s.attendance.minimumTarget
  );

  return (
    <div className="flex flex-col gap-6 p-6 font-sans text-neutral-200">
      {/* 1. Header & Academic Health Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-neutral-300" />
            <h2 className="text-xl font-medium tracking-tight text-white">
              Academic & Coursework Workspace
            </h2>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Real-time attendance compliance (&ge;75%), CAT/FAT preparation, assignments, and CGPA planning.
          </p>
        </div>

        {/* High-level Academic Badges */}
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-1.5 text-right font-mono">
            <div className="text-[10px] uppercase text-neutral-400">Current CGPA</div>
            <div className="text-sm font-semibold text-white">{cgpaPlan.currentCgpa} / 10.0</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-1.5 text-right font-mono">
            <div className="text-[10px] uppercase text-neutral-400">Credits Completed</div>
            <div className="text-sm font-semibold text-white">{cgpaPlan.totalCreditsCompleted}</div>
          </div>
        </div>
      </div>

      {/* 2. Critical Regulatory Attendance Alert Banner (if any subject <75%) */}
      {lowAttendanceSubjects.length > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-500/40 bg-rose-950/20 p-4 text-xs text-rose-200 backdrop-blur-md">
          <AlertTriangle className="h-5 w-5 shrink-0 text-rose-400 mt-0.5" />
          <div className="flex-1">
            <div className="font-semibold text-rose-300 uppercase tracking-wider text-[11px] font-mono">
              Mandatory Attendance Warning (&lt;75%)
            </div>
            <div className="mt-1 text-neutral-300 leading-relaxed">
              {lowAttendanceSubjects.map((s) => {
                const pct = Math.round((s.attendance.attended / s.attendance.total) * 100);
                const needed = Math.ceil(
                  (s.attendance.minimumTarget * s.attendance.total - 100 * s.attendance.attended) /
                    (100 - s.attendance.minimumTarget)
                );
                return (
                  <span key={s.id} className="block mt-0.5">
                    <strong>{s.code} ({s.name})</strong> is currently at{' '}
                    <span className="text-rose-400 font-bold">{pct}%</span>. You must attend the next{' '}
                    <span className="text-white font-bold">{Math.max(1, needed)} consecutive classes</span> to recover 75%.
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. Subjects Matrix Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {subjects.map((s) => {
          const pct = Math.round((s.attendance.attended / (s.attendance.total || 1)) * 100);
          const isBelow = pct < s.attendance.minimumTarget;
          const isSelected = activeSubject?.id === s.id;

          return (
            <div
              key={s.id}
              onClick={() => {
                soundEngine.playClick();
                setSelectedSubjectId(s.id);
              }}
              className={`flex flex-col justify-between rounded-2xl border p-4 transition-all cursor-pointer ${
                isSelected
                  ? 'border-white/30 bg-white/[0.06] shadow-xl ring-1 ring-white/10'
                  : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-neutral-300">
                    {s.code}
                  </span>
                  <span className="font-mono text-[10px] text-neutral-400">{s.credits} Credits</span>
                </div>
                <h3 className="text-sm font-semibold tracking-tight text-white line-clamp-1">{s.name}</h3>
                <p className="text-[11px] text-neutral-400 mt-0.5 truncate">{s.professor}</p>
              </div>

              {/* Attendance Bar */}
              <div className="mt-4 pt-3 border-t border-white/10">
                <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
                  <span className="text-neutral-400">Attendance</span>
                  <span
                    className={`font-semibold ${
                      isBelow ? 'text-rose-400 animate-pulse' : 'text-emerald-400'
                    }`}
                  >
                    {pct}% ({s.attendance.attended}/{s.attendance.total})
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isBelow ? 'bg-rose-500' : 'bg-emerald-400'
                    }`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>

                {/* Quick Log Attendance Buttons */}
                <div className="mt-3 flex items-center gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      soundEngine.playClick();
                      logAttendance(s.id, true);
                    }}
                    className="flex-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 py-1 text-[10px] font-mono text-emerald-300 hover:bg-emerald-500/20 transition-colors"
                  >
                    + Attend
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      soundEngine.playClick();
                      logAttendance(s.id, false);
                    }}
                    className="flex-1 rounded-lg border border-white/10 bg-white/5 py-1 text-[10px] font-mono text-neutral-400 hover:bg-white/10 transition-colors"
                  >
                    + Miss
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Split Detailed View: Assignments, Exam Schedule & CGPA Simulator */}
      {activeSubject && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Active Subject Coursework & Revisions (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {/* Subject Overview & Internal Marks */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider">
                    {activeSubject.code}
                  </span>
                  <h3 className="text-lg font-semibold text-white tracking-tight mt-0.5">
                    {activeSubject.name}
                  </h3>
                </div>
                <div className="text-right font-mono text-xs text-neutral-400">
                  <div>Faculty: {activeSubject.professor}</div>
                  <div className="text-white font-medium mt-0.5">{activeSubject.credits} Academic Credits</div>
                </div>
              </div>

              {/* Internal Marks Matrix */}
              <div className="grid grid-cols-4 gap-2.5 mt-4 text-xs font-mono">
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2.5 text-center">
                  <div className="text-[10px] text-neutral-400 uppercase">CAT-1</div>
                  <div className="text-white font-semibold mt-1">
                    {activeSubject.internalMarks.cat1 ? `${activeSubject.internalMarks.cat1}/50` : '—'}
                  </div>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2.5 text-center">
                  <div className="text-[10px] text-neutral-400 uppercase">CAT-2</div>
                  <div className="text-white font-semibold mt-1">
                    {activeSubject.internalMarks.cat2 ? `${activeSubject.internalMarks.cat2}/50` : 'Pending'}
                  </div>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2.5 text-center">
                  <div className="text-[10px] text-neutral-400 uppercase">DA / Quiz</div>
                  <div className="text-white font-semibold mt-1">
                    {(activeSubject.internalMarks.da1 || 0) + (activeSubject.internalMarks.quiz || 0)}/20
                  </div>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2.5 text-center">
                  <div className="text-[10px] text-neutral-400 uppercase">Internal Est.</div>
                  <div className="text-emerald-400 font-semibold mt-1">
                    {Math.round(((activeSubject.internalMarks.cat1 || 35) / 50) * 30 + 19)}/50
                  </div>
                </div>
              </div>
            </div>

            {/* Assignments & Lab Deliverables */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-neutral-300" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-300 font-mono">
                    Assignments & Lab Projects
                  </h4>
                </div>
                <span className="font-mono text-xs text-neutral-400">
                  {activeSubject.assignments.filter((a) => a.completed).length}/{activeSubject.assignments.length} Completed
                </span>
              </div>

              <div className="mt-3.5 flex flex-col gap-2">
                {activeSubject.assignments.map((asg) => (
                  <div
                    key={asg.id}
                    onClick={() => {
                      soundEngine.playClick();
                      toggleAssignment(activeSubject.id, asg.id);
                    }}
                    className={`flex items-start gap-3 rounded-xl border p-3 transition-all cursor-pointer ${
                      asg.completed
                        ? 'border-white/5 bg-white/[0.01] text-neutral-500 line-through'
                        : 'border-white/10 bg-white/[0.02] text-neutral-200 hover:border-white/20'
                    }`}
                  >
                    {asg.completed ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-neutral-400 mt-0.5" />
                    ) : (
                      <Circle className="h-4 w-4 shrink-0 text-neutral-500 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-white/10 px-1.5 py-0.2 font-mono text-[9px] uppercase tracking-wider text-neutral-300">
                          {asg.type}
                        </span>
                        <span className="text-xs font-medium text-white">{asg.title}</span>
                      </div>
                      <div className="text-[10px] font-mono text-neutral-400 mt-1">Due Date: {asg.dueDate}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CAT/FAT Exam Revision Topics */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-neutral-300" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-300 font-mono">
                    CAT & FAT Revision Checklist
                  </h4>
                </div>
              </div>

              <div className="mt-3.5 flex flex-col gap-2">
                {activeSubject.revisionTopics.map((topic) => (
                  <div
                    key={topic.id}
                    onClick={() => {
                      soundEngine.playClick();
                      const next =
                        topic.status === 'not_started'
                          ? 'revising'
                          : topic.status === 'revising'
                          ? 'mastered'
                          : 'not_started';
                      updateRevisionStatus(activeSubject.id, topic.id, next);
                    }}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-2.5 hover:border-white/15 transition-colors cursor-pointer"
                  >
                    <span className="text-xs text-neutral-200">{topic.topic}</span>
                    <span
                      className={`rounded px-2 py-0.5 font-mono text-[9px] uppercase font-semibold ${
                        topic.status === 'mastered'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : topic.status === 'revising'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-white/10 text-neutral-400'
                      }`}
                    >
                      {topic.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Exam Schedules & CGPA Simulator (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Exam Schedule Card */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                <Calendar className="h-4 w-4 text-neutral-300" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-300 font-mono">
                  Examination Timeline
                </h4>
              </div>

              <div className="mt-3.5 flex flex-col gap-2.5 font-mono text-xs">
                <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <span className="text-neutral-400">Continuous Assessment 1 (CAT-1)</span>
                  <span className="text-neutral-300">{activeSubject.examSchedule.cat1Date || 'Completed'}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <span className="text-neutral-400">Continuous Assessment 2 (CAT-2)</span>
                  <span className="text-amber-400 font-semibold">{activeSubject.examSchedule.cat2Date}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <span className="text-neutral-400">Final Assessment Test (FAT)</span>
                  <span className="text-white font-semibold">{activeSubject.examSchedule.fatDate}</span>
                </div>
              </div>
            </div>

            {/* Interactive CGPA Planner & Simulator */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                <Calculator className="h-4 w-4 text-neutral-300" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-300 font-mono">
                  CGPA Simulator
                </h4>
              </div>

              <div className="mt-4 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs font-mono text-neutral-300">
                  <span>Projected Semester GPA</span>
                  <span className="text-white font-bold text-sm">{simulatedSemesterGpa} / 10.0</span>
                </div>

                <input
                  type="range"
                  min="7.0"
                  max="10.0"
                  step="0.05"
                  value={simulatedSemesterGpa}
                  onChange={(e) => setSimulatedSemesterGpa(parseFloat(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-white transition-all"
                />

                <div className="mt-2 rounded-xl border border-white/10 bg-white/[0.04] p-3.5 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-mono uppercase text-neutral-400">Projected Cumulative CGPA</div>
                    <div className="text-2xl font-bold text-white font-mono mt-0.5">{simulatedCgpa}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-mono uppercase text-neutral-400">Target</div>
                    <div className="text-xs font-semibold text-emerald-400 font-mono mt-0.5">
                      {cgpaPlan.targetCgpa}
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-neutral-400 font-mono leading-relaxed mt-1">
                  Formula: Weighted credit sum across {cgpaPlan.totalCreditsCompleted} existing +{' '}
                  {cgpaPlan.semesterTargetCredits} semester credits.
                </div>
              </div>
            </div>

            {/* Academic Honor Badge */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                <Award className="h-5 w-5" />
              </div>
              <div className="text-xs">
                <div className="font-semibold text-white">Dean's Merit Standing</div>
                <div className="text-neutral-400 mt-0.5">Consistent top 5 percentile academic cohort ranking.</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
