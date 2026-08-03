import { useEffect, useRef, useState } from 'react';
import { Check, ShieldCheck, ArrowRight } from 'lucide-react';
import { BgNeural } from '../../lib/bgNeural';
import { ButtonPrimary } from '../ui/ButtonPrimary';
import { Badge } from '../ui/Badge';
import { Reveal } from '../ui/Reveal';
import { DISTANCE } from '../../lib/motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import './cta.css';

const BENEFICIOS = [
  { destaque: 'Formação Full Stack completa', resto: ' — do primeiro "Hello World" ao deploy em produção' },
  { destaque: 'Mentoria individual', resto: ' com devs que trabalham no mercado agora, não professores de teoria' },
  { destaque: '+40 projetos reais', resto: ' para você chegar na entrevista com portfólio, não com certificado' },
  { destaque: 'Preparação para o processo seletivo', resto: ' — LinkedIn, currículo e simulação de entrevista técnica' },
  { destaque: 'Comunidade ativa 24/7', resto: ' — você trava às 2h da manhã e tem alguém para responder' },
];

const INCLUSOS = [
  'Acesso vitalício ao conteúdo',
  'Certificado reconhecido pelo mercado',
  'Todas as atualizações futuras inclusas',
];

const VAGAS_TOTAL = 200;
const VAGAS_PREENCHIDAS = 163;
const COUNTDOWN_MS = (2 * 24 * 3600 + 7 * 3600 + 42 * 60) * 1000;

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * CTAFinal — fechamento comercial: oferta, urgência (contagem regressiva +
 * vagas preenchidas) e prova social, em duas colunas (copy + card de
 * oferta). Fundo em rede neural 3D (mesma engine do resto do site).
 *
 * A contagem regressiva reinicia a cada carregamento de página (deadline
 * calculada a partir de `Date.now()` no mount, não uma data fixa) — é uma
 * urgência ilustrativa para o concurso, o mesmo espírito de dado fictício
 * já usado nas demais seções (contratações, avaliações, vagas).
 *
 * Diferença deliberada em relação ao protótipo original: o botão principal
 * usa <ButtonPrimary> (ripple de origem fixa, não rastreia o cursor) em
 * vez do ripple `--mx`/`--my` que segue o mouse do protótipo — o projeto
 * já removeu todo efeito de rastreamento de cursor por pedido explícito
 * anterior; só o pulso de convite (box-shadow, sem depender do ponteiro)
 * foi mantido.
 */
export const CTAFinal: React.FC = () => {
  const secRef = useRef<HTMLElement | null>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const bensRef = useRef<HTMLDivElement | null>(null);
  const proofRef = useRef<HTMLDivElement | null>(null);
  const seatsRef = useRef<HTMLDivElement | null>(null);
  const deadlineRef = useRef<number | null>(null);

  const reduced = useReducedMotion();
  const [bensVisible, setBensVisible] = useState(false);
  const [seatsVisible, setSeatsVisible] = useState(false);
  const [proofAlunos, setProofAlunos] = useState(0);
  const [proofEmpregabilidade, setProofEmpregabilidade] = useState(0);
  const [proofAvaliacao, setProofAvaliacao] = useState(0);
  const [remaining, setRemaining] = useState({ d: 0, h: 0, m: 0, s: 0 });

  // Fundo: mesma rede neural do resto do site.
  useEffect(() => {
    const canvas = bgCanvasRef.current;
    const host = secRef.current;
    if (!canvas || !host) return;
    const bg = new BgNeural(canvas, host, { nodeCount: 76, edgeCap: 280, alpha: 0.44 });
    if (reduced) bg.renderStatic();
    else bg.start();
    return () => bg.destroy();
  }, [reduced]);

  // Benefícios: entram com stagger (delay por item via CSS) ao rolar até a seção.
  useEffect(() => {
    const el = bensRef.current;
    if (!el) return;
    if (reduced) {
      setBensVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries, obs) => {
        if (entries[0]?.isIntersecting) {
          setBensVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reduced]);

  // Prova social: contadores sobem com ease cúbico ao rolar até a seção.
  useEffect(() => {
    const el = proofRef.current;
    if (!el) return;
    if (reduced) {
      setProofAlunos(17000);
      setProofEmpregabilidade(94);
      setProofAvaliacao(4.9);
      return;
    }
    let raf = 0;
    const observer = new IntersectionObserver(
      (entries, obs) => {
        if (!entries[0]?.isIntersecting) return;
        let t0 = 0;
        const step = (ts: number) => {
          if (!t0) t0 = ts;
          const p = Math.min(1, (ts - t0) / 1600);
          const eased = 1 - (1 - p) ** 3;
          setProofAlunos(17000 * eased);
          setProofEmpregabilidade(94 * eased);
          setProofAvaliacao(4.9 * eased);
          if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
        obs.disconnect();
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  // Vagas preenchidas: barra enche ao rolar até a seção.
  useEffect(() => {
    const el = seatsRef.current;
    if (!el) return;
    if (reduced) {
      setSeatsVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries, obs) => {
        if (entries[0]?.isIntersecting) {
          setSeatsVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reduced]);

  // Contagem regressiva: deadline fixada no mount, atualiza a cada segundo.
  useEffect(() => {
    if (deadlineRef.current === null) {
      deadlineRef.current = Date.now() + COUNTDOWN_MS;
    }
    const tick = () => {
      const diff = Math.max(0, (deadlineRef.current ?? 0) - Date.now());
      const s = Math.floor(diff / 1000);
      setRemaining({
        d: Math.floor(s / 86400),
        h: Math.floor((s % 86400) / 3600),
        m: Math.floor((s % 3600) / 60),
        s: s % 60,
      });
    };
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <section ref={secRef} id="inscricao" className="cta relative min-h-screen overflow-hidden py-16 sm:py-20">
      <canvas ref={bgCanvasRef} className="cta-bg" aria-hidden="true" />
      <div className="cta-veil" aria-hidden="true" />
      <div className="cta-glow cta-glow--green" aria-hidden="true" />
      <div className="cta-glow cta-glow--purple" aria-hidden="true" />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14 lg:px-8">
        {/* ---------- coluna esquerda ---------- */}
        <div>
          <Reveal as="div" y={DISTANCE.sm} className="flex justify-center lg:justify-start">
            <Badge>
              <span className="h-1.5 w-1.5 rounded-full bg-green-normal animate-pulse" />
              turma 2026.2 · inscrições abertas_
            </Badge>
          </Reveal>

          <Reveal
            as="h2"
            split="words"
            delay={0.1}
            className="mt-4 text-center font-display font-normal text-3xl leading-[1.16] text-white sm:text-4xl md:text-5xl lg:text-left"
          >
            Você está a um passo<br />
            da sua <span className="text-green-light">primeira vaga dev</span>
          </Reveal>

          <Reveal
            as="p"
            y={DISTANCE.sm}
            delay={0.25}
            className="mt-4 max-w-xl text-center font-sans text-base leading-relaxed text-gray-300 mx-auto lg:mx-0 lg:text-left"
          >
            Enquanto você decide, <b className="font-semibold text-white">outra pessoa está estudando</b>. A
            diferença entre quem muda de vida e quem continua reclamando do salário é uma decisão — e ela cabe hoje.
          </Reveal>

          <div ref={bensRef} className="mt-7 flex flex-col gap-3">
            {BENEFICIOS.map((b, i) => (
              <div
                key={b.destaque}
                className={`cta-ben flex items-start gap-3 text-sm text-gray-200${bensVisible ? ' is-in' : ''}`}
                style={{ transitionDelay: `${i * 110}ms` }}
              >
                <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-[5px] border border-green-normal/55 bg-green-normal/15">
                  <Check size={11} className="site-icon text-green-light" strokeWidth={3.4} />
                </span>
                <span>
                  <b className="font-semibold text-white">{b.destaque}</b>
                  {b.resto}
                </span>
              </div>
            ))}
          </div>

          <div ref={proofRef} className="mt-8 flex flex-wrap justify-center gap-8 lg:justify-start">
            <div className="font-mono">
              <b className="block text-2xl font-semibold text-green-light">
                {Math.round(proofAlunos).toLocaleString('pt-BR')}+
              </b>
              <span className="text-[10.5px] tracking-widest text-gray-600">ALUNOS FORMADOS</span>
            </div>
            <div className="font-mono">
              <b className="block text-2xl font-semibold text-green-light">{Math.round(proofEmpregabilidade)}%</b>
              <span className="text-[10.5px] tracking-widest text-gray-600">EMPREGABILIDADE</span>
            </div>
            <div className="font-mono">
              <b className="block text-2xl font-semibold text-green-light">{proofAvaliacao.toFixed(1)}/5</b>
              <span className="text-[10.5px] tracking-widest text-gray-600">AVALIAÇÃO</span>
            </div>
          </div>
        </div>

        {/* ---------- card de oferta ---------- */}
        <Reveal as="div" delay={0.2} className="cta-offer p-[1.6px]">
          <div className="cta-offer__in px-6 py-7 sm:px-8">
            <div className="flex items-center justify-between font-mono text-[11px] tracking-widest text-gray-600">
              <span>MATRÍCULA</span>
              <b className="font-medium text-green-light">TURMA 2026.2</b>
            </div>

            <div className="mt-4">
              <div className="font-mono text-[13px] text-gray-600 line-through">De R$ 4.997,00</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-mono text-[15px] text-gray-300">12x</span>
                <span className="font-display font-normal text-[clamp(2.1rem,4.6vw,2.9rem)] leading-none text-white">
                  R$ 297
                </span>
              </div>
              <div className="mt-1.5 text-[12.5px] text-gray-300">
                ou <b className="text-green-light">R$ 2.997 à vista</b> — economia de R$ 567
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2 border-t border-white/[0.09] pt-4">
              {INCLUSOS.map((item) => (
                <div key={item} className="flex items-center gap-2 font-mono text-[11.5px] text-gray-300">
                  <Check size={12} className="site-icon flex-shrink-0 text-green-normal" strokeWidth={3} />
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-lg border border-purple-normal/40 bg-purple-normal/[0.09] px-4 py-3.5">
              <div className="font-mono text-[10px] tracking-widest text-purple-light">INSCRIÇÕES ENCERRAM EM</div>
              <div className="mt-2 flex gap-2 font-mono">
                <div className="flex-1 rounded-md border border-white/[0.08] bg-white/[0.04] py-1.5 text-center">
                  <b className="block text-[19px] font-semibold text-white">{pad(remaining.d)}</b>
                  <span className="text-[8.5px] tracking-wide text-gray-600">DIAS</span>
                </div>
                <div className="flex-1 rounded-md border border-white/[0.08] bg-white/[0.04] py-1.5 text-center">
                  <b className="block text-[19px] font-semibold text-white">{pad(remaining.h)}</b>
                  <span className="text-[8.5px] tracking-wide text-gray-600">HORAS</span>
                </div>
                <div className="flex-1 rounded-md border border-white/[0.08] bg-white/[0.04] py-1.5 text-center">
                  <b className="block text-[19px] font-semibold text-white">{pad(remaining.m)}</b>
                  <span className="text-[8.5px] tracking-wide text-gray-600">MIN</span>
                </div>
                <div className="flex-1 rounded-md border border-white/[0.08] bg-white/[0.04] py-1.5 text-center">
                  <b className="block text-[19px] font-semibold text-white">{pad(remaining.s)}</b>
                  <span className="text-[8.5px] tracking-wide text-gray-600">SEG</span>
                </div>
              </div>

              <div ref={seatsRef} className="mt-3.5">
                <div className="flex justify-between font-mono text-[10.5px] text-gray-600">
                  <span>VAGAS PREENCHIDAS</span>
                  <b className="text-green-light">{seatsVisible ? VAGAS_PREENCHIDAS : 0}/{VAGAS_TOTAL}</b>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                  <div
                    className="cta-seats-bar h-full rounded-full bg-gradient-to-r from-green-normal to-purple-light"
                    style={{ width: seatsVisible ? `${(VAGAS_PREENCHIDAS / VAGAS_TOTAL) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            </div>

            <ButtonPrimary
              href="https://www.devclub.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-btn-pulse mt-5 w-full justify-center py-4 text-[16.5px]"
            >
              Quero minha vaga
            </ButtonPrimary>
            <a
              href="https://wa.me/seu-numero"
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-3 flex items-center justify-center gap-1.5 font-mono text-[12.5px] text-gray-300 transition-colors duration-200 hover:text-green-light"
            >
              ou fale com um consultor
              <ArrowRight size={13} className="site-icon transition-transform duration-200 group-hover:translate-x-1" />
            </a>

            <div className="mt-4 flex items-center gap-2.5 border-t border-white/[0.08] pt-3.5">
              <ShieldCheck size={26} className="site-icon flex-shrink-0 text-green-normal" strokeWidth={1.6} />
              <p className="text-[11.5px] leading-relaxed text-gray-300">
                <b className="text-white">Garantia incondicional de 7 dias.</b> Entrou, não gostou, devolvemos 100% do
                valor. Sem perguntas.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
