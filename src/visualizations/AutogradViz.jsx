import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';

// Minimal Value class in JS for visualization
class Value {
  constructor(data, children = [], op = '', label = '') {
    this.data = data;
    this.grad = 0;
    this.children = children;
    this.op = op;
    this.label = label;
    this._backward = () => {};
    this.id = Math.random().toString(36).slice(2, 7);
  }

  add(other) {
    const out = new Value(this.data + other.data, [this, other], '+');
    const self = this;
    out._backward = () => {
      self.grad += out.grad;
      other.grad += out.grad;
    };
    return out;
  }

  mul(other) {
    const out = new Value(this.data * other.data, [this, other], '×');
    const self = this;
    out._backward = () => {
      self.grad += other.data * out.grad;
      other.grad += self.data * out.grad;
    };
    return out;
  }

  backward() {
    const topo = [];
    const visited = new Set();
    const buildTopo = (v) => {
      if (!visited.has(v.id)) {
        visited.add(v.id);
        v.children.forEach(c => buildTopo(c));
        topo.push(v);
      }
    };
    buildTopo(this);
    this.grad = 1;
    [...topo].reverse().forEach(v => v._backward());
  }
}

const PRESETS = [
  { label: 'a×b + c', expr: 'mul_add', a: 2, b: 3, c: 1 },
  { label: 'a×(b+c)', expr: 'mul_paren', a: 4, b: 2, c: 3 },
  { label: '(a+b)×c', expr: 'add_mul', a: 1, b: 2, c: 5 },
];

export default function AutogradViz() {
  const [vals, setVals] = useState({ a: 2, b: 3, c: 1 });
  const [expr, setExpr] = useState('mul_add');
  const [result, setResult] = useState(null);

  const run = useCallback(() => {
    const a = new Value(vals.a, [], '', 'a');
    const b = new Value(vals.b, [], '', 'b');
    const c = new Value(vals.c, [], '', 'c');

    let intermediate, out;

    if (expr === 'mul_add') {
      // a×b + c
      intermediate = a.mul(b);
      intermediate.label = 'a×b';
      out = intermediate.add(c);
    } else if (expr === 'mul_paren') {
      // a×(b+c)
      intermediate = b.add(c);
      intermediate.label = 'b+c';
      out = a.mul(intermediate);
    } else {
      // (a+b)×c
      intermediate = a.add(b);
      intermediate.label = 'a+b';
      out = intermediate.mul(c);
    }

    out.label = 'out';
    out.backward();
    setResult({ a, b, c, intermediate, out });
  }, [vals, expr]);

  // Auto-run when values or expression changes
  useEffect(() => {
    run();
  }, [run]);

  const nodes = result
    ? [
        { node: result.a, x: 60, y: 40, color: 'cyan' },
        { node: result.b, x: 60, y: 120, color: 'indigo' },
        { node: result.intermediate, x: 200, y: 80, color: 'teal' },
        { node: result.c, x: 60, y: 200, color: 'violet' },
        { node: result.out, x: 340, y: 140, color: 'emerald' },
      ]
    : [];

  const colorMap = {
    cyan: { bg: 'bg-cyan-500/20', border: 'border-cyan-500/50', text: 'text-cyan-300', grad: 'text-orange-300' },
    indigo: { bg: 'bg-indigo-500/20', border: 'border-indigo-500/50', text: 'text-indigo-300', grad: 'text-orange-300' },
    teal: { bg: 'bg-teal-500/20', border: 'border-teal-500/50', text: 'text-teal-300', grad: 'text-orange-300' },
    violet: { bg: 'bg-violet-500/20', border: 'border-violet-500/50', text: 'text-violet-300', grad: 'text-orange-300' },
    emerald: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/50', text: 'text-emerald-300', grad: 'text-orange-300' },
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div>
        <p className="text-xs text-slate-500 mb-3">Expression: <span className="text-cyan-400 font-mono">
          {expr === 'mul_add' && 'out = a × b + c'}
          {expr === 'mul_paren' && 'out = a × (b + c)'}
          {expr === 'add_mul' && 'out = (a + b) × c'}
        </span></p>
        <div className="grid grid-cols-3 gap-3 mb-3">
          {['a', 'b', 'c'].map(k => (
            <div key={k}>
              <label className="text-xs text-slate-500 mb-1 block font-mono">{k} =</label>
              <input
                type="number"
                value={vals[k]}
                onChange={e => setVals(v => ({ ...v, [k]: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-2 py-1.5 text-sm text-slate-100 font-mono text-center focus:outline-none focus:border-cyan-500"
              />
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          {PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => { setVals({ a: p.a, b: p.b, c: p.c }); setExpr(p.expr); }}
              className={`px-2.5 py-1 text-xs bg-slate-800 border rounded-lg transition-colors font-mono ${
                expr === p.expr
                  ? 'border-cyan-500 text-cyan-400'
                  : 'border-slate-700 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Computation graph */}
      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <svg width="100%" height="240" viewBox="0 0 420 240" className="overflow-visible">
            {/* Edges */}
            <line x1="85" y1="60" x2="175" y2="95" stroke="#475569" strokeWidth="1.5" />
            <line x1="85" y1="135" x2="175" y2="105" stroke="#475569" strokeWidth="1.5" />
            <line x1="230" y1="100" x2="315" y2="145" stroke="#475569" strokeWidth="1.5" />
            <line x1="85" y1="210" x2="315" y2="160" stroke="#475569" strokeWidth="1.5" />

            {/* Flow animations */}
            {[
              { x1: 315, y1: 145, x2: 230, y2: 100 },
              { x1: 175, y1: 105, x2: 85, y2: 135 },
              { x1: 175, y1: 95, x2: 85, y2: 60 },
            ].map((line, i) => (
              <motion.circle
                key={i}
                r={3}
                fill="#f97316"
                initial={{ cx: line.x1, cy: line.y1, opacity: 0 }}
                animate={{ cx: line.x2, cy: line.y2, opacity: [0, 1, 0] }}
                transition={{ duration: 0.8, delay: i * 0.3, repeat: Infinity, repeatDelay: 1.5 }}
              />
            ))}

            {/* Nodes */}
            {nodes.map(({ node, x, y, color }) => {
              const c = colorMap[color];
              return (
                <foreignObject key={node.id} x={x - 35} y={y - 30} width={80} height={70}>
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className={`${c.bg} ${c.border} border rounded-lg p-1.5 text-center`}
                  >
                    <div className="text-xs text-slate-400">{node.label || node.op}</div>
                    <div className={`text-sm font-mono font-bold ${c.text}`}>
                      {node.data.toFixed(2)}
                    </div>
                    <div className="text-xs font-mono text-orange-300">
                      ∂={node.grad.toFixed(2)}
                    </div>
                  </motion.div>
                </foreignObject>
              );
            })}
          </svg>

          {/* Table */}
          <div className="grid grid-cols-5 gap-1 text-center">
            {[result.a, result.b, result.c, result.intermediate, result.out].map(n => (
              <div key={n.id} className="bg-slate-800 rounded-lg p-2">
                <div className="text-xs text-slate-500 font-mono">{n.label || n.op}</div>
                <div className="text-sm font-mono text-cyan-300">{n.data.toFixed(1)}</div>
                <div className="text-xs font-mono text-orange-300">grad={n.grad.toFixed(1)}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500">Orange values = gradients from <span className="text-orange-300 font-mono">.backward()</span>. Flowing orange dots show gradient direction.</p>
        </motion.div>
      )}
    </div>
  );
}
