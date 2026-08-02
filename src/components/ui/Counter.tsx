import { useLayoutEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import { DURATION, EASE } from '../../lib/motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';

type CounterProps = {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
};

/**
 * Contador que sobe de 0 até `value` quando entra em viewport (uma única
 * vez). Unifica as duas implementações manuais duplicadas que existiam
 * (Hero e Alunos, cada uma com seu próprio loop de requestAnimationFrame
 * reimplementando a mesma curva de easing) num único componente. Usa
 * tabular-nums para reservar o espaço final dos dígitos e evitar CLS
 * durante a contagem.
 */
export function Counter({ value, prefix = '', suffix = '', className }: CounterProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reducedMotion) {
      el.textContent = `${prefix}${value.toLocaleString('pt-BR')}${suffix}`;
      return;
    }

    el.textContent = `${prefix}0${suffix}`;
    const obj = { val: 0 };
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          val: value,
          duration: DURATION.feature,
          ease: EASE.out,
          snap: { val: 1 },
          onUpdate: () => {
            el.textContent = `${prefix}${Math.round(obj.val).toLocaleString('pt-BR')}${suffix}`;
          },
        });
      },
    });

    return () => trigger.kill();
  }, [reducedMotion, value, prefix, suffix]);

  return (
    <span ref={ref} className={`tabular-nums ${className ?? ''}`}>
      {prefix}0{suffix}
    </span>
  );
}
