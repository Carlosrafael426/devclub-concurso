import { useLayoutEffect, useRef, useState } from 'react';
import { ArrowRight, Users } from 'lucide-react';
import { BgNeural, GREEN, PURPLE, rgba } from '../../lib/bgNeural';
import { MENTORES } from './mentoresData';
import { Badge } from '../ui/Badge';
import { Reveal } from '../ui/Reveal';
import { DISTANCE } from '../../lib/motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import './mentores.css';

/**
 * Mentores — hub central (ícone de rede) ligado por "galhos" a 5 nós em
 * posições fixas ao redor (2 em cima, 2 no meio, 1 embaixo — ver
 * data-slot em mentores.css). Cada mentor tem uma cor de identidade
 * (verde ou roxo, campo `accent` em mentoresData.ts) que colore seu nó
 * e sua linha o tempo todo; o hover/foco só acende a opacidade e faz um
 * pulso viajar pela curva até o hub — a mesma regra "cor = identidade,
 * opacidade/pulso = interação" já usada em empresasCore.drawBranch.
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
  const hubRef = useRef<HTMLDivElement | null>(null);
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

  // Galhos hub→nó: posição do hub e dos cartões medida via
  // getBoundingClientRect (o layout em si é CSS puro, ver .mtr-web e
  // .mtr-card[data-slot] em mentores.css) — acende e ganha um pulso
  // viajando pela curva quando aquele nó está em hover/foco.
  useLayoutEffect(() => {
    const sec = secRef.current;
    const hub = hubRef.current;
    const canvas = linksCanvasRef.current;
    if (!sec || !hub || !canvas) return;
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

      // Abaixo de 760px os nós viram lista empilhada — sem espaço pra
      // rede de galhos fazer sentido (mesmo breakpoint do CSS que
      // esconde o canvas e as caixas HUD).
      if (window.innerWidth <= 760) {
        raf = requestAnimationFrame(draw);
        return;
      }

      ctx.globalCompositeOperation = 'lighter';

      const secR = sec.getBoundingClientRect();
      const hubR = hub.getBoundingClientRect();
      const hubPoint = {
        x: hubR.left - secR.left + hubR.width / 2,
        y: hubR.top - secR.top + hubR.height / 2,
      };
      const points = cardRefs.current.map((card) => {
        if (!card) return { x: 0, y: 0 };
        const b = card.getBoundingClientRect();
        return { x: b.left - secR.left + b.width / 2, y: b.top - secR.top + b.height / 2 };
      });

      MENTORES.forEach((m, i) => {
        const p = points[i];
        const hot = activeIndex === i;
        const col = m.accent === 'green' ? GREEN : PURPLE;
        const mx = (hubPoint.x + p.x) / 2;
        const my = (hubPoint.y + p.y) / 2 - Math.abs(p.x - hubPoint.x) * 0.13;

        ctx.beginPath();
        ctx.moveTo(hubPoint.x, hubPoint.y);
        ctx.quadraticCurveTo(mx, my, p.x, p.y);
        ctx.strokeStyle = hot ? rgba(col, 0.85) : rgba(col, 0.16);
        ctx.lineWidth = hot ? 1.8 : 1;
        ctx.stroke();

        // Pulso viajando do hub até o nó: só enquanto está aceso, e
        // desligado em reduced-motion (é a única parte contínua/
        // decorativa aqui — o aceso em si é resposta direta à
        // interação, não um loop).
        if (hot && !reduced) {
          const f = ((performance.now() - hotSinceRef.current) / 900) % 1;
          const u = 1 - f;
          const px = u * u * hubPoint.x + 2 * u * f * mx + f * f * p.x;
          const py = u * u * hubPoint.y + 2 * u * f * my + f * f * p.y;
          const g = ctx.createRadialGradient(px, py, 0, px, py, 9);
          g.addColorStop(0, rgba(col, 1));
          g.addColorStop(1, rgba(col, 0));
          ctx.beginPath();
          ctx.arc(px, py, 9, 0, 6.28);
          ctx.fillStyle = g;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, hot ? 4 : 2.4, 0, 6.28);
        ctx.fillStyle = rgba(col, hot ? 0.95 : 0.4);
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

      <div className="mtr-corner tl" aria-hidden="true" />
      <div className="mtr-corner tr" aria-hidden="true" />
      <div className="mtr-corner bl" aria-hidden="true" />
      <div className="mtr-corner br" aria-hidden="true" />

      <div className="mtr-hud mtr-hud--tl" aria-hidden="true">
        <div className="mtr-hud__in">
          <div className="mtr-hud__t">// rede de conhecimento</div>
          <div className="mtr-hud__d">conexões que constroem<br />o seu futuro</div>
          <div className="mtr-hud__dots"><i /><i /><i /><i /><i /></div>
        </div>
      </div>

      <div className="mtr-hud mtr-hud--tr" aria-hidden="true">
        <div className="mtr-hud__in">
          <div className="mtr-hud__t">// devclub.exe</div>
        </div>
      </div>

      <div className="mtr-hud mtr-hud--bl" aria-hidden="true">
        <div className="mtr-hud__in">
          <div className="mtr-hud__t">// status da rede</div>
          <div className="mtr-hud__stat-row"><span>conexões ativas</span><b>[ 128 ]</b></div>
          <div className="mtr-hud__stat-row"><span>mentores online</span><b>[ {String(MENTORES.length).padStart(2, '0')} ]</b></div>
          <div className="mtr-hud__stat-row"><span>conhecimento fluindo</span><b>[ &#8734; ]</b></div>
        </div>
      </div>

      <a className="mtr-hud mtr-hud--br" href="#inscricao">
        <div className="mtr-hud__in mtr-hud__in--cta">
          <span className="mtr-hud__cta-txt">
            <span className="mtr-hud__cta-t">fazer parte da rede</span>
            <span className="mtr-hud__cta-s">ver jornada completa</span>
          </span>
          <span className="mtr-hud__cta-arrow">
            <ArrowRight size={15} aria-hidden="true" />
          </span>
        </div>
      </a>

      <div className="mtr-head">
        <Reveal as="div" y={DISTANCE.sm}>
          <Badge>quem vai te conduzir_</Badge>
        </Reveal>
        <Reveal as="h2" split="words" delay={0.1}>
          Mentores que já estão<br />
          <span className="g">dentro do mercado</span>
        </Reveal>
        <Reveal as="p" y={DISTANCE.sm} delay={0.2}>
          Não é teoria acadêmica. É quem constrói software de verdade todo dia te mostrando o caminho.
        </Reveal>
      </div>

      <Reveal as="div" y={DISTANCE.lg} delay={0.3}>
        <div className="mtr-web">
          <div ref={hubRef} className="mtr-hub" aria-hidden="true">
            <span className="mtr-hub__ring mtr-hub__ring--a" />
            <span className="mtr-hub__ring mtr-hub__ring--b" />
            <Users className="mtr-hub__ico" aria-hidden="true" />
          </div>

          {MENTORES.map((m, i) => (
            <article
              key={m.id}
              data-slot={i}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              tabIndex={0}
              className={`mtr-card${activeIndex === i ? ' is-on' : ''}`}
              aria-label={`${m.nome}, ${m.cargo}. ${m.experiencia} de experiência em ${m.foco}. ${m.alunos} alunos impactados.`}
              style={{ '--mtr-accent': m.accent === 'green' ? 'var(--green-normal)' : 'var(--purple-normal)' } as React.CSSProperties}
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
                  <div className="mtr-card__tag-row">
                    <span className="mtr-card__dot" aria-hidden="true" />
                    <span className="mtr-card__tag">{m.tag}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Reveal>

      <div className="mtr-dots" aria-hidden="true">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className={i === 4 ? 'is-on' : ''} />
        ))}
      </div>
    </section>
  );
}
