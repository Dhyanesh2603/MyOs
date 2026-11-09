import React, { useState, useEffect, useCallback } from 'react';
import { Calculator as CalcIcon, Delete } from 'lucide-react';
import type { AppManifest, AppProps } from '@contracts/app';
import { useWindowStore } from '@core/window/windowStore';

const formatResult = (num: number): string => {
  if (isNaN(num) || !isFinite(num)) return 'Error';
  const rounded = Math.round(num * 1e10) / 1e10;
  return String(rounded);
};

const compute = (a: number, b: number, op: string): number => {
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case '×':
    case '*': return a * b;
    case '÷':
    case '/': return b === 0 ? NaN : a / b;
    default: return b;
  }
};

const CalculatorApp: React.FC<AppProps> = ({ windowId }) => {
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [historyTape, setHistoryTape] = useState('');

  const activeWindowId = useWindowStore((state) => state.activeWindowId);

  const handleDigit = useCallback((digit: string) => {
    if (display === 'Error') {
      setDisplay(digit === '.' ? '0.' : digit);
      setWaitingForOperand(false);
      return;
    }

    if (waitingForOperand) {
      setDisplay(digit === '.' ? '0.' : digit);
      setWaitingForOperand(false);
    } else {
      if (digit === '.') {
        if (display.includes('.')) return;
        setDisplay(display + '.');
      } else {
        setDisplay(display === '0' ? digit : display + digit);
      }
    }
  }, [display, waitingForOperand]);

  const handleOperator = useCallback((op: string) => {
    const current = parseFloat(display);

    if (isNaN(current)) return;

    if (operator && waitingForOperand) {
      // User changed their mind on operator
      setOperator(op);
      setHistoryTape(`${prevValue} ${op}`);
      return;
    }

    if (prevValue === null) {
      setPrevValue(current);
      setHistoryTape(`${current} ${op}`);
    } else if (operator) {
      const result = compute(prevValue, current, operator);
      if (isNaN(result) || !isFinite(result)) {
        setDisplay('Error');
        setPrevValue(null);
        setOperator(null);
        setHistoryTape('');
        setWaitingForOperand(true);
        return;
      }
      const formatted = formatResult(result);
      setDisplay(formatted);
      setPrevValue(result);
      setHistoryTape(`${formatted} ${op}`);
    }

    setOperator(op);
    setWaitingForOperand(true);
  }, [display, operator, prevValue, waitingForOperand]);

  const handleEqual = useCallback(() => {
    if (operator === null || prevValue === null) return;
    const current = parseFloat(display);
    if (isNaN(current)) return;

    const result = compute(prevValue, current, operator);
    if (isNaN(result) || !isFinite(result)) {
      setDisplay('Error');
      setHistoryTape(`${prevValue} ${operator} ${current} =`);
    } else {
      const formatted = formatResult(result);
      setDisplay(formatted);
      setHistoryTape(`${prevValue} ${operator} ${current} =`);
    }

    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(true);
  }, [display, operator, prevValue]);

  const handlePercentage = useCallback(() => {
    const current = parseFloat(display);
    if (isNaN(current)) return;

    let result: number;
    if (prevValue !== null && (operator === '+' || operator === '-')) {
      result = prevValue * (current / 100);
    } else {
      result = current / 100;
    }

    setDisplay(formatResult(result));
  }, [display, operator, prevValue]);

  const handleClear = useCallback(() => {
    setDisplay('0');
    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(false);
    setHistoryTape('');
  }, []);

  const handleBackspace = useCallback(() => {
    if (display === 'Error' || waitingForOperand) {
      setDisplay('0');
      setWaitingForOperand(false);
      return;
    }

    if (display.length > 1) {
      const sliced = display.slice(0, -1);
      setDisplay(sliced === '-' ? '0' : sliced);
    } else {
      setDisplay('0');
    }
  }, [display, waitingForOperand]);

  // Physical keyboard listeners strictly isolated to the focused window
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeWindowId !== windowId) return;

      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if (/[0-9.]/.test(e.key)) {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === '+') {
        e.preventDefault();
        handleOperator('+');
      } else if (e.key === '-') {
        e.preventDefault();
        handleOperator('-');
      } else if (e.key === '*' || e.key.toLowerCase() === 'x') {
        e.preventDefault();
        handleOperator('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleOperator('÷');
      } else if (e.key === '%') {
        e.preventDefault();
        handlePercentage();
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEqual();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key.toLowerCase() === 'c' || e.key === 'Escape') {
        e.preventDefault();
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeWindowId, windowId, handleDigit, handleOperator, handleEqual, handlePercentage, handleBackspace, handleClear]);

  return (
    <div className="flex h-full w-full flex-col bg-[#0a0b10] p-4 text-neutral-100 select-none">
      {/* Expression Tape & Main Readout Display (Dieter Rams Style) */}
      <div className="flex flex-1 flex-col justify-end rounded-2xl border border-white/10 bg-[#10121a] p-4 font-mono text-right shadow-inner">
        <div className="h-6 truncate text-xs text-neutral-400">
          {historyTape || '\u00A0'}
        </div>
        <div className="mt-1 truncate text-3xl font-semibold tracking-tight text-white">
          {display}
        </div>
      </div>

      {/* Tactile Keypad */}
      <div className="mt-4 grid grid-cols-4 gap-2 text-sm font-medium">
        <button
          onClick={handleClear}
          className="rounded-xl border border-white/10 bg-white/[0.06] p-3 text-rose-400 hover:bg-rose-500/20 active:scale-95 transition-all font-bold cursor-pointer"
          title="Clear (Escape or C)"
        >
          {display !== '0' || prevValue !== null ? 'C' : 'AC'}
        </button>
        <button
          onClick={handleBackspace}
          className="rounded-xl border border-white/10 bg-white/[0.06] p-3 flex items-center justify-center text-neutral-300 hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
          title="Backspace"
        >
          <Delete className="h-4 w-4" />
        </button>
        <button
          onClick={handlePercentage}
          className="rounded-xl border border-white/10 bg-white/[0.06] p-3 text-neutral-300 hover:bg-white/10 active:scale-95 transition-all font-semibold cursor-pointer"
          title="Percent (%)"
        >
          %
        </button>
        <button
          onClick={() => handleOperator('÷')}
          className={`rounded-xl border p-3 active:scale-95 transition-all font-bold cursor-pointer ${
            operator === '÷' && waitingForOperand
              ? 'border-white bg-white text-black shadow-md'
              : 'border-white/10 bg-[#181a28] text-amber-300 hover:bg-[#202436]'
          }`}
          title="Divide (/)"
        >
          ÷
        </button>

        {['7', '8', '9'].map((d) => (
          <button
            key={d}
            onClick={() => handleDigit(d)}
            className="rounded-xl border border-white/10 bg-[#151724] p-3 text-white hover:bg-[#1c1f30] active:scale-95 transition-all font-semibold cursor-pointer"
          >
            {d}
          </button>
        ))}
        <button
          onClick={() => handleOperator('×')}
          className={`rounded-xl border p-3 active:scale-95 transition-all font-bold cursor-pointer ${
            operator === '×' && waitingForOperand
              ? 'border-white bg-white text-black shadow-md'
              : 'border-white/10 bg-[#181a28] text-amber-300 hover:bg-[#202436]'
          }`}
          title="Multiply (*)"
        >
          ×
        </button>

        {['4', '5', '6'].map((d) => (
          <button
            key={d}
            onClick={() => handleDigit(d)}
            className="rounded-xl border border-white/10 bg-[#151724] p-3 text-white hover:bg-[#1c1f30] active:scale-95 transition-all font-semibold cursor-pointer"
          >
            {d}
          </button>
        ))}
        <button
          onClick={() => handleOperator('-')}
          className={`rounded-xl border p-3 active:scale-95 transition-all font-bold cursor-pointer ${
            operator === '-' && waitingForOperand
              ? 'border-white bg-white text-black shadow-md'
              : 'border-white/10 bg-[#181a28] text-amber-300 hover:bg-[#202436]'
          }`}
          title="Subtract (-)"
        >
          -
        </button>

        {['1', '2', '3'].map((d) => (
          <button
            key={d}
            onClick={() => handleDigit(d)}
            className="rounded-xl border border-white/10 bg-[#151724] p-3 text-white hover:bg-[#1c1f30] active:scale-95 transition-all font-semibold cursor-pointer"
          >
            {d}
          </button>
        ))}
        <button
          onClick={() => handleOperator('+')}
          className={`rounded-xl border p-3 active:scale-95 transition-all font-bold cursor-pointer ${
            operator === '+' && waitingForOperand
              ? 'border-white bg-white text-black shadow-md'
              : 'border-white/10 bg-[#181a28] text-amber-300 hover:bg-[#202436]'
          }`}
          title="Add (+)"
        >
          +
        </button>

        <button
          onClick={() => handleDigit('0')}
          className="col-span-2 rounded-xl border border-white/10 bg-[#151724] p-3 text-white hover:bg-[#1c1f30] active:scale-95 transition-all text-left pl-6 font-semibold cursor-pointer"
        >
          0
        </button>
        <button
          onClick={() => handleDigit('.')}
          className="rounded-xl border border-white/10 bg-[#151724] p-3 text-white hover:bg-[#1c1f30] active:scale-95 transition-all font-semibold cursor-pointer"
        >
          .
        </button>
        <button
          onClick={handleEqual}
          className="rounded-xl bg-white text-black p-3 font-bold shadow-lg hover:bg-neutral-200 active:scale-95 transition-all cursor-pointer"
          title="Calculate (= or Enter)"
        >
          =
        </button>
      </div>

      <div className="mt-2.5 text-center font-mono text-[9px] text-neutral-500">
        win:{windowId.slice(-4)} • Keyboard Active
      </div>
    </div>
  );
};

export const calculatorManifest: AppManifest = {
  id: 'calculator',
  name: 'Calculator',
  description: 'Tactile expression calculator with history tape and keyboard input.',
  category: 'utilities',
  icon: CalcIcon,
  defaultSize: { width: 330, height: 470 },
  constraints: { minWidth: 290, minHeight: 400, maxWidth: 450, maxHeight: 600 },
  allowMultipleInstances: true,
  permissions: [],
  component: CalculatorApp,
};
