import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Gamepad,
  Users,
  Bot,
  Radio,
  RotateCw,
  Trophy,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Swords,
  Flame,
} from 'lucide-react';
import type { AppManifest, AppProps } from '@contracts/app';

type GameMode = 'local' | 'ai' | 'airbridge';
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
interface Point {
  x: number;
  y: number;
}

function playTone(freq: number, type: OscillatorType = 'sine', duration = 0.08, volume = 0.15) {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Ignore audio restriction
  }
}

const GRID_COLS = 32;
const GRID_ROWS = 22;

export const SnakeArenaApp: React.FC<AppProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [mode, setMode] = useState<GameMode>('local');
  const [isPlaying, setIsPlaying] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [roundWinner, setRoundWinner] = useState<string | null>(null);

  // Match score
  const [scoreP1, setScoreP1] = useState(0);
  const [scoreP2, setScoreP2] = useState(0);

  // AirBridge P2P
  const [roomCode, setRoomCode] = useState('TRON-1');
  const [isHost, setIsHost] = useState(true);
  const channelRef = useRef<BroadcastChannel | null>(null);

  // Mutable Game State Ref for interval
  const stateRef = useRef({
    p1: [
      { x: 5, y: 11 },
      { x: 4, y: 11 },
      { x: 3, y: 11 },
    ] as Point[],
    p1Dir: 'RIGHT' as Direction,
    p1NextDir: 'RIGHT' as Direction,

    p2: [
      { x: 26, y: 11 },
      { x: 27, y: 11 },
      { x: 28, y: 11 },
    ] as Point[],
    p2Dir: 'LEFT' as Direction,
    p2NextDir: 'LEFT' as Direction,

    food: { x: 16, y: 11 } as Point,
    specialFood: null as (Point & { type: 'speed' | 'bomb' }) | null,
    gameOver: false,
    particles: [] as { x: number; y: number; vx: number; vy: number; color: string; life: number }[],
  });

  const triggerSound = useCallback((freq: number, type: OscillatorType = 'sine', dur = 0.08) => {
    if (soundEnabled) {
      playTone(freq, type, dur);
    }
  }, [soundEnabled]);

  // Spawn food avoiding bodies
  const spawnFood = useCallback(() => {
    const s = stateRef.current;
    let newX = Math.floor(Math.random() * (GRID_COLS - 2)) + 1;
    let newY = Math.floor(Math.random() * (GRID_ROWS - 2)) + 1;

    // Avoid snake bodies
    const isOccupied = (pt: Point) =>
      s.p1.some((p) => p.x === pt.x && p.y === pt.y) ||
      s.p2.some((p) => p.x === pt.x && p.y === pt.y);

    while (isOccupied({ x: newX, y: newY })) {
      newX = Math.floor(Math.random() * (GRID_COLS - 2)) + 1;
      newY = Math.floor(Math.random() * (GRID_ROWS - 2)) + 1;
    }

    s.food = { x: newX, y: newY };
  }, []);

  // Reset round
  const resetRound = useCallback(() => {
    const s = stateRef.current;
    s.p1 = [
      { x: 5, y: 11 },
      { x: 4, y: 11 },
      { x: 3, y: 11 },
    ];
    s.p1Dir = 'RIGHT';
    s.p1NextDir = 'RIGHT';

    s.p2 = [
      { x: 26, y: 11 },
      { x: 27, y: 11 },
      { x: 28, y: 11 },
    ];
    s.p2Dir = 'LEFT';
    s.p2NextDir = 'LEFT';

    s.gameOver = false;
    setRoundWinner(null);
    spawnFood();
    setIsPlaying(true);
  }, [spawnFood]);

  // Reset full match
  const handleResetMatch = useCallback(() => {
    setScoreP1(0);
    setScoreP2(0);
    resetRound();
  }, [resetRound]);

  // AirBridge P2P sync
  useEffect(() => {
    if (mode === 'airbridge') {
      const channel = new BroadcastChannel(`flowos_snake_${roomCode}`);
      channelRef.current = channel;

      channel.onmessage = (e) => {
        const msg = e.data;
        if (msg.type === 'DIR_CHANGE') {
          if (isHost && msg.player === 2) {
            stateRef.current.p2NextDir = msg.dir;
          } else if (!isHost && msg.player === 1) {
            stateRef.current.p1NextDir = msg.dir;
          }
        } else if (msg.type === 'SYNC_GAME' && !isHost) {
          stateRef.current.p1 = msg.p1;
          stateRef.current.p2 = msg.p2;
          stateRef.current.food = msg.food;
          setScoreP1(msg.scoreP1);
          setScoreP2(msg.scoreP2);
          if (msg.winner) setRoundWinner(msg.winner);
        }
      };

      return () => {
        channel.close();
      };
    }
  }, [mode, roomCode, isHost]);

  // Keyboard controls listener
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const s = stateRef.current;
      // Player 1: WASD
      if ((e.key === 'w' || e.key === 'W') && s.p1Dir !== 'DOWN') {
        s.p1NextDir = 'UP';
        if (mode === 'airbridge' && isHost && channelRef.current) {
          channelRef.current.postMessage({ type: 'DIR_CHANGE', player: 1, dir: 'UP' });
        }
      }
      if ((e.key === 's' || e.key === 'S') && s.p1Dir !== 'UP') {
        s.p1NextDir = 'DOWN';
        if (mode === 'airbridge' && isHost && channelRef.current) {
          channelRef.current.postMessage({ type: 'DIR_CHANGE', player: 1, dir: 'DOWN' });
        }
      }
      if ((e.key === 'a' || e.key === 'A') && s.p1Dir !== 'RIGHT') {
        s.p1NextDir = 'LEFT';
        if (mode === 'airbridge' && isHost && channelRef.current) {
          channelRef.current.postMessage({ type: 'DIR_CHANGE', player: 1, dir: 'LEFT' });
        }
      }
      if ((e.key === 'd' || e.key === 'D') && s.p1Dir !== 'LEFT') {
        s.p1NextDir = 'RIGHT';
        if (mode === 'airbridge' && isHost && channelRef.current) {
          channelRef.current.postMessage({ type: 'DIR_CHANGE', player: 1, dir: 'RIGHT' });
        }
      }

      // Player 2: Arrow keys
      if (mode === 'local' || (mode === 'airbridge' && !isHost)) {
        if (e.key === 'ArrowUp' && s.p2Dir !== 'DOWN') {
          s.p2NextDir = 'UP';
          e.preventDefault();
          if (mode === 'airbridge' && channelRef.current) {
            channelRef.current.postMessage({ type: 'DIR_CHANGE', player: 2, dir: 'UP' });
          }
        }
        if (e.key === 'ArrowDown' && s.p2Dir !== 'UP') {
          s.p2NextDir = 'DOWN';
          e.preventDefault();
          if (mode === 'airbridge' && channelRef.current) {
            channelRef.current.postMessage({ type: 'DIR_CHANGE', player: 2, dir: 'DOWN' });
          }
        }
        if (e.key === 'ArrowLeft' && s.p2Dir !== 'RIGHT') {
          s.p2NextDir = 'LEFT';
          e.preventDefault();
          if (mode === 'airbridge' && channelRef.current) {
            channelRef.current.postMessage({ type: 'DIR_CHANGE', player: 2, dir: 'LEFT' });
          }
        }
        if (e.key === 'ArrowRight' && s.p2Dir !== 'LEFT') {
          s.p2NextDir = 'RIGHT';
          e.preventDefault();
          if (mode === 'airbridge' && channelRef.current) {
            channelRef.current.postMessage({ type: 'DIR_CHANGE', player: 2, dir: 'RIGHT' });
          }
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mode, isHost]);

  // AI Pathfinding Bot for Player 2
  const computeAiMove = useCallback(() => {
    const s = stateRef.current;
    const head = s.p2[0]!;
    const food = s.food;

    const safeMoves: Direction[] = [];
    const candidates: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];

    for (const dir of candidates) {
      // Cannot turn into self
      if (dir === 'UP' && s.p2Dir === 'DOWN') continue;
      if (dir === 'DOWN' && s.p2Dir === 'UP') continue;
      if (dir === 'LEFT' && s.p2Dir === 'RIGHT') continue;
      if (dir === 'RIGHT' && s.p2Dir === 'LEFT') continue;

      let nextX = head.x;
      let nextY = head.y;
      if (dir === 'UP') nextY--;
      if (dir === 'DOWN') nextY++;
      if (dir === 'LEFT') nextX--;
      if (dir === 'RIGHT') nextX++;

      // Check boundary
      if (nextX < 0 || nextX >= GRID_COLS || nextY < 0 || nextY >= GRID_ROWS) continue;

      // Check collision with bodies
      const hitP1 = s.p1.some((p) => p.x === nextX && p.y === nextY);
      const hitP2 = s.p2.some((p) => p.x === nextX && p.y === nextY);
      if (!hitP1 && !hitP2) {
        safeMoves.push(dir);
      }
    }

    if (safeMoves.length === 0) return; // trapped

    // Pick move that minimizes Manhattan distance to food
    let bestMove = safeMoves[0]!;
    let minDist = 9999;
    for (const m of safeMoves) {
      let nx = head.x;
      let ny = head.y;
      if (m === 'UP') ny--;
      if (m === 'DOWN') ny++;
      if (m === 'LEFT') nx--;
      if (m === 'RIGHT') nx++;
      const dist = Math.abs(nx - food.x) + Math.abs(ny - food.y);
      if (dist < minDist) {
        minDist = dist;
        bestMove = m;
      }
    }

    s.p2NextDir = bestMove;
  }, []);

  // Game Tick Timer
  useEffect(() => {
    if (!isPlaying || roundWinner) return;

    const interval = setInterval(() => {
      const s = stateRef.current;
      if (s.gameOver) return;

      // Host or Local executes simulation
      if (mode !== 'airbridge' || isHost) {
        if (mode === 'ai') {
          computeAiMove();
        }

        s.p1Dir = s.p1NextDir;
        s.p2Dir = s.p2NextDir;

        // Move Player 1 Head
        const h1 = { ...s.p1[0]! };
        if (s.p1Dir === 'UP') h1.y--;
        if (s.p1Dir === 'DOWN') h1.y++;
        if (s.p1Dir === 'LEFT') h1.x--;
        if (s.p1Dir === 'RIGHT') h1.x++;

        // Move Player 2 Head
        const h2 = { ...s.p2[0]! };
        if (s.p2Dir === 'UP') h2.y--;
        if (s.p2Dir === 'DOWN') h2.y++;
        if (s.p2Dir === 'LEFT') h2.x--;
        if (s.p2Dir === 'RIGHT') h2.x++;

        // Check Crashes
        let p1Dead = false;
        let p2Dead = false;

        // P1 Wall Crash
        if (h1.x < 0 || h1.x >= GRID_COLS || h1.y < 0 || h1.y >= GRID_ROWS) p1Dead = true;
        // P2 Wall Crash
        if (h2.x < 0 || h2.x >= GRID_COLS || h2.y < 0 || h2.y >= GRID_ROWS) p2Dead = true;

        // Self Collisions
        if (s.p1.slice(1).some((p) => p.x === h1.x && p.y === h1.y)) p1Dead = true;
        if (s.p2.slice(1).some((p) => p.x === h2.x && p.y === h2.y)) p2Dead = true;

        // Body Collisions
        if (s.p2.some((p) => p.x === h1.x && p.y === h1.y)) p1Dead = true;
        if (s.p1.some((p) => p.x === h2.x && p.y === h2.y)) p2Dead = true;

        // Head-to-Head
        if (h1.x === h2.x && h1.y === h2.y) {
          p1Dead = true;
          p2Dead = true;
        }

        if (p1Dead || p2Dead) {
          s.gameOver = true;
          triggerSound(150, 'sawtooth', 0.3);
          const cellW = (canvasRef.current?.width || 640) / GRID_COLS;
          const cellH = (canvasRef.current?.height || 440) / GRID_ROWS;
          const deadPt = p1Dead ? h1 : h2;
          const sparkColor = p1Dead ? '#38bdf8' : '#f59e0b';
          for (let i = 0; i < 24; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 4 + 1;
            s.particles.push({
              x: deadPt.x * cellW + cellW / 2,
              y: deadPt.y * cellH + cellH / 2,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              color: sparkColor,
              life: 1,
            });
          }

          if (p1Dead && p2Dead) {
            setRoundWinner('Draw / Mutual Collision!');
          } else if (p1Dead) {
            setRoundWinner(mode === 'ai' ? 'Cyber Bot Wins Round!' : 'Player 2 (Amber) Wins Round!');
            setScoreP2((p) => p + 1);
          } else {
            setRoundWinner('Player 1 (Cyan) Wins Round!');
            setScoreP1((p) => p + 1);
          }

          if (mode === 'airbridge' && isHost && channelRef.current) {
            channelRef.current.postMessage({
              type: 'SYNC_GAME',
              p1: s.p1,
              p2: s.p2,
              food: s.food,
              scoreP1,
              scoreP2,
              winner: roundWinner,
            });
          }
          return;
        }

        // Advance bodies
        s.p1.unshift(h1);
        s.p2.unshift(h2);

        // Food Check P1
        if (h1.x === s.food.x && h1.y === s.food.y) {
          triggerSound(580, 'sine', 0.1);
          const cellW = (canvasRef.current?.width || 640) / GRID_COLS;
          const cellH = (canvasRef.current?.height || 440) / GRID_ROWS;
          for (let i = 0; i < 14; i++) {
            s.particles.push({
              x: s.food.x * cellW + cellW / 2,
              y: s.food.y * cellH + cellH / 2,
              vx: (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 4,
              color: '#38bdf8',
              life: 1,
            });
          }
          spawnFood();
        } else {
          s.p1.pop();
        }

        // Food Check P2
        if (h2.x === s.food.x && h2.y === s.food.y) {
          triggerSound(580, 'sine', 0.1);
          const cellW = (canvasRef.current?.width || 640) / GRID_COLS;
          const cellH = (canvasRef.current?.height || 440) / GRID_ROWS;
          for (let i = 0; i < 14; i++) {
            s.particles.push({
              x: s.food.x * cellW + cellW / 2,
              y: s.food.y * cellH + cellH / 2,
              vx: (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 4,
              color: '#f59e0b',
              life: 1,
            });
          }
          spawnFood();
        } else {
          s.p2.pop();
        }

        // Broadcast sync to client
        if (mode === 'airbridge' && isHost && channelRef.current) {
          channelRef.current.postMessage({
            type: 'SYNC_GAME',
            p1: s.p1,
            p2: s.p2,
            food: s.food,
            scoreP1,
            scoreP2,
            winner: null,
          });
        }
      }

      // Render Canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const cellW = canvas.width / GRID_COLS;
          const cellH = canvas.height / GRID_ROWS;

          ctx.fillStyle = '#060a12';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Grid Lines
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
          ctx.lineWidth = 1;
          for (let x = 0; x <= canvas.width; x += cellW) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
          }
          for (let y = 0; y <= canvas.height; y += cellH) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
          }

          // Pulsing Food with Neon Aura Ring
          const pulse = Math.sin(Date.now() / 180) * (cellW * 0.1);
          ctx.strokeStyle = 'rgba(34, 197, 94, 0.45)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(
            s.food.x * cellW + cellW / 2,
            s.food.y * cellH + cellH / 2,
            cellW * 0.44 + pulse,
            0,
            Math.PI * 2
          );
          ctx.stroke();

          ctx.fillStyle = '#22c55e';
          ctx.shadowColor = '#22c55e';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(
            s.food.x * cellW + cellW / 2,
            s.food.y * cellH + cellH / 2,
            cellW * 0.36,
            0,
            Math.PI * 2
          );
          ctx.fill();

          // Render Player 1 (Glowing Cyan Lightcycle)
          s.p1.forEach((pt, idx) => {
            ctx.fillStyle = idx === 0 ? '#ffffff' : '#38bdf8';
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = idx === 0 ? 12 : 6;
            if (ctx.roundRect) {
              ctx.beginPath();
              ctx.roundRect(pt.x * cellW + 1.5, pt.y * cellH + 1.5, cellW - 3, cellH - 3, 3);
              ctx.fill();
            } else {
              ctx.fillRect(pt.x * cellW + 1, pt.y * cellH + 1, cellW - 2, cellH - 2);
            }
          });

          // Render Player 2 (Glowing Amber Lightcycle)
          s.p2.forEach((pt, idx) => {
            ctx.fillStyle = idx === 0 ? '#ffffff' : '#f59e0b';
            ctx.shadowColor = '#f59e0b';
            ctx.shadowBlur = idx === 0 ? 12 : 6;
            if (ctx.roundRect) {
              ctx.beginPath();
              ctx.roundRect(pt.x * cellW + 1.5, pt.y * cellH + 1.5, cellW - 3, cellH - 3, 3);
              ctx.fill();
            } else {
              ctx.fillRect(pt.x * cellW + 1, pt.y * cellH + 1, cellW - 2, cellH - 2);
            }
          });

          // Render Neon Sparkle Particles
          for (let i = s.particles.length - 1; i >= 0; i--) {
            const p = s.particles[i]!;
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.04;
            if (p.life <= 0) {
              s.particles.splice(i, 1);
            } else {
              ctx.fillStyle = p.color;
              ctx.shadowColor = p.color;
              ctx.shadowBlur = 8;
              ctx.fillRect(p.x, p.y, 3, 3);
            }
          }
          ctx.shadowBlur = 0;
        }
      }
    }, 110); // ~9 FPS grid speed

    return () => clearInterval(interval);
  }, [isPlaying, roundWinner, mode, isHost, computeAiMove, spawnFood, triggerSound, scoreP1, scoreP2]);

  return (
    <div className="flex h-full w-full flex-col bg-surface-panel text-content-primary select-none text-xs">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle bg-surface-overlay/80 px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Flame className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-bold text-sm text-content-primary">Snake Arena</h2>
              <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.2 text-[9px] font-bold text-emerald-400 uppercase tracking-wider">
                Tron Lightcycles
              </span>
            </div>
            <p className="text-[10px] text-content-tertiary">Real-Time 2-Player Grid Battle</p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1 rounded-lg border border-border-subtle bg-surface-subtle/50 p-1">
          <button
            onClick={() => {
              setMode('local');
              handleResetMatch();
            }}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              mode === 'local'
                ? 'bg-emerald-500 text-black font-semibold shadow-sm'
                : 'text-content-secondary hover:text-content-primary'
            }`}
          >
            <Users className="h-3 w-3" />
            <span>2-Player Local</span>
          </button>

          <button
            onClick={() => {
              setMode('ai');
              handleResetMatch();
            }}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              mode === 'ai'
                ? 'bg-emerald-500 text-black font-semibold shadow-sm'
                : 'text-content-secondary hover:text-content-primary'
            }`}
          >
            <Bot className="h-3 w-3" />
            <span>VS Bot Snake</span>
          </button>

          <button
            onClick={() => {
              setMode('airbridge');
              handleResetMatch();
            }}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              mode === 'airbridge'
                ? 'bg-emerald-500 text-black font-semibold shadow-sm'
                : 'text-content-secondary hover:text-content-primary'
            }`}
          >
            <Radio className="h-3 w-3" />
            <span>AirBridge P2P</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSoundEnabled((prev) => !prev)}
            title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
            className="p-1.5 rounded-lg border border-border-subtle hover:bg-surface-subtle text-content-secondary hover:text-content-primary transition-colors"
          >
            {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          </button>

          <button
            onClick={() => setIsPlaying((p) => !p)}
            className="flex items-center gap-1 rounded-lg border border-border-subtle bg-surface-subtle px-2.5 py-1 text-xs font-medium hover:bg-surface-overlay transition-colors"
          >
            {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          <button
            onClick={handleResetMatch}
            title="Reset Game"
            className="flex items-center gap-1 rounded-lg border border-border-subtle bg-surface-subtle px-2.5 py-1 text-xs font-medium hover:bg-surface-overlay transition-colors"
          >
            <RotateCw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* AirBridge Settings Bar */}
      {mode === 'airbridge' && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle bg-surface-overlay/40 px-4 py-1.5 text-[11px] text-content-secondary">
          <div className="flex items-center gap-2">
            <span>Room Code:</span>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="w-24 rounded border border-border-subtle bg-surface-panel px-1.5 py-0.5 text-center font-mono font-bold text-xs uppercase"
            />
            <button
              onClick={() => setIsHost((h) => !h)}
              className="rounded bg-surface-subtle px-2 py-0.5 border border-border-subtle font-medium text-[10px]"
            >
              Role: {isHost ? 'Host (P1 Cyan)' : 'Guest (P2 Amber)'}
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-[10px]">Open another window to play in real-time</span>
          </div>
        </div>
      )}

      {/* Main Grid Viewport */}
      <div className="relative flex flex-1 flex-col items-center justify-center p-4 bg-[#050810] overflow-hidden">
        {/* Floating Scores */}
        <div className="absolute top-6 flex items-center gap-8 z-10 select-none">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">Player 1</div>
              <div className="text-[10px] text-content-tertiary font-mono">W / A / S / D</div>
            </div>
            <span className="text-3xl font-mono font-extrabold text-cyan-400 drop-shadow-[0_0_12px_rgba(56,189,248,0.5)]">
              {scoreP1}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <Swords className="h-4 w-4 text-content-tertiary opacity-40" />
            <span className="text-[9px] uppercase tracking-widest text-content-tertiary font-mono">Best of 5</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-3xl font-mono font-extrabold text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]">
              {scoreP2}
            </span>
            <div className="text-left">
              <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                {mode === 'ai' ? 'Bot Snake' : 'Player 2'}
              </div>
              <div className="text-[10px] text-content-tertiary font-mono">
                {mode === 'ai' ? 'AI Pathing' : 'Arrow Keys'}
              </div>
            </div>
          </div>
        </div>

        {/* Canvas Surface */}
        <canvas
          ref={canvasRef}
          width={640}
          height={440}
          className="rounded-xl border border-emerald-500/20 shadow-[0_0_30px_rgba(0,0,0,0.8)] max-w-full max-h-[80vh] aspect-[16/11] bg-[#060a12]"
        />

        {/* Round Winner Overlay */}
        {roundWinner && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm z-20 animate-in fade-in duration-200">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-3 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
              <Trophy className="h-7 w-7" />
            </div>
            <h3 className="font-extrabold text-xl text-white tracking-tight">{roundWinner}</h3>
            <p className="mt-1 text-xs text-content-tertiary">Current Match Score: {scoreP1} — {scoreP2}</p>
            <button
              onClick={resetRound}
              className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black px-5 py-2 font-bold text-xs shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              <RotateCw className="h-3.5 w-3.5" />
              <span>Next Round</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const snakeArenaManifest: AppManifest = {
  id: 'snake-arena',
  name: 'Onyx Snake Arena',
  description: '2-Player Tron lightcycle snake grid battle with local split controls, AI bot, and AirBridge P2P sync.',
  category: 'productivity',
  icon: Gamepad,
  defaultSize: { width: 720, height: 550 },
  constraints: { minWidth: 500, minHeight: 400, maxWidth: 1200, maxHeight: 900 },
  allowMultipleInstances: true,
  permissions: [],
  component: SnakeArenaApp,
};
