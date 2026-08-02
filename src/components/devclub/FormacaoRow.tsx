import type { ReactNode } from 'react';

export type SnippetLine = { text: string; accent?: boolean };

export type Modulo = {
  number: string;
  title: string;
  description: string;
  icon: ReactNode;
  badge: string;
  snippet: SnippetLine[];
};

type FormacaoRowProps = {
  modulo: Modulo;
  active: boolean;
  onActivate: () => void;
  rowRef?: (el: HTMLDivElement | null) => void;
};

/**
 * Uma linha da lista de módulos — escaneável (número + título + uma linha
 * de descrição), não o card inteiro repetido 6 vezes. O estado ativo
 * (borda + cor verde + peso) é a única pista visual de que passar o mouse
 * (ou rolar até aqui) troca o painel ao lado.
 */
export function FormacaoRow({ modulo, active, onActivate, rowRef }: FormacaoRowProps) {
  return (
    <div
      ref={rowRef}
      onMouseEnter={onActivate}
      className={`cursor-pointer border-l-2 py-5 pl-6 pr-4 transition-[border-color,opacity] duration-300 ${
        active ? 'border-green-normal opacity-100' : 'border-white/10 opacity-55'
      }`}
    >
      <div className="flex items-baseline gap-4">
        <span className={`font-display text-sm transition-colors duration-300 ${active ? 'text-green-normal' : 'text-gray-300'}`}>
          {modulo.number}
        </span>
        <h3 className={`font-display font-normal text-lg sm:text-xl transition-colors duration-300 ${active ? 'text-white' : 'text-gray-300'}`}>
          {modulo.title}
        </h3>
      </div>
      <p className="mt-1.5 pl-9 font-sans text-sm text-gray-300 leading-relaxed">
        {modulo.description}
      </p>
    </div>
  );
}
