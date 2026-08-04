# Anomaly Watch v4.3 — 3 Independent Layers

## Three independent layers
1. V5.1 locks numbers.
2. Station Match compares stations after the numbers are locked.
3. Anomaly Watch only raises statistical warnings.

No combined score is created. ALIGNMENT / CONFLICT / NEUTRAL / STATION WATCH are labels only.

## Anomaly model
Uses all 18 raw two-digit prize tails per station/draw, preserving duplicates.
Uniform null: p=1% for each 00–99 tail.

Windows:
- 30 draws = 540 raw outcomes
- 100 draws = 1,800
- 300 draws = 5,400

Diagnostics:
- Z30 / Z100 / Z300
- recent-30 vs previous-up-to-270 drift Z
- global Benjamini–Hochberg FDR across station × window × number
- station-level 00–99 chi-square distribution check with station FDR

Alert rules:
- WATCH: |Z| >= 2.5 in a window or drift
- PERSISTENT: same direction |Z| >= 1.8 in >=2 windows, with >=1 window |Z| >= 2.5
- FDR CONFIRMED is shown separately at q <= .05

## Snapshot packaged here
Seed history through 2026-03-23.
- WATCH/PERSISTENT number flags: 89
- Persistent flags: 46
- Global FDR-confirmed number tests: 0

The GitHub workflow rebuilds this from the live historical CSV after each new draw.

## Descriptive forward check 2006–2025
Using only earlier station history before the next draw:

PERSISTENT_UP:
- all: +0.76 pp vs 16.55% theoretical next-draw hit baseline
- development 2006–2016: +0.93 pp
- validation 2017–2022: +0.86 pp
- holdout 2023–2025: +0.40 pp

PERSISTENT_DOWN:
- all: -0.37 pp
- development: -0.11 pp
- validation: -0.49 pp
- holdout: -0.74 pp

Directions are interesting but exposures are dependent across numbers/time and thresholds involve multiple testing. This remains a warning/research layer, not a probability model.

## Interaction labels
- ALIGNMENT: clear Station Match + >=1 locked core number has an UP anomaly.
- CONFLICT: clear Station Match + >=1 locked core number has a DOWN anomaly.
- NEUTRAL: no clear station or core numbers statistically normal.
- STATION WATCH: entire matched-station distribution is FDR-significant.

None of these changes V5.1, Station Match, picks, or stake sizing.

## Physical-cause limitation
Without machine ID, ball-set ID, maintenance/change date and operator metadata, the app must only say “statistical anomaly detected”. It must not claim worn balls, a biased cage, or a mechanical defect.
