import { useLayoutEffect, useRef, type DependencyList, type RefObject } from 'react';
import { gsap } from '../lib/gsap';

/**
 * Envolve toda animação de um componente num `gsap.context()` escopado ao
 * elemento e reverte no cleanup. Isso é obrigatório em React 19 com
 * StrictMode (ativo em main.tsx): sem isso, o double-invoke de efeitos em
 * dev duplica ScrollTriggers e tweens a cada remount.
 */
export function useGsapContext<T extends Element = HTMLDivElement>(
  callback: (context: gsap.Context, scope: RefObject<T | null>) => void,
  deps: DependencyList = []
) {
  const scope = useRef<T | null>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => callback(ctx, scope), scope);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return scope;
}
