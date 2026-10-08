import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { copy, type Copy, type Lang } from './content';

type Theme = 'light' | 'dark';
interface Ctx { lang: Lang; t: Copy; setLang: (l: Lang) => void; theme: Theme; toggleTheme: () => void }
const AppCtx = createContext<Ctx>(null as unknown as Ctx);
export const useApp = () => useContext(AppCtx);

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => (document.documentElement.lang === 'en' ? 'en' : 'es'));
  const [theme, setTheme] = useState<Theme>(() => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'));
  const setLang = (l: Lang) => { setLangState(l); try { localStorage.setItem('lang', l); } catch {} };
  const toggleTheme = () => setTheme((x) => (x === 'dark' ? 'light' : 'dark'));
  useEffect(() => { document.documentElement.lang = lang; document.title = copy[lang].meta.title; }, [lang]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('theme', theme); } catch {}
  }, [theme]);
  return <AppCtx.Provider value={{ lang, t: copy[lang], setLang, theme, toggleTheme }}>{children}</AppCtx.Provider>;
}

/** Adds .is-in once the element enters the viewport (CSS does the motion). */
export function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.rv:not(.is-in), .tech-in:not(.is-in)');
    if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('is-in')); return; }
    const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  });
}
