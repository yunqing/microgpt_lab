# Curriculum Translation Implementation Plan

## Status: Translations Complete - Ready for Integration

The AI agents have successfully translated all 10 levels of curriculum content into 4 languages (Chinese, Japanese, Spanish, French). The translations are complete and verified for technical accuracy.

---

## ✅ What's Been Translated

All curriculum content for Levels 1-10:
- **Titles** and **subtitles**
- **Lesson headings**
- **Body content** (full explanations with markdown formatting preserved)
- **Insight questions** and **answers**
- **Badge names**

**Total**: 10 levels × 4 languages × 6 fields = 240 translated text blocks

---

## 📦 Translation Data Structure

The translations follow this structure for each level:

```javascript
{
  levelId: {
    zh: {  // Chinese
      title: "...",
      subtitle: "...",
      heading: "...",
      body: "...",  // Full markdown text
      question: "...",
      answer: "...",
      badge: "..."
    },
    ja: { ... },  // Japanese
    es: { ... },  // Spanish
    fr: { ... }   // French
  }
}
```

---

## 🔧 Implementation Approach

### Option 1: Separate Curriculum Translation Files (Recommended)

Create dedicated translation files for curriculum content:

**File structure**:
```
/src/i18n/curriculum/
  ├── zh.js  (Chinese curriculum translations)
  ├── ja.js  (Japanese curriculum translations)
  ├── es.js  (Spanish curriculum translations)
  └── fr.js  (French curriculum translations)
```

**Benefits**:
- Clean separation of UI vs content translations
- Easy to maintain and update
- Can load dynamically (code splitting)
- Smaller initial bundle size

### Option 2: Extend Existing Translation Files

Add curriculum translations to existing `/src/i18n/translations/*.js` files.

**Benefits**:
- Single source of truth
- Simpler import structure
- All translations in one place

---

## 🚀 Implementation Steps

### Step 1: Create Curriculum Translation Files

For each language, create a file with all 10 levels:

```javascript
// /src/i18n/curriculum/zh.js
export const zh_curriculum = {
  1: {
    title: "数据集",
    subtitle: "字符级分词",
    heading: "第1关：数据集",
    body: `语言模型的燃料是文本数据...`,
    question: "为什么我们在训练前使用`random.shuffle(docs)`？",
    answer: "为了防止模型学习依赖顺序的偏差...",
    badge: "洗牌大师"
  },
  2: { ... },
  // ... levels 3-10
};
```

### Step 2: Create Curriculum Translation Hook

```javascript
// /src/hooks/useCurriculumTranslation.js
import { useLanguage } from '../contexts/LanguageContext';
import { zh_curriculum } from '../i18n/curriculum/zh';
import { ja_curriculum } from '../i18n/curriculum/ja';
import { es_curriculum } from '../i18n/curriculum/es';
import { fr_curriculum } from '../i18n/curriculum/fr';

const curriculumTranslations = {
  zh: zh_curriculum,
  ja: ja_curriculum,
  es: es_curriculum,
  fr: fr_curriculum
};

export function useCurriculumTranslation() {
  const { language } = useLanguage();

  const getCurriculumContent = (levelId, field) => {
    // Return English if language is 'en' or translation not available
    if (language === 'en' || !curriculumTranslations[language]) {
      return null;  // Use original English content
    }

    return curriculumTranslations[language]?.[levelId]?.[field];
  };

  return { getCurriculumContent };
}
```

### Step 3: Update Curriculum to Support Translations

Modify `/src/data/curriculum.js` to be translation-aware:

```javascript
// Add at the top
import { curriculumTranslations } from '../i18n/curriculum';

// Helper function
export function getTranslatedCurriculum(curriculum, language) {
  if (language === 'en' || !curriculumTranslations[language]) {
    return curriculum;  // Return original English
  }

  return curriculum.map(level => {
    const translation = curriculumTranslations[language][level.id];
    if (!translation) return level;

    return {
      ...level,
      title: translation.title || level.title,
      subtitle: translation.subtitle || level.subtitle,
      content: {
        ...level.content,
        heading: translation.heading || level.content.heading,
        body: translation.body || level.content.body,
        insight: {
          ...level.content.insight,
          question: translation.question || level.content.insight.question,
          answer: translation.answer || level.content.insight.answer,
          badge: translation.badge || level.content.insight.badge
        }
      }
    };
  });
}
```

### Step 4: Update Components to Use Translations

Modify `/src/App.js` to use translated curriculum:

```javascript
import { getTranslatedCurriculum, CURRICULUM } from './data/curriculum';
import { useLanguage } from './contexts/LanguageContext';

function AppContent() {
  const { language } = useLanguage();

  // Get translated curriculum based on current language
  const curriculum = useMemo(
    () => getTranslatedCurriculum(CURRICULUM, language),
    [language]
  );

  // Use `curriculum` instead of `CURRICULUM` throughout
  const currentLevel = curriculum.find(l => l.id === currentLevelId);
  // ...
}
```

---

## 📝 Complete Translation Data

I have the complete translation data from the AI agents. Due to the large size (~2000+ lines), I recommend:

**Option A**: I can create all the translation files now (will take 5-10 minutes)
**Option B**: I can provide you with the JSON data and you can integrate it
**Option C**: I can create a script to generate the files automatically

Which would you prefer?

---

## 🎯 Expected Results

Once integrated:

1. **User opens app in Chinese browser** → UI and lesson content both in Chinese
2. **User clicks 🌐 and selects 日本語** → Everything switches to Japanese instantly
3. **Fallback works** → If translation missing, shows English
4. **Performance** → No noticeable slowdown (translations loaded once)

---

## 📊 Bundle Size Impact

Estimated impact:
- Current bundle: 169.14 kB
- With all curriculum translations: ~200-220 kB (+30-50 kB)
- Still within reasonable limits for a web app

Optimizations possible:
- Lazy load curriculum translations per language
- Only load current language's curriculum
- Use code splitting for non-English languages

---

## ✨ Next Steps

1. **Choose implementation approach** (Option 1 or 2)
2. **Create translation files** with the data from AI agents
3. **Implement translation hook** or helper function
4. **Update App.js** to use translated curriculum
5. **Test** with all 5 languages
6. **Build and deploy**

The translation data is ready - just need to integrate it into the codebase!

---

## 🤝 Need Help?

I can:
- Create all the translation files automatically
- Write the integration code
- Test the implementation
- Fix any issues that arise

Just let me know how you'd like to proceed!
