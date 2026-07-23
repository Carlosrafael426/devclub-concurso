import { useEffect, useRef, type FC } from 'react';

// Caracteres candidatos ao "ruído": binário em peso maior + símbolos de
// código, para reforçar a leitura de "dados/código" dentro das letras.
const CHARS = '01010101010101{}<>/;:=+*#$%ABCDXY';

interface MatrixTextRevealProps {
  text?: string;
  /** Opacidade do badge — alta por padrão, já que é um elemento visível da página, não uma textura de fundo. */
  opacity?: number;
  /** Intervalo entre trocas de caractere, em ms. Maior = mais lento/mais leve. */
  updateIntervalMs?: number;
  /** Classes de posicionamento (top/left/transform/z-index) aplicadas pelo componente-pai. */
  className?: string;
}

/**
 * MatrixTextReveal
 * Badge flutuante com "DEVCLUB" formado por caracteres aleatórios (binário +
 * símbolos de código) que se acumulam dentro do contorno das letras (canvas
 * destination-in sobre uma máscara em cache), preenchido com o mesmo
 * gradiente verde → verde-claro → roxo do texto animado do H1 do Hero. Em
 * vez de limpar o canvas a cada troca, usa um "rastro" (fillRect quase
 * transparente) para o efeito clássico de chuva de código acumulando —
 * mesma técnica do exemplo de referência do estilo Matrix.
 */
export const MatrixTextReveal: FC<MatrixTextRevealProps> = ({
  text = 'DEVCLUB',
  opacity = 0.92,
  updateIntervalMs = 90,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const container = canvas.parentElement;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const CELL = 11;
    // Quanto do rastro anterior é apagado a cada troca — menor = mais
    // "acúmulo"/glitch persistente, maior = mais limpo/imediato.
    const TRAIL_FADE = 0.22;

    // Lê as cores direto dos tokens do @theme (index.css) em vez de
    // hardcodar hex novos — mesmo gradiente do "dev full stack" do H1.
    const rootStyles = getComputedStyle(document.documentElement);
    const colorGreen = rootStyles.getPropertyValue('--color-brand-green').trim() || '#39D353';
    const colorGreenLight = rootStyles.getPropertyValue('--color-brand-green-light').trim() || '#5BF175';
    const colorPurple = rootStyles.getPropertyValue('--color-brand-purple').trim() || '#8532F2';

    // Máscara em cache (offscreen): o contorno de "DEVCLUB" em branco
    // sólido, redesenhado só quando o tamanho muda — não a cada troca de
    // caractere.
    const mask = document.createElement('canvas');
    const mctx = mask.getContext('2d');

    let width = 0;
    let height = 0;
    let fontSize = 60;
    let box = { x: 0, y: 0, w: 0, h: 0 };
    let timeoutId = 0;
    let isRunning = false;

    const fitText = () => {
      ctx.font = `bold 100px "Aldrich", sans-serif`;
      const measured = ctx.measureText(text).width || 1;
      const target = width * 0.82;
      fontSize = Math.max(26, Math.min(150, 100 * (target / measured)));

      ctx.font = `bold ${fontSize}px "Aldrich", sans-serif`;
      const textWidth = ctx.measureText(text).width;
      box = {
        x: (width - textWidth) / 2 - CELL,
        y: height / 2 - fontSize * 0.65,
        w: textWidth + CELL * 2,
        h: fontSize * 1.3,
      };

      if (mctx) {
        mask.width = canvas.width;
        mask.height = canvas.height;
        mctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        mctx.clearRect(0, 0, width, height);
        mctx.font = `bold ${fontSize}px "Aldrich", sans-serif`;
        mctx.textAlign = 'center';
        mctx.textBaseline = 'middle';
        mctx.fillStyle = '#fff';
        mctx.fillText(text, width / 2, height / 2);
      }
    };

    const resize = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fitText();
    };

    const buildGradient = () => {
      const gradient = ctx.createLinearGradient(box.x, 0, box.x + box.w, 0);
      gradient.addColorStop(0, colorGreen);
      gradient.addColorStop(0.5, colorGreenLight);
      gradient.addColorStop(1, colorPurple);
      return gradient;
    };

    const drawStaticText = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.font = `bold ${fontSize}px "Aldrich", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = buildGradient();
      ctx.shadowColor = colorGreen;
      ctx.shadowBlur = 10;
      ctx.fillText(text, width / 2, height / 2);
      ctx.shadowBlur = 0;
    };

    const drawNoiseFrame = () => {
      // Rastro: em vez de limpar tudo, apaga só uma fração — os
      // caracteres da rodada anterior desbotam aos poucos em vez de
      // sumirem de uma vez, dando o acúmulo típico do efeito Matrix.
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = `rgba(6, 6, 12, ${TRAIL_FADE})`;
      ctx.fillRect(0, 0, width, height);

      ctx.font = `bold ${CELL + 3}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const gradient = buildGradient();
      ctx.shadowBlur = 4;

      const cols = Math.ceil(box.w / CELL);
      const rows = Math.ceil(box.h / CELL);
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          if (Math.random() > 0.55) continue;
          const char = CHARS[Math.floor(Math.random() * CHARS.length)];
          const isHighlight = Math.random() > 0.9;
          ctx.fillStyle = isHighlight ? '#eafff2' : gradient;
          ctx.shadowColor = isHighlight ? '#eafff2' : colorGreen;
          ctx.globalAlpha = isHighlight ? 0.95 : 0.4 + Math.random() * 0.5;
          ctx.fillText(char, box.x + col * CELL + CELL / 2, box.y + row * CELL + CELL / 2);
        }
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      // Clipa tudo (rastro + ruído novo) para dentro do contorno das
      // letras, usando a máscara em cache em vez de redesenhar o texto.
      ctx.globalCompositeOperation = 'destination-in';
      ctx.drawImage(mask, 0, 0, width, height);
      ctx.globalCompositeOperation = 'source-over';
    };

    const tick = () => {
      drawNoiseFrame();
      timeoutId = window.setTimeout(tick, updateIntervalMs);
    };

    const start = () => {
      if (isRunning || prefersReducedMotion) return;
      isRunning = true;
      tick();
    };

    const stop = () => {
      isRunning = false;
      window.clearTimeout(timeoutId);
    };

    resize();
    if (prefersReducedMotion) {
      drawStaticText();
    } else {
      drawNoiseFrame();
    }

    // Refit depois que a fonte Aldrich (web font) terminar de carregar,
    // já que a primeira medição pode usar um fallback antes disso.
    document.fonts.ready.then(() => {
      resize();
      if (prefersReducedMotion) drawStaticText();
      else drawNoiseFrame();
    });

    window.addEventListener('resize', resize);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) start();
        else stop();
      },
      { threshold: 0 }
    );
    observer.observe(container);

    return () => {
      stop();
      observer.disconnect();
      window.removeEventListener('resize', resize);
    };
  }, [text, updateIntervalMs]);

  return (
    <div className={`relative w-64 h-20 sm:w-96 sm:h-28 pointer-events-none ${className ?? ''}`.trim()}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ opacity }}
        aria-hidden="true"
      />
    </div>
  );
};
