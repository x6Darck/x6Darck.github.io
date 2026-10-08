/** Datos 100% ficticios de la réplica web de GEA (Universidad Ejemplo). */
export const TODAY = '2026-10-06';

export type Ingreso = 'LIBRE' | 'PAGO' | 'PRIVADO';
export type EvEstado = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'PUBLICADA' | 'EN_REVISION';
export type Ev = {
  id: number; title: string; desc: string; tipo: string; office: string; email: string;
  fecha: string; ini: string; fin: string; lugar: string; estado: EvEstado;
  important?: boolean; img?: boolean; ingreso: Ingreso; obs?: string;
};

export const OFICINAS = ['Bienestar Universitario', 'Biblioteca', 'Comunicaciones', 'Egresados', 'Facultad de Ingeniería', 'Proyección Social'];

export const TIPOS: { nombre: string; color: string }[] = [
  { nombre: 'Académico', color: '#ce1126' },
  { nombre: 'Aseguramiento de la Calidad', color: '#16a34a' },
  { nombre: 'Bienestar Institucional', color: '#f59e0b' },
  { nombre: 'Cultural', color: '#8b5cf6' },
  { nombre: 'Investigación', color: '#0f766e' },
  { nombre: 'Proyección Social', color: '#0ea5e9' },
  { nombre: 'Otra', color: '#64748b' },
];
export const tipoColor = (n: string) => TIPOS.find(t => t.nombre === n)?.color ?? '#ce1126';

export const LUGARES: { nombre: string; externo?: boolean }[] = [
  { nombre: 'Aula Máxima' }, { nombre: 'Auditorio Principal' }, { nombre: 'Biblioteca - Sala de Lectura' },
  { nombre: 'Edificio Postgrados' }, { nombre: 'Laboratorio de Cómputo 3' }, { nombre: 'Plaza de Banderas' },
  { nombre: 'Teatro' }, { nombre: 'Externo', externo: true },
];

export const seedEvents: Ev[] = [
  { id: 133, title: 'Torneo Relámpago de Ajedrez', desc: 'Evento solicitado en zona no habilitada por el campus', tipo: 'Otra', office: 'Bienestar Universitario', email: 'usuario@gea-demo.test', fecha: '2026-10-16', ini: '14:00', fin: '17:00', lugar: 'Plaza de Banderas', estado: 'RECHAZADA', ingreso: 'LIBRE', obs: 'Lugar no disponible en la fecha' },
  { id: 132, title: 'Foro de Investigación Aplicada', desc: 'El moderador solicitó ajustar la descripción del foro', tipo: 'Investigación', office: 'Egresados', email: 'biblioteca@gea-demo.test', fecha: '2026-10-28', ini: '09:00', fin: '12:00', lugar: 'Edificio Postgrados', estado: 'EN_REVISION', ingreso: 'LIBRE', obs: 'Ajustar la descripción del foro.' },
  { id: 131, title: 'Encuentro de Egresados 2026', desc: 'Reencuentro informal con egresados de todas las cohortes', tipo: 'Otra', office: 'Biblioteca', email: 'biblioteca@gea-demo.test', fecha: '2026-10-26', ini: '18:00', fin: '20:00', lugar: 'Aula Máxima', estado: 'PENDIENTE', ingreso: 'LIBRE' },
  { id: 130, title: 'Congreso de Emprendimiento', desc: 'Conferencias y panel de emprendedores invitados', tipo: 'Académico', office: 'Bienestar Universitario', email: 'usuario@gea-demo.test', fecha: '2026-10-24', ini: '08:00', fin: '17:00', lugar: 'Auditorio Principal', estado: 'PENDIENTE', ingreso: 'LIBRE' },
  { id: 129, title: 'Concierto de Cámara Universitario', desc: 'Recital de la orquesta de cámara con repertorio clásico', tipo: 'Cultural', office: 'Bienestar Universitario', email: 'usuario@gea-demo.test', fecha: '2026-10-22', ini: '19:00', fin: '21:00', lugar: 'Teatro', estado: 'APROBADA', important: true, ingreso: 'PAGO' },
  { id: 128, title: 'Semana del Libro y la Lectura', desc: 'Lanzamiento de la colección digital y club de lectura', tipo: 'Académico', office: 'Biblioteca', email: 'biblioteca@gea-demo.test', fecha: '2026-10-20', ini: '10:00', fin: '16:00', lugar: 'Biblioteca - Sala de Lectura', estado: 'APROBADA', ingreso: 'LIBRE' },
  { id: 127, title: 'Taller de Autoevaluación Institucional', desc: 'Mesa de trabajo para consolidar evidencias de calidad', tipo: 'Aseguramiento de la Calidad', office: 'Biblioteca', email: 'biblioteca@gea-demo.test', fecha: '2026-10-18', ini: '08:00', fin: '12:00', lugar: 'Laboratorio de Cómputo 3', estado: 'PUBLICADA', img: true, ingreso: 'LIBRE' },
  { id: 126, title: 'Brigada de Asesoría Comunitaria', desc: 'Atención a la comunidad con orientación jurídica y psicológica', tipo: 'Proyección Social', office: 'Proyección Social', email: 'usuario@gea-demo.test', fecha: '2026-10-15', ini: '14:00', fin: '17:00', lugar: 'Plaza de Banderas', estado: 'PUBLICADA', ingreso: 'LIBRE' },
  { id: 125, title: 'Coloquio de Semilleros de Investigación', desc: 'Socialización de avances de los semilleros con evaluación de pares.', tipo: 'Investigación', office: 'Biblioteca', email: 'biblioteca@gea-demo.test', fecha: '2026-10-13', ini: '10:00', fin: '12:00', lugar: 'Edificio Postgrados', estado: 'PUBLICADA', ingreso: 'LIBRE' },
  { id: 124, title: 'Feria de Salud y Bienestar', desc: 'Tamizajes, pausas activas y charlas de nutrición para la comunidad.', tipo: 'Bienestar Institucional', office: 'Bienestar Universitario', email: 'usuario@gea-demo.test', fecha: '2026-10-11', ini: '09:00', fin: '11:00', lugar: 'Plaza de Banderas', estado: 'PUBLICADA', ingreso: 'LIBRE' },
  { id: 123, title: 'Muestra Artística Estudiantil', desc: 'Presentaciones de danza, música y teatro a cargo de los grupos culturales.', tipo: 'Cultural', office: 'Bienestar Universitario', email: 'usuario@gea-demo.test', fecha: '2026-10-09', ini: '14:00', fin: '17:00', lugar: 'Teatro', estado: 'PUBLICADA', important: true, ingreso: 'LIBRE' },
  { id: 122, title: 'Seminario de Innovación Educativa', desc: 'Jornada con ponentes invitados sobre metodologías activas y evaluación por competencias.', tipo: 'Académico', office: 'Bienestar Universitario', email: 'usuario@gea-demo.test', fecha: '2026-10-08', ini: '08:00', fin: '12:00', lugar: 'Aula Máxima', estado: 'PUBLICADA', important: true, ingreso: 'LIBRE' },
];

/** Anuncios que no viven en geaStore (solo se muestran en la tabla). */
export type ExtraAnn = { id: number; title: string; description: string; requester: string; office: string; place: string; start: string; end: string; status: string };
export const seedExtraAnns: ExtraAnn[] = [
  { id: 45, title: 'Venta de artículos en la cafetería', description: 'Solicitud de publicidad comercial externa', requester: 'Camila Duarte', office: 'Bienestar Universitario', place: 'Cartelera Digital', start: '2026-10-09', end: '2026-10-16', status: 'RECHAZADO' },
  { id: 44, title: 'Alianza de movilidad estudiantil', description: 'Información sobre intercambio académico', requester: 'Julián Pérez', office: 'Biblioteca', place: 'Cartelera Digital', start: '2026-10-12', end: '2026-11-03', status: 'EN_REVISION' },
  { id: 43, title: 'Campaña de reciclaje en el campus', description: 'Puntos ecológicos disponibles en cada bloque', requester: 'Camila Duarte', office: 'Bienestar Universitario', place: 'Cartelera Digital', start: '2026-10-11', end: '2026-11-10', status: 'PENDIENTE' },
  { id: 42, title: 'Jornada de actualización de datos', description: 'Actualiza tus datos y accede a beneficios', requester: 'Julián Pérez', office: 'Egresados', place: 'Cartelera Digital', start: '2026-10-08', end: '2026-10-31', status: 'PUBLICADA' },
];
export const annEmail = (office: string) => (office === 'Bienestar Universitario' ? 'usuario@gea-demo.test' : 'biblioteca@gea-demo.test');

export type Rol = 1 | 2 | 3 | 4 | 5;
export const ROLES: { id: Rol; label: string }[] = [
  { id: 1, label: 'Administrador' }, { id: 2, label: 'Comunicaciones' }, { id: 3, label: 'Oficina' },
  { id: 4, label: 'Usuario Autenticado' }, { id: 5, label: 'Consultoría' },
];
export const ROLE_ORDER: Rol[] = [1, 2, 5, 4, 3];
export type User = { id: number; nombre: string; celular: string; correo: string; rol: Rol; activo: boolean; oficina: string };
export const seedUsers: User[] = [
  { id: 1, nombre: 'Valentina Ríos', celular: '3001112233', correo: 'admin@gea-demo.test', rol: 1, activo: true, oficina: 'Comunicaciones' },
  { id: 2, nombre: 'Andrés Felipe Mora', celular: '3002223344', correo: 'moderador@gea-demo.test', rol: 2, activo: true, oficina: 'Comunicaciones' },
  { id: 3, nombre: 'Sofía Mendoza Ibarra', celular: '3005556677', correo: 'consultoria@gea-demo.test', rol: 5, activo: true, oficina: '' },
  { id: 4, nombre: 'Camila Duarte Pinto', celular: '3003334455', correo: 'usuario@gea-demo.test', rol: 3, activo: true, oficina: 'Bienestar Universitario' },
  { id: 5, nombre: 'Julián Peña Salcedo', celular: '3004445566', correo: 'biblioteca@gea-demo.test', rol: 3, activo: true, oficina: 'Biblioteca' },
];

export const seedReports = [
  { id: 4, titulo: 'Agenda de octubre 2026', desc: 'Eventos publicados del mes', oficina: 'Comunicaciones', usuario: 'admin@gea-demo.test', fecha: '7/10/2026', formato: 'PDF' },
  { id: 3, titulo: 'Solicitudes por oficina Q3', desc: 'Consolidado trimestral de solicitudes', oficina: 'Comunicaciones', usuario: 'moderador@gea-demo.test', fecha: '1/10/2026', formato: 'XLSX' },
  { id: 2, titulo: 'Anuncios de septiembre', desc: 'Publicaciones de cartelera digital', oficina: 'Biblioteca', usuario: 'biblioteca@gea-demo.test', fecha: '30/9/2026', formato: 'CSV' },
  { id: 1, titulo: 'Eventos deportivos', desc: 'Torneos y actividades de bienestar', oficina: 'Bienestar Universitario', usuario: 'usuario@gea-demo.test', fecha: '15/9/2026', formato: 'PDF' },
];

export const seedLogins = [
  { ok: true, correo: 'admin@gea-demo.test', metodo: 'Correo', motivo: '—', ip: '172.18.0.1', fecha: '7/10/2026, 2:23:23 a. m.' },
  { ok: true, correo: 'admin@gea-demo.test', metodo: 'Correo', motivo: '—', ip: '172.18.0.1', fecha: '6/10/2026, 11:31:54 p. m.' },
];

export const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export const fmtTime = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  const p = h >= 12 ? 'PM' : 'AM';
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${String(m).padStart(2, '0')} ${p}`;
};
export const SHORT_MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
export const fmtShort = (iso: string) => { const [, m, d] = iso.split('-').map(Number); return `${d} ${SHORT_MONTHS[m - 1]}`; };
