import { useEffect, useRef, type FC } from 'react';

export type Hue = 'green' | 'purple' | 'purpleLight';

const HUE_RGB: Record<Hue, string> = {
  green: '57, 211, 83',
  purple: '133, 50, 242',
  purpleLight: '152, 75, 255',
};

/**
 * Zona = uma seção da página (por id do <section>). Cada zona tem sua
 * própria densidade/velocidade/paleta, mas todas usam o mesmo motor visual
 * (nós + linhas) do Hero — são "eco", nunca cópias soltas.
 *
 * "hero" mantém a densidade e a interatividade de mouse originais; as
 * demais são deliberadamente mais esparsas e lentas para não competir com
 * o conteúdo.
 */
interface ZoneConfig {
  sectionId: string;
  density: number;
  hues: Hue[];
  linkDistance: number;
  nodeOpacity: number;
  linkOpacity: number;
  speed: number;
  interactive?: boolean;
  driftBias?: 'omni' | 'horizontal';
}

const ZONES: ZoneConfig[] = [
  { sectionId: 'hero', density: 46, hues: ['green', 'purple', 'purpleLight'], linkDistance: 150, nodeOpacity: 0.9, linkOpacity: 0.35, speed: 1, interactive: true },
  { sectionId: 'formacoes', density: 16, hues: ['green', 'purple'], linkDistance: 130, nodeOpacity: 0.55, linkOpacity: 0.2, speed: 0.4 },
  { sectionId: 'alunos', density: 10, hues: ['green'], linkDistance: 110, nodeOpacity: 0.45, linkOpacity: 0.16, speed: 0.3 },
  { sectionId: 'empresas', density: 12, hues: ['purple', 'purpleLight'], linkDistance: 120, nodeOpacity: 0.5, linkOpacity: 0.18, speed: 0.5, driftBias: 'horizontal' },
  { sectionId: 'equipe', density: 12, hues: ['green', 'purpleLight'], linkDistance: 130, nodeOpacity: 0.5, linkOpacity: 0.18, speed: 0.35 },
  { sectionId: 'inscricao', density: 20, hues: ['green', 'purple', 'purpleLight'], linkDistance: 150, nodeOpacity: 0.65, linkOpacity: 0.26, speed: 0.55 },
];

const MOUSE_RADIUS = 170;

// --- Ajustes de intensidade dos pulsos viajantes -----------------------
// Menos pulsos / mais espaçados = MAX_PULSES menor e SPAWN_INTERVAL maior.
const MAX_PULSES_DESKTOP = 6;
const MAX_PULSES_MOBILE = 3;
const SPAWN_INTERVAL_MIN = 550;
const SPAWN_INTERVAL_MAX = 1200;
const PULSE_SPEED_MIN = 0.006;
const PULSE_SPEED_MAX = 0.016;
const CHAIN_PROBABILITY = 0.55;
const FLASH_DURATION_MS = 280;
// ------------------------------------------------------------------------

interface NetworkNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hue: Hue;
  minY: number;
  maxY: number;
  linkDistance: number;
  nodeOpacity: number;
  linkOpacity: number;
  interactive: boolean;
}

interface ActiveLink {
  a: NetworkNode;
  b: NetworkNode;
}

interface Pulse {
  from: NetworkNode;
  to: NetworkNode;
  progress: number;
  speed: number;
  hue: Hue;
}

interface Flash {
  node: NetworkNode;
  age: number;
  hue: Hue;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

/**
 * NetworkBackground
 * Única rede de nós conectados por linhas cobrindo a página inteira — a
 * mesma técnica que já existia isolada no Hero (canvas 2D, física simples
 * de partículas, paleta verde/roxo da marca), agora compartilhada por
 * todas as seções via "zonas" de densidade, mais a animação de pulso
 * viajante percorrendo as conexões (efeito "sinal se propagando").
 *
 * Arquitetura: um único <canvas> absoluto cobrindo do topo ao fim do
 * documento, montado uma vez em App.tsx atrás de tudo — não um canvas por
 * seção. Isso evita N loops de animação simultâneos e permite que os
 * pulsos viajem livremente entre seções vizinhas.
 */
export const NetworkBackground: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let width = 0;
    let height = 0;
    let nodes: NetworkNode[] = [];
    let activeLinks: ActiveLink[] = [];
    let pulses: Pulse[] = [];
    let flashes: Flash[] = [];
    let nextSpawnAt = 0;
    let animationFrameId = 0;
    let isRunning = false;

    const mouse = { x: -9999, y: -9999, active: false };

    const isMobile = () => width < 640;
    const maxPulses = () => (isMobile() ? MAX_PULSES_MOBILE : MAX_PULSES_DESKTOP);
    const spawnIntervalScale = () => (isMobile() ? 1.8 : 1);

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

    const createNodes = () => {
      const measured = measureZones();
      const mobile = isMobile();
      const next: NetworkNode[] = [];

      for (const { zone, top, height } of measured) {
        const count = Math.max(4, Math.round(zone.density * (mobile ? 0.5 : 1)));
        const verticalDamp = zone.driftBias === 'horizontal' ? 0.35 : 1;

        for (let i = 0; i < count; i += 1) {
          next.push({
            x: Math.random() * width,
            y: top + Math.random() * height,
            vx: (Math.random() - 0.5) * 0.16 * zone.speed,
            vy: (Math.random() - 0.5) * 0.16 * zone.speed * verticalDamp,
            radius: Math.random() * 1.6 + 1,
            hue: zone.hues[Math.floor(Math.random() * zone.hues.length)],
            minY: top,
            maxY: top + height,
            linkDistance: zone.linkDistance,
            nodeOpacity: zone.nodeOpacity,
            linkOpacity: zone.linkOpacity,
            interactive: !!zone.interactive,
          });
        }
      }

      nodes = next;
      pulses = [];
      flashes = [];
      nextSpawnAt = performance.now() + randomBetween(SPAWN_INTERVAL_MIN, SPAWN_INTERVAL_MAX);
    };

    const resize = () => {
      width = window.innerWidth;
      height = Math.max(document.documentElement.scrollHeight, window.innerHeight);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      createNodes();
    };

    const handlePointerMove = (event: PointerEvent) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY + window.scrollY;
      mouse.active = true;
    };

    const handlePointerLeaveDoc = () => {
      mouse.active = false;
    };

    const trySpawnPulse = (now: number) => {
      if (now < nextSpawnAt) return;
      nextSpawnAt = now + randomBetween(SPAWN_INTERVAL_MIN, SPAWN_INTERVAL_MAX) * spawnIntervalScale();

      if (activeLinks.length === 0 || pulses.length >= maxPulses()) return;

      const link = activeLinks[Math.floor(Math.random() * activeLinks.length)];
      const forward = Math.random() < 0.5;
      const from = forward ? link.a : link.b;
      const to = forward ? link.b : link.a;

      pulses.push({
        from,
        to,
        progress: 0,
        speed: randomBetween(PULSE_SPEED_MIN, PULSE_SPEED_MAX),
        hue: to.hue,
      });
    };

    const chainPulseFrom = (origin: NetworkNode, cameFrom: NetworkNode) => {
      if (pulses.length >= maxPulses()) return;
      if (Math.random() > CHAIN_PROBABILITY) return;

      const candidates = activeLinks
        .filter((link) => link.a === origin || link.b === origin)
        .map((link) => (link.a === origin ? link.b : link.a))
        .filter((candidate) => candidate !== cameFrom);

      if (candidates.length === 0) return;

      const to = candidates[Math.floor(Math.random() * candidates.length)];
      pulses.push({
        from: origin,
        to,
        progress: 0,
        speed: randomBetween(PULSE_SPEED_MIN, PULSE_SPEED_MAX),
        hue: to.hue,
      });
    };

    const drawFrame = (deltaMs: number) => {
      ctx.clearRect(0, 0, width, height);

      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < node.minY || node.y > node.maxY) node.vy *= -1;

        if (node.interactive && mouse.active) {
          const dx = node.x - mouse.x;
          const dy = node.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < MOUSE_RADIUS && dist > 0.01) {
            const force = (1 - dist / MOUSE_RADIUS) * 0.03;
            node.vx += (dx / dist) * force;
            node.vy += (dy / dist) * force;
          }
        }
      }

      activeLinks = [];
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
            activeLinks.push({ a, b });
          }
        }
      }

      for (const node of nodes) {
        ctx.beginPath();
        ctx.fillStyle = `rgba(${HUE_RGB[node.hue]}, ${node.nodeOpacity})`;
        ctx.shadowColor = `rgba(${HUE_RGB[node.hue]}, ${(node.nodeOpacity * 0.7).toFixed(3)})`;
        ctx.shadowBlur = node.interactive ? 8 : 6;
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // Pulsos viajantes: percorrem exatamente o traçado from -> to,
      // recalculado a cada frame (segue os nós mesmo que eles derivem).
      const now = performance.now();
      trySpawnPulse(now);

      for (let i = pulses.length - 1; i >= 0; i -= 1) {
        const pulse = pulses[i];
        pulse.progress = Math.min(1, pulse.progress + pulse.speed);

        const headX = lerp(pulse.from.x, pulse.to.x, pulse.progress);
        const headY = lerp(pulse.from.y, pulse.to.y, pulse.progress);
        const tailT = Math.max(0, pulse.progress - 0.08);
        const tailX = lerp(pulse.from.x, pulse.to.x, tailT);
        const tailY = lerp(pulse.from.y, pulse.to.y, tailT);

        ctx.strokeStyle = `rgba(${HUE_RGB[pulse.hue]}, 0.6)`;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(headX, headY);
        ctx.stroke();

        ctx.beginPath();
        ctx.fillStyle = `rgba(${HUE_RGB[pulse.hue]}, 0.95)`;
        ctx.shadowColor = `rgba(${HUE_RGB[pulse.hue]}, 0.9)`;
        ctx.shadowBlur = 12;
        ctx.arc(headX, headY, 2.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        if (pulse.progress >= 1) {
          flashes.push({ node: pulse.to, age: 0, hue: pulse.hue });
          chainPulseFrom(pulse.to, pulse.from);
          pulses.splice(i, 1);
        }
      }

      // Flash de chegada: anel que se expande e some no nó de destino.
      for (let i = flashes.length - 1; i >= 0; i -= 1) {
        const flash = flashes[i];
        flash.age += deltaMs;
        const t = Math.min(1, flash.age / FLASH_DURATION_MS);
        const ringRadius = lerp(3, 16, t);
        const ringOpacity = (1 - t) * 0.8;

        ctx.beginPath();
        ctx.strokeStyle = `rgba(${HUE_RGB[flash.hue]}, ${ringOpacity.toFixed(3)})`;
        ctx.lineWidth = 1.5;
        ctx.arc(flash.node.x, flash.node.y, ringRadius, 0, Math.PI * 2);
        ctx.stroke();

        if (flash.age >= FLASH_DURATION_MS) {
          flashes.splice(i, 1);
        }
      }
    };

    let lastTimestamp = 0;
    const loop = (timestamp: number) => {
      const deltaMs = lastTimestamp ? timestamp - lastTimestamp : 16;
      lastTimestamp = timestamp;
      drawFrame(deltaMs);
      animationFrameId = window.requestAnimationFrame(loop);
    };

    const start = () => {
      if (isRunning || prefersReducedMotion) return;
      isRunning = true;
      lastTimestamp = 0;
      animationFrameId = window.requestAnimationFrame(loop);
    };

    const stop = () => {
      isRunning = false;
      window.cancelAnimationFrame(animationFrameId);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    };

    resize();
    drawFrame(16);

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', handlePointerMove);
    document.documentElement.addEventListener('mouseleave', handlePointerLeaveDoc);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Recalcula zonas após o primeiro layout estabilizar (fontes/imagens
    // podem alterar a altura das seções logo após o mount).
    const settleTimeout = window.setTimeout(resize, 400);

    start();

    return () => {
      stop();
      window.clearTimeout(settleTimeout);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointerMove);
      document.documentElement.removeEventListener('mouseleave', handlePointerLeaveDoc);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
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
