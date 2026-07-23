import { useEffect, useRef, useState } from 'react';

/**
 * useScrollAnimation
 * Hook customizado que observa se um elemento entrou no viewport.
 * Retorna uma ref para ser aplicada ao elemento-alvo e um estado `isVisible`.
 *
 * Quando `isVisible` é true, adicione a classe `visible` ao elemento
 * que já possui a classe `fade-up` para ativar a animação CSS.
 */
export const useScrollAnimation = (threshold = 0.12, rootMargin = '0px 0px -80px 0px') => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return { ref, isVisible };
};
