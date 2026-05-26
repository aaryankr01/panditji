import { useTranslation } from 'react-i18next';

/**
 * useT() — returns a translation function t(key)
 * Usage:
 *   const t = useT();
 *   <h1>{t('home_h1_line1')}</h1>
 */
const useT = () => {
  const { t } = useTranslation();
  return t;
};

export default useT;
