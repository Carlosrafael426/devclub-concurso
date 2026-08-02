import { ArrowRight } from 'lucide-react';
import { Reveal } from '../ui/Reveal';
import { ButtonPrimary } from '../ui/ButtonPrimary';
import { Badge } from '../ui/Badge';
import { DISTANCE } from '../../lib/motion';

const VAGAS_TOTAIS = 40;
const VAGAS_PREENCHIDAS = 37;
const VAGAS_RESTANTES = VAGAS_TOTAIS - VAGAS_PREENCHIDAS;

/**
 * CTAFinal - Seção de fechamento, deliberadamente diferente da composição
 * do Hero (que é título grande + dois botões grandes lado a lado): aqui só
 * existe UM CTA de destaque, um link de texto como alternativa, e um card
 * de vagas restantes como elemento de fechamento (em vez de repetir o
 * mockup de terminal ou os badges de prova social já usados lá em cima).
 * Único glow da seção, fora do centro — o resto do respiro vem do
 * space-y do container, não de mais camadas de fundo.
 */
export const CTAFinal = () => {
  return (
    <section id="inscricao" className="relative pt-20 pb-16 sm:pt-28 sm:pb-20 overflow-hidden border-t border-white/[0.04] bg-black-dark">
      <div className="absolute inset-0 bg-gradient-to-b from-black-dark via-purple-dark/10 to-black-dark" />
      <div className="absolute inset-0 bg-grid-pattern opacity-15" />

      {/* Único glow da seção — verde, fora do centro (canto superior
          direito) para não competir com o título nem repetir o halo
          central que o Hero já usa atrás do terminal. */}
      <div className="absolute -top-24 -right-24 sm:-right-32 w-[500px] h-[500px] rounded-full green-glow pointer-events-none" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <Reveal as="div" y={DISTANCE.sm} className="flex justify-center mb-5">
          <Badge>comece agora_</Badge>
        </Reveal>

        <Reveal as="h2" split="words" delay={0.1} className="font-display font-normal text-[clamp(2.5rem,7vw,6rem)] text-white leading-[1.05] mb-8">
          Sua carreira dev<br />
          <span className="text-green-normal">começa aqui.</span>
        </Reveal>

        {/* Elemento de fechamento: vagas restantes desta turma, não usado em
            nenhuma outra seção — cria urgência sem depender de um segundo
            botão grande. */}
        <Reveal as="div" delay={0.2} className="max-w-xs mx-auto mb-9">
          <div className="rounded-card border border-white/10 bg-black-normal/60 backdrop-blur-sm px-6 py-5 text-left">
            <div className="flex items-baseline justify-between mb-3">
              <span className="font-sans font-medium text-sm text-gray-300">vagas desta turma</span>
              <span className="font-display font-normal text-3xl text-green-normal">{VAGAS_RESTANTES}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-green-normal"
                style={{ width: `${(VAGAS_PREENCHIDAS / VAGAS_TOTAIS) * 100}%` }}
              />
            </div>
            <p className="font-sans text-xs text-gray-400 mt-2.5">
              {VAGAS_PREENCHIDAS} de {VAGAS_TOTAIS} vagas já preenchidas nesta turma
            </p>
          </div>
        </Reveal>

        <Reveal as="div" delay={0.3} className="flex flex-col items-center gap-4">
          <ButtonPrimary href="https://www.devclub.com.br" target="_blank" rel="noopener noreferrer">
            Quero minha vaga agora
          </ButtonPrimary>

          <a
            href="https://wa.me/seu-numero"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 font-sans font-medium text-sm text-gray-300 hover:text-green-normal transition-colors duration-200"
          >
            ou fale com um consultor
            <ArrowRight size={14} className="site-icon transition-transform duration-200 group-hover:translate-x-1" />
          </a>
        </Reveal>
      </div>
    </section>
  );
};
