import { motion } from 'framer-motion';
import { Cpu, Award } from 'lucide-react';

export default function Header({ completedLevels, earnedBadges, totalParams, paramProgress }) {
  return (
    <header className="flex items-center justify-between px-6 py-3 bg-slate-900 border-b border-slate-700 z-10">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center">
          <Cpu size={16} className="text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold gradient-text">MicroGPT Lab</h1>
          <p className="text-xs text-slate-500">by @karpathy — deconstructed</p>
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
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <Award size={14} className="text-yellow-400" />
          <span className="text-xs text-yellow-400 font-mono">{earnedBadges.length}</span>
          <span className="text-xs text-slate-500">badges</span>
        </div>
        <div className="flex items-center gap-1">
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
