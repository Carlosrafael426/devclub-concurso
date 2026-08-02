/**
 * Hero — rede neural 3D de fundo + intro "scanner" + nós de curso interativos.
 *
 * Três camadas independentes, empilhadas por z-index:
 *   1. NeuralField (canvas)  — atmosfera, cobre o hero inteiro
 *   2. Conteúdo + nós        — texto à esquerda, cursos ancorados na rede
 *   3. Scanner               — overlay de revelação, roda uma vez por sessão
 *
 * O scanner controla o clip-path do conteúdo E a opacidade da rede, então a
 * cena inteira é literalmente "revelada" pela varredura, em vez de aparecer
 * de uma vez depois dela.
 */

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "../../lib/gsap";
import { Badge } from "../ui/Badge";
import { ButtonPrimary } from "../ui/ButtonPrimary";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { NeuralField } from "./neuralField";
import "./hero.css";

const COURSES = [
  {
    sigla: "FS",
    nome: "Dev Fullstack",
    texto: "Do zero ao mercado: front-end, back-end, banco de dados e deploy.",
    tags: ["React", "Node", "SQL"],
    accent: "green",
  },
  {
    sigla: "IA",
    nome: "IA Club",
    texto: "Aplique inteligência artificial no seu dia a dia como dev.",
    tags: ["LLMs", "Agents", "Prompt"],
    accent: "purple",
  },
  {
    sigla: "MT",
    nome: "Mentoria",
    texto: "Acompanhamento próximo com quem já está no mercado.",
    tags: ["1:1", "Carreira", "Code review"],
    accent: "green",
  },
  {
    sigla: "MBA",
    nome: "MBA em IA",
    texto: "Pós-graduação reconhecida pelo MEC, com certificação internacional.",
    tags: ["MEC", "360h", "Online"],
    accent: "purple",
  },
];

const INTRO_KEY = "devclub_hero_scan_seen";

export default function Hero() {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const contentRef = useRef(null);
  const scanRef = useRef(null);
  const nodeRefs = useRef([]);
  const fieldElRef = useRef(null); // o container .hero__field (não a engine)
  const fieldRef = useRef(null);
  const openRef = useRef(-1); // lido pelo canvas a 60fps; state seria tarde demais

  const [openIdx, setOpenIdx] = useState(-1);
  const [pinned, setPinned] = useState(-1);
  const reduced = useReducedMotion();

  useEffect(() => {
    openRef.current = openIdx;
  }, [openIdx]);

  useLayoutEffect(() => {
    const field = new NeuralField(canvasRef.current, {
      // Posiciona as pílulas HTML na projeção 3D dos nós de curso, a cada
      // frame. `x`/`y` vêm no espaço do canvas (centrado no palco inteiro,
      // .hero__net), mas os elementos .node são absolute dentro de
      // .hero__field — que fica deslocado à direita de .hero__copy no
      // layout flex. Sem subtrair esse deslocamento as pílulas ficariam
      // desalinhadas do brilho desenhado no canvas.
      onProject: (i, x, y) => {
        const el = nodeRefs.current[i];
        const fieldEl = fieldElRef.current;
        const canvas = canvasRef.current;
        if (!el || !fieldEl || !canvas) return;
        const fieldRect = fieldEl.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();
        el.style.left = `${x - (fieldRect.left - canvasRect.left)}px`;
        el.style.top = `${y - (fieldRect.top - canvasRect.top)}px`;
      },
      isCourseOpen: (i) => i === openRef.current,
    });
    fieldRef.current = field;

    // gsap.context isola os tweens deste componente: ctx.revert() no cleanup
    // evita timelines duplicadas no remount do StrictMode (React 18).
    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set(contentRef.current, { clipPath: "inset(0 0 0% 0)" });
        gsap.set(nodeRefs.current, { opacity: 1, scale: 1 });
        if (scanRef.current) scanRef.current.style.display = "none";
        field.renderStatic();
        return;
      }

      const alreadySeen = sessionStorage.getItem(INTRO_KEY) === "1";
      field.start();

      if (alreadySeen) {
        gsap.set(contentRef.current, { clipPath: "inset(0 0 0% 0)" });
        gsap.set(nodeRefs.current, { opacity: 1, scale: 1 });
        if (scanRef.current) scanRef.current.style.display = "none";
        field.setAlpha(1);
        return;
      }

      // Grava no INÍCIO: refresh no meio da animação não repete a intro.
      sessionStorage.setItem(INTRO_KEY, "1");

      const stage = rootRef.current;
      const height = stage.getBoundingClientRect().height;
      const state = { y: -40 };

      gsap.set(nodeRefs.current, { opacity: 0, scale: 0.75 });

      gsap.to(state, {
        y: height + 40,
        duration: 3.1,
        ease: "power1.inOut",
        onUpdate() {
          const y = state.y;
          const pct = gsap.utils.clamp(0, 100, (y / height) * 100);
          stage.style.setProperty("--scan-y", `${y}px`);
          stage.style.setProperty("--scan-pct", `${pct.toFixed(0)}`);
          contentRef.current.style.clipPath = `inset(0 0 ${100 - pct}% 0)`;
          field.setAlpha(pct / 70);
        },
        onComplete() {
          gsap.to(scanRef.current, {
            opacity: 0,
            duration: 0.6,
            onComplete() {
              scanRef.current.style.display = "none";
            },
          });
          gsap.to(field, { alpha: 1, duration: 0.8 });
          gsap.to(nodeRefs.current, {
            opacity: 1,
            scale: 1,
            duration: 0.55,
            ease: "back.out(1.6)",
            stagger: 0.11,
          });
        },
      });
    }, rootRef);

    return () => {
      ctx.revert();
      field.destroy();
    };
  }, [reduced]);

  const handleEnter = (i) => setOpenIdx(i);
  const handleLeave = (i) => {
    if (pinned !== i) setOpenIdx((cur) => (cur === i ? -1 : cur));
  };
  const handleClick = (i) => {
    if (pinned === i) {
      setPinned(-1);
      setOpenIdx(-1);
    } else {
      setPinned(i);
      setOpenIdx(i);
    }
  };

  return (
    <section ref={rootRef} className="hero" id="hero">
      <div className="hero__net">
        <canvas ref={canvasRef} aria-hidden="true" />
        <div className="hero__net-fade" aria-hidden="true" />
      </div>

      <div ref={contentRef} className="hero__reveal">
        <div className="hero__copy">
          <Badge>apresentação_</Badge>
          <h1>
            Torne-se um <span className="accent">dev full stack</span> de verdade.
          </h1>
          <p>
            O DevClub é a formação que mais coloca desenvolvedores no mercado do
            Brasil. Projetos reais, mentoria ativa e uma comunidade que não te
            deixa pra trás.
          </p>
          <ButtonPrimary href="#formacoes">Ver formações</ButtonPrimary>
        </div>

        <div className="hero__field" ref={fieldElRef}>
          {COURSES.map((c, i) => (
            <div
              key={c.nome}
              ref={(el) => (nodeRefs.current[i] = el)}
              className={`node${openIdx === i ? " is-open" : ""}`}
              data-accent={c.accent}
              onMouseEnter={() => handleEnter(i)}
              onMouseLeave={() => handleLeave(i)}
            >
              <button
                type="button"
                className="node__pill"
                onClick={() => handleClick(i)}
                onFocus={() => handleEnter(i)}
                aria-expanded={openIdx === i}
              >
                <span className="node__dot" aria-hidden="true" />
                <span className="node__name">{c.nome}</span>
              </button>

              <div className="node__card">
                <div className="node__head">
                  <span className="node__sigla" aria-hidden="true">{c.sigla}</span>
                  <span className="node__title">{c.nome}</span>
                </div>
                <p className="node__text">{c.texto}</p>
                <div className="node__tags">
                  {c.tags.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div ref={scanRef} className="scan" aria-hidden="true">
        <div className="scan__glow" />
        <div className="scan__line" />
        <div className="scan__bracket scan__bracket--l" />
        <div className="scan__bracket scan__bracket--r" />
        <div className="scan__readout" />
      </div>
    </section>
  );
}
