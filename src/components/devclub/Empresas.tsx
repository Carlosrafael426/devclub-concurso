import { useEffect, useRef, useState } from 'react';
import { Reveal } from '../ui/Reveal';
import { DISTANCE } from '../../lib/motion';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import { useReducedMotion } from '../../hooks/useReducedMotion';
/**
 * Empresas - Seção "Empresas que contratam nossos devs"
 * Duas faixas em direções opostas (em vez de uma única, como nas outras
 * seções de marquee genéricas), com velocidade modulada pela velocidade do
 * scroll do usuário — o carrossel deixa de ser wallpaper autônomo e passa a
 * reagir a como a pessoa está navegando. No hover, a faixa desacelera e o
 * logo sob o cursor ganha destaque enquanto os demais saem de foco
 * (isolamento por contraste).
 */

interface Empresa {
  nome: string;
  monograma: string;
  cor: string;
}

// Lista de empresas que contratam alunos do DevClub (dados fictícios para o concurso)
const EMPRESAS: Empresa[] = [
  { nome: 'Nubank', monograma: 'Nu', cor: '#8A05BE' },
  { nome: 'iFood', monograma: 'iF', cor: '#EA1D2C' },
  { nome: 'Stone', monograma: 'St', cor: '#00A868' },
  { nome: 'PicPay', monograma: 'Pp', cor: '#21C25E' },
  { nome: 'Mercado Livre', monograma: 'ML', cor: '#FFE600' },
  { nome: 'Magazine Luiza', monograma: 'Ma', cor: '#0066CC' },
  { nome: 'Itaú Unibanco', monograma: 'It', cor: '#FF6600' },
  { nome: 'BTG Pactual', monograma: 'BT', cor: '#4C8DFF' },
  { nome: 'C6 Bank', monograma: 'C6', cor: '#F5F5F5' },
  { nome: 'RD Station', monograma: 'RD', cor: '#00A3E0' },
  { nome: 'Totvs', monograma: 'To', cor: '#E42329' },
  { nome: 'Zup Innovation', monograma: 'Zu', cor: '#FF4F00' },
  { nome: 'Softplan', monograma: 'So', cor: '#0077FF' },
  { nome: 'Conta Azul', monograma: 'CA', cor: '#2563EB' },
  { nome: 'Locaweb', monograma: 'Lo', cor: '#FF4500' },
  { nome: 'CI&T', monograma: 'CI', cor: '#E03A3E' },
];

// Cada faixa duplica sua própria lista (loop seamless via xPercent 0 -> ±50%)
const ROW_A = [...EMPRESAS, ...EMPRESAS];
const ROW_B = [...EMPRESAS].reverse();
const ROW_B_LOOP = [...ROW_B, ...ROW_B];

function MarqueeRow({
  id,
  items,
  direction,
  hovered,
  onHover,
}: {
  id: 'A' | 'B';
  items: Empresa[];
  direction: 1 | -1;
  hovered: string | null;
  onHover: (key: string | null) => void;
}) {
  const rowRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const hoveringRef = useRef(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const row = rowRef.current;
    if (!row || reducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.set(row, { xPercent: direction === 1 ? 0 : -50 });
      const tl = gsap.timeline({ repeat: -1 }).to(row, {
        xPercent: direction === 1 ? -50 : 0,
        duration: 34,
        ease: 'none',
      });
      timelineRef.current = tl;

      // ScrollTrigger.create sem trigger rastreia o scroll da página inteira
      // (scroller padrão = window) só para expor .getVelocity() a cada frame.
      const velocityTracker = ScrollTrigger.create({});
      const applyVelocity = () => {
        if (hoveringRef.current) return;
        const v = Math.min(Math.abs(velocityTracker.getVelocity()) / 2500, 1.4);
        tl.timeScale(1 + v);
      };
      gsap.ticker.add(applyVelocity);

      return () => {
        gsap.ticker.remove(applyVelocity);
        velocityTracker.kill();
      };
    }, row);

    return () => ctx.revert();
  }, [reducedMotion, direction]);

  const handleRowEnter = () => {
    hoveringRef.current = true;
    if (timelineRef.current) {
      gsap.to(timelineRef.current, { timeScale: 0.15, duration: 0.2, overwrite: true });
    }
  };

  const handleRowLeave = () => {
    hoveringRef.current = false;
    onHover(null);
    if (timelineRef.current) {
      gsap.to(timelineRef.current, { timeScale: 1, duration: 0.2, overwrite: true });
    }
  };

  return (
    <div
      className="marquee-wrapper relative overflow-hidden select-none"
      onMouseEnter={handleRowEnter}
      onMouseLeave={handleRowLeave}
    >
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 z-10 bg-gradient-to-r from-brand-surface-light to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 z-10 bg-gradient-to-l from-brand-surface-light to-transparent pointer-events-none" />

      <div ref={rowRef} className="flex gap-4 sm:gap-5 w-max">
        {items.map((empresa, idx) => {
          const key = `${id}-${idx}`;
          const isHovered = hovered === key;
          const isDimmed = hovered !== null && !isHovered;
          return (
            <div
              key={key}
              onMouseEnter={() => onHover(key)}
              className={`flex flex-col items-center gap-3 flex-shrink-0 w-28 sm:w-32 px-4 py-6 rounded-xl glass-panel transition-all duration-200 ${
                isHovered ? 'scale-110 grayscale-0 opacity-100' : isDimmed ? 'grayscale opacity-40 scale-95' : 'grayscale-0 opacity-90'
              }`}
            >
              <div
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center font-display font-extrabold text-base sm:text-lg"
                style={{
                  backgroundColor: `${empresa.cor}1A`,
                  color: empresa.cor,
                  border: `1px solid ${empresa.cor}40`,
                  boxShadow: `0 0 24px ${empresa.cor}30`,
                }}
              >
                {empresa.monograma}
              </div>
              <span className="text-xs sm:text-sm font-medium text-slate-300 text-center whitespace-nowrap">
                {empresa.nome}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const Empresas = () => {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section id="empresas" className="relative py-20 sm:py-24 bg-brand-surface-light/85 border-y border-white/[0.03] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <Reveal as="span" y={DISTANCE.sm} className="block font-sans font-bold text-[11px] sm:text-xs tracking-widest text-brand-green uppercase">
            EMPRESAS PARCEIRAS
          </Reveal>
          <Reveal as="h2" split="words" delay={0.1} className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight text-white mt-3">
            Empresas que contratam <br />nossos devs
          </Reveal>
          <Reveal as="p" y={DISTANCE.sm} delay={0.25} className="font-sans text-slate-400 mt-4 text-base sm:text-lg">
            Nossos alunos já foram contratados por essas e outras grandes empresas de tecnologia do Brasil.
          </Reveal>
        </div>
      </div>

      {/* Duas faixas de logos em direções opostas, sangrando pra fora do container */}
      <div className="flex flex-col gap-4 sm:gap-5">
        <MarqueeRow id="A" items={ROW_A} direction={1} hovered={hovered} onHover={setHovered} />
        <MarqueeRow id="B" items={ROW_B_LOOP} direction={-1} hovered={hovered} onHover={setHovered} />
      </div>
    </section>
  );
};
