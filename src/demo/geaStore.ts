import { useSyncExternalStore } from 'react';

/** Shared, in-memory, 100% fictional state linking the GEA web replica and the Flutter replica.
 *  The web replica calls approveAnnouncement(); the phone replica reads `lastApproved`. */
export type Announcement = {
  id: number; title: string; description: string; category: string;
  requester: string; office: string; place: string; status: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
  start: string; end: string;
};
export type GeaState = {
  announcements: Announcement[];
  lastApproved: Announcement | null; // set when an announcement is approved; phone shows it "in real time"
  approvedTick: number;               // increments on every approval (phone animates on change)
};

export const seedAnnouncements: Announcement[] = [
  { id: 41, title: 'Convocatoria de monitorías 2026-2', description: 'Postulaciones abiertas para monitores académicos de ciencias básicas.', category: 'Académico', requester: 'Camila Duarte', office: 'Bienestar Universitario', place: 'Cartelera Digital', start: '2026-10-12', end: '2026-10-30', status: 'PENDIENTE' },
  { id: 40, title: 'Horario extendido de biblioteca', description: 'La biblioteca atenderá hasta las 10:00 p. m. durante la semana de parciales.', category: 'Institucional', requester: 'Julián Pérez', office: 'Biblioteca', place: 'Biblioteca Central', start: '2026-10-08', end: '2026-10-20', status: 'APROBADO' },
  { id: 39, title: 'Inscripciones abiertas a talleres culturales', description: 'Danza, teatro y música: cupos limitados hasta el 25 de octubre.', category: 'Cultural', requester: 'Camila Duarte', office: 'Bienestar Universitario', place: 'Cartelera Digital', start: '2026-10-05', end: '2026-10-25', status: 'APROBADO' },
];

const clone = (): GeaState => ({ announcements: seedAnnouncements.map(a => ({ ...a })), lastApproved: null, approvedTick: 0 });
let state: GeaState = clone();
const subs = new Set<() => void>();
const emit = () => subs.forEach(f => f());

export const geaStore = {
  get: () => state,
  subscribe: (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; },
  reset() { state = clone(); emit(); },
  approveAnnouncement(id: number) {
    const a = state.announcements.find(x => x.id === id); if (!a) return;
    const next = { ...a, status: 'APROBADO' as const };
    state = { announcements: state.announcements.map(x => x.id === id ? next : x), lastApproved: next, approvedTick: state.approvedTick + 1 };
    emit();
  },
  addAnnouncement(a: Announcement) { state = { ...state, announcements: [a, ...state.announcements] }; emit(); },
};
export const useGeaStore = () => useSyncExternalStore(geaStore.subscribe, geaStore.get, geaStore.get);
