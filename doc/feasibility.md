# HK-Green-15 hydrogel machine (model v8) — feasibility check

✅ 26 OK · ⚠️ 2 marginal · ❌ 0 fail

| | Group | Check | Requirement | Capability | Margin | Note |
|---|---|---|---|---|---|---|
| ⚠️ | Process | Magnetic coupling: top acid-tank stirrer (v8) | gap ≤ 6.0 mm | 6.5 mm | - | pole spacing 40 mm vs bar 40 mm |
| ⚠️ | Materials | Release valve body | NaOH 2 M | brass | - | team decision: keep; rinse after every drain |
| ✅ | Electrical | Power budget (PSU) | typ 4.18 A ×1.25, worst 9.51 A | 12.5 A | 1.32× | worst = every listed load at stall/peak at once |
| ✅ | Electrical | MDD10A ch1 → peristaltic pump | run 0.25 A, stall 0.5 A | 10 A cont / 30 A peak | 28.00× |  |
| ✅ | Electrical | MDD10A ch2 → auger motor | run 0.15 A, stall 1.0 A | 10 A cont / 30 A peak | 30.00× |  |
| ✅ | Electrical | MDD3A ch1 → top stirrer RS-385 | run 0.3 A, stall 1.6 A | 3 A cont / 5 A peak | 3.12× |  |
| ✅ | Electrical | MDD3A ch2 → rinse pump | run 0.8 A, stall 1.5 A | 3 A cont / 5 A peak | 2.62× |  |
| ✅ | Electrical | MOSFET D4184 (TV 5 A) → chamber stirrer RS-385 | run 0.3 A, stall 1.6 A | 5 A cont / 10 A peak | 6.25× |  |
| ✅ | Electrical | XL4015 buck → 6 V servo rail | 2.50 A (servo stall) | 5 A (use ≤70 %) | 1.40× |  |
| ✅ | Electrical | 5 V rail (2nd buck) rail | 0.70 A (Mega, display, relay+pH) | 3 A (use ≤70 %) | 3.00× |  |
| ✅ | Mechanical | Torque: tray tilt servo DS3218 @6 V (v8) | 14.96 kg·cm | 20 kg·cm | 1.34× | m=0.95 kg at 105 mm × 1.5 |
| ✅ | Mechanical | Deflection: chamber-level ring (300 mm) | 0.024 mm | ≤ 0.30 mm (L/1000) | 12.5× | 6.6 kg UDL on 2 beam(s), span 300 mm |
| ✅ | Mechanical | Deflection: extension top (480 mm) | 0.045 mm | ≤ 0.48 mm (L/1000) | 10.8× | 3.0 kg UDL on 2 beam(s), span 480 mm |
| ✅ | Mechanical | Bolt shear: valve support (2× M5 into T-slot) | 0.3 MPa ×3 | 150 MPa (M5 A2-70) | 144.8× |  |
| ✅ | Mechanical | Printed part: valve support shelf (PETG) | 0.03 MPa ×4 | 35 MPa PETG (Z) | 261.6× | if loaded across layers use the Z value |
| ✅ | Mechanical | Printed part: hinge block (PETG, 8 mm) | 1.15 MPa ×4 | 35 MPa PETG (Z) | 7.6× | if loaded across layers use the Z value |
| ✅ | Process | Volume: crosslinking chamber (Ø180 × 278) | 3500 mL | 5659 mL @ 80% fill | 1.62× |  |
| ✅ | Process | Volume: acid mixing tank (Ø114 × 80) | 500 mL | 653 mL @ 80% fill | 1.31× |  |
| ✅ | Process | Auger dose: powder auger (Ø24, pitch 20) | 30.6 g in ≤ 180 s | 69 s @ 30 rpm | 2.6× | fill 0.3, bulk 0.35 g/mL (CEMA) |
| ✅ | Process | Bead size: 18G blunt needle, chitosan 6 % in 1 M AcOH | 2.0–4.0 mm | 2.99 mm | - | wet-drop size; beads shrink when dried |
| ✅ | Process | Dripping regime: 12 needles (2 rows, v8), 500 mL in 40 min | 500 mL in 40 min | 1.04 mL/min/needle (1.2 drops/s) | 1.4× | keep ≤ 1.5 mL/min/needle to avoid jetting |
| ✅ | Process | Pump time: peristaltic, viscous 6 % chitosan | ≤ 45 min | 20.8 min (Q 60×0.4) | 2.16× |  |
| ✅ | Process | Gravity drain: chamber through 1" valve | ≤ 60 s | 15 s | 4.1× | Torricelli, Cd 0.6 |
| ✅ | Process | Magnetic coupling: chamber stirrer (v8, N52) | gap ≤ 8.0 mm | 7.5 mm | - | pole spacing 50 mm vs bar 50 mm |
| ✅ | Materials | Chamber tube | NaOH 2 M | acrylic (PMMA) | - |  |
| ✅ | Materials | Chamber base | NaOH 2 M | PP (turned) | - |  |
| ✅ | Materials | Solution tubing | acetic acid 1 M + chitosan | silicone | - |  |
| ✅ | Materials | Printed mounts | splash only (not wetted) | PETG | - |  |

## Notes
- Auger powder auger (Ø24, pitch 20): 2.54 mL/rev ≈ 0.89 g/rev; dose resolution ≈ 0.89 g per turn
- Drop 18G blunt needle, chitosan 6 % in 1 M AcOH: 13.9 µL per drop, Ø 2.99 mm (Tate, F=0.6)
- v8 applied the v7 findings: DS3218 tilt servo, 12 needles in 2 rows, magnet pole spacing = stir-bar length (50 / 40 mm); chamber gap 7.5 mm needs N52 magnets (or thin the PP floor 5.5 → 4 mm).
- Solenoid 2W-250-25 is direct-acting diaphragm: opens at 0 bar (gravity OK), fluid ≤ 25 cSt (NaOH ≈ 1.5 cSt OK).
