import { useLayoutEffect, useRef } from 'react';
import { gsap } from '../../lib/gsap';
import { EASE } from '../../lib/motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';

/**
 * Barra de progresso de leitura: 2px no topo, scaleX 0->1 amarrado ao
 * progresso total do documento (scrub, ease:none). Comunica "quanto falta
 * da página" sem exigir nenhuma leitura de número — o mesmo princípio já
 * usado localmente na trilha de formações (Fase 2), agora em escala global.
 */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    if (reducedMotion) return;
    const bar = barRef.current;
    if (!bar) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        bar,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: EASE.scrub,
          scrollTrigger: {
            trigger: document.documentElement,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
          },
        }
      );
    });
    return () => ctx.revert();
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-[2px] pointer-events-none" aria-hidden="true">
      <div ref={barRef} className="h-full w-full bg-green-normal origin-left" style={{ transform: 'scaleX(0)' }} />
    </div>
  );
}
