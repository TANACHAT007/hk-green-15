// TH / EN for the dashboard. The app keeps writing Thai; this file swaps Thai phrases for English in every text node
// (and title / placeholder) — longest phrase first — and keeps doing it as the page updates (MutationObserver).
// Choice: ?lang=en or the button in the sidebar; remembered in localStorage (shared with the showcase page).
(function () {
  const EN = {
    // ---- shell / nav
    'เครื่องผลิตเม็ดไฮโดรเจล': 'Hydrogel bead machine', 'ภาพรวม': 'Overview', 'ควบคุม': 'Control', '3 มิติ': '3D', 'ผลทดลอง': 'Results',
    'ทดสอบ': 'Test', 'สอบเทียบ': 'Calibrate', 'เอกสาร': 'Docs', 'ไม่มีข้อมูล': 'no data', 'สลับโหมดสว่าง/มืด': 'Light / dark', '◐ ธีม': '◐ Theme',
    'โหมดจำลอง (ไม่มีฮาร์ดแวร์)': 'Simulation (no hardware)', 'เชื่อมต่อ Arduino Mega (USB)': 'Arduino Mega connected (USB)',
    'Mega เสมือน (เฟิร์มแวร์จริงใน QEMU)': 'Virtual Mega (real firmware in QEMU)', 'Mega: เชื่อมต่อ': 'Mega: connected',
    'Mega: ไม่มีข้อมูล > 3 วิ': 'Mega: no data > 3 s', 'เซิร์ฟเวอร์หลุด…': 'Server disconnected…',
    'E-STOP ถูกกด': 'E-STOP pressed', 'SAFE — รอรีเซ็ต': 'SAFE — waiting for reset', 'โหมดทดสอบอุปกรณ์': 'Bench-test mode', 'ปลอดภัย': 'Safe',
    '▶ เริ่มรอบผลิต': '▶ Start batch', '■ หยุด': '■ Stop', 'ดึง E-stop ขึ้นก่อน': 'Release the E-stop first', '↺ รีเซ็ต': '↺ Reset', 'คำสั่งไม่สำเร็จ: ': 'Command failed: ',
    // ---- states
    'รอสะเด็ด/วัด pH': 'Drain / pH check', 'หยุดฉุกเฉิน': 'Emergency stop', 'กวนละลาย': 'Dissolving', 'หยดเป็นเม็ด': 'Dripping beads', 'แช่ NaOH': 'Curing in NaOH',
    'ปล่อยน้ำ': 'Draining', 'สเปรย์ล้าง': 'Rinse spray', 'ป้อนผง': 'Dosing', 'เทถาด': 'Tipping tray', 'ถาดกลับ': 'Tray back', 'เสร็จแล้ว!': 'Done!',
    '😴 พร้อม': '😴 Ready', '🧪 วัด pH': '🧪 pH check', 'รอกดเริ่ม': 'waiting for start',
    'สกรูป้อนผงไคโตซาน+ไบโอชาร์ลงถังกรด ขณะพัดลมกวน': 'augers dose chitosan + biochar into the acid while it stirs',
    'กวนต่อเนื่องจนละลายเป็นเนื้อเดียว': 'stirring until fully dissolved', 'ปั๊มรีดท่อหยดสารละลายผ่านเข็ม 12 หัวลง 2 M NaOH — เกิดเม็ดเจล': 'peristaltic pump drips the solution through 12 needles into 2 M NaOH — gel beads form',
    'แช่ให้เกิดการเชื่อมขวาง (กวนเบา ๆ)': 'cross-linking (gentle stirring)', 'เปิดวาล์ว 1" ปล่อยเม็ด + NaOH ลงถาดกรอง': '1" valve opens: beads + NaOH onto the strainer',
    'สเปรย์น้ำล้างเม็ดบนถาดกรอง': 'spraying water over the beads', 'รอน้ำสะเด็ดแล้ววัด pH': 'draining, then measuring pH', 'เซอร์โวเทถาดลงถาดตาก': 'servo tips the basket onto the drying tray',
    'ถาดกลับตำแหน่งเดิม': 'basket returns', 'ครบรอบ — นำเม็ดไปตาก': 'batch complete — take the beads to dry', 'อุปกรณ์ทุกตัวหยุด — แก้ปัญหาแล้วกดรีเซ็ต': 'everything stopped — fix the problem, then reset',
    // ---- overview
    'ทั้งรอบ': 'of batch', 'เหลือในขั้นนี้': 'left in this step', 'เสร็จทั้งรอบอีก': 'batch done in', 'ล้างแล้ว': 'rinses', 'ต้องทำอะไรต่อ': 'What next',
    'pH น้ำล้าง': 'Rinse pH', '· หัววัด': '· probe', 'เม็ดเจล (ประมาณ)': 'Gel beads (approx.)', 'สารละลายในถังกรด': 'Solution in acid tank', '· ละลาย': '· dissolved',
    'อัตราหยด': 'Drip rate', 'ต่อเข็ม': 'per needle', 'อุปกรณ์': 'Equipment', 'ผังการทำงาน': 'Process diagram', 'pH ระหว่างล้าง': 'pH during rinsing', 'บันทึกระบบ': 'System log',
    'ค่าปริมาณมาจากตัวจำลอง (เครื่องจริงรู้แค่ 3 จุดจากเซนเซอร์ระดับ)': 'amounts come from the simulator (the real machine only knows 3 levels from its sensors)',
    'ค่าปริมาณมาจากตัวจำลอง — เครื่องจริงรู้แค่ 3 จุดจากเซนเซอร์ระดับ': 'amounts come from the simulator — the real machine only knows 3 levels from its sensors',
    'ขนาดเม็ดจากปริมาตรหยด 0.02 mL × หด 0.8': 'bead size from 0.02 mL drops × 0.8 shrink',
    'เตรียมวัตถุดิบให้ครบ แล้วกด ▶ เริ่มรอบผลิต': 'Fill all materials, then press ▶ Start batch', 'กำลังป้อนผง — ไม่ต้องทำอะไร': 'Dosing powder — nothing to do',
    'กวนให้ละลาย ~2 ชม. — รอได้เลย': 'Dissolving ~2 h — just wait', 'กำลังหยดเป็นเม็ด — ดูว่าหยดเป็นเม็ด ไม่เป็นสาย': 'Dripping — check it forms beads, not strings',
    'แช่ NaOH 6 ชม. — รอได้เลย': 'Curing in NaOH 6 h — just wait', 'ปล่อยน้ำ NaOH ลงถังทิ้ง': 'Draining NaOH to the waste tank', 'กำลังล้าง — รอ pH ลงถึงเป้า': 'Rinsing — waiting for pH to reach target',
    'เทเม็ดลงถาดตาก': 'Tipping beads onto the drying tray', 'ถาดกลับที่เดิม': 'Basket returning', 'เก็บเม็ดจากถาดตาก แล้วบันทึกผลในแท็บผลทดลอง': 'Collect the beads, then log the result in the Results tab',
    'ดึงปุ่ม E-stop ขึ้น แล้วกดรีเซ็ต': 'Release the E-stop, then press reset', 'แก้ปัญหาให้เรียบร้อย แล้วกด ↺ รีเซ็ต': 'Fix the problem, then press ↺ Reset',
    '🧴 กรดในถังผสมไม่พอ — เติมกรด 500 mL แล้วกดเริ่มใหม่': '🧴 Not enough acid — add 500 mL and start again', '🚰 น้ำล้างใกล้หมด — เติมน้ำ เครื่องจะล้างต่อเอง': '🚰 Rinse water low — refill and it carries on',
    '🗑️ ถังน้ำทิ้งเต็ม — เททิ้ง เครื่องจะปล่อยน้ำต่อเอง': '🗑️ Waste tank full — empty it and it carries on', 'เซนเซอร์ระดับ': 'Level sensors', 'ไม่เต็ม': 'not full', 'ต่ำ': 'low', 'เต็ม': 'full',
    '✨ เติมครบทุกอย่าง': '✨ Fill everything', '✨ เติมวัตถุดิบครบแล้ว': '✨ All materials filled', 'ถังน้ำทิ้งไม่เต็ม': 'Waste tank not full', 'กรด 1 M 500 mL': 'Acid 1 M 500 mL',
    'ผงไคโตซาน': 'Chitosan powder', 'ตัวอย่างล่าสุด →': 'Latest →', '⚠ เป็นสาย': '⚠ stringing', '✔ เป็นหยด': '✔ dripping',
    // ---- equipment / diagram
    'ปั๊มหยด (MDD10A ch1)': 'Drip pump (MDD10A ch1)', 'สกรูป้อนไคโตซาน (MDD10A ch2)': 'Chitosan auger (MDD10A ch2)', 'สกรูป้อนไบโอชาร์ (MOSFET #2)': 'Biochar auger (MOSFET #2)',
    'พัดลมกวนถังกรด (MDD3A M1)': 'Acid-tank stirrer (MDD3A M1)', 'มอเตอร์กวนห้องก่อเจล (MOSFET)': 'Gel-chamber stirrer (MOSFET)', 'ปั๊มสเปรย์ล้าง (MDD3A M2)': 'Rinse spray pump (MDD3A M2)',
    'วาล์ว 1" (รีเลย์)': '1" valve (relay)', 'เซอร์โวเทถาด (องศา)': 'Tray-tilt servo (deg)', 'มอเตอร์กวนห้องก่อเจล': 'Gel-chamber stirrer', 'ปั๊มสเปรย์ล้าง': 'Rinse spray pump',
    'สกรูป้อนไคโตซาน': 'Chitosan auger', 'สกรูป้อนไบโอชาร์': 'Biochar auger', 'พัดลมกวนถังกรด': 'Acid-tank stirrer', 'เซอร์โวเทถาด': 'Tray-tilt servo', 'องศา': 'deg', 'รีเลย์': 'relay',
    'ห้องก่อเจล 2 M NaOH': 'Gel chamber 2 M NaOH', 'ถาดกรอง (สเปรย์ล้าง)': 'Strainer (rinse spray)', 'ถาดรอง + หัววัด pH ': 'Drip tray + pH probe ', '→ ถังน้ำเสีย (ปรับ pH ก่อนทิ้ง)': '→ waste tank (neutralise before disposal)',
    'ถังกรด 1 M': 'Acid tank 1 M', 'พัดลมกวน ': 'Stirrer fan ', 'เข็ม 12 หัว': '12 needles', 'กวนล่าง ': 'Bottom stirrer ', 'สกรูป้อน': 'Auger', 'เซอร์โว ': 'Servo ',
    // ---- control
    'สั่งงาน': 'Commands', '■ หยุดฉุกเฉิน (SAFE)': '■ Emergency stop (SAFE)', 'รีเซ็ตหลังหยุด (ดึง E-stop ขึ้นก่อน)': 'Reset after a stop (release the E-stop first)',
    'เริ่มได้เมื่อสถานะ IDLE หรือ DONE · ปุ่มเขียวหน้าเครื่องทำงานเหมือนกัน · E-stop ตัดไฟ 12 V มอเตอร์ด้วยฮาร์ดแวร์': 'Starts only in IDLE or DONE · the green button on the machine does the same · the E-stop cuts 12 V motor power in hardware',
    'ความเร็วตัวจำลอง': 'Simulator speed', 'ข้ามขั้นนี้': 'Skip this step', 'กด E-stop': 'Press E-stop', 'ดึง E-stop ขึ้น': 'Release E-stop',
    '×600 = 1 วินาทีจริงเท่ากับ 10 นาที (ทั้งรอบ ~9 ชม. ใช้ ~1 นาที)': '×600 = 1 real second is 10 minutes (a ~9 h batch takes ~1 min)',
    'สูตร': 'Recipe', 'ปริมาตรกรด (mL)': 'Acid volume (mL)', 'ไคโตซาน (% w/v)': 'Chitosan (% w/v)', 'ไบโอชาร์ (% w/w)': 'Biochar (% w/w)', 'คำนวณผง': 'Calculate powder', 'ส่งสูตรทั้งหมด': 'Send whole recipe',
    'ไบโอชาร์ (% ของน้ำหนักกรด + ไคโตซาน)': 'Biochar (% of acid + chitosan weight)', 'สกรูไคโตซาน': 'Chitosan auger', 'สกรูไบโอชาร์': 'Biochar auger', 'เวลากวนละลาย': 'Dissolve time', 'เวลาหยด': 'Drip time',
    'PWM ปั๊มหยด': 'Drip pump PWM', 'เวลาแช่ NaOH': 'Cure time', 'PWM พัดลมกวน': 'Stirrer fan PWM', 'PWM กวนห้องก่อเจล': 'Gel stirrer PWM', 'pH หยุดล้าง': 'Stop-rinse pH', 'ล้างสูงสุด': 'Max rinses',
    'อัตราที่ต้องการ ': 'Target rate ', ' ต่อเข็ม ': ' per needle ', '⚠ เกิน 1.5 → เป็นสาย ไม่เป็นเม็ด (เพิ่มเวลาหยด)': '⚠ over 1.5 → strings, not beads (lengthen drip time)',
    '✔ อยู่ในช่วงเป็นหยด': '✔ in the dripping range', ' · ⚠ พัดลมกวนต่ำกว่า 128 จะถูกดันเป็น 128': ' · ⚠ stirrer below 128 is raised to 128', ' · ⚠ แช่น้อยกว่า 6 ชม. (สูตรทีม)': ' · ⚠ cure shorter than 6 h (team recipe)',
    '(สกรูใหญ่)': '(big auger)', '(สกรูเล็ก) — แยกถังกัน ไม่ต้องผสมเอง': '(small auger) — separate hoppers, no premixing', 'ส่งสูตร ': 'Sent ', ' ค่า': ' values', 'สูตรไม่เปลี่ยน': 'Recipe unchanged',
    'ค่า': 'Value', 'บน Mega': 'On Mega', 'ใหม่': 'New', 'หน่วย': 'Unit',
    // ---- test
    'ทดสอบทีละตัว': 'Test one at a time', 'ปิดทั้งหมด': 'All off', 'เปิด': 'On', 'ปิด': 'Off',
    'ใช้ตรวจสายไฟ ทิศหมุน และค่า PWM ต่ำสุดที่มอเตอร์ยังหมุน ก่อนใส่สารเคมีจริง · พัดลมกวนถังกรดถูกบังคับ ≥ 128 (50 %)': 'Check wiring, direction and the lowest PWM that still turns each motor before using real chemicals · the acid-tank fan is forced ≥ 128 (50 %)',
    'ก่อนเดินเครื่องครั้งแรก': 'Before the first run', 'E-stop: กดแล้วมอเตอร์ทุกตัวหยุด, หน้าเว็บขึ้น E-STOP': 'E-stop: pressing it stops every motor and the page shows E-STOP',
    'ปั๊มหยด: หมุนทางที่ดูดจากถังกรดไปหัวเข็ม (กลับขั้วถ้าผิด)': 'Drip pump: pumps from the acid tank to the needles (swap wires if reversed)',
    'สกรูป้อนผง: ผงไหลลงช่องตรงถังกรด ไม่ค้างในท่อ': 'Powder auger: powder falls into the acid tank, not stuck in the tube',
    'พัดลมกวนถังกรด + มอเตอร์กวนห้องก่อเจล: แท่งกวนหมุนตาม ไม่กระโดด': 'Acid stirrer + gel-chamber stirrer: the stir bar follows without jumping',
    'วาล์ว 1": เปิด/ปิดได้ ไม่รั่ว (ทดสอบด้วยน้ำเปล่า)': '1" valve: opens/closes without leaking (test with water)', 'ปั๊มสเปรย์: น้ำออกครบ 3 หัว ไม่กระเด็นออกนอกถาด': 'Spray pump: all 3 nozzles spray, nothing splashes off the tray',
    'เซอร์โวเทถาด: 10° = ราบ, 120° = เทหมด ไม่ชนโครง': 'Tilt servo: 10° = flat, 120° = fully tipped, no collision', 'พัดลมกล่องไฟ: หมุนทันทีที่เปิดเครื่อง': 'Electronics fan: runs as soon as the machine is on',
    // ---- results
    'บันทึกผลรอบนี้': 'Log this batch', 'ไบโอชาร์ (%)': 'Biochar (%)', 'ซ้ำครั้งที่': 'Replicate', 'จำนวนเม็ด (นับ/ประมาณ)': 'Bead count (counted/approx.)', 'ขนาดเม็ดเฉลี่ย (mm)': 'Mean bead size (mm)',
    'SD ขนาด (mm)': 'Size SD (mm)', 'น้ำหนักเปียกที่ได้ (g)': 'Wet yield (g)', 'น้ำหนักแห้ง (g)': 'Dry weight (g)', 'น้ำหนักหลังแช่น้ำ 24 ชม. (g)': 'Weight after 24 h soak (g)',
    'pH สุดท้าย': 'Final pH', 'รอบล้าง': 'Rinses', 'หมายเหตุ': 'Notes', 'ดึงค่าจากรอบล่าสุดของเครื่อง': 'Fill from the last machine batch', 'บันทึกผล': 'Save result',
    'การพองตัว (%) = (น้ำหนักหลังแช่ − น้ำหนักแห้ง) ÷ น้ำหนักแห้ง × 100 · งานวิจัยเดิม: ไบโอชาร์ 2 % ได้ 605 %': 'Swelling (%) = (soaked − dry) ÷ dry × 100 · earlier study: 2 % biochar gave 605 %',
    'สรุปตามสัดส่วนไบโอชาร์': 'Summary by biochar %', 'ผลทั้งหมด': 'All results', 'ดาวน์โหลด CSV': 'Download CSV', 'การพองตัว %': 'Swelling %', 'งานวิจัยเดิม 605 %': 'earlier study 605 %',
    'การพองตัว = ': 'Swelling = ', 'เวลา': 'Time', 'ซ้ำ': 'Rep', 'ผง (g)': 'Powder (g)', 'ขนาด (mm)': 'Size (mm)', 'เปียก (g)': 'Wet (g)', 'แห้ง (g)': 'Dry (g)', 'พองตัว': 'Swelling',
    'ขนาดเม็ด': 'Bead size', 'ลบรอบ #': 'Delete batch #', 'ลบ': 'Delete', 'รอบเครื่อง ': 'Machine batch ', ' (ตัวจำลอง)': ' (simulator)', 'บันทึกรอบ: ': 'Saved: ', '→ พองตัว': '→ swelling',
    // ---- calibration
    'หัววัด pH': 'pH probe', 'จุ่มหัววัดในบัฟเฟอร์ pH 7 รอค่านิ่ง 1 นาที → กด "จำค่า pH 7"': 'Dip the probe in pH 7 buffer, wait 1 min → press "Store pH 7"',
    'ล้างหัววัด จุ่มบัฟเฟอร์ตัวที่ 2 → เลือกค่า กด "จำค่า"': 'Rinse the probe, dip in the 2nd buffer → pick its value, press "Store"', 'กด "ส่งค่าสอบเทียบ"': 'Press "Send calibration"',
    'จำค่า pH 7': 'Store pH 7', 'จำค่า': 'Store', 'ส่งค่าสอบเทียบ': 'Send calibration', 'จำค่าให้ครบ 2 จุดก่อน': 'Store both points first', 'ความชันผิดปกติ (': 'Odd slope (',
    ' V/pH) — ตรวจหัววัด/บัฟเฟอร์': ' V/pH) — check probe / buffers', 'สกรูป้อนผง': 'Powder auger', 'ใส่ผงในถังพัก วางถ้วยบนตาชั่งใต้ช่องออก': 'Fill the hopper, put a cup on a scale under the outlet',
    'สั่งเดิน 60 วินาที (30 rpm = 30 รอบ)': 'Run 60 s (30 rpm = 30 turns)', 'ชั่งน้ำหนัก → ใส่ค่า → ระบบคำนวณ g/rev': 'Weigh → enter it → g/rev is calculated', 'เดิน auger 60 s': 'Run auger 60 s',
    'ผงที่ได้ (g)': 'Powder out (g)', 'ส่งค่า': 'Send', 'ใส่น้ำเปล่าในถังกรด วางกระบอกตวงใต้หัวเข็ม': 'Put water in the acid tank, a measuring cylinder under the needles',
    'เดินปั๊มที่ PWM ปัจจุบัน 60 วินาที แล้วตวง mL': 'Run the pump at the current PWM for 60 s and measure mL', 'ระบบคำนวณ PWM ใหม่ (สมมติอัตราไหลแปรผันตาม PWM − 30)': 'A new PWM is calculated (flow assumed ∝ PWM − 30)',
    'เดินปั๊ม 60 s': 'Run pump 60 s', 'ตวงได้ (mL)': 'Measured (mL)', 'คำนวณ + ส่ง': 'Calculate + send', 'น้ำเปล่าไหลเร็วกว่าสารละลายไคโตซาน 6 % ที่หนืด — ทวนซ้ำด้วยสารละลายจริงอีกครั้ง': 'Water flows faster than the viscous 6 % chitosan — repeat with the real solution',
    'ข้อมูลย้อนหลัง': 'History', 'ดาวน์โหลด CSV (1 ชม.)': 'Download CSV (1 h)', 'Mega ส่งสถานะทุก 0.5 วินาทีทาง USB (JSON ทีละบรรทัด)': 'The Mega sends its status every 0.5 s over USB (one JSON line each)',
    ' g/รอบ ✔': ' g/rev ✔', 'ครบ ': 'Done ', ' ⚠ เกินสูงสุด เพิ่มเวลาหยด': ' ⚠ above maximum, lengthen the drip time', 'ได้ ': 'Got ', '→ ต้องการ': '→ want',
    // ---- 3D
    'ทั้งเครื่อง': 'Whole machine', 'ถังผสม': 'Mixing tank', 'ถังขึ้นรูป': 'Forming tank', 'โซนล้าง': 'Rinse zone', 'มองทะลุถัง': 'See through tanks', 'ป้ายชื่อ': 'Labels', 'หมุนอัตโนมัติ': 'Auto-rotate',
    'ดูการทำงานทั้งรอบใน 1 นาที': 'a whole batch in 1 minute', 'เติมวัตถุดิบ': 'Fill materials', 'เติม': 'Fill', 'เท': 'Empty', 'เก็บ': 'Collect', 'เดินเครื่อง': 'Run', 'รีเซ็ต': 'Reset',
    'ความเร็ว': 'Speed', 'ชิ้นส่วน': 'Parts', 'แสดงทั้งหมด': 'Show all', '🧴 กรด 1 M': '🧴 Acid 1 M', '🚰 น้ำล้าง': '🚰 Rinse water', '🗑️ น้ำทิ้ง': '🗑️ Waste', '☀️ ถาดตาก': '☀️ Drying tray',
    'โครงอลูมิเนียม 2020': '2020 aluminium frame', 'ฉากยึดโครง + น็อต': 'Corner brackets + nuts', 'แผ่น PP': 'PP plates', 'ฝาครอบอะคริลิก': 'Acrylic cover', 'ถังผง + สกรูป้อน': 'Hopper + auger',
    'ถังผสมกรด': 'Acid mixing tank', 'กล่องหยด (เข็ม 12 หัว)': 'Drip box (12 needles)', 'ท่อสารละลาย': 'Solution tubing', 'ถังขึ้นรูป NaOH': 'NaOH forming tank', 'ตัวกวนถังขึ้นรูป': 'Forming-tank stirrer',
    'โซนล้าง + ตะกร้า': 'Rinse zone + basket', 'ท่อน้ำล้าง': 'Rinse piping', 'ท่อทิ้ง 1"': '1" outlet pipe', 'โซลินอยด์วาล์ว': 'Solenoid valve', 'ถังน้ำล้าง / ถังน้ำทิ้ง': 'Rinse / waste tanks',
    'ปุ่มหยุดฉุกเฉิน': 'E-stop button', 'ปุ่ม START': 'START button', 'ปุ่ม STOP': 'STOP button', 'ช่องอิเล็กทรอนิกส์': 'Electronics bay', 'ขาปรับระดับ': 'Levelling feet', 'ชุดป้อนไบโอชาร์ (N20)': 'Biochar feeder (N20)',
    'กำลังโหลดโมเดล…': 'Loading model…', 'ลากเพื่อหมุน · เลื่อนล้อเพื่อซูม · คลิกขวาลากเพื่อเลื่อน · คลิกชิ้นส่วนเพื่อดูชื่อ': 'Drag to rotate · scroll to zoom · right-drag to pan · click a part for its name',
    'โหลดโมเดลไม่ได้: ': 'Could not load the model: ', 'ว่าง': 'empty', '🙈 ลืมเติม ': '🙈 Forgot to fill ', ' — ตัวจำลองเติมให้แล้ว แต่เครื่องจริงต้องเติมก่อนกด START นะ': ' — the simulator filled it, but on the real machine fill it before START',
    'น้ำกรด': 'acid', '🚀 เริ่มแล้ว! ป้อนผงลงถังกรด': '🚀 Started! Dosing powder into the acid', '💧 เริ่มหยด — เม็ดเจลเกิดทันทีที่หยดโดน NaOH': '💧 Dripping — a gel bead forms the moment a drop hits NaOH',
    '🔄 รีเซ็ตแล้ว — ล้างถังและเทเม็ดที่ค้างออก พร้อมเริ่มรอบใหม่': '🔄 Reset — clean the tanks and remove leftover beads, ready for a new batch', '🎉 เสร็จแล้ว! เม็ดเจลอยู่บนถาดตาก': '🎉 Done! The beads are on the drying tray',
    '🛑 หยุดฉุกเฉิน — อุปกรณ์ทุกตัวหยุด': '🛑 Emergency stop — everything stopped', '🚿 เปิดวาล์ว — เม็ดไหลตามน้ำออกไปกองที่ตะกร้าล้าง น้ำ NaOH ลงถังน้ำทิ้ง': '🚿 Valve open — beads flow into the rinse basket, NaOH goes to the waste tank',
    '↘️ เทตะกร้า — เม็ดเจลไหลลงถาดตาก': '↘️ Tipping — beads slide onto the drying tray', '🫧 ถังขึ้นรูป NaOH': '🫧 NaOH forming tank', '💦 ตะกร้าล้าง': '💦 Rinse basket', '🚰 ถังน้ำล้าง': '🚰 Rinse tank',
    '🗑️ ถังน้ำทิ้ง': '🗑️ Waste tank', '🌀 ถังผสมกรด': '🌀 Acid tank', '💧 กล่องหยด': '💧 Drip box', 'ซูมไปที่ชิ้นนี้': 'Zoom to this part',
    '🥄 เติมผงไคโตซานจากด้านบนเครื่องแล้ว (140 g พอ ~4 รอบ)': '🥄 Chitosan filled from the top (140 g ≈ 4 batches)', '⚫ เติมไบโอชาร์แล้ว (45 g พอ 4 รอบ ที่ 2 % ≈ 10.6 g/รอบ)': '⚫ Biochar filled (45 g = 4 batches at 2 % ≈ 10.6 g each)',
    '🧴 เติมกรดอะซิติก 1 M 500 mL แล้ว': '🧴 1 M acetic acid 500 mL filled', '🧤 เติม NaOH 2 M แล้ว — ใส่แว่นกับถุงมือทุกครั้งนะ': '🧤 2 M NaOH filled — always wear goggles and gloves',
    '🚰 เติมน้ำสะอาดลงถังน้ำล้างแล้ว': '🚰 Rinse tank filled with clean water', '🗑️ ทิ้งน้ำเสียแล้ว — ทำให้เป็นกลางก่อนทิ้งด้วย': '🗑️ Waste emptied — neutralise it before disposal',
    '🧺 เก็บเม็ดจากถาดตากแล้ว': '🧺 Beads collected from the tray', '✨ เติมครบแล้ว พร้อมกด START!': '✨ All filled — ready for START!', '👋 จบทัวร์ — ลองกด START เดินเครื่องเองได้เลย': '👋 Tour over — press START and run it yourself',
    '🧴 กรดในถังผสมไม่พอ — เติม 500 mL ก่อนกดเริ่ม': '🧴 Not enough acid — add 500 mL before starting', '🚰 น้ำล้างใกล้หมด — เครื่องรอให้เติมน้ำ': '🚰 Rinse water low — the machine waits for a refill',
    '🗑️ ถังน้ำทิ้งเต็ม — เครื่องรอให้เททิ้งก่อนปล่อยน้ำ': '🗑️ Waste tank full — the machine waits before draining', 'แจ้งเตือน': 'Alert', 'ย้อน': 'Back', 'หยุดชั่วคราว': 'Pause', 'ถัดไป': 'Next', 'ปิดทัวร์': 'Close tour',
    // ---- docs
    '✨ อัปเดตล่าสุด · v8.9 (15 ต.ค. 2026)': '✨ Latest · v8.9 (15 Oct 2026)', '⚫ ชุดป้อนไบโอชาร์แยก': '⚫ Separate biochar feeder',
    'ถัง ≈ 45 g (4 รอบ) + สกรู Ø12 + มอเตอร์ N20 · ไบโอชาร์ = 2 % ของน้ำหนักกรด + ไคโตซาน ≈ 10.6 g/รอบ ตั้ง 0–3 % บนหน้าจอ ไม่ต้องผสมผงเอง': 'Hopper ≈ 45 g (4 batches) + Ø12 auger + N20 motor · biochar = 2 % of acid + chitosan ≈ 10.6 g per batch, set 0–3 % on screen, no premixing',
    '🟩 บอร์ด shield Mega': '🟩 Mega shield board', 'ปริ้นหน้าเดียว ทำเองได้ · ขั้วต่อ JST ล็อก 8 ชุด · ไม่ต้องเดินจัมเปอร์': 'Single-sided, DIY-friendly · locking JST connectors · no jumper wires',
    '📌 ย้ายขา Mega': '📌 Mega pins moved', 'ให้เดินลายหน้าเดียวได้ · เฟิร์มแวร์ + ผังสายไฟอัปเดตแล้ว (ตารางด้านล่าง)': 'so it routes single-sided · firmware + wiring updated (table below)',
    'แท่งกวนหมุน · เม็ดไหลออกทีละเม็ดตอนเปิดวาล์ว · ถังไบโอชาร์': 'spinning stir bars · beads flow out when the valve opens · biochar hopper', '💰 งบประมาณ': '💰 Budget', 'ภาพเครื่อง': 'Machine',
    'ชุดป้อนไบโอชาร์ (v8.9)': 'Biochar feeder (v8.9)', 'บอร์ด shield สำหรับ Mega': 'Shield board for the Mega', '⬇ ลายปริ้น 1:1 (PDF)': '⬇ 1:1 copper print (PDF)', 'ด้านอุปกรณ์': 'Component side',
    'ลายทองแดง (มองจากด้านบน)': 'Copper (seen from the top)', 'ขั้วต่อ': 'Connector', 'ไปที่': 'Goes to', 'pin 1 → pin สุดท้าย': 'pin 1 → last pin', 'D11 ไบโอชาร์ · D9 กวนถังขึ้นรูป · GND': 'D11 biochar · D9 chamber stirrer · GND',
    'เซอร์โว': 'Servo', 'รีเลย์วาล์ว': 'Valve relay', 'แผงหน้า': 'Front panel', 'D42 START · D44 STOP · D46 E-stop · D48 ไฟ START · D50 ไฟ STOP · GND': 'D42 START · D44 STOP · D46 E-stop · D48 START lamp · D50 STOP lamp · GND',
    'จอ ESP32': 'ESP32 display', 'TX 3.3 V (แบ่งแรงดัน 10k/20k) · RX1 · GND': 'TX 3.3 V (10k/20k divider) · RX1 · GND', 'ไฟ 5V จาก BUCK5': '5 V from BUCK5', 'ใบสั่งซื้อ (BOM)': 'Bill of materials',
    'แผนผังสายไฟ': 'Wiring diagram', 'ผลตรวจระบบไฟฟ้า': 'Electrical check', 'ผลคำนวณความเป็นไปได้': 'Feasibility study', 'ไม่พบไฟล์': 'File not found', 'ต้องซื้อ ≈ ': 'To buy ≈ ', ' บาท · ': ' THB · ',
    ' รายการ': ' items', 'ทั้งหมด': 'All', 'รายการ': 'Item', 'สเปก': 'Spec', 'จำนวน': 'Qty', 'รวม (บาท)': 'Total (THB)', 'ซื้อ': 'Buy', 'มีแล้ว ✓': 'have ✓', 'ต้องซื้อ': 'To buy',
    // ---- materials / small words (last: shortest)
    '🥄 ไคโตซาน': '🥄 Chitosan', '⚫ ไบโอชาร์': '⚫ Biochar', 'ไคโตซาน': 'chitosan', 'ไบโอชาร์': 'biochar', 'น้ำล้าง': 'rinse water', 'น้ำทิ้ง': 'waste', 'กรด': 'acid', 'ถาดตาก': 'Drying tray',
    'ปั๊มหยด': 'Drip pump', 'วาล์ว 1"': '1" valve', 'เม็ด': 'beads', 'ขนาด': 'size', 'เป้า': 'target', 'หยดแล้ว': 'dripped', 'เหลือ ': 'left ', 'เสร็จ': 'Done', 'พร้อม': 'Ready',
    'ชม.': 'h', 'นาที': 'min', 'วิ': 's', 'g/รอบ': 'g/rev', 'รอบ': 'batches', 'บาท': 'THB',
  };
  const KEYS = Object.keys(EN).sort((a, b) => b.length - a.length);
  const TH_RE = /[฀-๿]/;
  const orig = new WeakMap();
  let lang = 'th', busy = false;
  const tr = (s) => { let o = s; for (const k of KEYS) if (o.includes(k)) o = o.split(k).join(EN[k]); return o; };
  function fixNode(n) {
    if (n.nodeType === 3) {
      const v = n.nodeValue;
      if (!TH_RE.test(v)) return;
      orig.set(n, v); n.nodeValue = tr(v);
    } else if (n.nodeType === 1) {
      for (const a of ['title', 'placeholder', 'aria-label']) { const v = n.getAttribute && n.getAttribute(a); if (v && TH_RE.test(v)) { n.dataset['th' + a.replace('-', '')] = v; n.setAttribute(a, tr(v)); } }
      if (n.tagName === 'SCRIPT' || n.tagName === 'STYLE') return;
      const w = document.createTreeWalker(n, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
      for (let x = w.nextNode(); x; x = w.nextNode()) if (x !== n) fixNode1(x);
    }
  }
  function fixNode1(x) {
    if (x.nodeType === 3) { const v = x.nodeValue; if (TH_RE.test(v)) { orig.set(x, v); x.nodeValue = tr(v); } }
    else for (const a of ['title', 'placeholder', 'aria-label']) { const v = x.getAttribute(a); if (v && TH_RE.test(v)) { x.dataset['th' + a.replace('-', '')] = v; x.setAttribute(a, tr(v)); } }
  }
  const mo = new MutationObserver((ms) => {
    if (busy || lang !== 'en') return; busy = true;
    for (const m of ms) {
      if (m.type === 'characterData') fixNode(m.target);
      else if (m.type === 'attributes') fixNode1(m.target);
      else m.addedNodes.forEach(fixNode);
    }
    busy = false;
  });
  function restore() {
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    for (let x = w.nextNode(); x; x = w.nextNode()) {
      if (x.nodeType === 3) { if (orig.has(x)) x.nodeValue = orig.get(x); }
      else for (const a of ['title', 'placeholder', 'aria-label']) { const k = 'th' + a.replace('-', ''); if (x.dataset && x.dataset[k]) x.setAttribute(a, x.dataset[k]); }
    }
  }
  function set(l) {
    lang = l; window.LANG = l; document.documentElement.lang = l;
    try { localStorage.setItem('hk15_lang', l); } catch (e) {}
    for (const id of ['langBtn', 'langChip']) { const b = document.getElementById(id); if (b) b.textContent = l === 'en' ? 'ไทย' : 'EN'; }
    if (l === 'en') { busy = true; fixNode(document.body); busy = false; mo.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['title', 'placeholder'] }); }
    else if (document.documentElement.dataset.wasEn) { mo.disconnect(); location.reload(); }   // the app keeps rewriting text: a reload is the clean way back to Thai
    if (l === 'en') document.documentElement.dataset.wasEn = '1';
  }
  window.hkSetLang = set;
  function boot() {
    const th = document.getElementById('theme');
    if (th && !document.getElementById('langBtn')) {
      const b = document.createElement('button'); b.id = 'langBtn'; b.className = th.className; b.title = 'ภาษา / Language';
      b.onclick = () => set(lang === 'en' ? 'th' : 'en'); th.after(b);
    }
    const dock = document.getElementById('dock');          // phones: the sidebar is hidden, so a small chip in the top bar too
    if (dock && !document.getElementById('langChip')) {
      const c = document.createElement('button'); c.id = 'langChip'; c.className = 'langchip'; c.onclick = () => set(lang === 'en' ? 'th' : 'en'); dock.prepend(c);
    }
    let l = new URLSearchParams(location.search).get('lang'); try { l = l || localStorage.getItem('hk15_lang'); } catch (e) {}
    set(l === 'en' ? 'en' : 'th');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
