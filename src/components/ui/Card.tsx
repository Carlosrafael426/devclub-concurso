import type { ComponentPropsWithoutRef, ElementType, ReactNode, Ref } from 'react';

type CardProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  padded?: boolean;
  hoverable?: boolean;
  ref?: Ref<HTMLElement>;
} & Omit<ComponentPropsWithoutRef<'div'>, 'className' | 'children' | 'ref'>;

/**
 * Superfície de card oficial (§1.4/§1.7): fundo quase-preto translúcido,
 * borda branca sutil, raio 16px, padding 32px. O lift + sombra no hover
 * (antes os cards não reagiam a nada além de cor) é o "hover oficial" da
 * marca — comunica que o card é um alvo interativo, não só um recorte
 * visual do fundo. Repassa props extras (ex: data-cursor-label) direto
 * pro elemento raiz, já que alguns cards existentes dependem disso.
 */
export function Card({ as: Tag = 'div', children, className, padded = true, hoverable = true, ref, ...rest }: CardProps) {
  return (
    <Tag
      ref={ref}
      className={`rounded-card border border-white-light/10 bg-black-normal/80 transition-[transform,box-shadow] duration-300 ${padded ? 'p-8' : ''} ${hoverable ? 'hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]' : ''} ${className ?? ''}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
