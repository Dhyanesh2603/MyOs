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
    <div className="flex h-full w-full flex-col bg-[#060913] text-white select-none overflow-hidden font-sans">
      {/* Top Engineering App Bar (High-Contrast Redesign) */}
      <div className="z-20 flex h-14 items-center justify-between border-b-2 border-indigo-900/80 bg-[#090f20]/95 px-4 backdrop-blur-2xl shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-400 to-indigo-600 text-black shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            <Compass className="h-4.5 w-4.5 stroke-[2.5]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-black tracking-tight text-white drop-shadow">Flow Personal OS</span>
            <span className="rounded-full bg-cyan-500/20 border border-cyan-400/50 px-2 py-0.2 font-mono text-[9px] font-black uppercase tracking-wider text-cyan-300">
              v2.5 High-Contrast
            </span>
          </div>
        </div>

        {/* Global Tab Navigation (Vibrant contrast pills) */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
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
                className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 text-black font-black shadow-[0_0_20px_rgba(6,182,212,0.5)] scale-102'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="h-3.5 w-3.5 stroke-[2.5]" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Focus Button (Vivid glowing amber) */}
        <button
          onClick={() => {
            soundEngine.playClick();
            startFocusMode('Deep Engineering Focus Block', 25);
          }}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2 text-xs font-black text-black shadow-[0_0_20px_rgba(245,158,11,0.5)] hover:scale-105 active:scale-95 transition-all"
        >
          <Zap className="h-3.5 w-3.5 fill-black stroke-black" />
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
  defaultSize: { width: 1180, height: 740 },
  constraints: { minWidth: 760, minHeight: 520, maxWidth: 1920, maxHeight: 1200 },
  allowMultipleInstances: false,
  permissions: ['notifications', 'audio'],
  component: PersonalOsApp,
};
