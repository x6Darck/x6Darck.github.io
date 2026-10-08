import type { Script } from '../types';

/** Guion corto para el modo móvil / interactivo (solo el teléfono). */
export const geaPhoneScript: Script = [
  {
    id: 'calendario',
    label: { es: 'Tu agenda en el bolsillo', en: 'Your agenda in your pocket' },
    steps: [
      { t: 'screen', id: 'calendario' },
      { t: 'highlight', to: 'calendar', ms: 1200 },
      { t: 'click', to: 'day-14' },
      { t: 'wait', ms: 500 },
      { t: 'click', to: 'event-104' },
      { t: 'wait', ms: 700 },
      { t: 'highlight', to: 'event-detail', ms: 900 },
      { t: 'click', to: 'pin-detail' },
      { t: 'wait', ms: 900 },
      { t: 'click', to: 'scrim' },
    ],
  },
  {
    id: 'anuncios',
    label: { es: 'Anuncios al instante', en: 'Instant announcements' },
    steps: [
      { t: 'screen', id: 'anuncios' },
      { t: 'wait', ms: 500 },
      { t: 'scroll', to: 'announcements-list', by: 160, ms: 900 },
      { t: 'highlight', to: 'announcement-40', ms: 1200 },
      { t: 'scroll', to: 'announcements-list', by: -160, ms: 600 },
    ],
  },
  {
    id: 'solicitud',
    label: { es: 'Solicita y sigue tu anuncio', en: 'Request and track an announcement' },
    steps: [
      { t: 'screen', id: 'solicitudes' },
      { t: 'wait', ms: 500 },
      { t: 'click', to: 'solicitud-crear' },
      { t: 'type', to: 'field-titulo', text: 'Feria de Becas 2026', cps: 16 },
      { t: 'type', to: 'field-descripcion', text: 'Orientación sobre becas y apoyos para estudiantes.', cps: 22 },
      { t: 'wait', ms: 400 },
      { t: 'click', to: 'btn-enviar' },
      { t: 'wait', ms: 900 },
      { t: 'highlight', to: 'request-card-new', ms: 1600 },
    ],
  },
];
