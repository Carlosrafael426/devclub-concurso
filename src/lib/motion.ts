/**
 * Tokens de motion design.
 * Centralizados para garantir consistência perceptual: o usuário deve
 * sentir que todos os elementos da página obedecem à mesma física.
 * Alterar um valor aqui propaga para toda a interface — nenhum
 * componente deve declarar duração/easing/distância por conta própria.
 */
export const DURATION = {
  micro: 0.2, // hover, foco, toggle
  reveal: 0.8, // entrada de elemento em viewport
  feature: 1.2, // momento assinatura (trilha pinada, transição de seção)
} as const;

export const EASE = {
  out: 'power3.out',
  expo: 'expo.out', // reveals de destaque (títulos)
  in: 'power2.in',
  scrub: 'none', // obrigatório em qualquer ScrollTrigger com scrub
  back: 'back.out(1.7)', // microinterações com personalidade — usar com moderação
} as const;

export const STAGGER = {
  chars: 0.03,
  words: 0.05,
  cards: 0.09,
  modules: 0.012, // módulos do logo se montando na intro (Intro.tsx)
} as const;

export const DISTANCE = {
  sm: 16,
  md: 24,
  lg: 32,
} as const;
