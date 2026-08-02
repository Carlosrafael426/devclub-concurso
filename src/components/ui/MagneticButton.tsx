import { useRef } from 'react';
import type { MouseEvent, ReactNode } from 'react';
import { gsap } from '../../lib/gsap';
import { DURATION, EASE } from '../../lib/motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';

type MagneticButtonProps = {
  children: ReactNode;
  className?: string;
  href: string;
  target?: string;
  rel?: string;
  onClick?: () => void;
  radius?: number;
  strength?: number;
};

/**
 * Botão magnético: desloca-se até `strength`px na direção do cursor quando
 * ele entra no raio de `radius`px, e volta com EASE.back. Reservado só para
 * CTAs primários (Hero e CTA final) — magnetismo em todo botão vira ruído
 * e prejudica a previsibilidade da interface (P1).
 */
export function MagneticButton({ children, className, href, target, rel, onClick, radius = 80, strength = 8 }: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement | null>(null);
  const reducedMotion = useReducedMotion();

  const handleMove = (event: MouseEvent<HTMLAnchorElement>) => {
    if (reducedMotion) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = event.clientX - cx;
    const dy = event.clientY - cy;
    const distance = Math.hypot(dx, dy);
    if (distance > radius) return;
    gsap.to(el, {
      x: (dx / radius) * strength,
      y: (dy / radius) * strength,
      duration: DURATION.micro,
      ease: EASE.out,
      overwrite: true,
      willChange: 'transform',
    });
  };

  const handleLeave = () => {
    gsap.to(ref.current, { x: 0, y: 0, duration: DURATION.micro * 2, ease: EASE.back, overwrite: true });
  };

  return (
    <a
      ref={ref}
      href={href}
      target={target}
      rel={rel}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={className}
    >
      {children}
    </a>
  );
}
