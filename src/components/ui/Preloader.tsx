import { useEffect, useRef, useState } from 'react';
import { gsap } from '../../lib/gsap';
import { DURATION, EASE } from '../../lib/motion';

const MIN_VISIBLE_MS = 500;
const MAX_WAIT_MS = 1200;

/**
 * Preloader com propósito duplo: garante que as fontes (Aldrich/Albert
 * Sans) estejam prontas antes do primeiro reveal com SplitText (evita
 * medir glifos com a fonte fallback, o que desalinha os caracteres) e
 * funciona como cortina de entrada — os reveals do Hero, que já disparam
 * quase instantaneamente por estarem no topo da página, terminam por trás
 * dela; o "reveal" que o usuário percebe é a cortina abrindo sobre uma
 * página já pronta, não um hero em branco animando depois. O progresso é
 * a fração real de fontes já carregadas via document.fonts, não um timer
 * decorativo.
 */
export function Preloader() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    const start = performance.now();

    const computeProgress = () => {
      const fonts = Array.from(document.fonts);
      if (fonts.length === 0) return 100;
      const loaded = fonts.filter((f) => f.status === 'loaded').length;
      return Math.round((loaded / fonts.length) * 100);
    };

    const tick = () => {
      if (cancelled) return;
      setProgress(computeProgress());
      if (performance.now() - start < MAX_WAIT_MS) {
        requestAnimationFrame(tick);
      }
    };
    tick();

    const timeout = new Promise<void>((resolve) => window.setTimeout(resolve, MAX_WAIT_MS));
    Promise.race([document.fonts.ready.then(() => undefined), timeout]).then(() => {
      if (cancelled) return;
      const elapsed = performance.now() - start;
      const remaining = Math.max(MIN_VISIBLE_MS - elapsed, 0);
      window.setTimeout(() => {
        if (cancelled) return;
        setProgress(100);
        const overlay = overlayRef.current;
        if (!overlay) {
          setVisible(false);
          return;
        }
        gsap.to(overlay, {
          opacity: 0,
          duration: DURATION.feature,
          ease: EASE.out,
          onComplete: () => setVisible(false),
        });
      }, remaining);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-4 bg-brand-bg"
      aria-hidden="true"
    >
      <span className="font-display font-extrabold text-2xl text-brand-green tracking-widest">DEVCLUB</span>
      <div className="h-[2px] w-40 overflow-hidden rounded-full bg-white/[0.08]">
        <div
          className="h-full bg-brand-green origin-left transition-transform duration-150 ease-out"
          style={{ transform: `scaleX(${progress / 100})` }}
        />
      </div>
    </div>
  );
}
