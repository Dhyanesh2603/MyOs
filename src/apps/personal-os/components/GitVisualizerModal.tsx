import React, { useState, useMemo } from 'react';
import {
  GitBranch,
  GitCommit,
  FileCode,
  Copy,
  Check,
  X,
  User,
  Filter,
  ChevronRight,
} from 'lucide-react';
import type { Project, GitCommitRecord, FileDiff } from '@core/personal-os/types';
import { soundEngine } from '@core/audio/soundEngine';

interface GitVisualizerModalProps {
  project: Project;
  initialCommitHash?: string;
  onClose: () => void;
}

function generateDefaultDiffs(commit: GitCommitRecord, project: Project): FileDiff[] {
  if (commit.diffs && commit.diffs.length > 0) return commit.diffs;

  const msg = commit.message.toLowerCase();

  if (msg.includes('terminal') || msg.includes('pipe') || msg.includes('shell')) {
    return [
      {
        filename: 'src/apps/terminal/shell.ts',
        additions: 48,
        deletions: 9,
        status: 'modified',
        lines: [
          { type: 'context', oldLine: 12, newLine: 12, content: 'export interface ShellResult {' },
          { type: 'context', oldLine: 13, newLine: 13, content: '  output: string;' },
          { type: 'context', oldLine: 14, newLine: 14, content: '  newCwd?: string;' },
          { type: 'context', oldLine: 15, newLine: 15, content: '}' },
          { type: 'add', newLine: 16, content: '+// Split pipeline by unquoted pipe characters' },
          { type: 'add', newLine: 17, content: '+function splitPipeline(input: string): string[] {' },
          { type: 'add', newLine: 18, content: '+  return input.split("|").map((s) => s.trim()).filter(Boolean);' },
          { type: 'add', newLine: 19, content: '+}' },
          { type: 'context', oldLine: 16, newLine: 20, content: '' },
          { type: 'delete', oldLine: 17, content: '-  const [cmd, ...args] = trimmed.split(/\\s+/);' },
          { type: 'add', newLine: 21, content: '+  const segments = splitPipeline(trimmed);' },
          { type: 'add', newLine: 22, content: '+  if (segments.length > 1) {' },
          { type: 'add', newLine: 23, content: '+    let piped = (await executeCommand(segments[0], cwd)).output;' },
          { type: 'add', newLine: 24, content: '+    for (let i = 1; i < segments.length; i++) {' },
          { type: 'add', newLine: 25, content: '+      piped = applyFilter(piped, segments[i]);' },
          { type: 'add', newLine: 26, content: '+    }' },
          { type: 'add', newLine: 27, content: '+    return { output: piped };' },
          { type: 'add', newLine: 28, content: '+  }' },
        ],
      },
      {
        filename: 'src/apps/terminal/index.tsx',
        additions: 32,
        deletions: 2,
        status: 'modified',
        lines: [
          { type: 'context', oldLine: 104, newLine: 104, content: '    } else if (e.key === "ArrowDown") {' },
          { type: 'context', oldLine: 105, newLine: 105, content: '      e.preventDefault();' },
          { type: 'add', newLine: 106, content: '+    } else if (e.key === "Tab") {' },
          { type: 'add', newLine: 107, content: '+      e.preventDefault();' },
          { type: 'add', newLine: 108, content: '+      const matches = COMMAND_SUGGESTIONS.filter((c) => c.startsWith(prefix));' },
          { type: 'add', newLine: 109, content: '+      if (matches.length === 1) setInputVal(matches[0] + " ");' },
          { type: 'add', newLine: 110, content: '+    }' },
        ],
      },
    ];
  }

  if (msg.includes('split') || msg.includes('window') || msg.includes('tiling')) {
    return [
      {
        filename: 'src/core/window/splitScreenStore.ts',
        additions: 68,
        deletions: 0,
        status: 'added',
        lines: [
          { type: 'add', newLine: 1, content: '+import { create } from "zustand";' },
          { type: 'add', newLine: 2, content: '+export interface SplitScreenState {' },
          { type: 'add', newLine: 3, content: '+  isEnabled: boolean;' },
          { type: 'add', newLine: 4, content: '+  leftWindowId: string | null;' },
          { type: 'add', newLine: 5, content: '+  rightWindowId: string | null;' },
          { type: 'add', newLine: 6, content: '+  splitRatio: number;' },
          { type: 'add', newLine: 7, content: '+  enableSplit: (left: string, right: string) => void;' },
          { type: 'add', newLine: 8, content: '+  updateRatio: (ratio: number) => void;' },
          { type: 'add', newLine: 9, content: '+}' },
        ],
      },
      {
        filename: 'src/shell/window/SplitScreenDivider.tsx',
        additions: 54,
        deletions: 0,
        status: 'added',
        lines: [
          { type: 'add', newLine: 1, content: '+export const SplitScreenDivider: React.FC = () => {' },
          { type: 'add', newLine: 2, content: '+  const { isEnabled, splitRatio, updateRatio } = useSplitScreenStore();' },
          { type: 'add', newLine: 3, content: '+  return (' },
          { type: 'add', newLine: 4, content: '+    <div className="absolute top-8 bottom-0 w-1.5 cursor-col-resize bg-border-subtle" />' },
          { type: 'add', newLine: 5, content: '+  );' },
          { type: 'add', newLine: 6, content: '+};' },
        ],
      },
    ];
  }

  if (msg.includes('sound') || msg.includes('ambient') || msg.includes('audio')) {
    return [
      {
        filename: 'src/core/audio/ambientSoundEngine.ts',
        additions: 44,
        deletions: 3,
        status: 'modified',
        lines: [
          { type: 'context', oldLine: 45, newLine: 45, content: 'export type AmbientTrack =' },
          { type: 'context', oldLine: 46, newLine: 46, content: '  | "rain" | "campfire" | "white_noise" | "deep_space"' },
          { type: 'add', newLine: 47, content: '+  | "brown_noise" | "server_room" | "gamma_waves";' },
          { type: 'context', oldLine: 47, newLine: 48, content: '' },
          { type: 'add', newLine: 49, content: '+// Brownian motion noise generator' },
          { type: 'add', newLine: 50, content: '+createBrownNoiseNode(): AudioNode {' },
          { type: 'add', newLine: 51, content: '+  const bufferSize = this.ctx.sampleRate * 2;' },
          { type: 'add', newLine: 52, content: '+  let lastOut = 0.0;' },
          { type: 'add', newLine: 53, content: '+}' },
        ],
      },
    ];
  }

  if (msg.includes('spotlight') || msg.includes('dev') || msg.includes('calculator')) {
    return [
      {
        filename: 'src/core/spotlight/evaluator.ts',
        additions: 76,
        deletions: 0,
        status: 'added',
        lines: [
          { type: 'add', newLine: 1, content: '+export function evaluateSpotlightQuery(query: string) {' },
          { type: 'add', newLine: 2, content: '+  if (query.startsWith("/deepwork")) return handleDeepWork();' },
          { type: 'add', newLine: 3, content: '+  if (query.startsWith("base64 ")) return handleBase64(query.slice(7));' },
          { type: 'add', newLine: 4, content: '+  if (query === "uuid") return crypto.randomUUID();' },
          { type: 'add', newLine: 5, content: '+  if (query.endsWith("px")) return handleUnitConversion(query);' },
          { type: 'add', newLine: 6, content: '+}' },
        ],
      },
    ];
  }

  // Generic fallback
  return [
    {
      filename: `${project.name.toLowerCase().replace(/\s+/g, '-')}/src/index.ts`,
      additions: 21,
      deletions: 5,
      status: 'modified',
      lines: [
        { type: 'context', oldLine: 1, newLine: 1, content: '// Core engine pipeline' },
        { type: 'context', oldLine: 2, newLine: 2, content: 'export const VERSION = "0.4.0";' },
        { type: 'delete', oldLine: 3, content: '-export function dispatch(event: string): void;' },
        { type: 'add', newLine: 3, content: '+export function dispatch(event: string, payload?: unknown): void;' },
        { type: 'add', newLine: 4, content: `+// ${commit.message}` },
        { type: 'add', newLine: 5, content: `+export const CURRENT_COMMIT = "${commit.hash}";` },
        { type: 'context', oldLine: 4, newLine: 6, content: 'export * from "./types";' },
      ],
    },
  ];
}

export const GitVisualizerModal: React.FC<GitVisualizerModalProps> = ({
  project,
  initialCommitHash,
  onClose,
}) => {
  const commits = useMemo(() => {
    return project.recentCommits && project.recentCommits.length > 0
      ? project.recentCommits
      : [
          {
            hash: '0c82376',
            message: 'feat(terminal): add Unix-style pipes, tree visualizer, and path autocomplete',
            date: '2026-09-21',
            branch: 'main',
            author: 'Dhyanesh',
          },
          {
            hash: '7e3ac6d',
            message: 'feat(window): implement Arc-style interactive split-screen tiling with synchronized divider',
            date: '2026-09-19',
            branch: 'feat/split-screen',
            author: 'Dhyanesh',
          },
          {
            hash: '869aee1',
            message: 'feat(audio): implement deep work ambient soundscape engine with 7 procedural tracks',
            date: '2026-09-19',
            branch: 'feat/ambient-audio',
            author: 'Dhyanesh',
          },
          {
            hash: '050413f',
            message: 'feat(spotlight): implement developer tools and unit converters in command palette',
            date: '2026-09-19',
            branch: 'feat/spotlight-dev',
            author: 'Dhyanesh',
          },
        ];
  }, [project.recentCommits]);

  const [selectedHash, setSelectedHash] = useState<string>(
    initialCommitHash || commits[0]?.hash || ''
  );
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'unified' | 'split'>('unified');
  const [copied, setCopied] = useState(false);
  const [activeFileIndex, setActiveFileIndex] = useState(0);

  const branches = useMemo(() => {
    const list = new Set<string>();
    commits.forEach((c) => {
      if (c.branch) list.add(c.branch);
    });
    list.add('main');
    return ['all', ...Array.from(list)];
  }, [commits]);

  const filteredCommits = useMemo(() => {
    if (selectedBranch === 'all') return commits;
    return commits.filter((c) => (c.branch || 'main') === selectedBranch);
  }, [commits, selectedBranch]);

  const activeCommit = useMemo(() => {
    return commits.find((c) => c.hash === selectedHash) || commits[0];
  }, [commits, selectedHash]);

  const diffs = useMemo(() => {
    if (!activeCommit) return [];
    return generateDefaultDiffs(activeCommit, project);
  }, [activeCommit, project]);

  const activeFileDiff = diffs[activeFileIndex] || diffs[0];

  const totalAdditions = diffs.reduce((sum, d) => sum + d.additions, 0);
  const totalDeletions = diffs.reduce((sum, d) => sum + d.deletions, 0);

  const handleCopyDiff = () => {
    if (!activeFileDiff) return;
    const raw = activeFileDiff.lines
      .map((l) => {
        if (l.type === 'add') return l.content.startsWith('+') ? l.content : `+${l.content}`;
        if (l.type === 'delete') return l.content.startsWith('-') ? l.content : `-${l.content}`;
        return ` ${l.content}`;
      })
      .join('\n');
    navigator.clipboard.writeText(raw);
    setCopied(true);
    soundEngine.playClick();
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="flex h-[88vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/15 bg-neutral-900 shadow-2xl">
        {/* 1. Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-white/10 bg-neutral-950/80 px-5 py-3 select-none">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
              <GitBranch className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-white">Git Visualizer & Code Diff</span>
                <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-[10px] text-neutral-300">
                  {project.name}
                </span>
                <span className="flex items-center gap-1 rounded bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  synced
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 2. Main Two-Column Layout */}
        <div className="grid flex-1 grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Left Column: Branch & Commit Graph (4 cols) */}
          <div className="md:col-span-5 flex flex-col border-r border-white/10 bg-neutral-950/40">
            {/* Branch Filter Tabs */}
            <div className="flex items-center gap-1 border-b border-white/10 p-3 overflow-x-auto">
              <Filter className="h-3 w-3 text-neutral-500 ml-1 mr-1 shrink-0" />
              {branches.map((b) => (
                <button
                  key={b}
                  onClick={() => {
                    soundEngine.playClick();
                    setSelectedBranch(b);
                  }}
                  className={`rounded-lg px-2.5 py-1 font-mono text-[11px] whitespace-nowrap transition-all ${
                    selectedBranch === b
                      ? 'bg-white/15 text-white font-medium shadow-sm'
                      : 'text-neutral-400 hover:bg-white/5 hover:text-neutral-200'
                  }`}
                >
                  {b === 'all' ? 'All Branches' : b}
                </button>
              ))}
            </div>

            {/* Commit Graph Feed */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {filteredCommits.map((c, index) => {
                const isSelected = activeCommit?.hash === c.hash;
                const isHead = index === 0;

                return (
                  <div
                    key={c.hash}
                    onClick={() => {
                      soundEngine.playClick();
                      setSelectedHash(c.hash);
                      setActiveFileIndex(0);
                    }}
                    className={`group relative flex items-start gap-3 rounded-xl border p-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500/50 bg-emerald-500/10 shadow-md'
                        : 'border-white/5 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                    }`}
                  >
                    {/* Visual Commit Node & Connecting Line */}
                    <div className="relative flex flex-col items-center self-stretch">
                      <div
                        className={`h-3 w-3 rounded-full border-2 mt-1 transition-all ${
                          isSelected
                            ? 'border-emerald-400 bg-emerald-500 scale-110 shadow-sm shadow-emerald-500/50'
                            : 'border-neutral-500 bg-neutral-800 group-hover:border-neutral-300'
                        }`}
                      />
                      {index < filteredCommits.length - 1 && (
                        <div className="w-0.5 flex-1 bg-white/10 my-1" />
                      )}
                    </div>

                    {/* Commit Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] font-bold text-white">
                            {c.hash}
                          </span>
                          {isHead && (
                            <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 font-mono text-[9px] uppercase tracking-wider text-emerald-400">
                              HEAD
                            </span>
                          )}
                          <span className="rounded bg-white/10 px-1.5 py-0.2 font-mono text-[9px] text-neutral-400">
                            {c.branch || 'main'}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-neutral-500">{c.date}</span>
                      </div>

                      <div className="mt-1 text-xs text-neutral-200 leading-snug line-clamp-2">
                        {c.message}
                      </div>

                      <div className="mt-2 flex items-center gap-3 text-[10px] font-mono text-neutral-400">
                        <span className="flex items-center gap-1">
                          <User className="h-2.5 w-2.5" />
                          {c.author || 'Dhyanesh'}
                        </span>
                      </div>
                    </div>

                    <ChevronRight
                      className={`h-4 w-4 shrink-0 transition-all ${
                        isSelected ? 'text-emerald-400 translate-x-0.5' : 'text-neutral-600 opacity-0 group-hover:opacity-100'
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Interactive Code Diff Viewer (7 cols) */}
          <div className="md:col-span-7 flex flex-col bg-neutral-950/70 overflow-hidden">
            {activeCommit ? (
              <>
                {/* Diff Header */}
                <div className="flex flex-col gap-2 border-b border-white/10 bg-neutral-900/90 p-4 select-none">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <GitCommit className="h-4 w-4 text-emerald-400" />
                        <span className="font-mono text-xs font-semibold text-white">
                          commit {activeCommit.hash}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-200 font-medium mt-1">
                        {activeCommit.message}
                      </p>
                    </div>

                    {/* View mode toggle & copy */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center rounded-lg border border-white/10 bg-white/5 p-0.5">
                        <button
                          onClick={() => {
                            soundEngine.playClick();
                            setViewMode('unified');
                          }}
                          className={`rounded px-2 py-1 text-[10px] font-mono transition-colors ${
                            viewMode === 'unified'
                              ? 'bg-white/15 text-white font-bold'
                              : 'text-neutral-400 hover:text-white'
                          }`}
                        >
                          Unified
                        </button>
                        <button
                          onClick={() => {
                            soundEngine.playClick();
                            setViewMode('split');
                          }}
                          className={`rounded px-2 py-1 text-[10px] font-mono transition-colors ${
                            viewMode === 'split'
                              ? 'bg-white/15 text-white font-bold'
                              : 'text-neutral-400 hover:text-white'
                          }`}
                        >
                          Split
                        </button>
                      </div>

                      <button
                        onClick={handleCopyDiff}
                        className="flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-mono text-neutral-300 hover:bg-white/10 hover:text-white transition-colors"
                        title="Copy Diff Patch"
                      >
                        {copied ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Copy Diff</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Summary Bar */}
                  <div className="flex items-center gap-4 text-[11px] font-mono text-neutral-400 pt-1">
                    <span>
                      {diffs.length} {diffs.length === 1 ? 'file' : 'files'} changed
                    </span>
                    <span className="text-emerald-400">+{totalAdditions} additions</span>
                    <span className="text-rose-400">-{totalDeletions} deletions</span>
                  </div>
                </div>

                {/* File Selector Tabs */}
                {diffs.length > 1 && (
                  <div className="flex items-center gap-1 border-b border-white/10 bg-neutral-950/80 px-3 py-1.5 overflow-x-auto">
                    {diffs.map((d, i) => (
                      <button
                        key={d.filename}
                        onClick={() => {
                          soundEngine.playClick();
                          setActiveFileIndex(i);
                        }}
                        className={`flex items-center gap-2 rounded-md px-2.5 py-1 text-[11px] font-mono transition-colors ${
                          activeFileIndex === i
                            ? 'bg-white/15 text-white font-medium'
                            : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <FileCode className="h-3 w-3 text-emerald-400" />
                        <span>{d.filename.split('/').pop()}</span>
                        <span className="text-[10px] text-emerald-400">+{d.additions}</span>
                        <span className="text-[10px] text-rose-400">-{d.deletions}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Diff Viewer Body */}
                <div className="flex-1 overflow-auto font-mono text-xs select-text p-4">
                  {activeFileDiff && (
                    <div className="rounded-xl border border-white/10 bg-neutral-950/90 overflow-hidden shadow-inner">
                      {/* File Card Header */}
                      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs text-neutral-300">
                        <div className="flex items-center gap-2 truncate">
                          <FileCode className="h-3.5 w-3.5 text-neutral-400" />
                          <span className="font-semibold text-white truncate">
                            {activeFileDiff.filename}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 font-mono text-[10px]">
                          <span className="text-emerald-400 font-bold">
                            +{activeFileDiff.additions}
                          </span>
                          <span className="text-rose-400 font-bold">
                            -{activeFileDiff.deletions}
                          </span>
                        </div>
                      </div>

                      {/* Diff Lines Table */}
                      <div className="overflow-x-auto divide-y divide-white/[0.03]">
                        {activeFileDiff.lines.map((line, idx) => {
                          if (viewMode === 'split') {
                            const isAdd = line.type === 'add';
                            const isDelete = line.type === 'delete';

                            return (
                              <div
                                key={idx}
                                className={`grid grid-cols-2 text-[11px] font-mono leading-relaxed transition-colors ${
                                  isAdd
                                    ? 'bg-emerald-500/10 hover:bg-emerald-500/15'
                                    : isDelete
                                    ? 'bg-rose-500/10 hover:bg-rose-500/15'
                                    : 'hover:bg-white/[0.02]'
                                }`}
                              >
                                {/* Left half: Old */}
                                <div className="flex border-r border-white/5 pr-2">
                                  <span className="w-10 select-none text-right pr-2 text-[10px] text-neutral-600">
                                    {line.oldLine ?? ''}
                                  </span>
                                  <span className="flex-1 truncate pl-1 text-neutral-400">
                                    {isDelete ? line.content : !isAdd ? line.content : ''}
                                  </span>
                                </div>

                                {/* Right half: New */}
                                <div className="flex pl-2">
                                  <span className="w-10 select-none text-right pr-2 text-[10px] text-neutral-600">
                                    {line.newLine ?? ''}
                                  </span>
                                  <span
                                    className={`flex-1 truncate pl-1 ${
                                      isAdd ? 'text-emerald-300 font-medium' : 'text-neutral-300'
                                    }`}
                                  >
                                    {isAdd ? line.content : !isDelete ? line.content : ''}
                                  </span>
                                </div>
                              </div>
                            );
                          }

                          // Unified View
                          const isAdd = line.type === 'add';
                          const isDelete = line.type === 'delete';

                          return (
                            <div
                              key={idx}
                              className={`flex items-center text-[11px] font-mono leading-relaxed transition-colors ${
                                isAdd
                                  ? 'bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-300'
                                  : isDelete
                                  ? 'bg-rose-500/10 hover:bg-rose-500/15 text-rose-300'
                                  : 'hover:bg-white/[0.02] text-neutral-300'
                              }`}
                            >
                              <span className="w-10 select-none text-right pr-2 text-[10px] text-neutral-600">
                                {line.oldLine ?? ''}
                              </span>
                              <span className="w-10 select-none text-right pr-2 text-[10px] text-neutral-600">
                                {line.newLine ?? ''}
                              </span>
                              <span className="w-6 select-none text-center font-bold">
                                {isAdd ? '+' : isDelete ? '-' : ' '}
                              </span>
                              <pre className="flex-1 overflow-x-auto whitespace-pre font-mono">
                                {line.content}
                              </pre>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center text-xs text-neutral-500 font-mono">
                Select a commit from the graph to inspect changes.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
