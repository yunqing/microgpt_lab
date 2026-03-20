import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import Header from './components/Header';
import LevelNav from './components/LevelNav';
import VisualizationPanel from './components/VisualizationPanel';
import ContentPanel from './components/ContentPanel';
import AboutMicroGPT from './components/AboutMicroGPT';
import ThemeSelector from './components/ThemeSelector';
import LanguageSelector from './components/LanguageSelector';
import TrainingExperience from './components/TrainingExperience';
import { CURRICULUM, TOTAL_PARAMS } from './data/curriculum';
import { getTranslatedCurriculum } from './i18n/curriculum';

function AppContent() {
  const { theme, setTheme, colors } = useTheme();
  const { t, language } = useLanguage();

  // Get translated curriculum based on current language
  const curriculum = useMemo(
    () => getTranslatedCurriculum(CURRICULUM, language),
    [language]
  );

  // Load progress from localStorage
  const [currentLevelId, setCurrentLevelId] = useState(() => {
    const saved = localStorage.getItem('microgpt-progress');
    return saved ? JSON.parse(saved).currentLevelId || 1 : 1;
  });

  const [completedLevels, setCompletedLevels] = useState(() => {
    const saved = localStorage.getItem('microgpt-progress');
    return saved ? JSON.parse(saved).completedLevels || 0 : 0;
  });

  const [earnedBadges, setEarnedBadges] = useState(() => {
    const saved = localStorage.getItem('microgpt-progress');
    return saved ? JSON.parse(saved).earnedBadges || [] : [];
  });

  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('content'); // 'content' or 'viz'
  const [showNav, setShowNav] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showTraining, setShowTraining] = useState(false);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('microgpt-progress', JSON.stringify({
      currentLevelId,
      completedLevels,
      earnedBadges
    }));
  }, [currentLevelId, completedLevels, earnedBadges]);

  // Check if first visit
  useEffect(() => {
    const hasSeenTraining = localStorage.getItem('microgpt-seen-training');
    if (!hasSeenTraining) {
      // Show training experience after a short delay
      const timer = setTimeout(() => setShowTraining(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const currentLevel = curriculum.find(l => l.id === currentLevelId);

  // Calculate parameter progress
  const paramProgress = curriculum
    .filter(l => l.id <= completedLevels)
    .reduce((sum, l) => sum + l.paramContrib, 0);

  const handleBadgeEarned = useCallback((badge) => {
    if (!earnedBadges.includes(badge)) {
      setEarnedBadges(b => [...b, badge]);
      setNotification({ type: 'badge', message: `${t('notifications.badgeEarned')}: "${badge}"` });
      setTimeout(() => setNotification(null), 3000);
    }
  }, [earnedBadges, t]);

  const handleComplete = useCallback(() => {
    if (currentLevelId > completedLevels) {
      setCompletedLevels(currentLevelId);
      setNotification({ type: 'level', message: `${t('header.level')} ${currentLevelId} ${t('notifications.levelComplete')}` });
      setTimeout(() => setNotification(null), 2500);
      // Auto-advance to next level
      if (currentLevelId < 10) {
        setTimeout(() => setCurrentLevelId(currentLevelId + 1), 400);
      }
    }
  }, [currentLevelId, completedLevels, t]);

  const handleSelectLevel = useCallback((id) => {
    setCurrentLevelId(id);
    setShowNav(false);
  }, []);

  return (
    <div className={`h-screen flex flex-col ${colors.bg.primary} ${colors.text.primary} overflow-hidden`}>
      <Header
        completedLevels={completedLevels}
        earnedBadges={earnedBadges}
        totalParams={TOTAL_PARAMS}
        paramProgress={paramProgress}
        onMenuClick={() => setShowNav(!showNav)}
        onAboutClick={() => setShowAbout(true)}
        onThemeClick={() => setShowThemeSelector(true)}
        onLanguageClick={() => setShowLanguageSelector(true)}
        onTrainClick={() => setShowTraining(true)}
        currentLevel={currentLevel}
      />

      <div className="flex flex-1 min-h-0 relative">
        {/* Mobile nav overlay */}
        <AnimatePresence>
          {showNav && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                onClick={() => setShowNav(false)}
                aria-label="Close navigation menu"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Escape' && setShowNav(false)}
              />
              <motion.div
                initial={{ x: -224 }}
                animate={{ x: 0 }}
                exit={{ x: -224 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed left-0 top-0 bottom-0 z-30 lg:hidden"
              >
                <LevelNav
                  currentLevel={currentLevelId}
                  completedLevels={completedLevels}
                  onSelectLevel={handleSelectLevel}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Desktop nav */}
        <div className="hidden lg:block">
          <LevelNav
            currentLevel={currentLevelId}
            completedLevels={completedLevels}
            onSelectLevel={handleSelectLevel}
          />
        </div>

        {/* Main split-screen content */}
        <div className="flex flex-col lg:flex-row flex-1 min-w-0">
          {/* Mobile tabs */}
          <div className="lg:hidden flex border-b border-slate-700 bg-slate-900" role="tablist" aria-label="Content view switcher">
            <button
              onClick={() => setActiveTab('content')}
              role="tab"
              aria-selected={activeTab === 'content'}
              aria-controls="content-panel"
              id="content-tab"
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === 'content'
                  ? 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-slate-400'
              }`}
            >
              {t('nav.content')}
            </button>
            <button
              onClick={() => setActiveTab('viz')}
              role="tab"
              aria-selected={activeTab === 'viz'}
              aria-controls="viz-panel"
              id="viz-tab"
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === 'viz'
                  ? 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-slate-400'
              }`}
            >
              {t('nav.visualization')}
            </button>
          </div>

          {/* Left: Visualization */}
          <div
            id="viz-panel"
            role="tabpanel"
            aria-labelledby="viz-tab"
            className={`${activeTab === 'viz' ? 'flex' : 'hidden'} lg:flex lg:w-1/2 border-r border-slate-700 overflow-hidden flex-col min-h-0`}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentLevelId}
                className="h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <VisualizationPanel level={currentLevel} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: Curriculum content */}
          <div
            id="content-panel"
            role="tabpanel"
            aria-labelledby="content-tab"
            className={`${activeTab === 'content' ? 'flex' : 'hidden'} lg:flex lg:w-1/2 overflow-hidden flex-col min-h-0`}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentLevelId}
                className="h-full"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
              >
                <ContentPanel
                  level={currentLevel}
                  onBadgeEarned={handleBadgeEarned}
                  badgesEarned={earnedBadges}
                  onComplete={handleComplete}
                  isCompleted={completedLevels >= currentLevelId}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Notification toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className={`fixed bottom-6 left-1/2 px-5 py-3 rounded-xl border text-sm font-semibold shadow-lg ${
              notification.type === 'badge'
                ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300'
                : 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
            }`}
          >
            {notification.type === 'badge' ? '🏅 ' : '✅ '}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* About Dialog */}
      <AnimatePresence>
        {showAbout && <AboutMicroGPT onClose={() => setShowAbout(false)} />}
      </AnimatePresence>

      {/* Theme Selector */}
      <AnimatePresence>
        {showThemeSelector && (
          <ThemeSelector
            currentTheme={theme}
            onThemeChange={setTheme}
            onClose={() => setShowThemeSelector(false)}
          />
        )}
      </AnimatePresence>

      {/* Language Selector */}
      <AnimatePresence>
        {showLanguageSelector && (
          <LanguageSelector onClose={() => setShowLanguageSelector(false)} />
        )}
      </AnimatePresence>

      {/* Training Experience */}
      <AnimatePresence>
        {showTraining && (
          <TrainingExperience
            onClose={() => {
              setShowTraining(false);
              localStorage.setItem('microgpt-seen-training', 'true');
            }}
            onComplete={() => {
              localStorage.setItem('microgpt-seen-training', 'true');
              setNotification({ type: 'success', message: t('notifications.readyToLearn') });
              setTimeout(() => setNotification(null), 3000);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </LanguageProvider>
  );
}
