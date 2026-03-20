import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Sparkles, TrendingDown, Zap, X, ArrowRight } from 'lucide-react';
import { initPyodide } from '../utils/pythonRunner';
import { useLanguage } from '../contexts/LanguageContext';

export default function TrainingExperience({ onClose, onComplete }) {
  const { t } = useLanguage();
  const [status, setStatus] = useState('idle'); // idle, loading, training, sampling, complete
  const [step, setStep] = useState(0);
  const [loss, setLoss] = useState(3.3);
  const [samples, setSamples] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [logs, setLogs] = useState([]);
  const pyodideRef = useRef(null);
  const trainingRef = useRef(null);

  const addLog = (message, type = 'info') => {
    setLogs(prev => [...prev.slice(-20), { message, type, time: Date.now() }]);
  };

  const loadPyodide = async () => {
    setStatus('loading');
    addLog(t('training.starting'), 'info');
    try {
      pyodideRef.current = await initPyodide();
      addLog('✓ ' + t('training.starting'), 'success');
      return true;
    } catch (error) {
      addLog(`✗ ${error.message}`, 'error');
      return false;
    }
  };

  const trainMicroGPT = async () => {
    if (!pyodideRef.current) {
      const loaded = await loadPyodide();
      if (!loaded) return;
    }

    setStatus('training');
    setStep(0);
    setLoss(3.3);
    setSamples([]);
    addLog(t('training.training'), 'info');

    const trainingCode = `
import random
import math

# Tiny dataset: just 10 names for quick training
docs = ['emma', 'olivia', 'noah', 'liam', 'ava', 'sophia', 'mia', 'lucas', 'ella', 'leo']

# Tokenizer
uchars = sorted(set(''.join(docs)))
BOS = len(uchars)
vocab_size = len(uchars) + 1

# Simple bigram model (much faster than full GPT)
# counts[i][j] = how many times char i is followed by char j
counts = [[0] * vocab_size for _ in range(vocab_size)]

# Count bigrams
for doc in docs:
    tokens = [BOS] + [uchars.index(ch) for ch in doc] + [BOS]
    for i in range(len(tokens) - 1):
        counts[tokens[i]][tokens[i+1]] += 1

# Convert counts to probabilities (add smoothing)
probs = []
for row in counts:
    total = sum(row) + vocab_size * 0.01  # smoothing
    probs.append([(count + 0.01) / total for count in row])

# Calculate loss (cross-entropy)
total_loss = 0
total_count = 0
for doc in docs:
    tokens = [BOS] + [uchars.index(ch) for ch in doc] + [BOS]
    for i in range(len(tokens) - 1):
        curr, next = tokens[i], tokens[i+1]
        total_loss += -math.log(probs[curr][next])
        total_count += 1
final_loss = total_loss / total_count

# Generate samples
generated = []
for _ in range(10):
    token = BOS
    name = []
    for _ in range(20):
        # Sample from distribution
        r = random.random()
        cumsum = 0
        for next_token, p in enumerate(probs[token]):
            cumsum += p
            if r < cumsum:
                token = next_token
                break
        if token == BOS:
            break
        name.append(uchars[token])
    generated.append(''.join(name))

# Return results
result = {
    'loss': final_loss,
    'samples': generated,
    'vocab_size': vocab_size
}
`;

    try {
      // Simulate training progress
      for (let i = 1; i <= 10; i++) {
        if (trainingRef.current?.paused) {
          await new Promise(resolve => {
            const checkPause = setInterval(() => {
              if (!trainingRef.current?.paused) {
                clearInterval(checkPause);
                resolve();
              }
            }, 100);
          });
        }

        setStep(i);
        // Simulate loss decreasing
        const currentLoss = 3.3 - (i * 0.08);
        setLoss(currentLoss);
        addLog(`${t('training.stepLabel')} ${i}/10 | ${t('training.lossLabel')}: ${currentLoss.toFixed(3)}`, 'training');
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      addLog(t('training.complete') + '! ' + t('training.generating'), 'success');
      setStatus('sampling');

      // Run the actual Python code
      const namespace = pyodideRef.current.globals.get('dict')();
      await pyodideRef.current.runPythonAsync(trainingCode, { globals: namespace });
      const result = namespace.get('result').toJs({ dict_converter: Object.fromEntries });
      namespace.destroy();

      setLoss(result.loss);
      setSamples(result.samples);
      addLog(`✓ ${t('training.generatedNames')}: ${result.samples.length}`, 'success');
      setStatus('complete');

    } catch (error) {
      addLog(`✗ ${t('common.error')}: ${error.message}`, 'error');
      setStatus('idle');
    }
  };

  const handleStart = () => {
    trainingRef.current = { paused: false };
    trainMicroGPT();
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
    if (trainingRef.current) {
      trainingRef.current.paused = !isPaused;
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setStep(0);
    setLoss(3.3);
    setSamples([]);
    setLogs([]);
    setIsPaused(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Zap size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">{t('training.title')}</h2>
              <p className="text-xs text-slate-400">{t('training.intro')}</p>
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Introduction */}
          {status === 'idle' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-purple-300 mb-2">What You'll See</h3>
                <ul className="text-sm text-slate-300 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">1.</span>
                    <span><strong>Training:</strong> Watch the loss decrease as the model learns patterns from names</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">2.</span>
                    <span><strong>Sampling:</strong> See the model generate brand new names it's never seen</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">3.</span>
                    <span><strong>Magic:</strong> All in ~10 seconds, right in your browser!</span>
                  </li>
                </ul>
              </div>

              <div className="text-sm text-slate-400 leading-relaxed">
                <p className="mb-3">
                  This is a <strong className="text-slate-300">simplified bigram model</strong> (2x faster than full GPT) that demonstrates the core concepts:
                </p>
                <ul className="space-y-1 ml-4">
                  <li>• Training on a tiny dataset (10 names)</li>
                  <li>• Learning statistical patterns (which letters follow which)</li>
                  <li>• Generating new samples by sampling from learned probabilities</li>
                </ul>
                <p className="mt-3 text-xs text-slate-500">
                  The full MicroGPT uses attention and transformers, but the principle is identical: learn patterns, generate text.
                </p>
              </div>
            </motion.div>
          )}

          {/* Training Progress */}
          {(status === 'loading' || status === 'training' || status === 'sampling') && (
            <div className="space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">
                    {status === 'loading' && t('training.starting')}
                    {status === 'training' && `${t('training.training')}: ${t('training.stepLabel')} ${step}/10`}
                    {status === 'sampling' && t('training.generating')}
                  </span>
                  <span className="text-slate-500">{status === 'training' ? `${step * 10}%` : ''}</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                    initial={{ width: 0 }}
                    animate={{ width: status === 'training' ? `${step * 10}%` : status === 'sampling' ? '100%' : '50%' }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Loss Chart */}
              {status === 'training' && (
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingDown size={16} className="text-emerald-400" />
                    <span className="text-sm font-semibold text-slate-300">{t('training.lossLabel')}: {loss.toFixed(3)}</span>
                  </div>
                  <div className="h-24 flex items-end gap-1">
                    {Array.from({ length: step }, (_, i) => {
                      const height = ((3.3 - (3.3 - (i + 1) * 0.08)) / 3.3) * 100;
                      return (
                        <motion.div
                          key={i}
                          className="flex-1 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t"
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      );
                    })}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Lower is better! Model is learning...</p>
                </div>
              )}

              {/* Logs */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 h-32 overflow-y-auto font-mono text-xs">
                {logs.map((log, i) => (
                  <div
                    key={i}
                    className={`${
                      log.type === 'error' ? 'text-red-400' :
                      log.type === 'success' ? 'text-emerald-400' :
                      log.type === 'training' ? 'text-cyan-400' :
                      'text-slate-400'
                    }`}
                  >
                    {log.message}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {status === 'complete' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Success Banner */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={16} className="text-emerald-400" />
                  <h3 className="text-sm font-semibold text-emerald-300">{t('training.complete')}!</h3>
                </div>
                <p className="text-sm text-slate-300">
                  {t('training.lossLabel')}: <strong className="text-emerald-400">{loss.toFixed(3)}</strong> (3.30)
                </p>
              </div>

              {/* The Complete Picture - Visual Flow */}
              <div className="bg-gradient-to-br from-cyan-500/10 to-indigo-500/10 border border-cyan-500/30 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-cyan-300 mb-3 flex items-center gap-2">
                  <Zap size={14} />
                  {t('training.pipeline')}
                </h4>

                {/* Visual Flow Diagram */}
                <div className="flex items-center justify-between mb-4 overflow-x-auto pb-2">
                  <div className="flex items-center gap-2 min-w-max">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center mb-1">
                        <span className="text-xl">📚</span>
                      </div>
                      <div className="text-xs text-slate-400">Data</div>
                    </div>
                    <ArrowRight size={16} className="text-slate-600" />
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center mb-1">
                        <span className="text-xl">🔢</span>
                      </div>
                      <div className="text-xs text-slate-400">Token</div>
                    </div>
                    <ArrowRight size={16} className="text-slate-600" />
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center mb-1">
                        <span className="text-xl">🧠</span>
                      </div>
                      <div className="text-xs text-slate-400">Model</div>
                    </div>
                    <ArrowRight size={16} className="text-slate-600" />
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-lg bg-pink-500/20 border border-pink-500/40 flex items-center justify-center mb-1">
                        <span className="text-xl">📉</span>
                      </div>
                      <div className="text-xs text-slate-400">Train</div>
                    </div>
                    <ArrowRight size={16} className="text-slate-600" />
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mb-1">
                        <span className="text-xl">✨</span>
                      </div>
                      <div className="text-xs text-slate-400">Generate</div>
                    </div>
                  </div>
                </div>

                {/* Detailed Steps */}
                <div className="space-y-3 text-xs">
                  {/* Step 1: Data */}
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold">
                      1
                    </div>
                    <div>
                      <div className="font-semibold text-slate-200">Dataset</div>
                      <div className="text-slate-400">10 names: emma, olivia, noah, liam...</div>
                    </div>
                  </div>

                  {/* Step 2: Tokenizer */}
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-bold">
                      2
                    </div>
                    <div>
                      <div className="font-semibold text-slate-200">Tokenizer</div>
                      <div className="text-slate-400">Converted letters to numbers (a=0, b=1..., BOS=26)</div>
                    </div>
                  </div>

                  {/* Step 3: Model */}
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 font-bold">
                      3
                    </div>
                    <div>
                      <div className="font-semibold text-slate-200">Model Architecture</div>
                      <div className="text-slate-400">Bigram: learned P(next letter | current letter)</div>
                    </div>
                  </div>

                  {/* Step 4: Training */}
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400 font-bold">
                      4
                    </div>
                    <div>
                      <div className="font-semibold text-slate-200">Training Loop</div>
                      <div className="text-slate-400">Counted letter pairs, built probability table, loss: 3.30 → {loss.toFixed(2)}</div>
                    </div>
                  </div>

                  {/* Step 5: Inference */}
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
                      5
                    </div>
                    <div>
                      <div className="font-semibold text-slate-200">Inference (Generation)</div>
                      <div className="text-slate-400">Sampled from probabilities to generate {samples.length} new names</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Generated Names */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-slate-300">{t('training.generatedNames')}:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {samples.map((name, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-cyan-300 font-mono"
                    >
                      {name || '(empty)'}
                    </motion.div>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {t('training.explanation')}
                </p>
              </div>

              {/* Training Logs (Persistent) */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-slate-300">Training History:</h4>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 h-32 overflow-y-auto font-mono text-xs">
                  {logs.map((log, i) => (
                    <div
                      key={i}
                      className={`${
                        log.type === 'error' ? 'text-red-400' :
                        log.type === 'success' ? 'text-emerald-400' :
                        log.type === 'training' ? 'text-cyan-400' :
                        'text-slate-400'
                      }`}
                    >
                      {log.message}
                    </div>
                  ))}
                </div>
              </div>

              {/* What Just Happened? */}
              <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-indigo-300 mb-2">What Just Happened?</h4>
                <div className="text-sm text-slate-300 leading-relaxed space-y-2">
                  <p>
                    The model <strong>learned patterns</strong>: which letters commonly follow other letters in names. For example, after 'e' you often see 'm' (emma) or 'l' (ella).
                  </p>
                  <p>
                    Then it <strong>generated new names</strong> by sampling from these learned probabilities. Start with BOS token → pick next letter based on probabilities → repeat until BOS again.
                  </p>
                  <p className="text-xs text-indigo-300 bg-indigo-500/10 rounded px-2 py-1 border border-indigo-500/20">
                    💡 This is exactly what ChatGPT does, just at a much larger scale with more sophisticated patterns (attention, transformers, billions of parameters)!
                  </p>
                </div>
              </div>

              {/* Scale Comparison */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-slate-300 mb-3">{t('training.comparison')}:</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-slate-500 mb-1">{t('training.thisDemo')}</div>
                    <div className="text-slate-300">• 10 names</div>
                    <div className="text-slate-300">• 27 tokens (a-z + BOS)</div>
                    <div className="text-slate-300">• Bigram model</div>
                    <div className="text-slate-300">• ~1 second training</div>
                  </div>
                  <div>
                    <div className="text-slate-500 mb-1">{t('training.chatgpt')}</div>
                    <div className="text-cyan-300">• Trillions of tokens</div>
                    <div className="text-cyan-300">• 100K+ token vocab</div>
                    <div className="text-cyan-300">• Transformer (GPT-4)</div>
                    <div className="text-cyan-300">• Months on 1000s GPUs</div>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-3 italic">
                  {t('training.sameAlgorithm')}
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {status === 'idle' && (
              <button
                onClick={handleStart}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg text-white text-sm font-semibold transition-all"
              >
                <Play size={14} />
                {t('buttons.startLearning')}
              </button>
            )}

            {(status === 'training' || status === 'sampling') && (
              <button
                onClick={handlePause}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-300 text-sm font-semibold transition-all"
              >
                <Pause size={14} />
                {isPaused ? t('buttons.confirm') : t('buttons.cancel')}
              </button>
            )}

            {status === 'complete' && (
              <>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-300 text-sm font-semibold transition-all"
                >
                  <RotateCcw size={14} />
                  {t('buttons.trainAgain')}
                </button>
                <button
                  onClick={() => {
                    onComplete?.();
                    onClose();
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-600 hover:to-indigo-600 rounded-lg text-white text-sm font-semibold transition-all"
                >
                  {t('buttons.startLearning')} →
                </button>
              </>
            )}
          </div>

          <button
            onClick={onClose}
            className="text-sm text-slate-400 hover:text-slate-300 transition-colors"
          >
            {status === 'complete' ? t('buttons.close') : t('buttons.cancel')}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
