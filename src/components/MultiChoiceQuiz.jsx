import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react';

function Question({ q, index, onAnswer }) {
  const [selected, setSelected] = useState(null);

  const handleSelect = (i) => {
    if (selected !== null) return; // locked after first answer
    setSelected(i);
    onAnswer(i === q.correct);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-200 leading-relaxed">
        <span className="text-xs font-mono text-slate-500 mr-2">Q{index + 1}.</span>
        {q.question}
      </p>

      <div className="space-y-2">
        {q.options.map((opt, i) => {
          const isSelected = selected === i;
          const isCorrect = i === q.correct;
          const isAnswered = selected !== null;

          let style = 'bg-slate-800/60 border-slate-700 text-slate-300';
          if (isAnswered && isCorrect) style = 'bg-emerald-500/15 border-emerald-500/60 text-emerald-200';
          else if (isSelected && !isCorrect) style = 'bg-red-500/15 border-red-500/60 text-red-200';
          else if (isAnswered && !isSelected) style = 'bg-slate-800/30 border-slate-700/50 text-slate-500';

          return (
            <motion.button
              key={i}
              onClick={() => handleSelect(i)}
              whileHover={!isAnswered ? { x: 3 } : {}}
              whileTap={!isAnswered ? { scale: 0.99 } : {}}
              className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-all flex items-start gap-2.5 ${style} ${!isAnswered ? 'hover:border-slate-500 cursor-pointer' : 'cursor-default'}`}
            >
              <span className="flex-shrink-0 mt-0.5">
                {isAnswered && isCorrect ? (
                  <CheckCircle size={14} className="text-emerald-400" />
                ) : isSelected && !isCorrect ? (
                  <XCircle size={14} className="text-red-400" />
                ) : (
                  <span className={`inline-flex w-3.5 h-3.5 rounded-full border text-xs items-center justify-center font-mono leading-none ${isAnswered ? 'border-slate-600 text-slate-600' : 'border-slate-500 text-slate-400'}`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                )}
              </span>
              <span>{opt}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Explanation */}
      <AnimatePresence>
        {selected !== null && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className={`overflow-hidden rounded-lg px-3 py-2.5 text-xs leading-relaxed border ${
              selected === q.correct
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                : 'bg-red-500/10 border-red-500/30 text-red-200'
            }`}
          >
            <span className="font-semibold mr-1">
              {selected === q.correct ? '✓ Correct!' : '✗ Not quite.'}
            </span>
            {q.explanations[selected]}
            {selected !== q.correct && (
              <span className="block mt-1 text-emerald-300">
                The correct answer was: <strong>{q.options[q.correct]}</strong>
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function MultiChoiceQuiz({ mcqs, levelId }) {
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const total = mcqs.length;

  const handleAnswer = (correct) => {
    setAnswered(a => a + 1);
    if (correct) setScore(s => s + 1);
  };

  return (
    <div className="border border-slate-700 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800/80 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <HelpCircle size={14} className="text-violet-400" />
          <span className="text-xs font-semibold text-violet-300 uppercase tracking-wider">
            Comprehension Check
          </span>
        </div>
        {answered > 0 && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
              score === total ? 'bg-emerald-500/20 text-emerald-300' :
              score > 0 ? 'bg-yellow-500/20 text-yellow-300' :
              'bg-red-500/20 text-red-300'
            }`}
          >
            {score}/{answered} correct
          </motion.div>
        )}
      </div>

      {/* Questions */}
      <div className="p-4 space-y-6 bg-slate-900/40">
        {mcqs.map((q, i) => (
          <Question key={`${levelId}-${i}`} q={q} index={i} onAnswer={handleAnswer} />
        ))}
      </div>
    </div>
  );
}
