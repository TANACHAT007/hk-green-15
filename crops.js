// "เลือกสูตรตามพืช" — pick a crop, soil, place and watering → biochar %, how much dry beads per plant/pot and
// how many plants one machine batch covers. Rules are a transparent starting point distilled from published ranges
// (hydrogel 0.5–5 g/kg soil, more is not better; trees 20–200 g; biochar helps sandy soil most, high rates can hurt clay;
// biochar is alkaline → low for acid-loving crops). The team should confirm with its own pot trial (Results tab).
// HKCrops.mount(el, { onSend(biocharPct) })  — onSend only on the dashboard (sends the recipe to the machine).
window.HKCrops = (function () {
  const BATCH_G = 38;        // dry beads per batch ≈ 30 g chitosan + 10.6 g biochar, ~95 % kept (weigh yours: Results tab)
  const CROPS = [
    { id: 'leafy', e: '🥬', th: 'ผักกินใบ', en: 'Leafy vegetables', ex: 'คะน้า ผักบุ้ง ผักกาด สลัด', exe: 'kale, morning glory, lettuce', pot: 2, field: 2, unit: 'plant' },
    { id: 'fruitveg', e: '🍅', th: 'ผักกินผล', en: 'Fruiting vegetables', ex: 'พริก มะเขือเทศ แตงกวา มะเขือ', exe: 'chili, tomato, cucumber, eggplant', pot: 2, field: 6, unit: 'plant' },
    { id: 'herb', e: '🌿', th: 'สมุนไพร / ผักสวนครัว', en: 'Herbs', ex: 'กะเพรา โหระพา ตะไคร้ ข่า', exe: 'holy basil, basil, lemongrass', pot: 2, field: 3, unit: 'plant' },
    { id: 'treeNew', e: '🌱', th: 'ไม้ผลปลูกใหม่', en: 'Young fruit trees', ex: 'มะม่วง มะนาว ฝรั่ง ลำไย (ต่อหลุม)', exe: 'mango, lime, guava, longan (per hole)', pot: 2, field: 30, unit: 'hole' },
    { id: 'treeOld', e: '🥭', th: 'ไม้ผลให้ผลแล้ว', en: 'Bearing fruit trees', ex: 'มะม่วง ทุเรียน มังคุด (รอบทรงพุ่ม)', exe: 'mango, durian, mangosteen (around the canopy)', pot: 2, field: 150, unit: 'tree' },
    { id: 'acid', e: '🍓', th: 'พืชชอบดินเปรี้ยว', en: 'Acid-loving crops', ex: 'สตรอว์เบอร์รี บลูเบอร์รี สับปะรด', exe: 'strawberry, blueberry, pineapple', pot: 2, field: 4, unit: 'plant', acid: true },
    { id: 'flower', e: '🌸', th: 'ไม้ดอก / ไม้กระถาง', en: 'Flowers & pot plants', ex: 'ดาวเรือง กุหลาบ ไม้ใบ', exe: 'marigold, rose, foliage plants', pot: 2, field: 4, unit: 'plant' },
    { id: 'seedling', e: '🪴', th: 'เพาะกล้า / ถาดหลุม', en: 'Seedlings & trays', ex: 'ผสมในวัสดุเพาะ', exe: 'mixed into the potting mix', pot: 1, field: 1, unit: 'litre', mixOnly: true },
    { id: 'fieldcrop', e: '🌽', th: 'พืชไร่', en: 'Field crops', ex: 'ข้าวโพด มันสำปะหลัง อ้อย', exe: 'maize, cassava, sugarcane', pot: 2, field: 3, unit: 'plant' },
    { id: 'succulent', e: '🌵', th: 'กระบองเพชร / ไม้อวบน้ำ', en: 'Cacti & succulents', no: 'ไม่แนะนำ: พืชกลุ่มนี้ต้องการดินระบายน้ำเร็ว เม็ดเจลจะทำให้รากแฉะและเน่าได้', noe: 'Not recommended: they need fast-draining soil; gel beads keep roots wet and can cause rot' },
    { id: 'rice', e: '🌾', th: 'ข้าวนาน้ำขัง', en: 'Paddy rice', no: 'ไม่จำเป็น: นาน้ำขังมีน้ำท่วมอยู่แล้ว เม็ดเจลไม่ช่วยเก็บน้ำ', noe: 'Not needed: flooded paddies already hold water' },
  ];
  const SOILS = [{ id: 'sand', e: '🏖️', th: 'ดินทราย', en: 'Sandy', k: 1.5, bio: 3 }, { id: 'loam', e: '🟫', th: 'ดินร่วน', en: 'Loam', k: 1, bio: 2 },
                 { id: 'clay', e: '🧱', th: 'ดินเหนียว', en: 'Clay', k: 0.6, bio: 1 }];
  const WATER = [{ id: 'daily', th: 'รดทุกวัน', en: 'Daily', k: 0.8 }, { id: 'few', th: '2–3 วันครั้ง', en: 'Every 2–3 days', k: 1 }, { id: 'rain', th: 'พึ่งฝน', en: 'Rain only', k: 1.25 }];
  const PICS = window.HK_CROP_PICS || [];                    // ids that have a picture in img/crops (ChatGPT-made); emoji otherwise
  const IMG = (id) => `img/crops/${id}.png`;

  function mount(el, opt = {}) {
    const st = { crop: 'fruitveg', soil: 'loam', place: 'field', potL: 10, water: 'few', n: 20 };
    try { Object.assign(st, JSON.parse(localStorage.getItem('hk15_crop') || '{}')); } catch (e) {}
    const en = () => (window.LANG || (() => { try { return localStorage.getItem('hk15_lang'); } catch (e) { return 'th'; } })()) === 'en';
    const T = (th, eng) => (en() ? eng : th);
    function calc() {
      const c = CROPS.find((x) => x.id === st.crop), s = SOILS.find((x) => x.id === st.soil), w = WATER.find((x) => x.id === st.water);
      if (c.no) return { c, no: T(c.no, c.noe) };
      let bio = s.bio; if (c.acid) bio = Math.min(bio, 1);
      const pot = st.place === 'pot' || c.mixOnly;
      const soilKg = c.mixOnly ? st.potL * 0.5 : st.potL * 1.2;           // potting mix ≈ 0.5 kg/L, garden soil ≈ 1.2 kg/L
      let g = pot ? c.pot * soilKg : c.field;                               // g dry beads per pot / plant / hole / tree
      g = Math.max(0.5, Math.round(g * s.k * w.k * 2) / 2);
      const bg = Math.round((30 + 5.3 * bio) * 0.95);                     // dry beads of one batch at this biochar %
      const per = Math.max(1, Math.floor(bg / g)), batches = Math.ceil(st.n * g / bg);
      return { c, s, bio, g, pot, per, batches, total: st.n * g, bg };
    }
    function unitTxt(r) {
      if (r.pot) return r.c.mixOnly ? T(`ต่อวัสดุเพาะ ${st.potL} ลิตร`, `per ${st.potL} L of potting mix`) : T(`ต่อกระถาง ${st.potL} ลิตร`, `per ${st.potL} L pot`);
      return { plant: T('ต่อต้น', 'per plant'), hole: T('ต่อหลุมปลูก', 'per planting hole'), tree: T('ต่อต้น (รอบทรงพุ่ม)', 'per tree (under the canopy)') }[r.c.unit];
    }
    function render() {
      const r = calc(), card = (x, on, grp) => `<button class="cc ${on ? 'on' : ''}" data-g="${grp}" data-v="${x.id}"><span class="ci">${PICS.includes(x.id) ? `<img src="${IMG(x.id)}" alt="">` : ""}<b>${x.e}</b></span><span>${T(x.th, x.en)}</span>${x.ex ? `<small>${T(x.ex, x.exe)}</small>` : ''}</button>`;
      const chip = (x, on, grp) => `<button class="cp ${on ? 'on' : ''}" data-g="${grp}" data-v="${x.id}">${x.e ? x.e + ' ' : ''}${T(x.th, x.en)}</button>`;
      el.innerHTML = `<div class="crops">
        <div class="cq">${T('1. ปลูกอะไร', '1. What are you growing?')}</div>
        <div class="cgrid">${CROPS.map((x) => card(x, x.id === st.crop, 'crop')).join('')}</div>
        <div class="crow"><div><div class="cq">${T('2. ดินแบบไหน', '2. Soil')}</div>${SOILS.map((x) => chip(x, x.id === st.soil, 'soil')).join('')}</div>
          <div><div class="cq">${T('3. ปลูกที่ไหน', '3. Where')}</div>${chip({ id: 'field', e: '🌍', th: 'ลงดิน / แปลง', en: 'In the ground' }, st.place === 'field', 'place')}${chip({ id: 'pot', e: '🪴', th: 'กระถาง', en: 'Pot' }, st.place === 'pot', 'place')}
            ${st.place === 'pot' || calc().c.mixOnly ? `<label class="cl">${T('ขนาด (ลิตร)', 'Size (L)')} <input type="number" min="1" max="200" value="${st.potL}" data-i="potL"></label>` : ''}</div>
          <div><div class="cq">${T('4. รดน้ำ', '4. Watering')}</div>${WATER.map((x) => chip(x, x.id === st.water, 'water')).join('')}</div>
          <div><div class="cq">${T('5. จำนวน', '5. How many')}</div><label class="cl"><input type="number" min="1" max="100000" value="${st.n}" data-i="n"> ${T(r.pot ? 'กระถาง' : 'ต้น', r.pot ? 'pots' : 'plants')}</label></div></div>
        <div class="cres ${r.no ? 'no' : ''}">${r.no ? `<div class="cbig">🚫</div><p>${r.no}</p>` : `
          <div class="ck"><small>${T('สูตรไบโอชาร์', 'Biochar')}</small><b>${r.bio} %</b><span>${T('ของน้ำหนักกรด + ไคโตซาน', 'of acid + chitosan weight')} · ≈ ${(5.3 * r.bio).toFixed(1)} g/${T('รอบ', 'batch')}</span></div>
          <div class="ck"><small>${T('ใช้เม็ดแห้ง', 'Dry beads')}</small><b>${r.g} g</b><span>${unitTxt(r)}</span></div>
          <div class="ck"><small>${T('1 รอบผลิตใช้ได้', 'One batch covers')}</small><b>${r.per}</b><span>${T(r.pot ? 'กระถาง' : 'ต้น', r.pot ? 'pots' : 'plants')} (≈ ${r.bg} g)</span></div>
          <div class="ck"><small>${T(`สำหรับ ${st.n} ${r.pot ? 'กระถาง' : 'ต้น'}`, `For ${st.n} ${r.pot ? 'pots' : 'plants'}`)}</small><b>${r.batches}</b><span>${T('รอบผลิต', 'batches')} · ${Math.round(r.total)} g</span></div>
          <ul class="chow">${(r.pot ? [T('แช่เม็ดแห้งในน้ำ 1 ชม. ให้พองก่อน', 'Soak the dry beads in water for 1 h first'), T('คลุกให้ทั่วกับดินช่วงกลางกระถาง ไม่โรยบนผิวดิน', 'Mix evenly into the middle of the pot, not on the surface')]
            : r.c.unit === 'tree' ? [T('ขุดร่องลึก 15–20 ซม. รอบแนวทรงพุ่ม', 'Dig a 15–20 cm trench along the canopy edge'), T('โรยเม็ดที่แช่น้ำแล้วในร่อง กลบดิน รดน้ำตาม', 'Spread the soaked beads in it, cover and water')]
            : [T('แช่เม็ดในน้ำ 1 ชม. ให้พองก่อน', 'Soak the beads for 1 h'), T('คลุกกับดินในหลุมปลูก/โคนต้น ลึก 10–20 ซม.', 'Mix into the planting hole / root zone, 10–20 cm deep'), T('ไม่ใส่เกินคำแนะนำ: มากไปรากแฉะ ดินเค็มขึ้น', 'Do not overdose: too much keeps roots wet and raises salinity')])
            .map((x) => `<li>${x}</li>`).join('')}</ul>
          ${opt.onSend ? `<button class="b green csend">${T(`ส่งสูตรไบโอชาร์ ${r.bio} % ไปเครื่อง`, `Send biochar ${r.bio} % to the machine`)}</button>` : ''}`}
        </div>
        <p class="cnote">${T('ค่าเริ่มต้นจากช่วงในงานวิจัยไฮโดรเจลและไบโอชาร์ (ไฮโดรเจล 0.5–5 g ต่อดิน 1 kg, ไม้ผล 20–200 g ต่อต้น, ไบโอชาร์ช่วยดินทรายมากที่สุด) ยังไม่ใช่ผลทดสอบของเม็ดรุ่นนี้ ควรทดลองปลูกเทียบกับไม่ใส่ แล้วบันทึกในแท็บผลทดลอง',
          'Starting points from published hydrogel/biochar ranges (hydrogel 0.5–5 g per kg soil, fruit trees 20–200 g per tree, biochar helps sandy soil most) — not yet tested with these beads. Run a pot trial against a control and log it in the Results tab.')}</p>
      </div>`;
      el.querySelectorAll('[data-g]').forEach((b) => b.onclick = () => { st[b.dataset.g] = b.dataset.v; save(); render(); });
      el.querySelectorAll('[data-i]').forEach((i) => i.onchange = () => { st[i.dataset.i] = Math.max(1, +i.value || 1); save(); render(); });
      const sb = el.querySelector('.csend'); if (sb) sb.onclick = () => opt.onSend(r.bio);
    }
    const save = () => { try { localStorage.setItem('hk15_crop', JSON.stringify(st)); } catch (e) {} };
    window.addEventListener('hklang', render);
    window.HKCrops.calc = () => { const r = calc(); return { g: r.g || 0, label: T(r.c.th, r.c.en) + ' · ' + T(SOILS.find((x) => x.id === st.soil).th, SOILS.find((x) => x.id === st.soil).en) }; };
    render();
  }
  return { mount };
})();
