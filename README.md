# Portafolio · Jean Pier Gómez

Portafolio cinematográfico estilo lanzamiento de producto de Jean Pier Leandro Gómez Rasch, desarrollador Full Stack Junior (Cúcuta).
Publicado en https://x6darck.github.io/

## Stack
React 19, Vite, Tailwind CSS v4, GSAP + ScrollTrigger. Español/inglés, tema claro/oscuro.

## Qué incluye
- Capítulo **GEA** (calendario institucional): demo interactiva de la web (React), la app móvil (Flutter) y la API (Spring Boot) conectadas en tiempo real.
- Capítulo **FarmStock**: inventario, QR, préstamos, vista previa de PDF y modo sin conexión.
- Stack por capas, trayectoria y contacto.

## Demos
Las interfaces de GEA (web y móvil) y FarmStock son réplicas en React (`src/demo/gea`, `src/demo/farm`) con datos totalmente ficticios, dentro de marcos de dispositivo hechos en CSS.
El motor está en `src/demo`: `engine.ts` (cursor, guion, clics reales), `DemoScreen.tsx`, `StepBar.tsx`.

Modos:
- **scrub** (escritorio): el scroll avanza el guion y es reversible.
- **auto** (móvil): bucle corto con vista ampliada.
- **static** (`prefers-reduced-motion`): botones Anterior/Siguiente, sin cursor animado.

Guiones: `src/demo/gea/geaWebScript.ts`, `geaPhoneScript.ts`, `src/demo/farm/farmScript.ts`.

## Desarrollo
    npm install
    npm run dev       # desarrollo
    npm run build     # producción en dist/
    npm run preview

## Despliegue
Cada push a `main` ejecuta `.github/workflows/deploy.yml` y publica `dist/` en GitHub Pages.

## Pendientes
CV en inglés e imagen para compartir (`public/og.png`).
