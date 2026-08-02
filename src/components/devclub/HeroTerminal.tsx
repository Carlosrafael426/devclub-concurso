import { Check } from 'lucide-react';
import { Reveal } from '../ui/Reveal';
import { TiltCard } from '../ui/TiltCard';
import { Counter } from '../ui/Counter';
import { STAGGER } from '../../lib/motion';
import { MatrixTextReveal } from './MatrixTextReveal';

type Token = { text: string; className?: string };
type CodeLine = Token[];

// Snippet ilustrativo do "código" da transformação de carreira do aluno
const CODE_LINES: CodeLine[] = [
  [{ text: '// sua transformação em código', className: 'text-slate-400' }],
  [
    { text: 'const', className: 'text-brand-purple-light' },
    { text: ' voce ', className: 'text-brand-purple-light' },
    { text: '= {', className: 'text-slate-300' },
  ],
  [
    { text: '  status: ', className: 'text-slate-300' },
    { text: '"contratado"', className: 'text-brand-green' },
    { text: ',', className: 'text-slate-300' },
  ],
  [
    { text: '  stack: [', className: 'text-slate-300' },
    { text: '"React"', className: 'text-brand-green' },
    { text: ', ', className: 'text-slate-300' },
    { text: '"Node"', className: 'text-brand-green' },
    { text: ', ', className: 'text-slate-300' },
    { text: '"SQL"', className: 'text-brand-green' },
    { text: '],', className: 'text-slate-300' },
  ],
  [
    { text: '  tempo: ', className: 'text-slate-300' },
    { text: '7', className: 'text-amber-300' },
    { text: ', ', className: 'text-slate-300' },
    { text: '// meses', className: 'text-slate-400' },
  ],
  [{ text: '};', className: 'text-slate-300' }],
];

/**
 * Mockup "editor + terminal" do Hero. Antes era decoração 100% estática;
 * agora as linhas de código revelam em stagger ao entrar em viewport e a
 * linha sob o cursor se destaca (as demais saem de foco) — o terminal
 * ganha vida em vez de só ilustrar. O tilt 3D vem do <TiltCard/> genérico
 * e os contadores do rodapé usam o <Counter/> unificado (antes duplicado
 * manualmente aqui e em Alunos.tsx).
 */
export function HeroTerminal() {
  return (
    <>
      <MatrixTextReveal className="hidden sm:block" />
      <TiltCard className="relative z-10 w-full max-w-[500px]">
        <div className="rounded-xl border border-white/10 bg-[#181719]/90 backdrop-blur-xl shadow-[0_0_100px_rgba(57, 211, 83, 0.12)] overflow-hidden">
          {/* Barra de título estilo editor de código */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-brand-purple/70" />
              <span className="w-3 h-3 rounded-full bg-amber-400/70" />
              <span className="w-3 h-3 rounded-full bg-brand-green/70" />
            </div>
            <span className="font-mono text-xs text-slate-400">carreira.tsx</span>
            <span className="w-10" aria-hidden="true" />
          </div>

          {/* Corpo do "código": linhas revelam em stagger, hover destaca a
              linha ativa e desfoca as demais. */}
          <Reveal as="div" stagger={STAGGER.words} className="group/code px-5 sm:px-6 py-5 font-mono text-[12.5px] sm:text-sm leading-relaxed overflow-x-auto">
            {CODE_LINES.map((line, i) => (
              <div key={i} className="whitespace-pre opacity-100 transition-opacity duration-200 group-hover/code:opacity-50 hover:!opacity-100">
                {line.map((token, j) => (
                  <span key={j} className={token.className}>{token.text}</span>
                ))}
              </div>
            ))}
          </Reveal>

          {/* Rodapé terminal com estatísticas animadas (Counter unificado) */}
          <div className="border-t border-white/5 bg-black/40 px-5 sm:px-6 py-4 sm:py-5 font-mono text-[11.5px] sm:text-xs space-y-2">
            <p className="text-slate-400">$ npm run carreira -- --nivel=pro</p>
            <p className="flex items-center gap-2 text-brand-green">
              <Check size={14} className="site-icon flex-shrink-0" />
              <Counter value={17000} suffix="+" /> devs formados
            </p>
            <p className="flex items-center gap-2 text-brand-purple-light">
              <Check size={14} className="site-icon flex-shrink-0" />
              <Counter value={120} /> mentorias ativas
            </p>
            <p className="flex items-center gap-2 text-brand-purple">
              <Check size={14} className="site-icon flex-shrink-0" />
              <Counter value={94} /> projetos reais
            </p>
            <p className="text-slate-400">
              $ <span className="typewriter-cursor" aria-hidden="true" />
            </p>
          </div>
        </div>

        {/* Chip flutuante de urgência */}
        <div className="absolute -top-5 -right-3 sm:-right-5 hidden sm:flex items-center gap-2 rounded-lg border border-brand-green/30 bg-black/60 backdrop-blur-md px-4 py-2 shadow-lg animate-float">
          <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
          <span className="text-xs font-semibold text-white">9 vagas hoje</span>
        </div>
      </TiltCard>
    </>
  );
}
