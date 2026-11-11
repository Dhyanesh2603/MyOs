import { create } from 'zustand';
import type {
  Mission,
  MissionPriority,
  Project,
  ProjectStatus,
  ProjectMilestone,
  AcademicSubject,
  AcademicAssignment,
  CgpaPlan,
  SkillItem,
  DsaQuestion,
  CareerCompany,
  InterviewRound,
  DailyPlan,
  TimelineEvent,
  KnowledgeNode,
  KnowledgeEdge,
  FocusModeState,
  MissionStatus,
  CareerStage,
  PersonalTask,
  TaskPriority,
  TaskCategory,
} from './types';

export type {
  PersonalTask,
  TaskPriority,
  TaskCategory,
};

export type PersonalOsTab =
  | 'home'
  | 'tasks'
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
  tasks: PersonalTask[];
  portfolioChecklist: { id: string; title: string; completed: boolean }[];
  resumeVersions: { id: string; name: string; tag: string; updated: string }[];

  // Focus Mode
  focusMode: FocusModeState;

  // Actions
  // Tasks & Todos
  addTask: (task: Omit<PersonalTask, 'id' | 'createdAt'>) => void;
  toggleTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  updateTask: (taskId: string, patch: Partial<PersonalTask>) => void;

  // Missions
  toggleMissionObjective: (missionId: string, objectiveId: string) => void;
  updateMissionStatus: (missionId: string, status: MissionStatus) => void;
  addMission: (title: string, tagline?: string, category?: Mission['category'], priority?: MissionPriority, deadline?: string) => void;
  updateMission: (missionId: string, updates: Partial<Mission>) => void;
  deleteMission: (missionId: string) => void;
  addMissionObjective: (missionId: string, text: string) => void;
  deleteMissionObjective: (missionId: string, objectiveId: string) => void;

  // Projects
  addProject: (project: {
    name: string;
    tagline: string;
    description: string;
    repoUrl: string;
    demoUrl?: string;
    techStack: string[];
    architectureOverview: string;
    status?: ProjectStatus;
    milestones?: string[];
  }) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  deleteProject: (projectId: string) => void;
  toggleProjectMilestone: (projectId: string, milestoneId: string) => void;
  addProjectMilestone: (projectId: string, title: string) => void;
  deleteProjectMilestone: (projectId: string, milestoneId: string) => void;
  addProjectBug: (projectId: string, description: string, severity: 'critical' | 'moderate' | 'minor') => void;
  addProjectIssue: (projectId: string, title: string) => void;
  resolveProjectBug: (projectId: string, bugId: string) => void;

  // Academics
  addSubject: (subject: {
    code: string;
    name: string;
    credits: number;
    professor?: string;
    minimumTarget?: number;
    attended?: number;
    total?: number;
  }) => void;
  updateSubject: (subjectId: string, updates: Partial<AcademicSubject>) => void;
  deleteSubject: (subjectId: string) => void;
  logAttendance: (subjectId: string, attended: boolean) => void;
  adjustAttendanceCount: (subjectId: string, attended: number, total: number) => void;
  toggleAssignment: (subjectId: string, assignmentId: string) => void;
  addAssignment: (
    subjectId: string,
    title: string,
    dueDate: string,
    weightage?: number,
    type?: AcademicAssignment['type']
  ) => void;
  deleteAssignment: (subjectId: string, assignmentId: string) => void;
  updateRevisionStatus: (subjectId: string, topicId: string, status: 'not_started' | 'revising' | 'mastered') => void;
  addRevisionTopic: (subjectId: string, topic: string) => void;
  deleteRevisionTopic: (subjectId: string, topicId: string) => void;
  updateCgpaPlan: (updates: Partial<CgpaPlan>) => void;

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
  addCompany: (company: {
    companyName: string;
    role: string;
    stage?: CareerStage;
    ctcRange?: string;
    location?: string;
    jobUrl?: string;
    notes?: string;
    resumeVersionUsed?: string;
  }) => void;
  updateCompany: (companyId: string, updates: Partial<CareerCompany>) => void;
  deleteCompany: (companyId: string) => void;
  updateCompanyStage: (companyId: string, stage: CareerStage) => void;
  addInterviewRound: (companyId: string, roundName: string, date?: string, feedback?: string) => void;
  deleteInterviewRound: (companyId: string, roundId: string) => void;
  toggleInterviewRoundPassed: (companyId: string, roundId: string) => void;
  togglePortfolioChecklist: (id: string) => void;
  addPortfolioChecklist: (title: string) => void;
  deletePortfolioChecklist: (id: string) => void;
  addResumeVersion: (name: string, tag: string) => void;
  deleteResumeVersion: (id: string) => void;

  // Daily
  toggleMorningPriority: (priorityId: string) => void;
  addMorningPriority: (text: string, tag?: string) => void;
  deleteMorningPriority: (priorityId: string) => void;
  logDeepWorkMinutes: (minutes: number) => void;
  updateEveningReflection: (notes: string, wins?: string[], mistakes?: string[]) => void;
  addDailyWin: (win: string) => void;
  deleteDailyWin: (index: number) => void;
  addDailyMistake: (mistake: string) => void;
  deleteDailyMistake: (index: number) => void;
  updateDailyLevels: (focusLevel: 1 | 2 | 3 | 4 | 5, energyLevel: 1 | 2 | 3 | 4 | 5) => void;
  addTimelineEvent: (event: Omit<TimelineEvent, 'id' | 'timestamp'>) => void;

  // Focus Mode
  startFocusMode: (taskTitle: string, targetMinutes?: number) => void;
  stopFocusMode: () => void;
  tickFocusTimer: () => void;

  // Computed Recommendations
  getRecommendedNextAction: () => NextActionRecommendation;
  getAttendanceAlerts: () => AcademicSubject[];
}

const STORAGE_KEY = 'onyx_personal_os_state_v1';

export const EMPTY_CGPA_PLAN: CgpaPlan = {
  currentCgpa: 0,
  targetCgpa: 0,
  totalCreditsCompleted: 0,
  semesterTargetCredits: 0,
};

export const EMPTY_DAILY_PLAN: DailyPlan = {
  date: new Date().toISOString().split('T')[0] || '2026-09-30',
  deepWorkLoggedMinutes: 0,
  deepWorkTargetMinutes: 240,
  morningPriorities: [],
  eveningReflection: {
    wins: [],
    mistakes: [],
    focusLevel: 3,
    energyLevel: 3,
    notes: '',
  },
};

export const DEFAULT_TASKS: PersonalTask[] = [
  {
    id: 'task-1',
    title: 'Implement Onyx OS Light Mode across all window frames & apps',
    category: 'engineering',
    priority: 'critical',
    completed: true,
    dueDate: 'Today',
    tags: ['System', 'Design'],
    notes: 'Support smooth light mode toggle and CSS token synchronization.',
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    title: 'Solve 3 Hard Dynamic Programming graph problems on LeetCode',
    category: 'dsa',
    priority: 'high',
    completed: false,
    dueDate: 'Tomorrow',
    tags: ['Algorithms', 'Graphs'],
    notes: 'Focus on Monotonic Stack and DP transition proofs.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-3',
    title: 'Benchmark 60 FPS compositor and canvas shader visualizers',
    category: 'engineering',
    priority: 'medium',
    completed: false,
    dueDate: 'This Week',
    tags: ['Performance'],
    notes: 'Verify Web Audio API analyser loop with 128 FFT nodes.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-4',
    title: 'Draft System Design Architecture document for Rate Limiter',
    category: 'career',
    priority: 'high',
    completed: false,
    dueDate: 'Oct 28',
    tags: ['Interview', 'Backend'],
    notes: 'Sliding window log vs token bucket distributed design.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-5',
    title: 'Revise Operating Systems Paging & Virtual Memory mechanisms',
    category: 'academics',
    priority: 'medium',
    completed: false,
    dueDate: 'Nov 02',
    tags: ['OS', 'VIT'],
    notes: 'Inverted page tables, TLB miss handling, and LRU replacement.',
    createdAt: new Date().toISOString(),
  },
];

function loadPersistedState(): Partial<PersonalOsState> {
  if (typeof window === 'undefined') return {};
  try {
    // Clear old mock seed storage if present
    localStorage.removeItem('flowos_personal_os_state_v2');
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('flowos_personal_os_state_v3');
    if (!raw) return {};
    const migrated = raw.replaceAll('Flow OS', 'Onyx OS').replaceAll('FlowOS', 'Onyx OS');
    return JSON.parse(migrated) as Partial<PersonalOsState>;
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
      tasks: state.tasks,
      portfolioChecklist: state.portfolioChecklist,
      resumeVersions: state.resumeVersions,
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

  missions: initialSaved.missions || [],
  projects: initialSaved.projects || [],
  subjects: initialSaved.subjects || [],
  cgpaPlan: initialSaved.cgpaPlan || EMPTY_CGPA_PLAN,
  skills: initialSaved.skills || [],
  dsaQuestions: initialSaved.dsaQuestions || [],
  companies: initialSaved.companies || [],
  dailyPlan: initialSaved.dailyPlan || EMPTY_DAILY_PLAN,
  timeline: initialSaved.timeline || [],
  knowledgeNodes: initialSaved.knowledgeNodes || [],
  knowledgeEdges: initialSaved.knowledgeEdges || [],
  tasks: initialSaved.tasks || DEFAULT_TASKS,
  portfolioChecklist: initialSaved.portfolioChecklist || [],
  resumeVersions: initialSaved.resumeVersions || [],

  focusMode: {
    isActive: false,
    activeTaskId: null,
    activeTaskTitle: 'Deep Work: Core Engineering',
    timerRemainingSeconds: 25 * 60,
    isTimerRunning: false,
    targetMinutes: 25,
  },

  // Tasks & Todos
  addTask: (task) => {
    const newTask: PersonalTask = {
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    set((state) => {
      const next = [newTask, ...state.tasks];
      saveState({ ...state, tasks: next });
      return { tasks: next };
    });
  },

  toggleTask: (taskId) => {
    set((state) => {
      const next = state.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              completed: !t.completed,
              completedAt: !t.completed ? new Date().toISOString() : undefined,
            }
          : t
      );
      saveState({ ...state, tasks: next });
      return { tasks: next };
    });
  },

  deleteTask: (taskId) => {
    set((state) => {
      const next = state.tasks.filter((t) => t.id !== taskId);
      saveState({ ...state, tasks: next });
      return { tasks: next };
    });
  },

  updateTask: (taskId, patch) => {
    set((state) => {
      const next = state.tasks.map((t) => (t.id === taskId ? { ...t, ...patch } : t));
      saveState({ ...state, tasks: next });
      return { tasks: next };
    });
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

  addMission: (title, tagline, category, priority, deadline) => {
    set((state) => {
      const newMission: Mission = {
        id: `mission-${Date.now()}`,
        title,
        tagline: tagline || 'Custom Engineering Campaign',
        category: category || 'engineering',
        status: 'active',
        priority: priority || 'high',
        progress: 0,
        deadline: deadline || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0] || '2026-10-15',
        estimatedCompletion: '2-3 weeks',
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

  updateMission: (missionId, updates) => {
    set((state) => {
      const missions = state.missions.map((m) =>
        m.id === missionId ? { ...m, ...updates } : m
      );
      saveState({ ...state, missions });
      return { missions };
    });
  },

  deleteMission: (missionId) => {
    set((state) => {
      const missions = state.missions.filter((m) => m.id !== missionId);
      saveState({ ...state, missions });
      return { missions };
    });
  },

  addMissionObjective: (missionId, text) => {
    set((state) => {
      const missions = state.missions.map((m) => {
        if (m.id !== missionId) return m;
        const objectives = [
          ...m.objectives,
          { id: `obj-${Date.now()}`, text, completed: false },
        ];
        const completedCount = objectives.filter((o) => o.completed).length;
        const progress = Math.round((completedCount / (objectives.length || 1)) * 100);
        return { ...m, objectives, progress };
      });
      saveState({ ...state, missions });
      return { missions };
    });
  },

  deleteMissionObjective: (missionId, objectiveId) => {
    set((state) => {
      const missions = state.missions.map((m) => {
        if (m.id !== missionId) return m;
        const objectives = m.objectives.filter((o) => o.id !== objectiveId);
        const completedCount = objectives.filter((o) => o.completed).length;
        const progress = Math.round((completedCount / (objectives.length || 1)) * 100);
        return { ...m, objectives, progress };
      });
      saveState({ ...state, missions });
      return { missions };
    });
  },

  // Projects
  addProject: (project) => {
    set((state) => {
      const newId = `proj-${Date.now()}`;
      const defaultMilestones: ProjectMilestone[] = project.milestones?.map((m, idx) => ({
        id: `ms-${Date.now()}-${idx}`,
        title: m,
        completed: false,
      })) || [
        { id: `ms-${Date.now()}-1`, title: 'Architecture and initial repo setup', completed: false },
        { id: `ms-${Date.now()}-2`, title: 'Core implementation and unit tests', completed: false },
        { id: `ms-${Date.now()}-3`, title: 'Production deployment and live docs', completed: false },
      ];

      const newProject: Project = {
        id: newId,
        name: project.name,
        tagline: project.tagline,
        description: project.description,
        status: project.status || 'in_progress',
        progress: 0,
        repoUrl: project.repoUrl,
        demoUrl: project.demoUrl,
        techStack: project.techStack,
        architectureOverview: project.architectureOverview,
        milestones: defaultMilestones,
        knownBugs: [],
        ideas: ['Optimize memory allocations', 'Benchmark end-to-end throughput'],
        changelog: [
          { version: 'v0.1.0', date: new Date().toISOString().split('T')[0] || '2026-09-30', notes: ['Project repository initialized'] },
        ],
        recentCommits: [
          { hash: Math.random().toString(16).slice(2, 9), message: 'feat: initialize project scaffold', date: 'Just now' },
        ],
        skillIds: [],
      };

      const projects = [newProject, ...state.projects];
      saveState({ ...state, projects });
      return { projects };
    });
  },

  updateProject: (projectId, updates) => {
    set((state) => {
      const projects = state.projects.map((p) =>
        p.id === projectId ? { ...p, ...updates } : p
      );
      saveState({ ...state, projects });
      return { projects };
    });
  },

  deleteProject: (projectId) => {
    set((state) => {
      const projects = state.projects.filter((p) => p.id !== projectId);
      saveState({ ...state, projects });
      return { projects };
    });
  },

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

  addProjectMilestone: (projectId, title) => {
    set((state) => {
      const projects = state.projects.map((p) => {
        if (p.id !== projectId) return p;
        const milestones = [
          ...p.milestones,
          { id: `ms-${Date.now()}`, title, completed: false },
        ];
        const completedCount = milestones.filter((m) => m.completed).length;
        const progress = Math.round((completedCount / (milestones.length || 1)) * 100);
        return { ...p, milestones, progress };
      });
      saveState({ ...state, projects });
      return { projects };
    });
  },

  deleteProjectMilestone: (projectId, milestoneId) => {
    set((state) => {
      const projects = state.projects.map((p) => {
        if (p.id !== projectId) return p;
        const milestones = p.milestones.filter((m) => m.id !== milestoneId);
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
  addSubject: (subject) => {
    set((state) => {
      const newSubject: AcademicSubject = {
        id: `subj-${Date.now()}`,
        code: subject.code,
        name: subject.name,
        credits: subject.credits,
        professor: subject.professor || 'Department Faculty',
        attendance: {
          attended: subject.attended ?? 0,
          total: subject.total ?? 0,
          minimumTarget: subject.minimumTarget ?? 75,
        },
        internalMarks: {
          maxMarks: 100,
        },
        assignments: [
          {
            id: `as-${Date.now()}-1`,
            title: `${subject.code} Coursework Assignment 1`,
            dueDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0] || '2026-10-10',
            completed: false,
            type: 'assignment',
            weightagePercent: 10,
          },
        ],
        examSchedule: {},
        revisionTopics: [
          { id: `rt-${Date.now()}-1`, topic: 'Module 1: Foundations & Core Concepts', status: 'not_started' },
          { id: `rt-${Date.now()}-2`, topic: 'Module 2: Advanced Implementations', status: 'not_started' },
        ],
      };
      const subjects = [...state.subjects, newSubject];
      saveState({ ...state, subjects });
      return { subjects };
    });
  },

  updateSubject: (subjectId, updates) => {
    set((state) => {
      const subjects = state.subjects.map((s) =>
        s.id === subjectId ? { ...s, ...updates } : s
      );
      saveState({ ...state, subjects });
      return { subjects };
    });
  },

  deleteSubject: (subjectId) => {
    set((state) => {
      const subjects = state.subjects.filter((s) => s.id !== subjectId);
      saveState({ ...state, subjects });
      return { subjects };
    });
  },

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

  adjustAttendanceCount: (subjectId, attended, total) => {
    set((state) => {
      const subjects = state.subjects.map((s) => {
        if (s.id !== subjectId) return s;
        return {
          ...s,
          attendance: {
            ...s.attendance,
            attended: Math.max(0, attended),
            total: Math.max(0, Math.max(attended, total)),
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

  addAssignment: (subjectId, title, dueDate, weightage, type) => {
    set((state) => {
      const subjects = state.subjects.map((s) => {
        if (s.id !== subjectId) return s;
        const newAssignment: AcademicAssignment = {
          id: `as-${Date.now()}`,
          title,
          dueDate: dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0] || '2026-10-07',
          completed: false,
          type: type || 'assignment',
          weightagePercent: weightage ?? 10,
        };
        return {
          ...s,
          assignments: [...s.assignments, newAssignment],
        };
      });
      saveState({ ...state, subjects });
      return { subjects };
    });
  },

  deleteAssignment: (subjectId, assignmentId) => {
    set((state) => {
      const subjects = state.subjects.map((s) => {
        if (s.id !== subjectId) return s;
        return {
          ...s,
          assignments: s.assignments.filter((a) => a.id !== assignmentId),
        };
      });
      saveState({ ...state, subjects });
      return { subjects };
    });
  },

  updateCgpaPlan: (updates) => {
    set((state) => {
      const cgpaPlan = { ...state.cgpaPlan, ...updates };
      saveState({ ...state, cgpaPlan });
      return { cgpaPlan };
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

  addRevisionTopic: (subjectId, topic) => {
    set((state) => {
      const subjects = state.subjects.map((s) => {
        if (s.id !== subjectId) return s;
        const newTopic = {
          id: `topic-${Date.now()}`,
          topic,
          status: 'not_started' as const,
        };
        return {
          ...s,
          revisionTopics: [...s.revisionTopics, newTopic],
        };
      });
      saveState({ ...state, subjects });
      return { subjects };
    });
  },

  deleteRevisionTopic: (subjectId, topicId) => {
    set((state) => {
      const subjects = state.subjects.map((s) => {
        if (s.id !== subjectId) return s;
        return {
          ...s,
          revisionTopics: s.revisionTopics.filter((t) => t.id !== topicId),
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
  addCompany: (company) => {
    set((state) => {
      const newCompany: CareerCompany = {
        id: `comp-${Date.now()}`,
        companyName: company.companyName,
        role: company.role,
        stage: company.stage || 'wishlist',
        applicationDate: new Date().toISOString().split('T')[0] || '2026-09-30',
        ctcRange: company.ctcRange || 'Competitive',
        location: company.location || 'Remote / Hybrid',
        jobUrl: company.jobUrl,
        notes: company.notes,
        interviewRounds: [
          { id: `rnd-${Date.now()}-1`, roundName: 'Resume Screening & Profile Review', passed: true },
          { id: `rnd-${Date.now()}-2`, roundName: 'Technical Architecture & Coding Round', passed: false },
        ],
      };
      const companies = [newCompany, ...state.companies];
      saveState({ ...state, companies });
      return { companies };
    });
  },

  updateCompany: (companyId, updates) => {
    set((state) => {
      const companies = state.companies.map((c) =>
        c.id === companyId ? { ...c, ...updates } : c
      );
      saveState({ ...state, companies });
      return { companies };
    });
  },

  deleteCompany: (companyId) => {
    set((state) => {
      const companies = state.companies.filter((c) => c.id !== companyId);
      saveState({ ...state, companies });
      return { companies };
    });
  },

  updateCompanyStage: (companyId, stage) => {
    set((state) => {
      const companies = state.companies.map((c) =>
        c.id === companyId ? { ...c, stage } : c
      );
      saveState({ ...state, companies });
      return { companies };
    });
  },

  addInterviewRound: (companyId, roundName, date, feedback) => {
    set((state) => {
      const companies = state.companies.map((c) => {
        if (c.id !== companyId) return c;
        const newRound: InterviewRound = {
          id: `rnd-${Date.now()}`,
          roundName,
          date,
          feedback,
          passed: false,
        };
        return {
          ...c,
          interviewRounds: [...c.interviewRounds, newRound],
        };
      });
      saveState({ ...state, companies });
      return { companies };
    });
  },

  deleteInterviewRound: (companyId, roundId) => {
    set((state) => {
      const companies = state.companies.map((c) => {
        if (c.id !== companyId) return c;
        return {
          ...c,
          interviewRounds: c.interviewRounds.filter((r) => r.id !== roundId),
        };
      });
      saveState({ ...state, companies });
      return { companies };
    });
  },

  toggleInterviewRoundPassed: (companyId, roundId) => {
    set((state) => {
      const companies = state.companies.map((c) => {
        if (c.id !== companyId) return c;
        return {
          ...c,
          interviewRounds: c.interviewRounds.map((r) =>
            r.id === roundId ? { ...r, passed: !r.passed } : r
          ),
        };
      });
      saveState({ ...state, companies });
      return { companies };
    });
  },

  togglePortfolioChecklist: (id) => {
    set((state) => {
      const portfolioChecklist = state.portfolioChecklist.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      );
      saveState({ ...state, portfolioChecklist });
      return { portfolioChecklist };
    });
  },

  addPortfolioChecklist: (title) => {
    set((state) => {
      const newItem = {
        id: `port-${Date.now()}`,
        title,
        completed: false,
      };
      const portfolioChecklist = [...state.portfolioChecklist, newItem];
      saveState({ ...state, portfolioChecklist });
      return { portfolioChecklist };
    });
  },

  deletePortfolioChecklist: (id) => {
    set((state) => {
      const portfolioChecklist = state.portfolioChecklist.filter((item) => item.id !== id);
      saveState({ ...state, portfolioChecklist });
      return { portfolioChecklist };
    });
  },

  addResumeVersion: (name, tag) => {
    set((state) => {
      const newItem = {
        id: `res-${Date.now()}`,
        name,
        tag,
        updated: new Date().toISOString().split('T')[0] || 'Today',
      };
      const resumeVersions = [newItem, ...state.resumeVersions];
      saveState({ ...state, resumeVersions });
      return { resumeVersions };
    });
  },

  deleteResumeVersion: (id) => {
    set((state) => {
      const resumeVersions = state.resumeVersions.filter((item) => item.id !== id);
      saveState({ ...state, resumeVersions });
      return { resumeVersions };
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

  deleteMorningPriority: (priorityId) => {
    set((state) => {
      const dailyPlan = {
        ...state.dailyPlan,
        morningPriorities: state.dailyPlan.morningPriorities.filter((p) => p.id !== priorityId),
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

  updateEveningReflection: (notes, wins, mistakes) => {
    set((state) => {
      const dailyPlan = {
        ...state.dailyPlan,
        eveningReflection: {
          ...state.dailyPlan.eveningReflection,
          notes: notes !== undefined ? notes : state.dailyPlan.eveningReflection.notes,
          wins: wins || state.dailyPlan.eveningReflection.wins,
          mistakes: mistakes || state.dailyPlan.eveningReflection.mistakes,
        },
      };
      saveState({ ...state, dailyPlan });
      return { dailyPlan };
    });
  },

  addDailyWin: (win) => {
    set((state) => {
      const dailyPlan = {
        ...state.dailyPlan,
        eveningReflection: {
          ...state.dailyPlan.eveningReflection,
          wins: [...state.dailyPlan.eveningReflection.wins, win],
        },
      };
      saveState({ ...state, dailyPlan });
      return { dailyPlan };
    });
  },

  deleteDailyWin: (index) => {
    set((state) => {
      const dailyPlan = {
        ...state.dailyPlan,
        eveningReflection: {
          ...state.dailyPlan.eveningReflection,
          wins: state.dailyPlan.eveningReflection.wins.filter((_, i) => i !== index),
        },
      };
      saveState({ ...state, dailyPlan });
      return { dailyPlan };
    });
  },

  addDailyMistake: (mistake) => {
    set((state) => {
      const dailyPlan = {
        ...state.dailyPlan,
        eveningReflection: {
          ...state.dailyPlan.eveningReflection,
          mistakes: [...state.dailyPlan.eveningReflection.mistakes, mistake],
        },
      };
      saveState({ ...state, dailyPlan });
      return { dailyPlan };
    });
  },

  deleteDailyMistake: (index) => {
    set((state) => {
      const dailyPlan = {
        ...state.dailyPlan,
        eveningReflection: {
          ...state.dailyPlan.eveningReflection,
          mistakes: state.dailyPlan.eveningReflection.mistakes.filter((_, i) => i !== index),
        },
      };
      saveState({ ...state, dailyPlan });
      return { dailyPlan };
    });
  },

  updateDailyLevels: (focusLevel, energyLevel) => {
    set((state) => {
      const dailyPlan = {
        ...state.dailyPlan,
        eveningReflection: {
          ...state.dailyPlan.eveningReflection,
          focusLevel,
          energyLevel,
        },
      };
      saveState({ ...state, dailyPlan });
      return { dailyPlan };
    });
  },

  addTimelineEvent: (event) => {
    set((state) => {
      const newEvent: TimelineEvent = {
        id: `event-${Date.now()}`,
        timestamp: new Date().toISOString(),
        ...event,
      };
      const timeline = [newEvent, ...state.timeline];
      saveState({ ...state, timeline });
      return { timeline };
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
      (s) => s.attendance.total > 0 && (s.attendance.attended / s.attendance.total) * 100 < s.attendance.minimumTarget
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
      title: 'Welcome to Personal OS',
      context: 'Start by creating your first project, logging coursework, or setting today\'s intentional priorities.',
      urgency: 'medium',
      actionLabel: 'Set Priority',
      targetTab: 'daily',
    };
  },

  getAttendanceAlerts: () => {
    return get().subjects.filter(
      (s) => s.attendance.total > 0 && (s.attendance.attended / s.attendance.total) * 100 < s.attendance.minimumTarget
    );
  },
}));
