import { useLayoutEffect, useRef, useState } from 'react';
import { BgNeural, GREEN, PURPLE, rgba } from '../../lib/bgNeural';
import { MENTORES } from './mentoresData';
import { Badge } from '../ui/Badge';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import './mentores.css';

// Cadeia (liga vizinhos em sequência) + "saltos" extras — forma um time em
// rede, não uma fila. Fixo para os 5 cartões desta formação (o próprio
// layout escalonado em CSS também é desenhado para exatamente 5).
const PAIRS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 2], [2, 4], [1, 3],
];

/**
 * Mentores — "formação de time" com 5 cartões em posições escalonadas
 * (CSS puro, ver mentores.css) ligados por uma rede de curvas (canvas) que
 * acende e ganha um pulso viajando quando um dos dois lados está em
 * hover/foco. Fundo em rede neural 3D (mesma engine do hero/stacks/
 * depoimentos/empresas).
 *
 * O reinício do "beam" (varredura que desce pela foto ao ativar um
 * cartão) usa uma key que muda a cada ativação — força o React a
 * desmontar/remontar o elemento, garantindo que a animação CSS sempre
 * recomece do zero mesmo reativando o mesmo cartão rapidamente.
 */
export default function Mentores() {
  const secRef = useRef<HTMLElement | null>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const linksCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const hotSinceRef = useRef(0);

  const [activeIndex, setActiveIndex] = useState(-1);
  const [activationTick, setActivationTick] = useState(0);
  const reduced = useReducedMotion();

  const activate = (i: number) => {
    setActiveIndex(i);
    setActivationTick((t) => t + 1);
    hotSinceRef.current = performance.now();
  };
  const deactivate = (i: number) => {
    setActiveIndex((cur) => (cur === i ? -1 : cur));
  };

  // Fundo: mesma rede neural do hero/stacks/depoimentos/empresas.
  useLayoutEffect(() => {
    const canvas = bgCanvasRef.current;
    const host = secRef.current;
    if (!canvas || !host) return;
    const bg = new BgNeural(canvas, host, { nodeCount: 72, edgeCap: 260, alpha: 0.46 });
    if (reduced) bg.renderStatic();
    else bg.start();
    return () => bg.destroy();
  }, [reduced]);

  // Rede de conexões: liga os cartões (posições medidas via
  // getBoundingClientRect, o layout escalonado é CSS puro) formando um
  // time — acende e ganha um pulso viajando pela curva quando um dos dois
  // lados está em foco/hover.
  useLayoutEffect(() => {
    const sec = secRef.current;
    const canvas = linksCanvasRef.current;
    if (!sec || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let width = 0, height = 0, dpr = 1;

    const resize = () => {
      const r = sec.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = r.width;
      height = r.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      resize();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // Abaixo de 760px os cartões viram grade simples — sem espaço
      // lateral pra rede de curvas fazer sentido (mesmo breakpoint do
      // CSS que esconde o canvas).
      if (window.innerWidth <= 760) {
        raf = requestAnimationFrame(draw);
        return;
      }

      ctx.globalCompositeOperation = 'lighter';

      const secR = sec.getBoundingClientRect();
      const points = cardRefs.current.map((card) => {
        if (!card) return { x: 0, y: 0 };
        const b = card.getBoundingClientRect();
        return { x: b.left - secR.left + b.width / 2, y: b.top - secR.top + b.height * 0.42 };
      });

      PAIRS.forEach(([i, j]) => {
        const a = points[i], b = points[j];
        const hot = activeIndex === i || activeIndex === j;
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2 - Math.abs(b.x - a.x) * 0.13 - 26;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.quadraticCurveTo(mx, my, b.x, b.y);
        ctx.strokeStyle = hot ? rgba(PURPLE, 0.7) : rgba(GREEN, 0.11);
        ctx.lineWidth = hot ? 1.8 : 1;
        ctx.stroke();

        // Pulso viajando pela curva: só enquanto está aceso, e desligado
        // em reduced-motion (é a única parte contínua/decorativa aqui —
        // o aceso em si é resposta direta à interação, não um loop).
        if (hot && !reduced) {
          const f = ((performance.now() - hotSinceRef.current) / 900) % 1;
          const u = 1 - f;
          const px = u * u * a.x + 2 * u * f * mx + f * f * b.x;
          const py = u * u * a.y + 2 * u * f * my + f * f * b.y;
          const g = ctx.createRadialGradient(px, py, 0, px, py, 9);
          g.addColorStop(0, rgba(PURPLE, 1));
          g.addColorStop(1, rgba(PURPLE, 0));
          ctx.beginPath();
          ctx.arc(px, py, 9, 0, 6.28);
          ctx.fillStyle = g;
          ctx.fill();
        }
      });

      points.forEach((p, i) => {
        const on = activeIndex === i;
        ctx.beginPath();
        ctx.arc(p.x, p.y, on ? 4 : 2.4, 0, 6.28);
        ctx.fillStyle = on ? rgba(PURPLE, 0.95) : rgba(GREEN, 0.32);
        ctx.fill();
      });

      ctx.globalCompositeOperation = 'source-over';
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [activeIndex, reduced]);

  return (
    <section ref={secRef} id="mentores" className="mtr">
      <canvas ref={bgCanvasRef} className="mtr-bg" aria-hidden="true" />
      <div className="mtr-veil" aria-hidden="true" />
      <canvas ref={linksCanvasRef} className="mtr-links" aria-hidden="true" />

      <div className="mtr-head">
        <Badge>quem vai te conduzir_</Badge>
        <h2>
          Mentores que já estão<br />
          <span className="g">dentro do mercado</span>
        </h2>
        <p>Não é teoria acadêmica. É quem constrói software de verdade todo dia te mostrando o caminho.</p>
      </div>

      <div className="mtr-crew">
        {MENTORES.map((m, i) => (
          <article
            key={m.id}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            tabIndex={0}
            className={`mtr-card${activeIndex === i ? ' is-on' : ''}`}
            aria-label={`${m.nome}, ${m.cargo}. ${m.experiencia} de experiência em ${m.foco}. ${m.alunos} alunos impactados.`}
            onMouseEnter={() => activate(i)}
            onMouseLeave={() => deactivate(i)}
            onFocus={() => activate(i)}
            onBlur={() => deactivate(i)}
          >
            <div className="mtr-card__in">
              <div className="mtr-card__ph">
                <img src={m.foto} alt={m.nome} loading="lazy" decoding="async" />
                <div className="mtr-card__duo" aria-hidden="true" />
                <div className="mtr-card__scan" aria-hidden="true" />
                <div key={`beam-${activationTick}`} className="mtr-card__beam" aria-hidden="true" />
                <div className="mtr-card__fade" aria-hidden="true" />
                <span className="mtr-card__br mtr-card__br--a" aria-hidden="true" />
                <span className="mtr-card__br mtr-card__br--b" aria-hidden="true" />
                <span className="mtr-card__br mtr-card__br--c" aria-hidden="true" />
                <span className="mtr-card__br mtr-card__br--d" aria-hidden="true" />
                <span className="mtr-card__id">{m.id}</span>
              </div>
              <div className="mtr-card__info">
                <div className="mtr-card__nm">{m.nome}</div>
                <div className="mtr-card__rl">{m.cargo}</div>
                <div className="mtr-card__stats">
                  <div className="mtr-card__row">
                    <span className="mtr-card__k">EXPERIÊNCIA</span>
                    <span className="mtr-card__v mtr-card__v--g">{m.experiencia}</span>
                  </div>
                  <div className="mtr-card__row">
                    <span className="mtr-card__k">FOCO</span>
                    <span className="mtr-card__v">{m.foco}</span>
                  </div>
                  <div className="mtr-card__row">
                    <span className="mtr-card__k">ALUNOS</span>
                    <span className="mtr-card__v mtr-card__v--g">{m.alunos}</span>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
