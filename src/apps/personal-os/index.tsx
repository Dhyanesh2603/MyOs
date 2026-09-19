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
} from 'lucide-react';
import type { AppManifest, AppProps } from '@contracts/app';
import { usePersonalOsStore, PersonalOsTab } from '@core/personal-os/personalOsStore';
import { soundEngine } from '@core/audio/soundEngine';

import { HomeMomentumView } from './views/HomeMomentumView';
import { MissionsView } from './views/MissionsView';
import { ProjectsView } from './views/ProjectsView';
import { AcademicsView } from './views/AcademicsView';
import { LearningDsaView } from './views/LearningDsaView';
import { CareerView } from './views/CareerView';
import { DailyTimelineView } from './views/DailyTimelineView';
import { KnowledgeGraphView } from './views/KnowledgeGraphView';

const NAV_TABS: { id: PersonalOsTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'home', label: 'Momentum', icon: Compass },
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
    <div className="flex h-full w-full flex-col bg-[#0b0f17] text-neutral-100 select-none overflow-hidden font-sans">
      {/* Top Engineering App Bar */}
      <div className="z-20 flex h-12 items-center justify-between border-b border-white/10 bg-[#0f141e]/90 px-4 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-white shadow-inner">
            <Compass className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold tracking-wide text-white">Flow Personal OS</span>
            <span className="rounded bg-white/10 px-1.5 py-0.2 font-mono text-[9px] uppercase tracking-wider text-neutral-300">
              v2.0
            </span>
          </div>
        </div>

        {/* Global Tab Navigation */}
        <div className="flex items-center gap-1 overflow-x-auto">
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
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-mono transition-all ${
                  isActive
                    ? 'bg-white/15 text-white font-medium shadow-sm'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Focus Button */}
        <button
          onClick={() => {
            soundEngine.playClick();
            startFocusMode('Deep Engineering Focus Block', 25);
          }}
          className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-mono font-medium text-white hover:bg-white/20 transition-all shadow-sm"
        >
          <Zap className="h-3.5 w-3.5 fill-white" />
          <span>Focus Mode</span>
        </button>
      </div>

      {/* Main Content Router */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'home' && <HomeMomentumView />}
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
  description: 'Flow OS v2 engineering command hub answering "What should I work on next?" with missions, projects, and academics.',
  category: 'productivity',
  icon: Compass,
  defaultSize: { width: 1060, height: 720 },
  constraints: { minWidth: 760, minHeight: 520, maxWidth: 1920, maxHeight: 1200 },
  allowMultipleInstances: false,
  permissions: ['notifications', 'audio'],
  component: PersonalOsApp,
};
