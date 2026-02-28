/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Moon, 
  Sun, 
  History, 
  Delete, 
  RotateCcw, 
  Copy, 
  Check,
  Volume2,
  VolumeX,
  Settings2,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---

type Operator = '+' | '-' | '*' | '/' | '^' | null;

interface HistoryItem {
  expression: string;
  result: string;
  timestamp: number;
}

// --- Constants ---

const SCIENTIFIC_FUNCTIONS = [
  { label: 'sin', value: 'sin' },
  { label: 'cos', value: 'cos' },
  { label: 'tan', value: 'tan' },
  { label: 'log', value: 'log' },
  { label: 'ln', value: 'ln' },
  { label: '√', value: 'sqrt' },
  { label: 'π', value: 'PI' },
  { label: 'e', value: 'E' },
  { label: 'x²', value: 'pow2' },
  { label: 'xʸ', value: 'powY' },
  { label: '(', value: '(' },
  { label: ')', value: ')' },
];

// --- Components ---

export default function App() {
  // State
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isScientific, setIsScientific] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [memory, setMemory] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  const displayRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Initialize from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('calc-theme');
    if (savedTheme) setIsDarkMode(savedTheme === 'dark');
    
    const savedHistory = localStorage.getItem('calc-history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    const savedMemory = localStorage.getItem('calc-memory');
    if (savedMemory) setMemory(Number(savedMemory));

    const savedSound = localStorage.getItem('calc-sound');
    if (savedSound) setIsSoundOn(savedSound === 'true');
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('calc-theme', isDarkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('calc-history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('calc-memory', memory.toString());
  }, [memory]);

  useEffect(() => {
    localStorage.setItem('calc-sound', isSoundOn.toString());
  }, [isSoundOn]);

  // Sound feedback
  const playClick = useCallback(() => {
    if (!isSoundOn) return;

    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }

    const ctx = audioCtxRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.05);
    
    gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.05);
  }, [isSoundOn]);

  // Format number with commas
  const formatNumber = (numStr: string) => {
    if (numStr === 'Error' || numStr === 'Infinity' || isNaN(Number(numStr))) return numStr;
    const parts = numStr.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  // Calculation Logic
  const calculate = useCallback(() => {
    try {
      // Replace symbols for evaluation
      let expr = equation + display;
      expr = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/\^/g, '**');
      
      // Handle scientific functions
      expr = expr.replace(/sin\(/g, 'Math.sin(');
      expr = expr.replace(/cos\(/g, 'Math.cos(');
      expr = expr.replace(/tan\(/g, 'Math.tan(');
      expr = expr.replace(/log\(/g, 'Math.log10(');
      expr = expr.replace(/ln\(/g, 'Math.log(');
      expr = expr.replace(/sqrt\(/g, 'Math.sqrt(');
      expr = expr.replace(/PI/g, 'Math.PI');
      expr = expr.replace(/E/g, 'Math.E');

      // Basic evaluation (using Function instead of eval for slightly better safety)
      const result = new Function(`return ${expr}`)();
      
      if (!isFinite(result)) throw new Error('Infinity');
      
      const resultStr = Number(result.toFixed(10)).toString();
      
      setHistory(prev => [{
        expression: equation + display,
        result: resultStr,
        timestamp: Date.now()
      }, ...prev].slice(0, 50));

      setDisplay(resultStr);
      setEquation('');
      playClick();
    } catch (err) {
      setDisplay('Error');
      setEquation('');
    }
  }, [display, equation, playClick]);

  const handleInput = useCallback((val: string) => {
    playClick();
    setDisplay(prev => {
      if (prev === '0' || prev === 'Error') return val;
      return prev + val;
    });
  }, [playClick]);

  const handleOperator = useCallback((op: string) => {
    playClick();
    if (display === 'Error') return;
    setEquation(prev => prev + display + ' ' + op + ' ');
    setDisplay('0');
  }, [display, playClick]);

  const handleClear = useCallback(() => {
    playClick();
    setDisplay('0');
    setEquation('');
  }, [playClick]);

  const handleBackspace = useCallback(() => {
    playClick();
    setDisplay(prev => {
      if (prev.length === 1 || prev === 'Error') return '0';
      return prev.slice(0, -1);
    });
  }, [playClick]);

  const handleScientific = useCallback((func: string) => {
    playClick();
    switch (func) {
      case 'pow2':
        setDisplay(prev => (Math.pow(Number(prev), 2)).toString());
        break;
      case 'powY':
        handleOperator('^');
        break;
      case 'PI':
        setDisplay(Math.PI.toString());
        break;
      case 'E':
        setDisplay(Math.E.toString());
        break;
      default:
        setEquation(prev => prev + func + '(');
        setDisplay('0');
    }
  }, [handleOperator, playClick]);

  const handleMemory = useCallback((action: 'M+' | 'M-' | 'MR' | 'MC') => {
    playClick();
    const current = Number(display);
    switch (action) {
      case 'M+': setMemory(prev => prev + current); break;
      case 'M-': setMemory(prev => prev - current); break;
      case 'MR': setDisplay(memory.toString()); break;
      case 'MC': setMemory(0); break;
    }
  }, [display, memory, playClick]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(display);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Keyboard Support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') handleInput(e.key);
      if (e.key === '.') handleInput('.');
      if (e.key === '+') handleOperator('+');
      if (e.key === '-') handleOperator('-');
      if (e.key === '*') handleOperator('×');
      if (e.key === '/') handleOperator('÷');
      if (e.key === 'Enter' || e.key === '=') calculate();
      if (e.key === 'Backspace') handleBackspace();
      if (e.key === 'Escape') handleClear();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInput, handleOperator, calculate, handleBackspace, handleClear]);

  // Auto-scroll display
  useEffect(() => {
    if (displayRef.current) {
      displayRef.current.scrollLeft = displayRef.current.scrollWidth;
    }
  }, [display]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans selection:bg-emerald-500/30">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[var(--card-bg)] rounded-[2rem] shadow-2xl overflow-hidden border border-white/5 relative"
      >
        {/* Header / Toolbar */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex gap-2">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-indigo-600" />}
            </button>
            <button 
              onClick={() => setIsSoundOn(!isSoundOn)}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              title="Toggle Sound"
            >
              {isSoundOn ? <Volume2 size={18} className="text-emerald-500" /> : <VolumeX size={18} className="text-red-500" />}
            </button>
            <button 
              onClick={() => setIsScientific(!isScientific)}
              className={`p-2 rounded-full transition-colors ${isScientific ? 'bg-emerald-500/20 text-emerald-500' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
              title="Scientific Mode"
            >
              <Settings2 size={18} />
            </button>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className={`p-2 rounded-full transition-colors ${showHistory ? 'bg-emerald-500/20 text-emerald-500' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
              title="History"
            >
              <History size={18} />
            </button>
          </div>
        </div>

        {/* Display Section */}
        <div className="px-8 py-4 text-right">
          <div className="h-6 text-sm text-[var(--text-secondary)] font-mono overflow-hidden whitespace-nowrap opacity-70">
            {equation}
          </div>
          <div 
            ref={displayRef}
            className="text-5xl font-mono font-medium tracking-tighter overflow-x-auto whitespace-nowrap py-2 display-glow custom-scrollbar"
          >
            {formatNumber(display)}
          </div>
          <div className="flex justify-end gap-4 mt-2">
            <button 
              onClick={copyToClipboard}
              className="text-[10px] uppercase tracking-widest font-bold text-[var(--text-secondary)] hover:text-emerald-500 flex items-center gap-1 transition-colors"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy Result'}
            </button>
            {memory !== 0 && (
              <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-500">
                Memory: {formatNumber(memory.toString())}
              </span>
            )}
          </div>
        </div>

        {/* Keypad */}
        <div className="p-6 bg-black/5 dark:bg-white/5 grid grid-cols-4 gap-3">
          {/* Scientific Row (Conditional) */}
          <AnimatePresence>
            {isScientific && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="col-span-4 grid grid-cols-4 gap-3 overflow-hidden mb-2"
              >
                {SCIENTIFIC_FUNCTIONS.map((func) => (
                  <button
                    key={func.value}
                    onClick={() => handleScientific(func.value)}
                    className="calc-btn h-12 rounded-xl bg-black/5 dark:bg-white/5 text-xs font-bold uppercase tracking-wider hover:bg-emerald-500/20 hover:text-emerald-500 transition-all"
                  >
                    {func.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Memory Row */}
          <div className="col-span-4 grid grid-cols-4 gap-3 mb-2">
            {['MC', 'MR', 'M+', 'M-'].map((m) => (
              <button
                key={m}
                onClick={() => handleMemory(m as any)}
                className="calc-btn h-10 rounded-xl bg-black/5 dark:bg-white/5 text-[10px] font-black tracking-widest hover:bg-emerald-500/20 hover:text-emerald-500 transition-all"
              >
                {m}
              </button>
            ))}
          </div>

          {/* Main Keypad */}
          <button onClick={handleClear} className="calc-btn h-16 rounded-2xl bg-red-500/10 text-red-500 font-bold text-xl hover:bg-red-500 hover:text-white transition-all">AC</button>
          <button onClick={handleBackspace} className="calc-btn h-16 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-all"><Delete size={20} /></button>
          <button onClick={() => handleOperator('%')} className="calc-btn h-16 rounded-2xl bg-black/5 dark:bg-white/5 text-xl font-medium hover:bg-black/10 dark:hover:bg-white/10 transition-all">%</button>
          <button onClick={() => handleOperator('÷')} className="calc-btn h-16 rounded-2xl bg-amber-500/10 text-amber-500 text-2xl font-bold hover:bg-amber-500 hover:text-white transition-all">÷</button>

          {[7, 8, 9].map(n => (
            <button key={n} onClick={() => handleInput(n.toString())} className="calc-btn h-16 rounded-2xl bg-black/5 dark:bg-white/5 text-2xl font-medium hover:bg-black/10 dark:hover:bg-white/10 transition-all">{n}</button>
          ))}
          <button onClick={() => handleOperator('×')} className="calc-btn h-16 rounded-2xl bg-amber-500/10 text-amber-500 text-2xl font-bold hover:bg-amber-500 hover:text-white transition-all">×</button>

          {[4, 5, 6].map(n => (
            <button key={n} onClick={() => handleInput(n.toString())} className="calc-btn h-16 rounded-2xl bg-black/5 dark:bg-white/5 text-2xl font-medium hover:bg-black/10 dark:hover:bg-white/10 transition-all">{n}</button>
          ))}
          <button onClick={() => handleOperator('-')} className="calc-btn h-16 rounded-2xl bg-amber-500/10 text-amber-500 text-2xl font-bold hover:bg-amber-500 hover:text-white transition-all">−</button>

          {[1, 2, 3].map(n => (
            <button key={n} onClick={() => handleInput(n.toString())} className="calc-btn h-16 rounded-2xl bg-black/5 dark:bg-white/5 text-2xl font-medium hover:bg-black/10 dark:hover:bg-white/10 transition-all">{n}</button>
          ))}
          <button onClick={() => handleOperator('+')} className="calc-btn h-16 rounded-2xl bg-amber-500/10 text-amber-500 text-2xl font-bold hover:bg-amber-500 hover:text-white transition-all">+</button>

          <button onClick={() => handleInput('0')} className="calc-btn h-16 rounded-2xl bg-black/5 dark:bg-white/5 text-2xl font-medium hover:bg-black/10 dark:hover:bg-white/10 transition-all col-span-1">0</button>
          <button onClick={() => handleInput('.')} className="calc-btn h-16 rounded-2xl bg-black/5 dark:bg-white/5 text-2xl font-medium hover:bg-black/10 dark:hover:bg-white/10 transition-all">.</button>
          <button onClick={calculate} className="calc-btn h-16 rounded-2xl bg-emerald-500 text-white text-3xl font-bold shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition-all col-span-2">=</button>
        </div>

        {/* History Panel Overlay */}
        <AnimatePresence>
          {showHistory && (
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-0 bg-[var(--card-bg)] z-20 flex flex-col"
            >
              <div className="p-6 flex items-center justify-between border-bottom border-white/5">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <History size={20} className="text-emerald-500" />
                  History
                </h3>
                <button 
                  onClick={() => setShowHistory(false)}
                  className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {history.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-[var(--text-secondary)] opacity-50">
                    <RotateCcw size={48} className="mb-4" />
                    <p>No calculations yet</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {history.map((item, i) => (
                      <div 
                        key={item.timestamp} 
                        className="text-right group cursor-pointer"
                        onClick={() => {
                          setDisplay(item.result);
                          setShowHistory(false);
                        }}
                      >
                        <div className="text-xs text-[var(--text-secondary)] mb-1 font-mono">{item.expression}</div>
                        <div className="text-2xl font-mono font-medium text-emerald-500 group-hover:underline">
                          {formatNumber(item.result)}
                        </div>
                        <div className="text-[8px] uppercase tracking-widest text-[var(--text-secondary)] mt-1 opacity-50">
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-white/5">
                <button 
                  onClick={() => setHistory([])}
                  className="w-full py-3 rounded-xl bg-red-500/10 text-red-500 font-bold hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw size={16} />
                  Clear History
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Background Decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-amber-500/5 blur-[120px]" />
      </div>
    </div>
  );
}
