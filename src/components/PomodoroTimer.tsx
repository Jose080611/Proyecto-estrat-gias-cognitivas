import {useEffect, useState} from 'react';
import {Pause, Play, RotateCcw} from 'lucide-react';

type TimerPhase = 'focus' | 'break';

const FOCUS_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;

export function PomodoroTimer() {
  const [phase, setPhase] = useState<TimerPhase>('focus');
  const [secondsLeft, setSecondsLeft] = useState<number>(FOCUS_SECONDS);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedSessions, setCompletedSessions] = useState<number>(0);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          if (phase === 'focus') {
            setCompletedSessions((count) => count + 1);
            setPhase('break');
            return BREAK_SECONDS;
          } else {
            setPhase('focus');
            return FOCUS_SECONDS;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isRunning, phase]);

  const switchPhase = (nextPhase: TimerPhase) => {
    setIsRunning(false);
    setPhase(nextPhase);
    setSecondsLeft(nextPhase === 'focus' ? FOCUS_SECONDS : BREAK_SECONDS);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSecondsLeft(phase === 'focus' ? FOCUS_SECONDS : BREAK_SECONDS);
  };

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const seconds = String(secondsLeft % 60).padStart(2, '0');
  const totalForPhase = phase === 'focus' ? FOCUS_SECONDS : BREAK_SECONDS;
  const progressRatio = ((totalForPhase - secondsLeft) / totalForPhase) * 100;

  return (
    <section
      id="pomodoro"
      className="rounded-xl border border-slate-200 bg-white p-5"
      aria-labelledby="pomodoro-title"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500">
            Organización del tiempo · Método 25/5
          </p>
          <h3 id="pomodoro-title" className="mt-0.5 text-lg font-semibold text-slate-900">
            Temporizador Pomodoro
          </h3>
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => switchPhase('focus')}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              phase === 'focus'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Estudio · 25 min
          </button>
          <button
            type="button"
            onClick={() => switchPhase('break')}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              phase === 'break'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Descanso · 5 min
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <div>
          <div className="font-mono text-3xl font-medium tracking-tight text-slate-900 tabular-nums">
            {minutes}:{seconds}
          </div>
          <p className="mt-1 text-xs text-slate-500 font-mono tabular-nums">
            {phase === 'focus' ? 'Bloque de concentración' : 'Pausa breve recomendada'} · Bloques completados: {completedSessions}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsRunning((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-slate-800 whitespace-nowrap shrink-0"
          >
            {isRunning ? (
              <>
                <Pause className="h-3.5 w-3.5" />
                <span>Pausar</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" />
                <span>Iniciar</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={resetTimer}
            aria-label="Reiniciar temporizador"
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full bg-blue-800 transition-all duration-300"
          style={{width: `${progressRatio}%`}}
        />
      </div>
    </section>
  );
}
