import { Check } from 'lucide-react';
import { Reveal } from '../ui/Reveal';
import { MagneticButton } from '../ui/MagneticButton';
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
    <section id="inscricao" className="relative pt-16 pb-10 overflow-hidden border-t border-white/[0.04] bg-brand-bg">
      {/* Fundo dramático com gradientes radiais sobrepostos */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-bg via-brand-purple-dark/10 to-brand-bg" />
      <div className="absolute inset-0 bg-grid-pattern opacity-15" />

      {/* Grande halo verde central */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] rounded-full opacity-30 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(57, 211, 83, 0.12) 0%, transparent 70%)', filter: 'blur(40px)' }}
      />
      {/* Halos auxiliares de profundidade */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full purple-glow opacity-20 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full green-glow opacity-20 pointer-events-none" />

      {/* Conteúdo principal */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Eyebrow label */}
        <Reveal as="span" y={DISTANCE.sm} className="inline-flex items-center gap-2 font-sans font-bold text-xs tracking-widest text-brand-green uppercase mb-4">
          <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
          VAGAS COM LIMITE — TURMA ABRINDO AGORA
        </Reveal>

        {/* Headline principal com destaque gradiente */}
        <Reveal as="h2" split="words" delay={0.1} className="font-display font-extrabold text-[clamp(3rem,9vw,8rem)] tracking-[-0.03em] text-white leading-[1.02] mb-4">
          Sua carreira dev<br />
          <span className="bg-gradient-to-r from-brand-green via-brand-green-light to-brand-purple bg-clip-text text-transparent">
            começa aqui.
          </span>
        </Reveal>

        {/* Subtítulo */}
        <Reveal as="p" y={DISTANCE.sm} delay={0.25} className="font-sans text-base sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-8">
          Mais de <strong className="text-white font-semibold">17.000 devs formados</strong>.
          Empresas esperando profissionais como você.
          Só falta um passo.
        </Reveal>

        {/* CTA principal — destaque máximo */}
        <Reveal as="div" delay={0.35} className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <MagneticButton
            href="https://www.devclub.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-center px-8 sm:px-12 py-4 sm:py-5 rounded-lg bg-brand-green text-[#111012] font-display font-extrabold text-base sm:text-lg tracking-wide shadow-[0_10px_40px_rgba(57, 211, 83, 0.35)] hover:shadow-[0_16px_60px_rgba(57, 211, 83, 0.6)] transition-shadow duration-300 cursor-pointer"
          >
            <span className="inline-flex items-center gap-3 group-hover:scale-[0.952] transition-transform duration-300">
              Quero minha vaga agora
            </span>
          </MagneticButton>
        </Reveal>

        {/* Indicadores de confiança */}
        <Reveal as="ul" stagger delay={0.45} className="flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-6 gap-y-2.5 sm:gap-y-2">
          {garantias.map((garantia) => (
            <li key={garantia} className="flex items-center gap-2 font-sans text-xs sm:text-sm text-slate-400 text-left">
              <Check size={14} className="site-icon text-brand-green flex-shrink-0" />
              {garantia}
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
};
