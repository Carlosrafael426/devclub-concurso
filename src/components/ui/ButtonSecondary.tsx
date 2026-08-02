import type { ReactNode } from 'react';

type ButtonSecondaryProps = {
  href: string;
  target?: string;
  rel?: string;
  children: ReactNode;
  className?: string;
};

/**
 * CTA secundário oficial: fundo verde quase transparente, borda verde sutil,
 * texto branco — discreto ao lado do primário sólido (P1: elemento
 * primário entra com mais peso visual que o de suporte). Sem ícone fixo:
 * cada chamador passa o ícone que fizer sentido via children, como o Hero
 * já faz hoje com o ícone do WhatsApp.
 */
export function ButtonSecondary({ href, target, rel, children, className }: ButtonSecondaryProps) {
  return (
    <a
      href={href}
      target={target}
      rel={rel}
      className={`group inline-flex items-center justify-center gap-2 rounded-btn border-2 border-green-normal/30 bg-green-light/5 px-6 py-3 font-display font-normal text-base text-white-light transition-colors duration-300 hover:bg-green-light/10 ${className ?? ''}`}
    >
      {children}
    </a>
  );
}
