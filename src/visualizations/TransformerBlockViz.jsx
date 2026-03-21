import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Each node in the architecture diagram
const NODES = [
  {
    id: 'token',
    label: 'Input Token',
    sublabel: 'token_id, pos_id',
    color: 'border-slate-500 bg-slate-700/50 text-slate-300',
    dot: 'bg-slate-400',
    code: `# One token at a time (autoregressive)
token_id = tokens[pos_id]      # e.g. 4 = 'e'
target_id = tokens[pos_id + 1] # what to predict`,
    explain: `microgpt processes one token per forward pass. At position 0 it sees the BOS token and must predict 'e'. At position 1 it sees 'e' and must predict 'm'. The keys/values from all past positions are cached and reused.`,
  },
  {
    id: 'embed',
    label: 'Embedding Lookup',
    sublabel: 'wte + wpe',
    color: 'border-blue-500/60 bg-blue-500/10 text-blue-300',
    dot: 'bg-blue-400',
    code: `tok_emb = state_dict['wte'][token_id]
pos_emb = state_dict['wpe'][pos_id]
x = [t + p for t, p in zip(tok_emb, pos_emb)]`,
    explain: `The token ID and position ID are each looked up in a learned matrix, then element-wise added. This converts a discrete token index into a continuous 16-dim vector that the transformer can operate on.`,
  },
  {
    id: 'norm0',
    label: 'RMSNorm',
    sublabel: 'before attention',
    color: 'border-teal-500/60 bg-teal-500/10 text-teal-300',
    dot: 'bg-teal-400',
    code: `x = rmsnorm(x)   # stabilize before attention`,
    explain: `Pre-normalization (applying RMSNorm BEFORE the sub-block) is more stable than post-norm. This was a key finding in the PaLM and LLaMA papers. It means each sub-block receives a well-scaled input regardless of the residual stream's magnitude.`,
  },
  {
    id: 'attn',
    label: 'Multi-Head Attention',
    sublabel: 'Q·K/√d → softmax → V',
    color: 'border-violet-500/60 bg-violet-500/10 text-violet-300',
    dot: 'bg-violet-400',
    code: `q = linear(x, state_dict['layer0.attn_wq'])
k = linear(x, state_dict['layer0.attn_wk'])
v = linear(x, state_dict['layer0.attn_wv'])
keys[li].append(k)
values[li].append(v)
# ... per-head dot-product attention ...
x = linear(x_attn, state_dict['layer0.attn_wo'])`,
    explain: `Attention is the COMMUNICATION step — the only place where token positions can exchange information. Each token looks back at all past tokens (causal mask), computes how relevant each is (Q·K similarity), then reads out their values (V) weighted by that relevance.`,
  },
  {
    id: 'res1',
    label: 'Residual Add',
    sublabel: 'x = x_attn + x_residual',
    color: 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300',
    dot: 'bg-emerald-400',
    code: `x = [a + b for a, b in zip(x, x_residual)]
# Gradient flows through '+' directly to embedding`,
    explain: `The residual connection bypasses the attention block entirely for the gradient. During backprop, ∂loss/∂x_residual receives gradient directly from all downstream layers — no squashing through attention weights. This is why deep transformers can be trained at all.`,
  },
  {
    id: 'norm1',
    label: 'RMSNorm',
    sublabel: 'before MLP',
    color: 'border-teal-500/60 bg-teal-500/10 text-teal-300',
    dot: 'bg-teal-400',
    code: `x_residual = x
x = rmsnorm(x)   # stabilize before MLP`,
    explain: `A second RMSNorm before the MLP block. This is the pre-norm pattern applied again. Note that x_residual is saved BEFORE this norm — the MLP block's output will be added back to the un-normed x.`,
  },
  {
    id: 'mlp',
    label: 'MLP Block',
    sublabel: 'FC1 → ReLU → FC2',
    color: 'border-orange-500/60 bg-orange-500/10 text-orange-300',
    dot: 'bg-orange-400',
    code: `x = linear(x, state_dict['layer0.mlp_fc1'])  # 16→64
x = [xi.relu() for xi in x]
x = linear(x, state_dict['layer0.mlp_fc2'])  # 64→16`,
    explain: `The MLP is the COMPUTATION step — each token position is processed independently. Mechanistic interpretability research shows that MLP layers store factual associations (like "this pattern → this character class"). The 4× expansion (16→64) gives neurons room to specialize.`,
  },
  {
    id: 'res2',
    label: 'Residual Add',
    sublabel: 'x = x_mlp + x_residual',
    color: 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300',
    dot: 'bg-emerald-400',
    code: `x = [a + b for a, b in zip(x, x_residual)]
# One transformer layer complete!`,
    explain: `Second residual add, completing one full transformer layer. For n_layer=1, we're done. For deeper models, the entire Attention+Residual+MLP+Residual block would repeat n_layer times with separate weights each time.`,
  },
  {
    id: 'lmhead',
    label: 'LM Head',
    sublabel: 'logits over vocab',
    color: 'border-red-500/60 bg-red-500/10 text-red-300',
    dot: 'bg-red-400',
    code: `logits = linear(x, state_dict['lm_head'])
# logits: list of vocab_size=27 Values
probs = softmax(logits)
loss = -probs[target_id].log()`,
    explain: `The language model head projects from n_embd=16 back to vocab_size=27. Each of the 27 output logits represents "how likely is this character next?" Softmax converts to probabilities, and cross-entropy loss tells us how wrong the model was.`,
  },
];

const LOOP_NODES = ['norm0', 'attn', 'res1', 'norm1', 'mlp', 'res2'];

// Full gpt() code split into annotated lines.
// section: 'embed' | 'norm' | 'loop' | 'attn' | 'res' | 'mlp' | 'lmhead' | 'neutral'
const FULL_MODEL_LINES = [
  { text: 'def gpt(token_id, pos_id, keys, values):',    section: 'neutral' },
  { text: "    tok_emb = state_dict['wte'][token_id]",    section: 'embed'   },
  { text: "    pos_emb = state_dict['wpe'][pos_id]",      section: 'embed'   },
  { text: '    x = [t + p for t, p in zip(tok_emb, pos_emb)]', section: 'embed' },
  { text: '    x = rmsnorm(x)',                           section: 'norm'    },
  { text: '',                                             section: 'neutral' },
  { text: '    for li in range(n_layer):',               section: 'loop'    },
  { text: '        # 1) Multi-head Attention block',     section: 'attn'    },
  { text: '        x_residual = x',                      section: 'res'     },
  { text: '        x = rmsnorm(x)',                      section: 'norm'    },
  { text: "        q = linear(x, state_dict[f'layer{li}.attn_wq'])", section: 'attn' },
  { text: "        k = linear(x, state_dict[f'layer{li}.attn_wk'])", section: 'attn' },
  { text: "        v = linear(x, state_dict[f'layer{li}.attn_wv'])", section: 'attn' },
  { text: '        keys[li].append(k)',                  section: 'attn'    },
  { text: '        values[li].append(v)',                section: 'attn'    },
  { text: '        x_attn = []',                        section: 'attn'    },
  { text: '        for h in range(n_head):',            section: 'attn'    },
  { text: '            hs = h * head_dim',              section: 'attn'    },
  { text: '            q_h = q[hs:hs+head_dim]',        section: 'attn'    },
  { text: '            k_h = [ki[hs:hs+head_dim] for ki in keys[li]]',   section: 'attn' },
  { text: '            v_h = [vi[hs:hs+head_dim] for vi in values[li]]', section: 'attn' },
  { text: '            attn_logits = [sum(q_h[j]*k_h[t][j] for j in range(head_dim)) / head_dim**0.5', section: 'attn' },
  { text: '                           for t in range(len(k_h))]',         section: 'attn' },
  { text: '            attn_weights = softmax(attn_logits)',              section: 'attn' },
  { text: '            head_out = [sum(attn_weights[t]*v_h[t][j] for t in range(len(v_h)))', section: 'attn' },
  { text: '                        for j in range(head_dim)]',           section: 'attn' },
  { text: '            x_attn.extend(head_out)',                         section: 'attn' },
  { text: "        x = linear(x_attn, state_dict[f'layer{li}.attn_wo'])", section: 'attn' },
  { text: '        x = [a + b for a, b in zip(x, x_residual)]',         section: 'res'  },
  { text: '        # 2) MLP block',                     section: 'mlp'     },
  { text: '        x_residual = x',                     section: 'res'     },
  { text: '        x = rmsnorm(x)',                     section: 'norm'    },
  { text: "        x = linear(x, state_dict[f'layer{li}.mlp_fc1'])",    section: 'mlp'  },
  { text: '        x = [xi.relu() for xi in x]',                        section: 'mlp'  },
  { text: "        x = linear(x, state_dict[f'layer{li}.mlp_fc2'])",    section: 'mlp'  },
  { text: '        x = [a + b for a, b in zip(x, x_residual)]',         section: 'res'  },
  { text: '',                                            section: 'neutral' },
  { text: "    logits = linear(x, state_dict['lm_head'])", section: 'lmhead' },
  { text: '    return logits',                           section: 'lmhead'  },
];

const SECTION_STYLES = {
  embed:   { bar: 'bg-blue-500',    bg: 'bg-blue-500/8',    label: 'Embedding',  text: 'text-blue-300'    },
  norm:    { bar: 'bg-teal-500',    bg: 'bg-teal-500/8',    label: 'RMSNorm',    text: 'text-teal-300'    },
  loop:    { bar: 'bg-slate-500',   bg: 'bg-slate-500/8',   label: 'Layer loop', text: 'text-slate-300'   },
  attn:    { bar: 'bg-violet-500',  bg: 'bg-violet-500/8',  label: 'Attention',  text: 'text-violet-300'  },
  res:     { bar: 'bg-emerald-500', bg: 'bg-emerald-500/8', label: 'Residual',   text: 'text-emerald-300' },
  mlp:     { bar: 'bg-orange-500',  bg: 'bg-orange-500/8',  label: 'MLP',        text: 'text-orange-300'  },
  lmhead:  { bar: 'bg-red-500',     bg: 'bg-red-500/8',     label: 'LM Head',    text: 'text-red-300'     },
  neutral: { bar: 'bg-transparent', bg: '',                  label: '',           text: 'text-slate-400'   },
};

const LEGEND = ['embed', 'norm', 'attn', 'res', 'mlp', 'lmhead'];

function FullModelModal({ onClose }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <motion.div
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl"
        initial={{ scale: 0.95, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 16 }}
        transition={{ duration: 0.2 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-800/80 border-b border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
            </div>
            <span className="text-sm font-semibold text-slate-200 font-mono">gpt() — full model</span>
            <span className="text-xs text-slate-500">main.py:108–144</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 text-lg leading-none transition-colors px-1"
          >
            ✕
          </button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 px-4 py-2 bg-slate-800/40 border-b border-slate-700/50 flex-shrink-0">
          {LEGEND.map(s => {
            const style = SECTION_STYLES[s];
            return (
              <div key={s} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-sm ${style.bar}`} />
                <span className={`text-xs font-mono ${style.text}`}>{style.label}</span>
              </div>
            );
          })}
        </div>

        {/* Code */}
        <div className="overflow-y-auto flex-1">
          <div className="font-mono text-xs leading-relaxed">
            {FULL_MODEL_LINES.map((line, i) => {
              const style = SECTION_STYLES[line.section] || SECTION_STYLES.neutral;
              return (
                <div
                  key={i}
                  className={`flex items-stretch group ${style.bg}`}
                >
                  {/* Colored left bar */}
                  <div className={`w-1 flex-shrink-0 ${style.bar} opacity-80`} />
                  {/* Line number */}
                  <span className="w-8 text-right pr-3 py-0.5 text-slate-600 select-none flex-shrink-0 text-[10px] leading-5">
                    {line.text !== '' ? i + 1 : ''}
                  </span>
                  {/* Code text */}
                  <pre className={`py-0.5 pr-4 whitespace-pre ${line.text === '' ? 'h-3' : ''} ${
                    line.section === 'neutral' ? 'text-slate-400' :
                    line.section === 'loop'    ? 'text-slate-300' :
                    style.text
                  }`}>
                    {line.text}
                  </pre>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800/40 border-t border-slate-700/50 flex-shrink-0">
          <span className="text-xs text-slate-500">
            37 lines · {FULL_MODEL_LINES.filter(l => l.text !== '').length} non-blank · 432 total params
          </span>
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-200 border border-slate-600 hover:border-slate-500 rounded-lg px-3 py-1 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function TransformerBlockViz() {
  const [selected, setSelected] = useState('attn');
  const [showFullModel, setShowFullModel] = useState(false);

  const node = NODES.find(n => n.id === selected);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          Click any block to see the code and explanation. The <span className="text-emerald-300">green loop</span> repeats for each transformer layer.
        </p>
        <motion.button
          onClick={() => setShowFullModel(true)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-500/60 transition-all text-xs font-semibold"
        >
          <span>⊞</span>
          <span>Full Model</span>
        </motion.button>
      </div>

      <div className="flex gap-4">
        {/* ── Architecture column ── */}
        <div className="flex flex-col items-center gap-0 flex-shrink-0">
          {/* Residual stream line */}
          <div className="relative flex flex-col items-center">

            {/* Loop bracket on left */}
            <div className="absolute left-0 top-[92px] bottom-[116px] flex flex-col items-start pointer-events-none">
              <div className="border-l-2 border-b-2 border-emerald-500/40 rounded-bl-lg w-3 flex-1" />
              <div className="w-3 h-0" />
            </div>
            <div className="absolute -left-8 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
              <span className="text-xs text-emerald-500/60 font-mono rotate-[-90deg] whitespace-nowrap">n_layer</span>
            </div>

            {NODES.map((n, i) => {
              const isSelected = selected === n.id;
              const inLoop = LOOP_NODES.includes(n.id);
              return (
                <div key={n.id} className="flex flex-col items-center">
                  {/* Connector line with animated pulse */}
                  {i > 0 && (
                    <div className="relative w-0.5 h-3 bg-slate-700">
                      <motion.div
                        className="absolute top-0 w-full bg-cyan-400 rounded-full"
                        style={{ height: 4 }}
                        animate={{ top: ['0%', '100%'] }}
                        transition={{ duration: 0.9, repeat: Infinity, repeatDelay: 0.3, delay: i * 0.1 }}
                      />
                    </div>
                  )}
                  {/* Node button */}
                  <motion.button
                    onClick={() => setSelected(n.id)}
                    whileHover={{ scale: 1.03, x: 3 }}
                    whileTap={{ scale: 0.97 }}
                    className={`relative w-40 px-3 py-2 rounded-xl border-2 text-left transition-all ${
                      isSelected ? n.color + ' shadow-lg scale-105' :
                      'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                    } ${inLoop ? 'ml-3' : ''}`}
                  >
                    {isSelected && (
                      <motion.div layoutId="selector"
                        className={`absolute right-1.5 top-1.5 w-2 h-2 rounded-full ${n.dot}`}
                        animate={{ scale: [1, 1.4, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                    )}
                    <p className="text-xs font-bold leading-tight">{n.label}</p>
                    <p className="text-xs opacity-60 mt-0.5 leading-tight">{n.sublabel}</p>
                  </motion.button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Detail panel ── */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div key={selected}
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.18 }}
              className="space-y-3"
            >
              {/* Code snippet */}
              <div className="bg-slate-950/80 border border-slate-700 rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border-b border-slate-700">
                  <div className="flex gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                  </div>
                  <span className="text-xs text-slate-500 font-mono">{node?.label}</span>
                </div>
                <pre className="p-3 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed whitespace-pre-wrap">
                  {node?.code}
                </pre>
              </div>

              {/* Explanation */}
              <div className={`rounded-xl border p-3 ${node?.color}`}>
                <p className="text-xs leading-relaxed opacity-90">{node?.explain}</p>
              </div>

              {/* Residual stream diagram when a residual node is selected */}
              {(selected === 'res1' || selected === 'res2') && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="bg-slate-800/50 rounded-xl border border-slate-700 p-3">
                  <p className="text-xs font-semibold text-emerald-300 mb-2">Residual stream (gradient highway):</p>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <div className="flex flex-col gap-1 text-slate-500">
                      <span>Loss</span>
                      <span>↓</span>
                      <span>res2</span>
                      <span>↓ ─── ↘</span>
                      <span>mlp    x</span>
                      <span>↓ ─── ↗</span>
                      <span>embed</span>
                    </div>
                    <div className="flex-1 text-slate-500 border-l border-slate-700 pl-3">
                      <p className="text-emerald-300/70">The '+' passes gradient unchanged.</p>
                      <p className="mt-1">∂L/∂x_embed receives gradient from</p>
                      <p>ALL downstream layers simultaneously.</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Full Model Modal */}
      <AnimatePresence>
        {showFullModel && <FullModelModal onClose={() => setShowFullModel(false)} />}
      </AnimatePresence>
    </div>
  );
}
