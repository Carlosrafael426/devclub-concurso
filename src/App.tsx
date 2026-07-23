import { Navbar } from './components/devclub/Navbar';
import { Hero } from './components/devclub/Hero';
import { Formacoes } from './components/devclub/Formacoes';
import { Alunos } from './components/devclub/Alunos';
import { Equipe } from './components/devclub/Equipe';
import { Empresas } from './components/devclub/Empresas';
import { CTAFinal } from './components/devclub/CTAFinal';

/**
 * App - Componente raiz do projeto.
 * Estrutura a landing page carregando o cabeçalho global e todas as seções principais.
 */
function App() {
  return (
    <div className="relative min-h-screen bg-brand-bg selection:bg-brand-green/30 selection:text-brand-green">
      <Navbar />

      <main>
        <Hero />
        <Formacoes />
        <Alunos />
        <Empresas />
        <Equipe />
      </main>

      <CTAFinal />

      <footer className="py-10 sm:py-12 border-t border-white/5 bg-brand-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex items-center select-none">
            <svg className="w-8 h-8 drop-shadow-[0_0_8px_rgba(57, 211, 83, 0.2)]" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="4" width="12" height="12" rx="2.5" stroke="#39D353" strokeWidth="2.5" />
              <rect x="7.5" y="7.5" width="5" height="5" rx="1" fill="#39D353" />
              <rect x="24" y="4" width="12" height="12" rx="2.5" stroke="#39D353" strokeWidth="2.5" />
              <rect x="27.5" y="7.5" width="5" height="5" rx="1" fill="#39D353" />
              <rect x="4" y="24" width="12" height="12" rx="2.5" stroke="#39D353" strokeWidth="2.5" />
              <rect x="7.5" y="27.5" width="5" height="5" rx="1" fill="#39D353" />
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
          </div>
          <span className="font-sans text-sm text-slate-500">
            &copy; {new Date().getFullYear()} DevClub. Todos os direitos reservados.
          </span>
          <div className="flex flex-col items-center md:items-end gap-2">
            <div className="flex items-center justify-center gap-3">
              <a
                href="https://www.youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="site-icon flex h-9 w-9 items-center justify-center text-slate-400 transition-all hover:-translate-y-0.5 hover:text-brand-green"
                aria-label="YouTube"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                  <path d="M23.5 6.2a3.02 3.02 0 0 0-2.12-2.14C19.56 3.5 12 3.5 12 3.5s-7.56 0-9.38.56A3.02 3.02 0 0 0 .5 6.2 31.3 31.3 0 0 0 0 12a31.3 31.3 0 0 0 .5 5.8 3.02 3.02 0 0 0 2.12 2.14C4.44 20.5 12 20.5 12 20.5s7.56 0 9.38-.56a3.02 3.02 0 0 0 2.12-2.14A31.3 31.3 0 0 0 24 12a31.3 31.3 0 0 0-.5-5.8ZM9.75 15.5v-7l6.25 3.5-6.25 3.5Z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="site-icon flex h-9 w-9 items-center justify-center text-slate-400 transition-all hover:-translate-y-0.5 hover:text-brand-green"
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                  <path d="M7.03 2h9.94A5.03 5.03 0 0 1 22 7.03v9.94A5.03 5.03 0 0 1 16.97 22H7.03A5.03 5.03 0 0 1 2 16.97V7.03A5.03 5.03 0 0 1 7.03 2Zm0 2A3.03 3.03 0 0 0 4 7.03v9.94A3.03 3.03 0 0 0 7.03 20h9.94A3.03 3.03 0 0 0 20 16.97V7.03A3.03 3.03 0 0 0 16.97 4H7.03Zm9.83 1.6a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="site-icon flex h-9 w-9 items-center justify-center text-slate-400 transition-all hover:-translate-y-0.5 hover:text-brand-green"
                aria-label="LinkedIn"
              >
                <span className="text-base font-semibold tracking-[-0.08em]" aria-hidden="true">
                  in
                </span>
              </a>
            </div>
            <div className="flex items-center gap-6 font-sans text-sm text-slate-500">
              <a href="#termos" className="hover:text-slate-300 transition-colors">Termos de Uso</a>
              <a href="#privacidade" className="hover:text-slate-300 transition-colors">Privacidade</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
