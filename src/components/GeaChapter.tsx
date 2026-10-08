import { Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useApp } from '../lib/hooks';
import { geaRepos } from '../lib/content';
import { geaStack, tech } from '../lib/tech';
import { Laptop } from './Devices';
import { RepoLinks, TechIcon } from './ui';
import { DemoScreen, useDemoController } from '../demo/DemoScreen';
import { DemoController } from '../demo/engine';
import { StepBar } from '../demo/StepBar';
import { Expand } from '../demo/Expand';
import { geaStore } from '../demo/geaStore';
import { GeaWeb, GeaPhone, geaWebScript } from '../demo/replicas';
import { useDemoMode, nextFrame, sleepMs } from '../demo/hooks';
import type { Script } from '../demo/types';

gsap.registerPlugin(ScrollTrigger);

const roleIcon = (id: string) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-full w-full"><path d={tech[id].path} /></svg>
);

const syncScene: Script = [{
  id: 'sync', label: { es: 'Tiempo real', en: 'Real time' },
  steps: [{ t: 'wait', ms: 450 }, { t: 'screen', id: 'anuncios' }, { t: 'wait', ms: 350 }, { t: 'highlight', to: 'announcement-41', ms: 1500 }],
}];
/** shorter tour for phones */
const MOBILE_SCENES = ['eventos', 'anuncios', 'usuarios'];
/** start (timeline units) of each scene in the pinned GEA timeline; pose B (phone + API) begins just before scene 4 */
const STARTS = [0.8, 1.9, 3.0, 5.0, 6.2, 7.3, 8.4];
const TL_END = 9.8;

const Skeleton = () => <div style={{ position: 'absolute', inset: 0, background: '#f4f4f5' }} />;

export default function GeaChapter() {
  const { t, lang } = useApp();
  const g = t.gea, d = t.demo;
  const mode = useDemoMode();
  const root = useRef<HTMLElement>(null);
  const stRef = useRef<ScrollTrigger | null>(null);
  const [idx, setIdx] = useState(0);
  const [interactive, setInteractive] = useState(false);
  const [expand, setExpand] = useState(false);
  const [epochL, setEpochL] = useState(0);
  const [epochP, setEpochP] = useState(0);
  const interactiveRef = useRef(false);

  const lapScript = useMemo(() => (mode === 'auto' ? geaWebScript.filter((s) => MOBILE_SCENES.includes(s.id)) : geaWebScript), [mode]);
  const full: Script = useMemo(() => [...lapScript, ...syncScene], [lapScript]);
  const lapN = lapScript.length;

  const remountLaptop = useCallback(async () => { flushSync(() => { geaStore.reset(); setEpochL((e) => e + 1); setEpochP((e) => e + 1); }); await nextFrame(); await nextFrame(); }, []);
  const remountPhone = useCallback(async () => { flushSync(() => setEpochP((e) => e + 1)); await nextFrame(); await nextFrame(); }, []);
  const lap = useDemoController(lapScript, remountLaptop);
  const ph = useDemoController(syncScene, remountPhone);
  const ex = useMemo(() => new DemoController([]), []);

  /** drive the right controller for scene k (0..lapN = sync on the phone) */
  const go = useCallback(async (k: number, animate = true) => {
    setIdx(k);
    if (k < lapN) { if (ph.scene !== -1) void ph.reset(); await lap.goTo(k, { animate }); }
    else { await lap.goTo(lapN - 1, { animate: false }); await ph.goTo(0, { animate }); }
  }, [lap, ph, lapN]);

  /* ---------- scrub mode: pinned stage, scroll = timeline ---------- */
  useLayoutEffect(() => {
    if (mode !== 'scrub') return;
    const el = root.current!;
    const q = gsap.utils.selector(el);
    const [p1, p2] = [q('.ph1')[0], q('.ph2')[0]];
    const lapEl = q('.lap')[0], phone = q('.phone-wrap')[0], links = q('.gea-links')[0], bar = q('.gea-bar')[0];
    const stage = q('.gea-stage')[0] as HTMLElement, scene = q('.gea-scene')[0] as HTMLElement;
    const paths = q('.line-path'), dashes = q('.line-dash');
    let layoutLinks: () => void = () => {};
    const ctx = gsap.context(() => {
      // pose A: laptop as large as the free height allows, centred; computed on every refresh
      const A = () => {
        const sH = stage.clientHeight, lh = lapEl.offsetHeight || 1, lw = lapEl.offsetWidth || 1;
        const textH = sH * 0.215, avail = sH - textH - 96;
        const scale = Math.max(0.5, Math.min(1.3, avail / lh, (innerWidth * 0.9) / lw));
        const top0 = scene.offsetTop + lapEl.offsetTop;
        return { scale, y: textH + (avail - lh * scale) / 2 - top0 };
      };
      layoutLinks = () => {
        const a = A(), sB = a.scale * 0.8, lw = lapEl.offsetWidth, lh = lapEl.offsetHeight;
        const lx = lapEl.offsetLeft + lw / 2 - 0.20 * lw, ly = a.y + lapEl.offsetTop + lh * sB;
        const px = (phone as HTMLElement).offsetLeft + (phone as HTMLElement).offsetWidth / 2, py = a.y + (phone as HTMLElement).offsetTop + (phone as HTMLElement).offsetHeight;
        const cx = (lx + px) / 2, cy = Math.max(ly, py) + 78, hw = 50, ey = cy - 16;
        const svg = links.querySelector('svg')!; svg.setAttribute('viewBox', `0 0 ${scene.offsetWidth} ${scene.offsetHeight}`);
        const dl = `M ${lx} ${ly} C ${lx} ${ly + 70}, ${cx - hw - 110} ${ey}, ${cx - hw} ${ey}`, dp = `M ${px} ${py} C ${px} ${py + 70}, ${cx + hw + 110} ${ey}, ${cx + hw} ${ey}`;
        links.querySelectorAll('[data-k="l"]').forEach((n) => n.setAttribute('d', dl));
        links.querySelectorAll('[data-k="p"]').forEach((n) => n.setAttribute('d', dp));
        links.querySelectorAll('[data-m="l"]').forEach((n) => n.setAttribute('path', dl));
        links.querySelectorAll('[data-m="p"]').forEach((n) => n.setAttribute('path', dp));
        gsap.set(q('.api'), { left: cx, top: cy, xPercent: -50, yPercent: -50 });
      };
      gsap.set([p2], { autoAlpha: 0, y: 20 });
      gsap.set(lapEl, { x: 0, xPercent: 0, y: () => A().y, scale: () => A().scale * 0.94, transformOrigin: '50% 0%', opacity: 0 });
      gsap.set(phone, { autoAlpha: 0, y: () => A().y + 30, xPercent: 40 });
      gsap.set(paths, { strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.set(dashes, { autoAlpha: 0 });
      gsap.set(q('.api'), { autoAlpha: 0 });
      gsap.set(bar, { autoAlpha: 0 });

      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: { trigger: el, start: 'top top', end: () => `+=${Math.round(innerHeight * 7.6)}`, pin: true, scrub: 0.5, anticipatePin: 1, invalidateOnRefresh: true },
      });
      tl.to(lapEl, { opacity: 1, scale: () => A().scale, duration: 0.7 }, 0)
        .to(bar, { autoAlpha: 1, duration: 0.5 }, 0.4)
        // pose B: laptop slides left, phone + API appear, connection lines draw
        .to(p1, { autoAlpha: 0, y: -20, duration: 0.5 }, 4.3)
        .to(lapEl, { xPercent: -20, scale: () => A().scale * 0.8, duration: 0.9 }, 4.2)
        .to(p2, { autoAlpha: 1, y: 0, duration: 0.6 }, 4.7)
        .to(phone, { autoAlpha: 1, xPercent: 0, y: () => A().y, duration: 0.8 }, 4.4)
        .to(q('.api'), { autoAlpha: 1, duration: 0.5 }, 4.7)
        .to(paths, { strokeDashoffset: 0, duration: 0.7, ease: 'power1.inOut' }, 4.8)
        .to(dashes, { autoAlpha: 1, duration: 0.3 }, 5.4)
        .to({}, { duration: TL_END - tl.duration() }, tl.duration());
      stRef.current = tl.scrollTrigger as ScrollTrigger;
      layoutLinks(); ScrollTrigger.addEventListener('refresh', layoutLinks);

      let cur = -2, timer = 0;
      tl.eventCallback('onUpdate', () => {
        const tt = tl.time(); let k = -1;
        for (let i = 0; i < STARTS.length; i++) if (tt >= STARTS[i]) k = i;
        if (k === cur) return; cur = k;
        window.clearTimeout(timer);
        timer = window.setTimeout(() => { if (!interactiveRef.current) { if (k < 0) { setIdx(0); void lap.reset(); void ph.reset(); } else void go(k); } }, 130);
      });
    }, el);
    return () => { ScrollTrigger.removeEventListener('refresh', layoutLinks); ctx.revert(); stRef.current = null; lap.cancel(); ph.cancel(); };
  }, [mode, lap, ph, go]);

  /* ---------- auto mode (phones): short loop while visible ---------- */
  const hostRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (mode !== 'auto' || interactive || expand) return;
    let alive = true, vis = false, running = false;
    const loop = async () => {
      running = true;
      while (alive && vis) {
        for (let k = 0; k <= lapN && alive && vis; k++) await go(k);
        if (!alive || !vis) break;
        await sleepMs(2600);
        if (!alive || !vis) break;
        setIdx(0); await lap.reset(); await ph.reset();
      }
      running = false;
    };
    const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; if (vis && !running) void loop(); else if (!vis) { lap.cancel(); ph.cancel(); } }, { threshold: 0.4 });
    io.observe(hostRef.current!);
    return () => { alive = false; io.disconnect(); lap.cancel(); ph.cancel(); };
  }, [mode, interactive, expand, go, lap, ph, lapN]);

  /* ---------- interactive ("Pruébalo tú") ---------- */
  const toggleInteractive = () => {
    if (!interactive) {
      lap.cancel(); ph.cancel(); interactiveRef.current = true;
      flushSync(() => { geaStore.reset(); setInteractive(true); setEpochL((e) => e + 1); setEpochP((e) => e + 1); });
      const st = stRef.current;   // pinned: bring the phone into view so approvals can be watched
      if (mode === 'scrub' && st) window.scrollTo({ top: st.start + ((5.6 / TL_END) * (st.end - st.start)), behavior: 'smooth' });
    } else {
      interactiveRef.current = false;
      flushSync(() => { geaStore.reset(); setInteractive(false); setEpochL((e) => e + 1); setEpochP((e) => e + 1); });
      lap.scene = -1; lap.clean = true; ph.scene = -1; ph.clean = true;
      if (mode === 'static') void go(idx, false); else if (mode === 'scrub') void go(Math.max(0, idx));
    }
  };
  const resetInteractive = () => { geaStore.reset(); setEpochL((e) => e + 1); setEpochP((e) => e + 1); };
  const jump = (k: number) => {
    if (k < 0 || k >= full.length) return;
    if (mode === 'scrub') { const st = stRef.current; if (st) window.scrollTo({ top: st.start + (((STARTS[k] + 0.1) / TL_END) * (st.end - st.start)), behavior: 'smooth' }); }
    else void go(k, mode !== 'static');
  };
  useEffect(() => { if (mode === 'static' && !interactive) void go(0, false); }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const phoneStart = 'anuncios' as const;
  const lapEl = (
    <Laptop className="demo-laptop">
      <DemoScreen ctl={lap} w={1280} h={720} epoch={epochL} interactive={interactive} label="GEA web">
        <Suspense fallback={<Skeleton />}><GeaWeb startScreen={interactive || mode === 'auto' ? 'calendario' : 'login'} /></Suspense>
      </DemoScreen>
    </Laptop>
  );
  const phoneEl = (
    <div className="phone demo-phone">
      <span className="phone-island" />
      <div className="phone-screen">
        <DemoScreen ctl={ph} w={390} h={844} epoch={epochP} interactive={interactive} label="GEA móvil">
          <Suspense fallback={<Skeleton />}><GeaPhone startTab={phoneStart} liveSync /></Suspense>
        </DemoScreen>
      </div>
    </div>
  );

  return (
    <section id="gea" ref={(el) => { root.current = el; }} className="chapter gea ch-dark" aria-labelledby="gea-h">
      <div className="gea-stage">
        <div className="wrap gea-text text-center">
          <div className="gea-ph ph1 py-14 md:py-0">
            <h2 id="gea-h" className="title mx-auto max-w-[22ch] md:!max-w-none md:!text-[clamp(1.6rem,3.1vw,2.8rem)]">{g.ph1.t}</h2>
            <p className="lead mx-auto mt-3 !text-[1rem] md:!max-w-[100ch] md:!text-[1.0625rem]">{g.ph1.s}</p>
          </div>
          <div className="gea-ph ph2 pb-8 md:pb-0">
            <h3 className="title mx-auto max-w-[22ch] md:!max-w-none md:!text-[clamp(1.6rem,3.1vw,2.8rem)]">{g.ph2.t}</h3>
            <p className="lead mx-auto mt-3 !text-[1rem] md:!max-w-[100ch] md:!text-[1.0625rem]">{g.ph2.s}</p>
          </div>
        </div>

        <div className="gea-scene wrap md:!max-w-none md:!px-0" ref={hostRef}>
          <div className="gea-links" aria-hidden="true">
            <svg className="lines" preserveAspectRatio="none">
              <path className="line-path" data-k="l" pathLength="1" d="" />
              <path className="line-path" data-k="p" pathLength="1" d="" />
              {(['l', 'p'] as const).map((k) => [0, 1.2].map((b) => (
                <circle key={k + b} className="line-dash line-dot" r="3.5"><animateMotion data-m={k} dur="2.6s" begin={`${b}s`} repeatCount="indefinite" path="M0 0" /></circle>
              )))}
            </svg>
            <div className="api">
              <svg className="srv" viewBox="0 0 64 64" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="6" y="6" width="52" height="16" rx="5" /><rect x="6" y="24" width="52" height="16" rx="5" /><rect x="6" y="42" width="52" height="16" rx="5" />
                <path d="M14 14h12M14 32h12M14 50h12" opacity=".55" />
                <circle cx="48" cy="14" r="2" fill="currentColor" /><circle cx="48" cy="32" r="2" fill="currentColor" /><circle cx="48" cy="50" r="2" fill="currentColor" />
              </svg>
              <span className="apilabel">{g.api}</span>
            </div>
          </div>
          <div className="lap">{lapEl}</div>
          <div className="phone-wrap">{phoneEl}</div>
        </div>

        <div className="gea-bar wrap">
          <StepBar script={full} lang={lang} current={idx} onJump={jump} tx={d} interactive={interactive} onToggleInteractive={toggleInteractive} onReset={resetInteractive} staticMode={mode === 'static'} />
          {mode === 'auto' && !interactive && <button type="button" className="stepbar-btn mt-2" onClick={() => setExpand(true)}>{d.expand}</button>}
        </div>
      </div>

      <Expand open={expand} onClose={() => setExpand(false)} w={900} closeLabel="×" title="GEA">
        <div className="p-3"><Laptop className="demo-laptop"><DemoScreen ctl={ex} w={1280} h={720} epoch={0} interactive label="GEA web"><Suspense fallback={<Skeleton />}><GeaWeb startScreen="calendario" /></Suspense></DemoScreen></Laptop></div>
      </Expand>

      <div className="wrap pt-10">
        <details className="demo-notes">
          <summary>{g.demoTitle}</summary>
          <ol>{g.demoList.map((x) => <li key={x}>{x}</li>)}</ol>
          <p>{g.demoNote}</p>
        </details>
      </div>

      <div className="wrap pb-28 pt-24 md:pt-40">
        <div className="rv max-w-3xl">
          <h3 className="title">{g.backTitle}</h3>
          <p className="lead mt-3">{g.backSub}</p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-6">
          {g.cards.map((c, i) => {
            const span = ['md:col-span-4', 'md:col-span-2', 'md:col-span-2', 'md:col-span-4'][i];
            return (
              <article key={c.id} className={`card rv ${span}`} style={{ '--i': i } as React.CSSProperties}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-xl font-semibold tracking-tight">{c.t}</h4>
                    <p className="mt-2 max-w-[40ch] text-muted">{c.b}</p>
                  </div>
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-line p-3.5 text-accent">{roleIcon(c.id === 'jwt' ? 'jwt' : c.id === 'envers' ? 'hibernate' : c.id === 'swagger' ? 'swagger' : 'docker')}</span>
                </div>
                {c.id === 'jwt' && <div className="mt-6 flex flex-wrap gap-2">{g.roles.map((r) => <span key={r} className="chip">{r}</span>)}</div>}
              </article>
            );
          })}
        </div>
        <div className="rv mt-12 flex flex-wrap items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-3" aria-label="Stack">
            {geaStack.map((s, i) => <TechIcon key={s} id={s} i={i} />)}
          </div>
          <RepoLinks repos={geaRepos} label={t.ui.repos} />
        </div>
      </div>
    </section>
  );
}
