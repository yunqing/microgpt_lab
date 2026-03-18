import { useState } from 'react';
import { motion } from 'framer-motion';

function relu(x) { return Math.max(0, x); }

export default function MLPViz() {
  const [inputVals, setInputVals] = useState(
    Array.from({ length: 8 }, (_, i) => parseFloat(((Math.sin(i * 1.3) * 0.8).toFixed(2))))
  );

  // Simulate a scaled-down MLP: 8 -> 16 -> 8 (representing 16 -> 64 -> 16)
  const fc1Out = Array.from({ length: 16 }, (_, j) =>
    inputVals.reduce((s, v, i) => s + v * Math.sin((i + 1) * (j + 1) * 0.4) * 0.3, 0)
  );
  const reluOut = fc1Out.map(relu);
  const fc2Out = Array.from({ length: 8 }, (_, j) =>
    reluOut.reduce((s, v, i) => s + v * Math.cos((i + 1) * (j + 1) * 0.4) * 0.1, 0)
  );

  const toWidth = (v, max) => `${Math.min(100, (Math.abs(v) / (max + 0.01)) * 100)}%`;
  const fc1Max = Math.max(...fc1Out.map(Math.abs));
  const reluMax = Math.max(...reluOut);
  const fc2Max = Math.max(...fc2Out.map(Math.abs));
  const inputMax = Math.max(...inputVals.map(Math.abs));

  const reluDead = reluOut.filter(v => v === 0).length;

  return (
    <div className="space-y-4">
      {/* Input */}
      <div>
        <p className="text-xs text-slate-500 mb-2">Input x (16-dim, showing 8 for clarity):</p>
        <div className="flex gap-1 items-end h-12">
          {inputVals.map((v, i) => (
            <motion.div
              key={i}
              className={`flex-1 rounded-t-sm ${v >= 0 ? 'bg-cyan-500/60' : 'bg-red-500/60'}`}
              animate={{ height: `${Math.abs(v) / (inputMax + 0.01) * 100}%` }}
              style={{ minHeight: 2 }}
            />
          ))}
        </div>
      </div>

      {/* Arrow + label */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <div className="flex-1 border-t border-dashed border-slate-700" />
        <span className="font-mono text-orange-300">FC1: 16→64 (expand)</span>
        <div className="flex-1 border-t border-dashed border-slate-700" />
      </div>

      {/* FC1 output */}
      <div>
        <p className="text-xs text-slate-500 mb-1">FC1 output (64-dim, showing 16):</p>
        <div className="flex gap-0.5 h-8 items-end">
          {fc1Out.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col justify-end h-full">
              <div
                className={`w-full rounded-sm ${v >= 0 ? 'bg-indigo-400/70' : 'bg-slate-500/70'}`}
                style={{ height: toWidth(v, fc1Max) }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ReLU */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <div className="flex-1 border-t border-dashed border-slate-700" />
        <span className="font-mono text-yellow-300">ReLU: max(0, x)</span>
        <div className="flex-1 border-t border-dashed border-slate-700" />
      </div>

      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-500">After ReLU (64-dim):</span>
          <span className="text-orange-300 font-mono">{reluDead} dead neurons ({((reluDead / 16) * 100).toFixed(0)}%)</span>
        </div>
        <div className="flex gap-0.5 h-8 items-end">
          {reluOut.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col justify-end h-full">
              <motion.div
                className={`w-full rounded-sm ${v > 0 ? 'bg-cyan-400/80' : 'bg-slate-700/40'}`}
                animate={{ height: v > 0 ? toWidth(v, reluMax) : '4px' }}
                transition={{ duration: 0.3 }}
              />
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-600 mt-1">Gray = dead (output 0). ReLU kills ~50% of neurons.</p>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-500">
        <div className="flex-1 border-t border-dashed border-slate-700" />
        <span className="font-mono text-teal-300">FC2: 64→16 (contract)</span>
        <div className="flex-1 border-t border-dashed border-slate-700" />
      </div>

      <div>
        <p className="text-xs text-slate-500 mb-1">FC2 output (16-dim):</p>
        <div className="flex gap-1 h-10 items-end">
          {fc2Out.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col justify-end h-full">
              <motion.div
                className={`w-full rounded-sm ${v >= 0 ? 'bg-teal-400/80' : 'bg-red-400/60'}`}
                animate={{ height: toWidth(v, fc2Max) }}
                style={{ minHeight: 2 }}
                transition={{ duration: 0.3 }}
              />
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => setInputVals(Array.from({ length: 8 }, () => (Math.random() - 0.5) * 1.5))}
        className="w-full py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-colors"
      >
        Randomize input activations
      </button>
    </div>
  );
}
