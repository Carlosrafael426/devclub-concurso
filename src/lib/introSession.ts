/**
 * Fonte única da flag "intro já vista nesta aba". Precisa ser uma função
 * pura e síncrona (sem hook) porque dois componentes independentes
 * (Intro.tsx e App.tsx) precisam da mesma resposta ANTES do primeiro
 * paint — App.tsx decide a opacidade inicial de #site, Intro.tsx decide
 * se monta a sequência inteira ou não. Ler isso de dois lugares via
 * sessionStorage direto duplicaria a chave; centralizado aqui, muda uma
 * vez se precisar.
 */
export const INTRO_SESSION_KEY = 'devclub:intro-seen';

export function hasSeenIntro(): boolean {
  return typeof window !== 'undefined' && sessionStorage.getItem(INTRO_SESSION_KEY) === '1';
}
