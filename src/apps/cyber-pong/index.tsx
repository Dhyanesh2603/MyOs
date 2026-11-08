import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Gamepad2,
  Users,
  Bot,
  Radio,
  RotateCw,
  Trophy,
  Volume2,
  VolumeX,
  Swords,
  Play,
  Pause,
} from 'lucide-react';
import type { AppManifest, AppProps } from '@contracts/app';

type GameMode = 'local' | 'ai' | 'airbridge';
type AIDifficulty = 'easy' | 'medium' | 'hard';

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
    // Ignore audio restrictions
  }
}

export const CyberPongApp: React.FC<AppProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Game Settings & State
  const [mode, setMode] = useState<GameMode>('local');
  const [aiDiff, setAiDiff] = useState<AIDifficulty>('medium');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  // Scores
  const [scoreP1, setScoreP1] = useState(0);
  const [scoreP2, setScoreP2] = useState(0);

  // AirBridge P2P sync state
  const [roomCode, setRoomCode] = useState('ARENA-1');
  const [isHost, setIsHost] = useState(true);
  const [p2pConnected, setP2pConnected] = useState(false);
  const channelRef = useRef<BroadcastChannel | null>(null);

  // Physics References (Mutable loop state)
  const stateRef = useRef({
    p1Y: 150,
    p2Y: 150,
    p1Vy: 0,
    p2Vy: 0,
    ballX: 320,
    ballY: 200,
    ballVx: 5,
    ballVy: 3,
    paddleHeight: 70,
    paddleWidth: 10,
    ballRadius: 7,
    canvasWidth: 640,
    canvasHeight: 400,
    keys: {
      w: false,
      s: false,
      up: false,
      down: false,
    },
    particles: [] as { x: number; y: number; vx: number; vy: number; life: number; color: string }[],
  });

  const triggerSound = useCallback((freq: number, type: OscillatorType = 'sine', dur = 0.08) => {
    if (soundEnabled) {
      playTone(freq, type, dur);
    }
  }, [soundEnabled]);

  // Reset ball position after score
  const resetBall = useCallback((towardsPlayer2: boolean) => {
    const s = stateRef.current;
    s.ballX = s.canvasWidth / 2;
    s.ballY = s.canvasHeight / 2;
    const speed = 5;
    s.ballVx = towardsPlayer2 ? speed : -speed;
    s.ballVy = (Math.random() * 4 - 2);
  }, []);

  // Full match reset
  const handleResetMatch = useCallback(() => {
    setScoreP1(0);
    setScoreP2(0);
    setWinner(null);
    resetBall(Math.random() > 0.5);
    setIsPlaying(true);
  }, [resetBall]);

  // AirBridge BroadcastChannel integration
  useEffect(() => {
    if (mode === 'airbridge') {
      const channel = new BroadcastChannel(`flowos_pong_${roomCode}`);
      channelRef.current = channel;

      channel.onmessage = (e) => {
        const msg = e.data;
        if (msg.type === 'PADDLE_MOVE') {
          if (isHost && msg.player === 2) {
            stateRef.current.p2Y = msg.y;
          } else if (!isHost && msg.player === 1) {
            stateRef.current.p1Y = msg.y;
          }
        } else if (msg.type === 'SYNC_STATE' && !isHost) {
          stateRef.current.ballX = msg.ballX;
          stateRef.current.ballY = msg.ballY;
          stateRef.current.p1Y = msg.p1Y;
          setScoreP1(msg.scoreP1);
          setScoreP2(msg.scoreP2);
          if (msg.winner) setWinner(msg.winner);
        } else if (msg.type === 'HELLO') {
          setP2pConnected(true);
          if (isHost) {
            channel.postMessage({ type: 'HELLO_ACK' });
          }
        } else if (msg.type === 'HELLO_ACK') {
          setP2pConnected(true);
        }
      };

      channel.postMessage({ type: 'HELLO' });

      return () => {
        channel.close();
      };
    }
  }, [mode, roomCode, isHost]);

  // Keyboard controls listener
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const k = stateRef.current.keys;
      if (e.key === 'w' || e.key === 'W') k.w = true;
      if (e.key === 's' || e.key === 'S') k.s = true;
      if (e.key === 'ArrowUp') {
        k.up = true;
        e.preventDefault();
      }
      if (e.key === 'ArrowDown') {
        k.down = true;
        e.preventDefault();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const k = stateRef.current.keys;
      if (e.key === 'w' || e.key === 'W') k.w = false;
      if (e.key === 's' || e.key === 'S') k.s = false;
      if (e.key === 'ArrowUp') k.up = false;
      if (e.key === 'ArrowDown') k.down = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  // Main 60 FPS Game Loop
  useEffect(() => {
    let animId: number;

    const loop = () => {
      const s = stateRef.current;
      const canvas = canvasRef.current;

      if (canvas && isPlaying && !winner) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // 1. Move Player 1
          const paddleSpeed = 6;
          if (mode === 'local' || (mode === 'airbridge' && isHost) || mode === 'ai') {
            if (s.keys.w) s.p1Y -= paddleSpeed;
            if (s.keys.s) s.p1Y += paddleSpeed;
            s.p1Y = Math.max(10, Math.min(s.canvasHeight - s.paddleHeight - 10, s.p1Y));

            if (mode === 'airbridge' && isHost && channelRef.current) {
              channelRef.current.postMessage({ type: 'PADDLE_MOVE', player: 1, y: s.p1Y });
            }
          }

          // 2. Move Player 2
          if (mode === 'local') {
            if (s.keys.up) s.p2Y -= paddleSpeed;
            if (s.keys.down) s.p2Y += paddleSpeed;
            s.p2Y = Math.max(10, Math.min(s.canvasHeight - s.paddleHeight - 10, s.p2Y));
          } else if (mode === 'ai') {
            // Adaptive AI bot
            const aiCenter = s.p2Y + s.paddleHeight / 2;
            const targetY = s.ballY;
            const diff = targetY - aiCenter;
            const aiSpeed = aiDiff === 'easy' ? 3.5 : aiDiff === 'medium' ? 5 : 6.8;

            if (Math.abs(diff) > 10) {
              s.p2Y += Math.sign(diff) * Math.min(Math.abs(diff), aiSpeed);
            }
            s.p2Y = Math.max(10, Math.min(s.canvasHeight - s.paddleHeight - 10, s.p2Y));
          } else if (mode === 'airbridge' && !isHost) {
            // Client side player 2 control
            if (s.keys.up || s.keys.w) s.p2Y -= paddleSpeed;
            if (s.keys.down || s.keys.s) s.p2Y += paddleSpeed;
            s.p2Y = Math.max(10, Math.min(s.canvasHeight - s.paddleHeight - 10, s.p2Y));

            if (channelRef.current) {
              channelRef.current.postMessage({ type: 'PADDLE_MOVE', player: 2, y: s.p2Y });
            }
          }

          // 3. Move Ball (only Host or Local/AI simulates ball physics)
          if (mode !== 'airbridge' || isHost) {
            s.ballX += s.ballVx;
            s.ballY += s.ballVy;

            // Top and Bottom wall collisions
            if (s.ballY - s.ballRadius <= 0) {
              s.ballY = s.ballRadius;
              s.ballVy = -s.ballVy;
              triggerSound(240, 'triangle', 0.05);
            } else if (s.ballY + s.ballRadius >= s.canvasHeight) {
              s.ballY = s.canvasHeight - s.ballRadius;
              s.ballVy = -s.ballVy;
              triggerSound(240, 'triangle', 0.05);
            }

            // Paddle 1 Collision (Left)
            const p1X = 25;
            if (
              s.ballX - s.ballRadius <= p1X + s.paddleWidth &&
              s.ballX + s.ballRadius >= p1X &&
              s.ballY >= s.p1Y - 4 &&
              s.ballY <= s.p1Y + s.paddleHeight + 4 &&
              s.ballVx < 0
            ) {
              s.ballVx = -s.ballVx * 1.05; // slight speed increase
              const deltaY = s.ballY - (s.p1Y + s.paddleHeight / 2);
              s.ballVy = deltaY * 0.22;
              triggerSound(480, 'sine', 0.08);

              // Spawn hit particles
              for (let i = 0; i < 6; i++) {
                s.particles.push({
                  x: s.ballX,
                  y: s.ballY,
                  vx: Math.random() * 3 + 1,
                  vy: (Math.random() - 0.5) * 4,
                  life: 1,
                  color: '#38bdf8',
                });
              }
            }

            // Paddle 2 Collision (Right)
            const p2X = s.canvasWidth - 25 - s.paddleWidth;
            if (
              s.ballX + s.ballRadius >= p2X &&
              s.ballX - s.ballRadius <= p2X + s.paddleWidth &&
              s.ballY >= s.p2Y - 4 &&
              s.ballY <= s.p2Y + s.paddleHeight + 4 &&
              s.ballVx > 0
            ) {
              s.ballVx = -s.ballVx * 1.05;
              const deltaY = s.ballY - (s.p2Y + s.paddleHeight / 2);
              s.ballVy = deltaY * 0.22;
              triggerSound(540, 'sine', 0.08);

              for (let i = 0; i < 6; i++) {
                s.particles.push({
                  x: s.ballX,
                  y: s.ballY,
                  vx: -(Math.random() * 3 + 1),
                  vy: (Math.random() - 0.5) * 4,
                  life: 1,
                  color: '#f43f5e',
                });
              }
            }

            // Scoring
            if (s.ballX < 0) {
              // Player 2 Scores
              triggerSound(200, 'sawtooth', 0.2);
              setScoreP2((prev) => {
                const next = prev + 1;
                if (next >= 7) {
                  setWinner(mode === 'ai' ? 'Cyber Bot' : 'Player 2 (Rose)');
                  triggerSound(600, 'sine', 0.4);
                } else {
                  resetBall(false);
                }
                return next;
              });
            } else if (s.ballX > s.canvasWidth) {
              // Player 1 Scores
              triggerSound(880, 'sine', 0.2);
              setScoreP1((prev) => {
                const next = prev + 1;
                if (next >= 7) {
                  setWinner('Player 1 (Cyan)');
                  triggerSound(600, 'sine', 0.4);
                } else {
                  resetBall(true);
                }
                return next;
              });
            }

            // AirBridge Broadcast host sync
            if (mode === 'airbridge' && isHost && channelRef.current) {
              channelRef.current.postMessage({
                type: 'SYNC_STATE',
                ballX: s.ballX,
                ballY: s.ballY,
                p1Y: s.p1Y,
                scoreP1,
                scoreP2,
                winner,
              });
            }
          }

          // 4. Render Canvas Frame
          ctx.fillStyle = '#0a0f18';
          ctx.fillRect(0, 0, s.canvasWidth, s.canvasHeight);

          // Center dashed net
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
          ctx.lineWidth = 2;
          ctx.setLineDash([8, 8]);
          ctx.beginPath();
          ctx.moveTo(s.canvasWidth / 2, 0);
          ctx.lineTo(s.canvasWidth / 2, s.canvasHeight);
          ctx.stroke();
          ctx.setLineDash([]);

          // Center court ring
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
          ctx.beginPath();
          ctx.arc(s.canvasWidth / 2, s.canvasHeight / 2, 50, 0, Math.PI * 2);
          ctx.stroke();

          // Render Paddle 1 (Cyan)
          ctx.fillStyle = '#38bdf8';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 12;
          ctx.fillRect(25, s.p1Y, s.paddleWidth, s.paddleHeight);

          // Render Paddle 2 (Rose)
          ctx.fillStyle = '#f43f5e';
          ctx.shadowColor = '#f43f5e';
          ctx.shadowBlur = 12;
          ctx.fillRect(s.canvasWidth - 25 - s.paddleWidth, s.p2Y, s.paddleWidth, s.paddleHeight);

          // Render Particles
          for (let i = s.particles.length - 1; i >= 0; i--) {
            const p = s.particles[i]!;
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.03;
            if (p.life <= 0) {
              s.particles.splice(i, 1);
            } else {
              ctx.fillStyle = p.color;
              ctx.shadowColor = p.color;
              ctx.shadowBlur = 6;
              ctx.fillRect(p.x, p.y, 3, 3);
            }
          }

          // Render Ball with Glow
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 16;
          ctx.beginPath();
          ctx.arc(s.ballX, s.ballY, s.ballRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, winner, mode, aiDiff, isHost, scoreP1, scoreP2, triggerSound, resetBall]);

  return (
    <div className="flex h-full w-full flex-col bg-surface-panel text-content-primary select-none text-xs">
      {/* Top Header / Mode Selector */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle bg-surface-overlay/80 px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-primary/20 text-accent-primary border border-accent-primary/30">
            <Gamepad2 className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-bold text-sm text-content-primary">CyberPong Arena</h2>
              <span className="rounded bg-accent-primary/10 border border-accent-primary/30 px-1.5 py-0.2 text-[9px] font-bold text-accent-primary uppercase tracking-wider">
                Multiplayer
              </span>
            </div>
            <p className="text-[10px] text-content-tertiary">Real-Time Arcade Table Tennis Duel</p>
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
                ? 'bg-accent-primary text-black font-semibold shadow-sm'
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
                ? 'bg-accent-primary text-black font-semibold shadow-sm'
                : 'text-content-secondary hover:text-content-primary'
            }`}
          >
            <Bot className="h-3 w-3" />
            <span>VS AI Bot</span>
          </button>

          <button
            onClick={() => {
              setMode('airbridge');
              handleResetMatch();
            }}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              mode === 'airbridge'
                ? 'bg-accent-primary text-black font-semibold shadow-sm'
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

      {/* Sub-bar for AI / AirBridge Settings */}
      {mode === 'ai' && (
        <div className="flex items-center justify-between border-b border-border-subtle bg-surface-overlay/40 px-4 py-1.5 text-[11px] text-content-secondary">
          <div className="flex items-center gap-2">
            <span>Bot Difficulty:</span>
            {(['easy', 'medium', 'hard'] as AIDifficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => setAiDiff(d)}
                className={`px-2 py-0.5 rounded capitalize ${
                  aiDiff === d
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold'
                    : 'hover:bg-surface-subtle text-content-tertiary'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <span className="text-[10px] text-content-tertiary">Player 1: W/S Keys | Player 2: Cyber Bot</span>
        </div>
      )}

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
              Role: {isHost ? 'Host (P1 Cyan)' : 'Client (P2 Rose)'}
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={`h-2 w-2 rounded-full ${
                p2pConnected ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <span className="text-[10px]">
              {p2pConnected ? 'P2P Cross-Window Connected' : 'Waiting for opponent in another window/tab...'}
            </span>
          </div>
        </div>
      )}

      {/* Main Playing Surface */}
      <div className="relative flex flex-1 flex-col items-center justify-center p-4 bg-[#070b12] overflow-hidden">
        {/* Floating Live Scoreboard */}
        <div className="absolute top-6 flex items-center gap-8 z-10 select-none">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">Player 1</div>
              <div className="text-[10px] text-content-tertiary font-mono">W / S Keys</div>
            </div>
            <span className="text-3xl font-mono font-extrabold text-cyan-400 drop-shadow-[0_0_12px_rgba(56,189,248,0.5)]">
              {scoreP1}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <Swords className="h-4 w-4 text-content-tertiary opacity-40" />
            <span className="text-[9px] uppercase tracking-widest text-content-tertiary font-mono">First to 7</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-3xl font-mono font-extrabold text-rose-400 drop-shadow-[0_0_12px_rgba(244,63,94,0.5)]">
              {scoreP2}
            </span>
            <div className="text-left">
              <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">
                {mode === 'ai' ? 'Cyber Bot' : 'Player 2'}
              </div>
              <div className="text-[10px] text-content-tertiary font-mono">
                {mode === 'ai' ? 'Auto Pilot' : '↑ / ↓ Keys'}
              </div>
            </div>
          </div>
        </div>

        {/* Game Canvas */}
        <canvas
          ref={canvasRef}
          width={640}
          height={400}
          className="rounded-xl border border-cyan-500/20 shadow-[0_0_30px_rgba(0,0,0,0.8)] max-w-full max-h-[80vh] aspect-[16/10] bg-[#0a0f18]"
        />

        {/* Winner Modal Overlay */}
        {winner && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-20 animate-in fade-in duration-200">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-400 mb-3 shadow-[0_0_20px_rgba(251,191,36,0.3)]">
              <Trophy className="h-7 w-7" />
            </div>
            <h3 className="font-extrabold text-xl text-white tracking-tight">{winner} Wins Match!</h3>
            <p className="mt-1 text-xs text-content-tertiary">Final Score: {scoreP1} — {scoreP2}</p>
            <button
              onClick={handleResetMatch}
              className="mt-4 flex items-center gap-2 rounded-lg bg-accent-primary hover:bg-accent-primary/80 text-black px-5 py-2 font-bold text-xs shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              <RotateCw className="h-3.5 w-3.5" />
              <span>Play Rematch</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const cyberPongManifest: AppManifest = {
  id: 'cyber-pong',
  name: 'CyberPong',
  description: 'Fast-paced 2-player multiplayer arcade pong with local split-keyboard, AI bot, and AirBridge P2P sync.',
  category: 'productivity',
  icon: Gamepad2,
  defaultSize: { width: 720, height: 530 },
  constraints: { minWidth: 500, minHeight: 400, maxWidth: 1200, maxHeight: 900 },
  allowMultipleInstances: true,
  permissions: [],
  component: CyberPongApp,
};
