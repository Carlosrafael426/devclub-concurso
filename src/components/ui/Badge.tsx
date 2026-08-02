import type { ElementType, ReactNode } from 'react';

type BadgeProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
};

/**
 * Badge com sufixo de terminal — componente-assinatura da marca DevClub,
 * usado em toda label acima de título de seção. Aceita `children` (não uma
 * string) porque os usos reais têm um ponto pulsante antes do texto; o
 * componente só fixa a casca visual (cor/fundo/borda/raio/padding),
 * deixando o conteúdo interno livre.
 */
export function Badge({ as: Tag = 'span', children, className }: BadgeProps) {
  return (
    <Tag
      className={`inline-flex items-center gap-2 rounded-badge border border-purple-normal bg-[image:var(--gradient-purple-bg)] px-3.5 py-[5px] font-display font-normal text-sm text-green-normal ${className ?? ''}`}
    >
      {children}
    </Tag>
  );
}
