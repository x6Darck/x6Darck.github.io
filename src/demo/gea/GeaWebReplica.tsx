import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Calendar, CalendarDays, Megaphone, FileText, Users as UsersIcon, Shield, Plus, Search, X, Star, Clock, MapPin,
  ChevronDown, ChevronUp, ChevronRight, Eye, EyeOff, AlertCircle, Info, LayoutGrid, Download, Mail, Phone, Lock,
  User as UserIcon, ShieldCheck, Send, Tag, Building2, CheckCircle2, XCircle, BarChart3, TrendingUp, Layers,
  CalendarRange, Ticket, DollarSign, Building, Edit2, Trash2, Camera, CheckCircle,
} from 'lucide-react';
import { geaStore, useGeaStore } from '../geaStore';
import {
  TODAY, OFICINAS, TIPOS, tipoColor, LUGARES, seedEvents, seedExtraAnns, annEmail, ROLES, ROLE_ORDER, seedUsers,
  seedReports, seedLogins, MONTHS, fmtTime, fmtShort, type Ev, type User, type Rol, type Ingreso,
} from './geaWebData';
import './GeaWebReplica.css';

type Screen = 'login' | 'calendario' | 'eventos' | 'anuncios' | 'reportes' | 'usuarios' | 'seguridad';
export type GeaWebReplicaProps = { startScreen?: 'login' | 'calendario' };

/* ------------------------------------------------------------------ toasts */
type ToastItem = { id: number; text: string; kind: 'success' | 'error' | 'info' };
const ToastCtx = createContext<(t: string, k?: ToastItem['kind']) => void>(() => {});
const useToast = () => useContext(ToastCtx);

const SESSION = { nombre: 'Valentina Ríos', correo: 'admin@gea-demo.test' };

/* ------------------------------------------------------------------ date field (texto dd/mm/aaaa o aaaa-mm-dd + selector nativo) */
const isoToEs = (iso: string) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso); return m ? `${m[3]}/${m[2]}/${m[1]}` : ''; };
function parseDate(t: string) {
  let m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t.trim()); if (m) return t.trim();
  m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(t.trim()); if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return '';
}
function DateField({ value, onChange, demo, min }: { value: string; onChange: (v: string) => void; demo: string; min?: string }) {
  const [raw, setRaw] = useState(isoToEs(value));
  useEffect(() => { if (value !== parseDate(raw)) setRaw(isoToEs(value)); /* eslint-disable-next-line */ }, [value]);
  return (
    <span className="gw-datefield">
      <input className="gw-in gw-datein" value={raw} placeholder="dd/mm/aaaa" data-demo={demo}
        onChange={e => { const t = e.target.value; setRaw(t); const iso = parseDate(t); onChange(iso); if (iso && /^\d{4}-/.test(t.trim())) setRaw(isoToEs(iso)); }} />
      <span className="gw-datepick" aria-hidden="true"><Calendar size={16} />
        <input type="date" tabIndex={-1} min={min} value={value} onChange={e => { onChange(e.target.value); setRaw(isoToEs(e.target.value)); }} /></span>
    </span>
  );
}

/* ------------------------------------------------------------------ small pieces */
function GeaMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <rect x="4" y="7" width="32" height="29" rx="6" fill="#fff" stroke="#1a1a1a" strokeWidth="2.4" />
      <rect x="4" y="7" width="32" height="9" rx="6" fill="#ce1126" />
      <rect x="4" y="12" width="32" height="4" fill="#ce1126" />
      <rect x="11" y="3" width="3.4" height="8" rx="1.7" fill="#1a1a1a" />
      <rect x="25.6" y="3" width="3.4" height="8" rx="1.7" fill="#1a1a1a" />
      <text x="20" y="31.5" textAnchor="middle" fontFamily="Inter Variable, Inter, sans-serif" fontWeight="800" fontSize="12.5" fill="#1a1a1a" letterSpacing="-0.3">GEA</text>
    </svg>
  );
}
const LogoutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></svg>
);
const AvatarIcon = ({ size = 36 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" /></svg>
);

function Badge({ status }: { status: string }) {
  const map: Record<string, [string, string, string]> = {
    PENDIENTE: ['#fefce8', '#854d0e', 'PENDIENTE'],
    APROBADA: ['#dbeafe', '#1d4ed8', 'APROBADA'], APROBADO: ['#dbeafe', '#1d4ed8', 'APROBADO'],
    RECHAZADA: ['#fee2e2', '#dc2626', 'RECHAZADA'], RECHAZADO: ['#fee2e2', '#dc2626', 'RECHAZADO'],
    PUBLICADA: ['#dcfce7', '#16a34a', 'PUBLICADA'], EN_REVISION: ['#ede9fe', '#7c3aed', 'En revisión'],
  };
  const [bg, fg, label] = map[status] ?? map.PENDIENTE;
  return <span className="gw-badge" style={{ background: bg, color: fg }}>{label}</span>;
}

function Modal({ title, onClose, width = 600, demo, children, z }: { title: string; onClose: () => void; width?: number; demo: string; children: ReactNode; z?: number }) {
  return (
    <div className="gw-overlay" style={z ? { zIndex: z } : undefined} onClick={onClose} data-demo={`${demo}-overlay`}>
      <div className="gw-modal" style={{ maxWidth: width }} onClick={e => e.stopPropagation()} data-demo={demo}>
        <div className="gw-modal-h">
          <h3>{title}</h3>
          <button className="gw-x" onClick={onClose} aria-label="Cerrar" data-demo={`${demo}-close`}><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function SearchBox({ value, onChange, placeholder, demo }: { value: string; onChange: (v: string) => void; placeholder: string; demo?: string }) {
  return (
    <div className="gw-search">
      <Search size={18} />
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} data-demo={demo} />
    </div>
  );
}

function Tabs({ tabs, value, onChange, demo }: { tabs: [string, string][]; value: string; onChange: (v: string) => void; demo: string }) {
  return (
    <>
      {tabs.map(([k, l]) => (
        <button key={k} className={`gw-tab${value === k ? ' on' : ''}`} onClick={() => onChange(k)} data-demo={`${demo}-${k || 'todos'}`}>{l}</button>
      ))}
    </>
  );
}

const DATE_OPTS = ['Todos', 'Hoy', 'Esta semana', 'Últimos 30 días', 'Este mes', 'Mes anterior'];
const EST_TABS: [string, string][] = [['todos', 'Todos'], ['publicadas', 'Publicados'], ['ocultos', 'Ocultos'], ['aprobadas', 'Aprobados'], ['pendientes', 'Pendientes'], ['rechazadas', 'Rechazados'], ['revision', 'En revisión']];
function matchTab(tab: string, s: string) {
  switch (tab) {
    case 'publicadas': return s === 'PUBLICADA';
    case 'ocultos': return false;
    case 'aprobadas': return s === 'APROBADA' || s === 'APROBADO';
    case 'pendientes': return s === 'PENDIENTE';
    case 'rechazadas': return s === 'RECHAZADA' || s === 'RECHAZADO';
    case 'revision': return s === 'EN_REVISION';
    default: return true;
  }
}

/* ------------------------------------------------------------------ time picker */
function TimePick({ value, onChange, demo }: { value: string; onChange: (v: string) => void; demo: string }) {
  const [h, m] = value.split(':').map(Number);
  const p = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const emit = (nh12: number, nm: number, np: string) => {
    let hh = nh12 % 12; if (np === 'PM') hh += 12;
    onChange(`${String(hh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`);
  };
  return (
    <div className="gw-timepick">
      <select value={String(h12).padStart(2, '0')} onChange={e => emit(Number(e.target.value), m, p)} data-demo={`${demo}-h`}>
        {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(x => <option key={x} value={x}>{x}</option>)}
      </select>
      <span>:</span>
      <select value={String(m).padStart(2, '0')} onChange={e => emit(h12, Number(e.target.value), p)} data-demo={`${demo}-m`}>
        {['00', '15', '30', '45'].map(x => <option key={x} value={x}>{x}</option>)}
      </select>
      <select value={p} onChange={e => emit(h12, m, e.target.value)} data-demo={`${demo}-p`}>
        <option>AM</option><option>PM</option>
      </select>
    </div>
  );
}

/* ------------------------------------------------------------------ sidebar */
const NAV: [Exclude<Screen, 'login'>, string, typeof Calendar][] = [
  ['calendario', 'Calendario', Calendar], ['eventos', 'Eventos', CalendarDays], ['anuncios', 'Anuncios', Megaphone],
  ['reportes', 'Reportes', FileText], ['usuarios', 'Usuarios', UsersIcon], ['seguridad', 'Seguridad', Shield],
];
function Sidebar({ screen, go, logout }: { screen: Screen; go: (s: Screen) => void; logout: () => void }) {
  return (
    <aside className="gw-sidebar">
      <div className="gw-profile">
        <div className="gw-avatar"><AvatarIcon /></div>
        <h2>{SESSION.nombre}</h2>
        <p>{SESSION.correo}</p>
      </div>
      <nav className="gw-nav">
        {NAV.map(([id, label, Icon]) => (
          <button key={id} className={`gw-navitem${screen === id ? ' on' : ''}`} onClick={() => go(id)} data-demo={`nav-${id}`}>
            <Icon size={20} /> <span>{label}</span>
          </button>
        ))}
      </nav>
      <div className="gw-sidefoot">
        <button className="gw-logout" onClick={logout} data-demo="nav-logout"><LogoutIcon /> Cerrar sesión</button>
        <div className="gw-sidelogo"><GeaMark size={50} /></div>
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ login */
function Login({ onOk }: { onOk: () => void }) {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (busy) return;
    if (email.trim().toLowerCase() !== 'admin@gea-demo.test' || !pass) {
      const m = 'Credenciales inválidas. Revisa tu correo y contraseña.';
      setErr(m); toast(m, 'error'); return;
    }
    setBusy(true);
    setTimeout(() => { toast(`¡Bienvenido, ${SESSION.nombre}!`, 'success'); setBusy(false); onOk(); }, 450);
  };
  return (
    <div className="gw-login">
      <div className="gw-brandcorner"><div className="gw-brandbox"><GeaMark size={30} /></div><span>GEA</span></div>
      <form className="gw-loginbox" onSubmit={submit} noValidate>
        <div className="gw-brand64"><GeaMark size={46} /></div>
        <h1>Inicia sesión</h1>
        <p className="gw-sub">Calendario institucional GEA</p>
        <label className="gw-lf">Correo
          <input type="email" value={email} onChange={e => { setEmail(e.target.value); setErr(''); }} className={err ? 'err' : ''} autoComplete="off" data-demo="login-email" />
        </label>
        <label className="gw-lf">Contraseña
          <span className="gw-pw">
            <input type={show ? 'text' : 'password'} value={pass} onChange={e => { setPass(e.target.value); setErr(''); }} className={err ? 'err' : ''} autoComplete="off" data-demo="login-password" />
            <button type="button" onClick={() => setShow(s => !s)} aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
          </span>
        </label>
        {err && <div className="gw-loginerr" role="alert"><AlertCircle size={16} /> {err}</div>}
        <button type="submit" className="gw-loginbtn" disabled={busy} data-demo="login-submit" onClick={submit}>{busy ? 'Verificando…' : 'Iniciar sesión'}</button>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------------ calendar */
function Calendario({ events, onNew }: { events: Ev[]; onNew: (d: string) => void }) {
  const [view, setView] = useState({ y: 2026, m: 9 });
  const [sel, setSel] = useState(TODAY);
  const [q, setQ] = useState('');
  const [dayModal, setDayModal] = useState<string | null>(null);
  const [light, setLight] = useState<Ev | null>(null);
  const [agenda, setAgenda] = useState(false);
  const pub = useMemo(() => events.filter(e => e.estado === 'PUBLICADA'), [events]);
  const byDay = useMemo(() => {
    const m: Record<string, Ev[]> = {};
    pub.forEach(e => { (m[e.fecha] ||= []).push(e); });
    return m;
  }, [pub]);
  const upcoming = useMemo(() => {
    const ql = q.toLowerCase();
    return pub.filter(e => e.fecha >= TODAY && (!ql || [e.title, e.office, e.lugar, e.tipo].some(s => s.toLowerCase().includes(ql))))
      .sort((a, b) => Number(!!b.important) - Number(!!a.important) || a.fecha.localeCompare(b.fecha) || a.ini.localeCompare(b.ini));
  }, [pub, q]);
  const cells = useMemo(() => {
    const first = new Date(view.y, view.m, 1).getDay();
    const out: { iso: string; d: number; other: boolean }[] = [];
    const total = Math.ceil((first + new Date(view.y, view.m + 1, 0).getDate()) / 7) * 7;
    for (let i = 0; i < total; i++) {
      const dt = new Date(view.y, view.m, 1 - first + i);
      const iso = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
      out.push({ iso, d: dt.getDate(), other: dt.getMonth() !== view.m });
    }
    return out;
  }, [view]);
  const shift = (n: number) => setView(v => { const d = new Date(v.y, v.m + n, 1); return { y: d.getFullYear(), m: d.getMonth() }; });
  const selDay = Number(sel.split('-')[2]);
  return (
    <div className="gw-page gw-calpage">
      <div className="gw-dash">
        <div className="gw-card gw-calcard" data-demo="cal-card">
          <div className="gw-calhead">
            <span className="gw-bigday">{selDay}</span>
            <div className="gw-monthcol">
              <button className="gw-mbtn">{MONTHS[view.m]} <i>▾</i></button>
              <button className="gw-ybtn">{view.y} <i>▾</i></button>
            </div>
            <div className="gw-calnav">
              <button className="gw-iconbtn" aria-label="Mes anterior" onClick={() => shift(-1)} data-demo="cal-prev"><ChevronDown size={18} style={{ transform: 'rotate(90deg)' }} /></button>
              <button className="gw-iconbtn" aria-label="Mes siguiente" onClick={() => shift(1)} data-demo="cal-next"><ChevronUp size={18} style={{ transform: 'rotate(90deg)' }} /></button>
              <button className="gw-primary gw-newbtn" onClick={() => onNew(sel)} data-demo="cal-nuevo-evento"><Plus size={16} strokeWidth={2.5} /> Nuevo Evento</button>
            </div>
          </div>
          <div className="gw-grid" data-demo="cal-grid">
            {['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'].map(d => <div key={d} className="gw-dow">{d}</div>)}
            {cells.map(c => {
              const evs = byDay[c.iso] || [];
              const colors = [...new Set(evs.map(e => tipoColor(e.tipo)))].slice(0, 4);
              const has = evs.length > 0;
              return (
                <button key={c.iso} className={`gw-cell${c.other ? ' other' : ''}${c.iso === sel ? ' sel' : ''}${c.iso === TODAY ? ' today' : ''}${has ? ' has' : ''}`}
                  data-demo={`cal-day-${c.iso}`}
                  onClick={() => { setSel(c.iso); if (has) setDayModal(c.iso); }}>
                  {evs.some(e => e.important) && <Star size={9} className="gw-cstar" fill="#ce1126" />}
                  <span className="gw-dots">{colors.map(k => <i key={k} style={{ background: k }} />)}</span>
                  {c.d}
                </button>
              );
            })}
          </div>
          <button className="gw-agenda" title="Exportar agenda PDF" onClick={() => setAgenda(true)} data-demo="cal-agenda"><FileText size={14} /> Agenda</button>
        </div>
        <div className="gw-upcoming">
          <div className="gw-uphead"><h2>Eventos próximos</h2>{upcoming.length > 0 && <span className="gw-count" data-demo="upcoming-count">{upcoming.length}</span>}</div>
          <div className="gw-search sm"><Search size={16} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por nombre, lugar..." data-demo="upcoming-search" /></div>
          <div className="gw-uplist" data-demo="upcoming-list">
            {upcoming.length === 0 && <div className="gw-empty"><Calendar size={30} /><p>{q ? `Sin resultados para "${q}"` : 'No hay eventos publicados próximos'}</p></div>}
            {upcoming.map(e => <CompactCard key={e.id} e={e} />)}
          </div>
        </div>
      </div>
      {dayModal && <DayModal iso={dayModal} events={byDay[dayModal] || []} onClose={() => setDayModal(null)} onOpen={setLight} />}
      {light && <Lightbox e={light} onClose={() => setLight(null)} />}
      {agenda && <AgendaModal onClose={() => setAgenda(false)} />}
    </div>
  );
}

function IngresoBadge({ v }: { v: Ingreso }) {
  const m = { LIBRE: ['Libre', Ticket, '#edf3ec', '#346538'], PAGO: ['Pago', DollarSign, '#fbf3db', '#956400'], PRIVADO: ['Privado', Lock, '#efeeec', '#6b6b66'] } as const;
  const [l, I, bg, fg] = m[v];
  return <span className="gw-ingreso" style={{ background: bg, color: fg }}><I size={10} /> {l}</span>;
}
function Thumb({ color, children }: { color: string; children?: ReactNode }) {
  return <div className="gw-thumb" style={{ background: `linear-gradient(135deg, ${color}11 0%, #000 180%)` }}><Calendar size={30} />{children}</div>;
}
function CompactCard({ e }: { e: Ev }) {
  const c = tipoColor(e.tipo);
  return (
    <div className="gw-ccard" data-demo={`upcoming-${e.id}`}>
      <div className="gw-cbar" style={{ background: e.important ? '#ce1126' : c, width: e.important ? 8 : 6 }} />
      <Thumb color={c}>{e.important && <span className="gw-imp"><Star size={11} fill="#fff" /> IMPORTANTE</span>}</Thumb>
      <div className="gw-cinfo">
        <div className="gw-ctipo"><i style={{ background: c }} />{e.tipo}</div>
        <IngresoBadge v={e.ingreso} />
        <h4>{e.title}</h4>
        <p className="gw-cdesc">{e.desc}</p>
        <div className="gw-cmeta"><Calendar size={13} /> {fmtShort(e.fecha)}</div>
        <div className="gw-cmeta"><Clock size={13} /> {fmtTime(e.ini)} - {fmtTime(e.fin)}</div>
        <div className="gw-cmeta"><MapPin size={13} /> {e.lugar}</div>
      </div>
    </div>
  );
}

function DayModal({ iso, events, onClose, onOpen }: { iso: string; events: Ev[]; onClose: () => void; onOpen: (e: Ev) => void }) {
  const [q, setQ] = useState('');
  const list = events.filter(e => !q || e.title.toLowerCase().includes(q.toLowerCase()) || e.lugar.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="gw-overlay gw-light" onClick={onClose} data-demo="day-modal-overlay">
      <div className="gw-daymodal" onClick={e => e.stopPropagation()} data-demo="day-modal">
        <div className="gw-dayhead">
          <div>
            <h3>Eventos del día</h3>
            <div className="gw-daysub"><span>{iso}</span><b data-demo="day-count">{events.length} {events.length === 1 ? 'evento' : 'eventos'}</b></div>
          </div>
          <button className="gw-dayclose" onClick={onClose} aria-label="Cerrar" data-demo="day-modal-close"><X size={20} /></button>
        </div>
        <div className="gw-daybar"><div className="gw-search sm"><Search size={16} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Filtrar eventos por nombre o lugar..." data-demo="day-search" /></div></div>
        <div className="gw-daybody">
          {list.length === 0 && <div className="gw-noev"><span>🔍</span>No se encontraron eventos para "{q}"</div>}
          {list.map(e => {
            const c = tipoColor(e.tipo);
            return (
              <div key={e.id} className="gw-gcard" onClick={() => onOpen(e)} data-demo={`day-event-${e.id}`}>
                <div className="gw-gbar" style={{ background: c }} />
                <div className="gw-gimg" style={{ background: `linear-gradient(135deg, ${c}11 0%, #000 180%)` }}>
                  <Calendar size={30} />
                  <span className="gw-gtipo" style={{ background: `${c}CC` }}>{e.tipo.toUpperCase()}</span>
                </div>
                <div className="gw-gbody">
                  <IngresoBadge v={e.ingreso} />
                  <h4><i style={{ background: c }} />{e.title}</h4>
                  <p>{e.desc}</p>
                  <div className="gw-gmeta" data-demo={`day-time-${e.id}`}><Clock size={14} style={{ color: c }} /> {fmtTime(e.ini)} - {fmtTime(e.fin)}</div>
                  <div className="gw-gmeta" data-demo={`day-place-${e.id}`}><MapPin size={13} style={{ color: c }} /> {e.lugar}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Lightbox({ e, onClose }: { e: Ev; onClose: () => void }) {
  const [y, m, d] = e.fecha.split('-').map(Number);
  return (
    <div className="gw-overlay gw-light" style={{ zIndex: 9500 }} onClick={onClose} data-demo="lightbox-overlay">
      <p className="gw-lbhint">Clic fuera para cerrar</p>
      <div className="gw-lightbox" onClick={x => x.stopPropagation()}>
        <button className="gw-lbx" onClick={onClose}><X size={18} /></button>
        <div className="gw-lbimg"><Calendar size={36} /><span>SIN PIEZA GRÁFICA</span></div>
        <h4>{e.title}</h4>
        <div className="gw-lbdesc">{e.desc || 'Sin descripción disponible.'}</div>
        <div className="gw-lbmeta"><span>📆 {d} de {MONTHS[m - 1].toLowerCase()} de {y}</span><span><Clock size={13} /> {fmtTime(e.ini)} a {fmtTime(e.fin)}</span><span><MapPin size={13} /> {e.lugar}</span></div>
      </div>
    </div>
  );
}

function AgendaModal({ onClose }: { onClose: () => void }) {
  const toast = useToast();
  const [a, setA] = useState('2026-10-01'); const [b, setB] = useState('2026-10-31');
  return (
    <div className="gw-overlay" onClick={onClose}>
      <div className="gw-agmodal" onClick={e => e.stopPropagation()}>
        <div className="gw-aghead"><div><h3><FileText size={18} /> Exportar Agenda</h3><p>Genera un PDF listo para compartir</p></div><button className="gw-x" onClick={onClose}><X size={16} /></button></div>
        <div className="gw-agbody">
          <div className="gw-agprev"><div className="gw-agsheet" /><div><b>Agenda PDF — Marca GEA</b><p>Eventos agrupados por día, con hora, lugar y oficina. Ideal para publicar en grupos o imprimir.</p></div></div>
          <div className="gw-agdates">
            <label>Desde<input type="date" value={a} onChange={e => setA(e.target.value)} /></label>
            <label>Hasta<input type="date" value={b} min={a} onChange={e => setB(e.target.value)} /></label>
          </div>
          <div className="gw-agbtns"><button className="gw-btn2" onClick={onClose}>Cancelar</button><button className="gw-primary" onClick={() => { toast('Agenda descargada exitosamente', 'success'); onClose(); }}><Download size={15} /> Descargar Agenda</button></div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ event modal (Crear Nueva Solicitud de Evento) */
type Part = { nombre: string; cargo: string };
function EventModal({ initialDate, onClose, onSubmit }: { initialDate: string; onClose: () => void; onSubmit: (e: Omit<Ev, 'id'>) => void }) {
  const toast = useToast();
  const [titulo, setTitulo] = useState('');
  const [desc, setDesc] = useState('');
  const [oficina, setOficina] = useState('');
  const [tipo, setTipo] = useState('Académico');
  const [ingreso, setIngreso] = useState<Ingreso>('LIBRE');
  const [lugares, setLugares] = useState<string[]>([]);
  const [externo, setExterno] = useState('');
  const [fecha, setFecha] = useState(initialDate);
  const [ini, setIni] = useState('08:00');
  const [fin, setFin] = useState('10:00');
  const [recur, setRecur] = useState('NINGUNA');
  const [hasta, setHasta] = useState('');
  const [org, setOrg] = useState<Part[]>([{ nombre: SESSION.nombre, cargo: 'Administradora' }]);
  const [invOn, setInvOn] = useState(false);
  const [patOn, setPatOn] = useState(false);
  const [reqs, setReqs] = useState<string[]>([]);
  const [obs, setObs] = useState('');
  const [siapac, setSiapac] = useState<string | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [pn, setPn] = useState(''); const [pc, setPc] = useState('');
  const hasExt = lugares.includes('Externo');

  const addLugar = (n: string) => {
    if (!n) return;
    const l = LUGARES.find(x => x.nombre === n);
    if (l?.externo) setLugares(s => [...s, n]); else setSiapac(n);
  };
  const submit = () => {
    if (!titulo.trim()) return toast('El nombre del evento es obligatorio.', 'error');
    if (!fecha) return toast('Debes seleccionar la fecha del evento.', 'error');
    if (fecha < TODAY) return toast('La fecha del evento no puede ser en el pasado.', 'error');
    if (fin <= ini) return toast('La hora de fin debe ser posterior a la hora de inicio.', 'error');
    if (recur !== 'NINGUNA' && !hasta) return toast('Debes indicar la fecha fin de la recurrencia.', 'error');
    if (hasExt && !externo.trim()) return toast('Debes indicar el lugar donde se realizará el evento externo.', 'error');
    if (org.length === 0) return toast('Debes asignar al menos un organizador para el evento.', 'error');
    onSubmit({
      title: titulo.trim(), desc: desc.trim() || 'Sin descripción.', tipo, office: oficina || 'Comunicaciones', email: SESSION.correo,
      fecha, ini, fin, lugar: lugares.map(l => (l === 'Externo' && externo ? externo : l)).join(', ') || 'Por definir', estado: 'PENDIENTE', ingreso,
    });
    toast('Solicitud de evento enviada correctamente', 'success');
    onClose();
  };
  const sec = (icon: ReactNode, title: string, body: ReactNode, demo?: string) => (
    <section className="gw-glass" data-demo={demo}><h3 className="gw-sech"><span className="gw-secicon">{icon}</span>{title}</h3>{body}</section>
  );
  return (
    <>
      <Modal title="Crear Nueva Solicitud de Evento" onClose={onClose} width={900} demo="ev-modal">
        <div className="gw-modal-b" data-demo="ev-modal-body">
          {sec(<Info size={20} />, 'Información del Evento', (
            <>
              <label className="gw-fl">Título del Evento <b>*</b>
                <input className="gw-in" value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ej: Congreso Internacional de Ingeniería" data-demo="ev-titulo" /></label>
              <label className="gw-fl">Descripción Detallada <b>*</b>
                <textarea className="gw-in gw-ta" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Describe el propósito y alcance del evento..." data-demo="ev-desc" /></label>
              <div className="gw-row2">
                <label className="gw-fl">Oficina Responsable <b>*</b>
                  <select className="gw-in" value={oficina} onChange={e => setOficina(e.target.value)} data-demo="ev-oficina">
                    <option value="">Seleccionar Oficina</option>{OFICINAS.map(o => <option key={o}>{o}</option>)}</select></label>
                <label className="gw-fl">Categoría <b>*</b>
                  <select className="gw-in" value={tipo} onChange={e => setTipo(e.target.value)} data-demo="ev-categoria">
                    {TIPOS.map(t => <option key={t.nombre}>{t.nombre}</option>)}</select></label>
              </div>
              <div className="gw-row2">
                <label className="gw-fl">Tipo de ingreso <b>*</b>
                  <select className="gw-in" value={ingreso} onChange={e => setIngreso(e.target.value as Ingreso)} data-demo="ev-ingreso">
                    <option value="LIBRE">Libre</option><option value="PAGO">Pago</option><option value="PRIVADO">Evento privado</option></select></label>
              </div>
            </>
          ))}
          {sec(<Calendar size={20} />, 'Ubicación y Tiempo', (
            <div className="gw-ut">
              <div>
                <label className="gw-fl sm"><span><MapPin size={14} /> Lugares Físicos (Presencial)</span>
                  <select className="gw-in" value="" onChange={e => addLugar(e.target.value)} data-demo="ev-lugar">
                    <option value="">Añadir un lugar...</option>
                    {LUGARES.map(l => <option key={l.nombre} disabled={lugares.includes(l.nombre)}>{l.nombre}</option>)}</select></label>
                <div className="gw-chips">
                  {lugares.length === 0 && <em>Ningún lugar seleccionado</em>}
                  {lugares.map(l => <span key={l} className="gw-chip" data-demo="ev-lugar-chip"><MapPin size={12} /> {l}<button onClick={() => setLugares(s => s.filter(x => x !== l))}><X size={12} /></button></span>)}
                </div>
                {hasExt && <label className="gw-fl">¿Dónde será el evento? <b>*</b>
                  <input className="gw-in" maxLength={300} value={externo} onChange={e => setExterno(e.target.value)} placeholder="Ej: Auditorio Central, Hotel Ramada, Parque Municipal…" data-demo="ev-externo" /></label>}
                <label className="gw-fl">Fecha del Evento <b>*</b>
                  <DateField value={fecha} onChange={setFecha} demo="ev-fecha" /></label>
              </div>
              <div className="gw-timepanel">
                <label className="gw-fl sm"><span><Clock size={14} /> Inicio <b>*</b></span><TimePick value={ini} onChange={setIni} demo="ev-ini" /></label>
                <label className="gw-fl sm"><span><Clock size={14} /> Finalización <b>*</b></span><TimePick value={fin} onChange={setFin} demo="ev-fin" /></label>
              </div>
              <div className="gw-recur">
                <h5><Calendar size={18} /> Repetir este evento (Recurrencia)</h5>
                <div className="gw-row2">
                  <label className="gw-fl sm">Frecuencia
                    <select className="gw-in" value={recur} onChange={e => setRecur(e.target.value)} data-demo="ev-recur">
                      <option value="NINGUNA">No repetir</option><option value="DIARIA">Diariamente</option><option value="SEMANAL">Semanalmente</option><option value="MENSUAL">Mensualmente</option></select></label>
                  {recur !== 'NINGUNA' && <label className="gw-fl sm">Repetir hasta <b>*</b><input type="date" min={fecha} className="gw-in" value={hasta} onChange={e => setHasta(e.target.value)} /></label>}
                </div>
              </div>
            </div>
          ))}
          {sec(<UsersIcon size={20} />, 'Equipo Organizador', (
            <>
              <p className="gw-muted">Añade a las personas encargadas de la gestión y ejecución del evento.</p>
              <div className="gw-pchips">
                {org.map((p, i) => (
                  <span key={i} className="gw-pchip"><i>{p.nombre[0]}</i><span><b>{p.nombre}</b><small>{p.cargo}</small></span><Edit2 size={13} /><button onClick={() => setOrg(o => o.filter((_, j) => j !== i))}><Trash2 size={13} /></button></span>
                ))}
                <button className="gw-dashbtn" onClick={() => setDrawer(true)} data-demo="ev-add-org"><Plus size={16} /> Añadir Organizador</button>
              </div>
            </>
          ))}
          {sec(<UsersIcon size={20} />, 'Otros Participantes', (
            <div className="gw-row2">
              <label className="gw-fl sm">Invitados Especiales<select className="gw-in" value={invOn ? '1' : '0'} onChange={e => setInvOn(e.target.value === '1')}><option value="0">No requiere</option><option value="1">Si, añadir perfiles</option></select></label>
              <label className="gw-fl sm">Patrocinadores / Aliados<select className="gw-in" value={patOn ? '1' : '0'} onChange={e => setPatOn(e.target.value === '1')}><option value="0">No requiere</option><option value="1">Si, añadir perfiles</option></select></label>
              {invOn && <button className="gw-dashbtn">Añadir Invitado</button>}
              {patOn && <button className="gw-dashbtn blue">Añadir Colaborador</button>}
            </div>
          ))}
          {sec(<ShieldCheck size={20} />, 'Requerimientos Técnicos y Adicionales', (
            <>
              <div className="gw-reqs">
                {['Transmisión', 'Cubrimiento', 'Pieza gráfica', 'Servicios generales'].map(r => (
                  <label key={r} className={`gw-req${reqs.includes(r) ? ' on' : ''}`}><input type="checkbox" checked={reqs.includes(r)} onChange={() => setReqs(s => s.includes(r) ? s.filter(x => x !== r) : [...s, r])} />{r}</label>
                ))}
              </div>
              <label className="gw-fl">Información Adicional / Observaciones
                <textarea className="gw-in gw-ta sm" value={obs} onChange={e => setObs(e.target.value)} placeholder="Cualquier otra información relevante para la logística..." /></label>
            </>
          ))}
          <section className="gw-glass gw-evfoot">
            <span><AlertCircle size={18} /> Por favor, valida que los perfiles y horarios sean correctos.</span>
            <div><button className="gw-pill gray" onClick={onClose} data-demo="ev-descartar">Descartar</button><button className="gw-pill dark" onClick={submit} data-demo="ev-enviar">Enviar Solicitud de Evento</button></div>
          </section>
        </div>
      </Modal>
      {siapac && (
        <div className="gw-overlay" style={{ zIndex: 3000 }} data-demo="siapac-overlay">
          <div className="gw-siapac" data-demo="siapac">
            <div className="gw-sicon"><Building size={24} /></div>
            <small>Confirmación requerida — SIAPAC</small>
            <h3>Préstamo de espacio</h3>
            <p>Ha seleccionado el espacio "{siapac}".</p>
            <div className="gw-siwarn"><AlertCircle size={20} /> ¿Usted ya realizó el préstamo de este espacio en el sistema SIAPAC?</div>
            <p className="gw-sinote">Recuerde que el préstamo en SIAPAC debe realizarse antes de registrar el lugar en GEA. Si aún no lo ha hecho, cancele y complete el proceso en el sistema de préstamo de aulas y espacios.</p>
            <div className="gw-sibtns"><button className="gw-btn2" onClick={() => setSiapac(null)} data-demo="siapac-cancel">Cancelar</button><button className="gw-pill dark" onClick={() => { setLugares(s => [...s, siapac]); setSiapac(null); }} data-demo="siapac-ok">Sí, ya realicé el préstamo en SIAPAC</button></div>
          </div>
        </div>
      )}
      {drawer && (
        <div className="gw-overlay" style={{ zIndex: 2000 }} onClick={() => setDrawer(false)}>
          <aside className="gw-drawer" style={{ width: 520 }} onClick={e => e.stopPropagation()}>
            <div className="gw-drawerh"><h3>Nuevo Organizador</h3><button className="gw-x" onClick={() => setDrawer(false)}><X size={20} /></button></div>
            <div className="gw-drawerb">
              <label className="gw-fl">Nombre Completo *<input className="gw-in" value={pn} onChange={e => setPn(e.target.value)} placeholder="Nombre completo del participante" /></label>
              <label className="gw-fl">Cargo / Posición *<input className="gw-in" value={pc} onChange={e => setPc(e.target.value)} placeholder="Ej. Director General" /></label>
            </div>
            <div className="gw-drawerf"><button className="gw-btn2" onClick={() => setDrawer(false)}>Cancelar</button>
              <button className="gw-primary" onClick={() => { if (!pn.trim() || !pc.trim()) return toast('Nombre y cargo son obligatorios.', 'error'); setOrg(o => [...o, { nombre: pn, cargo: pc }]); setPn(''); setPc(''); setDrawer(false); }}>Confirmar Registro</button></div>
          </aside>
        </div>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ detail modal (events/announcements) */
type Sec = { title: string; icon: ReactNode; rows: [string, ReactNode][]; full?: boolean; cols?: boolean };
const STATUS_CFG: Record<string, { c: string; bg: string; border: string; text: string; label: string; sub: string }> = {
  PENDIENTE: { c: '#f59e0b', bg: '#fffbeb', border: '#fef3c7', text: '#d97706', label: 'Pendiente', sub: 'En espera de revisión' },
  APROBADA: { c: '#10b981', bg: '#f0fdf4', border: '#dcfce7', text: '#059669', label: 'Aprobada', sub: 'Lista para ser publicada' },
  RECHAZADA: { c: '#ef4444', bg: '#fef2f2', border: '#fee2e2', text: '#dc2626', label: 'Rechazada', sub: 'Revisa el motivo del rechazo' },
  PUBLICADA: { c: '#0ea5e9', bg: '#f0f9ff', border: '#e0f2fe', text: '#0284c7', label: 'Publicada', sub: 'Visible en la plataforma' },
  EN_REVISION: { c: '#8b5cf6', bg: '#faf5ff', border: '#ede9fe', text: '#7c3aed', label: 'En revisión', sub: 'Correcciones solicitadas' },
};
const cfgOf = (s: string) => STATUS_CFG[s === 'APROBADO' ? 'APROBADA' : s === 'RECHAZADO' ? 'RECHAZADA' : s] ?? STATUS_CFG.PENDIENTE;

function DetailModal({ title, demo, status, secs, onClose, onApprove, onReject, onReview, approveLabel = 'Aprobar Solicitud', note }: {
  title: string; demo: string; status: string; secs: Sec[]; onClose: () => void; onApprove: () => void;
  onReject: (m: string) => void; onReview: (m: string) => void; approveLabel?: string; note?: string;
}) {
  const toast = useToast();
  const [mode, setMode] = useState<null | 'reject' | 'review'>(null);
  const [txt, setTxt] = useState('');
  const cfg = cfgOf(status);
  const canReview = status === 'PENDIENTE';
  return (
    <Modal title={title} onClose={onClose} width={demo === "annd" ? 600 : 750} demo={demo}>
      <div className="gw-modal-b gw-detail">
        <div className="gw-statusbar" style={{ background: cfg.bg, borderColor: cfg.border }} data-demo={`${demo}-status`}>
          <span className="gw-sbicon" style={{ background: cfg.c }}><Send size={22} /></span>
          <div><small style={{ color: cfg.text }}>{cfg.label}</small><b>{cfg.sub}</b></div>
        </div>
        {note && <div className="gw-note"><AlertCircle size={14} /> Observaciones del moderador<p>{note}</p></div>}
        <div className="gw-dgrid">
          {secs.map(s => (
            <div key={s.title} className={`gw-dcard${s.full ? ' full' : ''}`}>
              <h5><span>{s.icon}</span>{s.title}</h5>
              <div className={s.cols ? 'gw-dcols' : undefined}>{s.rows.map(([l, v]) => <div key={l} className="gw-dfield"><label>{l}</label><div>{v}</div></div>)}</div>
            </div>
          ))}
        </div>
        {canReview && (
          <div className="gw-action" data-demo={`${demo}-panel`}>
            <h4><CheckCircle size={18} /> Decisión Administrativa</h4>
            {mode && (
              <div className="gw-reason">
                <label>{mode === 'reject' ? 'Motivo del Rechazo' : 'Observaciones para la oficina'}</label>
                <textarea value={txt} onChange={e => setTxt(e.target.value)} placeholder={mode === 'reject' ? 'Indique las razones...' : 'Describa qué debe corregir la oficina antes de reenviar...'} />
              </div>
            )}
            <div className="gw-actbtns">
              {!mode && <>
                <button className="gw-btn2" onClick={() => setMode('reject')} data-demo={`${demo}-rechazar`}>Rechazar Solicitud</button>
                <button className="gw-btn2" onClick={() => setMode('review')} data-demo={`${demo}-revision`}>En revisión</button>
                <button className="gw-primary" onClick={onApprove} data-demo={`${demo}-aprobar`}>{approveLabel}</button>
              </>}
              {mode && <>
                <button className="gw-btn2" onClick={() => { setMode(null); setTxt(''); }}>Volver</button>
                <button className="gw-dark" onClick={() => {
                  if (!txt.trim()) return toast(mode === 'reject' ? 'Por favor, ingrese un motivo de rechazo.' : 'Por favor, ingrese las observaciones para la oficina.', 'error');
                  mode === 'reject' ? onReject(txt) : onReview(txt);
                }}>{mode === 'reject' ? 'Confirmar Rechazo' : 'Confirmar Devolución'}</button>
              </>}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
const chip = (t: string) => <span className="gw-chip"><MapPin size={12} /> {t}</span>;

/* ------------------------------------------------------------------ eventos */
function Eventos({ events, setEvents, onNew }: { events: Ev[]; setEvents: (f: (e: Ev[]) => Ev[]) => void; onNew: () => void }) {
  const toast = useToast();
  const [q, setQ] = useState(''); const [tab, setTab] = useState('todos'); const [det, setDet] = useState<number | null>(null);
  const rows = events.filter(e => matchTab(tab, e.estado) && (!q || [e.title, e.desc, e.email, e.tipo].some(s => s.toLowerCase().includes(q.toLowerCase()))));
  const cur = events.find(e => e.id === det);
  const setState = (id: number, estado: Ev['estado'], obs?: string) => setEvents(l => l.map(e => e.id === id ? { ...e, estado, obs } : e));
  return (
    <div className="gw-page">
      <div className="gw-pagehead"><h1 className="gw-title">Gestión de Eventos</h1><button className="gw-primary gw-createbtn" onClick={onNew} data-demo="nuevo-evento"><Plus size={18} /> Nuevo Evento</button></div>
      <div className="gw-card" data-demo="eventos-card">
        <div className="gw-filters">
          <SearchBox value={q} onChange={setQ} placeholder="Buscar por nombre, descripción o responsable..." demo="eventos-search" />
          <div className="gw-frow"><select className="gw-fsel">{DATE_OPTS.map(o => <option key={o}>{o}</option>)}</select><Tabs tabs={EST_TABS} value={tab} onChange={setTab} demo="ev-tab" /></div>
        </div>
        <div className="gw-tablewrap">
          <table className="gw-table ev" data-demo="eventos-table">
            <colgroup><col style={{ width: 44 }} /><col style={{ width: 64 }} /><col style={{ width: 250 }} /><col style={{ width: 160 }} /><col style={{ width: 150 }} /><col style={{ width: 128 }} /><col style={{ width: 56 }} /><col style={{ width: 130 }} /><col /></colgroup>
            <thead><tr><th>#</th><th>ID</th><th>Evento</th><th>Categoría</th><th>Oficina</th><th>Vigencia</th><th>Img</th><th>Estado</th><th>Acción</th></tr></thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan={9} className="gw-emptyrow"><Calendar size={40} /><p>No se encontraron registros coincidentes.</p></td></tr>}
              {rows.map((e, i) => (
                <tr key={e.id} data-demo={`evento-row-${e.id}`} className={e.id > 133 ? 'gw-newrow' : ''}>
                  <td className="gw-n">{i + 1}</td><td className="gw-id">#{e.id}</td>
                  <td><div className="gw-t1"><span className="gw-ell">{e.title}</span>{e.important && <span className="gw-starbox"><Star size={13} fill="#ce1126" /></span>}</div><div className="gw-t2 gw-ell">{e.desc}</div></td>
                  <td><span className="gw-cat" style={{ color: tipoColor(e.tipo) }}><i style={{ background: tipoColor(e.tipo) }} />{e.tipo.toUpperCase()}</span></td>
                  <td><div className="gw-t1 gw-ell2">{e.office}</div><div className="gw-t3 gw-ell2">{e.email}</div></td>
                  <td className="gw-vig">{e.fecha}</td>
                  <td>{e.img ? <span className="gw-imgthumb" /> : <FileText size={18} color="#cbd5e1" />}</td>
                  <td data-demo={`evento-estado-${e.id}`}><Badge status={e.estado} /></td>
                  <td><button className="gw-actbtn" onClick={() => setDet(e.id)} data-demo={`evento-detalles-${e.id}`}>Detalles</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {cur && (
        <DetailModal title={`Evento #${cur.id}`} demo="evd" status={cur.estado} note={cur.obs} onClose={() => setDet(null)}
          secs={[
            { title: 'Información General', icon: <Tag size={14} />, full: true, rows: [['Título del Evento *', cur.title], ['Descripción', cur.desc]] },
            { title: 'Ubicación y Tipo', icon: <MapPin size={14} />, rows: [['Lugares Físicos', chip(cur.lugar)], ['Tipo de Evento', cur.tipo], ['Tipo de Ingreso', cur.ingreso === 'LIBRE' ? 'Libre' : cur.ingreso === 'PAGO' ? 'Pago' : 'Evento privado']] },
            { title: 'Logística del Evento', icon: <Calendar size={14} />, cols: true, rows: [['Fecha del Evento *', cur.fecha], ['Hora Inicio *', fmtTime(cur.ini)], ['Hora Fin *', fmtTime(cur.fin)]] },
            { title: 'Información de la Solicitud', icon: <ShieldCheck size={14} />, full: true, rows: [['Oficina Solicitante', cur.office], ['Responsable de la Solicitud', cur.email]] },
          ]}
          onApprove={() => { setState(cur.id, 'APROBADA'); toast('Evento aprobado correctamente', 'success'); setDet(null); }}
          onReject={m => { setState(cur.id, 'RECHAZADA', m); toast('Evento rechazado', 'success'); setDet(null); }}
          onReview={m => { setState(cur.id, 'EN_REVISION', m); toast('Solicitud devuelta para revisión', 'success'); setDet(null); }} />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ anuncios */
type AnnRow = { id: number; title: string; desc: string; requester: string; office: string; email: string; start: string; end: string; place: string; status: string };
function Anuncios() {
  const toast = useToast();
  const { announcements } = useGeaStore();
  const [extras, setExtras] = useState(seedExtraAnns);
  const [q, setQ] = useState(''); const [tab, setTab] = useState('todos'); const [det, setDet] = useState<number | null>(null);
  const [create, setCreate] = useState(false); const [gal, setGal] = useState(false);
  const rows: AnnRow[] = useMemo(() => {
    const a = announcements.map(x => ({ id: x.id, title: x.title, desc: x.description, requester: x.requester, office: x.office, email: annEmail(x.office), start: x.start, end: x.end, place: x.place, status: x.status as string }));
    const b = extras.map(x => ({ ...x, desc: x.description, email: annEmail(x.office) }));
    return [...a, ...b].sort((m, n) => n.id - m.id);
  }, [announcements, extras]);
  const shown = rows.filter(r => matchTab(tab, r.status) && (!q || [r.title, r.desc, r.requester].some(s => s.toLowerCase().includes(q.toLowerCase()))));
  const cur = rows.find(r => r.id === det);
  const isStore = (id: number) => announcements.some(a => a.id === id);
  const setExtra = (id: number, status: string) => setExtras(l => l.map(x => x.id === id ? { ...x, status } : x));
  return (
    <div className="gw-page">
      <div className="gw-pagehead"><h1 className="gw-title">Gestión de Anuncios</h1>
        <div className="gw-headbtns"><button className="gw-secondary" onClick={() => setGal(true)} data-demo="ver-galeria"><LayoutGrid size={18} /> Ver Galería Pública</button>
          <button className="gw-primary gw-createbtn" onClick={() => setCreate(true)} data-demo="crear-anuncio"><Plus size={18} /> Crear Anuncio</button></div></div>
      <div className="gw-card" data-demo="anuncios-card">
        <div className="gw-filters">
          <SearchBox value={q} onChange={setQ} placeholder="Buscar anuncios por título, categoría o responsable..." demo="anuncios-search" />
          <div className="gw-frow"><select className="gw-fsel">{DATE_OPTS.map(o => <option key={o}>{o}</option>)}</select><Tabs tabs={EST_TABS} value={tab} onChange={setTab} demo="an-tab" /></div>
        </div>
        <div className="gw-tablewrap">
          <table className="gw-table an" data-demo="anuncios-table">
            <colgroup><col style={{ width: 36 }} /><col style={{ width: 60 }} /><col style={{ width: 250 }} /><col style={{ width: 290 }} /><col style={{ width: 130 }} /><col style={{ width: 140 }} /><col style={{ width: 130 }} /><col /></colgroup>
            <thead><tr><th>#</th><th>ID</th><th>Anuncio</th><th>Usuario solicitante</th><th>Vigencia</th><th>Visualización</th><th>Estado</th><th>Acción</th></tr></thead>
            <tbody>
              {shown.length === 0 && <tr><td colSpan={8} className="gw-emptyrow"><Search size={40} /><p>No se encontraron anuncios correspondientes.</p></td></tr>}
              {shown.map((r, i) => (
                <tr key={r.id} className="gw-click" onClick={() => setDet(r.id)} data-demo={`anuncio-row-${r.id}`}>
                  <td className="gw-n">{i + 1}</td><td className="gw-id">#{r.id}</td>
                  <td><div className="gw-t1 gw-ell">{r.title}</div><div className="gw-t2 gw-ell">{r.desc}</div></td>
                  <td><div className="gw-t1">{r.requester}</div><div className="gw-t3">{r.office} | {r.email}</div></td>
                  <td className="gw-vig">{r.start}<div className="gw-t3 plain">al {r.end}</div></td>
                  <td><FileText size={18} color="#cbd5e1" /></td>
                  <td data-demo={`anuncio-estado-${r.id}`}><Badge status={r.status} /></td>
                  <td><button className="gw-actbtn" onClick={e => { e.stopPropagation(); setDet(r.id); }} data-demo={`anuncio-detalles-${r.id}`}>Detalles</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {cur && (
        <DetailModal title={`Anuncio #${cur.id}`} demo="annd" status={cur.status} onClose={() => setDet(null)}
          secs={[
            { title: 'Información General', icon: <Tag size={14} />, full: true, rows: [['Título', cur.title], ['Descripción', cur.desc]] },
            { title: 'Ubicación y Contacto', icon: <MapPin size={14} />, rows: [['Lugares Físicos', chip(cur.place)], ['Correo de Contacto', cur.email]] },
            { title: 'Información de la Solicitud', icon: <ShieldCheck size={14} />, rows: [['Oficina Solicitante', cur.office], ['Usuario Solicitante', cur.requester], ['Requiere Pieza Gráfica', 'No requiere Pieza Gráfica']] },
            { title: 'Vigencia de la Publicación', icon: <Calendar size={14} />, full: true, cols: true, rows: [['Fecha Inicio', cur.start], ['Fecha Fin', cur.end], ['Hora Inicio', '8:00 AM'], ['Hora Fin', '6:00 PM']] },
          ]}
          onApprove={() => { if (isStore(cur.id)) geaStore.approveAnnouncement(cur.id); else setExtra(cur.id, 'APROBADO'); toast('Anuncio aprobado correctamente', 'success'); setDet(null); }}
          onReject={() => { setExtra(cur.id, 'RECHAZADO'); toast('Anuncio rechazado', 'success'); setDet(null); }}
          onReview={() => { setExtra(cur.id, 'EN_REVISION'); toast('Solicitud devuelta para revisión', 'success'); setDet(null); }} />
      )}
      {create && <CreateAnn onClose={() => setCreate(false)} />}
      {gal && (
        <Modal title="Galería de Anuncios" onClose={() => setGal(false)} width={1000} demo="gal-modal">
          <div className="gw-modal-b"><div className="gw-galgrid">
            {announcements.filter(a => a.status === 'APROBADO').map(a => (
              <div key={a.id} className="gw-anncard"><div className="gw-annhead" /><div className="gw-annbody"><h4>{a.title}</h4><p>{a.description}</p><div className="gw-annfoot"><span><Calendar size={12} /> {fmtShort(a.start)}</span><b>Ver más →</b></div></div></div>
            ))}
          </div></div>
        </Modal>
      )}
    </div>
  );
}

function CreateAnn({ onClose }: { onClose: () => void }) {
  const toast = useToast();
  const [t, setT] = useState(''); const [d, setD] = useState(''); const [r, setR] = useState(SESSION.nombre);
  const [s, setS] = useState(''); const [e, setE] = useState('');
  const send = () => {
    if (!t.trim() || !d.trim() || !s || !e) return toast('Completa los campos obligatorios.', 'error');
    const id = Math.max(...geaStore.get().announcements.map(a => a.id), 45) + 1;
    geaStore.addAnnouncement({ id, title: t, description: d, category: 'Institucional', requester: r, office: 'Comunicaciones', place: 'Cartelera Digital', status: 'PENDIENTE', start: s, end: e });
    toast('Solicitud de anuncio enviada correctamente', 'success'); onClose();
  };
  return (
    <Modal title="Crear Nueva Solicitud de Anuncio" onClose={onClose} width={600} demo="crear-ann-modal">
      <div className="gw-modal-b">
        <section className="gw-glass"><h3 className="gw-sech"><span className="gw-secicon"><Info size={20} /></span>Información del Anuncio</h3>
          <label className="gw-fl">Título del Anuncio <b>*</b><input className="gw-in" value={t} onChange={x => setT(x.target.value)} placeholder="Ej: Bienvenida a nuevos estudiantes..." data-demo="ann-titulo" /></label>
          <label className="gw-fl">Descripción Detallada <b>*</b><textarea className="gw-in gw-ta sm" value={d} onChange={x => setD(x.target.value)} placeholder="Describe el contenido y propósito del anuncio..." /></label>
          <label className="gw-fl">Responsable <b>*</b><input className="gw-in" value={r} onChange={x => setR(x.target.value)} placeholder="Nombre del responsable del anuncio..." /></label>
        </section>
        <section className="gw-glass"><h3 className="gw-sech"><span className="gw-secicon" style={{ color: '#16a34a' }}><Calendar size={20} /></span>Vigencia de Publicación</h3>
          <div className="gw-row2"><label className="gw-fl">Fecha de Inicio <b>*</b><input type="date" min={TODAY} className="gw-in" value={s} onChange={x => setS(x.target.value)} /></label>
            <label className="gw-fl">Fecha de Fin <b>*</b><input type="date" min={s || TODAY} className="gw-in" value={e} onChange={x => setE(x.target.value)} /></label></div>
        </section>
        <section className="gw-glass gw-evfoot"><span><AlertCircle size={18} /> Verifica las fechas de vigencia antes de enviar.</span>
          <div><button className="gw-pill gray" onClick={onClose}>Descartar</button><button className="gw-pill dark" onClick={send}>Enviar Solicitud de Anuncio</button></div></section>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ usuarios */
function Usuarios({ users, setUsers }: { users: User[]; setUsers: (f: (u: User[]) => User[]) => void }) {
  const toast = useToast();
  const [q, setQ] = useState(''); const [rol, setRol] = useState(''); const [est, setEst] = useState('');
  const [sel, setSel] = useState<number | null>(null); const [create, setCreate] = useState(false);
  const shown = users.filter(u => (!q || [u.nombre, u.correo, u.celular].some(s => s.toLowerCase().includes(q.toLowerCase()))) && (!rol || String(u.rol) === rol) && (!est || (est === 'ACTIVO') === u.activo));
  const groups = ROLE_ORDER.map(r => ({ r, label: ROLES.find(x => x.id === r)!.label, list: shown.filter(u => u.rol === r) })).filter(g => g.list.length);
  const cur = users.find(u => u.id === sel);
  return (
    <div className="gw-page">
      <div className="gw-pagehead"><h1 className="gw-title">Usuarios</h1><button className="gw-primary gw-createbtn" onClick={() => setCreate(true)} data-demo="crear-usuario"><Plus size={18} /> Crear usuario</button></div>
      <div className="gw-card" data-demo="usuarios-card">
        <div className="gw-filters">
          <SearchBox value={q} onChange={setQ} placeholder="Buscar por nombre, correo o teléfono..." demo="usuarios-search" />
          <div className="gw-frow">
            <select className="gw-fsel" value={rol} onChange={e => setRol(e.target.value)} data-demo="usuarios-filtro-rol"><option value="">Todos los Roles</option>{ROLES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}</select>
            <span className="gw-vsep" />
            <Tabs tabs={[['', 'Todos'], ['ACTIVO', 'Activos'], ['INACTIVO', 'Inactivos']]} value={est} onChange={setEst} demo="us-tab" />
          </div>
        </div>
        {shown.length === 0 && <div className="gw-dashedempty"><UserIcon size={48} /><p>No se encontraron usuarios activos.</p></div>}
        <div className="gw-rolesgrid" data-demo="usuarios-grid">
          {groups.map(g => (
            <section key={g.r} className={g.r === 3 ? 'span2' : ''} data-demo={`rol-seccion-${g.r}`}>
              <h3>{g.label}</h3>
              <div className="gw-ucards">
                {g.list.map(u => (
                  <div key={u.id} className="gw-ucard" data-demo={`user-card-${u.id}`}>
                    <span className="gw-uav"><UserIcon size={24} /></span>
                    <div className="gw-umain">
                      <div className="gw-uname"><h4>{u.nombre}</h4><span className={`gw-ustate${u.activo ? '' : ' off'}`}><i />{u.activo ? 'Activo' : 'Inactivo'}</span></div>
                      <p>{u.celular || 'Sin celular'}</p><p>{u.correo || 'Sin correo'}</p>
                      <button className="gw-viewbtn" onClick={() => setSel(u.id)} data-demo={`user-ver-${u.id}`}><Eye size={14} /> Ver Detalles</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
      {cur && <UserDrawer key={cur.id} user={cur} onClose={() => setSel(null)}
        onSave={(patch, msg) => { setUsers(l => l.map(u => u.id === cur.id ? { ...u, ...patch } : u)); toast(msg, 'success'); setSel(null); }}
        onDelete={() => { setUsers(l => l.filter(u => u.id !== cur.id)); toast('Usuario eliminado permanentemente', 'success'); setSel(null); }} />}
      {create && <CreateUser onClose={() => setCreate(false)} onCreate={u => { setUsers(l => [...l, { ...u, id: Math.max(...l.map(x => x.id)) + 1 }]); toast('Usuario creado correctamente', 'success'); setCreate(false); }} />}
    </div>
  );
}

function UserDrawer({ user, onClose, onSave, onDelete }: { user: User; onClose: () => void; onSave: (p: Partial<User>, m: string) => void; onDelete: () => void }) {
  const toast = useToast();
  const [edit, setEdit] = useState(false);
  const [f, setF] = useState({ nombre: user.nombre, correo: user.correo, celular: user.celular, pass: '', rol: String(user.rol), oficina: user.oficina });
  const rolLabel = (r: number | string) => ROLES.find(x => x.id === Number(r))!.label;
  const needsOffice = f.rol !== '4' && f.rol !== '5';
  const save = () => {
    if (f.pass && f.pass.length < 6) return toast('La contraseña debe tener al menos 6 caracteres, o déjala en blanco para no cambiarla.', 'error');
    onSave({ nombre: f.nombre, correo: f.correo, celular: f.celular, rol: Number(f.rol) as Rol, oficina: needsOffice ? f.oficina : '' }, 'Usuario actualizado correctamente');
  };
  return (
    <div className="gw-overlay" onClick={onClose} data-demo="drawer-overlay">
      <aside className="gw-drawer" onClick={e => e.stopPropagation()} data-demo="user-drawer">
        <div className="gw-drawerh"><h3>{edit ? 'Editar Usuario' : 'Perfil de Usuario'}</h3><button className="gw-x" onClick={onClose} data-demo="drawer-close"><X size={20} /></button></div>
        <div className="gw-drawerb">
          <div className="gw-davatar" style={edit ? { width: 100, height: 100 } : undefined}><AvatarIcon size={edit ? 46 : 56} /></div>
          {!edit && <div className="gw-dname"><h2>{user.nombre}</h2><span className="gw-rolepill" data-demo="drawer-rol-pill">{rolLabel(user.rol)}</span></div>}
          {edit && <button className="gw-viewbtn" style={{ alignSelf: 'center', width: 'auto', padding: '6px 18px', marginTop: 0 }}><Camera size={14} /> Cambiar Foto</button>}
          {!edit ? (
            <>
              <div className="gw-dcard"><h5><span><UserIcon size={16} /></span>Información Personal</h5>
                <div className="gw-dfield"><label>Nombre Completo</label><div>{user.nombre}</div></div>
                <div className="gw-dfield"><label><Mail size={14} /> Correo</label><div>{user.correo || 'Sin correo'}</div></div>
                <div className="gw-dfield"><label><Phone size={14} /> Teléfono</label><div>{user.celular || 'Sin celular'}</div></div></div>
              <div className="gw-dcard"><h5><span><Lock size={16} /></span>Configuración de Cuenta</h5>
                <div className="gw-dfield"><label>Rol Institucional</label><div data-demo="drawer-rol-text">{rolLabel(user.rol)}</div></div>
                <div className="gw-dfield"><label>Oficina</label><div>{user.rol === 4 ? 'N/A (Estudiante)' : user.oficina || 'No asignada'}</div></div></div>
            </>
          ) : (
            <>
              <label className="gw-fl">Nombre Completo<input className="gw-in" value={f.nombre} onChange={e => setF({ ...f, nombre: e.target.value })} /></label>
              <label className="gw-fl"><span><Mail size={14} /> Correo</span><input className="gw-in" value={f.correo} onChange={e => setF({ ...f, correo: e.target.value })} /></label>
              <label className="gw-fl"><span><Phone size={14} /> Teléfono</span><input className="gw-in" value={f.celular} onChange={e => setF({ ...f, celular: e.target.value })} /></label>
              <label className="gw-fl">Contraseña (Dejar en blanco para no cambiar)<input type="password" className="gw-in" value={f.pass} onChange={e => setF({ ...f, pass: e.target.value })} placeholder="Mínimo 6 caracteres" /></label>
              <label className="gw-fl"><span><Shield size={14} /> Rol Institucional</span>
                <select className="gw-in" value={f.rol} onChange={e => setF({ ...f, rol: e.target.value, oficina: e.target.value === '2' ? 'Comunicaciones' : f.oficina })} data-demo="drawer-rol">
                  {ROLES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}</select></label>
              {needsOffice && <label className="gw-fl"><span><Building size={14} /> Oficina</span>
                <select className="gw-in" value={f.oficina} onChange={e => setF({ ...f, oficina: e.target.value })}><option value="">Seleccione una oficina...</option>{OFICINAS.map(o => <option key={o}>{o}</option>)}</select></label>}
              {f.rol === '4' && <p className="gw-muted"><Info size={14} /> Los estudiantes no requieren oficina.</p>}
            </>
          )}
        </div>
        <div className="gw-drawerf">
          {!edit ? (<><button className="gw-btn2" onClick={onClose} data-demo="drawer-cerrar">Cerrar</button><button className="gw-primary" onClick={() => setEdit(true)} data-demo="drawer-modificar">Modificar</button></>) : (
            <>
              <div className="gw-dleft">
                <button className="gw-danger" onClick={() => onSave({ activo: !user.activo }, user.activo ? 'Cuenta desactivada' : 'Cuenta activada correctamente')}>{user.activo ? 'Desactivar Cuenta' : 'Activar Cuenta'}</button>
                <button className="gw-danger" onClick={onDelete}>Eliminar</button>
              </div>
              <button className="gw-btn2" onClick={() => setEdit(false)} data-demo="drawer-cancelar">Cancelar</button>
              <button className="gw-primary" onClick={save} data-demo="drawer-guardar">Guardar</button>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}

function CreateUser({ onClose, onCreate }: { onClose: () => void; onCreate: (u: Omit<User, 'id'>) => void }) {
  const toast = useToast();
  const [f, setF] = useState({ nombre: '', correo: '', celular: '', pass: '', rol: '4', oficina: '' });
  const send = () => {
    if (!f.nombre.trim() || !f.correo.trim() || !f.pass) return toast('Completa los campos obligatorios.', 'error');
    onCreate({ nombre: f.nombre, correo: f.correo, celular: f.celular, rol: Number(f.rol) as Rol, activo: true, oficina: f.oficina });
  };
  return (
    <Modal title="Crear Nuevo Usuario" onClose={onClose} width={600} demo="crear-user-modal">
      <div className="gw-modal-b">
        <section className="gw-glass"><h3 className="gw-sech"><span className="gw-secicon"><UserIcon size={16} /></span>Datos Personales</h3>
          <label className="gw-fl">Nombre Completo<input className="gw-in" value={f.nombre} onChange={e => setF({ ...f, nombre: e.target.value })} placeholder="Juan Pérez..." /></label>
          <div className="gw-row2"><label className="gw-fl"><span><Mail size={14} /> Correo</span><input className="gw-in" value={f.correo} onChange={e => setF({ ...f, correo: e.target.value })} placeholder="user@ejemplo.edu" /></label>
            <label className="gw-fl"><span><Phone size={14} /> Teléfono</span><input className="gw-in" value={f.celular} onChange={e => setF({ ...f, celular: e.target.value })} placeholder="300..." /></label></div></section>
        <section className="gw-glass"><h3 className="gw-sech"><span className="gw-secicon"><Lock size={16} /></span>Configuración de Cuenta</h3>
          <label className="gw-fl">Contraseña Temporal<input type="password" className="gw-in" value={f.pass} onChange={e => setF({ ...f, pass: e.target.value })} placeholder="********" /></label>
          <label className="gw-fl"><span><Shield size={14} /> Rol Institucional</span><select className="gw-in" value={f.rol} onChange={e => setF({ ...f, rol: e.target.value })}>{ROLES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}</select></label></section>
        <section className="gw-glass gw-evfoot"><span><AlertCircle size={15} /> El usuario deberá cambiar su clave al ingresar.</span><div><button className="gw-pill gray" onClick={onClose}>Cancelar</button><button className="gw-pill dark" onClick={send}>Crear Usuario</button></div></section>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ reportes (solo lectura) */
const MONTH_VALS = [0, 0, 0, 0, 0, 0, 0, 1, 18, 0, 0, 0];
function AreaChart() {
  const W = 600, H = 220, L = 34, R = 10, T = 14, B = 26, max = 19;
  const x = (i: number) => L + (i * (W - L - R)) / 11, y = (v: number) => T + (H - T - B) * (1 - v / max);
  let d = `M ${x(0)} ${y(MONTH_VALS[0])}`;
  for (let i = 1; i < 12; i++) { const mx = (x(i - 1) + x(i)) / 2; d += ` C ${mx} ${y(MONTH_VALS[i - 1])}, ${mx} ${y(MONTH_VALS[i])}, ${x(i)} ${y(MONTH_VALS[i])}`; }
  const area = `${d} L ${x(11)} ${y(0)} L ${x(0)} ${y(0)} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="gw-svgchart">
      <defs><linearGradient id="gwarea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ce1126" stopOpacity=".28" /><stop offset="100%" stopColor="#ce1126" stopOpacity="0" /></linearGradient></defs>
      {[0, 5, 10, 15, 19].map(t => <g key={t}><line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="#f1f5f9" /><text x={L - 10} y={y(t) + 3} textAnchor="end" fontSize="10" fill="#6b6b66">{t}</text></g>)}
      <path d={area} fill="url(#gwarea)" /><path d={d} fill="none" stroke="#ce1126" strokeWidth="2" />
      {MONTHS.map((m, i) => <text key={m} x={x(i)} y={H - 6} textAnchor="middle" fontSize="9" fill="#6b6b66">{m}</text>)}
      <circle cx={x(8)} cy={y(18)} r="5" fill="#ce1126" stroke="#fff" strokeWidth="1.5" /><text x={x(8)} y={y(18) - 10} textAnchor="middle" fontSize="11" fontWeight="800" fill="#1a1a1a">18</text>
      <circle cx={x(11)} cy={y(0)} r="5" fill="#ce1126" stroke="#fff" strokeWidth="1.5" /><text x={x(11)} y={y(0) - 10} textAnchor="middle" fontSize="11" fontWeight="800" fill="#1a1a1a">0</text>
    </svg>
  );
}
function Donut() {
  const parts: [string, number, string][] = [['Publicada', 10, '#0ea5e9'], ['Aprobada', 2, '#10b981'], ['En revisión', 2, '#8b5cf6'], ['Rechazada', 2, '#ef4444'], ['Pendiente', 3, '#f59e0b']];
  const total = 19, r = 62, C = 2 * Math.PI * r; let acc = 0; const gap = 3;
  return (
    <div className="gw-donutwrap">
      <svg viewBox="0 0 180 180" width="190" height="190">
        <g transform="rotate(-90 90 90)">{parts.map(([n, v, c]) => { const len = (v / total) * C; const el = <circle key={n} cx="90" cy="90" r={r} fill="none" stroke={c} strokeWidth="17" strokeDasharray={`${Math.max(len - gap, 1)} ${C}`} strokeDashoffset={-acc} />; acc += len; return el; })}</g>
        <text x="90" y="92" textAnchor="middle" fontSize="22" fontWeight="800" fill="#1a1a1a">19</text><text x="90" y="108" textAnchor="middle" fontSize="9" fill="#9a9a93" letterSpacing=".5">TOTAL</text>
      </svg>
      <div className="gw-legend">{[['Aprobada', 2, '#10b981'], ['En revisión', 2, '#8b5cf6'], ['Pendiente', 3, '#f59e0b'], ['Publicada', 10, '#0ea5e9'], ['Rechazada', 2, '#ef4444']].map(([n, v, c]) => <span key={n as string}><i style={{ background: c as string }} />{n} <b>({v})</b></span>)}</div>
    </div>
  );
}
function Reportes() {
  const [seg, setSeg] = useState<'todo' | 'eventos' | 'anuncios'>('todo');
  const offs: [string, number, string][] = [['Bienestar Universitario', 10, '#8c0c1a'], ['Biblioteca', 6, '#a90f20'], ['Egresados', 2, '#ce1126'], ['Proyección Social', 1, '#dc3e4f']];
  const tipos: [string, number, string][] = [['Académico', 3, '#ce1126'], ['Investigación', 2, '#0f766e'], ['Cultural', 2, '#8b5cf6'], ['Otra', 2, '#64748b'], ['Proyección Social', 1, '#0ea5e9'], ['Bienestar Institucional', 1, '#f59e0b']];
  const kpis = [[BarChart3, '19', 'Total Solicitudes', '#3b82f6'], [CheckCircle2, '12', 'Aprobadas', '#16a34a'], [Clock, '3', 'Pendientes', '#f59e0b'], [XCircle, '2', 'Rechazadas', '#ce1126'], [TrendingUp, '63.16%', 'Tasa Aprobación', '#8b5cf6']] as const;
  return (
    <div className="gw-page" data-demo="reportes-page">
      <div className="gw-pagehead"><h1 className="gw-title">Gestión de Reportes</h1><button className="gw-primary gw-createbtn"><Plus size={18} /> Nuevo Reporte</button></div>
      <div className="gw-card">
        <div className="gw-filters"><div className="gw-frow wide"><div className="gw-search grow"><Search size={18} /><input readOnly placeholder="Buscar reporte por título o descripción..." /></div></div>
          <div className="gw-frow"><select className="gw-fsel"><option>Todas las fechas</option></select><select className="gw-fsel"><option>Todas las oficinas</option></select><button className="gw-tab clear">Limpiar filtros</button></div></div>
        <div className="gw-tablewrap"><table className="gw-table"><thead><tr><th style={{ width: 40 }}>#</th><th style={{ width: 60 }}>ID</th><th>Nombre del Reporte</th><th>Descripción</th><th>Oficina</th><th>Usuario</th><th>Fecha Generación</th><th>Formato</th><th>Acciones</th></tr></thead>
          <tbody>{seedReports.map((r, i) => (
            <tr key={r.id}><td className="gw-n">{i + 1}</td><td className="gw-id">#{r.id}</td><td><span className="gw-redt gw-ell">{r.titulo}</span></td><td><span className="gw-t2 gw-ell">{r.desc}</span></td><td className="gw-t1s">{r.oficina}</td><td className="gw-t1s">{r.usuario}</td><td className="gw-t1s">{r.fecha}</td>
              <td><span className={`gw-fmt ${r.formato.toLowerCase()}`}>{r.formato}</span></td><td><div className="gw-racts"><button className="gw-actbtn">Ver</button><button className="gw-dlbtn"><Download size={14} /></button></div></td></tr>))}</tbody></table></div>
      </div>
      <div className="gw-stats" data-demo="reportes-stats">
        <div className="gw-statshead"><div><h2>Panel de Estadísticas</h2><p>Análisis de solicitudes según los filtros seleccionados</p></div>
          <div className="gw-seg">{(['todo', 'eventos', 'anuncios'] as const).map(k => <button key={k} className={`gw-tab${seg === k ? ' on' : ''}`} onClick={() => setSeg(k)}>{k === 'todo' ? 'Todo' : k === 'eventos' ? 'Eventos' : 'Anuncios'}</button>)}</div></div>
        <div className="gw-chip2"><Layers size={12} /> {seg === 'todo' ? 'Todo' : seg === 'eventos' ? 'Eventos' : 'Anuncios'}</div>
        <div className="gw-kpis">{kpis.map(([I, v, l, c]) => <div key={l} className="gw-kpi"><span style={{ background: `${c}15`, color: c }}><I size={24} /></span><div><b>{v}</b><small>{l}</small></div></div>)}</div>
        <div className="gw-charts">
          <div className="gw-chart"><h4>Tendencia Mensual de Solicitudes</h4><AreaChart /></div>
          <div className="gw-chart"><h4>Solicitudes por Oficina</h4><div className="gw-hbars">{offs.map(([n, v, c]) => <div key={n}><span>{n}</span><i style={{ width: `${(v / 10) * 78}%`, background: c }} /><b>{v}</b></div>)}</div></div>
          <div className="gw-chart"><h4>Distribución de Estados</h4><Donut /></div>
          {seg !== 'anuncios' && <div className="gw-chart"><h4>Eventos por tipo</h4><div className="gw-typelist">{tipos.map(([n, v, c]) => <div key={n}><div><i style={{ background: c }} />{n}<b>{v}</b></div><span><em style={{ width: `${(v / 3) * 100}%`, background: c }} /></span></div>)}</div></div>}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ seguridad (solo lectura) */
function Seguridad() {
  return (
    <div className="gw-page" data-demo="seguridad-page">
      <h1 className="gw-title gw-sectitle"><Shield size={24} color="#ce1126" /> Panel de Seguridad</h1>
      <div className="gw-card">
        <div className="gw-secfilters">
          <div className="gw-search sec"><Search size={18} /><input readOnly placeholder="Filtrar por correo..." /></div>
          <div className="gw-secrow"><input className="gw-ipin" readOnly placeholder="IP" /><select className="gw-secsel"><option>Todos</option></select><label>Desde <span className="gw-fakedate">dd/mm/aaaa <CalendarDays size={14} /></span></label><label>Hasta <span className="gw-fakedate">dd/mm/aaaa <CalendarDays size={14} /></span></label><button className="gw-tab clear">Limpiar</button></div>
        </div>
        <table className="gw-table sec"><thead><tr><th>Estado</th><th>Correo</th><th>Método</th><th>Motivo</th><th>IP</th><th>Fecha</th></tr></thead>
          <tbody>{seedLogins.map((l, i) => <tr key={i}><td><span className="gw-ok"><CheckCircle2 size={13} /> Exitoso</span></td><td className="gw-t1s b">{l.correo}</td><td>{l.metodo}</td><td>{l.motivo}</td><td className="gw-mono">{l.ip}</td><td className="gw-t1s">{l.fecha}</td></tr>)}</tbody></table>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ root */
export default function GeaWebReplica({ startScreen = 'login' }: GeaWebReplicaProps) {
  const [screen, setScreen] = useState<Screen>(startScreen);
  const [events, setEventsState] = useState<Ev[]>(seedEvents);
  const [users, setUsersState] = useState<User[]>(seedUsers);
  const [evModal, setEvModal] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(1);
  const bodyRef = useRef<HTMLDivElement>(null);
  const toast = useCallback((text: string, kind: ToastItem['kind'] = 'info') => {
    const id = idRef.current++;
    setToasts(t => [...t.filter(x => !(kind === 'error' && x.text === text)), { id, text, kind }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  }, []);
  useEffect(() => { bodyRef.current?.scrollTo({ top: 0 }); }, [screen]);
  const go = (s: Screen) => { setScreen(s); };
  const addEvent = (e: Omit<Ev, 'id'>) => setEventsState(l => [{ ...e, id: Math.max(...l.map(x => x.id)) + 1 }, ...l]);
  return (
    <ToastCtx.Provider value={toast}>
      <div className="gw-root" data-demo="gea-root">
        <div className="gw-stage">
          {screen === 'login' ? <Login onOk={() => go('calendario')} /> : (
            <div className="gw-layout">
              <Sidebar screen={screen} go={go} logout={() => go('login')} />
              <main className="gw-main"><div className="gw-content" ref={bodyRef} data-demo="gw-content">
                {screen === 'calendario' && <Calendario events={events} onNew={d => setEvModal(d)} />}
                {screen === 'eventos' && <Eventos events={events} setEvents={setEventsState} onNew={() => setEvModal('')} />}
                {screen === 'anuncios' && <Anuncios />}
                {screen === 'reportes' && <Reportes />}
                {screen === 'usuarios' && <Usuarios users={users} setUsers={setUsersState} />}
                {screen === 'seguridad' && <Seguridad />}
              </div></main>
              {evModal !== null && <EventModal initialDate={evModal} onClose={() => setEvModal(null)} onSubmit={addEvent} />}
            </div>
          )}
          <div className="gw-toasts" aria-live="polite">
            {toasts.map(t => (
              <div key={t.id} className={`gw-toast ${t.kind}`} role="status">
                <span className="gw-toasticon">{t.kind === 'success' ? '✅' : t.kind === 'error' ? '⚠️' : 'ℹ️'}</span><span>{t.text}</span>
                <i className="gw-toastbar" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToastCtx.Provider>
  );
}
export { GeaWebReplica };
