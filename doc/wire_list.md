# HK-Green-15 — wire list

Label both ends with the wire number. Gauge = practical chassis rating (×1.25) and voltage drop (≤ 3 % logic, ≤ 5 % motor bus).

| # | From | To | Function | Kind | I (A) | AWG | mm² | Colour | Length mm | ΔV (V) |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | IEC.L | PSU.L | AC L | ac_l | 0.05 | AWG18 | 0.75 | brown | 250 | 0.003 |
| 2 | IEC.N | PSU.N | AC N | ac_n | 0.05 | AWG18 | 0.75 | blue | 250 | 0.003 |
| 3 | IEC.PE | PSU.PE | PE | pe | 0.05 | AWG18 | 0.75 |  | 250 | 0.003 |
| 4 | PSU.+V | F1.in | +12 V | v12 | 5.77 | AWG14 | 2.5 | red | 150 | 0.014 |
| 5 | F1.out | ESTOP.in | +12 V | v12 | 5.77 | AWG14 | 2.5 | red | 500 | 0.048 |
| 6 | ESTOP.out | MDD10A.VB+ | +12 V | v12 | 0.40 | AWG14 | 2.5 | red | 500 | 0.003 |
| 7 | ESTOP.out | MDD3A.VB+ | +12 V | v12 | 1.00 | AWG14 | 2.5 | red | 500 | 0.008 |
| 8 | ESTOP.out | MOS.V+ | +12 V | v12 | 0.30 | AWG14 | 2.5 | red | 500 | 0.002 |
| 9 | ESTOP.out | MOS2.V+ | +12 V | v12 | 0.06 | AWG14 | 2.5 | red | 500 | 0.000 |
| 10 | ESTOP.out | RELAY.COM | +12 V | v12 | 1.50 | AWG14 | 2.5 | red | 500 | 0.012 |
| 11 | ESTOP.out | BUCK6.IN+ | +12 V | v12 | 0.56 | AWG14 | 2.5 | red | 500 | 0.005 |
| 12 | PSU.+V | F2.in | +12 V | v12 | 0.50 | AWG26 | 0.13 | red | 150 | 0.020 |
| 13 | F2.out | BUCK5.IN+ | +12 V | v12 | 0.31 | AWG26 | 0.13 | red | 150 | 0.012 |
| 14 | F2.out | LAMPDRV.COM | +12 V | v12 | 0.04 | AWG26 | 0.13 | red | 400 | 0.004 |
| 15 | F2.out | LAMPS.+G | +12 V | v12 | 0.04 | AWG26 | 0.13 | red | 600 | 0.006 |
| 16 | F2.out | LAMPS.+R | +12 V | v12 | 0.04 | AWG26 | 0.13 | red | 600 | 0.006 |
| 17 | F2.out | BAYFAN.+ | +12 V | v12 | 0.15 | AWG26 | 0.13 | red | 400 | 0.016 |
| 18 | BUCK5.OUT+ | MEGA.5V | +5 V | v5 | 0.10 | AWG26 | 0.13 | orange | 200 | 0.005 |
| 19 | BUCK5.OUT+ | ESP.5V | +5 V | v5 | 0.50 | AWG26 | 0.13 | orange | 700 | 0.094 |
| 20 | BUCK5.OUT+ | RELAY.VCC | +5 V | v5 | 0.05 | AWG26 | 0.13 | orange | 200 | 0.003 |
| 21 | BUCK5.OUT+ | PH.V+ | +5 V | v5 | 0.02 | AWG26 | 0.13 | orange | 300 | 0.002 |
| 22 | BUCK5.OUT+ | LVA.V+ | +5 V | v5 | 0.01 | AWG26 | 0.13 | orange | 700 | 0.001 |
| 23 | BUCK5.OUT+ | LVW.V+ | +5 V | v5 | 0.01 | AWG26 | 0.13 | orange | 900 | 0.001 |
| 24 | BUCK5.OUT+ | LVX.V+ | +5 V | v5 | 0.01 | AWG26 | 0.13 | orange | 900 | 0.001 |
| 25 | BUCK6.OUT+ | SERVO.+ | +6 V | v6 | 1.00 | AWG24 | 0.2 | pink | 600 | 0.101 |
| 26 | GND.g1 | PSU.-V | GND | gnd | 5.77 | AWG16 | 1.5 | black | 150 | 0.022 |
| 27 | GND.g2 | MDD10A.GND | GND | gnd | 0.25 | AWG26 | 0.13 | black | 150 | 0.010 |
| 28 | GND.g3 | MDD3A.GND | GND | gnd | 0.80 | AWG26 | 0.13 | black | 150 | 0.032 |
| 29 | GND.g4 | MOS.GND | GND | gnd | 0.30 | AWG26 | 0.13 | black | 150 | 0.012 |
| 30 | GND.g5 | MOS2.GND | GND | gnd | 0.06 | AWG26 | 0.13 | black | 150 | 0.002 |
| 31 | GND.g6 | BUCK5.IN- | GND | gnd | 0.50 | AWG26 | 0.13 | black | 150 | 0.020 |
| 32 | GND.g7 | BUCK6.IN- | GND | gnd | 1.00 | AWG24 | 0.2 | black | 250 | 0.042 |
| 33 | GND.g8 | MEGA.GND | GND | gnd | 0.05 | AWG26 | 0.13 | black | 250 | 0.003 |
| 34 | GND.g9 | ESP.GND | GND | gnd | 0.05 | AWG26 | 0.13 | black | 700 | 0.009 |
| 35 | GND.g10 | RELAY.GND | GND | gnd | 1.50 | AWG24 | 0.2 | black | 250 | 0.063 |
| 36 | GND.g11 | PH.GND | GND | gnd | 0.05 | AWG26 | 0.13 | black | 250 | 0.003 |
| 37 | GND.g12 | LAMPDRV.GND | GND | gnd | 0.05 | AWG26 | 0.13 | black | 250 | 0.003 |
| 38 | GND.g13 | BAYFAN.- | GND | gnd | 0.05 | AWG26 | 0.13 | black | 250 | 0.003 |
| 39 | BUCK6.OUT- | SERVO.- | GND | gnd | 1.00 | AWG24 | 0.2 | black | 600 | 0.101 |
| 40 | BUCK5.OUT- | DIV.GND | GND | gnd | 0.50 | AWG26 | 0.13 | black | 200 | 0.027 |
| 41 | VALVE.- | BUCK6.IN- | GND | gnd | 1.00 | AWG24 | 0.2 | black | 500 | 0.084 |
| 42 | ESTOP.NC2b | BUCK5.OUT- | GND | gnd | 1.50 | AWG24 | 0.2 | black | 500 | 0.126 |
| 43 | BTN.COM | BUCK5.OUT- | GND | gnd | 0.50 | AWG26 | 0.13 | black | 600 | 0.080 |
| 44 | LVA.GND | BUCK5.OUT- | GND | gnd | 0.50 | AWG26 | 0.13 | black | 700 | 0.094 |
| 45 | LVW.GND | BUCK5.OUT- | GND | gnd | 0.50 | AWG26 | 0.13 | black | 900 | 0.121 |
| 46 | LVX.GND | BUCK5.OUT- | GND | gnd | 0.50 | AWG26 | 0.13 | black | 900 | 0.121 |
| 47 | MDD10A.M1A | PERI.+ | load output | out | 0.25 | AWG26 | 0.13 | white | 800 | 0.054 |
| 48 | MDD10A.M1B | PERI.- | load output | out | 0.25 | AWG26 | 0.13 | white | 800 | 0.054 |
| 49 | MDD10A.M2A | AUGER.+ | load output | out | 0.15 | AWG26 | 0.13 | white | 900 | 0.036 |
| 50 | MDD10A.M2B | AUGER.- | load output | out | 0.15 | AWG26 | 0.13 | white | 900 | 0.036 |
| 51 | MDD3A.M1A | TOPSTIR.+ | load output | out | 0.20 | AWG26 | 0.13 | white | 800 | 0.043 |
| 52 | MDD3A.M1B | TOPSTIR.- | load output | out | 0.20 | AWG26 | 0.13 | white | 800 | 0.043 |
| 53 | MDD3A.M2A | RINSE.+ | load output | out | 0.80 | AWG26 | 0.13 | white | 700 | 0.150 |
| 54 | MDD3A.M2B | RINSE.- | load output | out | 0.80 | AWG26 | 0.13 | white | 700 | 0.150 |
| 55 | MOS.OUT+ | CHSTIR.+ | load output | out | 0.30 | AWG26 | 0.13 | white | 400 | 0.032 |
| 56 | MOS.OUT- | CHSTIR.- | load output | out | 0.30 | AWG26 | 0.13 | white | 400 | 0.032 |
| 57 | MOS2.OUT+ | BIOAUG.+ | load output | out | 0.06 | AWG26 | 0.13 | white | 600 | 0.010 |
| 58 | MOS2.OUT- | BIOAUG.- | load output | out | 0.06 | AWG26 | 0.13 | white | 600 | 0.010 |
| 59 | RELAY.NO | VALVE.+ | load output | out | 1.50 | AWG24 | 0.2 | white | 500 | 0.126 |
| 60 | LAMPDRV.OUT1 | LAMPS.-G | load output | out | 0.04 | AWG26 | 0.13 | white | 600 | 0.006 |
| 61 | LAMPDRV.OUT2 | LAMPS.-R | load output | out | 0.04 | AWG26 | 0.13 | white | 600 | 0.006 |
| 62 | MEGA.D5 | MDD10A.PWM1 | PWM | pwm |  | AWG26 | 0.13 | PWM | 250 |  |
| 63 | MEGA.D4 | MDD10A.DIR1 | digital | dig |  | AWG26 | 0.13 | digital | 250 |  |
| 64 | MEGA.D6 | MDD10A.PWM2 | PWM | pwm |  | AWG26 | 0.13 | PWM | 250 |  |
| 65 | MEGA.D3 | MDD10A.DIR2 | digital | dig |  | AWG26 | 0.13 | digital | 250 |  |
| 66 | MEGA.D7 | MDD3A.M1A_in | PWM | pwm |  | AWG26 | 0.13 | PWM | 250 |  |
| 67 | MEGA.D14 | MDD3A.M1B_in | digital | dig |  | AWG26 | 0.13 | digital | 250 |  |
| 68 | MEGA.D8 | MDD3A.M2A_in | PWM | pwm |  | AWG26 | 0.13 | PWM | 250 |  |
| 69 | MEGA.D15 | MDD3A.M2B_in | digital | dig |  | AWG26 | 0.13 | digital | 250 |  |
| 70 | MEGA.D9 | MOS.SIG | PWM | pwm |  | AWG26 | 0.13 | PWM | 250 |  |
| 71 | MEGA.D11 | MOS2.SIG | PWM | pwm |  | AWG26 | 0.13 | PWM | 250 |  |
| 72 | MEGA.D40 | RELAY.IN | digital | dig |  | AWG26 | 0.13 | digital | 250 |  |
| 73 | MEGA.D12 | SERVO.SIG | PWM | pwm |  | AWG26 | 0.13 | PWM | 250 |  |
| 74 | PH.Po | MEGA.A0 | analog | ana |  | AWG26 | 0.13 | analog | 250 |  |
| 75 | BTN.START | MEGA.D42 | digital | dig |  | AWG26 | 0.13 | digital | 250 |  |
| 76 | BTN.STOP | MEGA.D44 | digital | dig |  | AWG26 | 0.13 | digital | 250 |  |
| 77 | ESTOP.NC2a | MEGA.D46 | digital | dig |  | AWG26 | 0.13 | digital | 250 |  |
| 78 | MEGA.D48 | LAMPDRV.IN1 | digital | dig |  | AWG26 | 0.13 | digital | 250 |  |
| 79 | MEGA.D50 | LAMPDRV.IN2 | digital | dig |  | AWG26 | 0.13 | digital | 250 |  |
| 80 | LVA.OUT | MEGA.D34 | digital | dig |  | AWG26 | 0.13 | digital | 250 |  |
| 81 | LVW.OUT | MEGA.D36 | digital | dig |  | AWG26 | 0.13 | digital | 250 |  |
| 82 | LVX.OUT | MEGA.D38 | digital | dig |  | AWG26 | 0.13 | digital | 250 |  |
| 83 | MEGA.TX1 | DIV.in | UART/I2C | comm |  | AWG26 | 0.13 | UART/I2C | 250 |  |
| 84 | DIV.out | ESP.RX | UART/I2C | comm |  | AWG24 | 0.2 | UART/I2C | 700 |  |
| 85 | ESP.TX | MEGA.RX1 | UART/I2C | comm |  | AWG24 | 0.2 | UART/I2C | 700 |  |
| 86 | ESTOP.out | MOS3.V+ | +12 V | v12 | 0.40 | AWG14 | 2.5 | red | 500 | 0.003 |
| 87 | ESTOP.out | MOS4.V+ | +12 V | v12 | 0.40 | AWG14 | 2.5 | red | 500 | 0.003 |
| 88 | ESTOP.out | MOS5.V+ | +12 V | v12 | 0.40 | AWG14 | 2.5 | red | 500 | 0.003 |
| 89 | ESTOP.out | MOS6.V+ | +12 V | v12 | 0.15 | AWG14 | 2.5 | red | 500 | 0.001 |
| 90 | ESTOP.out | MDD3B.VB+ | +12 V | v12 | 0.60 | AWG14 | 2.5 | red | 500 | 0.005 |
| 91 | BUCK6.IN- | MOS3.GND | GND | gnd | 1.00 | AWG24 | 0.2 | black | 300 | 0.050 |
| 92 | BUCK6.IN- | MOS4.GND | GND | gnd | 1.00 | AWG24 | 0.2 | black | 300 | 0.050 |
| 93 | BUCK6.IN- | MOS5.GND | GND | gnd | 1.00 | AWG24 | 0.2 | black | 300 | 0.050 |
| 94 | BUCK6.IN- | MOS6.GND | GND | gnd | 1.00 | AWG24 | 0.2 | black | 300 | 0.050 |
| 95 | BUCK6.IN- | MDD3B.GND | GND | gnd | 1.00 | AWG24 | 0.2 | black | 300 | 0.050 |
| 96 | MOS3.OUT+ | SOL1.+ | load output | out | 0.40 | AWG26 | 0.13 | white | 1200 | 0.129 |
| 97 | MOS3.OUT- | SOL1.- | load output | out | 0.40 | AWG26 | 0.13 | white | 1200 | 0.129 |
| 98 | MOS4.OUT+ | SOL2.+ | load output | out | 0.40 | AWG26 | 0.13 | white | 1200 | 0.129 |
| 99 | MOS4.OUT- | SOL2.- | load output | out | 0.40 | AWG26 | 0.13 | white | 1200 | 0.129 |
| 100 | MOS5.OUT+ | SOL3.+ | load output | out | 0.40 | AWG26 | 0.13 | white | 1200 | 0.129 |
| 101 | MOS5.OUT- | SOL3.- | load output | out | 0.40 | AWG26 | 0.13 | white | 1200 | 0.129 |
| 102 | MOS6.OUT+ | DRYFAN.+ | load output | out | 0.15 | AWG26 | 0.13 | white | 1300 | 0.052 |
| 103 | MOS6.OUT- | DRYFAN.- | load output | out | 0.15 | AWG26 | 0.13 | white | 1300 | 0.052 |
| 104 | MDD3B.M1A | ACIDP.+ | load output | out | 0.30 | AWG26 | 0.13 | white | 900 | 0.072 |
| 105 | MDD3B.M1B | ACIDP.- | load output | out | 0.30 | AWG26 | 0.13 | white | 900 | 0.072 |
| 106 | MDD3B.M2A | NAOHP.+ | load output | out | 0.30 | AWG26 | 0.13 | white | 900 | 0.072 |
| 107 | MDD3B.M2B | NAOHP.- | load output | out | 0.30 | AWG26 | 0.13 | white | 900 | 0.072 |
| 108 | BUCK5.OUT+ | NTC.V+ | +5 V | v5 | 0.05 | AWG26 | 0.13 | orange | 1300 | 0.017 |
| 109 | NTC.GND | BUCK5.OUT- | GND | gnd | 0.50 | AWG26 | 0.13 | black | 1300 | 0.174 |
| 110 | BUCK5.OUT+ | BUZ.VCC | +5 V | v5 | 0.03 | AWG26 | 0.13 | orange | 200 | 0.002 |
| 111 | BUZ.GND | BUCK5.OUT- | GND | gnd | 0.50 | AWG26 | 0.13 | black | 200 | 0.027 |
| 112 | SSR.IN- | BUCK5.OUT- | GND | gnd | 0.50 | AWG26 | 0.13 | black | 200 | 0.027 |
| 113 | MEGA.D23 | MOS3.SIG | digital | dig |  | AWG26 | 0.13 | digital | 300 |  |
| 114 | MEGA.D25 | MOS4.SIG | digital | dig |  | AWG26 | 0.13 | digital | 300 |  |
| 115 | MEGA.D27 | MOS5.SIG | digital | dig |  | AWG26 | 0.13 | digital | 300 |  |
| 116 | MEGA.D29 | MOS6.SIG | digital | dig |  | AWG26 | 0.13 | digital | 300 |  |
| 117 | MEGA.D31 | SSR.IN+ | digital | dig |  | AWG26 | 0.13 | digital | 300 |  |
| 118 | MEGA.D2 | MDD3B.M1A_in | PWM | pwm |  | AWG26 | 0.13 | PWM | 300 |  |
| 119 | MEGA.D24 | MDD3B.M1B_in | digital | dig |  | AWG26 | 0.13 | digital | 300 |  |
| 120 | MEGA.D10 | MDD3B.M2A_in | PWM | pwm |  | AWG26 | 0.13 | PWM | 300 |  |
| 121 | MEGA.D26 | MDD3B.M2B_in | digital | dig |  | AWG26 | 0.13 | digital | 300 |  |
| 122 | MEGA.D28 | BUZ.IO | digital | dig |  | AWG26 | 0.13 | digital | 300 |  |
| 123 | NTC.OUT | MEGA.A1 | analog | ana |  | AWG26 | 0.13 | analog | 300 |  |

## Wire to buy (add 30 % for routing)

| AWG | mm² | Net | Metres |
|---|---|---|---|
| 14 | 2.5 | +12 V | 8.0 |
| 16 | 1.5 | GND | 0.2 |
| 18 | 0.75 | AC L | 0.3 |
| 18 | 0.75 | AC N | 0.3 |
| 18 | 0.75 | PE | 0.3 |
| 24 | 0.2 | UART/I2C | 1.8 |
| 24 | 0.2 | GND | 4.7 |
| 24 | 0.2 | load output | 0.7 |
| 24 | 0.2 | +6 V | 0.8 |
| 26 | 0.13 | analog | 0.7 |
| 26 | 0.13 | UART/I2C | 0.3 |
| 26 | 0.13 | digital | 7.3 |
| 26 | 0.13 | GND | 9.7 |
| 26 | 0.13 | load output | 29.9 |
| 26 | 0.13 | PWM | 3.1 |
| 26 | 0.13 | +12 V | 3.0 |
| 26 | 0.13 | +5 V | 7.0 |
