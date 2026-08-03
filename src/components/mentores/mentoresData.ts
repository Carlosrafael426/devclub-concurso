export type Mentor = {
  id: string;
  nome: string;
  cargo: string;
  experiencia: string;
  foco: string;
  alunos: string;
  foto: string;
  accent: 'green' | 'purple';
  tag: string;
};

// Ordem = ordem visual dos slots na rede (topo-esquerda, topo-direita,
// meio-esquerda, meio-direita, base-centro) — ver .mtr-web[data-slot] em
// mentores.css.
export const MENTORES: Mentor[] = [
  { id: 'MT-01', nome: 'Rodolfo Mori', cargo: 'Fundador & CEO', experiencia: '12 anos', foco: 'Carreira & Mercado', alunos: '17.000+', foto: 'https://i.pravatar.cc/420?img=13', accent: 'green', tag: 'LIDERANÇA' },
  { id: 'MT-02', nome: 'Alexandre Reis', cargo: 'Head de Ensino', experiencia: '9 anos', foco: 'Front-end & React', alunos: '6.200+', foto: 'https://i.pravatar.cc/420?img=12', accent: 'green', tag: 'EDUCAÇÃO' },
  { id: 'MT-03', nome: 'Gabriela Vasconcelos', cargo: 'Tutora Sênior', experiencia: '7 anos', foco: 'Node.js & APIs', alunos: '4.800+', foto: 'https://i.pravatar.cc/420?img=45', accent: 'purple', tag: 'MENTORIA' },
  { id: 'MT-04', nome: 'George Almeida', cargo: 'Mentor de Carreira', experiencia: '8 anos', foco: 'Entrevistas técnicas', alunos: '5.400+', foto: 'https://i.pravatar.cc/420?img=52', accent: 'purple', tag: 'ESTRATÉGIA' },
  { id: 'MT-05', nome: 'Andrey Nogueira', cargo: 'Dev Sênior', experiencia: '10 anos', foco: 'Arquitetura & Cloud', alunos: '3.100+', foto: 'https://i.pravatar.cc/420?img=33', accent: 'purple', tag: 'DESENVOLVIMENTO' },
];
