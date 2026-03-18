import { motion } from 'framer-motion';

const N_EMBD = 16;
const N_HEAD = 4;
const HEAD_DIM = 4;

export default function QKVViz() {
  const dims = Array.from({ length: N_EMBD }, (_, i) => i);

  const headColors = ['bg-cyan-500', 'bg-indigo-500', 'bg-violet-500', 'bg-teal-500'];
  const headTextColors = ['text-cyan-300', 'text-indigo-300', 'text-violet-300', 'text-teal-300'];

  return (
    <div className="space-y-5">
      {/* Input vector x [16] */}
      <div>
        <p className="text-xs text-slate-500 mb-2">Input <span className="font-mono text-slate-300">x</span> after RMSNorm — shape [16]:</p>
        <div className="flex gap-0.5">
          {dims.map(i => (
            <div
              key={i}
              className="flex-1 h-6 rounded-sm bg-slate-600/60 border border-slate-600"
              style={{ opacity: 0.4 + (i % 4) * 0.15 }}
            />
          ))}
        </div>
      </div>

      {/* Three projections */}
      {['Q (Query)', 'K (Key)', 'V (Value)'].map((role, ri) => {
        const colors = ['from-cyan-600 to-cyan-800', 'from-indigo-600 to-indigo-800', 'from-violet-600 to-violet-800'];
        const outColors = [headColors.map(c => c), headColors.map(c => c), headColors.map(c => c)];
        return (
          <div key={role}>
            <div className="flex items-center gap-3 mb-2">
              {/* Weight matrix arrow */}
              <div className={`px-2.5 py-1 text-xs rounded-lg bg-gradient-to-r ${colors[ri]} text-white font-mono`}>
                W_{role[0].toLowerCase()}
              </div>
              <svg width="24" height="12">
                <line x1="0" y1="6" x2="18" y2="6" stroke="#475569" strokeWidth="1.5" />
                <polygon points="18,3 24,6 18,9" fill="#475569" />
              </svg>
              <p className="text-xs text-slate-400">{role} — shape [16]</p>
            </div>
            {/* Output split into 4 heads */}
            <div className="flex gap-0.5">
              {Array.from({ length: N_HEAD }, (_, h) =>
                Array.from({ length: HEAD_DIM }, (_, d) => (
                  <motion.div
                    key={`${h}-${d}`}
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    transition={{ delay: (h * HEAD_DIM + d) * 0.02 }}
                    className={`flex-1 h-6 rounded-sm ${headColors[h]}/50 border ${headColors[h].replace('bg-', 'border-')}/40`}
                  />
                ))
              )}
            </div>
            <div className="flex gap-0.5 mt-1">
              {Array.from({ length: N_HEAD }, (_, h) => (
                <div key={h} className={`flex-1 text-center text-xs ${headTextColors[h]}`} style={{ width: `${HEAD_DIM * 6.25}%` }}>
                  h{h + 1}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Attention computation */}
      <div className="border-t border-slate-700 pt-4">
        <p className="text-xs text-slate-500 mb-3">Per head: attention score = Q·K^T / √{HEAD_DIM}</p>
        <div className="flex gap-3">
          {Array.from({ length: N_HEAD }, (_, h) => (
            <motion.div
              key={h}
              whileHover={{ scale: 1.05 }}
              className={`flex-1 rounded-lg border ${headColors[h].replace('bg-', 'border-')}/30 bg-slate-800/50 p-2 text-center`}
            >
              <div className={`text-xs font-semibold ${headTextColors[h]} mb-1`}>Head {h + 1}</div>
              <div className="text-xs text-slate-500">dim={HEAD_DIM}</div>
              <div className="grid grid-cols-2 gap-0.5 mt-1.5">
                {Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className={`h-3 rounded-sm ${headColors[h]}/30`} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
        <p className="text-xs text-slate-600 mt-2">4 heads × 4 dim = 16 total — same as input!</p>
      </div>
    </div>
  );
}
