import {useState} from 'react';
import {Check, Copy, Download} from 'lucide-react';

interface ChatMessageProps {
  role: 'user' | 'model';
  text: string;
  isStreaming?: boolean;
}

function renderInlineFormatting(line: string) {
  const parts = line.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={idx} className="font-semibold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

function isSectionHeader(line: string): boolean {
  const trimmed = line.trim();
  return (
    trimmed.startsWith('📚') ||
    trimmed.startsWith('✏️') ||
    trimmed.startsWith('⏰') ||
    trimmed.startsWith('💪')
  );
}

export function ChatMessage({role, text, isStreaming = false}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);

  if (role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[82%] rounded-xl bg-slate-900 px-4 py-3 text-[15px] leading-relaxed text-slate-50 shadow-xs">
          {text}
        </div>
      </div>
    );
  }

  const lines = text.split('\n');
  const hasRecommendations =
    text.includes('📚') ||
    text.toLowerCase().includes('consejos para estudiar') ||
    text.toLowerCase().includes('subrayado recomendado');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API unavailable
    }
  };

  const handleDownload = () => {
    const blob = new Blob([text], {type: 'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'guia-estrategia-bot.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex justify-start">
      <article className="w-full rounded-xl border border-slate-200/90 bg-white px-5 py-4 text-[15px] leading-[1.65] text-slate-700">
        <div className="mb-2.5 flex items-center justify-between gap-4 border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span className="font-semibold text-slate-900">Estrategia Bot</span>
            <span aria-hidden="true">·</span>
            <span>Tutor de estudio</span>
          </div>
          {hasRecommendations && !isStreaming && (
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 whitespace-nowrap shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-700" />
                    <span>Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 whitespace-nowrap shrink-0"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Descargar .txt</span>
              </button>
            </div>
          )}
        </div>

        <div className="space-y-2">
          {lines.map((rawLine, index) => {
            const line = rawLine.trim();
            if (!line) {
              return <div key={index} className="h-1.5" />;
            }

            if (isSectionHeader(line)) {
              const cleanHeader = line.replace(/\*\*/g, '');
              return (
                <h4
                  key={index}
                  className="pt-3 first:pt-0 text-base font-semibold tracking-tight text-slate-900 border-t border-slate-100 first:border-t-0"
                >
                  {cleanHeader}
                </h4>
              );
            }

            if (/^\d+[.)]\s/.test(line)) {
              return (
                <p key={index} className="pl-2 text-slate-700 font-variant-numeric tabular-nums">
                  {renderInlineFormatting(line)}
                </p>
              );
            }

            if (/^[a-c]\)\s/i.test(line)) {
              return (
                <p key={index} className="pl-2 text-slate-800 font-medium">
                  {renderInlineFormatting(line)}
                </p>
              );
            }

            if (line.startsWith('- ') || line.startsWith('• ') || line.startsWith('* ')) {
              return (
                <div key={index} className="flex items-start gap-2.5 pl-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" aria-hidden="true" />
                  <p className="text-slate-700">{renderInlineFormatting(line.slice(2))}</p>
                </div>
              );
            }

            return (
              <p key={index} className="text-slate-700">
                {renderInlineFormatting(line)}
              </p>
            );
          })}

          {isStreaming && text.length === 0 && (
            <p className="text-sm text-slate-500">Escribiendo recomendación...</p>
          )}
        </div>
      </article>
    </div>
  );
}
