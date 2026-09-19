import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Trophy, Award, Gamepad2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import type { AppManifest, AppProps } from '@contracts/app';
import { soundEngine } from '@core/audio/soundEngine';

type Board = number[][];

function getEmptyBoard(): Board {
  return [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];
}

function addRandomTile(board: Board): Board {
  const empty: [number, number][] = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r]![c] === 0) empty.push([r, c]);
    }
  }
  if (empty.length === 0) return board;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)]!;
  const newBoard = board.map((row) => [...row]);
  newBoard[r]![c] = Math.random() < 0.9 ? 2 : 4;
  return newBoard;
}

function slideRowLeft(row: number[]): { newRow: number[]; scoreGained: number } {
  const nonZero = row.filter((v) => v !== 0);
  const result: number[] = [];
  let scoreGained = 0;

  for (let i = 0; i < nonZero.length; i++) {
    if (i < nonZero.length - 1 && nonZero[i] === nonZero[i + 1]) {
      const merged = nonZero[i]! * 2;
      result.push(merged);
      scoreGained += merged;
      i++;
    } else {
      result.push(nonZero[i]!);
    }
  }
  while (result.length < 4) result.push(0);
  return { newRow: result, scoreGained };
}

export const Flow2048App: React.FC<AppProps> = () => {
  const [board, setBoard] = useState<Board>(() => {
    let b = getEmptyBoard();
    b = addRandomTile(b);
    b = addRandomTile(b);
    return b;
  });

  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem('flowos_2048_best') || '0', 10);
    } catch {
      return 0;
    }
  });
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const checkGameOver = (b: Board) => {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (b[r]![c] === 0) return false;
        if (c < 3 && b[r]![c] === b[r]![c + 1]) return false;
        if (r < 3 && b[r]![c] === b[r + 1]![c]) return false;
      }
    }
    return true;
  };

  const move = useCallback(
    (direction: 'left' | 'right' | 'up' | 'down') => {
      if (gameOver) return;

      let hasChanged = false;
      let totalScoreGained = 0;
      const newBoard = getEmptyBoard();

      if (direction === 'left' || direction === 'right') {
        for (let r = 0; r < 4; r++) {
          const originalRow = board[r]!;
          const rowToSlide = direction === 'left' ? originalRow : [...originalRow].reverse();
          const { newRow, scoreGained } = slideRowLeft(rowToSlide);
          const finalRow = direction === 'left' ? newRow : newRow.reverse();

          for (let c = 0; c < 4; c++) {
            newBoard[r]![c] = finalRow[c]!;
            if (finalRow[c] !== originalRow[c]) hasChanged = true;
          }
          totalScoreGained += scoreGained;
        }
      } else {
        // Vertical slide
        for (let c = 0; c < 4; c++) {
          const originalCol = [board[0]![c]!, board[1]![c]!, board[2]![c]!, board[3]![c]!];
          const colToSlide = direction === 'up' ? originalCol : [...originalCol].reverse();
          const { newRow, scoreGained } = slideRowLeft(colToSlide);
          const finalCol = direction === 'up' ? newRow : newRow.reverse();

          for (let r = 0; r < 4; r++) {
            newBoard[r]![c] = finalCol[r]!;
            if (finalCol[r] !== originalCol[r]) hasChanged = true;
          }
          totalScoreGained += scoreGained;
        }
      }

      if (hasChanged) {
        soundEngine.playClick();
        if (totalScoreGained > 0) soundEngine.playSnap();

        const withNewTile = addRandomTile(newBoard);
        setBoard(withNewTile);
        const newScore = score + totalScoreGained;
        setScore(newScore);

        if (newScore > bestScore) {
          setBestScore(newScore);
          try {
            localStorage.setItem('flowos_2048_best', String(newScore));
          } catch {}
        }

        // Check 2048 win
        if (!won) {
          for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
              if (withNewTile[r]![c] === 2048) setWon(true);
            }
          }
        }

        if (checkGameOver(withNewTile)) {
          setGameOver(true);
        }
      }
    },
    [board, score, bestScore, gameOver, won]
  );

  const resetGame = () => {
    soundEngine.playClick();
    let b = getEmptyBoard();
    b = addRandomTile(b);
    b = addRandomTile(b);
    setBoard(b);
    setScore(0);
    setGameOver(false);
    setWon(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        if (e.key === 'ArrowLeft') move('left');
        else if (e.key === 'ArrowRight') move('right');
        else if (e.key === 'ArrowUp') move('up');
        else if (e.key === 'ArrowDown') move('down');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  const getTileStyles = (val: number) => {
    if (val === 0) return 'bg-surface-subtle/30 text-transparent border border-border-subtle/30';
    if (val === 2) return 'bg-surface-card text-content-primary border border-border-subtle font-bold';
    if (val === 4) return 'bg-surface-subtle text-content-primary border border-border-subtle font-bold';
    if (val === 8) return 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold';
    if (val === 16) return 'bg-amber-500/40 text-amber-200 border border-amber-500/60 font-bold';
    if (val === 32) return 'bg-orange-500/30 text-orange-200 border border-orange-500/50 font-bold';
    if (val === 64) return 'bg-rose-500/30 text-rose-200 border border-rose-500/50 font-bold';
    if (val === 128) return 'bg-indigo-500/30 text-indigo-200 border border-indigo-500/60 font-bold text-lg';
    if (val === 256) return 'bg-cyan-500/30 text-cyan-200 border border-cyan-500/60 font-bold text-lg';
    if (val === 512) return 'bg-emerald-500/30 text-emerald-200 border border-emerald-500/60 font-bold text-lg';
    if (val >= 1024) return 'bg-amber-400 text-black font-black border border-amber-300 shadow-md text-base';
    return 'bg-accent-primary text-white font-black text-sm';
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-between p-4 bg-surface-panel text-content-primary select-none overflow-y-auto">
      {/* Header telemetry */}
      <div className="flex w-full max-w-xs items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-primary text-white shadow-sm font-bold text-sm">
            2048
          </div>
          <div>
            <h1 className="text-xs font-bold uppercase tracking-wider">Flow 2048</h1>
            <p className="font-mono text-[9px] text-content-tertiary">Join the numbers</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex flex-col items-center rounded-xl border border-border-subtle bg-surface-card px-2 py-1 min-w-[50px]">
            <span className="font-mono text-[8px] uppercase tracking-wider text-content-tertiary">Score</span>
            <span className="font-mono text-xs font-bold text-content-primary">{score}</span>
          </div>

          <div className="flex flex-col items-center rounded-xl border border-border-subtle bg-surface-card px-2 py-1 min-w-[50px]">
            <span className="font-mono text-[8px] uppercase tracking-wider text-amber-400 flex items-center gap-0.5">
              <Trophy className="h-2.5 w-2.5" /> Best
            </span>
            <span className="font-mono text-xs font-bold text-content-primary">{bestScore}</span>
          </div>

          <button
            onClick={resetGame}
            title="Restart Game"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-border-subtle bg-surface-card text-content-secondary hover:bg-surface-subtle hover:text-content-primary transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 4x4 Game Board */}
      <div className="relative my-auto w-full max-w-xs aspect-square rounded-2xl border border-border-subtle bg-surface-card/60 p-2 shadow-inner">
        <div className="grid h-full w-full grid-cols-4 grid-rows-4 gap-2">
          {board.map((row, r) =>
            row.map((val, c) => (
              <motion.div
                key={`${r}-${c}`}
                layout
                className={`flex h-full w-full items-center justify-center rounded-xl font-mono text-xl transition-colors shadow-xs ${getTileStyles(val)}`}
              >
                {val !== 0 && (
                  <motion.span
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                  >
                    {val}
                  </motion.span>
                )}
              </motion.div>
            ))
          )}
        </div>

        {/* Game Over / Win Overlay */}
        <AnimatePresence>
          {(gameOver || won) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-black/80 p-4 text-center backdrop-blur-sm"
            >
              {won ? (
                <>
                  <Award className="h-10 w-10 text-amber-400 mb-2" />
                  <h2 className="text-base font-bold text-white">You Reached 2048!</h2>
                  <p className="font-mono text-xs text-amber-300 mt-1">Exceptional puzzle mastery.</p>
                </>
              ) : (
                <>
                  <h2 className="text-base font-bold text-white">Game Over!</h2>
                  <p className="font-mono text-xs text-content-tertiary mt-1">No more moves left.</p>
                </>
              )}
              <button
                onClick={resetGame}
                className="mt-4 flex items-center gap-1.5 rounded-xl bg-accent-primary px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Play Again</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Virtual directional controls for mouse / touch users */}
      <div className="flex flex-col items-center gap-1 pb-1">
        <button
          onClick={() => move('up')}
          className="flex h-7 w-12 items-center justify-center rounded-lg border border-border-subtle bg-surface-card text-content-secondary hover:bg-surface-subtle"
        >
          <ArrowUp className="h-3.5 w-3.5" />
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => move('left')}
            className="flex h-7 w-12 items-center justify-center rounded-lg border border-border-subtle bg-surface-card text-content-secondary hover:bg-surface-subtle"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => move('down')}
            className="flex h-7 w-12 items-center justify-center rounded-lg border border-border-subtle bg-surface-card text-content-secondary hover:bg-surface-subtle"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => move('right')}
            className="flex h-7 w-12 items-center justify-center rounded-lg border border-border-subtle bg-surface-card text-content-secondary hover:bg-surface-subtle"
          >
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <span className="font-mono text-[9px] text-content-tertiary mt-1">
          Arrow keys supported
        </span>
      </div>
    </div>
  );
};

export const flow2048Manifest: AppManifest = {
  id: 'retro-2048',
  name: 'Flow 2048',
  description: 'Tactile 4x4 sliding tile numerical puzzle with procedural Web Audio feedback.',
  category: 'utilities',
  icon: Gamepad2,
  defaultSize: { width: 380, height: 530 },
  constraints: { minWidth: 320, minHeight: 460, maxWidth: 500, maxHeight: 700 },
  allowMultipleInstances: false,
  permissions: ['audio'],
  component: Flow2048App,
};
