import { useState } from 'react';
import { Menu, X } from 'lucide-react';

/**
 * Navbar - Componente de navegação superior responsivo
 * Apresenta a logo do DevClub, links principais de navegação e botão CTA
 */
export const Navbar: React.FC = () => {
  // Estado para controlar a abertura/fechamento do menu mobile
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 border-b border-white/[0.05] bg-[#111012]/80 backdrop-blur-md transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">

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
        <div className="hidden md:flex items-center gap-8 font-sans font-medium text-sm text-slate-300">
          <a
            href="#formacoes"
            className="relative py-1 hover:text-white transition-colors duration-200 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-brand-green hover:after:w-full after:transition-all after:duration-[600ms]"
          >
            Formações
          </a>
          <a
            href="#alunos"
            className="relative py-1 hover:text-white transition-colors duration-200 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-brand-green hover:after:w-full after:transition-all after:duration-[600ms]"
          >
            Alunos
          </a>
          <a
            href="#equipe"
            className="relative py-1 hover:text-white transition-colors duration-200 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-brand-green hover:after:w-full after:transition-all after:duration-[600ms]"
          >
            Equipe
          </a>
        </div>

        {/* Botão de Ação Desktop — group + contra-escala para crescer o botão sem aumentar as letras */}
        <div className="hidden md:flex items-center">
          <a
            href="#inscricao"
            className="group flex items-center px-6 py-2.5 rounded-lg bg-brand-green text-[#111012] font-display font-bold text-sm tracking-wide shadow-[0_6px_24px_rgba(57, 211, 83, 0.28)] hover:shadow-[0_10px_36px_rgba(57, 211, 83, 0.5)] hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            {/* Span interno com escala inversa (1/1.05 ≈ 0.952) para manter o texto no tamanho original */}
            <span className="inline-flex items-center gap-2 group-hover:scale-[0.952] transition-transform duration-300">
              Quero ser dev
            </span>
          </a>
        </div>

        {/* Hambúrguer Menu Mobile */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X size={24} className="site-icon" /> : <Menu size={24} className="site-icon" />}
        </button>
      </div>

      {/* Menu Dropdown Mobile */}
      {isOpen && (
        <div className="md:hidden absolute left-0 right-0 top-full bg-[#111012]/95 border-b border-white/[0.05] backdrop-blur-lg flex flex-col py-6 px-6 sm:px-8 gap-6 shadow-2xl animate-fade-in">
          <a
            href="#formacoes"
            onClick={() => setIsOpen(false)}
            className="font-sans font-medium text-lg text-slate-300 hover:text-white transition-colors"
          >
            Formações
          </a>
          <a
            href="#alunos"
            onClick={() => setIsOpen(false)}
            className="font-sans font-medium text-lg text-slate-300 hover:text-white transition-colors"
          >
            Alunos
          </a>
          <a
            href="#equipe"
            onClick={() => setIsOpen(false)}
            className="font-sans font-medium text-lg text-slate-300 hover:text-white transition-colors"
          >
            Equipe
          </a>
          <a
            href="#inscricao"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center gap-2 py-3.5 rounded-lg bg-brand-green text-[#111012] font-display font-extrabold text-base tracking-wide shadow-[0_8px_28px_rgba(57, 211, 83, 0.3)]"
          >
            Quero ser dev
          </a>
        </div>
      )}
    </nav>
  );
};
