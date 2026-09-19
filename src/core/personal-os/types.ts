/**
 * Flow OS v2 — Personal Operating System Data Contracts
 * Minimal, monochrome, engineering-focused, momentum-driven architecture.
 */

export type MissionPriority = 'critical' | 'high' | 'medium' | 'low';
export type MissionStatus = 'active' | 'queued' | 'completed' | 'paused';

export interface MissionObjective {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string;
}

export interface MissionResource {
  title: string;
  url: string;
  type: 'doc' | 'repo' | 'course' | 'spec' | 'link';
}

export interface Mission {
  id: string;
  title: string;
  tagline: string;
  category: 'career' | 'engineering' | 'academics' | 'learning';
  status: MissionStatus;
  priority: MissionPriority;
  progress: number; // 0 to 100
  deadline: string;
  estimatedCompletion: string;
  objectives: MissionObjective[];
  projectIds: string[];
  skillIds: string[];
  dependencies: string[];
  resources: MissionResource[];
}

export type ProjectStatus = 'active' | 'in_progress' | 'shipped' | 'archived';

export interface ProjectMilestone {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
}

export interface KnownBug {
  id: string;
  description: string;
  severity: 'critical' | 'moderate' | 'minor';
  status: 'open' | 'resolved';
}

export interface ChangelogEntry {
  version: string;
  date: string;
  notes: string[];
}

export interface GitCommitRecord {
  hash: string;
  message: string;
  date: string;
}

export interface Project {
  id: string;
  name: string;
  tagline: string;
  description: string;
  status: ProjectStatus;
  progress: number; // 0 to 100
  repoUrl: string;
  demoUrl?: string;
  techStack: string[];
  architectureOverview: string;
  milestones: ProjectMilestone[];
  knownBugs: KnownBug[];
  ideas: string[];
  changelog: ChangelogEntry[];
  recentCommits: GitCommitRecord[];
  missionId?: string;
  skillIds: string[];
}

export interface AcademicAssignment {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
  type: 'assignment' | 'lab' | 'project' | 'quiz';
  weightagePercent?: number;
}

export interface RevisionTopic {
  id: string;
  topic: string;
  status: 'not_started' | 'revising' | 'mastered';
}

export interface AcademicSubject {
  id: string;
  code: string;
  name: string;
  credits: number;
  professor: string;
  attendance: {
    attended: number;
    total: number;
    minimumTarget: number; // default 75
  };
  internalMarks: {
    cat1?: number; // out of 50
    cat2?: number; // out of 50
    da1?: number; // out of 10
    da2?: number; // out of 10
    quiz?: number; // out of 10
    labFat?: number; // out of 50
    maxMarks: number;
  };
  assignments: AcademicAssignment[];
  examSchedule: {
    cat1Date?: string;
    cat2Date?: string;
    fatDate?: string;
  };
  revisionTopics: RevisionTopic[];
}

export interface CgpaPlan {
  targetCgpa: number;
  currentCgpa: number;
  totalCreditsCompleted: number;
  semesterTargetCredits: number;
}

export type SkillCategory = 'frontend' | 'backend' | 'systems' | 'ai_ml' | 'dsa' | 'devops' | 'architecture';
export type SkillProficiency = 'beginner' | 'intermediate' | 'advanced' | 'mastered';

export interface SkillItem {
  id: string;
  name: string;
  category: SkillCategory;
  level: SkillProficiency;
  practiceCount: number;
  estimatedMastery: number; // 0 to 100
  topicsCompleted: string[];
  topicsRemaining: string[];
  resources: { title: string; url: string }[];
  projectIds: string[];
}

export type DsaDifficulty = 'Easy' | 'Medium' | 'Hard';
export type DsaPattern =
  | 'Two Pointers'
  | 'Sliding Window'
  | 'Fast & Slow Pointers'
  | 'Merge Intervals'
  | 'Monotonic Stack'
  | 'Trees & Binary Search Trees'
  | 'Graphs & BFS/DFS'
  | 'Dynamic Programming'
  | 'Backtracking'
  | 'Binary Search'
  | 'Tries & Heaps';

export interface DsaQuestion {
  id: string;
  title: string;
  difficulty: DsaDifficulty;
  pattern: DsaPattern;
  platform: 'LeetCode' | 'Codeforces' | 'GFG';
  status: 'solved' | 'review_needed' | 'unsolved';
  solvedDate?: string;
  notes?: string;
  isFavorite?: boolean;
  mistakeTakeaways?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
}

export type CareerStage = 'wishlist' | 'applied' | 'oa' | 'technical' | 'hr' | 'offer' | 'rejected';

export interface InterviewRound {
  id: string;
  roundName: string;
  date?: string;
  feedback?: string;
  passed?: boolean;
}

export interface CareerCompany {
  id: string;
  companyName: string;
  role: string;
  applicationDate: string;
  stage: CareerStage;
  ctcRange?: string;
  location?: string;
  jobUrl?: string;
  resumeVersionUsed?: string;
  notes?: string;
  interviewRounds: InterviewRound[];
}

export interface DailyGoal {
  id: string;
  text: string;
  completed: boolean;
  tag?: string;
}

export interface DailyPlan {
  date: string; // YYYY-MM-DD
  morningPriorities: DailyGoal[];
  deepWorkTargetMinutes: number;
  deepWorkLoggedMinutes: number;
  eveningReflection: {
    wins: string[];
    mistakes: string[];
    energyLevel: 1 | 2 | 3 | 4 | 5;
    focusLevel: 1 | 2 | 3 | 4 | 5;
    notes?: string;
  };
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  type: 'commit' | 'task' | 'dsa' | 'assignment' | 'milestone' | 'reflection';
  title: string;
  subtitle?: string;
  metadata?: Record<string, string>;
}

export interface KnowledgeNode {
  id: string;
  label: string;
  type: 'mission' | 'project' | 'skill' | 'subject' | 'company' | 'goal';
  group?: string;
  details?: string;
}

export interface KnowledgeEdge {
  id: string;
  source: string;
  target: string;
  relation: string;
}

export interface FocusModeState {
  isActive: boolean;
  activeTaskId: string | null;
  activeTaskTitle: string;
  timerRemainingSeconds: number;
  isTimerRunning: boolean;
  targetMinutes: number;
}
