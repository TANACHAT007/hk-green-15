// 3D model tab: offline three.js viewer of the Fusion assembly (STEP -> GLB via cascadio, see README).
// Parts that the firmware is driving glow, fed by onRig() in app.js through window.onRig3d.
import * as THREE from 'three';
import { OrbitControls } from './vendor/OrbitControls.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';

const GROUPS = {   // top-level Fusion component -> Thai label
  Frame_2020: 'โครงอลูมิเนียม 2020', Bracket_2020_corner_20x20x17: 'ฉากยึดโครง + น็อต', Plates_PP: 'แผ่น PP',
  Acrylic_Enclosure_Top: 'ฝาครอบอะคริลิก', Powder_Hopper_Auger: 'ถังผง + สกรูป้อน', Acid_Mix_Tank: 'ถังผสมกรด',
  Magnetic_Stirrer_DIY_12V: 'พัดลมกวนถังกรด', Dispensing_Box: 'กล่องหยด (เข็ม 12 หัว)', Plumbing_Solution: 'ท่อสารละลาย',
  Crosslinking_Chamber: 'ถังขึ้นรูป NaOH', Chamber_Magnetic_Stirrer_12V: 'ตัวกวนถังขึ้นรูป', Rinsing_Zone: 'โซนล้าง + ตะกร้า',
  Plumbing_Water: 'ท่อน้ำล้าง', Plumbing_Outlet_1in: 'ท่อทิ้ง 1"', Solenoid_Valve_1in_PIK2: 'โซลินอยด์วาล์ว',
  Tanks_Under_Extension: 'ถังด้านล่าง', Drying_Tray: 'ถาดตาก', Front_Panel: 'แผงหน้า', E_stop_LAY37_real: 'ปุ่มหยุดฉุกเฉิน',
  Btn_start_LAY37_green_real: 'ปุ่ม START', Btn_stop_LAY37_red_real: 'ปุ่ม STOP', Electronics_Bay: 'ช่องอิเล็กทรอนิกส์',
  Levelling_Feet: 'ขาปรับระดับ',
};
const OUT_MAP = {   // firmware output -> components that light up
  auger: ['Powder_Hopper_Auger'], top: ['Magnetic_Stirrer_DIY_12V', 'Acid_Mix_Tank'], ch: ['Chamber_Magnetic_Stirrer_12V'],
  peri: ['Dispensing_Box', 'Plumbing_Solution'], rinse: ['Plumbing_Water'], valve: ['Solenoid_Valve_1in_PIK2', 'Plumbing_Outlet_1in'],
};
const GLASS = ['Acrylic_Enclosure_Top'];

const host = document.getElementById('m3d'), list = document.getElementById('m3dParts'), info = document.getElementById('m3dInfo');
let renderer, scene, camera, controls, model, started = false, pick = null;
const groups = {};   // key -> {label, objs:[], mats:[], on:true}

const KEYS = Object.keys(GROUPS).sort((a, b) => b.length - a.length);   // GLTFLoader strips ':' -> match by prefix
function key(name) { name = name || ''; return KEYS.find((k) => name.startsWith(k)) || name.replace(/_?\d+$/, '').replace(/[_ ]\(\d+\)$/, ''); }

function init() {
  started = true;
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  host.appendChild(renderer.domElement);
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(40, 1, 1, 20000);
  controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true;
  scene.add(new THREE.HemisphereLight(0xffffff, 0x445566, 1.6));
  const sun = new THREE.DirectionalLight(0xffffff, 1.8); sun.position.set(800, 1500, 1000); scene.add(sun);
  theme(); new MutationObserver(theme).observe(document.documentElement, { attributes: true }); new MutationObserver(theme).observe(document.body, { attributes: true });
  info.textContent = 'กำลังโหลดโมเดล…';
  new GLTFLoader().load('model/hk-green-15.glb', (g) => {
    model = g.scene; model.scale.setScalar(1000); model.rotation.x = -Math.PI / 2;   // m -> mm, Fusion Z-up -> Y-up
    const top = model.children[0] || model;
    for (const c of top.children) {
      const k = key(c.name); const G = groups[k] || (groups[k] = { label: GROUPS[k] || k, objs: [], mats: [], on: true });
      G.objs.push(c);
      c.traverse((o) => { if (!o.isMesh) return;
        o.material = o.material.clone(); o.material.side = THREE.DoubleSide; o.userData.g = k;
        if (GLASS.includes(k)) { o.material.transparent = true; o.material.opacity = 0.25; o.material.depthWrite = false; }
        o.userData.base = o.material.emissive ? o.material.emissive.clone() : null; G.mats.push(o.material); });
    }
    scene.add(model); fit(); buildList(); info.textContent = 'ลากเพื่อหมุน · ล้อเมาส์ซูม · คลิกขวาลากเพื่อเลื่อน · คลิกชิ้นส่วนเพื่อดูชื่อ';
  }, (e) => { if (e.total) info.textContent = 'กำลังโหลดโมเดล… ' + Math.round(100 * e.loaded / e.total) + '%'; },
  (e) => { info.textContent = 'โหลดโมเดลไม่ได้: ' + e; });
  renderer.domElement.addEventListener('pointerdown', (e) => { pick = [e.clientX, e.clientY]; });
  renderer.domElement.addEventListener('pointerup', (e) => { if (pick && Math.hypot(e.clientX - pick[0], e.clientY - pick[1]) < 4) select(e); });
  new ResizeObserver(size).observe(host); size(); loop();
}
function theme() { scene.background = new THREE.Color(getComputedStyle(document.body).getPropertyValue('--panel').trim() || '#20242c'); }
function size() { const w = host.clientWidth, h = host.clientHeight; if (!w || !h) return; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); }
function fit(objs) {
  const box = new THREE.Box3(); (objs || [model]).forEach((o) => box.expandByObject(o));
  const c = box.getCenter(new THREE.Vector3()), r = box.getSize(new THREE.Vector3()).length() / 2;
  controls.target.copy(c); camera.position.copy(c).add(new THREE.Vector3(1, 0.7, 1.2).normalize().multiplyScalar(r * 2.4)); controls.update();
}
function loop() { requestAnimationFrame(loop); controls.update(); renderer.render(scene, camera); }

function buildList() {
  list.innerHTML = '';
  Object.entries(groups).sort((a, b) => a[1].label.localeCompare(b[1].label, 'th')).forEach(([k, G]) => {
    const row = document.createElement('label'); row.className = 'm3row'; row.dataset.k = k;
    row.innerHTML = `<input type="checkbox" checked> <span>${G.label}</span> <a href="#" title="ซูมไปที่ชิ้นนี้">⌖</a>`;
    row.querySelector('input').onchange = (e) => { G.on = e.target.checked; G.objs.forEach((o) => o.visible = G.on); };
    row.querySelector('a').onclick = (e) => { e.preventDefault(); fit(G.objs); flash(k); };
    list.appendChild(row);
  });
}
const ALL = (v) => Object.values(groups).forEach((G) => { G.on = v; G.objs.forEach((o) => o.visible = v); });
document.getElementById('m3dAll').onclick = () => { ALL(true); list.querySelectorAll('input').forEach((i) => i.checked = true); };
document.getElementById('m3dShell').onclick = () => {   // hide enclosure/frame to see the process inside
  ['Acrylic_Enclosure_Top', 'Plates_PP', 'Frame_2020', 'Bracket_2020_corner_20x20x17'].forEach((k) => { const G = groups[k]; if (!G) return;
    G.on = false; G.objs.forEach((o) => o.visible = false); const i = list.querySelector(`[data-k="${k}"] input`); if (i) i.checked = false; });
};
document.getElementById('m3dFit').onclick = () => model && fit();

function glow(k, color) { const G = groups[k]; if (!G) return; G.mats.forEach((m) => { if (m.emissive) m.emissive.set(color || 0x000000); }); }
let flashT = null;
function flash(k) { glow(k, 0x2266ff); clearTimeout(flashT); flashT = setTimeout(() => { glow(k, 0); lastOut = null; }, 1200); }
function select(e) {
  if (!model) return; const r = renderer.domElement.getBoundingClientRect();
  const ray = new THREE.Raycaster(); ray.setFromCamera(new THREE.Vector2((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1), camera);
  const hit = ray.intersectObject(model, true).find((h) => h.object.visible && h.object.material.opacity > 0.5);
  if (!hit) return; const k = hit.object.userData.g; let n = hit.object; while (n.parent && !n.name) n = n.parent;
  info.textContent = `${groups[k].label}  ·  ${n.name || k}`; flash(k);
  list.querySelectorAll('.m3row').forEach((x) => x.classList.toggle('sel', x.dataset.k === k));
}

let lastOut = null;
window.onRig3d = (m) => {
  if (!model) return; const o = m.out || {}, sig = JSON.stringify(o); if (sig === lastOut) return; lastOut = sig;
  const live = new Set(); Object.entries(OUT_MAP).forEach(([out, ks]) => { if (o[out] > 0) ks.forEach((k) => live.add(k)); });
  if (m.p && m.p.servo_home !== undefined && o.servo !== undefined && Math.abs(o.servo - m.p.servo_home) > 5) live.add('Rinsing_Zone');
  Object.keys(groups).forEach((k) => glow(k, live.has(k) ? 0x1f8f3a : 0));
  document.getElementById('m3dLive').textContent = live.size ? 'กำลังทำงาน: ' + [...live].map((k) => GROUPS[k] || k).join(', ') : 'ไม่มีอุปกรณ์ทำงาน';
};

document.querySelector('#tabs button[data-t="m3d"]').addEventListener('click', () => { if (!started) init(); else size(); });
if (location.hash === '#m3d') init();
