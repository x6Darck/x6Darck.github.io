import { useState } from 'react';
import { useApp } from '../lib/hooks';
import { profile } from '../lib/content';
import { stackGroups } from '../lib/tech';
import { Arrow, GithubMark, TechIcon } from './ui';

export function Stack() {
  const { t } = useApp();
  let n = 0;
  return (
    <section id="stack" className="relative py-28 md:py-40" aria-labelledby="stack-h">
      <div className="wrap">
        <h2 id="stack-h" className="title rv max-w-[18ch]">{t.stack.title}</h2>
        <p className="lead rv mt-4" style={{ '--i': 1 } as React.CSSProperties}>{t.stack.sub}</p>
        <div className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {stackGroups.map((g) => (
            <div key={g.id} className={g.id === 'data' ? 'lg:col-span-2' : ''}>
              <h3 className="mono mb-4 text-sm text-faint">{t.stack.groups[g.id]}</h3>
              <div className="flex flex-wrap gap-3">{g.items.map((id) => <TechIcon key={id} id={id} i={n++} />)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function About() {
  const { t } = useApp();
  return (
    <section id="about" className="relative border-t border-line py-28 md:py-36" aria-labelledby="about-h">
      <div className="wrap grid gap-16 md:grid-cols-[1.1fr_1fr]">
        <div>
          <h2 id="about-h" className="title rv max-w-[16ch]">{t.about.title}</h2>
          <p className="lead rv mt-6" style={{ '--i': 1 } as React.CSSProperties}>{t.about.p1}</p>
          <p className="lead rv mt-4" style={{ '--i': 2 } as React.CSSProperties}>{t.about.p2}</p>
          <p className="mono rv mt-6 text-sm text-faint" style={{ '--i': 3 } as React.CSSProperties}>{t.about.langs}</p>
        </div>
        <div className="rv" style={{ '--i': 2 } as React.CSSProperties}>
          <h3 className="mono mb-6 text-sm text-faint">{t.timeline.title}</h3>
          <ol className="relative space-y-8 border-l border-line-strong pl-6">
            {t.timeline.items.map((it) => (
              <li key={it.t} className="relative">
                <span className="absolute -left-[29px] top-2 h-2.5 w-2.5 rounded-full bg-ink" />
                <p className="mono text-sm text-faint">{it.period}</p>
                <p className="mt-1 text-lg font-semibold tracking-tight">{it.t}</p>
                <p className="text-muted">{it.o}</p>
                {it.d && <p className="mt-2 max-w-[44ch] text-muted">{it.d}</p>}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export function Contact() {
  const { t } = useApp();
  const [done, setDone] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(profile.email); } catch { return; }
    setDone(true); setTimeout(() => setDone(false), 1800);
  };
  return (
    <section id="contact" className="relative border-t border-line py-28 md:py-40" aria-labelledby="contact-h">
      <div className="wrap">
        <h2 id="contact-h" className="display rv">{t.contact.title}</h2>
        <p className="lead rv mt-6" style={{ '--i': 1 } as React.CSSProperties}>{t.contact.p}</p>
        <div className="rv mt-10 flex flex-wrap gap-3" style={{ '--i': 2 } as React.CSSProperties}>
          <a className="btn btn-solid" href={`mailto:${profile.email}`}>{profile.email}</a>
          <button type="button" className="btn" onClick={copy} aria-live="polite">{done ? t.contact.copied : t.contact.copy}</button>
          <a className="btn" href={profile.linkedin} target="_blank" rel="noopener">{t.contact.linkedin}<Arrow /></a>
          <a className="btn" href={profile.github} target="_blank" rel="noopener"><GithubMark />{t.contact.github}<Arrow /></a>
          <a className="btn" href={profile.cv} download>{t.contact.cv}</a>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  const { t } = useApp();
  return (
    <footer className="border-t border-line py-10 text-sm text-faint">
      <div className="wrap flex flex-wrap justify-between gap-3"><span>© 2026 {profile.name}</span><span>{t.footer}</span></div>
    </footer>
  );
}
