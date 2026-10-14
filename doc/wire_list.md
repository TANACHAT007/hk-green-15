# HK-Green-15 — wire list

Label both ends with the wire number. Gauge = practical chassis rating (×1.25) and voltage drop (≤ 3 % logic, ≤ 5 % motor bus).

| # | From | To | Function | Kind | I (A) | AWG | mm² | Colour | Length mm | ΔV (V) |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | IEC.L | PSU.L | AC L | ac_l | 0.05 | AWG18 | 0.75 | brown | 250 | 0.003 |
| 2 | IEC.N | PSU.N | AC N | ac_n | 0.05 | AWG18 | 0.75 | blue | 250 | 0.003 |
| 3 | IEC.PE | PSU.PE | PE | pe | 0.05 | AWG18 | 0.75 |  | 250 | 0.003 |
| 4 | PSU.+V | F1.in | +12 V | v12 | 3.76 | AWG16 | 1.5 | red | 150 | 0.015 |
| 5 | F1.out | ESTOP.in | +12 V | v12 | 3.76 | AWG16 | 1.5 | red | 500 | 0.049 |
| 6 | ESTOP.out | MDD10A.VB+ | +12 V | v12 | 0.40 | AWG16 | 1.5 | red | 500 | 0.005 |
| 7 | ESTOP.out | MDD3A.VB+ | +12 V | v12 | 1.00 | AWG16 | 1.5 | red | 500 | 0.013 |
| 8 | ESTOP.out | MOS.V+ | +12 V | v12 | 0.30 | AWG16 | 1.5 | red | 500 | 0.004 |
| 9 | ESTOP.out | RELAY.COM | +12 V | v12 | 1.50 | AWG16 | 1.5 | red | 500 | 0.019 |
| 10 | ESTOP.out | BUCK6.IN+ | +12 V | v12 | 0.56 | AWG16 | 1.5 | red | 500 | 0.007 |
| 11 | PSU.+V | F2.in | +12 V | v12 | 0.48 | AWG26 | 0.13 | red | 150 | 0.019 |
| 12 | F2.out | BUCK5.IN+ | +12 V | v12 | 0.29 | AWG26 | 0.13 | red | 150 | 0.012 |
| 13 | F2.out | LAMPDRV.COM | +12 V | v12 | 0.04 | AWG26 | 0.13 | red | 400 | 0.004 |
| 14 | F2.out | LAMPS.+G | +12 V | v12 | 0.04 | AWG26 | 0.13 | red | 600 | 0.006 |
| 15 | F2.out | LAMPS.+R | +12 V | v12 | 0.04 | AWG26 | 0.13 | red | 600 | 0.006 |
| 16 | F2.out | BAYFAN.+ | +12 V | v12 | 0.15 | AWG26 | 0.13 | red | 400 | 0.016 |
| 17 | BUCK5.OUT+ | MEGA.5V | +5 V | v5 | 0.10 | AWG26 | 0.13 | orange | 200 | 0.005 |
| 18 | BUCK5.OUT+ | ESP.5V | +5 V | v5 | 0.50 | AWG26 | 0.13 | orange | 700 | 0.094 |
| 19 | BUCK5.OUT+ | RELAY.VCC | +5 V | v5 | 0.05 | AWG26 | 0.13 | orange | 200 | 0.003 |
| 20 | BUCK5.OUT+ | PH.V+ | +5 V | v5 | 0.02 | AWG26 | 0.13 | orange | 300 | 0.002 |
| 21 | BUCK6.OUT+ | SERVO.+ | +6 V | v6 | 1.00 | AWG24 | 0.2 | pink | 600 | 0.101 |
| 22 | GND.g1 | PSU.-V | GND | gnd | 3.76 | AWG20 | 0.5 | black | 150 | 0.037 |
| 23 | GND.g2 | MDD10A.GND | GND | gnd | 0.25 | AWG26 | 0.13 | black | 150 | 0.010 |
| 24 | GND.g3 | MDD3A.GND | GND | gnd | 0.80 | AWG26 | 0.13 | black | 150 | 0.032 |
| 25 | GND.g4 | MOS.GND | GND | gnd | 0.30 | AWG26 | 0.13 | black | 150 | 0.012 |
| 26 | GND.g5 | BUCK5.IN- | GND | gnd | 0.50 | AWG26 | 0.13 | black | 150 | 0.020 |
| 27 | GND.g6 | BUCK6.IN- | GND | gnd | 1.00 | AWG24 | 0.2 | black | 150 | 0.025 |
| 28 | GND.g7 | MEGA.GND | GND | gnd | 0.05 | AWG26 | 0.13 | black | 250 | 0.003 |
| 29 | GND.g8 | ESP.GND | GND | gnd | 0.05 | AWG26 | 0.13 | black | 700 | 0.009 |
| 30 | GND.g9 | RELAY.GND | GND | gnd | 1.50 | AWG24 | 0.2 | black | 250 | 0.063 |
| 31 | GND.g10 | PH.GND | GND | gnd | 0.05 | AWG26 | 0.13 | black | 250 | 0.003 |
| 32 | GND.g11 | LAMPDRV.GND | GND | gnd | 0.05 | AWG26 | 0.13 | black | 250 | 0.003 |
| 33 | GND.g12 | BAYFAN.- | GND | gnd | 0.05 | AWG26 | 0.13 | black | 250 | 0.003 |
| 34 | BUCK6.OUT- | SERVO.- | GND | gnd | 1.00 | AWG24 | 0.2 | black | 600 | 0.101 |
| 35 | BUCK5.OUT- | DIV.GND | GND | gnd | 0.50 | AWG26 | 0.13 | black | 200 | 0.027 |
| 36 | VALVE.- | BUCK6.IN- | GND | gnd | 1.00 | AWG24 | 0.2 | black | 500 | 0.084 |
| 37 | ESTOP.NC2b | BUCK5.OUT- | GND | gnd | 1.50 | AWG24 | 0.2 | black | 500 | 0.126 |
| 38 | BTN.COM | BUCK5.OUT- | GND | gnd | 0.50 | AWG26 | 0.13 | black | 600 | 0.080 |
| 39 | MDD10A.M1A | PERI.+ | load output | out | 0.25 | AWG26 | 0.13 | white | 800 | 0.054 |
| 40 | MDD10A.M1B | PERI.- | load output | out | 0.25 | AWG26 | 0.13 | white | 800 | 0.054 |
| 41 | MDD10A.M2A | AUGER.+ | load output | out | 0.15 | AWG26 | 0.13 | white | 900 | 0.036 |
| 42 | MDD10A.M2B | AUGER.- | load output | out | 0.15 | AWG26 | 0.13 | white | 900 | 0.036 |
| 43 | MDD3A.M1A | TOPSTIR.+ | load output | out | 0.20 | AWG26 | 0.13 | white | 800 | 0.043 |
| 44 | MDD3A.M1B | TOPSTIR.- | load output | out | 0.20 | AWG26 | 0.13 | white | 800 | 0.043 |
| 45 | MDD3A.M2A | RINSE.+ | load output | out | 0.80 | AWG26 | 0.13 | white | 700 | 0.150 |
| 46 | MDD3A.M2B | RINSE.- | load output | out | 0.80 | AWG26 | 0.13 | white | 700 | 0.150 |
| 47 | MOS.OUT+ | CHSTIR.+ | load output | out | 0.30 | AWG26 | 0.13 | white | 400 | 0.032 |
| 48 | MOS.OUT- | CHSTIR.- | load output | out | 0.30 | AWG26 | 0.13 | white | 400 | 0.032 |
| 49 | RELAY.NO | VALVE.+ | load output | out | 1.50 | AWG24 | 0.2 | white | 500 | 0.126 |
| 50 | LAMPDRV.OUT1 | LAMPS.-G | load output | out | 0.04 | AWG26 | 0.13 | white | 600 | 0.006 |
| 51 | LAMPDRV.OUT2 | LAMPS.-R | load output | out | 0.04 | AWG26 | 0.13 | white | 600 | 0.006 |
| 52 | MEGA.D5 | MDD10A.PWM1 | PWM | pwm |  | AWG26 | 0.13 | PWM | 250 |  |
| 53 | MEGA.D22 | MDD10A.DIR1 | digital | dig |  | AWG26 | 0.13 | digital | 250 |  |
| 54 | MEGA.D6 | MDD10A.PWM2 | PWM | pwm |  | AWG26 | 0.13 | PWM | 250 |  |
| 55 | MEGA.D23 | MDD10A.DIR2 | digital | dig |  | AWG26 | 0.13 | digital | 250 |  |
| 56 | MEGA.D7 | MDD3A.M1A_in | PWM | pwm |  | AWG26 | 0.13 | PWM | 250 |  |
| 57 | MEGA.D24 | MDD3A.M1B_in | digital | dig |  | AWG26 | 0.13 | digital | 250 |  |
| 58 | MEGA.D8 | MDD3A.M2A_in | PWM | pwm |  | AWG26 | 0.13 | PWM | 250 |  |
| 59 | MEGA.D25 | MDD3A.M2B_in | digital | dig |  | AWG26 | 0.13 | digital | 250 |  |
| 60 | MEGA.D9 | MOS.SIG | PWM | pwm |  | AWG26 | 0.13 | PWM | 250 |  |
| 61 | MEGA.D26 | RELAY.IN | digital | dig |  | AWG26 | 0.13 | digital | 250 |  |
| 62 | MEGA.D10 | SERVO.SIG | PWM | pwm |  | AWG26 | 0.13 | PWM | 250 |  |
| 63 | PH.Po | MEGA.A0 | analog | ana |  | AWG26 | 0.13 | analog | 250 |  |
| 64 | BTN.START | MEGA.D30 | digital | dig |  | AWG26 | 0.13 | digital | 250 |  |
| 65 | BTN.STOP | MEGA.D31 | digital | dig |  | AWG26 | 0.13 | digital | 250 |  |
| 66 | ESTOP.NC2a | MEGA.D32 | digital | dig |  | AWG26 | 0.13 | digital | 250 |  |
| 67 | MEGA.D33 | LAMPDRV.IN1 | digital | dig |  | AWG26 | 0.13 | digital | 250 |  |
| 68 | MEGA.D34 | LAMPDRV.IN2 | digital | dig |  | AWG26 | 0.13 | digital | 250 |  |
| 69 | MEGA.TX1 | DIV.in | UART/I2C | comm |  | AWG26 | 0.13 | UART/I2C | 250 |  |
| 70 | DIV.out | ESP.RX | UART/I2C | comm |  | AWG24 | 0.2 | UART/I2C | 700 |  |
| 71 | ESP.TX | MEGA.RX1 | UART/I2C | comm |  | AWG24 | 0.2 | UART/I2C | 700 |  |

## Wire to buy (add 30 % for routing)

| AWG | mm² | Net | Metres |
|---|---|---|---|
| 16 | 1.5 | +12 V | 4.1 |
| 18 | 0.75 | AC L | 0.3 |
| 18 | 0.75 | AC N | 0.3 |
| 18 | 0.75 | PE | 0.3 |
| 20 | 0.5 | GND | 0.2 |
| 24 | 0.2 | UART/I2C | 1.8 |
| 24 | 0.2 | GND | 2.6 |
| 24 | 0.2 | load output | 0.7 |
| 24 | 0.2 | +6 V | 0.8 |
| 26 | 0.13 | analog | 0.3 |
| 26 | 0.13 | UART/I2C | 0.3 |
| 26 | 0.13 | digital | 3.2 |
| 26 | 0.13 | GND | 4.0 |
| 26 | 0.13 | load output | 10.9 |
| 26 | 0.13 | PWM | 2.0 |
| 26 | 0.13 | +12 V | 3.0 |
| 26 | 0.13 | +5 V | 1.8 |
