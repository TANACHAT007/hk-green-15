// Virtual 7" screen: the real ESP32 LVGL UI (display/hk_display.wasm) on a <canvas>, bridged to the machine status.
// HKScreen.mount(canvas, sendCmd) → Promise<{ rig(m) }>.  sendCmd({cmd:'start'|'stop'|'reset'|'set'|'test', ...}).
window.HKScreen = (function () {
  const OUTK = ['peri', 'auger', 'bio', 'top', 'ch', 'rinse', 'valve', 'servo'];
  const PK = ['dose_g', 'biochar_pct', 'dissolve_min', 'drip_min', 'set_min', 'ph_target', 'rinse_max', 'peri_duty', 'top_stir_duty', 'chamber_stir_duty', 'auger_g_per_rev', 'bio_g_per_rev', 'ph_v7', 'ph_slope'];
  const pLine = (p) => 'P:' + PK.filter((k) => p[k] !== undefined).map((k) => k + '=' + p[k]).join(';');
  function load() {
    return window.HKDisplay ? Promise.resolve() : new Promise((ok, bad) => {
      const s = document.createElement('script'); s.src = 'display/hk_display.js'; s.onload = ok; s.onerror = bad; document.body.appendChild(s); });
  }
  async function mount(canvas, sendCmd) {
    let last = null, lastP = 0;
    const onSend = (line) => {
      const [k, v] = line.split(/:(.*)/s);
      if (line === 'START') sendCmd({ cmd: 'start' }); else if (line === 'STOP') sendCmd({ cmd: 'stop' }); else if (line === 'RESET') sendCmd({ cmd: 'reset' });
      else if (line === 'GET') { if (last && last.p) feed(pLine(last.p)); }
      else if (k === 'SET') { const [key, val] = v.split('='); sendCmd({ cmd: 'set', key, val: +val }); }
      else if (k === 'TEST') { const [out, val] = v.split('='); sendCmd({ cmd: 'test', out, val: +val }); }
    };
    await load();
    const mod = await window.HKDisplay({ canvas, keyboardListeningElement: canvas, onSend, locateFile: (f) => 'display/' + f });
    const feed = (l) => mod.ccall('hk_web_feed', null, ['string'], [l]);
    const ptr = (e) => { const r = canvas.getBoundingClientRect(), up = e.type === 'pointerup' || e.type === 'pointercancel';
      mod.ccall('hk_web_pointer', null, ['number', 'number', 'number'], [Math.round((e.clientX - r.left) * 800 / r.width), Math.round((e.clientY - r.top) * 480 / r.height),
        up ? 0 : e.type === 'pointerdown' || (e.buttons & 1) || e.pointerType === 'touch' ? 1 : 0]); };
    ['pointerdown', 'pointermove', 'pointerup', 'pointercancel'].forEach((t) => canvas.addEventListener(t, (e) => {
      if (t === 'pointerdown') canvas.setPointerCapture(e.pointerId); ptr(e); e.preventDefault(); }));
    return {
      rig(m) {
        last = m; const o = m.out || {}, lv = m.lvl || [1, 1, 0];
        feed(`STATE:${m.state};LEFT_S:${m.left_s || 0};STEP_S:${m.step_s || 0};PH:${(m.ph ?? 7).toFixed(2)};PHV:${(m.ph_v ?? 2.5).toFixed(3)};RINSE:${m.rinse || 0};` +
             `ESTOP:${m.estop ? 1 : 0};TEST:${m.test ? 1 : 0};ALARM:${m.alarm || 0};LVL:${lv.join(',')};OUT:${OUTK.map((k) => +(o[k] || 0)).join(',')}`);
        if (m.p && Date.now() - lastP > 5000) { lastP = Date.now(); feed(pLine(m.p)); }
      },
    };
  }
  return { mount };
})();
