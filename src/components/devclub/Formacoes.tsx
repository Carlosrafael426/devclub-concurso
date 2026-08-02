import { Code, Server, Database, Globe, Layers, Cpu } from 'lucide-react';
import { Reveal } from '../ui/Reveal';
import { DISTANCE } from '../../lib/motion';
import { FormacaoTrack } from './FormacaoTrack';
import type { Modulo } from './FormacaoCard';
/**
 * Formacoes - Apresenta os módulos/tecnologias ensinados na formação do DevClub
 * como uma trilha horizontal pinada (FormacaoTrack) em vez de um grid estático:
 * a formação é uma progressão linear, então a interface passa a espelhar esse
 * modelo mental em vez de repetir o padrão "eyebrow + grid 3 colunas" das
 * demais seções.
 */
export const Formacoes: React.FC = () => {
  // Lista fictícia de módulos/etapas da formação baseada no currículo real do DevClub
  const modulos: Modulo[] = [
    {
      number: "01",
      title: "Fundamentos Web",
      description: "Domine HTML5, CSS3 estruturado e semântico, layouts flexíveis com Flexbox/Grid e versionamento de código profissional usando Git e GitHub.",
      icon: <Globe className="site-icon text-brand-green" size={24} />,
      badge: "Módulo 1"
    },
    {
      number: "02",
      title: "JavaScript Avançado",
      description: "Aprenda a linguagem mais popular do mundo. Programação assíncrona, manipulação de DOM, requisições a APIs, ES6+ e lógica avançada.",
      icon: <Code className="site-icon text-brand-purple-light" size={24} />,
      badge: "Módulo 2"
    },
    {
      number: "03",
      title: "Front-end com React",
      description: "Construa interfaces dinâmicas, rápidas e de nível corporativo usando React.js, hooks personalizados, gerenciamento de estados e Tailwind CSS.",
      icon: <Layers className="site-icon text-brand-purple-light" size={24} />,
      badge: "Módulo 3"
    },
    {
      number: "04",
      title: "Back-end com Node.js",
      description: "Crie servidores seguros e escaláveis. Desenvolvimento de APIs RESTful usando Express, Middlewares, autenticação JWT e arquitetura limpa.",
      icon: <Server className="site-icon text-brand-green-light" size={24} />,
      badge: "Módulo 4"
    },
    {
      number: "05",
      title: "Bancos de Dados",
      description: "Aprenda a modelar, estruturar e manipular bancos de dados relacionais e não-relacionais como PostgreSQL, MySQL e MongoDB usando ORMs modernos.",
      icon: <Database className="site-icon text-amber-400" size={24} />,
      badge: "Módulo 5"
    },
    {
      number: "06",
      title: "Preparação para o Mercado",
      description: "Simulação de entrevistas técnicas, otimização de perfil no LinkedIn, estruturação de portfólio de peso e desenvolvimento de habilidades comportamentais (Soft Skills).",
      icon: <Cpu className="site-icon text-brand-purple" size={24} />,
      badge: "Módulo Especial"
    }
  ];

  return (
    <section id="formacoes" className="relative py-20 sm:py-24 bg-brand-surface/50 border-t border-white/[0.03] overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <Reveal as="span" y={DISTANCE.sm} className="block font-sans font-bold text-[11px] sm:text-xs tracking-widest text-brand-green uppercase">
            CONTEÚDO PROGRAMÁTICO
          </Reveal>
          <Reveal as="h2" split="words" delay={0.1} className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight text-white mt-3">
            O mapa de estudos para te levar ao primeiro emprego dev
          </Reveal>
          <Reveal as="p" y={DISTANCE.sm} delay={0.25} className="font-sans text-slate-400 mt-4 text-base sm:text-lg">
            Da base até as ferramentas mais exigidas pelo mercado de trabalho, com foco 100% prático e focado no que as empresas contratam.
          </Reveal>
        </div>

        <FormacaoTrack modulos={modulos} />
      </div>
    </section>
  );
};
