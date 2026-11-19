import {LEARNING_STYLES} from '../data/studyData';

export function StudyGuideSection() {
  return (
    <section id="guia" className="border-t border-slate-200 pt-10 space-y-10">
      {/* Section Header */}
      <div className="max-w-2xl">
        <p className="text-xs font-medium text-slate-500">
          Metodología completa de estudio
        </p>
        <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl [text-wrap:balance]">
          Guía visual: tipos de subrayado y estilos de aprendizaje
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Consulta en cualquier momento cómo aplicar el subrayado lineal y el subrayado de realce según la materia y tu forma de aprender.
        </p>
      </div>

      {/* Linear vs Highlighting Underlining Comparison */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
          <div className="flex items-baseline justify-between gap-4 border-b border-slate-100 pb-3">
            <div>
              <p className="text-xs font-medium text-slate-500">
                Método 01 · Lápiz o pluma
              </p>
              <h3 className="mt-0.5 text-lg font-semibold text-slate-900">
                Subrayado Lineal
              </h3>
            </div>
            <span className="text-xs font-medium text-slate-600">
              Ideal para textos largos y estilo auditivo
            </span>
          </div>

          <p className="text-sm leading-relaxed text-slate-600">
            Consiste en trazar distintos tipos de líneas debajo de las palabras clave para jerarquizar las ideas sin recargar la página.
          </p>

          <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-800">
            <div>
              <span className="subrayado-recta font-medium">Línea recta</span>
              <span className="text-slate-600"> — Ideas principales del párrafo</span>
            </div>
            <div>
              <span className="subrayado-ondulada font-medium">Línea ondulada</span>
              <span className="text-slate-600"> — Ideas secundarias o explicaciones</span>
            </div>
            <div>
              <span className="subrayado-punteada font-medium">Línea punteada</span>
              <span className="text-slate-600"> — Datos concretos, fechas o ejemplos</span>
            </div>
          </div>

          <ol className="space-y-1.5 text-sm text-slate-700 font-variant-numeric tabular-nums">
            <li>1. Lee el texto completo primero sin subrayar nada.</li>
            <li>2. Identifica la idea principal de cada párrafo.</li>
            <li>3. Subraya únicamente palabras clave, nunca frases enteras.</li>
            <li>4. Aplica cada tipo de línea según su nivel de importancia.</li>
          </ol>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
          <div className="flex items-baseline justify-between gap-4 border-b border-slate-100 pb-3">
            <div>
              <p className="text-xs font-medium text-slate-500">
                Método 02 · Código de color y margen
              </p>
              <h3 className="mt-0.5 text-lg font-semibold text-slate-900">
                Subrayado de Realce
              </h3>
            </div>
            <span className="text-xs font-medium text-slate-600">
              Ideal para repaso rápido y estilo visual
            </span>
          </div>

          <p className="text-sm leading-relaxed text-slate-600">
            Combina marcatextos con un código fijo de colores y anotaciones breves al margen para localizar conceptos clave de un vistazo.
          </p>

          <div className="space-y-2.5 rounded-lg border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-800">
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <span>
                <span className="realce-amarillo font-medium">Amarillo</span> · Idea principal
              </span>
              <span>
                <span className="realce-verde font-medium">Verde</span> · Definición
              </span>
              <span>
                <span className="realce-rosa font-medium">Rosa</span> · Fórmula o fecha
              </span>
            </div>
            <div className="border-t border-slate-200 pt-2 text-xs text-slate-600 font-mono">
              Signos al margen: ! importante · ? duda · * dato clave · → relación
            </div>
          </div>

          <ol className="space-y-1.5 text-sm text-slate-700 font-variant-numeric tabular-nums">
            <li>1. Haz una lectura completa antes de tomar el marcatextos.</li>
            <li>2. Define un código constante de colores y signos al margen.</li>
            <li>3. Resalta solo lo esencial (máximo 20–30% del texto total).</li>
            <li>4. Anota palabras o signos al margen para conectar conceptos.</li>
          </ol>
        </article>
      </div>

      {/* 3 Learning Styles Strip */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {LEARNING_STYLES.map((style, idx) => (
          <div key={style.key} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="font-mono text-xs font-medium text-slate-500 tabular-nums">
              Estilo 0{idx + 1}
            </div>
            <h3 className="mt-1.5 text-base font-semibold text-slate-900">{style.label}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
              {style.description}.{' '}
              {style.key === 'a'
                ? 'Suele aprovechar mejor el subrayado de realce, esquemas y mapas mentales.'
                : style.key === 'b'
                  ? 'Suele aprovechar mejor el subrayado lineal y explicar en voz alta lo subrayado.'
                  : 'Conviene transformar lo subrayado en tarjetas de práctica, ejercicios o experimentos.'}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
