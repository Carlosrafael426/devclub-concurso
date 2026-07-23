import { useScrollAnimation } from '../../hooks/useScrollAnimation';

/**
 * Empresas - Seção "Empresas que contratam nossos devs"
 * Cartões com selo/monograma da marca (cor oficial) + carrossel infinito.
 * Sem arquivos de logo externos: o monograma substitui o logo real de forma
 * estilizada, mantendo a seção 100% self-contained.
 */

interface Empresa {
  nome: string;
  monograma: string;
  cor: string;
}

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

// Duplica a lista para o loop infinito perfeito do carrossel
const EMPRESAS_DUPLICADAS = [...EMPRESAS, ...EMPRESAS];

export const Empresas = () => {
  const { ref, isVisible } = useScrollAnimation(0.2);

  return (
    <section id="empresas" className="relative py-20 sm:py-24 bg-[#111012] border-y border-white/[0.03] overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] rounded-full green-glow opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div ref={ref} className={`text-center max-w-3xl mx-auto mb-12 sm:mb-16 fade-up ${isVisible ? 'visible' : ''}`}>
          <span className="font-sans font-bold text-[11px] sm:text-xs tracking-widest text-brand-green uppercase">
            EMPRESAS PARCEIRAS
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight text-white mt-3">
            Empresas que contratam<span className="bg-gradient-to-r from-brand-green via-brand-green-light to-brand-purple bg-clip-text text-transparent">
              <br />nossos devs
            </span>
          </h2>
          <p className="font-sans text-slate-400 mt-4 text-base sm:text-lg">
            Nossos alunos já foram contratados por essas e outras grandes empresas de tecnologia do Brasil.
          </p>
        </div>
      </div>

      {/* Carrossel infinito de logos, sem os limites do container para um efeito de sangria total */}
      <div className="marquee-wrapper relative overflow-hidden select-none">
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 z-10 bg-gradient-to-r from-[#111012] to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 z-10 bg-gradient-to-l from-[#111012] to-transparent pointer-events-none" />

        <div className="flex gap-4 sm:gap-5 animate-marquee w-max">
          {EMPRESAS_DUPLICADAS.map((empresa, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center gap-3 flex-shrink-0 w-28 sm:w-32 px-4 py-6 rounded-xl glass-panel"
            >
              <div
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center font-display font-extrabold text-base sm:text-lg"
                style={{
                  backgroundColor: `${empresa.cor}1A`,
                  color: empresa.cor,
                  border: `1px solid ${empresa.cor}40`,
                  boxShadow: `0 0 24px ${empresa.cor}30`,
                }}
              >
                {empresa.monograma}
              </div>
              <span className="text-xs sm:text-sm font-medium text-slate-300 text-center whitespace-nowrap">
                {empresa.nome}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
