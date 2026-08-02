import { useEffect, useRef } from 'react';
import { DURATION, EASE, STAGGER } from '../../lib/motion';
import { gsap, SplitText } from '../../lib/gsap';
import { useReducedMotion } from '../../hooks/useReducedMotion';

type HeroRotatingWordProps = {
  words: string[];
};

/**
 * Palavra rotativa do H1 do Hero. Mantém o conceito de "múltiplas saídas de
 * carreira" da versão anterior, mas troca a digitação letra-a-letra + cursor
 * piscando (assinatura de IA) por uma transição de máscara via SplitText:
 * caracteres saem deslizando para cima e entram de baixo. Cor sólida verde
 * (não gradiente) por caractere — a marca não usa gradiente verde→roxo em
 * texto, e no máximo um destaque verde por viewport.
 */
export function HeroRotatingWord({ words }: HeroRotatingWordProps) {
  const wordHostRef = useRef<HTMLSpanElement | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const el = wordHostRef.current;
    if (!el) return;

    const applyColor = (target: Element) => {
      (target as HTMLElement).style.color = 'var(--color-green-normal)';
    };

    const renderWord = (word: string, animateIn: boolean) => {
      el.textContent = word;
      const split = new SplitText(el, { type: 'chars' });
      split.chars.forEach(applyColor);
      if (animateIn) {
        gsap.set(split.chars, { yPercent: 110, opacity: 0 });
        gsap.to(split.chars, {
          yPercent: 0,
          opacity: 1,
          duration: DURATION.reveal,
          ease: EASE.expo,
          stagger: STAGGER.chars,
        });
      } else {
        gsap.set(split.chars, { yPercent: 0, opacity: 1 });
      }
      return split;
    };

    if (reducedMotion) {
      renderWord(words[0], false);
      return;
    }

    let roleIndex = 0;
    let currentSplit = renderWord(words[0], false);

    const interval = window.setInterval(() => {
      gsap.to(currentSplit.chars, {
        yPercent: -110,
        opacity: 0,
        duration: DURATION.micro * 2,
        ease: EASE.in,
        stagger: STAGGER.chars,
        onComplete: () => {
          currentSplit.revert();
          roleIndex = (roleIndex + 1) % words.length;
          currentSplit = renderWord(words[roleIndex], true);
        },
      });
    }, 2800);

    return () => {
      window.clearInterval(interval);
      currentSplit.revert();
    };
  }, [reducedMotion, words]);

  return (
    <span className="inline-block overflow-hidden align-baseline whitespace-nowrap">
      <span ref={wordHostRef} className="inline-block">{words[0]}</span>
    </span>
  );
}
