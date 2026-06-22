---
title: Automatic Emergency Braking
subtitle: Building an iTTC-based safety node that stops an autonomous racecar before collision — and why the naive implementation fails at speed.
tags: [{"label":"F1Tenth · Lab 2","color":"purple"},{"label":"ROS 2","color":"green"},{"label":"Python","color":"green"}]
github: https://github.com/IndraNeelMulakaloori/roboracer_upenn/tree/main/lab2_ws/src/lab2_pkg
youtube: IX63GQjZQbg
demo: https://youtu.be/IX63GQjZQbg
---

## overview

Lab 2 of the F1Tenth course is deceptively simple on paper: write a ROS 2 node that subscribes to LiDAR and odometry, and publishes a brake command before the car hits anything. No steering, no planning — just stop. In practice, getting it right across a range of speeds in a corridor environment with walls on all sides turned out to be more interesting than expected.

## the ittc algorithm

The metric is **Instantaneous Time to Collision (iTTC)** — for each LiDAR beam at angle θ, the closing speed onto that beam is the projection of the car's longitudinal velocity:

> ṙ = v · cos(θ)

iTTC for that beam is then `r / max(ṙ, 0)`. The `max(·, 0)` ensures beams where the car is moving away get iTTC = ∞ and are ignored. When `min(iTTC)` across all beams drops below **0.5 s**, an `AckermannDriveStamped` with `speed = 0.0` is published to `/drive`.

## the problem: false positives at speed

At low speeds (1–2.5 m/s) the basic algorithm worked cleanly. But above ~2.5 m/s, the node started braking mid-hallway with nothing ahead. The culprit: the corridor walls running alongside the car.

A wall directly to the side at 90° contributes zero closing speed (`cos(90°) = 0`). But beams that graze the wall at 70°–80° have a small but non-zero `cos(θ)`. At higher speeds, even this small projection pulls those beams' iTTC below 0.5 s — the node interprets a parallel wall as an imminent collision and brakes.

## the fix: lateral safety tube

The insight: a real forward collision can only involve obstacles within a narrow tube directly ahead of the car. Anything at a large lateral offset is a wall the car will pass, not hit. For each beam, the lateral displacement of the detected point is:

> y = r · sin(θ)

Any beam where `|y| > 0.25 m` is excluded from the iTTC computation entirely. This threshold — roughly the half-width of the car — creates a forward-only safety tube. Combined with the `closing_speed > 0` filter, this gave clean braking through the full tested speed range with zero hallway false positives.

## implementation notes

- **NumPy vectorised** — all beam operations computed as array ops in a single pass, no Python loops.
- **`np.isfinite()` mask** — drops NaN and ∞ from the raw scan before any computation.
- **Static guard** — if `|v| < 0.1 m/s` the scan callback exits immediately, avoiding spurious near-zero divisions at rest.
- **ε = 1e-6** — added to every denominator as a final zero-division safety net.

## result

The node reliably brakes before wall contact across all tested speeds. The lateral tube filter eliminated corridor false positives entirely — the car drives straight through hallways without a single unnecessary stop, then brakes cleanly when aimed directly at a wall.
