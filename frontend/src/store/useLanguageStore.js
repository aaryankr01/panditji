import { create } from 'zustand';

const useLanguageStore = create((set) => ({
  lang: localStorage.getItem('panditji_lang') || 'en', // 'en' | 'hi'
  setLang: (lang) => {
    localStorage.setItem('panditji_lang', lang);
    set({ lang });
  },
}));

export default useLanguageStore;
