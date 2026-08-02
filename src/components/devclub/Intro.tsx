import { useLayoutEffect, useRef } from 'react';
import { gsap, SplitText } from '../../lib/gsap';
import { EASE, STAGGER, DISTANCE } from '../../lib/motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { Logo } from '../ui/Logo';

const MAX_FONT_WAIT_MS = 1500;

/**
 * Intro cinematográfica: roda em TODO carregamento/recarregamento de
 * página, só desligada por `prefers-reduced-motion`. A Fase B NÃO é mais
 * amarrada a uma posição de scroll (scrub) — ela dispara uma única vez no
 * primeiro gesto de rolagem/toque/tecla do usuário e toca como uma
 * animação de duração fixa. É essa mudança que garante que a intro nunca
 * "volte": não existe mais nenhum vínculo scroll-progresso↔timeline pra
 * rolar pra trás. `overflow:hidden` no body cobre a espera pelo gesto +
 * a própria Fase B inteira, então quando ela libera o scroll o documento
 * já está exatamente no topo — sem spacer nenhum reservando distância de
 * rolagem (o que também elimina de raiz a classe de bug de "espaço morto"
 * que a versão anterior (spacer + scrub) podia introduzir).
 *
 * Ao carregar, só o logo (módulos se montando em ordem aleatória —
 * materialização, não barra de progresso) e o wordmark abaixo dele. No
 * primeiro scroll/toque/tecla, uma única camada de profundidade: o logo
 * recua (escala para baixo + blur, nunca para cima — "câmera atravessando"
 * seria enérgico mas desorientador) enquanto o site emerge por trás.
 */
export function Intro() {
  const reducedMotion = useReducedMotion();
  const introRef = useRef<HTMLDivElement | null>(null);
  const logoRef = useRef<SVGSVGElement | null>(null);
  const wordRef = useRef<HTMLDivElement | null>(null);
  const hintRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (reducedMotion) return;

    const intro = introRef.current;
    const logoSvg = logoRef.current;
    const wordEl = wordRef.current;
    const hintEl = hintRef.current;
    if (!intro || !logoSvg || !wordEl || !hintEl) return;

    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    const rects = logoSvg.querySelectorAll('rect');

    let phaseBTween: gsap.core.Timeline | null = null;
    let split: SplitText | null = null;
    let cancelled = false;
    let phaseBStarted = false;

    // Estado inicial escondido, aplicado de forma síncrona (useLayoutEffect,
    // antes do primeiro paint) — sem isto haveria um frame com tudo visível
    // antes do gate de fontes resolver.
    gsap.set(rects, { scale: 0, opacity: 0, transformOrigin: 'center' });
    gsap.set(wordEl, { opacity: 0 });
    gsap.set(hintEl, { opacity: 0, y: DISTANCE.sm });

    // Trava o scroll real assim que a intro monta — libera só quando a
    // Fase B (disparada pelo gesto do usuário) terminar. Sem isso o
    // usuário poderia rolar o site de verdade por baixo do overlay antes
    // mesmo da Fase A terminar.
    document.body.style.overflow = 'hidden';

    const onGesture = () => runPhaseB();
    const onKeyGesture = (event: KeyboardEvent) => {
      if ([' ', 'ArrowDown', 'PageDown', 'Enter'].includes(event.key)) runPhaseB();
    };

    const removeGestureListeners = () => {
      window.removeEventListener('wheel', onGesture);
      window.removeEventListener('touchstart', onGesture);
      window.removeEventListener('keydown', onKeyGesture);
    };

    // Fase B: dispara uma única vez (primeiro gesto), toca como timeline
    // de duração fixa — não redesenha em função de scroll, então não tem
    // como "voltar" rolando pra cima depois de terminar.
    const runPhaseB = () => {
      if (cancelled || phaseBStarted) return;
      phaseBStarted = true;
      removeGestureListeners();

      const site = document.getElementById('site');
      const navLogo = document.getElementById('nav-logo-icon');

      const tl = gsap.timeline({
        defaults: { ease: EASE.out },
        onComplete: () => {
          document.body.style.overflow = '';
        },
      });

      tl.to(hintEl, { opacity: 0, y: DISTANCE.sm, duration: 0.2 }, 0);
      tl.to(wordEl, { opacity: 0, y: -DISTANCE.md, duration: 0.35 }, 0);
      tl.to(
        logoSvg,
        { scale: 0.28, opacity: 0, filter: isMobile ? 'none' : 'blur(6px)', duration: 0.65 },
        0.05
      );
      if (site) {
        tl.fromTo(
          site,
          { opacity: 0, scale: 0.92, y: 40 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.75,
            // Sem isso o GSAP deixa `transform: matrix(...)` (mesmo em
            // identidade) como inline style pro resto da sessão — qualquer
            // valor de transform diferente de "none" vira containing block
            // pra descendentes position:fixed, e o Navbar (fixed, dentro de
            // #site) passaria a "rolar junto" com a página em vez de ficar
            // travado no viewport.
            clearProps: 'transform',
          },
          0.15
        );
      }
      if (navLogo) {
        tl.fromTo(navLogo, { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.35);
      }
      // O overlay começa a sumir quase junto com o site emergindo (0.2, não
      // lá no fim) — as duas animações correm em paralelo por quase toda a
      // duração, então o site "atravessa" o overlay conforme ele se
      // dissolve, em vez de ficar escondido atrás de um preto sólido até um
      // corte seco no fim.
      tl.to(intro, { opacity: 0, duration: 0.7 }, 0.2);

      phaseBTween = tl;
    };

    const runPhaseA = () => {
      if (cancelled) return;

      split = new SplitText(wordEl, { type: 'lines,chars', linesClass: 'line-mask' });
      gsap.set(split.chars, { yPercent: 110, opacity: 0 });
      gsap.set(wordEl, { opacity: 1 });

      const tl = gsap.timeline({
        onComplete: () => {
          // Só a partir daqui o primeiro gesto do usuário pode revelar o
          // site — antes disso, rolar/tocar não faz nada.
          window.addEventListener('wheel', onGesture, { passive: true });
          window.addEventListener('touchstart', onGesture, { passive: true });
          window.addEventListener('keydown', onKeyGesture);
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
      removeGestureListeners();
      phaseBTween?.kill();
      split?.revert();
    };
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return (
    <div
      ref={introRef}
      aria-hidden="true"
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
  );
}
