import { useRef } from 'react';
import type { MouseEvent, ReactNode } from 'react';
import { gsap } from '../../lib/gsap';
import { DURATION, EASE } from '../../lib/motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';

type TiltCardProps = {
  children: ReactNode;
  className?: string;
  max?: number;
};

/**
 * Tilt 3D controlado pela posição do cursor dentro do card, limitado a
 * ±max° (acima disso vira efeito de brinquedo — P1). Generaliza a lógica
 * que antes só existia hardcoded no Hero, agora reusável em qualquer card.
 * Retorno ao neutro usa EASE.back para dar uma personalidade de "assentar"
 * em vez de simplesmente voltar linear ao lugar.
 */
export function TiltCard({ children, className, max = 6 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotion();

  const handleMove = (event: MouseEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    gsap.to(el, {
      rotateX: -y * max * 2,
      rotateY: x * max * 2,
      scale: 1.02,
      transformPerspective: 1000,
      duration: DURATION.micro,
      ease: EASE.out,
      overwrite: true,
      willChange: 'transform',
    });
  };

  const handleLeave = () => {
    const el = ref.current;
    if (!el) return;
    gsap.to(el, {
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      duration: DURATION.micro * 2,
      ease: EASE.back,
      overwrite: true,
    });
  };

  return (
    <div ref={ref} onMouseMove={handleMove} onMouseLeave={handleLeave} className={className}>
      {children}
    </div>
  );
}
