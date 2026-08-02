import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';

/**
 * Ponto único de registro dos plugins do GSAP.
 * Registrar mais de uma vez é inofensivo, mas centralizar aqui evita
 * que cada componente precise saber quais plugins existem — importe
 * este módulo (uma vez, em main.tsx) e use `gsap`/`ScrollTrigger`/etc.
 * livremente no resto do app.
 */
gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin);

export { gsap, ScrollTrigger, SplitText, DrawSVGPlugin };
