import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Flag, Bomb, Timer } from 'lucide-react';
import type { AppManifest, AppProps } from '@contracts/app';
import { soundEngine } from '@core/audio/soundEngine';

interface Cell {
  r: number;
  c: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
}

const ROWS = 9;
const COLS = 9;
const MINES_COUNT = 10;

function createEmptyGrid(): Cell[][] {
  const grid: Cell[][] = [];
  for (let r = 0; r < ROWS; r++) {
    const row: Cell[] = [];
    for (let c = 0; c < COLS; c++) {
      row.push({
        r,
        c,
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0,
      });
    }
    grid.push(row);
  }
  return grid;
}

function plantMines(grid: Cell[][], safeR: number, safeC: number): Cell[][] {
  const newGrid = grid.map((row) => row.map((cell) => ({ ...cell })));
  let planted = 0;

  while (planted < MINES_COUNT) {
    const r = Math.floor(Math.random() * ROWS);
    const c = Math.floor(Math.random() * COLS);

    // Skip safe cell & its immediate neighbors on first click
    if (Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1) continue;
    if (newGrid[r]![c]!.isMine) continue;

    newGrid[r]![c]!.isMine = true;
    planted++;
  }

  // Calculate neighbor numbers
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (newGrid[r]![c]!.isMine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
            if (newGrid[nr]![nc]!.isMine) count++;
          }
        }
      }
      newGrid[r]![c]!.neighborMines = count;
    }
  }

  return newGrid;
}

export const FlowSweeperApp: React.FC<AppProps> = () => {
  const [grid, setGrid] = useState<Cell[][]>(createEmptyGrid);
  const [isFirstClick, setIsFirstClick] = useState(true);
  const [status, setStatus] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');
  const [face, setFace] = useState<'🙂' | '😮' | '😎' | '💀'>('🙂');
  const [flagsRemaining, setFlagsRemaining] = useState(MINES_COUNT);
  const [seconds, setSeconds] = useState(0);

  // Timer
  useEffect(() => {
    if (status !== 'playing') return;
    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  const resetGame = () => {
    soundEngine.playClick();
    setGrid(createEmptyGrid());
    setIsFirstClick(true);
    setStatus('idle');
    setFace('🙂');
    setFlagsRemaining(MINES_COUNT);
    setSeconds(0);
  };

  const revealCell = useCallback(
    (r: number, c: number) => {
      if (status === 'lost' || status === 'won') return;

      let currentGrid = grid;
      if (isFirstClick) {
        currentGrid = plantMines(grid, r, c);
        setIsFirstClick(false);
        setStatus('playing');
      }

      const target = currentGrid[r]![c]!;
      if (target.isRevealed || target.isFlagged) return;

      soundEngine.playClick();

      // Hit a mine!
      if (target.isMine) {
        soundEngine.playSnap();
        const lostGrid = currentGrid.map((row) =>
          row.map((cell) => ({
            ...cell,
            isRevealed: cell.isMine ? true : cell.isRevealed,
          }))
        );
        setGrid(lostGrid);
        setStatus('lost');
        setFace('💀');
        return;
      }

      // Flood fill reveal
      const newGrid = currentGrid.map((row) => row.map((cell) => ({ ...cell })));
      const queue: [number, number][] = [[r, c]];
      newGrid[r]![c]!.isRevealed = true;

      while (queue.length > 0) {
        const [currR, currC] = queue.shift()!;
        const curr = newGrid[currR]![currC]!;

        if (curr.neighborMines === 0) {
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = currR + dr;
              const nc = currC + dc;
              if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
                const neighbor = newGrid[nr]![nc]!;
                if (!neighbor.isRevealed && !neighbor.isFlagged && !neighbor.isMine) {
                  neighbor.isRevealed = true;
                  if (neighbor.neighborMines === 0) {
                    queue.push([nr, nc]);
                  }
                }
              }
            }
          }
        }
      }

      // Check win condition: all non-mine cells revealed
      let nonMinesUnrevealed = 0;
      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          if (!newGrid[row]![col]!.isMine && !newGrid[row]![col]!.isRevealed) {
            nonMinesUnrevealed++;
          }
        }
      }

      if (nonMinesUnrevealed === 0) {
        soundEngine.playSnap();
        setStatus('won');
        setFace('😎');
      }

      setGrid(newGrid);
    },
    [grid, isFirstClick, status]
  );

  const toggleFlag = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (status === 'lost' || status === 'won') return;
    const target = grid[r]![c]!;
    if (target.isRevealed) return;

    soundEngine.playClick();
    const newGrid = grid.map((row) => row.map((cell) => ({ ...cell })));
    const willFlag = !target.isFlagged;
    newGrid[r]![c]!.isFlagged = willFlag;

    setGrid(newGrid);
    setFlagsRemaining((prev) => (willFlag ? prev - 1 : prev + 1));
  };

  const getNumberColor = (num: number) => {
    switch (num) {
      case 1:
        return 'text-blue-400';
      case 2:
        return 'text-emerald-400';
      case 3:
        return 'text-rose-400';
      case 4:
        return 'text-indigo-400';
      case 5:
        return 'text-amber-400';
      case 6:
        return 'text-cyan-400';
      default:
        return 'text-content-primary';
    }
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-between p-4 bg-surface-panel text-content-primary select-none overflow-y-auto">
      {/* Top Telemetry Header */}
      <div className="flex w-full max-w-[280px] items-center justify-between rounded-xl border border-border-subtle bg-surface-card p-2.5 shadow-xs">
        {/* Flag counter */}
        <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-rose-400">
          <Bomb className="h-3.5 w-3.5" />
          <span>{String(flagsRemaining).padStart(2, '0')}</span>
        </div>

        {/* Status Smiley Face Button */}
        <button
          onClick={resetGame}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-border-subtle bg-surface-subtle text-lg hover:scale-105 active:scale-95 transition-all shadow-xs"
        >
          {face}
        </button>

        {/* Timer */}
        <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-content-primary">
          <Timer className="h-3.5 w-3.5 text-accent-primary" />
          <span>{String(Math.min(seconds, 999)).padStart(3, '0')}</span>
        </div>
      </div>

      {/* Grid surface */}
      <motion.div animate={status === "lost" ? { x: [-6, 6, -5, 5, -2, 2, 0] } : undefined} transition={{ duration: 0.4 }} className="my-auto rounded-2xl border border-border-subtle bg-surface-card/60 p-2 shadow-inner">
        <div
          className="grid gap-1"
          style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => {
              const isCellRevealed = cell.isRevealed;

              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => revealCell(r, c)}
                  onContextMenu={(e) => toggleFlag(e, r, c)}
                  onMouseDown={() => {
                    if (status !== 'lost' && status !== 'won') setFace('😮');
                  }}
                  onMouseUp={() => {
                    if (status !== 'lost' && status !== 'won') setFace('🙂');
                  }}
                  className={`flex h-7 w-7 items-center justify-center rounded-lg font-mono text-xs font-bold transition-all ${
                    isCellRevealed
                      ? cell.isMine
                        ? 'bg-rose-500/20 border border-rose-500/40 text-rose-400'
                        : 'bg-surface-subtle/50 border border-border-subtle/40'
                      : 'bg-surface-subtle border border-border-subtle hover:border-accent-primary/40 active:bg-surface-hover shadow-xs'
                  }`}
                >
                  {isCellRevealed ? (
                    cell.isMine ? (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 20 }}>
                        <Bomb className="h-3.5 w-3.5 text-rose-400" />
                      </motion.div>
                    ) : cell.neighborMines > 0 ? (
                      <motion.span
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 450, damping: 22 }}
                        className={getNumberColor(cell.neighborMines)}
                      >
                        {cell.neighborMines}
                      </motion.span>
                    ) : null
                  ) : cell.isFlagged ? (
                    <motion.div initial={{ scale: 0, y: -6 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 20 }}>
                      <Flag className="h-3.5 w-3.5 text-amber-400 fill-amber-400/20" />
                    </motion.div>
                  ) : null}
                </button>
              );
            })
          )}
        </div>
      </motion.div>

      {/* Footer info */}
      <div className="flex items-center justify-between w-full max-w-[280px] font-mono text-[9px] text-content-tertiary">
        <span>Left Click: Reveal</span>
        <span>Right Click: Flag</span>
      </div>
    </div>
  );
};

export const flowSweeperManifest: AppManifest = {
  id: 'retro-sweeper',
  name: 'Onyx Sweeper',
  description: 'Minimalist tactile Minesweeper with classic logic, safe first clicks, and clean geometry.',
  category: 'games',
  icon: Bomb,
  defaultSize: { width: 340, height: 440 },
  constraints: { minWidth: 300, minHeight: 400, maxWidth: 460, maxHeight: 600 },
  allowMultipleInstances: false,
  permissions: ['audio'],
  component: FlowSweeperApp,
};
