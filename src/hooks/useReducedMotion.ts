import { useEffect, useState } from 'react';

/**
 * Fonte única de verdade para `prefers-reduced-motion`. Componentes de
 * motion devem consultar este hook e cair para um estado final estático
 * (opacidade 1, sem transform, sem loop) em vez de apenas encurtar a
 * duração — acessibilidade aqui é "sem movimento", não "movimento rápido".
 */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => setReduced(query.matches);
    query.addEventListener('change', handleChange);
    return () => query.removeEventListener('change', handleChange);
  }, []);

  return reduced;
}
