import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import { EASE } from '../../lib/motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { ButtonPrimary } from '../ui/ButtonPrimary';

const NAV_SECTIONS = [
  { id: 'formacoes', label: 'Formações' },
  { id: 'alunos', label: 'Alunos' },
  { id: 'equipe', label: 'Equipe' },
];

/**
 * Navbar - Componente de navegação superior responsivo.
 * Antes era 100% estática (sem nenhuma lógica de scroll); agora o fundo
 * ganha opacidade progressiva nos primeiros 120px de scroll (scrub,
 * ease:none) em vez de aparecer/sumir bruscamente, e um indicador de seção
 * ativa acompanha o scroll via ScrollTrigger.toggleClass — sem nunca
 * esconder o header, que é uma affordance de navegação permanente.
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
        if (reducedMotion) {
          gsap.set(bgRef.current, { opacity: 1 });
        } else {
          gsap.fromTo(
            bgRef.current,
            { opacity: 0 },
            {
              opacity: 1,
              ease: EASE.scrub,
              scrollTrigger: { trigger: document.documentElement, start: 'top top', end: '+=120', scrub: true },
            }
          );
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
    <nav className="fixed top-0 left-0 w-full z-50">
      <div ref={bgRef} className="absolute inset-0 border-b border-[rgba(218,255,245,0.2)] bg-[rgba(218,255,245,0.05)] backdrop-blur-md opacity-0" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">

        {/* Logo DevClub (Apenas o Ícone estilo QR-Code Verde com link para o topo/hero) */}
        <div className="flex items-center select-none">
          <a href="#hero" className="cursor-pointer hover:scale-110 hover:drop-shadow-[0_0_20px_rgba(57, 211, 83, 0.5)] transition-all duration-300" aria-label="Voltar para o topo">
            <svg className="w-11 h-11 drop-shadow-[0_0_12px_rgba(57, 211, 83, 0.3)]" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Finder Pattern - Superior Esquerdo */}
              <rect x="4" y="4" width="12" height="12" rx="2.5" stroke="#39D353" strokeWidth="2.5" />
              <rect x="7.5" y="7.5" width="5" height="5" rx="1" fill="#39D353" />

              {/* Finder Pattern - Superior Direito */}
              <rect x="24" y="4" width="12" height="12" rx="2.5" stroke="#39D353" strokeWidth="2.5" />
              <rect x="27.5" y="7.5" width="5" height="5" rx="1" fill="#39D353" />

              {/* Finder Pattern - Inferior Esquerdo */}
              <rect x="4" y="24" width="12" height="12" rx="2.5" stroke="#39D353" strokeWidth="2.5" />
              <rect x="7.5" y="27.5" width="5" height="5" rx="1" fill="#39D353" />

              {/* Pixels de dados espalhados representativos do QR Code */}
              <rect x="19.5" y="7.5" width="2.5" height="2.5" rx="0.5" fill="#39D353" />
              <rect x="19.5" y="12" width="2.5" height="2.5" rx="0.5" fill="#39D353" />
              <rect x="19.5" y="19.5" width="5" height="5" rx="1" fill="#39D353" />

              <rect x="7.5" y="19.5" width="2.5" height="2.5" rx="0.5" fill="#39D353" />
              <rect x="12" y="19.5" width="2.5" height="2.5" rx="0.5" fill="#39D353" />

              <rect x="26.5" y="19.5" width="2.5" height="2.5" rx="0.5" fill="#39D353" />
              <rect x="31" y="19.5" width="2.5" height="2.5" rx="0.5" fill="#39D353" />

              <rect x="19.5" y="26.5" width="2.5" height="2.5" rx="0.5" fill="#39D353" />
              <rect x="26.5" y="26.5" width="5" height="5" rx="1" fill="#39D353" />

              <rect x="19.5" y="32.5" width="2.5" height="2.5" rx="0.5" fill="#39D353" />
              <rect x="24" y="32.5" width="2.5" height="2.5" rx="0.5" fill="#39D353" />
              <rect x="29.5" y="32.5" width="5" height="5" rx="1" fill="#39D353" />
            </svg>
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
          <ButtonPrimary href="#inscricao" magnetic={false}>
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
            href="#formacoes"
            onClick={() => setIsOpen(false)}
            className="font-sans font-medium text-lg text-gray-300 hover:text-green-normal transition-colors"
          >
            Formações
          </a>
          <a
            href="#alunos"
            onClick={() => setIsOpen(false)}
            className="font-sans font-medium text-lg text-gray-300 hover:text-green-normal transition-colors"
          >
            Alunos
          </a>
          <a
            href="#equipe"
            onClick={() => setIsOpen(false)}
            className="font-sans font-medium text-lg text-gray-300 hover:text-green-normal transition-colors"
          >
            Equipe
          </a>
          <ButtonPrimary href="#inscricao" magnetic={false} className="w-full justify-center" onClick={() => setIsOpen(false)}>
            Quero ser dev
          </ButtonPrimary>
        </div>
      )}
    </nav>
  );
};
