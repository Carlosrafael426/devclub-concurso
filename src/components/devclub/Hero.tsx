import { MessageSquare, Check } from 'lucide-react';
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { MatrixTextReveal } from './MatrixTextReveal';

type Token = { text: string; className?: string };
type CodeLine = Token[];

// Snippet ilustrativo do "código" da transformação de carreira do aluno
const CODE_LINES: CodeLine[] = [
  [{ text: '// sua transformação em código', className: 'text-slate-500' }],
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
    { text: '// meses', className: 'text-slate-500' },
  ],
  [{ text: '};', className: 'text-slate-300' }],
];

const ROLES = ['programador', 'dev full stack', 'profissional tech'];

// Fotos ilustrativas de alunos (mesmas usadas na seção de depoimentos)
const AVATARS = [
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=80&h=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=80&h=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=80&h=80',
];

/**
 * Hero - Seção principal de destaque do DevClub.
 * O fundo animado (rede de nós reativa ao mouse) vem do NetworkBackground
 * global montado em App.tsx. Aqui só o conteúdo: typewriter em loop e um
 * mockup "editor + terminal" no lugar do antigo dashboard estático.
 */
export const Hero: React.FC = () => {
  const { ref, isVisible } = useScrollAnimation(0.15);
  const [roleIndex, setRoleIndex] = useState(0);
  const [displayWord, setDisplayWord] = useState('');
  const [phase, setPhase] = useState<'typing' | 'deleting'>('typing');
  const [stats, setStats] = useState({ students: 0, mentors: 0, projects: 0 });
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const currentWord = ROLES[roleIndex];
    let timeout: number;

    if (phase === 'typing') {
      if (displayWord.length < currentWord.length) {
        timeout = window.setTimeout(() => setDisplayWord(currentWord.slice(0, displayWord.length + 1)), 90);
      } else {
        timeout = window.setTimeout(() => setPhase('deleting'), 1800);
      }
    } else {
      if (displayWord.length > 0) {
        timeout = window.setTimeout(() => setDisplayWord(currentWord.slice(0, displayWord.length - 1)), 45);
      } else {
        setPhase('typing');
        setRoleIndex((prev) => (prev + 1) % ROLES.length);
      }
    }

    return () => window.clearTimeout(timeout);
  }, [displayWord, phase, roleIndex]);

  useEffect(() => {
    const targets = { students: 17000, mentors: 120, projects: 94 };
    const duration = 1400;
    const start = Date.now();

    const tick = () => {
      const progress = Math.min((Date.now() - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setStats({
        students: Math.round(targets.students * ease),
        mentors: Math.round(targets.mentors * ease),
        projects: Math.round(targets.projects * ease),
      });
      if (progress < 1) {
        window.requestAnimationFrame(tick);
      }
    };

    const frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const renderCounter = (value: number, suffix = '') => `${value.toLocaleString('pt-BR')}${suffix}`;

  const handleTilt = (event: MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateY = (x / rect.width - 0.5) * 14;
    const rotateX = (y / rect.height - 0.5) * -14;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  };

  const resetTilt = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
  };

  return (
    <section id="hero" ref={ref} className={`relative min-h-screen pt-28 sm:pt-32 lg:pt-36 pb-14 sm:pb-18 flex items-center justify-center overflow-hidden fade-up ${isVisible ? 'visible' : ''}`}>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-brand-bg pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 items-center relative z-10 w-full">
        <div className="lg:col-span-7 flex flex-col items-start text-left gap-6">
          <div className="flex items-center gap-3 sm:gap-4 select-none">
            <div className="flex items-center -space-x-3 flex-shrink-0">
              {AVATARS.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  aria-hidden="true"
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-brand-bg object-cover"
                />
              ))}
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-brand-bg bg-brand-green/15 flex items-center justify-center text-[10px] sm:text-xs font-display font-extrabold text-brand-green">
                +17k
              </div>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-sans font-bold text-sm sm:text-base text-white">
                +17.000 devs formados
              </span>
              <span className="inline-flex items-center gap-1.5 font-sans font-semibold text-[11px] sm:text-xs tracking-wider text-brand-green uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
                Turma com vagas abertas
              </span>
            </div>
          </div>

          <h1 className="font-display font-extrabold text-4xl sm:text-5xl md:text-7xl leading-[1.05] sm:leading-[1.1] tracking-tight text-white">
            Torne-se um <br />
            <span className="min-h-[1.2em] inline-block bg-gradient-to-r from-brand-green via-brand-green-light to-brand-purple bg-clip-text text-transparent">
              {displayWord}
              <span className="typewriter-cursor" aria-hidden="true" />
            </span> <br />
            de verdade.
          </h1>

          <p className="max-w-xl font-sans font-normal text-base sm:text-lg leading-relaxed text-slate-400">
            O DevClub é a formação que mais coloca desenvolvedores no mercado no Brasil.
            Projetos reais, mentoria ativa e uma comunidade que não te deixa para trás.
          </p>

          <div className="flex flex-wrap gap-2 sm:gap-3 pt-1">
            {['Mentoria ativa', 'Projetos reais', 'Comunidade 24/7'].map((item) => (
              <span
                key={item}
                className="inline-flex items-center rounded-md border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm font-medium text-slate-300"
              >
                {item}
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto pt-1 sm:pt-2">
            <a
              href="#formacoes"
              className="group flex items-center justify-center px-6 sm:px-8 py-3.5 sm:py-4 rounded-lg bg-brand-green text-[#111012] font-display font-extrabold text-base tracking-wide shadow-[0_8px_30px_rgba(57, 211, 83, 0.28)] hover:shadow-[0_14px_50px_rgba(57, 211, 83, 0.55)] hover:scale-[1.05] transition-all duration-500 ease-out w-full sm:w-auto cursor-pointer"
            >
              <span className="inline-flex items-center gap-2 group-hover:scale-[0.952] transition-transform duration-300">
                Ver formação
              </span>
            </a>

            <a
              href="https://wa.me/seu-numero"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center px-6 sm:px-8 py-3.5 sm:py-4 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.08] text-white font-display font-bold text-base tracking-wide shadow-[0_8px_24px_rgba(0,0,0,0.3)] hover:shadow-[0_10px_34px_rgba(57, 211, 83, 0.18)] hover:scale-[1.05] transition-all duration-500 ease-out w-full sm:w-auto cursor-pointer"
            >
              <span className="inline-flex items-center gap-2 group-hover:scale-[0.952] transition-transform duration-300">
                <MessageSquare size={18} className="site-icon" />
                Quero Falar com Consultor
              </span>
            </a>
          </div>
        </div>

        <div className="lg:col-span-5 flex items-center justify-center lg:justify-end relative min-h-[380px]">
          <MatrixTextReveal opacity={0.22} className="hidden sm:block" />
          <div
            ref={cardRef}
            onMouseMove={handleTilt}
            onMouseLeave={resetTilt}
            className="relative z-10 w-full max-w-[500px] transition-transform duration-300 ease-out will-change-transform"
          >
            <div className="rounded-xl border border-white/10 bg-[#181719]/90 backdrop-blur-xl shadow-[0_0_100px_rgba(57, 211, 83, 0.12)] overflow-hidden">
              {/* Barra de título estilo editor de código */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-brand-purple/70" />
                  <span className="w-3 h-3 rounded-full bg-amber-400/70" />
                  <span className="w-3 h-3 rounded-full bg-brand-green/70" />
                </div>
                <span className="font-mono text-xs text-slate-500">carreira.tsx</span>
                <span className="w-10" aria-hidden="true" />
              </div>

              {/* Corpo do "código" com syntax highlight simulado */}
              <div className="px-5 sm:px-6 py-5 font-mono text-[12.5px] sm:text-sm leading-relaxed overflow-x-auto">
                {CODE_LINES.map((line, i) => (
                  <div key={i} className="whitespace-pre">
                    {line.map((token, j) => (
                      <span key={j} className={token.className}>{token.text}</span>
                    ))}
                  </div>
                ))}
              </div>

              {/* Rodapé terminal com estatísticas animadas */}
              <div className="border-t border-white/5 bg-black/40 px-5 sm:px-6 py-4 sm:py-5 font-mono text-[11.5px] sm:text-xs space-y-2">
                <p className="text-slate-500">$ npm run carreira -- --nivel=pro</p>
                <p className="flex items-center gap-2 text-brand-green">
                  <Check size={14} className="site-icon flex-shrink-0" />
                  {renderCounter(stats.students, '+')} devs formados
                </p>
                <p className="flex items-center gap-2 text-brand-purple-light">
                  <Check size={14} className="site-icon flex-shrink-0" />
                  {stats.mentors} mentorias ativas
                </p>
                <p className="flex items-center gap-2 text-brand-purple">
                  <Check size={14} className="site-icon flex-shrink-0" />
                  {stats.projects} projetos reais
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
          </div>
        </div>
      </div>
    </section>
  );
};
