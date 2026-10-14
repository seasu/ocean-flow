// 極簡 WebGL 方塊渲染器：不依賴任何函式庫，手機也跑得動
import { M } from './math.js';

const HEAD = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
`;

const VS_BLOCK = `
attribute vec3 aPos; attribute vec3 aNrm; attribute vec3 aCol; attribute float aEmi;
uniform mat4 uVP, uM;
varying vec3 vCol, vN, vW; varying float vEmi;
void main(){
  vec4 w = uM * vec4(aPos, 1.0);
  vW = w.xyz; vN = (uM * vec4(aNrm, 0.0)).xyz; vCol = aCol; vEmi = aEmi;
  gl_Position = uVP * w;
}`;

const FS_BLOCK = HEAD + `
varying vec3 vCol, vN, vW; varying float vEmi;
uniform vec3 uMul, uEye, uFog, uLight, uSun, uAmb, uGlow;
uniform vec2 uFogR;
uniform vec4 uPulse;          // xz 中心、半徑、強度（感知波）
uniform float uEmi, uAlpha, uSpirit, uTime, uGrid;
void main(){
  vec3 n = normalize(vN);
  vec3 base = vCol * uMul;
  if (uGrid > 0.5) {
    // 地形：頂面棋盤深淺（Roblox 草地感）、側面每一格一層的深淺；網格合併後改在這裡畫
    if (n.y > 0.5) base *= 1.0 - 0.04 * mod(floor(vW.x + 0.001) + floor(vW.z + 0.001), 2.0);
    if (vEmi < -0.5) base *= 0.88 + 0.12 * mod(floor(vW.y + 0.001), 2.0);
  }
  float d = max(dot(n, uLight), 0.0);
  float side = 0.86 + 0.14 * abs(n.x);       // 兩側面亮度略不同，方塊感更清楚
  vec3 c = base * (uAmb + uSun * d) * side;
  float e = max(vEmi, 0.0) + uEmi;
  c = mix(c, base * 1.25, clamp(e, 0.0, 1.0));
  float dist = distance(vW, uEye);
  if (uGrid > 0.5) {
    // 靈界：地面方塊邊緣浮現流動的光脈
    vec2 f = abs(fract(vW.xz) - 0.5);
    float edge = smoothstep(0.46, 0.5, max(f.x, f.y)) * step(0.5, n.y);
    float wave = 0.55 + 0.45 * sin(length(vW.xz - vec2(64.0)) * 0.35 - uTime * 2.2);
    c += uGlow * edge * uSpirit * wave * 0.45;
    // 感知波掃過
    float ring = 1.0 - smoothstep(0.0, 1.6, abs(distance(vW.xz, uPulse.xy) - uPulse.z));
    c += vec3(0.45, 0.9, 1.0) * ring * uPulse.w;
  }
  float fog = smoothstep(uFogR.x, uFogR.y, dist) * (1.0 - clamp(e, 0.0, 1.0) * 0.6);
  gl_FragColor = vec4(mix(c, uFog, fog), uAlpha);
}`;

const VS_WATER = `
attribute vec2 aPos; attribute float aDepth;
uniform mat4 uVP; uniform float uTime, uLevel;
varying vec3 vW; varying float vDepth;
void main(){
  float y = uLevel + sin(aPos.x * 0.7 + uTime * 1.3) * 0.05 + cos(aPos.y * 0.6 + uTime * 1.1) * 0.05;
  vW = vec3(aPos.x, y, aPos.y); vDepth = aDepth;
  gl_Position = uVP * vec4(vW, 1.0);
}`;

const FS_WATER = HEAD + `
varying vec3 vW; varying float vDepth;
uniform vec3 uEye, uFog, uShallow, uDeep, uGlow;
uniform vec2 uFogR;
uniform float uTime, uSpirit, uSense;
uniform vec4 uPulse;
uniform vec3 uCur;            // 洋流：中心線 x、半寬、流速
float curX(float z){ return uCur.x + 3.0 * sin(z * 0.05); }
void main(){
  float dep = clamp(vDepth / 3.0, 0.0, 1.0);
  vec3 c = mix(uShallow, uDeep, dep);
  // 粼粼波光
  float sp = sin(vW.x * 2.1 + uTime * 1.7) * sin(vW.z * 1.7 - uTime * 1.3);
  c += vec3(0.10) * smoothstep(0.75, 1.0, sp);
  // 岸邊浪花
  c = mix(c, vec3(0.95, 0.98, 1.0), smoothstep(0.35, 0.0, vDepth) * (0.5 + 0.5 * sin(uTime * 2.0 + vW.x + vW.z)));
  // 黑潮：往北流動的光帶
  float dx = abs(vW.x - curX(vW.z));
  float band = 1.0 - smoothstep(uCur.y - 1.2, uCur.y, dx);
  float lane = smoothstep(0.55, 1.0, sin(vW.x * 2.6 + sin(vW.z * 0.3) * 2.0));
  float dash = smoothstep(0.35, 1.0, sin(vW.z * 0.9 + uTime * uCur.z * 0.9 + vW.x * 0.7));
  float flow = band * lane * dash;
  c = mix(c, c * vec3(0.8, 1.0, 1.15), band * 0.5);
  c += mix(vec3(0.75, 0.95, 1.0), uGlow, uSpirit) * flow * (0.35 + uSense * 0.65 + uSpirit * 0.35);
  float ring = 1.0 - smoothstep(0.0, 1.6, abs(distance(vW.xz, uPulse.xy) - uPulse.z));
  c += vec3(0.45, 0.9, 1.0) * ring * uPulse.w;
  float fog = smoothstep(uFogR.x, uFogR.y, distance(vW, uEye));
  gl_FragColor = vec4(mix(c, uFog, fog), mix(0.72, 0.92, dep));
}`;

const VS_SKY = `attribute vec2 aPos; varying vec2 vP; void main(){ vP = aPos; gl_Position = vec4(aPos, 0.9999, 1.0); }`;
const FS_SKY = HEAD + `
varying vec2 vP; uniform vec3 uTop, uBot; uniform float uSpirit, uTime, uHorizon;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main(){
  float t = smoothstep(uHorizon - 0.15, 1.0, vP.y);
  vec3 c = mix(uBot, uTop, t);
  vec2 g = floor(gl_FragCoord.xy / 3.0);
  float s = step(0.997, h(g)) * (0.5 + 0.5 * sin(uTime * 2.0 + h(g + 7.0) * 30.0));
  c += vec3(0.9, 0.95, 1.0) * s * uSpirit * t;
  gl_FragColor = vec4(c, 1.0);
}`;

function compile(gl, vs, fs) {
  const p = gl.createProgram();
  for (const [type, src] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]]) {
    const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    gl.attachShader(p, s);
  }
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  const u = {}, a = {};
  const nu = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < nu; i++) { const n = gl.getActiveUniform(p, i).name; u[n] = gl.getUniformLocation(p, n); }
  const na = gl.getProgramParameter(p, gl.ACTIVE_ATTRIBUTES);
  for (let i = 0; i < na; i++) { const n = gl.getActiveAttrib(p, i).name; a[n] = gl.getAttribLocation(p, n); }
  return { p, u, a };
}

// 方塊幾何收集器：每個頂點 10 個 float（位置、法線、顏色、自發光）
export class Builder {
  constructor() { this.v = []; }
  quad(p0, p1, p2, p3, n, c, e) {
    for (const p of [p0, p1, p2, p0, p2, p3]) this.v.push(p[0], p[1], p[2], n[0], n[1], n[2], c[0], c[1], c[2], e);
  }
  // 軸對齊方塊；faces 位元：1 上 2 下 4 +x 8 -x 16 +z 32 -z
  box(x, y, z, w, h, d, c, e = 0, faces = 63, sideC = c) {
    const X = x + w, Y = y + h, Z = z + d;
    if (faces & 1) this.quad([x, Y, z], [x, Y, Z], [X, Y, Z], [X, Y, z], [0, 1, 0], c, e);
    if (faces & 2) this.quad([x, y, z], [X, y, z], [X, y, Z], [x, y, Z], [0, -1, 0], sideC, e);
    if (faces & 4) this.quad([X, y, z], [X, Y, z], [X, Y, Z], [X, y, Z], [1, 0, 0], sideC, e);
    if (faces & 8) this.quad([x, y, z], [x, y, Z], [x, Y, Z], [x, Y, z], [-1, 0, 0], sideC, e);
    if (faces & 16) this.quad([x, y, Z], [X, y, Z], [X, Y, Z], [x, Y, Z], [0, 0, 1], sideC, e);
    if (faces & 32) this.quad([x, y, z], [x, Y, z], [X, Y, z], [X, y, z], [0, 0, -1], sideC, e);
  }
  // 中心在原點的方塊（給角色零件與小物件用）
  cbox(cx, cy, cz, w, h, d, c, e = 0) { this.box(cx - w / 2, cy - h / 2, cz - d / 2, w, h, d, c, e); }
}

export class Renderer {
  constructor(canvas) {
    const gl = canvas.getContext('webgl', { antialias: true, alpha: false, powerPreference: 'high-performance' });
    if (!gl) throw new Error('此瀏覽器不支援 WebGL');
    this.gl = gl; this.canvas = canvas;
    this.block = compile(gl, VS_BLOCK, FS_BLOCK);
    this.water = compile(gl, VS_WATER, FS_WATER);
    this.sky = compile(gl, VS_SKY, FS_SKY);
    this.skyBuf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, this.skyBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const cube = new Builder(); cube.cbox(0, 0, 0, 1, 1, 1, [1, 1, 1]);
    this.cube = this.mesh(cube);
    gl.enable(gl.DEPTH_TEST); gl.enable(gl.CULL_FACE); gl.cullFace(gl.BACK);
    this.env = null;
  }
  mesh(b) {
    const gl = this.gl, buf = gl.createBuffer(), data = new Float32Array(b.v);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return { buf, count: data.length / 10 };
  }
  waterMesh(data) {
    const gl = this.gl, buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return { buf, count: data.length / 3 };
  }
  resize() {
    const c = this.canvas, d = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(c.clientWidth * d), h = Math.round(c.clientHeight * d);
    if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
    this.gl.viewport(0, 0, w, h);
    return w / h;
  }
  // env：每格共用的光照、霧、靈界程度
  begin(vp, eye, env) {
    const gl = this.gl; this.vp = vp; this.eye = eye; this.env = env;
    gl.clearColor(env.fog[0], env.fog[1], env.fog[2], 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // 天空
    const s = this.sky; gl.useProgram(s.p); gl.depthMask(false);
    gl.uniform3fv(s.u.uTop, env.skyTop); gl.uniform3fv(s.u.uBot, env.fog);
    gl.uniform1f(s.u.uSpirit, env.spirit); gl.uniform1f(s.u.uTime, env.time); gl.uniform1f(s.u.uHorizon, env.horizon);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.skyBuf); gl.enableVertexAttribArray(s.a.aPos);
    gl.vertexAttribPointer(s.a.aPos, 2, gl.FLOAT, false, 0, 0); gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.disableVertexAttribArray(s.a.aPos); gl.depthMask(true);
    this.useBlock();
  }
  useBlock() {
    const gl = this.gl, b = this.block, e = this.env; gl.useProgram(b.p);
    gl.uniformMatrix4fv(b.u.uVP, false, this.vp); gl.uniform3fv(b.u.uEye, this.eye);
    gl.uniform3fv(b.u.uFog, e.fog); gl.uniform2fv(b.u.uFogR, e.fogR); gl.uniform3fv(b.u.uLight, e.light);
    gl.uniform3fv(b.u.uSun, e.sun); gl.uniform3fv(b.u.uAmb, e.amb); gl.uniform3fv(b.u.uGlow, e.glow);
    gl.uniform4fv(b.u.uPulse, e.pulse); gl.uniform1f(b.u.uSpirit, e.spirit); gl.uniform1f(b.u.uTime, e.time);
    gl.uniform1f(b.u.uGrid, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null); this.bound = null;
  }
  // mode：0 不透明、1 半透明、2 加亮
  blend(mode) {
    const gl = this.gl;
    if (mode === 0) { gl.disable(gl.BLEND); gl.depthMask(true); }
    else { gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, mode === 2 ? gl.ONE : gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false); }
  }
  draw(mesh, model, mul = [1, 1, 1], emi = 0, alpha = 1, grid = 0) {
    const gl = this.gl, b = this.block;
    if (this.bound !== mesh) {
      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.buf);
      const st = 40;
      gl.enableVertexAttribArray(b.a.aPos); gl.vertexAttribPointer(b.a.aPos, 3, gl.FLOAT, false, st, 0);
      gl.enableVertexAttribArray(b.a.aNrm); gl.vertexAttribPointer(b.a.aNrm, 3, gl.FLOAT, false, st, 12);
      gl.enableVertexAttribArray(b.a.aCol); gl.vertexAttribPointer(b.a.aCol, 3, gl.FLOAT, false, st, 24);
      gl.enableVertexAttribArray(b.a.aEmi); gl.vertexAttribPointer(b.a.aEmi, 1, gl.FLOAT, false, st, 36);
      this.bound = mesh;
    }
    gl.uniformMatrix4fv(b.u.uM, false, model); gl.uniform3fv(b.u.uMul, mul);
    gl.uniform1f(b.u.uEmi, emi); gl.uniform1f(b.u.uAlpha, alpha); gl.uniform1f(b.u.uGrid, grid);
    gl.drawArrays(gl.TRIANGLES, 0, mesh.count);
  }
  // 中心在 (x,y,z) 的方塊，可繞 Y 軸轉
  box(x, y, z, w, h, d, mul, emi = 0, alpha = 1, rotY = 0) {
    const m = M.ident(); M.translate(m, x, y, z); if (rotY) M.rotY(m, rotY); M.scale(m, w, h, d);
    this.draw(this.cube, m, mul, emi, alpha);
  }
  drawWater(mesh, env) {
    const gl = this.gl, w = this.water, b = this.block; gl.useProgram(w.p);
    for (const k of ['aPos', 'aNrm', 'aCol', 'aEmi']) if (b.a[k] !== undefined) gl.disableVertexAttribArray(b.a[k]);
    gl.uniformMatrix4fv(w.u.uVP, false, this.vp); gl.uniform3fv(w.u.uEye, this.eye);
    gl.uniform1f(w.u.uTime, env.time); gl.uniform1f(w.u.uLevel, env.waterLevel);
    gl.uniform3fv(w.u.uFog, env.fog); gl.uniform2fv(w.u.uFogR, env.fogR);
    gl.uniform3fv(w.u.uShallow, env.shallow); gl.uniform3fv(w.u.uDeep, env.deep); gl.uniform3fv(w.u.uGlow, env.glow);
    gl.uniform1f(w.u.uSpirit, env.spirit); gl.uniform1f(w.u.uSense, env.sense);
    gl.uniform4fv(w.u.uPulse, env.pulse); gl.uniform3fv(w.u.uCur, env.current);
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.buf);
    gl.enableVertexAttribArray(w.a.aPos); gl.vertexAttribPointer(w.a.aPos, 2, gl.FLOAT, false, 12, 0);
    gl.enableVertexAttribArray(w.a.aDepth); gl.vertexAttribPointer(w.a.aDepth, 1, gl.FLOAT, false, 12, 8);
    gl.disable(gl.CULL_FACE);
    gl.drawArrays(gl.TRIANGLES, 0, mesh.count);
    gl.enable(gl.CULL_FACE);
    gl.disableVertexAttribArray(w.a.aPos); gl.disableVertexAttribArray(w.a.aDepth);
    this.useBlock();
  }
}
