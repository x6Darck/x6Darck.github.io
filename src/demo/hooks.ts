import { useEffect, useState } from 'react';

export type DemoMode = 'scrub' | 'auto' | 'static';
const get = (): DemoMode => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  return reduced ? 'static' : matchMedia('(min-width: 900px)').matches ? 'scrub' : 'auto';
};
/** scrub = pinned, scroll is the timeline (desktop) · auto = short looping script when visible (phones)
 *  static = no cursor, step buttons (prefers-reduced-motion) */
export function useDemoMode(): DemoMode {
  const [m, setM] = useState<DemoMode>(get);
  useEffect(() => {
    const qs = [matchMedia('(prefers-reduced-motion: reduce)'), matchMedia('(min-width: 900px)')];
    const f = () => setM(get());
    qs.forEach((q) => q.addEventListener('change', f));
    return () => qs.forEach((q) => q.removeEventListener('change', f));
  }, []);
  return m;
}
export const sleepMs = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
export const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));
