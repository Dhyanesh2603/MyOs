import React, { useState } from 'react';
import {
  Compass,
  CheckCircle2,
  Circle,
  Calendar,
  Clock,
  ExternalLink,
  Layers,
  FolderGit2,
  Code2,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
} from 'lucide-react';
import { usePersonalOsStore } from '@core/personal-os/personalOsStore';
import type { MissionStatus, MissionPriority, Mission } from '@core/personal-os/types';
import { soundEngine } from '@core/audio/soundEngine';

export const MissionsView: React.FC = () => {
  const {
    missions,
    toggleMissionObjective,
    updateMissionStatus,
    addMission,
    updateMission,
    deleteMission,
    addMissionObjective,
    deleteMissionObjective,
    projects,
    skills,
    setActiveTab,
  } = usePersonalOsStore();

  const [filterStatus, setFilterStatus] = useState<MissionStatus | 'all'>('all');
  const [selectedMissionId, setSelectedMissionId] = useState<string>(missions[0]?.id || '');

  // Mission Modal State
  const [isMissionModalOpen, setIsMissionModalOpen] = useState(false);
  const [missionModalMode, setMissionModalMode] = useState<'add' | 'edit'>('add');
  const [mTitle, setMTitle] = useState('');
  const [mTagline, setMTagline] = useState('');
  const [mCategory, setMCategory] = useState<Mission['category']>('engineering');
  const [mPriority, setMPriority] = useState<MissionPriority>('high');
  const [mDeadline, setMDeadline] = useState('');
  const [mStatus, setMStatus] = useState<MissionStatus>('active');

  // Inline Objective Input
  const [newObjectiveText, setNewObjectiveText] = useState('');

  const filteredMissions = filterStatus === 'all'
    ? missions
    : missions.filter((m) => m.status === filterStatus);

  const activeMission = missions.find((m) => m.id === selectedMissionId) || missions[0];

  const totalObjectives = missions.flatMap((m) => m.objectives).length;
  const completedObjectives = missions.flatMap((m) => m.objectives).filter((o) => o.completed).length;

  const handleOpenAddMission = () => {
    soundEngine.playClick();
    setMissionModalMode('add');
    setMTitle('');
    setMTagline('');
    setMCategory('engineering');
    setMPriority('high');
    setMDeadline(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0] || '2026-11-01');
    setMStatus('active');
    setIsMissionModalOpen(true);
  };

  const handleOpenEditMission = () => {
    if (!activeMission) return;
    soundEngine.playClick();
    setMissionModalMode('edit');
    setMTitle(activeMission.title);
    setMTagline(activeMission.tagline);
    setMCategory(activeMission.category);
    setMPriority(activeMission.priority);
    setMDeadline(activeMission.deadline);
    setMStatus(activeMission.status);
    setIsMissionModalOpen(true);
  };

  const handleSaveMission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mTitle.trim()) return;
    soundEngine.playClick();

    if (missionModalMode === 'add') {
      addMission(mTitle.trim(), mTagline.trim(), mCategory, mPriority, mDeadline);
    } else if (activeMission) {
      updateMission(activeMission.id, {
        title: mTitle.trim(),
        tagline: mTagline.trim(),
        category: mCategory,
        priority: mPriority,
        deadline: mDeadline,
        status: mStatus,
      });
    }
    setIsMissionModalOpen(false);
  };

  const handleDeleteMission = () => {
    if (!activeMission) return;
    if (confirm(`Are you sure you want to delete campaign "${activeMission.title}"?`)) {
      soundEngine.playClick();
      deleteMission(activeMission.id);
      const remaining = missions.filter((m) => m.id !== activeMission.id);
      if (remaining[0]) {
        setSelectedMissionId(remaining[0].id);
      }
    }
  };

  const handleAddObjective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newObjectiveText.trim() || !activeMission) return;
    soundEngine.playClick();
    addMissionObjective(activeMission.id, newObjectiveText.trim());
    setNewObjectiveText('');
  };

  return (
    <div className="flex flex-col gap-6 p-6 font-sans text-white bg-[#060913] min-h-full">
      {/* ─── Top Control Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-indigo-900/60 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-400 to-indigo-600 text-black shadow-[0_0_25px_rgba(6,182,212,0.4)]">
            <Compass className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black tracking-tight text-white">
                Engineering Missions & Strategic Campaigns
              </h2>
              <span className="rounded-full bg-cyan-500/20 border border-cyan-400/50 px-2.5 py-0.5 font-mono text-[10px] font-bold text-cyan-300 uppercase tracking-widest">
                Active Rail
              </span>
            </div>
            <p className="text-xs font-medium text-cyan-200/80 mt-0.5">
              High-leverage engineering campaigns that organize projects, skills, and concrete milestones.
            </p>
          </div>
        </div>

        {/* Global Campaign Stats & Add Mission Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAddMission}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-5 py-2.5 text-xs font-black text-black shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>+ New Campaign</span>
          </button>

          <div className="rounded-2xl border-2 border-indigo-800/80 bg-[#0d1428] px-4 py-2 text-right font-mono shadow-md">
            <div className="text-[10px] font-bold uppercase text-slate-400">Objectives Cleared</div>
            <div className="text-sm font-black text-white">
              {completedObjectives} / {totalObjectives}
            </div>
          </div>

          <div className="rounded-2xl border-2 border-indigo-800/80 bg-[#0d1428] px-4 py-2 text-right font-mono shadow-md">
            <div className="text-[10px] font-bold uppercase text-slate-400">Active Campaigns</div>
            <div className="text-sm font-black text-cyan-300">
              {missions.filter((m) => m.status === 'active').length} Active
            </div>
          </div>
        </div>
      </div>

      {/* ─── Status Filter Tabs ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b-2 border-indigo-950/60 pb-3 font-mono text-xs">
        {(['all', 'active', 'queued', 'completed'] as const).map((status) => (
          <button
            key={status}
            onClick={() => {
              soundEngine.playClick();
              setFilterStatus(status);
            }}
            className={`rounded-xl px-4 py-1.5 font-bold capitalize transition-all ${
              filterStatus === status
                ? 'bg-gradient-to-r from-cyan-400 to-indigo-500 text-black font-black shadow-[0_0_15px_rgba(6,182,212,0.4)] border border-cyan-300'
                : 'border border-indigo-900/60 bg-[#090e1c] text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* ─── Asymmetrical Master-Detail Layout ─────────────────────────────────── */}
      {missions.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-14 rounded-3xl border-2 border-dashed border-indigo-800/80 bg-[#0c1224] text-center my-6">
          <Compass className="h-12 w-12 text-cyan-400 mb-3" />
          <h3 className="text-base font-bold text-white">No Campaigns Defined Yet</h3>
          <p className="text-xs font-medium text-slate-300 mt-1 max-w-sm">
            Define high-leverage engineering missions to align your projects, skills, and daily execution towards concrete milestones.
          </p>
          <button
            onClick={handleOpenAddMission}
            className="mt-4 flex items-center gap-2 rounded-2xl bg-cyan-400 px-5 py-2 text-xs font-black text-black shadow-lg"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>Launch Your First Campaign</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Campaign List (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-3.5">
            {filteredMissions.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-slate-400 border-2 border-dashed border-indigo-800/80 rounded-2xl">
                No campaigns matching status "{filterStatus}".
              </div>
            ) : null}

            {filteredMissions.map((mission) => {
              const isSelected = activeMission?.id === mission.id;
              const completedCount = mission.objectives.filter((o) => o.completed).length;

              return (
                <div
                  key={mission.id}
                  onClick={() => {
                    soundEngine.playClick();
                    setSelectedMissionId(mission.id);
                  }}
                  className={`flex flex-col rounded-3xl border-2 p-5 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-cyan-400 bg-gradient-to-br from-[#0c1836] to-[#070e1e] shadow-[0_0_30px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400/50'
                      : 'border-indigo-900/80 bg-[#0c1328] hover:border-cyan-400/60 hover:bg-[#0e172e]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="rounded-lg bg-indigo-950/80 border border-indigo-700/80 px-2.5 py-0.5 font-mono text-[10px] font-black uppercase tracking-wider text-cyan-300">
                      {mission.category}
                    </span>
                    <span
                      className={`rounded-lg px-2 py-0.5 font-mono text-[10px] font-black uppercase ${
                        mission.priority === 'critical'
                          ? 'bg-rose-500 text-white shadow-[0_0_8px_#f43f5e]'
                          : mission.priority === 'high'
                          ? 'bg-amber-400 text-black shadow-[0_0_8px_#f59e0b]'
                          : 'bg-cyan-400 text-black shadow-[0_0_8px_#22d3ee]'
                      }`}
                    >
                      {mission.priority}
                    </span>
                  </div>

                  <h3 className="text-base font-bold tracking-tight text-white mb-1">
                    {mission.title}
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {mission.tagline}
                  </p>

                  {/* Progress bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300 mb-1">
                      <span>Velocity</span>
                      <span className="text-cyan-300">{mission.progress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-black/60 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-300 rounded-full"
                        style={{ width: `${mission.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-indigo-900/60 flex items-center justify-between text-xs font-mono text-slate-400">
                    <span className="text-emerald-300 font-bold">{completedCount} / {mission.objectives.length} Objectives</span>
                    <span>{mission.estimatedCompletion}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Selected Mission Detail View (7 cols) */}
          {activeMission && (
            <div className="lg:col-span-7 flex flex-col rounded-3xl border-2 border-indigo-800/80 bg-gradient-to-br from-[#0c142a] to-[#070b16] p-6 shadow-xl">
              {/* Header info */}
              <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b-2 border-indigo-900/60">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-cyan-400/20 border border-cyan-400/50 px-2.5 py-0.5 font-mono text-[10px] font-black uppercase tracking-wider text-cyan-300">
                      {activeMission.category}
                    </span>
                    <span className="font-mono text-[10px] uppercase font-bold text-slate-400">
                      ID: {activeMission.id}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black tracking-tight text-white mt-2">
                    {activeMission.title}
                  </h2>
                  <p className="text-xs font-medium text-slate-300 mt-1 leading-relaxed">
                    {activeMission.tagline}
                  </p>
                </div>

                {/* Status Switcher & Actions */}
                <div className="flex items-center gap-2">
                  <select
                    value={activeMission.status}
                    onChange={(e) => {
                      soundEngine.playClick();
                      updateMissionStatus(activeMission.id, e.target.value as MissionStatus);
                    }}
                    className="rounded-xl border-2 border-indigo-800 bg-[#070b16] px-3 py-1.5 text-xs font-bold font-mono text-white outline-none cursor-pointer focus:border-cyan-400"
                  >
                    <option value="active">Active</option>
                    <option value="queued">Queued</option>
                    <option value="completed">Completed</option>
                    <option value="paused">Paused</option>
                  </select>

                  <button
                    onClick={handleOpenEditMission}
                    className="flex items-center gap-1.5 rounded-xl border border-indigo-700 bg-indigo-950/60 px-3 py-1.5 text-xs font-mono font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <Pencil className="h-3 w-3" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={handleDeleteMission}
                    className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-2 text-rose-400 hover:bg-rose-500/25 transition-colors"
                    title="Delete Campaign"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Campaign Metrics Bar */}
              <div className="grid grid-cols-3 gap-3 py-4 border-b-2 border-indigo-900/60 text-xs font-mono">
                <div className="rounded-2xl border border-indigo-800/80 bg-[#080d1c] p-3.5">
                  <div className="flex items-center gap-1.5 text-cyan-300 text-[10px] font-bold uppercase">
                    <Calendar className="h-3 w-3" />
                    <span>Target Deadline</span>
                  </div>
                  <div className="text-white font-black text-sm mt-1">{activeMission.deadline}</div>
                </div>
                <div className="rounded-2xl border border-indigo-800/80 bg-[#080d1c] p-3.5">
                  <div className="flex items-center gap-1.5 text-cyan-300 text-[10px] font-bold uppercase">
                    <Clock className="h-3 w-3" />
                    <span>Remaining</span>
                  </div>
                  <div className="text-white font-black text-sm mt-1">{activeMission.estimatedCompletion}</div>
                </div>
                <div className="rounded-2xl border border-indigo-800/80 bg-[#080d1c] p-3.5">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold uppercase">
                    <Layers className="h-3 w-3" />
                    <span>Completion</span>
                  </div>
                  <div className="text-emerald-300 font-black text-sm mt-1">{activeMission.progress}%</div>
                </div>
              </div>

              {/* Objectives Checklist */}
              <div className="py-4 border-b-2 border-indigo-900/60">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-white font-mono">
                    Milestone Objectives ({activeMission.objectives.filter((o) => o.completed).length}/
                    {activeMission.objectives.length})
                  </h4>
                </div>

                {/* Inline Add Objective Form */}
                <form onSubmit={handleAddObjective} className="mb-3.5 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Add actionable campaign milestone objective..."
                    value={newObjectiveText}
                    onChange={(e) => setNewObjectiveText(e.target.value)}
                    className="flex-1 rounded-2xl border-2 border-indigo-800 bg-[#070b16] px-4 py-2 text-xs font-bold text-white placeholder-slate-500 outline-none focus:border-cyan-400 font-mono"
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 rounded-2xl bg-cyan-400 px-4 py-2 text-xs font-black font-mono text-black shadow-md hover:scale-105 active:scale-95 transition-all"
                  >
                    <Plus className="h-3.5 w-3.5 stroke-[3]" />
                    <span>Add</span>
                  </button>
                </form>

                <div className="flex flex-col gap-2.5">
                  {activeMission.objectives.length === 0 ? (
                    <div className="p-4 text-center text-xs font-mono text-slate-400 border-2 border-dashed border-indigo-800/80 rounded-2xl">
                      No objectives defined yet. Add key milestones above.
                    </div>
                  ) : (
                    activeMission.objectives.map((obj) => (
                      <div
                        key={obj.id}
                        onClick={() => {
                          soundEngine.playClick();
                          toggleMissionObjective(activeMission.id, obj.id);
                        }}
                        className={`group flex items-start justify-between gap-3 rounded-2xl border-2 p-3.5 transition-all cursor-pointer ${
                          obj.completed
                            ? 'border-emerald-500/30 bg-emerald-950/20 text-slate-400 line-through'
                            : 'border-indigo-800/80 bg-[#070c18] text-white hover:border-cyan-400 hover:bg-[#0c1428]'
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          {obj.completed ? (
                            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5" />
                          ) : (
                            <Circle className="h-5 w-5 shrink-0 text-cyan-400 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-bold leading-relaxed">{obj.text}</span>
                            {obj.dueDate && (
                              <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                                Target: {obj.dueDate}
                              </div>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            soundEngine.playClick();
                            deleteMissionObjective(activeMission.id, obj.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-400 transition-opacity"
                          title="Delete Objective"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Connected Projects & Skills Grid */}
              <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-xs font-mono uppercase tracking-wider text-cyan-300 font-bold mb-2 flex items-center gap-1.5">
                    <FolderGit2 className="h-3.5 w-3.5" />
                    <span>Connected Projects</span>
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {activeMission.projectIds.length === 0 ? (
                      <span className="text-xs text-slate-400 font-mono">None linked</span>
                    ) : (
                      activeMission.projectIds.map((pid) => {
                        const proj = projects.find((p) => p.id === pid);
                        return (
                          <button
                            key={pid}
                            onClick={() => {
                              soundEngine.playClick();
                              setActiveTab('projects');
                            }}
                            className="flex items-center gap-1 rounded-xl bg-indigo-950/80 border border-indigo-700/80 px-2.5 py-1 text-xs font-mono text-cyan-300 hover:border-cyan-400 font-bold"
                          >
                            <span>{proj?.name || pid}</span>
                            <ExternalLink className="h-2.5 w-2.5" />
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-mono uppercase tracking-wider text-cyan-300 font-bold mb-2 flex items-center gap-1.5">
                    <Code2 className="h-3.5 w-3.5" />
                    <span>Target Competencies</span>
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {activeMission.skillIds.length === 0 ? (
                      <span className="text-xs text-slate-400 font-mono">None linked</span>
                    ) : (
                      activeMission.skillIds.map((sid) => {
                        const sk = skills.find((s) => s.id === sid);
                        return (
                          <button
                            key={sid}
                            onClick={() => {
                              soundEngine.playClick();
                              setActiveTab('learning');
                            }}
                            className="flex items-center gap-1 rounded-xl bg-emerald-950/80 border border-emerald-700/80 px-2.5 py-1 text-xs font-mono text-emerald-300 hover:border-emerald-400 font-bold"
                          >
                            <span>{sk?.name || sid}</span>
                            <ExternalLink className="h-2.5 w-2.5" />
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Add / Edit Mission Modal ─────────────────────────────────────────── */}
      {isMissionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl border-2 border-cyan-400 bg-[#0d1428] shadow-[0_0_50px_rgba(6,182,212,0.3)] overflow-hidden">
            <div className="flex items-center justify-between border-b-2 border-indigo-900/80 bg-[#070b16] px-6 py-4 select-none">
              <div className="flex items-center gap-2.5">
                <Compass className="h-5 w-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">
                  {missionModalMode === 'add' ? 'Launch New Campaign' : 'Edit Campaign'}
                </h3>
              </div>
              <button
                onClick={() => setIsMissionModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMission} className="p-6 flex flex-col gap-4 text-xs font-mono">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-300">Campaign Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Distributed Systems & Raft"
                  value={mTitle}
                  onChange={(e) => setMTitle(e.target.value)}
                  className="rounded-2xl border-2 border-indigo-800 bg-[#070a14] px-4 py-2.5 text-xs font-bold text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-300">Tagline / Mission Vision</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Build an in-memory replicated log from scratch in Rust"
                  value={mTagline}
                  onChange={(e) => setMTagline(e.target.value)}
                  className="rounded-2xl border-2 border-indigo-800 bg-[#070a14] px-4 py-2.5 text-xs font-bold text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-300">Priority</label>
                  <select
                    value={mPriority}
                    onChange={(e) => setMPriority(e.target.value as MissionPriority)}
                    className="rounded-2xl border-2 border-indigo-800 bg-[#070a14] px-3 py-2.5 text-xs font-bold text-white outline-none focus:border-cyan-400"
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-300">Target Deadline</label>
                  <input
                    type="date"
                    value={mDeadline}
                    onChange={(e) => setMDeadline(e.target.value)}
                    className="rounded-2xl border-2 border-indigo-800 bg-[#070a14] px-3 py-2 text-xs font-bold text-white outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-indigo-900/60">
                <button
                  type="button"
                  onClick={() => setIsMissionModalOpen(false)}
                  className="rounded-2xl px-4 py-2 text-xs font-bold text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-6 py-2.5 text-xs font-black text-black shadow-lg hover:scale-105 transition-all"
                >
                  <Save className="h-4 w-4" />
                  <span>{missionModalMode === 'add' ? 'Launch Campaign' : 'Update Campaign'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
