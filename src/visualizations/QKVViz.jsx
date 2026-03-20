import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';

const N_EMBD = 16;
const N_HEAD = 4;
const HEAD_DIM = 4; // N_EMBD / N_HEAD

// Deterministic pseudo-random matrix
function seededMatrix(rows, cols, seed) {
  let s = seed;
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => {
      s = ((s * 1664525 + 1013904223) & 0x7fffffff);
      return (s / 0x7fffffff - 0.5) * 0.4;
    })
  );
}

// Matrix-vector multiply: out[i] = sum_j W[i][j] * x[j]
function matvec(W, x) {
  return W.map(row => row.reduce((sum, w, j) => sum + w * x[j], 0));
}

// Seeded input vector
function seededVec(dim, seed) {
  let s = seed;
  return Array.from({ length: dim }, () => {
    s = ((s * 1664525 + 1013904223) & 0x7fffffff);
    return (s / 0x7fffffff - 0.5) * 1.2;
  });
}

const Wq = seededMatrix(N_EMBD, N_EMBD, 11);
const Wk = seededMatrix(N_EMBD, N_EMBD, 31);
const Wv = seededMatrix(N_EMBD, N_EMBD, 53);

const HEAD_COLORS = [
  { bg: 'bg-cyan-500', border: 'border-cyan-500', text: 'text-cyan-300', ring: 'ring-cyan-500', fill: 'rgba(6,182,212,', badge: 'bg-cyan-500/20' },
  { bg: 'bg-indigo-500', border: 'border-indigo-500', text: 'text-indigo-300', ring: 'ring-indigo-500', fill: 'rgba(99,102,241,', badge: 'bg-indigo-500/20' },
  { bg: 'bg-violet-500', border: 'border-violet-500', text: 'text-violet-300', ring: 'ring-violet-500', fill: 'rgba(139,92,246,', badge: 'bg-violet-500/20' },
  { bg: 'bg-teal-500', border: 'border-teal-500', text: 'text-teal-300', ring: 'ring-teal-500', fill: 'rgba(20,184,166,', badge: 'bg-teal-500/20' },
];

function ValueBar({ value, maxAbs, colorFill, animated = false, delay = 0 }) {
  const pct = Math.min(100, (Math.abs(value) / (maxAbs + 0.001)) * 100);
  return (
    <div className="relative flex flex-col justify-center h-full w-full">
      <div
        className="absolute inset-0 rounded-sm"
        style={{ background: value >= 0 ? `${colorFill}0.15)` : 'rgba(239,68,68,0.15)' }}
      />
      <motion.div
        className="absolute bottom-0 left-0 right-0 rounded-sm"
        style={{ background: value >= 0 ? `${colorFill}0.7)` : 'rgba(239,68,68,0.7)' }}
        initial={animated ? { height: 0 } : { height: `${pct}%` }}
        animate={{ height: `${pct}%` }}
        transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      />
    </div>
  );
}

export default function QKVViz() {
  const [selectedHead, setSelectedHead] = useState(null);
  const [showProjection, setShowProjection] = useState(false);

  // Use a fixed input vector for repeatability
  const x = useMemo(() => seededVec(N_EMBD, 77), []);

  // Full projections
  const q_full = useMemo(() => matvec(Wq, x), [x]);
  const k_full = useMemo(() => matvec(Wk, x), [x]);
  const v_full = useMemo(() => matvec(Wv, x), [x]);

  const xMax = Math.max(...x.map(Math.abs));

  // Split into heads: each head gets HEAD_DIM dimensions
  const heads = useMemo(() => {
    return Array.from({ length: N_HEAD }, (_, h) => {
      const start = h * HEAD_DIM;
      const end = start + HEAD_DIM;
      return {
        q: q_full.slice(start, end),
        k: k_full.slice(start, end),
        v: v_full.slice(start, end),
      };
    });
  }, [q_full, k_full, v_full]);

  // Attention score for selected head
  const headScore = useMemo(() => {
    if (selectedHead === null) return null;
    const { q, k } = heads[selectedHead];
    const dot = q.reduce((s, qi, i) => s + qi * k[i], 0);
    return dot / Math.sqrt(HEAD_DIM);
  }, [selectedHead, heads]);

  return (
    <div className="space-y-4 select-none">
      {/* Instruction */}
      <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
        <p className="text-xs text-slate-400 mb-1">
          <span className="text-cyan-400 font-semibold">Multi-Head Attention</span> splits the full projection into {N_HEAD} parallel heads:
        </p>
        <p className="text-xs text-slate-500 font-mono">
          Q/K/V [16] → split into {N_HEAD} heads × [4] dimensions each
        </p>
      </div>

      {/* Input vector x */}
      <div>
        <p className="text-xs text-slate-400 font-mono mb-1.5">
          x<span className="text-slate-600">[16]</span> — input after RMSNorm
        </p>
        <div className="flex gap-0.5 h-10">
          {x.map((v, i) => {
            const h = Math.floor(i / HEAD_DIM);
            const hc = HEAD_COLORS[h];
            return (
              <motion.div
                key={i}
                className={`relative flex-1 h-full rounded-sm ${
                  selectedHead === h ? `ring-1 ${hc.ring}` : ''
                }`}
              >
                <ValueBar value={v} maxAbs={xMax} colorFill="rgba(148,163,184," animated={false} />
              </motion.div>
            );
          })}
        </div>
        {/* Head regions */}
        <div className="flex mt-1">
          {Array.from({ length: N_HEAD }, (_, h) => (
            <div key={h} className={`flex-1 text-center text-xs ${HEAD_COLORS[h].text} opacity-50`}>
              h{h + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Project button */}
      <div className="flex items-center gap-2">
        <motion.button
          onClick={() => setShowProjection(p => !p)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors font-semibold ${
            showProjection
              ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300'
              : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-500'
          }`}
        >
          <Zap size={11} />
          {showProjection ? 'Hide projections' : 'Project: x → Q, K, V'}
        </motion.button>
        <span className="text-xs text-slate-600">W_q, W_k, W_v each [16×16]</span>
      </div>

      {/* Full projections (before splitting) */}
      <AnimatePresence>
        {showProjection && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 overflow-hidden"
          >
            {[
              { label: 'Q', vec: q_full, color: 'cyan' },
              { label: 'K', vec: k_full, color: 'indigo' },
              { label: 'V', vec: v_full, color: 'violet' },
            ].map(({ label, vec, color }) => {
              const max = Math.max(...vec.map(Math.abs));
              return (
                <div key={label}>
                  <p className="text-xs mb-1.5">
                    <span className={`font-mono font-bold text-${color}-300`}>{label}</span>
                    <span className="text-slate-600"> = W_{label.toLowerCase()} · x [16]</span>
                    <span className="text-slate-500 ml-2">→ will be split into {N_HEAD} heads</span>
                  </p>
                  <div className="flex gap-0.5 h-10">
                    {vec.map((val, i) => {
                      const h = Math.floor(i / HEAD_DIM);
                      const hc = HEAD_COLORS[h];
                      return (
                        <motion.div
                          key={i}
                          className={`relative flex-1 h-full rounded-sm ${
                            selectedHead === h ? `ring-1 ${hc.ring}` : ''
                          }`}
                        >
                          <ValueBar
                            value={val}
                            maxAbs={max}
                            colorFill={hc.fill}
                            animated={true}
                            delay={i * 0.018}
                          />
                        </motion.div>
                      );
                    })}
                  </div>
                  {/* Head boundaries */}
                  <div className="flex mt-0.5">
                    {Array.from({ length: N_HEAD }, (_, h) => (
                      <div key={h} className={`flex-1 text-center text-xs ${HEAD_COLORS[h].text} opacity-40`}>
                        h{h + 1}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Multi-head cards */}
      <div className="border-t border-slate-700 pt-3">
        <p className="text-xs text-slate-500 mb-2">
          Each head operates on its {HEAD_DIM}-dimensional slice independently:
        </p>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: N_HEAD }, (_, h) => {
            const { q } = heads[h];
            const c = HEAD_COLORS[h];
            const isActive = selectedHead === h;
            const qMax = Math.max(...q.map(Math.abs));

            return (
              <motion.button
                key={h}
                onClick={() => setSelectedHead(isActive ? null : h)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`rounded-xl border p-3 text-left transition-all ${
                  isActive
                    ? `${c.badge} ${c.border}/60 ring-2 ${c.ring}/40`
                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className={`text-sm font-bold ${c.text}`}>Head {h + 1}</p>
                  <span className="text-xs text-slate-500 font-mono">dim={HEAD_DIM}</span>
                </div>

                {/* Q preview */}
                <div className="mb-2">
                  <p className="text-xs text-slate-500 mb-1">Q_h{h + 1}[{HEAD_DIM}]</p>
                  <div className="flex gap-0.5 h-5">
                    {q.map((val, i) => (
                      <div key={i} className="flex-1 h-full relative bg-slate-900 rounded-sm overflow-hidden">
                        <motion.div
                          className="absolute bottom-0 left-0 right-0"
                          style={{ background: `${c.fill}0.7)` }}
                          animate={{ height: `${Math.abs(val) / (qMax + 0.001) * 100}%` }}
                          transition={{ duration: 0.3, delay: i * 0.05 }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Values preview */}
                <div className="grid grid-cols-4 gap-1 text-xs font-mono">
                  {q.map((val, i) => (
                    <div key={i} className="text-center">
                      <span className="text-slate-600">[{i}]</span>
                      <div className={`${c.text} text-xs`}>{val.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Expanded head detail */}
        <AnimatePresence>
          {selectedHead !== null && (
            <motion.div
              key={selectedHead}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className={`mt-3 rounded-xl border p-4 ${HEAD_COLORS[selectedHead].badge} ${HEAD_COLORS[selectedHead].border}/30`}>
                <p className={`text-sm font-bold ${HEAD_COLORS[selectedHead].text} mb-3`}>
                  Head {selectedHead + 1} — Attention Score Calculation
                </p>

                <div className="grid grid-cols-3 gap-3 text-xs font-mono">
                  {/* Q_h */}
                  <div>
                    <p className={`${HEAD_COLORS[selectedHead].text} mb-2`}>Q_h{selectedHead + 1}[{HEAD_DIM}]</p>
                    {heads[selectedHead].q.map((val, i) => (
                      <div key={i} className="flex items-center gap-1 mb-1">
                        <span className="text-slate-500 w-4">[{i}]</span>
                        <div className="flex-1 h-3 bg-slate-800 rounded overflow-hidden">
                          <motion.div
                            className={`h-full ${HEAD_COLORS[selectedHead].bg}`}
                            animate={{ width: `${Math.abs(val) / 0.5 * 100}%` }}
                          />
                        </div>
                        <span className="text-slate-300 w-14 text-right">{val.toFixed(3)}</span>
                      </div>
                    ))}
                  </div>

                  {/* K_h */}
                  <div>
                    <p className="text-slate-400 mb-2">K_h{selectedHead + 1}[{HEAD_DIM}]</p>
                    {heads[selectedHead].k.map((val, i) => (
                      <div key={i} className="flex items-center gap-1 mb-1">
                        <span className="text-slate-500 w-4">[{i}]</span>
                        <div className="flex-1 h-3 bg-slate-800 rounded overflow-hidden">
                          <motion.div
                            className="h-full bg-slate-500"
                            animate={{ width: `${Math.abs(val) / 0.5 * 100}%` }}
                          />
                        </div>
                        <span className="text-slate-300 w-14 text-right">{val.toFixed(3)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Q·K per dimension */}
                  <div>
                    <p className="text-slate-400 mb-2">Q·K per dim</p>
                    {heads[selectedHead].q.map((qv, i) => {
                      const kv = heads[selectedHead].k[i];
                      const prod = qv * kv;
                      return (
                        <div key={i} className="flex items-center gap-1 mb-1">
                          <span className="text-slate-500 w-4">[{i}]</span>
                          <div className="flex-1 h-3 bg-slate-800 rounded overflow-hidden">
                            <motion.div
                              className={`h-full ${prod >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
                              animate={{ width: `${Math.min(100, Math.abs(prod) / 0.15 * 100)}%` }}
                            />
                          </div>
                          <span className={`w-14 text-right ${prod >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                            {prod.toFixed(3)}
                          </span>
                        </div>
                      );
                    })}
                    <div className="border-t border-slate-600 mt-2 pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Σ / √{HEAD_DIM}</span>
                        <motion.span
                          key={headScore}
                          initial={{ scale: 1.3 }}
                          animate={{ scale: 1 }}
                          className={`font-bold text-sm ${headScore >= 0 ? HEAD_COLORS[selectedHead].text : 'text-red-300'}`}
                        >
                          {headScore?.toFixed(4)}
                        </motion.span>
                      </div>
                      <p className="text-slate-600 text-xs mt-1">→ attention score (before softmax)</p>
                    </div>
                  </div>
                </div>

                {/* V_h display */}
                <div className="mt-3 pt-3 border-t border-slate-700/50">
                  <p className="text-slate-400 mb-2 text-xs">V_h{selectedHead + 1}[{HEAD_DIM}] — values to aggregate:</p>
                  <div className="flex gap-2">
                    {heads[selectedHead].v.map((val, i) => (
                      <div key={i} className="flex-1 text-center">
                        <div className="h-12 bg-slate-900 rounded mb-1 overflow-hidden relative">
                          <motion.div
                            className="absolute bottom-0 left-0 right-0 bg-violet-500/60"
                            animate={{ height: `${Math.abs(val) / 0.5 * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500">[{i}]</span>
                        <div className="text-xs text-violet-300">{val.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
