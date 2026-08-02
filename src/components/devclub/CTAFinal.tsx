import { Check } from 'lucide-react';
import { Reveal } from '../ui/Reveal';
import { ButtonPrimary } from '../ui/ButtonPrimary';
import { Badge } from '../ui/Badge';
import { DISTANCE } from '../../lib/motion';
/**
 * CTAFinal - Seção de chamada para ação final com fundo dramático
 * Última seção da página, responsável por converter visitantes em alunos.
 * Layout cinematográfico com glow radial e indicadores de confiança.
 */
export const CTAFinal = () => {
  // Indicadores de confiança que reforçam a decisão de compra
  const garantias = [
    'Sem mensalidade escondida',
    'Acesso vitalício ao conteúdo',
    'Suporte humano diário',
    'Garantia de satisfação de 7 dias',
  ];

  return (
    <section id="inscricao" className="relative pt-16 pb-10 overflow-hidden border-t border-white/[0.04] bg-black-dark">
      {/* Fundo dramático com gradientes radiais sobrepostos */}
      <div className="absolute inset-0 bg-gradient-to-b from-black-dark via-purple-dark/10 to-black-dark" />
      <div className="absolute inset-0 bg-grid-pattern opacity-15" />

      {/* Grande halo verde central */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] rounded-full opacity-30 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(57, 211, 83, 0.12) 0%, transparent 70%)', filter: 'blur(40px)' }}
      />
      {/* Halos auxiliares de profundidade — únicos 2 glows da página inteira */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full purple-glow pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full green-glow pointer-events-none" />

      {/* Conteúdo principal */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Eyebrow label */}
        <Reveal as="div" y={DISTANCE.sm} className="flex justify-center mb-4">
          <Badge>
            <span className="w-2 h-2 rounded-full bg-green-normal animate-pulse" />
            vagas com limite — turma abrindo agora_
          </Badge>
        </Reveal>

        {/* Headline principal com destaque sólido (a marca não usa gradiente
            verde→roxo em texto — só um destaque verde por viewport) */}
        <Reveal as="h2" split="words" delay={0.1} className="font-display font-normal text-[clamp(3rem,9vw,8rem)] text-white leading-[1.02] mb-4">
          Sua carreira dev<br />
          <span className="text-green-normal">começa aqui.</span>
        </Reveal>

        {/* Subtítulo */}
        <Reveal as="p" y={DISTANCE.sm} delay={0.25} className="font-sans font-medium text-base sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed mb-8">
          Mais de <strong className="text-white font-semibold">17.000 devs formados</strong>.
          Empresas esperando profissionais como você.
          Só falta um passo.
        </Reveal>

        {/* CTA principal — destaque máximo */}
        <Reveal as="div" delay={0.35} className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <ButtonPrimary
            href="https://www.devclub.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="mx-auto"
          >
            Quero minha vaga agora
          </ButtonPrimary>
        </Reveal>

        {/* Indicadores de confiança */}
        <Reveal as="ul" stagger delay={0.45} className="flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-6 gap-y-2.5 sm:gap-y-2">
          {garantias.map((garantia) => (
            <li key={garantia} className="flex items-center gap-2 font-sans text-xs sm:text-sm text-gray-300 text-left">
              <Check size={14} className="site-icon text-green-normal flex-shrink-0" />
              {garantia}
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
};
