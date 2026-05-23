import useLanguageStore from '../store/useLanguageStore';
import translations from '../utils/translations';

/**
 * useT() — returns a translation function t(key)
 * Usage:
 *   const t = useT();
 *   <h1>{t('home_h1_line1')}</h1>
 */
const useT = () => {
  const { lang } = useLanguageStore();
  return (key) => translations[lang]?.[key] ?? translations['en'][key] ?? key;
};

export default useT;
