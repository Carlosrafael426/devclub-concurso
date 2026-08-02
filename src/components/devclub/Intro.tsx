import { useLayoutEffect, useRef } from 'react';
import { gsap, ScrollTrigger, SplitText } from '../../lib/gsap';
import { EASE, STAGGER, DISTANCE } from '../../lib/motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { hasSeenIntro, INTRO_SESSION_KEY } from '../../lib/introSession';
import { Logo } from '../ui/Logo';

const MAX_FONT_WAIT_MS = 1500;

/**
 * Intro cinematográfica: roda uma única vez por sessão de aba (checado de
 * forma síncrona, antes do primeiro paint, via `hasSeenIntro()` — nunca
 * dentro de um efeito, que só resolveria depois do componente já ter
 * montado tudo). Em visitas seguintes o componente nem monta: `return
 * null` direto, sem flash de intro seguido de remoção abrupta. A flag é
 * gravada no INÍCIO da Fase A, não no fim — um refresh no meio da
 * animação não deve mostrá-la de novo, já que a intenção de exibi-la já
 * foi cumprida.
 *
 * Ao carregar (primeira vez), só o logo (módulos se montando em ordem
 * aleatória — materialização, não barra de progresso) e o wordmark
 * abaixo dele. Ao rolar, uma única camada de profundidade: o logo recua
 * (escala para baixo + blur, nunca para cima — "câmera atravessando"
 * seria enérgico mas desorientador) enquanto o site emerge por trás. Não
 * usa a opção `pin` do ScrollTrigger: `#intro` já é `position:fixed` por
 * conta própria, então "prender" um elemento que nunca sai do viewport
 * seria redundante — o próprio `#intro-spacer` (100svh, fluxo normal) já
 * reserva a distância de scroll, e a camada fixa só precisa desaparecer
 * (opacity) no fim para revelar `#site`, que já rolou pra posição certa
 * por baixo dela.
 */
export function Intro() {
  const reducedMotion = useReducedMotion();
  const spacerRef = useRef<HTMLDivElement | null>(null);
  const introRef = useRef<HTMLDivElement | null>(null);
  const logoRef = useRef<SVGSVGElement | null>(null);
  const wordRef = useRef<HTMLDivElement | null>(null);
  const hintRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    // sessionStorage já resolve o replay mesmo se StrictMode montar/
    // desmontar este efeito duas vezes em dev (a segunda leitura já
    // encontra a flag gravada pela primeira, se a primeira chegou a
    // rodar) — mas o cleanup abaixo (flag `cancelled` + kill manual)
    // ainda cobre o caso de a Fase A ser interrompida no meio.
    if (reducedMotion || hasSeenIntro()) return;

    const spacer = spacerRef.current;
    const intro = introRef.current;
    const logoSvg = logoRef.current;
    const wordEl = wordRef.current;
    const hintEl = hintRef.current;
    if (!spacer || !intro || !logoSvg || !wordEl || !hintEl) return;

    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    const rects = logoSvg.querySelectorAll('rect');

    let phaseBTween: gsap.core.Timeline | null = null;
    let split: SplitText | null = null;
    let cancelled = false;

    // Estado inicial escondido, aplicado de forma síncrona (useLayoutEffect,
    // antes do primeiro paint) — sem isto haveria um frame com tudo visível
    // antes do gate de fontes resolver.
    gsap.set(rects, { scale: 0, opacity: 0, transformOrigin: 'center' });
    gsap.set(wordEl, { opacity: 0 });
    gsap.set(hintEl, { opacity: 0, y: DISTANCE.sm });

    // Fase B: uma única ScrollTrigger com scrub controla a transição.
    const setupPhaseB = () => {
      if (cancelled) return;
      const site = document.getElementById('site');
      const navLogo = document.getElementById('nav-logo-icon');

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: spacer,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
          invalidateOnRefresh: true,
        },
        defaults: { ease: EASE.scrub },
      });

      tl.to(hintEl, { opacity: 0, y: DISTANCE.sm, duration: 0.12 }, 0);
      tl.to(wordEl, { opacity: 0, y: -DISTANCE.md, duration: 0.35 }, 0);
      tl.to(
        logoSvg,
        {
          scale: 0.28,
          opacity: 0,
          filter: isMobile ? 'none' : 'blur(6px)',
          duration: 0.62,
        },
        0.08
      );
      if (site) {
        tl.fromTo(
          site,
          { opacity: 0, scale: 0.92, y: 40 },
          { opacity: 1, scale: 1, y: 0, duration: 0.7 },
          0.3
        );
      }
      if (navLogo) {
        tl.fromTo(navLogo, { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.55);
      }
      tl.to(intro, { opacity: 0, duration: 0.2 }, 0.78);

      phaseBTween = tl;
      // O refresh global de main.tsx dispara em document.fonts.ready, que é
      // ANTES desta ScrollTrigger existir (só é criada aqui) — sem isto o
      // cálculo de distância ficaria baseado num layout desatualizado.
      ScrollTrigger.refresh();
    };

    const runPhaseA = () => {
      if (cancelled) return;

      // Grava a flag AGORA — no início de verdade da Fase A, não no fim.
      // Um refresh no meio da animação não deve repeti-la: a intenção de
      // mostrá-la já foi cumprida no instante em que ela começou.
      sessionStorage.setItem(INTRO_SESSION_KEY, '1');
      document.body.style.overflow = 'hidden';

      split = new SplitText(wordEl, { type: 'lines,chars', linesClass: 'line-mask' });
      gsap.set(split.chars, { yPercent: 110, opacity: 0 });
      gsap.set(wordEl, { opacity: 1 });

      const tl = gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = '';
          setupPhaseB();
        },
      });

      // Orçamento de duração da Fase A: ≤1.6s desktop / ≤1.1s mobile
      // (critério de aceite) — cada etapa abaixo foi somada à mão para
      // garantir que a timeline inteira (rects + wordmark + hint, com as
      // sobreposições) nunca estoure esse teto.
      const rectDuration = isMobile ? 0.3 : 0.4;
      const rectStagger = isMobile ? 0.006 : STAGGER.modules;
      const wordDuration = isMobile ? 0.45 : 0.6;
      const wordStagger = isMobile ? 0.02 : 0.025;
      const hintDuration = isMobile ? 0.3 : 0.4;

      // 1. Os 48 módulos se montam em ordem aleatória — materialização do
      // glifo, não leitura de progresso (from:"start" leria como
      // carregamento sequencial).
      tl.to(rects, {
        scale: 1,
        opacity: 1,
        duration: rectDuration,
        ease: EASE.back,
        stagger: { each: rectStagger, from: 'random' },
      });

      // 2. Wordmark revela por caracteres com máscara — sobreposto ao fim
      // da montagem do logo pra não sentir como fila.
      tl.to(
        split.chars,
        {
          yPercent: 0,
          opacity: 1,
          duration: wordDuration,
          ease: EASE.expo,
          stagger: wordStagger,
        },
        isMobile ? '-=0.2' : '-=0.35'
      );

      // 3. Indicador de scroll.
      tl.to(hintEl, { opacity: 1, y: 0, duration: hintDuration, ease: EASE.out }, isMobile ? '-=0.15' : '-=0.25');
    };

    const timeout = new Promise<void>((resolve) => window.setTimeout(resolve, MAX_FONT_WAIT_MS));
    Promise.race([document.fonts.ready.then(() => undefined), timeout]).then(runPhaseA);

    return () => {
      cancelled = true;
      document.body.style.overflow = '';
      phaseBTween?.scrollTrigger?.kill();
      phaseBTween?.kill();
      split?.revert();
    };
  }, [reducedMotion]);

  if (reducedMotion || hasSeenIntro()) return null;

  return (
    <div ref={spacerRef} className="relative h-[100svh]" aria-hidden="true">
      <div
        ref={introRef}
        className="pointer-events-none fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-black-dark"
      >
        <div className="flex flex-col items-center gap-6">
          <Logo ref={logoRef} size={200} color="green" />
          <div ref={wordRef} className="overflow-hidden">
            <span className="font-display font-normal text-3xl sm:text-4xl text-white">DevClub</span>
          </div>
        </div>

        <div ref={hintRef} className="absolute bottom-10 flex flex-col items-center gap-2 text-gray-300">
          <span className="font-mono text-xs uppercase tracking-widest">role para entrar_</span>
          <span className="h-6 w-px bg-green-normal animate-intro-hint" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
