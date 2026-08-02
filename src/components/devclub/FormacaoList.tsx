import { useLayoutEffect, useRef, useState } from 'react';
import { FormacaoRow, type Modulo } from './FormacaoRow';
import { FormacaoPanel } from './FormacaoPanel';
import { Reveal } from '../ui/Reveal';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import { EASE } from '../../lib/motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';

type FormacaoListProps = {
  modulos: Modulo[];
};

/**
 * Duas colunas em desktop: lista compacta à esquerda, painel fixo (sticky)
 * à direita que troca de conteúdo conforme o item ativo — em vez de repetir
 * o mesmo card 6 vezes, o usuário lê a lista (rápido, escaneável) e o
 * resultado visual de cada escolha aparece isolado ao lado. Troca de
 * módulo sempre tem direção (sai pra cima, entra de baixo) nunca crossfade
 * puro, pra ficar claro que houve uma troca. Abaixo de 1024px não existe
 * sticky de coluna única — cada item já vem com seu próprio painel logo
 * abaixo, revelado ao entrar em viewport.
 */
export function FormacaoList({ modulos }: FormacaoListProps) {
  const [visibleIndex, setVisibleIndex] = useState(0);
  const pendingIndexRef = useRef(0);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const isFirstPanelRender = useRef(true);
  const hoveringRef = useRef(false);
  const reducedMotion = useReducedMotion();

  const goTo = (idx: number) => {
    if (idx === pendingIndexRef.current) return;
    pendingIndexRef.current = idx;

    if (reducedMotion) {
      setVisibleIndex(idx);
      return;
    }

    const panel = panelRef.current;
    if (!panel) {
      setVisibleIndex(idx);
      return;
    }
    // Saída primeiro (opacity 1→0, y 0→-12); só troca o conteúdo (estado
    // React) quando a saída termina — senão o DOM já teria trocado antes
    // da animação de saída sequer começar a rodar.
    gsap.to(panel, {
      opacity: 0,
      y: -12,
      duration: 0.3,
      ease: EASE.in,
      onComplete: () => setVisibleIndex(idx),
    });
  };

  // Entrada do painel (opacity 0→1, y 12→0) depois que o conteúdo já
  // trocou — roda a cada mudança de `visibleIndex`, exceto na primeira
  // (o <Reveal> da seção já cuida da aparição inicial).
  useLayoutEffect(() => {
    if (reducedMotion) return;
    if (isFirstPanelRender.current) {
      isFirstPanelRender.current = false;
      return;
    }
    const panel = panelRef.current;
    if (!panel) return;
    gsap.fromTo(panel, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4, ease: EASE.out });
  }, [visibleIndex, reducedMotion]);

  // Sincronização por scroll (desktop, só quando o usuário não está com o
  // mouse sobre a lista) — o item mais próximo do centro vertical vira o
  // ativo, pra quem navega só rolando sem usar o mouse.
  useLayoutEffect(() => {
    if (reducedMotion) return;
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
    if (!isDesktop) return;

    const ctx = gsap.context(() => {
      rowRefs.current.forEach((row, idx) => {
        if (!row) return;
        ScrollTrigger.create({
          trigger: row,
          start: 'top center',
          end: 'bottom center',
          onEnter: () => {
            if (!hoveringRef.current) goTo(idx);
          },
          onEnterBack: () => {
            if (!hoveringRef.current) goTo(idx);
          },
        });
      });
    });

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion, modulos.length]);

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12"
      onMouseEnter={() => {
        hoveringRef.current = true;
      }}
      onMouseLeave={() => {
        hoveringRef.current = false;
      }}
    >
      <div className="flex flex-col">
        {modulos.map((modulo, idx) => (
          <div key={modulo.number}>
            <FormacaoRow
              modulo={modulo}
              active={idx === visibleIndex}
              onActivate={() => goTo(idx)}
              rowRef={(el) => {
                rowRefs.current[idx] = el;
              }}
            />
            {/* Fallback mobile (<1024px): painel inline logo abaixo do
                item, sem sticky (coluna única não comporta lateral fixa). */}
            <div className="lg:hidden mt-4 mb-8">
              <Reveal as="div">
                <FormacaoPanel modulo={modulo} />
              </Reveal>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden lg:block">
        <div className="sticky top-24">
          <FormacaoPanel
            modulo={modulos[visibleIndex]}
            panelRef={(el) => {
              panelRef.current = el;
            }}
          />
        </div>
      </div>
    </div>
  );
}
