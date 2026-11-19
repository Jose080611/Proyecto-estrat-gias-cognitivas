import {type FormEvent, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {AlertCircle, ArrowUpRight, BookOpen, Download, RotateCcw, Send} from 'lucide-react';
import heroStudyImg from './assets/images/hero_estudio_bachillerato_1795100057789.jpg';
import {ChatMessage} from './components/ChatMessage';
import {PomodoroTimer} from './components/PomodoroTimer';
import {StudyGuideSection} from './components/StudyGuideSection';
import {SubrayadoLab} from './components/SubrayadoLab';
import {
  detectConversationState,
  LEARNING_STYLES,
  SUBJECTS,
  type FlowStep,
  type SubjectOption,
} from './data/studyData';

interface MessageItem {
  id: string;
  role: 'user' | 'model';
  text: string;
  hidden?: boolean;
}

const INITIAL_KICKOFF_PROMPT = 'Hola, quiero consejos para estudiar.';

const INITIAL_BOT_GREETING = `¡Hola! Qué gusto saludarte 👋 Soy **Estrategia Bot**, tu tutor de estudio. Estoy aquí para ayudarte a aprovechar mejor tu tiempo y aprender con más claridad.

Para empezar, elige **UNA materia** de la siguiente lista (puedes escribir el número o el nombre, o usar los botones de abajo):

1. Taller de Lectura y Redacción
2. Historia
3. Inglés
4. Matemáticas
5. Química
6. Estrategias Cognitivas
7. Entorno y Sociedad`;

const STEP_LABELS: Array<{step: FlowStep; code: string; title: string; summary: string}> = [
  {step: 1, code: '01', title: 'Materia', summary: 'Elige una de las 7 asignaturas de bachillerato.'},
  {step: 2, code: '02', title: 'Estilo', summary: 'Indica si aprendes viendo, escuchando o haciendo.'},
  {step: 3, code: '03', title: 'Plan', summary: 'Recibe consejos, subrayado ideal y manejo del tiempo.'},
  {step: 4, code: '04', title: 'Cierre', summary: 'Consulta otra materia o guarda tu guía en .txt.'},
];

function createMessageId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createInitialMessages(): MessageItem[] {
  return [
    {
      id: createMessageId(),
      role: 'user',
      text: INITIAL_KICKOFF_PROMPT,
      hidden: true,
    },
    {
      id: createMessageId(),
      role: 'model',
      text: INITIAL_BOT_GREETING,
    },
  ];
}

function parseSseBlock(rawEvent: string, onChunk: (text: string) => void): void {
  const dataLines = rawEvent
    .split('\n')
    .filter((line) => line.startsWith('data: '))
    .map((line) => line.slice(6).trim())
    .filter(Boolean);

  for (const jsonStr of dataLines) {
    const parsed = JSON.parse(jsonStr) as {
      text?: string;
      done?: boolean;
      error?: string;
    };
    if (parsed.error) {
      throw new Error(parsed.error);
    }
    if (parsed.text) {
      onChunk(parsed.text);
    }
  }
}

async function streamChatResponse(
  history: Array<{role: 'user' | 'model'; text: string}>,
  message: string,
  onChunk: (chunkText: string) => void,
  externalSignal?: AbortSignal,
): Promise<void> {
  const timeoutController = new AbortController();
  const timeoutId = window.setTimeout(() => timeoutController.abort(), 120000);

  const onExternalAbort = () => timeoutController.abort();
  externalSignal?.addEventListener('abort', onExternalAbort, {once: true});

  try {
    const response = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({history, message}),
      signal: timeoutController.signal,
    });

    if (!response.ok) {
      let errorMsg = 'No se pudo conectar con Estrategia Bot.';
      if (response.status === 404 || response.status === 405) {
        errorMsg =
          'El chat en vivo requiere el servidor Node.js activo. Mientras tanto puedes explorar la guía de subrayado, el laboratorio práctico y el temporizador Pomodoro en esta página.';
      } else {
        try {
          const payload = (await response.json()) as {error?: string};
          if (payload.error) {
            errorMsg = payload.error;
          }
        } catch {
          // ignore JSON parse failure
        }
      }
      throw new Error(errorMsg);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('La respuesta del servidor no incluyó un flujo de datos.');
    }

    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let receivedCount = 0;

    while (true) {
      const {value, done} = await reader.read();
      if (done) {
        break;
      }

      buffer += decoder.decode(value, {stream: true}).replace(/\r\n/g, '\n');
      const events = buffer.split('\n\n');
      buffer = events.pop() ?? '';

      for (const rawEvent of events) {
        parseSseBlock(rawEvent, (text) => {
          receivedCount += text.length;
          onChunk(text);
        });
      }
    }

    buffer += decoder.decode().replace(/\r\n/g, '\n');
    if (buffer.trim()) {
      parseSseBlock(buffer, (text) => {
        receivedCount += text.length;
        onChunk(text);
      });
    }

    if (receivedCount === 0) {
      throw new Error('El tutor no devolvió texto en esta respuesta. Intenta de nuevo.');
    }
  } catch (err) {
    if (externalSignal?.aborted) {
      throw err;
    }
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('La respuesta tardó demasiado tiempo. Pulsa Reintentar para continuar.');
    }
    throw err;
  } finally {
    window.clearTimeout(timeoutId);
    externalSignal?.removeEventListener('abort', onExternalAbort);
  }
}

export default function App() {
  const [messages, setMessages] = useState<MessageItem[]>(() => createInitialMessages());
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const [failedRetryPayload, setFailedRetryPayload] = useState<{
    history: Array<{role: 'user' | 'model'; text: string}>;
    message: string;
  } | null>(null);

  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const activeAbortRef = useRef<AbortController | null>(null);

  const conversationState = useMemo(
    () => detectConversationState(messages.map((m) => ({role: m.role, text: m.text}))),
    [messages],
  );

  useEffect(() => {
    const el = chatScrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, isStreaming]);

  useEffect(() => {
    return () => {
      activeAbortRef.current?.abort();
    };
  }, []);

  const handleNewSession = useCallback(() => {
    activeAbortRef.current?.abort();
    setIsStreaming(false);
    setErrorMessage(null);
    setFailedRetryPayload(null);
    setInputValue('');
    setMessages(createInitialMessages());
  }, []);

  const executeChatTurn = useCallback(
    async (
      baseMessages: MessageItem[],
      trimmedText: string,
      appendUserMessage: boolean,
    ) => {
      setErrorMessage(null);
      setFailedRetryPayload(null);

      const historySnapshot = baseMessages
        .filter((m) => m.text.trim().length > 0)
        .map((m) => ({role: m.role, text: m.text}));

      const userMsgId = createMessageId();
      const botMsgId = createMessageId();

      const nextMessages = appendUserMessage
        ? [
            ...baseMessages,
            {id: userMsgId, role: 'user' as const, text: trimmedText},
            {id: botMsgId, role: 'model' as const, text: ''},
          ]
        : [...baseMessages, {id: botMsgId, role: 'model' as const, text: ''}];

      setMessages(nextMessages);

      const controller = new AbortController();
      activeAbortRef.current = controller;
      setIsStreaming(true);

      try {
        await streamChatResponse(
          historySnapshot,
          trimmedText,
          (chunkText) => {
            if (controller.signal.aborted) {
              return;
            }
            setMessages((prev) =>
              prev.map((m) => (m.id === botMsgId ? {...m, text: m.text + chunkText} : m)),
            );
          },
          controller.signal,
        );
      } catch (err: unknown) {
        if (!controller.signal.aborted) {
          const msg = err instanceof Error ? err.message : 'No se pudo enviar el mensaje.';
          setErrorMessage(msg);
          setFailedRetryPayload({history: historySnapshot, message: trimmedText});
          setMessages((prev) => prev.filter((m) => m.id !== botMsgId || m.text.length > 0));
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsStreaming(false);
          inputRef.current?.focus();
        }
      }
    },
    [],
  );

  const sendMessage = useCallback(
    async (rawText: string) => {
      const trimmed = rawText.trim();
      if (!trimmed || isStreaming) {
        return;
      }
      setInputValue('');
      const cleanMessages = messages.filter((m) => m.text.trim().length > 0);
      await executeChatTurn(cleanMessages, trimmed, true);
    },
    [executeChatTurn, isStreaming, messages],
  );

  const handleRetryLastTurn = useCallback(async () => {
    if (!failedRetryPayload || isStreaming) {
      return;
    }
    const baseWithoutPending = messages.filter(
      (m, idx) =>
        !(
          idx === messages.length - 1 &&
          m.role === 'user' &&
          m.text === failedRetryPayload.message
        ),
    );
    await executeChatTurn(baseWithoutPending, failedRetryPayload.message, true);
  }, [executeChatTurn, failedRetryPayload, isStreaming, messages]);

  const handleStartSubjectDirect = useCallback(
    (subject: SubjectOption) => {
      if (isStreaming) {
        return;
      }
      document.getElementById('tutoria')?.scrollIntoView({behavior: 'smooth'});
      if (conversationState.step === 1) {
        void sendMessage(`${subject.id}. ${subject.name}`);
      } else {
        activeAbortRef.current?.abort();
        const fresh = createInitialMessages();
        setInputValue('');
        void executeChatTurn(fresh, `${subject.id}. ${subject.name}`, true);
      }
    },
    [conversationState.step, executeChatTurn, isStreaming, sendMessage],
  );

  const handleDownloadSession = useCallback(() => {
    const visible = messages.filter((m) => !m.hidden && m.text.trim().length > 0);
    const content = visible
      .map((m) => `${m.role === 'user' ? 'Estudiante' : 'Estrategia Bot'}:\n${m.text}`)
      .join('\n\n----------------------------------------\n\n');
    const blob = new Blob([content], {type: 'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const slug = conversationState.selectedSubject
      ? conversationState.selectedSubject.shortLabel.toLowerCase().replace(/\s+/g, '-')
      : 'sesion';
    link.download = `estrategia-bot-${slug}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [conversationState.selectedSubject, messages]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void sendMessage(inputValue);
  };

  const visibleMessages = messages.filter((m) => !m.hidden);
  const currentStepNumeric = conversationState.step === 'done' ? 4 : conversationState.step;

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-slate-900 flex flex-col">
      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xs">
        <div className="mx-auto flex max-w-[1380px] items-center justify-between gap-8 px-6 py-3.5">
          <a
            href="#inicio"
            className="font-display text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            Estrategia Bot
          </a>

          <nav
            aria-label="Navegación principal"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
          >
            <a
              href="#inicio"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Inicio
            </a>
            <a
              href="#tutoria"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Tutoría
            </a>
            <a
              href="#subrayado"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Subrayado
            </a>
            <a
              href="#guia"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Guía
            </a>
            <a
              href="#materias"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Materias
            </a>
          </nav>

          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={handleNewSession}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-slate-800 whitespace-nowrap shrink-0"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Nueva sesión</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1380px] flex-1 px-6 py-8 space-y-12">
        {/* Hero Split Section */}
        <section id="inicio" className="space-y-6 border-b border-slate-200 pb-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-stretch">
            <div className="lg:col-span-7 flex flex-col justify-between gap-6 py-2">
              <div className="space-y-4">
                <p className="text-xs font-medium text-slate-500">
                  Bachillerato · Estrategias Cognitivas y Hábitos de Estudio
                </p>
                <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl sm:leading-[1.12] [text-wrap:balance]">
                  Tu guía web para estudiar mejor cada materia
                </h1>
                <p className="max-w-2xl text-base leading-relaxed text-slate-600">
                  Conversa paso a paso con Estrategia Bot, practica el subrayado lineal y de realce directamente sobre apuntes reales y organiza tus bloques de estudio con el método Pomodoro.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href="#tutoria"
                    className="inline-flex items-center justify-center rounded-lg bg-blue-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-800 whitespace-nowrap shrink-0"
                  >
                    Comenzar tutoría
                  </a>
                  <a
                    href="#guia"
                    className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0"
                  >
                    Ver guía de subrayado
                  </a>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                  <span>7 materias de bachillerato</span>
                  <span aria-hidden="true">·</span>
                  <span>3 estilos de aprendizaje</span>
                  <span aria-hidden="true">·</span>
                  <span>
                    Sesión actual:{' '}
                    <strong className="font-semibold text-slate-800">
                      {conversationState.selectedSubject?.shortLabel ?? 'Por elegir'}
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="h-full overflow-hidden rounded-xl border border-slate-200 bg-white">
                {heroImgFailed ? (
                  <div className="study-grid-bg flex h-full min-h-[260px] flex-col items-center justify-center gap-2 p-8 text-center">
                    <BookOpen className="h-8 w-8 text-blue-900" />
                    <p className="font-display text-lg font-semibold text-slate-900">
                      Cuaderno de Estrategias Cognitivas
                    </p>
                    <p className="text-xs text-slate-500">
                      Subrayado lineal, realce por color y bloques Pomodoro
                    </p>
                  </div>
                ) : (
                  <img
                    src={heroStudyImg}
                    alt="Mesa de estudio con cuaderno abierto, esquemas, marcatextos, lápiz, escuadra y temporizador Pomodoro"
                    referrerPolicy="no-referrer"
                    onError={() => setHeroImgFailed(true)}
                    className="h-full w-full object-cover lg:min-h-[300px]"
                  />
                )}
              </div>
            </div>
          </div>

          {/* 4-Step Full-Width Methodology Strip */}
          <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2 lg:grid-cols-4">
            {STEP_LABELS.map((item) => (
              <div
                key={item.code}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <div className="font-mono text-xs font-medium text-slate-500 tabular-nums">
                  Paso {item.code}
                </div>
                <h2 className="mt-1 font-sans text-sm font-semibold text-slate-900">
                  {item.title}
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  {item.summary}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Two-Zone Sandbox Layout: Chat Stage (Left) + Study Tools Deck (Right) */}
        <section aria-label="Espacio de tutoría y herramientas" className="space-y-5">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900">
                Tutor interactivo y mesa de estudio
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Sigue el diálogo guiado con Estrategia Bot y practica enseguida en el laboratorio de subrayado y el temporizador.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
            {/* Left Zone: Active Tutor Conversation */}
            <section
              id="tutoria"
              aria-label="Conversación con Estrategia Bot"
              className="lg:col-span-7 flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden"
            >
              {/* Chat Header Strip */}
              <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-slate-50/60 px-5 py-3.5">
                <div>
                  <h3 className="font-sans text-sm font-semibold text-slate-900">
                    Sesión de tutoría guiada
                  </h3>
                  <p className="text-xs text-slate-500">
                    Un paso a la vez · Responde con clic o escribiendo tu mensaje
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-xs font-medium text-slate-600 tabular-nums whitespace-nowrap">
                    Paso {currentStepNumeric} de 4
                  </span>
                  {visibleMessages.length > 1 && (
                    <button
                      type="button"
                      onClick={handleDownloadSession}
                      className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 whitespace-nowrap shrink-0"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Guardar sesión</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Scrollable Message Stream */}
              <div
                ref={chatScrollRef}
                className="study-grid-bg flex-1 min-h-[420px] max-h-[560px] overflow-y-auto px-5 py-5 space-y-4"
              >
                {visibleMessages.map((msg, index) => {
                  const isLast = index === visibleMessages.length - 1;
                  return (
                    <ChatMessage
                      key={msg.id}
                      role={msg.role}
                      text={msg.text}
                      isStreaming={isStreaming && isLast && msg.role === 'model'}
                    />
                  );
                })}

                {errorMessage && (
                  <div
                    role="alert"
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
                  >
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-700" />
                      <span>{errorMessage}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {failedRetryPayload && (
                        <button
                          type="button"
                          onClick={() => void handleRetryLastTurn()}
                          className="rounded-md bg-red-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-800 whitespace-nowrap shrink-0"
                        >
                          Reintentar mensaje
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleNewSession}
                        className="rounded-md border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-900 hover:bg-red-100 whitespace-nowrap shrink-0"
                      >
                        Reiniciar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Context-Aware Quick Reply Bar */}
              {!isStreaming && !errorMessage && (
                <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-3">
                  {conversationState.step === 1 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-slate-500">
                        Selección rápida de materia (Paso 1):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {SUBJECTS.map((subject) => (
                          <button
                            key={subject.id}
                            type="button"
                            onClick={() => void sendMessage(`${subject.id}. ${subject.name}`)}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 transition-colors hover:border-slate-400 hover:bg-slate-50 whitespace-nowrap shrink-0"
                          >
                            <span className="font-mono text-slate-500 mr-1">{subject.id}.</span>
                            {subject.shortLabel}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {conversationState.step === 2 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-slate-500">
                        ¿Cómo aprendes mejor? (Paso 2):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {LEARNING_STYLES.map((style) => (
                          <button
                            key={style.key}
                            type="button"
                            onClick={() => void sendMessage(style.promptValue)}
                            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-800 transition-colors hover:border-blue-800 hover:bg-blue-50/60 whitespace-nowrap shrink-0"
                          >
                            {style.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {(conversationState.step === 3 || conversationState.step === 4) && (
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs font-medium text-slate-500">
                        ¿Deseas consejos para otra materia? (Paso 4):
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => void sendMessage('Sí, quiero consejos para otra materia.')}
                          className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-800 transition-colors hover:border-slate-400 hover:bg-slate-50 whitespace-nowrap shrink-0"
                        >
                          Sí, otra materia
                        </button>
                        <button
                          type="button"
                          onClick={() => void sendMessage('No, muchas gracias por la ayuda.')}
                          className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 whitespace-nowrap shrink-0"
                        >
                          No, gracias
                        </button>
                      </div>
                    </div>
                  )}

                  {conversationState.step === 'done' && (
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs text-slate-600">
                        Sesión finalizada. Puedes iniciar una nueva consulta cuando quieras.
                      </p>
                      <button
                        type="button"
                        onClick={handleNewSession}
                        className="rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-slate-800 whitespace-nowrap shrink-0"
                      >
                        Empezar otra consulta
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Message Composer */}
              <form
                onSubmit={handleSubmit}
                className="flex items-center gap-3 border-t border-slate-200 bg-white px-4 py-3"
              >
                <label htmlFor="chat-input" className="sr-only">
                  Escribe tu mensaje para Estrategia Bot
                </label>
                <input
                  ref={inputRef}
                  id="chat-input"
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isStreaming}
                  placeholder={
                    isStreaming
                      ? 'Estrategia Bot está escribiendo...'
                      : 'Escribe el número, materia, estilo o cualquier duda...'
                  }
                  className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-800 focus:bg-white focus:outline-none disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={isStreaming || inputValue.trim().length === 0}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-45 whitespace-nowrap shrink-0"
                >
                  <span>Enviar</span>
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            </section>

            {/* Right Zone: Study Tools Companion Deck */}
            <aside className="lg:col-span-5 space-y-6" aria-label="Herramientas de estudio">
              {/* Step Progression Strip */}
              <section className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-semibold text-slate-900">Ruta de la sesión</h3>
                  <span className="font-mono text-xs text-slate-500 tabular-nums">
                    {conversationState.step === 'done'
                      ? 'Completada'
                      : `Paso ${currentStepNumeric}/4`}
                  </span>
                </div>

                <ol className="mt-4 grid grid-cols-4 gap-2">
                  {STEP_LABELS.map((item) => {
                    const stepNum = Number(item.code);
                    const isActive =
                      conversationState.step !== 'done' && currentStepNumeric === stepNum;
                    const isCompleted =
                      conversationState.step === 'done' || currentStepNumeric > stepNum;

                    return (
                      <li
                        key={item.code}
                        className={`rounded-lg border px-2.5 py-2.5 transition-colors ${
                          isActive
                            ? 'border-blue-900 bg-blue-50/70 text-blue-950'
                            : isCompleted
                              ? 'border-slate-300 bg-slate-50 text-slate-900'
                              : 'border-slate-200 bg-white text-slate-400'
                        }`}
                      >
                        <div className="font-mono text-[11px] font-medium tabular-nums">
                          {item.code}
                        </div>
                        <div className="mt-0.5 text-xs font-semibold truncate">{item.title}</div>
                      </li>
                    );
                  })}
                </ol>
              </section>

              {/* Interactive Subrayado Practice Lab */}
              <SubrayadoLab
                subject={conversationState.selectedSubject}
                recommendedMode={conversationState.recommendedUnderlining}
              />

              {/* Pomodoro 25/5 Timer */}
              <PomodoroTimer />
            </aside>
          </div>
        </section>

        {/* Complete Visual Guide Section */}
        <StudyGuideSection />

        {/* Bottom Subject Directory */}
        <section id="materias" className="border-t border-slate-200 pt-10">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900">
                Materias de bachillerato incluidas
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Selecciona cualquier asignatura para iniciar de inmediato su tutoría y practicar su texto en el laboratorio.
              </p>
            </div>
            <span className="font-mono text-xs text-slate-500 tabular-nums">
              7 asignaturas disponibles
            </span>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SUBJECTS.map((subject) => {
              const isSelected = conversationState.selectedSubject?.id === subject.id;
              return (
                <button
                  key={subject.id}
                  type="button"
                  onClick={() => handleStartSubjectDirect(subject)}
                  className={`group flex flex-col justify-between rounded-xl border p-4 text-left transition-colors ${
                    isSelected
                      ? 'border-blue-900 bg-blue-50/40'
                      : 'border-slate-200 bg-white hover:border-slate-400'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-medium text-slate-500 tabular-nums">
                        0{subject.id}
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-slate-800" />
                    </div>
                    <h3 className="mt-2 text-sm font-semibold text-slate-900">
                      {subject.name}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">
                      {subject.focusHint}
                    </p>
                  </div>
                  <span className="mt-3 text-xs font-medium text-blue-900">
                    Consultar esta materia
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1380px] flex-wrap items-center justify-between gap-4 px-6 py-5 text-xs text-slate-500">
          <span>Estrategia Bot · Página de apoyo al estudio en bachillerato</span>
          <span>Subrayado lineal · Subrayado de realce · Técnica Pomodoro</span>
        </div>
      </footer>
    </div>
  );
}
