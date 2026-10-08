export type Lang = 'es' | 'en';

export const profile = {
  name: 'Jean Pier Leandro Gómez Rasch',
  email: 'jeanpierleandro117@gmail.com',
  linkedin: 'https://www.linkedin.com/in/jean-pier-leandro-gomez-rasch-024108360',
  github: 'https://github.com/x6Darck',
  cv: '/cv/CV-Jean-Pier-Leandro-Gomez-Rasch.pdf',
};
const gh = (repo: string) => ({ label: repo, href: `https://github.com/x6Darck/${repo}` });
export const geaRepos = [gh('Backend_gea'), gh('Front_gea'), gh('Movil_gea')];
export const farmRepos = [gh('FarmStock_Backend'), gh('FarmStock_Front')];
export const moduleIds = ['calendario', 'eventos', 'anuncios', 'reportes', 'usuarios', 'seguridad'] as const;

const es = {
  meta: { title: 'Jean Pier Gómez | Desarrollador Full Stack Junior' },
  ui: { skip: 'Ir al contenido', theme: 'Cambiar tema', lang: 'English', langCode: 'EN', menu: 'Menú', closeMenu: 'Cerrar menú', pending: '[PENDIENTE]', repos: 'Repositorios', home: 'Inicio' },
  nav: [
    { id: 'gea', label: 'GEA' }, { id: 'farmstock', label: 'FarmStock' }, { id: 'stack', label: 'Stack' },
    { id: 'about', label: 'Sobre mí' }, { id: 'contact', label: 'Contacto' },
  ],
  hero: {
    title: 'Una persona. El sistema completo.',
    sub: 'Soy Jean Pier Gómez, desarrollador Full Stack junior en Cúcuta. Diseño y construyo la API, la web, el móvil y el escritorio.',
    cta: 'Ver proyectos', cv: 'Descargar CV (EN)', meta: 'Cúcuta, Colombia · Presencial o remoto', scroll: 'Desliza',
  },
  demo: { prev: 'Anterior', next: 'Siguiente', tryIt: 'Pruébalo tú', backToTour: 'Ver recorrido', reset: 'Reiniciar demo', step: 'Paso', dots: 'Pasos de la demostración', expand: 'Ampliar' },
  gea: {
    year: '2026',
    ph1: { t: 'GEA. Eventos, anuncios y espacios en un solo lugar.', s: 'La plataforma de Universidad Libre para gestionar, publicar y moderar, hecha de punta a punta.' },
    ph2: { t: 'Una API. Tres clientes.', s: 'El mismo backend en Spring Boot sirve a la web en React y a la app móvil en Flutter.' },
    ph3: { t: 'Un recorrido por la plataforma.', s: '' },
    api: 'API REST · Spring Boot', web: 'Web · React', mobile: 'Móvil · Flutter',
    phonePending: 'Captura de la app Flutter',
    modules: [
      { id: 'calendario', title: 'Calendario', caption: 'Vista mensual con los eventos de cada día y un panel de próximos eventos con búsqueda.' },
      { id: 'eventos', title: 'Eventos', caption: 'Listado con búsqueda y filtros por estado: publicados, ocultos, aprobados, pendientes, rechazados y en revisión.' },
      { id: 'anuncios', title: 'Anuncios', caption: 'Pasan por los mismos estados de moderación que los eventos, cada uno con su vigencia.' },
      { id: 'reportes', title: 'Reportes', caption: 'Total de solicitudes, tasa de aprobación, tendencia mensual y distribución por estado y por oficina.' },
      { id: 'usuarios', title: 'Usuarios', caption: 'Usuarios agrupados por rol: Administrador, Comunicaciones, Consultoría y Oficina.' },
      { id: 'seguridad', title: 'Seguridad', caption: 'Registro de inicios de sesión con filtros por correo, IP, estado y fechas.' },
    ],
    moduleLabel: 'Módulo', tabsLabel: 'Módulos de GEA', zoom: 'Ampliar captura', zoomClose: 'Cerrar', zoomHint: 'Desliza para ver la captura completa',
    backTitle: 'Detrás de escena', backSub: 'Lo que sostiene a GEA.',
    cards: [
      { id: 'jwt', t: 'JWT y roles', b: 'Spring Security con JWT y acceso por roles en cada endpoint.' },
      { id: 'envers', t: 'Auditoría de cambios', b: 'Hibernate Envers deja registro de los cambios sobre MySQL.' },
      { id: 'swagger', t: 'API documentada', b: 'Swagger / OpenAPI para explorar y probar cada recurso.' },
      { id: 'docker', t: 'Listo con Docker', b: 'Backend, web y base de datos se levantan con contenedores.' },
    ],
    roles: ['Administrador', 'Comunicaciones', 'Consultoría', 'Oficina'],
    demoNote: 'Réplica interactiva de la interfaz, construida en código con datos ficticios de una universidad de ejemplo.',
    demoTitle: 'Qué muestra la demo',
    demoList: [
      'Acceso por rol: el administrador inicia sesión.',
      'Panel: calendario, eventos próximos y contadores.',
      'Eventos: se crea una solicitud y aparece en la lista.',
      'Moderación: un anuncio pendiente se aprueba con un clic y llega a la app móvil.',
      'Calendario de espacios: se abre un día con sus eventos y lugares.',
      'Roles y permisos: se cambia el rol de un usuario.',
      'Tiempo real: la app Flutter muestra el anuncio recién aprobado.',
    ],
    facts: ['5 módulos', '3 repositorios'],
  },
  farm: {
    year: '2025',
    title: 'FarmStock.', sub: 'Inventario de herramientas y equipos para una finca del SENA en El Zulia, donde el internet no es confiable.',
    toggleLabel: 'Estado de la conexión', on: 'Conectado', off: 'Sin conexión',
    onNote: 'La app consulta y guarda en la API.', offNote: 'El backend no responde. La app sigue operando con almacenamiento local.',
    banner: 'Sin conexión: guardando en este equipo', sim: 'Réplica interactiva con datos ficticios. El indicador y la sincronización son una demostración del comportamiento sin conexión.',
    demoTitle: 'Qué muestra la demo',
    demoList: [
      'Inventario: se abre el detalle de una herramienta.',
      'QR: se genera el código de una unidad.',
      'Préstamo: se registra la salida a un aprendiz.',
      'Reporte: vista previa del PDF.',
      'Sin conexión: la app sigue guardando en este equipo y sincroniza al volver.',
    ],
    pendingShot: 'Captura de FarmStock', menu: ['Herramientas', 'Préstamos', 'Mantenimiento', 'Aprendices', 'Equipos de cómputo', 'Estadísticas'],
    action: 'Registrar préstamo', queued: 'Registros locales', online: 'En línea', offline: 'Modo sin conexión',
    cards: [
      { id: 'qr', t: 'Un QR por herramienta', b: 'Cada unidad se identifica con su código QR.' },
      { id: 'pdf', t: 'Reportes en PDF', b: 'Los reportes se generan y se descargan como PDF.' },
      { id: 'mail', t: 'Avisos por correo', b: 'Notificaciones por correo electrónico.' },
      { id: 'tests', t: 'Probado de tres formas', b: 'Pruebas unitarias, de integración y de rendimiento.' },
    ],
    cardsTitle: 'Lo que trae por dentro',
  },
  stack: {
    title: 'El stack, por capas.', sub: 'Pasa el cursor sobre cada icono.',
    groups: { backend: 'Backend', web: 'Web', mobile: 'Móvil', desktop: 'Escritorio', data: 'Datos y DevOps' },
  },
  about: {
    title: 'Un desarrollador, todo el sistema.',
    p1: 'Diseño y construyo sistemas completos de punta a punta: base de datos, API REST y clientes web, móvil y de escritorio. Me ocupo del ciclo completo, desde la arquitectura hasta el despliegue.',
    p2: 'Busco un rol junior Full Stack o Backend, presencial en Cúcuta o remoto.',
    langs: 'Español nativo · Inglés B2',
  },
  timeline: {
    title: 'Trayectoria',
    items: [
      { period: 'Ene - Jun 2026', t: 'Desarrollador de Software', o: 'Universidad Libre, Cúcuta', d: 'Diseñé y desarrollé GEA de forma independiente: arquitectura, backend, frontend y base de datos.' },
      { period: '2024 - 2026', t: 'Tecnólogo en Análisis y Desarrollo de Software', o: 'SENA, Cúcuta', d: '' },
      { period: '2021 - 2023', t: 'Técnico en Sistemas', o: 'SENA, Cúcuta', d: '' },
    ],
  },
  contact: { title: 'Hablemos.', p: 'Busco mi primer rol Full Stack o Backend. Escríbeme.', email: 'Correo', copy: 'Copiar correo', copied: 'Correo copiado', linkedin: 'LinkedIn', github: 'GitHub', cv: 'Descargar CV (EN)' },
  footer: 'Hecho con React, Vite y GSAP.',
};

const en: typeof es = {
  meta: { title: 'Jean Pier Gómez | Junior Full Stack Developer' },
  ui: { skip: 'Skip to content', theme: 'Toggle theme', lang: 'Español', langCode: 'ES', menu: 'Menu', closeMenu: 'Close menu', pending: '[PENDING]', repos: 'Repositories', home: 'Home' },
  nav: [
    { id: 'gea', label: 'GEA' }, { id: 'farmstock', label: 'FarmStock' }, { id: 'stack', label: 'Stack' },
    { id: 'about', label: 'About' }, { id: 'contact', label: 'Contact' },
  ],
  hero: {
    title: 'One developer. The complete system.',
    sub: 'I am Jean Pier Gómez, a junior Full Stack developer in Cúcuta. I design and build the API, the web, mobile and desktop clients.',
    cta: 'View projects', cv: 'Download CV', meta: 'Cúcuta, Colombia · On-site or remote', scroll: 'Scroll',
  },
  demo: { prev: 'Previous', next: 'Next', tryIt: 'Try it yourself', backToTour: 'Back to the tour', reset: 'Restart demo', step: 'Step', dots: 'Demo steps', expand: 'Enlarge' },
  gea: {
    year: '2026',
    ph1: { t: 'GEA. Events, announcements and spaces in one place.', s: 'The Universidad Libre platform to manage, publish and moderate, built end to end.' },
    ph2: { t: 'One API. Three clients.', s: 'The same Spring Boot backend serves the React web app and the Flutter mobile app.' },
    ph3: { t: 'A tour of the platform.', s: '' },
    api: 'REST API · Spring Boot', web: 'Web · React', mobile: 'Mobile · Flutter',
    phonePending: 'Flutter app screenshot',
    modules: [
      { id: 'calendario', title: 'Calendar', caption: 'Month view with each day\'s events and an upcoming-events panel with search.' },
      { id: 'eventos', title: 'Events', caption: 'List with search and status filters: published, hidden, approved, pending, rejected and in review.' },
      { id: 'anuncios', title: 'Announcements', caption: 'They go through the same moderation states as events, each with its own validity period.' },
      { id: 'reportes', title: 'Reports', caption: 'Total requests, approval rate, monthly trend and breakdown by status and by office.' },
      { id: 'usuarios', title: 'Users', caption: 'Users grouped by role: Administrator, Communications, Consulting and Office.' },
      { id: 'seguridad', title: 'Security', caption: 'Sign-in log with filters by email, IP, status and dates.' },
    ],
    moduleLabel: 'Module', tabsLabel: 'GEA modules', zoom: 'Enlarge screenshot', zoomClose: 'Close', zoomHint: 'Swipe to see the full screenshot',
    backTitle: 'Behind the scenes', backSub: 'What holds GEA together.',
    cards: [
      { id: 'jwt', t: 'JWT and roles', b: 'Spring Security with JWT and role-based access on every endpoint.' },
      { id: 'envers', t: 'Change auditing', b: 'Hibernate Envers keeps a record of changes on MySQL.' },
      { id: 'swagger', t: 'Documented API', b: 'Swagger / OpenAPI to explore and try every resource.' },
      { id: 'docker', t: 'Ready with Docker', b: 'Backend, web and database start with containers.' },
    ],
    roles: ['Administrator', 'Communications', 'Consulting', 'Office'],
    demoNote: 'Interactive replica of the interface, built in code with fictitious data from a sample university.',
    demoTitle: 'What the demo shows',
    demoList: [
      'Role-based sign-in: the administrator logs in.',
      'Dashboard: calendar, upcoming events and counters.',
      'Events: a request is created and shows up in the list.',
      'Moderation: a pending announcement is approved in one click and reaches the mobile app.',
      'Spaces calendar: a day opens with its events and venues.',
      'Roles and permissions: a user\'s role is changed.',
      'Real time: the Flutter app shows the announcement just approved.',
    ],
    facts: ['5 modules', '3 repositories'],
  },
  farm: {
    year: '2025',
    title: 'FarmStock.', sub: 'Tool and equipment inventory for a SENA farm in El Zulia, where the internet is not reliable.',
    toggleLabel: 'Connection status', on: 'Online', off: 'Offline',
    onNote: 'The app reads from and writes to the API.', offNote: 'The backend is down. The app keeps working with local storage.',
    banner: 'Offline: saving on this device', sim: 'Interactive replica with fictitious data. The indicator and the sync are a demonstration of the offline behaviour.',
    demoTitle: 'What the demo shows',
    demoList: [
      'Inventory: a tool\'s detail opens.',
      'QR: the code for a unit is generated.',
      'Loan: a tool is checked out to a trainee.',
      'Report: PDF preview.',
      'Offline: the app keeps saving on this device and syncs when it is back.',
    ],
    pendingShot: 'FarmStock screenshot', menu: ['Tools', 'Loans', 'Maintenance', 'Apprentices', 'Computer equipment', 'Statistics'],
    action: 'Register loan', queued: 'Local records', online: 'Online', offline: 'Offline mode',
    cards: [
      { id: 'qr', t: 'One QR per tool', b: 'Each unit is identified by its own QR code.' },
      { id: 'pdf', t: 'PDF reports', b: 'Reports are generated and downloaded as PDF.' },
      { id: 'mail', t: 'Email notices', b: 'Email notifications.' },
      { id: 'tests', t: 'Tested three ways', b: 'Unit, integration and performance tests.' },
    ],
    cardsTitle: 'What it carries inside',
  },
  stack: {
    title: 'The stack, by layer.', sub: 'Hover over each icon.',
    groups: { backend: 'Backend', web: 'Web', mobile: 'Mobile', desktop: 'Desktop', data: 'Data and DevOps' },
  },
  about: {
    title: 'One developer, the whole system.',
    p1: 'I design and build complete systems end to end: database, REST API and web, mobile and desktop clients. I cover the whole cycle, from architecture to deployment.',
    p2: 'I am looking for a junior Full Stack or Backend role, on-site in Cúcuta or remote.',
    langs: 'Native Spanish · English B2',
  },
  timeline: {
    title: 'Path',
    items: [
      { period: 'Jan - Jun 2026', t: 'Software Developer', o: 'Universidad Libre, Cúcuta', d: 'I designed and built GEA on my own: architecture, backend, frontend and database.' },
      { period: '2024 - 2026', t: 'Software Analysis and Development Technologist', o: 'SENA, Cúcuta', d: '' },
      { period: '2021 - 2023', t: 'Systems Technician', o: 'SENA, Cúcuta', d: '' },
    ],
  },
  contact: { title: 'Let\'s talk.', p: 'I am looking for my first Full Stack or Backend role. Write to me.', email: 'Email', copy: 'Copy email', copied: 'Email copied', linkedin: 'LinkedIn', github: 'GitHub', cv: 'Download CV' },
  footer: 'Built with React, Vite and GSAP.',
};

export const copy = { es, en };
export type Copy = typeof es;
