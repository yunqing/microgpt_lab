import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Award, ChevronRight } from 'lucide-react';

export default function InsightCard({ insight, onBadgeEarned, badgeEarned }) {
  const [revealed, setRevealed] = useState(false);

  const handleReveal = () => {
    setRevealed(true);
    if (!badgeEarned) {
      onBadgeEarned(insight.badge);
    }
  };

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3 sm:p-4 mt-3 sm:mt-4">
      <div className="flex items-start gap-2 mb-3">
        <Lightbulb size={16} className="text-yellow-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-yellow-400 mb-1">Insight Challenge</p>
          <p className="text-sm text-slate-200">{insight.question}</p>
        </div>
      </div>

      <AnimatePresence>
        {!revealed ? (
          <motion.button
            key="reveal"
            onClick={handleReveal}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-2 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
          >
            <ChevronRight size={12} />
            Reveal answer & earn badge
          </motion.button>
        ) : (
          <motion.div
            key="answer"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <p className="text-sm text-slate-300 leading-relaxed">{insight.answer}</p>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/30 rounded-lg px-3 py-2"
            >
              <Award size={16} className="text-yellow-400" />
              <span className="text-xs font-semibold text-yellow-400">Badge Earned: "{insight.badge}"</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
