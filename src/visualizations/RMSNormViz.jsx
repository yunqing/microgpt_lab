import { useState } from 'react';
import { motion } from 'framer-motion';

function rmsnorm(x) {
  const ms = x.reduce((s, v) => s + v * v, 0) / x.length;
  const scale = Math.pow(ms + 1e-5, -0.5);
  return x.map(v => v * scale);
}

export default function RMSNormViz() {
  const [rawVec, setRawVec] = useState([3.2, -1.5, 8.7, -4.1, 2.3, -6.8, 1.1, 5.4]);
  const normed = rmsnorm(rawVec);

  const rms = Math.sqrt(rawVec.reduce((s, v) => s + v * v, 0) / rawVec.length);

  // Use the same scale for both charts so we can see the magnitude change!
  const globalMax = Math.max(...rawVec.map(Math.abs));

  const scramble = () => {
    setRawVec(Array.from({ length: 8 }, () => (Math.random() - 0.5) * 20));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400">RMS of input: <span className="text-orange-300 font-mono">{rms.toFixed(3)}</span></p>
          <p className="text-xs text-slate-400">Scale factor (1/√ms): <span className="text-cyan-300 font-mono">{(1 / (rms + 1e-5)).toFixed(3)}</span></p>
          <p className="text-xs text-slate-500 mt-1">💡 Both charts use the same scale to show magnitude change</p>
        </div>
        <button
          onClick={scramble}
          className="px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-colors"
        >
          Randomize input
        </button>
      </div>

      {/* Bar charts side by side */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Before RMSNorm', data: rawVec, color1: 'bg-orange-400', color2: 'bg-red-500' },
          { label: 'After RMSNorm', data: normed, color1: 'bg-cyan-400', color2: 'bg-indigo-400' },
        ].map(({ label, data, color1, color2 }) => (
          <div key={label}>
            <p className="text-xs text-slate-500 mb-2">{label}</p>
            <div className="flex items-end gap-1 h-28">
              {data.map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                  <div className="w-full flex flex-col justify-end" style={{ height: '50%' }}>
                    {v >= 0 && (
                      <motion.div
                        className={`w-full rounded-t-sm ${color1}`}
                        initial={{ height: 0 }}
                        animate={{ height: `${(v / globalMax) * 100}%` }}
                        style={{ minHeight: 2 }}
                        transition={{ duration: 0.4 }}
                      />
                    )}
                  </div>
                  <div className="w-full flex flex-col" style={{ height: '50%' }}>
                    {v < 0 && (
                      <motion.div
                        className={`w-full rounded-b-sm ${color2}`}
                        initial={{ height: 0 }}
                        animate={{ height: `${(-v / globalMax) * 100}%` }}
                        style={{ minHeight: 2 }}
                        transition={{ duration: 0.4 }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-slate-600 mt-1">
              <span>{Math.min(...data).toFixed(1)}</span>
              <span>dim</span>
              <span>{Math.max(...data).toFixed(1)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
        <p className="text-xs text-slate-400">
          Notice: RMSNorm doesn't change the <em>direction</em> of the vector — only its <em>magnitude</em>.
          The shape stays the same, but values are rescaled so RMS ≈ 1.
        </p>
      </div>
    </div>
  );
}
