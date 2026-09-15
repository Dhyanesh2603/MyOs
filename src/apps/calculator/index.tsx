import React, { useState, useEffect } from 'react';
import { Calculator as CalcIcon, Delete } from 'lucide-react';
import type { AppManifest, AppProps } from '@contracts/app';

const CalculatorApp: React.FC<AppProps> = ({ windowId }) => {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [hasResult, setHasResult] = useState(false);

  const handleDigit = (digit: string) => {
    if (hasResult) {
      setDisplay(digit);
      setExpression(digit);
      setHasResult(false);
      return;
    }

    if (display === '0' && digit !== '.') {
      setDisplay(digit);
      setExpression(digit);
    } else {
      if (digit === '.' && display.includes('.')) return;
      setDisplay(display + digit);
      setExpression(expression + digit);
    }
  };

  const handleOperator = (op: string) => {
    setHasResult(false);
    if (!expression && display !== '0') {
      setExpression(display + ' ' + op + ' ');
    } else {
      setExpression(expression + ' ' + op + ' ');
    }
    setDisplay('0');
  };

  const handleClear = () => {
    setDisplay('0');
    setExpression('');
    setHasResult(false);
  };

  const handleBackspace = () => {
    if (hasResult) {
      handleClear();
      return;
    }
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
      setExpression(expression.slice(0, -1));
    } else {
      setDisplay('0');
      setExpression('');
    }
  };

  const handleEqual = () => {
    if (!expression) return;
    try {
      // Safe sanitized arithmetic evaluator
      const sanitized = expression.replace(/×/g, '*').replace(/÷/g, '/');
      if (!/^[0-9+\-*/.\s()]+$/.test(sanitized)) return;

      // Evaluate safely
      const result = Function(`'use strict'; return (${sanitized})`)();
      const formatted = String(Math.round(result * 1000000) / 1000000);

      setDisplay(formatted);
      setExpression(`${expression} = ${formatted}`);
      setHasResult(true);
    } catch {
      setDisplay('Error');
      setHasResult(true);
    }
  };

  // Physical keyboard listeners when window is focused
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/[0-9.]/.test(e.key)) {
        handleDigit(e.key);
      } else if (e.key === '+') {
        handleOperator('+');
      } else if (e.key === '-') {
        handleOperator('-');
      } else if (e.key === '*' || e.key.toLowerCase() === 'x') {
        handleOperator('×');
      } else if (e.key === '/') {
        handleOperator('÷');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEqual();
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key.toLowerCase() === 'c' || e.key === 'Escape') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div className="flex h-full w-full flex-col bg-surface-panel p-4 text-content-primary select-none">
      {/* Expression Tape Display */}
      <div className="flex flex-1 flex-col justify-end rounded-2xl border border-white/5 bg-surface-overlay/40 p-4 font-mono text-right">
        <div className="h-6 truncate text-xs text-content-tertiary">
          {expression || ' '}
        </div>
        <div className="mt-1 truncate text-3xl font-light tracking-tight text-content-primary">
          {display}
        </div>
      </div>

      {/* Tactile Keypad */}
      <div className="mt-4 grid grid-cols-4 gap-2 text-sm font-medium">
        <button
          onClick={handleClear}
          className="rounded-xl border border-white/5 bg-white/5 p-3 text-rose-400 hover:bg-rose-500/10 active:scale-95 transition-all"
        >
          AC
        </button>
        <button
          onClick={handleBackspace}
          className="rounded-xl border border-white/5 bg-white/5 p-3 flex items-center justify-center text-content-secondary hover:bg-white/10 active:scale-95 transition-all"
        >
          <Delete className="h-4 w-4" />
        </button>
        <button
          onClick={() => handleOperator('%')}
          className="rounded-xl border border-white/5 bg-white/5 p-3 text-content-secondary hover:bg-white/10 active:scale-95 transition-all"
        >
          %
        </button>
        <button
          onClick={() => handleOperator('÷')}
          className="rounded-xl border border-accent-primary/20 bg-accent-muted/40 p-3 text-accent-hover hover:bg-accent-primary/30 active:scale-95 transition-all"
        >
          ÷
        </button>

        {['7', '8', '9'].map((d) => (
          <button
            key={d}
            onClick={() => handleDigit(d)}
            className="rounded-xl border border-white/5 bg-white/[0.04] p-3 text-content-primary hover:bg-white/10 active:scale-95 transition-all"
          >
            {d}
          </button>
        ))}
        <button
          onClick={() => handleOperator('×')}
          className="rounded-xl border border-accent-primary/20 bg-accent-muted/40 p-3 text-accent-hover hover:bg-accent-primary/30 active:scale-95 transition-all"
        >
          ×
        </button>

        {['4', '5', '6'].map((d) => (
          <button
            key={d}
            onClick={() => handleDigit(d)}
            className="rounded-xl border border-white/5 bg-white/[0.04] p-3 text-content-primary hover:bg-white/10 active:scale-95 transition-all"
          >
            {d}
          </button>
        ))}
        <button
          onClick={() => handleOperator('-')}
          className="rounded-xl border border-accent-primary/20 bg-accent-muted/40 p-3 text-accent-hover hover:bg-accent-primary/30 active:scale-95 transition-all"
        >
          -
        </button>

        {['1', '2', '3'].map((d) => (
          <button
            key={d}
            onClick={() => handleDigit(d)}
            className="rounded-xl border border-white/5 bg-white/[0.04] p-3 text-content-primary hover:bg-white/10 active:scale-95 transition-all"
          >
            {d}
          </button>
        ))}
        <button
          onClick={() => handleOperator('+')}
          className="rounded-xl border border-accent-primary/20 bg-accent-muted/40 p-3 text-accent-hover hover:bg-accent-primary/30 active:scale-95 transition-all"
        >
          +
        </button>

        <button
          onClick={() => handleDigit('0')}
          className="col-span-2 rounded-xl border border-white/5 bg-white/[0.04] p-3 text-content-primary hover:bg-white/10 active:scale-95 transition-all text-left pl-6"
        >
          0
        </button>
        <button
          onClick={() => handleDigit('.')}
          className="rounded-xl border border-white/5 bg-white/[0.04] p-3 text-content-primary hover:bg-white/10 active:scale-95 transition-all"
        >
          .
        </button>
        <button
          onClick={handleEqual}
          className="rounded-xl bg-accent-primary p-3 text-white shadow-md hover:bg-accent-hover active:scale-95 transition-all"
        >
          =
        </button>
      </div>

      <div className="mt-2 text-center font-mono text-[9px] text-content-tertiary">
        win: {windowId.slice(-6)} • Keyboard Input Enabled
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
