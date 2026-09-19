import React, { useState } from 'react';
import {
  Briefcase,
  Building2,
  Calendar,
  FileText,
  CheckCircle2,
  Circle,
  Award,
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
  const { companies, updateCompanyStage } = usePersonalOsStore();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(companies[0]?.id || '');

  const activeCompany = companies.find((c) => c.id === selectedCompanyId) || companies[0];

  const portfolioChecklist = [
    { title: 'Flow OS Web Desktop Production Demo', completed: true },
    { title: 'NeuralCache Vector DB Benchmark Specs', completed: true },
    { title: 'Single-Page ATS 95+ Resume (v4 Systems Edition)', completed: true },
    { title: 'MockForge OpenAPI 3.1 Synthesis Engine', completed: true },
    { title: 'System Design: Distributed Ledger & Idempotency Notes', completed: false },
    { title: 'Record 5-minute technical walkthrough video', completed: false },
  ];

  const resumeVersions = [
    { name: 'Resume_v4_Systems_Focused.pdf', tag: 'Distributed / Backend', updated: '2026-09-18' },
    { name: 'Resume_v4_Frontend_Systems.pdf', tag: 'UI Engineering / React', updated: '2026-09-15' },
    { name: 'Resume_v4_General_SDE.pdf', tag: 'Generalist SWE', updated: '2026-09-10' },
  ];

  return (
    <div className="flex flex-col gap-6 p-6 font-sans text-neutral-200">
      {/* 1. Header & Placement Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-neutral-300" />
            <h2 className="text-xl font-medium tracking-tight text-white">
              Career & Placement Command Dashboard
            </h2>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Recruitment pipeline, resume versions, interview rounds, portfolio checklist, and skill gap audit.
          </p>
        </div>

        {/* Global Pipeline Badges */}
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-1.5 text-right font-mono">
            <div className="text-[10px] uppercase text-neutral-400">Target CTC Band</div>
            <div className="text-sm font-semibold text-white">₹45 - 55 LPA</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-1.5 text-right font-mono">
            <div className="text-[10px] uppercase text-neutral-400">Active Pipelines</div>
            <div className="text-sm font-semibold text-white">{companies.length} Targets</div>
          </div>
        </div>
      </div>

      {/* 2. Visual Placement Pipeline (Kanban Columns) */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs font-mono text-neutral-400 uppercase tracking-wider">
          <span>Recruitment Pipeline Matrix</span>
          <span>Click company to inspect rounds</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {PIPELINE_STAGES.map((stage) => {
            const stageCompanies = companies.filter((c) => c.stage === stage.id);

            return (
              <div
                key={stage.id}
                className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-3 min-h-[180px]"
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5 text-xs font-mono">
                  <span className="font-semibold text-neutral-300">{stage.label}</span>
                  <span className="rounded bg-white/10 px-1.5 py-0.2 text-[10px] text-neutral-400">
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
                            : 'border-white/5 bg-white/[0.02] hover:border-white/15'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-semibold text-white">
                          <span>{comp.companyName}</span>
                          <Building2 className="h-3 w-3 text-neutral-500" />
                        </div>
                        <div className="text-[10px] text-neutral-400 mt-1 truncate">{comp.role}</div>
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

      {/* 3. Company Detail Studio & Interview Rounds */}
      {activeCompany && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Active Company Details (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-white tracking-tight">
                      {activeCompany.companyName}
                    </h3>
                    <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-neutral-300">
                      {activeCompany.stage}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">{activeCompany.role}</p>
                </div>

                {/* Change Stage Dropdown */}
                <select
                  value={activeCompany.stage}
                  onChange={(e) => {
                    soundEngine.playClick();
                    updateCompanyStage(activeCompany.id, e.target.value as CareerStage);
                  }}
                  className="rounded-lg border border-white/20 bg-neutral-900 px-3 py-1.5 text-xs font-mono text-white outline-none"
                >
                  {PIPELINE_STAGES.map((s) => (
                    <option key={s.id} value={s.id}>
                      Move to: {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Company Telemetry */}
              <div className="grid grid-cols-3 gap-2.5 mt-4 text-xs font-mono">
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2.5">
                  <div className="text-[10px] text-neutral-400 uppercase">CTC Package</div>
                  <div className="text-white font-semibold mt-1 truncate">{activeCompany.ctcRange || 'Competitive'}</div>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2.5">
                  <div className="text-[10px] text-neutral-400 uppercase">Location</div>
                  <div className="text-white font-semibold mt-1 truncate">{activeCompany.location || 'Remote'}</div>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2.5">
                  <div className="text-[10px] text-neutral-400 uppercase">Resume Used</div>
                  <div className="text-white font-semibold mt-1 truncate">{activeCompany.resumeVersionUsed || 'v4'}</div>
                </div>
              </div>

              {/* Notes */}
              {activeCompany.notes && (
                <div className="mt-4 rounded-xl border border-white/5 bg-neutral-950/40 p-3 text-xs leading-relaxed text-neutral-300 font-mono">
                  {activeCompany.notes}
                </div>
              )}
            </div>

            {/* Interview Rounds Log */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                <Calendar className="h-4 w-4 text-neutral-300" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-300 font-mono">
                  Interview Rounds Schedule
                </h4>
              </div>

              <div className="mt-3.5 flex flex-col gap-2.5">
                {activeCompany.interviewRounds.map((round) => (
                  <div
                    key={round.id}
                    className="flex items-start justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs font-mono"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{round.roundName}</span>
                        {round.passed && (
                          <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[9px] text-emerald-300 border border-emerald-500/30">
                            Passed
                          </span>
                        )}
                      </div>
                      {round.feedback && (
                        <div className="text-[11px] text-neutral-400 mt-1">{round.feedback}</div>
                      )}
                    </div>
                    {round.date && <div className="text-[11px] text-neutral-400 shrink-0">{round.date}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Resume Versions & Portfolio Checklist (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Resume Versions */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-neutral-300" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-300 font-mono">
                    Resume Versions (ATS 95+)
                  </h4>
                </div>
              </div>

              <div className="mt-3.5 flex flex-col gap-2">
                {resumeVersions.map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3 hover:border-white/15 transition-all text-xs"
                  >
                    <div>
                      <div className="font-mono text-neutral-200">{r.name}</div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">{r.tag}</div>
                    </div>
                    <span className="font-mono text-[10px] text-neutral-500">{r.updated}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Portfolio Checklist */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-neutral-300" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-300 font-mono">
                    Portfolio Readiness Checklist
                  </h4>
                </div>
              </div>

              <div className="mt-3.5 flex flex-col gap-2">
                {portfolioChecklist.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 text-xs text-neutral-300"
                  >
                    {item.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-neutral-500 shrink-0" />
                    )}
                    <span className={item.completed ? 'text-neutral-200' : 'text-neutral-400'}>
                      {item.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
