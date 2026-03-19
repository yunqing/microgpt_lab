import { motion } from 'framer-motion';
import { Cpu, Award, Menu, Star } from 'lucide-react';

export default function Header({ completedLevels, earnedBadges, totalParams, paramProgress, onMenuClick, currentLevel }) {
  return (
    <header className="flex items-center justify-between px-3 sm:px-6 py-3 bg-slate-900 border-b border-slate-700 z-10">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 hover:bg-slate-800 rounded-lg transition-colors flex-shrink-0"
        >
          <Menu size={18} className="text-slate-400" />
        </button>
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
          <Cpu size={14} className="text-white sm:w-4 sm:h-4" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xs sm:text-sm font-bold gradient-text truncate">MicroGPT Lab</h1>
          <p className="text-xs text-slate-500 hidden sm:block">
            Learn{' '}
            <a
              href="https://gist.github.com/karpathy/8627fe009c40f57531cb18360106ce95"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 underline transition-colors"
            >
              microgpt
            </a>
            {' '}interactively
          </p>
          <p className="text-xs text-slate-500 sm:hidden truncate">Lv.{currentLevel?.id}</p>
        </div>
      </div>

      {/* Parameter Progress */}
      <div className="hidden md:flex flex-col items-center gap-1 flex-1 mx-8">
        <div className="flex items-center gap-2 w-full max-w-xs">
          <span className="text-xs text-slate-400 w-24 text-right">{paramProgress.toLocaleString()} params</span>
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
        <p className="text-xs text-slate-600">Parameter Counter</p>
      </div>

      {/* Badges & Progress */}
      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        {/* GitHub Star Button */}
        <a
          href="https://github.com/yunqing/microgpt_lab"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-slate-500 rounded-lg transition-all group"
        >
          <Star size={14} className="text-slate-400 group-hover:text-yellow-400 transition-colors" />
          <span className="text-xs text-slate-300 group-hover:text-slate-100 font-medium">Star</span>
        </a>

        {/* Mobile GitHub Star (icon only) */}
        <a
          href="https://github.com/yunqing/microgpt_lab"
          target="_blank"
          rel="noopener noreferrer"
          className="sm:hidden flex items-center justify-center w-8 h-8 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg transition-all"
        >
          <Star size={14} className="text-slate-400" />
        </a>

        <div className="flex items-center gap-1">
          <Award size={12} className="text-yellow-400 sm:w-3.5 sm:h-3.5" />
          <span className="text-xs text-yellow-400 font-mono">{earnedBadges.length}</span>
          <span className="text-xs text-slate-500 hidden sm:inline">badges</span>
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
