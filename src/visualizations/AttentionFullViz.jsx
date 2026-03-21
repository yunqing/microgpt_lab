import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';

// ── shared math ──────────────────────────────────────────────────────────────
const N_EMBD = 16, N_HEAD = 4, HEAD_DIM = 4;

function seededVec(dim, seed) {
  let s = seed;
  return Array.from({ length: dim }, () => {
    s = ((s * 1664525 + 1013904223) & 0x7fffffff);
    return (s / 0x7fffffff - 0.5) * 1.2;
  });
}
function seededMatrix(rows, cols, seed) {
  let s = seed;
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => {
      s = ((s * 1664525 + 1013904223) & 0x7fffffff);
      return (s / 0x7fffffff - 0.5) * 0.4;
    })
  );
}
function matvec(W, x) { return W.map(row => row.reduce((s, w, j) => s + w * x[j], 0)); }
function softmax(arr) {
  const max = Math.max(...arr);
  const exps = arr.map(v => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(v => v / sum);
}
function dot(a, b) { return a.reduce((s, v, i) => s + v * b[i], 0); }

const Wq = seededMatrix(N_EMBD, N_EMBD, 11);
const Wk = seededMatrix(N_EMBD, N_EMBD, 31);
const Wv = seededMatrix(N_EMBD, N_EMBD, 53);

const HC = [
  { ring: 'ring-cyan-500',   text: 'text-cyan-300',   fill: 'rgba(6,182,212,',   bg: 'bg-cyan-500',   badge: 'bg-cyan-500/15 border-cyan-500/40' },
  { ring: 'ring-indigo-500', text: 'text-indigo-300', fill: 'rgba(99,102,241,',  bg: 'bg-indigo-500', badge: 'bg-indigo-500/15 border-indigo-500/40' },
  { ring: 'ring-violet-500', text: 'text-violet-300', fill: 'rgba(139,92,246,',  bg: 'bg-violet-500', badge: 'bg-violet-500/15 border-violet-500/40' },
  { ring: 'ring-teal-500',   text: 'text-teal-300',   fill: 'rgba(20,184,166,',  bg: 'bg-teal-500',   badge: 'bg-teal-500/15 border-teal-500/40' },
];

const TOKENS = ['⊕', 'e', 'm', 'm', 'a', '⊕'];
// pre-compute per-token Q/K/V vectors for attention step
function tokenVec(i) { return seededVec(N_EMBD, i * 7 + 5); }

// ── sub-step labels ──────────────────────────────────────────────────────────
const STEPS = [
  { id: 0, label: 'Step 1', title: 'Project  x → Q, K, V',  desc: 'Three learned weight matrices project the input into Query, Key, and Value spaces.' },
  { id: 1, label: 'Step 2', title: 'Split into Heads',       desc: 'Each projection is sliced into n_head=4 chunks. Every head operates on its own head_dim=4 subspace.' },
  { id: 2, label: 'Step 3', title: 'Score & Attend',         desc: 'Scaled dot-product: Q·K / √head_dim → softmax → attention weights for each past token.' },
  { id: 3, label: 'Step 4', title: 'Aggregate + Residual',   desc: 'Weighted sum of Values, concat heads, linear projection W_o, then add the residual.' },
];

// ── tiny bar ─────────────────────────────────────────────────────────────────
function Bar({ value, maxAbs, fill, animated, delay = 0, highlight }) {
  const pct = Math.min(100, (Math.abs(value) / (maxAbs + 0.001)) * 100);
  const color = value >= 0 ? fill : 'rgba(239,68,68,';
  return (
    <div className={`relative flex-1 h-full rounded-sm overflow-hidden ${highlight ? 'ring-1 ring-yellow-400 z-10' : ''}`}>
      <div className="absolute inset-0" style={{ background: `${color}0.12)` }} />
      <motion.div
        className="absolute bottom-0 left-0 right-0 rounded-sm"
        style={{ background: `${color}0.75)` }}
        initial={animated ? { height: 0 } : false}
        animate={{ height: `${pct}%` }}
        transition={{ duration: 0.35, delay, ease: 'easeOut' }}
      />
    </div>
  );
}

// ── Step 1: Project ──────────────────────────────────────────────────────────
function StepProject({ x }) {
  const q = useMemo(() => matvec(Wq, x), [x]);
  const k = useMemo(() => matvec(Wk, x), [x]);
  const v = useMemo(() => matvec(Wv, x), [x]);
  const xMax = Math.max(...x.map(Math.abs));

  return (
    <div className="space-y-4">
      {[
        { label: 'x', vec: x, max: xMax, fill: 'rgba(148,163,184,', note: 'input after RMSNorm' },
        { label: 'Q', vec: q, max: Math.max(...q.map(Math.abs)), fill: 'rgba(6,182,212,',  note: '= W_q · x  "What am I looking for?"' },
        { label: 'K', vec: k, max: Math.max(...k.map(Math.abs)), fill: 'rgba(99,102,241,', note: '= W_k · x  "What do I contain?"' },
        { label: 'V', vec: v, max: Math.max(...v.map(Math.abs)), fill: 'rgba(139,92,246,', note: '= W_v · x  "What do I offer?"' },
      ].map(({ label, vec, max, fill, note }, ri) => (
        <div key={label}>
          {ri === 1 && <div className="border-t border-slate-700 my-3" />}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono font-bold text-xs w-4" style={{ color: fill.replace('rgba(', 'rgb(').replace(', ', ',').split(',').slice(0,3).join(',') + ')' }}>{label}</span>
            <span className="text-xs text-slate-500">{note}</span>
          </div>
          <div className="flex gap-0.5 h-8">
            {vec.map((val, i) => (
              <Bar key={i} value={val} maxAbs={max} fill={fill} animated={ri > 0} delay={i * 0.015} />
            ))}
          </div>
        </div>
      ))}
      <p className="text-xs text-slate-600 mt-2">Each matrix W_q, W_k, W_v is [16×16] = 256 params</p>
    </div>
  );
}

// ── Step 2: Split into heads ─────────────────────────────────────────────────
function StepSplit({ x }) {
  const q = useMemo(() => matvec(Wq, x), [x]);
  const [selectedHead, setSelectedHead] = useState(null);

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-400">
        Q[16] is sliced into {N_HEAD} heads × [{HEAD_DIM}]. Each head is independent. Click a head:
      </p>
      <div className="space-y-2">
        {[
          { label: 'Q', vec: q, fill: 'rgba(6,182,212,' },
        ].map(({ label, vec, fill }) => {
          const max = Math.max(...vec.map(Math.abs));
          return (
            <div key={label}>
              <p className="text-xs text-slate-500 font-mono mb-1">{label}[16] → split:</p>
              <div className="flex gap-1">
                {Array.from({ length: N_HEAD }, (_, h) => {
                  const slice = vec.slice(h * HEAD_DIM, (h + 1) * HEAD_DIM);
                  const c = HC[h];
                  const isActive = selectedHead === h;
                  return (
                    <motion.button
                      key={h}
                      onClick={() => setSelectedHead(isActive ? null : h)}
                      whileHover={{ scale: 1.04 }}
                      className={`flex-1 rounded-lg border p-2 ${isActive ? `${c.badge} border` : 'bg-slate-800/50 border-slate-700'}`}
                    >
                      <p className={`text-xs font-bold ${c.text} mb-1`}>h{h + 1}</p>
                      <div className="flex gap-0.5 h-6">
                        {slice.map((val, i) => (
                          <Bar key={i} value={val} maxAbs={max} fill={`${c.fill}`} animated delay={i * 0.05} />
                        ))}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 font-mono">[{HEAD_DIM}]</p>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedHead !== null && (
          <motion.div
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl border p-3 ${HC[selectedHead].badge}`}
          >
            <p className={`text-xs font-bold ${HC[selectedHead].text} mb-2`}>
              Head {selectedHead + 1}: dims [{selectedHead * HEAD_DIM}..{selectedHead * HEAD_DIM + HEAD_DIM - 1}]
            </p>
            <div className="grid grid-cols-3 gap-3 text-xs font-mono">
              {['Q', 'K', 'V'].map((role, ri) => {
                const mat = ri === 0 ? Wq : ri === 1 ? Wk : Wv;
                const full = matvec(mat, x);
                const slice = full.slice(selectedHead * HEAD_DIM, (selectedHead + 1) * HEAD_DIM);
                return (
                  <div key={role}>
                    <p className="text-slate-400 mb-1">{role}_h{selectedHead + 1}</p>
                    {slice.map((val, i) => (
                      <div key={i} className="flex items-center gap-1 mb-0.5">
                        <span className="text-slate-600 w-4">[{i}]</span>
                        <span className={val >= 0 ? HC[selectedHead].text : 'text-red-300'}>{val.toFixed(3)}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <p className="text-xs text-slate-600">{N_HEAD} heads × {HEAD_DIM} dims = {N_EMBD} total — same as input.</p>
    </div>
  );
}

// ── Step 3: Score & Attend ───────────────────────────────────────────────────
function StepAttend() {
  const [queryPos, setQueryPos] = useState(4);
  const [selHead, setSelHead] = useState(0);

  const vecs = useMemo(() => TOKENS.map((_, i) => tokenVec(i)), []);

  const scores = useMemo(() => {
    const qFull = matvec(Wq, vecs[queryPos]);
    const hs = selHead * HEAD_DIM;
    const qh = qFull.slice(hs, hs + HEAD_DIM);
    return TOKENS.slice(0, queryPos + 1).map((_, t) => {
      const kFull = matvec(Wk, vecs[t]);
      const kh = kFull.slice(hs, hs + HEAD_DIM);
      return dot(qh, kh) / Math.sqrt(HEAD_DIM);
    });
  }, [queryPos, selHead, vecs]);

  const weights = useMemo(() => softmax(scores), [scores]);

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap">
        <div>
          <p className="text-xs text-slate-500 mb-1">Query position:</p>
          <div className="flex gap-1">
            {TOKENS.map((tok, i) => (
              <button key={i} onClick={() => setQueryPos(i)}
                className={`w-8 h-8 rounded-lg text-sm font-mono border transition-colors ${queryPos === i ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}>
                {tok}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Head:</p>
          <div className="flex gap-1">
            {Array.from({ length: N_HEAD }, (_, h) => (
              <button key={h} onClick={() => setSelHead(h)}
                className={`w-8 h-8 rounded-lg text-xs font-bold border transition-colors ${selHead === h ? `${HC[h].badge} border ${HC[h].text}` : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                h{h + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <p className="text-xs text-slate-500 mb-2">
          <span className="font-mono text-slate-300">"{TOKENS[queryPos]}"</span> attending to past tokens — head {selHead + 1}:
        </p>
        <div className="space-y-1.5">
          {TOKENS.map((tok, t) => {
            const masked = t > queryPos;
            const w = weights[t] ?? 0;
            return (
              <div key={t} className={`flex items-center gap-2 ${masked ? 'opacity-25' : ''}`}>
                <span className="w-6 text-sm font-mono text-center text-slate-300">{tok}</span>
                <div className="text-xs text-slate-600 w-16 font-mono text-right">{masked ? '−∞' : `s=${scores[t]?.toFixed(2)}`}</div>
                <div className="flex-1 h-5 bg-slate-800 rounded overflow-hidden">
                  {!masked && (
                    <motion.div className="h-full rounded" animate={{ width: `${w * 100}%` }}
                      style={{ background: `linear-gradient(90deg, ${HC[selHead].fill}0.8), ${HC[selHead].fill}0.5))` }}
                      transition={{ duration: 0.3 }} />
                  )}
                </div>
                <span className="text-xs font-mono text-slate-400 w-12 text-right">{masked ? 'masked' : `${(w * 100).toFixed(1)}%`}</span>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-slate-600 mt-2">Causal masking: future positions cannot be attended to.</p>
      </div>
    </div>
  );
}

// ── Step 4: Aggregate + Residual ─────────────────────────────────────────────
function StepAggregate({ x }) {
  const q = useMemo(() => matvec(Wq, x), [x]);
  const k = useMemo(() => matvec(Wk, x), [x]);
  const v = useMemo(() => matvec(Wv, x), [x]);

  // Simulate single-token context for clarity
  const hs = 0; // head 0 for display
  const qh = q.slice(hs, hs + HEAD_DIM);
  const kh = k.slice(hs, hs + HEAD_DIM);
  const vh = v.slice(hs, hs + HEAD_DIM);
  const score = dot(qh, kh) / Math.sqrt(HEAD_DIM);
  const w = softmax([score, score * 0.6, score * 0.3]); // fake 3-token context
  const vecs3 = [vh, vh.map(x => x * 0.7), vh.map(x => x * 0.4)];
  const headOut = Array.from({ length: HEAD_DIM }, (_, j) =>
    w.reduce((s, wi, t) => s + wi * vecs3[t][j], 0)
  );
  const xMax = Math.max(...x.map(Math.abs));

  return (
    <div className="space-y-4">
      {/* Weighted sum */}
      <div>
        <p className="text-xs text-slate-500 mb-2">Head 1: weighted sum of V (3-token context demo):</p>
        <div className="space-y-1.5">
          {w.map((wi, t) => (
            <div key={t} className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-500 w-4">t{t}</span>
              <div className="flex gap-0.5 h-5 flex-1">
                {vecs3[t].map((val, j) => (
                  <Bar key={j} value={val * wi} maxAbs={0.5} fill="rgba(139,92,246," />
                ))}
              </div>
              <span className="text-violet-300 w-16 text-right">×{(wi * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-700 mt-2 pt-2 flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">head_out[4]:</span>
          <div className="flex gap-0.5 h-6 flex-1">
            {headOut.map((val, j) => (
              <Bar key={j} value={val} maxAbs={0.5} fill="rgba(6,182,212," animated delay={j * 0.08} />
            ))}
          </div>
        </div>
      </div>

      {/* Residual */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3">
        <p className="text-xs text-slate-400 font-semibold mb-2">Residual connection:</p>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-cyan-300">x_attn</span>
          <span className="text-slate-500">+</span>
          <span className="text-slate-300">x_residual</span>
          <span className="text-slate-500">=</span>
          <span className="text-emerald-300">x_out</span>
        </div>
        <div className="flex gap-0.5 h-8 mt-2">
          {x.map((val, i) => (
            <Bar key={i} value={val} maxAbs={xMax} fill="rgba(16,185,129," />
          ))}
        </div>
        <p className="text-xs text-slate-600 mt-1">
          The residual lets gradients bypass the attention block — critical for stable training.
        </p>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AttentionFullViz() {
  const [step, setStep] = useState(0);
  const x = useMemo(() => seededVec(N_EMBD, 77), []);

  const stepContent = [
    <StepProject key={0} x={x} />,
    <StepSplit key={1} x={x} />,
    <StepAttend key={2} />,
    <StepAggregate key={3} x={x} />,
  ];

  return (
    <div className="space-y-4">
      {/* Step nav */}
      <div className="flex gap-1">
        {STEPS.map(s => (
          <button key={s.id} onClick={() => setStep(s.id)}
            className={`flex-1 py-1.5 px-1 text-xs rounded-lg border transition-all ${step === s.id ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300 font-semibold' : 'bg-slate-800/40 border-slate-700 text-slate-500 hover:border-slate-600'}`}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Step header */}
      <div className="bg-slate-800/50 rounded-lg px-3 py-2 border border-slate-700">
        <p className="text-xs font-bold text-slate-200">{STEPS[step].title}</p>
        <p className="text-xs text-slate-500 mt-0.5">{STEPS[step].desc}</p>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }}>
          {stepContent[step]}
        </motion.div>
      </AnimatePresence>

      {/* Prev / Next */}
      <div className="flex justify-between pt-1">
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
          className="flex items-center gap-1 text-xs text-slate-400 disabled:opacity-30 hover:text-slate-200 transition-colors">
          <ChevronLeft size={13} /> Previous
        </button>
        <button onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))} disabled={step === STEPS.length - 1}
          className="flex items-center gap-1 text-xs text-slate-400 disabled:opacity-30 hover:text-slate-200 transition-colors">
          Next <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}
