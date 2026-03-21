import { motion } from 'framer-motion';
import { X, Check, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

export default function LanguageSelector({ onClose }) {
  const { language, setLanguage, availableLanguages, t } = useLanguage();
  const { colors } = useTheme();

  const handleLanguageChange = (langCode) => {
    setLanguage(langCode);
    onClose();
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
        className={`${colors.bg.primary} ${colors.border.primary} border rounded-2xl max-w-md w-full`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-6 py-4 border-b ${colors.border.primary}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Globe size={20} className="text-white" />
              </div>
              <div>
                <h2 className={`text-lg font-bold ${colors.text.primary}`}>
                  Choose Language
                </h2>
                <p className={`text-xs ${colors.text.muted}`}>
                  Select your preferred language
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 ${colors.text.muted} ${colors.bg.hover} rounded-lg transition-colors`}
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Language Grid */}
        <div className="p-6 grid grid-cols-1 gap-2 max-h-[60vh] overflow-y-auto">
          {availableLanguages.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <motion.button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`relative p-4 rounded-xl border-2 transition-all text-left focus:outline-none focus:ring-2 focus:ring-cyan-500/50 ${
                  isSelected
                    ? 'border-cyan-500 bg-cyan-500/10'
                    : `${colors.border.primary} ${colors.bg.hover} border-2`
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Flag */}
                  <span className="text-3xl">{lang.flag}</span>

                  {/* Language info */}
                  <div className="flex-1">
                    <div className={`font-semibold ${isSelected ? 'text-cyan-400' : colors.text.primary}`}>
                      {lang.nativeName}
                    </div>
                    <div className={`text-xs ${colors.text.muted}`}>
                      {lang.name}
                    </div>
                  </div>

                  {/* Selected indicator */}
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center"
                    >
                      <Check size={14} className="text-white" />
                    </motion.div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Footer */}
        <div className={`px-6 py-3 border-t ${colors.border.primary} flex justify-between items-center`}>
          <p className={`text-xs ${colors.text.muted}`}>
            Auto-detected from browser
          </p>
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
