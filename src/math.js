// 4x4 矩陣（column-major，與 WebGL 一致）與小工具
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
export const mixColor = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
export const hex = h => { const n = parseInt(h.slice(1), 16); return [(n >> 16) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; };

export function rng(seed) {
  let s = seed | 0;
  return () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}

export const M = {
  ident() { const m = new Float32Array(16); m[0] = m[5] = m[10] = m[15] = 1; return m; },
  copy(m) { return new Float32Array(m); },
  persp(fovy, asp, n, f) {
    const t = 1 / Math.tan(fovy / 2), m = new Float32Array(16);
    m[0] = t / asp; m[5] = t; m[10] = (f + n) / (n - f); m[11] = -1; m[14] = 2 * f * n / (n - f); return m;
  },
  lookAt(e, c, u) {
    let zx = e[0] - c[0], zy = e[1] - c[1], zz = e[2] - c[2]; let l = Math.hypot(zx, zy, zz); zx /= l; zy /= l; zz /= l;
    let xx = u[1] * zz - u[2] * zy, xy = u[2] * zx - u[0] * zz, xz = u[0] * zy - u[1] * zx; l = Math.hypot(xx, xy, xz); xx /= l; xy /= l; xz /= l;
    const yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
    return new Float32Array([xx, yx, zx, 0, xy, yy, zy, 0, xz, yz, zz, 0,
      -(xx * e[0] + xy * e[1] + xz * e[2]), -(yx * e[0] + yy * e[1] + yz * e[2]), -(zx * e[0] + zy * e[1] + zz * e[2]), 1]);
  },
  mul(a, b) {
    const o = new Float32Array(16);
    for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++)
      o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
    return o;
  },
  // 以下皆為 m = m * X（就地修改）
  translate(m, x, y, z) {
    for (let r = 0; r < 4; r++) m[12 + r] += m[r] * x + m[4 + r] * y + m[8 + r] * z; return m;
  },
  rotY(m, a) {
    const c = Math.cos(a), s = Math.sin(a);
    for (let r = 0; r < 4; r++) { const a0 = m[r], a2 = m[8 + r]; m[r] = a0 * c - a2 * s; m[8 + r] = a0 * s + a2 * c; } return m;
  },
  rotX(m, a) {
    const c = Math.cos(a), s = Math.sin(a);
    for (let r = 0; r < 4; r++) { const a1 = m[4 + r], a2 = m[8 + r]; m[4 + r] = a1 * c + a2 * s; m[8 + r] = -a1 * s + a2 * c; } return m;
  },
  rotZ(m, a) {
    const c = Math.cos(a), s = Math.sin(a);
    for (let r = 0; r < 4; r++) { const a0 = m[r], a1 = m[4 + r]; m[r] = a0 * c + a1 * s; m[4 + r] = -a0 * s + a1 * c; } return m;
  },
  scale(m, x, y, z) { for (let r = 0; r < 4; r++) { m[r] *= x; m[4 + r] *= y; m[8 + r] *= z; } return m; },
  // 世界座標 → 螢幕（0..1），在鏡頭後方回傳 null
  project(vp, x, y, z) {
    const cx = vp[0] * x + vp[4] * y + vp[8] * z + vp[12], cy = vp[1] * x + vp[5] * y + vp[9] * z + vp[13], cw = vp[3] * x + vp[7] * y + vp[11] * z + vp[15];
    if (cw <= 0.01) return null; return [(cx / cw) * 0.5 + 0.5, 0.5 - (cy / cw) * 0.5];
  },
};
