type Box = { x: number; y: number; w: number; h: number };
type Layout = { w: number; h: number; nodes: Record<string, Box> };
export type Edge = { from: string; to: string; dashed?: boolean };
export type DiagramDef = { nodes: string[]; edges: Edge[]; wide: Layout; tall: Layout; local?: string };

export const diagrams: Record<string, DiagramDef> = {
  gea: {
    nodes: ['react', 'flutter', 'api', 'db'],
    edges: [
      { from: 'react', to: 'api' },
      { from: 'flutter', to: 'api' },
      { from: 'api', to: 'db' },
    ],
    wide: {
      w: 640,
      h: 320,
      nodes: {
        react: { x: 8, y: 36, w: 168, h: 64 },
        flutter: { x: 8, y: 220, w: 168, h: 64 },
        api: { x: 240, y: 128, w: 176, h: 64 },
        db: { x: 480, y: 128, w: 152, h: 64 },
      },
    },
    tall: {
      w: 320,
      h: 420,
      nodes: {
        react: { x: 8, y: 8, w: 144, h: 64 },
        flutter: { x: 168, y: 8, w: 144, h: 64 },
        api: { x: 72, y: 168, w: 176, h: 64 },
        db: { x: 88, y: 340, w: 144, h: 64 },
      },
    },
  },
  farmstock: {
    nodes: ['electron', 'local', 'api', 'db'],
    edges: [
      { from: 'electron', to: 'api' },
      { from: 'electron', to: 'local', dashed: true },
      { from: 'api', to: 'db' },
    ],
    local: 'local',
    wide: {
      w: 640,
      h: 320,
      nodes: {
        electron: { x: 8, y: 64, w: 168, h: 64 },
        local: { x: 8, y: 216, w: 168, h: 64 },
        api: { x: 240, y: 64, w: 176, h: 64 },
        db: { x: 480, y: 64, w: 152, h: 64 },
      },
    },
    tall: {
      w: 320,
      h: 420,
      nodes: {
        electron: { x: 8, y: 8, w: 144, h: 64 },
        local: { x: 168, y: 8, w: 144, h: 64 },
        api: { x: 72, y: 168, w: 176, h: 64 },
        db: { x: 88, y: 340, w: 144, h: 64 },
      },
    },
  },
};

const mid = (b: Box) => ({ x: b.x + b.w / 2, y: b.y + b.h / 2 });

/** Curva entre dos cajas: sale por el lado que mira al destino. */
export function edgePath(a: Box, b: Box): string {
  const ca = mid(a);
  const cb = mid(b);
  const dx = cb.x - ca.x;
  const dy = cb.y - ca.y;
  let p1: { x: number; y: number };
  let p2: { x: number; y: number };
  let c1: { x: number; y: number };
  let c2: { x: number; y: number };
  if (Math.abs(dx) >= Math.abs(dy)) {
    p1 = { x: dx > 0 ? a.x + a.w : a.x, y: ca.y };
    p2 = { x: dx > 0 ? b.x : b.x + b.w, y: cb.y };
    const k = Math.abs(p2.x - p1.x) / 2;
    c1 = { x: p1.x + Math.sign(dx) * k, y: p1.y };
    c2 = { x: p2.x - Math.sign(dx) * k, y: p2.y };
  } else {
    p1 = { x: ca.x, y: dy > 0 ? a.y + a.h : a.y };
    p2 = { x: cb.x, y: dy > 0 ? b.y : b.y + b.h };
    const k = Math.abs(p2.y - p1.y) / 2;
    c1 = { x: p1.x, y: p1.y + Math.sign(dy) * k };
    c2 = { x: p2.x, y: p2.y - Math.sign(dy) * k };
  }
  const r = (n: number) => Math.round(n * 10) / 10;
  return `M${r(p1.x)} ${r(p1.y)} C${r(c1.x)} ${r(c1.y)} ${r(c2.x)} ${r(c2.y)} ${r(p2.x)} ${r(p2.y)}`;
}
