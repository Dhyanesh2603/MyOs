import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Trophy, Award, Gamepad2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import type { AppManifest, AppProps } from '@contracts/app';
import { soundEngine } from '@core/audio/soundEngine';

interface TileItem {
  id: number;
  val: number;
  row: number; // 0..3
  col: number; // 0..3
  toDelete?: boolean;
  isMerged?: boolean;
  isNew?: boolean;
}

interface FloatingScore {
  id: number;
  points: number;
}

let nextTileId = 1;

function createTile(row: number, col: number, val?: number): TileItem {
  return {
    id: nextTileId++,
    val: val ?? (Math.random() < 0.9 ? 2 : 4),
    row,
    col,
    isNew: true,
  };
}

function getAvailableCells(tiles: TileItem[]): { row: number; col: number }[] {
  const occupied = new Set(tiles.filter((t) => !t.toDelete).map((t) => `${t.row},${t.col}`));
  const available: { row: number; col: number }[] = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (!occupied.has(`${r},${c}`)) {
        available.push({ row: r, col: c });
      }
    }
  }
  return available;
}

function canMove(tiles: TileItem[]): boolean {
  const active = tiles.filter((t) => !t.toDelete);
  if (active.length < 16) return true;

  const grid: number[][] = Array.from({ length: 4 }, () => Array(4).fill(0));
  active.forEach((t) => {
    grid[t.row]![t.col] = t.val;
  });

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const v = grid[r]![c]!;
      if (r < 3 && grid[r + 1]![c] === v) return true;
      if (c < 3 && grid[r]![c + 1] === v) return true;
    }
  }
  return false;
}

export const Flow2048App: React.FC<AppProps> = () => {
  const [tiles, setTiles] = useState<TileItem[]>(() => {
    const t1 = createTile(Math.floor(Math.random() * 4), Math.floor(Math.random() * 4));
    let t2Row = Math.floor(Math.random() * 4);
    let t2Col = Math.floor(Math.random() * 4);
    while (t2Row === t1.row && t2Col === t1.col) {
      t2Row = Math.floor(Math.random() * 4);
      t2Col = Math.floor(Math.random() * 4);
    }
    const t2 = createTile(t2Row, t2Col);
    return [t1, t2];
  });

  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem('onyx_2048_best') || localStorage.getItem('flowos_2048_best') || '0', 10);
    } catch {
      return 0;
    }
  });

  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [floatingScores, setFloatingScores] = useState<FloatingScore[]>([]);

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const cleanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const move = useCallback(
    (direction: 'left' | 'right' | 'up' | 'down') => {
      if (gameOver) return;

      setTiles((prevTiles) => {
        // First clean up any lingering toDelete tiles
        const activeTiles = prevTiles
          .filter((t) => !t.toDelete)
          .map((t) => ({ ...t, isMerged: false, isNew: false }));

        let scoreGained = 0;
        let hasMoved = false;

        const isHorizontal = direction === 'left' || direction === 'right';
        const isReverse = direction === 'right' || direction === 'down';

        const lines: TileItem[][] = Array.from({ length: 4 }, () => []);

        // Group tiles into rows or columns
        activeTiles.forEach((tile) => {
          const lineIdx = isHorizontal ? tile.row : tile.col;
          lines[lineIdx]!.push(tile);
        });

        const newTiles: TileItem[] = [];

        // Slide each line
        lines.forEach((line) => {
          line.sort((a, b) => {
            const coordA = isHorizontal ? a.col : a.row;
            const coordB = isHorizontal ? b.col : b.row;
            return isReverse ? coordB - coordA : coordA - coordB;
          });

          let targetCoord = isReverse ? 3 : 0;
          let lastMerged = false;

          for (let i = 0; i < line.length; i++) {
            const curr = { ...line[i]! };
            const currentCoord = isHorizontal ? curr.col : curr.row;

            if (
              i > 0 &&
              !lastMerged &&
              line[i - 1]!.val === curr.val &&
              !line[i - 1]!.toDelete
            ) {
              // Merge into previous tile
              const prev = newTiles[newTiles.length - 1]!;
              const targetSlot = isHorizontal ? prev.col : prev.row;

              if (isHorizontal) {
                curr.col = targetSlot;
              } else {
                curr.row = targetSlot;
              }

              curr.toDelete = true;
              prev.val *= 2;
              prev.isMerged = true;
              lastMerged = true;
              scoreGained += prev.val;
              hasMoved = true;
              newTiles.push(curr);
            } else {
              if (currentCoord !== targetCoord) {
                hasMoved = true;
              }
              if (isHorizontal) {
                curr.col = targetCoord;
              } else {
                curr.row = targetCoord;
              }
              if (isReverse) {
                targetCoord--;
              } else {
                targetCoord++;
              }
              lastMerged = false;
              newTiles.push(curr);
            }
          }
        });

        if (!hasMoved) {
          return prevTiles;
        }

        // Play feedback sounds
        soundEngine.playClick();
        if (scoreGained > 0) {
          soundEngine.playSnap();
          setScore((s) => {
            const updated = s + scoreGained;
            if (updated > bestScore) {
              setBestScore(updated);
              try {
                localStorage.setItem('onyx_2048_best', String(updated));
              } catch {}
            }
            return updated;
          });

          const floatId = Date.now() + Math.random();
          setFloatingScores((prev) => [...prev, { id: floatId, points: scoreGained }]);
          setTimeout(() => {
            setFloatingScores((prev) => prev.filter((f) => f.id !== floatId));
          }, 800);
        }

        // Schedule deletion of absorbed tiles and spawning of new tile
        if (cleanTimeoutRef.current) clearTimeout(cleanTimeoutRef.current);
        cleanTimeoutRef.current = setTimeout(() => {
          setTiles((currentTiles) => {
            const remaining = currentTiles
              .filter((t) => !t.toDelete)
              .map((t) => ({ ...t, isMerged: false }));

            // Check if 2048 won
            if (remaining.some((t) => t.val >= 2048)) {
              setWon(true);
            }

            const freeSlots = getAvailableCells(remaining);
            if (freeSlots.length > 0) {
              const spot = freeSlots[Math.floor(Math.random() * freeSlots.length)]!;
              const spawned = createTile(spot.row, spot.col);
              const nextState = [...remaining, spawned];

              if (!canMove(nextState)) {
                setGameOver(true);
              }
              return nextState;
            }

            if (!canMove(remaining)) {
              setGameOver(true);
            }
            return remaining;
          });
        }, 110);

        return newTiles;
      });
    },
    [gameOver, bestScore]
  );

  const resetGame = () => {
    soundEngine.playClick();
    if (cleanTimeoutRef.current) clearTimeout(cleanTimeoutRef.current);

    const t1 = createTile(Math.floor(Math.random() * 4), Math.floor(Math.random() * 4));
    let t2Row = Math.floor(Math.random() * 4);
    let t2Col = Math.floor(Math.random() * 4);
    while (t2Row === t1.row && t2Col === t1.col) {
      t2Row = Math.floor(Math.random() * 4);
      t2Col = Math.floor(Math.random() * 4);
    }
    const t2 = createTile(t2Row, t2Col);

    setTiles([t1, t2]);
    setScore(0);
    setGameOver(false);
    setWon(false);
    setFloatingScores([]);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown', 'a', 'd', 'w', 's'].includes(key)) {
        e.preventDefault();
        if (key === 'arrowleft' || key === 'a') move('left');
        else if (key === 'arrowright' || key === 'd') move('right');
        else if (key === 'arrowup' || key === 'w') move('up');
        else if (key === 'arrowdown' || key === 's') move('down');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  // Touch & Mouse Drag Handlers
  const handleTouchStart = (clientX: number, clientY: number) => {
    touchStartRef.current = { x: clientX, y: clientY };
  };

  const handleTouchEnd = (clientX: number, clientY: number) => {
    if (!touchStartRef.current) return;
    const deltaX = clientX - touchStartRef.current.x;
    const deltaY = clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (Math.max(absX, absY) < 30) return;

    if (absX > absY) {
      if (deltaX > 0) move('right');
      else move('left');
    } else {
      if (deltaY > 0) move('down');
      else move('up');
    }
  };

  const getTileStyles = (val: number) => {
    switch (val) {
      case 2:
        return 'bg-[#181b24] text-neutral-100 border-white/[0.08] shadow-sm';
      case 4:
        return 'bg-[#202534] text-neutral-100 border-white/[0.12] shadow-sm';
      case 8:
        return 'bg-[#78350f] text-amber-100 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]';
      case 16:
        return 'bg-[#b45309] text-white border-amber-400/50 shadow-[0_0_16px_rgba(245,158,11,0.35)]';
      case 32:
        return 'bg-[#c2410c] text-white border-orange-400/50 shadow-[0_0_18px_rgba(249,115,22,0.35)]';
      case 64:
        return 'bg-[#be123c] text-white border-rose-400/50 shadow-[0_0_20px_rgba(244,63,94,0.4)]';
      case 128:
        return 'bg-[#a21caf] text-white border-fuchsia-400/50 shadow-[0_0_22px_rgba(217,70,239,0.45)] text-lg';
      case 256:
        return 'bg-[#6d28d9] text-white border-purple-400/50 shadow-[0_0_25px_rgba(139,92,246,0.5)] text-lg';
      case 512:
        return 'bg-[#1d4ed8] text-white border-blue-400/50 shadow-[0_0_25px_rgba(59,130,246,0.5)] text-lg';
      case 1024:
        return 'bg-[#047857] text-white border-emerald-400/60 shadow-[0_0_28px_rgba(16,185,129,0.55)] text-base';
      case 2048:
        return 'bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 text-black border-amber-200 shadow-[0_0_35px_rgba(245,158,11,0.8)] text-base font-black animate-pulse';
      default:
        return 'bg-gradient-to-br from-violet-400 via-fuchsia-500 to-pink-500 text-white border-white/40 shadow-[0_0_40px_rgba(217,70,239,0.8)] text-sm font-black';
    }
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-between p-4 bg-[#0a0b10] text-neutral-100 select-none overflow-y-auto">
      {/* Header Bar */}
      <div className="flex w-full max-w-xs items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black shadow-md font-bold text-sm tracking-tight">
            2048
          </div>
          <div>
            <h1 className="text-xs font-bold uppercase tracking-wider text-white">Onyx 2048</h1>
            <p className="font-mono text-[9px] text-neutral-400">Tactile Kinematics</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Score Tile */}
          <div className="relative flex flex-col items-center rounded-xl border border-white/[0.08] bg-[#12141c] px-3 py-1 min-w-[56px]">
            <span className="font-mono text-[8px] uppercase tracking-wider text-neutral-400">Score</span>
            <span className="font-mono text-xs font-bold text-white">{score}</span>

            {/* Floating Score Animation */}
            <AnimatePresence>
              {floatingScores.map((f) => (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 1, y: 0, scale: 0.8 }}
                  animate={{ opacity: 0, y: -26, scale: 1.15 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  className="absolute -top-3 right-1 font-mono text-xs font-black text-amber-400 pointer-events-none drop-shadow"
                >
                  +{f.points}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Best Tile */}
          <div className="flex flex-col items-center rounded-xl border border-white/[0.08] bg-[#12141c] px-3 py-1 min-w-[56px]">
            <span className="font-mono text-[8px] uppercase tracking-wider text-amber-400 flex items-center gap-0.5">
              <Trophy className="h-2.5 w-2.5" /> Best
            </span>
            <span className="font-mono text-xs font-bold text-white">{bestScore}</span>
          </div>

          {/* Restart */}
          <button
            onClick={resetGame}
            title="Restart Game"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-[#12141c] text-neutral-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 4x4 Tactile Game Canvas */}
      <div
        onTouchStart={(e) => {
          const t = e.touches[0];
          if (t) handleTouchStart(t.clientX, t.clientY);
        }}
        onTouchEnd={(e) => {
          const t = e.changedTouches[0];
          if (t) handleTouchEnd(t.clientX, t.clientY);
        }}
        onMouseDown={(e) => handleTouchStart(e.clientX, e.clientY)}
        onMouseUp={(e) => handleTouchEnd(e.clientX, e.clientY)}
        className="relative my-auto w-full max-w-xs aspect-square rounded-2xl border border-white/[0.1] bg-[#10121a] p-2.5 shadow-2xl cursor-grab active:cursor-grabbing touch-none select-none"
      >
        {/* Background 16 Cell Wells */}
        <div className="grid h-full w-full grid-cols-4 grid-rows-4 gap-2">
          {Array.from({ length: 16 }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-white/[0.04] bg-[#161822]/60 shadow-inner"
            />
          ))}
        </div>

        {/* Dynamic Sliding Tiles with Spring Kinematics */}
        <div className="absolute inset-2.5 pointer-events-none">
          {tiles.map((tile) => (
            <motion.div
              key={tile.id}
              initial={tile.isNew ? { scale: 0, opacity: 0 } : false}
              animate={{
                left: `${tile.col * 25.5}%`,
                top: `${tile.row * 25.5}%`,
                scale: tile.isMerged ? [1, 1.22, 1] : 1,
                opacity: tile.toDelete ? 0 : 1,
              }}
              transition={{
                type: 'spring',
                stiffness: 420,
                damping: 30,
                mass: 0.8,
              }}
              style={{
                position: 'absolute',
                width: '23.5%',
                height: '23.5%',
                zIndex: tile.isMerged ? 30 : tile.toDelete ? 5 : 20,
              }}
              className={`flex items-center justify-center rounded-xl border font-mono font-bold text-xl select-none ${getTileStyles(
                tile.val
              )}`}
            >
              <span>{tile.val}</span>
            </motion.div>
          ))}
        </div>

        {/* Game Over / Win Overlay */}
        <AnimatePresence>
          {(gameOver || won) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="absolute inset-0 z-40 flex flex-col items-center justify-center rounded-2xl bg-black/85 p-4 text-center backdrop-blur-md border border-white/10"
            >
              {won ? (
                <>
                  <Award className="h-12 w-12 text-amber-400 mb-2 animate-bounce" />
                  <h2 className="text-lg font-bold text-white tracking-tight">2048 Achieved!</h2>
                  <p className="font-mono text-xs text-amber-300 mt-1">Numerical supremacy unlocked.</p>
                </>
              ) : (
                <>
                  <h2 className="text-lg font-bold text-white tracking-tight">Matrix Locked</h2>
                  <p className="font-mono text-xs text-neutral-400 mt-1">No valid sliding vectors remain.</p>
                </>
              )}
              <button
                onClick={resetGame}
                className="mt-4 flex items-center gap-1.5 rounded-xl bg-white px-5 py-2 text-xs font-semibold text-black shadow-lg hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Play Again</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tactile D-Pad Controls for Mouse / Touch accessibility */}
      <div className="flex flex-col items-center gap-1.5 pb-1">
        <button
          onClick={() => move('up')}
          className="flex h-8 w-14 items-center justify-center rounded-xl border border-white/[0.08] bg-[#12141c] text-neutral-300 hover:bg-white/10 hover:text-white transition-all active:scale-95 cursor-pointer"
        >
          <ArrowUp className="h-3.5 w-3.5" />
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => move('left')}
            className="flex h-8 w-14 items-center justify-center rounded-xl border border-white/[0.08] bg-[#12141c] text-neutral-300 hover:bg-white/10 hover:text-white transition-all active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => move('down')}
            className="flex h-8 w-14 items-center justify-center rounded-xl border border-white/[0.08] bg-[#12141c] text-neutral-300 hover:bg-white/10 hover:text-white transition-all active:scale-95 cursor-pointer"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => move('right')}
            className="flex h-8 w-14 items-center justify-center rounded-xl border border-white/[0.08] bg-[#12141c] text-neutral-300 hover:bg-white/10 hover:text-white transition-all active:scale-95 cursor-pointer"
          >
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <span className="font-mono text-[9px] text-neutral-500 mt-0.5">
          Arrows • WASD • Swipe gestures
        </span>
      </div>
    </div>
  );
};

export const flow2048Manifest: AppManifest = {
  id: 'retro-2048',
  name: 'Onyx 2048',
  description: 'Tactile 4x4 sliding tile numerical puzzle with procedural Web Audio feedback.',
  category: 'games',
  icon: Gamepad2,
  defaultSize: { width: 380, height: 530 },
  constraints: { minWidth: 320, minHeight: 460, maxWidth: 500, maxHeight: 700 },
  allowMultipleInstances: false,
  permissions: ['audio'],
  component: Flow2048App,
};
