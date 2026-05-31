import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import translations from './utils/translations';

// iOS Safari in Private Browsing or embedded webviews throws SecurityError on localStorage
const isLocalStorageAvailable = (() => {
  try {
    localStorage.setItem('__i18n_test__', '1');
    localStorage.removeItem('__i18n_test__');
    return true;
  } catch {
    return false;
  }
})();

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: translations.en
      },
      hi: {
        translation: translations.hi
      }
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: isLocalStorageAvailable ? ['localStorage', 'navigator'] : ['navigator'],
      caches: isLocalStorageAvailable ? ['localStorage'] : [],
      lookupLocalStorage: 'i18nextLng'
    }
  });

export default i18n;
