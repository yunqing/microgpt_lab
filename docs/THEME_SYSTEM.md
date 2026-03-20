# Theme System Implementation

## Summary

Added a comprehensive theme system with 6 beautiful themes that users can switch between. Themes persist across sessions using localStorage.

---

## Available Themes

### 1. **Dark** 🌙 (Default)
- Classic dark theme with slate colors
- High contrast, easy on the eyes
- Perfect for night coding

### 2. **Light** ☀️
- Clean white background
- Gray text on white
- Professional daytime look

### 3. **Midnight** 🌃
- Extra dark theme
- Near-black background
- Maximum contrast for OLED screens

### 4. **Nord** ❄️
- Popular Nord color palette
- Cool blue-gray tones
- Inspired by Arctic landscapes

### 5. **Dracula** 🧛
- Famous Dracula theme
- Purple and cyan accents
- Vibrant yet comfortable

### 6. **Solarized** 🌅
- Classic Solarized Light
- Warm beige background
- Carefully designed color harmony

---

## How It Works

### 1. **CSS Variables System**
- Defined in `/src/styles/theme.css`
- Uses CSS custom properties (--bg-primary, --text-primary, etc.)
- Applied via `data-theme` attribute on `<html>`

```css
[data-theme="dark"] {
  --bg-primary: #0f172a;
  --text-primary: #f1f5f9;
  --accent-cyan: #22d3ee;
}

[data-theme="light"] {
  --bg-primary: #ffffff;
  --text-primary: #111827;
  --accent-cyan: #0891b2;
}
```

### 2. **Theme Context**
- `/src/contexts/ThemeContext.jsx`
- Manages theme state globally
- Persists to localStorage
- Sets `data-theme` attribute on document root

```javascript
const [theme, setTheme] = useState(() => {
  const saved = localStorage.getItem('microgpt-theme');
  return saved && THEMES[saved] ? saved : 'dark';
});

useEffect(() => {
  localStorage.setItem('microgpt-theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
}, [theme]);
```

### 3. **Theme Selector UI**
- `/src/components/ThemeSelector.jsx`
- Beautiful modal with theme previews
- Shows icon, name, and color swatches
- Accessible via Palette button in header

### 4. **Theme Definitions**
- `/src/styles/themes.js`
- Defines all theme metadata
- Icons, names, and Tailwind class mappings
- Used for theme selector UI

---

## User Flow

1. **Click Palette Icon** (🎨) in header
2. **Theme Selector Modal Opens** with 6 themes in grid
3. **Click any theme** to apply instantly
4. **Theme persists** across page reloads (localStorage)

---

## Files Created

### New Files

1. **`/src/styles/themes.js`**
   - Theme metadata and definitions
   - Tailwind class mappings for components
   - Helper functions

2. **`/src/styles/theme.css`**
   - CSS custom properties for each theme
   - `data-theme` attribute selectors
   - Theme color variables

3. **`/src/contexts/ThemeContext.jsx`**
   - React Context for theme state
   - localStorage persistence
   - `useTheme()` hook

4. **`/src/components/ThemeSelector.jsx`**
   - Theme picker modal UI
   - Grid layout with previews
   - Animated transitions

### Modified Files

5. **`/src/index.js`**
   - Import theme.css

6. **`/src/App.js`**
   - Wrap with ThemeProvider
   - Add theme selector modal
   - Apply theme colors to root div

7. **`/src/components/Header.jsx`**
   - Add Palette button
   - Import useTheme hook
   - Apply theme colors

---

## Technical Details

### CSS Variables

Each theme defines these variables:

**Backgrounds**:
- `--bg-primary`: Main background
- `--bg-secondary`: Secondary panels
- `--bg-tertiary`: Tertiary elements
- `--bg-panel`: Semi-transparent overlays

**Text**:
- `--text-primary`: Main text
- `--text-secondary`: Secondary text
- `--text-tertiary`: Tertiary text
- `--text-muted`: Muted/disabled text

**Borders**:
- `--border-primary`: Main borders
- `--border-secondary`: Secondary borders

**Accents**:
- `--accent-cyan`: Primary accent color
- `--accent-indigo`: Secondary accent color

### Theme Persistence

```javascript
// On theme change:
localStorage.setItem('microgpt-theme', 'nord');

// On app load:
const saved = localStorage.getItem('microgpt-theme');
setTheme(saved || 'dark');
```

### Theme Application

```javascript
// Set data-theme attribute
document.documentElement.setAttribute('data-theme', 'dracula');

// CSS automatically applies
[data-theme="dracula"] {
  --bg-primary: #282a36;
}
```

---

## Future Enhancements

### Potential Additions

1. **More Themes**:
   - Monokai
   - Gruvbox
   - Tokyo Night
   - Catppuccin

2. **Custom Theme Builder**:
   - Let users create their own themes
   - Color picker for each variable
   - Export/import theme JSON

3. **Theme Preview**:
   - Live preview before applying
   - Side-by-side comparison

4. **Accessibility**:
   - High contrast mode
   - Colorblind-friendly themes
   - Font size adjustments

5. **Automatic Switching**:
   - Follow system theme (prefers-color-scheme)
   - Time-based (light during day, dark at night)

---

## Build Status

✅ **Compiled successfully**
- Bundle size: 306.99 KB (+13 B)
- CSS: 8.6 KB (+504 B for theme styles)
- No errors or warnings
- Ready to deploy

---

## Theme Color Palettes

### Dark
- Background: Slate 900 (#0f172a)
- Text: Slate 100 (#f1f5f9)
- Accent: Cyan 400 (#22d3ee)

### Light
- Background: White (#ffffff)
- Text: Gray 900 (#111827)
- Accent: Cyan 600 (#0891b2)

### Midnight
- Background: Slate 950 (#020617)
- Text: Slate 50 (#f8fafc)
- Accent: Cyan 300 (#67e8f9)

### Nord
- Background: #2E3440
- Text: #ECEFF4
- Accent: #88C0D0

### Dracula
- Background: #282a36
- Text: #f8f8f2
- Accent: #8be9fd

### Solarized
- Background: #fdf6e3
- Text: #657b83
- Accent: #2aa198

---

## Usage Example

```javascript
// In any component:
import { useTheme } from '../contexts/ThemeContext';

function MyComponent() {
  const { theme, setTheme, colors } = useTheme();

  return (
    <div className={colors.bg.primary}>
      <p className={colors.text.primary}>
        Current theme: {theme}
      </p>
      <button onClick={() => setTheme('dracula')}>
        Switch to Dracula
      </button>
    </div>
  );
}
```

---

## Summary

The MicroGPT Lab now features:
- ✅ 6 beautiful, carefully crafted themes
- ✅ Instant theme switching with smooth transitions
- ✅ Theme persistence across sessions
- ✅ Accessible theme selector UI
- ✅ CSS variable-based system for easy extension
- ✅ Professional color palettes from popular themes

**Result**: Users can now personalize their learning environment to match their preferences, whether they prefer dark mode for night sessions, light mode for daytime, or one of the popular themed color schemes.
