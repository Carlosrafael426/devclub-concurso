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

// Mesmo valor de Navbar.tsx (h-[72px]) — usado pra pinar o painel exatamente
// abaixo da navbar, nunca por baixo dela.
const NAVBAR_HEIGHT = 72;

/**
 * Duas colunas em desktop: lista compacta à esquerda, painel fixo à direita
 * que troca de conteúdo conforme o item ativo — em vez de repetir o mesmo
 * card 6 vezes, o usuário lê a lista (rápido, escaneável) e o resultado
 * visual de cada escolha aparece isolado ao lado. Troca de módulo sempre
 * tem direção (sai pra cima, entra de baixo) nunca crossfade puro, pra
 * ficar claro que houve uma troca.
 *
 * O painel é fixado com ScrollTrigger `pin` (não `position:sticky` puro):
 * `position:sticky` com `top:50%` grudava assim que a lista começava a
 * entrar em viewport, o que ainda coincidia com o título da seção ainda
 * visível na tela (título e grade são adjacentes, sem essa distância de
 * scroll reservada) — o painel acabava desenhado por cima do título. Com
 * `pin` + `start:'top top+=72'`, o painel só passa a ficar fixo quando o
 * TOPO da grade já alcançou a navbar — nesse ponto o título, que vem antes
 * da grade no fluxo do documento, já rolou pra fora da tela por completo.
 * `end:'bottom bottom'` solta o pin exatamente no fim da seção (fim da
 * lista, que é a coluna mais alta e define a altura da grade inteira).
 * Abaixo de 1024px não existe pin de coluna única — cada item já vem com
 * seu próprio painel logo abaixo, revelado ao entrar em viewport.
 */
export function FormacaoList({ modulos }: FormacaoListProps) {
  const [visibleIndex, setVisibleIndex] = useState(0);
  const pendingIndexRef = useRef(0);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const panelWrapperRef = useRef<HTMLDivElement | null>(null);
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

  // Pina o painel enquanto a grade (mesma altura da lista, a coluna mais
  // alta) rola pela tela — ver comentário do componente pra explicação
  // completa de por que é `pin` e não `position:sticky`.
  useLayoutEffect(() => {
    if (reducedMotion) return;
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
    if (!isDesktop) return;
    const grid = gridRef.current;
    const wrapper = panelWrapperRef.current;
    if (!grid || !wrapper) return;

    const st = ScrollTrigger.create({
      trigger: grid,
      start: `top top+=${NAVBAR_HEIGHT}`,
      end: 'bottom bottom',
      pin: wrapper,
      pinSpacing: false,
    });

    return () => st.kill();
  }, [reducedMotion]);

  return (
    <div
      ref={gridRef}
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
        <div
          ref={panelWrapperRef}
          className="flex flex-col justify-center"
          style={{ height: `calc(100vh - ${NAVBAR_HEIGHT}px)` }}
        >
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
