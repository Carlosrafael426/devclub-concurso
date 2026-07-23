import { useEffect, useRef, type FC } from 'react';

export type Hue = 'green' | 'purple' | 'purpleLight';

const HUE_RGB: Record<Hue, string> = {
  green: '57, 211, 83',
  purple: '133, 50, 242',
  purpleLight: '152, 75, 255',
};

const HUES: Hue[] = ['green', 'purple', 'purpleLight'];

// Mesmos parâmetros do HeroBackground original: 46 nós para a área de uma
// tela (viewport), linhas até 150px de distância, opacidades 0.9/0.35.
// Aplicados uniformemente na página inteira — nada de densidade "eco" por
// seção, é literalmente o mesmo padrão do Hero do início ao fim.
const HERO_DENSITY = 46;
const LINK_DISTANCE = 150;
const NODE_OPACITY = 0.9;
const LINK_OPACITY = 0.35;

interface NetworkNode {
  x: number;
  y: number;
  radius: number;
  hue: Hue;
}

/**
 * NetworkBackground
 * Rede de nós conectados por linhas cobrindo a página inteira, com o mesmo
 * padrão visual (densidade, cores, distância de conexão) do background
 * original do Hero — não uma versão diluída por seção. Desenho ESTÁTICO
 * (sem requestAnimationFrame, sem movimento, sem mouse): renderiza uma vez
 * e só refaz quando o layout muda de verdade (resize, fontes carregando,
 * conteúdo mudando de altura). Um único <canvas>, montado uma vez em
 * App.tsx atrás de tudo.
 */
export const NetworkBackground: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let width = 0;
    let height = 0;

    const createNodes = (): NetworkNode[] => {
      const mobile = width < 640;
      // Quantas "alturas de viewport" cabem no documento inteiro — mantém
      // a mesma densidade por área do Hero em vez de um total fixo.
      const heightRatio = height / Math.max(window.innerHeight, 1);
      const count = Math.max(30, Math.round(HERO_DENSITY * heightRatio * (mobile ? 0.5 : 1)));

      return Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.6 + 1,
        hue: HUES[Math.floor(Math.random() * HUES.length)],
      }));
    };

    const drawStatic = (nodes: NetworkNode[]) => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < LINK_DISTANCE) {
            const opacity = (1 - dist / LINK_DISTANCE) * LINK_OPACITY;
            ctx.strokeStyle = `rgba(${HUE_RGB[a.hue]}, ${opacity.toFixed(3)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (const node of nodes) {
        ctx.beginPath();
        ctx.fillStyle = `rgba(${HUE_RGB[node.hue]}, ${NODE_OPACITY})`;
        ctx.shadowColor = `rgba(${HUE_RGB[node.hue]}, ${(NODE_OPACITY * 0.7).toFixed(3)})`;
        ctx.shadowBlur = 8;
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    };

    const redraw = () => {
      width = window.innerWidth;
      height = Math.max(document.documentElement.scrollHeight, window.innerHeight);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawStatic(createNodes());
    };

    redraw();

    window.addEventListener('resize', redraw);
    window.addEventListener('load', redraw);

    // As fontes web (Aldrich/Albert Sans) podem trocar depois do primeiro
    // layout e mudar a altura dos títulos — sem isso, o desenho ficava
    // baseado numa altura de página desatualizada.
    document.fonts.ready.then(redraw).catch(() => {});

    // Reage a qualquer mudança de altura do documento (imagens carregando,
    // conteúdo dinâmico, etc.), não só uma vez no carregamento.
    let redrawRaf = 0;
    const scheduleRedraw = () => {
      window.cancelAnimationFrame(redrawRaf);
      redrawRaf = window.requestAnimationFrame(redraw);
    };
    const bodyObserver = new ResizeObserver(scheduleRedraw);
    bodyObserver.observe(document.body);

    return () => {
      window.cancelAnimationFrame(redrawRaf);
      bodyObserver.disconnect();
      window.removeEventListener('resize', redraw);
      window.removeEventListener('load', redraw);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-x-0 top-0 z-0"
      aria-hidden="true"
    />
  );
};
