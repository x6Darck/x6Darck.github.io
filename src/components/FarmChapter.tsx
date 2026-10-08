import { Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useApp } from '../lib/hooks';
import { farmRepos } from '../lib/content';
import { farmStack } from '../lib/tech';
import { DesktopWindow } from './Devices';
import { RepoLinks, TechIcon } from './ui';
import { DemoScreen, useDemoController } from '../demo/DemoScreen';
import { DemoController } from '../demo/engine';
import { StepBar } from '../demo/StepBar';
import { Expand } from '../demo/Expand';
import { FarmWin, farmScript } from '../demo/replicas';
import { useDemoMode, nextFrame, sleepMs } from '../demo/hooks';

gsap.registerPlugin(ScrollTrigger);

const S = ({ children }: { children: React.ReactNode }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-full w-full" aria-hidden="true">{children}</svg>;
const icons: Record<string, React.ReactNode> = {
  qr: <S><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3M21 14v.01M14 21h3M21 17v4M17 17v.01" /></S>,
  pdf: <S><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></S>,
  mail: <S><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></S>,
  tests: <S><path d="M9 3h6M10 3v6L5 19a1.5 1.5 0 0 0 1.3 2h11.4a1.5 1.5 0 0 0 1.3-2l-5-10V3" /><path d="M8 15h8" /></S>,
};

const MOBILE_SCENES = ['qr', 'prestamo', 'offline'];
const Skeleton = () => <div style={{ position: 'absolute', inset: 0, background: '#f6f7f4' }} />;

export default function FarmChapter() {
  const { t, lang } = useApp();
  const f = t.farm, d = t.demo;
  const mode = useDemoMode();
  const root = useRef<HTMLElement>(null);
  const stRef = useRef<ScrollTrigger | null>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const [interactive, setInteractive] = useState(false);
  const [expand, setExpand] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const interactiveRef = useRef(false);

  const script = useMemo(() => (mode === 'auto' ? farmScript.filter((s) => MOBILE_SCENES.includes(s.id)) : farmScript), [mode]);
  const n = script.length;
  const remount = useCallback(async () => { flushSync(() => setEpoch((e) => e + 1)); await nextFrame(); await nextFrame(); }, []);
  const ctl = useDemoController(script, remount);
  const ex = useMemo(() => new DemoController([]), []);

  const go = useCallback(async (k: number, animate = true) => { setIdx(k); await ctl.goTo(k, { animate }); }, [ctl]);

  /* scrub: pinned stage, scroll = timeline */
  useLayoutEffect(() => {
    if (mode !== 'scrub') return;
    const el = root.current!;
    let cur = -2, timer = 0;
    const ctx = gsap.context(() => {
      const st = ScrollTrigger.create({
        trigger: el.querySelector('.farm-stage'), start: 'top top', end: () => `+=${Math.round(innerHeight * (n * 0.95 + 0.4))}`, pin: true, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: (self) => {
          const p = self.progress, k = p < 0.03 ? -1 : Math.min(n - 1, Math.floor(((p - 0.03) / 0.97) * n));
          if (k === cur) return; cur = k;
          window.clearTimeout(timer);
          timer = window.setTimeout(() => { if (interactiveRef.current) return; if (k < 0) { setIdx(0); void ctl.reset(); } else void go(k); }, 130);
        },
      });
      stRef.current = st;
    }, el);
    return () => { ctx.revert(); stRef.current = null; ctl.cancel(); };
  }, [mode, ctl, go, n]);

  /* auto (phones): short loop while visible */
  useEffect(() => {
    if (mode !== 'auto' || interactive || expand) return;
    let alive = true, vis = false, running = false;
    const loop = async () => {
      running = true;
      while (alive && vis) {
        for (let k = 0; k < n && alive && vis; k++) await go(k);
        if (!alive || !vis) break;
        await sleepMs(2600);
        if (!alive || !vis) break;
        setIdx(0); await ctl.reset();
      }
      running = false;
    };
    const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; if (vis && !running) void loop(); else if (!vis) ctl.cancel(); }, { threshold: 0.4 });
    io.observe(hostRef.current!);
    return () => { alive = false; io.disconnect(); ctl.cancel(); };
  }, [mode, interactive, expand, go, ctl, n]);

  const toggleInteractive = () => {
    if (!interactive) {
      ctl.cancel(); interactiveRef.current = true;
      flushSync(() => { setInteractive(true); setEpoch((e) => e + 1); });
    } else {
      interactiveRef.current = false;
      flushSync(() => { setInteractive(false); setEpoch((e) => e + 1); });
      ctl.scene = -1; ctl.clean = true;
      if (mode === 'static') void go(idx, false); else if (mode === 'scrub') void go(Math.max(0, idx));
    }
  };
  const resetInteractive = () => setEpoch((e) => e + 1);
  const jump = (k: number) => {
    if (k < 0 || k >= n) return;
    if (mode === 'scrub') { const st = stRef.current; if (st) window.scrollTo({ top: st.start + ((0.03 + ((k + 0.15) / n) * 0.97) * (st.end - st.start)), behavior: 'smooth' }); }
    else void go(k, mode !== 'static');
  };
  useEffect(() => { if (mode === 'static' && !interactive) void go(0, false); }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section id="farmstock" ref={(el) => { root.current = el; }} className="chapter farm ch-light" aria-labelledby="farm-h">
      <div className="farm-glow pointer-events-none absolute -right-40 top-20 h-[420px] w-[420px] rounded-full opacity-60 blur-3xl" style={{ background: 'rgb(47 143 85 / 0.18)' }} aria-hidden="true" />
      <div className="farm-stage">
        <div className="wrap farm-head relative text-center">
          <p className="mono farm-year text-sm text-faint">{f.year}</p>
          <h2 id="farm-h" className="display farm-title">{f.title}</h2>
          <p className="lead farm-sub mx-auto">{f.sub}</p>
        </div>
        <div className="farm-win" ref={hostRef}>
          <DesktopWindow title="FarmStock">
            <DemoScreen ctl={ctl} w={1120} h={700} epoch={epoch} interactive={interactive} label="FarmStock">
              <Suspense fallback={<Skeleton />}><FarmWin /></Suspense>
            </DemoScreen>
          </DesktopWindow>
        </div>
        <div className="farm-bar wrap">
          <StepBar script={script} lang={lang} current={idx} onJump={jump} tx={d} interactive={interactive} onToggleInteractive={toggleInteractive} onReset={resetInteractive} staticMode={mode === 'static'} accent="#2f8f55" />
          {mode === 'auto' && !interactive && <button type="button" className="stepbar-btn mt-2" onClick={() => setExpand(true)}>{d.expand}</button>}
        </div>
      </div>

      <Expand open={expand} onClose={() => setExpand(false)} w={940} closeLabel="×" title="FarmStock">
        <div className="p-3"><DesktopWindow title="FarmStock"><DemoScreen ctl={ex} w={1120} h={700} epoch={0} interactive label="FarmStock"><Suspense fallback={<Skeleton />}><FarmWin /></Suspense></DemoScreen></DesktopWindow></div>
      </Expand>

      <div className="wrap relative pb-28">
        <details className="demo-notes mt-10">
          <summary>{f.demoTitle}</summary>
          <ol>{f.demoList.map((x) => <li key={x}>{x}</li>)}</ol>
          <p>{f.sim}</p>
        </details>

        <div className="mt-28">
          <h3 className="title rv max-w-xl">{f.cardsTitle}</h3>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {f.cards.map((c, i) => (
              <article key={c.id} className="card rv" style={{ '--i': i } as React.CSSProperties}>
                <span className="block h-11 w-11 text-accent">{icons[c.id]}</span>
                <h4 className="mt-6 text-lg font-semibold tracking-tight">{c.t}</h4>
                <p className="mt-2 text-muted">{c.b}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="rv mt-12 flex flex-wrap items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-3" aria-label="Stack">{farmStack.map((s, i) => <TechIcon key={s} id={s} i={i} />)}</div>
          <RepoLinks repos={farmRepos} label={t.ui.repos} />
        </div>
      </div>
    </section>
  );
}
