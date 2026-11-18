import {useEffect, useMemo, useState} from 'react';
import {FileText, RotateCcw, Sparkles} from 'lucide-react';
import {SUBJECTS, type SampleSegment, type SubjectOption} from '../data/studyData';

type UnderliningMode = 'realce' | 'lineal';
type LinealTool = 'recta' | 'ondulada' | 'punteada' | 'none';
type RealceTool = 'amarillo' | 'verde' | 'rosa' | 'none';
type TextSource = 'ejemplo' | 'propio';

interface SubrayadoLabProps {
  subject: SubjectOption | null;
  recommendedMode: UnderliningMode | null;
}

const DEFAULT_CUSTOM_TEXT =
  'La fotosíntesis es el proceso mediante el cual las plantas convierten la luz solar en energía química. Ocurre principalmente en los cloroplastos de las hojas gracias a la clorofila. Como resultado, la planta produce glucosa y libera oxígeno al ambiente. Este proceso sostiene la base de las cadenas alimenticias terrestres.';

export function SubrayadoLab({subject, recommendedMode}: SubrayadoLabProps) {
  const activeSubject = subject ?? SUBJECTS[5];
  const [mode, setMode] = useState<UnderliningMode>(recommendedMode ?? 'realce');
  const [source, setSource] = useState<TextSource>('ejemplo');
  const [customText, setCustomText] = useState<string>(DEFAULT_CUSTOM_TEXT);
  const [isEditingCustom, setIsEditingCustom] = useState<boolean>(false);

  const [linealTool, setLinealTool] = useState<LinealTool>('recta');
  const [realceTool, setRealceTool] = useState<RealceTool>('amarillo');
  const [linealMarks, setLinealMarks] = useState<Record<string, LinealTool>>({});
  const [realceMarks, setRealceMarks] = useState<Record<string, RealceTool>>({});

  useEffect(() => {
    if (recommendedMode) {
      setMode(recommendedMode);
    }
  }, [recommendedMode]);

  const customSegments = useMemo<SampleSegment[]>(() => {
    const sentences = customText
      .split(/(?<=[.!?])\s+|\n+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    return sentences.map((sentence, idx) => ({
      id: `custom-${idx}`,
      text: sentence,
      idealLineal: idx === 0 ? 'recta' : 'none',
      idealRealce: idx === 0 ? 'amarillo' : 'none',
      marginSign: idx === 0 ? '!' : '*',
    }));
  }, [customText]);

  const activeSegments = source === 'ejemplo' ? activeSubject.sampleSegments : customSegments;

  useEffect(() => {
    const nextLineal: Record<string, LinealTool> = {};
    const nextRealce: Record<string, RealceTool> = {};
    for (const seg of activeSubject.sampleSegments) {
      nextLineal[seg.id] = seg.idealLineal;
      nextRealce[seg.id] = seg.idealRealce;
    }
    setLinealMarks((prev) => ({...prev, ...nextLineal}));
    setRealceMarks((prev) => ({...prev, ...nextRealce}));
  }, [activeSubject]);

  const handleSegmentClick = (segId: string) => {
    if (mode === 'lineal') {
      setLinealMarks((prev) => ({
        ...prev,
        [segId]: prev[segId] === linealTool ? 'none' : linealTool,
      }));
    } else {
      setRealceMarks((prev) => ({
        ...prev,
        [segId]: prev[segId] === realceTool ? 'none' : realceTool,
      }));
    }
  };

  const applyIdeal = () => {
    setSource('ejemplo');
    setIsEditingCustom(false);
    const nextLineal: Record<string, LinealTool> = {};
    const nextRealce: Record<string, RealceTool> = {};
    for (const seg of activeSubject.sampleSegments) {
      nextLineal[seg.id] = seg.idealLineal;
      nextRealce[seg.id] = seg.idealRealce;
    }
    setLinealMarks((prev) => ({...prev, ...nextLineal}));
    setRealceMarks((prev) => ({...prev, ...nextRealce}));
  };

  const clearAll = () => {
    const emptyLineal: Record<string, LinealTool> = {};
    const emptyRealce: Record<string, RealceTool> = {};
    for (const seg of activeSegments) {
      emptyLineal[seg.id] = 'none';
      emptyRealce[seg.id] = 'none';
    }
    setLinealMarks((prev) => ({...prev, ...emptyLineal}));
    setRealceMarks((prev) => ({...prev, ...emptyRealce}));
  };

  const totalChars = activeSegments.reduce((acc, s) => acc + s.text.length, 0);
  const markedChars = activeSegments.reduce((acc, s) => {
    const mark = mode === 'lineal' ? linealMarks[s.id] : realceMarks[s.id];
    return mark && mark !== 'none' ? acc + s.text.length : acc;
  }, 0);
  const coveragePct = totalChars > 0 ? Math.round((markedChars / totalChars) * 100) : 0;

  return (
    <section
      id="subrayado"
      className="rounded-xl border border-slate-200 bg-white p-5"
      aria-labelledby="subrayado-title"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <p className="text-xs font-medium text-slate-500">
            Laboratorio práctico · {source === 'ejemplo' ? activeSubject.shortLabel : 'Tu apunte'}
          </p>
          <h3 id="subrayado-title" className="mt-0.5 text-lg font-semibold text-slate-900">
            Técnica de subrayado
          </h3>
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setMode('realce')}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              mode === 'realce'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Realce {recommendedMode === 'realce' ? '· Ideal' : ''}
          </button>
          <button
            type="button"
            onClick={() => setMode('lineal')}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              mode === 'lineal'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lineal {recommendedMode === 'lineal' ? '· Ideal' : ''}
          </button>
        </div>
      </div>

      {/* Source switch: Subject example vs. student's own notes */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => {
              setSource('ejemplo');
              setIsEditingCustom(false);
            }}
            className={`rounded-md px-2.5 py-1 font-medium transition-colors whitespace-nowrap shrink-0 ${
              source === 'ejemplo'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Ejemplo de materia
          </button>
          <button
            type="button"
            onClick={() => setSource('propio')}
            className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 font-medium transition-colors whitespace-nowrap shrink-0 ${
              source === 'propio'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <FileText className="h-3 w-3" />
            <span>Mi propio texto</span>
          </button>
        </div>

        {source === 'propio' && (
          <button
            type="button"
            onClick={() => setIsEditingCustom((v) => !v)}
            className="text-xs font-medium text-blue-900 hover:underline whitespace-nowrap shrink-0"
          >
            {isEditingCustom ? 'Practicar subrayado' : 'Editar texto'}
          </button>
        )}
      </div>

      {/* Tool Selector */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-slate-500 mr-1">Herramienta:</span>
        {mode === 'lineal' ? (
          <>
            <button
              type="button"
              onClick={() => setLinealTool('recta')}
              className={`rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                linealTool === 'recta'
                  ? 'border-blue-900 bg-blue-50 text-blue-950'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="subrayado-recta">Recta</span> · Principal
            </button>
            <button
              type="button"
              onClick={() => setLinealTool('ondulada')}
              className={`rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                linealTool === 'ondulada'
                  ? 'border-sky-700 bg-sky-50 text-sky-950'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="subrayado-ondulada">Ondulada</span> · Secundaria
            </button>
            <button
              type="button"
              onClick={() => setLinealTool('punteada')}
              className={`rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                linealTool === 'punteada'
                  ? 'border-slate-700 bg-slate-100 text-slate-900'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="subrayado-punteada">Punteada</span> · Dato
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setRealceTool('amarillo')}
              className={`rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                realceTool === 'amarillo'
                  ? 'border-amber-500 bg-amber-50 text-slate-900'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="realce-amarillo">Amarillo</span> · Principal
            </button>
            <button
              type="button"
              onClick={() => setRealceTool('verde')}
              className={`rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                realceTool === 'verde'
                  ? 'border-emerald-600 bg-emerald-50 text-slate-900'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="realce-verde">Verde</span> · Definición
            </button>
            <button
              type="button"
              onClick={() => setRealceTool('rosa')}
              className={`rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                realceTool === 'rosa'
                  ? 'border-pink-500 bg-pink-50 text-slate-900'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="realce-rosa">Rosa</span> · Fecha/Fórmula
            </button>
          </>
        )}
      </div>

      {/* Interactive Study Notebook Sheet */}
      {source === 'propio' && isEditingCustom ? (
        <div className="mt-4 space-y-2">
          <label htmlFor="custom-study-text" className="block text-xs font-medium text-slate-600">
            Pega o escribe un párrafo de tu tarea o apunte (cada oración se vuelve interactiva):
          </label>
          <textarea
            id="custom-study-text"
            rows={5}
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-slate-50 p-3 text-sm text-slate-900 focus:border-blue-800 focus:bg-white focus:outline-none"
          />
        </div>
      ) : (
        <div className="study-grid-bg mt-4 rounded-lg border border-slate-200 bg-slate-50/70 p-4">
          <div className="mb-2 flex items-center justify-between gap-2 text-xs text-slate-500">
            <span className="font-medium text-slate-700">
              {source === 'ejemplo' ? activeSubject.sampleTitle : 'Tu apunte de práctica'}
            </span>
            <span>Haz clic en cada oración</span>
          </div>

          <div className="space-y-2.5 text-[14px] leading-relaxed text-slate-800">
            {activeSegments.length === 0 ? (
              <p className="text-xs text-slate-500">
                Escribe al menos una oración en "Editar texto" para practicar.
              </p>
            ) : (
              activeSegments.map((seg) => {
                const mark = mode === 'lineal' ? linealMarks[seg.id] : realceMarks[seg.id];
                const className =
                  mode === 'lineal'
                    ? mark === 'recta'
                      ? 'subrayado-recta'
                      : mark === 'ondulada'
                        ? 'subrayado-ondulada'
                        : mark === 'punteada'
                          ? 'subrayado-punteada'
                          : ''
                    : mark === 'amarillo'
                      ? 'realce-amarillo'
                      : mark === 'verde'
                        ? 'realce-verde'
                        : mark === 'rosa'
                          ? 'realce-rosa'
                          : '';

                return (
                  <div key={seg.id} className="flex items-start gap-2.5">
                    <span
                      className="mt-0.5 w-4 shrink-0 text-center font-mono text-xs font-semibold text-slate-500"
                      title="Signo al margen"
                    >
                      {mode === 'realce' && mark && mark !== 'none' && seg.marginSign
                        ? seg.marginSign
                        : ''}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSegmentClick(seg.id)}
                      className={`text-left transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${className}`}
                    >
                      {seg.text}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Footer stats & controls */}
      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="font-mono tabular-nums text-slate-600">
          Marcado: <span className="font-medium text-slate-900">{coveragePct}%</span>
          <span className="mx-1.5 text-slate-300">/</span>
          <span>Meta ideal: 20–30%</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={applyIdeal}
            className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 whitespace-nowrap shrink-0"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Ejemplo ideal</span>
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 whitespace-nowrap shrink-0"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Limpiar</span>
          </button>
        </div>
      </div>
    </section>
  );
}
