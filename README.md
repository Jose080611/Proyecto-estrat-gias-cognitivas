# Estrategia Bot

Tutor interactivo de estrategias de estudio para estudiantes de bachillerato (consejos por materia, laboratorio práctico de subrayado lineal y de realce, y temporizador Pomodoro).

## Requisitos

- Node.js 22.18 o superior (soporta ejecución directa de `server.ts`)
- Una clave de API de Gemini (`GEMINI_API_KEY`) obtenida en [Google AI Studio](https://aistudio.google.com/)

## Cómo ejecutarlo desde GitHub

### Opción 1: En el navegador con GitHub Codespaces
1. Sube este proyecto a tu repositorio de GitHub (**Export to GitHub** desde Google AI Studio o `git push`).
2. En tu repositorio en GitHub, haz clic en **Code** → **Codespaces** → **Create codespace on main**.
3. En la terminal del Codespace, configura tu clave y ejecuta:
   ```bash
   cp .env.example .env
   # Edita .env y coloca tu GEMINI_API_KEY real
   npm install
   npm run build
   npm start
   ```
4. GitHub Codespaces abrirá automáticamente el puerto `3000` en tu navegador.

### Opción 2: En tu computadora clonando el repositorio
```bash
git clone https://github.com/TU_USUARIO/TU_REPOSITORIO.git
cd TU_REPOSITORIO
cp .env.example .env
# Abre .env y pega tu GEMINI_API_KEY
npm install
npm run dev
```
Luego abre `http://localhost:3000` en tu navegador.

### Opción 3: Publicar en línea (Render, Railway o Cloud Run)
> **Nota importante:** GitHub Pages solo sirve archivos estáticos (HTML/JS) y no ejecuta servidores Node.js (`server.ts`) ni protege tu `GEMINI_API_KEY`. Para tenerlo en línea desde tu repo de GitHub, conéctalo a **Render**, **Railway** o **Google Cloud Run**:

- **Build command:** `npm install && npm run build`
- **Start command:** `npm start`
- **Variables de entorno:** `NODE_ENV=production` y `GEMINI_API_KEY=tu_clave`
