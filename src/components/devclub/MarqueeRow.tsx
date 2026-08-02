import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import { EASE } from '../../lib/motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export type Empresa = {
  nome: string;
  monograma: string;
  cor: string;
};

type MarqueeRowProps = {
  id: 'A' | 'B';
  items: Empresa[];
  direction: 1 | -1;
  hovered: string | null;
  onHover: (key: string | null) => void;
};

/**
 * Uma faixa do marquee de Empresas. Loop infinito via xPercent (não mais
 * @keyframes CSS), com velocidade modulada pela velocidade real do scroll
 * (ScrollTrigger.getVelocity) — a faixa reage a como o usuário navega em
 * vez de rodar num ritmo fixo autônomo. No hover, só ESTA faixa desacelera
 * (as outras seguem no ritmo do scroll) e o logo sob o cursor ganha
 * destaque enquanto os demais (desta e da outra faixa) saem de foco.
 */
export function MarqueeRow({ id, items, direction, hovered, onHover }: MarqueeRowProps) {
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
        ease: EASE.scrub,
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
