import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { useGeaStore } from '../geaStore';
import type { Announcement } from '../geaStore';
import { Icon } from './GeaPhoneIcons';
import type { GpIconName } from './GeaPhoneIcons';
import {
  GP_EVENTS, GP_NOW, GP_PLACES, GP_REQUESTS, GP_STATUS, GP_USER, cap, countdown, dayShort, evPlace, fmtDayTitle, fmtLong,
  fmtPick, fmtShort, fmtWeekday, fmtWeekdayYear, isLive, iso, monthName, parseD, sameDay, t12,
} from './geaPhoneData';
import type { GpEvent, GpRequest, GpReqStatus } from './geaPhoneData';
import './GeaPhoneReplica.css';

type Tab = 'calendario' | 'anuncios' | 'solicitudes' | 'perfil';
type Props = { startTab?: Tab | 'login'; liveSync?: boolean; empty?: boolean; showStatusBar?: boolean };
type Sheet =
  | { k: 'event'; id: number } | { k: 'ann'; id: number } | { k: 'share'; id: number }
  | { k: 'places' } | { k: 'pinlogin' } | { k: 'pick'; f: 'ds' | 'de' | 'hs' | 'he' }
  | { k: 'logout' } | { k: 'loginreq' };
type Overlay = null | 'notifications' | 'pinned' | 'form';

const PRIMARY = '#E53935';
const GOLD = '#D97706';
const alpha = (c: string, a: number) => `color-mix(in srgb, ${c} ${Math.round(a * 100)}%, transparent)`;
const grad = (c: string): CSSProperties => ({ background: `linear-gradient(135deg, ${c}, ${alpha(c, 0.6)})` });

const NAV: { id: Tab; label: string; icon: GpIconName; sel: GpIconName }[] = [
  { id: 'calendario', label: 'Calendario', icon: 'calendar_today_outlined', sel: 'calendar_today' },
  { id: 'anuncios', label: 'Anuncios', icon: 'campaign', sel: 'campaign' },
  { id: 'solicitudes', label: 'Solicitudes', icon: 'receipt_long', sel: 'receipt_long' },
  { id: 'perfil', label: 'Perfil', icon: 'person_outline', sel: 'person' },
];

/* ------------------------------------------------------------------ small widgets */
function GlassCard({ children, accent = PRIMARY, className = '', onClick, demo, style }: { children: ReactNode; accent?: string; className?: string; onClick?: () => void; demo?: string; style?: CSSProperties }) {
  return (
    <div className={`gp-glass ${className}`} data-demo={demo} onClick={onClick} style={{ borderColor: alpha(accent, 0.25), ...style }}>
      {children}
    </div>
  );
}

function Btn({ text, onClick, variant = 'primary', icon, loading, demo, disabled }: { text: string; onClick?: () => void; variant?: 'primary' | 'secondary' | 'danger' | 'ghost'; icon?: GpIconName; loading?: boolean; demo?: string; disabled?: boolean }) {
  return (
    <button type="button" className={`gp-btn gp-btn-${variant}`} data-demo={demo} onClick={onClick} disabled={loading || disabled}>
      {loading ? <span className="gp-spin" /> : <>{icon && <Icon n={icon} size={18} />}<span>{text}</span></>}
    </button>
  );
}

function Field({ label, hint, icon, value, onChange, type = 'text', readOnly, multiline, error, demo }: { label: string; hint?: string; icon?: GpIconName; value: string; onChange?: (v: string) => void; type?: string; readOnly?: boolean; multiline?: boolean; error?: string; demo?: string }) {
  const cls = `gp-input${readOnly ? ' gp-ro' : ''}${error ? ' gp-err' : ''}${multiline ? ' gp-multi' : ''}`;
  return (
    <label className="gp-field">
      <span className="gp-field-label">{label}</span>
      <span className={cls}>
        {icon && <Icon n={icon} size={20} color="#94A3B8" />}
        {multiline
          ? <textarea data-demo={demo} rows={4} value={value} placeholder={hint ?? label} onChange={e => onChange?.(e.target.value)} />
          : <input data-demo={demo} type={type} value={value} placeholder={hint ?? label} readOnly={readOnly} onChange={e => onChange?.(e.target.value)} />}
      </span>
      {error && <span className="gp-field-err">{error}</span>}
    </label>
  );
}

function EmptyState({ icon, title, desc, action, onAction, demo }: { icon: GpIconName; title: string; desc: string; action?: string; onAction?: () => void; demo?: string }) {
  return (
    <div className="gp-empty" data-demo={demo}>
      <div className="gp-empty-circle"><Icon n={icon} size={48} color="#94A3B8" /></div>
      <h3>{title}</h3>
      <p>{desc}</p>
      {action && <div className="gp-empty-act"><Btn text={action} onClick={onAction} /></div>}
    </div>
  );
}

function StreamBadge({ e }: { e: GpEvent }) {
  if (!e.link) return null;
  const live = isLive(e);
  const c = live ? '#DC2626' : '#673AB7';
  return (
    <span className="gp-stream" data-demo={`stream-${e.id}`} style={{ color: c, borderColor: alpha(c, 0.4), background: alpha(c, 0.12) }}>
      <i style={{ background: c }} />{live ? 'EN VIVO' : 'STREAM'}
    </span>
  );
}

function CountdownChip({ e }: { e: GpEvent }) {
  const c = countdown(e);
  if (!c) return null;
  const col = c.live ? '#059669' : PRIMARY;
  return (
    <span className="gp-chip-cd" style={{ color: col, background: alpha(col, 0.12), borderColor: alpha(col, 0.3) }}>
      <Icon n={c.live ? 'radio_button_checked' : 'access_time'} size={11} />{c.text}
    </span>
  );
}

function StatusBadge({ status, demo }: { status: GpReqStatus; demo?: string }) {
  const s = GP_STATUS[status];
  return <span className="gp-status" data-demo={demo} style={{ color: s.color, background: alpha(s.color, 0.12), borderColor: alpha(s.color, 0.35) }}>{s.label}</span>;
}

function Bell({ count, onClick, id }: { count: number; onClick: () => void; id: string }) {
  return (
    <button type="button" className="gp-iconbtn gp-bell" data-demo={`bell-${id}`} onClick={onClick} aria-label="Notificaciones">
      <Icon n={count > 0 ? 'notifications_active_outlined' : 'notifications_outlined'} size={26} color={count > 0 ? GOLD : '#0F172A'} />
      {count > 0 && <span key={count} className="gp-badge" data-demo={`bell-badge-${id}`}>{count > 9 ? '9+' : count}</span>}
    </button>
  );
}

function AppBar({ title, center, actions, onBack }: { title: string; center?: boolean; actions?: ReactNode; onBack?: () => void }) {
  return (
    <div className={`gp-appbar${center ? ' gp-center' : ''}`}>
      {onBack && <button type="button" className="gp-iconbtn" data-demo="back" onClick={onBack} aria-label="Atrás"><Icon n="arrow_back" size={22} /></button>}
      <h1>{title}</h1>
      <div className="gp-appbar-act">{actions}</div>
    </div>
  );
}

function InfoRow({ icon, text }: { icon: GpIconName; text: string }) {
  return <div className="gp-inforow"><Icon n={icon} size={20} color="#475569" /><span>{text}</span></div>;
}

function PinBtn({ pinned, size = 22, onClick, demo, onDark }: { pinned: boolean; size?: number; onClick: () => void; demo?: string; onDark?: boolean }) {
  return (
    <button type="button" className="gp-pin" data-demo={demo} onClick={e => { e.stopPropagation(); onClick(); }} aria-label="Fijar evento">
      <Icon n={pinned ? 'bookmark' : 'bookmark_outline'} size={size} color={pinned ? PRIMARY : onDark ? 'rgba(255,255,255,.85)' : 'rgba(15,23,42,.4)'} style={{ transition: 'color .3s cubic-bezier(.175,.885,.32,1.275)' }} />
    </button>
  );
}

/* ------------------------------------------------------------------ event card */
function EventCard({ e, pinned, onOpen, onPin, idx }: { e: GpEvent; pinned: boolean; onOpen: () => void; onPin: () => void; idx: number }) {
  const accent = e.important ? GOLD : e.color;
  return (
    <div className={`gp-cardwrap gp-rise${e.important ? ' gp-pulse' : ''}`} style={{ animationDelay: `${idx * 50}ms` }}>
      <GlassCard accent={accent} className="gp-evcard" demo={`event-${e.id}`} onClick={onOpen}>
        <div className="gp-evbar" style={{ background: accent }} />
        <div className="gp-evbody">
          <div className="gp-evtitle">
            {e.important && <Icon n="star" size={16} color={GOLD} />}
            <span>{e.title}</span>
          </div>
          {e.description && <p className="gp-evdesc">{e.description}</p>}
          <div className="gp-evrow"><Icon n="access_time" size={14} />{t12(e.start)} - {t12(e.end)}</div>
          <div className="gp-evrow"><Icon n="location_on_outlined" size={14} /><span className="gp-ell">{e.external ?? evPlace(e)}</span></div>
          <div className="gp-evchips"><CountdownChip e={e} /><StreamBadge e={e} /></div>
          <div className="gp-evcat" style={{ color: accent }}>{e.category}</div>
        </div>
        {e.image && (
          <div className="gp-evimg" style={grad(e.color)}>
            <Icon n="calendar_month" size={40} color="rgba(255,255,255,.35)" />
            <div className="gp-evpin"><PinBtn pinned={pinned} size={16} onDark demo={`pin-${e.id}`} onClick={onPin} /></div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

/* ------------------------------------------------------------------ calendar */
function startOfWeek(d: Date) { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); const w = (x.getDay() + 6) % 7; x.setDate(x.getDate() - w); return x; }

function CalendarTab({ events, pinned, bell, onOpen, onPin }: { events: GpEvent[]; pinned: Set<number>; bell: ReactNode; onOpen: (id: number) => void; onPin: (id: number) => void }) {
  const [selected, setSelected] = useState(() => new Date(2026, 9, 12));
  const [focused, setFocused] = useState(() => new Date(2026, 9, 12));
  const [fmt, setFmt] = useState<'month' | 'week'>('month');
  const [page, setPage] = useState(0);
  const byDay = useMemo(() => { const m = new Map<string, GpEvent[]>(); events.forEach(e => m.set(e.date, [...(m.get(e.date) ?? []), e])); return m; }, [events]);
  const dayEvents = useMemo(() => (byDay.get(iso(selected)) ?? []).slice().sort((a, b) => Number(b.important) - Number(a.important) || a.start.localeCompare(b.start)), [byDay, selected]);
  const featured = useMemo(() => events.filter(e => e.important && parseD(e.date) >= new Date(2026, 9, 12)).sort((a, b) => a.date.localeCompare(b.date)), [events]);

  const cells: (Date | null)[] = useMemo(() => {
    if (fmt === 'week') { const s = startOfWeek(focused); return Array.from({ length: 7 }, (_, i) => new Date(s.getFullYear(), s.getMonth(), s.getDate() + i)); }
    const first = new Date(focused.getFullYear(), focused.getMonth(), 1);
    const s = startOfWeek(first);
    const last = new Date(focused.getFullYear(), focused.getMonth() + 1, 0);
    const rows = Math.ceil(((first.getTime() - s.getTime()) / 86400000 + last.getDate()) / 7);
    return Array.from({ length: rows * 7 }, (_, i) => { const d = new Date(s.getFullYear(), s.getMonth(), s.getDate() + i); return d.getMonth() === focused.getMonth() ? d : null; });
  }, [fmt, focused]);

  const step = (dir: number) => setFocused(f => fmt === 'week' ? new Date(f.getFullYear(), f.getMonth(), f.getDate() + 7 * dir) : new Date(f.getFullYear(), f.getMonth() + dir, 1));
  const title = `${monthName(focused.getMonth())} ${focused.getFullYear()}`;
  const toggle = () => { setFmt(f => f === 'month' ? 'week' : 'month'); setFocused(selected); };

  return (
    <>
      <AppBar title="Calendario de Eventos" actions={<>
        <button type="button" className="gp-iconbtn" data-demo="open-pinned" aria-label="Eventos fijados" onClick={() => onOpen(-1)}><Icon n="bookmark_outline" size={22} /></button>
        <button type="button" className="gp-iconbtn" data-demo="cal-format" aria-label={fmt === 'week' ? 'Ver mes completo' : 'Ver semana'} onClick={toggle}><Icon n={fmt === 'week' ? 'calendar_view_month' : 'calendar_view_week'} size={22} /></button>
        {bell}
      </>} />
      <div className="gp-cal gp-fadein" data-demo="calendar">
        <div className="gp-calhead">
          <button type="button" className="gp-iconbtn" data-demo="cal-prev" onClick={() => step(-1)} aria-label="Anterior"><Icon n="chevron_left" size={24} color="#475569" /></button>
          <span>{title}</span>
          <button type="button" className="gp-iconbtn" data-demo="cal-next" onClick={() => step(1)} aria-label="Siguiente"><Icon n="chevron_right" size={24} color="#475569" /></button>
        </div>
        <div className="gp-dow">{dayShort.map((d, i) => <span key={d} className={i >= 5 ? 'gp-we' : ''}>{d}</span>)}</div>
        <div className="gp-grid">
          {cells.map((d, i) => {
            if (!d) return <span key={i} className="gp-cell" />;
            const evs = byDay.get(iso(d)) ?? [];
            const sel = sameDay(d, selected), today = sameDay(d, GP_NOW), we = d.getDay() === 0 || d.getDay() === 6;
            const anyImp = evs.some(e => e.important), anyPin = evs.some(e => pinned.has(e.id));
            return (
              <button type="button" key={i} className="gp-cell gp-daybtn" data-demo={`day-${d.getDate()}`} onClick={() => setSelected(d)}>
                <span className={`gp-day${sel ? ' gp-sel' : ''}${today && !sel ? ' gp-today' : ''}${we && !sel ? ' gp-we' : ''}`}>{d.getDate()}</span>
                {evs.length > 0 && <span className="gp-dots"><i style={{ background: anyImp ? GOLD : PRIMARY }} />{anyPin && <i style={{ background: GOLD }} />}</span>}
              </button>
            );
          })}
        </div>
      </div>
      {fmt === 'week' && featured.length > 0 && (
        <div className="gp-featured" data-demo="featured">
          <div className="gp-feathead"><Icon n="star" size={20} color={GOLD} />EVENTOS DESTACADOS</div>
          <div className="gp-carousel" onScroll={e => setPage(Math.round(e.currentTarget.scrollLeft / (e.currentTarget.clientWidth * 0.88)))}>
            {featured.map(e => (
              <div key={e.id} className="gp-featcard" onClick={() => onOpen(e.id)}>
                <div className="gp-featimg" style={grad(e.color)}><Icon n="calendar_month" size={44} color="rgba(255,255,255,.35)" /></div>
                <div className="gp-featin">
                  <div className="gp-featchips"><span className="gp-chipgold"><Icon n="star" size={12} color={GOLD} />DESTACADO</span><span className="gp-chipcat" style={{ color: e.color, background: alpha(e.color, 0.15) }}>{e.category}</span></div>
                  <b>{e.title}</b>
                  <div><Icon n="calendar_today_outlined" size={13} />{fmtWeekday(parseD(e.date))}</div>
                  <div><Icon n="access_time" size={13} />{t12(e.start)} - {t12(e.end)}</div>
                  <div><Icon n="location_on_outlined" size={13} /><span className="gp-ell">{e.external ?? evPlace(e)}</span></div>
                </div>
              </div>
            ))}
          </div>
          {featured.length > 1 && <div className="gp-dotsind">{featured.map((e, i) => <i key={e.id} className={i === page ? 'on' : ''} />)}</div>}
        </div>
      )}
      <div className="gp-divider" />
      <h2 className="gp-daytitle" data-demo="day-title">Eventos para el {fmtDayTitle(selected)}</h2>
      <div className="gp-scroll gp-list" data-demo="calendar-list">
        {dayEvents.length === 0
          ? <div style={{ height: 24 }}><EmptyState demo="empty-events" icon="event_busy" title="Sin eventos" desc="No hay eventos programados para este día." /></div>
          : <div key={iso(selected)}>{dayEvents.map((e, i) => <EventCard key={e.id} e={e} idx={i} pinned={pinned.has(e.id)} onOpen={() => onOpen(e.id)} onPin={() => onPin(e.id)} />)}</div>}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ announcements */
function AnnCard({ a, isNew, tick, onOpen }: { a: Announcement; isNew: boolean; tick: number; onOpen: () => void }) {
  return (
    <div className={`gp-cardwrap${isNew ? ` gp-newcard gp-newcard-${tick % 2}` : ''}`} data-new={isNew ? '1' : undefined}>
      <GlassCard className="gp-anncard" demo={`announcement-${a.id}`} onClick={onOpen}>
        <div className="gp-evbar" style={{ background: PRIMARY }} />
        <div className="gp-annbody">
          <div className="gp-anntext">
            <div className="gp-evtitle"><span>{a.title}</span></div>
            <p className="gp-anndesc">{a.description}</p>
            <div className="gp-evrow"><Icon n="access_time" size={14} />{fmtLong(parseD(a.start))} al {fmtLong(parseD(a.end))}</div>
            <div className="gp-evrow"><Icon n="location_on_outlined" size={14} /><span className="gp-ell">{a.place || 'General / Múltiples ubicaciones'}</span></div>
            <div className="gp-evcat" style={{ color: PRIMARY }}>{a.category}</div>
          </div>
          <div className="gp-annimg"><Icon n="campaign" size={30} color="rgba(255,255,255,.7)" /></div>
        </div>
        {isNew && <span className="gp-newbadge" data-demo="new-badge">Nuevo</span>}
      </GlassCard>
    </div>
  );
}

/* ------------------------------------------------------------------ main component */
export default function GeaPhoneReplica({ startTab = 'calendario', liveSync = false, empty = false, showStatusBar = true }: Props) {
  const store = useGeaStore();
  const frozen = useRef(store.announcements);
  const annAll = empty ? [] : liveSync ? store.announcements : frozen.current;

  const [loggedIn, setLoggedIn] = useState(true);
  const [screen, setScreen] = useState<'login' | 'main'>(startTab === 'login' ? 'login' : 'main');
  const [tab, setTab] = useState<Tab>(startTab === 'login' ? 'calendario' : startTab);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [prevTab, setPrevTab] = useState<Tab>('solicitudes');
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [toast, setToast] = useState<{ msg: string; err?: boolean; k: number } | null>(null);
  const [pinned, setPinned] = useState<Set<number>>(() => new Set([103, 108]));
  const [requests, setRequests] = useState<GpRequest[]>(empty ? [] : GP_REQUESTS);
  const events = empty ? [] : GP_EVENTS;

  // login
  const [lEmail, setLEmail] = useState(''); const [lPass, setLPass] = useState(''); const [lTry, setLTry] = useState(false); const [lBusy, setLBusy] = useState(false);

  // live sync
  const [banner, setBanner] = useState<{ title: string; k: number } | null>(null);
  const [newIds, setNewIds] = useState<number[]>([]);
  const [newTick, setNewTick] = useState(0);
  const [pubIds, setPubIds] = useState<number[]>([]);
  const lastTick = useRef(store.approvedTick);
  useEffect(() => {
    if (!liveSync || store.approvedTick === lastTick.current) return;
    lastTick.current = store.approvedTick;
    const a = store.lastApproved; if (!a) return;
    setBanner({ title: a.title, k: store.approvedTick });
    setNewIds(p => [a.id, ...p.filter(x => x !== a.id)]);
    setPubIds(p => [a.id, ...p.filter(x => x !== a.id)]);
    setNewTick(store.approvedTick);
  }, [store.approvedTick, store.lastApproved, liveSync]);
  useEffect(() => { if (!banner) return; const t = setTimeout(() => setBanner(null), 6000); return () => clearTimeout(t); }, [banner]);
  useEffect(() => {
    if (tab !== 'anuncios' || screen !== 'main' || !newIds.length) return;
    const t = setTimeout(() => setNewIds([]), 9500); return () => clearTimeout(t);
  }, [tab, screen, newIds]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 2600); return () => clearTimeout(t); }, [toast]);
  const say = (msg: string, err?: boolean) => setToast({ msg, err, k: Date.now() });

  const approved = useMemo(() => annAll.filter(a => a.status === 'APROBADO').sort((x, y) => y.id - x.id), [annAll]);
  const listRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const l = listRef.current; if (!l) return;
    const n = l.querySelector<HTMLElement>('[data-new="1"]');
    l.style.setProperty('--gp-shift', `${(n && n.offsetHeight ? n.offsetHeight : 130)}px`);
  }, [newIds, approved.length]);

  // notifications (derived)
  const [read, setRead] = useState<Set<string>>(() => new Set(['announcement_39']));
  const baseTick = useRef(store.approvedTick);
  type Notif = { id: string; kind: 'event' | 'ann'; refId: number; title: string; desc: string; when: Date; chip: string; color: string; important: boolean };
  const notifs = useMemo<Notif[]>(() => {
    if (empty) return [];
    const evs: Notif[] = events.filter(e => [101, 108, 102].includes(e.id)).map(e => ({ id: `event_${e.id}`, kind: 'event', refId: e.id, title: e.title, desc: e.description, when: new Date(parseD(e.date).getTime() + (Number(e.start.slice(0, 2)) * 60 + Number(e.start.slice(3))) * 60000), chip: e.category, color: e.color, important: e.important }));
    const ans: Notif[] = approved.map(a => ({ id: `announcement_${a.id}`, kind: 'ann', refId: a.id, title: a.title, desc: a.description, when: pubIds.includes(a.id) ? GP_NOW : new Date(parseD(a.start).getTime() + 8 * 3600000), chip: 'Anuncio', color: '#475569', important: false }));
    return [...evs, ...ans].sort((x, y) => y.when.getTime() - x.when.getTime());
  }, [events, approved, pubIds, empty]);
  void baseTick;
  const unread = notifs.filter(n => !read.has(n.id)).length;

  const goTab = (t: Tab) => { setTab(t); setOverlay(null); setSheet(null); };
  const openOverlay = (o: Overlay) => { setPrevTab(tab); setOverlay(o); };
  const bellFor = (id: string) => <Bell id={id} count={unread} onClick={() => openOverlay('notifications')} />;

  const togglePin = (id: number) => {
    if (!loggedIn) { setSheet({ k: 'pinlogin' }); return; }
    setPinned(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  /* request form state */
  const blankForm = { title: '', desc: '', places: [] as number[], who: GP_USER.name, ds: '2026-10-19', de: '2026-10-23', hs: '09:00', he: '16:00', design: true, img: false, tried: false, sending: false };
  const [form, setForm] = useState(blankForm);
  const openForm = () => { setForm(blankForm); openOverlay('form'); };
  const sendForm = () => {
    setForm(f => ({ ...f, tried: true }));
    if (!form.title.trim() || form.desc.trim().length < 10 || !form.who.trim()) return;
    if (parseD(form.de) < parseD(form.ds)) { say('La fecha de fin no puede ser anterior a la de inicio', true); return; }
    if (!form.design && !form.img) { say('Por favor, selecciona una imagen para el anuncio', true); return; }
    setForm(f => ({ ...f, sending: true }));
    setTimeout(() => {
      setRequests(r => [{ id: `n${Date.now()}`, title: form.title.trim(), description: form.desc.trim(), status: 'PENDIENTE', created: iso(GP_NOW), isNew: true }, ...r.map(x => ({ ...x, isNew: false }))]);
      setOverlay(null); setTab(prevTab); say('Solicitud enviada con éxito'); setForm(blankForm);
    }, 700);
  };

  /* ---- sheets */
  const evById = (id: number) => GP_EVENTS.find(e => e.id === id);
  const sheetNode = (() => {
    if (!sheet) return null;
    if (sheet.k === 'event') {
      const e = evById(sheet.id); if (!e) return null;
      return (
        <SheetFrame onClose={() => setSheet(null)} demo="event-detail" tall>
          <div className="gp-sheetimg" style={grad(e.color)}><Icon n="calendar_month" size={56} color="rgba(255,255,255,.35)" /></div>
          <div className="gp-sheetchips">
            <span className="gp-chipcat gp-chipbig" style={{ color: e.color, background: alpha(e.color, 0.1) }}>{e.category}</span>
            <StreamBadge e={e} /><span style={{ flex: 1 }} />
            {e.important && <Icon n="star" size={22} color={GOLD} />}
          </div>
          <div className="gp-sheettitle"><h2>{e.title}</h2><PinBtn pinned={pinned.has(e.id)} size={28} onClick={() => togglePin(e.id)} demo="pin-detail" /></div>
          <InfoRow icon="calendar_today_outlined" text={fmtWeekdayYear(parseD(e.date))} />
          <InfoRow icon="access_time" text={`${t12(e.start)} - ${t12(e.end)}`} />
          <InfoRow icon="location_on_outlined" text={e.external ?? evPlace(e)} />
          {e.link && <button type="button" className="gp-btn-stream" data-demo="stream-btn"><Icon n="play_circle_outline" size={20} />Ver stream</button>}
          <hr className="gp-hr" />
          <h3 className="gp-h3">Acerca de este evento</h3>
          <p className="gp-body">{e.description}</p>
          <div style={{ height: 16 }} />
          <Btn variant="secondary" icon="share" text="Compartir evento" demo="share-btn" onClick={() => setSheet({ k: 'share', id: e.id })} />
        </SheetFrame>
      );
    }
    if (sheet.k === 'share') {
      const e = evById(sheet.id); if (!e) return null;
      return (
        <SheetFrame onClose={() => setSheet(null)} demo="share-sheet">
          <h3 className="gp-h3" style={{ marginTop: 4 }}>Compartir evento</h3>
          <div style={{ height: 20 }} />
          <ShareOpt icon="image" title="Compartir como imagen" sub="Genera una tarjeta visual del evento" demo="share-image" onClick={() => { setSheet(null); say('Tarjeta del evento lista para compartir'); }} />
          <ShareOpt icon="link" title="Copiar enlace" sub={e.link ? 'Copia el enlace del evento al portapapeles' : 'Este evento no tiene enlace'} disabled={!e.link} demo="share-link" onClick={() => { if (e.link) { setSheet(null); say('Enlace copiado al portapapeles'); } else say('Este evento no tiene enlace disponible', true); }} />
        </SheetFrame>
      );
    }
    if (sheet.k === 'ann') {
      const a = annAll.find(x => x.id === sheet.id); if (!a) return null;
      return (
        <SheetFrame onClose={() => setSheet(null)} demo="announcement-detail" tall>
          <div className="gp-sheetimg gp-annhero"><Icon n="campaign" size={56} color="rgba(255,255,255,.6)" /></div>
          <div className="gp-sheetchips"><span className="gp-chipcat gp-chipbig" style={{ color: PRIMARY, background: alpha(PRIMARY, 0.1) }}>{a.category}</span><span style={{ flex: 1 }} /><span className="gp-small">{fmtLong(parseD(a.start))}</span></div>
          <div className="gp-sheettitle"><h2>{a.title}</h2></div>
          <p className="gp-body">{a.description}</p>
          <hr className="gp-hr" />
          <InfoRow icon="calendar_today_outlined" text={`${fmtLong(parseD(a.start))} al ${fmtLong(parseD(a.end))}`} />
          <InfoRow icon="location_on_outlined" text={a.place || 'General / Múltiples ubicaciones'} />
          <InfoRow icon="person_outline" text={`${a.requester} · ${a.office}`} />
        </SheetFrame>
      );
    }
    if (sheet.k === 'places') {
      return (
        <SheetFrame onClose={() => setSheet(null)} demo="places-sheet" style={{ height: '60%' }}>
          <h3 className="gp-h3" style={{ fontSize: 18, marginTop: 4 }}>Seleccionar Lugares Físicos</h3>
          <div className="gp-places">
            {GP_PLACES.map(p => {
              const on = form.places.includes(p.id);
              return (
                <button type="button" key={p.id} className="gp-place" data-demo={`place-${p.id}`} onClick={() => setForm(f => ({ ...f, places: on ? f.places.filter(x => x !== p.id) : [...f.places, p.id] }))}>
                  <span><b>{p.name}</b><small>{p.desc}</small></span>
                  <Icon n={on ? 'check_box' : 'check_box_blank'} size={24} color={on ? PRIMARY : '#475569'} />
                </button>
              );
            })}
          </div>
          <Btn text="Aceptar" onClick={() => setSheet(null)} demo="places-ok" />
        </SheetFrame>
      );
    }
    if (sheet.k === 'pick') {
      const f = sheet.f;
      const isDate = f === 'ds' || f === 'de';
      const opts: { v: string; l: string }[] = isDate
        ? Array.from({ length: 20 }, (_, i) => { const d = new Date(2026, 9, 12 + i); return { v: iso(d), l: fmtPick(d) }; })
        : Array.from({ length: 33 }, (_, i) => { const m = 360 + i * 30; const v = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`; return { v, l: t12(v) }; });
      return (
        <SheetFrame onClose={() => setSheet(null)} demo="pick-sheet" style={{ height: '52%' }}>
          <h3 className="gp-h3" style={{ fontSize: 18, marginTop: 4 }}>{isDate ? 'Seleccionar fecha' : 'Seleccionar hora'}</h3>
          <div className="gp-pickgrid">
            {opts.map(o => <button type="button" key={o.v} className={form[f] === o.v ? 'on' : ''} onClick={() => { setForm(s => ({ ...s, [f]: o.v })); setSheet(null); }}>{o.l}</button>)}
          </div>
        </SheetFrame>
      );
    }
    if (sheet.k === 'pinlogin') {
      return (
        <SheetFrame onClose={() => setSheet(null)}>
          <div className="gp-pinlogin">
            <Icon n="bookmark_outline" size={48} color="#94A3B8" />
            <b>Inicia sesión para fijar eventos</b>
            <p>Guarda tus eventos favoritos y accede a ellos rápidamente.</p>
            <Btn text="Iniciar sesión" onClick={() => { setSheet(null); setScreen('login'); }} />
          </div>
        </SheetFrame>
      );
    }
    return null;
  })();

  /* ---- profile / dialogs */
  const dialog = sheet?.k === 'logout' ? (
    <Dialog title="Cerrar Sesión" body="¿Estás seguro de que deseas salir de tu cuenta institucional?" onCancel={() => setSheet(null)} okText="Salir" danger onOk={() => { setSheet(null); setLoggedIn(false); setScreen('login'); setOverlay(null); }} />
  ) : sheet?.k === 'loginreq' ? (
    <Dialog title="Inicio de sesión requerido" body="Para realizar una solicitud de anuncio, debes iniciar sesión con tu cuenta institucional." onCancel={() => setSheet(null)} okText="Iniciar Sesión" onOk={() => { setSheet(null); setScreen('login'); }} />
  ) : null;

  const doLogin = () => {
    setLTry(true);
    if (!lEmail.trim() || !lEmail.includes('@') || !lPass) return;
    setLBusy(true);
    setTimeout(() => { setLBusy(false); setLoggedIn(true); setScreen('main'); setTab('calendario'); }, 600);
  };

  const sUnread = (id: string) => !read.has(id);

  return (
    <div className="gp-root" data-demo="phone">
      {screen === 'login' ? (
        <div className="gp-login" data-demo="login">
          <div className="gp-logo" aria-hidden="true"><svg viewBox="0 0 100 100" width="100" height="100"><rect width="100" height="100" rx="26" fill={PRIMARY} /><text x="50" y="62" textAnchor="middle" fontSize="34" fontWeight="800" fill="#fff" fontFamily="Inter Variable, Inter, sans-serif" letterSpacing="-1">GEA</text></svg></div>
          <h1>Bienvenido a GEA</h1>
          <p className="gp-sub">Ingresa con tu cuenta institucional para continuar.</p>
          <Field label="Correo Institucional" hint="nombre@institucion.edu.co" icon="email" value={lEmail} onChange={setLEmail} type="email" demo="login-email" error={lTry ? (!lEmail.trim() ? 'Este campo es requerido' : !lEmail.includes('@') ? 'Ingresa un correo válido' : undefined) : undefined} />
          <Field label="Contraseña" hint="••••••••" icon="lock_outline" value={lPass} onChange={setLPass} type="password" demo="login-pass" error={lTry && !lPass ? 'Este campo es requerido' : undefined} />
          <div className="gp-forgot"><button type="button">¿Olvidaste tu contraseña?</button></div>
          <Btn text="Iniciar Sesión" loading={lBusy} onClick={doLogin} demo="login-submit" />
          <button type="button" className="gp-ms" disabled={lBusy} onClick={() => { setLoggedIn(true); setScreen('main'); setTab('calendario'); }}>
            <span className="gp-mslogo"><i style={{ background: '#F25022' }} /><i style={{ background: '#7FBA00' }} /><i style={{ background: '#00A4EF' }} /><i style={{ background: '#FFB900' }} /></span>Iniciar sesión con Microsoft
          </button>
          <div className="gp-or"><hr /><span>O</span><hr /></div>
          <Btn variant="secondary" text="Continuar como invitado" demo="login-guest" onClick={() => { setLoggedIn(false); setScreen('main'); setTab('calendario'); }} />
        </div>
      ) : (
        <>
          <div className="gp-tabs">
            <section className={`gp-tab${tab === 'calendario' ? '' : ' gp-hidden'}`} data-demo="tab-calendario">
              <CalendarTab events={events} pinned={pinned} bell={bellFor('calendario')} onOpen={id => id === -1 ? openOverlay('pinned') : setSheet({ k: 'event', id })} onPin={togglePin} />
            </section>

            <section className={`gp-tab${tab === 'anuncios' ? '' : ' gp-hidden'}`} data-demo="tab-anuncios">
              <AppBar title="Anuncios" actions={bellFor('anuncios')} />
              <div className="gp-scroll gp-list" data-demo="announcements-list" ref={listRef}>
                {approved.length === 0
                  ? <EmptyState demo="empty-announcements" icon="campaign" title="Sin anuncios" desc="Aún no hay anuncios publicados en la plataforma." />
                  : approved.map(a => {
                      const isNew = newIds.includes(a.id);
                      return <div key={a.id} className={!isNew && newIds.length ? `gp-shift gp-shift-${newTick % 2}` : undefined}><AnnCard a={a} isNew={isNew} tick={newTick} onOpen={() => setSheet({ k: 'ann', id: a.id })} /></div>;
                    })}
              </div>
              <button type="button" className="gp-fab" data-demo="fab-solicitar" onClick={() => loggedIn ? openForm() : setSheet({ k: 'loginreq' })}><Icon n="add_comment" size={22} />Solicitar Anuncio</button>
            </section>

            <section className={`gp-tab${tab === 'solicitudes' ? '' : ' gp-hidden'}`} data-demo="tab-solicitudes">
              <AppBar title="Mis Solicitudes" center />
              <div className="gp-scroll gp-list gp-reqlist" data-demo="requests-list">
                {requests.length === 0
                  ? <EmptyState demo="empty-requests" icon="inbox" title="Aún no has enviado solicitudes" desc="Cuando solicites un anuncio, aquí verás su estado." />
                  : requests.map(r => (
                      <div key={r.id} className={`gp-req${r.isNew ? ' gp-reqnew' : ''}`} data-demo={r.isNew ? 'request-card-new' : `request-card-${r.id}`}>
                        <div className="gp-reqtop"><b>{r.title}</b><StatusBadge status={r.status} demo={r.isNew ? 'status-badge-new' : `status-badge-${r.id}`} /></div>
                        <div className="gp-small">{fmtShort(parseD(r.created))}</div>
                        <p className="gp-body gp-clamp3">{r.description}</p>
                        {r.status === 'RECHAZADA' && r.reject && <ReasonBox color="#DC2626" icon="cancel_outlined" title="Motivo del rechazo" text={r.reject} />}
                        {r.status === 'EN_REVISION' && r.review && <ReasonBox color={GOLD} icon="edit_note" title="Observaciones para corregir" text={r.review} />}
                        {r.status === 'EN_REVISION' && <div className="gp-reqedit"><button type="button" onClick={openForm}><Icon n="edit" size={18} />Editar y reenviar</button></div>}
                      </div>
                    ))}
              </div>
              <button type="button" className="gp-fab" data-demo="solicitud-crear" onClick={() => loggedIn ? openForm() : setSheet({ k: 'loginreq' })}><Icon n="add_comment" size={22} />Solicitar Anuncio</button>
            </section>

            <section className={`gp-tab${tab === 'perfil' ? '' : ' gp-hidden'}`} data-demo="tab-perfil">
              <AppBar title="Mi Perfil" center />
              <div className="gp-scroll gp-profile" data-demo="profile-scroll">
                {loggedIn ? (
                  <>
                    <div className="gp-avatarring"><div className="gp-avatar">{GP_USER.initials}</div></div>
                    <h2 className="gp-pname">{GP_USER.name}</h2>
                    <div className="gp-rolewrap"><span className="gp-role"><Icon n="shield" size={14} color={GOLD} />{GP_USER.role}</span></div>
                    <div className="gp-infocard">
                      <InfoTile icon="email" title="Correo Institucional" value={GP_USER.email} />
                      <hr />
                      <InfoTile icon="badge" title="Código Único / ID" value={GP_USER.id} />
                      <hr />
                      <InfoTile icon="check_circle_outline" title="Estado de la Cuenta" value="Activo" ok />
                    </div>
                    <button type="button" className="gp-listtile" data-demo="profile-requests" onClick={() => goTab('solicitudes')}>
                      <Icon n="receipt_long" size={24} color={PRIMARY} />
                      <span><b>Mis Solicitudes</b><small>Estado de tus solicitudes de anuncio</small></span>
                      <Icon n="chevron_right" size={24} color="#475569" />
                    </button>
                    <div style={{ height: 48 }} />
                    <Btn variant="danger" icon="logout" text="Cerrar sesión" demo="logout" onClick={() => setSheet({ k: 'logout' })} />
                  </>
                ) : (
                  <>
                    <div className="gp-guestcircle"><Icon n="account_circle" size={100} color={alpha(PRIMARY, 0.6)} /></div>
                    <h2 className="gp-pname">Bienvenido, Invitado</h2>
                    <p className="gp-guestmsg">Inicia sesión con tu cuenta institucional para solicitar anuncios de la universidad, registrar tus dispositivos y acceder a todas las funciones del sistema.</p>
                    <div style={{ height: 40 }} />
                    <Btn icon="login" text="Iniciar Sesión" onClick={() => setScreen('login')} />
                  </>
                )}
              </div>
            </section>
          </div>

          {/* floating nav bar */}
          <nav className="gp-nav" data-demo="nav">
            {NAV.map(n => {
              const on = tab === n.id && !overlay;
              return (
                <button type="button" key={n.id} data-demo={`nav-${n.id}`} className={`gp-navitem${on ? ' on' : ''}`} onClick={() => goTab(n.id)} aria-label={n.label}>
                  <Icon n={on ? n.sel : n.icon} size={24} color={on ? PRIMARY : '#94A3B8'} />
                  {on && <span>{n.label}</span>}
                </button>
              );
            })}
          </nav>
        </>
      )}

      {/* pushed screens */}
      {overlay === 'notifications' && (
        <div className="gp-overlay" data-demo="notifications-screen">
          <AppBar title="Notificaciones" onBack={() => setOverlay(null)} actions={unread > 0 && <button type="button" className="gp-textbtn" data-demo="mark-all" onClick={() => setRead(new Set(notifs.map(n => n.id)))}><Icon n="done_all" size={18} />Marcar todo leído</button>} />
          <div className="gp-scroll gp-list">
            {notifs.length === 0 ? <EmptyState demo="empty-notifications" icon="notifications_outlined" title="Sin notificaciones" desc="Aquí verás los últimos eventos y anuncios publicados." /> : (
              <>
                {notifs.some(n => n.important) && <div className="gp-secthead" style={{ color: GOLD }}><Icon n="star" size={22} color={GOLD} />IMPORTANTE</div>}
                {notifs.filter(n => n.important).map(n => <NotifCard key={n.id} n={n} unread={sUnread(n.id)} onClick={() => { setRead(r => new Set(r).add(n.id)); setSheet(n.kind === 'event' ? { k: 'event', id: n.refId } : { k: 'ann', id: n.refId }); }} />)}
                <div className="gp-secthead gp-sec2"><Icon n="access_time" size={20} color="#475569" />NUEVOS Y RECIENTES</div>
                {notifs.filter(n => !n.important).map(n => <NotifCard key={n.id} n={n} unread={sUnread(n.id)} onClick={() => { setRead(r => new Set(r).add(n.id)); setSheet(n.kind === 'event' ? { k: 'event', id: n.refId } : { k: 'ann', id: n.refId }); }} />)}
              </>
            )}
          </div>
        </div>
      )}

      {overlay === 'pinned' && (
        <div className="gp-overlay" data-demo="pinned-screen">
          <AppBar title="Eventos Fijados" center onBack={() => setOverlay(null)} />
          <div className="gp-scroll gp-list">
            {!loggedIn ? (
              <div className="gp-guestpin"><Icon n="bookmark_outline" size={72} color={alpha(PRIMARY, 0.4)} /><h3>Inicia sesión para fijar eventos</h3><p>Guarda tus eventos favoritos y accede a ellos rápidamente desde aquí.</p></div>
            ) : events.filter(e => pinned.has(e.id)).length === 0 ? (
              <EmptyState icon="bookmark_outline" title="Sin eventos fijados" desc="Toca el ícono de marcador en cualquier evento para guardarlo aquí." />
            ) : events.filter(e => pinned.has(e.id)).sort((a, b) => a.date.localeCompare(b.date)).map((e, i) => <EventCard key={e.id} e={e} idx={i} pinned onOpen={() => setSheet({ k: 'event', id: e.id })} onPin={() => togglePin(e.id)} />)}
          </div>
        </div>
      )}

      {overlay === 'form' && (
        <div className="gp-overlay" data-demo="request-form-screen">
          <AppBar title="Solicitar Anuncio" onBack={() => setOverlay(null)} />
          <div className="gp-scroll gp-formscroll" data-demo="request-form">
            <div className="gp-formcard">
              <h3 className="gp-h3">Información General</h3>
              <p className="gp-body" style={{ margin: '4px 0 20px' }}>Completa todos los campos obligatorios para evitar que la solicitud sea rechazada por el administrador.</p>
              <Field label="Título del Anuncio *" hint="Ej. Feria del Libro 2024" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} demo="field-titulo" error={form.tried && !form.title.trim() ? 'Requerido' : undefined} />
              <Field label="Descripción *" hint="Escribe los detalles aquí..." multiline value={form.desc} onChange={v => setForm(f => ({ ...f, desc: v }))} demo="field-descripcion" error={form.tried && form.desc.trim().length < 10 ? 'Escribe al menos 10 caracteres' : undefined} />
              <div className="gp-field"><span className="gp-field-label">Lugares Físicos (Opcional)</span>
                <button type="button" className="gp-pickbox" data-demo="field-lugares" onClick={() => setSheet({ k: 'places' })}><span className={form.places.length ? '' : 'gp-mut'}>{form.places.length ? (form.places.length === 1 ? '1 lugar seleccionado' : `${form.places.length} lugares seleccionados`) : 'Añadir lugar...'}</span><Icon n="arrow_drop_down" size={24} color="#475569" /></button>
              </div>
              <hr className="gp-hr gp-hr16" />
              <h3 className="gp-h3">Contacto</h3>
              <div style={{ height: 16 }} />
              <Field label="Responsable *" hint="Nombre completo" value={form.who} onChange={v => setForm(f => ({ ...f, who: v }))} demo="field-responsable" error={form.tried && !form.who.trim() ? 'Requerido' : undefined} />
              <Field label="Correo de Contacto *" hint="correo@ejemplo.com" value={GP_USER.email} readOnly />
              <hr className="gp-hr gp-hr16" />
              <h3 className="gp-h3">Temporalidad</h3>
              <div className="gp-pickrow" style={{ marginTop: 16 }}>
                <PickBox label="Fecha Inicio" value={fmtPick(parseD(form.ds))} icon="calendar_today_outlined" demo="field-fecha-inicio" onClick={() => setSheet({ k: 'pick', f: 'ds' })} />
                <PickBox label="Fecha Fin" value={fmtPick(parseD(form.de))} icon="calendar_today_outlined" demo="field-fecha-fin" onClick={() => setSheet({ k: 'pick', f: 'de' })} />
              </div>
              <div className="gp-pickrow">
                <PickBox label="Hora Inicio" value={t12(form.hs).toUpperCase().replace(/\./g, '').replace(' M', 'M')} icon="access_time" demo="field-hora-inicio" onClick={() => setSheet({ k: 'pick', f: 'hs' })} />
                <PickBox label="Hora Fin" value={t12(form.he).toUpperCase().replace(/\./g, '').replace(' M', 'M')} icon="access_time" demo="field-hora-fin" onClick={() => setSheet({ k: 'pick', f: 'he' })} />
              </div>
              <hr className="gp-hr gp-hr16" />
              <div className="gp-switchrow">
                <span><b>Pieza Gráfica</b><small>¿El anuncio requiere diseño por parte del equipo?</small></span>
                <button type="button" role="switch" aria-checked={form.design} className={`gp-switch${form.design ? ' on' : ''}`} data-demo="switch-pieza" onClick={() => setForm(f => ({ ...f, design: !f.design, img: false }))}><i /></button>
              </div>
              {!form.design && (
                <button type="button" className="gp-upload" data-demo="upload-img" onClick={() => setForm(f => ({ ...f, img: true }))} style={form.img ? { background: 'linear-gradient(135deg,#E53935,#E2E4E8)' } : undefined}>
                  <Icon n={form.img ? 'image' : 'cloud_upload'} size={40} color={form.img ? '#fff' : '#94A3B8'} />
                  <span style={form.img ? { color: '#fff' } : undefined}>{form.img ? 'pieza_grafica.png' : 'Toca para subir la pieza gráfica'}</span>
                </button>
              )}
              <div style={{ height: 24 }} />
              <Btn icon="send" text="Enviar Solicitud Completa" loading={form.sending} onClick={sendForm} demo="btn-enviar" />
            </div>
          </div>
        </div>
      )}

      {sheetNode}
      {dialog}

      {banner && (
        <div className="gp-banner" data-demo="push-banner" key={banner.k} onClick={() => { setBanner(null); goTab('anuncios'); }}>
          <div className="gp-banner-ic"><Icon n="campaign" size={26} color="#F59E0B" /></div>
          <div className="gp-banner-tx">
            <div className="gp-banner-top"><span className="gp-banner-chip">ANUNCIO</span><span>GEA · ahora</span></div>
            <b>Nuevo anuncio: {banner.title}</b>
          </div>
          <button type="button" className="gp-iconbtn" aria-label="Cerrar" onClick={e => { e.stopPropagation(); setBanner(null); }}><Icon n="close" size={20} color="rgba(255,255,255,.55)" /></button>
          <span className="gp-banner-bar" />
        </div>
      )}

      {toast && <div className={`gp-toast${toast.err ? ' gp-toast-err' : ''}`} key={toast.k} data-demo="toast">{toast.msg}</div>}

      {showStatusBar && (
        <div className="gp-status-bar" aria-hidden="true">
          <span>9:07</span>
          <span className="gp-sb-r"><Icon n="wifi" size={15} /><Icon n="signal" size={13} /><Icon n="battery" size={15} style={{ transform: 'rotate(90deg)' }} /></span>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ helper components */
function SheetFrame({ children, onClose, tall, demo, style }: { children: ReactNode; onClose: () => void; tall?: boolean; demo?: string; style?: CSSProperties }) {
  return (
    <div className="gp-sheetwrap">
      <div className="gp-scrim" data-demo="scrim" onClick={onClose} />
      <div className={`gp-sheet${tall ? ' gp-tall' : ''}`} data-demo={demo} style={style}>
        <div className="gp-handle" />
        <div className="gp-sheetin">{children}</div>
      </div>
    </div>
  );
}

function ShareOpt({ icon, title, sub, onClick, demo, disabled }: { icon: GpIconName; title: string; sub: string; onClick: () => void; demo: string; disabled?: boolean }) {
  return (
    <button type="button" className={`gp-shareopt${disabled ? ' dis' : ''}`} data-demo={demo} onClick={onClick}>
      <Icon n={icon} size={22} color="#475569" />
      <span><b>{title}</b><small>{sub}</small></span>
      <Icon n="arrow_forward_ios" size={14} color="#94A3B8" />
    </button>
  );
}

function Dialog({ title, body, onCancel, onOk, okText, danger }: { title: string; body: string; onCancel: () => void; onOk: () => void; okText: string; danger?: boolean }) {
  return (
    <div className="gp-dialogwrap">
      <div className="gp-scrim" onClick={onCancel} />
      <div className="gp-dialog" data-demo="dialog">
        <h3>{title}</h3><p>{body}</p>
        <div className="gp-dialogbtns"><button type="button" className="gp-textbtn" onClick={onCancel}>Cancelar</button><button type="button" className="gp-dlgok" data-demo="dialog-ok" style={danger ? { background: '#DC2626' } : undefined} onClick={onOk}>{okText}</button></div>
      </div>
    </div>
  );
}

function ReasonBox({ color, icon, title, text }: { color: string; icon: GpIconName; title: string; text: string }) {
  return (
    <div className="gp-reason" style={{ background: alpha(color, 0.08), borderColor: alpha(color, 0.25) }}>
      <Icon n={icon} size={18} color={color} />
      <span><b style={{ color }}>{title}</b><small>{text}</small></span>
    </div>
  );
}

function InfoTile({ icon, title, value, ok }: { icon: GpIconName; title: string; value: string; ok?: boolean }) {
  return (
    <div className="gp-tile"><Icon n={icon} size={22} color="rgba(15,23,42,.5)" />
      <span><small>{title}</small><b style={ok ? { color: '#059669' } : undefined}>{value}</b></span>
      {ok && <i className="gp-okdot" />}
    </div>
  );
}

function PickBox({ label, value, icon, onClick, demo }: { label: string; value: string; icon: GpIconName; onClick: () => void; demo: string }) {
  return (
    <button type="button" className="gp-pickbox gp-pickbox2" data-demo={demo} onClick={onClick}>
      <small>{label}</small><span><b>{value}</b><Icon n={icon} size={16} color="#475569" /></span>
    </button>
  );
}

function NotifCard({ n, unread, onClick }: { n: { id: string; kind: 'event' | 'ann'; title: string; desc: string; when: Date; chip: string; color: string; important: boolean }; unread: boolean; onClick: () => void }) {
  const w = n.when; const hh = String(w.getHours()); void hh;
  const hm = `${w.getHours() % 12 === 0 ? 12 : w.getHours() % 12}:${String(w.getMinutes()).padStart(2, '0')} ${w.getHours() < 12 ? 'a. m.' : 'p. m.'}`;
  const imp = n.important && unread;
  return (
    <div className={`gp-notif${imp ? ' gp-notif-imp' : ''}${unread ? ' gp-unread' : ' gp-readn'}`} data-demo={`notif-${n.id}`} onClick={onClick}>
      <div className="gp-notic" style={{ background: alpha(n.color, 0.1) }}>
        <Icon n={n.kind === 'event' ? 'calendar_month' : 'campaign'} size={24} color={n.color} />
        {unread && <i className="gp-undot" style={{ background: n.important ? GOLD : '#DC2626' }} />}
      </div>
      <div className="gp-notx">
        <div className="gp-notmeta"><span className="gp-chipcat" style={{ color: n.color, background: alpha(n.color, 0.15) }}>{n.chip}</span><small>{fmtLong(w)} - {hm}</small></div>
        <b style={{ fontWeight: unread ? 700 : 600 }}>{n.title}</b>
        <p>{n.desc}</p>
      </div>
    </div>
  );
}
