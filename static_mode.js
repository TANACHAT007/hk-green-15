// Static mode (GitHub Pages, no server.py): the simulator from server.py runs here in the browser and
// stands in for /events, /api/* and /doc/*. Batches are kept in this browser's localStorage.
// Loaded before app.js; does nothing when server.py answers /api/info.
(function () {
  if (!window.HK_STATIC) return;
  const SOL_ML = 500, NEEDLES = 12, DROP_ML = 0.020, SHRINK = 0.80;
  const beadD = () => Math.cbrt(6 * DROP_ML * 1000 / Math.PI) * SHRINK;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const gauss = (s) => s * Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());
  const listeners = [], logs = [], history = [];
  const emit = (m) => { const e = { data: JSON.stringify(m) };
    if (m.t === 'log') logs.push(m.msg);
    if (m.t === 'rig') history.push({ ts: Date.now() / 1000, ms: m.ms, state: m.state, ph: m.ph, peri: m.out.peri, top: m.out.top, ch: m.out.ch, rinse: m.out.rinse, beads: m.sim_beads });
    if (history.length > 1200) history.shift();
    listeners.forEach((l) => l.onmessage && l.onmessage(e)); };

  const P = { dose_g: 30.0, biochar_pct: 2.0, bio_g_per_rev: 0.09, bio_rpm: 30, auger_g_per_rev: 0.89, auger_rpm: 30, dissolve_min: 120, drip_min: 40, peri_duty: 140,
    set_min: 360, chamber_stir_duty: 90, top_stir_duty: 200, drain_s: 60, rinse_spray_s: 20, rinse_drain_s: 40,
    ph_target: 7.5, rinse_max: 12, servo_home: 10, servo_dump: 120, dump_hold_s: 5, ph_v7: 2.50, ph_slope: 0.18 };
  const O = { peri: 0, auger: 0, bio: 0, top: 0, ch: 0, rinse: 0, valve: 0, servo: 10 };
  const S = { speed: 60, st: 'IDLE', t_step: 0, len: 0, t: 0, rinse: 0, estop: false, test: false, powder: 0, biochar: 0, dissolved: 0,
    acid: 0, dripped: 0, beads: 0, oh: 1e-7, ph: 7, true_k: rnd(0.10, 0.16), flow_k: rnd(0.92, 1.08) };
  const chitS = () => P.dose_g / P.auger_g_per_rev / P.auger_rpm * 60, bioS = () => P.dose_g * P.biochar_pct / 100 / P.bio_g_per_rev / P.bio_rpm * 60;
  const doseS = () => Math.max(chitS(), bioS());
  const periMl = (d) => Math.max(0, (d - 30) / 110 * 12.5) * S.flow_k;
  const allOff = () => Object.assign(O, { peri: 0, auger: 0, bio: 0, top: 0, ch: 0, rinse: 0, valve: 0 });
  const top = (d) => { O.top = d > 0 && d < 128 ? 128 : Math.trunc(d); };

  function enter(s, len) {
    S.st = s; S.t_step = S.t; S.len = len; emit({ t: 'log', msg: '-> ' + s });
    if (s === 'DOSE') { top(P.top_stir_duty); O.auger = 255; O.bio = bioS() > 0 ? 255 : 0; Object.assign(S, { biochar: 0, powder: 0, dissolved: 0, acid: SOL_ML, dripped: 0, beads: 0, oh: 1e-7, ph: 7 }); }
    else if (s === 'DISSOLVE') { O.auger = 0; O.bio = 0; top(P.top_stir_duty); }
    else if (s === 'DRIP') { top(P.top_stir_duty / 2); O.ch = P.chamber_stir_duty; O.peri = P.peri_duty; }
    else if (s === 'SET') { O.peri = 0; top(0); O.ch = Math.floor(P.chamber_stir_duty / 2); }
    else if (s === 'DRAIN') { O.ch = 0; O.valve = 1; S.oh = 2.0 * rnd(0.15, 0.3); }
    else if (s === 'RINSE_SPRAY') { O.valve = 1; O.rinse = 255; }
    else if (s === 'RINSE_WAIT') { O.rinse = 0; S.oh *= S.true_k * rnd(0.9, 1.1); }
    else if (s === 'TILT') { O.valve = 0; O.servo = P.servo_dump; }
    else if (s === 'TILT_BACK') { O.servo = P.servo_home; }
    else { S.test = false; allOff(); O.servo = P.servo_home; }
  }
  function command(c) {
    const idle = S.st === 'IDLE' || S.st === 'DONE';
    if (c.cmd === 'start' && idle) enter('DOSE', doseS());
    else if (c.cmd === 'stop') enter('SAFE', 0);
    else if (c.cmd === 'reset' && S.st === 'SAFE' && !S.estop) enter('IDLE', 0);
    else if (c.cmd === 'set') { if (c.key in P) P[c.key] = +c.val; }
    else if (c.cmd === 'test' && idle && !S.estop) {
      const k = c.out, v = Math.trunc(+c.val || 0); S.test = true;
      if (k === 'off') { allOff(); O.servo = P.servo_home; S.test = false; }
      else if (k === 'top') top(v);
      else if (k in O) O[k] = Math.max(0, Math.min(k === 'servo' ? 180 : 255, v));
    } else if (c.cmd === 'sim') {
      if (c.op === 'estop') S.estop = !!c.val;
      else if (c.op === 'speed') S.speed = Math.max(1, Math.min(3600, +c.val || 60));
      else if (c.op === 'skip' && S.len > 0) S.t_step = S.t - S.len;
    }
  }
  function step(dt) {
    S.t += dt;
    if (S.estop && S.st !== 'SAFE') enter('SAFE', 0);
    if (S.st === 'DOSE') { if (S.t - S.t_step >= chitS()) O.auger = 0; if (S.t - S.t_step >= bioS()) O.bio = 0; }
    if (O.bio) S.biochar += P.bio_g_per_rev * P.bio_rpm / 60 * dt * (O.bio / 255);
    if (O.auger) S.powder = Math.min(P.dose_g * 1.3, S.powder + P.auger_g_per_rev * P.auger_rpm / 60 * dt * (O.auger / 255));
    if (O.top && S.powder > 0) { const tau = 35 * 60 * 255 / Math.max(O.top, 1); S.dissolved += (1 - S.dissolved) * (1 - Math.exp(-dt / tau)); }
    if (O.peri && S.acid > 0) { const dv = Math.min(S.acid, periMl(O.peri) / 60 * dt); S.acid -= dv; S.dripped += dv; S.beads = Math.trunc(S.dripped / DROP_ML); }
    if (S.oh > 1e-7) S.ph = 14 + Math.log10(S.oh);
    S.ph = Math.max(6.8, S.ph);
    const up = S.len > 0 && S.t - S.t_step >= S.len, st = S.st;
    if (st === 'DOSE' && up) enter('DISSOLVE', P.dissolve_min * 60);
    else if (st === 'DISSOLVE' && up) enter('DRIP', P.drip_min * 60);
    else if (st === 'DRIP' && up) enter('SET', P.set_min * 60);
    else if (st === 'SET' && up) { S.rinse = 0; enter('DRAIN', P.drain_s); }
    else if (st === 'DRAIN' && up) enter('RINSE_SPRAY', P.rinse_spray_s);
    else if (st === 'RINSE_SPRAY' && up) enter('RINSE_WAIT', P.rinse_drain_s);
    else if (st === 'RINSE_WAIT' && up) {
      S.rinse++; const ph = S.ph + gauss(0.05);
      emit({ t: 'log', msg: `pH after rinse ${S.rinse}: ${ph.toFixed(2)}` });
      if (ph <= P.ph_target || S.rinse >= P.rinse_max) enter('TILT', P.dump_hold_s); else enter('RINSE_SPRAY', P.rinse_spray_s);
    } else if (st === 'TILT' && up) enter('TILT_BACK', 2);
    else if (st === 'TILT_BACK' && up) enter('DONE', 0);
  }
  const r = (x, n) => Math.round(x * 10 ** n) / 10 ** n;
  let last = performance.now(), tStat = 0;
  setInterval(() => {
    const now = performance.now(), sim = (now - last) / 1000 * S.speed; last = now;
    const n = Math.max(1, Math.trunc(sim / 2)); for (let i = 0; i < n; i++) step(sim / n);
    if (now - tStat < 500) return; tStat = now;
    const ph = S.ph + gauss(0.02), left = ['IDLE', 'DONE', 'SAFE'].includes(S.st) ? 0 : Math.max(0, S.len - (S.t - S.t_step)), p = {};
    ['dose_g', 'biochar_pct', 'bio_g_per_rev', 'auger_g_per_rev', 'dissolve_min', 'drip_min', 'set_min', 'peri_duty', 'top_stir_duty', 'chamber_stir_duty', 'ph_target', 'rinse_max', 'ph_v7', 'ph_slope'].forEach((k) => p[k] = P[k]);
    emit({ t: 'rig', ms: Math.trunc(S.t * 1000), state: S.st, left_s: Math.trunc(left), step_s: Math.trunc(S.len), ph: r(ph, 2),
      ph_v: r(P.ph_v7 - (ph - 7) * P.ph_slope, 3), rinse: S.rinse, estop: +S.estop, test: +S.test, out: { ...O }, p, sim: true,
      speed: S.speed, sim_powder_g: r(S.powder, 1), sim_biochar_g: r(S.biochar, 2), sim_dissolved: r(S.dissolved, 3), sim_acid_ml: r(S.acid, 1),
      sim_dripped_ml: r(S.dripped, 1), sim_beads: S.beads, sim_flow_mlpm: r(periMl(O.peri), 2), sim_bead_d_mm: r(beadD(), 2) });
  }, 50);

  // ---- batches in localStorage
  const BK = 'hk15_batches';
  const loadB = () => { try { return JSON.parse(localStorage.getItem(BK)) || []; } catch (e) { return []; } };
  const saveB = (rows) => { try { localStorage.setItem(BK, JSON.stringify(rows)); } catch (e) {} };
  const FIELDS = ['id', 'time', 'biochar_pct', 'rep', 'dose_g', 'drip_min', 'beads_n', 'bead_d_mm', 'bead_d_sd', 'yield_wet_g', 'dry_g', 'swell_g', 'swelling_pct', 'final_ph', 'rinse_cycles', 'run_h', 'note'];
  const csv = (rows, f) => '﻿' + [f.join(',')].concat(rows.map((x) => f.map((k) => { const v = x[k] ?? ''; return /[",\n]/.test(v) ? `"${String(v).replace(/"/g, '""')}"` : v; }).join(','))).join('\r\n');
  const J = (o) => new Response(JSON.stringify(o), { headers: { 'Content-Type': 'application/json' } });

  const realFetch = window.fetch.bind(window);
  window.fetch = async (url, opt) => {
    const u = typeof url === 'string' ? url : url.url, path = u.replace(location.origin, '').split('?')[0];
    if (path === '/api/info') return J({ mode: 'sim', history: history.slice(-1200), logs: logs.slice(-60), bead_d_model_mm: r(beadD(), 2), needles: NEEDLES, sol_ml: SOL_ML });
    if (path === '/api/cmd') { command(JSON.parse(opt.body)); return J({ ok: true }); }
    if (path === '/api/batches') {
      let rows = loadB();
      if (opt && opt.method === 'POST') { const b = JSON.parse(opt.body);
        if (b.delete) rows = rows.filter((x) => x.id !== b.delete);
        else { b.id = Math.max(0, ...rows.map((x) => x.id || 0)) + 1; b.time = new Date().toLocaleString('sv-SE'); rows.push(b); }
        saveB(rows); }
      return J(rows);
    }
    if (path.startsWith('/doc/')) return realFetch('doc/' + path.slice(5));
    return realFetch(url, opt);
  };
  const dl = (name, text) => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv' })); a.download = name; a.click(); };
  document.addEventListener('click', (e) => { const a = e.target.closest('a[href^="/api/"]'); if (!a) return; e.preventDefault();
    if (a.getAttribute('href').startsWith('/api/batches.csv')) dl('batches.csv', csv(loadB(), FIELDS));
    else dl('history.csv', csv(history, ['ts', 'ms', 'state', 'ph', 'peri', 'top', 'ch', 'rinse', 'beads'])); });
  window.EventSource = function () { this.onmessage = null; this.onerror = null; listeners.push(this); };
})();
