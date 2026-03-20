import { useState, useMemo } from 'react';
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

// Seed-based random vectors
function seedVec(seed, dim) {
  let s = seed;
  return Array.from({ length: dim }, () => {
    s = ((s * 1664525 + 1013904223) & 0x7fffffff);
    return (s / 0x7fffffff - 0.5) * 2;
  });
}

const HEAD_DIM = 4;
const N_HEAD = 4;
const SEQ_LEN = 6;
const TOKENS = ['⊕', 'e', 'm', 'm', 'a', '⊕'];

const HEAD_COLORS = [
  { name: 'Head 1', bg: 'bg-cyan-500', text: 'text-cyan-300', fill: 'rgba(6,182,212', border: 'border-cyan-500' },
  { name: 'Head 2', bg: 'bg-indigo-500', text: 'text-indigo-300', fill: 'rgba(99,102,241', border: 'border-indigo-500' },
  { name: 'Head 3', bg: 'bg-violet-500', text: 'text-violet-300', fill: 'rgba(139,92,246', border: 'border-violet-500' },
  { name: 'Head 4', bg: 'bg-teal-500', text: 'text-teal-300', fill: 'rgba(20,184,166', border: 'border-teal-500' },
];

export default function AttentionViz() {
  const [selectedHead, setSelectedHead] = useState(0);
  const [selectedQuery, setSelectedQuery] = useState(4); // position 'a'

  // Generate Q/K/V for each head and position
  const heads = useMemo(() => {
    return Array.from({ length: N_HEAD }, (_, h) => {
      // Each head has its own Q/K/V projections
      const Q = Array.from({ length: SEQ_LEN }, (_, i) => seedVec(h * 100 + i * 7 + 1, HEAD_DIM));
      const K = Array.from({ length: SEQ_LEN }, (_, i) => seedVec(h * 100 + i * 13 + 3, HEAD_DIM));
      const V = Array.from({ length: SEQ_LEN }, (_, i) => seedVec(h * 100 + i * 17 + 5, HEAD_DIM));

      // Compute attention for all query positions
      const attentionMaps = Array.from({ length: SEQ_LEN }, (_, queryPos) => {
        // Causal mask: can only attend to positions <= queryPos
        const validPositions = queryPos + 1;
        const scores = Array.from({ length: validPositions }, (_, keyPos) => {
          return dot(Q[queryPos], K[keyPos]) / Math.sqrt(HEAD_DIM);
        });
        const weights = softmax(scores);

        // Compute output: weighted sum of values
        const output = Array.from({ length: HEAD_DIM }, (_, d) => {
          return weights.reduce((sum, w, keyPos) => sum + w * V[keyPos][d], 0);
        });

        return { scores, weights, output };
      });

      return { Q, K, V, attentionMaps };
    });
  }, []);

  const currentHead = heads[selectedHead];
  const currentAttention = currentHead.attentionMaps[selectedQuery];

  return (
    <div className="space-y-5">
      {/* Info */}
      <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
        <p className="text-xs text-slate-400 mb-1">
          <span className="text-cyan-400 font-semibold">Multi-Head Attention:</span> {N_HEAD} heads process the sequence in parallel
        </p>
        <p className="text-xs text-slate-500">
          Each head learns different patterns (e.g., one tracks vowels, another tracks position)
        </p>
      </div>

      {/* Head selector */}
      <div>
        <p className="text-xs text-slate-500 mb-2">Select attention head:</p>
        <div className="grid grid-cols-4 gap-2">
          {HEAD_COLORS.map((hc, h) => (
            <button
              key={h}
              onClick={() => setSelectedHead(h)}
              className={`py-2 px-3 rounded-lg border text-sm transition-all ${
                selectedHead === h
                  ? `${hc.bg}/20 ${hc.border} ${hc.text} ring-1 ${hc.border}`
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              {hc.name}
            </button>
          ))}
        </div>
      </div>

      {/* Query position selector */}
      <div>
        <p className="text-xs text-slate-500 mb-2">
          Query position: <span className={HEAD_COLORS[selectedHead].text}>{selectedQuery}</span> = "<span className={HEAD_COLORS[selectedHead].text}>{TOKENS[selectedQuery]}</span>"
        </p>
        <div className="flex gap-2">
          {TOKENS.map((tok, i) => (
            <button
              key={i}
              onClick={() => setSelectedQuery(i)}
              className={`flex-1 py-2 rounded-lg border text-sm font-mono transition-all ${
                selectedQuery === i
                  ? `${HEAD_COLORS[selectedHead].bg}/20 ${HEAD_COLORS[selectedHead].border} ${HEAD_COLORS[selectedHead].text}`
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              {tok}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-xs text-slate-600 mt-1 px-1">
          {TOKENS.map((_, i) => <span key={i}>pos {i}</span>)}
        </div>
      </div>

      {/* Attention matrix visualization */}
      <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700">
        <p className="text-xs text-slate-500 mb-3">
          <span className={HEAD_COLORS[selectedHead].text}>Head {selectedHead + 1}</span>: Attention weights from position {selectedQuery} (causal mask applied)
        </p>

        {/* Attention weights */}
        <div className="space-y-2 mb-4">
          {currentAttention.weights.map((w, keyPos) => (
            <div key={keyPos} className="flex items-center gap-3">
              <div className="w-12 text-xs text-slate-400">
                <span className="font-mono">{TOKENS[keyPos]}</span>
                <span className="text-slate-600 ml-1">(pos {keyPos})</span>
              </div>
              <div className="flex-1 h-6 bg-slate-900 rounded overflow-hidden relative">
                <motion.div
                  className="h-full"
                  style={{
                    background: `linear-gradient(90deg, ${HEAD_COLORS[selectedHead].fill},0.3), ${HEAD_COLORS[selectedHead].fill},0.8))`,
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${w * 100}%` }}
                  transition={{ duration: 0.4, delay: keyPos * 0.05 }}
                />
                <div className="absolute inset-0 flex items-center justify-end pr-2">
                  <span className={`text-xs font-mono ${HEAD_COLORS[selectedHead].text}`}>
                    {(w * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="w-16 text-xs text-slate-500 font-mono text-right">
                {w.toFixed(3)}
              </div>
            </div>
          ))}
          {/* Masked positions */}
          {selectedQuery < SEQ_LEN - 1 && (
            <div className="border-t border-slate-700 pt-2 mt-2">
              <p className="text-xs text-slate-600 mb-1">🚫 Masked (future positions):</p>
              {TOKENS.slice(selectedQuery + 1).map((tok, idx) => {
                const keyPos = selectedQuery + 1 + idx;
                return (
                  <div key={keyPos} className="flex items-center gap-3 opacity-40">
                    <div className="w-12 text-xs text-slate-600">
                      <span className="font-mono">{tok}</span>
                      <span className="ml-1">(pos {keyPos})</span>
                    </div>
                    <div className="flex-1 h-6 bg-slate-900 rounded border border-dashed border-slate-700 flex items-center justify-center">
                      <span className="text-xs text-slate-600">-∞ (masked)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Output vector */}
        <div className="border-t border-slate-700 pt-3">
          <p className="text-xs text-slate-500 mb-2">
            Output vector (weighted sum of Values):
          </p>
          <div className="flex gap-1">
            {currentAttention.output.map((val, d) => {
              const maxAbs = Math.max(...currentAttention.output.map(Math.abs));
              return (
                <div key={d} className="flex-1">
                  <div className="h-16 bg-slate-900 rounded relative overflow-hidden">
                    <motion.div
                      className="absolute bottom-0 left-0 right-0"
                      style={{ background: `${HEAD_COLORS[selectedHead].fill},0.7)` }}
                      initial={{ height: 0 }}
                      animate={{ height: `${(Math.abs(val) / (maxAbs + 0.001)) * 100}%` }}
                      transition={{ duration: 0.3, delay: d * 0.05 }}
                    />
                  </div>
                  <div className="text-center mt-1">
                    <span className="text-xs text-slate-600">[{d}]</span>
                    <div className={`text-xs ${HEAD_COLORS[selectedHead].text}`}>{val.toFixed(2)}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-slate-600 mt-2">
            → This output goes to the next layer (after combining all {N_HEAD} heads)
          </p>
        </div>
      </div>

      {/* All heads comparison */}
      <div className="border-t border-slate-700 pt-4">
        <p className="text-xs text-slate-500 mb-3">
          All {N_HEAD} heads for position {selectedQuery} (parallel processing):
        </p>
        <div className="grid grid-cols-2 gap-3">
          {heads.map((head, h) => {
            const attn = head.attentionMaps[selectedQuery];
            const hc = HEAD_COLORS[h];
            return (
              <div
                key={h}
                onClick={() => setSelectedHead(h)}
                className={`rounded-lg border p-3 cursor-pointer transition-all ${
                  selectedHead === h
                    ? `${hc.bg}/10 ${hc.border} ring-1 ${hc.border}`
                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                }`}
              >
                <p className={`text-xs font-bold ${hc.text} mb-2`}>{hc.name}</p>
                <div className="space-y-1">
                  {attn.weights.map((w, keyPos) => (
                    <div key={keyPos} className="flex items-center gap-1">
                      <span className="text-xs text-slate-600 w-4">{keyPos}</span>
                      <div className="flex-1 h-2 bg-slate-900 rounded overflow-hidden">
                        <div
                          className="h-full"
                          style={{
                            width: `${w * 100}%`,
                            background: `${hc.fill},0.6)`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
