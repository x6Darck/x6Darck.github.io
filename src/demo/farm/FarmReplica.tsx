/**
 * Réplica interactiva de la ventana de escritorio FarmStock (Electron), diseño 1120x700.
 * Sin barra de ventana del SO: el motor dibuja el marco.
 *
 * ELEMENTOS QUE NO EXISTEN EN EL ORIGINAL (añadidos solo para la demostración):
 *  - Interruptor "Conectado / Sin conexión" (data-demo="toggle-conn") y toda la barra de estado.
 *  - Indicador ámbar "Sin conexión · guardando en este equipo", contador de pendientes.
 *  - Insignia "Pendiente de sincronizar" en filas, y el flujo "Sincronizando… N registros" -> "Sincronizado".
 *  - Vista previa del PDF dentro de un modal con botón "Descargar" (el original abre un diálogo nativo de guardado).
 *  - Modal "Código QR" con botón "Generar QR" por unidad (el original muestra el QR directamente
 *    y lo imprime desde una etiqueta); el QR aquí es un patrón determinista decorativo, NO escaneable.
 *  - Inventario como tabla (el original usa una cuadrícula de tarjetas).
 *  - Selector de aprendiz en el modal de salida (el original pide tipo + número de documento).
 *  - Botón "Exportar PDF" en Inventario y Salida (en el original el informe se genera desde Estadísticas).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './FarmReplica.css';

type Estado = 'Disponible' | 'Mantenimiento' | 'No_disponible';
interface Tool { id: number; nombre: string; estado: Estado; tipo: string; ubicacion: string; lote: string; cantidad: number; fecha: string; informe: string; prestamos: number; danos: number; mant: number }
interface Unit { codigo: string; toolId: number; estado: Estado; disponible: boolean; fecha: string; comentario: string }
interface Apr { nombre: string; tipo: string; doc: string; ficha: string }
interface Loan { id: number; toolId: number; codigo: string; apr: Apr; fecha: string; salida: string; entrada: string | null; pending: boolean; isNew: boolean }

const T = (id: number, nombre: string, estado: Estado, tipo: string, ubicacion: string, lote: string, cantidad: number, fecha: string, informe: string, prestamos: number, danos: number, mant: number): Tool =>
  ({ id, nombre, estado, tipo, ubicacion, lote, cantidad, fecha, informe, prestamos, danos, mant });
const TOOLS0: Tool[] = [
  T(1, 'Pala redonda', 'Disponible', 'Manual', 'Bodega', 'Lote 1', 12, '2026-08-12', 'INF-2026-001', 11, 0, 0),
  T(2, 'Rastrillo metálico', 'Disponible', 'Manual', 'Bodega', 'Lote 1', 10, '2026-08-12', 'INF-2026-001', 4, 0, 0),
  T(3, 'Machete 18 pulgadas', 'Disponible', 'Manual', 'Bodega', 'Lote 2', 8, '2026-08-19', 'INF-2026-002', 8, 0, 1),
  T(4, 'Motosierra de cadena', 'Disponible', 'Eléctrica', 'Taller', 'Lote 2', 3, '2026-08-19', 'INF-2026-002', 16, 1, 1),
  T(5, 'Guadaña eléctrica', 'Disponible', 'Eléctrica', 'Taller', 'Lote 2', 4, '2026-09-02', 'INF-2026-003', 3, 0, 1),
  T(6, 'Tijera de podar', 'Disponible', 'Manual', 'Bodega', 'Lote 1', 15, '2026-09-02', 'INF-2026-003', 11, 0, 0),
  T(7, 'Carretilla', 'Disponible', 'Manual', 'Bodega', 'Lote 1', 6, '2026-09-16', 'INF-2026-004', 2, 0, 0),
  T(8, 'Taladro inalámbrico', 'Disponible', 'Eléctrica', 'Taller', 'Lote 2', 5, '2026-10-07', 'INF-2026-005', 1, 0, 0),
  T(9, 'Fumigadora de espalda', 'Mantenimiento', 'Manual', 'Bodega', 'Lote 1', 6, '2026-09-16', 'INF-2026-004', 5, 1, 0),
  T(10, 'Hidrolavadora', 'No_disponible', 'Eléctrica', 'Taller', 'Lote 2', 2, '2026-10-07', 'INF-2026-005', 1, 1, 0),
];
const U = (codigo: string, toolId: number, estado: Estado, disponible: boolean, fecha: string, comentario: string): Unit => ({ codigo, toolId, estado, disponible, fecha, comentario });
const UNITS0: Unit[] = [
  U('PALA-001', 1, 'Disponible', true, '2026-08-12', ''), U('PALA-002', 1, 'Disponible', true, '2026-08-12', ''), U('PALA-003', 1, 'Disponible', false, '2026-08-12', 'En préstamo activo'),
  U('RAST-001', 2, 'Disponible', true, '2026-08-12', ''), U('RAST-002', 2, 'Disponible', true, '2026-08-12', ''),
  U('MACH-001', 3, 'Disponible', true, '2026-08-19', 'Filo reafilado'), U('MACH-002', 3, 'Disponible', false, '2026-08-19', 'En préstamo activo'),
  U('MOTO-001', 4, 'Disponible', true, '2026-08-19', 'Cadena nueva'), U('MOTO-002', 4, 'Mantenimiento', false, '2026-08-19', 'Cambio de bujía'),
  U('GUAD-001', 5, 'Disponible', true, '2026-09-02', ''),
  U('TIJE-001', 6, 'Disponible', true, '2026-09-02', ''), U('TIJE-002', 6, 'Disponible', false, '2026-09-02', 'En préstamo activo'),
  U('CARR-001', 7, 'Disponible', true, '2026-09-16', ''),
  U('TALA-001', 8, 'Disponible', true, '2026-10-07', 'Batería a 100 %'), U('TALA-002', 8, 'Disponible', false, '2026-10-07', 'En préstamo activo'),
  U('FUMI-001', 9, 'Mantenimiento', false, '2026-09-16', 'Fuga en la manguera'),
  U('HIDR-001', 10, 'No_disponible', false, '2026-10-07', 'Daño en la bomba'),
];
const APRS: Apr[] = [
  { nombre: 'Juan Sebastián Parra Lozano', tipo: 'CC', doc: '1090000101', ficha: '2900001' },
  { nombre: 'Valentina Cruz Arango', tipo: 'TI', doc: '1090000102', ficha: '2900001' },
  { nombre: 'Miguel Ángel Rojas Peña', tipo: 'CC', doc: '1090000103', ficha: '2900001' },
  { nombre: 'Sara Lucía Montoya Díaz', tipo: 'CC', doc: '1090000104', ficha: '2900002' },
  { nombre: 'Brayan Steven Núñez Salcedo', tipo: 'PPT', doc: '1090000105', ficha: '2900002' },
  { nombre: 'Ana María Beltrán Cortés', tipo: 'CC', doc: '1090000106', ficha: '2900002' },
  { nombre: 'Esteban Vega Torres', tipo: 'TI', doc: '1090000107', ficha: '2900003' },
  { nombre: 'Laura Camila Duarte Pinto', tipo: 'CC', doc: '1090000108', ficha: '2900003' },
];
const apr = (doc: string) => APRS.find(a => a.doc === doc)!;
const LOANS0: Loan[] = [
  { id: 101, toolId: 1, codigo: 'PALA-003', apr: apr('1090000101'), fecha: '2026-10-07', salida: '07:45', entrada: null },
  { id: 102, toolId: 3, codigo: 'MACH-002', apr: apr('1090000102'), fecha: '2026-10-07', salida: '08:10', entrada: null },
  { id: 103, toolId: 6, codigo: 'TIJE-002', apr: apr('1090000104'), fecha: '2026-10-07', salida: '09:30', entrada: null },
  { id: 104, toolId: 8, codigo: 'TALA-002', apr: apr('1090000107'), fecha: '2026-10-07', salida: '10:05', entrada: null },
  { id: 105, toolId: 1, codigo: 'PALA-001', apr: apr('1090000103'), fecha: '2026-10-06', salida: '07:50', entrada: '11:40' },
  { id: 106, toolId: 2, codigo: 'RAST-001', apr: apr('1090000106'), fecha: '2026-10-06', salida: '08:20', entrada: '12:15' },
].map(l => ({ ...l, pending: false, isNew: false }));

const fmtFecha = (iso: string) => { const [y, m, d] = iso.split('-'); return `${+d}/${+m}/${y}`; };
const fmtHora = (hm: string) => { const [h, m] = hm.split(':').map(Number); return `${String(h % 12 || 12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${h < 12 ? 'a. m.' : 'p. m.'}`; };
const estadoTxt = (e: Estado) => e.replace('_', ' ');
const TODAY = '2026-10-07';

/* ---------- QR decorativo determinista (no escaneable) ---------- */
function seedFrom(s: string) { let h = 1779033703 ^ s.length; for (let i = 0; i < s.length; i++) { h = Math.imul(h ^ s.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); } return () => { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return (h ^= h >>> 16) >>> 0; }; }
function qrRows(code: string): string[] {
  const n = 25, next = seedFrom(code), g: boolean[][] = [];
  for (let y = 0; y < n; y++) { g.push([]); for (let x = 0; x < n; x++) g[y].push(next() % 100 < 48); }
  const finder = (ox: number, oy: number) => { for (let y = -1; y <= 7; y++) for (let x = -1; x <= 7; x++) { const X = ox + x, Y = oy + y; if (X < 0 || Y < 0 || X >= n || Y >= n) continue; const ring = x >= 0 && x <= 6 && y >= 0 && y <= 6 && (x === 0 || x === 6 || y === 0 || y === 6); const core = x >= 2 && x <= 4 && y >= 2 && y <= 4; g[Y][X] = ring || core; } };
  finder(0, 0); finder(n - 7, 0); finder(0, n - 7);
  for (let i = 8; i < n - 8; i++) { g[6][i] = i % 2 === 0; g[i][6] = i % 2 === 0; }
  return g.map((row, y) => row.map((v, x) => (v ? `M${x + 4} ${y + 4}h1v1h-1z` : '')).join(''));
}
function Qr({ code, animate, label }: { code: string; animate?: boolean; label?: string }) {
  const rows = useMemo(() => qrRows(code), [code]);
  return (
    <svg className={`fs-qr${animate ? ' fs-qr--in' : ''}`} viewBox="0 0 33 33" role="img" aria-label={label ?? `Código QR de ${code}`} shapeRendering="crispEdges">
      <rect width="33" height="33" fill="#fff" />
      {rows.map((d, i) => <path key={i} d={d} fill="#10221f" className="fs-qr-row" style={animate ? { animationDelay: `${60 + i * 16}ms` } : undefined} />)}
    </svg>
  );
}

/* ---------- Componente ---------- */
type Screen = 'inventario' | 'salida';
type Sync = null | { phase: 'syncing'; n: number; pct: number } | { phase: 'done' };
interface Toast { msg: string; kind: 'ok' | 'err' | 'info'; k: number }

export default function FarmReplica({ startOffline = false, dark = false }: { startOffline?: boolean; dark?: boolean }) {
  const [isDark, setIsDark] = useState(dark);
  const [screen, setScreen] = useState<Screen>('inventario');
  const [tools, setTools] = useState<Tool[]>(TOOLS0);
  const [units, setUnits] = useState<Unit[]>(UNITS0);
  const [loans, setLoans] = useState<Loan[]>(LOANS0);
  const [online, setOnline] = useState(!startOffline);
  const [sync, setSync] = useState<Sync>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const [tipoFiltro, setTipoFiltro] = useState<'codigo' | 'informe'>('codigo');
  const [q, setQ] = useState('');
  const [detailId, setDetailId] = useState<number | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [generated, setGenerated] = useState<string[]>([]);
  const [delId, setDelId] = useState<number | null>(null);

  const [filtroEstado, setFiltroEstado] = useState<'activos' | 'todos' | 'finalizados'>('activos');
  const [qLoan, setQLoan] = useState('');
  const [loanOpen, setLoanOpen] = useState(false);
  const [lDoc, setLDoc] = useState('');
  const [lCodigo, setLCodigo] = useState('');
  const [lErr, setLErr] = useState('');
  const [scanning, setScanning] = useState(false);

  const [pdfOpen, setPdfOpen] = useState(false);
  const [pdfDone, setPdfDone] = useState(false);

  const timers = useRef<number[]>([]);
  const nextId = useRef(109);
  const clock = useRef(10 * 60 + 42);
  const toastK = useRef(0);
  const onlineRef = useRef(online);
  onlineRef.current = online;

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  useEffect(() => clearTimers, []);
  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); };

  const say = useCallback((msg: string, kind: Toast['kind'] = 'ok') => { setToast({ msg, kind, k: ++toastK.current }); }, []);
  useEffect(() => { if (!toast) return; const id = window.setTimeout(() => setToast(null), 4200); return () => clearTimeout(id); }, [toast]);

  const pending = loans.filter(l => l.pending).length;

  const toggleConn = () => {
    clearTimers();
    if (online) { setOnline(false); setSync(null); return; }
    setOnline(true);
    const n = loans.filter(l => l.pending).length;
    if (n === 0) { setSync(null); return; }
    setSync({ phase: 'syncing', n, pct: 0 });
    later(() => setSync({ phase: 'syncing', n, pct: 100 }), 60);
    later(() => { setLoans(ls => ls.map(l => (l.pending ? { ...l, pending: false } : l))); setSync({ phase: 'done' }); }, 1650);
    later(() => setSync(null), 4600);
  };

  /* filtros inventario */
  const shownTools = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return tools;
    return tools.filter(t => tipoFiltro === 'codigo'
      ? units.some(u => u.toolId === t.id && u.codigo.toLowerCase().includes(s)) || t.nombre.toLowerCase().includes(s)
      : t.informe.toLowerCase().includes(s));
  }, [tools, units, q, tipoFiltro]);

  const shownLoans = useMemo(() => {
    const s = qLoan.trim().toLowerCase();
    return loans.filter(l => (filtroEstado === 'todos' || (filtroEstado === 'activos' ? !l.entrada : !!l.entrada))
      && (!s || l.codigo.toLowerCase().includes(s) || tools.find(t => t.id === l.toolId)!.nombre.toLowerCase().includes(s)))
      .sort((a, b) => b.id - a.id);
  }, [loans, filtroEstado, qLoan, tools]);

  /* acciones */
  const closeLoan = () => { setLoanOpen(false); setLErr(''); setLDoc(''); setLCodigo(''); setScanning(false); };
  const stamp = () => { const m = clock.current; clock.current += 5; return `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`; };

  const confirmLoan = () => {
    if (!lDoc) return setLErr('❌ Introduce número de documento del aprendiz.');
    const code = lCodigo.trim().toUpperCase();
    if (!code) return setLErr('❌ Introduce el código de la herramienta (escaneado o manual).');
    const u = units.find(x => x.codigo === code);
    if (!u) return setLErr(`❌ No se encontró la herramienta con código ${code}.`);
    if (u.estado !== 'Disponible') return setLErr(`⚠️ HERRAMIENTA NO DISPONIBLE: la unidad ${code} está en estado ${estadoTxt(u.estado)}.`);
    if (!u.disponible) return setLErr(`⚠️ HERRAMIENTA NO DISPONIBLE: ${code} ya tiene un préstamo activo. Registra primero su entrada.`);
    const offline = !onlineRef.current;
    const loan: Loan = { id: nextId.current++, toolId: u.toolId, codigo: code, apr: apr(lDoc), fecha: TODAY, salida: stamp(), entrada: null, pending: offline, isNew: true };
    setLoans(ls => [loan, ...ls]);
    setUnits(us => us.map(x => (x.codigo === code ? { ...x, disponible: false } : x)));
    setFiltroEstado(f => (f === 'finalizados' ? 'activos' : f));
    closeLoan();
    say(offline ? '✅ Préstamo guardado en este equipo · pendiente de sincronizar' : '✅ ¡PRÉSTAMO REGISTRADO EXITOSAMENTE!');
  };

  const returnLoan = (id: number) => {
    const l = loans.find(x => x.id === id); if (!l) return;
    const offline = !onlineRef.current;
    setLoans(ls => ls.map(x => (x.id === id ? { ...x, entrada: stamp(), pending: offline ? true : x.pending } : x)));
    setUnits(us => us.map(x => (x.codigo === l.codigo ? { ...x, disponible: true } : x)));
    say(offline ? '✅ Devolución guardada en este equipo · pendiente de sincronizar' : '✅ ¡DEVOLUCIÓN REGISTRADA EXITOSAMENTE!');
  };
  const removeLoan = (id: number) => {
    const l = loans.find(x => x.id === id); if (!l) return;
    if (!l.entrada) setUnits(us => us.map(x => (x.codigo === l.codigo ? { ...x, disponible: true } : x)));
    setLoans(ls => ls.filter(x => x.id !== id));
  };
  const deleteTool = () => {
    const t = tools.find(x => x.id === delId); setDelId(null); if (!t) return;
    if (loans.some(l => l.toolId === t.id && !l.entrada)) return say('❌ No puedes eliminar esta herramienta porque tiene préstamos asociados. Devuelve o elimina los préstamos primero.', 'err');
    setTools(ts => ts.filter(x => x.id !== t.id)); setUnits(us => us.filter(x => x.toolId !== t.id)); say('✅ Herramienta eliminada exitosamente');
  };

  /* Esc cierra la capa superior */
  const esc = () => {
    if (qrCode) setQrCode(null); else if (delId !== null) setDelId(null); else if (pdfOpen) { setPdfOpen(false); setPdfDone(false); }
    else if (loanOpen) closeLoan(); else if (detailId !== null) setDetailId(null);
  };
  const escRef = useRef(esc); escRef.current = esc;
  useEffect(() => { const h = (e: KeyboardEvent) => { if (e.key === 'Escape') escRef.current(); }; document.addEventListener('keydown', h); return () => document.removeEventListener('keydown', h); }, []);

  const detailTool = tools.find(t => t.id === detailId) ?? null;
  const detailUnits = units.filter(u => u.toolId === detailId);
  const delTool = tools.find(t => t.id === delId) ?? null;
  const loanApr = APRS.find(a => a.doc === lDoc);
  const loanUnit = units.find(u => u.codigo === lCodigo.trim().toUpperCase());

  const extra = (toolId: number) => loans.filter(l => l.isNew && l.toolId === toolId).length;
  const totalPrest = tools.reduce((s, t) => s + t.prestamos + extra(t.id), 0);

  const MENU: { id: string; label: string; screen?: Screen }[] = [
    { id: 'registro', label: 'Registro Herramientas' }, { id: 'salida', label: 'Salida Herramientas', screen: 'salida' },
    { id: 'inventario', label: 'Inventario', screen: 'inventario' }, { id: 'estadisticas', label: 'Estadísticas' },
    { id: 'aprendices', label: 'Aprendices' }, { id: 'equipos', label: 'Equipos de Cómputo' }, { id: 'movimientos', label: 'Movimientos Equipos' },
  ];

  const exportBtn = (
    <button type="button" className="fs-btn fs-btn--ghost" data-demo="export-pdf" onClick={() => { setPdfDone(false); setPdfOpen(true); }}>📄 Exportar PDF</button>
  );

  return (
    <div className={`fs-root${isDark ? ' fs-dark' : ''}`} data-demo="farm-root">
      <aside className="fs-side">
        <div>
          <div className="fs-logo" aria-label="FarmStock">
            <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true"><rect width="34" height="34" rx="9" fill="var(--accent)" /><path d="M17 26V15M17 15c0-4 2.5-6 7-6 0 4-2.5 6-7 6zM17 19c0-3-2-5-6-5 0 3 2 5 6 5z" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span>FarmStock</span>
          </div>
          <ul className="fs-menu">
            {MENU.map(m => (
              <li key={m.id}>
                <button type="button" data-demo={`nav-${m.id}`} className={`fs-menu-item${m.screen === screen ? ' is-active' : ''}`} aria-current={m.screen === screen ? 'page' : undefined}
                  onClick={() => (m.screen ? setScreen(m.screen) : say('Esta pantalla no forma parte de la demostración.', 'info'))}>{m.label}</button>
              </li>
            ))}
          </ul>
        </div>
        <div className="fs-side-bottom">
          <button type="button" className="fs-side-link" onClick={() => say('Esta pantalla no forma parte de la demostración.', 'info')}>👥 Quiénes Somos</button>
          <button type="button" className="fs-side-link" data-demo="night-mode" onClick={() => setIsDark(d => !d)}>{isDark ? '🌞 Modo claro' : '🌙 Modo noche'}</button>
        </div>
      </aside>

      <main className="fs-main">
        <header className="fs-top">
          <div className="fs-hello"><span className="fs-avatar" aria-hidden="true">C</span><strong>¡Hola Camila!</strong></div>
          <div className="fs-status" data-demo="sync-status" aria-live="polite">
            {!online && (
              <>
                <span className="fs-chip fs-chip--warn"><i className="fs-dot" />Sin conexión · guardando en este equipo</span>
                <span className="fs-chip fs-chip--count" data-demo="pending-count" title="Registros guardados en este equipo">{pending} {pending === 1 ? 'pendiente' : 'pendientes'}</span>
              </>
            )}
            {online && sync?.phase === 'syncing' && (
              <span className="fs-chip fs-chip--sync" data-demo="sync-progress">
                Sincronizando… {sync.n} {sync.n === 1 ? 'registro' : 'registros'}
                <span className="fs-bar"><span className="fs-bar-fill" style={{ transform: `scaleX(${sync.pct / 100})` }} /></span>
              </span>
            )}
            {online && sync?.phase === 'done' && <span className="fs-chip fs-chip--ok" data-demo="sync-done">✔ Sincronizado</span>}
          </div>
          <button type="button" role="switch" aria-checked={online} aria-label={`Conexión: ${online ? 'Conectado' : 'Sin conexión'}`} data-demo="toggle-conn" className={`fs-seg${online ? ' is-on' : ' is-off'}`} onClick={toggleConn}>
            <span className="fs-seg-thumb" aria-hidden="true" />
            <span className="fs-seg-opt"><i className="fs-dot fs-dot--ok" />Conectado</span>
            <span className="fs-seg-opt"><i className="fs-dot fs-dot--warn" />Sin conexión</span>
          </button>
        </header>

        {screen === 'inventario' ? (
          <section className="fs-card fs-screen" data-demo="screen-inventario" aria-label="Inventario">
            <div className="fs-head"><h1>Inventario</h1>{exportBtn}</div>
            <div className="fs-filters">
              <select className="fs-input fs-sel" data-demo="inv-filtro" value={tipoFiltro} onChange={e => setTipoFiltro(e.target.value as 'codigo' | 'informe')} aria-label="Tipo de filtro">
                <option value="codigo">Filtrar por código único</option><option value="informe">Filtrar por código informe</option>
              </select>
              <input className="fs-input fs-search" data-demo="inv-search" value={q} onChange={e => setQ(e.target.value)} placeholder={tipoFiltro === 'codigo' ? '🔍 Escribe el código único...' : '🔍 Escribe el código informe...'} aria-label="Buscar" />
            </div>
            <div className="fs-scroll">
              <table className="fs-table" data-demo="tabla-inventario">
                <thead><tr><th>Herramienta</th><th>Estado</th><th>Tipo</th><th>Ubicación</th><th>Fecha ingreso</th><th>Lote</th><th>Cantidad</th><th>Acciones</th></tr></thead>
                <tbody>
                  {shownTools.map(t => (
                    <tr key={t.id} data-demo={`tool-${t.id}`} className="fs-row-click" onClick={() => setDetailId(t.id)}>
                      <td className="fs-strong">🛠 {t.nombre}</td>
                      <td><span className={`fs-est fs-est--${t.estado}`}>{estadoTxt(t.estado)}</span></td>
                      <td>{t.tipo}</td><td>{t.ubicacion}</td><td>{fmtFecha(t.fecha)}</td><td>{t.lote}</td><td>{t.cantidad}</td>
                      <td className="fs-acts">
                        <button type="button" className="fs-small" data-demo={`ver-${t.id}`} onClick={e => { e.stopPropagation(); setDetailId(t.id); }}>Ver detalles</button>
                        <button type="button" className="fs-small fs-small--del" data-demo={`del-${t.id}`} onClick={e => { e.stopPropagation(); setDelId(t.id); }}>Eliminar</button>
                      </td>
                    </tr>
                  ))}
                  {shownTools.length === 0 && <tr><td colSpan={8} className="fs-empty">{tools.length === 0 ? 'No hay herramientas registradas.' : <>🔍 No se encontraron herramientas con el código "<b>{q}</b>"</>}</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <section className="fs-card fs-screen" data-demo="screen-salida" aria-label="Registro Salida">
            <div className="fs-head">
              <h1>Registro Salida</h1>
              <div className="fs-head-btns">
                {exportBtn}
                <button type="button" className="fs-btn fs-btn--green" data-demo="open-registrar" onClick={() => { setLErr(''); setLoanOpen(true); }}>Registrar salida</button>
              </div>
            </div>
            <div className="fs-filters">
              <select className="fs-input fs-sel" data-demo="filtro-estado" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value as typeof filtroEstado)} aria-label="Filtrar por estado">
                <option value="activos">Solo Activos</option><option value="todos">Todos los Préstamos</option><option value="finalizados">Solo Devueltos</option>
              </select>
              <input className="fs-input fs-search" data-demo="loan-search" value={qLoan} onChange={e => setQLoan(e.target.value)} placeholder="Buscar por código..." aria-label="Buscar por código" />
              <button type="button" className="fs-btn fs-btn--ghost" onClick={() => { setQLoan(''); setFiltroEstado('activos'); }}>Limpiar filtros</button>
            </div>
            <div className="fs-scroll">
              <table className="fs-table fs-table--loans" data-demo="tabla-prestamos">
                <thead><tr><th>ID</th><th>Nombre</th><th>Estado</th><th>C.C Aprendiz</th><th>Número Ficha</th><th>Fecha</th><th>Hora salida</th><th>Hora Entrada</th><th>Acciones</th></tr></thead>
                <tbody>
                  {shownLoans.map(l => (
                    <tr key={l.id} data-demo={`prestamo-${l.id}`} className={l.pending ? 'is-pending' : undefined}>
                      <td>{l.id}</td>
                      <td className="fs-strong">{tools.find(t => t.id === l.toolId)?.nombre}<small className="fs-code">{l.codigo}</small></td>
                      <td>
                        <span className={`fs-badge ${l.entrada ? 'fs-badge--ret' : 'fs-badge--act'}`}>{l.entrada ? 'Devuelto' : 'Activo'}</span>
                        {l.pending && <span className="fs-pend" data-demo="pend-badge"><i className="fs-dot" />Pendiente de sincronizar</span>}
                      </td>
                      <td>{l.apr.doc}</td><td>{l.apr.ficha}</td><td>{fmtFecha(l.fecha)}</td><td>{fmtHora(l.salida)}</td>
                      <td>{l.entrada ? fmtHora(l.entrada) : <button type="button" className="fs-small fs-small--green" data-demo={`devolver-${l.codigo}`} onClick={() => returnLoan(l.id)}>Registrar Entrada</button>}</td>
                      <td><button type="button" className="fs-small fs-small--del" data-demo={`eliminar-${l.id}`} onClick={() => removeLoan(l.id)}>Eliminar</button></td>
                    </tr>
                  ))}
                  {shownLoans.length === 0 && <tr><td colSpan={9} className="fs-empty">No hay préstamos que coincidan con los filtros.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      {/* Modal detalle */}
      {detailTool && (
        <div className="fs-backdrop" onClick={() => setDetailId(null)}>
          <div className="fs-modal fs-modal--lg" role="dialog" aria-modal="true" aria-labelledby="fs-d-t" data-demo="detalle" onClick={e => e.stopPropagation()}>
            <div className="fs-mhead"><h3 id="fs-d-t">Detalles: {detailTool.nombre}</h3><button type="button" className="fs-btn fs-btn--grey" data-demo="detalle-close" onClick={() => setDetailId(null)}>Cerrar</button></div>
            <p className="fs-meta"><b>Estado:</b> {estadoTxt(detailTool.estado)} · <b>Tipo:</b> {detailTool.tipo} · <b>Ubicación:</b> {detailTool.ubicacion} · <b>Lote:</b> {detailTool.lote} · <b>Cantidad:</b> {detailTool.cantidad} · <b>Código informe:</b> {detailTool.informe}</p>
            <div className="fs-units">
              {detailUnits.length === 0 && <p className="fs-empty">No hay detalles.</p>}
              {detailUnits.map(u => (
                <div className="fs-unit" key={u.codigo} data-demo={`unit-${u.codigo}`}>
                  <div className="fs-unit-qr">{generated.includes(u.codigo) ? <Qr code={u.codigo} /> : <span>Sin QR</span>}</div>
                  <div className="fs-unit-info">
                    <div className="fs-strong">{detailTool.nombre} — {u.codigo}</div>
                    <div><b>Estado:</b> {estadoTxt(u.estado)}</div>
                    <div><b>Disponible:</b> {u.disponible ? 'Sí' : 'No'} • <b>Fecha ingreso:</b> {fmtFecha(u.fecha)}</div>
                    {u.comentario && <div className="fs-muted">{u.comentario}</div>}
                  </div>
                  <div className="fs-unit-act"><button type="button" className="fs-btn fs-btn--green" data-demo={`gen-qr-${u.codigo}`} onClick={() => { setGenerated(g => (g.includes(u.codigo) ? g : [...g, u.codigo])); setQrCode(u.codigo); }}>Generar QR</button></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal QR */}
      {qrCode && (
        <div className="fs-backdrop fs-backdrop--top" onClick={() => setQrCode(null)}>
          <div className="fs-modal fs-modal--sm fs-qr-modal" role="dialog" aria-modal="true" aria-labelledby="fs-q-t" data-demo="qr-modal" onClick={e => e.stopPropagation()}>
            <div className="fs-mhead"><h3 id="fs-q-t">Código QR · {qrCode}</h3></div>
            <div className="fs-qr-box" data-demo="qr-svg"><Qr key={qrCode} code={qrCode} animate /></div>
            <div className="fs-qr-code">{qrCode}</div>
            <div className="fs-qr-file" data-demo="qr-file">qr_{qrCode}.png</div>
            <div className="fs-mfoot"><button type="button" className="fs-btn fs-btn--grey" data-demo="qr-close" onClick={() => setQrCode(null)}>Cerrar</button></div>
          </div>
        </div>
      )}

      {/* Modal registrar salida */}
      {loanOpen && (
        <div className="fs-backdrop" onClick={closeLoan}>
          <div className="fs-modal fs-modal--md" role="dialog" aria-modal="true" aria-labelledby="fs-l-t" data-demo="loan-modal" onClick={e => e.stopPropagation()}>
            <div className="fs-mhead"><h3 id="fs-l-t">Registrar salida - Escanea herramienta</h3><button type="button" className="fs-btn fs-btn--red" data-demo="loan-close" onClick={closeLoan}>Cerrar</button></div>
            <label className="fs-label" htmlFor="fs-reg-apr">Aprendiz</label>
            <select id="fs-reg-apr" className="fs-input" data-demo="loan-aprendiz" value={lDoc} onChange={e => { setLDoc(e.target.value); setLErr(''); }}>
              <option value="">Selecciona aprendiz</option>
              {APRS.map(a => <option key={a.doc} value={a.doc}>{a.nombre} ({a.tipo} {a.doc})</option>)}
            </select>
            <div className="fs-hint">{loanApr ? <>Aprendiz: <b>{loanApr.nombre}</b> • Ficha: <b>{loanApr.ficha}</b></> : 'Si el aprendiz existe en Registro Aprendices, sus datos (nombre / ficha) se completarán automáticamente.'}</div>
            <label className="fs-label" htmlFor="fs-reg-cod">Código de herramienta</label>
            <div className="fs-row">
              <input id="fs-reg-cod" className="fs-input" data-demo="loan-codigo" value={lCodigo} onChange={e => { setLCodigo(e.target.value); setLErr(''); }} placeholder="Escanea o escribe el código..." autoComplete="off" />
              <button type="button" className="fs-btn fs-btn--ghost" onClick={() => setScanning(s => !s)}>📷 Scanear</button>
            </div>
            <div className="fs-hint">{scanning ? '🔄 Esperando escaneo...' : 'Esperando código...'}{lCodigo.trim() && <> · Código leído: <b>{lCodigo.trim().toUpperCase()}</b>{loanUnit && <> · {tools.find(t => t.id === loanUnit.toolId)?.nombre}</>}</>}</div>
            {lErr && <div className="fs-err" role="alert" data-demo="loan-error">{lErr}</div>}
            <div className="fs-mfoot"><button type="button" className="fs-btn fs-btn--green" data-demo="loan-confirm" onClick={confirmLoan}>✅ Confirmar salida</button></div>
          </div>
        </div>
      )}

      {/* Modal PDF */}
      {pdfOpen && (
        <div className="fs-backdrop" onClick={() => { setPdfOpen(false); setPdfDone(false); }}>
          <div className="fs-modal fs-modal--pdf" role="dialog" aria-modal="true" aria-labelledby="fs-p-t" data-demo="pdf-modal" onClick={e => e.stopPropagation()}>
            <div className="fs-mhead"><h3 id="fs-p-t">Vista previa del informe</h3>
              <div className="fs-head-btns">
                <button type="button" className="fs-btn fs-btn--green" data-demo="pdf-download" onClick={() => { setPdfDone(true); say(`✅ PDF generado: Estadisticas_FarmStock_${TODAY}.pdf`); }}>{pdfDone ? '✔ Descargado' : 'Descargar'}</button>
                <button type="button" className="fs-btn fs-btn--grey" data-demo="pdf-close" onClick={() => { setPdfOpen(false); setPdfDone(false); }}>Cerrar</button>
              </div>
            </div>
            <div className="fs-pdf-stage">
              <article className="fs-sheet" data-demo="pdf-sheet">
                <h2>📊 Informe de Estadísticas de Herramientas</h2>
                <p className="fs-sheet-date" data-demo="pdf-file">Fecha de generación: {fmtFecha(TODAY)}</p>
                <div className="fs-sheet-kpis" data-demo="pdf-kpis">
                  <div><b style={{ color: '#4CAF50' }}>{tools.length}</b><span>Total Herramientas</span></div>
                  <div><b style={{ color: '#2196F3' }}>{totalPrest}</b><span>Total Préstamos</span></div>
                  <div><b style={{ color: '#FF9800' }}>{tools.reduce((s, t) => s + t.danos, 0)}</b><span>Total Daños</span></div>
                  <div><b style={{ color: '#9C27B0' }}>{tools.reduce((s, t) => s + t.mant, 0)}</b><span>Total Mantenimientos</span></div>
                </div>
                <table><thead><tr><th>ID</th><th>Herramienta</th><th>Préstamos</th><th>Daños</th><th>Mantenimientos</th></tr></thead>
                  <tbody>{tools.map(t => <tr key={t.id}><td>{t.id}</td><td>{t.nombre}</td><td>{t.prestamos + extra(t.id)}</td><td>{t.danos}</td><td>{t.mant}</td></tr>)}</tbody></table>
                <footer>FarmStock - Sistema de Gestión de Herramientas | Generado automáticamente el {fmtFecha(TODAY)}</footer>
              </article>
            </div>
          </div>
        </div>
      )}

      {/* Confirmar eliminación */}
      {delTool && (
        <div className="fs-backdrop fs-backdrop--top" onClick={() => setDelId(null)}>
          <div className="fs-modal fs-modal--sm fs-confirm" role="alertdialog" aria-modal="true" aria-labelledby="fs-c-t" onClick={e => e.stopPropagation()}>
            <div className="fs-confirm-head"><span aria-hidden="true">⚠️</span><h3 id="fs-c-t">Confirmar Eliminación</h3></div>
            <div className="fs-confirm-body"><p>¿Está seguro de que desea eliminar esta herramienta completa?</p><code>{delTool.nombre} (ID: {delTool.id})</code><p className="fs-muted">Esto eliminará la herramienta y todas sus unidades.</p></div>
            <div className="fs-mfoot"><button type="button" className="fs-btn fs-btn--grey" onClick={() => setDelId(null)}>Cancelar</button><button type="button" className="fs-btn fs-btn--red" data-demo="del-confirm" onClick={deleteTool}>Sí, Eliminar</button></div>
          </div>
        </div>
      )}

      {toast && <div key={toast.k} className={`fs-toast fs-toast--${toast.kind}`} role="status">{toast.msg}</div>}
    </div>
  );
}
