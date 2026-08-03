import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { BgNeural } from '../../lib/bgNeural';
import { Globe, drawBranch } from './empresasCore';
import { EMPRESAS } from './empresasData';
import { Badge } from '../ui/Badge';
import { Reveal } from '../ui/Reveal';
import { DISTANCE } from '../../lib/motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import './empresas.css';

type CoState = {
  ang: number;
  rf: number;
  size: number;
  icoSize: number;
  x: number;
  y: number;
  ax: number;
  ay: number;
  hot: boolean;
  t0: number;
};

// Ângulos únicos e igualmente espaçados + raio alternado. Como cada galho
// sai radialmente no seu próprio ângulo, dois galhos nunca se cruzam — é a
// garantia geométrica de não sobreposição, não uma coincidência de layout.
const STEP = (Math.PI * 2) / EMPRESAS.length;
const LAYOUT = EMPRESAS.map((_, i) => ({
  ang: -Math.PI / 2 + i * STEP + STEP / 2,
  rf: i % 2 === 0 ? 0.4 : 0.545,
  size: i % 2 === 0 ? 80 : 66,
  icoSize: i % 2 === 0 ? 24 : 20,
}));

const COUNTER_DURATION_MS = 1500;

/**
 * Empresas — planeta de partículas (globo com continentes amostrados numa
 * esfera de Fibonacci) com as empresas parceiras ancoradas ao redor,
 * ligadas por galhos que acendem no hover/foco. Fundo em rede neural
 * (mesma engine do hero/stacks/depoimentos, ver ../../lib/bgNeural).
 *
 * Abaixo de 900px o globo vira um círculo estático acima de uma grade de
 * badges (a órbita/galhos não fazem sentido sem espaço lateral) — mesmo
 * breakpoint e mesma solução do protótipo original.
 */
export default function Empresas() {
  const secRef = useRef<HTMLElement | null>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const netCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const globeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const orbitRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const coStatesRef = useRef<CoState[]>(
    LAYOUT.map((l) => ({ ...l, x: 0, y: 0, ax: 0, ay: 0, hot: false, t0: 0 }))
  );

  const reduced = useReducedMotion();
  const [statTotal, setStatTotal] = useState(0);
  const [statCompanies, setStatCompanies] = useState(0);

  // Fundo: mesma rede neural 3D do hero/stacks/depoimentos, densidade baixa.
  useLayoutEffect(() => {
    const canvas = bgCanvasRef.current;
    const host = secRef.current;
    if (!canvas || !host) return;
    const bg = new BgNeural(canvas, host, { nodeCount: 70, edgeCap: 250, alpha: 0.42 });
    if (reduced) bg.renderStatic();
    else bg.start();
    return () => bg.destroy();
  }, [reduced]);

  // Globo + galhos: o globo tem seu próprio rAF (engine self-contained);
  // os galhos são desenhados aqui porque dependem da posição real dos
  // botões HTML de cada empresa (medida via getBoundingClientRect), algo
  // que a engine do globo não tem como saber sozinha.
  useLayoutEffect(() => {
    const sec = secRef.current;
    const orbit = orbitRef.current;
    const netCanvas = netCanvasRef.current;
    const globeCanvas = globeCanvasRef.current;
    if (!sec || !orbit || !netCanvas || !globeCanvas) return;

    const netCtx = netCanvas.getContext('2d');
    if (!netCtx) return;

    const globe = new Globe(globeCanvas, globeCanvas);
    if (reduced) globe.renderStatic();
    else globe.start();

    let raf = 0;
    let netW = 0, netH = 0, netDPR = 1;
    let mobile = false;

    const netResize = () => {
      mobile = window.innerWidth <= 900;
      const r = sec.getBoundingClientRect();
      netDPR = Math.min(window.devicePixelRatio || 1, 2);
      netW = r.width;
      netH = r.height;
      netCanvas.width = netW * netDPR;
      netCanvas.height = netH * netDPR;
      netCanvas.style.width = `${netW}px`;
      netCanvas.style.height = `${netH}px`;
    };

    // Posiciona os botões HTML das empresas ao redor do globo — nunca se
    // sobrepõem porque cada uma sai num ângulo radial próprio e exclusivo.
    // Abaixo de 900px isso nem roda: a grade flex do CSS assume o layout.
    const layout = () => {
      const secR = sec.getBoundingClientRect();
      const orbitR = orbit.getBoundingClientRect();
      const cx = orbitR.left - secR.left + orbitR.width / 2;
      const cy = orbitR.top - secR.top + orbitR.height / 2;
      const base = Math.min(orbitR.width, orbitR.height);
      const gR = globe.radius() * 1.24;

      coStatesRef.current.forEach((co, i) => {
        const rad = base * co.rf;
        co.x = cx + Math.cos(co.ang) * rad * 1.28;
        co.y = cy + Math.sin(co.ang) * rad * 0.84;
        co.ax = cx + Math.cos(co.ang) * gR * 1.02;
        co.ay = cy + Math.sin(co.ang) * gR * 1.02;
        const el = nodeRefs.current[i];
        if (el) {
          el.style.left = `${co.x - (orbitR.left - secR.left)}px`;
          el.style.top = `${co.y - (orbitR.top - secR.top)}px`;
        }
      });
    };

    const tick = () => {
      netResize();
      if (mobile) {
        raf = requestAnimationFrame(tick);
        return;
      }
      layout();
      netCtx.setTransform(netDPR, 0, 0, netDPR, 0, 0);
      netCtx.clearRect(0, 0, netW, netH);
      netCtx.globalCompositeOperation = 'lighter';

      const now = performance.now();
      coStatesRef.current.forEach((co) => {
        // O pulso viajando pelo galho é a única parte contínua/decorativa
        // daqui — desligado em reduced-motion; o aceso (mais opaco/grosso)
        // no hover continua, é uma resposta direta à interação, não uma
        // animação em loop.
        const pulse = !reduced && co.hot ? (now - (co.t0 || now)) / 1100 : null;
        drawBranch(netCtx, co.ax, co.ay, co.x, co.y, co.hot, pulse);
      });

      netCtx.globalCompositeOperation = 'source-over';
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('resize', netResize);
    netResize();
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', netResize);
      globe.destroy();
    };
  }, [reduced]);

  // Contadores: soma de contratações e número de empresas, subindo de 0
  // com ease cúbico — instantâneo (sem contagem) em reduced-motion.
  useEffect(() => {
    const total = EMPRESAS.reduce((sum, co) => sum + co.contratacoes, 0);
    if (reduced) {
      setStatTotal(total);
      setStatCompanies(EMPRESAS.length);
      return;
    }
    let raf = 0;
    let t0 = 0;
    const step = (ts: number) => {
      if (!t0) t0 = ts;
      const progress = Math.min(1, (ts - t0) / COUNTER_DURATION_MS);
      const eased = 1 - (1 - progress) ** 3;
      setStatTotal(Math.round(total * eased));
      setStatCompanies(Math.round(EMPRESAS.length * eased));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  const handleEnter = (i: number) => {
    const co = coStatesRef.current[i];
    co.hot = true;
    co.t0 = performance.now();
  };
  const handleLeave = (i: number) => {
    coStatesRef.current[i].hot = false;
  };

  return (
    <section ref={secRef} id="empresas" className="emp">
      <canvas ref={bgCanvasRef} className="emp-bg" aria-hidden="true" />
      <div className="emp-veil" aria-hidden="true" />
      <canvas ref={netCanvasRef} className="emp-net" aria-hidden="true" />

      <div className="emp-head">
        <Reveal as="div" y={DISTANCE.sm}>
          <Badge>empresas parceiras_</Badge>
        </Reveal>
        <Reveal as="h2" split="words" delay={0.1}>
          Empresas que contratam<br />
          <span className="g">nossos devs</span>
        </Reveal>
        <Reveal as="p" y={DISTANCE.sm} delay={0.2}>
          Nossos alunos já foram contratados por essas e outras grandes empresas de tecnologia.
        </Reveal>
        <Reveal as="div" y={DISTANCE.sm} delay={0.3} className="emp-stat">
          <div>
            <b>{statTotal}+</b>
            <span>CONTRATAÇÕES</span>
          </div>
          <div>
            <b>{statCompanies}</b>
            <span>EMPRESAS</span>
          </div>
        </Reveal>
      </div>

      <Reveal as="div" y={DISTANCE.lg} delay={0.35}>
        <div ref={orbitRef} className="emp-orbit">
          <canvas ref={globeCanvasRef} className="emp-globe" aria-hidden="true" />
          <div className="emp-co-wrap">
            {EMPRESAS.map((co, i) => {
              const { size, icoSize } = LAYOUT[i];
              return (
                <button
                  key={co.nome}
                  type="button"
                  className="emp-co"
                  aria-label={`${co.nome}: ${co.contratacoes} devs contratados`}
                  ref={(el) => {
                    nodeRefs.current[i] = el;
                  }}
                  onMouseEnter={() => handleEnter(i)}
                  onMouseLeave={() => handleLeave(i)}
                  onFocus={() => handleEnter(i)}
                  onBlur={() => handleLeave(i)}
                >
                  <div className="emp-co__tip" aria-hidden="true">
                    <b>{co.contratacoes}</b>
                    <span>DEVS CONTRATADOS</span>
                  </div>
                  <div
                    className="emp-co__b"
                    style={{
                      width: size,
                      height: size,
                      borderColor: `${co.cor}80`,
                      background: `radial-gradient(circle at 34% 28%, ${co.cor}2e, ${co.cor}0a 58%, rgba(11,10,12,.92))`,
                      boxShadow: `0 0 24px ${co.cor}2e, inset 0 0 20px ${co.cor}1c`,
                    }}
                  >
                    <span className="emp-co__ico" style={{ width: icoSize, height: icoSize, color: co.cor }}>
                      <svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor" aria-hidden="true">
                        <path d={co.path} />
                      </svg>
                    </span>
                    <span className="emp-co__n" style={{ fontSize: size > 70 ? 9.8 : 9 }}>
                      {co.nome}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
