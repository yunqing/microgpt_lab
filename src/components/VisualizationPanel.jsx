import { motion, AnimatePresence } from 'framer-motion';
import TokenizerViz from '../visualizations/TokenizerViz';
import AutogradViz from '../visualizations/AutogradViz';
import EmbeddingViz from '../visualizations/EmbeddingViz';
import RMSNormViz from '../visualizations/RMSNormViz';
import QKVViz from '../visualizations/QKVViz';
import AttentionViz from '../visualizations/AttentionViz';
import MLPViz from '../visualizations/MLPViz';
import LossViz from '../visualizations/LossViz';
import AdamViz from '../visualizations/AdamViz';
import InferenceViz from '../visualizations/InferenceViz';
import TraceDiagram from './TraceDiagram';
import { useTheme } from '../contexts/ThemeContext';

const VIZ_MAP = {
  tokenizer: TokenizerViz,
  autograd: AutogradViz,
  embedding: EmbeddingViz,
  rmsnorm: RMSNormViz,
  qkv: QKVViz,
  attention: AttentionViz,
  mlp: MLPViz,
  loss: LossViz,
  adam: AdamViz,
  inference: InferenceViz,
};

export default function VisualizationPanel({ level }) {
  const { colors } = useTheme();
  const VizComponent = VIZ_MAP[level.content.visualType];

  return (
    <div className="h-full w-full flex flex-col gap-3 sm:gap-4 overflow-y-auto p-3 sm:p-4">
      {/* Trace diagram */}
      <TraceDiagram currentLevel={level.id} />

      {/* Level-specific visualization */}
      <div className={`${colors.bg.secondary} ${colors.border.primary} border rounded-xl p-3 sm:p-4 flex-1`}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <p className={`text-xs ${colors.text.tertiary} font-semibold uppercase tracking-wider`}>
            Interactive: {level.title}
          </p>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={level.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {VizComponent && <VizComponent />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
