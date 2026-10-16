// Plant trial: design a pot experiment (control / ½ / recommended / 2× dose of beads, n replicate pots), print pot
// labels, log weekly measurements, and compare treatments (mean ± SD plant height, days to wilting). Kept in this browser.
// HKTrial.mount(el)  — uses HKCrops.calc() for the recommended dose.
window.HKTrial = (function () {
  const KEY = 'hk15_trial';
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch (e) { return null; } };
  const save = (t) => { try { localStorage.setItem(KEY, JSON.stringify(t)); } catch (e) {} };
  const en = () => (window.LANG || (() => { try { return localStorage.getItem('hk15_lang'); } catch (e) { return 'th'; } })()) === 'en';
  const T = (th, e) => (en() ? e : th);
  const COL = ['#9aa0b8', '#5b8cff', '#10b981', '#8b5cf6'];
  const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : NaN);
  const sd = (a) => { if (a.length < 2) return 0; const m = mean(a); return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1)); };

  function mount(el) {
    let tr = load();
    function create() {
      const rec = window.HKCrops && HKCrops.calc ? HKCrops.calc() : { g: 6, crop: 'fruitveg', label: '' };
      const reps = Math.max(2, Math.min(10, +el.querySelector('[data-k=reps]').value || 4));
      const g = +el.querySelector('[data-k=g]').value || rec.g;
      const doses = [0, g / 2, g, g * 2].map((x) => Math.round(x * 10) / 10);
      tr = { started: new Date().toISOString().slice(0, 10), crop: rec.label, doses, reps, pots: [], log: [] };
      doses.forEach((d, i) => { for (let r = 1; r <= reps; r++) tr.pots.push({ id: `T${i}-${r}`, t: i, dose: d }); });
      save(tr); render();
    }
    function chart(cv) {
      const g = cv.getContext('2d'), w = cv.width = cv.clientWidth * 2, h = cv.height = 440, pad = 60;
      g.clearRect(0, 0, w, h); g.font = '22px Anuphan, sans-serif';
      const weeks = [...new Set(tr.log.map((x) => x.week))].sort((a, b) => a - b); if (!weeks.length) { g.fillStyle = '#999'; g.fillText(T('ยังไม่มีข้อมูล', 'no data yet'), pad, h / 2); return; }
      const ser = tr.doses.map((_, t) => weeks.map((wk) => mean(tr.log.filter((x) => x.week === wk && tr.pots.find((p) => p.id === x.pot).t === t && x.h > 0).map((x) => x.h))));
      const ymax = Math.max(10, ...ser.flat().filter((x) => !isNaN(x))) * 1.15, X = (i) => pad + (w - pad * 2.6) * (weeks.length < 2 ? 0.5 : i / (weeks.length - 1)), Y = (v) => h - pad - (h - pad * 1.6) * v / ymax;
      g.strokeStyle = '#ddd'; g.fillStyle = '#888'; for (let v = 0; v <= ymax; v += Math.ceil(ymax / 5)) { g.beginPath(); g.moveTo(pad, Y(v)); g.lineTo(w - pad / 2, Y(v)); g.stroke(); g.fillText(v, 8, Y(v) + 7); }
      weeks.forEach((wk, i) => g.fillText(T('สัปดาห์ ', 'wk ') + wk, X(i) - 30, h - pad / 2.5));
      ser.forEach((s, t) => { g.strokeStyle = g.fillStyle = COL[t]; g.lineWidth = 5; g.beginPath(); let first = true;
        s.forEach((v, i) => { if (isNaN(v)) return; first ? g.moveTo(X(i), Y(v)) : g.lineTo(X(i), Y(v)); first = false; }); g.stroke();
        s.forEach((v, i) => { if (!isNaN(v)) { g.beginPath(); g.arc(X(i), Y(v), 8, 0, 7); g.fill(); } }); });
      g.lineWidth = 1; g.fillStyle = '#666'; g.fillText(T('ความสูงเฉลี่ย (ซม.)', 'mean height (cm)'), pad, 26);
    }
    function render() {
      if (!tr) {
        const rec = window.HKCrops && HKCrops.calc ? HKCrops.calc() : { g: 6, label: '' };
        el.innerHTML = `<div class="tr0"><p>${T('วางแผนปลูกเปรียบเทียบเพื่อยืนยันว่าเม็ดช่วยจริง และหาปริมาณที่ดีที่สุด: 4 กลุ่ม (ไม่ใส่ · ครึ่งหนึ่ง · ตามคำแนะนำ · สองเท่า) กลุ่มละหลายกระถาง ดินและการรดน้ำเหมือนกันทุกกระถาง',
          'Plan a side-by-side pot trial to prove the beads help and find the best amount: 4 groups (none · half · recommended · double), several pots each, same soil and watering everywhere.')}</p>
          <div class="trf"><label>${T('พืช (จากเครื่องมือเลือกสูตร)', 'Crop (from the recipe tool)')}<b>${rec.label || '—'}</b></label>
          <label>${T('ปริมาณที่แนะนำ (g/กระถาง)', 'Recommended (g/pot)')}<input data-k="g" type="number" step="0.5" value="${rec.g}"></label>
          <label>${T('กระถางต่อกลุ่ม', 'Pots per group')}<input data-k="reps" type="number" min="2" max="10" value="4"></label>
          <button class="b green" data-a="new">${T('สร้างแผนการทดลอง', 'Create the trial')}</button></div></div>`;
        el.querySelector('[data-a=new]').onclick = create; return;
      }
      const nT = tr.doses.length, lastWeek = Math.max(0, ...tr.log.map((x) => x.week));
      const names = [T('ไม่ใส่ (ควบคุม)', 'None (control)'), T('ครึ่งหนึ่ง', 'Half'), T('ตามคำแนะนำ', 'Recommended'), T('สองเท่า', 'Double')];
      const sumRows = tr.doses.map((d, t) => { const ids = tr.pots.filter((p) => p.t === t).map((p) => p.id);
        const hs = tr.log.filter((x) => x.week === lastWeek && ids.includes(x.pot) && x.h > 0).map((x) => x.h);
        const wl = tr.log.filter((x) => ids.includes(x.pot) && x.wilt > 0).map((x) => x.wilt);
        return `<tr><td><i class="dot" style="background:${COL[t]}"></i>${names[t]}</td><td>${d} g</td><td>${hs.length ? mean(hs).toFixed(1) + ' ± ' + sd(hs).toFixed(1) : '—'}</td><td>${wl.length ? mean(wl).toFixed(1) : '—'}</td></tr>`; }).join('');
      el.innerHTML = `<div class="trhead"><b>${tr.crop || T('การทดลองปลูก', 'Pot trial')}</b><span>${T('เริ่ม', 'started')} ${tr.started} · ${nT} ${T('กลุ่ม', 'groups')} × ${tr.reps} ${T('กระถาง', 'pots')}</span>
          <button class="mini ghost" data-a="print">🖨️ ${T('พิมพ์ป้ายกระถาง', 'Print pot labels')}</button><button class="mini ghost" data-a="csv">⬇ CSV</button><button class="mini ghost" data-a="reset">${T('เริ่มใหม่', 'New trial')}</button></div>
        <canvas class="trc"></canvas>
        <div class="tblwrap"><table><tr><th>${T('กลุ่ม', 'Group')}</th><th>${T('เม็ด/กระถาง', 'Beads/pot')}</th><th>${T('สูงเฉลี่ย สัปดาห์ล่าสุด (ซม.)', 'Mean height, latest week (cm)')}</th><th>${T('เหี่ยวหลังงดน้ำ (วัน)', 'Days to wilt without water')}</th></tr>${sumRows}</table></div>
        <div class="trlog"><b>${T('บันทึกสัปดาห์ที่', 'Log week')}</b> <input data-k="wk" type="number" min="0" value="${lastWeek + (tr.log.length ? 1 : 0)}" style="width:70px">
          <div class="trgrid">${tr.pots.map((p) => `<label style="border-color:${COL[p.t]}">${p.id}<input data-p="${p.id}" type="number" step="0.1" placeholder="${T('ซม.', 'cm')}"></label>`).join('')}</div>
          <label class="trw">${T('ทดสอบงดน้ำ (ถ้าทำ): จำนวนวันจนเริ่มเหี่ยว ใส่ในช่องเดียวกันแล้วติ๊ก', 'Drought test (optional): days until wilting — enter in the same boxes and tick')} <input type="checkbox" data-k="wilt"></label>
          <button class="b green" data-a="save" style="justify-self:start">${T('บันทึก', 'Save')}</button></div>`;
      chart(el.querySelector('.trc'));
      const q = (s) => el.querySelector(s);
      q('[data-a=save]').onclick = () => { const wk = +q('[data-k=wk]').value || 0, wilt = q('[data-k=wilt]').checked;
        el.querySelectorAll('[data-p]').forEach((i) => { if (i.value === '') return; const v = +i.value;
          tr.log = tr.log.filter((x) => !(x.pot === i.dataset.p && x.week === wk && !!x.wilt === wilt));
          tr.log.push(wilt ? { pot: i.dataset.p, week: wk, wilt: v } : { pot: i.dataset.p, week: wk, h: v }); });
        save(tr); render(); };
      q('[data-a=reset]').onclick = () => { if (confirm(T('ลบแผนและข้อมูลการทดลองนี้?', 'Delete this trial and its data?'))) { tr = null; localStorage.removeItem(KEY); render(); } };
      q('[data-a=csv]').onclick = () => { const rows = ['pot,group,dose_g,week,height_cm,days_to_wilt'].concat(tr.log.map((x) => { const p = tr.pots.find((y) => y.id === x.pot); return [x.pot, names[p.t], p.dose, x.week, x.h ?? '', x.wilt ?? ''].join(','); }));
        const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + rows.join('\r\n')], { type: 'text/csv' })); a.download = 'plant_trial.csv'; a.click(); };
      q('[data-a=print]').onclick = () => { const w = window.open('', '_blank');
        w.document.write(`<html><head><meta charset="utf-8"><title>labels</title><style>body{font-family:Anuphan,sans-serif;display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:10px}
          div{border:2px dashed #999;border-radius:10px;padding:10px;text-align:center}b{font-size:28px;display:block}</style></head><body>` +
          tr.pots.map((p) => `<div style="border-color:${COL[p.t]}"><b>${p.id}</b>${names[p.t]}<br>${T('เม็ด', 'beads')} ${p.dose} g</div>`).join('') + '<script>print()<\/script></body></html>'); w.document.close(); };
    }
    window.addEventListener('hklang', render);
    render();
  }
  return { mount };
})();
