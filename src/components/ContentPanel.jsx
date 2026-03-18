import { motion } from 'framer-motion';
import InsightCard from './InsightCard';
import CodePanel from './CodePanel';
import { ChevronRight } from 'lucide-react';

export default function ContentPanel({ level, onBadgeEarned, badgesEarned, onComplete, isCompleted }) {
  const levelBadgeEarned = badgesEarned.includes(level.content.insight.badge);

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5">
      {/* Level header */}
      <motion.div
        key={level.id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono text-slate-500">Level {level.id} / 10</span>
          {isCompleted && (
            <span className="text-xs bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-full px-2 py-0.5">
              ✓ Completed
            </span>
          )}
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-slate-100">{level.content.heading}</h2>
      </motion.div>

      {/* Main content */}
      <motion.div
        key={`content-${level.id}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="prose prose-sm prose-invert max-w-none"
      >
        <div className="text-sm text-slate-300 leading-relaxed space-y-3">
          {level.content.body.split('\n\n').map((para, i) => (
            <p key={i} dangerouslySetInnerHTML={{
              __html: para
                .replace(/\*\*(.+?)\*\*/g, '<strong class="text-slate-100">$1</strong>')
                .replace(/`(.+?)`/g, '<code class="bg-slate-800 text-cyan-300 px-1 rounded text-xs font-mono">$1</code>')
            }} />
          ))}
        </div>
      </motion.div>

      {/* Code panel */}
      <CodePanel level={level} />

      {/* Insight challenge */}
      <InsightCard
        insight={level.content.insight}
        onBadgeEarned={onBadgeEarned}
        badgeEarned={levelBadgeEarned}
      />

      {/* Complete button */}
      {!isCompleted && (
        <motion.button
          onClick={onComplete}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 bg-gradient-to-r from-cyan-600/30 to-indigo-600/30 border border-cyan-500/40 rounded-xl text-cyan-300 font-semibold flex items-center justify-center gap-2 hover:from-cyan-600/40 hover:to-indigo-600/40 transition-all"
        >
          Complete Level {level.id} <ChevronRight size={16} />
        </motion.button>
      )}
    </div>
  );
}
