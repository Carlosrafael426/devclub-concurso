/**
 * stacksCore — renderers em canvas da seção Stacks.
 *
 * CoreScene é a esfera de pontos, plataforma isométrica e chip (o "núcleo").
 * BgNeural (a MESMA rede neural 3D do hero, em baixa intensidade) vive em
 * ../../lib/bgNeural — compartilhada com Hero e Depoimentos, em vez de uma
 * terceira cópia da mesma engine — e é só reexportada aqui pra não quebrar
 * quem já importa `BgNeural`/`GREEN`/`PURPLE`/`rgba` a partir deste módulo.
 *
 * Zero dependências — framework-agnóstico e testável isolado.
 */

import { GREEN, PURPLE, rgba, BgNeural } from "../../lib/bgNeural";

export { GREEN, PURPLE, rgba, BgNeural };

/* ============================ NÚCLEO ============================ */

export class CoreScene {
  constructor(canvas, host) {
    this.canvas = canvas;
    this.host = host;
    this.ctx = canvas.getContext("2d");
    this.t = 0;
    this.raf = null;
    this.running = false;
    this.sphere = [];

    // Malha lat/lon: 16 anéis x 30 meridianos = 480 pontos.
    const LAT = 17, LON = 30;
    for (let i = 1; i < LAT; i++) {
      const phi = (Math.PI * i) / LAT;
      for (let j = 0; j < LON; j++) {
        const th = (2 * Math.PI * j) / LON;
        this.sphere.push({
          x: Math.sin(phi) * Math.cos(th),
          y: Math.cos(phi),
          z: Math.sin(phi) * Math.sin(th),
          ph: Math.random() * 6.28,
        });
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

  _oct(cx, cy, rw, rh, cut) {
    const c = this.ctx;
    c.beginPath();
    c.moveTo(cx - rw + cut, cy - rh);
    c.lineTo(cx + rw - cut, cy - rh);
    c.lineTo(cx + rw, cy - rh + cut);
    c.lineTo(cx + rw, cy + rh - cut);
    c.lineTo(cx + rw - cut, cy + rh);
    c.lineTo(cx - rw + cut, cy + rh);
    c.lineTo(cx - rw, cy + rh - cut);
    c.lineTo(cx - rw, cy - rh + cut);
    c.closePath();
  }

  _frame = () => {
    this.resize();
    const c = this.ctx;
    const { W, H } = this;
    c.setTransform(this.DPR, 0, 0, this.DPR, 0, 0);
    c.clearRect(0, 0, W, H);
    this.t += 0.008;

    const cx = W / 2;
    const sy = H * 0.36;
    const R = Math.min(W, H) * 0.245;
    const platY = H * 0.76;
    const t = this.t;

    c.globalCompositeOperation = "lighter";

    /* --- esfera girando --- */
    const ry = t * 0.22, cr = Math.cos(ry), sr = Math.sin(ry);
    this.sphere.forEach((p) => {
      const x = p.x * cr - p.z * sr;
      const z = p.x * sr + p.z * cr;
      const depth = (z + 1) / 2;
      const px = cx + x * R;
      const py = sy + p.y * R * 0.96;
      const a = (0.1 + depth * 0.55) * (0.6 + Math.sin(t * 2 + p.ph) * 0.4);
      c.beginPath();
      c.arc(px, py, 0.8 + depth * 1.1, 0, 6.28);
      c.fillStyle = rgba(GREEN, Math.max(0, a));
      c.fill();
    });

    for (let k = 0; k < 5; k++) {
      c.beginPath();
      for (let i = 0; i <= 48; i++) {
        const phi = (Math.PI * i) / 48;
        const th = (k / 5) * Math.PI * 2 + ry;
        const px = cx + Math.sin(phi) * Math.cos(th) * R;
        const py = sy + Math.cos(phi) * R * 0.96;
        if (i) c.lineTo(px, py);
        else c.moveTo(px, py);
      }
      c.strokeStyle = rgba(GREEN, 0.07);
      c.lineWidth = 1;
      c.stroke();
    }

    /* --- raios do chip subindo --- */
    for (let i = 0; i < 26; i++) {
      const off = (i - 13) * 5.5;
      const h = 110 + Math.sin(t * 1.6 + i) * 26;
      const g = c.createLinearGradient(cx + off, platY - 40, cx + off, platY - 40 - h);
      g.addColorStop(0, rgba(GREEN, 0.42));
      g.addColorStop(1, rgba(GREEN, 0));
      c.fillStyle = g;
      c.fillRect(cx + off - 0.7, platY - 40 - h, 1.4, h);
    }
    for (let i = 0; i < 16; i++) {
      const f = ((i / 16) + t * 0.5) % 1;
      c.beginPath();
      c.arc(cx + (Math.random() - 0.5) * 66, platY - 40 - f * 150, 1.4, 0, 6.28);
      c.fillStyle = rgba(GREEN, 0.7 * (1 - f));
      c.fill();
    }

    /* --- plataforma isométrica em 5 camadas --- */
    const layers = [
      { w: R * 1.32, h: R * 0.46, y: platY + 34, cut: R * 0.30, col: GREEN,  a: 0.20, lw: 1.2 },
      { w: R * 1.16, h: R * 0.40, y: platY + 18, cut: R * 0.26, col: GREEN,  a: 0.28, lw: 1.3 },
      { w: R * 0.98, h: R * 0.34, y: platY + 2,  cut: R * 0.22, col: PURPLE, a: 0.42, lw: 1.5 },
      { w: R * 0.78, h: R * 0.27, y: platY - 12, cut: R * 0.18, col: GREEN,  a: 0.50, lw: 1.5 },
      { w: R * 0.56, h: R * 0.20, y: platY - 24, cut: R * 0.13, col: GREEN,  a: 0.62, lw: 1.6 },
    ];
    layers.forEach((L, i) => {
      this._oct(cx, L.y, L.w, L.h, L.cut);
      c.strokeStyle = rgba(L.col, L.a);
      c.lineWidth = L.lw;
      c.stroke();
      c.fillStyle = rgba(L.col, 0.035);
      c.fill();
      if (i < 3) {
        const pulse = 0.5 + Math.sin(t * 2.4 + i) * 0.5;
        [[-1, PURPLE], [1, GREEN]].forEach(([sgn, col]) => {
          c.beginPath();
          c.roundRect(cx + sgn * L.w * 0.6 - 16, L.y - 3, 32, 5, 2);
          c.fillStyle = rgba(col, 0.35 + pulse * 0.5);
          c.fill();
        });
        for (let k = 0; k < 5; k++) {
          c.beginPath();
          c.rect(cx - L.w * 0.28 + k * 13, L.y + L.h * 0.42, 6, 3);
          c.fillStyle = rgba(k % 2 ? PURPLE : GREEN, 0.3 + pulse * 0.4);
          c.fill();
        }
      }
    });

    /* --- chip --- */
    const cs = R * 0.30, chipY = platY - 38, pl = 0.55 + Math.sin(t * 2.6) * 0.45;
    const gg = c.createRadialGradient(cx, chipY, 0, cx, chipY, cs * 2.6);
    gg.addColorStop(0, rgba(GREEN, 0.85 * pl));
    gg.addColorStop(0.4, rgba(GREEN, 0.25 * pl));
    gg.addColorStop(1, rgba(GREEN, 0));
    c.beginPath();
    c.arc(cx, chipY, cs * 2.6, 0, 6.28);
    c.fillStyle = gg;
    c.fill();
    c.beginPath();
    c.roundRect(cx - cs / 2, chipY - cs * 0.34, cs, cs * 0.68, 4);
    c.fillStyle = rgba(GREEN, 0.55 + pl * 0.35);
    c.fill();
    c.strokeStyle = `rgba(255,255,255,${0.5 + pl * 0.4})`;
    c.lineWidth = 1.4;
    c.stroke();
    for (let i = 0; i < 6; i++) {
      const o = -cs / 2 + 7 + i * ((cs - 14) / 5);
      [[o, -cs * 0.34, o, -cs * 0.34 - 7], [o, cs * 0.34, o, cs * 0.34 + 7]].forEach((v) => {
        c.beginPath();
        c.moveTo(cx + v[0], chipY + v[1]);
        c.lineTo(cx + v[2], chipY + v[3]);
        c.strokeStyle = rgba(GREEN, 0.5 + pl * 0.35);
        c.lineWidth = 1.3;
        c.stroke();
      });
    }

    /* --- feixe descendo --- */
    const dg = c.createLinearGradient(cx, platY + 50, cx, H);
    dg.addColorStop(0, rgba(GREEN, 0.5));
    dg.addColorStop(1, rgba(GREEN, 0));
    c.fillStyle = dg;
    c.fillRect(cx - 1.2, platY + 50, 2.4, H - platY - 50);

    c.globalCompositeOperation = "source-over";
    if (this.running) this.raf = requestAnimationFrame(this._frame);
  };

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

