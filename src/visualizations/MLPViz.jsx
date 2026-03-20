import { useState } from 'react';
import { motion } from 'framer-motion';

function relu(x) { return Math.max(0, x); }

// Simple 3→4→3 MLP for clear visualization
export default function MLPViz() {
  // Smaller network for clarity: 3 input → 4 hidden → 3 output
  const [input, setInput] = useState([0.5, -0.3, 0.8]);

  // Fixed small weights for demonstration (users can see exact computation)
  const W1 = [
    [0.5, -0.3, 0.2],  // hidden neuron 0
    [0.4, 0.6, -0.1],  // hidden neuron 1
    [-0.2, 0.3, 0.5],  // hidden neuron 2
    [0.3, -0.4, 0.4],  // hidden neuron 3
  ];
  const b1 = [0.1, -0.1, 0.2, 0.0];

  const W2 = [
    [0.4, -0.2, 0.3, 0.1],  // output neuron 0
    [-0.3, 0.5, 0.2, -0.1], // output neuron 1
    [0.2, 0.1, -0.4, 0.3],  // output neuron 2
  ];
  const b2 = [0.0, 0.1, -0.1];

  // FC1: compute hidden = W1 · input + b1
  const hidden_pre = W1.map((weights, i) =>
    weights.reduce((sum, w, j) => sum + w * input[j], 0) + b1[i]
  );

  // ReLU
  const hidden_post = hidden_pre.map(relu);

  // FC2: compute output = W2 · hidden + b2
  const output = W2.map((weights, i) =>
    weights.reduce((sum, w, j) => sum + w * hidden_post[j], 0) + b2[i]
  );

  const adjustInput = (idx, delta) => {
    setInput(prev => {
      const newInput = [...prev];
      newInput[idx] = Math.max(-2, Math.min(2, newInput[idx] + delta));
      return newInput;
    });
  };

  const deadNeurons = hidden_post.filter(v => v === 0).length;

  return (
    <div className="space-y-5">
      {/* Info */}
      <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
        <p className="text-xs text-slate-400 mb-1">
          <span className="text-cyan-400 font-semibold">MLP Structure:</span> FC1 (expand) → ReLU → FC2 (contract)
        </p>
        <p className="text-xs text-slate-500">
          Simplified: [3] → [4] → [3] (real: [16] → [64] → [16])
        </p>
      </div>

      {/* Input layer */}
      <div>
        <p className="text-xs text-slate-500 mb-2">Input layer [3]:</p>
        <div className="space-y-2">
          {input.map((val, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs text-slate-400 w-12">x[{i}]</span>
              <div className="flex-1 h-8 bg-slate-900 rounded relative overflow-hidden">
                <motion.div
                  className={`absolute left-1/2 h-full ${val >= 0 ? 'bg-cyan-500/60' : 'bg-red-500/60'}`}
                  style={{
                    width: `${Math.abs(val) * 25}%`,
                    [val >= 0 ? 'left' : 'right']: '50%',
                  }}
                  animate={{ width: `${Math.abs(val) * 25}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-mono text-cyan-300">{val.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => adjustInput(i, -0.1)}
                  className="w-6 h-6 text-xs bg-slate-800 border border-slate-700 rounded text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50"
                >
                  −
                </button>
                <button
                  onClick={() => adjustInput(i, 0.1)}
                  className="w-6 h-6 text-xs bg-slate-800 border border-slate-700 rounded text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FC1 + weights visualization */}
      <div className="border-t border-slate-700 pt-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-orange-300 font-mono">FC1: [3] → [4] (expand 4×)</p>
          <p className="text-xs text-slate-600">W1[4×3] · x + b1</p>
        </div>

        <div className="space-y-2">
          {hidden_pre.map((val, i) => {
            const computation = W1[i].map((w, j) => `${w.toFixed(1)}×${input[j].toFixed(1)}`).join(' + ');
            return (
              <div key={i} className="bg-slate-800/30 rounded-lg p-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-slate-400 w-12">h[{i}]</span>
                  <div className="flex-1 text-xs text-slate-600 font-mono truncate">
                    {computation} + {b1[i].toFixed(1)}
                  </div>
                  <span className="text-xs font-mono text-indigo-300 w-16 text-right">
                    = {val.toFixed(2)}
                  </span>
                </div>
                <div className="h-3 bg-slate-900 rounded overflow-hidden">
                  <motion.div
                    className={`h-full ${val >= 0 ? 'bg-indigo-500/60' : 'bg-red-500/60'}`}
                    animate={{ width: `${Math.min(100, Math.abs(val) * 50)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ReLU */}
      <div className="border-t border-slate-700 pt-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-yellow-300 font-mono">ReLU: max(0, x)</p>
          <p className="text-xs text-orange-300">{deadNeurons}/4 dead neurons</p>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {hidden_pre.map((pre, i) => {
            const post = hidden_post[i];
            const isDead = post === 0;
            return (
              <div key={i} className="text-center">
                <div className="h-16 bg-slate-900 rounded relative overflow-hidden mb-1">
                  <motion.div
                    className={`absolute bottom-0 left-0 right-0 ${isDead ? 'bg-slate-700/40' : 'bg-cyan-500/70'}`}
                    animate={{ height: isDead ? '20%' : `${Math.min(100, post * 50)}%` }}
                  />
                  {isDead && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl">🚫</span>
                    </div>
                  )}
                </div>
                <div className="text-xs text-slate-500">h[{i}]</div>
                <div className={`text-xs font-mono ${isDead ? 'text-slate-600' : 'text-cyan-300'}`}>
                  {pre.toFixed(2)} → {post.toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-slate-600 mt-2">
          ReLU zeros out negative values, creating sparsity
        </p>
      </div>

      {/* FC2 */}
      <div className="border-t border-slate-700 pt-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-teal-300 font-mono">FC2: [4] → [3] (contract)</p>
          <p className="text-xs text-slate-600">W2[3×4] · h + b2</p>
        </div>

        <div className="space-y-2">
          {output.map((val, i) => {
            const activeWeights = W2[i].map((w, j) =>
              hidden_post[j] > 0 ? `${w.toFixed(1)}×${hidden_post[j].toFixed(1)}` : '0'
            ).filter(s => s !== '0').join(' + ');
            return (
              <div key={i} className="bg-slate-800/30 rounded-lg p-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-slate-400 w-12">out[{i}]</span>
                  <div className="flex-1 text-xs text-slate-600 font-mono truncate">
                    {activeWeights || '0'} + {b2[i].toFixed(1)}
                  </div>
                  <span className="text-xs font-mono text-teal-300 w-16 text-right">
                    = {val.toFixed(2)}
                  </span>
                </div>
                <div className="h-4 bg-slate-900 rounded overflow-hidden">
                  <motion.div
                    className={`h-full ${val >= 0 ? 'bg-teal-500/70' : 'bg-red-500/60'}`}
                    animate={{ width: `${Math.min(100, Math.abs(val) * 50)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Presets */}
      <div className="flex gap-2">
        <button
          onClick={() => setInput([0.5, -0.3, 0.8])}
          className="flex-1 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50"
        >
          Reset
        </button>
        <button
          onClick={() => setInput([1.0, 1.0, 1.0])}
          className="flex-1 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50"
        >
          All positive
        </button>
        <button
          onClick={() => setInput([-0.5, -0.5, -0.5])}
          className="flex-1 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50"
        >
          All negative
        </button>
      </div>
    </div>
  );
}
