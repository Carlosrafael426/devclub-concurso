import { useEffect, useRef, useState } from 'react';
import { gsap } from '../../lib/gsap';
import { useReducedMotion } from '../../hooks/useReducedMotion';

type CursorState = 'default' | 'link' | 'card' | 'track';

/**
 * Cursor customizado com estados contextuais — comunica affordance antes do
 * clique (P1): um ponto vira selo "difference" sobre links, um rótulo sobre
 * cards de formação, uma seta sobre a trilha horizontal. Usa gsap.quickTo()
 * (interpolador otimizado para updates de alta frequência) em vez de
 * useState a cada mousemove, que forçaria um re-render do React por frame.
 * Some por completo em dispositivos touch, onde cursor customizado não
 * faz sentido.
 */
export function Cursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<CursorState>('default');
  const [label, setLabel] = useState('');
  const reducedMotion = useReducedMotion();
  const [isTouch] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
  );

  useEffect(() => {
    if (isTouch || reducedMotion) return;
    const dot = dotRef.current;
    if (!dot) return;

    const moveX = gsap.quickTo(dot, 'x', { duration: 0.15, ease: 'power3.out' });
    const moveY = gsap.quickTo(dot, 'y', { duration: 0.15, ease: 'power3.out' });

    const handleMove = (event: MouseEvent) => {
      moveX(event.clientX);
      moveY(event.clientY);
    };

    const resolveState = (target: HTMLElement): { state: CursorState; label: string } => {
      // Card é mais específico que a trilha (que o envolve) — checar
      // primeiro, senão o cursor nunca sairia do estado "seta" sobre os
      // próprios cards.
      const cardHit = target.closest('[data-cursor-label]');
      if (cardHit) return { state: 'card', label: cardHit.getAttribute('data-cursor-label') ?? '' };
      const trackHit = target.closest('[data-cursor="track"]');
      if (trackHit) return { state: 'track', label: '' };
      const linkHit = target.closest('a, button, [role="button"]');
      if (linkHit) return { state: 'link', label: '' };
      return { state: 'default', label: '' };
    };

    const handleOver = (event: MouseEvent) => {
      const { state: next, label: nextLabel } = resolveState(event.target as HTMLElement);
      setState(next);
      setLabel(nextLabel);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseover', handleOver);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseover', handleOver);
    };
  }, [isTouch, reducedMotion]);

  if (isTouch || reducedMotion) return null;

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      className={`pointer-events-none fixed left-0 top-0 z-[999] flex items-center justify-center rounded-full -translate-x-1/2 -translate-y-1/2 mix-blend-difference bg-white transition-[width,height] duration-200 ease-out ${
        state === 'default'
          ? 'w-2 h-2'
          : state === 'link'
            ? 'w-10 h-10'
            : state === 'track'
              ? 'w-14 h-14'
              : 'w-24 h-24'
      }`}
    >
      {state === 'card' && label && (
        <span className="font-sans text-[11px] font-semibold uppercase tracking-wide text-black text-center px-1">
          {label}
        </span>
      )}
      {state === 'track' && (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-black">
          <path d="M8 5l8 7-8 7V5z" />
        </svg>
      )}
    </div>
  );
}
