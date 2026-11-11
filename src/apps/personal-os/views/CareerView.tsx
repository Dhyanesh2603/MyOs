import React, { useState } from 'react';
import {
  Briefcase,
  Building2,
  Calendar,
  FileText,
  CheckCircle2,
  Circle,
  Award,
  Plus,
  Pencil,
  Trash2,
  X,
  ExternalLink,
  Save,
} from 'lucide-react';
import { usePersonalOsStore } from '@core/personal-os/personalOsStore';
import type { CareerStage } from '@core/personal-os/types';
import { soundEngine } from '@core/audio/soundEngine';

const PIPELINE_STAGES: { id: CareerStage; label: string }[] = [
  { id: 'wishlist', label: 'Wishlist' },
  { id: 'applied', label: 'Applied' },
  { id: 'oa', label: 'OA / Screen' },
  { id: 'technical', label: 'Technical' },
  { id: 'hr', label: 'HR / Final' },
  { id: 'offer', label: 'Offer' },
];

export const CareerView: React.FC = () => {
  const {
    companies,
    updateCompanyStage,
    addCompany,
    updateCompany,
    deleteCompany,
    addInterviewRound,
    deleteInterviewRound,
    toggleInterviewRoundPassed,
    portfolioChecklist,
    togglePortfolioChecklist,
    addPortfolioChecklist,
    deletePortfolioChecklist,
    resumeVersions,
    addResumeVersion,
    deleteResumeVersion,
  } = usePersonalOsStore();

  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(companies[0]?.id || '');

  // Company Modal State
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [companyModalMode, setCompanyModalMode] = useState<'add' | 'edit'>('add');
  const [compName, setCompName] = useState('');
  const [compRole, setCompRole] = useState('');
  const [compStage, setCompStage] = useState<CareerStage>('wishlist');
  const [compCtc, setCompCtc] = useState('₹45 - 55 LPA');
  const [compLocation, setCompLocation] = useState('Bengaluru / Remote');
  const [compResumeVersion, setCompResumeVersion] = useState('Resume_v4_Systems_Focused.pdf');
  const [compJobUrl, setCompJobUrl] = useState('');
  const [compNotes, setCompNotes] = useState('');

  // Interview Round Modal State
  const [isRoundModalOpen, setIsRoundModalOpen] = useState(false);
  const [roundName, setRoundName] = useState('');
  const [roundDate, setRoundDate] = useState('');
  const [roundFeedback, setRoundFeedback] = useState('');

  // Portfolio Item Input
  const [newPortfolioTitle, setNewPortfolioTitle] = useState('');

  // Resume Modal State
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [resumeName, setResumeName] = useState('');
  const [resumeTag, setResumeTag] = useState('');

  const activeCompany = companies.find((c) => c.id === selectedCompanyId) || companies[0];

  const handleOpenAddCompany = () => {
    soundEngine.playClick();
    setCompanyModalMode('add');
    setCompName('');
    setCompRole('');
    setCompStage('applied');
    setCompCtc('');
    setCompLocation('');
    setCompResumeVersion('');
    setCompJobUrl('');
    setCompNotes('');
    setIsCompanyModalOpen(true);
  };

  const handleOpenEditCompany = () => {
    if (!activeCompany) return;
    soundEngine.playClick();
    setCompanyModalMode('edit');
    setCompName(activeCompany.companyName);
    setCompRole(activeCompany.role);
    setCompStage(activeCompany.stage);
    setCompCtc(activeCompany.ctcRange || '');
    setCompLocation(activeCompany.location || '');
    setCompResumeVersion(activeCompany.resumeVersionUsed || '');
    setCompJobUrl(activeCompany.jobUrl || '');
    setCompNotes(activeCompany.notes || '');
    setIsCompanyModalOpen(true);
  };

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!compName.trim() || !compRole.trim()) return;
    soundEngine.playClick();

    if (companyModalMode === 'add') {
      addCompany({
        companyName: compName.trim(),
        role: compRole.trim(),
        stage: compStage,
        ctcRange: compCtc.trim(),
        location: compLocation.trim(),
        jobUrl: compJobUrl.trim(),
        notes: compNotes.trim(),
        resumeVersionUsed: compResumeVersion.trim(),
      });
    } else if (activeCompany) {
      updateCompany(activeCompany.id, {
        companyName: compName.trim(),
        role: compRole.trim(),
        stage: compStage,
        ctcRange: compCtc.trim(),
        location: compLocation.trim(),
        jobUrl: compJobUrl.trim(),
        notes: compNotes.trim(),
        resumeVersionUsed: compResumeVersion.trim(),
      });
    }
    setIsCompanyModalOpen(false);
  };

  const handleDeleteCompany = () => {
    if (!activeCompany) return;
    if (confirm(`Are you sure you want to remove ${activeCompany.companyName} from your recruitment pipeline?`)) {
      soundEngine.playClick();
      deleteCompany(activeCompany.id);
      const remaining = companies.filter((c) => c.id !== activeCompany.id);
      if (remaining[0]) {
        setSelectedCompanyId(remaining[0].id);
      }
    }
  };

  const handleSaveRound = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCompany || !roundName.trim()) return;
    soundEngine.playClick();
    addInterviewRound(activeCompany.id, roundName.trim(), roundDate.trim(), roundFeedback.trim());
    setRoundName('');
    setRoundDate('');
    setRoundFeedback('');
    setIsRoundModalOpen(false);
  };

  const handleAddPortfolioItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPortfolioTitle.trim()) return;
    soundEngine.playClick();
    addPortfolioChecklist(newPortfolioTitle.trim());
    setNewPortfolioTitle('');
  };

  const handleSaveResume = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeName.trim()) return;
    soundEngine.playClick();
    addResumeVersion(resumeName.trim(), resumeTag.trim() || 'General SWE');
    setResumeName('');
    setResumeTag('');
    setIsResumeModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-6 p-6 font-sans text-white">
      {/* 1. Header & Placement Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-neutral-300" />
            <h2 className="text-xl font-medium tracking-tight text-white">
              Career & Placement Command Dashboard
            </h2>
          </div>
          <p className="text-xs text-neutral-300 mt-1">
            Recruitment pipeline, resume versions, interview rounds, portfolio checklist, and skill gap audit.
          </p>
        </div>

        {/* Global Pipeline Badges & Add Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAddCompany}
            className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-mono text-white hover:bg-white/20 transition-all shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Target Company</span>
          </button>

          <div className="rounded-xl border border-white/[0.08] bg-[#10121a] px-3.5 py-1.5 text-right font-mono">
            <div className="text-[10px] uppercase text-neutral-300">Target CTC Band</div>
            <div className="text-sm font-semibold text-white">
              {companies.find((c) => c.ctcRange)?.ctcRange || 'Not Set'}
            </div>
          </div>
          <div className="rounded-xl border border-white/[0.08] bg-[#10121a] px-3.5 py-1.5 text-right font-mono">
            <div className="text-[10px] uppercase text-neutral-300">Active Pipelines</div>
            <div className="text-sm font-semibold text-white">{companies.length} Targets</div>
          </div>
        </div>
      </div>

      {/* 2. Visual Placement Pipeline (Kanban Columns) */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs font-mono text-neutral-300 uppercase tracking-wider">
          <span>Recruitment Pipeline Matrix</span>
          <span>Click company to inspect rounds</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {PIPELINE_STAGES.map((stage) => {
            const stageCompanies = companies.filter((c) => c.stage === stage.id);

            return (
              <div
                key={stage.id}
                className="flex flex-col rounded-2xl border border-white/[0.08] bg-[#10121a] p-3 min-h-[180px]"
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.06] text-xs font-mono">
                  <span className="font-semibold text-neutral-300">{stage.label}</span>
                  <span className="rounded bg-white/10 px-1.5 py-0.2 text-[10px] text-neutral-300">
                    {stageCompanies.length}
                  </span>
                </div>

                <div className="flex flex-col gap-2 flex-1">
                  {stageCompanies.map((comp) => {
                    const isSelected = activeCompany?.id === comp.id;

                    return (
                      <div
                        key={comp.id}
                        onClick={() => {
                          soundEngine.playClick();
                          setSelectedCompanyId(comp.id);
                        }}
                        className={`rounded-xl border p-2.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-white/30 bg-white/[0.08] shadow-md ring-1 ring-white/10'
                            : 'border-white/[0.06] bg-[#10121a] hover:border-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-semibold text-white">
                          <span className="truncate pr-1">{comp.companyName}</span>
                          <Building2 className="h-3 w-3 shrink-0 text-neutral-400" />
                        </div>
                        <div className="text-[10px] text-neutral-300 mt-1 truncate">{comp.role}</div>
                        {comp.ctcRange && (
                          <div className="mt-2 text-[9px] font-mono text-emerald-400 truncate">
                            {comp.ctcRange}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Company Detail Studio, Interview Rounds & Resume/Portfolio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Company Details (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {activeCompany ? (
            <>
            <div className="rounded-2xl border border-white/[0.08] bg-[#10121a] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-white/[0.08]">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-white tracking-tight">
                      {activeCompany.companyName}
                    </h3>
                    <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-neutral-300">
                      {activeCompany.stage}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 mt-1">{activeCompany.role}</p>
                </div>

                {/* Change Stage Dropdown & Action Buttons */}
                <div className="flex items-center gap-2">
                  <select
                    value={activeCompany.stage}
                    onChange={(e) => {
                      soundEngine.playClick();
                      updateCompanyStage(activeCompany.id, e.target.value as CareerStage);
                    }}
                    className="rounded-lg border border-white/20 bg-[#0a0f1e] px-3 py-1.5 text-xs font-mono text-white outline-none cursor-pointer"
                  >
                    {PIPELINE_STAGES.map((s) => (
                      <option key={s.id} value={s.id}>
                        Move to: {s.label}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleOpenEditCompany}
                    className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-mono text-neutral-300 hover:bg-white/10 transition-colors"
                  >
                    <Pencil className="h-3 w-3" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={handleDeleteCompany}
                    className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-1.5 text-rose-400 hover:bg-rose-500/20 transition-colors"
                    title="Delete Company"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Company Telemetry */}
              <div className="grid grid-cols-3 gap-2.5 mt-4 text-xs font-mono">
                <div className="rounded-xl border border-white/[0.06] bg-[#10121a] p-2.5">
                  <div className="text-[10px] text-neutral-300 uppercase">CTC Package</div>
                  <div className="text-white font-semibold mt-1 truncate">{activeCompany.ctcRange || '—'}</div>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-[#10121a] p-2.5">
                  <div className="text-[10px] text-neutral-300 uppercase">Location</div>
                  <div className="text-white font-semibold mt-1 truncate">{activeCompany.location || '—'}</div>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-[#10121a] p-2.5">
                  <div className="text-[10px] text-neutral-300 uppercase">Resume Used</div>
                  <div className="text-white font-semibold mt-1 truncate">{activeCompany.resumeVersionUsed || '—'}</div>
                </div>
              </div>

              {/* Job URL if present */}
              {activeCompany.jobUrl && (
                <div className="mt-3 flex items-center gap-2 text-xs font-mono text-neutral-300">
                  <span>Job Listing:</span>
                  <a
                    href={activeCompany.jobUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-sky-400 hover:underline truncate"
                  >
                    <span className="truncate">{activeCompany.jobUrl}</span>
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                </div>
              )}

              {/* Notes */}
              {activeCompany.notes && (
                <div className="mt-4 rounded-xl border border-white/[0.06] bg-[#070b16]/40 p-3 text-xs leading-relaxed text-neutral-300 font-mono">
                  {activeCompany.notes}
                </div>
              )}
            </div>

            {/* Interview Rounds Log */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#10121a] p-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-neutral-300" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-300 font-mono">
                    Interview Rounds Schedule
                  </h4>
                </div>
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setRoundName('');
                    setRoundDate('');
                    setRoundFeedback('');
                    setIsRoundModalOpen(true);
                  }}
                  className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-mono text-white hover:bg-white/10 transition-colors"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add Round</span>
                </button>
              </div>

              <div className="mt-3.5 flex flex-col gap-2.5">
                {activeCompany.interviewRounds.length === 0 ? (
                  <div className="p-4 text-center text-xs font-mono text-neutral-400 border border-dashed border-white/[0.08] rounded-xl">
                    No interview rounds scheduled yet. Click &quot;Add Round&quot; to log screens or technical rounds.
                  </div>
                ) : (
                  activeCompany.interviewRounds.map((round) => (
                    <div
                      key={round.id}
                      className="group flex items-start justify-between gap-3 rounded-xl border border-white/[0.06] bg-[#10121a] p-3 text-xs font-mono hover:border-white/10 transition-all"
                    >
                      <div className="flex items-start gap-2.5 flex-1">
                        <button
                          onClick={() => {
                            soundEngine.playClick();
                            toggleInterviewRoundPassed(activeCompany.id, round.id);
                          }}
                          className={`mt-0.5 rounded px-1.5 py-0.5 text-[9px] uppercase font-semibold transition-colors ${
                            round.passed
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-white/10 text-neutral-300 hover:text-white'
                          }`}
                          title="Click to toggle status"
                        >
                          {round.passed ? 'Passed' : 'Pending'}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-medium">{round.roundName}</div>
                          {round.feedback && (
                            <div className="text-[11px] text-neutral-300 mt-1 leading-relaxed">
                              {round.feedback}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {round.date && (
                          <div className="text-[11px] text-neutral-300 shrink-0">{round.date}</div>
                        )}
                        <button
                          onClick={() => {
                            soundEngine.playClick();
                            deleteInterviewRound(activeCompany.id, round.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-neutral-300 hover:text-rose-400 transition-opacity"
                          title="Delete Round"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-white/[0.08] bg-[#10121a] text-center min-h-[260px]">
            <Building2 className="h-10 w-10 text-neutral-600 mb-3" />
            <h3 className="text-base font-medium text-white">No Target Companies Yet</h3>
            <p className="text-xs text-neutral-300 mt-1 max-w-sm">
              Add target companies to your recruitment pipeline to track stages, compensation, and interview rounds.
            </p>
            <button
              onClick={handleOpenAddCompany}
              className="mt-4 flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-mono text-white hover:bg-white/20 transition-all shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add First Target Company</span>
            </button>
          </div>
        )}
      </div>

      {/* Right: Resume Versions & Portfolio Checklist (5 cols) */}
      <div className="lg:col-span-5 flex flex-col gap-5">
        {/* Resume Versions */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#10121a] p-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-neutral-300" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-300 font-mono">
                Resume Versions
              </h4>
            </div>
            <button
              onClick={() => {
                soundEngine.playClick();
                setResumeName('');
                setResumeTag('');
                setIsResumeModalOpen(true);
              }}
              className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-mono text-white hover:bg-white/10 transition-colors"
            >
              <Plus className="h-3 w-3" />
              <span>Add</span>
            </button>
          </div>

          <div className="mt-3.5 flex flex-col gap-2">
            {resumeVersions.length === 0 ? (
              <div className="p-4 text-center text-xs font-mono text-neutral-400 border border-dashed border-white/[0.08] rounded-xl">
                No resume versions tracked yet. Click &quot;Add&quot; to log your tailored resumes.
              </div>
            ) : (
              resumeVersions.map((r) => (
                <div
                  key={r.id}
                  className="group flex items-center justify-between rounded-xl border border-white/[0.06] bg-[#10121a] p-3 hover:border-white/10 transition-all text-xs"
                >
                  <div>
                    <div className="font-mono text-white font-medium">{r.name}</div>
                    <div className="text-[10px] text-neutral-300 mt-0.5">{r.tag}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-neutral-400">{r.updated}</span>
                    <button
                      onClick={() => {
                        soundEngine.playClick();
                        deleteResumeVersion(r.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-neutral-300 hover:text-rose-400 transition-opacity"
                      title="Delete Resume"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Portfolio Checklist */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#10121a] p-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-neutral-300" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-300 font-mono">
                Portfolio Readiness Checklist
              </h4>
            </div>
            <span className="font-mono text-xs text-neutral-300">
              {portfolioChecklist.filter((i) => i.completed).length}/{portfolioChecklist.length} Ready
            </span>
          </div>

          {/* Inline Add Item Form */}
          <form onSubmit={handleAddPortfolioItem} className="mt-3 flex items-center gap-2">
            <input
              type="text"
              placeholder="Add target portfolio asset..."
              value={newPortfolioTitle}
              onChange={(e) => setNewPortfolioTitle(e.target.value)}
              className="flex-1 rounded-xl border border-white/[0.08] bg-white/5 px-3 py-1.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-white/30 font-mono"
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
            {portfolioChecklist.length === 0 ? (
              <div className="p-4 text-center text-xs font-mono text-neutral-400 border border-dashed border-white/[0.08] rounded-xl">
                No portfolio items yet. Add target assets above (e.g. GitHub repos, live demos, blogs).
              </div>
            ) : (
              portfolioChecklist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    soundEngine.playClick();
                    togglePortfolioChecklist(item.id);
                  }}
                  className="group flex items-center justify-between gap-2.5 text-xs text-neutral-300 rounded-xl border border-white/[0.06] bg-[#0d0e14] p-2 hover:border-white/10 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {item.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-neutral-400 shrink-0" />
                    )}
                    <span className={`truncate ${item.completed ? 'text-neutral-300' : 'text-neutral-300'}`}>
                      {item.title}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      soundEngine.playClick();
                      deletePortfolioChecklist(item.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-neutral-300 hover:text-rose-400 transition-opacity"
                    title="Delete Item"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>

      {/* Modal 1: Add or Edit Company */}
      {isCompanyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/20 bg-[#0a0f1e] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-base font-semibold text-white font-mono">
                {companyModalMode === 'add' ? 'Add Target Company' : 'Edit Company Details'}
              </h3>
              <button
                onClick={() => setIsCompanyModalOpen(false)}
                className="rounded-lg p-1 text-neutral-300 hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCompany} className="mt-4 flex flex-col gap-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-300 uppercase text-[10px]">Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Google, Stripe, Jane Street"
                    value={compName}
                    onChange={(e) => setCompName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/[0.08] bg-white/5 px-3 py-2 text-white outline-none focus:border-white/30"
                  />
                </div>
                <div>
                  <label className="text-neutral-300 uppercase text-[10px]">Pipeline Stage</label>
                  <select
                    value={compStage}
                    onChange={(e) => setCompStage(e.target.value as CareerStage)}
                    className="mt-1 w-full rounded-xl border border-white/[0.08] bg-[#0a0f1e] px-3 py-2 text-white outline-none"
                  >
                    {PIPELINE_STAGES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-neutral-300 uppercase text-[10px]">Target Role *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Software Engineer - Distributed Systems"
                  value={compRole}
                  onChange={(e) => setCompRole(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/[0.08] bg-white/5 px-3 py-2 text-white outline-none focus:border-white/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-300 uppercase text-[10px]">Compensation Band</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹55 LPA or $200k"
                    value={compCtc}
                    onChange={(e) => setCompCtc(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/[0.08] bg-white/5 px-3 py-2 text-white outline-none focus:border-white/30"
                  />
                </div>
                <div>
                  <label className="text-neutral-300 uppercase text-[10px]">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Bengaluru / Remote"
                    value={compLocation}
                    onChange={(e) => setCompLocation(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/[0.08] bg-white/5 px-3 py-2 text-white outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-300 uppercase text-[10px]">Resume Version Used</label>
                  <input
                    type="text"
                    placeholder="e.g. Resume_v4_Systems_Focused.pdf"
                    value={compResumeVersion}
                    onChange={(e) => setCompResumeVersion(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/[0.08] bg-white/5 px-3 py-2 text-white outline-none focus:border-white/30"
                  />
                </div>
                <div>
                  <label className="text-neutral-300 uppercase text-[10px]">Job Post / Application Link</label>
                  <input
                    type="url"
                    placeholder="https://careers.google.com/jobs/..."
                    value={compJobUrl}
                    onChange={(e) => setCompJobUrl(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/[0.08] bg-white/5 px-3 py-2 text-white outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-300 uppercase text-[10px]">Preparation Notes & Referral</label>
                <textarea
                  rows={3}
                  placeholder="Referral contact, tech stack emphasis, recent interviewer feedback..."
                  value={compNotes}
                  onChange={(e) => setCompNotes(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/[0.08] bg-white/5 px-3 py-2 text-white outline-none focus:border-white/30"
                />
              </div>

              <div className="mt-2 flex justify-end gap-2 border-t border-white/[0.08] pt-4">
                <button
                  type="button"
                  onClick={() => setIsCompanyModalOpen(false)}
                  className="rounded-xl border border-white/[0.08] px-4 py-2 text-neutral-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 font-medium text-black hover:bg-neutral-200 shadow-md"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{companyModalMode === 'add' ? 'Add to Pipeline' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Add Interview Round */}
      {isRoundModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/20 bg-[#0a0f1e] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-sm font-semibold text-white font-mono">
                Log Interview Round for {activeCompany?.companyName}
              </h3>
              <button
                onClick={() => setIsRoundModalOpen(false)}
                className="rounded-lg p-1 text-neutral-300 hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRound} className="mt-4 flex flex-col gap-3 font-mono text-xs">
              <div>
                <label className="text-neutral-300 uppercase text-[10px]">Round Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Technical Round 1 - System Architecture & Concurrency"
                  value={roundName}
                  onChange={(e) => setRoundName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/[0.08] bg-white/5 px-3 py-2 text-white outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="text-neutral-300 uppercase text-[10px]">Date Scheduled</label>
                <input
                  type="date"
                  value={roundDate}
                  onChange={(e) => setRoundDate(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/[0.08] bg-white/5 px-3 py-2 text-white outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="text-neutral-300 uppercase text-[10px]">Preparation Notes & Feedback</label>
                <textarea
                  rows={3}
                  placeholder="Questions asked, topics tested, interviewer remarks..."
                  value={roundFeedback}
                  onChange={(e) => setRoundFeedback(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/[0.08] bg-white/5 px-3 py-2 text-white outline-none focus:border-white/30"
                />
              </div>

              <div className="mt-2 flex justify-end gap-2 border-t border-white/[0.08] pt-3">
                <button
                  type="button"
                  onClick={() => setIsRoundModalOpen(false)}
                  className="rounded-xl border border-white/[0.08] px-3 py-1.5 text-neutral-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1 rounded-xl bg-white px-3 py-1.5 font-medium text-black hover:bg-neutral-200 shadow-md"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Log Round</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Add Resume Version */}
      {isResumeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/20 bg-[#0a0f1e] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-sm font-semibold text-white font-mono">Add Resume Target Version</h3>
              <button
                onClick={() => setIsResumeModalOpen(false)}
                className="rounded-lg p-1 text-neutral-300 hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveResume} className="mt-4 flex flex-col gap-3 font-mono text-xs">
              <div>
                <label className="text-neutral-300 uppercase text-[10px]">Filename *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Resume_v5_Distributed_Systems.pdf"
                  value={resumeName}
                  onChange={(e) => setResumeName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/[0.08] bg-white/5 px-3 py-2 text-white outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="text-neutral-300 uppercase text-[10px]">Specialization Tag</label>
                <input
                  type="text"
                  placeholder="e.g. Distributed / Backend"
                  value={resumeTag}
                  onChange={(e) => setResumeTag(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/[0.08] bg-white/5 px-3 py-2 text-white outline-none focus:border-white/30"
                />
              </div>

              <div className="mt-2 flex justify-end gap-2 border-t border-white/[0.08] pt-3">
                <button
                  type="button"
                  onClick={() => setIsResumeModalOpen(false)}
                  className="rounded-xl border border-white/[0.08] px-3 py-1.5 text-neutral-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1 rounded-xl bg-white px-3 py-1.5 font-medium text-black hover:bg-neutral-200 shadow-md"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Resume</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
