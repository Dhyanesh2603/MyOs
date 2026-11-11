import React from 'react';
import {
  Compass,
  Zap,
  FolderGit2,
  GraduationCap,
  Code2,
  Briefcase,
  Calendar,
  Network,
  CheckSquare,
} from 'lucide-react';
import type { AppManifest, AppProps } from '@contracts/app';
import { usePersonalOsStore, PersonalOsTab } from '@core/personal-os/personalOsStore';
import { soundEngine } from '@core/audio/soundEngine';

import { HomeMomentumView } from './views/HomeMomentumView';
import { TasksTodosView } from './views/TasksTodosView';
import { MissionsView } from './views/MissionsView';
import { ProjectsView } from './views/ProjectsView';
import { AcademicsView } from './views/AcademicsView';
import { LearningDsaView } from './views/LearningDsaView';
import { CareerView } from './views/CareerView';
import { DailyTimelineView } from './views/DailyTimelineView';
import { KnowledgeGraphView } from './views/KnowledgeGraphView';

const NAV_TABS: { id: PersonalOsTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'home', label: 'Momentum', icon: Compass },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'missions', label: 'Missions', icon: Zap },
  { id: 'projects', label: 'Projects', icon: FolderGit2 },
  { id: 'academics', label: 'Academics', icon: GraduationCap },
  { id: 'learning', label: 'DSA & Skills', icon: Code2 },
  { id: 'career', label: 'Career', icon: Briefcase },
  { id: 'daily', label: 'Daily & Log', icon: Calendar },
  { id: 'graph', label: 'Brain Graph', icon: Network },
];

export const PersonalOsApp: React.FC<AppProps> = () => {
  const { activeTab, setActiveTab, startFocusMode } = usePersonalOsStore();

  return (
    <div className="flex h-full w-full flex-col bg-[#0a0b10] text-neutral-100 select-none overflow-hidden font-sans">
      {/* Top Artisanal App Bar (Opus 5.5 High-Contrast Minimalist) */}
      <div className="z-20 flex h-13 items-center justify-between border-b border-white/[0.08] bg-[#11131c]/90 px-5 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 border border-white/15 text-white">
            <Compass className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-semibold tracking-tight text-white">Personal OS</span>
            <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[9px] font-medium tracking-widest text-neutral-400 uppercase">
              Executive
            </span>
          </div>
        </div>

        {/* Global Segmented Tab Navigation */}
        <div className="flex items-center gap-1 rounded-xl bg-white/[0.04] border border-white/[0.06] p-1 overflow-x-auto scrollbar-none">
          {NAV_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  soundEngine.playClick();
                  setActiveTab(tab.id);
                }}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'text-neutral-400 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Focus Action */}
        <button
          onClick={() => {
            soundEngine.playClick();
            startFocusMode('Deep Engineering Focus Block', 25);
          }}
          className="flex items-center gap-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 px-3.5 py-1.5 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
        >
          <Zap className="h-3.5 w-3.5 fill-current" />
          <span>Focus Mode</span>
        </button>
      </div>

      {/* Main Content Router */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'home' && <HomeMomentumView />}
        {activeTab === 'tasks' && <TasksTodosView />}
        {activeTab === 'missions' && <MissionsView />}
        {activeTab === 'projects' && <ProjectsView />}
        {activeTab === 'academics' && <AcademicsView />}
        {activeTab === 'learning' && <LearningDsaView />}
        {activeTab === 'career' && <CareerView />}
        {(activeTab === 'daily' || activeTab === 'timeline') && <DailyTimelineView />}
        {activeTab === 'graph' && <KnowledgeGraphView />}
      </div>
    </div>
  );
};

export const personalOsManifest: AppManifest = {
  id: 'personal-os',
  name: 'Personal OS',
  description: 'Onyx OS v2 engineering command hub answering "What should I work on next?" with missions, projects, and academics.',
  category: 'productivity',
  icon: Compass,
  defaultSize: { width: 1180, height: 740 },
  constraints: { minWidth: 760, minHeight: 520, maxWidth: 1920, maxHeight: 1200 },
  allowMultipleInstances: false,
  permissions: ['notifications', 'audio'],
  component: PersonalOsApp,
};
