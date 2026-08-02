import type { Ref } from 'react';

type LogoProps = {
  size?: number;
  color?: 'green' | 'green-dark' | 'current';
  className?: string;
  id?: string;
  ref?: Ref<SVGSVGElement>;
};

/**
 * Glifo oficial do DevClub: pixel-art 13×13 estilo QR code, reconstruído a
 * partir da matriz de módulos original (run-length horizontal por linha,
 * 48 retângulos). Componente único em vez de 3 arquivos .svg porque a
 * Intro (Fase A) precisa de `querySelectorAll('rect')` retornando nós DOM
 * reais e animáveis — um `<img src=".svg">` não expõe isso.
 * `shape-rendering="crispEdges"` é obrigatório: sem ele o antialiasing
 * borra as bordas dos módulos em tamanhos pequenos (43px no header) e o
 * pixel art perde a leitura.
 */

// [x, y, largura] — altura sempre 1 módulo. Gerado por RLE horizontal da
// matriz 13×13 oficial (ver matriz fornecida na spec da Parte 2).
const RECTS: [number, number, number][] = [
  [0, 0, 3], [4, 0, 1], [6, 0, 3], [10, 0, 1], [12, 0, 1],
  [0, 1, 1], [2, 1, 1], [12, 1, 1],
  [0, 2, 3], [4, 2, 7], [12, 2, 1],
  [11, 3, 1],
  [0, 4, 1], [2, 4, 3], [8, 4, 2], [12, 4, 1],
  [0, 5, 1], [2, 5, 1], [5, 5, 1], [7, 5, 1], [10, 5, 1], [12, 5, 1],
  [0, 6, 1], [2, 6, 1], [5, 6, 1], [7, 6, 1], [12, 6, 1],
  [2, 7, 1], [5, 7, 1], [7, 7, 1], [12, 7, 1],
  [0, 8, 1], [2, 8, 3], [8, 8, 3], [12, 8, 1],
  [0, 10, 1], [5, 10, 1], [8, 10, 1], [10, 10, 3],
  [1, 11, 1], [4, 11, 1], [7, 11, 1], [10, 11, 1], [12, 11, 1],
  [0, 12, 1], [3, 12, 1], [8, 12, 1], [10, 12, 3],
];

export function Logo({ size = 40, color = 'current', className, id, ref }: LogoProps) {
  const fill =
    color === 'green'
      ? 'var(--color-green-normal)'
      : color === 'green-dark'
        ? 'var(--color-green-dark)'
        : 'currentColor';

  return (
    <svg
      ref={ref}
      id={id}
      viewBox="0 0 13 13"
      width={size}
      height={size}
      shapeRendering="crispEdges"
      role="img"
      aria-label="DevClub"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {RECTS.map(([x, y, w], i) => (
        <rect key={i} x={x} y={y} width={w} height={1} fill={fill} />
      ))}
    </svg>
  );
}
