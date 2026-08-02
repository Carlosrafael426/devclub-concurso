/**
 * Dados e logos da seção Stacks.
 *
 * Logos como SVG inline em vez de arquivos ou icon font: herdam a cor via
 * `currentColor` (necessário para a troca verde/roxo por card), escalam sem
 * perda e não somam requisição de rede.
 */

export const LOGOS = {
  html: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <path d="M3 2h18l-1.6 18L12 22l-7.4-2L3 2z" />
      <path d="M17 6.6H8l.4 4h8.2l-.6 6L12 17.9l-3.9-1.3-.25-2.4" strokeWidth="1.25" />
    </svg>
  ),
  css: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <path d="M3 2h18l-1.6 18L12 22l-7.4-2L3 2z" />
      <path d="M17.3 6.6H6.9l.36 3.9h9.35l-.61 6.1L12 17.9l-3.9-1.3-.2-2.3" strokeWidth="1.25" />
    </svg>
  ),
  js: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2.6" y="2.6" width="18.8" height="18.8" rx="4" />
      <path d="M10.2 9.2v6.1c0 1-.7 1.5-1.6 1.5-.8 0-1.4-.4-1.7-1.1" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M17.7 10.3c-.4-.7-1-1-1.9-1-1 0-1.8.5-1.8 1.4 0 2 3.9 1.3 3.9 3.4 0 1.1-1 1.7-2.1 1.7-1 0-1.8-.4-2.2-1.2" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  ts: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2.6" y="2.6" width="18.8" height="18.8" rx="4" />
      <path d="M6.6 10.1h5.1M9.15 10.1v6.9" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M18.5 11.1c-.4-.7-1-1-1.8-1-1 0-1.7.5-1.7 1.4 0 1.9 3.7 1.2 3.7 3.2 0 1-.9 1.6-2 1.6-.9 0-1.7-.4-2.1-1.1" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  react: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25">
      <circle cx="12" cy="12" r="2.1" fill="currentColor" stroke="none" />
      <g className="stx-spin">
        <ellipse cx="12" cy="12" rx="10.2" ry="3.9" />
        <ellipse cx="12" cy="12" rx="10.2" ry="3.9" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="10.2" ry="3.9" transform="rotate(120 12 12)" />
      </g>
    </svg>
  ),
  node: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <path d="M12 2.3l8.4 4.85v9.7L12 21.7l-8.4-4.85v-9.7L12 2.3z" />
      <path d="M9.5 14.6c.3.9 1.2 1.35 2.55 1.35 1.7 0 2.55-.7 2.55-1.75 0-2.3-4.85-1.1-4.85-3.55 0-1 .9-1.75 2.4-1.75 1.3 0 2.05.5 2.35 1.3" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  ),
  pg: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinejoin="round" strokeLinecap="round">
      <path d="M17.6 3.4c-1.5-.5-3.6-.6-5.6-.2-1.9-.5-4-.4-5.4.2-2 .9-2.8 2.7-2.5 5.3.2 2.3 1 5.2 2 7.4.5 1.1 1.1 2 1.8 2.3.7.3 1.4 0 2-.9.3-.5.6-1 .9-1.3.4.2.8.3 1.2.3s.8-.1 1.2-.3c.3.4.6.9.9 1.4.6.9 1.4 1.2 2.1.8.7-.4 1.3-1.4 1.8-2.6.9-2.2 1.6-5 1.8-7.2.2-2.5-.5-4.3-2.2-5.2z" />
      <path d="M9.3 8.4h.01M14.6 8.2h.01" strokeWidth="1.8" />
      <path d="M12.2 10.2c-.2 1.6-.1 2.9.2 4" strokeWidth="1.2" />
    </svg>
  ),
  tailwind: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7.1 10.5c.7-2.8 2.45-4.2 5.1-4.2 3.95 0 4.45 2.95 6.45 3.45 1.3.3 2.45-.1 3.45-1.3-.7 2.8-2.45 4.2-5.1 4.2-3.95 0-4.45-2.95-6.45-3.45-1.3-.3-2.45.1-3.45 1.3z" />
      <path d="M2 17.1c.7-2.8 2.45-4.2 5.1-4.2 3.95 0 4.45 2.95 6.45 3.45 1.3.3 2.45-.1 3.45-1.3-.7 2.8-2.45 4.2-5.1 4.2-3.95 0-4.45-2.95-6.45-3.45-1.3-.3-2.45.1-3.45 1.3z" />
    </svg>
  ),
};

/** Ordem importa: os 4 primeiros vão para a coluna esquerda, os 4 últimos para a direita. */
export const STACKS = [
  { k: "html",     nome: "HTML5",      sub: "estrutura",          accent: "green",  cmd: 'stack.info("html5")',      desc: "Estrutura semântica, acessibilidade e a base de toda página web." },
  { k: "css",      nome: "CSS3",       sub: "estilização",        accent: "purple", cmd: 'stack.info("css3")',       desc: "Flexbox, Grid, animações e layouts responsivos de verdade." },
  { k: "js",       nome: "JAVASCRIPT", sub: "interatividade",     accent: "green",  cmd: 'stack.info("javascript")', desc: "ES6+, programação assíncrona, DOM e consumo de APIs REST." },
  { k: "ts",       nome: "TYPESCRIPT", sub: "tipagem estática",   accent: "purple", cmd: 'stack.info("typescript")', desc: "Tipagem estática para código que escala sem quebrar em produção." },
  { k: "react",    nome: "REACT",      sub: "biblioteca UI",      accent: "green",  cmd: 'stack.info("react")',      desc: "Componentes, hooks e estado em interfaces de nível corporativo." },
  { k: "node",     nome: "NODE.JS",    sub: "runtime backend",    accent: "purple", cmd: 'stack.info("node")',       desc: "APIs REST com Express, autenticação JWT e arquitetura limpa." },
  { k: "pg",       nome: "POSTGRESQL", sub: "banco de dados",     accent: "green",  cmd: 'stack.info("postgres")',   desc: "Modelagem relacional, queries otimizadas e ORMs modernos." },
  { k: "tailwind", nome: "TAILWIND",   sub: "estilização rápida", accent: "purple", cmd: 'stack.info("tailwind")',   desc: "Estilo utilitário para entregar interface rápido e consistente." },
];

export const IDLE = {
  cmd: "devclub --stacks",
  desc: "Passe o mouse em uma delas\npara ver os detalhes.",
};
