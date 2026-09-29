import React, { useState } from 'react';
import {
  Compass,
  CheckCircle2,
  Circle,
  Calendar,
  Clock,
  ArrowUpRight,
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
    if (!activeMission || !newObjectiveText.trim()) return;
    soundEngine.playClick();
    addMissionObjective(activeMission.id, newObjectiveText.trim());
    setNewObjectiveText('');
  };

  return (
    <div className="flex flex-col gap-6 p-6 font-sans text-neutral-200">
      {/* 1. Header & Campaign Telemetry */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-neutral-300" />
            <h2 className="text-xl font-medium tracking-tight text-white">
              Engineering Missions
            </h2>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Long-term high-leverage campaigns that organize projects, skills, and strategic objectives.
          </p>
        </div>

        {/* Global Campaign Stats & Add Mission Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAddMission}
            className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-mono text-white hover:bg-white/20 transition-all shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Campaign</span>
          </button>

          <div className="rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-1.5 text-right font-mono">
            <div className="text-[10px] uppercase text-neutral-400">Campaign Objectives</div>
            <div className="text-sm font-semibold text-white">
              {completedObjectives}/{totalObjectives}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-1.5 text-right font-mono">
            <div className="text-[10px] uppercase text-neutral-400">Active Campaigns</div>
            <div className="text-sm font-semibold text-white">
              {missions.filter((m) => m.status === 'active').length}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Status Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b border-white/5 pb-2">
        {(['all', 'active', 'queued', 'completed'] as const).map((status) => (
          <button
            key={status}
            onClick={() => {
              soundEngine.playClick();
              setFilterStatus(status);
            }}
            className={`rounded-lg px-3 py-1 text-xs font-mono capitalize transition-colors ${
              filterStatus === status
                ? 'bg-white/15 text-white font-medium shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* 3. Split Campaign Master / Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Campaign List (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
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
                className={`flex flex-col rounded-xl border p-4 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-white/30 bg-white/[0.06] shadow-lg ring-1 ring-white/10'
                    : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-neutral-300">
                    {mission.category}
                  </span>
                  <span
                    className={`font-mono text-[10px] font-semibold uppercase ${
                      mission.priority === 'critical'
                        ? 'text-rose-400'
                        : mission.priority === 'high'
                        ? 'text-amber-400'
                        : 'text-neutral-400'
                    }`}
                  >
                    {mission.priority}
                  </span>
                </div>

                <h3 className="text-sm font-semibold tracking-tight text-white mb-1">
                  {mission.title}
                </h3>
                <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                  {mission.tagline}
                </p>

                {/* Progress bar */}
                <div className="mt-3.5">
                  <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 mb-1">
                    <span>Progress</span>
                    <span className="text-white font-medium">{mission.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-white transition-all duration-300 rounded-full"
                      style={{ width: `${mission.progress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-neutral-400">
                  <span>{completedCount}/{mission.objectives.length} Objectives</span>
                  <span>{mission.estimatedCompletion}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Selected Mission Detail View (7 cols) */}
        {activeMission && (
          <div className="lg:col-span-7 flex flex-col rounded-2xl border border-white/15 bg-white/[0.03] p-6 shadow-xl">
            {/* Header info */}
            <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-white/10">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-neutral-300">
                    {activeMission.category}
                  </span>
                  <span className="font-mono text-[10px] uppercase text-neutral-400">
                    ID: {activeMission.id}
                  </span>
                </div>
                <h2 className="text-xl font-medium tracking-tight text-white mt-1.5">
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
                  className="rounded-lg border border-white/20 bg-neutral-900 px-3 py-1.5 text-xs font-mono text-white outline-none cursor-pointer"
                >
                  <option value="active">Active</option>
                  <option value="queued">Queued</option>
                  <option value="completed">Completed</option>
                  <option value="paused">Paused</option>
                </select>

                <button
                  onClick={handleOpenEditMission}
                  className="flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs font-mono text-neutral-300 hover:bg-white/10 transition-colors"
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
            <div className="grid grid-cols-3 gap-3 py-4 border-b border-white/10 text-xs font-mono">
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <div className="flex items-center gap-1.5 text-neutral-400 text-[10px] uppercase">
                  <Calendar className="h-3 w-3" />
                  <span>Target Deadline</span>
                </div>
                <div className="text-white font-semibold mt-1">{activeMission.deadline}</div>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <div className="flex items-center gap-1.5 text-neutral-400 text-[10px] uppercase">
                  <Clock className="h-3 w-3" />
                  <span>Remaining</span>
                </div>
                <div className="text-white font-semibold mt-1">{activeMission.estimatedCompletion}</div>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <div className="flex items-center gap-1.5 text-neutral-400 text-[10px] uppercase">
                  <Layers className="h-3 w-3" />
                  <span>Completion</span>
                </div>
                <div className="text-white font-semibold mt-1">{activeMission.progress}%</div>
              </div>
            </div>

            {/* Objectives Checklist */}
            <div className="py-4 border-b border-white/10">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-300 font-mono">
                  Campaign Objectives ({activeMission.objectives.filter((o) => o.completed).length}/
                  {activeMission.objectives.length})
                </h4>
              </div>

              {/* Inline Add Objective Form */}
              <form onSubmit={handleAddObjective} className="mb-3 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Add actionable campaign objective..."
                  value={newObjectiveText}
                  onChange={(e) => setNewObjectiveText(e.target.value)}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-white/30 font-mono"
                />
                <button
                  type="submit"
                  className="flex items-center gap-1 rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-mono text-white hover:bg-white/20 transition-all"
                >
                  <Plus className="h-3 w-3" />
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
                      className={`group flex items-start justify-between gap-3 rounded-xl border p-3 transition-all cursor-pointer ${
                        obj.completed
                          ? 'border-white/5 bg-white/[0.01] text-neutral-500 line-through'
                          : 'border-white/10 bg-white/[0.02] text-neutral-200 hover:border-white/20 hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        {obj.completed ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-neutral-400 mt-0.5" />
                        ) : (
                          <Circle className="h-4 w-4 shrink-0 text-neutral-500 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <span className="text-xs leading-relaxed">{obj.text}</span>
                          {obj.dueDate && (
                            <div className="text-[10px] font-mono text-neutral-400 mt-0.5">
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
                        className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-rose-400 transition-opacity"
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
            <div className="py-4 border-b border-white/10 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Connected Projects */}
              <div>
                <h5 className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
                  <FolderGit2 className="h-3 w-3 text-neutral-400" />
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
                          className="flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-xs text-neutral-200 hover:bg-white/10 transition-colors"
                        >
                          <span>{proj?.name || pid}</span>
                          <ArrowUpRight className="h-3 w-3 opacity-60" />
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Connected Skills */}
              <div>
                <h5 className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
                  <Code2 className="h-3 w-3 text-neutral-400" />
                  <span>Connected Skills</span>
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {activeMission.skillIds.length === 0 ? (
                    <span className="text-xs text-neutral-500 font-mono">None linked</span>
                  ) : (
                    activeMission.skillIds.map((sid) => {
                      const skill = skills.find((s) => s.id === sid);
                      return (
                        <button
                          key={sid}
                          onClick={() => {
                            soundEngine.playClick();
                            setActiveTab('learning');
                          }}
                          className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-0.5 font-mono text-[10px] text-neutral-300 hover:bg-white/10 transition-colors"
                        >
                          {skill?.name || sid}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Curated Resources */}
            {activeMission.resources.length > 0 && (
              <div className="pt-4">
                <h5 className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-2.5">
                  Strategic Resources & Specifications
                </h5>
                <div className="flex flex-col gap-1.5">
                  {activeMission.resources.map((res, i) => (
                    <a
                      key={i}
                      href={res.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2 text-xs text-neutral-300 hover:border-white/15 hover:bg-white/[0.05] transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-white/10 px-1.5 py-0.2 font-mono text-[9px] uppercase tracking-wider text-neutral-400">
                          {res.type}
                        </span>
                        <span>{res.title}</span>
                      </div>
                      <ExternalLink className="h-3 w-3 opacity-50" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal: Add or Edit Mission */}
      {isMissionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/20 bg-neutral-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-semibold text-white font-mono">
                {missionModalMode === 'add' ? 'Create Strategic Campaign' : 'Edit Campaign Details'}
              </h3>
              <button
                onClick={() => setIsMissionModalOpen(false)}
                className="rounded-lg p-1 text-neutral-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMission} className="mt-4 flex flex-col gap-4 text-xs font-mono">
              <div>
                <label className="text-neutral-400 uppercase text-[10px]">Campaign Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Consensus Engine"
                  value={mTitle}
                  onChange={(e) => setMTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="text-neutral-400 uppercase text-[10px]">Tagline / Mission Summary</label>
                <input
                  type="text"
                  placeholder="e.g. High-throughput distributed log structured storage engine"
                  value={mTagline}
                  onChange={(e) => setMTagline(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-white/30"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-neutral-400 uppercase text-[10px]">Category</label>
                  <select
                    value={mCategory}
                    onChange={(e) => setMCategory(e.target.value as Mission['category'])}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-neutral-900 px-3 py-2 text-white outline-none"
                  >
                    <option value="engineering">Engineering</option>
                    <option value="learning">Learning</option>
                    <option value="career">Career</option>
                    <option value="health">Health</option>
                    <option value="open_source">Open Source</option>
                  </select>
                </div>
                <div>
                  <label className="text-neutral-400 uppercase text-[10px]">Priority</label>
                  <select
                    value={mPriority}
                    onChange={(e) => setMPriority(e.target.value as MissionPriority)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-neutral-900 px-3 py-2 text-white outline-none"
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="text-neutral-400 uppercase text-[10px]">Status</label>
                  <select
                    value={mStatus}
                    onChange={(e) => setMStatus(e.target.value as MissionStatus)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-neutral-900 px-3 py-2 text-white outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="queued">Queued</option>
                    <option value="completed">Completed</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-neutral-400 uppercase text-[10px]">Target Deadline</label>
                <input
                  type="date"
                  value={mDeadline}
                  onChange={(e) => setMDeadline(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-white/30"
                />
              </div>

              <div className="mt-2 flex justify-end gap-2 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => setIsMissionModalOpen(false)}
                  className="rounded-xl border border-white/10 px-4 py-2 text-neutral-400 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 font-medium text-black hover:bg-neutral-200 shadow-md"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{missionModalMode === 'add' ? 'Launch Campaign' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
