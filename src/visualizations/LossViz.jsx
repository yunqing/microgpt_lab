import { useState } from 'react';
import { motion } from 'framer-motion';

function softmax(arr) {
  const max = Math.max(...arr);
  const exps = arr.map(v => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(v => v / sum);
}

const TOKENS = 'abcdefghijklmnopqrstuvwxyz⊕'.split('');

export default function LossViz() {
  // Fixed target: 'e' (index 4)
  const targetIdx = 4;

  // Initialize logits: target gets higher value, others get random lower values
  const [logits, setLogits] = useState(() =>
    TOKENS.map((_, i) => i === targetIdx ? 3.0 : Math.random() * 0.5 - 0.25)
  );

  const probs = softmax(logits);
  const pTarget = probs[targetIdx];
  const loss = -Math.log(pTarget);

  const adjustLogit = (idx, delta) => {
    setLogits(prev => {
      const newLogits = [...prev];
      newLogits[idx] = Math.max(-5, Math.min(5, newLogits[idx] + delta));
      return newLogits;
    });
  };

  // Sort for display (top 10)
  const sorted = probs
    .map((p, i) => ({ p, i, char: TOKENS[i], logit: logits[i] }))
    .sort((a, b) => b.p - a.p)
    .slice(0, 10);

  return (
    <div className="space-y-5">
      {/* Target display */}
      <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
        <p className="text-xs text-slate-500 mb-1">Target (ground truth):</p>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-red-500/20 border-2 border-red-500 flex items-center justify-center">
            <span className="text-xl font-mono text-red-300 font-bold">{TOKENS[targetIdx]}</span>
          </div>
          <p className="text-xs text-slate-400">The model should predict this character</p>
        </div>
      </div>

      {/* Loss display */}
      <motion.div
        className={`rounded-xl p-4 border text-center ${
          loss < 1 ? 'border-emerald-500/40 bg-emerald-500/10' :
          loss < 2.5 ? 'border-yellow-500/40 bg-yellow-500/10' :
          'border-red-500/40 bg-red-500/10'
        }`}
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 0.3 }}
        key={loss}
      >
        <p className="text-xs text-slate-400 mb-1">Cross-Entropy Loss</p>
        <p className={`text-3xl font-mono font-bold ${
          loss < 1 ? 'text-emerald-300' : loss < 2.5 ? 'text-yellow-300' : 'text-red-300'
        }`}>
          {loss.toFixed(4)}
        </p>
        <p className="text-xs text-slate-500 mt-1">
          -log(p[{TOKENS[targetIdx]}]) = -log({pTarget.toFixed(4)})
        </p>
        <p className="text-xs mt-1 text-slate-400">
          {loss < 0.5 ? '🎯 Model is confident & correct' :
           loss < 2 ? '📈 Model learning...' :
           '📉 Model is confused — high loss'}
        </p>
      </motion.div>

      {/* Model output probabilities (adjustable) */}
      <div>
        <p className="text-xs text-slate-500 mb-2">Model output (adjust logits to see loss change):</p>
        <div className="space-y-1.5">
          {sorted.map(({ p, i, char, logit }) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-6 text-center text-sm font-mono ${i === targetIdx ? 'text-red-300 font-bold' : 'text-slate-400'}`}>
                {char}
                {i === targetIdx && <span className="text-xs">★</span>}
              </div>
              <div className="flex-1 h-6 bg-slate-800 rounded overflow-hidden relative">
                <motion.div
                  className={`h-full rounded ${i === targetIdx ? 'bg-gradient-to-r from-red-500 to-orange-400' : 'bg-slate-600/60'}`}
                  animate={{ width: `${p * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className={`w-16 text-right text-xs font-mono ${i === targetIdx ? 'text-red-300' : 'text-slate-500'}`}>
                {(p * 100).toFixed(2)}%
              </div>
              <div className="flex gap-0.5">
                <button
                  onClick={() => adjustLogit(i, -0.5)}
                  className="w-6 h-6 text-xs bg-slate-800 border border-slate-700 rounded text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-colors"
                >
                  −
                </button>
                <button
                  onClick={() => adjustLogit(i, 0.5)}
                  className="w-6 h-6 text-xs bg-slate-800 border border-slate-700 rounded text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-3">
          💡 Try increasing the target '{TOKENS[targetIdx]}' logit (lower loss) or increasing other logits (higher loss)
        </p>
      </div>

      {/* Reset button */}
      <button
        onClick={() => setLogits(TOKENS.map((_, i) => i === targetIdx ? 3.0 : Math.random() * 0.5 - 0.25))}
        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 text-sm hover:text-cyan-400 hover:border-cyan-500/50 transition-colors"
      >
        Reset to random logits
      </button>
    </div>
  );
}
