# Portafolio Jean Pier Gómez

Astro + Tailwind v4. Sitio estatico bilingue (`/es/`, `/en/`), tema claro/oscuro, sin frameworks de UI en cliente.

## Uso
```bash
npm install
npm run dev        # desarrollo
SITE_URL=https://tu-dominio npm run build   # genera dist/
npm run preview
```
Despliega `dist/` en GitHub Pages, Netlify, Vercel o Cloudflare Pages (sitio raiz). Actualiza tambien `public/robots.txt`.

## Donde editar
- Textos ES/EN, proyectos, stack: `src/i18n/content.ts`
- Diagramas de arquitectura: `src/lib/diagram.ts`
- Tokens de color, radios y motion: `src/styles/global.css`
- CV: `public/cv/`
Ver `PENDIENTES.md`.
