import { useEffect, useState } from 'react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

/**
 * Alunos - Seção de depoimentos e histórias de sucesso (cases reais)
 * Exibe alunos reais/fictícios que mudaram de carreira por meio do método DevClub.
 */
export const Alunos: React.FC = () => {
  const { ref: sectionRef, isVisible: sectionVisible } = useScrollAnimation(0.2);
  const { ref: statsRef, isVisible: statsVisible } = useScrollAnimation(0.2);
  const [stats, setStats] = useState({ employability: 0, salary: 0, vacancies: 0 });
  // Lista fictícia baseada em casos reais de transição de carreira comuns no DevClub
  const depoimentos = [
    {
      name: "Mateus Silva",
      oldJob: "Ex-Motorista de Aplicativo",
      newJob: "Desenvolvedor Front-end Júnior",
      company: "Softplan",
      quote: '"Eu não sabia nada de programação. Estudava nas pausas das corridas. O suporte individual e as mentorias do DevClub me deram a segurança para encarar o processo seletivo e passar na minha primeira vaga em 7 meses."',
      image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120&h=120"
    },
    {
      name: "Juliana Santos",
      oldJob: "Ex-Atendente de Telemarketing",
      newJob: "Desenvolvedora Full Stack",
      company: "Arezzo&Co",
      quote: '"A didática prática do DevClub foi essencial. Criar projetos reais idênticos aos de grandes empresas me destacou no LinkedIn. Hoje trabalho home office com um salário que eu nunca imaginei ganhar."',
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120&h=120"
    },
    {
      name: "Rodrigo Almeida",
      oldJob: "Ex-Vendedor de Loja",
      newJob: "Desenvolvedor Node.js",
      company: "Zup Innovation",
      quote: '"Estava cansado de trabalhar aos domingos e feriados. Decidi migrar para a área de tecnologia. O acompanhamento dos tutores do DevClub para tirar dúvidas diárias foi o diferencial para eu não desistir no meio do caminho."',
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120&h=120"
    }
  ];

  useEffect(() => {
    if (!statsVisible) return;

    const targets = { employability: 92, salary: 4200, vacancies: 2500 };
    const duration = 1400;
    const startTime = window.setTimeout(() => {
      const start = Date.now();
      const tick = () => {
        const progress = Math.min((Date.now() - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setStats({
          employability: Math.round(targets.employability * eased),
          salary: Math.round(targets.salary * eased),
          vacancies: Math.round(targets.vacancies * eased),
        });
        if (progress < 1) {
          window.requestAnimationFrame(tick);
        }
      };
      tick();
    }, 150);

    return () => {
      window.clearTimeout(startTime);
    };
  }, [statsVisible]);

  return (
    <section id="alunos" ref={sectionRef} className={`relative py-20 sm:py-24 bg-[#111012] fade-up ${sectionVisible ? 'visible' : ''}`}>
      {/* Luz difusa de fundo */}
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] rounded-full green-glow opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Título da Seção */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="font-sans font-bold text-[11px] sm:text-xs tracking-widest text-brand-green uppercase">
            HISTÓRIAS DE SUCESSO
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight text-white mt-3">
            Quem vivenciou o método <span className="bg-gradient-to-r from-brand-green via-brand-green-light to-brand-purple bg-clip-text text-transparent">
              <br /> na prática
            </span>
          </h2>
          <p className="font-sans text-slate-400 mt-4 text-base sm:text-lg">
            Veja a transformação de pessoas que começaram do zero absoluto e hoje constroem carreiras consolidadas nas maiores empresas de tecnologia do país.
          </p>
        </div>

        {/* Depoimentos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8">
          {depoimentos.map((depoimento, idx) => (
            <div
              key={idx}
              className={`relative p-6 sm:p-8 rounded-xl glass-panel flex flex-col justify-between gap-8 hover:scale-[1.01] transition-transform duration-300 delay-${(idx + 1) * 100}`}
            >
              <p className="font-sans text-slate-300 italic leading-relaxed relative z-10">
                {depoimento.quote}
              </p>

              {/* Informações do Aluno */}
              <div className="flex items-center gap-4">
                <img
                  src={depoimento.image}
                  alt={depoimento.name}
                  className="w-12 h-12 rounded-full object-cover border border-white/[0.1] flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-display font-bold text-sm text-white">{depoimento.name}</h4>
                  <div className="flex flex-col text-xs text-slate-400 mt-0.5 break-words">
                    <span className="text-rose-400 font-medium">{depoimento.oldJob}</span>
                    <span className="text-brand-green font-semibold mt-0.5">
                      {depoimento.newJob} @ {depoimento.company}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div ref={statsRef} className={`mt-12 sm:mt-20 p-6 sm:p-8 rounded-xl glass-panel flex flex-col md:flex-row justify-around items-center gap-6 sm:gap-8 text-center md:text-left fade-up ${statsVisible ? 'visible' : ''}`}>
          <div>
            <span className="font-display font-extrabold text-3xl sm:text-4xl text-white">{stats.employability}%</span>
            <p className="font-sans text-[10px] sm:text-xs text-slate-400 uppercase tracking-widest mt-1">Taxa de Empregabilidade</p>
          </div>
          <div className="w-px h-12 bg-white/[0.08] hidden md:block" />
          <div>
            <span className="font-display font-extrabold text-3xl sm:text-4xl text-white">R$ {stats.salary.toLocaleString('pt-BR')}</span>
            <p className="font-sans text-[10px] sm:text-xs text-slate-400 uppercase tracking-widest mt-1">Média salarial de contratação</p>
          </div>
          <div className="w-px h-12 bg-white/[0.08] hidden md:block" />
          <div>
            <span className="font-display font-extrabold text-3xl sm:text-4xl text-white">{stats.vacancies.toLocaleString('pt-BR')}+</span>
            <p className="font-sans text-[10px] sm:text-xs text-slate-400 uppercase tracking-widest mt-1">Vagas preenchidas por alunos</p>
          </div>
        </div>
      </div>
    </section>
  );
};