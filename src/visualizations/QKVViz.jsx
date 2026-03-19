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
  const [selectedDim, setSelectedDim] = useState(null);
  const [selectedHead, setSelectedHead] = useState(null);
  const [projected, setProjected] = useState(false);

  // Use a fixed input vector for repeatability
  const x = useMemo(() => seededVec(N_EMBD, 77), []);
  const q = useMemo(() => matvec(Wq, x), [x]);
  const k = useMemo(() => matvec(Wk, x), [x]);
  const v = useMemo(() => matvec(Wv, x), [x]);

  const xMax = Math.max(...x.map(Math.abs));
  const qMax = Math.max(...q.map(Math.abs));
  const kMax = Math.max(...k.map(Math.abs));
  const vMax = Math.max(...v.map(Math.abs));

  // Attention score for selected head (q_h · k_h / sqrt(head_dim))
  const headScore = useMemo(() => {
    if (selectedHead === null) return null;
    const hs = selectedHead * HEAD_DIM;
    const qh = q.slice(hs, hs + HEAD_DIM);
    const kh = k.slice(hs, hs + HEAD_DIM);
    const dot = qh.reduce((s, qi, i) => s + qi * kh[i], 0);
    return dot / Math.sqrt(HEAD_DIM);
  }, [selectedHead, q, k]);

  const dimIsInHead = (dim) => selectedHead !== null
    ? Math.floor(dim / HEAD_DIM) === selectedHead
    : false;

  const VECTORS = [
    { label: 'Q', vec: q, max: qMax, ci: 0, key: 'q' },
    { label: 'K', vec: k, max: kMax, ci: 1, key: 'k' },
    { label: 'V', vec: v, max: vMax, ci: 2, key: 'v' },
  ];

  return (
    <div className="space-y-4 select-none">
      {/* Instruction hint */}
      <p className="text-xs text-slate-500">
        Click a <span className="text-slate-300">dimension</span> in x to trace it through projections.
        Click a <span className="text-slate-300">head</span> card to see its dot-product score.
      </p>

      {/* ── Input vector x ── */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-xs text-slate-400 font-mono">
            x<span className="text-slate-600">[16]</span> — after RMSNorm
          </p>
          {selectedDim !== null && (
            <span className="text-xs text-slate-500">
              x[<span className="text-yellow-300 font-mono">{selectedDim}</span>] =&nbsp;
              <span className="text-yellow-300 font-mono">{x[selectedDim].toFixed(3)}</span>
            </span>
          )}
        </div>
        <div className="flex gap-0.5 h-10">
          {x.map((v, i) => {
            const isSelected = selectedDim === i;
            const inHead = dimIsInHead(i);
            const h = Math.floor(i / HEAD_DIM);
            return (
              <motion.button
                key={i}
                onClick={() => setSelectedDim(isSelected ? null : i)}
                whileHover={{ scaleY: 1.15 }}
                className={`relative flex-1 h-full rounded-sm transition-all cursor-pointer outline-none
                  ${isSelected ? `ring-2 ring-yellow-400 z-10` : ''}
                  ${inHead ? `ring-1 ${HEAD_COLORS[h].ring} opacity-100` : selectedDim !== null ? 'opacity-40' : 'opacity-100'}
                `}
              >
                <ValueBar value={v} maxAbs={xMax} colorFill="rgba(148,163,184," animated={false} />
              </motion.button>
            );
          })}
        </div>
        {/* Head labels */}
        <div className="flex mt-1">
          {Array.from({ length: N_HEAD }, (_, h) => (
            <div key={h} className={`flex-1 text-center text-xs ${HEAD_COLORS[h].text} opacity-50`}>
              h{h + 1}
            </div>
          ))}
        </div>
      </div>

      {/* ── Project button ── */}
      <div className="flex items-center gap-2">
        <motion.button
          onClick={() => setProjected(p => !p)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors font-semibold ${
            projected
              ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300'
              : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-500'
          }`}
        >
          <Zap size={11} />
          {projected ? 'Hide projections' : 'Project x → Q, K, V'}
        </motion.button>
        <span className="text-xs text-slate-600">W_q, W_k, W_v each [16×16]</span>
      </div>

      {/* ── Q / K / V bars ── */}
      <AnimatePresence>
        {projected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="space-y-3">
              {VECTORS.map(({ label, vec, max, ci, key }) => {
                const c = HEAD_COLORS[ci];
                return (
                  <div key={key}>
                    <p className="text-xs mb-1.5">
                      <span className={`font-mono font-bold ${c.text}`}>{label}</span>
                      <span className="text-slate-600"> = W_{label.toLowerCase()} · x — shape [16]</span>
                    </p>
                    <div className="flex gap-0.5 h-10">
                      {vec.map((val, i) => {
                        const h = Math.floor(i / HEAD_DIM);
                        const hc = HEAD_COLORS[h];
                        const isTracedDim = selectedDim !== null && i === selectedDim;
                        const inSelectedHead = dimIsInHead(i);
                        return (
                          <motion.div
                            key={i}
                            className={`relative flex-1 h-full rounded-sm
                              ${isTracedDim ? 'ring-2 ring-yellow-400 z-10' : ''}
                              ${inSelectedHead ? `ring-1 ${hc.ring}` : selectedDim !== null && !isTracedDim ? 'opacity-30' : ''}
                            `}
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
                    {/* Head dividers */}
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
            </div>

            {/* ── Dim trace panel ── */}
            <AnimatePresence>
              {selectedDim !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="mt-3 bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-3"
                >
                  <p className="text-xs font-semibold text-yellow-300 mb-2">
                    Tracing dim {selectedDim} (head {Math.floor(selectedDim / HEAD_DIM) + 1}, slot {selectedDim % HEAD_DIM})
                  </p>
                  <div className="grid grid-cols-4 gap-2 text-xs font-mono text-center">
                    <div>
                      <p className="text-slate-500 mb-1">x[{selectedDim}]</p>
                      <p className="text-yellow-300">{x[selectedDim].toFixed(3)}</p>
                    </div>
                    <div>
                      <p className={`${HEAD_COLORS[0].text} mb-1`}>q[{selectedDim}]</p>
                      <p className="text-cyan-300">{q[selectedDim].toFixed(3)}</p>
                    </div>
                    <div>
                      <p className={`${HEAD_COLORS[1].text} mb-1`}>k[{selectedDim}]</p>
                      <p className="text-indigo-300">{k[selectedDim].toFixed(3)}</p>
                    </div>
                    <div>
                      <p className={`${HEAD_COLORS[2].text} mb-1`}>v[{selectedDim}]</p>
                      <p className="text-violet-300">{v[selectedDim].toFixed(3)}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Head cards ── */}
      <div className="border-t border-slate-700 pt-3">
        <p className="text-xs text-slate-500 mb-2">
          Click a head to see its Q·K attention score:
        </p>
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: N_HEAD }, (_, h) => {
            const c = HEAD_COLORS[h];
            const hs = h * HEAD_DIM;
            const qh = q.slice(hs, hs + HEAD_DIM);
            const isActive = selectedHead === h;
            return (
              <motion.button
                key={h}
                onClick={() => setSelectedHead(isActive ? null : h)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className={`rounded-xl border p-2 text-left transition-all ${
                  isActive
                    ? `${c.badge} ${c.border}/60 ring-1 ${c.ring}/40`
                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                }`}
              >
                <p className={`text-xs font-bold ${c.text} mb-1`}>Head {h + 1}</p>
                <p className="text-xs text-slate-500 font-mono">dim={HEAD_DIM}</p>
                <div className="flex gap-0.5 mt-1.5 h-5">
                  {qh.map((val, i) => (
                    <div key={i} className="flex-1 h-full relative">
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 rounded-sm"
                        style={{ background: `${c.fill}0.6)` }}
                        animate={{ height: `${Math.abs(val) / (Math.max(...qh.map(Math.abs)) + 0.001) * 100}%` }}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-600 mt-1 font-mono">Q</p>
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
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className={`mt-3 rounded-xl border p-4 ${HEAD_COLORS[selectedHead].badge} ${HEAD_COLORS[selectedHead].border}/30`}>
                <p className={`text-xs font-bold ${HEAD_COLORS[selectedHead].text} mb-3`}>
                  Head {selectedHead + 1} — Q·K dot-product
                </p>
                <div className="grid grid-cols-3 gap-3 text-xs font-mono">
                  {/* Q_h */}
                  <div>
                    <p className={`${HEAD_COLORS[selectedHead].text} mb-2`}>Q_h[{HEAD_DIM}]</p>
                    {q.slice(selectedHead * HEAD_DIM, selectedHead * HEAD_DIM + HEAD_DIM).map((val, i) => (
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
                    <p className="text-slate-400 mb-2">K_h[{HEAD_DIM}]</p>
                    {k.slice(selectedHead * HEAD_DIM, selectedHead * HEAD_DIM + HEAD_DIM).map((val, i) => (
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
                  {/* Score breakdown */}
                  <div>
                    <p className="text-slate-400 mb-2">Q×K per dim</p>
                    {q.slice(selectedHead * HEAD_DIM, selectedHead * HEAD_DIM + HEAD_DIM).map((qv, i) => {
                      const kv = k[selectedHead * HEAD_DIM + i];
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
                      <p className="text-slate-600 text-xs mt-1">→ this becomes the softmax input</p>
                    </div>
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
