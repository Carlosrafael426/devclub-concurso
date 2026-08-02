import { Card } from '../ui/Card';
import type { Modulo } from './FormacaoRow';

type FormacaoPanelProps = {
  modulo: Modulo;
  panelRef?: (el: HTMLDivElement | null) => void;
};

/**
 * Painel visual de um módulo: ícone temático + badge + título/descrição +
 * um trecho de "código" próprio desta seção (deliberadamente mais simples
 * que a janela carreira.tsx do Hero — não é o mesmo elemento repetido,
 * é uma ilustração rápida e diferente por módulo).
 */
export function FormacaoPanel({ modulo, panelRef }: FormacaoPanelProps) {
  return (
    <Card ref={panelRef} hoverable={false} className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="p-3.5 rounded-lg bg-white/[0.05] border border-white/[0.06]">
          {modulo.icon}
        </div>
        <span className="text-[11px] font-display font-normal tracking-wider text-gray-300 bg-white/[0.04] px-2.5 py-1 rounded-badge uppercase">
          {modulo.badge}
        </span>
      </div>

      <div>
        <h3 className="font-display font-normal text-2xl text-white">{modulo.title}</h3>
        <p className="font-sans text-sm text-gray-300 mt-2 leading-relaxed">{modulo.description}</p>
      </div>

      <div className="rounded-lg border border-white/10 bg-black/40 px-4 py-4 font-mono text-xs sm:text-sm space-y-1.5">
        {modulo.snippet.map((line, i) => (
          <p key={i} className={line.accent ? 'text-green-normal' : 'text-gray-300'}>
            {line.text}
          </p>
        ))}
      </div>
    </Card>
  );
}
