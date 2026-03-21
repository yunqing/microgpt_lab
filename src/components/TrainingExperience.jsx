import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, X, Zap, Sparkles } from 'lucide-react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-python';
import 'prismjs/themes/prism-okaidia.css';

const ORIGINAL_CODE = `# https://gist.github.com/karpathy/8627fe009c40f57531cb18360106ce95
import math
import random
import io
import sys

random.seed(42)

# Dataset: 30 real names (from names.txt)
docs = [
    'emma', 'olivia', 'ava', 'isabella', 'sophia', 'mia', 'charlotte',
    'amelia', 'harper', 'evelyn', 'abigail', 'emily', 'elizabeth', 'sofia',
    'ella', 'madison', 'scarlett', 'victoria', 'aria', 'grace', 'chloe',
    'camila', 'penelope', 'riley', 'layla', 'lillian', 'nora', 'zoey',
    'mila', 'aubrey',
]
random.shuffle(docs)
print(f"num docs: {len(docs)}")

# Tokenizer
uchars = sorted(set(''.join(docs)))
BOS = len(uchars)
vocab_size = len(uchars) + 1
print(f"vocab size: {vocab_size}")

# Autograd engine
class Value:
    __slots__ = ('data', 'grad', '_children', '_local_grads')

    def __init__(self, data, children=(), local_grads=()):
        self.data = data
        self.grad = 0
        self._children = children
        self._local_grads = local_grads

    def __add__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        return Value(self.data + other.data, (self, other), (1, 1))

    def __mul__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        return Value(self.data * other.data, (self, other), (other.data, self.data))

    def __pow__(self, other): return Value(self.data**other, (self,), (other * self.data**(other-1),))
    def log(self): return Value(math.log(self.data), (self,), (1/self.data,))
    def exp(self): return Value(math.exp(self.data), (self,), (math.exp(self.data),))
    def relu(self): return Value(max(0, self.data), (self,), (float(self.data > 0),))
    def __neg__(self): return self * -1
    def __radd__(self, other): return self + other
    def __sub__(self, other): return self + (-other)
    def __rsub__(self, other): return other + (-self)
    def __rmul__(self, other): return self * other
    def __truediv__(self, other): return self * other**-1
    def __rtruediv__(self, other): return other * self**-1

    def backward(self):
        topo = []
        visited = set()
        def build_topo(v):
            if v not in visited:
                visited.add(v)
                for child in v._children:
                    build_topo(child)
                topo.append(v)
        build_topo(self)
        self.grad = 1
        for v in reversed(topo):
            for child, local_grad in zip(v._children, v._local_grads):
                child.grad += local_grad * v.grad

# Model parameters
n_layer = 1
n_embd = 16
block_size = 16
n_head = 4
head_dim = n_embd // n_head
matrix = lambda nout, nin, std=0.08: [[Value(random.gauss(0, std)) for _ in range(nin)] for _ in range(nout)]
state_dict = {'wte': matrix(vocab_size, n_embd), 'wpe': matrix(block_size, n_embd), 'lm_head': matrix(vocab_size, n_embd)}
for i in range(n_layer):
    state_dict[f'layer{i}.attn_wq'] = matrix(n_embd, n_embd)
    state_dict[f'layer{i}.attn_wk'] = matrix(n_embd, n_embd)
    state_dict[f'layer{i}.attn_wv'] = matrix(n_embd, n_embd)
    state_dict[f'layer{i}.attn_wo'] = matrix(n_embd, n_embd)
    state_dict[f'layer{i}.mlp_fc1'] = matrix(4 * n_embd, n_embd)
    state_dict[f'layer{i}.mlp_fc2'] = matrix(n_embd, 4 * n_embd)
params = [p for mat in state_dict.values() for row in mat for p in row]
print(f"num params: {len(params)}")

# Model architecture
def linear(x, w):
    return [sum(wi * xi for wi, xi in zip(wo, x)) for wo in w]

def softmax(logits):
    max_val = max(val.data for val in logits)
    exps = [(val - max_val).exp() for val in logits]
    total = sum(exps)
    return [e / total for e in exps]

def rmsnorm(x):
    ms = sum(xi * xi for xi in x) / len(x)
    scale = (ms + 1e-5) ** -0.5
    return [xi * scale for xi in x]

def gpt(token_id, pos_id, keys, values):
    tok_emb = state_dict['wte'][token_id]
    pos_emb = state_dict['wpe'][pos_id]
    x = [t + p for t, p in zip(tok_emb, pos_emb)]
    x = rmsnorm(x)
    for li in range(n_layer):
        x_residual = x
        x = rmsnorm(x)
        q = linear(x, state_dict[f'layer{li}.attn_wq'])
        k = linear(x, state_dict[f'layer{li}.attn_wk'])
        v = linear(x, state_dict[f'layer{li}.attn_wv'])
        keys[li].append(k)
        values[li].append(v)
        x_attn = []
        for h in range(n_head):
            hs = h * head_dim
            q_h = q[hs:hs+head_dim]
            k_h = [ki[hs:hs+head_dim] for ki in keys[li]]
            v_h = [vi[hs:hs+head_dim] for vi in values[li]]
            attn_logits = [sum(q_h[j] * k_h[t][j] for j in range(head_dim)) / head_dim**0.5 for t in range(len(k_h))]
            attn_weights = softmax(attn_logits)
            head_out = [sum(attn_weights[t] * v_h[t][j] for t in range(len(v_h))) for j in range(head_dim)]
            x_attn.extend(head_out)
        x = linear(x_attn, state_dict[f'layer{li}.attn_wo'])
        x = [a + b for a, b in zip(x, x_residual)]
        x_residual = x
        x = rmsnorm(x)
        x = linear(x, state_dict[f'layer{li}.mlp_fc1'])
        x = [xi.relu() for xi in x]
        x = linear(x, state_dict[f'layer{li}.mlp_fc2'])
        x = [a + b for a, b in zip(x, x_residual)]
    logits = linear(x, state_dict['lm_head'])
    return logits

# Adam optimizer
learning_rate, beta1, beta2, eps_adam = 0.01, 0.85, 0.99, 1e-8
m = [0.0] * len(params)
v = [0.0] * len(params)

# Training loop
num_steps = 30  # Reduced from 50 for faster execution on mobile devices
for step in range(num_steps):
    doc = docs[step % len(docs)]
    tokens = [BOS] + [uchars.index(ch) for ch in doc] + [BOS]
    n = min(block_size, len(tokens) - 1)
    keys, values = [[] for _ in range(n_layer)], [[] for _ in range(n_layer)]
    losses = []
    for pos_id in range(n):
        token_id, target_id = tokens[pos_id], tokens[pos_id + 1]
        logits = gpt(token_id, pos_id, keys, values)
        probs = softmax(logits)
        loss_t = -probs[target_id].log()
        losses.append(loss_t)
    loss = (1 / n) * sum(losses)
    loss.backward()
    lr_t = learning_rate * (1 - step / num_steps)
    for i, p in enumerate(params):
        m[i] = beta1 * m[i] + (1 - beta1) * p.grad
        v[i] = beta2 * v[i] + (1 - beta2) * p.grad ** 2
        m_hat = m[i] / (1 - beta1 ** (step + 1))
        v_hat = v[i] / (1 - beta2 ** (step + 1))
        p.data -= lr_t * m_hat / (v_hat ** 0.5 + eps_adam)
        p.grad = 0
    print(f"step {step+1:4d} / {num_steps:4d} | loss {loss.data:.4f}", end='\\n')

# Inference
temperature = 0.5
print("\\n--- inference (new, hallucinated names) ---")
for sample_idx in range(20):
    keys, values = [[] for _ in range(n_layer)], [[] for _ in range(n_layer)]
    token_id = BOS
    sample = []
    for pos_id in range(block_size):
        logits = gpt(token_id, pos_id, keys, values)
        probs = softmax([l / temperature for l in logits])
        token_id = random.choices(range(vocab_size), weights=[p.data for p in probs])[0]
        if token_id == BOS:
            break
        sample.append(uchars[token_id])
    print(f"sample {sample_idx+1:2d}: {''.join(sample)}")
`;


const STATUS_COLORS = {
  idle: 'text-slate-400',
  loading: 'text-yellow-400',
  running: 'text-cyan-400',
  done: 'text-emerald-400',
  error: 'text-red-400',
};

const STATUS_LABELS = {
  idle: 'idle',
  loading: 'loading pyodide...',
  running: 'running',
  done: 'done',
  error: 'error',
};

export default function TrainingExperience({ onClose, onComplete }) {
  const [code, setCode] = useState(ORIGINAL_CODE);
  const [outputLines, setOutputLines] = useState([]);
  const [runStatus, setRunStatus] = useState('idle');
  const [samples, setSamples] = useState([]);
  const [finalLoss, setFinalLoss] = useState(null);
  const workerRef = useRef(null);
  const terminalRef = useRef(null);

  // Spawn worker — Pyodide starts loading immediately on worker creation
  useEffect(() => {
    const worker = new Worker(`${process.env.PUBLIC_URL}/pyodide-worker.js`);
    workerRef.current = worker;
    return () => worker.terminate();
  }, []);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [outputLines]);

  const appendLine = (line) => {
    setOutputLines(prev => [...prev, line]);
  };

  const runTraining = () => {
    if (runStatus === 'running' || runStatus === 'loading') return;
    const worker = workerRef.current;
    if (!worker) return;

    setOutputLines([]);
    setSamples([]);
    setFinalLoss(null);
    setRunStatus('loading');
    appendLine('$ Loading Pyodide runtime...');

    const collectedLines = [];

    worker.onmessage = (e) => {
      const { type, line, error } = e.data;

      if (type === 'ready') {
        appendLine('$ Pyodide ready. Running code...');
        appendLine('');
        setRunStatus('running');
        return;
      }

      if (type === 'run-error') {
        appendLine(`Error: ${error}`);
        setRunStatus('error');
        return;
      }

      if (type === 'stdout') {
        collectedLines.push(line);
        appendLine(line);
        return;
      }

      if (type === 'run-done') {
        if (error) {
          appendLine(`Error: ${error}`);
          setRunStatus('error');
          return;
        }

        // Parse final results from collected output
        const stepLines = collectedLines.filter(l => l.startsWith('step'));
        if (stepLines.length > 0) {
          const lastStep = stepLines[stepLines.length - 1];
          const lossMatch = lastStep.match(/loss\s+([\d.]+)/);
          if (lossMatch) setFinalLoss(parseFloat(lossMatch[1]));
        }
        const sampleLines = collectedLines.filter(l => l.startsWith('sample'));
        const parsedSamples = sampleLines.map(l => l.replace(/^sample\s+\d+:\s*/, '').trim()).filter(Boolean);
        setSamples(parsedSamples);

        setRunStatus('done');
      }
    };

    worker.postMessage({ type: 'run', code });
  };

  const resetCode = () => {
    setCode(ORIGINAL_CODE);
  };

  const isRunning = runStatus === 'loading' || runStatus === 'running';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-2"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-slate-900 border border-slate-700 rounded-xl w-full h-full max-w-[95vw] lg:max-w-[1400px] max-h-[95vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">microgpt — microgpt.py</h2>
              <p className="text-xs text-slate-500">Edit the code, then click Run Training</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        {/* Two-panel body */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
          {/* Left: Code editor — always dark regardless of theme */}
          <div style={{
            display: 'flex', flexDirection: 'column',
            borderRight: '1px solid #334155', overflow: 'hidden',
            backgroundColor: '#282c34',
          }}
          className="w-full lg:w-[60%] flex-shrink-0 h-1/2 lg:h-full"
          >
            <div style={{
              padding: '8px 12px', backgroundColor: 'rgba(30,41,59,0.8)',
              borderBottom: '1px solid #334155', display: 'flex',
              alignItems: 'center', gap: '8px', flexShrink: 0,
            }}>
              <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>microgpt.py</span>
              <span style={{ color: '#475569' }}>·</span>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Python</span>
            </div>
            <div className="code-editor-container" style={{ flex: 1, overflow: 'auto', backgroundColor: '#282c34', WebkitOverflowScrolling: 'touch' }}>
              <Editor
                value={code}
                onValueChange={setCode}
                highlight={code => highlight(code, languages.python, 'python')}
                preClassName="code-editor-pre"
                textareaClassName="code-editor-textarea"
                padding={12}
                style={{
                  fontFamily: '"JetBrains Mono", "Fira Code", Menlo, Monaco, monospace',
                  fontSize: '12.5px',
                  lineHeight: '1.6',
                  backgroundColor: '#282c34',
                  color: '#abb2bf',
                  minHeight: '100%',
                  caretColor: '#a78bfa',
                }}
                tabSize={4}
                insertSpaces={true}
              />
            </div>
          </div>

          {/* Right: Controls + Terminal */}
          <div className="w-full lg:w-[40%] flex flex-col overflow-hidden bg-slate-950 flex-shrink-0 h-1/2 lg:h-full">
            {/* Controls bar */}
            <div className="px-3 py-2 border-b border-slate-800 flex items-center gap-2 flex-shrink-0">
              <button
                onClick={runTraining}
                disabled={isRunning}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-md text-white text-xs font-semibold transition-all"
              >
                <Play size={12} />
                {isRunning ? 'Running...' : '▶ Run Training'}
              </button>
              <button
                onClick={resetCode}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-md text-slate-300 text-xs font-semibold transition-all"
              >
                <RotateCcw size={12} />
                Reset Code
              </button>
              <div className={`ml-auto text-xs font-mono ${STATUS_COLORS[runStatus]}`}>
                ● {STATUS_LABELS[runStatus]}
              </div>
            </div>

            {/* Terminal output */}
            <div
              ref={terminalRef}
              className="flex-1 overflow-y-auto p-3 font-mono text-xs leading-relaxed min-h-0"
              style={{ background: '#0d1117' }}
            >
              {outputLines.length === 0 && runStatus === 'idle' && (
                <div className="text-slate-600 select-none">
                  <div>$ click ▶ Run Training to execute the code</div>
                  <div className="mt-1">$ you can edit the code on the left first</div>
                  <div className="mt-1 text-slate-700">$ try changing num_steps = 30 → num_steps = 10</div>
                </div>
              )}
              {outputLines.map((line, i) => {
                const isStep = line.startsWith('step');
                const isInference = line.includes('inference') || line.startsWith('sample');
                const isError = line.startsWith('Error');
                const isCmd = line.startsWith('$');
                return (
                  <div
                    key={i}
                    className={
                      isError ? 'text-red-400' :
                      isCmd ? 'text-slate-500' :
                      isInference ? 'text-emerald-400' :
                      isStep ? 'text-cyan-300' :
                      'text-slate-300'
                    }
                  >
                    {line || '\u00A0'}
                  </div>
                );
              })}
              {isRunning && (
                <div className="text-yellow-400 animate-pulse">▌</div>
              )}
            </div>

            {/* Results section */}
            {runStatus === 'done' && samples.length > 0 && (
              <div className="border-t border-slate-800 p-3 flex-shrink-0 max-h-[35%] overflow-y-auto">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={13} className="text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-300">
                    Generated names
                    {finalLoss !== null && (
                      <span className="ml-2 text-slate-400 font-normal">
                        · final loss: <span className="text-emerald-400">{finalLoss.toFixed(4)}</span>
                      </span>
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {samples.map((name, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-cyan-300 font-mono text-center truncate"
                    >
                      {name || '—'}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {runStatus === 'error' && (
              <div className="border-t border-red-900/50 p-3 flex-shrink-0">
                <p className="text-xs text-red-400">Execution failed — see error above</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
