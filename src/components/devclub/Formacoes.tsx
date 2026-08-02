import { ArrowRight, Code, Server, Database, Globe, Layers, Cpu } from 'lucide-react';
import { Reveal } from '../ui/Reveal';
import { DISTANCE } from '../../lib/motion';
/**
 * Formacoes - Apresenta os módulos/tecnologias ensinados na formação do DevClub.
 * Utiliza cards com hover premium, ícones da biblioteca Lucide e gradientes de destaque.
 * O grid de cards é provisório: vira uma trilha horizontal pinada na Fase 2.
 */
export const Formacoes: React.FC = () => {
  // Lista fictícia de módulos/etapas da formação baseada no currículo real do DevClub
  const modulos = [
    {
      title: "Fundamentos Web",
      description: "Domine HTML5, CSS3 estruturado e semântico, layouts flexíveis com Flexbox/Grid e versionamento de código profissional usando Git e GitHub.",
      icon: <Globe className="site-icon text-brand-green" size={24} />,
      badge: "Módulo 1"
    },
    {
      title: "JavaScript Avançado",
      description: "Aprenda a linguagem mais popular do mundo. Programação assíncrona, manipulação de DOM, requisições a APIs, ES6+ e lógica avançada.",
      icon: <Code className="site-icon text-brand-purple-light" size={24} />,
      badge: "Módulo 2"
    },
    {
      title: "Front-end com React",
      description: "Construa interfaces dinâmicas, rápidas e de nível corporativo usando React.js, hooks personalizados, gerenciamento de estados e Tailwind CSS.",
      icon: <Layers className="site-icon text-brand-purple-light" size={24} />,
      badge: "Módulo 3"
    },
    {
      title: "Back-end com Node.js",
      description: "Crie servidores seguros e escaláveis. Desenvolvimento de APIs RESTful usando Express, Middlewares, autenticação JWT e arquitetura limpa.",
      icon: <Server className="site-icon text-brand-green-light" size={24} />,
      badge: "Módulo 4"
    },
    {
      title: "Bancos de Dados",
      description: "Aprenda a modelar, estruturar e manipular bancos de dados relacionais e não-relacionais como PostgreSQL, MySQL e MongoDB usando ORMs modernos.",
      icon: <Database className="site-icon text-amber-400" size={24} />,
      badge: "Módulo 5"
    },
    {
      title: "Preparação para o Mercado",
      description: "Simulação de entrevistas técnicas, otimização de perfil no LinkedIn, estruturação de portfólio de peso e desenvolvimento de habilidades comportamentais (Soft Skills).",
      icon: <Cpu className="site-icon text-brand-purple" size={24} />,
      badge: "Módulo Especial"
    }
  ];

  return (
    <section id="formacoes" className="relative py-20 sm:py-24 bg-brand-surface/50 border-t border-white/[0.03] overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full purple-glow opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <Reveal as="span" y={DISTANCE.sm} className="block font-sans font-bold text-[11px] sm:text-xs tracking-widest text-brand-green uppercase">
            CONTEÚDO PROGRAMÁTICO
          </Reveal>
          <Reveal as="h2" split="words" delay={0.1} className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight text-white mt-3">
            O mapa de estudos para te levar ao <span className="bg-gradient-to-r from-brand-green via-brand-green-light to-brand-purple bg-clip-text text-transparent">
              primeiro emprego dev
            </span>
          </Reveal>
          <Reveal as="p" y={DISTANCE.sm} delay={0.25} className="font-sans text-slate-400 mt-4 text-base sm:text-lg">
            Da base até as ferramentas mais exigidas pelo mercado de trabalho, com foco 100% prático e focado no que as empresas contratam.
          </Reveal>
        </div>

        <Reveal as="div" stagger delay={0.35} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {modulos.map((modulo, idx) => (
            <div
              key={idx}
              className="group p-6 sm:p-8 rounded-xl glass-panel hover:-translate-y-1 hover:border-brand-green/20 transition-all duration-300 flex flex-col justify-between gap-6"
            >
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3.5 rounded-lg bg-white/[0.05] group-hover:bg-brand-green/10 transition-colors border border-white/[0.06]">
                    {modulo.icon}
                  </div>
                  <span className="text-[11px] font-display font-extrabold tracking-wider text-slate-400 bg-white/[0.04] px-2.5 py-1 rounded-md uppercase">
                    {modulo.badge}
                  </span>
                </div>
                <div className="h-px w-full bg-gradient-to-r from-white/10 via-transparent to-transparent mb-5" />
                <h3 className="font-display font-bold text-xl text-white group-hover:text-brand-green transition-colors">
                  {modulo.title}
                </h3>
                <p className="font-sans text-sm text-slate-400 mt-3 leading-relaxed">
                  {modulo.description}
                </p>
              </div>
              <div className="inline-flex items-center gap-2 text-sm font-medium text-brand-green">
                Ver conteúdo
                <ArrowRight size={16} />
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
};
