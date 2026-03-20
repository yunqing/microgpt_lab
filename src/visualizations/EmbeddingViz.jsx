import { useState } from 'react';
import { motion } from 'framer-motion';

const N_EMBD = 16;
const VOCAB_SIZE = 27;
const BLOCK_SIZE = 16;

// Generate pseudo-random matrix for display
function seedRng(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function generateMatrix(rows, cols, seed) {
  const rng = seedRng(seed);
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => (rng() - 0.5) * 0.16)
  );
}

const wte = generateMatrix(VOCAB_SIZE, N_EMBD, 42);
const wpe = generateMatrix(BLOCK_SIZE, N_EMBD, 99);

const CHARS = 'abcdefghijklmnopqrstuvwxyz⊕'.split('');

export default function EmbeddingViz() {
  const [selectedToken, setSelectedToken] = useState(4); // 'e'
  const [selectedPos, setSelectedPos] = useState(0);

  const tokEmb = wte[selectedToken];
  const posEmb = wpe[selectedPos];
  const combined = tokEmb.map((t, i) => t + posEmb[i]);

  const toColor = (v) => {
    const norm = Math.max(-0.15, Math.min(0.15, v));
    const t = (norm + 0.15) / 0.3;
    if (t < 0.5) {
      const u = t / 0.5;
      return `rgba(99, 102, 241, ${0.2 + u * 0.8})`;
    } else {
      const u = (t - 0.5) / 0.5;
      return `rgba(6, 182, 212, ${0.2 + u * 0.8})`;
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        {/* Token selector */}
        <div>
          <label className="text-xs text-slate-500 mb-2 block">Token (wte row):</label>
          <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
            {CHARS.map((c, i) => (
              <button
                key={c}
                onClick={() => setSelectedToken(i)}
                className={`w-7 h-7 text-xs rounded font-mono border transition-colors ${
                  selectedToken === i
                    ? 'bg-cyan-500/30 border-cyan-500 text-cyan-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        {/* Position selector */}
        <div>
          <label className="text-xs text-slate-500 mb-2 block">Position (wpe row): {selectedPos}</label>
          <div className="flex gap-1 flex-wrap">
            {Array.from({ length: 16 }, (_, i) => (
              <button
                key={i}
                onClick={() => setSelectedPos(i)}
                className={`w-7 h-7 text-xs rounded font-mono border transition-colors ${
                  selectedPos === i
                    ? 'bg-indigo-500/30 border-indigo-500 text-indigo-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                }`}
              >
                {i}
              </button>
            ))}
          </div>
          <input
            type="range"
            min={0}
            max={15}
            value={selectedPos}
            onChange={e => setSelectedPos(Number(e.target.value))}
            className="w-full mt-2 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-indigo-500 [&::-moz-range-thumb]:border-0"
          />
          <div className="flex justify-between text-xs text-slate-600 mt-1">
            <span>0</span><span>7</span><span>15</span>
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="space-y-2">
        {[
          { label: `wte[${selectedToken}] = "${CHARS[selectedToken]}"`, data: tokEmb, color: 'cyan' },
          { label: `wpe[${selectedPos}]  = pos ${selectedPos}`, data: posEmb, color: 'indigo' },
          { label: 'x = wte + wpe', data: combined, color: 'teal', separator: true },
        ].map(({ label, data, color, separator }) => (
          <div key={label}>
            {separator && <div className="border-t border-slate-700 my-2" />}
            <div className="flex items-center gap-2">
              <span className={`text-xs font-mono w-44 text-slate-400 ${separator ? 'text-teal-400 font-semibold' : ''}`}>{label}</span>
              <div className="flex gap-0.5">
                {data.map((v, i) => (
                  <motion.div
                    key={i}
                    className="w-5 h-7 rounded-sm relative group"
                    style={{ backgroundColor: toColor(v) }}
                    whileHover={{ scaleY: 1.3 }}
                    title={v.toFixed(3)}
                  >
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs text-slate-300 hidden group-hover:block bg-slate-900 px-1 rounded whitespace-nowrap z-10">
                      {v.toFixed(3)}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-600">
        Cyan = positive values, Indigo = negative. Each column is one of the 16 embedding dimensions.
      </p>
    </div>
  );
}
