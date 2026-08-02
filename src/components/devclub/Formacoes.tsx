import { Code, Server, Database, Globe, Layers, Cpu } from 'lucide-react';
import { Reveal } from '../ui/Reveal';
import { Badge } from '../ui/Badge';
import { DISTANCE } from '../../lib/motion';
import { FormacaoList } from './FormacaoList';
import type { Modulo } from './FormacaoRow';
/**
 * Formacoes - Lista de módulos à esquerda, painel visual sincronizado à
 * direita (FormacaoList), em vez do grid 3 colunas repetido nas demais
 * seções: a lista é escaneável rápido, e o resultado de cada escolha
 * aparece isolado ao lado — cria uma relação de causa/efeito em vez de
 * repetir a mesma composição de card 6 vezes.
 */
export const Formacoes: React.FC = () => {
  // Lista fictícia de módulos/etapas da formação baseada no currículo real do DevClub
  const modulos: Modulo[] = [
    {
      number: "01",
      title: "Fundamentos Web",
      description: "Domine HTML5, CSS3 estruturado e semântico, layouts flexíveis com Flexbox/Grid e versionamento de código profissional usando Git e GitHub.",
      icon: <Globe className="site-icon text-green-normal" size={24} />,
      badge: "Módulo 1",
      snippet: [
        { text: '<section class="hero">' },
        { text: '  display: flex;', accent: true },
        { text: '</section>' },
      ],
    },
    {
      number: "02",
      title: "JavaScript Avançado",
      description: "Aprenda a linguagem mais popular do mundo. Programação assíncrona, manipulação de DOM, requisições a APIs, ES6+ e lógica avançada.",
      icon: <Code className="site-icon text-purple-light" size={24} />,
      badge: "Módulo 2",
      snippet: [
        { text: 'async function login() {' },
        { text: '  await api.auth();', accent: true },
        { text: '}' },
      ],
    },
    {
      number: "03",
      title: "Front-end com React",
      description: "Construa interfaces dinâmicas, rápidas e de nível corporativo usando React.js, hooks personalizados, gerenciamento de estados e Tailwind CSS.",
      icon: <Layers className="site-icon text-purple-light" size={24} />,
      badge: "Módulo 3",
      snippet: [
        { text: 'function App() {' },
        { text: '  return <Devs />;', accent: true },
        { text: '}' },
      ],
    },
    {
      number: "04",
      title: "Back-end com Node.js",
      description: "Crie servidores seguros e escaláveis. Desenvolvimento de APIs RESTful usando Express, Middlewares, autenticação JWT e arquitetura limpa.",
      icon: <Server className="site-icon text-green-light" size={24} />,
      badge: "Módulo 4",
      snippet: [
        { text: "app.post('/vagas', (req, res) => {" },
        { text: "  res.json({ status: 'ok' });", accent: true },
        { text: '});' },
      ],
    },
    {
      number: "05",
      title: "Bancos de Dados",
      description: "Aprenda a modelar, estruturar e manipular bancos de dados relacionais e não-relacionais como PostgreSQL, MySQL e MongoDB usando ORMs modernos.",
      icon: <Database className="site-icon text-amber-400" size={24} />,
      badge: "Módulo 5",
      snippet: [
        { text: 'SELECT nome, cargo' },
        { text: 'FROM alunos', accent: true },
        { text: 'WHERE contratado = true;' },
      ],
    },
    {
      number: "06",
      title: "Preparação para o Mercado",
      description: "Simulação de entrevistas técnicas, otimização de perfil no LinkedIn, estruturação de portfólio de peso e desenvolvimento de habilidades comportamentais (Soft Skills).",
      icon: <Cpu className="site-icon text-purple-normal" size={24} />,
      badge: "Módulo Especial",
      snippet: [
        { text: '> simulação de entrevista' },
        { text: '> portfólio: pronto ✓', accent: true },
      ],
    }
  ];

  return (
    <section id="formacoes" className="relative py-20 sm:py-24 bg-black-normal/50 border-t border-white/[0.03]">
      {/* Sem overflow-hidden aqui: qualquer overflow != visible num
          ancestral quebra position:sticky do painel à direita (o elemento
          passa a "colar" nesse ancestral, que não tem scroll próprio, e
          nunca gruda em lugar nenhum — o painel ficava estático mesmo
          mudando o valor de `top`). O fundo em grid abaixo já é
          absolute/inset-0, sem risco real de vazar. */}
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <Reveal as="div" y={DISTANCE.sm} className="flex justify-center">
            <Badge>conteúdo programático_</Badge>
          </Reveal>
          <Reveal as="h2" split="words" delay={0.1} className="font-display font-normal text-3xl sm:text-4xl md:text-5xl text-white mt-3">
            O mapa de estudos para te levar ao primeiro emprego dev
          </Reveal>
          <Reveal as="p" y={DISTANCE.sm} delay={0.25} className="font-sans font-medium text-gray-300 mt-4 text-base sm:text-lg">
            Da base até as ferramentas mais exigidas pelo mercado de trabalho, com foco 100% prático e focado no que as empresas contratam.
          </Reveal>
        </div>

        <Reveal as="div" delay={0.3}>
          <FormacaoList modulos={modulos} />
        </Reveal>
      </div>
    </section>
  );
};
