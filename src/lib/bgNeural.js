/**
 * bgNeural — rede neural 3D de fundo (canvas), compartilhada entre as seções
 * Hero, Stacks e Depoimentos. Mesma engine de projeção em perspectiva nas
 * três, variando só nodeCount/edgeCap/alpha por seção — repetir a MESMA
 * engine (em vez de uma reimplementação por seção) é o que cria
 * continuidade visual entre elas.
 *
 * Zero dependências — framework-agnóstica e testável isolada.
 */

export const GREEN = [91, 241, 117];
export const PURPLE = [152, 75, 255];

export const clamp = (a, b, v) => (v < a ? a : v > b ? b : v);
export const rr = (a, b) => a + Math.random() * (b - a);
export const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

const FOV = 560, ZN = 40, ZF = 1500, SPREAD = 1750;

export class BgNeural {
  constructor(canvas, host, opts = {}) {
    this.canvas = canvas;
    this.host = host;
    this.ctx = canvas.getContext("2d");
    this.nodeCount = opts.nodeCount ?? 86;
    this.edgeCap = opts.edgeCap ?? 330;
    this.alpha = opts.alpha ?? 0.62;

    this.t = 0;
    this.raf = null;
    this.running = false;

    this.nodes = [];
    for (let i = 0; i < this.nodeCount; i++) {
      this.nodes.push({
        x: rr(-SPREAD, SPREAD),
        y: rr(-SPREAD * 0.66, SPREAD * 0.66),
        z: rr(ZN, ZF),
        hub: Math.random() < 0.3,
        ph: Math.random() * 6.28,
      });
    }
    this.edges = [];
    for (let i = 0; i < this.nodes.length && this.edges.length < this.edgeCap; i++) {
      for (let j = i + 1; j < this.nodes.length && this.edges.length < this.edgeCap; j++) {
        const a = this.nodes[i], b = this.nodes[j];
        if (Math.hypot(a.x - b.x, a.y - b.y, (a.z - b.z) * 0.55) < 780 && Math.random() < 0.26) {
          this.edges.push({ a, b, beads: Math.random() < 0.45, off: Math.random() });
        }
      }
    }

    this._onResize = () => this.resize();
    window.addEventListener("resize", this._onResize);
    this.resize();
  }

  resize() {
    const r = this.host.getBoundingClientRect();
    this.DPR = Math.min(window.devicePixelRatio || 1, 2);
    this.W = r.width;
    this.H = r.height;
    this.canvas.width = this.W * this.DPR;
    this.canvas.height = this.H * this.DPR;
    this.canvas.style.width = this.W + "px";
    this.canvas.style.height = this.H + "px";
  }

  _proj(x, y, z) {
    const s = FOV / (FOV + z);
    return { x: this.W / 2 + x * s, y: this.H / 2 + y * s };
  }

  _frame = () => {
    const c = this.ctx;
    // Velocidade constante — a rede não acelera com o scroll do usuário.
    this.t += 0.004;
    const t = this.t;

    c.setTransform(this.DPR, 0, 0, this.DPR, 0, 0);
    c.clearRect(0, 0, this.W, this.H);
    c.globalAlpha = this.alpha;
    c.globalCompositeOperation = "lighter";

    this.nodes.forEach((p) => {
      p.z -= 0.55;
      if (p.z < ZN) {
        p.z = ZF;
        p.x = rr(-SPREAD, SPREAD);
        p.y = rr(-SPREAD * 0.66, SPREAD * 0.66);
      }
      p.px = p.x + Math.sin(t * 0.5 + p.ph) * 14;
      p.py = p.y + Math.cos(t * 0.44 + p.ph) * 14;
    });

    this.edges.forEach((e) => {
      if (e.a.z <= ZN || e.b.z <= ZN) return;
      const pa = this._proj(e.a.px, e.a.py, e.a.z);
      const pb = this._proj(e.b.px, e.b.py, e.b.z);
      const near = 1 - clamp(0, 1, ((e.a.z + e.b.z) / 2 - ZN) / (ZF - ZN));
      c.beginPath();
      c.moveTo(pa.x, pa.y);
      c.lineTo(pb.x, pb.y);
      c.strokeStyle = rgba(GREEN, (0.05 + near * 0.2) * 0.5);
      c.lineWidth = Math.max(0.4, near * 1.4);
      c.stroke();
      if (e.beads) {
        for (let i = 0; i < 6; i++) {
          const f = (((i / 6 + e.off + t * 0.22) % 1) + 1) % 1;
          c.beginPath();
          c.arc(pa.x + (pb.x - pa.x) * f, pa.y + (pb.y - pa.y) * f, Math.max(0.5, near * 1.8), 0, 6.28);
          c.fillStyle = rgba(GREEN, 0.2 + near * 0.5);
          c.fill();
        }
      }
    });

    this.nodes.forEach((p) => {
      if (p.z <= ZN) return;
      const pr = this._proj(p.px, p.py, p.z);
      const near = 1 - clamp(0, 1, (p.z - ZN) / (ZF - ZN));
      const pulse = 0.7 + Math.sin(t * 2.2 + p.ph) * 0.3;
      const col = p.hub ? PURPLE : GREEN;
      const R = (2 + near * 9) * (p.hub ? 1.15 : 0.65);
      const g = c.createRadialGradient(pr.x, pr.y, 0, pr.x, pr.y, R * 3.2);
      g.addColorStop(0, rgba(col, 0.9 * pulse));
      g.addColorStop(0.25, rgba(col, 0.32 * pulse));
      g.addColorStop(1, rgba(col, 0));
      c.beginPath();
      c.arc(pr.x, pr.y, R * 3.2, 0, 6.28);
      c.fillStyle = g;
      c.fill();
      c.beginPath();
      c.arc(pr.x, pr.y, Math.max(0.7, R * 0.32), 0, 6.28);
      c.fillStyle = `rgba(255,255,255,${0.5 * pulse * near + 0.15})`;
      c.fill();
      if (p.hub && near > 0.42) {
        const L = R * 4 * pulse;
        c.strokeStyle = rgba(col, 0.26 * near * pulse);
        c.lineWidth = Math.max(0.5, near);
        c.beginPath();
        c.moveTo(pr.x - L, pr.y); c.lineTo(pr.x + L, pr.y);
        c.moveTo(pr.x, pr.y - L * 0.75); c.lineTo(pr.x, pr.y + L * 0.75);
        c.stroke();
      }
    });

    c.globalCompositeOperation = "source-over";
    c.globalAlpha = 1;
    if (this.running) this.raf = requestAnimationFrame(this._frame);
  };

  setAlpha(a) { this.alpha = clamp(0, 1, a); }

  start() {
    if (this.running) return;
    this.running = true;
    this.raf = requestAnimationFrame(this._frame);
  }
  renderStatic() { this.running = false; this._frame(); }
  destroy() {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    window.removeEventListener("resize", this._onResize);
  }
}
