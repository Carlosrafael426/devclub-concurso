import { Globe } from 'lucide-react';
import { Reveal } from '../ui/Reveal';
import { TiltCard } from '../ui/TiltCard';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { DISTANCE } from '../../lib/motion';
/**
 * Equipe - Seção de mentores e time de suporte técnico do DevClub.
 * Hover cinematográfico: foto em grayscale por padrão, ganha cor no hover
 * e a bio desliza de baixo para cima via clip-path — nome/cargo continuam
 * sempre legíveis (legenda fixa) para não depender do hover em touch. Era
 * a seção com menos interatividade da página (nenhum hover de card antes).
 * O tilt 3D (TiltCard) usa o mesmo componente genérico do Hero.
 */
export const Equipe: React.FC = () => {
  const time = [
    {
      name: "Rodolfo Mori",
      role: "Fundador & Mentor Principal",
      bio: "Ex-metalúrgico que migrou para a tecnologia há mais de 10 anos. Já atuou como Engenheiro de Software sênior em grandes multinacionais brasileiras e americanas. Criou o DevClub para democratizar o ensino de programação real.",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=500&h=650",
      github: "https://github.com",
      linkedin: "https://linkedin.com",
      site: "https://devclub.com.br"
    },
    {
      name: "Alexandre Reis",
      role: "Co-fundador & Tech Lead",
      bio: "Especialista em arquitetura de microsserviços Node.js e computação em nuvem (AWS). Lidera o desenvolvimento da plataforma do aluno do DevClub e garante que a infraestrutura técnica ensinada esteja sempre atualizada.",
      image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=500&h=650",
      github: "https://github.com",
      linkedin: "https://linkedin.com",
      site: ""
    },
    {
      name: "Gabriela Vasconcelos",
      role: "Coordenadora de Suporte ao Aluno",
      bio: "Especialista em Front-end React. Lidera o time de monitores que responde as dúvidas dos alunos em menos de 10 minutos. Focada em auxiliar nas dúvidas de códigos e desafios de portfólio prático.",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=500&h=650",
      github: "https://github.com",
      linkedin: "https://linkedin.com",
      site: ""
    }
  ];

  return (
    <section id="equipe" className="relative py-20 sm:py-24 bg-black-normal/50 border-t border-white/[0.03] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Título da Seção */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <Reveal as="div" y={DISTANCE.sm} className="flex justify-center">
            <Badge>quem vai te conduzir_</Badge>
          </Reveal>
          <Reveal as="h2" split="words" delay={0.1} className="font-display font-normal text-3xl sm:text-4xl md:text-5xl text-white mt-3">
            Apoiado por quem vive da <br /> tecnologia no dia a dia
          </Reveal>
          <Reveal as="p" y={DISTANCE.sm} delay={0.25} className="font-sans font-medium text-gray-300 mt-4 text-base sm:text-lg">
            Nossos mentores não ensinam apenas teoria acadêmica. Eles trazem a vivência das maiores empresas e os segredos práticos do desenvolvimento comercial.
          </Reveal>
        </div>

        {/* Grade de Mentores */}
        <Reveal as="div" stagger delay={0.35} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
          {time.map((mentor, idx) => (
            <TiltCard key={idx} max={5} className="overflow-hidden">
              <Card as="div" padded={false} hoverable={false} className="group flex h-full flex-col overflow-hidden">
                {/* Foto cinematográfica: grayscale -> cor no hover, bio revelada por clip-path */}
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={mentor.image}
                    alt={mentor.name}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover grayscale scale-[1.04] transition-all duration-500 ease-out group-hover:grayscale-0 group-hover:scale-100"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-5 pt-14 pb-4">
                    <h3 className="font-display font-normal text-lg text-white">{mentor.name}</h3>
                    <span className="text-[11px] font-semibold text-purple-light uppercase tracking-wider">
                      {mentor.role}
                    </span>
                  </div>
                  <div className="absolute inset-0 flex items-end bg-black/85 p-5 [clip-path:inset(100%_0_0_0)] transition-[clip-path] duration-500 ease-out group-hover:[clip-path:inset(0_0_0_0)]">
                    <p className="font-sans font-medium text-sm text-gray-200 leading-relaxed">
                      {mentor.bio}
                    </p>
                  </div>
                </div>

                {/* Redes Sociais com ícones SVG inline */}
                <div className="flex items-center justify-center gap-4 py-5">
                  <a
                    href={mentor.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="site-icon text-gray-300 hover:text-white transition-colors"
                    aria-label={`GitHub de ${mentor.name}`}
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a
                    href={mentor.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="site-icon text-gray-300 hover:text-blue-500 transition-colors"
                    aria-label={`LinkedIn de ${mentor.name}`}
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                    </svg>
                  </a>
                  {mentor.site && (
                    <a
                      href={mentor.site}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="site-icon text-gray-300 hover:text-purple-light transition-colors"
                      aria-label={`Website de ${mentor.name}`}
                    >
                      <Globe size={20} className="site-icon" />
                    </a>
                  )}
                </div>
              </Card>
            </TiltCard>
          ))}
        </Reveal>
      </div>
    </section>
  );
};
