import React, { useState } from 'react';
import {
  FolderGit2,
  ExternalLink,
  GitCommit,
  GitBranch,
  Bug,
  CheckCircle2,
  Circle,
  Layers,
  Cpu,
  Sparkles,
  Plus,
  Check,
  Trash2,
  Edit3,
  X,
} from 'lucide-react';
import { usePersonalOsStore } from '@core/personal-os/personalOsStore';
import { soundEngine } from '@core/audio/soundEngine';
import { GitVisualizerModal } from '../components/GitVisualizerModal';
import type { ProjectStatus } from '@core/personal-os/types';

export const ProjectsView: React.FC = () => {
  const {
    projects,
    missions,
    skills,
    addProject,
    updateProject,
    deleteProject,
    toggleProjectMilestone,
    addProjectMilestone,
    deleteProjectMilestone,
    addProjectBug,
    resolveProjectBug,
    setActiveTab,
  } = usePersonalOsStore();

  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [newBugText, setNewBugText] = useState('');
  const [newBugSeverity, setNewBugSeverity] = useState<'critical' | 'moderate' | 'minor'>('moderate');
  const [isGitModalOpen, setIsGitModalOpen] = useState(false);
  const [selectedCommitHash, setSelectedCommitHash] = useState<string | undefined>(undefined);

  // New / Edit Project Modal State
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectModalMode, setProjectModalMode] = useState<'create' | 'edit'>('create');
  const [projName, setProjName] = useState('');
  const [projTagline, setProjTagline] = useState('');
  const [projDescription, setProjDescription] = useState('');
  const [projRepoUrl, setProjRepoUrl] = useState('');
  const [projDemoUrl, setProjDemoUrl] = useState('');
  const [projTechStack, setProjTechStack] = useState('');
  const [projArchitecture, setProjArchitecture] = useState('');
  const [projStatus, setProjStatus] = useState<ProjectStatus>('in_progress');
  const [projMilestones, setProjMilestones] = useState('');

  // Inline Milestone Input
  const [newMilestoneText, setNewMilestoneText] = useState('');

  const activeProject = projects.find((p) => p.id === selectedProjectId) || projects[0];
  const associatedMission = missions.find((m) => m.id === activeProject?.missionId);

  const handleOpenCreateModal = () => {
    soundEngine.playClick();
    setProjectModalMode('create');
    setProjName('');
    setProjTagline('');
    setProjDescription('');
    setProjRepoUrl('https://github.com/Dhyanesh2603/');
    setProjDemoUrl('');
    setProjTechStack('TypeScript, React, Tailwind CSS, Node.js');
    setProjArchitecture('Modern micro-frontend / modular client architecture');
    setProjStatus('in_progress');
    setProjMilestones('Initial system architecture, Core feature set implementation, Testing and production release');
    setIsProjectModalOpen(true);
  };

  const handleOpenEditModal = () => {
    if (!activeProject) return;
    soundEngine.playClick();
    setProjectModalMode('edit');
    setProjName(activeProject.name);
    setProjTagline(activeProject.tagline);
    setProjDescription(activeProject.description);
    setProjRepoUrl(activeProject.repoUrl);
    setProjDemoUrl(activeProject.demoUrl || '');
    setProjTechStack(activeProject.techStack.join(', '));
    setProjArchitecture(activeProject.architectureOverview);
    setProjStatus(activeProject.status);
    setProjMilestones('');
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName.trim()) return;
    soundEngine.playClick();

    const stack = projTechStack
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (projectModalMode === 'create') {
      const milestones = projMilestones
        .split(',')
        .map((m) => m.trim())
        .filter(Boolean);

      addProject({
        name: projName.trim(),
        tagline: projTagline.trim() || 'Engineering Project',
        description: projDescription.trim() || 'Full-stack engineering project implementation.',
        repoUrl: projRepoUrl.trim() || 'https://github.com/Dhyanesh2603',
        demoUrl: projDemoUrl.trim() || undefined,
        techStack: stack.length > 0 ? stack : ['TypeScript', 'React'],
        architectureOverview: projArchitecture.trim() || 'Modular component-based architecture',
        status: projStatus,
        milestones: milestones.length > 0 ? milestones : undefined,
      });

      // Select newly created project
      setTimeout(() => {
        const latest = usePersonalOsStore.getState().projects[0];
        if (latest) setSelectedProjectId(latest.id);
      }, 50);
    } else if (activeProject) {
      updateProject(activeProject.id, {
        name: projName.trim(),
        tagline: projTagline.trim(),
        description: projDescription.trim(),
        repoUrl: projRepoUrl.trim(),
        demoUrl: projDemoUrl.trim() || undefined,
        techStack: stack,
        architectureOverview: projArchitecture.trim(),
        status: projStatus,
      });
    }

    setIsProjectModalOpen(false);
  };

  const handleDeleteActiveProject = () => {
    if (!activeProject) return;
    if (window.confirm(`Are you sure you want to delete project "${activeProject.name}"?`)) {
      soundEngine.playClick();
      deleteProject(activeProject.id);
      const remaining = projects.filter((p) => p.id !== activeProject.id);
      if (remaining.length > 0 && remaining[0]) {
        setSelectedProjectId(remaining[0].id);
      }
    }
  };

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneText.trim() || !activeProject) return;
    soundEngine.playClick();
    addProjectMilestone(activeProject.id, newMilestoneText.trim());
    setNewMilestoneText('');
  };

  const handleAddBug = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBugText.trim() || !activeProject) return;
    soundEngine.playClick();
    addProjectBug(activeProject.id, newBugText.trim(), newBugSeverity);
    setNewBugText('');
  };

  return (
    <div className="flex flex-col gap-6 p-6 font-sans text-neutral-200">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <FolderGit2 className="h-5 w-5 text-neutral-300" />
            <h2 className="text-xl font-medium tracking-tight text-white">
              Engineering Project Studio
            </h2>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Deep architectural specs, tech stacks, milestones, known bugs, and changelogs.
          </p>
        </div>

        {/* Project Selector Pills & Add Button */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {projects.map((proj) => (
            <button
              key={proj.id}
              onClick={() => {
                soundEngine.playClick();
                setSelectedProjectId(proj.id);
              }}
              className={`flex items-center gap-2 rounded-xl border px-3.5 py-1.5 text-xs font-mono transition-all shrink-0 cursor-pointer ${
                activeProject?.id === proj.id
                  ? 'border-white/30 bg-white/15 text-white font-medium shadow-sm'
                  : 'border-white/10 bg-white/[0.02] text-neutral-400 hover:border-white/20 hover:text-white'
              }`}
            >
              <span>{proj.name}</span>
              <span className="rounded bg-white/10 px-1.5 py-0.2 text-[10px] text-neutral-300">
                {proj.progress}%
              </span>
            </button>
          ))}

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 rounded-xl border border-dashed border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-mono text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 transition-all shrink-0 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {activeProject && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Architecture & Tech Stack (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {/* Overview Card */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-white tracking-tight">
                      {activeProject.name}
                    </h3>
                    <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-neutral-300">
                      {activeProject.status}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">{activeProject.tagline}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleOpenEditModal}
                    title="Edit Project Spec"
                    className="flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs font-mono text-neutral-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={handleDeleteActiveProject}
                    title="Delete Project"
                    className="flex items-center gap-1 rounded-lg border border-rose-500/20 bg-rose-500/10 px-2 py-1.5 text-xs font-mono text-rose-300 hover:bg-rose-500/20 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  {activeProject.repoUrl && (
                    <a
                      href={activeProject.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs font-mono text-neutral-300 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      <FolderGit2 className="h-3.5 w-3.5" />
                      <span>Repo</span>
                      <ExternalLink className="h-3 w-3 opacity-50" />
                    </a>
                  )}
                  {activeProject.demoUrl && (
                    <a
                      href={activeProject.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-2.5 py-1.5 text-xs font-mono text-white hover:bg-white/20 transition-colors"
                    >
                      <span>Live Demo</span>
                      <ExternalLink className="h-3 w-3 opacity-60" />
                    </a>
                  )}
                </div>
              </div>

              <div className="mt-3.5 text-xs leading-relaxed text-neutral-300">
                {activeProject.description}
              </div>

              {/* Connected Mission & Skills linkage */}
              <div className="mt-4 pt-3.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                {associatedMission && (
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] uppercase text-neutral-400">Mission:</span>
                    <button
                      onClick={() => {
                        soundEngine.playClick();
                        setActiveTab('missions');
                      }}
                      className="rounded-lg border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[11px] text-white hover:bg-white/10 transition-colors"
                    >
                      {associatedMission.title}
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[10px] uppercase text-neutral-400">Skills:</span>
                  {activeProject.skillIds.map((sid) => {
                    const skill = skills.find((s) => s.id === sid);
                    return (
                      <button
                        key={sid}
                        onClick={() => {
                          soundEngine.playClick();
                          setActiveTab('learning');
                        }}
                        className="rounded bg-white/5 px-2 py-0.5 font-mono text-[10px] text-neutral-300 hover:bg-white/10"
                      >
                        {skill?.name || sid}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Architecture Overview */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                <Cpu className="h-4 w-4 text-neutral-300" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-300 font-mono">
                  Architecture Specifications
                </h4>
              </div>
              <div className="mt-3.5 rounded-xl border border-white/5 bg-neutral-950/60 p-3.5 font-mono text-xs leading-relaxed text-neutral-300">
                {activeProject.architectureOverview}
              </div>

              {/* Tech Stack Chips */}
              <div className="mt-4 pt-3 border-t border-white/10">
                <div className="text-[10px] font-mono uppercase text-neutral-400 mb-2">Tech Stack Matrix</div>
                <div className="flex flex-wrap gap-1.5">
                  {activeProject.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-mono text-neutral-200"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Ideas & Future Roadmap */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-300 font-mono">
                  Explorations & Future Plans
                </h4>
              </div>
              <div className="mt-3.5 flex flex-col gap-2">
                {activeProject.ideas.map((idea, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-neutral-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-white/60 mt-1.5 shrink-0" />
                    <span>{idea}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Milestones, Known Bugs & Changelog (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Roadmap Milestones */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-neutral-300" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-300 font-mono">
                    Milestones Roadmap
                  </h4>
                </div>
                <span className="font-mono text-xs text-white">
                  {activeProject.milestones.filter((m) => m.completed).length}/{activeProject.milestones.length}
                </span>
              </div>

              <div className="mt-3.5 flex flex-col gap-2">
                {activeProject.milestones.map((m) => (
                  <div
                    key={m.id}
                    className={`group flex items-start justify-between gap-2.5 rounded-xl border p-2.5 transition-all ${
                      m.completed
                        ? 'border-white/5 bg-white/[0.01] text-neutral-500 line-through'
                        : 'border-white/10 bg-white/[0.02] text-neutral-200 hover:border-white/20'
                    }`}
                  >
                    <div
                      onClick={() => {
                        soundEngine.playClick();
                        toggleProjectMilestone(activeProject.id, m.id);
                      }}
                      className="flex items-start gap-2.5 flex-1 min-w-0 cursor-pointer"
                    >
                      {m.completed ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-neutral-400 mt-0.5" />
                      ) : (
                        <Circle className="h-4 w-4 shrink-0 text-neutral-500 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs">{m.title}</div>
                        {m.dueDate && (
                          <div className="text-[10px] font-mono text-neutral-400 mt-0.5">Due: {m.dueDate}</div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        soundEngine.playClick();
                        deleteProjectMilestone(activeProject.id, m.id);
                      }}
                      title="Delete Milestone"
                      className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-rose-400 transition-all cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}

                {/* Inline Milestone Creation */}
                <form onSubmit={handleAddMilestone} className="mt-1 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Add project milestone..."
                    value={newMilestoneText}
                    onChange={(e) => setNewMilestoneText(e.target.value)}
                    className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-white/30"
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-1 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-mono font-medium text-white hover:bg-white/20 transition-all cursor-pointer shrink-0"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Known Bugs Tracker */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Bug className="h-4 w-4 text-rose-400" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-300 font-mono">
                    Known Issues & Bugs ({activeProject.knownBugs.filter((b) => b.status === 'open').length})
                  </h4>
                </div>
              </div>

              <div className="mt-3.5 flex flex-col gap-2">
                {activeProject.knownBugs.length === 0 ? (
                  <div className="text-xs text-neutral-500 py-2">No known issues reported. Clean pipeline.</div>
                ) : (
                  activeProject.knownBugs.map((bug) => (
                    <div
                      key={bug.id}
                      className={`flex items-start justify-between gap-2 rounded-xl border p-2.5 text-xs ${
                        bug.status === 'resolved'
                          ? 'border-white/5 bg-white/[0.01] text-neutral-500 line-through'
                          : 'border-white/10 bg-white/[0.02] text-neutral-200'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span
                            className={`rounded px-1.5 py-0.2 font-mono text-[9px] uppercase tracking-wider ${
                              bug.severity === 'critical'
                                ? 'bg-rose-500/20 text-rose-300'
                                : 'bg-white/10 text-neutral-400'
                            }`}
                          >
                            {bug.severity}
                          </span>
                        </div>
                        <div>{bug.description}</div>
                      </div>

                      {bug.status === 'open' && (
                        <button
                          onClick={() => {
                            soundEngine.playClick();
                            resolveProjectBug(activeProject.id, bug.id);
                          }}
                          className="flex items-center gap-1 rounded border border-white/15 bg-white/5 px-2 py-1 text-[10px] font-mono text-neutral-300 hover:bg-white/15 hover:text-white transition-colors"
                          title="Mark Resolved"
                        >
                          <Check className="h-3 w-3" />
                          <span>Fix</span>
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Add Bug Form */}
              <form onSubmit={handleAddBug} className="mt-3 pt-3 border-t border-white/10 flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Report an architectural or runtime edge case..."
                  value={newBugText}
                  onChange={(e) => setNewBugText(e.target.value)}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-white/30"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {(['minor', 'moderate', 'critical'] as const).map((sev) => (
                      <button
                        key={sev}
                        type="button"
                        onClick={() => setNewBugSeverity(sev)}
                        className={`rounded px-2 py-0.5 text-[10px] font-mono uppercase ${
                          newBugSeverity === sev ? 'bg-white/20 text-white font-bold' : 'text-neutral-500 hover:text-white'
                        }`}
                      >
                        {sev}
                      </button>
                    ))}
                  </div>
                  <button
                    type="submit"
                    className="flex items-center gap-1 rounded-lg border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-medium text-white hover:bg-white/20"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Log Issue</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Commits & Changelog */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <GitCommit className="h-4 w-4 text-neutral-300" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-300 font-mono">
                    Recent Commits & Versions
                  </h4>
                </div>
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setSelectedCommitHash(undefined);
                    setIsGitModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-mono text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 transition-all shadow-sm"
                >
                  <GitBranch className="h-3 w-3" />
                  <span>Git Tree & Diff</span>
                </button>
              </div>

              <div className="mt-3.5 flex flex-col gap-1.5">
                {activeProject.recentCommits.map((c) => (
                  <div
                    key={c.hash}
                    onClick={() => {
                      soundEngine.playClick();
                      setSelectedCommitHash(c.hash);
                      setIsGitModalOpen(true);
                    }}
                    className="group flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.01] p-2 text-xs font-mono text-neutral-400 hover:border-emerald-500/30 hover:bg-emerald-500/[0.04] transition-all cursor-pointer"
                  >
                    <span className="truncate max-w-[220px] text-neutral-300 group-hover:text-emerald-300 transition-colors">
                      {c.message}
                    </span>
                    <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-neutral-300 group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-colors">
                      {c.hash}
                    </span>
                  </div>
                ))}
              </div>

              {activeProject.changelog.length > 0 && (
                <div className="mt-3.5 pt-3 border-t border-white/10">
                  <div className="text-[10px] font-mono uppercase text-neutral-400 mb-1.5">Latest Changelog</div>
                  {activeProject.changelog.map((entry) => (
                    <div key={entry.version} className="text-xs font-mono text-neutral-300">
                      <div className="text-white font-semibold">{entry.version} ({entry.date})</div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">{entry.notes.join(' • ')}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Git Branch Visualizer & Code Diff Modal */}
      {isGitModalOpen && activeProject && (
        <GitVisualizerModal
          project={activeProject}
          initialCommitHash={selectedCommitHash}
          onClose={() => setIsGitModalOpen(false)}
        />
      )}

      {/* Project Create / Edit Modal */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-2xl border border-white/15 bg-[#12161f] p-6 text-white shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <FolderGit2 className="h-5 w-5 text-accent-primary" />
                <h3 className="text-base font-semibold">
                  {projectModalMode === 'create' ? 'Create New Engineering Project' : 'Edit Project Specifications'}
                </h3>
              </div>
              <button
                onClick={() => setIsProjectModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-white rounded cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 mb-1">Project Name *</label>
                  <input
                    type="text"
                    required
                    value={projName}
                    onChange={(e) => setProjName(e.target.value)}
                    placeholder="e.g. NeuralFlow Vector Engine"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-accent-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 mb-1">Status</label>
                  <select
                    value={projStatus}
                    onChange={(e) => setProjStatus(e.target.value as ProjectStatus)}
                    className="w-full rounded-xl border border-white/10 bg-[#1c2230] px-3 py-2 text-white outline-none focus:border-accent-primary"
                  >
                    <option value="in_progress">In Progress</option>
                    <option value="active">Active</option>
                    <option value="shipped">Shipped</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-neutral-400 mb-1">Tagline</label>
                <input
                  type="text"
                  value={projTagline}
                  onChange={(e) => setProjTagline(e.target.value)}
                  placeholder="e.g. High-throughput distributed vector database in Rust"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-accent-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-neutral-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={projDescription}
                  onChange={(e) => setProjDescription(e.target.value)}
                  placeholder="Overview of project capabilities, purpose, and target metrics..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-accent-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 mb-1">GitHub Repo URL</label>
                  <input
                    type="url"
                    value={projRepoUrl}
                    onChange={(e) => setProjRepoUrl(e.target.value)}
                    placeholder="https://github.com/user/repo"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-accent-primary font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 mb-1">Live Demo URL (Optional)</label>
                  <input
                    type="url"
                    value={projDemoUrl}
                    onChange={(e) => setProjDemoUrl(e.target.value)}
                    placeholder="https://myproject.dev"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-accent-primary font-mono text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-neutral-400 mb-1">Tech Stack (comma-separated)</label>
                <input
                  type="text"
                  value={projTechStack}
                  onChange={(e) => setProjTechStack(e.target.value)}
                  placeholder="e.g. Rust, Actix, Tokio, WebAssembly, SIMD"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-accent-primary font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-neutral-400 mb-1">Architecture Overview</label>
                <textarea
                  rows={2}
                  value={projArchitecture}
                  onChange={(e) => setProjArchitecture(e.target.value)}
                  placeholder="Architectural design patterns, concurrency model, pipeline flow..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-accent-primary"
                />
              </div>

              {projectModalMode === 'create' && (
                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 mb-1">Initial Milestones (comma-separated)</label>
                  <input
                    type="text"
                    value={projMilestones}
                    onChange={(e) => setProjMilestones(e.target.value)}
                    placeholder="Scaffold repo, Implement core storage engine, Deploy benchmark runner"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-accent-primary"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="rounded-xl border border-white/10 px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white hover:bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-accent-primary px-4 py-2 text-xs font-semibold text-white shadow-md hover:opacity-90 cursor-pointer"
                >
                  {projectModalMode === 'create' ? 'Create Project' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
