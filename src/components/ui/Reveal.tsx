import { useLayoutEffect, useRef } from 'react';
import type { ElementType, ReactNode } from 'react';
import { gsap, SplitText } from '../../lib/gsap';
import { DURATION, EASE, STAGGER, DISTANCE } from '../../lib/motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';

type RevealProps = {
  as?: ElementType;
  children: ReactNode;
  y?: number;
  delay?: number;
  duration?: number;
  stagger?: boolean | number;
  split?: 'words' | false;
  start?: string;
  className?: string;
};

/**
 * <Reveal> é o único mecanismo de entrada em viewport da página — substitui
 * o antigo par useScrollAnimation/.fade-up. Centralizar aqui garante que
 * todo reveal da página compartilhe a mesma física (P8: sistema, não
 * instâncias). Três modos: bloco único (fade + deslocamento curto), grade
 * com stagger entre os filhos diretos, ou título com máscara por palavras
 * (split="words") para o reveal de maior destaque tipográfico.
 */
export function Reveal({
  as: Tag = 'div',
  children,
  y = DISTANCE.md,
  delay = 0,
  duration = DURATION.reveal,
  stagger = false,
  split = false,
  start = 'top 85%',
  className,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reducedMotion) {
      gsap.set(el, { clearProps: 'all' });
      return;
    }

    if (split === 'words') {
      let splitInstance: SplitText | null = null;
      let tween: gsap.core.Tween | null = null;
      let resizeTimeout: number;

      const runSplit = () => {
        tween?.scrollTrigger?.kill();
        tween?.kill();
        splitInstance?.revert();
        splitInstance = new SplitText(el, { type: 'lines,words', linesClass: 'line-mask' });
        tween = gsap.from(splitInstance.words, {
          yPercent: 110,
          duration,
          ease: EASE.expo,
          delay,
          stagger: STAGGER.words,
          scrollTrigger: { trigger: el, start, once: true },
        });
      };

      document.fonts.ready.then(runSplit);
      const onResize = () => {
        window.clearTimeout(resizeTimeout);
        resizeTimeout = window.setTimeout(runSplit, 200);
      };
      window.addEventListener('resize', onResize);

      return () => {
        window.removeEventListener('resize', onResize);
        window.clearTimeout(resizeTimeout);
        tween?.scrollTrigger?.kill();
        tween?.kill();
        splitInstance?.revert();
      };
    }

    const ctx = gsap.context(() => {
      const targets: Element | Element[] = stagger ? Array.from(el.children) : el;
      gsap.from(targets, {
        opacity: 0,
        y,
        duration,
        ease: EASE.out,
        delay,
        stagger: stagger ? (typeof stagger === 'number' ? stagger : STAGGER.cards) : 0,
        scrollTrigger: { trigger: el, start, once: true },
      });
    }, ref);

    return () => ctx.revert();
  }, [reducedMotion, split, stagger, y, delay, duration, start]);

  return (
    <Tag ref={ref as React.Ref<HTMLElement>} className={className}>
      {children}
    </Tag>
  );
}
