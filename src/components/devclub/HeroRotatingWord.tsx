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
 * caracteres saem deslizando para cima e entram de baixo, com o gradiente
 * de marca aplicado por caractere (não pela palavra inteira, já que
 * `background-clip`/`color` não são herdados pelos spans que o SplitText
 * gera).
 */
export function HeroRotatingWord({ words }: HeroRotatingWordProps) {
  const wordHostRef = useRef<HTMLSpanElement | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const el = wordHostRef.current;
    if (!el) return;

    const applyGradient = (target: Element) => {
      const node = target as HTMLElement;
      node.style.backgroundImage =
        'linear-gradient(90deg, var(--color-brand-green), var(--color-brand-green-light), var(--color-brand-purple))';
      node.style.backgroundClip = 'text';
      node.style.webkitBackgroundClip = 'text';
      node.style.color = 'transparent';
    };

    const renderWord = (word: string, animateIn: boolean) => {
      el.textContent = word;
      const split = new SplitText(el, { type: 'chars' });
      split.chars.forEach(applyGradient);
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
