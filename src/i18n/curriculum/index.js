// Curriculum translations aggregator
import { zh_curriculum } from './zh';
import { ja_curriculum } from './ja';
import { es_curriculum } from './es';
import { fr_curriculum } from './fr';

export const curriculumTranslations = {
  zh: zh_curriculum,
  ja: ja_curriculum,
  es: es_curriculum,
  fr: fr_curriculum
};

/**
 * Get translated curriculum content for a specific level
 * @param {number} levelId - The level ID (1-10)
 * @param {string} language - Language code (zh, ja, es, fr)
 * @param {string} field - Field to translate (title, subtitle, heading, body, question, answer, badge)
 * @returns {string|null} Translated content or null if not available
 */
export function getCurriculumTranslation(levelId, language, field) {
  // Return null for English or if translation not available
  if (language === 'en' || !curriculumTranslations[language]) {
    return null;
  }

  return curriculumTranslations[language]?.[levelId]?.[field] || null;
}

/**
 * Get full translated curriculum array
 * @param {Array} curriculum - Original curriculum array
 * @param {string} language - Language code
 * @returns {Array} Translated curriculum
 */
export function getTranslatedCurriculum(curriculum, language) {
  // Return original for English or if translation not available
  if (language === 'en' || !curriculumTranslations[language]) {
    return curriculum;
  }

  const translations = curriculumTranslations[language];

  return curriculum.map(level => {
    const translation = translations[level.id];
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
