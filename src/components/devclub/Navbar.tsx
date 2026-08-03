import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { ButtonPrimary } from '../ui/ButtonPrimary';
import { Logo } from '../ui/Logo';

const NAV_SECTIONS = [
  { id: 'stacks', label: 'Stacks' },
  { id: 'depoimentos', label: 'Depoimentos' },
  { id: 'mentores', label: 'Mentores' },
];

/**
 * Navbar - Componente de navegação superior responsivo.
 * Fica sempre fixo e sempre visível — nunca esconde ao rolar, que
 * removeria uma affordance de navegação sem ganho real. O que muda com o
 * scroll é só a cor do fundo (rgba interpolado direto por frame, piso
 * mínimo de .02 pra nunca ficar 100% transparente) e a opacidade da borda
 * inferior; um indicador de seção ativa acompanha via
 * ScrollTrigger.toggleClass.
 */
export const Navbar: React.FC = () => {
  // Estado para controlar a abertura/fechamento do menu mobile
  const [isOpen, setIsOpen] = useState(false);
  const bgRef = useRef<HTMLDivElement | null>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (bgRef.current) {
        const bg = bgRef.current;
        if (reducedMotion) {
          bg.style.backgroundColor = 'rgba(218, 255, 245, 0.08)';
          bg.style.borderBottomColor = 'rgba(218, 255, 245, 0.2)';
        } else {
          // Interpola os canais rgba diretamente por frame de scroll (não
          // a opacidade do elemento inteiro) para que o fundo nunca fique
          // 100% transparente — sobra um piso mínimo de tingimento (.02)
          // mesmo no topo, só não compete com o hero. Sem transition CSS
          // aqui: é um valor amarrado a scroll, precisa seguir 1:1 o dedo
          // do usuário (ease:none), uma transição suavizada criaria atraso.
          const paint = (t: number) => {
            bg.style.backgroundColor = `rgba(218, 255, 245, ${0.02 + t * 0.06})`;
            bg.style.borderBottomColor = `rgba(218, 255, 245, ${t * 0.2})`;
          };
          paint(0);
          ScrollTrigger.create({
            trigger: document.documentElement,
            start: 'top top',
            end: '+=120',
            onUpdate: (self) => paint(self.progress),
          });
        }
      }

      // Indicador de seção ativa: um toggle de classe discreto, não uma
      // animação — mantido mesmo com prefers-reduced-motion.
      NAV_SECTIONS.forEach((section, idx) => {
        const target = document.getElementById(section.id);
        const link = linkRefs.current[idx];
        if (!target || !link) return;
        ScrollTrigger.create({
          trigger: target,
          start: 'top center',
          end: 'bottom center',
          toggleClass: { targets: link, className: 'nav-link-active' },
        });
      });
    });

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <nav className="fixed top-0 left-0 w-full z-40">
      <div ref={bgRef} className="absolute inset-0 border-b backdrop-blur-md" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 h-[72px] flex items-center justify-between">

        {/* Logo DevClub — aparece perto do fim da intro cinematográfica
            (Fase B), criando continuidade de objeto com o logo grande que
            some: o usuário entende que a marca "foi para lá", em vez de só
            sumir e reaparecer sem relação. */}
        <div className="flex items-center select-none">
          <a href="#hero" className="cursor-pointer hover:scale-110 hover:drop-shadow-[0_0_20px_rgba(57, 211, 83, 0.5)] transition-all duration-300" aria-label="Voltar para o topo">
            <Logo
              id="nav-logo-icon"
              size={44}
              color="green"
              className="opacity-0 drop-shadow-[0_0_12px_rgba(57, 211, 83, 0.3)]"
            />
          </a>
        </div>

        {/* Menu Desktop */}
        <div className="hidden md:flex items-center gap-8 font-sans font-medium text-sm text-gray-300">
          {NAV_SECTIONS.map((section, idx) => (
            <a
              key={section.id}
              ref={(el) => {
                linkRefs.current[idx] = el;
              }}
              href={`#${section.id}`}
              className="relative py-1 hover:text-green-normal transition-colors duration-200 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-green-normal hover:after:w-full after:transition-all after:duration-[600ms]"
            >
              {section.label}
            </a>
          ))}
        </div>

        {/* Botão de Ação Desktop */}
        <div className="hidden md:flex items-center">
          <ButtonPrimary href="#inscricao">
            Quero ser dev
          </ButtonPrimary>
        </div>

        {/* Hambúrguer Menu Mobile */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-gray-300 hover:text-white transition-colors"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X size={24} className="site-icon" /> : <Menu size={24} className="site-icon" />}
        </button>
      </div>

      {/* Menu Dropdown Mobile */}
      {isOpen && (
        <div className="md:hidden absolute left-0 right-0 top-full bg-black-normal/95 border-b border-[rgba(218,255,245,0.2)] backdrop-blur-lg flex flex-col py-6 px-6 sm:px-8 gap-6 shadow-2xl animate-fade-in">
          <a
            href="#stacks"
            onClick={() => setIsOpen(false)}
            className="font-sans font-medium text-lg text-gray-300 hover:text-green-normal transition-colors"
          >
            Stacks
          </a>
          <a
            href="#depoimentos"
            onClick={() => setIsOpen(false)}
            className="font-sans font-medium text-lg text-gray-300 hover:text-green-normal transition-colors"
          >
            Depoimentos
          </a>
          <a
            href="#mentores"
            onClick={() => setIsOpen(false)}
            className="font-sans font-medium text-lg text-gray-300 hover:text-green-normal transition-colors"
          >
            Mentores
          </a>
          <ButtonPrimary href="#inscricao" className="w-full justify-center" onClick={() => setIsOpen(false)}>
            Quero ser dev
          </ButtonPrimary>
        </div>
      )}
    </nav>
  );
};
