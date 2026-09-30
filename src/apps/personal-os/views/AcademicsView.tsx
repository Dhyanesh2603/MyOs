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
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Check,
} from 'lucide-react';
import { usePersonalOsStore } from '@core/personal-os/personalOsStore';
import { soundEngine } from '@core/audio/soundEngine';
import type { AcademicAssignment } from '@core/personal-os/types';

export const AcademicsView: React.FC = () => {
  const {
    subjects,
    cgpaPlan,
    logAttendance,
    adjustAttendanceCount,
    addSubject,
    updateSubject,
    deleteSubject,
    toggleAssignment,
    addAssignment,
    deleteAssignment,
    updateRevisionStatus,
    addRevisionTopic,
    deleteRevisionTopic,
    updateCgpaPlan,
  } = usePersonalOsStore();

  const [simulatedSemesterGpa, setSimulatedSemesterGpa] = useState<number>(9.5);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');

  // Subject Modal State
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [subjectModalMode, setSubjectModalMode] = useState<'add' | 'edit'>('add');
  const [subCode, setSubCode] = useState('');
  const [subName, setSubName] = useState('');
  const [subCredits, setSubCredits] = useState(4);
  const [subProfessor, setSubProfessor] = useState('');
  const [subMinTarget, setSubMinTarget] = useState(75);
  const [subAttended, setSubAttended] = useState(24);
  const [subTotal, setSubTotal] = useState(28);

  // CGPA Modal State
  const [isCgpaModalOpen, setIsCgpaModalOpen] = useState(false);
  const [cgpaCurrent, setCgpaCurrent] = useState(cgpaPlan.currentCgpa);
  const [cgpaTarget, setCgpaTarget] = useState(cgpaPlan.targetCgpa);
  const [cgpaCompletedCredits, setCgpaCompletedCredits] = useState(cgpaPlan.totalCreditsCompleted);
  const [cgpaSemesterCredits, setCgpaSemesterCredits] = useState(cgpaPlan.semesterTargetCredits);

  // Assignment Modal State
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [asgTitle, setAsgTitle] = useState('');
  const [asgType, setAsgType] = useState<AcademicAssignment['type']>('assignment');
  const [asgDueDate, setAsgDueDate] = useState('');
  const [asgWeightage, setAsgWeightage] = useState(10);

  // Quick Revision Topic input
  const [newTopicInput, setNewTopicInput] = useState('');

  // Quick Attendance Adjust modal or state
  const [isAdjustAttendanceOpen, setIsAdjustAttendanceOpen] = useState(false);
  const [adjustAttended, setAdjustAttended] = useState(0);
  const [adjustTotal, setAdjustTotal] = useState(0);

  const activeSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  // Calculate projected CGPA based on simulated semester GPA
  const simulatedCgpa = (
    (cgpaPlan.currentCgpa * cgpaPlan.totalCreditsCompleted +
      simulatedSemesterGpa * cgpaPlan.semesterTargetCredits) /
    (cgpaPlan.totalCreditsCompleted + cgpaPlan.semesterTargetCredits)
  ).toFixed(2);

  const lowAttendanceSubjects = subjects.filter(
    (s) => s.attendance.total > 0 && (s.attendance.attended / s.attendance.total) * 100 < s.attendance.minimumTarget
  );

  const handleOpenAddSubject = () => {
    soundEngine.playClick();
    setSubjectModalMode('add');
    setSubCode('');
    setSubName('');
    setSubCredits(4);
    setSubProfessor('');
    setSubMinTarget(75);
    setSubAttended(24);
    setSubTotal(28);
    setIsSubjectModalOpen(true);
  };

  const handleOpenEditSubject = () => {
    if (!activeSubject) return;
    soundEngine.playClick();
    setSubjectModalMode('edit');
    setSubCode(activeSubject.code);
    setSubName(activeSubject.name);
    setSubCredits(activeSubject.credits);
    setSubProfessor(activeSubject.professor);
    setSubMinTarget(activeSubject.attendance.minimumTarget);
    setSubAttended(activeSubject.attendance.attended);
    setSubTotal(activeSubject.attendance.total);
    setIsSubjectModalOpen(true);
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subCode.trim() || !subName.trim()) return;
    soundEngine.playClick();

    if (subjectModalMode === 'add') {
      addSubject({
        code: subCode.trim().toUpperCase(),
        name: subName.trim(),
        credits: Number(subCredits) || 3,
        professor: subProfessor.trim() || 'Faculty Department',
        minimumTarget: Number(subMinTarget) || 75,
        attended: Number(subAttended) || 0,
        total: Number(subTotal) || 0,
      });
    } else if (activeSubject) {
      updateSubject(activeSubject.id, {
        code: subCode.trim().toUpperCase(),
        name: subName.trim(),
        credits: Number(subCredits) || 3,
        professor: subProfessor.trim() || activeSubject.professor,
        attendance: {
          attended: Number(subAttended) || 0,
          total: Number(subTotal) || 0,
          minimumTarget: Number(subMinTarget) || 75,
        },
      });
    }
    setIsSubjectModalOpen(false);
  };

  const handleDeleteActiveSubject = () => {
    if (!activeSubject) return;
    if (confirm(`Are you sure you want to delete ${activeSubject.code} - ${activeSubject.name}?`)) {
      soundEngine.playClick();
      deleteSubject(activeSubject.id);
      const remaining = subjects.filter((s) => s.id !== activeSubject.id);
      if (remaining[0]) {
        setSelectedSubjectId(remaining[0].id);
      }
    }
  };

  const handleSaveCgpa = (e: React.FormEvent) => {
    e.preventDefault();
    soundEngine.playClick();
    updateCgpaPlan({
      currentCgpa: Number(cgpaCurrent) || 9.0,
      targetCgpa: Number(cgpaTarget) || 9.5,
      totalCreditsCompleted: Number(cgpaCompletedCredits) || 80,
      semesterTargetCredits: Number(cgpaSemesterCredits) || 24,
    });
    setIsCgpaModalOpen(false);
  };

  const handleOpenAddAssignment = () => {
    soundEngine.playClick();
    setAsgTitle('');
    setAsgType('assignment');
    setAsgDueDate(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0] || '2026-10-15');
    setAsgWeightage(10);
    setIsAssignmentModalOpen(true);
  };

  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubject || !asgTitle.trim()) return;
    soundEngine.playClick();
    addAssignment(activeSubject.id, asgTitle.trim(), asgDueDate, Number(asgWeightage) || 10, asgType);
    setIsAssignmentModalOpen(false);
  };

  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubject || !newTopicInput.trim()) return;
    soundEngine.playClick();
    addRevisionTopic(activeSubject.id, newTopicInput.trim());
    setNewTopicInput('');
  };

  const handleOpenAdjustAttendance = () => {
    if (!activeSubject) return;
    soundEngine.playClick();
    setAdjustAttended(activeSubject.attendance.attended);
    setAdjustTotal(activeSubject.attendance.total);
    setIsAdjustAttendanceOpen(true);
  };

  const handleSaveAdjustAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubject) return;
    soundEngine.playClick();
    adjustAttendanceCount(activeSubject.id, Number(adjustAttended) || 0, Number(adjustTotal) || 0);
    setIsAdjustAttendanceOpen(false);
  };

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

        {/* High-level Academic Badges & Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleOpenAddSubject}
            className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-mono text-white hover:bg-white/20 transition-all shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Subject</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              setCgpaCurrent(cgpaPlan.currentCgpa);
              setCgpaTarget(cgpaPlan.targetCgpa);
              setCgpaCompletedCredits(cgpaPlan.totalCreditsCompleted);
              setCgpaSemesterCredits(cgpaPlan.semesterTargetCredits);
              setIsCgpaModalOpen(true);
            }}
            className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs font-mono text-neutral-300 hover:border-white/25 hover:bg-white/[0.05] transition-all"
            title="Click to edit CGPA configuration"
          >
            <Pencil className="h-3 w-3 text-neutral-400" />
            <span>Edit CGPA Plan</span>
          </button>

          <div className="rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-1.5 text-right font-mono">
            <div className="text-[10px] uppercase text-neutral-400">Current CGPA</div>
            <div className="text-sm font-semibold text-white">
              {cgpaPlan.currentCgpa > 0 ? `${cgpaPlan.currentCgpa} / 10.0` : '—'}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-1.5 text-right font-mono">
            <div className="text-[10px] uppercase text-neutral-400">Credits Completed</div>
            <div className="text-sm font-semibold text-white">{cgpaPlan.totalCreditsCompleted || 0}</div>
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
                const total = s.attendance.total || 1;
                const pct = Math.round((s.attendance.attended / total) * 100);
                const needed = Math.ceil(
                  (s.attendance.minimumTarget * total - 100 * s.attendance.attended) /
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

      {subjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-white/10 bg-white/[0.01] p-8">
          <GraduationCap className="h-12 w-12 text-neutral-500 mb-3" />
          <h3 className="text-base font-semibold text-white">No Academic Subjects Enrolled</h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-md">
            Add your college courses, attendance requirements (≥75%), faculty information, CAT/FAT exams, and assignments.
          </p>
          <button
            onClick={handleOpenAddSubject}
            className="mt-4 flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-neutral-200 transition-all shadow-md font-mono"
          >
            <Plus className="h-4 w-4" />
            <span>Add Your First Subject</span>
          </button>
        </div>
      ) : (
        <>
          {/* 3. Subjects Matrix Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {subjects.map((s) => {
          const total = s.attendance.total || 1;
          const pct = Math.round((s.attendance.attended / total) * 100);
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
            {/* Subject Overview & Action Bar */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider">
                      {activeSubject.code}
                    </span>
                    <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-[9px] text-neutral-300">
                      Target &ge; {activeSubject.attendance.minimumTarget}%
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white tracking-tight mt-0.5">
                    {activeSubject.name}
                  </h3>
                  <div className="text-xs font-mono text-neutral-400 mt-1">
                    Faculty: {activeSubject.professor} • {activeSubject.credits} Academic Credits
                  </div>
                </div>

                {/* Subject Actions: Adjust counts, Edit, Delete */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleOpenAdjustAttendance}
                    className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-mono text-neutral-300 hover:bg-white/10 transition-colors"
                  >
                    Attendance ({activeSubject.attendance.attended}/{activeSubject.attendance.total})
                  </button>
                  <button
                    onClick={handleOpenEditSubject}
                    className="flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-mono text-neutral-300 hover:bg-white/10 transition-colors"
                  >
                    <Pencil className="h-3 w-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={handleDeleteActiveSubject}
                    className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-1.5 text-rose-400 hover:bg-rose-500/20 transition-colors"
                    title="Delete Subject"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
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
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-neutral-400">
                    {activeSubject.assignments.filter((a) => a.completed).length}/{activeSubject.assignments.length} Completed
                  </span>
                  <button
                    onClick={handleOpenAddAssignment}
                    className="flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-2 py-1 text-[11px] font-mono text-neutral-200 hover:bg-white/10 transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              <div className="mt-3.5 flex flex-col gap-2">
                {activeSubject.assignments.length === 0 ? (
                  <div className="p-4 text-center text-xs font-mono text-neutral-500 border border-dashed border-white/10 rounded-xl">
                    No coursework deliverables recorded yet. Click &quot;Add&quot; to log assignments or quizzes.
                  </div>
                ) : (
                  activeSubject.assignments.map((asg) => (
                    <div
                      key={asg.id}
                      onClick={() => {
                        soundEngine.playClick();
                        toggleAssignment(activeSubject.id, asg.id);
                      }}
                      className={`group flex items-start justify-between gap-3 rounded-xl border p-3 transition-all cursor-pointer ${
                        asg.completed
                          ? 'border-white/5 bg-white/[0.01] text-neutral-500 line-through'
                          : 'border-white/10 bg-white/[0.02] text-neutral-200 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
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
                          <div className="text-[10px] font-mono text-neutral-400 mt-1">
                            Due Date: {asg.dueDate} • Weightage: {asg.weightagePercent || 10}%
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          soundEngine.playClick();
                          deleteAssignment(activeSubject.id, asg.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-rose-400 transition-opacity"
                        title="Delete Assignment"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                )}
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
                <span className="text-[10px] font-mono text-neutral-400">Click topic to toggle status</span>
              </div>

              {/* Inline Topic Add Form */}
              <form onSubmit={handleAddTopic} className="mt-3 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Add exam revision syllabus topic..."
                  value={newTopicInput}
                  onChange={(e) => setNewTopicInput(e.target.value)}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-white/30"
                />
                <button
                  type="submit"
                  className="flex items-center gap-1 rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-mono text-white hover:bg-white/20 transition-all"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add</span>
                </button>
              </form>

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
                    className="group flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-2.5 hover:border-white/15 transition-colors cursor-pointer"
                  >
                    <span className="text-xs text-neutral-200">{topic.topic}</span>
                    <div className="flex items-center gap-2">
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
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          soundEngine.playClick();
                          deleteRevisionTopic(activeSubject.id, topic.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-rose-400 transition-opacity"
                        title="Delete Topic"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
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
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-neutral-300" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-300 font-mono">
                    CGPA Simulator
                  </h4>
                </div>
                <button
                  onClick={() => setIsCgpaModalOpen(true)}
                  className="text-[10px] font-mono text-neutral-400 hover:text-white underline"
                >
                  Configure
                </button>
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

            {/* Academic Standing Badge */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                <Award className="h-5 w-5" />
              </div>
              <div className="text-xs">
                <div className="font-semibold text-white">Academic Cohort Standing</div>
                <div className="text-neutral-400 mt-0.5">Top 5 percentile standing across curriculum modules.</div>
              </div>
            </div>
          </div>
        </div>
      )}
        </>
      )}

      {/* Modal 1: Add or Edit Subject */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/20 bg-neutral-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-semibold text-white font-mono">
                {subjectModalMode === 'add' ? 'Add Academic Subject' : 'Edit Academic Subject'}
              </h3>
              <button
                onClick={() => setIsSubjectModalOpen(false)}
                className="rounded-lg p-1 text-neutral-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSubject} className="mt-4 flex flex-col gap-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 uppercase text-[10px]">Subject Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CSE3002"
                    value={subCode}
                    onChange={(e) => setSubCode(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-white/30"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 uppercase text-[10px]">Credits *</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    required
                    value={subCredits}
                    onChange={(e) => setSubCredits(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-400 uppercase text-[10px]">Subject Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Compiler Design & Language Automata"
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="text-neutral-400 uppercase text-[10px]">Faculty / Professor</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Rajesh Kumar"
                  value={subProfessor}
                  onChange={(e) => setSubProfessor(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-white/30"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-neutral-400 uppercase text-[10px]">Classes Attended</label>
                  <input
                    type="number"
                    min="0"
                    value={subAttended}
                    onChange={(e) => setSubAttended(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-white/30"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 uppercase text-[10px]">Total Conducted</label>
                  <input
                    type="number"
                    min="0"
                    value={subTotal}
                    onChange={(e) => setSubTotal(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-white/30"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 uppercase text-[10px]">Min Target %</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={subMinTarget}
                    onChange={(e) => setSubMinTarget(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <div className="mt-2 flex justify-end gap-2 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => setIsSubjectModalOpen(false)}
                  className="rounded-xl border border-white/10 px-4 py-2 text-neutral-400 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 font-medium text-black hover:bg-neutral-200 shadow-md"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{subjectModalMode === 'add' ? 'Create Subject' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Adjust Attendance Counts */}
      {isAdjustAttendanceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/20 bg-neutral-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-semibold text-white font-mono">Adjust Attendance Log</h3>
              <button
                onClick={() => setIsAdjustAttendanceOpen(false)}
                className="rounded-lg p-1 text-neutral-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjustAttendance} className="mt-4 flex flex-col gap-3 font-mono text-xs">
              <div>
                <label className="text-neutral-400 uppercase text-[10px]">Classes Attended</label>
                <input
                  type="number"
                  min="0"
                  value={adjustAttended}
                  onChange={(e) => setAdjustAttended(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-white/30"
                />
              </div>
              <div>
                <label className="text-neutral-400 uppercase text-[10px]">Total Classes Conducted</label>
                <input
                  type="number"
                  min="1"
                  value={adjustTotal}
                  onChange={(e) => setAdjustTotal(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-white/30"
                />
              </div>

              <div className="mt-2 flex justify-end gap-2 border-t border-white/10 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAdjustAttendanceOpen(false)}
                  className="rounded-xl border border-white/10 px-3 py-1.5 text-neutral-400 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1 rounded-xl bg-white px-3 py-1.5 font-medium text-black hover:bg-neutral-200 shadow-md"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Update</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Add Assignment */}
      {isAssignmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/20 bg-neutral-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-semibold text-white font-mono">Add Coursework Deliverable</h3>
              <button
                onClick={() => setIsAssignmentModalOpen(false)}
                className="rounded-lg p-1 text-neutral-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAssignment} className="mt-4 flex flex-col gap-3 font-mono text-xs">
              <div>
                <label className="text-neutral-400 uppercase text-[10px]">Deliverable Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Digital Assignment 2 - Lexical Analyzer"
                  value={asgTitle}
                  onChange={(e) => setAsgTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-white/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 uppercase text-[10px]">Type</label>
                  <select
                    value={asgType}
                    onChange={(e) => setAsgType(e.target.value as AcademicAssignment['type'])}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-neutral-900 px-3 py-2 text-white outline-none"
                  >
                    <option value="assignment">Assignment</option>
                    <option value="lab">Lab Project</option>
                    <option value="quiz">Quiz</option>
                    <option value="project">Course Project</option>
                  </select>
                </div>
                <div>
                  <label className="text-neutral-400 uppercase text-[10px]">Weightage %</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={asgWeightage}
                    onChange={(e) => setAsgWeightage(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-400 uppercase text-[10px]">Submission Deadline</label>
                <input
                  type="date"
                  value={asgDueDate}
                  onChange={(e) => setAsgDueDate(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-white/30"
                />
              </div>

              <div className="mt-2 flex justify-end gap-2 border-t border-white/10 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAssignmentModalOpen(false)}
                  className="rounded-xl border border-white/10 px-3 py-1.5 text-neutral-400 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1 rounded-xl bg-white px-3 py-1.5 font-medium text-black hover:bg-neutral-200 shadow-md"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Save Deliverable</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Edit CGPA Plan */}
      {isCgpaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/20 bg-neutral-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-semibold text-white font-mono">Configure CGPA Plan</h3>
              <button
                onClick={() => setIsCgpaModalOpen(false)}
                className="rounded-lg p-1 text-neutral-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCgpa} className="mt-4 flex flex-col gap-3 font-mono text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 uppercase text-[10px]">Current CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={cgpaCurrent}
                    onChange={(e) => setCgpaCurrent(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-white/30"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 uppercase text-[10px]">Target CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={cgpaTarget}
                    onChange={(e) => setCgpaTarget(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 uppercase text-[10px]">Credits Done</label>
                  <input
                    type="number"
                    min="0"
                    value={cgpaCompletedCredits}
                    onChange={(e) => setCgpaCompletedCredits(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-white/30"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 uppercase text-[10px]">Sem Credits</label>
                  <input
                    type="number"
                    min="1"
                    value={cgpaSemesterCredits}
                    onChange={(e) => setCgpaSemesterCredits(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <div className="mt-2 flex justify-end gap-2 border-t border-white/10 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCgpaModalOpen(false)}
                  className="rounded-xl border border-white/10 px-3 py-1.5 text-neutral-400 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1 rounded-xl bg-white px-3 py-1.5 font-medium text-black hover:bg-neutral-200 shadow-md"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Plan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
