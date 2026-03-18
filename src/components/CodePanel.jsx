import { useState } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, ChevronDown, ChevronUp } from 'lucide-react';

SyntaxHighlighter.registerLanguage('python', python);

// Custom style overriding atomOneDark background
const codeStyle = {
  ...atomOneDark,
  'hljs': {
    ...atomOneDark['hljs'],
    background: 'transparent',
    padding: '0',
    fontSize: '12px',
    lineHeight: '1.6',
    fontFamily: "'Fira Code', 'Cascadia Code', 'Courier New', monospace",
  }
};

export default function CodePanel({ level }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2.5 bg-slate-800 border-b border-slate-700 cursor-pointer"
        onClick={() => setCollapsed(c => !c)}
      >
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-green-500/70" />
          </div>
          <Code size={13} className="text-slate-400 ml-2" />
          <span className="text-xs text-slate-400 font-mono">main.py</span>
          <span className="text-xs text-slate-600">
            lines {level.codeLines[0]}–{level.codeLines[1]}
          </span>
        </div>
        <button className="text-slate-500 hover:text-slate-300">
          {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
      </div>

      {/* Code body */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="overflow-x-auto p-4 max-h-64 overflow-y-auto">
              <SyntaxHighlighter
                language="python"
                style={codeStyle}
                showLineNumbers={false}
                wrapLines={true}
                lineProps={(lineNumber) => {
                  const isHighlighted = level.highlightLines?.includes(lineNumber);
                  return {
                    style: isHighlighted
                      ? {
                          backgroundColor: 'rgba(6, 182, 212, 0.12)',
                          borderLeft: '2px solid #06b6d4',
                          paddingLeft: '10px',
                          marginLeft: '-12px',
                          display: 'block',
                        }
                      : { display: 'block' }
                  };
                }}
              >
                {level.code}
              </SyntaxHighlighter>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
