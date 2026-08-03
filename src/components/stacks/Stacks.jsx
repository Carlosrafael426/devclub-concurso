/**
 * Stacks — seção de tecnologias em painel HUD.
 *
 * Camadas por z-index:
 *   0  BgNeural (canvas)   — mesma rede neural do hero, em baixa intensidade
 *   0  véu + grade + sweep — legibilidade e textura
 *   1  traços PCB (SVG)    — ligam cada card ao núcleo, redesenhados no resize
 *   2  CoreScene (canvas)  — esfera, plataforma e chip
 *   4  cards               — HTML acessível, hover controla tudo
 *   5  terminal            — descrição digitada caractere a caractere
 *
 * Os traços são calculados a partir do getBoundingClientRect real dos cards,
 * não de coordenadas fixas: assim continuam alinhados em qualquer largura.
 */

import { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import { CoreScene, BgNeural, GREEN, PURPLE, rgba } from "./stacksCore";
import { LOGOS, STACKS, IDLE } from "./stacksData";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { Reveal } from "../ui/Reveal";
import { DISTANCE } from "../../lib/motion";
import "./stacks.css";

export default function Stacks() {
  const secRef = useRef(null);
  const stageRef = useRef(null);
  const coreRef = useRef(null);
  const bgCanvasRef = useRef(null);
  const coreCanvasRef = useRef(null);
  const tracesRef = useRef(null);
  const cardRefs = useRef([]);

  const [active, setActive] = useState(-1);
  const [cmd, setCmd] = useState("");
  const [desc, setDesc] = useState("");
  const typeRef = useRef(null);
  const reduced = useReducedMotion();

  /* ---------------- engines ---------------- */
  useLayoutEffect(() => {
    const core = new CoreScene(coreCanvasRef.current, coreRef.current);
    const bg = new BgNeural(bgCanvasRef.current, secRef.current);

    if (reduced) {
      core.renderStatic();
      bg.renderStatic();
    } else {
      core.start();
      bg.start();
    }
    return () => {
      core.destroy();
      bg.destroy();
    };
  }, [reduced]);

  /* ---------------- traços PCB ---------------- */
  const buildTraces = useCallback(() => {
    const stage = stageRef.current;
    const coreEl = coreRef.current;
    const svg = tracesRef.current;
    if (!stage || !coreEl || !svg) return;

    const sr = stage.getBoundingClientRect();
    const cr = coreEl.getBoundingClientRect();
    svg.setAttribute("viewBox", `0 0 ${sr.width} ${sr.height}`);

    const cx = cr.left - sr.left + cr.width / 2;
    const cy = cr.top - sr.top + cr.height / 2;
    const half = Math.min(cr.width, cr.height) * 0.3;
    let out = "";

    // Dois octógonos concêntricos ao redor do núcleo, com pulso percorrendo
    // (SMIL <animate> não é pausado por `animation:none` do CSS — em
    // reduced-motion o segundo traço vira um contorno estático em vez de
    // um traço pontilhado "correndo").
    [1.36, 1.62].forEach((m, k) => {
      const rw = half * m * 1.34, rh = half * m * 1.16;
      const cut = Math.min(rw, rh) * 0.3;
      const pts = [
        [cx - rw + cut, cy - rh], [cx + rw - cut, cy - rh],
        [cx + rw, cy - rh + cut], [cx + rw, cy + rh - cut],
        [cx + rw - cut, cy + rh], [cx - rw + cut, cy + rh],
        [cx - rw, cy + rh - cut], [cx - rw, cy - rh + cut],
      ].map((p) => p.map((n) => n.toFixed(1)).join(",")).join(" ");
      out += `<polygon points="${pts}" fill="none" stroke="${rgba(GREEN, k ? 0.1 : 0.17)}" stroke-width="1"/>`;
      if (reduced) {
        out += `<polygon points="${pts}" fill="none" stroke="${rgba(GREEN, 0.4)}" stroke-width="1.2"/>`;
      } else {
        out += `<polygon points="${pts}" fill="none" stroke="${rgba(GREEN, 0.55)}" stroke-width="1.2"
          stroke-dasharray="14 900" stroke-linecap="round">
          <animate attributeName="stroke-dashoffset" from="0" to="-914" dur="${7 + k * 3}s" repeatCount="indefinite"/></polygon>`;
      }
    });

    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      const b = card.getBoundingClientRect();
      const left = i < 4;
      const x1 = (left ? b.right : b.left) - sr.left;
      const y1 = b.top - sr.top + b.height / 2;
      const xEnd = cx + (left ? -1 : 1) * half * 1.62 * 1.34;
      const dir = left ? 1 : -1;
      const seg = Math.abs(xEnd - x1);
      const xa = x1 + dir * seg * 0.28;
      const xb = x1 + dir * seg * 0.6;
      const yT = cy + (y1 - cy) * 0.42;
      const ch = 7 * dir;
      const s = yT > y1 ? 7 : -7;
      const d = `M ${x1.toFixed(1)} ${y1.toFixed(1)} L ${xa.toFixed(1)} ${y1.toFixed(1)} ` +
        `L ${(xa + ch).toFixed(1)} ${(y1 + s).toFixed(1)} L ${(xa + ch).toFixed(1)} ${(yT - s).toFixed(1)} ` +
        `L ${(xa + ch * 2).toFixed(1)} ${yT.toFixed(1)} L ${xEnd.toFixed(1)} ${yT.toFixed(1)}`;
      const col = STACKS[i].accent === "green" ? GREEN : PURPLE;
      const dur = (3 + i * 0.35).toFixed(1);
      out += `<path id="stx-tr${i}" d="${d}" fill="none" stroke="${rgba(col, 0.3)}" stroke-width="1.2"/>`;
      out += `<rect id="stx-via${i}" x="${(xb - 4).toFixed(1)}" y="${(yT - 4).toFixed(1)}" width="8" height="8"
        fill="${rgba(col, 0.22)}" stroke="${rgba(col, 0.7)}" stroke-width="1.1"/>`;
      if (!reduced) {
        out += `<circle r="2.6" fill="${rgba(col, 0.95)}">
          <animateMotion dur="${dur}s" repeatCount="indefinite" path="${d}"/>
          <animate attributeName="opacity" values="0;1;1;0" dur="${dur}s" repeatCount="indefinite"/></circle>`;
      }
    });

    svg.innerHTML = out;
  }, [reduced]);

  useLayoutEffect(() => {
    buildTraces();
    // Segunda passada após o layout assentar (fontes, imagens).
    const id = setTimeout(buildTraces, 220);
    window.addEventListener("resize", buildTraces);
    return () => {
      clearTimeout(id);
      window.removeEventListener("resize", buildTraces);
    };
  }, [buildTraces]);

  /* ---------------- digitação no terminal ---------------- */
  useEffect(() => {
    const src = active < 0 ? IDLE : STACKS[active];
    clearInterval(typeRef.current);
    setCmd("");
    setDesc("");
    let i = 0, j = 0, phase = 0;
    typeRef.current = setInterval(() => {
      if (phase === 0) {
        i += 1;
        setCmd(src.cmd.slice(0, i));
        if (i >= src.cmd.length) phase = 1;
      } else {
        j += 2;
        setDesc(src.desc.slice(0, j));
        if (j >= src.desc.length) clearInterval(typeRef.current);
      }
    }, 18);
    return () => clearInterval(typeRef.current);
  }, [active]);

  /* Realce dos traços: manipulação direta de atributo SVG evita re-render. */
  useEffect(() => {
    STACKS.forEach((s, k) => {
      const tr = document.getElementById(`stx-tr${k}`);
      const via = document.getElementById(`stx-via${k}`);
      const col = s.accent === "green" ? GREEN : PURPLE;
      const on = k === active;
      if (tr) {
        tr.setAttribute("stroke", rgba(col, on ? 0.95 : 0.3));
        tr.setAttribute("stroke-width", on ? "2.2" : "1.2");
      }
      if (via) via.setAttribute("fill", rgba(col, on ? 0.7 : 0.22));
    });
  }, [active]);

  const renderCard = (s, i) => (
    <div
      key={s.k}
      ref={(el) => (cardRefs.current[i] = el)}
      className={`stx-card${active === i ? " is-on" : ""}`}
      data-accent={s.accent}
      style={{ animationDelay: `${i * 0.5}s` }}
      tabIndex={0}
      role="button"
      aria-pressed={active === i}
      aria-label={`${s.nome}: ${s.desc}`}
      onMouseEnter={() => setActive(i)}
      onMouseLeave={() => setActive((cur) => (cur === i ? -1 : cur))}
      onFocus={() => setActive(i)}
      onBlur={() => setActive((cur) => (cur === i ? -1 : cur))}
      onClick={() => setActive((cur) => (cur === i ? -1 : i))}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setActive((cur) => (cur === i ? -1 : i));
        }
      }}
    >
      <div className="stx-card__in">
        <div className="stx-card__ico"><div className="stx-card__ii">{LOGOS[s.k]}</div></div>
        <div>
          <div className="stx-card__nm">{s.nome}</div>
          <div className="stx-card__sb">{s.sub}</div>
        </div>
      </div>
    </div>
  );

  return (
    <section ref={secRef} className="stx" id="stacks">
      <canvas ref={bgCanvasRef} className="stx-bg" aria-hidden="true" />
      <div className="stx-veil" aria-hidden="true" />
      <div className="stx-grid" aria-hidden="true" />
      <div className="stx-sweep" aria-hidden="true" />

      <div className="stx-corner tl" aria-hidden="true" />
      <div className="stx-corner tr" aria-hidden="true" />
      <div className="stx-corner bl" aria-hidden="true" />
      <div className="stx-corner br" aria-hidden="true" />

      <div className="stx-hudbox" aria-hidden="true">
        <div className="stx-hudbox__in">
          <div className="stx-hudbox__t">// STACK <b>PRINCIPAL</b></div>
          <div className="stx-hudbox__d">tecnologias que vão<br />impulsionar sua carreira</div>
          <div className="stx-hudbox__dots"><i /><i /></div>
        </div>
      </div>

      <header className="stx-head">
        <Reveal as="h2" split="words">O que você vai <span className="g">dominar</span> no DevClub</Reveal>
        <Reveal as="p" y={DISTANCE.sm} delay={0.1}>
          Da base ao deploy: tecnologias mais exigidas pelo mercado, na <span className="g">ordem certa</span> de aprendizado.
        </Reveal>
      </header>

      <Reveal as="div" y={DISTANCE.lg} delay={0.2}>
        <div ref={stageRef} className="stx-stage">
          <svg ref={tracesRef} className="stx-traces" aria-hidden="true" />

          <div className="stx-col">{STACKS.slice(0, 4).map((s, i) => renderCard(s, i))}</div>

          <div ref={coreRef} className="stx-core">
            <canvas ref={coreCanvasRef} className="stx-core__cv" aria-hidden="true" />
            <div className="stx-term" aria-live="polite">
              <div className="stx-term__in">
                <div className="stx-term__cmd">&gt; {cmd}</div>
                <div className="stx-term__desc">
                  {desc.split("\n").map((line, k) => (
                    <span key={k}>{line}<br /></span>
                  ))}
                </div>
                <div className="stx-term__pr">&gt; <span className="stx-cur" /></div>
              </div>
            </div>
          </div>

          <div className="stx-col">{STACKS.slice(4).map((s, i) => renderCard(s, i + 4))}</div>
        </div>
      </Reveal>
    </section>
  );
}
