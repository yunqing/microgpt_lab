import { useState } from 'react';
import { motion } from 'framer-motion';

function softmax(arr) {
  const max = Math.max(...arr);
  const exps = arr.map(v => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(v => v / sum);
}

function dot(a, b) {
  return a.reduce((s, v, i) => s + v * b[i], 0);
}

// Seed-based random vectors for demo (no BigInt)
function seedVec(seed, dim) {
  let s = seed;
  return Array.from({ length: dim }, () => {
    s = ((s * 1664525 + 1013904223) & 0x7fffffff);
    return (s / 0x7fffffff - 0.5) * 2;
  });
}

const HEAD_DIM = 4;
const TOKENS = ['⊕', 'e', 'm', 'm', 'a', '⊕'];

export default function AttentionViz() {
  const [queryPos, setQueryPos] = useState(4); // 'a'
  const [temperature, setTemperature] = useState(1.0);

  // Generate Q/K vectors for each position
  const Qs = TOKENS.map((_, i) => seedVec(i * 7 + 1, HEAD_DIM));
  const Ks = TOKENS.map((_, i) => seedVec(i * 13 + 3, HEAD_DIM));

  const q = Qs[queryPos];
  // Can only attend to positions <= queryPos (causal)
  const scores = TOKENS.slice(0, queryPos + 1).map((_, t) => {
    return dot(q, Ks[t]) / (Math.sqrt(HEAD_DIM) * temperature);
  });
  const weights = softmax(scores);

  return (
    <div className="space-y-5">
      {/* Query position selector */}
      <div>
        <p className="text-xs text-slate-500 mb-2">
          Query token: position <span className="text-cyan-400 font-mono">{queryPos}</span> = "<span className="text-cyan-400">{TOKENS[queryPos]}</span>"
        </p>
        <div className="flex gap-2">
          {TOKENS.map((tok, i) => (
            <button
              key={i}
              onClick={() => setQueryPos(i)}
              className={`flex-1 py-2 rounded-lg border text-sm font-mono transition-all ${
                queryPos === i
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              {tok}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-xs text-slate-600 mt-1">
          {TOKENS.map((_, i) => <span key={i}>{i}</span>)}
        </div>
      </div>

      {/* Temperature */}
      <div>
        <p className="text-xs text-slate-500 mb-1">
          Temperature: <span className="text-indigo-300 font-mono">{temperature.toFixed(1)}</span>
          <span className="text-slate-600 ml-2">(lower = sharper attention)</span>
        </p>
        <input
          type="range"
          min="0.1"
          max="3"
          step="0.1"
          value={temperature}
          onChange={e => setTemperature(parseFloat(e.target.value))}
          className="w-full accent-indigo-500"
        />
      </div>

      {/* Attention weights visualization */}
      <div>
        <p className="text-xs text-slate-500 mb-3">
          Attention weights (position {queryPos} attending to positions 0–{queryPos}):
        </p>
        <div className="space-y-2">
          {weights.map((w, t) => (
            <div key={t} className="flex items-center gap-3">
              <div className="w-8 text-sm font-mono text-center text-slate-300">{TOKENS[t]}</div>
              <div className="flex-1 h-6 bg-slate-800 rounded-lg overflow-hidden">
                <motion.div
                  className="h-full rounded-lg"
                  style={{
                    background: `linear-gradient(90deg, rgba(6,182,212,0.8), rgba(99,102,241,0.8))`,
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${w * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="w-14 text-right text-xs font-mono text-cyan-300">{(w * 100).toFixed(1)}%</div>
              <div className="w-16 text-xs font-mono text-slate-500">score:{scores[t].toFixed(2)}</div>
            </div>
          ))}
          {/* Future positions (masked) */}
          {TOKENS.slice(queryPos + 1).map((tok, i) => (
            <div key={`masked-${i}`} className="flex items-center gap-3 opacity-25">
              <div className="w-8 text-sm font-mono text-center text-slate-600">{tok}</div>
              <div className="flex-1 h-6 bg-slate-800/50 rounded-lg border border-dashed border-slate-700" />
              <div className="w-14 text-right text-xs font-mono text-slate-600">masked</div>
              <div className="w-16 text-xs font-mono text-slate-700">-∞</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
        <p className="text-xs text-slate-400">
          <span className="text-cyan-400">Causal masking</span>: position {queryPos} can only attend to tokens ≤ {queryPos}.
          Future tokens are masked with -∞ before softmax, becoming 0 attention weight.
        </p>
      </div>
    </div>
  );
}
