import { useEffect, useLayoutEffect, useMemo, useRef, type ReactNode } from 'react';
import { DemoController } from './engine';
import type { Script } from './types';
import './engine.css';

export function useDemoController(script: Script, remount: () => Promise<void> | void) {
  const ctl = useMemo(() => new DemoController(script), [script]);
  ctl.remount = remount;
  useEffect(() => () => ctl.dispose(), [ctl]);
  return ctl;
}

const Arrow = () => (
  <svg viewBox="0 0 26 26" aria-hidden="true"><path d="M3 2v18l5-4.5 3.4 7.6 3.3-1.5-3.4-7.4 7-.4L3 2z" fill="#fff" stroke="#111" strokeWidth="1.6" strokeLinejoin="round" /></svg>
);

/** Renders a replica at its design size, scales it to the parent width and overlays the animated cursor.
 *  `epoch` remounts the replica (reset). While not interactive the replica is inert (visual only). */
export function DemoScreen({ ctl, w, h, epoch, interactive, children, label }: { ctl: DemoController; w: number; h: number; epoch: number; interactive: boolean; children: ReactNode; label: string }) {
  const fit = useRef<HTMLDivElement>(null), box = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const f = fit.current!, b = box.current!;
    const apply = () => { b.style.transform = `scale(${f.clientWidth / w})`; };
    apply(); ctl.attach(b);
    const ro = new ResizeObserver(apply); ro.observe(f);
    return () => { ro.disconnect(); ctl.attach(null); };
  }, [ctl, w]);
  return (
    <div ref={fit} className="demo-fit" style={{ aspectRatio: `${w} / ${h}` }} data-interactive={interactive ? '1' : '0'}
      onPointerEnter={(e) => { if (e.pointerType === 'mouse') ctl.paused = !interactive; }} onPointerLeave={() => { ctl.paused = false; }}>
      <div ref={box} className="demo-box" style={{ width: w, height: h }}>
        <div className="demo-replica" key={epoch} role={interactive ? 'application' : undefined} aria-label={interactive ? label : undefined} aria-hidden={interactive ? undefined : true} inert={!interactive}>{children}</div>
        <div className="demo-layer" aria-hidden="true"><div className="demo-ring" /><div className="demo-cursor" data-shown="0"><Arrow /></div></div>
      </div>
    </div>
  );
}
