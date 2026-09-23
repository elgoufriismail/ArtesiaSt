# Timing report 1440x900

## 1. Load start times (nav logo entrance start → first hero word start)

Scheduled start times: original from WAAPI startTime + delay, clone from performance marks. 5 loads each.

| | per load (ms) | median |
|---|---|---|
| original | 1372, 1539, 1214, 1323, 1574 | **1372** |
| clone | 1345, 1343, 1344, 1343, 1343 | **1343** |

Δ median -28 ms (tol ±100): **pass**

Word starts relative to word 0 (scheduled, median): original 0, 100, 200, 300, 400, 500 · clone 0, 100, 200, 300, 400, 500 ms. Max |Δ| 0 ms (tol ±100): **pass**

## 2. Load curves (ms since navigation: 10 % / 50 % / 90 % opacity, interpolated; load 1)

| | original | clone |
|---|---|---|
| hero words | 2201/2650/3092 · 2302/2746/3202 · 2404/2845/3288 · 2505/2948/3392 · 2604/3051/3490 · 2702/3154/3587 | 2188/2627/3067 · 2287/2712/3103 · 2377/2812/3135 · 2486/2915/3238 · 2590/3021/3338 · 2673/3100/3438 |
| word duration 10→90 % | 891, 900, 884, 887, 886, 885 | 879, 816, 758, 752, 748, 765 |
| nav logo, 4 links, cta | 595/777/1105 · 763/956/1304 · 840/1052/1404 · 949/1165/1521 · 1071/1251/1626 · 1123/1365/1722 | 557/748/1112 · 758/937/1327 · 840/1061/1428 · 950/1171/1511 · 1074/1285/1614 · 1195/1384/1708 |
| nav 50 % relative to logo | 0, 179, 275, 388, 474, 588 | 0, 189, 313, 423, 537, 636 |
| words 50 % relative to word 0 (median of 5; informative, frame-quantised) | 0, 102, 200, 300, 401, 504 | 0, 93, 194, 288, 394, 473 |

## 3. Page Intro fade-out (jump to toggle-on): scrollY 0 → 1500

| | fresh samples | fitted (critically damped spring ω) | rmse vs own fit |
|---|---|---|---|
| original | 71 | ω=7.35 (Framer duration 1.256 s), t0 0 ms | 0.0128 (noise floor) |
| clone | 111 | ω=7.75 (Framer duration 1.191 s), t0 30 ms | 0.0087 |

| ms after jump | 50 | 100 | 150 | 200 | 300 | 450 | 600 | 800 | 1000 |
|---|---|---|---|---|---|---|---|---|---|
| original (fit) | 0.947 | 0.832 | 0.698 | 0.568 | 0.353 | 0.158 | 0.066 | 0.019 | 0.005 |
| clone (fit) | 0.989 | 0.897 | 0.761 | 0.621 | 0.382 | 0.164 | 0.065 | 0.018 | 0.005 |

Model-free: clone samples vs original runs (interpolated where original frames <= 50 ms apart; 96/111 samples covered): rmse 0.0155 (tol 0.02), max 0.068 (tol 0.15). Original run-to-run noise floor: rmse 0.0118, max 0.046. Gate (noise-aware): rmse <= max(0.02, noise floor) = 0.0200 and max <= 0.15: **pass**

## 3. Page Intro fade-in (jump back to top): scrollY 1500 → 0

| | fresh samples | fitted (critically damped spring ω) | rmse vs own fit |
|---|---|---|---|
| original | 53 | ω=10.95 (Framer duration 0.843 s), t0 8 ms | 0.0146 (noise floor) |
| clone | 80 | ω=10.95 (Framer duration 0.843 s), t0 6 ms | 0.0164 |

| ms after jump | 50 | 100 | 150 | 200 | 300 | 450 | 600 | 800 | 1000 |
|---|---|---|---|---|---|---|---|---|---|
| original (fit) | 0.078 | 0.267 | 0.460 | 0.621 | 0.828 | 0.954 | 0.989 | 0.998 | 1.000 |
| clone (fit) | 0.085 | 0.275 | 0.468 | 0.627 | 0.831 | 0.955 | 0.989 | 0.998 | 1.000 |

Model-free: clone samples vs original runs (interpolated where original frames <= 50 ms apart; 71/80 samples covered): rmse 0.0160 (tol 0.02), max 0.046 (tol 0.15). Original run-to-run noise floor: rmse 0.0192, max 0.050. Gate (noise-aware): rmse <= max(0.02, noise floor) = 0.0200 and max <= 0.15: **pass**

## 3. hero lines fade-out (jump to toggle-start): scrollY 0 → 800

| | fresh samples | fitted (tween 'strong' duration) | rmse vs own fit |
|---|---|---|---|
| original | 99 | duration 0.81 s, t0 34 ms | 0.0243 (noise floor) |
| clone | 133 | duration 0.80 s, t0 24 ms | 0.0079 |

| ms after jump | 50 | 100 | 150 | 200 | 300 | 450 | 600 | 800 | 1000 |
|---|---|---|---|---|---|---|---|---|---|
| original (fit) | 1.000 | 0.993 | 0.977 | 0.949 | 0.839 | 0.466 | 0.129 | 0.003 | 0.000 |
| clone (fit) | 0.999 | 0.991 | 0.972 | 0.940 | 0.817 | 0.420 | 0.107 | 0.001 | 0.000 |

Model-free: clone samples vs original runs (interpolated where original frames <= 50 ms apart; 133/133 samples covered): rmse 0.0255 (tol 0.02), max 0.069 (tol 0.15). Original run-to-run noise floor: rmse 0.0486, max 0.094. Gate (noise-aware): rmse <= max(0.02, noise floor) = 0.0486 and max <= 0.15: **pass**

## 3. hero lines fade-in (jump back to top): scrollY 800 → 0

| | fresh samples | fitted (tween 'strong' duration) | rmse vs own fit |
|---|---|---|---|
| original | 100 | duration 1.21 s, t0 20 ms | 0.0038 (noise floor) |
| clone | 194 | duration 1.20 s, t0 18 ms | 0.0014 |

| ms after jump | 50 | 100 | 150 | 200 | 300 | 450 | 600 | 800 | 1000 |
|---|---|---|---|---|---|---|---|---|---|
| original (fit) | 0.001 | 0.004 | 0.012 | 0.025 | 0.067 | 0.198 | 0.449 | 0.802 | 0.957 |
| clone (fit) | 0.001 | 0.005 | 0.013 | 0.026 | 0.070 | 0.205 | 0.463 | 0.812 | 0.961 |

Model-free: clone samples vs original runs (interpolated where original frames <= 50 ms apart; 194/194 samples covered): rmse 0.0094 (tol 0.02), max 0.023 (tol 0.15). Original run-to-run noise floor: rmse 0.0049, max 0.013. Gate (noise-aware): rmse <= max(0.02, noise floor) = 0.0200 and max <= 0.15: **pass**

all timing checks within tolerance
