import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw } from 'lucide-react';

const BETA1 = 0.85;
const BETA2 = 0.99;
const LR = 0.01;
const EPS = 1e-8;

function genGradSequence(seed) {
  let s = seed;
  return Array.from({ length: 60 }, (i) => {
    s = Math.sin(s * 7.3 + i * 0.3) * 2.1 - Math.cos(s * 3.1 + i * 0.2) * 1.4;
    return s;
  });
}

export default function AdamViz() {
  const gradSeq = useRef(genGradSequence(1.23));
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);
  const [history, setHistory] = useState([{ m: 0, v: 0, param: 0.5, grad: 0, lr_t: LR, step: 0 }]);
  const intervalRef = useRef(null);

  const runStep = (hist, st) => {
    if (st >= gradSeq.current.length) { setRunning(false); return hist; }
    const prev = hist[hist.length - 1];
    const grad = gradSeq.current[st];
    const m = BETA1 * prev.m + (1 - BETA1) * grad;
    const v = BETA2 * prev.v + (1 - BETA2) * grad * grad;
    const m_hat = m / (1 - Math.pow(BETA1, st + 1));
    const v_hat = v / (1 - Math.pow(BETA2, st + 1));
    const lr_t = LR * (1 - st / gradSeq.current.length);
    const param = prev.param - lr_t * m_hat / (Math.sqrt(v_hat) + EPS);
    return [...hist, { m, v, param, grad, m_hat, v_hat, lr_t, step: st + 1 }];
  };

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setHistory(h => {
          const next = runStep(h, h.length - 1);
          if (next === h) { setRunning(false); return h; }
          setStep(next.length - 1);
          return next;
        });
      }, 120);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const reset = () => {
    setRunning(false);
    setStep(0);
    setHistory([{ m: 0, v: 0, param: 0.5, grad: 0, lr_t: LR, step: 0 }]);
  };

  const cur = history[history.length - 1];
  const histSlice = history.slice(-30);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex gap-2 items-center">
        <button
          onClick={() => setRunning(r => !r)}
          disabled={step >= 59}
          className="flex items-center gap-1.5 px-4 py-2 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-300 text-sm hover:bg-yellow-500/30 disabled:opacity-40 transition-colors"
        >
          {running ? <><Pause size={12} /> Pause</> : <><Play size={12} /> {step === 0 ? 'Start Training' : 'Resume'}</>}
        </button>
        <button onClick={reset} className="flex items-center gap-1.5 px-3 py-2 text-xs text-slate-400 border border-slate-700 rounded-lg hover:text-slate-300">
          <RotateCcw size={12} /> Reset
        </button>
        <span className="text-xs text-slate-500 font-mono">Step {step} / 60</span>
      </div>

      {/* Current values */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'gradient (g)', value: cur.grad?.toFixed(4), color: 'text-slate-300' },
          { label: '1st moment (m)', value: cur.m?.toFixed(4), color: 'text-cyan-300' },
          { label: '2nd moment (v)', value: cur.v?.toFixed(6), color: 'text-indigo-300' },
          { label: 'eff. lr = lr / √v̂', value: cur.v_hat != null ? (cur.lr_t / (Math.sqrt(cur.v_hat) + EPS)).toFixed(5) : '—', color: 'text-orange-300' },
          { label: 'param update', value: cur.param?.toFixed(5), color: 'text-teal-300' },
          { label: 'lr_t (decayed)', value: cur.lr_t?.toFixed(5), color: 'text-yellow-300' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-slate-800/60 rounded-lg p-2 border border-slate-700">
            <p className="text-xs text-slate-500">{label}</p>
            <motion.p className={`text-sm font-mono font-bold ${color}`} key={value}>{value ?? '—'}</motion.p>
          </div>
        ))}
      </div>

      {/* Time series chart */}
      {histSlice.length > 1 && (
        <div>
          <p className="text-xs text-slate-500 mb-2">Parameter value over time:</p>
          <svg width="100%" height="80" viewBox={`0 0 300 80`} preserveAspectRatio="none">
            <polyline
              points={histSlice.map((h, i) =>
                `${(i / (histSlice.length - 1)) * 300},${40 - (h.param - 0.5) * 60}`
              ).join(' ')}
              fill="none"
              stroke="#22d3ee"
              strokeWidth="1.5"
            />
            <polyline
              points={histSlice.map((h, i) =>
                `${(i / (histSlice.length - 1)) * 300},${40 - h.m * 15}`
              ).join(' ')}
              fill="none"
              stroke="#818cf8"
              strokeWidth="1"
              strokeDasharray="3,2"
            />
            <line x1="0" y1="40" x2="300" y2="40" stroke="#334155" strokeWidth="1" />
          </svg>
          <div className="flex gap-4 text-xs text-slate-500 mt-1">
            <span><span className="text-cyan-400">——</span> param.data</span>
            <span><span className="text-indigo-400">- - -</span> momentum (m)</span>
          </div>
        </div>
      )}

      <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
        <p className="text-xs text-slate-400">
          Notice how <span className="text-cyan-300">m</span> (momentum) smooths the gradient noise,
          while <span className="text-indigo-300">v</span> adapts the learning rate per-parameter.
          Early steps have large effective lr; later steps shrink as <span className="text-indigo-300">v</span> accumulates.
        </p>
      </div>
    </div>
  );
}
