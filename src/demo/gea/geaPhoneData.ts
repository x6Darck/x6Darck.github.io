/** Datos 100% ficticios (Universidad Ejemplo) para la réplica móvil de GEA. */
export type GpEvent = {
  id: number; title: string; description: string; date: string; start: string; end: string;
  places: string[]; external?: string; category: string; color: string; important: boolean;
  link?: string; image: boolean;
};

export const GP_NOW = new Date(2026, 9, 12, 9, 7); // hoy ficticio: lunes 12 de octubre de 2026, 9:07

export const GP_USER = { id: '1042', name: 'Laura Mendoza Ríos', email: 'laura.mendoza@ejemplo.edu.co', role: 'Estudiante', initials: 'LM' };

export const GP_EVENTS: GpEvent[] = [
  { id: 101, title: 'Ceremonia de Apertura Semestre 2026-2', description: 'Acto institucional de bienvenida a estudiantes nuevos con la intervención de la rectoría y las decanaturas.', date: '2026-10-12', start: '08:00', end: '10:00', places: ['Auditorio Principal'], category: 'Institucional', color: '#E53935', important: true, link: 'https://transmision.ejemplo.edu.co/en-vivo/apertura', image: true },
  { id: 102, title: 'Conferencia: Inteligencia Artificial en la Educación', description: 'Charla magistral sobre el uso responsable de herramientas de IA en el aula.', date: '2026-10-12', start: '14:00', end: '16:00', places: ['Aula Magna', 'Sala de Conferencias 2'], category: 'Académico', color: '#1E88E5', important: false, link: 'https://transmision.ejemplo.edu.co/en-vivo/ia-educacion', image: true },
  { id: 103, title: 'Feria de Emprendimiento Universidad Ejemplo', description: 'Exposición de proyectos de estudiantes y egresados con rueda de negocios.', date: '2026-10-13', start: '09:00', end: '17:00', places: ['Plazoleta Central'], category: 'Extensión', color: '#43A047', important: true, image: true },
  { id: 104, title: 'Taller de Escritura Académica', description: 'Sesión práctica para elaborar artículos y trabajos de grado.', date: '2026-10-14', start: '10:30', end: '12:00', places: ['Biblioteca', 'Sala de Estudio 3'], category: 'Académico', color: '#1E88E5', important: false, image: false },
  { id: 105, title: 'Torneo Interfacultades de Fútbol Sala', description: 'Final del torneo deportivo entre facultades.', date: '2026-10-15', start: '16:00', end: '18:30', places: ['Coliseo Cubierto'], category: 'Bienestar', color: '#FB8C00', important: false, link: 'https://transmision.ejemplo.edu.co/en-vivo/futbol-sala', image: true },
  { id: 106, title: 'Jornada de Salud y Bienestar', description: 'Tamizajes, pausas activas y orientación psicológica gratuita.', date: '2026-10-16', start: '08:00', end: '13:00', places: ['Edificio de Bienestar', 'Piso 1'], category: 'Bienestar', color: '#FB8C00', important: false, image: false },
  { id: 107, title: 'Visita Empresarial: Parque Tecnológico Aliado', description: 'Recorrido guiado por laboratorios de innovación con empresas aliadas.', date: '2026-10-20', start: '07:30', end: '12:30', places: [], external: 'Parque Tecnológico Aliado, Km 5 vía Industrial', category: 'Extensión', color: '#43A047', important: false, image: false },
  { id: 108, title: 'Concierto de la Orquesta Sinfónica Universitaria', description: 'Programa de obras de repertorio clásico y contemporáneo.', date: '2026-10-23', start: '19:00', end: '21:00', places: ['Teatro Universitario'], category: 'Cultura', color: '#8E24AA', important: true, link: 'https://transmision.ejemplo.edu.co/en-vivo/concierto', image: true },
];

export type GpReqStatus = 'PENDIENTE' | 'EN_REVISION' | 'RECHAZADA' | 'APROBADA' | 'PUBLICADA';
export type GpRequest = { id: number | string; title: string; description: string; status: GpReqStatus; reject?: string; review?: string; created: string; isNew?: boolean };

export const GP_REQUESTS: GpRequest[] = [
  { id: 306, title: 'Cine-foro: Memoria y Territorio', description: 'Proyección de documental seguida de conversatorio con invitados.', status: 'PENDIENTE', created: '2026-10-11' },
  { id: 301, title: 'Venta de libros usados', description: 'Feria de libros usados organizada por el semillero de lectura de la facultad.', status: 'PENDIENTE', created: '2026-10-10' },
  { id: 302, title: 'Taller de fotografía básica', description: 'Taller gratuito de fotografía con celular para la comunidad estudiantil.', status: 'EN_REVISION', review: 'Por favor ajusta el horario: el Aula Magna está ocupada ese día y agrega un cupo máximo de asistentes.', created: '2026-10-08' },
  { id: 303, title: 'Rifa pro-fondos del grupo de teatro', description: 'Rifa para recaudar fondos de la gira del grupo de teatro.', status: 'RECHAZADA', reject: 'La solicitud contiene actividades de recaudo con fines comerciales no permitidas en los canales institucionales.', created: '2026-10-05' },
  { id: 304, title: 'Convocatoria al semillero de robótica', description: 'Abierta la convocatoria para nuevos integrantes del semillero de robótica.', status: 'APROBADA', created: '2026-10-03' },
  { id: 305, title: 'Jornada de voluntariado ambiental', description: 'Siembra de árboles y recolección de residuos en el campus.', status: 'PUBLICADA', created: '2026-09-28' },
];

export const GP_PLACES = [
  { id: 1, name: 'Auditorio Principal', desc: 'Auditorio del edificio administrativo, planta baja' },
  { id: 2, name: 'Aula Magna', desc: 'Salón de grados y conferencias, bloque B' },
  { id: 3, name: 'Sala de Conferencias 2', desc: 'Sala con equipo de videoconferencia, bloque C' },
  { id: 4, name: 'Plazoleta Central', desc: 'Espacio abierto frente a la biblioteca' },
  { id: 5, name: 'Coliseo Cubierto', desc: 'Escenario deportivo con gradas' },
  { id: 6, name: 'Teatro Universitario', desc: 'Teatro con escenario y camerinos' },
  { id: 7, name: 'Sala de Estudio 3', desc: 'Sala de trabajo grupal en la biblioteca' },
];

export const GP_STATUS: Record<GpReqStatus, { label: string; color: string }> = {
  PENDIENTE: { label: 'Pendiente', color: '#D97706' },
  EN_REVISION: { label: 'En revisión', color: '#D97706' },
  RECHAZADA: { label: 'Rechazada', color: '#DC2626' },
  APROBADA: { label: 'Aprobada', color: '#059669' },
  PUBLICADA: { label: 'Publicada', color: '#059669' },
};

const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const MON3 = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const DAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
export const monthName = (m: number) => MONTHS[m];
export const dayShort = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'];
export const parseD = (s: string) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
export const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
export const fmtLong = (d: Date) => `${d.getDate()} de ${MONTHS[d.getMonth()]}, ${d.getFullYear()}`;           // d MMMM, yyyy
export const fmtShort = (d: Date) => `${d.getDate()} ${MON3[d.getMonth()]}, ${d.getFullYear()}`;           // d MMM, yyyy
export const fmtPick = (d: Date) => `${String(d.getDate()).padStart(2, '0')} ${MON3[d.getMonth()]} ${d.getFullYear()}`;
export const fmtWeekday = (d: Date) => `${cap(DAYS[d.getDay()])}, ${d.getDate()} ${cap(MONTHS[d.getMonth()])}`;
export const fmtWeekdayYear = (d: Date) => `${cap(DAYS[d.getDay()])} ${d.getDate()} de ${MONTHS[d.getMonth()]}, ${d.getFullYear()}`;
export const fmtDayTitle = (d: Date) => `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]}`;
export function t12(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number);
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'a. m.' : 'p. m.'}`;
}
export const evStart = (e: GpEvent) => { const d = parseD(e.date); const [h, m] = e.start.split(':').map(Number); d.setHours(h, m); return d; };
export const evEnd = (e: GpEvent) => { const d = parseD(e.date); const [h, m] = e.end.split(':').map(Number); d.setHours(h, m); return d; };
export const evPlace = (e: GpEvent) => e.places.length ? e.places.join(', ') : 'Por definir';

export function isLive(e: GpEvent, now = GP_NOW) { return now >= evStart(e) && now <= evEnd(e); }

export function countdown(e: GpEvent, now = GP_NOW): { text: string; live: boolean } | null {
  const s = evStart(e), en = evEnd(e);
  if (now >= s && now <= en) return { text: 'En curso', live: true };
  if (now > en) return null;
  const dayDiff = Math.round((parseD(e.date).getTime() - new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) / 86400000);
  if (dayDiff > 7) return null;
  if (dayDiff === 0) {
    const mins = Math.round((s.getTime() - now.getTime()) / 60000);
    const h = Math.floor(mins / 60), m = mins % 60;
    return { text: h > 0 ? `Hoy · en ${h}h ${m}min` : `Hoy · en ${m}min`, live: false };
  }
  if (dayDiff === 1) return { text: `Mañana · ${e.start}`, live: false };
  return { text: `Faltan ${dayDiff} ${dayDiff === 1 ? 'día' : 'días'}`, live: false };
}
