import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { MagneticButton } from './MagneticButton';

type ButtonPrimaryProps = {
  href: string;
  target?: string;
  rel?: string;
  onClick?: () => void;
  magnetic?: boolean;
  children: ReactNode;
  className?: string;
};

/**
 * CTA primário oficial: verde sólido, borda 2px verde-escura, ripple radial
 * e lift+glow no hover (tokens de superfície §1.6). O ícone de seta em
 * círculo escuro é conteúdo interno deste átomo — não uma mudança de
 * composição das seções que o consomem, que só trocam `<a>` por
 * `<ButtonPrimary>` no mesmo lugar. Delega para `MagneticButton` (já
 * existente) em vez de duplicar a lógica de ímã do cursor.
 */
export function ButtonPrimary({ href, target, rel, onClick, magnetic = true, children, className }: ButtonPrimaryProps) {
  const classes = `btn-primary group inline-flex items-center gap-3 rounded-btn border-2 border-green-dark bg-green-normal px-5 py-3 font-display font-normal text-base text-black-normal transition-[transform,box-shadow] duration-300 hover:-translate-y-[3px] hover:shadow-[0_10px_30px_rgba(57,211,83,0.4)] ${className ?? ''}`;

  const content = (
    <>
      <span className="relative z-10 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-black-normal">
        <ArrowRight size={14} className="text-green-normal" />
      </span>
      <span className="relative z-10 group-hover:scale-[0.965] transition-transform duration-300">{children}</span>
    </>
  );

  if (magnetic) {
    return (
      <MagneticButton href={href} target={target} rel={rel} onClick={onClick} className={classes}>
        {content}
      </MagneticButton>
    );
  }

  return (
    <a href={href} target={target} rel={rel} onClick={onClick} className={classes}>
      {content}
    </a>
  );
}
