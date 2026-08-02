import { useState } from 'react';
import { Reveal } from '../ui/Reveal';
import { DISTANCE } from '../../lib/motion';
import { MarqueeRow, type Empresa } from './MarqueeRow';
/**
 * Empresas - Seção "Empresas que contratam nossos devs"
 * Duas faixas em direções opostas (MarqueeRow), em vez de uma única faixa
 * genérica, com velocidade modulada pela velocidade do scroll do usuário.
 */

// Lista de empresas que contratam alunos do DevClub (dados fictícios para o concurso)
const EMPRESAS: Empresa[] = [
  { nome: 'Nubank', monograma: 'Nu', cor: '#8A05BE' },
  { nome: 'iFood', monograma: 'iF', cor: '#EA1D2C' },
  { nome: 'Stone', monograma: 'St', cor: '#00A868' },
  { nome: 'PicPay', monograma: 'Pp', cor: '#21C25E' },
  { nome: 'Mercado Livre', monograma: 'ML', cor: '#FFE600' },
  { nome: 'Magazine Luiza', monograma: 'Ma', cor: '#0066CC' },
  { nome: 'Itaú Unibanco', monograma: 'It', cor: '#FF6600' },
  { nome: 'BTG Pactual', monograma: 'BT', cor: '#4C8DFF' },
  { nome: 'C6 Bank', monograma: 'C6', cor: '#F5F5F5' },
  { nome: 'RD Station', monograma: 'RD', cor: '#00A3E0' },
  { nome: 'Totvs', monograma: 'To', cor: '#E42329' },
  { nome: 'Zup Innovation', monograma: 'Zu', cor: '#FF4F00' },
  { nome: 'Softplan', monograma: 'So', cor: '#0077FF' },
  { nome: 'Conta Azul', monograma: 'CA', cor: '#2563EB' },
  { nome: 'Locaweb', monograma: 'Lo', cor: '#FF4500' },
  { nome: 'CI&T', monograma: 'CI', cor: '#E03A3E' },
];

// Cada faixa duplica sua própria lista (loop seamless via xPercent 0 -> ±50%)
const ROW_A = [...EMPRESAS, ...EMPRESAS];
const ROW_B = [...EMPRESAS].reverse();
const ROW_B_LOOP = [...ROW_B, ...ROW_B];

export const Empresas = () => {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section id="empresas" className="relative py-20 sm:py-24 bg-brand-surface-light/85 border-y border-white/[0.03] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <Reveal as="span" y={DISTANCE.sm} className="block font-sans font-bold text-[11px] sm:text-xs tracking-widest text-brand-green uppercase">
            EMPRESAS PARCEIRAS
          </Reveal>
          <Reveal as="h2" split="words" delay={0.1} className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight text-white mt-3">
            Empresas que contratam <br />nossos devs
          </Reveal>
          <Reveal as="p" y={DISTANCE.sm} delay={0.25} className="font-sans text-slate-400 mt-4 text-base sm:text-lg">
            Nossos alunos já foram contratados por essas e outras grandes empresas de tecnologia do Brasil.
          </Reveal>
        </div>
      </div>

      {/* Duas faixas de logos em direções opostas, sangrando pra fora do container */}
      <div className="flex flex-col gap-4 sm:gap-5">
        <MarqueeRow id="A" items={ROW_A} direction={1} hovered={hovered} onHover={setHovered} />
        <MarqueeRow id="B" items={ROW_B_LOOP} direction={-1} hovered={hovered} onHover={setHovered} />
      </div>
    </section>
  );
};
