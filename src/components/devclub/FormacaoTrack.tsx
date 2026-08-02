import { useLayoutEffect, useRef } from 'react';
import { FormacaoCard, type Modulo } from './FormacaoCard';
import { Reveal } from '../ui/Reveal';
import { gsap } from '../../lib/gsap';
import { EASE } from '../../lib/motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';

type FormacaoTrackProps = {
  modulos: Modulo[];
};

/**
 * A seção deixa de ser um grid estático e vira uma trilha horizontal
 * navegada pelo scroll vertical: o usuário continua rolando para baixo, a
 * seção prende na tela e os módulos avançam lateralmente, espelhando o
 * modelo mental de uma progressão linear de carreira. Abaixo de 1024px o
 * pin é desativado (conflita com a barra de endereço dinâmica do celular)
 * e, com prefers-reduced-motion, a mesma lista vertical simples é usada
 * mesmo em telas grandes — pin é o gatilho vestibular mais forte da
 * página, então reduced-motion tira o mecanismo inteiro, não só a duração.
 */
export function FormacaoTrack({ modulos }: FormacaoTrackProps) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const lineRef = useRef<SVGLineElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    if (reducedMotion) return;
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add('(min-width: 1024px)', () => {
        const track = trackRef.current;
        if (!track) return;

        const distance = () => track.scrollWidth - section.clientWidth;

        const trackTween = gsap.to(track, {
          x: () => -distance(),
          ease: EASE.scrub,
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onRefreshInit: () => gsap.set(track, { x: 0 }),
          },
        });

        if (progressRef.current) {
          gsap.fromTo(
            progressRef.current,
            { scaleX: 0 },
            {
              scaleX: 1,
              ease: EASE.scrub,
              scrollTrigger: {
                trigger: section,
                start: 'top top',
                end: () => `+=${distance()}`,
                scrub: 1,
              },
            }
          );
        }

        if (lineRef.current) {
          gsap.fromTo(
            lineRef.current,
            { drawSVG: '0%' },
            {
              drawSVG: '100%',
              ease: EASE.scrub,
              scrollTrigger: {
                trigger: section,
                start: 'top top',
                end: () => `+=${distance()}`,
                scrub: 1,
              },
            }
          );
        }

        cardRefs.current.forEach((card) => {
          if (!card) return;
          gsap.fromTo(
            card,
            { scale: 0.94, opacity: 0.45 },
            {
              scale: 1.04,
              opacity: 1,
              ease: EASE.out,
              scrollTrigger: {
                trigger: card,
                containerAnimation: trackTween,
                start: 'left 70%',
                end: 'left 30%',
                scrub: true,
                toggleActions: 'play reverse play reverse',
              },
            }
          );
        });

        // Retornar uma função aqui faz o gsap.matchMedia reverter tudo
        // automaticamente quando a media query deixar de bater (resize
        // para mobile) ou no cleanup do efeito.
        return () => {
          trackTween.scrollTrigger?.kill();
          trackTween.kill();
        };
      });
    }, section);

    return () => ctx.revert();
  }, [reducedMotion, modulos.length]);

  if (reducedMotion) {
    return (
      <div className="flex flex-col gap-6">
        {modulos.map((modulo) => (
          <FormacaoCard key={modulo.number} modulo={modulo} />
        ))}
      </div>
    );
  }

  return (
    <div ref={sectionRef} className="relative">
      {/* Fallback mobile (<1024px): lista vertical simples, sem pin */}
      <Reveal as="div" stagger className="flex flex-col gap-6 lg:hidden">
        {modulos.map((modulo) => (
          <FormacaoCard key={modulo.number} modulo={modulo} />
        ))}
      </Reveal>

      {/* Trilha horizontal pinada (>=1024px) */}
      <div className="hidden lg:block">
        {/* Barra de progresso: comunica quanto falta da trilha — sem ela o
            usuário não sabe se está "preso", que é o erro clássico do
            scroll horizontal pinado. */}
        <div className="h-1 w-full bg-white/[0.06] rounded-full overflow-hidden mb-12">
          <div ref={progressRef} className="h-full w-full bg-green-normal origin-left" />
        </div>

        <svg className="absolute left-0 top-[3.25rem] w-full h-px overflow-visible pointer-events-none" aria-hidden="true">
          <line ref={lineRef} x1="0" y1="0" x2="100%" y2="0" stroke="var(--color-green-normal)" strokeOpacity={0.35} strokeWidth={2} />
        </svg>

        <div ref={trackRef} data-cursor="track" className="flex gap-8 w-max pr-24">
          {modulos.map((modulo, idx) => (
            <FormacaoCard
              key={modulo.number}
              modulo={modulo}
              ref={(el) => {
                cardRefs.current[idx] = el;
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
