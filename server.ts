import 'dotenv/config';
import express, {type Request, type Response} from 'express';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import {
  GoogleGenAI,
  ThinkingLevel,
  type Content,
  type GenerateContentResponse,
} from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const PRIMARY_MODEL = 'gemini-3.1-flash-lite';
const FALLBACK_MODEL = 'gemini-4-hydrogen';

const ESTRATEGIAS_SYSTEM_INSTRUCTION = `
Eres "Estrategia Bot", un tutor amable que ayuda a estudiantes de bachillerato
a estudiar mejor. Hablas siempre en español, con lenguaje sencillo, cercano
y motivador. Usa emojis con moderación.

Sigue SIEMPRE este flujo, un paso a la vez, sin saltarte pasos:

PASO 1 - Saludo y materias:
Saluda y muestra esta lista numerada para que el usuario elija UNA materia:
  1. Taller de Lectura y Redacción
  2. Historia
  3. Inglés
  4. Matemáticas
  5. Química
  6. Estrategias Cognitivas
  7. Entorno y Sociedad
Acepta el número o el nombre. Si elige algo que no está en la lista,
pídele amablemente que elija una opción válida.

PASO 2 - Estilo de aprendizaje:
Pregunta cómo aprende mejor:
  a) Viendo (visual): imágenes, esquemas, videos, colores
  b) Escuchando (auditivo): explicaciones, audios, hablar en voz alta
  c) Haciendo (kinestésico): practicar, moverse, experimentar
Espera su respuesta antes de continuar.

PASO 3 - Recomendaciones (en un solo mensaje, con estos 4 apartados y títulos):

  📚 Consejos para estudiar [materia]:
     3 a 5 consejos concretos que combinen la materia elegida con su
     estilo de aprendizaje.

  ✏️ Subrayado recomendado:
     Recomienda UNO de estos dos y explica por qué le conviene:
     - Subrayado LINEAL: se trazan líneas debajo de las ideas
       (por ejemplo: línea recta para ideas principales, ondulada para ideas
       secundarias, punteada para datos o ejemplos). Es útil cuando el texto
       es largo y se quiere jerarquizar ideas; se usa lápiz o pluma.
       Pasos: 1) leer completo primero, 2) identificar la idea principal de
       cada párrafo, 3) subrayar solo palabras clave (no frases enteras),
       4) usar distintos tipos de línea según la importancia.
     - Subrayado de REALCE: se usan marcatextos de colores y signos al margen
       (por ejemplo: amarillo = ideas principales, verde = definiciones,
       rosa = fechas o fórmulas; y al margen signos como ! importante,
       ? duda, * dato clave, → relación). Es útil para personas visuales y
       para repasar rápido.
       Pasos: 1) leer completo, 2) definir un código de colores y signos,
       3) resaltar solo lo esencial (máximo 20-30% del texto),
       4) anotar signos o palabras al margen para relacionar ideas.
     Guía para elegir: visual -> normalmente realce; auditivo -> normalmente
     lineal (y leer en voz alta lo subrayado); haciendo -> el que mejor se
     adapte a la materia, sugiriendo convertir lo subrayado en tarjetas o
     ejercicios. Para Matemáticas y Química, aplica el subrayado a fórmulas,
     datos del problema y pasos del procedimiento.
     Explica con claridad cómo hacer el subrayado recomendado y menciona
     brevemente en qué consiste el otro.

  ⏰ Consejo para organizar tu tiempo en [materia]:
     Un consejo práctico y específico para esa materia (por ejemplo:
     técnica Pomodoro de 25 min de estudio y 5 de descanso, bloques fijos
     en el horario semanal, repasos cortos diarios, estudiar lo más difícil
     cuando tienes más energía, agenda o calendario con fechas de entrega).

  💪 Una frase corta de motivación.

PASO 4 - Cierre:
Pregunta si quiere consejos para otra materia. Si dice que sí, vuelve al
PASO 1. Si dice que no, despídete amablemente.

Reglas:
- Haz solo una pregunta por mensaje en los pasos 1 y 2.
- Mantén las respuestas breves y fáciles de leer.
- Si el usuario pregunta algo fuera del tema, respóndelo en una línea y
  regresa amablemente al paso en el que iban.
`.trim();

interface IncomingTurn {
  role: 'user' | 'model';
  text: string;
}

interface ChatRequestBody {
  history?: IncomingTurn[];
  message?: string;
}

let cachedClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('MISSING_GEMINI_API_KEY');
  }
  if (!cachedClient) {
    cachedClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return cachedClient;
}

function formatErrorMessage(err: unknown): {status: number; message: string} {
  if (err instanceof Error) {
    if (err.message === 'MISSING_GEMINI_API_KEY') {
      return {
        status: 500,
        message:
          'Falta configurar la clave GEMINI_API_KEY en el panel de Secrets para conectar con Estrategia Bot.',
      };
    }
    const lower = err.message.toLowerCase();
    if (lower.includes('api_key_invalid') || lower.includes('permission_denied') || lower.includes('403') || lower.includes('400')) {
      return {
        status: 400,
        message:
          'La clave GEMINI_API_KEY no es válida o no tiene permisos. Revísala en Settings > Secrets.',
      };
    }
    if (lower.includes('429') || lower.includes('resource_exhausted')) {
      return {
        status: 429,
        message:
          'Se alcanzó el límite temporal de solicitudes. Espera unos segundos e intenta de nuevo.',
      };
    }
    return {
      status: 500,
      message: `No se pudo obtener respuesta del tutor (${err.message}).`,
    };
  }
  return {
    status: 500,
    message: 'Ocurrió un error inesperado al comunicarse con el tutor.',
  };
}

async function startServer(): Promise<void> {
  const app = express();
  app.use(express.json({limit: '1mb'}));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ok: true, configured: Boolean(process.env.GEMINI_API_KEY)});
  });

  app.post('/api/chat/stream', async (req: Request<unknown, unknown, ChatRequestBody>, res: Response) => {
    const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
    const rawHistory = Array.isArray(req.body?.history) ? req.body.history : [];

    if (!message) {
      res.status(400).json({error: 'El mensaje no puede estar vacío.'});
      return;
    }

    let ai: GoogleGenAI;
    try {
      ai = getGeminiClient();
    } catch (err) {
      const formatted = formatErrorMessage(err);
      res.status(formatted.status).json({error: formatted.message});
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    const sendEvent = (payload: Record<string, unknown>) => {
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    };

    try {
      const history: Content[] = rawHistory
        .filter(
          (item): item is IncomingTurn =>
            Boolean(item) &&
            (item.role === 'user' || item.role === 'model') &&
            typeof item.text === 'string' &&
            item.text.trim().length > 0,
        )
        .map((item) => ({
          role: item.role,
          parts: [{text: item.text}],
        }));

      let clientDisconnected = false;
      res.on('close', () => {
        clientDisconnected = true;
      });

      const attempts: Array<{model: string; thinkingLevel: ThinkingLevel}> = [
        {model: PRIMARY_MODEL, thinkingLevel: ThinkingLevel.MINIMAL},
        {model: PRIMARY_MODEL, thinkingLevel: ThinkingLevel.MINIMAL},
        {model: FALLBACK_MODEL, thinkingLevel: ThinkingLevel.LOW},
      ];

      let streamResponse: AsyncGenerator<GenerateContentResponse> | null = null;
      let lastError: unknown = null;

      for (let idx = 0; idx < attempts.length; idx++) {
        if (clientDisconnected) {
          break;
        }
        const cfg = attempts[idx];
        try {
          const chat = ai.chats.create({
            model: cfg.model,
            history,
            config: {
              systemInstruction: ESTRATEGIAS_SYSTEM_INSTRUCTION,
              thinkingConfig: {
                thinkingLevel: cfg.thinkingLevel,
              },
            },
          });
          streamResponse = await chat.sendMessageStream({message});
          break;
        } catch (err) {
          lastError = err;
          const msg = err instanceof Error ? err.message.toLowerCase() : '';
          const isAuthError =
            msg.includes('api_key_invalid') ||
            msg.includes('permission_denied') ||
            msg.includes('403');
          if (isAuthError || idx === attempts.length - 1 || clientDisconnected) {
            throw err;
          }
          await new Promise((resolve) => setTimeout(resolve, 400 * (idx + 1)));
        }
      }

      if (!streamResponse) {
        throw lastError ?? new Error('No se recibió respuesta del modelo.');
      }

      for await (const chunk of streamResponse) {
        if (clientDisconnected) {
          break;
        }
        const part = chunk as GenerateContentResponse;
        if (part.text) {
          sendEvent({text: part.text});
        }
      }

      if (!clientDisconnected) {
        sendEvent({done: true});
        res.end();
      }
    } catch (err) {
      const formatted = formatErrorMessage(err);
      sendEvent({error: formatted.message});
      res.end();
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const {createServer} = await import('vite');
    const vite = await createServer({
      server: {middlewareMode: true},
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.use((_req: Request, res: Response) => {
      const indexFile = path.join(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build not found. Run npm run build first.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Estrategia Bot server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
