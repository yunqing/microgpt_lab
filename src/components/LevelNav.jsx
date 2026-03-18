import { motion } from 'framer-motion';
import { CheckCircle, Lock } from 'lucide-react';
import * as Icons from 'lucide-react';
import { CURRICULUM } from '../data/curriculum';

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
  return (
    <nav className="w-56 flex-shrink-0 bg-slate-900 border-r border-slate-700 overflow-y-auto">
      <div className="p-3">
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-3 px-1">Curriculum</p>
        {CURRICULUM.map((level) => {
          const Icon = Icons[level.icon] || Icons.Circle;
          const isCompleted = completedLevels >= level.id;
          const isActive = currentLevel === level.id;
          const isLocked = level.id > completedLevels + 1;
          const colors = colorMap[level.color];

          return (
            <motion.button
              key={level.id}
              onClick={() => !isLocked && onSelectLevel(level.id)}
              whileHover={!isLocked ? { x: 2 } : {}}
              whileTap={!isLocked ? { scale: 0.98 } : {}}
              className={`w-full text-left p-2.5 rounded-lg mb-1 border transition-all ${
                isActive
                  ? `${colors} border`
                  : isCompleted
                  ? 'text-slate-300 bg-slate-800/50 border-slate-700 hover:bg-slate-800'
                  : isLocked
                  ? 'text-slate-600 bg-transparent border-transparent cursor-not-allowed'
                  : 'text-slate-400 bg-transparent border-transparent hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0">
                  {isCompleted && !isActive ? (
                    <CheckCircle size={14} className="text-cyan-400" />
                  ) : isLocked ? (
                    <Lock size={14} className="text-slate-600" />
                  ) : (
                    <Icon size={14} />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono text-slate-500">{level.id}</span>
                    <span className="text-xs font-medium truncate">{level.title}</span>
                  </div>
                  <p className="text-xs text-slate-600 truncate">{level.subtitle}</p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
