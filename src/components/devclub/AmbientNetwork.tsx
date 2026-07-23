import { useEffect, useRef, type FC } from 'react';

export type Hue = 'green' | 'purple' | 'purpleLight';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hue: Hue;
}

const HUE_RGB: Record<Hue, string> = {
  green: '57, 211, 83',
  purple: '133, 50, 242',
  purpleLight: '152, 75, 255',
};

interface AmbientNetworkProps {
  /** Número de nós em telas desktop (reduzido automaticamente em mobile). */
  density?: number;
  /** Multiplicador de velocidade — 1 equivale à velocidade base do Hero. */
  speed?: number;
  linkDistance?: number;
  hues?: Hue[];
  nodeOpacity?: number;
  linkOpacity?: number;
  /** 'horizontal' achata o deslocamento vertical, para seções em faixa. */
  driftBias?: 'omni' | 'horizontal';
  className?: string;
}

/**
 * AmbientNetwork
 * Eco discreto da rede de nós do HeroBackground: mesma técnica (canvas 2D,
 * nós conectados por linhas, paleta verde/roxo da marca), porém sem
 * interação de mouse, bem mais esparsa e lenta — pensada como continuação
 * do universo visual do Hero, nunca competindo com ele em destaque.
 *
 * Só anima enquanto a seção-pai está visível (IntersectionObserver) e
 * respeita prefers-reduced-motion, desenhando um único frame estático.
 */
export const AmbientNetwork: FC<AmbientNetworkProps> = ({
  density = 14,
  speed = 0.4,
  linkDistance = 130,
  hues = ['green', 'purple'],
  nodeOpacity = 0.55,
  linkOpacity = 0.2,
  driftBias = 'omni',
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const section = canvas.parentElement;
    if (!section) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const verticalDamp = driftBias === 'horizontal' ? 0.35 : 1;

    let width = 0;
    let height = 0;
    let nodes: Node[] = [];
    let animationFrameId = 0;
    let isRunning = false;

    const createNodes = () => {
      const isMobile = width < 640;
      const count = Math.max(6, Math.round(density * (isMobile ? 0.5 : 1)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.16 * speed,
        vy: (Math.random() - 0.5) * 0.16 * speed * verticalDamp,
        radius: Math.random() * 1.4 + 1,
        hue: hues[Math.floor(Math.random() * hues.length)],
      }));
    };

    const resize = () => {
      const rect = section.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      createNodes();
    };

    const drawFrame = () => {
      ctx.clearRect(0, 0, width, height);

      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;
      }

      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < linkDistance) {
            const opacity = (1 - dist / linkDistance) * linkOpacity;
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
        ctx.fillStyle = `rgba(${HUE_RGB[node.hue]}, ${nodeOpacity})`;
        ctx.shadowColor = `rgba(${HUE_RGB[node.hue]}, ${(nodeOpacity * 0.7).toFixed(3)})`;
        ctx.shadowBlur = 6;
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    };

    const loop = () => {
      drawFrame();
      animationFrameId = window.requestAnimationFrame(loop);
    };

    const start = () => {
      if (isRunning || prefersReducedMotion) return;
      isRunning = true;
      animationFrameId = window.requestAnimationFrame(loop);
    };

    const stop = () => {
      isRunning = false;
      window.cancelAnimationFrame(animationFrameId);
    };

    resize();
    drawFrame();
    window.addEventListener('resize', resize);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          start();
        } else {
          stop();
        }
      },
      { rootMargin: '150px 0px' }
    );
    observer.observe(section);

    return () => {
      stop();
      observer.disconnect();
      window.removeEventListener('resize', resize);
    };
  }, [density, speed, linkDistance, hues, nodeOpacity, linkOpacity, driftBias]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 z-0 ${className ?? ''}`.trim()}
      aria-hidden="true"
    />
  );
};
