import type { Script, Step } from './types';

class Cancelled extends Error {}
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const frame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

/** cubic-bezier(x1,y1,x2,y2) solver (same maths as CSS timing functions). */
function bezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sy = (t: number) => ((ay * t + by) * t + cy) * t;
  const dx = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number) => {
    let t = x;
    for (let i = 0; i < 8; i++) { const e = sx(t) - x; if (Math.abs(e) < 1e-4) break; const d = dx(t); if (Math.abs(d) < 1e-6) break; t -= e / d; }
    return sy(Math.min(1, Math.max(0, t)));
  };
}
// Slight acceleration out of the start, long deceleration into the target.
const easeMove = bezier(0.42, 0, 0.12, 1);
const easeScroll = bezier(0.65, 0, 0.35, 1);

const inputSetter = (el: HTMLElement) => {
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : el instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
  return Object.getOwnPropertyDescriptor(proto, 'value')!.set!;
};

export type SceneListener = (scene: number, playing: boolean) => void;

/** Runs a Script against a replica rendered inside `box` (design-size coordinate space).
 *  Clicks are REAL (element.click()) so the replica reacts exactly as it does for a visitor. */
export class DemoController {
  box: HTMLElement | null = null;
  remount: () => Promise<void> | void = () => {};
  paused = false;
  /** index of the scene started last (-1 = pristine) and whether it ran to the end */
  scene = -1;
  clean = true;
  private gen = 0;
  private cx = 0; private cy = 0; private bounce = 1;
  private listeners = new Set<SceneListener>();
  constructor(public script: Script) {}

  attach(box: HTMLElement | null) { this.box = box; if (box) this.parkCursor(); }
  on(f: SceneListener) { this.listeners.add(f); return () => { this.listeners.delete(f); }; }
  private emit(playing: boolean) { this.listeners.forEach((f) => f(this.scene, playing)); }

  private get layer() { return this.box?.querySelector<HTMLElement>('.demo-layer') ?? null; }
  private get cursor() { return this.box?.querySelector<HTMLElement>('.demo-cursor') ?? null; }
  private get ring() { return this.box?.querySelector<HTMLElement>('.demo-ring') ?? null; }
  private scale() { return this.box ? this.box.getBoundingClientRect().width / (this.box.offsetWidth || 1) : 1; }

  private place(x: number, y: number) {
    this.cx = x; this.cy = y;
    const c = this.cursor; if (c) c.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }
  private parkCursor() {
    if (!this.box) return;
    this.place(this.box.offsetWidth * 0.86, this.box.offsetHeight * 0.92);
    this.cursor?.setAttribute('data-shown', '0');
  }
  setCursorVisible(v: boolean) { this.cursor?.setAttribute('data-shown', v ? '1' : '0'); }

  private el(target: string): HTMLElement | null {
    const root = this.box?.querySelector('.demo-replica'); if (!root) return null;
    const sel = /^[.#\[]/.test(target) ? target : `[data-demo="${target}"]`;
    return root.querySelector<HTMLElement>(sel);
  }
  private async waitEl(target: string, g: number): Promise<HTMLElement | null> {
    const t0 = performance.now();
    for (;;) {
      this.check(g);
      const e = this.el(target);
      if (e && e.getClientRects().length) return e;
      if (performance.now() - t0 > 1500) { console.warn('[demo] target not found:', target); return null; }
      await sleep(30);
    }
  }
  private check(g: number) { if (g !== this.gen) throw new Cancelled(); }
  /** sleep that honours pause (hover) and cancellation */
  private async hold(ms: number, g: number) {
    let left = ms;
    while (left > 0) { this.check(g); if (this.paused) { await sleep(60); continue; } const s = Math.min(left, 40); await sleep(s); left -= s; }
    this.check(g);
  }
  private centre(e: HTMLElement) {
    const b = this.box!.getBoundingClientRect(), r = e.getBoundingClientRect(), s = this.scale();
    return { x: (r.left - b.left + r.width * 0.5) / s, y: (r.top - b.top + r.height * 0.5) / s, w: r.width / s, h: r.height / s, l: (r.left - b.left) / s, t: (r.top - b.top) / s };
  }

  private async moveTo(e: HTMLElement, g: number, instant: boolean, ms?: number) {
    const to = this.centre(e);
    // aim slightly into the element rather than dead centre, so it reads as a human pointer
    const tx = to.x + Math.max(-14, Math.min(14, to.w * 0.08)), ty = to.y;
    if (instant) { this.place(tx, ty); this.setCursorVisible(true); return; }
    this.setCursorVisible(true);
    const x0 = this.cx, y0 = this.cy, dx = tx - x0, dy = ty - y0, dist = Math.hypot(dx, dy);
    if (dist < 2) return;
    const dur = ms ?? Math.max(380, Math.min(1150, 340 + dist * 0.85));
    // curved path: a quadratic Bézier whose control point is pushed sideways of the straight line
    this.bounce = -this.bounce;
    const off = Math.min(90, dist * 0.22) * this.bounce;
    const nx = -dy / dist, ny = dx / dist;
    const mx = x0 + dx * 0.5 + nx * off, my = y0 + dy * 0.5 + ny * off;
    let elapsed = 0, last = performance.now();
    for (;;) {
      await frame(); this.check(g);
      const now = performance.now();
      if (this.paused) { last = now; continue; }
      elapsed += now - last; last = now;
      const p = Math.min(1, elapsed / dur), k = easeMove(p), u = 1 - k;
      this.place(u * u * x0 + 2 * u * k * mx + k * k * tx, u * u * y0 + 2 * u * k * my + k * k * ty);
      if (p >= 1) break;
    }
  }

  private async press(e: HTMLElement, g: number, instant: boolean) {
    if (!instant) {
      const c = this.cursor, r = this.ring;
      c?.setAttribute('data-press', '1');
      e.setAttribute('data-demo-pressed', '');
      if (r) { r.style.transform = `translate3d(${this.cx}px, ${this.cy}px, 0)`; r.animate([{ opacity: 0.55, transform: `translate3d(${this.cx}px, ${this.cy}px, 0) scale(0.35)` }, { opacity: 0, transform: `translate3d(${this.cx}px, ${this.cy}px, 0) scale(1.6)` }], { duration: 520, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }); }
      await this.hold(150, g);
      c?.removeAttribute('data-press');
    }
    if (e instanceof HTMLInputElement || e instanceof HTMLTextAreaElement || e instanceof HTMLSelectElement) e.focus({ preventScroll: true });
    e.click();
    e.removeAttribute('data-demo-pressed');
    if (!instant) await this.hold(140, g);
  }

  private async typeInto(e: HTMLElement, text: string, g: number, instant: boolean, cps = 24) {
    const set = inputSetter(e);
    const push = (v: string) => { set.call(e, v); e.dispatchEvent(new Event('input', { bubbles: true })); };
    const base = (e as HTMLInputElement).value ?? '';
    if (instant) { push(base + text); return; }
    for (let i = 1; i <= text.length; i++) {
      push(base + text.slice(0, i));
      await this.hold((1000 / cps) * (0.7 + ((i * 37) % 7) / 10), g);
    }
  }

  private async highlight(targets: string[], ms: number, g: number) {
    const layer = this.layer; if (!layer) return;
    const made: HTMLElement[] = [];
    for (const t of targets) {
      const e = await this.waitEl(t, g); if (!e) continue;
      const c = this.centre(e), pad = 5;
      const d = document.createElement('div'); d.className = 'demo-hl';
      Object.assign(d.style, { left: `${c.l - pad}px`, top: `${c.t - pad}px`, width: `${c.w + pad * 2}px`, height: `${c.h + pad * 2}px` });
      layer.appendChild(d); made.push(d);
      d.animate([{ opacity: 0, transform: 'scale(1.03)' }, { opacity: 1, transform: 'scale(1)', offset: 0.25 }, { opacity: 1, transform: 'scale(1)', offset: 0.75 }, { opacity: 0, transform: 'scale(1)' }], { duration: ms, easing: 'cubic-bezier(0.23, 1, 0.32, 1)', fill: 'forwards' });
    }
    try { await this.hold(ms, g); } finally { made.forEach((d) => d.remove()); }
  }

  private async scrollBy(e: HTMLElement, by: number, ms: number, g: number, instant: boolean) {
    const from = e.scrollTop, to = from + by;
    if (instant) { e.scrollTop = to; return; }
    let elapsed = 0, last = performance.now();
    for (;;) {
      await frame(); this.check(g);
      const now = performance.now(); if (this.paused) { last = now; continue; }
      elapsed += now - last; last = now;
      const p = Math.min(1, elapsed / ms);
      e.scrollTop = from + (to - from) * easeScroll(p);
      if (p >= 1) break;
    }
  }

  private async runStep(st: Step, g: number, instant: boolean) {
    switch (st.t) {
      case 'wait': if (!instant) await this.hold(st.ms, g); else await sleep(16); return;
      case 'move': { const e = await this.waitEl(st.to, g); if (e) await this.moveTo(e, g, instant, st.ms); return; }
      case 'click': { const e = await this.waitEl(st.to, g); if (!e) return; await this.moveTo(e, g, instant); await this.press(e, g, instant); return; }
      case 'screen': { const e = await this.waitEl(`nav-${st.id}`, g); if (!e) return; await this.moveTo(e, g, instant); await this.press(e, g, instant); return; }
      case 'type': { const e = await this.waitEl(st.to, g); if (!e) return; await this.moveTo(e, g, instant); await this.press(e, g, instant); await this.typeInto(e, st.text, g, instant, st.cps); return; }
      case 'select': {
        const e = await this.waitEl(st.to, g); if (!e) return;
        await this.moveTo(e, g, instant); await this.press(e, g, instant);
        inputSetter(e).call(e, st.value); e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true }));
        if (!instant) await this.hold(220, g);
        return;
      }
      case 'highlight': if (!instant) await this.highlight(Array.isArray(st.to) ? st.to : [st.to], st.ms ?? 900, g); return;
      case 'scroll': { const e = await this.waitEl(st.to, g); if (e) await this.scrollBy(e, st.by, st.ms ?? 900, g, instant); return; }
    }
  }

  private async runScene(i: number, g: number, instant: boolean) {
    for (const st of this.script[i].steps) {
      await this.runStep(st, g, instant);
      await sleep(instant ? 20 : 0);
    }
  }

  private async settle(g: number) {
    // wait until the (possibly lazy / freshly remounted) replica is in the DOM
    const t0 = performance.now();
    while (!this.box?.querySelector('.demo-replica [data-demo]')) { this.check(g); if (performance.now() - t0 > 4000) break; await sleep(30); }
    await sleep(90);
  }

  /** Go to scene i (-1 = pristine). Adjacent forward: just play. Anything else: remount, fast-forward, play. */
  private chain: Promise<void> = Promise.resolve();
  private token = 0;
  /** Serialised: a newer request cancels the running one and supersedes any request still queued. */
  goTo(i: number, opts: { animate?: boolean; force?: boolean } = {}): Promise<void> {
    const mine = ++this.token;
    this.gen++; // cancel whatever is running right now
    const run = async () => { if (mine !== this.token) return; await this.run(i, opts); };
    this.chain = this.chain.then(run, run);
    return this.chain;
  }

  private async run(i: number, opts: { animate?: boolean; force?: boolean } = {}) {
    const animate = opts.animate ?? true;
    if (i === this.scene && !opts.force) return;
    const g = ++this.gen;
    try {
      this.emit(true);
      const adjacent = i === this.scene + 1 && this.clean;
      if (!adjacent) {
        this.clean = false;
        await this.remount(); await this.settle(g); this.parkCursor();
        for (let k = 0; k < i; k++) { await this.runScene(k, g, true); }
        this.scene = i - 1; this.clean = true;
      }
      if (i >= 0) {
        this.scene = i; this.clean = false; this.emit(true);
        await this.runScene(i, g, !animate);
        this.clean = true;
      } else { this.scene = -1; this.clean = true; }
      this.emit(false);
    } catch (e) { if (!(e instanceof Cancelled)) throw e; }
  }

  reset() { return this.goTo(-1, { force: true }); }

  /** Stop whatever is running (e.g. when the visitor takes over). */
  cancel() { this.token++; this.gen++; this.clean = false; this.cursor?.removeAttribute('data-press'); this.layer?.querySelectorAll('.demo-hl').forEach((n) => n.remove()); }
  dispose() { this.cancel(); this.listeners.clear(); }
}
