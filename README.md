# Estrategia Bot

Página web educativa y tutor interactivo de estrategias de estudio para estudiantes de bachillerato (guía visual de subrayado lineal y de realce, laboratorio práctico sobre tus propios apuntes, temporizador Pomodoro 25/5 y tutor paso a paso con Gemini).

## Enlace web inmediato
Si abres la aplicación desde la URL compartida de Google AI Studio o la publicas en un servidor Node.js, todas las secciones (incluido el chat en vivo con IA) funcionan directamente en el navegador.

## Cómo publicarlo como página web desde GitHub

### Opción A: Página web completa (con chat de IA en vivo)
Como el chat con Gemini protege la `GEMINI_API_KEY` en `server.ts`, para que el tutor en vivo responda necesitas conectarlo a un servicio con Node.js (por ejemplo **Render**, **Railway** o **Google Cloud Run**):
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Variables de entorno:** `NODE_ENV=production` y `GEMINI_API_KEY=tu_clave`

### Opción B: GitHub Pages (sitio estático)
Este proyecto incluye `.github/workflows/deploy-pages.yml` y `base: './'` en `vite.config.ts`:
1. Sube el proyecto a GitHub en la rama `main`.
2. En tu repositorio ve a **Settings → Pages → Build and deployment → Source** y elige **GitHub Actions**.
3. GitHub compilará `dist/` y publicará tu página web (`https://TU_USUARIO.github.io/TU_REPO/`), donde funcionarán la guía visual, el laboratorio de subrayado y el temporizador Pomodoro (el chat en vivo requiere la Opción A).

## Ejecutarlo en tu computadora
Requiere Node.js 22.18 o superior:
```bash
cp .env.example .env
# Edita .env y coloca tu GEMINI_API_KEY
npm install
npm run dev
```
Abre `http://localhost:3000` en tu navegador.
