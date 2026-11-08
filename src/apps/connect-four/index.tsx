import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  CircleDot,
  Users,
  Bot,
  Radio,
  RotateCw,
  Trophy,
  Volume2,
  VolumeX,
  Undo2,
  Swords,
  Sparkles,
} from 'lucide-react';
import type { AppManifest, AppProps } from '@contracts/app';

type Player = 1 | 2; // 1 = Cyan/Red, 2 = Gold/Yellow
type Cell = Player | null;
type Board = Cell[][]; // 6 rows, 7 columns
type GameMode = 'local' | 'ai' | 'airbridge';
type AIDifficulty = 'easy' | 'medium' | 'hard';

const ROWS = 6;
const COLS = 7;

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

function createEmptyBoard(): Board {
  return Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => null));
}

function checkWin(board: Board): { winner: Player; line: [number, number][] } | null {
  // Horizontal
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      const p = board[r]?.[c];
      if (
        p &&
        p === board[r]?.[c + 1] &&
        p === board[r]?.[c + 2] &&
        p === board[r]?.[c + 3]
      ) {
        return {
          winner: p,
          line: [
            [r, c],
            [r, c + 1],
            [r, c + 2],
            [r, c + 3],
          ],
        };
      }
    }
  }

  // Vertical
  for (let r = 0; r <= ROWS - 4; r++) {
    for (let c = 0; c < COLS; c++) {
      const p = board[r]?.[c];
      if (
        p &&
        p === board[r + 1]?.[c] &&
        p === board[r + 2]?.[c] &&
        p === board[r + 3]?.[c]
      ) {
        return {
          winner: p,
          line: [
            [r, c],
            [r + 1, c],
            [r + 2, c],
            [r + 3, c],
          ],
        };
      }
    }
  }

  // Diagonal Down-Right
  for (let r = 0; r <= ROWS - 4; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      const p = board[r]?.[c];
      if (
        p &&
        p === board[r + 1]?.[c + 1] &&
        p === board[r + 2]?.[c + 2] &&
        p === board[r + 3]?.[c + 3]
      ) {
        return {
          winner: p,
          line: [
            [r, c],
            [r + 1, c + 1],
            [r + 2, c + 2],
            [r + 3, c + 3],
          ],
        };
      }
    }
  }

  // Diagonal Up-Right
  for (let r = 3; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      const p = board[r]?.[c];
      if (
        p &&
        p === board[r - 1]?.[c + 1] &&
        p === board[r - 2]?.[c + 2] &&
        p === board[r - 3]?.[c + 3]
      ) {
        return {
          winner: p,
          line: [
            [r, c],
            [r - 1, c + 1],
            [r - 2, c + 2],
            [r - 3, c + 3],
          ],
        };
      }
    }
  }

  return null;
}

export const ConnectFourApp: React.FC<AppProps> = () => {
  const [board, setBoard] = useState<Board>(createEmptyBoard);
  const [currentPlayer, setCurrentPlayer] = useState<Player>(1);
  const [mode, setMode] = useState<GameMode>('local');
  const [aiDiff, setAiDiff] = useState<AIDifficulty>('medium');
  const [hoverCol, setHoverCol] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Scoreboard
  const [winsP1, setWinsP1] = useState(0);
  const [winsP2, setWinsP2] = useState(0);
  const [draws, setDraws] = useState(0);

  // Move history for undo
  const [history, setHistory] = useState<{ board: Board; player: Player }[]>([]);

  // AirBridge P2P Sync
  const [roomCode, setRoomCode] = useState('FOUR-1');
  const [isHost, setIsHost] = useState(true);
  const channelRef = useRef<BroadcastChannel | null>(null);

  const winInfo = checkWin(board);
  const isDraw = !winInfo && board.every((row) => row.every((cell) => cell !== null));

  const triggerSound = useCallback((freq: number, type: OscillatorType = 'sine', dur = 0.08) => {
    if (soundEnabled) playTone(freq, type, dur);
  }, [soundEnabled]);

  // AirBridge sync channel
  useEffect(() => {
    if (mode === 'airbridge') {
      const channel = new BroadcastChannel(`flowos_connect4_${roomCode}`);
      channelRef.current = channel;

      channel.onmessage = (e) => {
        const msg = e.data;
        if (msg.type === 'DROP_TOKEN') {
          handleDrop(msg.col, true);
        } else if (msg.type === 'RESET_GAME') {
          handleResetBoard(true);
        }
      };

      return () => {
        channel.close();
      };
    }
  }, [mode, roomCode]);

  // Drop token in column
  const handleDrop = useCallback(
    (col: number, fromRemote = false) => {
      if (winInfo || isDraw) return;
      if (mode === 'airbridge' && !fromRemote) {
        if ((isHost && currentPlayer !== 1) || (!isHost && currentPlayer !== 2)) {
          return; // not your turn
        }
      }

      // Find lowest available row in column
      let targetRow = -1;
      for (let r = ROWS - 1; r >= 0; r--) {
        if (board[r]?.[col] === null) {
          targetRow = r;
          break;
        }
      }

      if (targetRow === -1) return; // Column full

      triggerSound(currentPlayer === 1 ? 440 : 540, 'triangle', 0.1);

      const newBoard = board.map((row) => [...row]);
      newBoard[targetRow]![col] = currentPlayer;

      setHistory((prev) => [...prev, { board, player: currentPlayer }]);
      setBoard(newBoard);

      const nextPlayer: Player = currentPlayer === 1 ? 2 : 1;
      setCurrentPlayer(nextPlayer);

      // Check immediate win
      const result = checkWin(newBoard);
      if (result) {
        triggerSound(880, 'sine', 0.3);
        if (result.winner === 1) setWinsP1((w) => w + 1);
        else setWinsP2((w) => w + 1);
      } else if (newBoard.every((row) => row.every((c) => c !== null))) {
        triggerSound(220, 'sawtooth', 0.2);
        setDraws((d) => d + 1);
      }

      // Broadcast if AirBridge
      if (mode === 'airbridge' && !fromRemote && channelRef.current) {
        channelRef.current.postMessage({ type: 'DROP_TOKEN', col });
      }
    },
    [winInfo, isDraw, mode, isHost, currentPlayer, board, triggerSound]
  );

  // AI Turn computation
  useEffect(() => {
    if (mode === 'ai' && currentPlayer === 2 && !winInfo && !isDraw) {
      const timer = setTimeout(() => {
        // AI heuristic: Check if AI can win immediately
        const validCols: number[] = [];
        for (let c = 0; c < COLS; c++) {
          if (board[0]?.[c] === null) validCols.push(c);
        }
        if (validCols.length === 0) return;

        let chosenCol = validCols[Math.floor(Math.random() * validCols.length)]!;

        if (aiDiff === 'medium' || aiDiff === 'hard') {
          // Check for immediate win for P2
          for (const c of validCols) {
            const testBoard = board.map((r) => [...r]);
            for (let r = ROWS - 1; r >= 0; r--) {
              if (testBoard[r]?.[c] === null) {
                testBoard[r]![c] = 2;
                break;
              }
            }
            if (checkWin(testBoard)?.winner === 2) {
              chosenCol = c;
              break;
            }
          }

          // Check to block P1 from winning
          if (aiDiff === 'hard') {
            for (const c of validCols) {
              const testBoard = board.map((r) => [...r]);
              for (let r = ROWS - 1; r >= 0; r--) {
                if (testBoard[r]?.[c] === null) {
                  testBoard[r]![c] = 1;
                  break;
                }
              }
              if (checkWin(testBoard)?.winner === 1) {
                chosenCol = c;
                break;
              }
            }
          }
        }

        handleDrop(chosenCol);
      }, 450);

      return () => clearTimeout(timer);
    }
  }, [mode, currentPlayer, winInfo, isDraw, board, aiDiff, handleDrop]);

  const handleResetBoard = (fromRemote = false) => {
    setBoard(createEmptyBoard());
    setCurrentPlayer(1);
    setHistory([]);
    if (mode === 'airbridge' && !fromRemote && channelRef.current) {
      channelRef.current.postMessage({ type: 'RESET_GAME' });
    }
  };

  const handleUndo = () => {
    if (history.length === 0 || winInfo) return;
    const last = history[history.length - 1]!;
    setBoard(last.board);
    setCurrentPlayer(last.player);
    setHistory((prev) => prev.slice(0, -1));
  };

  return (
    <div className="flex h-full w-full flex-col bg-surface-panel text-content-primary select-none text-xs">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle bg-surface-overlay/80 px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">
            <CircleDot className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-bold text-sm text-content-primary">Connect 4</h2>
              <span className="rounded bg-red-500/10 border border-red-500/30 px-1.5 py-0.2 text-[9px] font-bold text-red-400 uppercase tracking-wider">
                Tactical Duel
              </span>
            </div>
            <p className="text-[10px] text-content-tertiary">Turn-Based Strategic Gravity Grid</p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1 rounded-lg border border-border-subtle bg-surface-subtle/50 p-1">
          <button
            onClick={() => {
              setMode('local');
              handleResetBoard();
            }}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              mode === 'local'
                ? 'bg-red-500 text-white font-semibold shadow-sm'
                : 'text-content-secondary hover:text-content-primary'
            }`}
          >
            <Users className="h-3 w-3" />
            <span>Pass & Play</span>
          </button>

          <button
            onClick={() => {
              setMode('ai');
              handleResetBoard();
            }}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              mode === 'ai'
                ? 'bg-red-500 text-white font-semibold shadow-sm'
                : 'text-content-secondary hover:text-content-primary'
            }`}
          >
            <Bot className="h-3 w-3" />
            <span>VS Minimax AI</span>
          </button>

          <button
            onClick={() => {
              setMode('airbridge');
              handleResetBoard();
            }}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              mode === 'airbridge'
                ? 'bg-red-500 text-white font-semibold shadow-sm'
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
            onClick={handleUndo}
            disabled={history.length === 0 || !!winInfo}
            title="Undo Move"
            className="flex items-center gap-1 rounded-lg border border-border-subtle bg-surface-subtle px-2.5 py-1 text-xs font-medium hover:bg-surface-overlay transition-colors disabled:opacity-40"
          >
            <Undo2 className="h-3 w-3" />
            <span>Undo</span>
          </button>

          <button
            onClick={() => handleResetBoard(false)}
            title="Reset Board"
            className="flex items-center gap-1 rounded-lg border border-border-subtle bg-surface-subtle px-2.5 py-1 text-xs font-medium hover:bg-surface-overlay transition-colors"
          >
            <RotateCw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Sub Settings */}
      {mode === 'ai' && (
        <div className="flex items-center justify-between border-b border-border-subtle bg-surface-overlay/40 px-4 py-1.5 text-[11px] text-content-secondary">
          <div className="flex items-center gap-2">
            <span>AI Level:</span>
            {(['easy', 'medium', 'hard'] as AIDifficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => setAiDiff(d)}
                className={`px-2 py-0.5 rounded capitalize ${
                  aiDiff === d
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                    : 'hover:bg-surface-subtle text-content-tertiary'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <span className="text-[10px] text-content-tertiary">Player 1: Red Discs | Player 2: Minimax AI (Yellow)</span>
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
              Role: {isHost ? 'Host (Red P1)' : 'Guest (Yellow P2)'}
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-[10px]">Open another window to play in real-time</span>
          </div>
        </div>
      )}

      {/* Main Board Arena */}
      <div className="relative flex flex-1 flex-col items-center justify-center p-4 bg-[#090d16] overflow-y-auto">
        {/* Scoreboard & Turn Indicator */}
        <div className="flex items-center gap-8 mb-4 select-none">
          <div className="flex items-center gap-2.5">
            <div className="h-4 w-4 rounded-full bg-rose-500 " />
            <div>
              <div className="text-[11px] font-bold text-rose-400">Player 1 (Red)</div>
              <div className="text-[10px] text-content-tertiary font-mono">{winsP1} Wins</div>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1">
              <Swords className="h-3.5 w-3.5 text-content-tertiary" />
              <span className="font-semibold text-xs text-content-primary">
                {winInfo
                  ? `Player ${winInfo.winner} Wins!`
                  : isDraw
                  ? "It's a Draw!"
                  : `Player ${currentPlayer}'s Turn`}
              </span>
            </div>
            <span className="text-[9px] text-content-tertiary mt-0.5">Draws: {draws}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="text-right">
              <div className="text-[11px] font-bold text-amber-400">
                {mode === 'ai' ? 'Minimax AI' : 'Player 2 (Yellow)'}
              </div>
              <div className="text-[10px] text-content-tertiary font-mono">{winsP2} Wins</div>
            </div>
            <div className="h-4 w-4 rounded-full bg-amber-400 " />
          </div>
        </div>

        {/* Tactical 7x6 Board */}
        <div className="flex flex-col items-center">
          {/* Drop Column Indicator Arrow Bar */}
          <div className="grid grid-cols-7 gap-2.5 w-[336px] sm:w-[392px] mb-2 px-3">
            {Array.from({ length: COLS }).map((_, c) => (
              <button
                key={c}
                onClick={() => handleDrop(c)}
                onMouseEnter={() => setHoverCol(c)}
                onMouseLeave={() => setHoverCol(null)}
                disabled={board[0]?.[c] !== null || !!winInfo || isDraw}
                className="flex items-center justify-center h-6 rounded-md hover:bg-surface-subtle transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-0"
              >
                {hoverCol === c && !winInfo && !isDraw && (
                  <div
                    className={`h-3 w-3 rounded-full animate-bounce shadow-lg ${
                      currentPlayer === 1 ? 'bg-rose-500' : 'bg-amber-400'
                    }`}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Blue Vertical Rack */}
          <div className="p-3.5 rounded-2xl bg-blue-900/40 border-2 border-blue-500/40 shadow-[0_10px_35px_rgba(30,58,138,0.3)] backdrop-blur">
            <div className="grid grid-cols-7 gap-2.5">
              {board.map((row, r) =>
                row.map((cell, c) => {
                  const isWinningCell = winInfo?.line.some(([wr, wc]) => wr === r && wc === c);
                  return (
                    <button
                      key={`${r}-${c}`}
                      onClick={() => handleDrop(c)}
                      onMouseEnter={() => setHoverCol(c)}
                      onMouseLeave={() => setHoverCol(null)}
                      disabled={board[0]?.[c] !== null || !!winInfo || isDraw}
                      className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-[#070b14] border border-blue-400/20 flex items-center justify-center transition-all cursor-pointer relative"
                    >
                      {cell === 1 && (
                        <div
                          className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-tr from-rose-600 to-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.7)] ${
                            isWinningCell ? 'ring-4 ring-white animate-pulse' : ''
                          }`}
                        />
                      )}
                      {cell === 2 && (
                        <div
                          className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 shadow-[0_0_12px_rgba(251,191,36,0.7)] ${
                            isWinningCell ? 'ring-4 ring-white animate-pulse' : ''
                          }`}
                        />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Winner Banner Overlay */}
        {(winInfo || isDraw) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-20 animate-in fade-in duration-200">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-400 mb-3 shadow-[0_0_20px_rgba(251,191,36,0.3)]">
              {winInfo ? <Trophy className="h-7 w-7" /> : <Sparkles className="h-7 w-7" />}
            </div>
            <h3 className="font-extrabold text-xl text-white tracking-tight">
              {winInfo
                ? `${winInfo.winner === 1 ? 'Player 1 (Red)' : mode === 'ai' ? 'Minimax AI' : 'Player 2 (Yellow)'} Wins!`
                : "Match Draw — Stalemate!"}
            </h3>
            <p className="mt-1 text-xs text-content-tertiary">Four in a row connected!</p>
            <button
              onClick={() => handleResetBoard(false)}
              className="mt-4 flex items-center gap-2 rounded-lg bg-red-500 hover:bg-red-400 text-white px-5 py-2 font-bold text-xs shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              <RotateCw className="h-3.5 w-3.5" />
              <span>Play Next Round</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const connectFourManifest: AppManifest = {
  id: 'connect-four',
  name: 'Connect 4',
  description: 'Tactical 2-player multiplayer gravity grid with pass-and-play, Minimax AI bot, and AirBridge P2P sync.',
  category: 'productivity',
  icon: CircleDot,
  defaultSize: { width: 680, height: 580 },
  constraints: { minWidth: 480, minHeight: 420, maxWidth: 1000, maxHeight: 900 },
  allowMultipleInstances: true,
  permissions: [],
  component: ConnectFourApp,
};
