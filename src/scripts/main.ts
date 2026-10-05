const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $$ = <T extends Element = HTMLElement>(sel: string, ctx: ParentNode = document) => [...ctx.querySelectorAll<T>(sel)];

/* Theme */
$$('[data-theme-toggle]').forEach((b) =>
  b.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch {}
  }),
);

/* Language switch keeps the current section */
$$<HTMLAnchorElement>('[data-lang-switch]').forEach((a) =>
  a.addEventListener('click', () => {
    const base = a.href.split('#')[0];
    if (location.hash) a.href = base + location.hash;
  }),
);

/* Mobile menu */
const menuBtn = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
const menu = document.querySelector<HTMLElement>('[data-menu]');
function setMenu(open: boolean) {
  if (!menuBtn || !menu) return;
  menu.dataset.open = String(open);
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.setAttribute('aria-label', (open ? menuBtn.dataset.labelClose : menuBtn.dataset.labelOpen) ?? '');
  menuBtn.querySelector('.menu-open')?.classList.toggle('hidden', open);
  menuBtn.querySelector('.menu-close')?.classList.toggle('hidden', !open);
}
menuBtn?.addEventListener('click', () => setMenu(menu?.dataset.open !== 'true'));
menu?.addEventListener('click', (e) => { if ((e.target as HTMLElement).closest('a')) setMenu(false); });
addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu?.dataset.open === 'true') { setMenu(false); menuBtn?.focus(); } });
matchMedia('(min-width: 768px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

/* Nav border once scrolled */
const nav = document.querySelector<HTMLElement>('[data-nav]');
const sentinel = document.getElementById('top-sentinel');
if (nav && sentinel) {
  new IntersectionObserver(([e]) => { nav.dataset.scrolled = String(!e.isIntersecting); }).observe(sentinel);
}

/* Scrollspy */
const spyLinks = $$<HTMLAnchorElement>('[data-spy]');
const sections = $$('section[id]').filter((s) => spyLinks.some((l) => l.dataset.spy === s.id));
if (sections.length) {
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        spyLinks.forEach((l) => {
          if (l.dataset.spy === e.target.id) l.setAttribute('aria-current', 'true');
          else l.removeAttribute('aria-current');
        });
      });
    },
    { rootMargin: '-45% 0px -50% 0px' },
  );
  sections.forEach((s) => spy.observe(s));
  const hero = document.getElementById('hero');
  if (hero) new IntersectionObserver(([e]) => { if (e.isIntersecting) spyLinks.forEach((l) => l.removeAttribute('aria-current')); }, { rootMargin: '-45% 0px -50% 0px' }).observe(hero);
}

/* Scroll reveal */
const reveals = $$('[data-reveal]');
if (reduce || !('IntersectionObserver' in window)) {
  reveals.forEach((el) => el.classList.add('is-in'));
} else {
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }),
    { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
  );
  reveals.forEach((el) => io.observe(el));
}

/* Project filter */
const chips = $$<HTMLButtonElement>('[data-filter]');
const projects = $$('[data-project]');
const count = document.querySelector<HTMLElement>('[data-count]');
chips.forEach((chip) =>
  chip.addEventListener('click', () => {
    const tag = chip.dataset.filter!;
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
    let shown = 0;
    projects.forEach((p) => {
      const match = tag === 'all' || (p.dataset.stack ?? '').split('|').includes(tag);
      const wasHidden = p.hidden;
      p.hidden = !match;
      if (match) {
        shown++;
        if (wasHidden && !reduce) p.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 240, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' });
      }
    });
    if (count) {
      const many = count.dataset.manyTemplate ?? '';
      count.textContent = shown === 1 ? (count.dataset.one ?? '') : many.replace(/\d+/, String(shown));
    }
  }),
);

/* Interactive architecture diagrams */
$$('[data-diagram]').forEach((fig) => {
  if (!fig.dataset.active) return;
  const nodes = $$<SVGGElement>('[data-node]', fig);
  const edges = $$<SVGPathElement>('[data-edge]', fig);
  const details = $$('[data-detail]', fig);
  const activate = (id: string) => {
    fig.dataset.active = id;
    nodes.forEach((n) => {
      const on = n.dataset.node === id;
      n.classList.toggle('is-active', on);
      n.setAttribute('aria-pressed', String(on));
    });
    edges.forEach((e) => e.classList.toggle('is-active', e.dataset.from === id || e.dataset.to === id));
    details.forEach((d) => { d.hidden = d.dataset.detail !== id; });
  };
  nodes.forEach((n) => {
    n.addEventListener('click', () => activate(n.dataset.node!));
    n.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(n.dataset.node!); }
    });
  });
});

/* Copy email */
$$<HTMLButtonElement>('[data-copy]').forEach((btn) => {
  const label = btn.querySelector<HTMLElement>('[data-copy-label]');
  const status = document.querySelector<HTMLElement>('[data-copy-status]');
  const original = label?.textContent ?? '';
  let timer: number | undefined;
  btn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(btn.dataset.copy!); } catch { return; }
    if (label) label.textContent = btn.dataset.copied ?? '';
    btn.classList.add('copy-ok');
    btn.querySelector('.copy-icon')?.classList.add('hidden');
    btn.querySelector('.check-icon')?.classList.remove('hidden');
    if (status) status.textContent = btn.dataset.copied ?? '';
    clearTimeout(timer);
    timer = window.setTimeout(() => {
      if (label) label.textContent = original;
      btn.classList.remove('copy-ok');
      btn.querySelector('.copy-icon')?.classList.remove('hidden');
      btn.querySelector('.check-icon')?.classList.add('hidden');
      if (status) status.textContent = '';
    }, 1800);
  });
});
