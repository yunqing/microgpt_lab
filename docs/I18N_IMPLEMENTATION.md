# Internationalization (i18n) Implementation Plan

## Summary

Complete i18n system for MicroGPT Lab with browser language detection, user selection, and localStorage persistence.

---

## Architecture Overview

### Why NOT IP-based Detection

❌ **IP-based approach has major issues**:
1. **Privacy concerns** - Requires external API to get IP → location → language
2. **Inaccurate** - VPN users, travelers, expats get wrong language
3. **Extra dependencies** - Needs geolocation service (costs money/rate limits)
4. **Slower** - Network request delays initial load
5. **GDPR issues** - IP tracking may need consent in EU
6. **Overkill** - Browser already knows user's language preference!

### ✅ Better Approach: Browser Language + User Override

```javascript
// 1. Browser language detection (built-in, free, accurate)
const browserLang = navigator.language; // "zh-CN", "en-US", "ja-JP"

// 2. User can override anytime
// 3. Save preference to localStorage
// 4. No external API needed
```

---

## File Structure Created

```
src/
├── i18n/
│   ├── languages.js              # Language metadata & detection
│   └── translations/
│       ├── index.js               # Translation aggregator
│       ├── en.js                  # English translations
│       ├── zh.js                  # Chinese translations
│       ├── ja.js                  # Japanese (TODO)
│       ├── es.js                  # Spanish (TODO)
│       └── ...                    # More languages
├── contexts/
│   └── LanguageContext.jsx        # Language state management
└── components/
    └── LanguageSelector.jsx       # Language picker UI
```

---

## 1. Language Detection & Metadata

**File**: `/src/i18n/languages.js`

### Supported Languages (10 initially)

```javascript
export const LANGUAGES = {
  en: { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  zh: { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  ja: { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  es: { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  fr: { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  de: { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  ko: { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  pt: { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  ru: { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  ar: { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true }
};
```

### Browser Language Detection

```javascript
export function detectBrowserLanguage() {
  const browserLang = navigator.language || navigator.userLanguage;
  const langCode = browserLang.split('-')[0]; // "zh-CN" → "zh"

  return LANGUAGES[langCode] ? langCode : 'en'; // Fallback to English
}

export function getInitialLanguage() {
  // 1. Check localStorage (user preference)
  const saved = localStorage.getItem('microgpt-language');
  if (saved && LANGUAGES[saved]) return saved;

  // 2. Detect browser language
  return detectBrowserLanguage();
}
```

**Priority**:
1. User's saved preference (localStorage)
2. Browser language setting
3. Default to English

---

## 2. Translation Files

**File**: `/src/i18n/translations/en.js` (English - complete)
**File**: `/src/i18n/translations/zh.js` (Chinese - complete)

### Structure

```javascript
export const en = {
  header: {
    title: 'MicroGPT Lab',
    subtitle: 'Learn microgpt interactively',
    level: 'Lv.',
    params: 'params',
    badges: 'badges',
    train: 'Train',
    star: 'Star'
  },

  nav: {
    curriculum: 'Curriculum',
    content: 'Content',
    visualization: 'Visualization'
  },

  buttons: {
    complete: 'Complete Level',
    startLearning: 'Start Learning',
    reset: 'Reset',
    close: 'Close',
    // ... more buttons
  },

  // ... more sections
};
```

### Translation Keys

All UI text organized by category:
- `header.*` - Header text
- `nav.*` - Navigation
- `levels.*` - Level status
- `buttons.*` - All buttons
- `training.*` - Training experience
- `about.*` - About dialog
- `exercise.*` - Code exercises
- `notifications.*` - Toast messages
- `theme.*` - Theme selector
- `common.*` - Common words

---

## 3. Language Context

**File**: `/src/contexts/LanguageContext.jsx`

### Features

```javascript
export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(getInitialLanguage);

  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('microgpt-language', language);

    // Set HTML lang attribute (SEO & accessibility)
    document.documentElement.lang = language;

    // Set dir attribute for RTL languages (Arabic, Hebrew)
    const isRTL = LANGUAGES[language]?.rtl || false;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }, [language]);

  // Translation function
  const t = (key) => {
    // Get nested value: t('header.title') → translations.en.header.title
    const keys = key.split('.');
    let value = translations[language];

    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        // Fallback to English if translation missing
        value = translations.en;
        for (const k of keys) {
          value = value?.[k];
        }
        console.warn(`Translation missing: ${key} in ${language}`);
        break;
      }
    }

    return value || key;
  };

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage,
      t,
      languageInfo: LANGUAGES[language],
      availableLanguages: Object.values(LANGUAGES)
    }}>
      {children}
    </LanguageContext.Provider>
  );
}
```

### Usage in Components

```javascript
import { useLanguage } from '../contexts/LanguageContext';

function MyComponent() {
  const { t, language, setLanguage } = useLanguage();

  return (
    <div>
      <h1>{t('header.title')}</h1>
      <p>{t('header.subtitle')}</p>
      <button onClick={() => setLanguage('zh')}>
        切换到中文
      </button>
    </div>
  );
}
```

---

## 4. Language Selector UI

**File**: `/src/components/LanguageSelector.jsx`

### Features

- **Modal dialog** with language list
- **Flag icons** for visual recognition
- **Native names** (e.g., "中文" not "Chinese")
- **Current language highlighted** with checkmark
- **Auto-detected indicator** in footer
- **Theme-aware** styling
- **Keyboard accessible** with focus states

### UI Layout

```
┌─────────────────────────────────────┐
│ 🌐 Choose Language                 ×│
│    Select your preferred language   │
├─────────────────────────────────────┤
│ 🇺🇸 English        ✓               │
│    English                          │
├─────────────────────────────────────┤
│ 🇨🇳 中文                            │
│    Chinese                          │
├─────────────────────────────────────┤
│ 🇯🇵 日本語                          │
│    Japanese                         │
├─────────────────────────────────────┤
│ ... more languages ...              │
├─────────────────────────────────────┤
│ Auto-detected from browser   [Close]│
└─────────────────────────────────────┘
```

---

## 5. Integration Steps (TODO)

### Step 1: Wrap App with LanguageProvider

```javascript
// src/App.js
import { LanguageProvider } from './contexts/LanguageContext';

export default function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </LanguageProvider>
  );
}
```

### Step 2: Add Language Button to Header

```javascript
// src/components/Header.jsx
import { Globe } from 'lucide-react';

<button
  onClick={onLanguageClick}
  className="flex items-center justify-center w-8 h-8 hover:bg-slate-800 rounded-lg"
  aria-label="Change Language"
>
  <Globe size={16} className="text-slate-400" />
</button>
```

### Step 3: Replace Hardcoded Text with t()

```javascript
// Before
<h1>MicroGPT Lab</h1>
<button>Complete Level</button>

// After
<h1>{t('header.title')}</h1>
<button>{t('buttons.complete')}</button>
```

### Step 4: Update All Components

Files to update:
- `Header.jsx` - Header text, buttons
- `LevelNav.jsx` - "Curriculum" label
- `ContentPanel.jsx` - "Complete Level" button
- `CodeExercise.jsx` - Button labels, hints
- `AboutMicroGPT.jsx` - All dialog text
- `ThemeSelector.jsx` - Dialog text
- `TrainingExperience.jsx` - All training text

---

## 6. RTL Language Support

For Arabic, Hebrew, etc.:

```javascript
// Automatically handled by LanguageContext
document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
```

**CSS adjustments needed**:
```css
[dir="rtl"] {
  /* Flip margins, paddings, text-align */
}
```

---

## 7. Adding New Languages

### Step-by-step:

1. **Create translation file**:
   ```javascript
   // src/i18n/translations/ja.js
   export const ja = {
     header: {
       title: 'MicroGPT ラボ',
       // ... translate all keys
     }
   };
   ```

2. **Add to languages.js**:
   ```javascript
   ja: {
     code: 'ja',
     name: 'Japanese',
     nativeName: '日本語',
     flag: '🇯🇵'
   }
   ```

3. **Import in translations/index.js**:
   ```javascript
   import { ja } from './ja';
   export const translations = { en, zh, ja };
   ```

4. **Done!** Language automatically appears in selector

---

## 8. Benefits of This Approach

### ✅ Advantages

1. **No external dependencies** - Uses built-in `navigator.language`
2. **Instant** - No network requests
3. **Accurate** - Browser knows user's actual language preference
4. **Privacy-friendly** - No tracking, no external APIs
5. **Free** - No API costs or rate limits
6. **Offline-ready** - Works without internet
7. **User control** - Can override anytime
8. **Persistent** - Saves to localStorage
9. **SEO-friendly** - Sets `<html lang="xx">` attribute
10. **Accessible** - Sets `dir="rtl"` for RTL languages

### 📊 Comparison

| Feature | IP-based | Browser Language |
|---------|----------|------------------|
| Accuracy | ❌ Low (VPN, travel) | ✅ High |
| Speed | ❌ Slow (API call) | ✅ Instant |
| Privacy | ❌ Tracks IP | ✅ No tracking |
| Cost | ❌ API costs | ✅ Free |
| Offline | ❌ Requires internet | ✅ Works offline |
| Setup | ❌ Complex | ✅ Simple |

---

## 9. Translation Coverage

### Currently Translated

- ✅ **English** (en) - 100% complete
- ✅ **Chinese Simplified** (zh) - 100% complete

### Ready to Add (need translations)

- ⏳ Japanese (ja)
- ⏳ Spanish (es)
- ⏳ French (fr)
- ⏳ German (de)
- ⏳ Korean (ko)
- ⏳ Portuguese (pt)
- ⏳ Russian (ru)
- ⏳ Arabic (ar)

### How to Get Translations

**Options**:
1. **Community contributions** - GitHub PRs
2. **Professional translation** - Hire translators
3. **AI translation** - Use GPT-4 (good starting point, needs review)
4. **Crowdsourcing** - Platforms like Crowdin

---

## 10. Testing Checklist

### Browser Language Detection
- [ ] Set browser to Chinese → App loads in Chinese
- [ ] Set browser to Japanese → App loads in English (fallback)
- [ ] Set browser to English → App loads in English

### User Selection
- [ ] Click language button → Selector opens
- [ ] Select Chinese → UI changes to Chinese
- [ ] Refresh page → Still in Chinese (localStorage)

### RTL Languages
- [ ] Select Arabic → Layout flips to RTL
- [ ] Text aligns right
- [ ] Scrollbars on left side

### Fallback
- [ ] Missing translation key → Shows English
- [ ] Console warning logged
- [ ] No app crash

---

## 11. localStorage Keys

```javascript
'microgpt-language'  // Current language code (e.g., "zh")
'microgpt-theme'     // Theme preference
'microgpt-progress'  // Learning progress
'microgpt-seen-training'  // Training modal seen
```

---

## 12. Future Enhancements

### Phase 2 Features

1. **Curriculum Translation**
   - Translate all lesson content
   - Technical terms glossary
   - Code comments in native language

2. **Language-specific Resources**
   - Links to resources in user's language
   - Community forums by language

3. **Translation Contribution System**
   - In-app translation editor
   - Submit translations via GitHub
   - Community review process

4. **Smart Fallback**
   - Show English + native language side-by-side
   - Highlight untranslated sections

5. **Language Learning Mode**
   - Show English + selected language
   - Help users learn technical English

---

## 13. Implementation Status

### ✅ Completed

- [x] Language detection system
- [x] Translation file structure
- [x] English translations (100%)
- [x] Chinese translations (100%)
- [x] Language context & provider
- [x] Language selector UI
- [x] RTL language support
- [x] localStorage persistence

### ⏳ TODO (Next Steps)

- [ ] Integrate LanguageProvider into App.js
- [ ] Add language button to Header
- [ ] Replace hardcoded text with t() in all components
- [ ] Test with Chinese language
- [ ] Add more language translations
- [ ] Update documentation

---

## Summary

**Implemented**: Complete i18n system with:
- ✅ Browser language auto-detection
- ✅ User language selection
- ✅ localStorage persistence
- ✅ 10 language support (2 translated)
- ✅ RTL language support
- ✅ Fallback to English
- ✅ No external dependencies
- ✅ Privacy-friendly

**Ready to integrate**: Just need to wrap App and replace hardcoded strings!

**Better than IP-based**: Faster, more accurate, privacy-friendly, and free!
