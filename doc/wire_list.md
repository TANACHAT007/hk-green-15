# HK-Green-15 — wire list

Label both ends with the wire number. Gauge = practical chassis rating (×1.25) and voltage drop (≤ 3 % logic, ≤ 5 % motor bus).

| # | From | To | Function | Kind | I (A) | AWG | mm² | Colour | Length mm | ΔV (V) |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | IEC.L | PSU.L | AC L | ac_l | 0.05 | AWG18 | 0.75 | brown | 250 | 0.003 |
| 2 | IEC.N | PSU.N | AC N | ac_n | 0.05 | AWG18 | 0.75 | blue | 250 | 0.003 |
| 3 | IEC.PE | PSU.PE | PE | pe | 0.05 | AWG18 | 0.75 |  | 250 | 0.003 |
| 4 | PSU.+V | F1.in | +12 V | v12 | 3.82 | AWG16 | 1.5 | red | 150 | 0.015 |
| 5 | F1.out | ESTOP.in | +12 V | v12 | 3.82 | AWG16 | 1.5 | red | 500 | 0.050 |
| 6 | ESTOP.out | MDD10A.VB+ | +12 V | v12 | 0.40 | AWG16 | 1.5 | red | 500 | 0.005 |
| 7 | ESTOP.out | MDD3A.VB+ | +12 V | v12 | 1.00 | AWG16 | 1.5 | red | 500 | 0.013 |
| 8 | ESTOP.out | MOS.V+ | +12 V | v12 | 0.30 | AWG16 | 1.5 | red | 500 | 0.004 |
| 9 | ESTOP.out | MOS2.V+ | +12 V | v12 | 0.06 | AWG16 | 1.5 | red | 500 | 0.001 |
| 10 | ESTOP.out | RELAY.COM | +12 V | v12 | 1.50 | AWG16 | 1.5 | red | 500 | 0.019 |
| 11 | ESTOP.out | BUCK6.IN+ | +12 V | v12 | 0.56 | AWG16 | 1.5 | red | 500 | 0.007 |
| 12 | PSU.+V | F2.in | +12 V | v12 | 0.48 | AWG26 | 0.13 | red | 150 | 0.019 |
| 13 | F2.out | BUCK5.IN+ | +12 V | v12 | 0.29 | AWG26 | 0.13 | red | 150 | 0.012 |
| 14 | F2.out | LAMPDRV.COM | +12 V | v12 | 0.04 | AWG26 | 0.13 | red | 400 | 0.004 |
| 15 | F2.out | LAMPS.+G | +12 V | v12 | 0.04 | AWG26 | 0.13 | red | 600 | 0.006 |
| 16 | F2.out | LAMPS.+R | +12 V | v12 | 0.04 | AWG26 | 0.13 | red | 600 | 0.006 |
| 17 | F2.out | BAYFAN.+ | +12 V | v12 | 0.15 | AWG26 | 0.13 | red | 400 | 0.016 |
| 18 | BUCK5.OUT+ | MEGA.5V | +5 V | v5 | 0.10 | AWG26 | 0.13 | orange | 200 | 0.005 |
| 19 | BUCK5.OUT+ | ESP.5V | +5 V | v5 | 0.50 | AWG26 | 0.13 | orange | 700 | 0.094 |
| 20 | BUCK5.OUT+ | RELAY.VCC | +5 V | v5 | 0.05 | AWG26 | 0.13 | orange | 200 | 0.003 |
| 21 | BUCK5.OUT+ | PH.V+ | +5 V | v5 | 0.02 | AWG26 | 0.13 | orange | 300 | 0.002 |
| 22 | BUCK6.OUT+ | SERVO.+ | +6 V | v6 | 1.00 | AWG24 | 0.2 | pink | 600 | 0.101 |
| 23 | GND.g1 | PSU.-V | GND | gnd | 3.82 | AWG20 | 0.5 | black | 150 | 0.038 |
| 24 | GND.g2 | MDD10A.GND | GND | gnd | 0.25 | AWG26 | 0.13 | black | 150 | 0.010 |
| 25 | GND.g3 | MDD3A.GND | GND | gnd | 0.80 | AWG26 | 0.13 | black | 150 | 0.032 |
| 26 | GND.g4 | MOS.GND | GND | gnd | 0.30 | AWG26 | 0.13 | black | 150 | 0.012 |
| 27 | GND.g5 | MOS2.GND | GND | gnd | 0.06 | AWG26 | 0.13 | black | 150 | 0.002 |
| 28 | GND.g6 | BUCK5.IN- | GND | gnd | 0.50 | AWG26 | 0.13 | black | 150 | 0.020 |
| 29 | GND.g7 | BUCK6.IN- | GND | gnd | 1.00 | AWG24 | 0.2 | black | 250 | 0.042 |
| 30 | GND.g8 | MEGA.GND | GND | gnd | 0.05 | AWG26 | 0.13 | black | 250 | 0.003 |
| 31 | GND.g9 | ESP.GND | GND | gnd | 0.05 | AWG26 | 0.13 | black | 700 | 0.009 |
| 32 | GND.g10 | RELAY.GND | GND | gnd | 1.50 | AWG24 | 0.2 | black | 250 | 0.063 |
| 33 | GND.g11 | PH.GND | GND | gnd | 0.05 | AWG26 | 0.13 | black | 250 | 0.003 |
| 34 | GND.g12 | LAMPDRV.GND | GND | gnd | 0.05 | AWG26 | 0.13 | black | 250 | 0.003 |
| 35 | GND.g13 | BAYFAN.- | GND | gnd | 0.05 | AWG26 | 0.13 | black | 250 | 0.003 |
| 36 | BUCK6.OUT- | SERVO.- | GND | gnd | 1.00 | AWG24 | 0.2 | black | 600 | 0.101 |
| 37 | BUCK5.OUT- | DIV.GND | GND | gnd | 0.50 | AWG26 | 0.13 | black | 200 | 0.027 |
| 38 | VALVE.- | BUCK6.IN- | GND | gnd | 1.00 | AWG24 | 0.2 | black | 500 | 0.084 |
| 39 | ESTOP.NC2b | BUCK5.OUT- | GND | gnd | 1.50 | AWG24 | 0.2 | black | 500 | 0.126 |
| 40 | BTN.COM | BUCK5.OUT- | GND | gnd | 0.50 | AWG26 | 0.13 | black | 600 | 0.080 |
| 41 | MDD10A.M1A | PERI.+ | load output | out | 0.25 | AWG26 | 0.13 | white | 800 | 0.054 |
| 42 | MDD10A.M1B | PERI.- | load output | out | 0.25 | AWG26 | 0.13 | white | 800 | 0.054 |
| 43 | MDD10A.M2A | AUGER.+ | load output | out | 0.15 | AWG26 | 0.13 | white | 900 | 0.036 |
| 44 | MDD10A.M2B | AUGER.- | load output | out | 0.15 | AWG26 | 0.13 | white | 900 | 0.036 |
| 45 | MDD3A.M1A | TOPSTIR.+ | load output | out | 0.20 | AWG26 | 0.13 | white | 800 | 0.043 |
| 46 | MDD3A.M1B | TOPSTIR.- | load output | out | 0.20 | AWG26 | 0.13 | white | 800 | 0.043 |
| 47 | MDD3A.M2A | RINSE.+ | load output | out | 0.80 | AWG26 | 0.13 | white | 700 | 0.150 |
| 48 | MDD3A.M2B | RINSE.- | load output | out | 0.80 | AWG26 | 0.13 | white | 700 | 0.150 |
| 49 | MOS.OUT+ | CHSTIR.+ | load output | out | 0.30 | AWG26 | 0.13 | white | 400 | 0.032 |
| 50 | MOS.OUT- | CHSTIR.- | load output | out | 0.30 | AWG26 | 0.13 | white | 400 | 0.032 |
| 51 | MOS2.OUT+ | BIOAUG.+ | load output | out | 0.06 | AWG26 | 0.13 | white | 600 | 0.010 |
| 52 | MOS2.OUT- | BIOAUG.- | load output | out | 0.06 | AWG26 | 0.13 | white | 600 | 0.010 |
| 53 | RELAY.NO | VALVE.+ | load output | out | 1.50 | AWG24 | 0.2 | white | 500 | 0.126 |
| 54 | LAMPDRV.OUT1 | LAMPS.-G | load output | out | 0.04 | AWG26 | 0.13 | white | 600 | 0.006 |
| 55 | LAMPDRV.OUT2 | LAMPS.-R | load output | out | 0.04 | AWG26 | 0.13 | white | 600 | 0.006 |
| 56 | MEGA.D5 | MDD10A.PWM1 | PWM | pwm |  | AWG26 | 0.13 | PWM | 250 |  |
| 57 | MEGA.D4 | MDD10A.DIR1 | digital | dig |  | AWG26 | 0.13 | digital | 250 |  |
| 58 | MEGA.D6 | MDD10A.PWM2 | PWM | pwm |  | AWG26 | 0.13 | PWM | 250 |  |
| 59 | MEGA.D3 | MDD10A.DIR2 | digital | dig |  | AWG26 | 0.13 | digital | 250 |  |
| 60 | MEGA.D7 | MDD3A.M1A_in | PWM | pwm |  | AWG26 | 0.13 | PWM | 250 |  |
| 61 | MEGA.D14 | MDD3A.M1B_in | digital | dig |  | AWG26 | 0.13 | digital | 250 |  |
| 62 | MEGA.D8 | MDD3A.M2A_in | PWM | pwm |  | AWG26 | 0.13 | PWM | 250 |  |
| 63 | MEGA.D15 | MDD3A.M2B_in | digital | dig |  | AWG26 | 0.13 | digital | 250 |  |
| 64 | MEGA.D9 | MOS.SIG | PWM | pwm |  | AWG26 | 0.13 | PWM | 250 |  |
| 65 | MEGA.D11 | MOS2.SIG | PWM | pwm |  | AWG26 | 0.13 | PWM | 250 |  |
| 66 | MEGA.D40 | RELAY.IN | digital | dig |  | AWG26 | 0.13 | digital | 250 |  |
| 67 | MEGA.D12 | SERVO.SIG | PWM | pwm |  | AWG26 | 0.13 | PWM | 250 |  |
| 68 | PH.Po | MEGA.A0 | analog | ana |  | AWG26 | 0.13 | analog | 250 |  |
| 69 | BTN.START | MEGA.D42 | digital | dig |  | AWG26 | 0.13 | digital | 250 |  |
| 70 | BTN.STOP | MEGA.D44 | digital | dig |  | AWG26 | 0.13 | digital | 250 |  |
| 71 | ESTOP.NC2a | MEGA.D46 | digital | dig |  | AWG26 | 0.13 | digital | 250 |  |
| 72 | MEGA.D48 | LAMPDRV.IN1 | digital | dig |  | AWG26 | 0.13 | digital | 250 |  |
| 73 | MEGA.D50 | LAMPDRV.IN2 | digital | dig |  | AWG26 | 0.13 | digital | 250 |  |
| 74 | MEGA.TX1 | DIV.in | UART/I2C | comm |  | AWG26 | 0.13 | UART/I2C | 250 |  |
| 75 | DIV.out | ESP.RX | UART/I2C | comm |  | AWG24 | 0.2 | UART/I2C | 700 |  |
| 76 | ESP.TX | MEGA.RX1 | UART/I2C | comm |  | AWG24 | 0.2 | UART/I2C | 700 |  |

## Wire to buy (add 30 % for routing)

| AWG | mm² | Net | Metres |
|---|---|---|---|
| 16 | 1.5 | +12 V | 4.7 |
| 18 | 0.75 | AC L | 0.3 |
| 18 | 0.75 | AC N | 0.3 |
| 18 | 0.75 | PE | 0.3 |
| 20 | 0.5 | GND | 0.2 |
| 24 | 0.2 | UART/I2C | 1.8 |
| 24 | 0.2 | GND | 2.7 |
| 24 | 0.2 | load output | 0.7 |
| 24 | 0.2 | +6 V | 0.8 |
| 26 | 0.13 | analog | 0.3 |
| 26 | 0.13 | UART/I2C | 0.3 |
| 26 | 0.13 | digital | 3.2 |
| 26 | 0.13 | GND | 4.2 |
| 26 | 0.13 | load output | 12.5 |
| 26 | 0.13 | PWM | 2.3 |
| 26 | 0.13 | +12 V | 3.0 |
| 26 | 0.13 | +5 V | 1.8 |
