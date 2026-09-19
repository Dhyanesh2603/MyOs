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
} from 'lucide-react';
import { usePersonalOsStore } from '@core/personal-os/personalOsStore';
import type { MissionStatus } from '@core/personal-os/types';
import { soundEngine } from '@core/audio/soundEngine';

export const MissionsView: React.FC = () => {
  const {
    missions,
    toggleMissionObjective,
    updateMissionStatus,
    projects,
    skills,
    setActiveTab,
  } = usePersonalOsStore();

  const [filterStatus, setFilterStatus] = useState<MissionStatus | 'all'>('all');
  const [selectedMissionId, setSelectedMissionId] = useState<string>(missions[0]?.id || '');

  const filteredMissions = filterStatus === 'all'
    ? missions
    : missions.filter((m) => m.status === filterStatus);

  const activeMission = missions.find((m) => m.id === selectedMissionId) || missions[0];

  const totalObjectives = missions.flatMap((m) => m.objectives).length;
  const completedObjectives = missions.flatMap((m) => m.objectives).filter((o) => o.completed).length;

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

        {/* Global Campaign Stats */}
        <div className="flex items-center gap-3">
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
              <div>
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

              {/* Status Switcher */}
              <select
                value={activeMission.status}
                onChange={(e) => {
                  soundEngine.playClick();
                  updateMissionStatus(activeMission.id, e.target.value as MissionStatus);
                }}
                className="rounded-lg border border-white/20 bg-neutral-900 px-3 py-1.5 text-xs font-mono text-white outline-none"
              >
                <option value="active">Active</option>
                <option value="queued">Queued</option>
                <option value="completed">Completed</option>
                <option value="paused">Paused</option>
              </select>
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

              <div className="flex flex-col gap-2">
                {activeMission.objectives.map((obj) => (
                  <div
                    key={obj.id}
                    onClick={() => {
                      soundEngine.playClick();
                      toggleMissionObjective(activeMission.id, obj.id);
                    }}
                    className={`flex items-start gap-3 rounded-xl border p-3 transition-all cursor-pointer ${
                      obj.completed
                        ? 'border-white/5 bg-white/[0.01] text-neutral-500 line-through'
                        : 'border-white/10 bg-white/[0.02] text-neutral-200 hover:border-white/20 hover:bg-white/[0.04]'
                    }`}
                  >
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
                ))}
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
                  {activeMission.projectIds.map((pid) => {
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
                  })}
                </div>
              </div>

              {/* Connected Skills */}
              <div>
                <h5 className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
                  <Code2 className="h-3 w-3 text-neutral-400" />
                  <span>Connected Skills</span>
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {activeMission.skillIds.map((sid) => {
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
                  })}
                </div>
              </div>
            </div>

            {/* Curated Resources */}
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
          </div>
        )}
      </div>
    </div>
  );
};
