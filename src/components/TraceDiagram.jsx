import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

const STAGES = [
  { id: 1, label: 'Input', sublabel: 'char', levels: [1] },
  { id: 2, label: 'Value', sublabel: 'autograd', levels: [2] },
  { id: 3, label: 'Embed', sublabel: 'wte+wpe', levels: [3] },
  { id: 4, label: 'Norm', sublabel: 'RMSNorm', levels: [4] },
  { id: 5, label: 'Attn', sublabel: 'QKV+heads', levels: [5] },
  { id: 6, label: 'MLP', sublabel: 'FC+ReLU', levels: [6] },
  { id: 7, label: 'Block', sublabel: 'arch', levels: [7] },
  { id: 8, label: 'Loss', sublabel: '-log(p)', levels: [8] },
  { id: 9, label: 'Adam', sublabel: 'optim', levels: [9] },
  { id: 10, label: 'Infer', sublabel: 'sample', levels: [10] },
];

export default function TraceDiagram({ currentLevel }) {
  const { colors } = useTheme();

  return (
    <div className={`${colors.bg.secondary} ${colors.border.primary} border rounded-xl p-2 sm:p-3`}>
      <p className={`text-xs ${colors.text.tertiary} mb-2 sm:mb-3 uppercase tracking-wider`}>Trace the Token</p>
      <div className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto pb-1">
        {STAGES.map((stage, i) => {
          const isActive = stage.levels.includes(currentLevel);
          const isPast = stage.levels.every(l => l < currentLevel);

          return (
            <div key={stage.id} className="flex items-center flex-shrink-0">
              <motion.div
                className={`relative flex flex-col items-center px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-lg border text-center transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-600'
                    : isPast
                    ? `${colors.bg.tertiary} ${colors.border.secondary} ${colors.text.tertiary}`
                    : `${colors.bg.primary} ${colors.border.primary} ${colors.text.muted}`
                }`}
                animate={isActive ? {
                  boxShadow: ['0 0 0 0 rgba(6,182,212,0)', '0 0 0 4px rgba(6,182,212,0.2)', '0 0 0 0 rgba(6,182,212,0)']
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-[10px] sm:text-xs font-semibold font-mono leading-none">{stage.label}</span>
                <span className="text-[9px] sm:text-xs opacity-60 leading-none mt-0.5">{stage.sublabel}</span>
                {isActive && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full"
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </motion.div>

              {/* Flow arrow with animated particle */}
              {i < STAGES.length - 1 && (
                <div className="relative w-3 sm:w-5 flex-shrink-0">
                  <div className="h-px bg-slate-700 w-full" />
                  {isPast && (
                    <motion.div
                      className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-cyan-400 rounded-full"
                      initial={{ left: 0, opacity: 0 }}
                      animate={{ left: '100%', opacity: [0, 1, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 0.5, delay: i * 0.15 }}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
