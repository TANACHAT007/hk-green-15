// HK-Green-15 — dashboard (vanilla JS, no internet needed)
const $ = (id) => document.getElementById(id);
const STEPS = ['IDLE', 'DOSE', 'DISSOLVE', 'DRIP', 'SET', 'DRAIN', 'RINSE_SPRAY', 'RINSE_WAIT', 'TILT', 'TILT_BACK', 'DONE'];
const TH = { IDLE: 'พร้อม', DOSE: 'ป้อนผง', DISSOLVE: 'กวนละลาย', DRIP: 'หยดเป็นเม็ด', SET: 'แช่ NaOH', DRAIN: 'ปล่อยน้ำ',
  RINSE_SPRAY: 'สเปรย์ล้าง', RINSE_WAIT: 'รอสะเด็ด/วัด pH', TILT: 'เทถาด', TILT_BACK: 'ถาดกลับ', DONE: 'เสร็จ', SAFE: 'หยุดฉุกเฉิน' };
const DESC = { IDLE: 'รอกดเริ่ม', DOSE: 'สกรูป้อนผงไคโตซาน+ไบโอชาร์ลงถังกรด ขณะพัดลมกวน', DISSOLVE: 'กวนต่อเนื่องจนละลายเป็นเนื้อเดียว',
  DRIP: 'ปั๊มรีดท่อหยดสารละลายผ่านเข็ม 12 หัวลง 2 M NaOH — เกิดเม็ดเจล', SET: 'แช่ให้เกิดการเชื่อมขวาง (กวนเบา ๆ)',
  DRAIN: 'เปิดวาล์ว 1" ปล่อยเม็ด + NaOH ลงถาดกรอง', RINSE_SPRAY: 'สเปรย์น้ำล้างเม็ดบนถาดกรอง', RINSE_WAIT: 'รอน้ำสะเด็ดแล้ววัด pH',
  TILT: 'เซอร์โวเทถาดลงถาดตาก', TILT_BACK: 'ถาดกลับตำแหน่งเดิม', DONE: 'ครบรอบ — นำเม็ดไปตาก', SAFE: 'อุปกรณ์ทุกตัวหยุด — แก้ปัญหาแล้วกดรีเซ็ต' };
const OUTS = [['peri', 'ปั๊มหยด (MDD10A ch1)', 255], ['auger', 'สกรูป้อนไคโตซาน (MDD10A ch2)', 255], ['bio', 'สกรูป้อนไบโอชาร์ (MOSFET #2)', 255], ['top', 'พัดลมกวนถังกรด (MDD3A M1)', 255],
  ['ch', 'มอเตอร์กวนห้องก่อเจล (MOSFET)', 255], ['rinse', 'ปั๊มสเปรย์ล้าง (MDD3A M2)', 255], ['valve', 'วาล์ว 1" (รีเลย์)', 1], ['servo', 'เซอร์โวเทถาด (องศา)', 180]];
const bioDose = (P) => ((P.acid_ml ?? 500) + (P.dose_g ?? 30)) * (P.biochar_pct ?? 2) / 100;   // biochar g per batch: % of acid + chitosan
const RECIPE = [['dose_g', 'ไคโตซาน', 'g'], ['biochar_pct', 'ไบโอชาร์ (% ของน้ำหนักกรด + ไคโตซาน)', '0–3 %'], ['auger_g_per_rev', 'สกรูไคโตซาน', 'g/รอบ'], ['bio_g_per_rev', 'สกรูไบโอชาร์', 'g/รอบ'], ['dissolve_min', 'เวลากวนละลาย', 'นาที'],
  ['drip_min', 'เวลาหยด', 'นาที'], ['peri_duty', 'PWM ปั๊มหยด', '0–255'], ['set_min', 'เวลาแช่ NaOH', 'นาที'],
  ['top_stir_duty', 'PWM พัดลมกวน', '128–255'], ['chamber_stir_duty', 'PWM กวนห้องก่อเจล', '0–255'], ['ph_target', 'pH หยุดล้าง', 'pH'], ['rinse_max', 'ล้างสูงสุด', 'รอบ']];
let S = null, MODE = 'none', HIST = [], BATCHES = [], INFO = {}, lastRun = null, runT0 = null, cal = {};

// ------------------------------------------------------------------ UI basics
document.querySelectorAll('#tabs button').forEach((b) => b.onclick = () => {
  document.querySelectorAll('#tabs button').forEach((x) => x.classList.toggle('on', x === b));
  document.querySelectorAll('section.tab').forEach((s) => s.classList.toggle('on', s.id === 't-' + b.dataset.t));
  $('tbTitle').textContent = b.querySelector('span') ? b.querySelector('span').textContent : b.textContent;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  drawAll();
});
function setTheme(t) { document.documentElement.dataset.theme = t; try { localStorage.setItem('theme', t); } catch (e) {} }
const osTheme = () => (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
try { setTheme(localStorage.getItem('theme') || osTheme()); } catch (e) { setTheme(osTheme()); }
$('theme').onclick = () => { setTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'); drawAll(); };
const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
const fmt = (x, d = 1) => (x === undefined || x === null || isNaN(x)) ? '—' : Number(x).toFixed(d);
const hms = (s) => { s = Math.max(0, Math.round(s)); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60;
  return (h ? h + ' ชม. ' : '') + (h || m ? m + ' นาที ' : '') + (h ? '' : x + ' วิ'); };

async function cmd(o) {
  const r = await fetch('/api/cmd', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(o) });
  if (!r.ok) log('คำสั่งไม่สำเร็จ: ' + JSON.stringify(o));
}
function log(m) { const el = $('log'); el.textContent = new Date().toLocaleTimeString() + '  ' + m + '\n' + el.textContent.slice(0, 5000); }

$('steps').innerHTML = STEPS.slice(1).map((s) => `<span data-s="${s}">${TH[s]}</span>`).join('');
const EQI = { peri: '💧', auger: '🥄', bio: '⚫', top: '🌀', ch: '🫧', rinse: '🚿', valve: '🚰', servo: '↘️' };
$('outs').innerHTML = OUTS.map(([k, n]) => `<div class="eq" id="eq_${k}"><i class="ei">${EQI[k] || '⚙️'}</i><div class="et"><span>${n.replace(/ \(.*\)/, '')}</span><small>${(n.match(/\((.*)\)/) || ['', ''])[1]}</small>` +
  `<div class="bar"><i id="ob_${k}"></i></div></div><b id="ov_${k}">—</b></div>`).join('');

// ------------------------------------------------------------------ estimates
function etaS(m) {
  const P = m.p || {}, idx = STEPS.indexOf(m.state); if (idx < 1 || m.state === 'DONE') return 0;
  const dose = Math.max(P.dose_g / P.auger_g_per_rev / 30 * 60, bioDose(P) / (P.bio_g_per_rev || 0.09) / 30 * 60), rinseLeft = Math.max(1, 7 - (m.rinse || 0));
  const len = { DOSE: dose, DISSOLVE: P.dissolve_min * 60, DRIP: P.drip_min * 60, SET: P.set_min * 60, DRAIN: 60,
    RINSE_SPRAY: 0, RINSE_WAIT: 0, TILT: 5, TILT_BACK: 2 };
  let t = m.left_s;
  for (let i = idx + 1; i < STEPS.length - 1; i++) t += len[STEPS[i]] || 0;
  if (idx <= STEPS.indexOf('RINSE_WAIT')) t += rinseLeft * 60;
  return t;
}

// ------------------------------------------------------------------ live data
function onRig(m) {
  S = m;
  HIST.push({ ts: m.t_host || Date.now() / 1000, ph: m.ph, state: m.state });
  if (HIST.length > 3000) HIST.shift();
  const st = m.state, idx = STEPS.indexOf(st);
  document.querySelectorAll('#steps span').forEach((e) => {
    const i = STEPS.indexOf(e.dataset.s);
    e.className = st === 'SAFE' ? (i === 1 ? '' : '') : (i < idx || st === 'DONE' ? 'done' : i === idx ? 'now' : '');
  });
  $('stName').textContent = (TH[st] || st); $('stName').dataset.code = st;
  $('stDesc').textContent = DESC[st] || '';
  $('stBar').style.width = m.step_s ? (100 * (1 - m.left_s / m.step_s)) + '%' : (st === 'DONE' ? '100%' : '0');
  $('stLeft').textContent = m.step_s ? hms(m.left_s) : '—';
  $('eta').textContent = idx > 0 && st !== 'DONE' ? '≈ ' + hms(etaS(m)) : '—';
  $('ph').textContent = fmt(m.ph, 2); $('phMark').style.left = Math.max(0, Math.min(100, m.ph / 14 * 100)) + '%';
  $('phT').textContent = '≤ ' + fmt(m.p && m.p.ph_target, 2); $('rinseN').textContent = m.rinse + ' / ' + (m.p ? m.p.rinse_max : '—');
  $('phV').textContent = fmt(m.ph_v, 3) + ' V'; $('calV').textContent = 'V = ' + fmt(m.ph_v, 3) + '  (pH ' + fmt(m.ph, 2) + ')';
  OUTS.forEach(([k, , max]) => { const v = m.out ? m.out[k] : 0;
    $('ob_' + k).style.width = (100 * v / max) + '%'; $('ov_' + k).textContent = k === 'valve' ? (v ? 'เปิด' : 'ปิด') : k === 'servo' ? v + '°' : Math.round(100 * v / 255) + '%'; });
  if (m.sim) {
    $('powder').textContent = fmt(m.sim_powder_g, 1) + ' / ' + fmt(m.p.dose_g, 1) + ' g · ไบโอชาร์ ' + fmt(m.sim_biochar_g, 2) + ' / ' + fmt(bioDose(m.p), 2) + ' g'; $('diss').textContent = fmt(100 * m.sim_dissolved, 0) + ' %';
    $('acid').textContent = fmt(m.sim_acid_ml, 0) + ' mL'; $('dripped').textContent = fmt(m.sim_dripped_ml, 0) + ' mL';
    $('flow').textContent = fmt(m.sim_flow_mlpm, 2) + ' mL/min';
    const pn = m.sim_flow_mlpm / (INFO.needles || 12); $('perNeedle').textContent = fmt(pn, 2) + ' mL/min ' + (pn > 1.5 ? '⚠ เป็นสาย' : '✔ เป็นหยด');
    $('beads').textContent = (m.sim_beads || 0).toLocaleString() + ' เม็ด'; $('beadD').textContent = '≈ ' + fmt(m.sim_bead_d_mm, 1) + ' mm';
    $('spd').textContent = '×' + m.speed;
  }
  const sb = $('bSafety');
  if (m.estop) { sb.textContent = 'E-STOP ถูกกด'; sb.className = 'badge bad'; }
  else if (st === 'SAFE') { sb.textContent = 'SAFE — รอรีเซ็ต'; sb.className = 'badge warn'; }
  else if (m.test) { sb.textContent = 'โหมดทดสอบอุปกรณ์'; sb.className = 'badge warn'; }
  else { sb.textContent = 'ปลอดภัย'; sb.className = 'badge ok'; }
  $('bLink').textContent = 'Mega: เชื่อมต่อ'; $('bLink').className = 'badge ok';
  if (st === 'DOSE' && !runT0) runT0 = m.ms;
  if (st === 'DONE' && runT0 !== null) { lastRun = { ph: m.ph, rinse: m.rinse, run_h: (m.ms - runT0) / 3600000, beads: m.sim_beads, d: m.sim_bead_d_mm }; runT0 = null; }
  if (st === 'IDLE') runT0 = null;
  if (!recipeFilled && m.p) fillRecipe(m.p);
  drawAll();
  if (m.firmware === 'qemu') $('bMode').textContent = 'Mega เสมือน (เฟิร์มแวร์จริงใน QEMU)';
  shell(m);
  if (window.onRig3d) window.onRig3d(m);
}

// ------------------------------------------------------------------ app shell: ring, dock button, next step, toasts
function totalS(P) {
  const dose = Math.max(P.dose_g / P.auger_g_per_rev / 30 * 60, bioDose(P) / (P.bio_g_per_rev || 0.09) / 30 * 60);
  return dose + (P.dissolve_min + P.drip_min + P.set_min) * 60 + 60 + 7 * 60 + 7;
}
function gtoast(msg) { const t = $('gtoast'); t.textContent = msg; t.classList.remove('on'); void t.offsetWidth; t.classList.add('on');
  clearTimeout(gtoast.h); gtoast.h = setTimeout(() => t.classList.remove('on'), 3800); }
let lastSt = null;
function readV() { try { return JSON.parse(localStorage.getItem('hk15_3d') || '{}'); } catch (e) { return {}; } }
function shell(m) {
  const st = m.state, P = m.p || {}, run = !['IDLE', 'DONE', 'SAFE'].includes(st);
  const pct = st === 'DONE' ? 1 : st === 'IDLE' || st === 'SAFE' ? 0 : Math.max(0, Math.min(1, 1 - etaS(m) / totalS(P)));
  const c = 2 * Math.PI * 52; $('ringFg').style.strokeDasharray = c; $('ringFg').style.strokeDashoffset = c * (1 - pct);
  $('ringPct').textContent = Math.round(pct * 100) + '%';
  if (STEPS.indexOf(st) > 0 && STEPS.indexOf(st) < STEPS.indexOf('DRAIN')) $('rinseN').textContent = '0 / ' + (P.rinse_max ?? '—');
  document.body.dataset.state = st;
  // one main button that always does the right thing
  const b = $('dockMain');
  if (run) { b.textContent = '■ หยุด'; b.className = 'b main stop'; b.onclick = () => cmd({ cmd: 'stop' }); b.disabled = false; }
  else if (st === 'SAFE') { b.textContent = m.estop ? 'ดึง E-stop ขึ้นก่อน' : '↺ รีเซ็ต'; b.className = 'b main reset'; b.disabled = !!m.estop; b.onclick = () => cmd({ cmd: 'reset' }); }
  else { b.textContent = '▶ เริ่มรอบผลิต'; b.className = 'b main go'; b.disabled = false; b.onclick = () => cmd({ cmd: 'start' }); }
  document.querySelectorAll('#dockSpd button').forEach((x) => x.classList.toggle('on', +x.dataset.speed === m.speed));
  // equipment chips
  OUTS.forEach(([k]) => { const v = m.out ? m.out[k] : 0, on = k === 'servo' ? Math.abs(v - (P.servo_home ?? 10)) > 5 : v > 0;
    $('eq_' + k).classList.toggle('on', !!on); });
  // what to do next
  const V = readV(), need = P.dose_g || 30, bioNeed = bioDose(P), chk = [
    ['ผงไคโตซาน', (V.hopperG || 0) >= need], ['ไบโอชาร์', (V.bioG || 0) >= bioNeed], ['กรด 1 M 500 mL', (V.acidMl || 0) >= 450],
    ['NaOH 2 M', (V.naoh || 0) >= 0.5], ['น้ำล้าง', (V.water || 0) >= 0.5], ['ถังน้ำทิ้งไม่เต็ม', (V.waste || 0) < 0.85]];
  const NEXT = { IDLE: 'เตรียมวัตถุดิบให้ครบ แล้วกด ▶ เริ่มรอบผลิต', DOSE: 'กำลังป้อนผง — ไม่ต้องทำอะไร', DISSOLVE: 'กวนให้ละลาย ~2 ชม. — รอได้เลย',
    DRIP: 'กำลังหยดเป็นเม็ด — ดูว่าหยดเป็นเม็ด ไม่เป็นสาย', SET: 'แช่ NaOH 6 ชม. — รอได้เลย', DRAIN: 'ปล่อยน้ำ NaOH ลงถังทิ้ง',
    RINSE_SPRAY: 'กำลังล้าง — รอ pH ลงถึงเป้า', RINSE_WAIT: 'รอน้ำสะเด็ดแล้ววัด pH', TILT: 'เทเม็ดลงถาดตาก', TILT_BACK: 'ถาดกลับที่เดิม',
    DONE: 'เก็บเม็ดจากถาดตาก แล้วบันทึกผลในแท็บผลทดลอง', SAFE: m.estop ? 'ดึงปุ่ม E-stop ขึ้น แล้วกดรีเซ็ต' : 'แก้ปัญหาให้เรียบร้อย แล้วกด ↺ รีเซ็ต' };
  const ALARM = { 1: '🧴 กรดในถังผสมไม่พอ — เติมกรด 500 mL แล้วกดเริ่มใหม่', 2: '🚰 น้ำล้างใกล้หมด — เติมน้ำ เครื่องจะล้างต่อเอง', 3: '🗑️ ถังน้ำทิ้งเต็ม — เททิ้ง เครื่องจะปล่อยน้ำต่อเอง' };
  $('nextTxt').textContent = m.alarm ? ALARM[m.alarm] : (NEXT[st] || '—');
  const lv = m.lvl || [1, 1, 0], sens = [['กรด', lv[0]], ['น้ำล้าง', lv[1]], ['น้ำทิ้ง', !lv[2]]];
  let se = $('sensRow'); if (!se) { se = document.createElement('div'); se.id = 'sensRow'; se.className = 'sens'; $('checklist2').after(se); }
  se.innerHTML = '<small>เซนเซอร์ระดับ</small>' + sens.map(([n, ok]) => `<span class="ck ${ok ? 'ok' : 'no'}">${ok ? '✓' : '!'} ${n}${n === 'น้ำทิ้ง' ? (ok ? ' ไม่เต็ม' : ' เต็ม') : (ok ? '' : ' ต่ำ')}</span>`).join('');
  if (m.alarm && m.alarm !== shell.alarm) gtoast(ALARM[m.alarm]);
  shell.alarm = m.alarm || 0;
  const showChk = st === 'IDLE' || st === 'DONE';
  $('checklist2').innerHTML = showChk ? chk.map(([n, ok]) => `<span class="ck ${ok ? 'ok' : 'no'}">${ok ? '✓' : '!'} ${n}</span>`).join('') +
    (chk.every((x) => x[1]) ? '' : '<button class="mini" id="fillAll2">✨ เติมครบทุกอย่าง</button>') : '';
  const f2 = $('fillAll2'); if (f2) f2.onclick = () => { const f = $('fillAll'); if (f) f.click(); gtoast('✨ เติมวัตถุดิบครบแล้ว'); setTimeout(() => shell(S), 50); };
  $('nextCard').classList.toggle('warn', !!m.alarm || (showChk && !chk.every((x) => x[1])));
  if (lastSt && st !== lastSt) gtoast((TH[st] || st) + (st === 'DONE' ? ' 🎉' : ''));
  lastSt = st;
}
document.querySelectorAll('#dockSpd button').forEach((x) => x.onclick = () => cmd({ cmd: 'sim', op: 'speed', val: +x.dataset.speed }));

function connect() {
  const es = new EventSource('/events');
  let lastMsg = Date.now();
  es.onmessage = (e) => { lastMsg = Date.now(); const m = JSON.parse(e.data);
    if (m.t === 'rig') onRig(m); else if (m.t === 'log') log(m.msg); };
  es.onerror = () => { $('bLink').textContent = 'เซิร์ฟเวอร์หลุด…'; $('bLink').className = 'badge bad'; };
  setInterval(() => { if (Date.now() - lastMsg > 3000 && S) { $('bLink').textContent = 'Mega: ไม่มีข้อมูล > 3 วิ'; $('bLink').className = 'badge warn'; } }, 1000);
}

// ------------------------------------------------------------------ charts (canvas)
function canvasCtx(id) {
  const c = $(id); if (!c || !c.offsetParent) return null;
  const r = window.devicePixelRatio || 1, w = c.clientWidth, h = c.height;
  if (c.width !== Math.round(w * r)) { c.width = Math.round(w * r); c.style.height = h + 'px'; }
  const g = c.getContext('2d'); g.setTransform(c.width / w, 0, 0, c.width / w, 0, 0);
  g.clearRect(0, 0, w, h); return { g, w, h };
}
function axes(g, w, h, pad, xl, yl) {
  g.strokeStyle = css('--line'); g.fillStyle = css('--muted'); g.font = '11px sans-serif'; g.lineWidth = 1;
  g.beginPath(); g.moveTo(pad.l, pad.t); g.lineTo(pad.l, h - pad.b); g.lineTo(w - pad.r, h - pad.b); g.stroke();
  if (xl) g.fillText(xl, w - pad.r - g.measureText(xl).width, h - 4);
  if (yl) g.fillText(yl, 4, pad.t - 4);
}
function drawTrend() {
  const C = canvasCtx('trend'); if (!C) return; const { g, w, h } = C, pad = { l: 34, r: 10, t: 24, b: 22 };
  axes(g, w, h, pad, 'ตัวอย่างล่าสุด →', 'pH');
  const d = HIST.slice(-600); if (d.length < 2) return;
  const X = (i) => pad.l + (w - pad.l - pad.r) * i / (d.length - 1), Y = (p) => h - pad.b - (h - pad.t - pad.b) * (p - 4) / 10;
  g.fillStyle = css('--muted'); for (let p = 4; p <= 14; p += 2) g.fillText(p, 8, Y(p) + 4);
  const tgt = S && S.p ? S.p.ph_target : 7.5; g.strokeStyle = css('--ok'); g.setLineDash([4, 3]); g.beginPath(); g.moveTo(pad.l, Y(tgt)); g.lineTo(w - pad.r, Y(tgt)); g.stroke(); g.setLineDash([]);
  g.fillStyle = css('--ok'); g.fillText('เป้า ' + tgt, w - pad.r - 50, Y(tgt) - 4);
  d.forEach((x, i) => { if (x.state && x.state.startsWith('RINSE')) { g.fillStyle = 'rgba(47,168,255,.12)'; g.fillRect(X(i), pad.t, Math.max(1, (w - pad.l) / d.length), h - pad.t - pad.b); } });
  g.strokeStyle = css('--accent'); g.lineWidth = 2; g.beginPath(); d.forEach((x, i) => { i ? g.lineTo(X(i), Y(x.ph)) : g.moveTo(X(i), Y(x.ph)); }); g.stroke();
}
function drawProc() {
  const C = canvasCtx('proc'); if (!C) return; const { g, w, h } = C;
  const s = Math.min(w / 620, h / 330), X = (x) => x * s + (w - 620 * s) / 2, Y = (y) => y * s;
  const o = S && S.out ? S.out : {}, st = S ? S.state : 'IDLE', on = css('--accent'), off = css('--muted');
  g.font = Math.max(10, 12 * s) + 'px sans-serif'; g.lineWidth = 2;
  const box = (x, y, bw, bh, label, active, fill) => {
    if (fill !== undefined && fill > 0) { g.fillStyle = 'rgba(46,204,113,.25)'; g.fillRect(X(x), Y(y + bh * (1 - fill)), bw * s, bh * fill * s); }
    g.strokeStyle = active ? on : off; g.strokeRect(X(x), Y(y), bw * s, bh * s);
    g.fillStyle = active ? on : css('--text'); g.fillText(label, X(x + 4), Y(y - 5)); };
  const arrow = (pts, active) => { g.strokeStyle = active ? on : css('--line'); g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(X(x), Y(y)) : g.moveTo(X(x), Y(y))); g.stroke();
    const [x1, y1] = pts[pts.length - 1], [x0, y0] = pts[pts.length - 2], a = Math.atan2(y1 - y0, x1 - x0);
    g.fillStyle = g.strokeStyle; g.beginPath(); g.moveTo(X(x1), Y(y1)); g.lineTo(X(x1) - 8 * Math.cos(a - .4), Y(y1) - 8 * Math.sin(a - .4)); g.lineTo(X(x1) - 8 * Math.cos(a + .4), Y(y1) - 8 * Math.sin(a + .4)); g.fill(); };
  const acid = S && S.sim ? S.sim_acid_ml / (INFO.sol_ml || 500) : (['DOSE', 'DISSOLVE', 'DRIP'].includes(st) ? 0.8 : 0);
  box(20, 30, 60, 50, 'ไคโตซาน', o.auger > 0); box(20, 100, 40, 30, 'ไบโอชาร์', o.bio > 0);
  arrow([[80, 55], [130, 55], [130, 95]], o.auger > 0); g.fillStyle = off; g.fillText('สกรูป้อน', X(86), Y(48));
  box(95, 100, 90, 70, 'ถังกรด 1 M', o.top > 0, acid);
  g.fillStyle = o.top > 0 ? on : off; g.fillText('พัดลมกวน ' + Math.round(100 * (o.top || 0) / 255) + '%', X(97), Y(186));
  arrow([[185, 150], [235, 150], [235, 60], [285, 60]], o.peri > 0); g.fillStyle = o.peri > 0 ? on : off; g.fillText('ปั๊มหยด', X(190), Y(142));
  box(285, 40, 110, 30, 'เข็ม 12 หัว', o.peri > 0);
  if (o.peri > 0) { g.fillStyle = on; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(X(298 + i * 17), Y(82 + (Date.now() / 120 + i * 7) % 18), 2.5 * s, 0, 7); g.fill(); } }
  const chFill = ['DRIP', 'SET', 'DOSE', 'DISSOLVE', 'IDLE', 'DONE'].includes(st) ? 0.75 : st === 'DRAIN' ? 0.3 : 0.05;
  box(280, 100, 120, 110, 'ห้องก่อเจล 2 M NaOH', o.ch > 0, chFill);
  g.fillStyle = o.ch > 0 ? on : off; g.fillText('กวนล่าง ' + Math.round(100 * (o.ch || 0) / 255) + '%', X(284), Y(226));
  arrow([[400, 195], [440, 195], [440, 240]], o.valve > 0); g.fillStyle = o.valve > 0 ? on : off; g.fillText('วาล์ว 1"', X(405), Y(188));
  box(395, 245, 130, 25, 'ถาดกรอง (สเปรย์ล้าง)', o.rinse > 0 || o.valve > 0);
  if (o.rinse > 0) { g.strokeStyle = on; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(X(415 + i * 40), Y(232)); g.lineTo(X(405 + i * 40), Y(244)); g.moveTo(X(415 + i * 40), Y(232)); g.lineTo(X(425 + i * 40), Y(244)); g.stroke(); } }
  box(395, 285, 130, 25, 'ถาดรอง + หัววัด pH ' + fmt(S && S.ph, 1), st === 'RINSE_WAIT');
  arrow([[460, 310], [460, 325], [560, 325]], o.valve > 0); g.fillStyle = off; g.fillText('→ ถังน้ำเสีย (ปรับ pH ก่อนทิ้ง)', X(470), Y(320));
  const tilt = (o.servo || 10) > 60; box(540, 230, 70, 40, 'ถาดตาก', tilt);
  arrow([[525, 255], [540, 255]], tilt); g.fillStyle = tilt ? on : off; g.fillText('เซอร์โว ' + (o.servo || 10) + '°', X(545), Y(288));
}
function drawSw() {
  const C = canvasCtx('swChart'); if (!C) return; const { g, w, h } = C, pad = { l: 40, r: 10, t: 16, b: 30 };
  axes(g, w, h, pad, 'ไบโอชาร์ (% w/w)', 'การพองตัว %');
  const sm = summary(), ymax = Math.max(800, ...sm.map((x) => x.mean + x.sd)) * 1.1;
  const Y = (v) => h - pad.b - (h - pad.t - pad.b) * v / ymax, gw = (w - pad.l - pad.r) / 4;
  g.fillStyle = css('--muted'); for (let v = 0; v <= ymax; v += 200) g.fillText(v, 6, Y(v) + 4);
  [0, 1, 2, 3].forEach((b, i) => {
    const x = pad.l + gw * i + gw * 0.25; g.fillStyle = css('--muted'); g.fillText(b + ' %', x + gw * 0.15, h - pad.b + 14);
    const r = sm.find((q) => +q.biochar_pct === b); if (!r) return;
    g.fillStyle = b === 2 ? css('--ok') : css('--accent'); g.fillRect(x, Y(r.mean), gw * 0.5, Y(0) - Y(r.mean));
    g.strokeStyle = css('--text'); g.beginPath(); g.moveTo(x + gw * 0.25, Y(r.mean + r.sd)); g.lineTo(x + gw * 0.25, Y(Math.max(0, r.mean - r.sd))); g.stroke();
    g.fillStyle = css('--text'); g.fillText(fmt(r.mean, 0), x, Y(r.mean) - 4);
  });
  g.strokeStyle = css('--warn'); g.setLineDash([4, 3]); g.beginPath(); g.moveTo(pad.l, Y(605)); g.lineTo(w - pad.r, Y(605)); g.stroke(); g.setLineDash([]);
  g.fillStyle = css('--warn'); g.fillText('งานวิจัยเดิม 605 %', w - pad.r - 110, Y(605) - 4);
}
function drawAll() { drawTrend(); drawProc(); drawSw(); }
window.addEventListener('resize', drawAll);
setInterval(() => { if (S && S.out && S.out.peri > 0) drawProc(); }, 120);

// ------------------------------------------------------------------ run + recipe
$('start').onclick = () => cmd({ cmd: 'start' });
$('stop').onclick = () => cmd({ cmd: 'stop' });
$('reset').onclick = () => cmd({ cmd: 'reset' });
document.querySelectorAll('[data-speed]').forEach((b) => b.onclick = () => cmd({ cmd: 'sim', op: 'speed', val: +b.dataset.speed }));
$('skip').onclick = () => cmd({ cmd: 'sim', op: 'skip' });
$('simEstop').onclick = () => cmd({ cmd: 'sim', op: 'estop', val: 1 }); $('simEstopRel').onclick = () => cmd({ cmd: 'sim', op: 'estop', val: 0 });
let recipeFilled = false;
function fillRecipe(P) {
  $('recipe').innerHTML = '<tr><th>ค่า</th><th>บน Mega</th><th>ใหม่</th><th>หน่วย</th></tr>' +
    RECIPE.map(([k, n, u]) => `<tr><td>${n}</td><td class="mono" id="cur_${k}">${P[k]}</td><td><input type="number" id="new_${k}" value="${P[k]}" step="any"></td><td>${u}</td></tr>`).join('');
  recipeFilled = true; recipeCheck();
  RECIPE.forEach(([k]) => $('new_' + k).oninput = recipeCheck);
}
function recipeCheck() {
  const v = (k) => +$('new_' + k).value, flow = 500 / v('drip_min'), pn = flow / 12;
  $('recipeChk').textContent = `อัตราที่ต้องการ ${fmt(flow, 1)} mL/min = ${fmt(pn, 2)} mL/min ต่อเข็ม ` + (pn > 1.5 ? '⚠ เกิน 1.5 → เป็นสาย ไม่เป็นเม็ด (เพิ่มเวลาหยด)' : '✔ อยู่ในช่วงเป็นหยด') +
    (v('top_stir_duty') < 128 ? ' · ⚠ พัดลมกวนต่ำกว่า 128 จะถูกดันเป็น 128' : '') + (v('set_min') < 360 ? ' · ⚠ แช่น้อยกว่า 6 ชม. (สูตรทีม)' : '');
}
$('calcDose').onclick = () => {
  const chi = +$('vol').value * +$('chi').value / 100, bio = chi * +$('bio').value / 100;
  $('doseNote').textContent = `ไคโตซาน ${fmt(chi, 2)} g (สกรูใหญ่) + ไบโอชาร์ ${fmt(bio, 2)} g (สกรูเล็ก) — แยกถังกัน ไม่ต้องผสมเอง`;
  if (recipeFilled) { $('new_dose_g').value = chi.toFixed(2); $('new_biochar_pct').value = +$('bio').value; recipeCheck(); }
};
$('sendRecipe').onclick = () => { if (!S) return; let n = 0;
  RECIPE.forEach(([k]) => { const v = +$('new_' + k).value; if (S.p && +S.p[k] !== v) { cmd({ cmd: 'set', key: k, val: v }); n++; } });
  log(n ? `ส่งสูตร ${n} ค่า` : 'สูตรไม่เปลี่ยน'); recipeFilled = false; };

// ------------------------------------------------------------------ bench test
$('testRows').innerHTML = OUTS.map(([k, n, max]) => k === 'valve'
  ? `<div class="row"><span style="min-width:220px">${n}</span><button class="b ghost" onclick="cmd({cmd:'test',out:'valve',val:1})">เปิด</button><button class="b ghost" onclick="cmd({cmd:'test',out:'valve',val:0})">ปิด</button></div>`
  : `<div class="row"><span style="min-width:220px">${n}</span><input type="range" min="0" max="${max}" value="${k === 'servo' ? 10 : 0}" id="ts_${k}" style="flex:1"><b class="mono" id="tv_${k}" style="width:48px">${k === 'servo' ? 10 : 0}</b></div>`).join('');
let tT = null;
OUTS.forEach(([k]) => { const e = $('ts_' + k); if (!e) return; e.oninput = () => { $('tv_' + k).textContent = e.value; clearTimeout(tT);
  tT = setTimeout(() => cmd({ cmd: 'test', out: k, val: +e.value }), 150); }; });
$('testOff').onclick = () => { cmd({ cmd: 'test', out: 'off', val: 0 }); OUTS.forEach(([k]) => { const e = $('ts_' + k); if (e) { e.value = k === 'servo' ? 10 : 0; $('tv_' + k).textContent = e.value; } }); };

// ------------------------------------------------------------------ batch logger
const mean = (a) => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
const sd = (a) => { if (a.length < 2) return 0; const m = mean(a); return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1)); };
function summary() {
  const k = {}; BATCHES.forEach((b) => (k[b.biochar_pct] = k[b.biochar_pct] || []).push(b));
  return Object.entries(k).map(([biochar_pct, rows]) => { const sw = rows.map((r) => +r.swelling_pct).filter((x) => x > 0);
    return { biochar_pct, n: rows.length, mean: mean(sw), sd: sd(sw), d: mean(rows.map((r) => +r.bead_d_mm).filter((x) => x > 0)),
      ph: mean(rows.map((r) => +r.final_ph).filter((x) => x > 0)), rin: mean(rows.map((r) => +r.rinse_cycles)) }; }).sort((a, b) => a.biochar_pct - b.biochar_pct);
}
function swPct() { const d = +$('bDry').value, s = +$('bSw').value; return d > 0 && s > 0 ? 100 * (s - d) / d : 0; }
['bDry', 'bSw'].forEach((id) => $(id).oninput = () => { $('bSwOut').textContent = swPct() ? 'การพองตัว = ' + fmt(swPct(), 0) + ' %' : ''; });
function renderBatches() {
  $('bTbl').innerHTML = '<tr><th>#</th><th>เวลา</th><th>ไบโอชาร์</th><th>ซ้ำ</th><th>ผง (g)</th><th>เม็ด</th><th>ขนาด (mm)</th><th>เปียก (g)</th><th>แห้ง (g)</th><th>พองตัว</th><th>pH</th><th>ล้าง</th><th>ชม.</th><th></th></tr>' +
    BATCHES.map((b) => `<tr><td>${b.id}</td><td>${b.time}</td><td>${b.biochar_pct} %</td><td>${b.rep}</td><td>${b.dose_g}</td><td>${b.beads_n}</td><td>${fmt(b.bead_d_mm, 2)} ± ${fmt(b.bead_d_sd, 2)}</td><td>${b.yield_wet_g}</td><td>${b.dry_g}</td><td><b>${fmt(b.swelling_pct, 0)} %</b></td><td>${fmt(b.final_ph, 2)}</td><td>${b.rinse_cycles}</td><td>${fmt(b.run_h, 1)}</td><td><button class="b ghost" onclick="delBatch(${b.id})">ลบ</button></td></tr>`).join('');
  $('sumTbl').innerHTML = '<tr><th>ไบโอชาร์</th><th>n</th><th>พองตัว %</th><th>ขนาดเม็ด</th><th>pH สุดท้าย</th><th>รอบล้าง</th></tr>' +
    summary().map((s) => `<tr><td>${s.biochar_pct} %</td><td>${s.n}${s.n < 3 ? ' ⚠' : ''}</td><td>${fmt(s.mean, 0)} ± ${fmt(s.sd, 0)}</td><td>${fmt(s.d, 2)} mm</td><td>${fmt(s.ph, 2)}</td><td>${fmt(s.rin, 1)}</td></tr>`).join('');
  drawSw();
}
window.delBatch = async (id) => { if (!confirm('ลบรอบ #' + id + '?')) return; BATCHES = await (await fetch('/api/batches', { method: 'POST', body: JSON.stringify({ delete: id }) })).json(); renderBatches(); };
$('bFill').onclick = () => { const r = lastRun || (S ? { ph: S.ph, rinse: S.rinse, beads: S.sim_beads, d: S.sim_bead_d_mm } : null); if (!r) return;
  $('bPh').value = fmt(r.ph, 2); $('bRin').value = r.rinse; if (r.beads) $('bN').value = r.beads; if (r.d) $('bD').value = fmt(r.d, 2);
  if (r.run_h) $('bNote').value = `รอบเครื่อง ${fmt(r.run_h, 2)} ชม.` + (MODE === 'sim' ? ' (ตัวจำลอง)' : ''); };
$('bSave').onclick = async () => {
  const row = { biochar_pct: +$('bBio').value, rep: +$('bRep').value, dose_g: S && S.p ? S.p.dose_g : null, drip_min: S && S.p ? S.p.drip_min : null,
    beads_n: +$('bN').value, bead_d_mm: +$('bD').value, bead_d_sd: +$('bDsd').value, yield_wet_g: +$('bWet').value, dry_g: +$('bDry').value,
    swell_g: +$('bSw').value, swelling_pct: +swPct().toFixed(1), final_ph: +$('bPh').value, rinse_cycles: +$('bRin').value,
    run_h: lastRun ? +lastRun.run_h.toFixed(2) : null, note: $('bNote').value };
  BATCHES = await (await fetch('/api/batches', { method: 'POST', body: JSON.stringify(row) })).json();
  $('bRep').value = +$('bRep').value + 1; renderBatches(); log(`บันทึกรอบ: ไบโอชาร์ ${row.biochar_pct} % → พองตัว ${row.swelling_pct} %`);
};

// ------------------------------------------------------------------ calibration
$('cal7').onclick = () => { if (S) { cal.v7 = S.ph_v; $('v7').textContent = fmt(cal.v7, 3) + ' V'; } };
$('cal2').onclick = () => { if (S) { cal.v2 = S.ph_v; cal.p2 = +$('buf2').value; $('v2').textContent = `${fmt(cal.v2, 3)} V @ pH ${cal.p2}`; } };
$('calSend').onclick = () => {
  if (cal.v7 === undefined || cal.v2 === undefined) return alert('จำค่าให้ครบ 2 จุดก่อน');
  const slope = (cal.v7 - cal.v2) / (cal.p2 - 7);           // V per pH unit (firmware: pH = 7 + (V7 − V) / slope)
  if (!(Math.abs(slope) > 0.05 && Math.abs(slope) < 0.4)) return alert('ความชันผิดปกติ (' + slope.toFixed(3) + ' V/pH) — ตรวจหัววัด/บัฟเฟอร์');
  cmd({ cmd: 'set', key: 'ph_v7', val: +cal.v7.toFixed(3) }); cmd({ cmd: 'set', key: 'ph_slope', val: +slope.toFixed(4) });
  $('calRes').textContent = `V7 = ${cal.v7.toFixed(3)} V · slope = ${slope.toFixed(4)} V/pH ✔`; };
function timedTest(out, val, clk, sec) { cmd({ cmd: 'test', out, val }); const t0 = Date.now();
  const iv = setInterval(() => { const s = (Date.now() - t0) / 1000; $(clk).textContent = s.toFixed(0) + ' / ' + sec + ' s';
    if (s >= sec) { clearInterval(iv); cmd({ cmd: 'test', out: 'off', val: 0 }); $(clk).textContent = 'ครบ ' + sec + ' s ✔'; } }, 250); }
$('augRun').onclick = () => timedTest('auger', 255, 'augClk', 60);
$('augSend').onclick = () => { const gpr = +$('augG').value / 30; if (!(gpr > 0)) return; cmd({ cmd: 'set', key: 'auger_g_per_rev', val: +gpr.toFixed(3) });
  $('augRes').textContent = fmt(gpr, 3) + ' g/รอบ ✔'; };
$('periRun').onclick = () => timedTest('peri', S && S.p ? S.p.peri_duty : 140, 'periClk', 60);
$('periSend').onclick = () => { if (!S || !S.p) return; const ml = +$('periMl').value; if (!(ml > 0)) return;
  const want = 500 / S.p.drip_min, duty = Math.round(30 + (S.p.peri_duty - 30) * want / ml);
  cmd({ cmd: 'set', key: 'peri_duty', val: Math.min(255, Math.max(40, duty)) });
  $('periRes').textContent = `ได้ ${fmt(ml, 1)} mL/min → ต้องการ ${fmt(want, 1)} → PWM ${duty}` + (duty > 255 ? ' ⚠ เกินสูงสุด เพิ่มเวลาหยด' : ' ✔'); };

// ------------------------------------------------------------------ start
(async () => {
  INFO = await (await fetch('/api/info')).json(); MODE = INFO.mode;
  HIST = INFO.history.map((x) => ({ ts: x.ts, ph: x.ph, state: x.state }));
  INFO.logs.forEach((l) => log(l.msg));
  $('bMode').textContent = MODE === 'sim' ? 'โหมดจำลอง (ไม่มีฮาร์ดแวร์)' : 'เชื่อมต่อ Arduino Mega (USB)';
  $('bMode').className = 'badge ' + (MODE === 'sim' ? 'warn' : 'ok');
  if (MODE !== 'sim') { document.querySelectorAll('.sim').forEach((e) => e.style.display = 'none'); }
  else $('simOnlyNote').textContent = 'ค่าปริมาณมาจากตัวจำลอง (เครื่องจริงรู้แค่ 3 จุดจากเซนเซอร์ระดับ) · ขนาดเม็ดจากปริมาตรหยด 0.02 mL × หด 0.8';
  for (const [id, url] of [['docE', '/doc/electrical_check.md'], ['docF', '/doc/feasibility.md']]) {
    try { const r = await fetch(url); $(id).textContent = r.ok ? await r.text() : 'ไม่พบไฟล์'; } catch (e) {}
  }
  BATCHES = await (await fetch('/api/batches')).json(); renderBatches();
  connect(); drawAll();
  const h = location.hash.slice(1); if (h) { const b = document.querySelector(`#tabs button[data-t="${h}"]`); if (b) b.click(); }
})();

// ------------------------------------------------------------------ documents: BOM table from 09_bom/bom.csv
function parseCSV(t) {
  const rows = [], re = /("([^"]|"")*"|[^,\r\n]*)(,|\r?\n|$)/g; let row = [], m;
  t = t.replace(/^\ufeff/, '');
  while ((m = re.exec(t)) && m[0] !== '') {
    row.push(m[1].startsWith('"') ? m[1].slice(1, -1).replace(/""/g, '"') : m[1]);
    if (m[3] !== ',') { rows.push(row); row = []; }
  }
  return rows;
}
(async () => {
  try {
    const r = await fetch('/doc/bom.csv'); if (!r.ok) return;
    const [head, ...rows] = parseCSV(await r.text()); const H = (k) => head.indexOf(k);
    const data = rows.filter((x) => x.length > 5 && x[H('Item')]);
    const buy = data.filter((x) => x[H('Status')] !== 'have'), total = buy.reduce((a, x) => a + (+x[H('Total THB')] || 0), 0);
    $('bomTotal').textContent = `ต้องซื้อ ≈ ${total.toLocaleString()} บาท · ${data.length} รายการ`;
    const groups = [...new Set(data.map((x) => x[H('Group')]))]; let cur = 'ทั้งหมด';
    const draw = () => {
      const d = cur === 'ทั้งหมด' ? data : data.filter((x) => x[H('Group')] === cur);
      $('bomTbl').innerHTML = '<tr><th>รายการ</th><th>สเปก</th><th>จำนวน</th><th>รวม (บาท)</th><th>ซื้อ</th></tr>' +
        d.map((x) => `<tr><td>${x[H('Item')]}</td><td class="spec">${x[H('Spec')]}</td><td>${x[H('Qty')]}</td><td>${(+x[H('Total THB')] || 0).toLocaleString()}</td>` +
          `<td>${x[H('Status')] === 'have' ? '<span class="pill">มีแล้ว ✓</span>' : x[H('Shopee')] ? `<a href="${x[H('Shopee')]}" target="_blank">Shopee</a>` : ''}</td></tr>`).join('') +
        `<tr class="sum"><td colspan="3">ต้องซื้อ${cur === 'ทั้งหมด' ? '' : ' (' + cur + ')'}</td><td>${d.filter((x) => x[H('Status')] !== 'have').reduce((a, x) => a + (+x[H('Total THB')] || 0), 0).toLocaleString()}</td><td></td></tr>`;
      $('bomFilter').innerHTML = ['ทั้งหมด', ...groups].map((g) => `<button class="mini ${g === cur ? 'on' : 'ghost'}" data-g="${g}">${g}</button>`).join('');
      $('bomFilter').querySelectorAll('button').forEach((b) => b.onclick = () => { cur = b.dataset.g; draw(); });
    };
    draw();
  } catch (e) {}
})();

