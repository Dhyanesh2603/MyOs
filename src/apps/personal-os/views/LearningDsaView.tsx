import React, { useState, useMemo } from 'react';
import {
  Code2,
  Brain,
  CheckCircle2,
  Circle,
  Clock,
  Star,
  Layers,
  BookMarked,
  AlertCircle,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Search,
  Bookmark,
  ArrowUpRight,
} from 'lucide-react';
import { usePersonalOsStore } from '@core/personal-os/personalOsStore';
import type {
  DsaPattern,
  DsaDifficulty,
  DsaQuestion,
  SkillItem,
  SkillCategory,
  SkillProficiency,
} from '@core/personal-os/types';
import { soundEngine } from '@core/audio/soundEngine';

const PATTERNS_LIST: DsaPattern[] = [
  'Two Pointers',
  'Sliding Window',
  'Fast & Slow Pointers',
  'Merge Intervals',
  'Monotonic Stack',
  'Trees & Binary Search Trees',
  'Graphs & BFS/DFS',
  'Dynamic Programming',
  'Backtracking',
  'Binary Search',
  'Tries & Heaps',
];

const SKILL_CATEGORIES: SkillCategory[] = [
  'frontend',
  'backend',
  'systems',
  'ai_ml',
  'dsa',
  'devops',
  'architecture',
];

const PROFICIENCY_LEVELS: SkillProficiency[] = [
  'beginner',
  'intermediate',
  'advanced',
  'mastered',
];

export const LearningDsaView: React.FC = () => {
  const {
    skills,
    dsaQuestions,
    toggleDsaStatus,
    toggleDsaFavorite,
    updateDsaMistake,
    addDsaQuestion,
    updateDsaQuestion,
    deleteDsaQuestion,
    addSkill,
    updateSkill,
    deleteSkill,
    projects,
    setActiveTab,
  } = usePersonalOsStore();

  const [activeSection, setActiveSection] = useState<'dsa' | 'skills'>('dsa');
  const [selectedPattern, setSelectedPattern] = useState<DsaPattern | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DsaDifficulty | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingMistakeId, setEditingMistakeId] = useState<string | null>(null);
  const [mistakeDraft, setMistakeDraft] = useState('');

  // Question Modal State (Add or Edit)
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [questionModalMode, setQuestionModalMode] = useState<'add' | 'edit'>('add');
  const [targetQuestionId, setTargetQuestionId] = useState<string | null>(null);
  const [qTitle, setQTitle] = useState('');
  const [qDifficulty, setQDifficulty] = useState<DsaDifficulty>('Medium');
  const [qPattern, setQPattern] = useState<DsaPattern>('Sliding Window');
  const [qPlatform, setQPlatform] = useState<'LeetCode' | 'Codeforces' | 'GFG'>('LeetCode');
  const [qStatus, setQStatus] = useState<'solved' | 'review_needed' | 'unsolved'>('solved');
  const [qTimeComplexity, setQTimeComplexity] = useState('');
  const [qSpaceComplexity, setQSpaceComplexity] = useState('');
  const [qMistakeTakeaways, setQMistakeTakeaways] = useState('');

  // Skill Modal State (Add or Edit)
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [skillModalMode, setSkillModalMode] = useState<'add' | 'edit'>('add');
  const [targetSkillId, setTargetSkillId] = useState<string | null>(null);
  const [sName, setSName] = useState('');
  const [sCategory, setSCategory] = useState<SkillCategory>('systems');
  const [sLevel, setSLevel] = useState<SkillProficiency>('intermediate');
  const [sMastery, setSMastery] = useState<number>(75);
  const [sPracticeCount, setSPracticeCount] = useState<number>(0);
  const [sTopics, setSTopics] = useState('');

  // Statistics
  const totalSolved = dsaQuestions.filter((q) => q.status === 'solved').length;
  const reviewNeeded = dsaQuestions.filter((q) => q.status === 'review_needed').length;
  const easyCount = dsaQuestions.filter((q) => q.difficulty === 'Easy').length;
  const mediumCount = dsaQuestions.filter((q) => q.difficulty === 'Medium').length;
  const hardCount = dsaQuestions.filter((q) => q.difficulty === 'Hard').length;

  const interviewReadiness = useMemo(() => {
    return Math.round((totalSolved / Math.max(dsaQuestions.length, 1)) * 100);
  }, [totalSolved, dsaQuestions.length]);

  // Pattern Completion breakdown
  const patternStats = useMemo(() => {
    return PATTERNS_LIST.map((pattern) => {
      const questionsInPattern = dsaQuestions.filter((q) => q.pattern === pattern);
      const solvedInPattern = questionsInPattern.filter((q) => q.status === 'solved').length;
      return {
        pattern,
        total: questionsInPattern.length,
        solved: solvedInPattern,
        percent: questionsInPattern.length > 0 ? Math.round((solvedInPattern / questionsInPattern.length) * 100) : 0,
      };
    });
  }, [dsaQuestions]);

  // Questions filtered
  const filteredQuestions = useMemo(() => {
    return dsaQuestions.filter((q) => {
      const matchQuery =
        !searchQuery ||
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.pattern.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (q.mistakeTakeaways && q.mistakeTakeaways.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchDifficulty = selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;
      const matchPattern = selectedPattern === 'all' || q.pattern === selectedPattern;

      return matchQuery && matchDifficulty && matchPattern;
    });
  }, [dsaQuestions, searchQuery, selectedDifficulty, selectedPattern]);

  // Questions with mistake takeaways for the Mistake Vault
  const mistakeQuestions = useMemo(() => {
    return dsaQuestions.filter((q) => Boolean(q.mistakeTakeaways) || q.status === 'review_needed');
  }, [dsaQuestions]);

  // Handlers
  const handleSaveMistake = (id: string) => {
    soundEngine.playClick();
    updateDsaMistake(id, mistakeDraft);
    setEditingMistakeId(null);
  };

  const openAddQuestionModal = () => {
    soundEngine.playClick();
    setQuestionModalMode('add');
    setTargetQuestionId(null);
    setQTitle('');
    setQDifficulty('Medium');
    setQPattern('Sliding Window');
    setQPlatform('LeetCode');
    setQStatus('solved');
    setQTimeComplexity('O(N)');
    setQSpaceComplexity('O(1)');
    setQMistakeTakeaways('');
    setIsQuestionModalOpen(true);
  };

  const openEditQuestionModal = (q: DsaQuestion) => {
    soundEngine.playClick();
    setQuestionModalMode('edit');
    setTargetQuestionId(q.id);
    setQTitle(q.title);
    setQDifficulty(q.difficulty);
    setQPattern(q.pattern);
    setQPlatform(q.platform);
    setQStatus(q.status);
    setQTimeComplexity(q.timeComplexity || '');
    setQSpaceComplexity(q.spaceComplexity || '');
    setQMistakeTakeaways(q.mistakeTakeaways || '');
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qTitle.trim()) return;
    soundEngine.playClick();

    if (questionModalMode === 'add') {
      addDsaQuestion({
        title: qTitle.trim(),
        difficulty: qDifficulty,
        pattern: qPattern,
        platform: qPlatform,
        status: qStatus,
        isFavorite: false,
        timeComplexity: qTimeComplexity.trim() || undefined,
        spaceComplexity: qSpaceComplexity.trim() || undefined,
        mistakeTakeaways: qMistakeTakeaways.trim() || undefined,
        solvedDate: new Date().toISOString().slice(0, 10),
      });
    } else if (targetQuestionId) {
      updateDsaQuestion(targetQuestionId, {
        title: qTitle.trim(),
        difficulty: qDifficulty,
        pattern: qPattern,
        platform: qPlatform,
        status: qStatus,
        timeComplexity: qTimeComplexity.trim() || undefined,
        spaceComplexity: qSpaceComplexity.trim() || undefined,
        mistakeTakeaways: qMistakeTakeaways.trim() || undefined,
      });
    }

    setIsQuestionModalOpen(false);
  };

  const handleDeleteQuestion = (id: string) => {
    soundEngine.playClick();
    deleteDsaQuestion(id);
  };

  const openAddSkillModal = () => {
    soundEngine.playClick();
    setSkillModalMode('add');
    setTargetSkillId(null);
    setSName('');
    setSCategory('systems');
    setSLevel('intermediate');
    setSMastery(75);
    setSPracticeCount(0);
    setSTopics('');
    setIsSkillModalOpen(true);
  };

  const openEditSkillModal = (s: SkillItem) => {
    soundEngine.playClick();
    setSkillModalMode('edit');
    setTargetSkillId(s.id);
    setSName(s.name);
    setSCategory(s.category);
    setSLevel(s.level);
    setSMastery(s.estimatedMastery);
    setSPracticeCount(s.practiceCount);
    setSTopics(s.topicsCompleted.join(', '));
    setIsSkillModalOpen(true);
  };

  const handleSaveSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sName.trim()) return;
    soundEngine.playClick();

    const topicsArray = sTopics
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (skillModalMode === 'add') {
      addSkill({
        name: sName.trim(),
        category: sCategory,
        level: sLevel,
        estimatedMastery: sMastery,
        practiceCount: sPracticeCount,
        topicsCompleted: topicsArray,
        topicsRemaining: [],
        resources: [],
        projectIds: [],
      });
    } else if (targetSkillId) {
      updateSkill(targetSkillId, {
        name: sName.trim(),
        category: sCategory,
        level: sLevel,
        estimatedMastery: sMastery,
        practiceCount: sPracticeCount,
        topicsCompleted: topicsArray,
      });
    }

    setIsSkillModalOpen(false);
  };

  const handleDeleteSkill = (id: string) => {
    soundEngine.playClick();
    deleteSkill(id);
  };

  return (
    <div className="flex flex-col gap-8 p-8 font-sans bg-[#0a0b10] text-neutral-100 min-h-full">
      {/* ─── Top Editorial Masthead & Navigation ─────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase font-semibold text-neutral-400">
              Technical Repertoire
            </span>
            <span className="h-1 w-1 rounded-full bg-neutral-600" />
            <span className="font-mono text-[10px] tracking-wider text-emerald-400 font-medium">
              System Active
            </span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight text-white">
            Algorithmic Studio
          </h1>
          <p className="text-sm text-neutral-400 mt-1 max-w-xl font-normal leading-relaxed">
            Curated patterns, complexity proofs, and deliberate spaced repetition for top-tier engineering interviews.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Section Segmented Control */}
          <div className="flex items-center gap-1 rounded-xl bg-white/[0.04] border border-white/[0.08] p-1">
            <button
              onClick={() => {
                soundEngine.playClick();
                setActiveSection('dsa');
              }}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-all ${
                activeSection === 'dsa'
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              <span>Problems ({dsaQuestions.length})</span>
            </button>
            <button
              onClick={() => {
                soundEngine.playClick();
                setActiveSection('skills');
              }}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-all ${
                activeSection === 'skills'
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Competencies ({skills.length})</span>
            </button>
          </div>

          {/* Stark Action Button */}
          {activeSection === 'dsa' ? (
            <button
              onClick={openAddQuestionModal}
              className="flex items-center gap-2 rounded-xl bg-white text-black hover:bg-neutral-200 px-4 py-2 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Add Problem</span>
            </button>
          ) : (
            <button
              onClick={openAddSkillModal}
              className="flex items-center gap-2 rounded-xl bg-white text-black hover:bg-neutral-200 px-4 py-2 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Add Skill</span>
            </button>
          )}
        </div>
      </div>

      {activeSection === 'dsa' ? (
        <>
          {/* ─── 1. Asymmetrical Telemetry (8 cols vs 4 cols) ───────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Col 1 (8 cols): Primary Mastery Ledger */}
            <div className="lg:col-span-8 rounded-2xl border border-white/[0.08] bg-[#10121a] p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                  <span className="font-mono text-xs font-medium uppercase tracking-wider text-neutral-400">
                    Mastery Ledger & Velocity
                  </span>
                  <span className="rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-[11px] font-medium text-neutral-300">
                    {interviewReadiness}% Complete
                  </span>
                </div>

                <div className="my-6">
                  <div className="flex items-baseline gap-3">
                    <span className="text-5xl lg:text-6xl font-light font-mono text-white tracking-tight">
                      {totalSolved}
                    </span>
                    <span className="text-xl font-mono text-neutral-500">
                      / {dsaQuestions.length} Problems Solved
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1.5 font-normal">
                    Verified implementations logged with time/space invariants and takeaway notes.
                  </p>

                  {/* Refined Hairline Progress Bar */}
                  <div className="mt-5 h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      style={{ width: `${interviewReadiness}%` }}
                      className="h-full rounded-full bg-white transition-all duration-500"
                    />
                  </div>
                </div>
              </div>

              {/* Saturated Solid Difficulty Chips without Glow */}
              <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06] font-mono text-xs">
                <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-emerald-400 font-medium">
                  <span className="font-bold">{easyCount}</span>
                  <span className="text-[10px] uppercase">Easy</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 text-amber-400 font-medium">
                  <span className="font-bold">{mediumCount}</span>
                  <span className="text-[10px] uppercase">Medium</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 text-rose-400 font-medium">
                  <span className="font-bold">{hardCount}</span>
                  <span className="text-[10px] uppercase">Hard</span>
                </div>
                <div className="ml-auto text-xs text-neutral-500">
                  Target: 100 Core Problems
                </div>
              </div>
            </div>

            {/* Col 2 (4 cols): Spaced Repetition & Revision Vault */}
            <div className="lg:col-span-4 rounded-2xl border border-amber-500/20 bg-[#141210] p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-amber-500/15">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-400" />
                    <span className="font-mono text-xs font-semibold uppercase tracking-wider text-amber-300">
                      Revision Queue
                    </span>
                  </div>
                  <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-amber-300">
                    Spaced Rep
                  </span>
                </div>

                <div className="my-5">
                  <div className="text-4xl lg:text-5xl font-light font-mono text-amber-200 tracking-tight">
                    {reviewNeeded}
                  </div>
                  <p className="text-xs text-amber-200/80 mt-1 font-normal leading-relaxed">
                    Problems flagged for second recall to solidify intuition and algorithmic invariants.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-amber-500/15">
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setSelectedDifficulty('all');
                    setSelectedPattern('all');
                    setSearchQuery('');
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 py-2.5 text-xs font-semibold text-neutral-950 transition-colors cursor-pointer"
                >
                  <span>Review Flagged Queue</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* ─── 2. Asymmetrical Split Workspace: Problem Ledger (7) vs Pattern Radar (5) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ─── Left Side (7 cols): Main Problem Ledger ─────────────────────── */}
            <div className="lg:col-span-7 flex flex-col gap-5">
              {/* Refined Search & Pattern Controls */}
              <div className="flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-[#10121a] p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  {/* Clean Search Input */}
                  <div className="relative flex w-full sm:flex-1 items-center rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 focus-within:border-white/30 transition-colors">
                    <Search className="h-4 w-4 text-neutral-400 shrink-0 mr-2.5" />
                    <input
                      type="text"
                      placeholder="Search problem title, pattern, complexity, or notes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent font-sans text-xs text-white placeholder-neutral-500 outline-none"
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="text-neutral-400 hover:text-white">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Difficulty Filter Chips */}
                  <div className="flex items-center gap-1 self-start sm:self-auto font-mono text-xs">
                    {(['all', 'Easy', 'Medium', 'Hard'] as const).map((diff) => {
                      const isSel = selectedDifficulty === diff;
                      return (
                        <button
                          key={diff}
                          onClick={() => {
                            soundEngine.playClick();
                            setSelectedDifficulty(diff);
                          }}
                          className={`rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                            isSel
                              ? 'bg-white text-black font-semibold'
                              : 'text-neutral-400 hover:text-white hover:bg-white/[0.06]'
                          }`}
                        >
                          {diff === 'all' ? 'All' : diff}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Pattern Filter Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
                  {(['all', ...PATTERNS_LIST] as const).map((pat) => {
                    const isSel = selectedPattern === pat;
                    return (
                      <button
                        key={pat}
                        onClick={() => {
                          soundEngine.playClick();
                          setSelectedPattern(pat);
                        }}
                        className={`rounded-lg px-3 py-1 font-mono text-xs whitespace-nowrap transition-colors ${
                          isSel
                            ? 'bg-white text-black font-medium'
                            : 'border border-white/[0.08] bg-white/[0.02] text-neutral-400 hover:text-white hover:bg-white/[0.05]'
                        }`}
                      >
                        {pat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Questions Ledger List */}
              <div className="flex flex-col gap-3">
                {filteredQuestions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-14 rounded-2xl border border-dashed border-white/10 bg-[#10121a] text-center">
                    <Code2 className="h-8 w-8 text-neutral-500 mb-3" />
                    <h3 className="text-sm font-semibold text-white">No Problems Match Criteria</h3>
                    <p className="text-xs text-neutral-400 mt-1 max-w-sm">
                      Try clearing filter options or add a new algorithmic challenge directly to your ledger.
                    </p>
                    <button
                      onClick={openAddQuestionModal}
                      className="mt-4 flex items-center gap-2 rounded-xl bg-white text-black px-4 py-2 text-xs font-semibold hover:bg-neutral-200 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Problem</span>
                    </button>
                  </div>
                ) : (
                  filteredQuestions.map((q) => {
                    const isEditingTakeaway = editingMistakeId === q.id;

                    return (
                      <div
                        key={q.id}
                        className="flex flex-col rounded-2xl border border-white/[0.06] bg-[#10121a] hover:border-white/20 p-5 transition-colors group"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3.5 min-w-0">
                            {/* Status Button */}
                            <button
                              onClick={() => {
                                soundEngine.playClick();
                                toggleDsaStatus(q.id);
                              }}
                              className="mt-0.5 shrink-0 text-neutral-400 hover:text-white transition-colors"
                              title={q.status === 'solved' ? 'Mark for Review' : 'Mark as Solved'}
                            >
                              {q.status === 'solved' ? (
                                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                              ) : (
                                <Circle className="h-5 w-5 text-neutral-600 hover:text-neutral-400" />
                              )}
                            </button>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-semibold text-white tracking-tight">
                                  {q.title}
                                </span>

                                {/* Difficulty Pill */}
                                <span
                                  className={`rounded px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase ${
                                    q.difficulty === 'Hard'
                                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                      : q.difficulty === 'Medium'
                                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  }`}
                                >
                                  {q.difficulty}
                                </span>

                                <span className="rounded border border-white/10 bg-white/[0.03] px-1.5 py-0.5 font-mono text-[9px] text-neutral-400">
                                  {q.platform}
                                </span>

                                {q.status === 'review_needed' && (
                                  <span className="rounded bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 font-mono text-[9px] text-amber-400">
                                    Review
                                  </span>
                                )}
                              </div>

                              {/* Pattern & Complexity Badges */}
                              <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs text-neutral-400 mt-2">
                                <span className="text-neutral-300">
                                  {q.pattern}
                                </span>
                                {q.timeComplexity && (
                                  <>
                                    <span className="text-neutral-600">•</span>
                                    <span>Time: {q.timeComplexity}</span>
                                  </>
                                )}
                                {q.spaceComplexity && (
                                  <>
                                    <span className="text-neutral-600">•</span>
                                    <span>Space: {q.spaceComplexity}</span>
                                  </>
                                )}
                                {q.solvedDate && (
                                  <>
                                    <span className="text-neutral-600">•</span>
                                    <span className="text-neutral-500">{q.solvedDate}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Quick Row Controls */}
                          <div className="flex items-center gap-1 shrink-0">
                            {/* Favorite */}
                            <button
                              onClick={() => {
                                soundEngine.playClick();
                                toggleDsaFavorite(q.id);
                              }}
                              className={`p-1.5 rounded-lg transition-colors ${
                                q.isFavorite
                                  ? 'text-amber-400 bg-amber-500/10'
                                  : 'text-neutral-500 hover:text-white hover:bg-white/[0.05]'
                              }`}
                              title="Toggle Favorite"
                            >
                              <Star className={`h-4 w-4 ${q.isFavorite ? 'fill-current' : ''}`} />
                            </button>

                            {/* Takeaways Toggle */}
                            <button
                              onClick={() => {
                                soundEngine.playClick();
                                if (isEditingTakeaway) {
                                  setEditingMistakeId(null);
                                } else {
                                  setEditingMistakeId(q.id);
                                  setMistakeDraft(q.mistakeTakeaways || '');
                                }
                              }}
                              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-mono transition-colors ${
                                q.mistakeTakeaways
                                  ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                                  : 'border-white/10 bg-white/[0.02] text-neutral-400 hover:text-white hover:border-white/20'
                              }`}
                            >
                              <BookMarked className="h-3 w-3" />
                              <span>Takeaway</span>
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => openEditQuestionModal(q)}
                              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.05] transition-colors"
                              title="Edit Problem"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              title="Delete Problem"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Inline Takeaways Editor or Display */}
                        {isEditingTakeaway ? (
                          <div className="mt-4 rounded-xl border border-amber-500/30 bg-[#17140f] p-4 flex flex-col gap-2.5">
                            <div className="flex items-center justify-between text-xs font-mono text-amber-300">
                              <span>Algorithmic Invariant & Gotcha:</span>
                              <button onClick={() => setEditingMistakeId(null)} className="text-neutral-400 hover:text-white">
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <textarea
                              rows={3}
                              value={mistakeDraft}
                              onChange={(e) => setMistakeDraft(e.target.value)}
                              placeholder="Key heuristic, invariant, edge case trap..."
                              className="w-full rounded-lg border border-amber-500/20 bg-black/50 p-2.5 font-mono text-xs text-white placeholder-amber-200/30 outline-none focus:border-amber-400"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setEditingMistakeId(null)}
                                className="rounded-lg px-3 py-1 text-xs text-neutral-400 hover:text-white"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSaveMistake(q.id)}
                                className="flex items-center gap-1.5 rounded-lg bg-amber-400 px-3 py-1 text-xs font-semibold text-neutral-950 hover:bg-amber-300 transition-colors"
                              >
                                <Save className="h-3.5 w-3.5" />
                                <span>Save Note</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          q.mistakeTakeaways && (
                            <div className="mt-3.5 rounded-xl border-l-2 border-amber-400 border-t border-r border-b border-amber-500/20 bg-amber-500/[0.04] p-3 font-mono text-xs text-amber-200 flex items-start gap-2.5">
                              <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <span className="font-semibold text-amber-300 uppercase tracking-wider text-[10px] block mb-0.5">
                                  Takeaway & Invariant:
                                </span>
                                <p className="leading-relaxed text-amber-100/90">{q.mistakeTakeaways}</p>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* ─── Right Side (5 cols): Pattern Compass & Takeaway Notebook ───── */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Pattern Mastery Breakdown */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#10121a] p-6">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3.5 mb-4">
                  <span className="font-mono text-xs font-medium uppercase tracking-wider text-neutral-400">
                    Pattern Distribution
                  </span>
                  <span className="font-mono text-[10px] text-neutral-400">
                    {PATTERNS_LIST.length} Patterns
                  </span>
                </div>

                <div className="space-y-3">
                  {patternStats.map((stat) => (
                    <div
                      key={stat.pattern}
                      onClick={() => {
                        soundEngine.playClick();
                        setSelectedPattern(stat.pattern);
                      }}
                      className="group cursor-pointer rounded-xl border border-white/[0.04] bg-white/[0.02] p-3 hover:border-white/20 transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs font-mono mb-2">
                        <span className="text-neutral-300 group-hover:text-white transition-colors">
                          {stat.pattern}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{stat.solved}/{stat.total}</span>
                          <span className="rounded bg-white/[0.05] px-1.5 py-0.5 text-[10px] text-neutral-400">
                            {stat.percent}%
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                        <div
                          style={{ width: `${stat.percent}%` }}
                          className="h-full rounded-full bg-white transition-all duration-300"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Takeaway & Mistake Notebook */}
              <div className="rounded-2xl border border-amber-500/20 bg-[#141210] p-6">
                <div className="flex items-center justify-between border-b border-amber-500/15 pb-3.5 mb-4">
                  <div className="flex items-center gap-2">
                    <Bookmark className="h-4 w-4 text-amber-400" />
                    <span className="font-mono text-xs font-semibold uppercase tracking-wider text-amber-300">
                      Gotchas & Invariants
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-amber-300/80">
                    {mistakeQuestions.length} Notes
                  </span>
                </div>

                {mistakeQuestions.length === 0 ? (
                  <p className="text-xs font-mono text-neutral-500 text-center py-6">
                    No mistake takeaways logged yet. Add insights to problems to populate your revision ledger.
                  </p>
                ) : (
                  <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                    {mistakeQuestions.slice(0, 5).map((q) => (
                      <div
                        key={q.id}
                        className="rounded-xl border border-amber-500/20 bg-black/40 p-3.5 font-mono text-xs text-amber-100 flex flex-col gap-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white truncate max-w-[180px]">{q.title}</span>
                          <span className="rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 px-1.5 py-0.5 text-[9px]">
                            {q.pattern}
                          </span>
                        </div>
                        <p className="text-[11px] text-amber-200/80 leading-relaxed">
                          {q.mistakeTakeaways || 'Flagged for revision without note.'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        /* ─── 3. Skills Matrix Tab ─────────────────────────────────────────── */
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Competencies Matrix</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Core engineering proficiencies, system repetitions, and production integrations.
              </p>
            </div>
            <button
              onClick={openAddSkillModal}
              className="flex items-center gap-2 rounded-xl bg-white text-black hover:bg-neutral-200 px-4 py-2 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Add Skill</span>
            </button>
          </div>

          {skills.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-14 rounded-2xl border border-dashed border-white/10 bg-[#10121a] text-center my-6">
              <Brain className="h-10 w-10 text-neutral-500 mb-3" />
              <h3 className="text-sm font-semibold text-white">No Skills Cataloged Yet</h3>
              <p className="text-xs text-neutral-400 mt-1 max-w-sm">
                Catalog your technical proficiencies, track mastery progress, and link them to active repositories.
              </p>
              <button
                onClick={openAddSkillModal}
                className="mt-4 flex items-center gap-2 rounded-xl bg-white text-black px-4 py-2 text-xs font-semibold hover:bg-neutral-200 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add First Skill</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {skills.map((skill) => (
                <div
                  key={skill.id}
                  className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#10121a] p-5 hover:border-white/20 transition-colors group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[9px] font-medium uppercase tracking-wider text-neutral-300">
                        {skill.category}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-medium text-neutral-400 uppercase">
                          {skill.level}
                        </span>
                        <button
                          onClick={() => openEditSkillModal(skill)}
                          className="p-1 rounded text-neutral-500 hover:text-white transition-colors"
                          title="Edit Skill"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteSkill(skill.id)}
                          className="p-1 rounded text-neutral-500 hover:text-rose-400 transition-colors"
                          title="Delete Skill"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-base font-semibold text-white mb-2">{skill.name}</h3>

                    {/* Estimated Mastery Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs font-mono text-neutral-400 mb-1.5">
                        <span>Mastery</span>
                        <span className="text-white font-medium">{skill.estimatedMastery}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                        <div
                          className="h-full bg-white rounded-full transition-all duration-300"
                          style={{ width: `${skill.estimatedMastery}%` }}
                        />
                      </div>
                    </div>

                    {/* Mastered Topics Tags */}
                    <div className="font-mono text-[9px] uppercase tracking-wider text-neutral-500 mb-2">
                      Mastered Topics
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {skill.topicsCompleted.length === 0 ? (
                        <span className="text-xs text-neutral-500 italic">No topics logged yet</span>
                      ) : (
                        skill.topicsCompleted.map((top, i) => (
                          <span
                            key={i}
                            className="rounded border border-white/10 bg-white/[0.03] px-2 py-0.5 font-mono text-[10px] text-neutral-300"
                          >
                            {top}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Connected Projects */}
                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between font-mono text-xs text-neutral-400">
                    <span className="text-emerald-400">{skill.practiceCount} Reps Completed</span>
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
      )}

      {/* ─── Add / Edit Question Modal ────────────────────────────────────────── */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border border-white/15 bg-[#12141e] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4 select-none">
              <div className="flex items-center gap-2.5">
                <Code2 className="h-4 w-4 text-white" />
                <h3 className="text-sm font-semibold text-white">
                  {questionModalMode === 'add' ? 'Log Algorithmic Challenge' : 'Edit Challenge Record'}
                </h3>
              </div>
              <button
                onClick={() => setIsQuestionModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="p-6 flex flex-col gap-4 text-xs font-mono">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-neutral-300 font-sans font-medium">Problem Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Trapping Rain Water"
                  value={qTitle}
                  onChange={(e) => setQTitle(e.target.value)}
                  className="rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs text-white placeholder-neutral-500 outline-none focus:border-white/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-neutral-300 font-sans font-medium">Difficulty</label>
                  <select
                    value={qDifficulty}
                    onChange={(e) => setQDifficulty(e.target.value as DsaDifficulty)}
                    className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white outline-none focus:border-white/30"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-neutral-300 font-sans font-medium">Platform</label>
                  <select
                    value={qPlatform}
                    onChange={(e) => setQPlatform(e.target.value as 'LeetCode' | 'Codeforces' | 'GFG')}
                    className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white outline-none focus:border-white/30"
                  >
                    <option value="LeetCode">LeetCode</option>
                    <option value="Codeforces">Codeforces</option>
                    <option value="GFG">GeeksforGeeks</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-neutral-300 font-sans font-medium">Algorithmic Pattern</label>
                <select
                  value={qPattern}
                  onChange={(e) => setQPattern(e.target.value as DsaPattern)}
                  className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white outline-none focus:border-white/30"
                >
                  {PATTERNS_LIST.map((pat) => (
                    <option key={pat} value={pat}>
                      {pat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-neutral-300 font-sans font-medium">Status</label>
                  <select
                    value={qStatus}
                    onChange={(e) => setQStatus(e.target.value as 'solved' | 'review_needed' | 'unsolved')}
                    className="rounded-xl border border-white/10 bg-black/40 px-2.5 py-2 text-xs text-white outline-none focus:border-white/30"
                  >
                    <option value="solved">Solved</option>
                    <option value="review_needed">Review</option>
                    <option value="unsolved">Unsolved</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-neutral-300 font-sans font-medium">Time</label>
                  <input
                    type="text"
                    placeholder="e.g. O(N)"
                    value={qTimeComplexity}
                    onChange={(e) => setQTimeComplexity(e.target.value)}
                    className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white outline-none focus:border-white/30"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-neutral-300 font-sans font-medium">Space</label>
                  <input
                    type="text"
                    placeholder="e.g. O(1)"
                    value={qSpaceComplexity}
                    onChange={(e) => setQSpaceComplexity(e.target.value)}
                    className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-amber-300 font-sans font-medium">Takeaways & Gotchas</label>
                <textarea
                  rows={3}
                  placeholder="Key heuristic, invariant, or edge case to remember..."
                  value={qMistakeTakeaways}
                  onChange={(e) => setQMistakeTakeaways(e.target.value)}
                  className="rounded-xl border border-amber-500/30 bg-black/40 p-3 text-xs font-mono text-white placeholder-neutral-500 outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-white text-black px-5 py-2 text-xs font-semibold hover:bg-neutral-200 transition-colors"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{questionModalMode === 'add' ? 'Save Record' : 'Update Record'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Add / Edit Skill Modal ───────────────────────────────────────────── */}
      {isSkillModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border border-white/15 bg-[#12141e] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4 select-none">
              <div className="flex items-center gap-2.5">
                <Brain className="h-4 w-4 text-white" />
                <h3 className="text-sm font-semibold text-white">
                  {skillModalMode === 'add' ? 'Catalog Engineering Skill' : 'Edit Skill Record'}
                </h3>
              </div>
              <button
                onClick={() => setIsSkillModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSkill} className="p-6 flex flex-col gap-4 text-xs font-mono">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-neutral-300 font-sans font-medium">Skill Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Consensus (Raft/Paxos)"
                  value={sName}
                  onChange={(e) => setSName(e.target.value)}
                  className="rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs text-white outline-none focus:border-white/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-neutral-300 font-sans font-medium">Category</label>
                  <select
                    value={sCategory}
                    onChange={(e) => setSCategory(e.target.value as SkillCategory)}
                    className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white outline-none focus:border-white/30 capitalize"
                  >
                    {SKILL_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-neutral-300 font-sans font-medium">Proficiency Level</label>
                  <select
                    value={sLevel}
                    onChange={(e) => setSLevel(e.target.value as SkillProficiency)}
                    className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white outline-none focus:border-white/30 capitalize"
                  >
                    {PROFICIENCY_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs text-neutral-300 font-sans font-medium">
                  <span>Mastery Level</span>
                  <span className="text-white font-mono">{sMastery}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sMastery}
                  onChange={(e) => setSMastery(Number(e.target.value))}
                  className="accent-white w-full cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-neutral-300 font-sans font-medium">
                  Mastered Topics (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Leader Election, Log Replication, Heartbeats"
                  value={sTopics}
                  onChange={(e) => setSTopics(e.target.value)}
                  className="rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs text-white outline-none focus:border-white/30"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsSkillModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-white text-black px-5 py-2 text-xs font-semibold hover:bg-neutral-200 transition-colors"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{skillModalMode === 'add' ? 'Save Skill' : 'Update Skill'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
