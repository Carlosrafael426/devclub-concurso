import { useLayoutEffect, useRef } from 'react';
import { gsap } from '../../lib/gsap';
import { DURATION, EASE } from '../../lib/motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const MAX_FONT_WAIT_MS = 1500;
const MATRIX_HOLD_MS = 5000;
const FONT_SIZE = 18;

// Mesmos tokens de --green-normal/--green-light/--purple-light em RGB —
// canvas não lê custom property CSS diretamente, por isso o valor cru aqui.
const GREEN_NORMAL: [number, number, number] = [57, 211, 83];
const GREEN_LIGHT: [number, number, number] = [91, 241, 117];
const PURPLE_LIGHT: [number, number, number] = [152, 75, 255];
const CHARS = '01{}<>/;:=+*#$%ABCDEFXYZ';

/**
 * Intro cinematográfica: chuva de código estilo Matrix cobrindo a tela
 * inteira, com "DevClub" em destaque no centro. Roda em TODO carregamento
 * de página, só desligada por `prefers-reduced-motion`. Dura ~5s
 * (MATRIX_HOLD_MS) e então revela o site com o mesmo crossfade de sempre
 * (overlay e site se dissolvem em paralelo, não um corte seco).
 *
 * O texto central não precisa de nenhuma lógica de "buraco" no algoritmo
 * da chuva: o wrapper ao redor dele tem um fundo em radial-gradient (mesma
 * técnica de vinheta do Hero/Stacks) do tamanho do próprio texto+padding
 * — cresce e encolhe com o texto automaticamente em qualquer breakpoint,
 * em vez de uma área fixa em % de viewport que desalinharia em telas
 * muito estreitas ou muito largas.
 */
export function Intro() {
  const reducedMotion = useReducedMotion();
  const introRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wordRef = useRef<HTMLSpanElement | null>(null);

  useLayoutEffect(() => {
    if (reducedMotion) return;

    const intro = introRef.current;
    const canvas = canvasRef.current;
    const wordEl = wordRef.current;
    if (!intro || !canvas || !wordEl) return;

    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) return;

    let cancelled = false;
    let raf = 0;
    let holdTimeout = 0;
    let revealTween: gsap.core.Timeline | null = null;
    let width = 0;
    let height = 0;
    let columns = 0;
    let drops: number[] = [];

    // Escondido de forma síncrona (useLayoutEffect, antes do primeiro
    // paint) — sem isto haveria um frame com o texto visível na fonte de
    // fallback antes do gate de fontes resolver.
    gsap.set(wordEl, { opacity: 0, scale: 0.92 });

    // Trava o scroll real assim que a intro monta — libera só quando a
    // revelação do site terminar.
    document.body.style.overflow = 'hidden';

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvasCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      columns = Math.ceil(width / FONT_SIZE);
      // Início espalhado (negativo e aleatório): sem isso todas as colunas
      // nasceriam alinhadas no topo e cairiam em uníssono.
      drops = Array.from({ length: columns }, () => Math.random() * -40);
    };

    const pickColor = () => {
      const roll = Math.random();
      if (roll > 0.97) return 'rgb(255,255,255)';
      if (roll > 0.9) return `rgb(${PURPLE_LIGHT.join(',')})`;
      if (roll > 0.5) return `rgb(${GREEN_LIGHT.join(',')})`;
      return `rgb(${GREEN_NORMAL.join(',')})`;
    };

    // Chuva de código clássica: em vez de limpar o canvas a cada frame, um
    // retângulo preto quase opaco cria o rastro (os caracteres da rodada
    // anterior desbotam aos poucos); cada coluna solta um caractere novo
    // na "cabeça" e avança, reiniciando aleatoriamente ao sair da tela.
    const tick = () => {
      canvasCtx.fillStyle = 'rgba(17, 16, 18, 0.085)';
      canvasCtx.fillRect(0, 0, width, height);
      canvasCtx.font = `${FONT_SIZE}px "JetBrains Mono", ui-monospace, monospace`;
      canvasCtx.textBaseline = 'top';

      for (let i = 0; i < columns; i++) {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        const x = i * FONT_SIZE;
        const y = drops[i] * FONT_SIZE;
        canvasCtx.fillStyle = pickColor();
        canvasCtx.fillText(char, x, y);
        drops[i] += 1;
        if (y > height && Math.random() > 0.975) drops[i] = 0;
      }
      raf = requestAnimationFrame(tick);
    };

    // Revelação: site emerge enquanto o overlay se dissolve em paralelo
    // (não um corte seco) — mesmo crossfade já validado nesta intro.
    const revealSite = () => {
      if (cancelled) return;
      const site = document.getElementById('site');
      const navLogo = document.getElementById('nav-logo-icon');

      const tl = gsap.timeline({
        defaults: { ease: EASE.out },
        onComplete: () => {
          document.body.style.overflow = '';
          cancelAnimationFrame(raf);
        },
      });

      tl.to(wordEl, { opacity: 0, scale: 1.05, duration: 0.5 }, 0);
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
            // pra descendentes position:fixed, e o Navbar (fixed, dentro
            // de #site) passaria a "rolar junto" com a página em vez de
            // ficar travado no viewport.
            clearProps: 'transform',
          },
          0.1
        );
      }
      if (navLogo) {
        tl.fromTo(navLogo, { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.3);
      }
      tl.to(intro, { opacity: 0, duration: 0.7 }, 0.15);

      revealTween = tl;
    };

    const startMatrix = () => {
      if (cancelled) return;
      resize();
      tick();
      gsap.to(wordEl, { opacity: 1, scale: 1, duration: DURATION.reveal, delay: 0.3, ease: EASE.out });
      holdTimeout = window.setTimeout(revealSite, MATRIX_HOLD_MS);
    };

    window.addEventListener('resize', resize);

    const timeout = new Promise<void>((resolve) => window.setTimeout(resolve, MAX_FONT_WAIT_MS));
    Promise.race([document.fonts.ready.then(() => undefined), timeout]).then(startMatrix);

    return () => {
      cancelled = true;
      document.body.style.overflow = '';
      window.removeEventListener('resize', resize);
      window.clearTimeout(holdTimeout);
      cancelAnimationFrame(raf);
      revealTween?.kill();
    };
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return (
    <div
      ref={introRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[100] bg-black-dark"
    >
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="relative px-16 py-10 sm:px-24 sm:py-14"
          style={{
            background:
              'radial-gradient(ellipse 60% 60% at 50% 50%, var(--black-dark) 0%, var(--black-dark) 62%, transparent 100%)',
          }}
        >
          <span
            ref={wordRef}
            className="relative block font-display font-normal text-white text-[clamp(2.75rem,9vw,7rem)] tracking-wide"
          >
            DevClub
          </span>
        </div>
      </div>
    </div>
  );
}
