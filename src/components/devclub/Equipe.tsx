import { Globe } from 'lucide-react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
/**
 * Equipe - Seção de mentores e time de suporte técnico do DevClub.
 * Mostra os mentores, suas experiências anteriores e links de redes profissionais.
 */
export const Equipe: React.FC = () => {
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation(0.2);
  const { ref: cardsRef, isVisible: cardsVisible } = useScrollAnimation(0.2);
  const time = [
    {
      name: "Rodolfo Mori",
      role: "Fundador & Mentor Principal",
      bio: "Ex-metalúrgico que migrou para a tecnologia há mais de 10 anos. Já atuou como Engenheiro de Software sênior em grandes multinacionais brasileiras e americanas. Criou o DevClub para democratizar o ensino de programação real.",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200",
      github: "https://github.com",
      linkedin: "https://linkedin.com",
      site: "https://devclub.com.br"
    },
    {
      name: "Alexandre Reis",
      role: "Co-fundador & Tech Lead",
      bio: "Especialista em arquitetura de microsserviços Node.js e computação em nuvem (AWS). Lidera o desenvolvimento da plataforma do aluno do DevClub e garante que a infraestrutura técnica ensinada esteja sempre atualizada.",
      image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200&h=200",
      github: "https://github.com",
      linkedin: "https://linkedin.com",
      site: ""
    },
    {
      name: "Gabriela Vasconcelos",
      role: "Coordenadora de Suporte ao Aluno",
      bio: "Especialista em Front-end React. Lidera o time de monitores que responde as dúvidas dos alunos em menos de 10 minutos. Focada em auxiliar nas dúvidas de códigos e desafios de portfólio prático.",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200",
      github: "https://github.com",
      linkedin: "https://linkedin.com",
      site: ""
    }
  ];

  return (
    <section id="equipe" className="relative py-20 sm:py-24 bg-brand-surface/50 border-t border-white/[0.03] overflow-hidden">
      {/* Glow de fundo */}
      <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] rounded-full green-glow opacity-25 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Título da Seção */}
        <div ref={titleRef} className={`text-center max-w-3xl mx-auto mb-12 sm:mb-16 fade-up ${titleVisible ? 'visible' : ''}`}>
          <span className="font-sans font-bold text-[11px] sm:text-xs tracking-widest text-brand-green uppercase">
            QUEM VAI TE CONDUZIR
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight text-white mt-3">
            Apoiado por quem vive da
            <span className="bg-gradient-to-r from-brand-green via-brand-green-light to-brand-purple bg-clip-text text-transparent">
              <br /> tecnologia no dia a dia
            </span>
          </h2>
          <p className="font-sans text-slate-400 mt-4 text-base sm:text-lg">
            Nossos mentores não ensinam apenas teoria acadêmica. Eles trazem a vivência das maiores empresas e os segredos práticos do desenvolvimento comercial.
          </p>
        </div>

        {/* Grade de Mentores */}
        <div ref={cardsRef} className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8 fade-up ${cardsVisible ? 'visible' : ''}`}>
          {time.map((mentor, idx) => (
            <div
              key={idx}
              className={`p-6 sm:p-8 rounded-xl glass-panel flex flex-col items-center text-center gap-6 delay-${(idx + 1) * 100}`}
            >
              {/* Imagem do Mentor */}
              <div className="relative">
                <img
                  src={mentor.image}
                  alt={mentor.name}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-lg object-cover border-2 border-white/[0.05]"
                />
              </div>

              {/* Detalhes do Mentor */}
              <div>
                <h3 className="font-display font-extrabold text-xl text-white">
                  {mentor.name}
                </h3>
                <span className="text-xs font-semibold text-brand-purple-light block mt-1 uppercase tracking-wider">
                  {mentor.role}
                </span>
                <div className="mx-auto mt-2 h-px w-16 bg-gradient-to-r from-transparent via-brand-green/70 to-transparent" />
                <p className="font-sans text-sm text-slate-400 mt-4 leading-relaxed">
                  {mentor.bio}
                </p>
              </div>

              {/* Redes Sociais com ícones SVG inline */}
              <div className="flex items-center gap-4 mt-2">
                <a
                  href={mentor.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="site-icon text-slate-400 hover:text-white transition-colors"
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
                  className="site-icon text-slate-400 hover:text-blue-500 transition-colors"
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
                    className="site-icon text-slate-400 hover:text-brand-purple-light transition-colors"
                    aria-label={`Website de ${mentor.name}`}
                  >
                    <Globe size={20} className="site-icon" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
