import type { ReactNode, Ref } from 'react';
import { ArrowRight } from 'lucide-react';
import { Card } from '../ui/Card';

export type Modulo = {
  number: string;
  title: string;
  description: string;
  icon: ReactNode;
  badge: string;
};

type FormacaoCardProps = {
  modulo: Modulo;
  ref?: Ref<HTMLDivElement>;
};

/**
 * Um módulo da trilha de formação. O número (01-06) é tratado como elemento
 * gráfico grande e discreto atrás do conteúdo, não como texto de apoio — é
 * o que dá a leitura de "linha do tempo de carreira" à trilha horizontal da
 * Fase 2, em vez de mais um card de grid genérico.
 */
export function FormacaoCard({ modulo, ref }: FormacaoCardProps) {
  return (
    <Card
      as="div"
      ref={ref}
      hoverable={false}
      data-cursor-label="Ver módulo"
      className="group relative w-full lg:w-[360px] flex-shrink-0 overflow-hidden hover:border-green-normal/20 flex flex-col justify-between gap-6"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-3 right-3 font-display font-normal text-white/[0.06] text-[6rem] leading-none select-none"
      >
        {modulo.number}
      </span>

      <div className="relative">
        <div className="flex justify-between items-start mb-6">
          <div className="p-3.5 rounded-lg bg-white/[0.05] group-hover:bg-green-normal/10 transition-colors border border-white/[0.06]">
            {modulo.icon}
          </div>
          <span className="text-[11px] font-display font-normal tracking-wider text-gray-300 bg-white/[0.04] px-2.5 py-1 rounded-badge uppercase">
            {modulo.badge}
          </span>
        </div>
        <div className="h-px w-full bg-gradient-to-r from-white/10 via-transparent to-transparent mb-5" />
        <h3 className="font-display font-normal text-xl text-white group-hover:text-green-normal transition-colors">
          {modulo.title}
        </h3>
        <p className="font-sans text-sm text-gray-300 mt-3 leading-relaxed">
          {modulo.description}
        </p>
      </div>

      <div className="relative inline-flex items-center gap-2 text-sm font-medium text-green-normal">
        Ver conteúdo
        <ArrowRight size={16} />
      </div>
    </Card>
  );
}
