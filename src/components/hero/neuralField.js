/**
 * NeuralField — nuvem de nós 3D projetada em perspectiva sobre canvas 2D.
 *
 * Decisão: canvas 2D com projeção manual em vez de Three.js/WebGL. O efeito
 * desejado (pontos, linhas e glow com profundidade) não precisa de malhas nem
 * shaders, e evitar WebGL economiza ~600KB de bundle e o custo de inicializar
 * contexto GL — a cena roda a 60fps num notebook mediano.
 *
 * Zero dependências: framework-agnóstica e testável isolada.
 */

const clamp = (min, max, v) => (v < min ? min : v > max ? max : v);
const rnd = (a, b) => a + Math.random() * (b - a);
const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

const DEFAULTS = {
  // Cores oficiais da marca: green-light e purple-light dos tokens DevClub
  colorPrimary: [91, 241, 117],
  colorAccent: [152, 75, 255],

  nodeCount: 128,
  spread: 1750,
  fov: 560,
  zNear: 40,
  zFar: 1500,

  edgeMaxDist: 780,
  edgeChance: 0.26,
  // Teto de arestas: o número de pares cresce ao quadrado com nodeCount.
  // Sem esse limite o frame rate cai em telas grandes.
  edgeCap: 560,

  beadChance: 0.5,
  beadsPerEdge: 7,

  hubChance: 0.3,
  baseSpeed: 0.55,

  // Âncoras dos nós de curso, em coordenadas de mundo (x, y).
  courseAnchors: [
    [520, -320],
    [430, 300],
    [900, -170],
    [840, 250],
  ],
  courseZRange: [520, 700],
  courseZClamp: [440, 760],

  onProject: null,    // (index, screenX, screenY) => void
  isCourseOpen: null, // (index) => boolean
};

export class NeuralField {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.o = { ...DEFAULTS, ...options };

    this.W = 0; this.H = 0; this.DPR = 1; this.CX = 0; this.CY = 0;
    this.t = 0; this.alpha = 0; this.raf = null; this.running = false;
    this.lastScrollY = typeof window !== "undefined" ? window.scrollY : 0;
    this.smoothVel = 0;

    this._onResize = () => this._resize();
    window.addEventListener("resize", this._onResize);

    this._resize();
    this._build();
  }

  /* ---------------- construção ---------------- */

  _build() {
    const o = this.o;
    this.nodes = [];
    for (let i = 0; i < o.nodeCount; i++) {
      this.nodes.push({
        x: rnd(-o.spread, o.spread),
        y: rnd(-o.spread * 0.66, o.spread * 0.66),
        z: rnd(o.zNear, o.zFar),
        hub: Math.random() < o.hubChance,
        ph: Math.random() * Math.PI * 2,
      });
    }

    this.courseNodes = o.courseAnchors.map((a, i) => ({
      x: a[0], y: a[1],
      z: rnd(o.courseZRange[0], o.courseZRange[1]),
      ph: Math.random() * Math.PI * 2,
      color: i % 2 === 0 ? o.colorPrimary : o.colorAccent,
      idx: i,
      hub: true,
    }));

    this._buildEdges();
  }

  _buildEdges() {
    const o = this.o;
    this.edges = [];
    const all = this.nodes.concat(this.courseNodes);
    for (let i = 0; i < all.length && this.edges.length < o.edgeCap; i++) {
      for (let j = i + 1; j < all.length && this.edges.length < o.edgeCap; j++) {
        const a = all[i], b = all[j];
        // Profundidade pesa menos que x/y: gera linhas longas cruzando o quadro.
        const d = Math.hypot(a.x - b.x, a.y - b.y, (a.z - b.z) * 0.55);
        if (d < o.edgeMaxDist && Math.random() < o.edgeChance) {
          this.edges.push({ a, b, beads: Math.random() < o.beadChance, off: Math.random() });
        }
      }
    }
  }

  _resize() {
    const r = this.canvas.parentElement.getBoundingClientRect();
    // Teto de 2 no DPR: acima disso o ganho visual é imperceptível e o custo
    // de preenchimento dos gradientes radiais dobra.
    this.DPR = Math.min(window.devicePixelRatio || 1, 2);
    this.W = r.width; this.H = r.height;
    this.CX = this.W * 0.5; this.CY = this.H * 0.5;
    this.canvas.width = this.W * this.DPR;
    this.canvas.height = this.H * this.DPR;
    this.canvas.style.width = this.W + "px";
    this.canvas.style.height = this.H + "px";
  }

  _project(x, y, z) {
    const s = this.o.fov / (this.o.fov + z);
    return { x: this.CX + x * s, y: this.CY + y * s, s };
  }

  /* ---------------- render ---------------- */

  _drawNode(p, color, boost) {
    const o = this.o;
    if (p.z <= o.zNear) return null;
    const ctx = this.ctx;
    const pr = this._project(p.px, p.py, p.z);
    const near = 1 - clamp(0, 1, (p.z - o.zNear) / (o.zFar - o.zNear));
    const pulse = 0.7 + Math.sin(this.t * 2.2 + p.ph) * 0.3;
    const R = (2 + near * 9) * (boost || 1);

    const g = ctx.createRadialGradient(pr.x, pr.y, 0, pr.x, pr.y, R * 3.2);
    g.addColorStop(0, rgba(color, 0.95 * pulse));
    g.addColorStop(0.25, rgba(color, 0.35 * pulse));
    g.addColorStop(1, rgba(color, 0));
    ctx.beginPath();
    ctx.arc(pr.x, pr.y, R * 3.2, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(pr.x, pr.y, Math.max(0.8, R * 0.34), 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${0.55 * pulse * near + 0.2})`;
    ctx.fill();

    // Flare em cruz só nos hubs próximos: simula estouro de luz da lente.
    if (p.hub && near > 0.42) {
      const L = R * 4.2 * pulse;
      ctx.strokeStyle = rgba(color, 0.3 * near * pulse);
      ctx.lineWidth = Math.max(0.5, near * 1.1);
      ctx.beginPath();
      ctx.moveTo(pr.x - L, pr.y); ctx.lineTo(pr.x + L, pr.y);
      ctx.moveTo(pr.x, pr.y - L * 0.75); ctx.lineTo(pr.x, pr.y + L * 0.75);
      ctx.stroke();
    }
    return pr;
  }

  _frame = () => {
    const o = this.o, ctx = this.ctx;

    // Velocidade de scroll suavizada — mesma "assinatura de velocidade"
    // usada em outras seções do site.
    const y = window.scrollY;
    this.smoothVel += (y - this.lastScrollY - this.smoothVel) * 0.15;
    this.lastScrollY = y;
    const vel = Math.min(Math.abs(this.smoothVel), 40);
    const speed = 1 + vel / 7;
    this.t += 0.004 * speed;

    ctx.setTransform(this.DPR, 0, 0, this.DPR, 0, 0);
    ctx.clearRect(0, 0, this.W, this.H);
    ctx.globalAlpha = this.alpha;

    const all = this.nodes.concat(this.courseNodes);
    all.forEach((p) => {
      p.z -= o.baseSpeed * speed;
      if (p.z < o.zNear) {
        p.z = o.zFar;
        p.x = rnd(-o.spread, o.spread);
        p.y = rnd(-o.spread * 0.66, o.spread * 0.66);
      }
      p.px = p.x + Math.sin(this.t * 0.5 + p.ph) * 14;
      p.py = p.y + Math.cos(this.t * 0.44 + p.ph) * 14;
    });

    // Nós de curso não somem na profundidade: são conteúdo, não cenário.
    this.courseNodes.forEach((c) => {
      if (c.z < o.courseZClamp[0] || c.z > o.courseZClamp[1]) c.z = o.courseZClamp[1];
    });

    // Composição aditiva: luzes que se cruzam somam e estouram em branco.
    ctx.globalCompositeOperation = "lighter";

    this.edges.forEach((e) => {
      if (e.a.z <= o.zNear || e.b.z <= o.zNear) return;
      const pa = this._project(e.a.px, e.a.py, e.a.z);
      const pb = this._project(e.b.px, e.b.py, e.b.z);
      const depth = (e.a.z + e.b.z) / 2;
      const near = 1 - clamp(0, 1, (depth - o.zNear) / (o.zFar - o.zNear));

      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y);
      ctx.strokeStyle = rgba(o.colorPrimary, (0.05 + near * 0.2) * 0.55);
      ctx.lineWidth = Math.max(0.4, near * 1.5);
      ctx.stroke();

      // "Beads" de dados correndo pela aresta — detalhe assinatura da referência.
      if (e.beads) {
        const N = o.beadsPerEdge;
        for (let i = 0; i < N; i++) {
          const f = (((i / N + e.off + this.t * 0.22 * speed) % 1) + 1) % 1;
          const bx = pa.x + (pb.x - pa.x) * f;
          const by = pa.y + (pb.y - pa.y) * f;
          ctx.beginPath();
          ctx.arc(bx, by, Math.max(0.6, near * 2), 0, Math.PI * 2);
          ctx.fillStyle = rgba(o.colorPrimary, 0.25 + near * 0.55);
          ctx.fill();
        }
      }
    });

    this.nodes.forEach((p) =>
      this._drawNode(p, p.hub ? o.colorAccent : o.colorPrimary, p.hub ? 1.25 : 0.7)
    );

    this.courseNodes.forEach((c) => {
      const open = o.isCourseOpen ? o.isCourseOpen(c.idx) : false;
      const pr = this._drawNode(c, c.color, open ? 2.1 : 1.6);
      if (pr && o.onProject) o.onProject(c.idx, pr.x, pr.y);
    });

    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;

    if (this.running) this.raf = requestAnimationFrame(this._frame);
  };

  /* ---------------- ciclo de vida ---------------- */

  setAlpha(a) { this.alpha = clamp(0, 1, a); }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastScrollY = window.scrollY;
    this.raf = requestAnimationFrame(this._frame);
  }

  stop() {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = null;
  }

  /** Um único frame estático — usado em prefers-reduced-motion. */
  renderStatic() {
    this.alpha = 1;
    this.running = false;
    this._frame();
  }

  destroy() {
    this.stop();
    window.removeEventListener("resize", this._onResize);
  }
}
