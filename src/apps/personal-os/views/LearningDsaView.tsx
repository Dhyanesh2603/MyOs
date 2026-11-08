import React, { useState, useMemo } from 'react';
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
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Search,
  TrendingUp,
  Bookmark,
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
    <div className="flex flex-col gap-6 p-6 font-sans bg-[#060913] text-white min-h-full">
      {/* ─── Top Control Header with Section Switcher ─────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-indigo-900/60 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 text-black shadow-[0_0_25px_rgba(16,185,129,0.4)]">
            <Code2 className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-white">
                DSA Workspace & Engineering Matrix
              </h1>
              <span className="rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2.5 py-0.5 font-mono text-[10px] font-bold text-emerald-300 uppercase tracking-widest">
                Tier-1 Radar
              </span>
            </div>
            <p className="text-xs font-medium text-cyan-200/80 mt-0.5">
              High-contrast algorithmic repertoire, pattern mastery radar, and interview spaced-repetition.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Section Switcher Tabs */}
          <div className="flex items-center gap-1.5 rounded-2xl border-2 border-indigo-700/60 bg-[#0d1428] p-1.5 shadow-xl">
            <button
              onClick={() => {
                soundEngine.playClick();
                setActiveSection('dsa');
              }}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeSection === 'dsa'
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)] font-black'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Code2 className="h-4 w-4" />
              <span>DSA Solved ({dsaQuestions.length})</span>
            </button>
            <button
              onClick={() => {
                soundEngine.playClick();
                setActiveSection('skills');
              }}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeSection === 'skills'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.5)] font-black'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>Skills Matrix ({skills.length})</span>
            </button>
          </div>

          {/* Quick Action Button */}
          {activeSection === 'dsa' ? (
            <button
              onClick={openAddQuestionModal}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 px-5 py-2.5 text-xs font-black text-black shadow-[0_0_25px_rgba(52,211,153,0.5)] hover:scale-105 active:scale-95 transition-all"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span>+ Add Problem</span>
            </button>
          ) : (
            <button
              onClick={openAddSkillModal}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 px-5 py-2.5 text-xs font-black text-white shadow-[0_0_25px_rgba(168,85,247,0.5)] hover:scale-105 active:scale-95 transition-all"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span>+ Add Skill</span>
            </button>
          )}
        </div>
      </div>

      {activeSection === 'dsa' ? (
        <>
          {/* ─── 1. Asymmetrical Bento Hero Telemetry ─────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Col 1 (5 cols): Tactical Repertoire & Velocity */}
            <div className="lg:col-span-5 relative overflow-hidden rounded-3xl border-2 border-emerald-500/60 bg-gradient-to-br from-[#061e18] via-[#091820] to-[#050e18] p-6 shadow-[0_0_40px_rgba(16,185,129,0.22)] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black uppercase tracking-widest text-emerald-300">
                    Mastery Repertoire
                  </span>
                </div>
                <span className="rounded-xl bg-emerald-500/20 border border-emerald-400/50 px-2.5 py-1 font-mono text-[11px] font-black text-emerald-300">
                  {interviewReadiness}% Complete
                </span>
              </div>

              <div className="my-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-black font-mono text-white tracking-tight drop-shadow-md">
                    {totalSolved}
                  </span>
                  <span className="text-2xl font-bold font-mono text-emerald-400">
                    / {dsaQuestions.length} Problems
                  </span>
                </div>
                <p className="text-xs font-medium text-emerald-200/90 mt-1">
                  Verified solutions logged with time/space complexities & mistake notes.
                </p>

                {/* High-Contrast Dual-Tone Meter */}
                <div className="mt-4 flex h-3 w-full rounded-full bg-black/60 p-0.5 border border-emerald-500/40 overflow-hidden">
                  <div
                    style={{ width: `${interviewReadiness}%` }}
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 shadow-[0_0_15px_#34d399] transition-all duration-500"
                  />
                </div>
              </div>

              {/* Saturated Difficulty Breakdown Pills */}
              <div className="flex items-center gap-2 pt-3 border-t border-emerald-900/60 font-mono text-xs">
                <div className="flex items-center gap-1.5 rounded-xl bg-emerald-400 px-3 py-1 font-black text-black shadow-sm">
                  <span>{easyCount}</span>
                  <span className="text-[10px] uppercase font-bold">Easy</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-xl bg-amber-400 px-3 py-1 font-black text-black shadow-sm">
                  <span>{mediumCount}</span>
                  <span className="text-[10px] uppercase font-bold">Med</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-xl bg-rose-500 px-3 py-1 font-black text-white shadow-sm">
                  <span>{hardCount}</span>
                  <span className="text-[10px] uppercase font-bold">Hard</span>
                </div>
              </div>
            </div>

            {/* Col 2 (4 cols): Interview Readiness & Skill Radar */}
            <div className="lg:col-span-4 relative overflow-hidden rounded-3xl border-2 border-cyan-400/60 bg-gradient-to-br from-[#0c1633] via-[#09152b] to-[#070e1e] p-6 shadow-[0_0_40px_rgba(6,182,212,0.2)] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-cyan-300" />
                  <span className="font-mono text-xs font-black uppercase tracking-widest text-cyan-300">
                    Interview Radar
                  </span>
                </div>
                <span className="rounded-xl bg-cyan-400/20 border border-cyan-300/40 px-2 py-0.5 font-mono text-[10px] font-bold text-cyan-200">
                  Faang Ready
                </span>
              </div>

              <div className="my-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black font-mono text-cyan-300 drop-shadow-md">
                    {interviewReadiness}%
                  </span>
                  <span className="text-xs font-bold font-mono text-slate-300">Readiness Score</span>
                </div>

                <div className="mt-2.5">
                  <span
                    className={`inline-block rounded-xl px-3 py-1 text-xs font-black uppercase tracking-wider ${
                      interviewReadiness >= 75
                        ? 'bg-emerald-400 text-black shadow-[0_0_15px_#34d399]'
                        : interviewReadiness >= 50
                        ? 'bg-cyan-400 text-black shadow-[0_0_15px_#22d3ee]'
                        : 'bg-amber-400 text-black shadow-[0_0_15px_#f59e0b]'
                    }`}
                  >
                    {interviewReadiness >= 75
                      ? '★ Tier-1 Ready (Meta / Google / Amazon)'
                      : interviewReadiness >= 50
                      ? '▲ Strong Foundation • Expanding Patterns'
                      : '◆ Foundation Phase • Keep Solving'}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-cyan-900/60 flex items-center justify-between font-mono text-xs text-cyan-200/90">
                <span>Top Pattern: Sliding Window</span>
                <span className="text-white font-bold">{dsaQuestions.filter((q) => q.pattern === 'Sliding Window' && q.status === 'solved').length} Solved</span>
              </div>
            </div>

            {/* Col 3 (3 cols): Revision Queue & Mistake Notebook */}
            <div className="lg:col-span-3 relative overflow-hidden rounded-3xl border-2 border-amber-400 bg-gradient-to-br from-[#241304] via-[#1a0e04] to-[#120802] p-6 shadow-[0_0_40px_rgba(245,158,11,0.25)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-amber-400 fill-amber-400" />
                    <span className="font-mono text-xs font-black uppercase tracking-widest text-amber-300">
                      Revision Vault
                    </span>
                  </div>
                  <span className="rounded-full bg-amber-500/30 border border-amber-400 px-2 py-0.5 font-mono text-[10px] font-black text-amber-200">
                    Spaced Rep
                  </span>
                </div>

                <div className="mt-3">
                  <div className="text-4xl font-black font-mono text-amber-300 drop-shadow">
                    {reviewNeeded}
                  </div>
                  <p className="text-xs font-bold text-amber-100/90 mt-0.5">
                    Problems flagged for second repetition
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-amber-900/60">
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setSelectedDifficulty('all');
                    setSelectedPattern('all');
                    setSearchQuery('');
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 py-2 text-xs font-black text-black shadow-[0_0_20px_rgba(245,158,11,0.5)] hover:scale-102 active:scale-98 transition-all"
                >
                  <Clock className="h-3.5 w-3.5 stroke-[3]" />
                  <span>Review Spaced Reps</span>
                </button>
              </div>
            </div>
          </div>

          {/* ─── 2. Asymmetrical Split Workspace: Problem Deck (7) vs Tactical Sidebar (5) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* ─── Left Side (7 cols): Main Problem Deck ───────────────────────── */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              {/* High-Contrast Search & Difficulty Selector */}
              <div className="flex flex-col gap-3 rounded-3xl border-2 border-indigo-800/70 bg-[#0d1428] p-4.5 shadow-xl">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  {/* Search Input with Neon Focus Ring */}
                  <div className="relative flex w-full sm:flex-1 items-center rounded-2xl border-2 border-indigo-700/80 bg-[#070b16] px-3.5 py-2 shadow-inner focus-within:border-cyan-400 focus-within:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all">
                    <Search className="h-4 w-4 text-cyan-400 shrink-0 mr-2.5" />
                    <input
                      type="text"
                      placeholder="Search questions, patterns, complexities, takeaways..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent font-sans text-xs font-semibold text-white placeholder-slate-400 outline-none"
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-white">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Saturated Solid Difficulty Filter Pills */}
                  <div className="flex items-center gap-1.5 self-start sm:self-auto font-mono text-xs">
                    {(['all', 'Easy', 'Medium', 'Hard'] as const).map((diff) => {
                      const isSel = selectedDifficulty === diff;
                      return (
                        <button
                          key={diff}
                          onClick={() => {
                            soundEngine.playClick();
                            setSelectedDifficulty(diff);
                          }}
                          className={`rounded-xl px-3 py-1.5 font-black transition-all ${
                            isSel
                              ? diff === 'Easy'
                                ? 'bg-emerald-400 text-black shadow-[0_0_12px_#34d399]'
                                : diff === 'Medium'
                                ? 'bg-amber-400 text-black shadow-[0_0_12px_#f59e0b]'
                                : diff === 'Hard'
                                ? 'bg-rose-500 text-white shadow-[0_0_12px_#f43f5e]'
                                : 'bg-white text-black shadow-[0_0_12px_#ffffff]'
                              : 'border border-indigo-800/60 bg-[#0a0f1e] text-slate-300 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {diff}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Pattern Selector Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {(['all', ...PATTERNS_LIST] as const).map((pat) => {
                    const isSel = selectedPattern === pat;
                    return (
                      <button
                        key={pat}
                        onClick={() => {
                          soundEngine.playClick();
                          setSelectedPattern(pat);
                        }}
                        className={`rounded-xl px-3 py-1 font-mono text-xs font-bold whitespace-nowrap transition-all ${
                          isSel
                            ? 'bg-gradient-to-r from-cyan-400 to-indigo-500 text-black font-black shadow-[0_0_15px_rgba(6,182,212,0.4)] border border-cyan-300'
                            : 'border border-indigo-900/60 bg-[#090e1c] text-slate-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {pat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Questions List */}
              <div className="flex flex-col gap-3.5">
                {filteredQuestions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 rounded-3xl border-2 border-dashed border-indigo-800/80 bg-[#0c1224] text-center">
                    <Code2 className="h-10 w-10 text-cyan-400 mb-3" />
                    <h3 className="text-base font-bold text-white">No DSA Questions Match Filters</h3>
                    <p className="text-xs font-medium text-slate-300 mt-1 max-w-sm">
                      Try clearing search parameters or log a new algorithmic challenge directly into your repertoire.
                    </p>
                    <button
                      onClick={openAddQuestionModal}
                      className="mt-4 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-5 py-2 text-xs font-black text-black shadow-lg hover:scale-105 transition-all"
                    >
                      <Plus className="h-4 w-4 stroke-[3]" />
                      <span>Add Problem</span>
                    </button>
                  </div>
                ) : (
                  filteredQuestions.map((q) => {
                    const isEditingTakeaway = editingMistakeId === q.id;

                    return (
                      <div
                        key={q.id}
                        className="flex flex-col rounded-3xl border-2 border-indigo-900/80 bg-gradient-to-br from-[#0c1328] to-[#070b16] p-5 hover:border-cyan-400/80 hover:shadow-[0_0_25px_rgba(6,182,212,0.18)] transition-all group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3.5 min-w-0">
                            {/* Status Checkbox Button */}
                            <button
                              onClick={() => {
                                soundEngine.playClick();
                                toggleDsaStatus(q.id);
                              }}
                              className="mt-1 shrink-0"
                              title={q.status === 'solved' ? 'Click to mark Review Needed' : 'Click to mark Solved'}
                            >
                              {q.status === 'solved' ? (
                                <div className="h-6 w-6 rounded-xl bg-emerald-400 text-black flex items-center justify-center shadow-[0_0_12px_#34d399] hover:scale-110 transition-transform">
                                  <CheckCircle2 className="h-4 w-4 stroke-[3]" />
                                </div>
                              ) : (
                                <div className="h-6 w-6 rounded-xl bg-amber-400 text-black flex items-center justify-center shadow-[0_0_12px_#f59e0b] hover:scale-110 transition-transform">
                                  <Clock className="h-4 w-4 stroke-[3]" />
                                </div>
                              )}
                            </button>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors tracking-tight">
                                  {q.title}
                                </span>

                                {/* Difficulty Solid Pill */}
                                <span
                                  className={`rounded-lg px-2 py-0.5 font-mono text-[10px] font-black uppercase ${
                                    q.difficulty === 'Hard'
                                      ? 'bg-rose-500 text-white shadow-[0_0_8px_#f43f5e]'
                                      : q.difficulty === 'Medium'
                                      ? 'bg-amber-400 text-black shadow-[0_0_8px_#f59e0b]'
                                      : 'bg-emerald-400 text-black shadow-[0_0_8px_#34d399]'
                                  }`}
                                >
                                  {q.difficulty}
                                </span>

                                <span className="rounded-lg bg-indigo-900/60 border border-indigo-700/60 px-2 py-0.5 font-mono text-[10px] font-bold text-indigo-200">
                                  {q.platform}
                                </span>

                                {q.status === 'review_needed' && (
                                  <span className="rounded-lg bg-amber-500/20 border border-amber-400 px-2 py-0.5 font-mono text-[10px] font-black text-amber-300">
                                    ★ Review Flagged
                                  </span>
                                )}
                              </div>

                              {/* Pattern & Complexities */}
                              <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-slate-300 mt-2">
                                <span className="rounded-lg bg-cyan-950/80 border border-cyan-800/80 px-2 py-0.5 text-cyan-300 font-bold">
                                  Pattern: {q.pattern}
                                </span>
                                {q.timeComplexity && (
                                  <span className="rounded-lg bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 text-emerald-300 font-bold">
                                    Time: {q.timeComplexity}
                                  </span>
                                )}
                                {q.spaceComplexity && (
                                  <span className="rounded-lg bg-indigo-950/80 border border-indigo-800/80 px-2 py-0.5 text-indigo-300 font-bold">
                                    Space: {q.spaceComplexity}
                                  </span>
                                )}
                                {q.solvedDate && (
                                  <span className="text-slate-400 text-[11px]">
                                    Solved: {q.solvedDate}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Quick Card Controls */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Favorite */}
                            <button
                              onClick={() => {
                                soundEngine.playClick();
                                toggleDsaFavorite(q.id);
                              }}
                              className={`p-2 rounded-xl transition-all ${
                                q.isFavorite
                                  ? 'text-amber-300 bg-amber-400/20 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                                  : 'text-slate-400 hover:text-white hover:bg-white/10'
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
                              className={`flex items-center gap-1.5 rounded-xl border-2 px-3 py-1.5 text-xs font-mono font-bold transition-all ${
                                q.mistakeTakeaways
                                  ? 'border-amber-400/70 bg-amber-400/20 text-amber-200'
                                  : 'border-indigo-800 bg-indigo-950/60 text-slate-300 hover:text-white hover:border-cyan-400'
                              }`}
                            >
                              <BookMarked className="h-3.5 w-3.5" />
                              <span>Takeaway</span>
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => openEditQuestionModal(q)}
                              className="p-2 rounded-xl text-slate-300 hover:bg-cyan-500/20 hover:text-cyan-300 transition-colors"
                              title="Edit Problem"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="p-2 rounded-xl text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
                              title="Delete Problem"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Inline Takeaways Display or Editor */}
                        {isEditingTakeaway ? (
                          <div className="mt-4 rounded-2xl border-2 border-amber-400 bg-[#1c1205] p-3.5 flex flex-col gap-2.5">
                            <div className="flex items-center justify-between text-xs font-mono text-amber-300 font-bold">
                              <span>Edit Algorithmic Takeaway & Gotchas:</span>
                              <button onClick={() => setEditingMistakeId(null)} className="text-amber-400 hover:text-white">
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <textarea
                              rows={3}
                              value={mistakeDraft}
                              onChange={(e) => setMistakeDraft(e.target.value)}
                              placeholder="Key insight, edge cases to watch out for, runtime gotcha..."
                              className="w-full rounded-xl border border-amber-500/40 bg-black/60 p-2.5 font-mono text-xs text-white placeholder-amber-200/40 outline-none focus:border-amber-400"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setEditingMistakeId(null)}
                                className="rounded-xl px-3 py-1 text-xs font-mono text-slate-300 hover:text-white"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSaveMistake(q.id)}
                                className="flex items-center gap-1.5 rounded-xl bg-amber-400 px-4 py-1.5 text-xs font-mono font-black text-black shadow-[0_0_15px_#f59e0b]"
                              >
                                <Save className="h-3.5 w-3.5" />
                                <span>Save Note</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          q.mistakeTakeaways && (
                            <div className="mt-3.5 rounded-2xl border-l-4 border-amber-400 border-t border-r border-b border-amber-500/30 bg-gradient-to-r from-amber-500/15 to-transparent p-3 font-mono text-xs text-amber-100 flex items-start gap-2.5">
                              <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <span className="font-bold text-amber-300 uppercase tracking-wider text-[10px] block mb-0.5">
                                  Takeaway & Insight:
                                </span>
                                <p className="leading-relaxed">{q.mistakeTakeaways}</p>
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

            {/* ─── Right Side (5 cols): Tactical Sidebar & Pattern Matrix ───────── */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              {/* Pattern Mastery Breakdown */}
              <div className="rounded-3xl border-2 border-indigo-800/80 bg-gradient-to-br from-[#0c142a] to-[#070b16] p-5 shadow-xl">
                <div className="flex items-center justify-between border-b-2 border-indigo-900/60 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-cyan-400" />
                    <h3 className="font-mono text-xs font-black uppercase tracking-wider text-white">
                      Algorithmic Pattern Mastery
                    </h3>
                  </div>
                  <span className="font-mono text-[10px] font-bold text-cyan-300">
                    {PATTERNS_LIST.length} Core Patterns
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
                      className="group cursor-pointer rounded-2xl border border-indigo-900/60 bg-[#080d1c] p-2.5 hover:border-cyan-400 transition-all"
                    >
                      <div className="flex items-center justify-between text-xs font-mono font-bold mb-1.5">
                        <span className="text-white group-hover:text-cyan-300 transition-colors">
                          {stat.pattern}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-cyan-300">{stat.solved} / {stat.total}</span>
                          <span className="rounded-lg bg-indigo-900/60 px-1.5 py-0.2 text-[10px] text-slate-300">
                            {stat.percent}%
                          </span>
                        </div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-black/60 overflow-hidden">
                        <div
                          style={{ width: `${stat.percent}%` }}
                          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-300"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mistake Vault Notebook */}
              <div className="rounded-3xl border-2 border-amber-400/80 bg-gradient-to-br from-[#1c1205] to-[#0e0902] p-5 shadow-[0_0_30px_rgba(245,158,11,0.15)]">
                <div className="flex items-center justify-between border-b-2 border-amber-900/60 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Bookmark className="h-4 w-4 text-amber-400 fill-amber-400" />
                    <h3 className="font-mono text-xs font-black uppercase tracking-wider text-amber-200">
                      Takeaway Notebook & Gotchas
                    </h3>
                  </div>
                  <span className="font-mono text-[10px] font-bold text-amber-300">
                    {mistakeQuestions.length} Active Notes
                  </span>
                </div>

                {mistakeQuestions.length === 0 ? (
                  <p className="text-xs font-mono text-amber-200/60 text-center py-6">
                    No mistake takeaways logged yet. Add insights to questions to populate your notebook.
                  </p>
                ) : (
                  <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                    {mistakeQuestions.slice(0, 5).map((q) => (
                      <div
                        key={q.id}
                        className="rounded-2xl border border-amber-500/40 bg-black/50 p-3 font-mono text-xs text-amber-100 flex flex-col gap-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white truncate max-w-[180px]">{q.title}</span>
                          <span className="rounded bg-amber-400/20 text-amber-300 px-1.5 py-0.2 text-[9px] font-bold">
                            {q.pattern}
                          </span>
                        </div>
                        <p className="text-[11px] text-amber-200/80 leading-snug">
                          {q.mistakeTakeaways || 'Flagged for revision without takeaway note.'}
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
        /* ─── 3. Skills Matrix Tab (High-Contrast Redesign) ─────────────────── */
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-white">Technical Skill Inventory</h2>
              <p className="text-xs text-cyan-200 font-medium mt-0.5">
                Core competencies, practice repetitions, and architectural proficiencies.
              </p>
            </div>
            <button
              onClick={openAddSkillModal}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 px-5 py-2 text-xs font-black text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:scale-105 transition-all"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span>+ Add Skill</span>
            </button>
          </div>

          {skills.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-14 rounded-3xl border-2 border-dashed border-indigo-800/80 bg-[#0c1224] text-center my-6">
              <Brain className="h-12 w-12 text-purple-400 mb-3" />
              <h3 className="text-base font-bold text-white">No Skills Cataloged Yet</h3>
              <p className="text-xs font-medium text-slate-300 mt-1 max-w-sm">
                Catalog your technical proficiencies, track your mastery percentages, and connect them directly to production projects.
              </p>
              <button
                onClick={openAddSkillModal}
                className="mt-4 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 px-5 py-2 text-xs font-black text-white shadow-lg"
              >
                <Plus className="h-4 w-4 stroke-[3]" />
                <span>Add First Skill</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {skills.map((skill) => (
                <div
                  key={skill.id}
                  className="flex flex-col justify-between rounded-3xl border-2 border-indigo-800/80 bg-gradient-to-br from-[#0d1428] to-[#070b16] p-5 hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] transition-all group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="rounded-xl bg-cyan-400/20 border border-cyan-400/50 px-2.5 py-0.5 font-mono text-[10px] font-black uppercase tracking-wider text-cyan-300">
                        {skill.category}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-black text-white uppercase tracking-wider">
                          {skill.level}
                        </span>
                        <button
                          onClick={() => openEditSkillModal(skill)}
                          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                          title="Edit Skill"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteSkill(skill.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 transition-colors"
                          title="Delete Skill"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-white mb-2">{skill.name}</h3>

                    {/* Estimated Mastery Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300 mb-1">
                        <span>Mastery</span>
                        <span className="text-cyan-300">{skill.estimatedMastery}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-black/60 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full transition-all duration-300"
                          style={{ width: `${skill.estimatedMastery}%` }}
                        />
                      </div>
                    </div>

                    {/* Mastered Topics Tags */}
                    <div className="font-mono text-[10px] font-bold uppercase text-slate-400 mb-2">
                      Mastered Topics
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {skill.topicsCompleted.length === 0 ? (
                        <span className="text-xs text-slate-500 italic">No topics logged yet</span>
                      ) : (
                        skill.topicsCompleted.map((top, i) => (
                          <span
                            key={i}
                            className="rounded-lg bg-indigo-950/80 border border-indigo-700/80 px-2 py-0.5 font-mono text-[10px] font-bold text-indigo-200"
                          >
                            {top}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Connected Projects */}
                  <div className="pt-3 border-t border-indigo-900/60 flex items-center justify-between font-mono text-xs text-slate-300">
                    <span className="font-bold text-emerald-400">{skill.practiceCount} Reps Completed</span>
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
                            className="text-cyan-300 hover:text-white hover:underline truncate max-w-[90px] font-bold"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl border-2 border-cyan-400 bg-[#0d1428] shadow-[0_0_50px_rgba(6,182,212,0.3)] overflow-hidden">
            <div className="flex items-center justify-between border-b-2 border-indigo-900/80 bg-[#070b16] px-6 py-4 select-none">
              <div className="flex items-center gap-2.5">
                <Code2 className="h-5 w-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">
                  {questionModalMode === 'add' ? 'Add DSA Problem' : 'Edit DSA Problem'}
                </h3>
              </div>
              <button
                onClick={() => setIsQuestionModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="p-6 flex flex-col gap-4 text-xs font-mono">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-300">Problem Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Trapping Rain Water"
                  value={qTitle}
                  onChange={(e) => setQTitle(e.target.value)}
                  className="rounded-2xl border-2 border-indigo-800 bg-[#070a14] px-4 py-2.5 text-xs font-bold text-white placeholder-slate-500 outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-300">Difficulty</label>
                  <select
                    value={qDifficulty}
                    onChange={(e) => setQDifficulty(e.target.value as DsaDifficulty)}
                    className="rounded-2xl border-2 border-indigo-800 bg-[#070a14] px-3 py-2.5 text-xs font-bold text-white outline-none focus:border-cyan-400"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-300">Platform</label>
                  <select
                    value={qPlatform}
                    onChange={(e) => setQPlatform(e.target.value as 'LeetCode' | 'Codeforces' | 'GFG')}
                    className="rounded-2xl border-2 border-indigo-800 bg-[#070a14] px-3 py-2.5 text-xs font-bold text-white outline-none focus:border-cyan-400"
                  >
                    <option value="LeetCode">LeetCode</option>
                    <option value="Codeforces">Codeforces</option>
                    <option value="GFG">GeeksforGeeks</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-300">Algorithmic Pattern</label>
                <select
                  value={qPattern}
                  onChange={(e) => setQPattern(e.target.value as DsaPattern)}
                  className="rounded-2xl border-2 border-indigo-800 bg-[#070a14] px-3 py-2.5 text-xs font-bold text-white outline-none focus:border-cyan-400"
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
                  <label className="text-xs font-bold text-slate-300">Status</label>
                  <select
                    value={qStatus}
                    onChange={(e) => setQStatus(e.target.value as 'solved' | 'review_needed' | 'unsolved')}
                    className="rounded-2xl border-2 border-indigo-800 bg-[#070a14] px-2.5 py-2 text-xs font-bold text-white outline-none focus:border-cyan-400"
                  >
                    <option value="solved">Solved</option>
                    <option value="review_needed">Review Needed</option>
                    <option value="unsolved">Unsolved</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-300">Time</label>
                  <input
                    type="text"
                    placeholder="e.g. O(N)"
                    value={qTimeComplexity}
                    onChange={(e) => setQTimeComplexity(e.target.value)}
                    className="rounded-2xl border-2 border-indigo-800 bg-[#070a14] px-3 py-2 text-xs font-bold text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-300">Space</label>
                  <input
                    type="text"
                    placeholder="e.g. O(1)"
                    value={qSpaceComplexity}
                    onChange={(e) => setQSpaceComplexity(e.target.value)}
                    className="rounded-2xl border-2 border-indigo-800 bg-[#070a14] px-3 py-2 text-xs font-bold text-white outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-amber-300">Takeaway & Mistake Insights</label>
                <textarea
                  rows={3}
                  placeholder="Key heuristic, invariant, or gotcha to remember..."
                  value={qMistakeTakeaways}
                  onChange={(e) => setQMistakeTakeaways(e.target.value)}
                  className="rounded-2xl border-2 border-amber-500/50 bg-[#070a14] p-3 text-xs font-mono text-white placeholder-slate-500 outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-indigo-900/60">
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="rounded-2xl px-4 py-2 text-xs font-bold text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-6 py-2.5 text-xs font-black text-black shadow-lg hover:scale-105 transition-all"
                >
                  <Save className="h-4 w-4" />
                  <span>{questionModalMode === 'add' ? 'Save Problem' : 'Update Problem'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Add / Edit Skill Modal ───────────────────────────────────────────── */}
      {isSkillModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl border-2 border-purple-500 bg-[#0d1428] shadow-[0_0_50px_rgba(168,85,247,0.3)] overflow-hidden">
            <div className="flex items-center justify-between border-b-2 border-indigo-900/80 bg-[#070b16] px-6 py-4 select-none">
              <div className="flex items-center gap-2.5">
                <Brain className="h-5 w-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">
                  {skillModalMode === 'add' ? 'Add Engineering Skill' : 'Edit Skill'}
                </h3>
              </div>
              <button
                onClick={() => setIsSkillModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSkill} className="p-6 flex flex-col gap-4 text-xs font-mono">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-300">Skill Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Consensus (Raft/Paxos)"
                  value={sName}
                  onChange={(e) => setSName(e.target.value)}
                  className="rounded-2xl border-2 border-indigo-800 bg-[#070a14] px-4 py-2.5 text-xs font-bold text-white outline-none focus:border-purple-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-300">Category</label>
                  <select
                    value={sCategory}
                    onChange={(e) => setSCategory(e.target.value as SkillCategory)}
                    className="rounded-2xl border-2 border-indigo-800 bg-[#070a14] px-3 py-2.5 text-xs font-bold text-white outline-none focus:border-purple-400 capitalize"
                  >
                    {SKILL_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-300">Proficiency Level</label>
                  <select
                    value={sLevel}
                    onChange={(e) => setSLevel(e.target.value as SkillProficiency)}
                    className="rounded-2xl border-2 border-indigo-800 bg-[#070a14] px-3 py-2.5 text-xs font-bold text-white outline-none focus:border-purple-400 capitalize"
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
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span>Mastery Level</span>
                  <span className="text-purple-300">{sMastery}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sMastery}
                  onChange={(e) => setSMastery(Number(e.target.value))}
                  className="accent-purple-400 w-full"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-300">
                  Mastered Topics (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Leader Election, Log Replication, Heartbeats"
                  value={sTopics}
                  onChange={(e) => setSTopics(e.target.value)}
                  className="rounded-2xl border-2 border-indigo-800 bg-[#070a14] px-4 py-2.5 text-xs font-bold text-white outline-none focus:border-purple-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-indigo-900/60">
                <button
                  type="button"
                  onClick={() => setIsSkillModalOpen(false)}
                  className="rounded-2xl px-4 py-2 text-xs font-bold text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 px-6 py-2.5 text-xs font-black text-white shadow-lg hover:scale-105 transition-all"
                >
                  <Save className="h-4 w-4" />
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
