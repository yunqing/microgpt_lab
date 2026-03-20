import { motion } from 'framer-motion';
import InsightCard from './InsightCard';
import CodePanel from './CodePanel';
import MultiChoiceQuiz from './MultiChoiceQuiz';
import CodeExercise from './CodeExercise';
import { ChevronRight } from 'lucide-react';
import { QUIZZES } from '../data/quizzes';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function ContentPanel({ level, onBadgeEarned, badgesEarned, onComplete, isCompleted }) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const levelBadgeEarned = badgesEarned.includes(level.content.insight.badge);
  const quiz = QUIZZES[level.id];

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
          <span className={`text-xs font-mono ${colors.text.muted}`}>{t('header.level')} {level.id} / 10</span>
          {isCompleted && (
            <span className="text-xs bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-full px-2 py-0.5">
              ✓ {t('levels.completed')}
            </span>
          )}
        </div>
        <h2 className={`text-lg sm:text-xl font-bold ${colors.text.primary}`}>{level.content.heading}</h2>
      </motion.div>

      {/* Main content */}
      <motion.div
        key={`content-${level.id}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="prose prose-sm prose-invert max-w-none"
      >
        <div className={`text-sm ${colors.text.secondary} leading-relaxed space-y-3`}>
          {level.content.body.split('\n\n').map((para, i) => (
            <p key={i} dangerouslySetInnerHTML={{
              __html: para
                .replace(/\*\*(.+?)\*\*/g, `<strong class="${colors.text.primary}">$1</strong>`)
                .replace(/`(.+?)`/g, `<code class="${colors.code.bg} ${colors.accent.cyan} px-1 rounded text-xs font-mono">$1</code>`)
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

      {/* ── Comprehension MCQs ── */}
      {quiz && (
        <motion.div
          key={`mcq-${level.id}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <MultiChoiceQuiz mcqs={quiz.mcqs} levelId={level.id} />
        </motion.div>
      )}

      {/* ── Code Exercise ── */}
      {quiz?.codeExercise && (
        <motion.div
          key={`code-${level.id}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <CodeExercise exercise={quiz.codeExercise} levelId={level.id} />
        </motion.div>
      )}

      {/* Complete button */}
      {!isCompleted && (
        <motion.button
          onClick={onComplete}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 mt-2 bg-gradient-to-r from-cyan-600/30 to-indigo-600/30 border border-cyan-500/40 rounded-xl text-cyan-300 font-semibold flex items-center justify-center gap-2 hover:from-cyan-600/40 hover:to-indigo-600/40 transition-all"
        >
          {t('buttons.complete')} {level.id} <ChevronRight size={16} />
        </motion.button>
      )}
    </div>
  );
}
