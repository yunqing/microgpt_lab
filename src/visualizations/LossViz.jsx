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
  const [targetIdx, setTargetIdx] = useState(4); // 'e'
  const [logitStrength, setLogitStrength] = useState(1.0);

  // Fake logits: boost target slightly based on strength
  const logits = TOKENS.map((_, i) => {
    if (i === targetIdx) return logitStrength * 2;
    return (Math.sin(i * 0.7 + 1.2) * logitStrength * 0.5);
  });
  const probs = softmax(logits);
  const pTarget = probs[targetIdx];
  const loss = -Math.log(pTarget);

  // Sort for display (top 8)
  const sorted = probs
    .map((p, i) => ({ p, i, char: TOKENS[i] }))
    .sort((a, b) => b.p - a.p)
    .slice(0, 10);

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-slate-500 mb-2 block">Target character:</label>
          <div className="grid grid-cols-7 gap-1">
            {'abcdefghijklmnopqrstuvwxyz⊕'.split('').slice(0, 14).map((c, i) => (
              <button
                key={c}
                onClick={() => setTargetIdx(i)}
                className={`h-7 text-xs font-mono rounded border transition-colors ${
                  targetIdx === i
                    ? 'bg-red-500/20 border-red-500 text-red-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-2 block">
            Model confidence: <span className="text-cyan-300 font-mono">{logitStrength.toFixed(1)}×</span>
          </label>
          <input
            type="range"
            min="0.1"
            max="4"
            step="0.1"
            value={logitStrength}
            onChange={e => setLogitStrength(parseFloat(e.target.value))}
            className="w-full accent-red-500"
          />
          <p className="text-xs text-slate-600 mt-1">Higher = stronger logits for target</p>
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

      {/* Probability bars */}
      <div>
        <p className="text-xs text-slate-500 mb-2">Top 10 token probabilities:</p>
        <div className="space-y-1.5">
          {sorted.map(({ p, i, char }) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-6 text-center text-sm font-mono ${i === targetIdx ? 'text-red-300 font-bold' : 'text-slate-400'}`}>
                {char}
              </div>
              <div className="flex-1 h-5 bg-slate-800 rounded overflow-hidden">
                <motion.div
                  className={`h-full rounded ${i === targetIdx ? 'bg-gradient-to-r from-red-500 to-orange-400' : 'bg-slate-600/60'}`}
                  animate={{ width: `${p * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className={`w-14 text-right text-xs font-mono ${i === targetIdx ? 'text-red-300' : 'text-slate-500'}`}>
                {(p * 100).toFixed(2)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
