import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SAMPLE_NAMES = ['emma', 'oliver', 'zoe', 'max'];

export default function TokenizerViz() {
  const [input, setInput] = useState('emma');
  const uchars = 'abcdefghijklmnopqrstuvwxyz'.split('');
  const BOS = 26;

  const tokens = input
    ? [BOS, ...input.toLowerCase().replace(/[^a-z]/g, '').split('').map(c => uchars.indexOf(c)).filter(i => i >= 0), BOS]
    : [BOS];

  const tokenColors = [
    'bg-indigo-500/20 border-indigo-500/50 text-indigo-300',
    'bg-cyan-500/20 border-cyan-500/50 text-cyan-300',
    'bg-teal-500/20 border-teal-500/50 text-teal-300',
    'bg-violet-500/20 border-violet-500/50 text-violet-300',
  ];

  return (
    <div className="space-y-6">
      {/* Input */}
      <div>
        <label className="text-xs text-slate-500 mb-2 block">Enter a name:</label>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value.slice(0, 12))}
            className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
            placeholder="emma"
            maxLength={12}
          />
          {SAMPLE_NAMES.map(n => (
            <button
              key={n}
              onClick={() => setInput(n)}
              className="px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-colors"
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Token pipeline */}
      <div>
        <p className="text-xs text-slate-500 mb-3">Token sequence (with BOS wrapping):</p>
        <div className="flex flex-wrap gap-2 items-center">
          <AnimatePresence mode="popLayout">
            {tokens.map((tok, i) => (
              <motion.div
                key={`${i}-${tok}`}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`border rounded-lg px-2.5 py-1.5 text-center ${
                  tok === BOS
                    ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                    : tokenColors[i % tokenColors.length]
                }`}
              >
                <div className="text-sm font-mono font-bold">
                  {tok === BOS ? '⊕' : uchars[tok]}
                </div>
                <div className="text-xs opacity-60">{tok}</div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <p className="text-xs text-slate-600 mt-2">⊕ = BOS token (id: {BOS})</p>
      </div>

      {/* Vocab visualization */}
      <div>
        <p className="text-xs text-slate-500 mb-2">Vocabulary (vocab_size = 27):</p>
        <div className="flex flex-wrap gap-1">
          {[...uchars, '⊕'].map((c, i) => {
            const isUsed = i === BOS
              ? true
              : input.toLowerCase().includes(c);
            return (
              <motion.div
                key={c}
                animate={{ backgroundColor: isUsed ? 'rgba(6, 182, 212, 0.15)' : 'transparent' }}
                className={`w-6 h-6 rounded text-xs flex items-center justify-center font-mono border ${
                  isUsed ? 'border-cyan-500/40 text-cyan-300' : 'border-slate-700 text-slate-600'
                }`}
              >
                {c}
              </motion.div>
            );
          })}
        </div>
        <p className="text-xs text-slate-600 mt-1">Highlighted = chars in your input</p>
      </div>
    </div>
  );
}
