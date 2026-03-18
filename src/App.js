import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import LevelNav from './components/LevelNav';
import VisualizationPanel from './components/VisualizationPanel';
import ContentPanel from './components/ContentPanel';
import { CURRICULUM, TOTAL_PARAMS } from './data/curriculum';

export default function App() {
  const [currentLevelId, setCurrentLevelId] = useState(1);
  const [completedLevels, setCompletedLevels] = useState(0);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('content'); // 'content' or 'viz'
  const [showNav, setShowNav] = useState(false);

  const currentLevel = CURRICULUM.find(l => l.id === currentLevelId);

  // Calculate parameter progress
  const paramProgress = CURRICULUM
    .filter(l => l.id <= completedLevels)
    .reduce((sum, l) => sum + l.paramContrib, 0);

  const handleBadgeEarned = useCallback((badge) => {
    if (!earnedBadges.includes(badge)) {
      setEarnedBadges(b => [...b, badge]);
      setNotification({ type: 'badge', message: `Badge earned: "${badge}"` });
      setTimeout(() => setNotification(null), 3000);
    }
  }, [earnedBadges]);

  const handleComplete = useCallback(() => {
    if (currentLevelId > completedLevels) {
      setCompletedLevels(currentLevelId);
      setNotification({ type: 'level', message: `Level ${currentLevelId} complete!` });
      setTimeout(() => setNotification(null), 2500);
      // Auto-advance to next level
      if (currentLevelId < 10) {
        setTimeout(() => setCurrentLevelId(currentLevelId + 1), 400);
      }
    }
  }, [currentLevelId, completedLevels]);

  const handleSelectLevel = useCallback((id) => {
    setCurrentLevelId(id);
    setShowNav(false);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-slate-900 text-slate-100 overflow-hidden">
      <Header
        completedLevels={completedLevels}
        earnedBadges={earnedBadges}
        totalParams={TOTAL_PARAMS}
        paramProgress={paramProgress}
        onMenuClick={() => setShowNav(!showNav)}
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
          <div className="lg:hidden flex border-b border-slate-700 bg-slate-900">
            <button
              onClick={() => setActiveTab('content')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === 'content'
                  ? 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-slate-400'
              }`}
            >
              Content
            </button>
            <button
              onClick={() => setActiveTab('viz')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === 'viz'
                  ? 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-slate-400'
              }`}
            >
              Visualization
            </button>
          </div>

          {/* Left: Visualization */}
          <div className={`${activeTab === 'viz' ? 'flex' : 'hidden'} lg:flex lg:w-1/2 border-r border-slate-700 overflow-hidden flex-col min-h-0`}>
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
          <div className={`${activeTab === 'content' ? 'flex' : 'hidden'} lg:flex lg:w-1/2 overflow-hidden flex-col min-h-0`}>
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
    </div>
  );
}
