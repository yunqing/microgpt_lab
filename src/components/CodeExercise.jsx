import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Play, Lightbulb, Eye, RotateCcw, CheckCircle, XCircle } from 'lucide-react';

export default function CodeExercise({ exercise, levelId }) {
  const [code, setCode] = useState(exercise.template);
  const [result, setResult] = useState(null);
  const [hintsShown, setHintsShown] = useState(0);
  const [solutionShown, setSolutionShown] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const textareaRef = useRef(null);

  const handleCheck = () => {
    const r = exercise.validate(code);
    setResult(r);
    setAttempts(a => a + 1);
  };

  const handleReset = () => {
    setCode(exercise.template);
    setResult(null);
  };

  const handleShowHint = () => {
    setHintsShown(h => Math.min(h + 1, exercise.hints.length));
  };

  const handleTabKey = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = textareaRef.current;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newCode = code.substring(0, start) + '    ' + code.substring(end);
      setCode(newCode);
      // restore cursor after state update
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 4;
      });
    }
  };

  const passed = result?.pass;

  return (
    <div className="border border-slate-700 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800/80 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-cyan-400" />
          <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">
            Code Practice
          </span>
          <span className="text-xs text-slate-500 font-mono">Python</span>
        </div>
        <div className="flex items-center gap-2">
          {attempts > 0 && (
            <span className="text-xs text-slate-500 font-mono">{attempts} attempt{attempts > 1 ? 's' : ''}</span>
          )}
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            <RotateCcw size={11} /> Reset
          </button>
        </div>
      </div>

      <div className="bg-slate-900/60 p-4 space-y-4">
        {/* Description */}
        <p className="text-sm text-slate-300 leading-relaxed">{exercise.description}</p>

        {/* Code editor */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={code}
            onChange={e => { setCode(e.target.value); setResult(null); }}
            onKeyDown={handleTabKey}
            spellCheck={false}
            rows={code.split('\n').length + 1}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-xs font-mono text-slate-200 resize-none focus:outline-none focus:border-cyan-600 leading-relaxed"
            style={{ fontFamily: "'Fira Code', 'Cascadia Code', 'Courier New', monospace", minHeight: '160px' }}
          />
          {/* Line gutter hint */}
          <div className="absolute top-3 right-3 text-xs text-slate-700 font-mono select-none pointer-events-none">
            Tab = 4 spaces
          </div>
        </div>

        {/* Action row */}
        <div className="flex items-center gap-2 flex-wrap">
          <motion.button
            onClick={handleCheck}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-1.5 px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-cyan-300 text-sm font-semibold hover:bg-cyan-500/30 transition-colors"
          >
            <Play size={12} /> Run &amp; Check
          </motion.button>

          {hintsShown < exercise.hints.length && (
            <button
              onClick={handleShowHint}
              className="flex items-center gap-1.5 px-3 py-2 text-xs text-yellow-400/80 border border-yellow-500/30 rounded-lg hover:bg-yellow-500/10 transition-colors"
            >
              <Lightbulb size={12} />
              Hint {hintsShown + 1}/{exercise.hints.length}
            </button>
          )}

          {(attempts >= 2 || passed) && !solutionShown && (
            <button
              onClick={() => setSolutionShown(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs text-slate-400 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <Eye size={12} /> Show Solution
            </button>
          )}
        </div>

        {/* Hints */}
        <AnimatePresence>
          {hintsShown > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="overflow-hidden space-y-2"
            >
              {exercise.hints.slice(0, hintsShown).map((hint, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-2 bg-yellow-500/8 border border-yellow-500/20 rounded-lg px-3 py-2"
                >
                  <Lightbulb size={12} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-200/80 leading-relaxed">{hint}</p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              key={attempts}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl border overflow-hidden ${passed ? 'border-emerald-500/40' : 'border-red-500/30'}`}
            >
              {/* Result header */}
              <div className={`flex items-center gap-2 px-4 py-2.5 ${passed ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                {passed
                  ? <CheckCircle size={14} className="text-emerald-400" />
                  : <XCircle size={14} className="text-red-400" />
                }
                <span className={`text-sm font-semibold ${passed ? 'text-emerald-300' : 'text-red-300'}`}>
                  {result.message}
                </span>
              </div>

              {/* Check list */}
              <div className="px-4 py-3 space-y-1.5 bg-slate-900/40">
                {result.checks.map((check, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-2 text-xs"
                  >
                    {check.ok
                      ? <CheckCircle size={12} className="text-emerald-400 flex-shrink-0" />
                      : <XCircle size={12} className="text-red-400 flex-shrink-0" />
                    }
                    <span className={check.ok ? 'text-slate-400' : 'text-slate-300'}>
                      {check.label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Solution reveal */}
        <AnimatePresence>
          {solutionShown && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="overflow-hidden"
            >
              <div className="border border-indigo-500/30 rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border-b border-indigo-500/20">
                  <Eye size={12} className="text-indigo-400" />
                  <span className="text-xs font-semibold text-indigo-300">Reference Solution</span>
                </div>
                <pre className="p-4 text-xs font-mono text-slate-300 bg-slate-950/60 overflow-x-auto leading-relaxed whitespace-pre-wrap">
                  {exercise.solution}
                </pre>
                <div className="px-4 py-2 bg-slate-900/40">
                  <button
                    onClick={() => { setCode(exercise.solution); setSolutionShown(false); setResult(null); }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    ← Copy solution to editor
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
