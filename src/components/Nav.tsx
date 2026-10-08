import { useEffect, useState } from 'react';
import { useApp } from '../lib/hooks';

const Sun = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>;
const Moon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" /></svg>;

export default function Nav() {
  const { t, lang, setLang, theme, toggleTheme } = useApp();
  const [active, setActive] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const ids = t.nav.map((n) => n.id);
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); }), { rootMargin: '-45% 0px -50% 0px' });
    els.forEach((e) => io.observe(e));
    const hero = document.getElementById('top');
    const ioTop = new IntersectionObserver(([e]) => { if (e.isIntersecting) setActive(''); }, { rootMargin: '-45% 0px -50% 0px' });
    if (hero) ioTop.observe(hero);
    return () => { io.disconnect(); ioTop.disconnect(); };
  }, [t]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    addEventListener('keydown', k); return () => removeEventListener('keydown', k);
  }, []);

  const go = () => setOpen(false);
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-ink-fg">{t.ui.skip}</a>
      <nav className="nav" aria-label="Principal">
        <a href="#top" className="text-[0.9375rem] font-semibold tracking-tight">Jean Pier<span className="text-faint"> Gómez</span></a>
        <div className="hidden items-center gap-1 md:flex">
          {t.nav.map((n) => <a key={n.id} href={`#${n.id}`} className="nav-link" aria-current={active === n.id ? 'true' : undefined}>{n.label}</a>)}
        </div>
        <div className="flex items-center">
          <button type="button" className="nav-link !px-3 font-medium" onClick={() => setLang(lang === 'es' ? 'en' : 'es')} aria-label={t.ui.lang} lang={lang === 'es' ? 'en' : 'es'}>{t.ui.langCode}</button>
          <button type="button" className="icon-btn" onClick={toggleTheme} aria-label={t.ui.theme}>{theme === 'dark' ? <Sun /> : <Moon />}</button>
          <button type="button" className="icon-btn menu-btn" aria-expanded={open} aria-label={open ? t.ui.closeMenu : t.ui.menu} onClick={() => setOpen(!open)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">{open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 8h16M4 16h16" />}</svg>
          </button>
        </div>
      </nav>
      <div className="menu-sheet md:hidden" data-open={open}>
        {t.nav.map((n) => <a key={n.id} href={`#${n.id}`} onClick={go} className="flex min-h-[52px] items-center border-b border-line text-lg last:border-0">{n.label}</a>)}
      </div>
    </>
  );
}
