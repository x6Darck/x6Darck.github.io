import type { Script } from './types';

export interface StepBarText { prev: string; next: string; tryIt: string; backToTour: string; reset: string; step: string; dots: string }

export function StepBar({ script, lang, current, onJump, tx, interactive, onToggleInteractive, onReset, staticMode, accent }: {
  script: Script; lang: 'es' | 'en'; current: number; onJump: (i: number) => void; tx: StepBarText;
  interactive: boolean; onToggleInteractive: () => void; onReset: () => void; staticMode: boolean; accent?: string;
}) {
  const n = script.length, i = Math.max(0, current), cur = script[i];
  return (
    <div className="stepbar" style={accent ? ({ '--accent': accent } as React.CSSProperties) : undefined}>
      {!interactive && (
        <>
          {staticMode && <button type="button" className="stepbar-btn" onClick={() => onJump(i - 1)} disabled={i <= 0}>{tx.prev}</button>}
          <div className="stepbar-dots" role="group" aria-label={tx.dots}>
            {script.map((s, k) => <button key={s.id} type="button" className="stepbar-dot" aria-current={k === i} aria-label={`${tx.step} ${k + 1}: ${s.label[lang]}`} onClick={() => onJump(k)} />)}
          </div>
          <p className="stepbar-label" aria-live="polite">{cur?.label[lang]}<small>{String(i + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</small></p>
          {staticMode && <button type="button" className="stepbar-btn" onClick={() => onJump(i + 1)} disabled={i >= n - 1}>{tx.next}</button>}
        </>
      )}
      <div className="stepbar-actions">
        {interactive && <button type="button" className="stepbar-btn" onClick={onReset}>{tx.reset}</button>}
        <button type="button" className="stepbar-btn" data-primary={interactive ? '0' : '1'} onClick={onToggleInteractive}>{interactive ? tx.backToTour : tx.tryIt}</button>
      </div>
    </div>
  );
}
