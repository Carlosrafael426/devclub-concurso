export type Mentor = {
  id: string;
  nome: string;
  cargo: string;
  experiencia: string;
  foco: string;
  alunos: string;
  foto: string;
};

export const MENTORES: Mentor[] = [
  { id: 'MT-01', nome: 'Rodolfo Mori', cargo: 'Fundador & CEO', experiencia: '12 anos', foco: 'Carreira & Mercado', alunos: '17.000+', foto: 'https://i.pravatar.cc/420?img=13' },
  { id: 'MT-02', nome: 'Alexandre Reis', cargo: 'Head de Ensino', experiencia: '9 anos', foco: 'Front-end & React', alunos: '6.200+', foto: 'https://i.pravatar.cc/420?img=12' },
  { id: 'MT-03', nome: 'Gabriela Vasconcelos', cargo: 'Tutora Sênior', experiencia: '7 anos', foco: 'Node.js & APIs', alunos: '4.800+', foto: 'https://i.pravatar.cc/420?img=45' },
  { id: 'MT-04', nome: 'Andrey Nogueira', cargo: 'Dev Sênior', experiencia: '10 anos', foco: 'Arquitetura & Cloud', alunos: '3.100+', foto: 'https://i.pravatar.cc/420?img=33' },
  { id: 'MT-05', nome: 'George Almeida', cargo: 'Mentor de Carreira', experiencia: '8 anos', foco: 'Entrevistas técnicas', alunos: '5.400+', foto: 'https://i.pravatar.cc/420?img=52' },
];
