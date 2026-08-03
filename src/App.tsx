import { useEffect } from 'react';
import { Navbar } from './components/devclub/Navbar';
import Hero from './components/hero/Hero';
import Stacks from './components/stacks/Stacks';
import Depoimentos from './components/depoimentos/Depoimentos';
import Mentores from './components/mentores/Mentores';
import Empresas from './components/empresas/Empresas';
import { CTAFinal } from './components/devclub/CTAFinal';
import { NetworkBackground } from './components/devclub/NetworkBackground';
import { ScrollProgress } from './components/ui/ScrollProgress';
import { Intro } from './components/devclub/Intro';
import { Logo } from './components/ui/Logo';
import { initSmoothScroll } from './lib/lenis';
import { useReducedMotion } from './hooks/useReducedMotion';

/**
 * App - Componente raiz do projeto.
 * Estrutura a landing page carregando o cabeçalho global e todas as seções principais.
 * O smooth scroll (Lenis) só é inicializado quando o usuário não pediu
 * `prefers-reduced-motion` — nesse caso o scroll nativo do navegador é
 * mantido, que já é acessível e previsível por padrão. `#site` nasce com
 * opacity:0 via style inline no próprio JSX (não depois via JS) sempre que
 * a intro vai rodar de verdade (todo carregamento de página, exceto com
 * reduced-motion) — sem isso haveria um frame com tudo visível antes da
 * Fase B da intro sequestrar a revelação.
 */
function App() {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    const destroy = initSmoothScroll();
    return destroy;
  }, [reducedMotion]);

  const introWillRun = !reducedMotion;

  return (
    <>
      <Intro />
      <div
        id="site"
        style={{ opacity: introWillRun ? 0 : 1 }}
        className="relative min-h-screen bg-black-dark selection:bg-green-normal/30 selection:text-green-normal"
      >
        <NetworkBackground />
        <ScrollProgress />
        <Navbar />

        <main>
          <Hero />
          <Stacks />
          <Depoimentos />
          <Empresas />
          <Mentores />
        </main>

        <CTAFinal />

        <footer className="relative z-10 py-10 sm:py-12 border-t border-white/5 bg-black-dark/90">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div className="flex items-center select-none">
              <Logo size={32} color="green" className="drop-shadow-[0_0_8px_rgba(57, 211, 83, 0.2)]" />
            </div>
            <span className="font-sans text-sm text-gray-300">
              &copy; {new Date().getFullYear()} DevClub. Todos os direitos reservados.
            </span>
            <div className="flex flex-col items-center md:items-end gap-2">
              <div className="flex items-center justify-center gap-3">
                <a
                  href="https://www.youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="site-icon flex h-9 w-9 items-center justify-center text-gray-300 transition-all hover:-translate-y-0.5 hover:text-green-normal"
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
                  className="site-icon flex h-9 w-9 items-center justify-center text-gray-300 transition-all hover:-translate-y-0.5 hover:text-green-normal"
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
                  className="site-icon flex h-9 w-9 items-center justify-center text-gray-300 transition-all hover:-translate-y-0.5 hover:text-green-normal"
                  aria-label="LinkedIn"
                >
                  <span className="text-base font-semibold tracking-[-0.08em]" aria-hidden="true">
                    in
                  </span>
                </a>
              </div>
              <div className="flex items-center gap-6 font-sans text-sm text-gray-300">
                <a href="#termos" className="hover:text-white transition-colors">Termos de Uso</a>
                <a href="#privacidade" className="hover:text-white transition-colors">Privacidade</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

export default App;
