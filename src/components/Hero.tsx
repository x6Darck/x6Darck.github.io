import { useApp } from '../lib/hooks';
import { profile } from '../lib/content';

export default function Hero() {
  const { t } = useApp();
  return (
    <header id="top" className="hero-bg relative flex min-h-[100dvh] items-center">
      <div className="wrap pb-24 pt-32">
        <h1 className="display rv max-w-[18ch]">{t.hero.title}</h1>
        <p className="lead rv mt-8" style={{ '--i': 1 } as React.CSSProperties}>{t.hero.sub}</p>
        <div className="rv mt-10 flex flex-wrap gap-3" style={{ '--i': 2 } as React.CSSProperties}>
          <a href="#gea" className="btn btn-solid">{t.hero.cta}</a>
          <a href={profile.cv} className="btn" download>{t.hero.cv}</a>
        </div>
        <p className="mono rv mt-12 text-sm text-faint" style={{ '--i': 3 } as React.CSSProperties}>{t.hero.meta}</p>
      </div>
      <a href="#gea" className="mono absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs text-faint md:flex" aria-label={t.hero.cta}>
        {t.hero.scroll}<span className="block h-8 w-px bg-line-strong" />
      </a>
    </header>
  );
}
