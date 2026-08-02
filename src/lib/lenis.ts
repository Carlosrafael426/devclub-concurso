import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './gsap';

/**
 * Lenis substitui o scroll nativo por scroll com inércia.
 * Decisão: o scroll é a principal interação de uma landing page — melhorar
 * o "feel" dele eleva a percepção de qualidade da página inteira a um custo
 * de poucos KB. Sincronizado com o ticker do GSAP para que Lenis e
 * ScrollTrigger compartilhem o mesmo relógio (uma única RAF loop).
 */
export function initSmoothScroll() {
  const lenis = new Lenis({
    duration: 1.1, // acima de 1.4 vira "escorregadio" e irrita
    smoothWheel: true,
    touchMultiplier: 1,
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Preserva o comportamento de âncoras (`href="#secao"`) com o offset da
  // navbar fixa (equivalente ao scroll-padding-top:5rem hoje em index.css),
  // já que Lenis assume o controle do scroll no lugar do nativo.
  const handleAnchorClick = (event: MouseEvent) => {
    const anchor = (event.target as HTMLElement).closest('a[href^="#"]');
    if (!anchor) return;
    const id = anchor.getAttribute('href')?.slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    lenis.scrollTo(target, { offset: -80 });
  };
  document.addEventListener('click', handleAnchorClick);

  return () => {
    document.removeEventListener('click', handleAnchorClick);
    lenis.destroy();
  };
}
