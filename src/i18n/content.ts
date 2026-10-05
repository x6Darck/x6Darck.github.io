export type Lang = 'es' | 'en';
export const langs: Lang[] = ['es', 'en'];

export const profile = {
  name: 'Jean Pier Leandro Gómez Rasch',
  short: 'Jean Pier Gómez',
  email: 'jeanpierleandro117@gmail.com',
  linkedin: 'https://www.linkedin.com/in/jean-pier-leandro-gomez-rasch-024108360',
  github: 'https://github.com/x6Darck',
  // [PENDIENTE] confirmar versión final del CV sin teléfono (ES y EN).
  cv: { es: '/cv/Jean-Pier-Gomez-CV-ES.pdf', en: '/cv/Jean-Pier-Gomez-CV-ES.pdf' },
};

const gh = (repo: string) => ({ label: repo, href: `https://github.com/x6Darck/${repo}` });

export const projectsMeta = [
  {
    id: 'gea',
    year: 2026,
    stack: ['Spring Boot', 'React', 'Flutter', 'MySQL'],
    repos: [gh('Backend_gea'), gh('Front_gea'), gh('Movil_gea')],
    defaultNode: 'api',
  },
  {
    id: 'farmstock',
    year: 2025,
    stack: ['Spring Boot', 'Electron', 'MySQL'],
    repos: [gh('FarmStock_Backend'), gh('FarmStock_Front')],
    defaultNode: 'local',
  },
] as const;

export const filterTags = ['Spring Boot', 'React', 'Flutter', 'Electron', 'MySQL'] as const;

/** Tecnologías agrupadas. `used` apunta a ids de proyecto donde aparece. */
export const stackGroups = [
  {
    id: 'backend',
    items: [
      { name: 'Java', used: ['gea', 'farmstock'] },
      { name: 'Spring Boot', used: ['gea', 'farmstock'] },
      { name: 'Spring Security + JWT', used: ['gea'] },
      { name: 'REST APIs', used: ['gea', 'farmstock'] },
      { name: 'MySQL', used: ['gea', 'farmstock'] },
    ],
  },
  {
    id: 'clients',
    items: [
      { name: 'React', used: ['gea'] },
      { name: 'Angular', used: [] },
      { name: 'Flutter (Dart)', used: ['gea'] },
      { name: 'Electron', used: ['farmstock'] },
    ],
  },
  {
    id: 'tools',
    items: [
      { name: 'Git / GitHub', used: ['gea', 'farmstock'] },
      { name: 'Docker', used: ['gea'] },
      { name: 'Agile', used: [] },
    ],
  },
] as const;

const es = {
  lang: 'es',
  htmlLang: 'es-CO',
  meta: {
    title: 'Jean Pier Gómez | Desarrollador Full Stack Junior',
    description:
      'Portafolio de Jean Pier Leandro Gómez Rasch, desarrollador Full Stack junior en Cúcuta, Colombia. Java, Spring Boot, React, Flutter y Electron.',
  },
  ui: {
    skip: 'Ir al contenido',
    menuOpen: 'Abrir menú',
    menuClose: 'Cerrar menú',
    theme: 'Cambiar tema claro u oscuro',
    langSwitch: 'Switch to English',
    langShort: 'EN',
    navLabel: 'Principal',
    home: 'Inicio',
  },
  nav: [
    { id: 'about', label: 'Sobre mí' },
    { id: 'projects', label: 'Proyectos' },
    { id: 'stack', label: 'Stack' },
    { id: 'experience', label: 'Experiencia' },
    { id: 'education', label: 'Formación' },
    { id: 'contact', label: 'Contacto' },
  ],
  hero: {
    title: 'Sistemas completos, de la base de datos al cliente.',
    sub: 'Soy Jean Pier Gómez, desarrollador Full Stack junior. Backend con Java y Spring Boot; clientes web, móvil y escritorio.',
    ctaProjects: 'Ver proyectos',
    ctaCv: 'Descargar CV',
    meta: 'Cúcuta, Colombia · Presencial o remoto',
    visualLabel: 'Diagrama: una API REST en Spring Boot, con clientes React y Flutter y base de datos MySQL.',
  },
  about: {
    title: 'Sobre mí',
    p1: 'Diseño y construyo sistemas completos de punta a punta: base de datos, API REST y clientes web, móvil y de escritorio. Me ocupo de todo el ciclo, desde el diseño y la arquitectura hasta el despliegue.',
    p2: 'Busco un rol junior como desarrollador Full Stack o Backend, presencial en Cúcuta o remoto.',
    facts: [
      { k: 'Ubicación', v: 'Cúcuta, Colombia' },
      { k: 'Busco', v: 'Full Stack o Backend junior' },
      { k: 'Modalidad', v: 'Presencial en Cúcuta o remoto' },
      { k: 'Idiomas', v: 'Español nativo, inglés B2' },
    ],
  },
  projects: {
    title: 'Proyectos',
    intro: 'Dos sistemas completos, desde la base de datos hasta el cliente.',
    filterLabel: 'Filtrar por tecnología',
    all: 'Todos',
    countOne: '1 proyecto',
    countMany: (n: number) => `${n} proyectos`,
    problem: 'Problema',
    solution: 'Solución',
    architecture: 'Arquitectura',
    repos: 'Repositorios',
    diagramHint: 'Selecciona un nodo para ver su detalle.',
    diagramLabel: 'Diagrama interactivo de arquitectura',
    items: {
      gea: {
        title: 'GEA',
        tagline: 'Plataforma modular para gestionar, publicar y moderar eventos y anuncios.',
        problem:
          'Gestionar, publicar y moderar eventos y anuncios en un solo lugar, con espacios y reservas, y que sea accesible desde la web y desde el celular.',
        solution:
          'Una plataforma de 5 módulos sobre una sola API REST en Spring Boot, consumida por un cliente web en React y una app móvil en Flutter.',
        architecture: [
          'Spring Security con JWT y acceso por roles.',
          'MySQL con auditoría de cambios mediante Hibernate Envers.',
          'API documentada con Swagger/OpenAPI y desplegada con Docker.',
          '3 repositorios: backend, web y móvil.',
        ],
        highlight: 'Una API, tres repositorios: backend, web y móvil.',
        diagram: {
          react: { label: 'React', sub: 'Front_gea', title: 'Cliente web', body: 'Interfaz web en React. Consume la API REST de Spring Boot.' },
          flutter: { label: 'Flutter', sub: 'Movil_gea', title: 'Cliente móvil', body: 'App móvil en Flutter (Dart). Usa la misma API REST que el cliente web.' },
          api: { label: 'Spring Boot', sub: 'Backend_gea', title: 'API REST', body: 'Spring Security con JWT y acceso por roles. Documentada con Swagger/OpenAPI y desplegada con Docker.' },
          db: { label: 'MySQL', sub: 'Hibernate Envers', title: 'Base de datos', body: 'MySQL con auditoría de cambios mediante Hibernate Envers.' },
        },
      },
      farmstock: {
        title: 'FarmStock',
        tagline: 'Inventario de herramientas para una granja del SENA en El Zulia.',
        problem:
          'Controlar el inventario de herramientas de una granja del SENA en El Zulia, donde el internet es inestable y una caída no puede frenar el trabajo.',
        solution:
          'Una aplicación de escritorio con Electron sobre una API en Spring Boot, que sigue operando con almacenamiento local cuando el backend no está disponible.',
        architecture: [
          'Herramientas, préstamos, mantenimiento, aprendices, equipos de cómputo y estadísticas.',
          'Código QR por herramienta, reportes en PDF y notificaciones por correo.',
          'Pruebas unitarias, de integración y de rendimiento.',
        ],
        highlight: 'Reto: seguir operando cuando el internet falla.',
        diagram: {
          electron: { label: 'Electron', sub: 'FarmStock_Front', title: 'Cliente de escritorio', body: 'Aplicación de escritorio en Electron para herramientas, préstamos, mantenimiento, aprendices, equipos de cómputo y estadísticas.' },
          local: { label: 'Almacén local', sub: 'sin conexión', title: 'Modo sin conexión', body: 'Si el backend no está disponible, la app guarda los datos en almacenamiento local y sigue operando.' },
          api: { label: 'Spring Boot', sub: 'FarmStock_Backend', title: 'API REST', body: 'Backend en Spring Boot que expone la API REST sobre MySQL.' },
          db: { label: 'MySQL', sub: 'datos', title: 'Base de datos', body: 'Base de datos MySQL del inventario.' },
        },
      },
    },
  },
  stack: {
    title: 'Stack',
    intro: 'Lo que uso y dónde lo he usado.',
    usedIn: 'Usado en',
    groups: { backend: 'Backend y datos', clients: 'Clientes', tools: 'Herramientas y método' },
    projectNames: { gea: 'GEA', farmstock: 'FarmStock' },
  },
  experience: {
    title: 'Experiencia',
    role: 'Desarrollador de Software',
    org: 'Universidad Libre, Cúcuta',
    period: 'Ene - Jun 2026',
    bullets: [
      'Diseñé y desarrollé GEA, una plataforma modular de 5 módulos para gestionar, publicar y moderar eventos y anuncios, más una app móvil.',
      'Cubrí de forma independiente todo el ciclo: diseño, arquitectura, backend, frontend y base de datos.',
      'API REST con Spring Boot y Spring Security (JWT, acceso por roles), consumida por React y Flutter.',
      'MySQL con auditoría de cambios (Hibernate Envers), documentación con Swagger/OpenAPI y despliegue con Docker.',
      'Entregué 3 repositorios: web, móvil y backend.',
    ],
  },
  education: {
    title: 'Formación',
    items: [
      { name: 'Tecnólogo en Análisis y Desarrollo de Software', org: 'SENA, Cúcuta', period: '2024 - 2026' },
      { name: 'Técnico en Sistemas', org: 'SENA, Cúcuta', period: '2021 - 2023' },
    ],
    langTitle: 'Idiomas',
    langs: [
      { name: 'Español', level: 'Nativo' },
      { name: 'Inglés', level: 'B2' },
    ],
  },
  contact: {
    title: 'Contacto',
    p: 'Busco un rol junior Full Stack o Backend, presencial en Cúcuta o remoto. Escríbeme por correo o LinkedIn.',
    email: 'Correo',
    copy: 'Copiar correo',
    copied: 'Correo copiado',
    linkedin: 'LinkedIn',
    github: 'GitHub',
    cv: 'Descargar CV',
    cvNote: 'PDF, en español',
  },
  footer: { rights: 'Jean Pier Leandro Gómez Rasch', built: 'Hecho con Astro y Tailwind' },
};

const en: typeof es = {
  lang: 'en',
  htmlLang: 'en',
  meta: {
    title: 'Jean Pier Gómez | Junior Full Stack Developer',
    description:
      'Portfolio of Jean Pier Leandro Gómez Rasch, junior Full Stack developer in Cúcuta, Colombia. Java, Spring Boot, React, Flutter and Electron.',
  },
  ui: {
    skip: 'Skip to content',
    menuOpen: 'Open menu',
    menuClose: 'Close menu',
    theme: 'Toggle light or dark theme',
    langSwitch: 'Cambiar a español',
    langShort: 'ES',
    navLabel: 'Main',
    home: 'Home',
  },
  nav: [
    { id: 'about', label: 'About' },
    { id: 'projects', label: 'Projects' },
    { id: 'stack', label: 'Stack' },
    { id: 'experience', label: 'Experience' },
    { id: 'education', label: 'Education' },
    { id: 'contact', label: 'Contact' },
  ],
  hero: {
    title: 'Complete systems, from the database to the client.',
    sub: "I'm Jean Pier Gómez, a junior Full Stack developer. Backends in Java and Spring Boot; web, mobile and desktop clients.",
    ctaProjects: 'View projects',
    ctaCv: 'Download CV (ES)',
    meta: 'Cúcuta, Colombia · On-site or remote',
    visualLabel: 'Diagram: one Spring Boot REST API, with React and Flutter clients and a MySQL database.',
  },
  about: {
    title: 'About',
    p1: 'I design and build complete systems end to end: database, REST API, and web, mobile and desktop clients. I handle the whole lifecycle, from design and architecture to deployment.',
    p2: "I'm looking for a junior Full Stack or Backend role, on-site in Cúcuta or remote.",
    facts: [
      { k: 'Location', v: 'Cúcuta, Colombia' },
      { k: 'Looking for', v: 'Junior Full Stack or Backend' },
      { k: 'Work mode', v: 'On-site in Cúcuta or remote' },
      { k: 'Languages', v: 'Spanish native, English B2' },
    ],
  },
  projects: {
    title: 'Projects',
    intro: 'Two complete systems, from the database to the client.',
    filterLabel: 'Filter by technology',
    all: 'All',
    countOne: '1 project',
    countMany: (n: number) => `${n} projects`,
    problem: 'Problem',
    solution: 'Solution',
    architecture: 'Architecture',
    repos: 'Repositories',
    diagramHint: 'Select a node to see its details.',
    diagramLabel: 'Interactive architecture diagram',
    items: {
      gea: {
        title: 'GEA',
        tagline: 'Modular platform to manage, publish and moderate events and announcements.',
        problem:
          'Managing, publishing and moderating events and announcements in one place, with spaces and reservations, available on the web and on mobile.',
        solution:
          'A 5-module platform on a single Spring Boot REST API, consumed by a React web client and a Flutter mobile app.',
        architecture: [
          'Spring Security with JWT and role-based access.',
          'MySQL with change auditing through Hibernate Envers.',
          'API documented with Swagger/OpenAPI and deployed with Docker.',
          '3 repositories: backend, web and mobile.',
        ],
        highlight: 'One API, three repositories: backend, web and mobile.',
        diagram: {
          react: { label: 'React', sub: 'Front_gea', title: 'Web client', body: 'Web interface built with React. Consumes the Spring Boot REST API.' },
          flutter: { label: 'Flutter', sub: 'Movil_gea', title: 'Mobile client', body: 'Mobile app built with Flutter (Dart). Uses the same REST API as the web client.' },
          api: { label: 'Spring Boot', sub: 'Backend_gea', title: 'REST API', body: 'Spring Security with JWT and role-based access. Documented with Swagger/OpenAPI and deployed with Docker.' },
          db: { label: 'MySQL', sub: 'Hibernate Envers', title: 'Database', body: 'MySQL with change auditing through Hibernate Envers.' },
        },
      },
      farmstock: {
        title: 'FarmStock',
        tagline: 'Tool inventory for a SENA farm in El Zulia.',
        problem:
          'Keeping the tool inventory of a SENA farm in El Zulia, where the internet is unstable and an outage cannot stop the work.',
        solution:
          'A desktop app built with Electron on a Spring Boot API, which keeps working with local storage when the backend is unavailable.',
        architecture: [
          'Tools, loans, maintenance, apprentices, computer equipment and statistics.',
          'A QR code per tool, PDF reports and email notifications.',
          'Unit, integration and performance tests.',
        ],
        highlight: 'Challenge: keep working when the internet fails.',
        diagram: {
          electron: { label: 'Electron', sub: 'FarmStock_Front', title: 'Desktop client', body: 'Electron desktop app for tools, loans, maintenance, apprentices, computer equipment and statistics.' },
          local: { label: 'Local store', sub: 'offline', title: 'Offline mode', body: 'If the backend is unavailable, the app saves data to local storage and keeps working.' },
          api: { label: 'Spring Boot', sub: 'FarmStock_Backend', title: 'REST API', body: 'Spring Boot backend that exposes the REST API on top of MySQL.' },
          db: { label: 'MySQL', sub: 'data', title: 'Database', body: 'MySQL database for the inventory.' },
        },
      },
    },
  },
  stack: {
    title: 'Stack',
    intro: 'What I use and where I have used it.',
    usedIn: 'Used in',
    groups: { backend: 'Backend and data', clients: 'Clients', tools: 'Tools and method' },
    projectNames: { gea: 'GEA', farmstock: 'FarmStock' },
  },
  experience: {
    title: 'Experience',
    role: 'Software Developer',
    org: 'Universidad Libre, Cúcuta',
    period: 'Jan - Jun 2026',
    bullets: [
      'Designed and built GEA, a 5-module modular platform to manage, publish and moderate events and announcements, plus a mobile app.',
      'Covered the full lifecycle on my own: design, architecture, backend, frontend and database.',
      'REST API with Spring Boot and Spring Security (JWT, role-based access), consumed by React and Flutter.',
      'MySQL with change auditing (Hibernate Envers), Swagger/OpenAPI documentation and Docker deployment.',
      'Delivered 3 repositories: web, mobile and backend.',
    ],
  },
  education: {
    title: 'Education',
    items: [
      { name: 'Technologist in Software Analysis and Development', org: 'SENA, Cúcuta', period: '2024 - 2026' },
      { name: 'Systems Technician', org: 'SENA, Cúcuta', period: '2021 - 2023' },
    ],
    langTitle: 'Languages',
    langs: [
      { name: 'Spanish', level: 'Native' },
      { name: 'English', level: 'B2' },
    ],
  },
  contact: {
    title: 'Contact',
    p: "I'm looking for a junior Full Stack or Backend role, on-site in Cúcuta or remote. Write to me by email or LinkedIn.",
    email: 'Email',
    copy: 'Copy email',
    copied: 'Email copied',
    linkedin: 'LinkedIn',
    github: 'GitHub',
    cv: 'Download CV',
    cvNote: 'PDF, in Spanish',
  },
  footer: { rights: 'Jean Pier Leandro Gómez Rasch', built: 'Built with Astro and Tailwind' },
};

export const dict = { es, en };
export type Dict = typeof es;
