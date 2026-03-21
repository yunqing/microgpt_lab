import { motion } from 'framer-motion';
import { Palette, Check } from 'lucide-react';
import { THEMES } from '../styles/themes';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function ThemeSelector({ currentTheme, onThemeChange, onClose }) {
  const { colors } = useTheme();
  const { t } = useLanguage();
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
        className={`${colors.bg.primary} ${colors.border.primary} border rounded-2xl max-w-md w-full`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-6 py-4 border-b ${colors.border.primary}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Palette size={20} className="text-white" />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${colors.text.primary}`}>{t('theme.chooseTheme')}</h2>
              <p className={`text-xs ${colors.text.muted}`}>{t('theme.selectScheme')}</p>
            </div>
          </div>
        </div>

        {/* Theme Grid */}
        <div className="p-6 grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
          {Object.values(THEMES).map((theme) => {
            const isSelected = currentTheme === theme.id;
            return (
              <motion.button
                key={theme.id}
                onClick={() => {
                  onThemeChange(theme.id);
                  onClose();
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  backgroundColor: theme.cardBg,
                  borderColor: isSelected ? '#06b6d4' : theme.cardBorder,
                }}
                className="relative p-4 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              >
                {/* Selected indicator */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center"
                  >
                    <Check size={14} className="text-white" />
                  </motion.div>
                )}

                {/* Theme preview */}
                <div className="space-y-3">
                  {/* Icon and name */}
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-3xl">{theme.icon}</span>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: isSelected ? '#22d3ee' : theme.cardText }}
                    >{theme.name}</span>
                  </div>

                  {/* Color preview boxes */}
                  <div className="grid grid-cols-4 gap-1">
                    <div className={`h-6 rounded ${theme.colors.bg.primary}`}></div>
                    <div className={`h-6 rounded ${theme.colors.bg.secondary}`}></div>
                    <div className={`h-6 rounded ${theme.colors.accent.cyanBg} ${theme.colors.border.primary} border`}></div>
                    <div className={`h-6 rounded ${theme.colors.accent.indigoBg} ${theme.colors.border.primary} border`}></div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Footer */}
        <div className={`px-6 py-3 border-t ${colors.border.primary} flex justify-end`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 text-sm ${colors.text.muted} ${colors.text.hover} transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/50 rounded`}
          >
            {t('buttons.close')}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
