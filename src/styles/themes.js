// Theme definitions for MicroGPT Lab

export const THEMES = {
  dark: {
    id: 'dark',
    name: 'Dark',
    icon: '🌙',
    cardBg: '#1e293b',
    cardText: '#f1f5f9',
    cardBorder: '#334155',
    colors: {
      // Background
      bg: {
        primary: 'bg-slate-900',
        secondary: 'bg-slate-800',
        tertiary: 'bg-slate-950',
        panel: 'bg-slate-900/60',
        hover: 'hover:bg-slate-800',
        active: 'bg-slate-700',
      },
      // Text
      text: {
        primary: 'text-slate-100',
        secondary: 'text-slate-300',
        tertiary: 'text-slate-400',
        muted: 'text-slate-500',
        disabled: 'text-slate-600',
      },
      // Borders
      border: {
        primary: 'border-slate-700',
        secondary: 'border-slate-600',
        hover: 'hover:border-slate-500',
      },
      // Accents
      accent: {
        cyan: 'text-cyan-400',
        cyanBg: 'bg-cyan-500/20',
        cyanBorder: 'border-cyan-500/50',
        indigo: 'text-indigo-400',
        indigoBg: 'bg-indigo-500/20',
        indigoBorder: 'border-indigo-500/50',
      },
      // Code
      code: {
        bg: 'bg-slate-950',
        border: 'border-slate-700',
        text: 'text-slate-200',
      }
    }
  },

  light: {
    id: 'light',
    name: 'Light',
    icon: '☀️',
    cardBg: '#f9fafb',
    cardText: '#111827',
    cardBorder: '#e5e7eb',
    colors: {
      bg: {
        primary: 'bg-white',
        secondary: 'bg-gray-50',
        tertiary: 'bg-gray-100',
        panel: 'bg-white/80',
        hover: 'hover:bg-gray-200',
        active: 'bg-gray-300',
      },
      text: {
        primary: 'text-black',        // Pure black for maximum contrast
        secondary: 'text-gray-800',   // Very dark for high readability
        tertiary: 'text-gray-700',    // Dark but still distinct
        muted: 'text-gray-600',       // Darker muted text
        disabled: 'text-gray-400',
        hover: 'hover:text-black',
      },
      border: {
        primary: 'border-gray-200',
        secondary: 'border-gray-300',
        hover: 'hover:border-gray-400',
      },
      accent: {
        cyan: 'text-cyan-600',
        cyanBg: 'bg-cyan-50',
        cyanBorder: 'border-cyan-200',
        indigo: 'text-indigo-600',
        indigoBg: 'bg-indigo-50',
        indigoBorder: 'border-indigo-200',
      },
      code: {
        bg: 'bg-gray-100',           // Darker code background
        border: 'border-gray-300',
        text: 'text-black',          // Black code text
      }
    }
  },

};

// Helper function to get theme colors
export function getThemeColors(themeId) {
  return THEMES[themeId]?.colors || THEMES.dark.colors;
}

// Helper function to apply theme classes
export function themeClass(themeId, category, variant = 'primary') {
  const colors = getThemeColors(themeId);
  return colors[category]?.[variant] || '';
}
