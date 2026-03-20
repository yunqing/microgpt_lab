import { motion } from 'framer-motion';
import { BookOpen, Sparkles, Code, Zap, X, RotateCcw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function AboutMicroGPT({ onClose }) {
  const { t } = useLanguage();
  const handleResetProgress = () => {
    if (window.confirm(t('about.resetConfirm'))) {
      localStorage.removeItem('microgpt-progress');
      window.location.reload();
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center">
              <BookOpen size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">{t('about.title')}</h2>
              <p className="text-xs text-slate-400">{t('about.subtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* What is MicroGPT */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-cyan-400" />
              <h3 className="text-sm font-semibold text-slate-200">{t('about.whatIs')}</h3>
            </div>
            <div className="text-sm text-slate-300 space-y-3 leading-relaxed">
              <p>
                <strong className="text-cyan-400">MicroGPT</strong> is a single file of <strong>200 lines of pure Python</strong> with no dependencies that trains and inferences a GPT. Created by Andrej Karpathy, it contains the full algorithmic content of what is needed: dataset, tokenizer, autograd engine, GPT-2-like architecture, Adam optimizer, training loop, and inference loop.
              </p>
              <p>
                Everything else in production LLMs is "just efficiency" — this is the <strong>bare essentials</strong> distilled to their purest form. As Karpathy says: "I cannot simplify this any further."
              </p>
            </div>
          </section>

          {/* What You'll Learn */}
          <section className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Code size={16} className="text-indigo-400" />
              <h3 className="text-sm font-semibold text-slate-200">{t('about.whatYoullLearn')}</h3>
            </div>
            <ul className="text-sm text-slate-300 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-0.5">•</span>
                <span><strong>Tokenization:</strong> How text becomes numbers (character-level → BPE)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-0.5">•</span>
                <span><strong>Autograd:</strong> How neural networks learn via backpropagation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-0.5">•</span>
                <span><strong>Embeddings:</strong> How tokens get neural "signatures"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-0.5">•</span>
                <span><strong>Attention:</strong> How tokens communicate (Q, K, V mechanism)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-0.5">•</span>
                <span><strong>MLP Blocks:</strong> Where the "thinking" happens per position</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-0.5">•</span>
                <span><strong>Training Loop:</strong> Cross-entropy loss, backprop, Adam optimizer</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-0.5">•</span>
                <span><strong>Inference:</strong> Temperature sampling and autoregressive generation</span>
              </li>
            </ul>
          </section>

          {/* Scale Comparison */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Zap size={16} className="text-yellow-400" />
              <h3 className="text-sm font-semibold text-slate-200">{t('about.fromMicroToMega')}</h3>
            </div>
            <div className="text-sm text-slate-300 space-y-3 leading-relaxed">
              <p>
                MicroGPT has <strong className="text-cyan-400">4,192 parameters</strong>. GPT-2 had 1.6 billion. Modern LLMs have hundreds of billions. But the <strong>algorithm is identical</strong> — just scaled up with:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-3">
                  <div className="text-xs font-semibold text-slate-400 mb-1">Data</div>
                  <div className="text-xs text-slate-300">32K names → Trillions of tokens (web pages, books, code)</div>
                </div>
                <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-3">
                  <div className="text-xs font-semibold text-slate-400 mb-1">Tokenizer</div>
                  <div className="text-xs text-slate-300">27 chars → ~100K BPE tokens (tiktoken)</div>
                </div>
                <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-3">
                  <div className="text-xs font-semibold text-slate-400 mb-1">Architecture</div>
                  <div className="text-xs text-slate-300">16-dim, 1 layer → 10K-dim, 100+ layers</div>
                </div>
                <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-3">
                  <div className="text-xs font-semibold text-slate-400 mb-1">Hardware</div>
                  <div className="text-xs text-slate-300">Pure Python scalars → GPU tensors (billions of ops/sec)</div>
                </div>
              </div>
            </div>
          </section>

          {/* ChatGPT Connection */}
          <section className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-indigo-300 mb-2">{t('about.chatgptConnection')}</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              ChatGPT is this <strong>same core loop</strong> (predict next token, sample, repeat) scaled up enormously, with post-training to make it conversational. When you chat with it, the system prompt, your message, and its reply are all just <strong>tokens in a sequence</strong>. The model is completing the document one token at a time — same as MicroGPT completing a name.
            </p>
          </section>

          {/* Resources */}
          <section>
            <h3 className="text-sm font-semibold text-slate-200 mb-3">{t('about.resources')}</h3>
            <div className="space-y-2">
              <a
                href="https://gist.github.com/karpathy/8627fe009c40f57531cb18360106ce95"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-cyan-400 hover:text-cyan-300 underline"
              >
                → MicroGPT Source Code (GitHub Gist)
              </a>
              <a
                href="https://karpathy.ai/microgpt.html"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-cyan-400 hover:text-cyan-300 underline"
              >
                → Andrej Karpathy's Blog Post
              </a>
              <a
                href="https://www.youtube.com/watch?v=VMj-3S1tku0"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-cyan-400 hover:text-cyan-300 underline"
              >
                → MicroGrad Video (2.5 hours on autograd)
              </a>
            </div>
          </section>

          {/* Reset Progress */}
          <section className="pt-4 border-t border-slate-700">
            <button
              onClick={handleResetProgress}
              className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/50 rounded-lg transition-colors"
            >
              <RotateCcw size={14} />
              {t('about.resetProgress')}
            </button>
            <p className="text-xs text-slate-500 mt-2">{t('about.resetProgressDesc')}</p>
          </section>
        </div>
      </motion.div>
    </motion.div>
  );
}
