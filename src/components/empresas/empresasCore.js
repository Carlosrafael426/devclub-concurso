/**
 * empresasCore — engine em canvas do planeta de partículas da seção
 * Empresas. Zero dependências — framework-agnóstica e testável isolada.
 *
 * O globo é feito de pontos amostrados numa esfera (espiral de Fibonacci,
 * a mesma técnica de distribuição uniforme usada nos "shellPts" do hero) e
 * filtrados contra uma máscara equirretangular dos continentes — só os
 * pontos que caem em "terra" viram os continentes visíveis. A máscara e a
 * amostragem são caras (13 mil pontos testados um a um) mas fixas: nunca
 * mudam entre frames nem entre instâncias, por isso ficam no escopo do
 * módulo, calculadas uma única vez quando o arquivo carrega — não a cada
 * montagem do componente.
 */

export const GREEN = [91, 241, 117];
export const PURPLE = [152, 75, 255];

export const clamp = (a, b, v) => (v < a ? a : v > b ? b : v);
export const rr = (a, b) => a + Math.random() * (b - a);
export const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
const lerpC = (a, b, f) => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];

/* Contornos simplificados dos continentes em (longitude, latitude). */
const LAND = [
  [[-168, 65], [-160, 71], [-140, 70], [-125, 70], [-100, 73], [-85, 74], [-62, 76], [-56, 60], [-66, 47], [-70, 42], [-76, 35], [-81, 25], [-90, 29], [-97, 26], [-105, 22], [-110, 24], [-117, 32], [-124, 40], [-125, 49], [-135, 57], [-150, 59], [-165, 55]],
  [[-105, 22], [-95, 18], [-88, 16], [-84, 10], [-79, 9], [-77, 8], [-83, 13], [-92, 15], [-100, 19]],
  [[-77, 8], [-72, 12], [-62, 11], [-52, 5], [-50, 0], [-38, -5], [-35, -8], [-38, -13], [-48, -25], [-58, -35], [-62, -40], [-66, -46], [-71, -54], [-75, -46], [-71, -30], [-70, -18], [-75, -5], [-79, 0]],
  [[-17, 15], [-16, 22], [-10, 30], [0, 36], [10, 37], [20, 32], [32, 31], [35, 25], [43, 12], [51, 12], [48, 2], [41, -5], [40, -15], [35, -24], [26, -34], [18, -35], [12, -18], [9, -1], [8, 4], [-3, 5], [-8, 5], [-13, 9]],
  [[-10, 36], [-9, 43], [-2, 43], [0, 49], [-5, 50], [1, 51], [8, 54], [12, 55], [20, 55], [21, 60], [25, 65], [30, 70], [45, 68], [60, 70], [75, 73], [90, 75], [105, 77], [115, 73], [130, 71], [145, 70], [160, 69], [170, 66], [178, 64], [165, 60], [155, 50], [145, 45], [140, 35], [122, 32], [120, 22], [110, 20], [105, 10], [100, 5], [95, 15], [90, 22], [80, 15], [75, 8], [72, 20], [68, 24], [62, 25], [58, 20], [50, 15], [45, 12], [43, 12], [35, 25], [32, 31], [28, 36], [20, 40], [12, 45], [3, 43]],
  [[113, -22], [114, -33], [118, -35], [129, -32], [138, -35], [145, -38], [150, -37], [153, -28], [146, -19], [142, -11], [132, -11], [127, -14], [122, -17]],
  [[-45, 60], [-52, 68], [-55, 75], [-40, 83], [-25, 82], [-20, 75], [-25, 68], [-35, 62]],
  [[130, 32], [136, 36], [141, 41], [145, 44], [142, 38], [137, 34], [132, 31]],
  [[-6, 50], [-3, 54], [-5, 58], [-8, 57], [-6, 53]],
  [[43, -12], [48, -16], [50, -23], [46, -25], [43, -20]],
  [[166, -35], [174, -37], [178, -40], [172, -45], [167, -45], [166, -40]],
  [[-180, -72], [-120, -74], [-60, -72], [0, -70], [60, -68], [120, -70], [180, -72], [180, -88], [-180, -88]],
];

const MW = 720, MH = 360;
const mask = document.createElement('canvas');
mask.width = MW;
mask.height = MH;
(function drawMask() {
  const m = mask.getContext('2d');
  m.fillStyle = '#000';
  m.fillRect(0, 0, MW, MH);
  m.fillStyle = '#fff';
  LAND.forEach((poly) => {
    m.beginPath();
    poly.forEach((p, i) => {
      const x = ((p[0] + 180) / 360) * MW;
      const y = ((90 - p[1]) / 180) * MH;
      if (i) m.lineTo(x, y);
      else m.moveTo(x, y);
    });
    m.closePath();
    m.fill();
  });
})();
const MD = mask.getContext('2d').getImageData(0, 0, MW, MH).data;
const isLand = (lon, lat) => {
  const x = Math.floor(((lon + 180) / 360) * MW);
  const y = Math.floor(((90 - lat) / 180) * MH);
  if (x < 0 || x >= MW || y < 0 || y >= MH) return false;
  return MD[(y * MW + x) * 4] > 127;
};

/* Pontos de terra (Fibonacci sphere + rejection sampling contra a máscara),
   casca externa pontilhada (o "véu" perto da silhueta) e malha low-poly ao
   redor — tudo calculado uma única vez, compartilhado por qualquer
   instância de Globe que venha a existir na página. */
const landPts = [];
const shellPts = [];
const polyPts = [];
const polyEdges = [];
(function buildGlobeData() {
  const N = 13000, off = 2 / N, inc = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y = i * off - 1 + off / 2, r = Math.sqrt(Math.max(0, 1 - y * y)), phi = i * inc;
    const x = Math.cos(phi) * r, z = Math.sin(phi) * r;
    const lat = (Math.asin(y) * 180) / Math.PI;
    const lon = (Math.atan2(z, x) * 180) / Math.PI;
    if (isLand(lon, lat)) landPts.push({ x, y, z });
  }
  const S = 2400, off2 = 2 / S;
  for (let i = 0; i < S; i++) {
    const y = i * off2 - 1 + off2 / 2, r = Math.sqrt(Math.max(0, 1 - y * y)), phi = i * inc;
    shellPts.push({ x: Math.cos(phi) * r, y, z: Math.sin(phi) * r });
  }
  const V = 34;
  for (let i = 0; i < V; i++) {
    const y = i * (2 / V) - 1 + 1 / V, r = Math.sqrt(Math.max(0, 1 - y * y)), phi = i * inc;
    polyPts.push({ x: Math.cos(phi) * r * 1.24, y: y * 1.24, z: Math.sin(phi) * r * 1.24 });
  }
  for (let i = 0; i < V; i++) {
    const d = [];
    for (let j = 0; j < V; j++) {
      if (i !== j) {
        d.push([
          Math.hypot(polyPts[i].x - polyPts[j].x, polyPts[i].y - polyPts[j].y, polyPts[i].z - polyPts[j].z),
          j,
        ]);
      }
    }
    d.sort((a, b) => a[0] - b[0]);
    d.slice(0, 3).forEach(([, j]) => {
      if (i < j) polyEdges.push([i, j]);
    });
  }
})();

export class Globe {
  constructor(canvas, host) {
    this.canvas = canvas;
    this.host = host;
    this.ctx = canvas.getContext('2d');
    this.t = 0;
    this.raf = null;
    this.running = false;

    this._onResize = () => this.resize();
    window.addEventListener('resize', this._onResize);
    this.resize();
  }

  resize() {
    const r = this.host.getBoundingClientRect();
    this.DPR = Math.min(window.devicePixelRatio || 1, 2);
    this.W = r.width;
    this.H = r.height;
    this.canvas.width = this.W * this.DPR;
    this.canvas.height = this.H * this.DPR;
    this.canvas.style.width = `${this.W}px`;
    this.canvas.style.height = `${this.H}px`;
  }

  /** Raio do globo em px, na escala atual — usado pelo layout dos nós de empresa. */
  radius() {
    return Math.min(this.W, this.H) * 0.335;
  }

  _frame = () => {
    this.resize();
    const c = this.ctx;
    c.setTransform(this.DPR, 0, 0, this.DPR, 0, 0);
    c.clearRect(0, 0, this.W, this.H);
    this.t += 0.0022;

    const cx = this.W / 2, cy = this.H / 2, R = this.radius();
    const ca = Math.cos(this.t), sa = Math.sin(this.t);
    const tilt = 0.36, ct = Math.cos(tilt), st = Math.sin(tilt);

    c.globalCompositeOperation = 'lighter';

    const rot = (p, scale) => {
      const x = p.x * ca - p.z * sa, z0 = p.x * sa + p.z * ca;
      const y = p.y * ct - z0 * st, z = p.y * st + z0 * ct;
      return { x: cx + x * R * scale, y: cy + y * R * scale, z };
    };

    // Casca externa pontilhada — só o limbo (perto da silhueta), como um véu.
    shellPts.forEach((p) => {
      const q = rot(p, 1.2);
      const edge = 1 - Math.abs(q.z);
      if (edge < 0.55) return;
      const a = ((edge - 0.55) / 0.45) * 0.32;
      const f = (q.x - (cx - R)) / (2 * R);
      const col = lerpC(GREEN, PURPLE, clamp(0, 1, f));
      c.fillStyle = rgba(col, a);
      c.fillRect(q.x, q.y, 1, 1);
    });

    // Malha low-poly ao redor do globo.
    polyEdges.forEach(([i, j]) => {
      const a = rot(polyPts[i], 1), b = rot(polyPts[j], 1);
      const front = ((a.z + b.z) / 2 + 1) / 2;
      const f = ((a.x + b.x) / 2 - (cx - R * 1.3)) / (2.6 * R);
      const col = lerpC(GREEN, PURPLE, clamp(0, 1, f));
      c.beginPath();
      c.moveTo(a.x, a.y);
      c.lineTo(b.x, b.y);
      c.strokeStyle = rgba(col, 0.04 + front * 0.16);
      c.lineWidth = 0.6 + front * 0.6;
      c.stroke();
    });
    polyPts.forEach((p) => {
      const q = rot(p, 1), front = (q.z + 1) / 2;
      c.fillStyle = rgba(PURPLE, 0.15 + front * 0.5);
      c.fillRect(q.x - 1, q.y - 1, 2, 2);
    });

    // Continentes em partículas.
    landPts.forEach((p) => {
      const q = rot(p, 1);
      if (q.z < -0.12) return; // esconde o lado oposto do globo
      const front = clamp(0, 1, (q.z + 0.12) / 1.12);
      const f = (q.x - (cx - R)) / (2 * R);
      const col = lerpC(GREEN, PURPLE, clamp(0, 1, f));
      const a = 0.18 + front * 0.75;
      c.fillStyle = rgba(col, a);
      const s = front > 0.6 ? 1.5 : 1;
      c.fillRect(q.x, q.y, s, s);
    });

    // Brilho atmosférico.
    const at = c.createRadialGradient(cx, cy, R * 0.86, cx, cy, R * 1.16);
    at.addColorStop(0, rgba(GREEN, 0));
    at.addColorStop(0.55, rgba(GREEN, 0.07));
    at.addColorStop(1, rgba(PURPLE, 0));
    c.beginPath();
    c.arc(cx, cy, R * 1.16, 0, 6.28);
    c.fillStyle = at;
    c.fill();

    c.globalCompositeOperation = 'source-over';
    if (this.running) this.raf = requestAnimationFrame(this._frame);
  };

  start() {
    if (this.running) return;
    this.running = true;
    this.raf = requestAnimationFrame(this._frame);
  }
  /** Um único frame estático — usado em prefers-reduced-motion. */
  renderStatic() {
    this.running = false;
    this._frame();
  }
  stop() {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = null;
  }
  destroy() {
    this.stop();
    window.removeEventListener('resize', this._onResize);
  }
}

/**
 * Desenha um "galho" ligando o globo (ax,ay) ao nó da empresa (x,y), com
 * ramificações secundárias curtas e perpendiculares ao tronco — confinadas
 * ao próprio segmento, nunca invadem o galho vizinho. Acende (mais opaco,
 * mais grosso) e ganha um pulso viajando pelo caminho quando `hot` é true.
 */
export function drawBranch(ctx, ax, ay, x, y, hot, pulse) {
  const dx = x - ax, dy = y - ay, L = Math.hypot(dx, dy) || 1;
  const ux = dx / L, uy = dy / L, px = -uy, py = ux;

  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(x, y);
  ctx.strokeStyle = hot ? rgba(GREEN, 0.85) : rgba(GREEN, 0.17);
  ctx.lineWidth = hot ? 2 : 1;
  ctx.stroke();

  [[0.3, 1], [0.52, -1], [0.74, 1], [0.86, -1]].forEach(([f, dir], k) => {
    const sx = ax + dx * f, sy = ay + dy * f;
    const len = (hot ? 20 : 14) + k * 3;
    const ex = sx + px * dir * len + ux * len * 0.55;
    const ey = sy + py * dir * len + uy * len * 0.55;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(sx + px * dir * len * 0.6, sy + py * dir * len * 0.6, ex, ey);
    ctx.strokeStyle = hot ? rgba(GREEN, 0.55) : rgba(GREEN, 0.1);
    ctx.lineWidth = hot ? 1.3 : 0.8;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(ex, ey, hot ? 2.3 : 1.4, 0, 6.28);
    ctx.fillStyle = hot ? rgba(GREEN, 0.95) : rgba(GREEN, 0.28);
    ctx.fill();
  });

  ctx.beginPath();
  ctx.arc(ax, ay, hot ? 3.4 : 2, 0, 6.28);
  ctx.fillStyle = hot ? rgba(GREEN, 1) : rgba(GREEN, 0.45);
  ctx.fill();

  if (hot && pulse != null) {
    const f = pulse % 1;
    const qx = ax + dx * f, qy = ay + dy * f;
    const g = ctx.createRadialGradient(qx, qy, 0, qx, qy, 10);
    g.addColorStop(0, rgba(GREEN, 1));
    g.addColorStop(1, rgba(GREEN, 0));
    ctx.beginPath();
    ctx.arc(qx, qy, 10, 0, 6.28);
    ctx.fillStyle = g;
    ctx.fill();
  }
}
