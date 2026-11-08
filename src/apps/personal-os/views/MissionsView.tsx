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
    soundEngine.playClick();
    deleteMission(activeMission.id);
  };

  const handleAddObjective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newObjectiveText.trim() || !activeMission) return;
    soundEngine.playClick();
    addMissionObjective(activeMission.id, newObjectiveText.trim());
    setNewObjectiveText('');
  };

  return (
    <div className="flex flex-col gap-8 p-8 font-sans text-neutral-100 bg-[#0a0b10] min-h-full">
      {/* ─── Top Control Header ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase font-semibold text-neutral-400">
              Strategic Campaigns
            </span>
            <span className="h-1 w-1 rounded-full bg-neutral-600" />
            <span className="font-mono text-[10px] tracking-wider text-emerald-400 font-medium">
              Active Rail
            </span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight text-white">
            Engineering Missions
          </h1>
          <p className="text-sm text-neutral-400 mt-1 max-w-xl font-normal leading-relaxed">
            High-leverage engineering campaigns that organize projects, skills, and concrete milestones.
          </p>
        </div>

        {/* Global Campaign Stats & Add Mission Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAddMission}
            className="flex items-center gap-2 rounded-xl bg-white text-black hover:bg-neutral-200 px-4 py-2 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>New Campaign</span>
          </button>

          <div className="rounded-xl border border-white/[0.08] bg-[#10121a] px-3.5 py-2 text-right font-mono">
            <div className="text-[10px] uppercase text-neutral-500">Objectives Cleared</div>
            <div className="text-sm font-semibold text-white">
              {completedObjectives} / {totalObjectives}
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-[#10121a] px-3.5 py-2 text-right font-mono">
            <div className="text-[10px] uppercase text-neutral-500">Active Campaigns</div>
            <div className="text-sm font-semibold text-emerald-400">
              {missions.filter((m) => m.status === 'active').length} Active
            </div>
          </div>
        </div>
      </div>

      {/* ─── Status Filter Tabs ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 border-b border-white/[0.06] pb-3 font-mono text-xs">
        {(['all', 'active', 'queued', 'completed'] as const).map((status) => (
          <button
            key={status}
            onClick={() => {
              soundEngine.playClick();
              setFilterStatus(status);
            }}
            className={`rounded-lg px-3 py-1.5 capitalize transition-colors ${
              filterStatus === status
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* ─── Asymmetrical Master-Detail Layout ─────────────────────────────────── */}
      {missions.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-14 rounded-2xl border border-dashed border-white/10 bg-[#10121a] text-center my-6">
          <Compass className="h-10 w-10 text-neutral-500 mb-3" />
          <h3 className="text-sm font-semibold text-white">No Campaigns Defined Yet</h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-sm">
            Define high-leverage engineering missions to align your projects, skills, and daily execution towards concrete milestones.
          </p>
          <button
            onClick={handleOpenAddMission}
            className="mt-4 flex items-center gap-2 rounded-xl bg-white text-black px-4 py-2 text-xs font-semibold hover:bg-neutral-200 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Launch First Campaign</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Campaign List (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-3.5">
            {filteredMissions.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-neutral-500 border border-dashed border-white/10 rounded-xl">
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
                  className={`flex flex-col rounded-2xl border p-5 transition-colors cursor-pointer ${
                    isSelected
                      ? 'border-white/30 bg-[#141622] shadow-sm'
                      : 'border-white/[0.06] bg-[#10121a] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="rounded border border-white/10 bg-white/[0.03] px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-neutral-300">
                      {mission.category}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 font-mono text-[9px] uppercase ${
                        mission.priority === 'critical'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : mission.priority === 'high'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {mission.priority}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold tracking-tight text-white mb-1">
                    {mission.title}
                  </h3>
                  <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                    {mission.tagline}
                  </p>

                  {/* Progress bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs font-mono text-neutral-400 mb-1.5">
                      <span>Velocity</span>
                      <span className="text-white font-medium">{mission.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className="h-full bg-white transition-all duration-300 rounded-full"
                        style={{ width: `${mission.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-neutral-500">
                    <span className="text-emerald-400">{completedCount} / {mission.objectives.length} Objectives</span>
                    <span>{mission.estimatedCompletion}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Selected Mission Detail View (7 cols) */}
          {activeMission && (
            <div className="lg:col-span-7 flex flex-col rounded-2xl border border-white/[0.08] bg-[#10121a] p-7">
              {/* Header info */}
              <div className="flex flex-wrap items-start justify-between gap-3 pb-5 border-b border-white/[0.06]">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="rounded border border-white/10 bg-white/[0.03] px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-neutral-300">
                      {activeMission.category}
                    </span>
                    <span className="font-mono text-[10px] text-neutral-500">
                      ID: {activeMission.id}
                    </span>
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight text-white mt-2">
                    {activeMission.title}
                  </h2>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
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
                    className="rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 text-xs font-mono text-white outline-none cursor-pointer focus:border-white/30 capitalize"
                  >
                    <option value="active">Active</option>
                    <option value="queued">Queued</option>
                    <option value="completed">Completed</option>
                    <option value="paused">Paused</option>
                  </select>

                  <button
                    onClick={handleOpenEditMission}
                    className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs font-mono text-neutral-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                  >
                    <Pencil className="h-3 w-3" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={handleDeleteMission}
                    className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-1.5 text-rose-400 hover:bg-rose-500/20 transition-colors"
                    title="Delete Campaign"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Campaign Metrics Bar */}
              <div className="grid grid-cols-3 gap-3 py-4 border-b border-white/[0.06] text-xs font-mono">
                <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3.5">
                  <div className="flex items-center gap-1.5 text-neutral-400 text-[10px] uppercase">
                    <Calendar className="h-3 w-3" />
                    <span>Target Deadline</span>
                  </div>
                  <div className="text-white font-medium text-sm mt-1">{activeMission.deadline}</div>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3.5">
                  <div className="flex items-center gap-1.5 text-neutral-400 text-[10px] uppercase">
                    <Clock className="h-3 w-3" />
                    <span>Remaining</span>
                  </div>
                  <div className="text-white font-medium text-sm mt-1">{activeMission.estimatedCompletion}</div>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3.5">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] uppercase">
                    <Layers className="h-3 w-3" />
                    <span>Completion</span>
                  </div>
                  <div className="text-emerald-400 font-medium text-sm mt-1">{activeMission.progress}%</div>
                </div>
              </div>

              {/* Objectives Checklist */}
              <div className="py-4 border-b border-white/[0.06]">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs uppercase tracking-wider text-neutral-400 font-mono">
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
                    className="flex-1 rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs text-white placeholder-neutral-500 outline-none focus:border-white/30 font-sans"
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 rounded-xl bg-white text-black hover:bg-neutral-200 px-4 py-2 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add</span>
                  </button>
                </form>

                <div className="flex flex-col gap-2">
                  {activeMission.objectives.length === 0 ? (
                    <div className="p-4 text-center text-xs font-mono text-neutral-500 border border-dashed border-white/10 rounded-xl">
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
                        className={`group flex items-start justify-between gap-3 rounded-xl border p-3 cursor-pointer transition-colors ${
                          obj.completed
                            ? 'border-emerald-500/20 bg-emerald-500/[0.03] text-neutral-500 line-through'
                            : 'border-white/[0.06] bg-black/20 hover:border-white/20 text-neutral-200'
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          {obj.completed ? (
                            <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-emerald-400 mt-0.5" />
                          ) : (
                            <Circle className="h-4.5 w-4.5 shrink-0 text-neutral-600 group-hover:text-neutral-400 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-medium leading-relaxed">{obj.text}</span>
                            {obj.dueDate && (
                              <div className="text-[10px] font-mono text-neutral-500 mt-0.5">
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
                          className="opacity-0 group-hover:opacity-100 p-1 text-neutral-500 hover:text-rose-400 transition-opacity"
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
              <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-medium mb-2 flex items-center gap-1.5">
                    <FolderGit2 className="h-3.5 w-3.5" />
                    <span>Connected Projects</span>
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {activeMission.projectIds.length === 0 ? (
                      <span className="text-xs text-neutral-500 font-mono">None linked</span>
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
                            className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs font-mono text-neutral-300 hover:text-white hover:border-white/20"
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
                  <h5 className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-medium mb-2 flex items-center gap-1.5">
                    <Code2 className="h-3.5 w-3.5" />
                    <span>Target Competencies</span>
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {activeMission.skillIds.length === 0 ? (
                      <span className="text-xs text-neutral-500 font-mono">None linked</span>
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
                            className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs font-mono text-neutral-300 hover:text-white hover:border-white/20"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border border-white/15 bg-[#12141e] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4 select-none">
              <div className="flex items-center gap-2.5">
                <Compass className="h-4 w-4 text-white" />
                <h3 className="text-sm font-semibold text-white">
                  {missionModalMode === 'add' ? 'Launch New Campaign' : 'Edit Campaign'}
                </h3>
              </div>
              <button
                onClick={() => setIsMissionModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMission} className="p-6 flex flex-col gap-4 text-xs font-mono">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-neutral-300 font-sans font-medium">Campaign Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Distributed Systems & Raft"
                  value={mTitle}
                  onChange={(e) => setMTitle(e.target.value)}
                  className="rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs text-white outline-none focus:border-white/30"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-neutral-300 font-sans font-medium">Tagline / Mission Vision</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Build an in-memory replicated log from scratch in Rust"
                  value={mTagline}
                  onChange={(e) => setMTagline(e.target.value)}
                  className="rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs text-white outline-none focus:border-white/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-neutral-300 font-sans font-medium">Priority</label>
                  <select
                    value={mPriority}
                    onChange={(e) => setMPriority(e.target.value as MissionPriority)}
                    className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white outline-none focus:border-white/30 capitalize"
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-neutral-300 font-sans font-medium">Target Deadline</label>
                  <input
                    type="date"
                    value={mDeadline}
                    onChange={(e) => setMDeadline(e.target.value)}
                    className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsMissionModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-white text-black px-5 py-2 text-xs font-semibold hover:bg-neutral-200 transition-colors"
                >
                  <Save className="h-3.5 w-3.5" />
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
