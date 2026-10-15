# HK-Green-15 — electrical check

✅ 47 · ⚠️ 0 · ❌ 0

- ✅ PSU +V 12 V 12.5 A vs loads run 4.27 A ×1.25 / peak 8.81 A
- ✅ PERI: power is cut by the E-stop
- ✅ AUGER: power is cut by the E-stop
- ✅ TOPSTIR: power is cut by the E-stop
- ✅ RINSE: power is cut by the E-stop
- ✅ CHSTIR: power is cut by the E-stop
- ✅ BIOAUG: power is cut by the E-stop
- ✅ VALVE: power is cut by the E-stop
- ✅ SERVO: power is cut by the E-stop
- ✅ PERI: inductive — driver has flyback diodes
- ✅ AUGER: inductive — driver has flyback diodes
- ✅ TOPSTIR: inductive — driver has flyback diodes
- ✅ RINSE: inductive — driver has flyback diodes
- ✅ CHSTIR: inductive — driver has flyback diodes
- ✅ BIOAUG: inductive — driver has flyback diodes
- ✅ VALVE: inductive — driver has flyback diodes
- ✅ BUCK5: on the common ground
- ✅ BUCK6: on the common ground
- ✅ MEGA: on the common ground
- ✅ DIV: on the common ground
- ✅ ESP: on the common ground
- ✅ MDD10A: on the common ground
- ✅ MDD3A: on the common ground
- ✅ MOS: on the common ground
- ✅ MOS2: on the common ground
- ✅ RELAY: on the common ground
- ✅ PH: on the common ground
- ✅ LAMPDRV: on the common ground
- ✅ BTN: on the common ground
- ✅ LVA: on the common ground
- ✅ LVW: on the common ground
- ✅ LVX: on the common ground
- ✅ F1: branch 3.82 A → fuse 7.5 A slow-blow; 8 wire(s) on its net upsized to ≥ 7.5 A
- ✅ F2: branch 0.48 A → fuse 1 A fast
- ✅ MDD10A: output MDD10A.M1A→PERI.+ 0.25 A vs rating 10 A
- ✅ MDD10A: output MDD10A.M1B→PERI.- 0.25 A vs rating 10 A
- ✅ MDD10A: output MDD10A.M2A→AUGER.+ 0.15 A vs rating 10 A
- ✅ MDD10A: output MDD10A.M2B→AUGER.- 0.15 A vs rating 10 A
- ✅ MDD3A: output MDD3A.M1A→TOPSTIR.+ 0.2 A vs rating 3 A
- ✅ MDD3A: output MDD3A.M1B→TOPSTIR.- 0.2 A vs rating 3 A
- ✅ MDD3A: output MDD3A.M2A→RINSE.+ 0.8 A vs rating 3 A
- ✅ MDD3A: output MDD3A.M2B→RINSE.- 0.8 A vs rating 3 A
- ✅ MOS: output MOS.OUT+→CHSTIR.+ 0.3 A vs rating 5 A
- ✅ MOS: output MOS.OUT-→CHSTIR.- 0.3 A vs rating 5 A
- ✅ MOS2: output MOS2.OUT+→BIOAUG.+ 0.06 A vs rating 5 A
- ✅ MOS2: output MOS2.OUT-→BIOAUG.- 0.06 A vs rating 5 A
- ✅ RELAY: output RELAY.NO→VALVE.+ 1.5 A vs rating 10 A

## Notes
- E-stop main contact breaks the 12 V motor bus (drivers, relay COM, servo buck); logic stays on so the Mega can report SAFE.
- ESP32 TX (3.3 V) → Mega RX1 is read correctly as HIGH (V_IH of the ATmega2560 ≈ 3.0 V at 5 V — marginal but works; use a 74HCT125 buffer if the link is unreliable).
- TOPSTIR is a brushless PC fan (internal driver): drive it one direction only and keep PWM duty >= ~50 % (it stalls below ~5-7 V).
- Level sensors (XKC-Y25-NPN) stick on the outside of the tank wall: nothing touches acid or NaOH. Output pulls LOW when liquid is behind it.
