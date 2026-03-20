import { motion } from 'framer-motion';
import { CheckCircle, Circle } from 'lucide-react';
import { CURRICULUM } from '../data/curriculum';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const colorMap = {
  cyan: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30',
  indigo: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/30',
  blue: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  teal: 'text-teal-400 bg-teal-400/10 border-teal-400/30',
  violet: 'text-violet-400 bg-violet-400/10 border-violet-400/30',
  purple: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
  orange: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
  red: 'text-red-400 bg-red-400/10 border-red-400/30',
  yellow: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  emerald: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
};

export default function LevelNav({ currentLevel, completedLevels, onSelectLevel }) {
  const { colors: themeColors } = useTheme();
  const { t } = useLanguage();

  return (
    <nav className={`w-56 flex-shrink-0 ${themeColors.bg.primary} ${themeColors.border.primary} border-r overflow-y-auto h-full`}>
      <div className="p-3 pt-16 lg:pt-3">
        <p className={`text-xs ${themeColors.text.muted} uppercase tracking-widest mb-3 px-1`}>{t('nav.curriculum')}</p>
        {CURRICULUM.map((level) => {
          const isCompleted = completedLevels >= level.id;
          const isActive = currentLevel === level.id;
          const isLocked = level.id > completedLevels + 1;
          const levelColors = colorMap[level.color];

          return (
            <motion.button
              key={level.id}
              onClick={() => onSelectLevel(level.id)}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full text-left p-2.5 rounded-lg mb-1 border transition-all ${
                isActive
                  ? `${levelColors} border`
                  : isCompleted
                  ? `${themeColors.text.secondary} ${themeColors.bg.secondary} ${themeColors.border.primary} ${themeColors.bg.hover}`
                  : isLocked
                  ? `${themeColors.text.muted} bg-transparent border-transparent ${themeColors.bg.hover}`
                  : `${themeColors.text.tertiary} bg-transparent border-transparent ${themeColors.bg.hover}`
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <CheckCircle size={14} className="text-cyan-400" />
                  ) : (
                    <Circle size={14} className={isLocked ? 'text-slate-600' : 'text-slate-500'} />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-mono ${themeColors.text.muted}`}>{level.id}</span>
                    <span className="text-xs font-medium truncate">{level.title}</span>
                  </div>
                  <p className={`text-xs ${themeColors.text.muted} truncate`}>{level.subtitle}</p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
