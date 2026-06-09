import { create } from 'zustand';

import { storage as safeStorage } from '../utils/storage';

const useLanguageStore = create((set) => ({
  lang: safeStorage.get('panditji_lang') || 'en', // 'en' | 'hi'
  setLang: (lang) => {
    safeStorage.set('panditji_lang', lang);
    set({ lang });
  },
}));

export default useLanguageStore;
