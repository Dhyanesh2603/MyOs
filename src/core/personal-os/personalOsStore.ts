import { create } from 'zustand';
import type {
  Mission,
  Project,
  AcademicSubject,
  CgpaPlan,
  SkillItem,
  DsaQuestion,
  CareerCompany,
  DailyPlan,
  TimelineEvent,
  KnowledgeNode,
  KnowledgeEdge,
  FocusModeState,
  MissionStatus,
  CareerStage,
} from './types';
import {
  SEED_MISSIONS,
  SEED_PROJECTS,
  SEED_SUBJECTS,
  SEED_CGPA,
  SEED_SKILLS,
  SEED_DSA_QUESTIONS,
  SEED_COMPANIES,
  SEED_DAILY_PLAN,
  SEED_TIMELINE,
  SEED_KNOWLEDGE_NODES,
  SEED_KNOWLEDGE_EDGES,
} from './seedData';

export type PersonalOsTab =
  | 'home'
  | 'missions'
  | 'projects'
  | 'academics'
  | 'learning'
  | 'career'
  | 'daily'
  | 'graph'
  | 'timeline';

export interface NextActionRecommendation {
  title: string;
  context: string;
  urgency: 'critical' | 'high' | 'medium';
  actionLabel: string;
  targetTab: PersonalOsTab;
  metadata?: string;
}

export interface PersonalOsState {
  // Navigation
  activeTab: PersonalOsTab;
  setActiveTab: (tab: PersonalOsTab) => void;

  // Data Collections
  missions: Mission[];
  projects: Project[];
  subjects: AcademicSubject[];
  cgpaPlan: CgpaPlan;
  skills: SkillItem[];
  dsaQuestions: DsaQuestion[];
  companies: CareerCompany[];
  dailyPlan: DailyPlan;
  timeline: TimelineEvent[];
  knowledgeNodes: KnowledgeNode[];
  knowledgeEdges: KnowledgeEdge[];

  // Focus Mode
  focusMode: FocusModeState;

  // Actions
  // Missions
  toggleMissionObjective: (missionId: string, objectiveId: string) => void;
  updateMissionStatus: (missionId: string, status: MissionStatus) => void;
  addMission: (title: string, tagline?: string) => void;

  // Projects
  toggleProjectMilestone: (projectId: string, milestoneId: string) => void;
  addProjectBug: (projectId: string, description: string, severity: 'critical' | 'moderate' | 'minor') => void;
  addProjectIssue: (projectId: string, title: string) => void;
  resolveProjectBug: (projectId: string, bugId: string) => void;

  // Academics
  logAttendance: (subjectId: string, attended: boolean) => void;
  toggleAssignment: (subjectId: string, assignmentId: string) => void;
  updateRevisionStatus: (subjectId: string, topicId: string, status: 'not_started' | 'revising' | 'mastered') => void;

  // DSA
  toggleDsaStatus: (questionId: string) => void;
  toggleDsaFavorite: (questionId: string) => void;
  updateDsaMistake: (questionId: string, takeaways: string) => void;
  addDsaMistakeNote: (title: string, mistake: string) => void;
  addDsaQuestion: (question: Omit<DsaQuestion, 'id'>) => void;
  updateDsaQuestion: (questionId: string, updates: Partial<DsaQuestion>) => void;
  deleteDsaQuestion: (questionId: string) => void;

  // Skills
  addSkill: (skill: Omit<SkillItem, 'id'>) => void;
  updateSkill: (skillId: string, updates: Partial<SkillItem>) => void;
  deleteSkill: (skillId: string) => void;

  // Career
  updateCompanyStage: (companyId: string, stage: CareerStage) => void;

  // Daily
  toggleMorningPriority: (priorityId: string) => void;
  addMorningPriority: (text: string, tag?: string) => void;
  logDeepWorkMinutes: (minutes: number) => void;

  // Focus Mode
  startFocusMode: (taskTitle: string, targetMinutes?: number) => void;
  stopFocusMode: () => void;
  tickFocusTimer: () => void;

  // Computed Recommendations
  getRecommendedNextAction: () => NextActionRecommendation;
  getAttendanceAlerts: () => AcademicSubject[];
}

const STORAGE_KEY = 'flowos_personal_os_state_v2';

function loadPersistedState(): Partial<PersonalOsState> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<PersonalOsState>;
  } catch {
    return {};
  }
}

function saveState(state: Partial<PersonalOsState>): void {
  if (typeof window === 'undefined') return;
  try {
    const serialized = {
      missions: state.missions,
      projects: state.projects,
      subjects: state.subjects,
      cgpaPlan: state.cgpaPlan,
      skills: state.skills,
      dsaQuestions: state.dsaQuestions,
      companies: state.companies,
      dailyPlan: state.dailyPlan,
      timeline: state.timeline,
      knowledgeNodes: state.knowledgeNodes,
      knowledgeEdges: state.knowledgeEdges,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
  } catch {
    // Storage quota exceeded or disabled
  }
}

const initialSaved = loadPersistedState();

export const usePersonalOsStore = create<PersonalOsState>((set, get) => ({
  activeTab: 'home',
  setActiveTab: (activeTab) => set({ activeTab }),

  missions: initialSaved.missions || SEED_MISSIONS,
  projects: initialSaved.projects || SEED_PROJECTS,
  subjects: initialSaved.subjects || SEED_SUBJECTS,
  cgpaPlan: initialSaved.cgpaPlan || SEED_CGPA,
  skills: initialSaved.skills || SEED_SKILLS,
  dsaQuestions: initialSaved.dsaQuestions || SEED_DSA_QUESTIONS,
  companies: initialSaved.companies || SEED_COMPANIES,
  dailyPlan: initialSaved.dailyPlan || SEED_DAILY_PLAN,
  timeline: initialSaved.timeline || SEED_TIMELINE,
  knowledgeNodes: initialSaved.knowledgeNodes || SEED_KNOWLEDGE_NODES,
  knowledgeEdges: initialSaved.knowledgeEdges || SEED_KNOWLEDGE_EDGES,

  focusMode: {
    isActive: false,
    activeTaskId: null,
    activeTaskTitle: 'Deep Work: Core Engineering',
    timerRemainingSeconds: 25 * 60,
    isTimerRunning: false,
    targetMinutes: 25,
  },

  // Missions
  toggleMissionObjective: (missionId, objectiveId) => {
    set((state) => {
      const missions = state.missions.map((m) => {
        if (m.id !== missionId) return m;
        const objectives = m.objectives.map((o) =>
          o.id === objectiveId ? { ...o, completed: !o.completed } : o
        );
        const completedCount = objectives.filter((o) => o.completed).length;
        const progress = Math.round((completedCount / (objectives.length || 1)) * 100);
        return { ...m, objectives, progress };
      });
      saveState({ ...state, missions });
      return { missions };
    });
  },

  updateMissionStatus: (missionId, status) => {
    set((state) => {
      const missions = state.missions.map((m) =>
        m.id === missionId ? { ...m, status } : m
      );
      saveState({ ...state, missions });
      return { missions };
    });
  },

  addMission: (title, tagline) => {
    set((state) => {
      const newMission: Mission = {
        id: `mission-${Date.now()}`,
        title,
        tagline: tagline || 'Captured via Quick Scratchpad',
        category: 'engineering',
        status: 'active',
        priority: 'high',
        progress: 0,
        deadline: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0] || '2026-09-30',
        estimatedCompletion: '1-2 weeks',
        objectives: [
          { id: `obj-${Date.now()}-1`, text: 'Initial technical specification & architecture', completed: false },
          { id: `obj-${Date.now()}-2`, text: 'Core implementation and verification', completed: false },
        ],
        projectIds: [],
        skillIds: [],
        dependencies: [],
        resources: [],
      };
      const missions = [newMission, ...state.missions];
      saveState({ ...state, missions });
      return { missions };
    });
  },

  // Projects
  toggleProjectMilestone: (projectId, milestoneId) => {
    set((state) => {
      const projects = state.projects.map((p) => {
        if (p.id !== projectId) return p;
        const milestones = p.milestones.map((m) =>
          m.id === milestoneId ? { ...m, completed: !m.completed } : m
        );
        const completedCount = milestones.filter((m) => m.completed).length;
        const progress = Math.round((completedCount / (milestones.length || 1)) * 100);
        return { ...p, milestones, progress };
      });
      saveState({ ...state, projects });
      return { projects };
    });
  },

  addProjectIssue: (projectId, title) => {
    set((state) => {
      const targetProjectId = projectId || state.projects[0]?.id;
      if (!targetProjectId) return state;
      const projects = state.projects.map((p) => {
        if (p.id !== targetProjectId) return p;
        return {
          ...p,
          knownBugs: [
            ...p.knownBugs,
            { id: `kb-${Date.now()}`, description: title, severity: 'moderate' as const, status: 'open' as const },
          ],
        };
      });
      saveState({ ...state, projects });
      return { projects };
    });
  },

  addProjectBug: (projectId, description, severity) => {
    set((state) => {
      const projects = state.projects.map((p) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          knownBugs: [
            ...p.knownBugs,
            { id: `kb-${Date.now()}`, description, severity, status: 'open' as const },
          ],
        };
      });
      saveState({ ...state, projects });
      return { projects };
    });
  },

  resolveProjectBug: (projectId, bugId) => {
    set((state) => {
      const projects = state.projects.map((p) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          knownBugs: p.knownBugs.map((b) =>
            b.id === bugId ? { ...b, status: 'resolved' as const } : b
          ),
        };
      });
      saveState({ ...state, projects });
      return { projects };
    });
  },

  // Academics
  logAttendance: (subjectId, attended) => {
    set((state) => {
      const subjects = state.subjects.map((s) => {
        if (s.id !== subjectId) return s;
        return {
          ...s,
          attendance: {
            ...s.attendance,
            attended: attended ? s.attendance.attended + 1 : s.attendance.attended,
            total: s.attendance.total + 1,
          },
        };
      });
      saveState({ ...state, subjects });
      return { subjects };
    });
  },

  toggleAssignment: (subjectId, assignmentId) => {
    set((state) => {
      const subjects = state.subjects.map((s) => {
        if (s.id !== subjectId) return s;
        return {
          ...s,
          assignments: s.assignments.map((a) =>
            a.id === assignmentId ? { ...a, completed: !a.completed } : a
          ),
        };
      });
      saveState({ ...state, subjects });
      return { subjects };
    });
  },

  updateRevisionStatus: (subjectId, topicId, status) => {
    set((state) => {
      const subjects = state.subjects.map((s) => {
        if (s.id !== subjectId) return s;
        return {
          ...s,
          revisionTopics: s.revisionTopics.map((t) =>
            t.id === topicId ? { ...t, status } : t
          ),
        };
      });
      saveState({ ...state, subjects });
      return { subjects };
    });
  },

  // DSA
  toggleDsaStatus: (questionId) => {
    set((state) => {
      const dsaQuestions = state.dsaQuestions.map((q) => {
        if (q.id !== questionId) return q;
        const nextStatus = q.status === 'solved' ? 'review_needed' : 'solved';
        return { ...q, status: nextStatus as 'solved' | 'review_needed' };
      });
      saveState({ ...state, dsaQuestions });
      return { dsaQuestions };
    });
  },

  toggleDsaFavorite: (questionId) => {
    set((state) => {
      const dsaQuestions = state.dsaQuestions.map((q) =>
        q.id === questionId ? { ...q, isFavorite: !q.isFavorite } : q
      );
      saveState({ ...state, dsaQuestions });
      return { dsaQuestions };
    });
  },

  updateDsaMistake: (questionId, takeaways) => {
    set((state) => {
      const dsaQuestions = state.dsaQuestions.map((q) =>
        q.id === questionId ? { ...q, mistakeTakeaways: takeaways } : q
      );
      saveState({ ...state, dsaQuestions });
      return { dsaQuestions };
    });
  },

  addDsaMistakeNote: (title, mistake) => {
    set((state) => {
      const newQuestion: DsaQuestion = {
        id: `dsa-note-${Date.now()}`,
        title,
        difficulty: 'Medium',
        pattern: 'Sliding Window',
        platform: 'LeetCode',
        status: 'review_needed',
        notes: 'Captured via Quick Scratchpad',
        mistakeTakeaways: mistake,
        isFavorite: true,
      };
      const dsaQuestions = [newQuestion, ...state.dsaQuestions];
      saveState({ ...state, dsaQuestions });
      return { dsaQuestions };
    });
  },

  addDsaQuestion: (question) => {
    set((state) => {
      const newQuestion: DsaQuestion = {
        ...question,
        id: `dsa-q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      };
      const dsaQuestions = [newQuestion, ...state.dsaQuestions];
      saveState({ ...state, dsaQuestions });
      return { dsaQuestions };
    });
  },

  updateDsaQuestion: (questionId, updates) => {
    set((state) => {
      const dsaQuestions = state.dsaQuestions.map((q) =>
        q.id === questionId ? { ...q, ...updates } : q
      );
      saveState({ ...state, dsaQuestions });
      return { dsaQuestions };
    });
  },

  deleteDsaQuestion: (questionId) => {
    set((state) => {
      const dsaQuestions = state.dsaQuestions.filter((q) => q.id !== questionId);
      saveState({ ...state, dsaQuestions });
      return { dsaQuestions };
    });
  },

  addSkill: (skill) => {
    set((state) => {
      const newSkill: SkillItem = {
        ...skill,
        id: `sk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      };
      const skills = [newSkill, ...state.skills];
      saveState({ ...state, skills });
      return { skills };
    });
  },

  updateSkill: (skillId, updates) => {
    set((state) => {
      const skills = state.skills.map((s) =>
        s.id === skillId ? { ...s, ...updates } : s
      );
      saveState({ ...state, skills });
      return { skills };
    });
  },

  deleteSkill: (skillId) => {
    set((state) => {
      const skills = state.skills.filter((s) => s.id !== skillId);
      saveState({ ...state, skills });
      return { skills };
    });
  },

  // Career
  updateCompanyStage: (companyId, stage) => {
    set((state) => {
      const companies = state.companies.map((c) =>
        c.id === companyId ? { ...c, stage } : c
      );
      saveState({ ...state, companies });
      return { companies };
    });
  },

  // Daily
  toggleMorningPriority: (priorityId) => {
    set((state) => {
      const priorities = state.dailyPlan.morningPriorities.map((p) =>
        p.id === priorityId ? { ...p, completed: !p.completed } : p
      );
      const dailyPlan = { ...state.dailyPlan, morningPriorities: priorities };
      saveState({ ...state, dailyPlan });
      return { dailyPlan };
    });
  },

  addMorningPriority: (text, tag) => {
    set((state) => {
      const newPriority = {
        id: `dp-${Date.now()}`,
        text,
        completed: false,
        tag: tag || 'WORK',
      };
      const dailyPlan = {
        ...state.dailyPlan,
        morningPriorities: [...state.dailyPlan.morningPriorities, newPriority],
      };
      saveState({ ...state, dailyPlan });
      return { dailyPlan };
    });
  },

  logDeepWorkMinutes: (minutes) => {
    set((state) => {
      const dailyPlan = {
        ...state.dailyPlan,
        deepWorkLoggedMinutes: state.dailyPlan.deepWorkLoggedMinutes + minutes,
      };
      saveState({ ...state, dailyPlan });
      return { dailyPlan };
    });
  },

  // Focus Mode
  startFocusMode: (taskTitle, targetMinutes = 25) => {
    set({
      focusMode: {
        isActive: true,
        activeTaskId: `focus-${Date.now()}`,
        activeTaskTitle: taskTitle,
        timerRemainingSeconds: targetMinutes * 60,
        isTimerRunning: true,
        targetMinutes,
      },
    });
  },

  stopFocusMode: () => {
    const { isTimerRunning, targetMinutes, timerRemainingSeconds } = get().focusMode;
    if (isTimerRunning) {
      const elapsedMinutes = Math.max(1, Math.round((targetMinutes * 60 - timerRemainingSeconds) / 60));
      get().logDeepWorkMinutes(elapsedMinutes);
    }
    set({
      focusMode: {
        isActive: false,
        activeTaskId: null,
        activeTaskTitle: '',
        timerRemainingSeconds: 0,
        isTimerRunning: false,
        targetMinutes: 25,
      },
    });
  },

  tickFocusTimer: () => {
    set((state) => {
      if (!state.focusMode.isActive || !state.focusMode.isTimerRunning) return state;
      const nextSeconds = state.focusMode.timerRemainingSeconds - 1;
      if (nextSeconds <= 0) {
        return {
          focusMode: {
            ...state.focusMode,
            timerRemainingSeconds: 0,
            isTimerRunning: false,
          },
        };
      }
      return {
        focusMode: {
          ...state.focusMode,
          timerRemainingSeconds: nextSeconds,
        },
      };
    });
  },

  // Intelligence Recommendation Engine
  getRecommendedNextAction: () => {
    const { subjects, dailyPlan, missions, dsaQuestions } = get();

    // 1. Regulatory Attendance Alert (<75%)
    const criticalSubject = subjects.find(
      (s) => (s.attendance.attended / (s.attendance.total || 1)) * 100 < 75
    );
    if (criticalSubject) {
      const pct = Math.round((criticalSubject.attendance.attended / criticalSubject.attendance.total) * 100);
      return {
        title: `Attend ${criticalSubject.name}`,
        context: `Current attendance is ${pct}% (Below mandatory 75% threshold). Next class is critical.`,
        urgency: 'critical',
        actionLabel: 'Open Academics',
        targetTab: 'academics',
        metadata: `${criticalSubject.code} • ${pct}%`,
      };
    }

    // 2. Unfinished Morning Priority
    const nextPriority = dailyPlan.morningPriorities.find((p) => !p.completed);
    if (nextPriority) {
      return {
        title: nextPriority.text,
        context: `Today's active high-priority focus (${nextPriority.tag || 'GOAL'}).`,
        urgency: 'high',
        actionLabel: 'Resume Work',
        targetTab: 'daily',
        metadata: nextPriority.tag,
      };
    }

    // 3. Imminent Incomplete Mission Objective
    const activeMission = missions.find((m) => m.status === 'active');
    if (activeMission) {
      const nextObj = activeMission.objectives.find((o) => !o.completed);
      if (nextObj) {
        return {
          title: nextObj.text,
          context: `Mission Objective: ${activeMission.title}`,
          urgency: 'high',
          actionLabel: 'Open Mission',
          targetTab: 'missions',
          metadata: activeMission.title,
        };
      }
    }

    // 4. DSA Review Needed
    const reviewDsa = dsaQuestions.find((q) => q.status === 'review_needed');
    if (reviewDsa) {
      return {
        title: `Revise "${reviewDsa.title}"`,
        context: `Flagged for revision (${reviewDsa.pattern} • ${reviewDsa.difficulty}).`,
        urgency: 'medium',
        actionLabel: 'Practice DSA',
        targetTab: 'learning',
        metadata: reviewDsa.difficulty,
      };
    }

    // Default fallback
    return {
      title: 'Continue Deep Work Block',
      context: 'All immediate tasks up to date. Continue high-momentum engineering.',
      urgency: 'medium',
      actionLabel: 'Start Timer',
      targetTab: 'daily',
    };
  },

  getAttendanceAlerts: () => {
    return get().subjects.filter(
      (s) => (s.attendance.attended / (s.attendance.total || 1)) * 100 < 75
    );
  },
}));
