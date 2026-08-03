import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { BgNeural, GREEN, rgba } from '../../lib/bgNeural';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import './depoimentos.css';

type Depoimento = {
  nome: string;
  cargo: string;
  texto: string;
  avatar: string;
};

const DEPOIMENTOS: Depoimento[] = [
  { nome: 'Mateus Silva', cargo: 'Dev Front-end Jr • Softplan', texto: 'Eu não sabia nada de programação. Estudava nas pausas das corridas de aplicativo. O suporte individual e as mentorias me deram segurança para encarar o processo seletivo e passar na minha primeira vaga em 7 meses.', avatar: 'https://i.pravatar.cc/160?img=12' },
  { nome: 'Juliana Santos', cargo: 'Dev Full Stack • Arezzo&Co', texto: 'A didática prática do DevClub foi essencial. Criar projetos reais idênticos aos de grandes empresas me destacou no LinkedIn. Hoje trabalho home office com um salário que eu nunca imaginei ganhar.', avatar: 'https://i.pravatar.cc/160?img=45' },
  { nome: 'Rodrigo Almeida', cargo: 'Dev Node.js • Zup Innovation', texto: 'Estava cansado de trabalhar aos domingos e feriados. Decidi migrar para tecnologia e o acompanhamento dos tutores para tirar dúvidas diárias foi o diferencial para eu não desistir no meio do caminho.', avatar: 'https://i.pravatar.cc/160?img=33' },
  { nome: 'Camila Ferreira', cargo: 'Dev React • Conta Azul', texto: 'Vim do zero absoluto, sem faculdade de TI. A comunidade me segurou nos momentos em que eu quase parei. Em 9 meses eu tinha portfólio, entrevistas marcadas e uma proposta na mão.', avatar: 'https://i.pravatar.cc/160?img=47' },
  { nome: 'Pedro Henrique', cargo: 'Dev Back-end • C6 Bank', texto: 'O que me pegou foi a ordem do conteúdo. Nada de pular etapa: base sólida primeiro, depois framework. Isso apareceu na entrevista técnica e foi exatamente o que me diferenciou.', avatar: 'https://i.pravatar.cc/160?img=15' },
  { nome: 'Larissa Costa', cargo: 'Dev Front-end • RD Station', texto: 'Eu trabalhava com telemarketing e estudava de madrugada. Os projetos guiados me deram confiança para mostrar código de verdade, não só certificado. Mudou completamente minha vida.', avatar: 'https://i.pravatar.cc/160?img=32' },
  { nome: 'Bruno Martins', cargo: 'Dev Full Stack • Totvs', texto: 'Já tinha tentado aprender sozinho três vezes e travei em todas. A diferença aqui foi ter alguém para revisar meu código e apontar exatamente o que estava errado.', avatar: 'https://i.pravatar.cc/160?img=52' },
];

const AUTO_ADVANCE_MS = 7000;

/**
 * Depoimentos — carrossel com card em destaque maior ao centro, fundo em
 * rede neural 3D (mesma engine de Hero/Stacks, ver ../../lib/bgNeural) e
 * circuitos decorativos animados em SVG nos cantos.
 *
 * Diferenças deliberadas em relação ao protótipo original (página HTML
 * isolada): o avanço automático e a navegação por teclado também pausam
 * no foco (`onFocus`/`onBlur`), não só no hover — o protótipo só cobria
 * mouse, o que deixaria quem navega por teclado sem controle sobre o
 * conteúdo que muda sozinho (WCAG 2.2.2). A navegação por seta também fica
 * restrita a quando o foco está dentro do carrossel (`onKeyDown` no
 * container, que só recebe o evento quando um botão/dot interno está
 * focado), em vez de um listener global no documento — numa página de
 * uma seção só isso não fazia diferença, mas aqui sequestraria as setas
 * do teclado em qualquer lugar da página.
 */
export default function Depoimentos() {
  const secRef = useRef<HTMLElement | null>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const decoRef = useRef<SVGSVGElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const timerRef = useRef<number | null>(null);
  const pausedRef = useRef(false);

  const [activeIndex, setActiveIndex] = useState(() => Math.floor(DEPOIMENTOS.length / 2));
  const reduced = useReducedMotion();

  const goTo = useCallback((i: number) => {
    setActiveIndex(((i % DEPOIMENTOS.length) + DEPOIMENTOS.length) % DEPOIMENTOS.length);
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) window.clearInterval(timerRef.current);
  }, []);

  const restart = useCallback(() => {
    clearTimer();
    if (reduced || pausedRef.current) return;
    timerRef.current = window.setInterval(() => {
      setActiveIndex((cur) => (cur + 1) % DEPOIMENTOS.length);
    }, AUTO_ADVANCE_MS);
  }, [reduced, clearTimer]);

  useEffect(() => {
    restart();
    return clearTimer;
  }, [restart, clearTimer]);

  // Centraliza o card ativo medindo a largura real (cards têm larguras
  // diferentes: o ativo é maior) — useLayoutEffect garante que a classe
  // is-active já foi aplicada ao DOM antes de medir.
  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    const active = cardRefs.current[activeIndex];
    if (!viewport || !track || !active) return;
    const offset = active.offsetLeft + active.offsetWidth / 2 - viewport.clientWidth / 2;
    track.style.transform = `translateX(${-offset}px)`;
  }, [activeIndex]);

  useEffect(() => {
    const handleResize = () => {
      const viewport = viewportRef.current;
      const track = trackRef.current;
      const active = cardRefs.current[activeIndex];
      if (!viewport || !track || !active) return;
      const offset = active.offsetLeft + active.offsetWidth / 2 - viewport.clientWidth / 2;
      track.style.transform = `translateX(${-offset}px)`;
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeIndex]);

  const pause = useCallback(() => {
    pausedRef.current = true;
    clearTimer();
  }, [clearTimer]);

  const resume = useCallback(() => {
    pausedRef.current = false;
    restart();
  }, [restart]);

  // Fundo: mesma rede neural 3D do hero/stacks, densidade reduzida.
  useLayoutEffect(() => {
    const canvas = bgCanvasRef.current;
    const host = secRef.current;
    if (!canvas || !host) return;
    const bg = new BgNeural(canvas, host, { nodeCount: 80, edgeCap: 300, alpha: 0.58 });
    if (reduced) bg.renderStatic();
    else bg.start();
    return () => bg.destroy();
  }, [reduced]);

  // Circuitos decorativos: 4 traços fixos nos cantos superiores, com um
  // pulso percorrendo (SMIL) — desligado em reduced-motion, já que
  // `animation:none` do CSS não pausa SMIL.
  useLayoutEffect(() => {
    const svg = decoRef.current;
    if (!svg) return;

    const build = () => {
      const w = window.innerWidth;
      const h = svg.getBoundingClientRect().height || 900;
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      let out = '';
      const paths = [
        `M ${w * 0.12} ${h * 0.14} L ${w * 0.19} ${h * 0.14} L ${w * 0.235} ${h * 0.2} L ${w * 0.32} ${h * 0.2} L ${w * 0.36} ${h * 0.245}`,
        `M ${w * 0.09} ${h * 0.33} L ${w * 0.155} ${h * 0.33} L ${w * 0.19} ${h * 0.365}`,
        `M ${w * 0.88} ${h * 0.14} L ${w * 0.81} ${h * 0.14} L ${w * 0.765} ${h * 0.2} L ${w * 0.68} ${h * 0.2} L ${w * 0.64} ${h * 0.245}`,
        `M ${w * 0.91} ${h * 0.33} L ${w * 0.845} ${h * 0.33} L ${w * 0.81} ${h * 0.365}`,
      ];
      paths.forEach((d, i) => {
        out += `<path d="${d}" fill="none" stroke="${rgba(GREEN, 0.28)}" stroke-width="1.3"/>`;
        const match = d.match(/M ([\d.]+) ([\d.]+)/);
        if (reduced) {
          if (match) out += `<circle cx="${match[1]}" cy="${match[2]}" r="4.2" fill="${rgba(GREEN, 0.7)}"/>`;
        } else {
          const dur = (4 + i * 0.8).toFixed(1);
          out += `<circle r="3.4" fill="${rgba(GREEN, 0.95)}"><animateMotion dur="${dur}s" repeatCount="indefinite" path="${d}"/>
            <animate attributeName="opacity" values="0;1;1;0" dur="${dur}s" repeatCount="indefinite"/></circle>`;
          if (match) {
            out += `<circle cx="${match[1]}" cy="${match[2]}" r="4.2" fill="${rgba(GREEN, 0.9)}">
              <animate attributeName="opacity" values=".4;1;.4" dur="${(2.2 + i * 0.4).toFixed(1)}s" repeatCount="indefinite"/></circle>`;
          }
        }
      });
      svg.innerHTML = out;
    };

    build();
    window.addEventListener('resize', build);
    return () => window.removeEventListener('resize', build);
  }, [reduced]);

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'ArrowLeft') { goTo(activeIndex - 1); restart(); }
    if (e.key === 'ArrowRight') { goTo(activeIndex + 1); restart(); }
  };

  return (
    <section ref={secRef} id="depoimentos" className="dep">
      <canvas ref={bgCanvasRef} className="dep-bg" aria-hidden="true" />
      <div className="dep-veil" aria-hidden="true" />
      <svg ref={decoRef} className="dep-deco" aria-hidden="true" />

      <div className="dep-head">
        <div className="dep-kicker">
          <span aria-hidden="true">//</span> DEPOIMENTOS
        </div>
        <h2>
          O que dizem<br />
          <span className="g">nossos alunos</span>
          <span className="dep-cur" aria-hidden="true" />
        </h2>
        <p>Histórias reais de quem mudou de carreira e hoje trabalha com programação.</p>
      </div>

      <div
        className="dep-carousel"
        onMouseEnter={pause}
        onMouseLeave={resume}
        onFocus={pause}
        onBlur={resume}
        onKeyDown={handleKeyDown}
      >
        <button type="button" className="dep-nav" aria-label="Depoimento anterior" onClick={() => { goTo(activeIndex - 1); restart(); }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>

        <div ref={viewportRef} className="dep-viewport">
          <div ref={trackRef} className="dep-track">
            {DEPOIMENTOS.map((d, i) => (
              <article
                key={d.nome}
                ref={(el) => { cardRefs.current[i] = el; }}
                className={`dep-card${i === activeIndex ? ' is-active' : ''}`}
              >
                <div className="dep-flag" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.3 6.8.8-5 4.7 1.3 6.8L12 17.3 5.9 20.6 7.2 13.8l-5-4.7 6.8-.8L12 2z" /></svg>
                  DESTAQUE
                </div>
                <div className="dep-card__in">
                  <div className="dep-card__q" aria-hidden="true">&ldquo;</div>
                  <p className="dep-card__tx">{d.texto}</p>
                  <div className="dep-card__who">
                    <div className="dep-card__av">
                      <img src={d.avatar} alt="" loading="lazy" decoding="async" />
                    </div>
                    <div>
                      <div className="dep-card__nm">{d.nome}</div>
                      <div className="dep-card__rl">{d.cargo}</div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <button type="button" className="dep-nav" aria-label="Próximo depoimento" onClick={() => { goTo(activeIndex + 1); restart(); }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="dep-dots" role="tablist" aria-label="Selecionar depoimento">
        {DEPOIMENTOS.map((d, i) => (
          <button
            key={d.nome}
            type="button"
            role="tab"
            aria-selected={i === activeIndex}
            aria-label={`Depoimento ${i + 1}: ${d.nome}`}
            className={i === activeIndex ? 'is-on' : ''}
            onClick={() => { goTo(i); restart(); }}
          />
        ))}
      </div>
    </section>
  );
}
