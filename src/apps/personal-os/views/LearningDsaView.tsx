import React, { useState } from 'react';
import {
  Code2,
  Brain,
  CheckCircle2,
  Clock,
  Star,
  Layers,
  Flame,
  BookMarked,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { usePersonalOsStore } from '@core/personal-os/personalOsStore';
import type { DsaPattern, DsaDifficulty } from '@core/personal-os/types';
import { soundEngine } from '@core/audio/soundEngine';

export const LearningDsaView: React.FC = () => {
  const {
    skills,
    dsaQuestions,
    toggleDsaStatus,
    toggleDsaFavorite,
    updateDsaMistake,
    projects,
    setActiveTab,
  } = usePersonalOsStore();

  const [activeSection, setActiveSection] = useState<'dsa' | 'skills'>('dsa');
  const [selectedPattern, setSelectedPattern] = useState<DsaPattern | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DsaDifficulty | 'all'>('all');
  const [editingMistakeId, setEditingMistakeId] = useState<string | null>(null);
  const [mistakeDraft, setMistakeDraft] = useState('');

  // DSA Metrics
  const totalSolved = dsaQuestions.filter((q) => q.status === 'solved').length;
  const reviewNeeded = dsaQuestions.filter((q) => q.status === 'review_needed').length;
  const easyCount = dsaQuestions.filter((q) => q.difficulty === 'Easy').length;
  const mediumCount = dsaQuestions.filter((q) => q.difficulty === 'Medium').length;
  const hardCount = dsaQuestions.filter((q) => q.difficulty === 'Hard').length;

  const filteredQuestions = dsaQuestions.filter((q) => {
    const patternMatch = selectedPattern === 'all' || q.pattern === selectedPattern;
    const diffMatch = selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;
    return patternMatch && diffMatch;
  });

  const handleSaveMistake = (id: string) => {
    soundEngine.playClick();
    updateDsaMistake(id, mistakeDraft);
    setEditingMistakeId(null);
  };

  return (
    <div className="flex flex-col gap-6 p-6 font-sans text-neutral-200">
      {/* 1. Header & Section Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-neutral-300" />
            <h2 className="text-xl font-medium tracking-tight text-white">
              Learning Hub & DSA Workspace
            </h2>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Algorithmic patterns, LeetCode problem distribution, interview readiness, and core engineering skills.
          </p>
        </div>

        {/* Section Switcher Tabs */}
        <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.02] p-1">
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveSection('dsa');
            }}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-mono transition-all ${
              activeSection === 'dsa'
                ? 'bg-white/15 text-white font-medium shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Code2 className="h-3.5 w-3.5" />
            <span>DSA Workspace</span>
          </button>
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveSection('skills');
            }}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-mono transition-all ${
              activeSection === 'skills'
                ? 'bg-white/15 text-white font-medium shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Skill Matrix ({skills.length})</span>
          </button>
        </div>
      </div>

      {activeSection === 'dsa' ? (
        <>
          {/* 2. DSA Telemetry Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Total Problems Solved */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4.5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span className="font-mono uppercase tracking-wider text-[11px]">Solved In Repertoire</span>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <div className="mt-2 text-2xl font-bold font-mono text-white">{totalSolved} Questions</div>
              <div className="text-[11px] text-neutral-400 mt-1 font-mono">Curated Blind 75 & NeetCode 150</div>
            </div>

            {/* Difficulty Breakdown */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4.5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span className="font-mono uppercase tracking-wider text-[11px]">Difficulty Spread</span>
                <Flame className="h-3.5 w-3.5 text-amber-400" />
              </div>
              <div className="flex items-center gap-2 mt-2 font-mono text-xs">
                <span className="text-emerald-400 font-semibold">{easyCount} Easy</span>
                <span className="text-neutral-500">•</span>
                <span className="text-amber-400 font-semibold">{mediumCount} Med</span>
                <span className="text-neutral-500">•</span>
                <span className="text-rose-400 font-semibold">{hardCount} Hard</span>
              </div>
              <div className="mt-2 flex h-1.5 w-full rounded-full overflow-hidden bg-white/10">
                <div style={{ width: `${(easyCount / (dsaQuestions.length || 1)) * 100}%` }} className="bg-emerald-400" />
                <div style={{ width: `${(mediumCount / (dsaQuestions.length || 1)) * 100}%` }} className="bg-amber-400" />
                <div style={{ width: `${(hardCount / (dsaQuestions.length || 1)) * 100}%` }} className="bg-rose-400" />
              </div>
            </div>

            {/* Interview Readiness */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4.5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span className="font-mono uppercase tracking-wider text-[11px]">Interview Readiness</span>
                <Sparkles className="h-3.5 w-3.5 text-sky-400" />
              </div>
              <div className="mt-2 text-2xl font-bold font-mono text-white">82%</div>
              <div className="text-[11px] text-emerald-400 mt-1 font-mono">Ready for Tier-1 Product Rounds</div>
            </div>

            {/* Review Needed */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4.5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span className="font-mono uppercase tracking-wider text-[11px]">Revision Queue</span>
                <Clock className="h-3.5 w-3.5 text-neutral-400" />
              </div>
              <div className="mt-2 text-2xl font-bold font-mono text-amber-300">{reviewNeeded} Flagged</div>
              <div className="text-[11px] text-neutral-400 mt-1 font-mono">Spaced repetition schedule</div>
            </div>
          </div>

          {/* 3. Filter Bar (Patterns & Difficulty) */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-white/5">
            {/* Pattern Selector */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {(
                [
                  'all',
                  'Two Pointers',
                  'Sliding Window',
                  'Monotonic Stack',
                  'Dynamic Programming',
                  'Trees & Binary Search Trees',
                  'Graphs & BFS/DFS',
                  'Binary Search',
                ] as const
              ).map((pat) => (
                <button
                  key={pat}
                  onClick={() => {
                    soundEngine.playClick();
                    setSelectedPattern(pat);
                  }}
                  className={`rounded-lg px-2.5 py-1 font-mono text-xs whitespace-nowrap transition-colors ${
                    selectedPattern === pat
                      ? 'bg-white/15 text-white font-medium'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {pat}
                </button>
              ))}
            </div>

            {/* Difficulty Selector */}
            <div className="flex items-center gap-1 font-mono text-xs">
              {(['all', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => {
                    soundEngine.playClick();
                    setSelectedDifficulty(diff);
                  }}
                  className={`rounded px-2 py-0.5 ${
                    selectedDifficulty === diff
                      ? 'bg-white/20 text-white font-semibold'
                      : 'text-neutral-500 hover:text-white'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Questions Repertoire Table */}
          <div className="flex flex-col gap-3">
            {filteredQuestions.map((q) => {
              const isEditing = editingMistakeId === q.id;

              return (
                <div
                  key={q.id}
                  className="flex flex-col rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-all hover:border-white/20 hover:bg-white/[0.03]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        onClick={() => {
                          soundEngine.playClick();
                          toggleDsaStatus(q.id);
                        }}
                        className="mt-0.5"
                        title={q.status === 'solved' ? 'Mark for Review' : 'Mark Solved'}
                      >
                        {q.status === 'solved' ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 hover:scale-110 transition-transform" />
                        ) : (
                          <Clock className="h-4 w-4 text-amber-400 hover:scale-110 transition-transform" />
                        )}
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white tracking-tight">{q.title}</span>
                          <span
                            className={`rounded px-1.5 py-0.2 font-mono text-[9px] uppercase font-semibold ${
                              q.difficulty === 'Hard'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : q.difficulty === 'Medium'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {q.difficulty}
                          </span>
                          <span className="rounded bg-white/10 px-1.5 py-0.2 font-mono text-[9px] text-neutral-400">
                            {q.platform}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 font-mono text-[11px] text-neutral-400 mt-1">
                          <span>Pattern: {q.pattern}</span>
                          {q.timeComplexity && <span>Time: {q.timeComplexity}</span>}
                          {q.spaceComplexity && <span>Space: {q.spaceComplexity}</span>}
                          {q.solvedDate && <span>Last: {q.solvedDate}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          soundEngine.playClick();
                          toggleDsaFavorite(q.id);
                        }}
                        className={`p-1.5 rounded-lg transition-colors ${
                          q.isFavorite
                            ? 'text-amber-400 bg-amber-400/10'
                            : 'text-neutral-500 hover:text-white hover:bg-white/5'
                        }`}
                        title="Favorite"
                      >
                        <Star className={`h-4 w-4 ${q.isFavorite ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={() => {
                          soundEngine.playClick();
                          if (isEditing) {
                            setEditingMistakeId(null);
                          } else {
                            setEditingMistakeId(q.id);
                            setMistakeDraft(q.mistakeTakeaways || '');
                          }
                        }}
                        className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-mono transition-colors ${
                          q.mistakeTakeaways
                            ? 'border-white/20 bg-white/10 text-white'
                            : 'border-white/10 bg-white/5 text-neutral-400 hover:text-white'
                        }`}
                      >
                        <BookMarked className="h-3 w-3" />
                        <span>Takeaways</span>
                      </button>
                    </div>
                  </div>

                  {/* Mistake Notebook & Architectural Takeaway Drawer */}
                  {(q.mistakeTakeaways || isEditing) && (
                    <div className="mt-3.5 pt-3 border-t border-white/10 text-xs">
                      {isEditing ? (
                        <div className="flex flex-col gap-2">
                          <textarea
                            value={mistakeDraft}
                            onChange={(e) => setMistakeDraft(e.target.value)}
                            placeholder="Note the cognitive trap, corner case, or optimal invariant here..."
                            rows={3}
                            className="w-full rounded-xl border border-white/20 bg-neutral-950 p-3 text-xs font-mono text-neutral-200 outline-none focus:border-white/40"
                          />
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingMistakeId(null)}
                              className="rounded px-2.5 py-1 text-xs font-mono text-neutral-400 hover:text-white"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveMistake(q.id)}
                              className="rounded-lg bg-white px-3 py-1 text-xs font-medium font-mono text-black hover:bg-neutral-200"
                            >
                              Save Takeaway
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-white/5 bg-neutral-950/40 p-3 flex items-start gap-2.5 text-neutral-300 font-mono text-[11px] leading-relaxed">
                          <AlertCircle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <div>{q.mistakeTakeaways}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* 5. Skill Matrix & Learning Hub Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map((skill) => (
            <div
              key={skill.id}
              className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-4.5 hover:border-white/20 hover:bg-white/[0.04] transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-neutral-300">
                    {skill.category}
                  </span>
                  <span className="font-mono text-xs font-semibold text-white capitalize">{skill.level}</span>
                </div>

                <h3 className="text-sm font-semibold tracking-tight text-white mb-2">{skill.name}</h3>

                {/* Estimated Mastery Progress */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 mb-1">
                    <span>Estimated Mastery</span>
                    <span className="text-white font-medium">{skill.estimatedMastery}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-300"
                      style={{ width: `${skill.estimatedMastery}%` }}
                    />
                  </div>
                </div>

                {/* Topics Completed Tags */}
                <div className="text-[10px] font-mono uppercase text-neutral-400 mb-1.5">Mastered Topics</div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {skill.topicsCompleted.slice(0, 4).map((top, i) => (
                    <span
                      key={i}
                      className="rounded bg-white/5 px-2 py-0.5 font-mono text-[10px] text-neutral-300"
                    >
                      {top}
                    </span>
                  ))}
                  {skill.topicsCompleted.length > 4 && (
                    <span className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-neutral-400">
                      +{skill.topicsCompleted.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              {/* Connected Projects */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-neutral-400">
                <span>{skill.practiceCount} Reps</span>
                <div className="flex items-center gap-1">
                  {skill.projectIds.map((pid) => {
                    const proj = projects.find((p) => p.id === pid);
                    return (
                      <button
                        key={pid}
                        onClick={() => {
                          soundEngine.playClick();
                          setActiveTab('projects');
                        }}
                        className="text-neutral-300 hover:text-white hover:underline truncate max-w-[90px]"
                      >
                        {proj?.name || pid}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
