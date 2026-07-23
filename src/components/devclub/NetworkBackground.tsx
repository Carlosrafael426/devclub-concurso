import { useEffect, useRef, type FC } from 'react';

export type Hue = 'green' | 'purple' | 'purpleLight';

const HUE_RGB: Record<Hue, string> = {
  green: '57, 211, 83',
  purple: '133, 50, 242',
  purpleLight: '152, 75, 255',
};

/**
 * Zona = uma seção da página (por id do <section>). Cada zona tem sua
 * própria densidade/paleta, mas todas usam o mesmo motor visual (nós +
 * linhas) — são "eco" umas das outras, nunca elementos soltos.
 */
interface ZoneConfig {
  sectionId: string;
  density: number;
  hues: Hue[];
  linkDistance: number;
  nodeOpacity: number;
  linkOpacity: number;
}

const ZONES: ZoneConfig[] = [
  { sectionId: 'hero', density: 46, hues: ['green', 'purple', 'purpleLight'], linkDistance: 150, nodeOpacity: 0.9, linkOpacity: 0.35 },
  { sectionId: 'formacoes', density: 16, hues: ['green', 'purple'], linkDistance: 130, nodeOpacity: 0.55, linkOpacity: 0.2 },
  { sectionId: 'alunos', density: 10, hues: ['green'], linkDistance: 110, nodeOpacity: 0.45, linkOpacity: 0.16 },
  { sectionId: 'empresas', density: 12, hues: ['purple', 'purpleLight'], linkDistance: 120, nodeOpacity: 0.5, linkOpacity: 0.18 },
  { sectionId: 'equipe', density: 12, hues: ['green', 'purpleLight'], linkDistance: 130, nodeOpacity: 0.5, linkOpacity: 0.18 },
  { sectionId: 'inscricao', density: 20, hues: ['green', 'purple', 'purpleLight'], linkDistance: 150, nodeOpacity: 0.65, linkOpacity: 0.26 },
];

interface NetworkNode {
  x: number;
  y: number;
  radius: number;
  hue: Hue;
  linkDistance: number;
  nodeOpacity: number;
  linkOpacity: number;
}

/**
 * NetworkBackground
 * Rede de nós conectados por linhas cobrindo a página inteira — desenho
 * ESTÁTICO (sem requestAnimationFrame, sem movimento, sem interação de
 * mouse): renderiza uma vez e só refaz o desenho quando o layout muda de
 * verdade (resize da janela, fontes carregando, conteúdo mudando de
 * altura). Um único <canvas>, montado uma vez em App.tsx atrás de tudo.
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

    const isMobile = () => width < 640;

    const measureZones = () => {
      const scrollY = window.scrollY;
      return ZONES.map((zone) => {
        const el = document.getElementById(zone.sectionId);
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        return {
          zone,
          top: rect.top + scrollY,
          height: rect.height,
        };
      }).filter((entry): entry is { zone: ZoneConfig; top: number; height: number } => !!entry && entry.height > 0);
    };

    const createNodes = (): NetworkNode[] => {
      const measured = measureZones();
      const mobile = isMobile();
      const nodes: NetworkNode[] = [];

      for (const { zone, top, height: zoneHeight } of measured) {
        const count = Math.max(4, Math.round(zone.density * (mobile ? 0.5 : 1)));

        for (let i = 0; i < count; i += 1) {
          nodes.push({
            x: Math.random() * width,
            y: top + Math.random() * zoneHeight,
            radius: Math.random() * 1.6 + 1,
            hue: zone.hues[Math.floor(Math.random() * zone.hues.length)],
            linkDistance: zone.linkDistance,
            nodeOpacity: zone.nodeOpacity,
            linkOpacity: zone.linkOpacity,
          });
        }
      }

      return nodes;
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
          const linkDistance = Math.min(a.linkDistance, b.linkDistance);
          if (dist < linkDistance) {
            const opacity = (1 - dist / linkDistance) * a.linkOpacity;
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
        ctx.fillStyle = `rgba(${HUE_RGB[node.hue]}, ${node.nodeOpacity})`;
        ctx.shadowColor = `rgba(${HUE_RGB[node.hue]}, ${(node.nodeOpacity * 0.7).toFixed(3)})`;
        ctx.shadowBlur = 6;
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
