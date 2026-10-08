import { useState, type CSSProperties } from 'react';
import { tech } from '../lib/tech';

export function Img({ src, alt, className = '', eager = false, width = 1600, height = 900 }: { src: string; alt: string; className?: string; eager?: boolean; width?: number; height?: number }) {
  const [ok, setOk] = useState(false);
  return <img src={src} alt={alt} width={width} height={height} loading={eager ? 'eager' : 'lazy'} decoding="async" onLoad={() => setOk(true)} ref={(el) => { if (el?.complete) setOk(true); }} className={`fade-img ${ok ? 'is-loaded' : ''} ${className}`} />;
}

const lum = (hex: string) => { const n = parseInt(hex, 16); const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255; return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255; };

export function TechIcon({ id, i = 0 }: { id: string; i?: number }) {
  const x = tech[id];
  return (
    <span className="tech tech-in" tabIndex={0} role="img" aria-label={x.name} data-tip={x.name} data-dark={lum(x.hex) < 0.28} style={{ '--brand': `#${x.hex}`, '--i': i } as CSSProperties}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d={x.path} /></svg>
    </span>
  );
}

export const Arrow = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9" /></svg>;
export const GithubMark = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={tech.github.path} /></svg>;

export function RepoLinks({ repos, label }: { repos: { label: string; href: string }[]; label: string }) {
  return (
    <div className="flex flex-wrap items-center gap-3" role="group" aria-label={label}>
      {repos.map((r) => (
        <a key={r.label} className="btn mono !text-[0.8125rem]" href={r.href} target="_blank" rel="noopener"><GithubMark />{r.label}<Arrow /></a>
      ))}
    </div>
  );
}
