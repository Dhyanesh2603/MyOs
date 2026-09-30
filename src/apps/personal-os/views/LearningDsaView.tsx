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
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Search,
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
  const [sPracticeCount, setSPracticeCount] = useState<number>(10);
  const [sTopics, setSTopics] = useState('');

  // Dynamic Metrics
  const totalSolved = dsaQuestions.filter((q) => q.status === 'solved').length;
  const reviewNeeded = dsaQuestions.filter((q) => q.status === 'review_needed').length;
  const easyCount = dsaQuestions.filter((q) => q.difficulty === 'Easy').length;
  const mediumCount = dsaQuestions.filter((q) => q.difficulty === 'Medium').length;
  const hardCount = dsaQuestions.filter((q) => q.difficulty === 'Hard').length;
  const interviewReadiness = Math.min(
    100,
    Math.round((totalSolved / Math.max(dsaQuestions.length, 1)) * 100)
  );

  const filteredQuestions = dsaQuestions.filter((q) => {
    const patternMatch = selectedPattern === 'all' || q.pattern === selectedPattern;
    const diffMatch = selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;
    const queryMatch =
      !searchQuery.trim() ||
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.pattern.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.mistakeTakeaways && q.mistakeTakeaways.toLowerCase().includes(searchQuery.toLowerCase()));
    return patternMatch && diffMatch && queryMatch;
  });

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
    setQTimeComplexity('');
    setQSpaceComplexity('');
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

  // Skill Handlers
  const openAddSkillModal = () => {
    soundEngine.playClick();
    setSkillModalMode('add');
    setTargetSkillId(null);
    setSName('');
    setSCategory('systems');
    setSLevel('intermediate');
    setSMastery(0);
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
            Algorithmic patterns, problem distribution, interview readiness, and core engineering skills.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeSection === 'dsa' ? (
            <button
              onClick={openAddQuestionModal}
              className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-3.5 py-1.5 font-mono text-xs font-medium text-emerald-400 hover:bg-emerald-500/25 transition-all shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Problem</span>
            </button>
          ) : (
            <button
              onClick={openAddSkillModal}
              className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-3.5 py-1.5 font-mono text-xs font-medium text-emerald-400 hover:bg-emerald-500/25 transition-all shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Skill</span>
            </button>
          )}

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
              <span>DSA ({dsaQuestions.length})</span>
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
              <span>Skills ({skills.length})</span>
            </button>
          </div>
        </div>
      </div>

      {activeSection === 'dsa' ? (
        <>
          {/* 2. DSA Telemetry Overview Cards (Fully Dynamic) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Total Problems Solved */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4.5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span className="font-mono uppercase tracking-wider text-[11px]">Solved In Repertoire</span>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <div className="mt-2 text-2xl font-bold font-mono text-white">
                {totalSolved} / {dsaQuestions.length}
              </div>
              <div className="text-[11px] text-neutral-400 mt-1 font-mono">
                {totalSolved} mastered questions
              </div>
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
                <div
                  style={{ width: `${(easyCount / Math.max(dsaQuestions.length, 1)) * 100}%` }}
                  className="bg-emerald-400 transition-all duration-300"
                />
                <div
                  style={{ width: `${(mediumCount / Math.max(dsaQuestions.length, 1)) * 100}%` }}
                  className="bg-amber-400 transition-all duration-300"
                />
                <div
                  style={{ width: `${(hardCount / Math.max(dsaQuestions.length, 1)) * 100}%` }}
                  className="bg-rose-400 transition-all duration-300"
                />
              </div>
            </div>

            {/* Interview Readiness (Dynamic) */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4.5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span className="font-mono uppercase tracking-wider text-[11px]">Interview Readiness</span>
                <Sparkles className="h-3.5 w-3.5 text-sky-400" />
              </div>
              <div className="mt-2 text-2xl font-bold font-mono text-white">{interviewReadiness}%</div>
              <div className="text-[11px] text-emerald-400 mt-1 font-mono">
                {interviewReadiness >= 75
                  ? 'Ready for Tier-1 Product Rounds'
                  : interviewReadiness >= 50
                  ? 'Strong Foundation • Expanding'
                  : 'Practice Phase • Keep Going'}
              </div>
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

          {/* 3. Search & Filter Bar */}
          <div className="flex flex-col gap-3 pb-2 border-b border-white/5">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              {/* Search Box */}
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-1.5 w-full md:w-80 focus-within:border-white/30 transition-colors">
                <Search className="h-3.5 w-3.5 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search problem, pattern, takeaway..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent font-mono text-xs text-white placeholder-neutral-500 outline-none w-full"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-neutral-500 hover:text-white">
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* Difficulty Selector */}
              <div className="flex items-center gap-1 font-mono text-xs self-start md:self-auto">
                {(['all', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => {
                      soundEngine.playClick();
                      setSelectedDifficulty(diff);
                    }}
                    className={`rounded-lg px-2.5 py-1 transition-colors ${
                      selectedDifficulty === diff
                        ? 'bg-white/20 text-white font-semibold'
                        : 'text-neutral-500 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Pattern Selector Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {(['all', ...PATTERNS_LIST] as const).map((pat) => (
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
          </div>

          {/* 4. Questions Repertoire Table */}
          <div className="flex flex-col gap-3">
            {filteredQuestions.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-white/5 bg-white/[0.01] text-center">
                <Code2 className="h-8 w-8 text-neutral-600 mb-2" />
                <p className="text-sm text-neutral-400 font-medium">No matching DSA questions found</p>
                <p className="text-xs text-neutral-600 mt-1">Try relaxing filters or add a new problem to repertoire.</p>
                <button
                  onClick={openAddQuestionModal}
                  className="mt-3 flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-mono text-white hover:bg-white/10"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add First Problem</span>
                </button>
              </div>
            ) : (
              filteredQuestions.map((q) => {
                const isEditingTakeaway = editingMistakeId === q.id;

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
                            {q.status === 'review_needed' && (
                              <span className="rounded bg-amber-500/15 px-1.5 py-0.2 font-mono text-[9px] text-amber-400">
                                Review Flagged
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 font-mono text-[11px] text-neutral-400 mt-1">
                            <span>Pattern: {q.pattern}</span>
                            {q.timeComplexity && <span>Time: {q.timeComplexity}</span>}
                            {q.spaceComplexity && <span>Space: {q.spaceComplexity}</span>}
                            {q.solvedDate && <span>Date: {q.solvedDate}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Favorite */}
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

                        {/* Takeaways */}
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
                          className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-mono transition-colors ${
                            q.mistakeTakeaways
                              ? 'border-white/20 bg-white/10 text-white'
                              : 'border-white/10 bg-white/5 text-neutral-400 hover:text-white'
                          }`}
                        >
                          <BookMarked className="h-3 w-3" />
                          <span>Takeaways</span>
                        </button>

                        {/* Edit Question */}
                        <button
                          onClick={() => openEditQuestionModal(q)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:bg-white/10 hover:text-white transition-colors"
                          title="Edit Question"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>

                        {/* Delete Question */}
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-1.5 rounded-lg text-neutral-500 hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
                          title="Delete Question"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Mistake Notebook & Architectural Takeaway Drawer */}
                    {(q.mistakeTakeaways || isEditingTakeaway) && (
                      <div className="mt-3.5 pt-3 border-t border-white/10 text-xs">
                        {isEditingTakeaway ? (
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
              })
            )}
          </div>
        </>
      ) : (
        /* 5. Skill Matrix & Learning Hub Grid (Editable & Addable) */
        skills.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 rounded-2xl border border-white/10 bg-white/[0.02] text-center my-6">
            <Brain className="h-12 w-12 text-neutral-600 mb-4" />
            <h3 className="text-base font-medium text-white">No Skills Added Yet</h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-md">
              Catalog your technical proficiencies, track your mastery percentages, and connect them directly to production projects.
            </p>
            <button
              onClick={openAddSkillModal}
              className="mt-5 flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-mono text-white hover:bg-white/20 transition-all shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Your First Skill</span>
            </button>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map((skill) => (
            <div
              key={skill.id}
              className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-4.5 hover:border-white/20 hover:bg-white/[0.04] transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-neutral-300">
                    {skill.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-semibold text-white capitalize">{skill.level}</span>
                    <button
                      onClick={() => openEditSkillModal(skill)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-white transition-all"
                      title="Edit Skill"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteSkill(skill.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-500/20 text-neutral-500 hover:text-rose-400 transition-all"
                      title="Delete Skill"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
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
                  {skill.topicsCompleted.length === 0 ? (
                    <span className="text-[10px] text-neutral-500 italic">No topics logged yet</span>
                  ) : (
                    <>
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
                    </>
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
        )
      )}

      {/* ─── Add / Edit Question Modal ────────────────────────────────────────── */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border border-white/15 bg-neutral-900 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 bg-neutral-950/80 px-5 py-3.5 select-none">
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">
                  {questionModalMode === 'add' ? 'Add DSA Problem' : 'Edit DSA Problem'}
                </h3>
              </div>
              <button
                onClick={() => setIsQuestionModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="p-5 flex flex-col gap-4 text-xs font-mono">
              {/* Problem Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-neutral-400">Problem Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Trapping Rain Water"
                  value={qTitle}
                  onChange={(e) => setQTitle(e.target.value)}
                  className="rounded-xl border border-white/10 bg-neutral-950 px-3 py-2 text-xs text-white placeholder-neutral-500 outline-none focus:border-emerald-500/50"
                />
              </div>

              {/* Difficulty & Platform Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] text-neutral-400">Difficulty</label>
                  <select
                    value={qDifficulty}
                    onChange={(e) => setQDifficulty(e.target.value as DsaDifficulty)}
                    className="rounded-xl border border-white/10 bg-neutral-950 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500/50"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] text-neutral-400">Platform</label>
                  <select
                    value={qPlatform}
                    onChange={(e) => setQPlatform(e.target.value as 'LeetCode' | 'Codeforces' | 'GFG')}
                    className="rounded-xl border border-white/10 bg-neutral-950 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500/50"
                  >
                    <option value="LeetCode">LeetCode</option>
                    <option value="Codeforces">Codeforces</option>
                    <option value="GFG">GeeksforGeeks</option>
                  </select>
                </div>
              </div>

              {/* Algorithmic Pattern */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-neutral-400">Algorithmic Pattern</label>
                <select
                  value={qPattern}
                  onChange={(e) => setQPattern(e.target.value as DsaPattern)}
                  className="rounded-xl border border-white/10 bg-neutral-950 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500/50"
                >
                  {PATTERNS_LIST.map((pat) => (
                    <option key={pat} value={pat}>
                      {pat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status & Complexities Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] text-neutral-400">Status</label>
                  <select
                    value={qStatus}
                    onChange={(e) =>
                      setQStatus(e.target.value as 'solved' | 'review_needed' | 'unsolved')
                    }
                    className="rounded-xl border border-white/10 bg-neutral-950 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500/50"
                  >
                    <option value="solved">Solved</option>
                    <option value="review_needed">Review Needed</option>
                    <option value="unsolved">Unsolved</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] text-neutral-400">Time</label>
                  <input
                    type="text"
                    placeholder="O(N)"
                    value={qTimeComplexity}
                    onChange={(e) => setQTimeComplexity(e.target.value)}
                    className="rounded-xl border border-white/10 bg-neutral-950 px-3 py-2 text-xs text-white placeholder-neutral-500 outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] text-neutral-400">Space</label>
                  <input
                    type="text"
                    placeholder="O(1)"
                    value={qSpaceComplexity}
                    onChange={(e) => setQSpaceComplexity(e.target.value)}
                    className="rounded-xl border border-white/10 bg-neutral-950 px-3 py-2 text-xs text-white placeholder-neutral-500 outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              {/* Mistake Takeaway */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-neutral-400">Mistake Notes & Invariants</label>
                <textarea
                  rows={3}
                  placeholder="Record edge cases, tricky pointer steps, or proof of correctness..."
                  value={qMistakeTakeaways}
                  onChange={(e) => setQMistakeTakeaways(e.target.value)}
                  className="rounded-xl border border-white/10 bg-neutral-950 p-3 text-xs text-white placeholder-neutral-500 outline-none focus:border-emerald-500/50"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="rounded-xl border border-white/10 px-4 py-2 text-xs text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-black hover:bg-emerald-400 transition-colors shadow-sm"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{questionModalMode === 'add' ? 'Add Problem' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Add / Edit Skill Modal ───────────────────────────────────────────── */}
      {isSkillModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border border-white/15 bg-neutral-900 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 bg-neutral-950/80 px-5 py-3.5 select-none">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">
                  {skillModalMode === 'add' ? 'Add Engineering Skill' : 'Edit Skill'}
                </h3>
              </div>
              <button
                onClick={() => setIsSkillModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSkill} className="p-5 flex flex-col gap-4 text-xs font-mono">
              {/* Skill Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-neutral-400">Skill / Technology Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Systems, Rust, GraphQL"
                  value={sName}
                  onChange={(e) => setSName(e.target.value)}
                  className="rounded-xl border border-white/10 bg-neutral-950 px-3 py-2 text-xs text-white placeholder-neutral-500 outline-none focus:border-emerald-500/50"
                />
              </div>

              {/* Category & Level Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] text-neutral-400">Category</label>
                  <select
                    value={sCategory}
                    onChange={(e) => setSCategory(e.target.value as SkillCategory)}
                    className="rounded-xl border border-white/10 bg-neutral-950 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500/50"
                  >
                    {SKILL_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] text-neutral-400">Proficiency Level</label>
                  <select
                    value={sLevel}
                    onChange={(e) => setSLevel(e.target.value as SkillProficiency)}
                    className="rounded-xl border border-white/10 bg-neutral-950 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500/50"
                  >
                    {PROFICIENCY_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Mastery Slider & Practice Reps */}
              <div className="grid grid-cols-2 gap-3 items-center">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[11px] text-neutral-400">
                    <span>Mastery</span>
                    <span className="text-white font-bold">{sMastery}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={sMastery}
                    onChange={(e) => setSMastery(Number(e.target.value))}
                    className="w-full accent-emerald-400"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] text-neutral-400">Practice Reps Count</label>
                  <input
                    type="number"
                    min={0}
                    value={sPracticeCount}
                    onChange={(e) => setSPracticeCount(Number(e.target.value))}
                    className="rounded-xl border border-white/10 bg-neutral-950 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              {/* Mastered Topics (comma separated) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-neutral-400">Mastered Topics (comma separated)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Raft consensus, Event loop, LSM Trees, Sharding"
                  value={sTopics}
                  onChange={(e) => setSTopics(e.target.value)}
                  className="rounded-xl border border-white/10 bg-neutral-950 p-3 text-xs text-white placeholder-neutral-500 outline-none focus:border-emerald-500/50"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsSkillModalOpen(false)}
                  className="rounded-xl border border-white/10 px-4 py-2 text-xs text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-black hover:bg-emerald-400 transition-colors shadow-sm"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{skillModalMode === 'add' ? 'Add Skill' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
