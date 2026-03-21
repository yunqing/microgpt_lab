import { motion } from 'framer-motion';
import { Cpu, Award, Menu, Star, Info, Palette, Zap, Globe, MoreVertical } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useState } from 'react';

export default function Header({ completedLevels, earnedBadges, totalParams, paramProgress, onMenuClick, currentLevel, onAboutClick, onThemeClick, onLanguageClick, onTrainClick }) {
  const { colors } = useTheme();
  const { t, languageInfo } = useLanguage();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <header className={`flex items-center justify-between px-3 sm:px-6 py-3 ${colors.bg.primary} ${colors.border.primary} border-b z-10`}>
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          aria-label="Open navigation menu"
        >
          <Menu size={20} className="text-slate-400" />
        </button>
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
          <Cpu size={14} className="text-white sm:w-4 sm:h-4" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xs sm:text-sm font-bold gradient-text truncate">{t('header.title')}</h1>
          <p className="text-xs text-slate-500 hidden sm:block">
            {t('header.subtitle').split('microgpt')[0]}
            <a
              href="https://gist.github.com/karpathy/8627fe009c40f57531cb18360106ce95"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 underline transition-colors"
            >
              microgpt
            </a>
            {t('header.subtitle').split('microgpt')[1]}
          </p>
          <p className="text-xs text-slate-500 sm:hidden truncate">Lv.{currentLevel?.id}</p>
        </div>
      </div>

      {/* Parameter Progress */}
      <div className="hidden md:flex flex-col items-center gap-1 flex-1 mx-8">
        <div className="flex items-center gap-2 w-full max-w-xs">
          <span className="text-xs text-slate-400 w-24 text-right">{paramProgress.toLocaleString()} {t('header.params')}</span>
          <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(paramProgress / 7440) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="text-xs text-slate-500">7,440</span>
        </div>
        <p className="text-xs text-slate-600">{t('header.params')} Counter</p>
      </div>

      {/* Badges & Progress */}
      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        {/* Train Button */}
        <button
          onClick={onTrainClick}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 rounded-lg transition-all group focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          aria-label="Try Training"
          title="Experience Training"
        >
          <Zap size={14} className="text-purple-400 group-hover:text-purple-300" />
          <span className="text-xs text-purple-300 font-medium">{t('header.train')}</span>
        </button>

        {/* Language Button */}
        <button
          onClick={onLanguageClick}
          className="hidden sm:flex items-center justify-center w-8 h-8 hover:bg-slate-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          aria-label="Change Language"
          title={`Language: ${languageInfo.nativeName}`}
        >
          <Globe size={16} className="text-slate-400" />
        </button>

        {/* Theme Button */}
        <button
          onClick={onThemeClick}
          className="hidden sm:flex items-center justify-center w-8 h-8 hover:bg-slate-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          aria-label="Change Theme"
          title="Change Theme"
        >
          <Palette size={16} className="text-slate-400" />
        </button>

        {/* About Button */}
        <button
          onClick={onAboutClick}
          className="hidden sm:flex items-center justify-center w-8 h-8 hover:bg-slate-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          aria-label="About MicroGPT"
          title="About MicroGPT"
        >
          <Info size={16} className="text-slate-400" />
        </button>

        {/* GitHub Star Button */}
        <a
          href="https://github.com/yunqing/microgpt_lab"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-slate-500 rounded-lg transition-all group focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
        >
          <Star size={14} className="text-slate-400 group-hover:text-yellow-400 transition-colors" />
          <span className="text-xs text-slate-300 group-hover:text-slate-100 font-medium">{t('header.star')}</span>
        </a>

        {/* Mobile Menu Button */}
        <div className="sm:hidden relative">
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="flex items-center justify-center w-9 h-9 hover:bg-slate-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            aria-label="More options"
          >
            <MoreVertical size={18} className="text-slate-400" />
          </button>

          {/* Mobile Dropdown Menu */}
          {showMobileMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMobileMenu(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 py-1">
                <button
                  onClick={() => { onTrainClick(); setShowMobileMenu(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-slate-700 transition-colors text-left"
                >
                  <Zap size={16} className="text-purple-400" />
                  <span className="text-sm text-slate-300">{t('header.train')}</span>
                </button>
                <button
                  onClick={() => { onLanguageClick(); setShowMobileMenu(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-slate-700 transition-colors text-left"
                >
                  <Globe size={16} className="text-slate-400" />
                  <span className="text-sm text-slate-300">{languageInfo.nativeName}</span>
                </button>
                <button
                  onClick={() => { onThemeClick(); setShowMobileMenu(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-slate-700 transition-colors text-left"
                >
                  <Palette size={16} className="text-slate-400" />
                  <span className="text-sm text-slate-300">{t('theme.title')}</span>
                </button>
                <button
                  onClick={() => { onAboutClick(); setShowMobileMenu(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-slate-700 transition-colors text-left"
                >
                  <Info size={16} className="text-slate-400" />
                  <span className="text-sm text-slate-300">{t('about.title')}</span>
                </button>
                <div className="border-t border-slate-700 my-1" />
                <a
                  href="https://github.com/yunqing/microgpt_lab"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-slate-700 transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <Star size={16} className="text-yellow-400" />
                  <span className="text-sm text-slate-300">{t('header.star')}</span>
                </a>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Award size={12} className="text-yellow-400 sm:w-3.5 sm:h-3.5" />
          <span className="text-xs text-yellow-400 font-mono">{earnedBadges.length}</span>
          <span className="text-xs text-slate-500 hidden sm:inline">{t('header.badges')}</span>
        </div>
        <div className="hidden sm:flex items-center gap-1">
          {Array.from({ length: 10 }, (_, i) => (
            <motion.div
              key={i}
              className={`w-2 h-2 rounded-full ${i < completedLevels ? 'bg-cyan-400' : 'bg-slate-700'}`}
              animate={i < completedLevels ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
        <span className="text-xs text-slate-400">{completedLevels}/10</span>
      </div>
    </header>
  );
}
