import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw } from 'lucide-react';

const CHARS = 'abcdefghijklmnopqrstuvwxyz'.split('');
const BOS = 26;

function softmax(logits, temp) {
  const scaled = logits.map(v => v / temp);
  const max = Math.max(...scaled);
  const exps = scaled.map(v => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(v => v / sum);
}

// Very simple "model" for demo — produces name-like output
function fakeLogits(step, prevChar, seed) {
  // Name-starter distribution
  const nameStarts = [0, 4, 8, 14, 20]; // a, e, i, o, u more likely at start
  const base = CHARS.map((_, i) => {
    let w = Math.sin(i * 0.4 + seed * 0.7) * 0.5 + 0.5;
    if (step === 0) w += nameStarts.includes(i) ? 1 : 0;
    if (step > 2 && step > seed % 4 + 2) w *= 0.5; // shorter names
    return w;
  });
  // BOS (end) probability increases with step
  const endProb = Math.min(0.4, step * 0.08);
  return [...base, endProb * 5];
}

export default function InferenceViz() {
  const [temperature, setTemperature] = useState(0.5);
  const [generating, setGenerating] = useState(false);
  const [sample, setSample] = useState([]);
  const [probs, setProbs] = useState(null);
  const [done, setDone] = useState(false);
  const [seed] = useState(Math.floor(Math.random() * 100));
  const stepRef = useRef(0);

  const reset = () => {
    setGenerating(false);
    setSample([]);
    setProbs(null);
    setDone(false);
    stepRef.current = 0;
  };

  const step = () => {
    const st = stepRef.current;
    if (st >= 12) { setDone(true); setGenerating(false); return; }
    const logits = fakeLogits(st, sample[sample.length - 1] ?? BOS, seed);
    const p = softmax(logits, temperature);
    setProbs(p);

    // Weighted sample
    const rand = Math.random();
    let cumsum = 0;
    let chosen = BOS;
    for (let i = 0; i < p.length; i++) {
      cumsum += p[i];
      if (rand < cumsum) { chosen = i; break; }
    }

    if (chosen === BOS) {
      setDone(true);
      setGenerating(false);
    } else {
      setSample(s => [...s, CHARS[chosen]]);
      stepRef.current++;
    }
  };

  useEffect(() => {
    let timer;
    if (generating && !done) {
      timer = setTimeout(() => { step(); }, 400);
    }
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generating, sample, done]);

  const topProbs = probs
    ? [...probs.map((p, i) => ({ p, char: i < 26 ? CHARS[i] : '⊕', i }))].sort((a, b) => b.p - a.p).slice(0, 8)
    : [];

  return (
    <div className="space-y-5">
      {/* Temperature */}
      <div>
        <label className="text-xs text-slate-500 mb-1 block">
          Temperature: <span className="text-emerald-300 font-mono">{temperature.toFixed(1)}</span>
          <span className="text-slate-600 ml-2">
            {temperature < 0.5 ? '(very deterministic)' : temperature < 1 ? '(balanced)' : '(creative/random)'}
          </span>
        </label>
        <input
          type="range" min="0.1" max="2" step="0.1"
          value={temperature}
          onChange={e => { setTemperature(parseFloat(e.target.value)); reset(); }}
          className="w-full accent-emerald-500"
        />
      </div>

      {/* Input/Output display */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Input (context) */}
          <div>
            <div className="text-xs text-slate-500 mb-2">Decoder Input (context):</div>
            <div className="bg-slate-900 rounded-lg p-3 min-h-16 flex items-center">
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-sm font-mono text-purple-400">⊕</span>
                {sample.map((ch, i) => (
                  <span
                    key={i}
                    className="text-lg font-mono text-slate-300"
                  >
                    {ch}
                  </span>
                ))}
                {!done && sample.length > 0 && (
                  <motion.span
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="text-lg font-mono text-cyan-400"
                  >
                    _
                  </motion.span>
                )}
              </div>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              {sample.length === 0 ? 'Start with BOS token' : `${sample.length} tokens fed to model`}
            </p>
          </div>

          {/* Output (next token) */}
          <div>
            <div className="text-xs text-slate-500 mb-2">Next Token Prediction:</div>
            <div className="bg-slate-900 rounded-lg p-3 min-h-16 flex items-center justify-center">
              {sample.length > 0 && !done && (
                <motion.span
                  key={`${sample.length}-${sample[sample.length - 1]}`}
                  initial={{ scale: 0, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  className="text-3xl font-mono font-bold text-cyan-300"
                >
                  {sample[sample.length - 1]}
                </motion.span>
              )}
              {generating && !done && sample.length === 0 && (
                <span className="text-sm text-slate-600">Generating...</span>
              )}
              {done && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-3xl font-mono text-purple-400">⊕</motion.span>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-1">
              {done ? 'Model output BOS (end)' : sample.length > 0 ? 'Just generated' : 'Waiting...'}
            </p>
          </div>
        </div>

        {/* Autoregressive flow */}
        <div className="mt-3 pt-3 border-t border-slate-700">
          <p className="text-xs text-slate-500 mb-2">Autoregressive generation flow:</p>
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <div className="bg-slate-900 rounded px-2 py-1 font-mono text-purple-400">⊕</div>
            <span className="text-slate-600">→</span>
            {sample.slice(0, 3).map((ch, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="bg-slate-900 rounded px-2 py-1 font-mono text-cyan-300">{ch}</div>
                <span className="text-slate-600">→</span>
              </div>
            ))}
            {sample.length > 3 && (
              <>
                <span className="text-slate-600">...</span>
                <span className="text-slate-600">→</span>
              </>
            )}
            {!done && generating && (
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="bg-cyan-500/20 border border-cyan-500/50 rounded px-2 py-1 text-cyan-400"
              >
                ?
              </motion.div>
            )}
            {done && (
              <div className="bg-slate-900 rounded px-2 py-1 font-mono text-purple-400">⊕</div>
            )}
          </div>
          <p className="text-xs text-slate-600 mt-2">
            Each output token is fed back as input for next prediction
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <button
          onClick={() => { if (!done) setGenerating(g => !g); }}
          disabled={done}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-emerald-300 text-sm hover:bg-emerald-500/30 disabled:opacity-40 transition-colors"
        >
          <Play size={12} /> {generating ? 'Generating...' : 'Generate'}
        </button>
        <button onClick={reset} className="flex items-center gap-1.5 px-3 py-2 text-xs text-slate-400 border border-slate-700 rounded-lg hover:text-slate-300">
          <RotateCcw size={12} /> New name
        </button>
      </div>

      {/* Probability distribution */}
      {probs && (
        <div>
          <p className="text-xs text-slate-500 mb-2">Distribution at last step (T={temperature.toFixed(1)}):</p>
          <div className="space-y-1">
            {topProbs.map(({ p, char, i }) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-5 text-xs font-mono text-center text-slate-300">{char}</span>
                <div className="flex-1 h-4 bg-slate-800 rounded overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-500/70 to-cyan-500/70 rounded"
                    animate={{ width: `${p * 100}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
                <span className="text-xs font-mono text-slate-500 w-12 text-right">{(p * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-600 mt-2">
            At T=0.1, the top token dominates. At T=2.0, probabilities flatten — all tokens equally likely.
          </p>
        </div>
      )}
    </div>
  );
}
