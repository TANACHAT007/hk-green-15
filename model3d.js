// 3D tab: offline three.js twin of the machine (Fusion STEP -> GLB, see make_glb.py) with a live process
// animation driven by the same status the firmware sends: liquid levels, powder, drops, beads, spray, stirring.
// The operator fills water / powder / NaOH here before START, just like on the real machine.
import * as THREE from 'three';
import { OrbitControls } from './vendor/OrbitControls.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';

const GROUPS = {   // top-level Fusion component -> Thai label
  Frame_2020: 'โครงอลูมิเนียม 2020', Bracket_2020_corner_20x20x17: 'ฉากยึดโครง + น็อต', Plates_PP: 'แผ่น PP',
  Acrylic_Enclosure_Top: 'ฝาครอบอะคริลิก', Powder_Hopper_Auger: 'ถังผง + สกรูป้อน', Acid_Mix_Tank: 'ถังผสมกรด',
  Magnetic_Stirrer_DIY_12V: 'พัดลมกวนถังกรด', Dispensing_Box: 'กล่องหยด (เข็ม 12 หัว)', Plumbing_Solution: 'ท่อสารละลาย',
  Crosslinking_Chamber: 'ถังขึ้นรูป NaOH', Chamber_Magnetic_Stirrer_12V: 'ตัวกวนถังขึ้นรูป', Rinsing_Zone: 'โซนล้าง + ตะกร้า',
  Plumbing_Water: 'ท่อน้ำล้าง', Plumbing_Outlet_1in: 'ท่อทิ้ง 1"', Solenoid_Valve_1in_PIK2: 'โซลินอยด์วาล์ว',
  Tanks_Under_Extension: 'ถังน้ำล้าง / ถังน้ำทิ้ง', Drying_Tray: 'ถาดตาก', Front_Panel: 'แผงหน้า', E_stop_LAY37_real: 'ปุ่มหยุดฉุกเฉิน',
  Btn_start_LAY37_green_real: 'ปุ่ม START', Btn_stop_LAY37_red_real: 'ปุ่ม STOP', Electronics_Bay: 'ช่องอิเล็กทรอนิกส์',
  Levelling_Feet: 'ขาปรับระดับ', Biochar_Feeder: 'ชุดป้อนไบโอชาร์ (N20)',
};
const KEYS = Object.keys(GROUPS).sort((a, b) => b.length - a.length);   // GLTFLoader strips ':' -> match by prefix
const OUT_MAP = {
  auger: ['Powder_Hopper_Auger'], bio: ['Biochar_Feeder'], top: ['Magnetic_Stirrer_DIY_12V'], ch: ['Chamber_Magnetic_Stirrer_12V'],
  peri: ['Dispensing_Box', 'Plumbing_Solution'], rinse: ['Plumbing_Water'], valve: ['Solenoid_Valve_1in_PIK2', 'Plumbing_Outlet_1in'],
};
const SHELL = ['Acrylic_Enclosure_Top', 'Plates_PP'];                               // hidden in x-ray view
const SEE_THROUGH = ['Biochar_Feeder', 'Acid_Mix_Tank', 'Crosslinking_Chamber', 'Tanks_Under_Extension', 'Powder_Hopper_Auger', 'Rinsing_Zone', 'Dispensing_Box'];
const STATES = ['IDLE', 'DOSE', 'DISSOLVE', 'DRIP', 'SET', 'DRAIN', 'RINSE_SPRAY', 'RINSE_WAIT', 'TILT', 'TILT_BACK', 'DONE'];
const STATE_TH = { IDLE: '😴 พร้อม', DOSE: '🥄 ป้อนผง', DISSOLVE: '🌀 กวนละลาย', DRIP: '💧 หยดเป็นเม็ด', SET: '⏳ แช่ NaOH', DRAIN: '🚿 ปล่อยน้ำ',
  RINSE_SPRAY: '💦 สเปรย์ล้าง', RINSE_WAIT: '🧪 วัด pH', TILT: '↘️ เทถาด', TILT_BACK: '↩️ ถาดกลับ', DONE: '🎉 เสร็จแล้ว!', SAFE: '🛑 หยุดฉุกเฉิน' };

// Process geometry in Fusion coordinates (mm, Z up) measured from the assembly; P() converts to the Y-up scene.
const G = {
  acid: { x: 113, y: 225, r: 54, z0: 729, h: 76 },             // 500 mL acetic acid
  chamber: { x: 170, y: 170, r: 90, z0: 316, h: 190 },          // 2 M NaOH
  hopper: { x: 250, y: 225, r: 40, z0: 858, h: 78 },         // v8.9d tall hopper through the top cover
  bioHop: { x: 105, y: 108, r: 25, z0: 866, h: 25 }, bioOut: { x: 105, y: 185, z: 812 },
  needles: { x0: 118, x1: 214, y: [146, 176], z: 580 },
  augerOut: { x: 70, y: 225, z: 812 },
  basket: { x0: 352, x1: 590, y0: 18, y1: 328, z: 252 },
  spray: { z: 352 },
  tray: { x0: 625, x1: 795, y0: 50, y1: 290, z: 228 },
  outlet: { x0: 278, x1: 486, y: 170, z: 318 },                 // 1" outlet: chamber -> valve -> over the basket
  stirAcid: { x: 113, y: 225, z: 734, len: 40 }, stirCh: { x: 170, y: 170, z: 322, len: 50 },
  waste: { x0: 356, x1: 586, y0: 2, y1: 300, z0: 30, h: 108 },
  water: { x0: 616, x1: 810, y0: 2, y1: 300, z0: 30, h: 132 },
};
const P = (x, y, z) => new THREE.Vector3(x, z, -y);
const PH_COL = (ph) => new THREE.Color().setHSL(Math.max(0, Math.min(0.78, (ph - 4) / 10 * 0.78)), 0.85, 0.55);

const $ = (id) => document.getElementById(id);
const host = $('m3d'), list = $('m3dParts'), info = $('m3dInfo');
let renderer, scene, camera, controls, model, fx, started = false, pick = null, clock;
const groups = {};
const key = (name) => { name = name || ''; return KEYS.find((k) => name.startsWith(k)) || name.replace(/_?\d+$/, ''); };

// ---- operator-side state (what has been filled) — kept per browser
const V = { bioG: 0, hopperG: 0, acidMl: 0, naoh: 0, water: 0, waste: 0, trayBeads: 0 };
try { Object.assign(V, JSON.parse(localStorage.getItem('hk15_3d') || '{}')); } catch (e) {}
const saveV = () => { try { localStorage.setItem('hk15_3d', JSON.stringify(V)); } catch (e) {} };
const CAP = { hopperG: 140, acidMl: 500, bioG: 45 };   // biochar hopper ≈ 150 mL ≈ 45 g = 4 batches of 10.6 g
let dosed = false, S = null, lastState = null, xray = true, labelsOn = true, runBeads = 0, beadWhere = 'none', phase0 = {};

// ================================================================= scene
function init() {
  started = true; clock = new THREE.Clock();
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
  host.prepend(renderer.domElement);
  scene = new THREE.Scene();
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  camera = new THREE.PerspectiveCamera(35, 1, 5, 20000);
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.dampingFactor = 0.08; controls.autoRotateSpeed = 0.6; controls.maxPolarAngle = Math.PI * 0.53;
  controls.addEventListener('start', () => { tween = null; });
  const sun = new THREE.DirectionalLight(0xffffff, 1.4); sun.position.set(600, 1400, 900); scene.add(sun);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xc9d6ff, 0.55));
  ground();
  info.textContent = 'กำลังโหลดโมเดล…';
  new GLTFLoader().load('model/hk-green-15.glb', (g) => {
    model = g.scene; model.scale.setScalar(1000); model.rotation.x = -Math.PI / 2;   // m -> mm, Fusion Z-up -> Y-up
    const top = model.children[0] || model;
    for (const c of top.children) {
      const k = key(c.name); const Gp = groups[k] || (groups[k] = { label: GROUPS[k] || k, objs: [], mats: [], on: true });
      Gp.objs.push(c);
      c.traverse((o) => { if (!o.isMesh) return;
        const m = o.material = o.material.clone(); m.side = THREE.DoubleSide; o.userData.g = k;
        if (m.roughness !== undefined) { m.roughness = Math.max(0.35, m.roughness); m.envMapIntensity = 0.9; }
        if (k === 'Frame_2020' || k === 'Bracket_2020_corner_20x20x17') { m.metalness = 0.85; m.roughness = 0.38; m.color && m.color.lerp(new THREE.Color(0xc9ccd0), 0.5); }
        if (k === 'Plates_PP') { m.metalness = 0; m.roughness = 0.85; }
        if (k === 'Acrylic_Enclosure_Top') Object.assign(m, { transparent: true, opacity: 0.18, depthWrite: false });
        m.userData.op = m.opacity; Gp.mats.push(m); });
    }
    scene.add(model); buildFx(); applyXray(); buildList(); view('all', true);
    info.textContent = 'ลากเพื่อหมุน · เลื่อนล้อเพื่อซูม · คลิกขวาลากเพื่อเลื่อน · คลิกชิ้นส่วนเพื่อดูชื่อ';
    host.classList.add('ready');
    if (S) update(S, true);
  }, (e) => { if (e.total) info.textContent = 'กำลังโหลดโมเดล… ' + Math.round(100 * e.loaded / e.total) + '%'; },
  (e) => { info.textContent = 'โหลดโมเดลไม่ได้: ' + e; });
  renderer.domElement.addEventListener('pointerdown', (e) => { pick = [e.clientX, e.clientY]; });
  renderer.domElement.addEventListener('pointerup', (e) => { if (pick && Math.hypot(e.clientX - pick[0], e.clientY - pick[1]) < 4) select(e); });
  new ResizeObserver(size).observe(host); size(); loop();
}
function ground() {
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
  const r = g.createRadialGradient(128, 128, 10, 128, 128, 128); r.addColorStop(0, 'rgba(60,40,140,.22)'); r.addColorStop(0.55, 'rgba(60,40,140,.07)'); r.addColorStop(1, 'rgba(60,40,140,0)');
  g.fillStyle = r; g.fillRect(0, 0, 256, 256);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1500, 1100), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.position.set(420, -16, -170); scene.add(m);
}
function size() { const w = host.clientWidth, h = host.clientHeight; if (!w || !h) return; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); }

// ---- camera presets with a smooth move
const VIEWS = {
  all: { t: [420, 170, 450], d: [1.0, 0.55, 1.25], k: 1.0 },
  mix: { t: [150, 225, 770], d: [0.7, 0.75, -1.0], k: 0.3 },     // from behind: the front panel hides the tanks
  chamber: { t: [170, 170, 470], d: [0.9, 0.45, 1.25], k: 0.45 },
  rinse: { t: [560, 170, 240], d: [0.7, 0.75, 1.2], k: 0.5 },
  // guided tour only
  intro: { t: [430, 170, 450], d: [-0.55, 0.42, 1.25], k: 0.9 },
  feed: { t: [150, 210, 800], d: [0.45, 0.8, -1.0], k: 0.36 },
  drip: { t: [185, 165, 480], d: [1.2, 0.28, 0.45], k: 0.5 },          // from the right: the front panel hides the chamber
  tray: { t: [640, 170, 250], d: [1.0, 0.8, 0.9], k: 0.5 },
};
let tween = null;
function view(name, now, ms) {
  const v = VIEWS[name], t = P(...v.t), r = 2100 * v.k;
  const pos = t.clone().add(new THREE.Vector3(...v.d).normalize().multiplyScalar(r));
  document.querySelectorAll('[data-view]').forEach((b) => b.classList.toggle('on', b.dataset.view === name));
  if (now) { controls.target.copy(t); camera.position.copy(pos); controls.update(); return; }
  tween = { t0: performance.now(), a: [controls.target.clone(), camera.position.clone()], b: [t, pos], ms: ms || 900 };
}
function stepTween() {
  if (!tween) return; const k = Math.min(1, (performance.now() - tween.t0) / (tween.ms || 900)), e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
  controls.target.lerpVectors(tween.a[0], tween.b[0], e); camera.position.lerpVectors(tween.a[1], tween.b[1], e);
  if (k >= 1) tween = null;
}

// ================================================================= process effects
const liquidMat = (c, o = 0.82) => new THREE.MeshPhysicalMaterial({ color: c, transparent: true, opacity: o, roughness: 0.08, metalness: 0, clearcoat: 1, depthWrite: false });
function cyl(spec, mat) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(spec.r, spec.r, 1, 48), mat); m.renderOrder = 2; fx.add(m);
  m.userData.cur = 0;
  m.userData.set = (f) => { m.userData.goal = Math.max(0, Math.min(1, f)); };
  m.userData.tick = () => { const u = m.userData; u.cur += ((u.goal ?? 0) - u.cur) * 0.12; const h = spec.h * u.cur;
    m.visible = u.cur > 0.005; m.scale.y = Math.max(0.01, h); m.position.copy(P(spec.x, spec.y, spec.z0 + h / 2)); };
  return m;
}
function box(spec, mat) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(spec.x1 - spec.x0, 1, spec.y1 - spec.y0), mat); m.renderOrder = 2; fx.add(m);
  m.userData.cur = 0;
  m.userData.set = (f) => { m.userData.goal = Math.max(0, Math.min(1, f)); };
  m.userData.tick = () => { const u = m.userData; u.cur += ((u.goal ?? 0) - u.cur) * 0.12; const h = spec.h * u.cur;
    m.visible = u.cur > 0.005; m.scale.y = Math.max(0.01, h); m.position.copy(P((spec.x0 + spec.x1) / 2, (spec.y0 + spec.y1) / 2, spec.z0 + h / 2)); };
  return m;
}
class Particles {   // pooled falling particles (drops, powder, spray)
  constructor(n, r, color, opts = {}) {
    this.m = new THREE.InstancedMesh(new THREE.SphereGeometry(r, 10, 8), new THREE.MeshStandardMaterial({ color, roughness: 0.2, transparent: !!opts.op, opacity: opts.op || 1 }), n);
    this.p = Array.from({ length: n }, () => ({ live: false, x: 0, y: 0, z: 0, vz: 0, floor: 0 })); this.m.count = n; this.m.frustumCulled = false;
    this.d = new THREE.Object3D(); this.g = opts.g ?? 900; this.onLand = opts.onLand; fx.add(this.m);
  }
  spawn(x, y, z, floor, vz = 0) { const q = this.p.find((q) => !q.live); if (q) Object.assign(q, { live: true, x, y, z, vz, floor }); }
  tick(dt) {
    this.p.forEach((q, i) => {
      if (q.live && this.g) { q.vz -= this.g * dt; q.z += q.vz * dt; if (q.z <= q.floor) { q.live = false; if (this.onLand) this.onLand(q.x, q.y, q.floor); } }
      this.d.position.copy(q.live ? P(q.x, q.y, q.z) : new THREE.Vector3(0, -9999, 0)); this.d.updateMatrix(); this.m.setMatrixAt(i, this.d.matrix);
    });
    this.m.instanceMatrix.needsUpdate = true;
  }
}
class Beads {       // gel beads that hop chamber -> basket -> drying tray
  constructor(n, color) {
    this.m = new THREE.InstancedMesh(new THREE.SphereGeometry(2.6, 12, 10), new THREE.MeshPhysicalMaterial({ color, roughness: 0.2, clearcoat: 1 }), n);
    this.n = n; this.m.count = 0; this.m.frustumCulled = false; this.d = new THREE.Object3D(); fx.add(this.m);
    this.from = []; this.to = []; this.t0 = 0; this.dur = 1; this.where = 'none'; this.swirl = 0; this.ph = new Float32Array(n);
  }
  spots(where, n) {
    const out = [], rnd = mulberry(where.length * 7 + 3);
    for (let i = 0; i < n; i++) {
      if (where === 'chamber') { const a = rnd() * 6.283, r = Math.sqrt(rnd()) * (G.chamber.r - 8); out.push(P(G.chamber.x + r * Math.cos(a), G.chamber.y + r * Math.sin(a), G.chamber.z0 + 3 + rnd() * 18)); }
      else { const s = where === 'tray' ? G.tray : G.basket; out.push(P(s.x0 + 8 + rnd() * (s.x1 - s.x0 - 16), s.y0 + 8 + rnd() * (s.y1 - s.y0 - 16), s.z + 2 + rnd() * 6)); }
    }
    return out;
  }
  place(where, n, animate) {
    n = Math.min(this.n, n); const to = this.spots(where, n);
    this.from = animate && this.to.length ? to.map((_, i) => this.to[i % this.to.length].clone()) : to.map((v) => v.clone());
    this.to = to; this.m.count = n; this.t0 = performance.now(); this.dur = animate ? 1800 : 1; this.flow = false; this.where = where;
  }
  drain(n, dur) {   // valve open: beads leave one after another, through the outlet pipe, and drop into the basket
    n = Math.min(this.n, n); this.from = this.spots('chamber', n); this.to = this.spots('basket', n); this.m.count = n;
    this.t0 = performance.now(); this.dur = dur; this.flow = true; this.where = 'basket';
  }
  flowPos(i, now) {
    const n = this.m.count, delay = (i / Math.max(1, n)) * this.dur * 0.8, k = Math.max(0, Math.min(1, (now - this.t0 - delay) / (this.dur * 0.2 + 600)));
    const a = this.from[i], port = P(G.outlet.x0, G.outlet.y, G.outlet.z), end = P(G.outlet.x1, G.outlet.y, G.outlet.z), b = this.to[i];
    if (k < 0.25) return this.d.position.lerpVectors(a, port, k / 0.25);
    if (k < 0.7) return this.d.position.lerpVectors(port, end, (k - 0.25) / 0.45);
    const f = (k - 0.7) / 0.3; this.d.position.lerpVectors(end, b, f); return this.d.position;
  }
  tick(t, dt = 0.016) {
    const now = performance.now(), k = Math.min(1, (now - this.t0) / this.dur), e = 1 - (1 - k) ** 3;
    const sw = this.where === 'chamber' && k >= 1 ? this.swirl : 0, C0 = P(G.chamber.x, G.chamber.y, G.chamber.z0);
    if (this.flow && now - this.t0 > this.dur * 1.05 + 600) this.flow = false;
    for (let i = 0; i < this.m.count; i++) {
      if (this.flow) { this.flowPos(i, now); this.d.updateMatrix(); this.m.setMatrixAt(i, this.d.matrix); continue; }
      this.d.position.lerpVectors(this.from[i], this.to[i], e);
      if (k < 1) this.d.position.y += Math.sin(k * Math.PI) * 60;                       // hop across
      else if (sw > 0.01) {                                                               // swept round by the stirrer
        const dx = this.to[i].x - C0.x, dz = this.to[i].z - C0.z, r = Math.hypot(dx, dz), rr = r / G.chamber.r;
        this.ph[i] += dt * sw * (4.5 - 3 * rr);                                            // inner beads turn faster
        const a = Math.atan2(dz, dx) + this.ph[i];
        this.d.position.x = C0.x + r * Math.cos(a); this.d.position.z = C0.z + r * Math.sin(a);
        this.d.position.y += sw * (4 + 22 * (1 - rr)) * (0.5 + 0.5 * Math.sin(t * 2.3 + i * 1.7));   // lifted in the vortex
      } else this.d.position.y += Math.abs(Math.sin(t * 3 + i)) * 0.8;                   // little jiggle
      this.d.updateMatrix(); this.m.setMatrixAt(i, this.d.matrix);
    }
    this.m.instanceMatrix.needsUpdate = true;
  }
}
// liquid surface that dips into a vortex while the stirrer runs (radial dip + spiral ripples, rotating)
function vortex(spec, liq) {
  const g = new THREE.RingGeometry(0.01, spec.r - 0.5, 64, 14), mat = liq.clone();
  mat.opacity = Math.min(0.9, liq.opacity + 0.15); mat.side = THREE.DoubleSide;
  const m = new THREE.Mesh(g, mat); m.rotation.x = -Math.PI / 2; m.renderOrder = 3; m.visible = false; fx.add(m);
  const streak = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ map: spiralTex(), transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
  streak.renderOrder = 4; streak.position.z = 0.3; m.add(streak);              // white spiral streaks riding on the surface
  const base = g.attributes.position.array.slice();
  m.userData = { s: 0, goal: 0, spec, liq, base,
    tick(t, dt, level) {
      const u = m.userData; u.s += (u.goal - u.s) * Math.min(1, dt * 1.5);               // spin up / down smoothly
      m.visible = level > 0.02 && u.s > 0.02; if (!m.visible) return;
      streak.material.opacity = 0.75 * u.s;
      mat.color.copy(liq.color);
      const pos = g.attributes.position.array, R = spec.r, depth = Math.min(spec.h * level * 0.6, R * 0.32) * u.s;
      for (let i = 0; i < pos.length; i += 3) {
        const x = base[i], y = base[i + 1], rr = Math.min(1, Math.hypot(x, y) / R), a = Math.atan2(y, x);
        pos[i + 2] = -depth * (1 - rr) ** 2 + u.s * 0.9 * rr * Math.sin(5 * a + rr * 9 - t * 6 * u.s);
      }
      g.attributes.position.needsUpdate = true; g.computeVertexNormals();
      m.rotation.z += dt * u.s * 2.5;
      m.position.copy(P(spec.x, spec.y, spec.z0 + spec.h * level + 0.3));
    } };
  return m;
}
function spiralTex() {   // 4 curved arms fading to the rim; RingGeometry UVs are planar so it maps straight on
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
  g.translate(128, 128); g.lineCap = 'round';
  for (let arm = 0; arm < 4; arm++) for (let k = 0; k < 60; k++) {
    const t = k / 60, r = 8 + t * 118, a = arm * Math.PI / 2 + t * 4.2;
    g.strokeStyle = `rgba(70,140,185,${0.85 * (1 - t) * Math.min(1, t * 6)})`; g.lineWidth = 2 + 5 * (1 - t);
    g.beginPath(); g.arc(0, 0, r, a, a + 0.22); g.stroke();
  }
  const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; return tx;
}
// expanding rings where a drop or powder lands on the liquid
class Ripples {
  constructor(n) {
    this.items = Array.from({ length: n }, () => {
      const m = new THREE.Mesh(new THREE.RingGeometry(0.85, 1, 32), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
      m.rotation.x = -Math.PI / 2; m.visible = false; m.renderOrder = 4; fx.add(m); return { m, t: 1, k: 1 };
    });
  }
  add(x, y, z, k) { const r = this.items.find((r) => r.t >= 1) || this.items[0]; r.t = 0; r.k = k; r.m.position.copy(P(x, y, z + 0.5)); r.m.visible = true; }
  tick(dt) {
    this.items.forEach((r) => { if (r.t >= 1) { r.m.visible = false; return; }
      r.t = Math.min(1, r.t + dt / 0.9); const s = 1 + 9 * r.k * r.t; r.m.scale.set(s, s, s); r.m.material.opacity = 0.55 * (1 - r.t); });
  }
}
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

let L = {}, vortA, vortC, ripples, bioP, drops, powder, spray, swirl, beads, tray, phMat, stirA, stirC, drainAnim = null;
function buildFx() {
  fx = new THREE.Group(); scene.add(fx);
  L.acid = cyl(G.acid, liquidMat(0xf3f0e2, 0.45));                       // 1 M acetic acid: clear
  L.chamber = cyl(G.chamber, liquidMat(0xe6f1f2, 0.32));                 // 2 M NaOH: clear, slightly blue
  L.hopper = cyl(G.hopper, new THREE.MeshStandardMaterial({ color: 0xece3cc, roughness: 1 }));          // chitosan flakes: off-white
  L.bio = cyl(G.bioHop, new THREE.MeshStandardMaterial({ color: 0x1f1c1a, roughness: 1 }));            // biochar: black
  L.water = box(G.water, liquidMat(0xd9eef6, 0.38));                    // clean water
  L.waste = box(G.waste, liquidMat(0xcfc9a8, 0.55));                    // cloudy alkaline waste
  phMat = liquidMat(0x4cc38a, 0.18);
  L.ph = new THREE.Mesh(new THREE.BoxGeometry(G.basket.x1 - G.basket.x0, 3, G.basket.y1 - G.basket.y0), phMat);
  L.ph.position.copy(P((G.basket.x0 + G.basket.x1) / 2, (G.basket.y0 + G.basket.y1) / 2, G.basket.z)); L.ph.visible = false; fx.add(L.ph);
  drops = new Particles(80, 1.9, 0x2b2824);                              // chitosan + biochar dope
  powder = new Particles(90, 1.3, 0xece3cc); bioP = new Particles(60, 1.1, 0x161514);
  spray = new Particles(220, 1.0, 0xe8f6ff, { op: 0.55, g: 1400 });
  swirl = new Particles(60, 1.5, 0x2e2a26, { g: 0 });
  beads = new Beads(420, 0x262320); tray = new Beads(420, 0x34302b);    // wet gel beads: glossy black-brown; drying: duller
  const bar = (s) => { const g = new THREE.Group(), m = new THREE.Mesh(new THREE.CapsuleGeometry(4, s.len - 8, 6, 12), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.3, clearcoat: 1 }));
    m.rotation.z = Math.PI / 2; g.add(m); g.position.copy(P(s.x, s.y, s.z)); fx.add(g); return g; };
  stirA = bar(G.stirAcid); stirC = bar(G.stirCh);
  vortA = vortex(G.acid, L.acid.material); vortC = vortex(G.chamber, L.chamber.material);
  ripples = new Ripples(24);
  drops.onLand = (x, y, z) => ripples.add(x, y, z, 1);
  powder.onLand = bioP.onLand = (x, y, z) => ripples.add(x, y, z, 0.6);
  Object.values(groups).forEach((Gp) => Gp.objs.forEach((o) => o.traverse((x) => {   // hide the static stir bar from the CAD model
    if (!x.isMesh) return; const s = new THREE.Box3().setFromObject(x).getSize(new THREE.Vector3()), d = [s.x, s.y, s.z].sort((a, b) => a - b);
    if (d[2] > 34 && d[2] < 46 && d[1] < 10 && d[0] < 10 && x.userData.g === 'Acid_Mix_Tank') x.visible = false; })));
  tray.place('tray', beadN(V.trayBeads), false);
  levels();
}
const beadN = (b) => Math.round(Math.min(420, (b || 0) / 60));

function applyXray() {
  Object.entries(groups).forEach(([k, Gp]) => {
    if (SHELL.includes(k)) Gp.objs.forEach((o) => o.visible = Gp.on && !xray);
    if (SEE_THROUGH.includes(k)) Gp.mats.forEach((m) => { m.transparent = xray || m.userData.op < 1; m.opacity = xray ? 0.22 : m.userData.op; m.depthWrite = !xray; });
  });
  $('m3dXray').classList.toggle('on', xray);
}

// ================================================================= driven by the firmware status
function levels() {
  if (!fx) return;
  L.hopper.userData.set(V.hopperG / CAP.hopperG); L.bio.userData.set(V.bioG / CAP.bioG); L.acid.userData.set(V.acidMl / CAP.acidMl);
  L.chamber.userData.set(V.naoh); L.water.userData.set(V.water); L.waste.userData.set(V.waste);
  const set = (id, f, txt) => { const el = $(id); if (!el) return; el.querySelector('i').style.width = Math.round(100 * Math.max(0, Math.min(1, f))) + '%'; el.querySelector('b').textContent = txt; };
  set('lvHopper', V.hopperG / CAP.hopperG, Math.round(V.hopperG) + ' g'); set('lvBio', V.bioG / CAP.bioG, V.bioG.toFixed(1) + ' g'); set('lvAcid', V.acidMl / CAP.acidMl, Math.round(V.acidMl) + ' mL');
  set('lvNaoh', V.naoh, Math.round(V.naoh * 100) + '%'); set('lvWater', V.water, Math.round(V.water * 100) + '%');
  set('lvWaste', V.waste, Math.round(V.waste * 100) + '%'); set('lvTray', beadN(V.trayBeads) / 420, V.trayBeads ? '≈ ' + Math.round(V.trayBeads).toLocaleString() + ' เม็ด' : 'ว่าง');
  $('lvWaste').classList.toggle('warn', V.waste > 0.85);
}
function toast(msg) { const t = $('m3dToast'); t.textContent = msg; t.classList.remove('on'); void t.offsetWidth; t.classList.add('on'); clearTimeout(toast.h); toast.h = setTimeout(() => t.classList.remove('on'), 4200); }
function pop(el) { if (!el) return; el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }

function update(m, first) {
  S = m; if (!fx) return;
  const st = m.state, o = m.out || {}, p = m.p || {};
  if (st !== lastState) { enterState(st, lastState, m, first || lastState === null); lastState = st; }
  const prog = m.step_s ? 1 - (m.left_s || 0) / m.step_s : 0;
  if (STATES.indexOf(st) >= STATES.indexOf('DOSE') && STATES.indexOf(st) <= STATES.indexOf('TILT_BACK') && m.sim_acid_ml !== undefined) V.acidMl = m.sim_acid_ml;
  if (st === 'DOSE' && m.sim_powder_g !== undefined) V.hopperG = Math.max(0, phase0.hopper - m.sim_powder_g);
  if (st === 'DOSE' && m.sim_biochar_g !== undefined) V.bioG = Math.max(0, phase0.bio - m.sim_biochar_g);

  if (st === 'RINSE_SPRAY') { V.water = Math.max(0, phase0.water - 0.05 * prog); V.waste = Math.min(1, phase0.waste + 0.04 * prog); }
  if (['DRIP', 'SET'].includes(st)) { runBeads = m.sim_beads || runBeads; if (beadWhere === 'chamber' && beadN(runBeads) !== beads.m.count) beads.place('chamber', beadN(runBeads), false); }
  // acid colour: clear acid -> dark chitosan/biochar dope as the powder dissolves
  const solids = Math.min(1, (m.sim_powder_g || 0) / (p.dose_g || 30)) * (0.25 + 0.75 * (m.sim_dissolved || 0));
  L.acid.material.color.set(0xf3f0e2).lerp(new THREE.Color(0x24211e), ['DOSE', 'DISSOLVE', 'DRIP'].includes(st) ? solids : 0);
  L.acid.material.opacity = 0.45 + 0.5 * solids;
  L.ph.visible = st.startsWith('RINSE'); phMat.color.copy(PH_COL(m.ph || 7));
  levels(); hud(m);
  const live = new Set(); Object.entries(OUT_MAP).forEach(([out, ks]) => { if (o[out] > 0) ks.forEach((k) => live.add(k)); });
  if (p.servo_home !== undefined && o.servo !== undefined && Math.abs(o.servo - p.servo_home) > 5) live.add('Rinsing_Zone');
  Object.keys(groups).forEach((k) => glow(k, live.has(k) ? 0x0a2a1a : 0));   // subtle: real parts don't glow
  liveSet = live;
}
let liveSet = new Set();
function enterState(st, prev, m, first) {
  if (first && !['IDLE', 'DONE', 'SAFE'].includes(st)) {   // page opened mid-batch: the operator must have filled it
    const after = (s) => STATES.indexOf(st) > STATES.indexOf(s);
    if (!after('SET')) V.naoh = Math.max(V.naoh, 1); else V.waste = Math.max(V.waste, 0.6);
    V.water = Math.max(V.water, 0.6); if (st === 'DOSE') V.hopperG = Math.max(V.hopperG, CAP.hopperG);
    runBeads = m.sim_beads || 0;
    if (after('SET') && STATES.indexOf(st) < STATES.indexOf('TILT')) { beadWhere = 'basket'; beads.place('basket', beadN(runBeads), false); }
  }
  if (['IDLE', 'DONE'].includes(prev) && !['IDLE', 'DONE', 'SAFE'].includes(st)) dosed = false;   // a new batch started
  if (!first && phase0.hopper !== undefined) {   // finish the step we left: at high speed it may have had no status in between
    const active = (x) => STATES.indexOf(x) > STATES.indexOf('IDLE') && STATES.indexOf(x) < STATES.indexOf('DONE');
    if ((prev === 'DOSE' || (!active(prev) && active(st) && st !== 'DOSE')) && !dosed) {   // DOSE seen or skipped by a fast run
      const h0 = prev === 'DOSE' ? phase0.hopper : V.hopperG, b0 = prev === 'DOSE' ? phase0.bio : V.bioG;   // skipped DOSE: nothing used yet
      dosed = true; V.hopperG = Math.max(0, h0 - (m.p?.dose_g || 30)); V.bioG = Math.max(0, b0 - ((m.p?.acid_ml ?? 500) + (m.p?.dose_g || 30)) * (m.p?.biochar_pct ?? 2) / 100); }
    if (prev === 'RINSE_SPRAY') { V.water = Math.max(0, phase0.water - 0.05); V.waste = Math.min(1, phase0.waste + 0.04); }
  }
  phase0 = { bio: V.bioG, hopper: V.hopperG, naoh: V.naoh, waste: V.waste, water: V.water };
  if (!first) pop($('h3State'));
  if (st === 'DOSE' && !first) {
    const miss = [];
    if (V.hopperG < (m.p?.dose_g || 30)) { miss.push('ไคโตซาน'); V.hopperG = CAP.hopperG; }
    if (V.bioG < ((m.p?.acid_ml ?? 500) + (m.p?.dose_g || 30)) * (m.p?.biochar_pct ?? 2) / 100) { miss.push('ไบโอชาร์'); V.bioG = CAP.bioG; }
    if (V.acidMl < 450) miss.push('น้ำกรด');
    if (V.naoh < 0.5) { miss.push('NaOH'); V.naoh = 1; }
    if (V.water < 0.5) { miss.push('น้ำล้าง'); V.water = 1; }
    phase0.hopper = V.hopperG; phase0.bio = V.bioG;
    toast(miss.length ? '🙈 ลืมเติม ' + miss.join(', ') + ' — ตัวจำลองเติมให้แล้ว แต่เครื่องจริงต้องเติมก่อนกด START นะ' : '🚀 เริ่มแล้ว! ป้อนผงลงถังกรด');
    runBeads = 0; beadWhere = 'none'; beads.place('chamber', 0, false); dosed = false;
  }
  if (st === 'DRIP' && !first) toast('💧 เริ่มหยด — เม็ดเจลเกิดทันทีที่หยดโดน NaOH');
  if (st === 'DRIP' || st === 'SET') { if (beadWhere !== 'chamber') { beadWhere = 'chamber'; beads.place('chamber', beadN(m.sim_beads || runBeads), false); } }
  // States can be shorter than one status message at high speed (×600: TILT lasts ~8 ms), so each move also runs
  // when a LATER state shows up first: drain on DRAIN or any rinse state, tip onto the tray on TILT/TILT_BACK/DONE.
  if ((st === 'DRAIN' || st.startsWith('RINSE')) && beadWhere === 'chamber') doDrain(m, first);
  if (['TILT', 'TILT_BACK', 'DONE'].includes(st) && (beadWhere === 'chamber' || beadWhere === 'basket')) {
    if (beadWhere === 'chamber') doDrain(m, first);
    doTilt(first);
  }
  if (st === 'IDLE' && (prev === 'SAFE' || prev === 'TEST') && !first) {   // reset after a stop: the operator empties the machine
    runBeads = 0; beadWhere = 'none'; drainAnim = null; beads.place('chamber', 0, false);
    toast('🔄 รีเซ็ตแล้ว — ล้างถังและเทเม็ดที่ค้างออก พร้อมเริ่มรอบใหม่');
  }
  if (st === 'DONE' && !first) { toast('🎉 เสร็จแล้ว! เม็ดเจลอยู่บนถาดตาก'); confetti(); }
  if (st === 'SAFE' && !first) toast('🛑 หยุดฉุกเฉิน — อุปกรณ์ทุกตัวหยุด');
  saveV();
}
function doDrain(m, first) {
  beadWhere = 'basket';
  if (first) { beads.place('basket', beadN(runBeads), false); return; }
  const dur = Math.max(5000, Math.min(14000, (m.step_s || 60) / (m.speed || 1) * 1000));
  beads.drain(beadN(runBeads), dur); drainAnim = { t0: performance.now(), dur: dur * 1.05 + 600, n0: L.chamber.userData.cur, w0: V.waste };
  V.waste = Math.min(1, V.waste + V.naoh * 0.55); V.naoh = 0; phase0.waste = V.waste; phase0.naoh = 0; saveV();
  toast('🚿 เปิดวาล์ว — เม็ดไหลตามน้ำออกไปกองที่ตะกร้าล้าง น้ำ NaOH ลงถังน้ำทิ้ง');
}
function doTilt(first) {
  beadWhere = 'tray';
  const n = runBeads, wait = drainAnim ? Math.max(0, drainAnim.t0 + drainAnim.dur - performance.now()) + 400 : 0;
  setTimeout(() => {
    if (!first) { beads.place('tray', beadN(n), true); toast('↘️ เทตะกร้า — เม็ดเจลไหลลงถาดตาก'); }
    setTimeout(() => { V.trayBeads += n; if (runBeads === n) runBeads = 0; tray.place('tray', beadN(V.trayBeads), false);
      beads.place('tray', 0, false); beadWhere = 'none'; levels(); saveV(); }, first ? 0 : 1900);
  }, first ? 0 : wait);
}
function hud(m) {
  $('h3State').textContent = STATE_TH[m.state] || m.state;
  $('h3State').className = 'h3state ' + (m.state === 'SAFE' ? 'bad' : ['IDLE', 'DONE'].includes(m.state) ? '' : 'run');
  $('h3Left').textContent = m.left_s ? 'เหลือ ' + fmtT(m.left_s) : '';
  $('h3Ph').textContent = (m.ph ?? 7).toFixed(2); $('h3PhDot').style.background = '#' + PH_COL(m.ph || 7).getHexString();
  $('h3Beads').textContent = (m.state === 'IDLE' && beadWhere === 'none' ? 0 : (m.sim_beads || 0)).toLocaleString();
  $('h3Speed').textContent = m.sim ? '×' + (m.speed || 1) : '';
  document.querySelectorAll('[data-spd3]').forEach((b) => b.classList.toggle('on', +b.dataset.spd3 === m.speed));
  $('m3dStart').disabled = !['IDLE', 'DONE'].includes(m.state);
}
const fmtT = (s) => { const h = Math.floor(s / 3600), mi = Math.floor(s % 3600 / 60); return h ? `${h} ชม. ${mi} นาที` : mi ? `${mi} นาที` : `${s} วิ`; };
function confetti() {
  const box = $('m3dFun'), cols = ['#ff5ea8', '#ffc23d', '#3dd68c', '#5b8cff', '#a66bff'];
  for (let i = 0; i < 40; i++) { const s = document.createElement('i'); s.style.left = Math.random() * 100 + '%'; s.style.background = cols[i % 5];
    s.style.animationDelay = Math.random() * 0.4 + 's'; s.style.transform = `rotate(${Math.random() * 360}deg)`; box.appendChild(s); setTimeout(() => s.remove(), 2600); }
}

// ---- per-frame animation
function animate(dt) {
  if (!fx) return;
  const t = performance.now() / 1000, o = (S && S.out) || {}, st = S ? S.state : 'IDLE', sp = Math.min(3, Math.max(1, Math.log10((S && S.speed) || 1) + 1));
  Object.values(L).forEach((m) => m.userData.tick && m.userData.tick());
  if (o.peri > 0 && V.acidMl > 0) for (let i = 0; i < 2; i++) if (Math.random() < dt * 9 * sp) {
    const nx = Math.floor(Math.random() * 6), ny = Math.floor(Math.random() * 2);
    drops.spawn(G.needles.x0 + nx * (G.needles.x1 - G.needles.x0) / 5, G.needles.y[ny], G.needles.z, G.chamber.z0 + G.chamber.h * L.chamber.userData.cur);
  }
  if (o.auger > 0 && V.hopperG > 0) for (let i = 0; i < 3; i++) if (Math.random() < dt * 25) powder.spawn(G.augerOut.x + (Math.random() - 0.5) * 8, G.augerOut.y + (Math.random() - 0.5) * 8, G.augerOut.z, G.acid.z0 + G.acid.h * L.acid.userData.cur);
  if (o.bio > 0 && V.bioG > 0) for (let i = 0; i < 2; i++) if (Math.random() < dt * 20) bioP.spawn(G.bioOut.x + (Math.random() - 0.5) * 5, G.bioOut.y + (Math.random() - 0.5) * 5, G.bioOut.z, G.acid.z0 + G.acid.h * L.acid.userData.cur);
  if (o.rinse > 0) for (let i = 0; i < 6; i++) if (Math.random() < dt * 30) spray.spawn(G.basket.x0 + Math.random() * (G.basket.x1 - G.basket.x0), G.basket.y0 + 20 + Math.random() * (G.basket.y1 - G.basket.y0 - 40), G.spray.z, G.basket.z + 2, -150);
  // stirring: grains orbiting in the acid tank while it is not yet fully dissolved
  const stir = o.top > 0 && ['DOSE', 'DISSOLVE', 'DRIP'].includes(st) && (S.sim_dissolved ?? 1) < 0.97 && V.acidMl > 20;
  swirl.p.forEach((q, i) => {
    if (!stir) { q.live = false; return; }
    const a = t * (1.5 + (o.top / 255) * 3) + i * 2.399, r = 12 + (i * 37 % 40), lv = G.acid.h * L.acid.userData.cur;
    Object.assign(q, { live: true, x: G.acid.x + r * Math.cos(a), y: G.acid.y + r * Math.sin(a), z: G.acid.z0 + 4 + (i * 13 % 100) / 100 * Math.max(4, lv - 8), vz: 0, floor: -1 });
  });
  // liquids wobble a little while something is moving them
  vortA.userData.goal = o.top > 0 && L.acid.userData.cur > 0.05 ? 0.45 + 0.55 * o.top / 255 : 0;
  vortC.userData.goal = o.ch > 0 && L.chamber.userData.cur > 0.05 ? 0.4 + 0.6 * o.ch / 255 : 0;
  vortA.userData.tick(t, dt, L.acid.userData.cur); vortC.userData.tick(t, dt, L.chamber.userData.cur);
  beads.swirl = vortC.userData.s; ripples.tick(dt);
  // magnetic stir bars spin with the motor duty
  stirA.rotation.y += dt * (o.top > 0 ? 4 + 14 * o.top / 255 : 0); stirC.rotation.y += dt * (o.ch > 0 ? 3 + 10 * o.ch / 255 : 0);
  if (drainAnim) {   // the chamber empties while the beads run out
    const k = Math.min(1, (performance.now() - drainAnim.t0) / drainAnim.dur);
    L.chamber.userData.goal = drainAnim.n0 * (1 - k); L.waste.userData.goal = Math.min(1, drainAnim.w0 + drainAnim.n0 * 0.55 * k);
    if (k >= 1) drainAnim = null;
  }
  drops.tick(dt); powder.tick(dt); bioP.tick(dt); spray.tick(dt); swirl.tick(dt); beads.tick(t, dt); tray.tick(t, dt);
  if (labelsOn) labels(t);
}
const LABELS = [['⚫ ไบโอชาร์', G.bioHop.x, G.bioHop.y - 40, G.bioHop.z0 + 20, 'Biochar_Feeder'], ['🥄 ไคโตซาน', G.hopper.x, G.hopper.y, G.hopper.z0 + G.hopper.h + 20, 'Powder_Hopper_Auger'],
  ['🌀 ถังผสมกรด', G.acid.x - 70, G.acid.y, G.acid.z0 + 40, 'Magnetic_Stirrer_DIY_12V'],
  ['💧 กล่องหยด', 300, 170, 640, 'Dispensing_Box'], ['🫧 ถังขึ้นรูป NaOH', G.chamber.x, G.chamber.y - 100, 420, 'Chamber_Magnetic_Stirrer_12V'],
  ['💦 ตะกร้าล้าง', 470, 0, 330, 'Plumbing_Water'], ['☀️ ถาดตาก', 710, 20, 250, ''], ['🚰 ถังน้ำล้าง', 713, -10, 120, ''], ['🗑️ ถังน้ำทิ้ง', 471, -10, 100, 'Solenoid_Valve_1in_PIK2']];
function labels(t) {
  const box = $('m3dLabels'); if (!box.children.length) LABELS.forEach(([s]) => { const d = document.createElement('span'); d.textContent = s; box.appendChild(d); });
  const w = host.clientWidth, h = host.clientHeight;
  LABELS.forEach(([, x, y, z, g], i) => { const v = P(x, y, z).project(camera), el = box.children[i], act = g && liveSet.has(g);
    const bob = act ? Math.sin(t * 6 + i) * 3 : 0;
    el.classList.toggle('act', !!act);
    el.style.display = v.z < 1 ? '' : 'none'; el.style.transform = `translate(${(v.x + 1) / 2 * w}px, ${(1 - v.y) / 2 * h + bob}px) translate(-50%, -50%)`; });
}
function loop() { requestAnimationFrame(loop); const dt = Math.min(0.05, clock.getDelta()); stepTween(); controls.update(); tourTick(false); animate(dt); renderer.render(scene, camera); }

// ================================================================= parts list, picking
function buildList() {
  list.innerHTML = '';
  Object.entries(groups).sort((a, b) => a[1].label.localeCompare(b[1].label, 'th')).forEach(([k, Gp]) => {
    const row = document.createElement('label'); row.className = 'm3row'; row.dataset.k = k;
    row.innerHTML = `<input type="checkbox" checked> <span>${Gp.label}</span> <a href="#" title="ซูมไปที่ชิ้นนี้">⌖</a>`;
    row.querySelector('input').onchange = (e) => { Gp.on = e.target.checked; Gp.objs.forEach((o) => o.visible = Gp.on && !(xray && SHELL.includes(k))); };
    row.querySelector('a').onclick = (e) => { e.preventDefault(); focus(Gp.objs); flash(k); };
    list.appendChild(row);
  });
}
function focus(objs) {
  const b = new THREE.Box3(); objs.forEach((o) => b.expandByObject(o));
  const c = b.getCenter(new THREE.Vector3()), r = Math.max(120, b.getSize(new THREE.Vector3()).length());
  tween = { t0: performance.now(), a: [controls.target.clone(), camera.position.clone()], b: [c, c.clone().add(camera.position.clone().sub(controls.target).normalize().multiplyScalar(r * 1.6))] };
}
function glow(k, color) { const Gp = groups[k]; if (Gp) Gp.mats.forEach((m) => { if (m.emissive) m.emissive.set(color || 0); }); }
let flashT = null;
function flash(k) { glow(k, 0xff2e93); clearTimeout(flashT); flashT = setTimeout(() => { glow(k, 0); if (S) update(S); }, 1200); }
function select(e) {
  if (!model) return; const r = renderer.domElement.getBoundingClientRect();
  const ray = new THREE.Raycaster(); ray.setFromCamera(new THREE.Vector2((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1), camera);
  const hits = ray.intersectObject(model, true).filter((h) => h.object.visible);
  const hit = hits.find((h) => h.object.material.opacity > 0.5) || hits[0];
  if (!hit) return; const k = hit.object.userData.g;
  info.textContent = '👉 ' + groups[k].label; pop(info); flash(k);
  list.querySelectorAll('.m3row').forEach((x) => x.classList.toggle('sel', x.dataset.k === k));
}

// ================================================================= controls
const on = (id, f) => { const el = $(id); if (el) el.addEventListener('click', (e) => { pop(el); f(e); }); };
const fill = (k, v, msg) => () => { V[k] = v; levels(); saveV(); toast(msg); };
on('fillHopper', fill('hopperG', CAP.hopperG, '🥄 เติมผงไคโตซานจากด้านบนเครื่องแล้ว (140 g พอ ~4 รอบ)'));
on('fillBio', fill('bioG', CAP.bioG, '⚫ เติมไบโอชาร์แล้ว (45 g พอ 4 รอบ ที่ 2 % ≈ 10.6 g/รอบ)'));
on('fillAcid', fill('acidMl', CAP.acidMl, '🧴 เติมกรดอะซิติก 1 M 500 mL แล้ว'));
on('fillNaoh', fill('naoh', 1, '🧤 เติม NaOH 2 M แล้ว — ใส่แว่นกับถุงมือทุกครั้งนะ'));
on('fillWater', fill('water', 1, '🚰 เติมน้ำสะอาดลงถังน้ำล้างแล้ว'));
on('emptyWaste', fill('waste', 0, '🗑️ ทิ้งน้ำเสียแล้ว — ทำให้เป็นกลางก่อนทิ้งด้วย'));
on('emptyTray', () => { V.trayBeads = 0; tray.place('tray', 0, false); levels(); saveV(); toast('🧺 เก็บเม็ดจากถาดตากแล้ว'); });
on('fillAll', () => { Object.assign(V, { bioG: CAP.bioG, hopperG: CAP.hopperG, acidMl: CAP.acidMl, naoh: 1, water: 1 }); levels(); saveV(); toast('✨ เติมครบแล้ว พร้อมกด START!'); });
on('m3dStart', () => window.cmd && window.cmd({ cmd: 'start' }));
on('m3dStop', () => window.cmd && window.cmd({ cmd: 'stop' }));
on('m3dReset', () => window.cmd && window.cmd({ cmd: 'reset' }));
document.querySelectorAll('[data-spd3]').forEach((b) => b.addEventListener('click', () => { pop(b); window.cmd && window.cmd({ cmd: 'sim', op: 'speed', val: +b.dataset.spd3 }); }));
document.querySelectorAll('[data-view]').forEach((b) => b.addEventListener('click', () => { pop(b); view(b.dataset.view); }));
on('m3dXray', () => { xray = !xray; applyXray(); });
on('m3dLbl', () => { labelsOn = !labelsOn; $('m3dLabels').style.display = labelsOn ? '' : 'none'; $('m3dLbl').classList.toggle('on', labelsOn); });
on('m3dSpin', () => { controls.autoRotate = !controls.autoRotate; $('m3dSpin').classList.toggle('on', controls.autoRotate); });
on('m3dAll', () => { Object.entries(groups).forEach(([k, Gp]) => { Gp.on = true; Gp.objs.forEach((o) => o.visible = !(xray && SHELL.includes(k))); }); list.querySelectorAll('input').forEach((i) => i.checked = true); });


// ================================================================= guided simulation tour: scripted status + camera + captions
// One button plays the whole batch in ~1 minute: every step shows only its key action with a short explanation.
// Live status from the machine / simulator is ignored while the tour runs and the operator's levels are restored after.
const TP = { dose_g: 30, biochar_pct: 2, acid_ml: 500, servo_home: 10, servo_dump: 120, ph_target: 7.5 };
const TOUR = [
  { v: 'intro', ms: 6500, st: 'IDLE', t: 'HK-Green-15', d: 'เครื่องผลิตเม็ดไฮโดรเจลไคโตซาน–ไบโอชาร์อัตโนมัติ ครบจบในเครื่องเดียว: ผสม → หยดขึ้นรูป → แช่ → ล้าง → เทลงถาดตาก', spin: 1 },
  { v: 'feed', ms: 6000, st: 'IDLE', t: 'เติมวัตถุดิบ 5 อย่าง', d: 'ผงไคโตซาน · ไบโอชาร์ · กรดอะซิติก 1 M · NaOH 2 M · น้ำล้าง แล้วกด START ที่จอหรือปุ่มหน้าเครื่อง', fill: 1 },
  { v: 'feed', ms: 7000, st: 'DOSE', t: '① ป้อนผงตามสูตร', d: 'สกรูป้อน 2 ชุดชั่งผงลงถังกรด: ไคโตซาน 30 g + ไบโอชาร์ 10.6 g (2 % ของน้ำหนักกรด + ไคโตซาน) ขณะพัดลมใต้ถังหมุนแม่เหล็กกวน',
    out: { auger: 255, bio: 255, top: 200 }, f: (k) => ({ sim_powder_g: 30 * k, sim_biochar_g: 10.6 * k, sim_acid_ml: 500, sim_dissolved: 0 }) },
  { v: 'feed', ms: 6000, st: 'DISSOLVE', t: '② กวนละลาย', d: 'กวนต่อเนื่องราว 2 ชั่วโมงจนผงละลายเป็นเนื้อเดียวสีเข้ม (ในทัวร์เร่งให้ดู)',
    out: { top: 200 }, f: (k) => ({ sim_powder_g: 30, sim_acid_ml: 500, sim_dissolved: k }) },
  { v: 'drip', ms: 9000, st: 'DRIP', t: '③ หยดเป็นเม็ด', d: 'ปั๊มรีดท่อดันสารละลายผ่านเข็ม 12 หัว หยดลง NaOH 2 M — แต่ละหยดแข็งตัวเป็นเม็ดเจลทันที',
    out: { peri: 140, top: 128, ch: 90 }, f: (k) => ({ sim_powder_g: 30, sim_dissolved: 1, sim_acid_ml: 500 * (1 - 0.8 * k), sim_beads: Math.round(6000 * k), ph: 13 }) },
  { v: 'chamber', ms: 5000, st: 'SET', t: '④ แช่ให้เม็ดแข็งแรง', d: 'แช่ใน NaOH 6 ชั่วโมงให้เกิดการเชื่อมขวาง กวนเบา ๆ ไม่ให้เม็ดติดกัน',
    out: { ch: 45 }, f: () => ({ sim_beads: 6000, sim_acid_ml: 100, ph: 13 }) },
  { v: 'rinse', ms: 7000, st: 'DRAIN', t: '⑤ ปล่อยน้ำ', d: 'เปิดวาล์ว 1 นิ้ว เม็ดไหลตามน้ำไปกองในตะกร้าล้าง ส่วนน้ำ NaOH ลงถังน้ำทิ้งด้านล่าง',
    out: { valve: 1 }, f: () => ({ sim_beads: 6000, step_s: 5, speed: 1, ph: 12.6 }) },
  { v: 'rinse', ms: 9000, st: 'RINSE', t: '⑥ ล้างจนเป็นกลาง', d: 'สเปรย์น้ำล้าง → รอสะเด็ด → วัด pH น้ำที่ออกมา ทำซ้ำอัตโนมัติจน pH ≤ 7.5',
    f: (k) => { const n = Math.min(3, Math.floor(k * 4)), w = (k * 4) % 1 > 0.55; return { state: w ? 'RINSE_WAIT' : 'RINSE_SPRAY', out: w ? { valve: 1 } : { rinse: 255, valve: 1 }, rinse: n, sim_beads: 6000, ph: 12.6 - 5.3 * k }; } },
  { v: 'tray', ms: 6500, st: 'TILT', t: '⑦ เทลงถาดตาก', d: 'เซอร์โวพลิกตะกร้า เม็ดเจลที่ล้างแล้วไหลลงถาดตาก แล้วตะกร้ากลับที่เดิม',
    out: { servo: 120 }, f: () => ({ sim_beads: 6000, ph: 7.3 }) },
  { v: 'intro', ms: 7000, st: 'DONE', t: 'เสร็จ 1 รอบ 🎉', d: 'ราว 9 ชั่วโมงโดยไม่ต้องเฝ้า ได้เม็ดหลายพันเม็ด · ดูค่าจริงและสั่งงานได้จากจอ 7 นิ้วหรือเว็บนี้', spin: 1, f: () => ({ sim_beads: 6000, ph: 7.3 }) },
];
let tourI = -1, tourT0 = 0, tourSaved = null, tourLast = 0, tourPaused = false;
function tourUI() {
  let el = $('m3dTour'); if (el) return el;
  el = document.createElement('div'); el.id = 'm3dTour';
  el.innerHTML = '<div class="tnum"></div><div class="tbody"><b></b><p></p><div class="tbar"><i></i></div></div><div class="tbtn"><button data-a="prev" title="ย้อน">⏮</button><button data-a="pause" title="หยุดชั่วคราว">⏸</button><button data-a="next" title="ถัดไป">⏭</button><button data-a="close" title="ปิดทัวร์">✕</button></div>';
  host.appendChild(el);
  el.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => { pop(b); const a = b.dataset.a;
    if (a === 'close') tourEnd(); else if (a === 'next') tourGo(tourI + 1); else if (a === 'prev') tourGo(Math.max(0, tourI - 1));
    else { tourPaused = !tourPaused; b.textContent = tourPaused ? '▶' : '⏸'; if (!tourPaused) tourT0 = performance.now() - tourPaused_k * TOUR[tourI].ms; } }));
  return el;
}
let tourPaused_k = 0;
function tourStart() {
  if (!started) init();
  if (!fx) { setTimeout(tourStart, 300); return; }
  if (tourI < 0) tourSaved = { V: { ...V }, S };
  Object.assign(V, { bioG: 0, hopperG: 0, acidMl: 0, naoh: 0, water: 0, waste: 0.1, trayBeads: 0 });
  tray.place('tray', 0, false); beads.place('chamber', 0, false); beadWhere = 'none'; runBeads = 0; drainAnim = null; dosed = false;
  lastState = null; xray = true; applyXray();
  host.classList.add('touring'); tourUI().classList.add('on'); $('m3dTourBtn').classList.add('on');
  tourGo(0);
}
function tourGo(i) {
  if (i >= TOUR.length) { tourEnd(); return; }
  tourI = i; tourT0 = performance.now(); tourPaused = false; const s = TOUR[i], el = tourUI();
  el.querySelector('.tnum').textContent = (i + 1) + '/' + TOUR.length;
  el.querySelector('b').textContent = s.t; el.querySelector('p').textContent = s.d;
  el.querySelector('[data-a="pause"]').textContent = '⏸';
  pop(el.querySelector('.tbody'));
  view(s.v, false, 1800); controls.autoRotate = !!s.spin; controls.autoRotateSpeed = 0.5;
  if (s.fill) toast('✨ เติมวัตถุดิบ');
  tourTick(true);
}
function tourTick(force) {
  if (tourI < 0) return;
  const s = TOUR[tourI], now = performance.now();
  if (tourPaused) { tourT0 = now - tourPaused_k * s.ms; return; }
  const k = Math.min(1, (now - tourT0) / s.ms); tourPaused_k = k;
  $('m3dTour').querySelector('.tbar i').style.width = (100 * k).toFixed(1) + '%';
  if (s.fill) { const e = Math.min(1, k * 1.4); Object.assign(V, { hopperG: CAP.hopperG * e, bioG: CAP.bioG * e, acidMl: CAP.acidMl * e, naoh: e, water: e }); levels(); }
  if (force || now - tourLast > 100) {
    tourLast = now;
    const x = s.f ? s.f(k) : {};
    const m = { state: s.st, out: { servo: 10, ...(s.out || {}) }, p: TP, step_s: 100, left_s: Math.round(100 * (1 - k)), ph: 7, rinse: 0, speed: 1, ...x };
    if (x.out) m.out = { servo: 10, ...x.out };
    update(m, false);
  }
  if (k >= 1) tourGo(tourI + 1);
}
function tourEnd() {
  if (tourI < 0) return;
  tourI = -1; controls.autoRotate = false; host.classList.remove('touring');
  const el = $('m3dTour'); if (el) el.classList.remove('on'); $('m3dTourBtn').classList.remove('on');
  if (tourSaved) Object.assign(V, tourSaved.V);
  beads.place('chamber', 0, false); tray.place('tray', beadN(V.trayBeads), false); beadWhere = 'none'; runBeads = 0; drainAnim = null;
  lastState = null; levels(); view('all', false, 1200);
  if (tourSaved && tourSaved.S) update(tourSaved.S, true);
  tourSaved = null; toast('👋 จบทัวร์ — ลองกด START เดินเครื่องเองได้เลย');
}
window.hkTour = tourStart;

on('m3dTourBtn', () => (tourI < 0 ? tourStart() : tourEnd()));
// level sensors in simulation: what the operator filled here is what the three XKC-Y25 sensors would see
let lvlSent = '';
const ALARM_TH = { 1: '🧴 กรดในถังผสมไม่พอ — เติม 500 mL ก่อนกดเริ่ม', 2: '🚰 น้ำล้างใกล้หมด — เครื่องรอให้เติมน้ำ', 3: '🗑️ ถังน้ำทิ้งเต็ม — เครื่องรอให้เททิ้งก่อนปล่อยน้ำ' };
let lastAlarm = 0;
function simLevels(m) {
  if (!(m.sim || m.firmware === 'qemu') || !window.cmd) return;
  const run = !['IDLE', 'DONE', 'SAFE'].includes(m.state) && m.sim_acid_ml !== undefined;
  const v = [+((run ? m.sim_acid_ml : V.acidMl) >= 60), +(V.water > 0.15), +(V.waste >= 0.85)], k = v.join();
  if (k !== lvlSent) { lvlSent = k; window.cmd({ cmd: 'sim', op: 'lvl', val: v }); }
}
window.onRig3d = (m) => {
  if (tourI >= 0) { tourSaved && (tourSaved.S = m); return; }
  simLevels(m);
  if (m.alarm && m.alarm !== lastAlarm && started) toast(ALARM_TH[m.alarm] || 'แจ้งเตือน');
  lastAlarm = m.alarm || 0;
  S = m; if (fx) update(m);
};
document.querySelector('#tabs button[data-t="m3d"]').addEventListener('click', () => { if (!started) init(); else size(); });
if (location.hash.startsWith('#m3d')) init();
if (/[?&]kiosk=1/.test(location.search)) document.body.classList.add('kiosk');   // full-screen 3D (video capture)
if (/[?&]tour=1/.test(location.search) || location.hash === '#tour') { const b = document.querySelector('#tabs button[data-t="m3d"]'); if (b) b.click(); setTimeout(tourStart, 200); }
