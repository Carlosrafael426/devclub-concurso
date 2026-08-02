import { MessageSquare } from 'lucide-react';
import { Reveal } from '../ui/Reveal';
import { ButtonPrimary } from '../ui/ButtonPrimary';
import { ButtonSecondary } from '../ui/ButtonSecondary';
import { Badge } from '../ui/Badge';
import { DISTANCE } from '../../lib/motion';
import { HeroRotatingWord } from './HeroRotatingWord';
import { HeroTerminal } from './HeroTerminal';

const ROLES = ['programador', 'dev full stack', 'profissional tech'];

// Fotos ilustrativas de alunos (mesmas usadas na seção de depoimentos)
const AVATARS = [
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=80&h=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=80&h=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=80&h=80',
];

/**
 * Hero - Seção principal de destaque do DevClub.
 * O fundo animado (rede de nós) vem do NetworkBackground global montado em
 * App.tsx. A palavra rotativa (HeroRotatingWord) e o mockup de editor
 * (HeroTerminal) foram extraídos para arquivos próprios para manter este
 * orquestrador focado em copy/CTAs — nenhum dos dois passa de ~100 linhas.
 */
export const Hero: React.FC = () => {
  return (
    <section id="hero" className="relative min-h-screen pt-28 sm:pt-32 lg:pt-36 pb-14 sm:pb-18 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black-dark pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 items-center relative z-10 w-full">
        <div className="lg:col-span-7 flex flex-col items-start text-left gap-6">
          <Reveal as="div" y={DISTANCE.sm} className="flex items-center gap-3 sm:gap-4 select-none">
            <div className="flex items-center -space-x-3 flex-shrink-0">
              {AVATARS.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  aria-hidden="true"
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-green-normal object-cover"
                />
              ))}
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-green-normal bg-green-normal/15 flex items-center justify-center text-[10px] sm:text-xs font-display font-normal text-green-normal">
                +17k
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="font-sans font-bold text-sm sm:text-base text-white">
                +17.000 devs formados
              </span>
              <Badge>
                <span className="w-1.5 h-1.5 rounded-full bg-green-normal animate-pulse" />
                turma com vagas abertas_
              </Badge>
            </div>
          </Reveal>

          <Reveal as="h1" delay={0.1} y={DISTANCE.md} className="font-display font-normal text-4xl sm:text-5xl md:text-7xl leading-[1.05] sm:leading-[1.1] text-white">
            Torne-se um <br />
            <HeroRotatingWord words={ROLES} /> <br />
            de verdade.
          </Reveal>

          <Reveal as="p" delay={0.25} y={DISTANCE.sm} className="max-w-xl font-sans font-medium text-base sm:text-lg leading-relaxed text-gray-300">
            O DevClub é a formação que mais coloca desenvolvedores no mercado no Brasil.
            Projetos reais, mentoria ativa e uma comunidade que não te deixa para trás.
          </Reveal>

          <Reveal as="div" stagger delay={0.3} className="flex flex-wrap gap-2 sm:gap-3 pt-1">
            {['Mentoria ativa', 'Projetos reais', 'Comunidade 24/7'].map((item) => (
              <span
                key={item}
                className="inline-flex items-center rounded-badge border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm font-medium text-gray-300"
              >
                {item}
              </span>
            ))}
          </Reveal>

          <Reveal as="div" delay={0.4} className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto pt-1 sm:pt-2">
            <ButtonPrimary href="#formacoes" className="w-full sm:w-auto justify-center">
              Ver formação
            </ButtonPrimary>

            <ButtonSecondary
              href="https://wa.me/seu-numero"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <MessageSquare size={18} className="site-icon" />
              Quero Falar com Consultor
            </ButtonSecondary>
          </Reveal>
        </div>

        <Reveal as="div" delay={0.2} y={DISTANCE.lg} className="lg:col-span-5 flex flex-col items-center lg:items-end justify-center relative min-h-[380px] gap-6 sm:gap-8">
          <HeroTerminal />
        </Reveal>
      </div>
    </section>
  );
};
