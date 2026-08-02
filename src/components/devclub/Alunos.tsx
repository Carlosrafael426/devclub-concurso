import { useEffect, useRef } from 'react';
import type { Ref } from 'react';
import { Reveal } from '../ui/Reveal';
import { Counter } from '../ui/Counter';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { DISTANCE, DURATION, EASE } from '../../lib/motion';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import { useReducedMotion } from '../../hooks/useReducedMotion';
/**
 * Alunos - Seção de depoimentos e histórias de sucesso (cases reais)
 * Exibe alunos reais/fictícios que mudaram de carreira por meio do método DevClub.
 * Os contadores de estatística usam <Counter/> (Fase 4), que substitui esta
 * implementação manual e a duplicata que existia no Hero.
 */
export const Alunos: React.FC = () => {
  const statsRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotion();
  const photoRefs = useRef<(HTMLImageElement | null)[]>([]);
  // Lista fictícia baseada em casos reais de transição de carreira comuns no DevClub
  const depoimentos = [
    {
      name: "Mateus Silva",
      oldJob: "Ex-Motorista de Aplicativo",
      newJob: "Desenvolvedor Front-end Júnior",
      company: "Softplan",
      quote: '"Eu não sabia nada de programação. Estudava nas pausas das corridas. O suporte individual e as mentorias do DevClub me deram a segurança para encarar o processo seletivo e passar na minha primeira vaga em 7 meses."',
      image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=600&h=750"
    },
    {
      name: "Juliana Santos",
      oldJob: "Ex-Atendente de Telemarketing",
      newJob: "Desenvolvedora Full Stack",
      company: "Arezzo&Co",
      quote: '"A didática prática do DevClub foi essencial. Criar projetos reais idênticos aos de grandes empresas me destacou no LinkedIn. Hoje trabalho home office com um salário que eu nunca imaginei ganhar."',
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600&h=750"
    },
    {
      name: "Rodrigo Almeida",
      oldJob: "Ex-Vendedor de Loja",
      newJob: "Desenvolvedor Node.js",
      company: "Zup Innovation",
      quote: '"Estava cansado de trabalhar aos domingos e feriados. Decidi migrar para a área de tecnologia. O acompanhamento dos tutores do DevClub para tirar dúvidas diárias foi o diferencial para eu não desistir no meio do caminho."',
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600&h=750"
    }
  ];

  useEffect(() => {
    const el = statsRef.current;
    if (!el || reducedMotion) return;

    gsap.set(el, { opacity: 0, y: DISTANCE.sm });
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => gsap.to(el, { opacity: 1, y: 0, duration: DURATION.reveal, ease: EASE.out }),
    });
    return () => trigger.kill();
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;
    const ctx = gsap.context(() => {
      photoRefs.current.forEach((img) => {
        if (!img) return;
        gsap.to(img, {
          yPercent: 10,
          ease: EASE.scrub,
          scrollTrigger: {
            trigger: img.parentElement,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      });
    });
    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section id="alunos" className="relative py-20 sm:py-24 bg-black-dark/85 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Título da Seção */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <Reveal as="div" y={DISTANCE.sm} className="flex justify-center">
            <Badge>histórias de sucesso_</Badge>
          </Reveal>
          <Reveal as="h2" split="words" delay={0.1} className="font-display font-normal text-3xl sm:text-4xl md:text-5xl text-white mt-3">
            Quem vivenciou o método <br /> na prática
          </Reveal>
          <Reveal as="p" y={DISTANCE.sm} delay={0.25} className="font-sans font-medium text-gray-300 mt-4 text-base sm:text-lg">
            Veja a transformação de pessoas que começaram do zero absoluto e hoje constroem carreiras consolidadas nas maiores empresas de tecnologia do país.
          </Reveal>
        </div>

        {/* Depoimentos — editorial assimétrico: foto grande alternando de
            lado a cada linha, em vez do grid 3 colunas repetido em todas as
            seções. A foto grande substitui o avatar pequeno de antes. */}
        <div className="flex flex-col gap-16 sm:gap-24">
          {depoimentos.map((depoimento, idx) => {
            const flip = idx % 2 === 1;
            return (
              <Reveal
                key={idx}
                as="div"
                y={DISTANCE.md}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-14 items-center"
              >
                <div className={`relative overflow-hidden rounded-card aspect-[4/5] lg:aspect-[4/3] ${flip ? 'lg:order-2' : ''}`}>
                  <img
                    ref={(el) => {
                      photoRefs.current[idx] = el;
                    }}
                    src={depoimento.image}
                    alt={depoimento.name}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-x-0 -top-[10%] w-full h-[120%] object-cover"
                  />
                </div>

                <div className={`flex flex-col gap-6 ${flip ? 'lg:order-1' : ''}`}>
                  <p className="font-sans font-medium text-lg sm:text-xl text-gray-300 italic leading-relaxed">
                    {depoimento.quote}
                  </p>
                  <div>
                    <h4 className="font-display font-normal text-base text-white">{depoimento.name}</h4>
                    <div className="flex flex-col text-sm text-gray-300 mt-1">
                      <span className="text-purple-light font-medium">{depoimento.oldJob}</span>
                      <span className="text-green-normal font-semibold mt-0.5">
                        {depoimento.newJob} @ {depoimento.company}
                      </span>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Card
          ref={statsRef as Ref<HTMLElement>}
          hoverable={false}
          className="mt-12 sm:mt-20 flex flex-col md:flex-row justify-around items-center gap-6 sm:gap-8 text-center md:text-left"
        >
          <div>
            <Counter value={92} suffix="%" className="font-display font-normal text-3xl sm:text-4xl text-white" />
            <p className="font-sans text-[10px] sm:text-xs text-gray-300 uppercase tracking-widest mt-1">Taxa de Empregabilidade</p>
          </div>
          <div className="w-px h-12 bg-white/[0.08] hidden md:block" />
          <div>
            <Counter value={4200} prefix="R$ " className="font-display font-normal text-3xl sm:text-4xl text-white" />
            <p className="font-sans text-[10px] sm:text-xs text-gray-300 uppercase tracking-widest mt-1">Média salarial de contratação</p>
          </div>
          <div className="w-px h-12 bg-white/[0.08] hidden md:block" />
          <div>
            <Counter value={2500} suffix="+" className="font-display font-normal text-3xl sm:text-4xl text-white" />
            <p className="font-sans text-[10px] sm:text-xs text-gray-300 uppercase tracking-widest mt-1">Vagas preenchidas por alunos</p>
          </div>
        </Card>
      </div>
    </section>
  );
};