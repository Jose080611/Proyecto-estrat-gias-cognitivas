export interface SubjectOption {
  id: number;
  name: string;
  shortLabel: string;
  focusHint: string;
  sampleTitle: string;
  sampleSegments: SampleSegment[];
}

export interface SampleSegment {
  id: string;
  text: string;
  idealLineal: 'recta' | 'ondulada' | 'punteada' | 'none';
  idealRealce: 'amarillo' | 'verde' | 'rosa' | 'none';
  marginSign?: '!' | '?' | '*' | '→';
}

export interface LearningStyleOption {
  key: 'a' | 'b' | 'c';
  label: string;
  description: string;
  promptValue: string;
}

export const SUBJECTS: SubjectOption[] = [
  {
    id: 1,
    name: 'Taller de Lectura y Redacción',
    shortLabel: 'Lectura y Redacción',
    focusHint: 'Comprensión lectora, estructura textual y argumentación',
    sampleTitle: 'Estructura del texto argumentativo',
    sampleSegments: [
      {
        id: 'tlr-1',
        text: 'El texto argumentativo busca defender una postura mediante razones verificables.',
        idealLineal: 'recta',
        idealRealce: 'amarillo',
        marginSign: '!',
      },
      {
        id: 'tlr-2',
        text: 'La tesis es la idea central que el autor sostiene a lo largo del ensayo.',
        idealLineal: 'ondulada',
        idealRealce: 'verde',
        marginSign: '*',
      },
      {
        id: 'tlr-3',
        text: 'Por ejemplo, citar datos de la UNESCO de 2024 fortalece la credibilidad del argumento.',
        idealLineal: 'punteada',
        idealRealce: 'rosa',
        marginSign: '→',
      },
      {
        id: 'tlr-4',
        text: 'Antes de redactar, conviene revisar la coherencia entre cada párrafo y la conclusión.',
        idealLineal: 'none',
        idealRealce: 'none',
      },
    ],
  },
  {
    id: 2,
    name: 'Historia',
    shortLabel: 'Historia',
    focusHint: 'Procesos históricos, causas, consecuencias y cronología',
    sampleTitle: 'La Revolución Industrial en el siglo XVIII',
    sampleSegments: [
      {
        id: 'his-1',
        text: 'La Revolución Industrial transformó la economía agrícola en una producción mecanizada.',
        idealLineal: 'recta',
        idealRealce: 'amarillo',
        marginSign: '!',
      },
      {
        id: 'his-2',
        text: 'La urbanización acelerada provocó el crecimiento de las ciudades alrededor de las fábricas.',
        idealLineal: 'ondulada',
        idealRealce: 'verde',
        marginSign: '→',
      },
      {
        id: 'his-3',
        text: 'En 1769 James Watt patentó la máquina de vapor, impulsando el transporte ferroviario.',
        idealLineal: 'punteada',
        idealRealce: 'rosa',
        marginSign: '*',
      },
      {
        id: 'his-4',
        text: 'Este cambio modificó también las rutinas familiares y las jornadas laborales.',
        idealLineal: 'none',
        idealRealce: 'none',
      },
    ],
  },
  {
    id: 3,
    name: 'Inglés',
    shortLabel: 'Inglés',
    focusHint: 'Vocabulario en contexto, tiempos verbales y comprensión',
    sampleTitle: 'Present Perfect vs. Past Simple',
    sampleSegments: [
      {
        id: 'ing-1',
        text: 'El Present Perfect conecta una acción pasada con un resultado visible en el presente.',
        idealLineal: 'recta',
        idealRealce: 'amarillo',
        marginSign: '!',
      },
      {
        id: 'ing-2',
        text: 'Se forma con el auxiliar have o has seguido del participio pasado del verbo principal.',
        idealLineal: 'ondulada',
        idealRealce: 'verde',
        marginSign: '*',
      },
      {
        id: 'ing-3',
        text: 'Usa marcadores como since 2022 o already, mientras que yesterday pide Past Simple.',
        idealLineal: 'punteada',
        idealRealce: 'rosa',
        marginSign: '→',
      },
      {
        id: 'ing-4',
        text: 'Leer oraciones en voz alta ayuda a recordar el ritmo natural de ambos tiempos.',
        idealLineal: 'none',
        idealRealce: 'none',
      },
    ],
  },
  {
    id: 4,
    name: 'Matemáticas',
    shortLabel: 'Matemáticas',
    focusHint: 'Fórmulas, datos del problema y pasos de resolución',
    sampleTitle: 'Ecuación cuadrática y discriminante',
    sampleSegments: [
      {
        id: 'mat-1',
        text: 'Toda ecuación de segundo grado completa tiene la forma general ax² + bx + c = 0.',
        idealLineal: 'recta',
        idealRealce: 'amarillo',
        marginSign: '!',
      },
      {
        id: 'mat-2',
        text: 'El discriminante es la expresión dentro de la raíz cuadrada que indica cuántas soluciones reales existen.',
        idealLineal: 'ondulada',
        idealRealce: 'verde',
        marginSign: '→',
      },
      {
        id: 'mat-3',
        text: 'Fórmula clave: Δ = b² - 4ac; si Δ > 0 hay dos raíces reales distintas.',
        idealLineal: 'punteada',
        idealRealce: 'rosa',
        marginSign: '*',
      },
      {
        id: 'mat-4',
        text: 'Verifica siempre los signos de b y c antes de sustituir en la fórmula general.',
        idealLineal: 'none',
        idealRealce: 'none',
      },
    ],
  },
  {
    id: 5,
    name: 'Química',
    shortLabel: 'Química',
    focusHint: 'Reacciones, estequiometría, fórmulas y propiedades',
    sampleTitle: 'Conservación de la masa y balanceo',
    sampleSegments: [
      {
        id: 'qui-1',
        text: 'La ley de conservación de la masa establece que la materia no se crea ni se destruye en una reacción.',
        idealLineal: 'recta',
        idealRealce: 'amarillo',
        marginSign: '!',
      },
      {
        id: 'qui-2',
        text: 'Un coeficiente estequiométrico es el número entero que ajusta la cantidad de moléculas.',
        idealLineal: 'ondulada',
        idealRealce: 'verde',
        marginSign: '*',
      },
      {
        id: 'qui-3',
        text: 'Ejemplo: 2H₂ + O₂ → 2H₂O conserva 4 átomos de hidrógeno y 2 de oxígeno.',
        idealLineal: 'punteada',
        idealRealce: 'rosa',
        marginSign: '→',
      },
      {
        id: 'qui-4',
        text: 'Nunca modifiques los subíndices químicos al intentar balancear una ecuación.',
        idealLineal: 'none',
        idealRealce: 'none',
      },
    ],
  },
  {
    id: 6,
    name: 'Estrategias Cognitivas',
    shortLabel: 'Estrategias Cognitivas',
    focusHint: 'Metacognición, memoria activa y organización mental',
    sampleTitle: 'Recuerdo activo y metacognición',
    sampleSegments: [
      {
        id: 'ec-1',
        text: 'El recuerdo activo obliga al cerebro a recuperar información sin mirar los apuntes.',
        idealLineal: 'recta',
        idealRealce: 'amarillo',
        marginSign: '!',
      },
      {
        id: 'ec-2',
        text: 'La metacognición es la capacidad de evaluar qué entendiste bien y qué requiere repaso.',
        idealLineal: 'ondulada',
        idealRealce: 'verde',
        marginSign: '*',
      },
      {
        id: 'ec-3',
        text: 'Espaciar repasos en intervalos de 1, 3 y 7 días duplica la retención a largo plazo.',
        idealLineal: 'punteada',
        idealRealce: 'rosa',
        marginSign: '→',
      },
      {
        id: 'ec-4',
        text: 'Cierra el cuaderno al terminar un tema y explícate la idea principal con tus palabras.',
        idealLineal: 'none',
        idealRealce: 'none',
      },
    ],
  },
  {
    id: 7,
    name: 'Entorno y Sociedad',
    shortLabel: 'Entorno y Sociedad',
    focusHint: 'Análisis social, sustentabilidad y contexto comunitario',
    sampleTitle: 'Desarrollo sustentable y comunidad',
    sampleSegments: [
      {
        id: 'es-1',
        text: 'El desarrollo sustentable satisface las necesidades actuales sin comprometer los recursos futuros.',
        idealLineal: 'recta',
        idealRealce: 'amarillo',
        marginSign: '!',
      },
      {
        id: 'es-2',
        text: 'La participación ciudadana integra a las comunidades en decisiones sobre su territorio.',
        idealLineal: 'ondulada',
        idealRealce: 'verde',
        marginSign: '→',
      },
      {
        id: 'es-3',
        text: 'En 2015 se aprobaron los 17 Objetivos de Desarrollo Sostenible para equilibrar economía y ecología.',
        idealLineal: 'punteada',
        idealRealce: 'rosa',
        marginSign: '*',
      },
      {
        id: 'es-4',
        text: 'Observar problemas locales ayuda a conectar la teoría social con la vida cotidiana.',
        idealLineal: 'none',
        idealRealce: 'none',
      },
    ],
  },
];

export const LEARNING_STYLES: LearningStyleOption[] = [
  {
    key: 'a',
    label: 'a) Viendo (Visual)',
    description: 'Imágenes, esquemas, videos y códigos de color',
    promptValue: 'a) Viendo (visual)',
  },
  {
    key: 'b',
    label: 'b) Escuchando (Auditivo)',
    description: 'Explicaciones, audios y repasar en voz alta',
    promptValue: 'b) Escuchando (auditivo)',
  },
  {
    key: 'c',
    label: 'c) Haciendo (Kinestésico)',
    description: 'Practicar ejercicios, moverse y experimentar',
    promptValue: 'c) Haciendo (kinestésico)',
  },
];

export type FlowStep = 1 | 2 | 3 | 4 | 'done';

export interface ConversationState {
  step: FlowStep;
  selectedSubject: SubjectOption | null;
  selectedStyle: LearningStyleOption | null;
  recommendedUnderlining: 'lineal' | 'realce' | null;
}

export function detectConversationState(
  messages: Array<{role: 'user' | 'model'; text: string}>,
): ConversationState {
  let step: FlowStep = 1;
  let selectedSubject: SubjectOption | null = null;
  let selectedStyle: LearningStyleOption | null = null;
  let recommendedUnderlining: 'lineal' | 'realce' | null = null;

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const lower = msg.text.toLowerCase();
    const trimmed = lower.trim();

    if (msg.role === 'user') {
      // If user affirms another subject while at step 3/4, move back toward step 1
      if (
        (step === 3 || step === 4) &&
        /^(s[ií]|claro|ok|va|dale|por favor|otra|quiero otra)\b/i.test(trimmed)
      ) {
        step = 1;
        selectedSubject = null;
        selectedStyle = null;
        recommendedUnderlining = null;
      }

      // Check if user selected a subject (number 1-7 or subject name)
      const numberMatch = trimmed.match(/^(?:la\s+|opci[oó]n\s+|n[uú]mero\s+)?([1-7])(?:[.)\s]|$)/);
      const matchedSubject = SUBJECTS.find(
        (s) =>
          (numberMatch && Number(numberMatch[1]) === s.id) ||
          lower.includes(s.name.toLowerCase()) ||
          lower.includes(s.shortLabel.toLowerCase()) ||
          (s.id === 1 && (lower.includes('lectura') || lower.includes('redacción') || lower.includes('redaccion'))) ||
          (s.id === 3 && lower.includes('ingles')) ||
          (s.id === 4 && lower.includes('matematicas')) ||
          (s.id === 5 && lower.includes('quimica')) ||
          (s.id === 6 && lower.includes('cognitiv')) ||
          (s.id === 7 && (lower.includes('entorno') || lower.includes('sociedad'))),
      );
      if (matchedSubject && (step === 1 || !selectedSubject)) {
        selectedSubject = matchedSubject;
      }

      // Check if user selected a learning style
      if (
        /^(?:la\s+|opci[oó]n\s+)?a(?:[.)\s]|$)/i.test(trimmed) ||
        lower.includes('visual') ||
        lower.includes('viendo')
      ) {
        selectedStyle = LEARNING_STYLES[0];
      } else if (
        /^(?:la\s+|opci[oó]n\s+)?b(?:[.)\s]|$)/i.test(trimmed) ||
        lower.includes('auditiv') ||
        lower.includes('escuchando')
      ) {
        selectedStyle = LEARNING_STYLES[1];
      } else if (
        /^(?:la\s+|opci[oó]n\s+)?c(?:[.)\s]|$)/i.test(trimmed) ||
        lower.includes('kinest') ||
        lower.includes('haciendo')
      ) {
        selectedStyle = LEARNING_STYLES[2];
      }
    }

    if (msg.role === 'model') {
      const hasSubjectList =
        (lower.includes('taller de lectura') && lower.includes('matemáticas')) ||
        (lower.includes('historia') && lower.includes('química') && lower.includes('entorno'));
      const asksForSubject =
        lower.includes('elige una materia') ||
        lower.includes('elige una opción') ||
        lower.includes('qué materia') ||
        lower.includes('siguiente materia') ||
        lower.includes('otra materia te gustaría');
      const hasStylePrompt =
        (lower.includes('visual') && lower.includes('auditiv')) ||
        (lower.includes('viendo') && lower.includes('escuchando')) ||
        (lower.includes('a)') && lower.includes('b)') && lower.includes('c)')) ||
        lower.includes('cómo aprende') ||
        lower.includes('cómo aprendes');
      const hasRecommendations =
        lower.includes('consejos para estudiar') ||
        lower.includes('subrayado recomendado') ||
        lower.includes('organizar tu tiempo');
      const asksAnotherSubject =
        (lower.includes('otra materia') && !asksForSubject) ||
        lower.includes('consejos para otra');

      if (hasSubjectList || (asksForSubject && !hasRecommendations)) {
        step = 1;
        if (i > 2) {
          selectedStyle = null;
          recommendedUnderlining = null;
        }
      } else if (hasStylePrompt) {
        step = 2;
      } else if (hasRecommendations) {
        step = asksAnotherSubject ? 4 : 3;
        const subrayadoIndex = lower.indexOf('subrayado recomendado');
        const snippet = subrayadoIndex >= 0 ? lower.slice(subrayadoIndex, subrayadoIndex + 420) : lower;
        if (
          snippet.includes('recomiendo el subrayado lineal') ||
          snippet.includes('subrayado lineal:') ||
          snippet.includes('subrayado lineal es') ||
          snippet.includes('elige el subrayado lineal') ||
          snippet.includes('conviene el subrayado lineal') ||
          snippet.includes('te conviene usar el subrayado lineal')
        ) {
          recommendedUnderlining = 'lineal';
        } else if (snippet.includes('realce')) {
          recommendedUnderlining = 'realce';
        } else if (snippet.includes('lineal')) {
          recommendedUnderlining = 'lineal';
        }
      } else if (asksAnotherSubject) {
        step = 4;
      } else if (
        (lower.includes('éxito') ||
          lower.includes('hasta luego') ||
          lower.includes('nos vemos') ||
          lower.includes('cuídate') ||
          lower.includes('hasta pronto')) &&
        i >= 2
      ) {
        step = 'done';
      }
    }
  }

  return {
    step,
    selectedSubject,
    selectedStyle,
    recommendedUnderlining,
  };
}
