---
title: PID Wall Following & Ablation Study
subtitle: From reactive braking to full closed-loop control — implementing a PD wall-follower, then building an automated 64-run ablation pipeline to find the optimal gains.
tags: [{"label":"F1Tenth · Lab 3","color":"purple"},{"label":"ROS 2","color":"green"},{"label":"Python","color":"green"}, {"label":"PID","color":"green"}]
github: https://github.com/IndraNeelMulakaloori/roboracer_upenn/tree/main/lab3_ws/src/lab3_pkg
youtube: IJxhWnC8JQw
demo: https://www.youtube.com/watch?v=IJxhWnC8JQw
---

## overview

Lab 3 is the first time the car actually drives itself. The goal: follow the inner wall of the Levine Hall map at speed without crashing, using a PID controller driven entirely by LiDAR. The lab has two parts — getting the control loop working, then doing something unusual for a course lab: building an automated ablation study to find the best gains scientifically instead of by hand.

## the wall-following geometry

The naive approach — just measure distance to the wall and react — fails at speed because the car's response is non-instantaneous. Instead, the car's orientation angle **α** relative to the wall is computed from two LiDAR beams: beam *b* at 90° and beam *a* at 45°:

> α = arctan( (a·cos θ − b) / (a·sin θ) )

This gives the current wall distance `Dt = b·cos(α)`, which is then projected forward by lookahead distance *L*:

> Dt+1 = Dt + L · sin(α)

The PID error is `e = desired_distance − Dt+1`. The controller reacts to where the car *will be*, not where it is now — critical for staying stable at high speed.

## the pd controller

> u(t) = Kp · e(t) + Kd · (de/dt)

The integral term (Ki) was intentionally left at zero. In a corridor with symmetric walls, integral windup causes the car to drift toward one side over time — a known failure mode. The derivative term uses precise `dt` from message timestamps rather than a fixed rate, preventing erratic jumps when callbacks arrive unevenly.

Speed is tied directly to steering output in discrete steps: straight (<10°) → 1.5 m/s · moderate corner (10–20°) → 1.0 m/s · sharp corner (>20°) → 0.5 m/s.

## the ablation study

Hand-tuning three continuous parameters (Kp, Kd, lookahead) in a physics simulator is impractical. `ablation_sweep.py` automates it — a 64-combination grid search using `itertools.product` that injects parameter sets directly into the ROS 2 node and records the result.

An odometry-based state machine tracked the car through four track sectors via X/Y coordinates from `/ego_racecar/odom`, logging a valid lap time on completion. Crash detection: if velocity dropped below 0.05 m/s for more than 2 s post-launch, the run was classified a crash — the script logged a 999.0 s penalty, executed `pkill` to destroy the ROS node, teleported the car to `/initialpose`, and immediately started the next combination.

## results: the valley of success

`visualisation.py` rendered a 3D scatter plot (Kp × Lookahead × lap time) that revealed three distinct regions:

- **Understeer Graveyard** — low Kp: car reacted too weakly, drifted into every corner.
- **Blind Zone** — low lookahead: car couldn't anticipate corners, blinded by inside walls mid-turn.
- **Valley of Success** — a tight cluster of fast, clean laps at moderate Kp + higher lookahead.

The three demo runs make this concrete: (Kp=0.0, LA=1.0) crashes immediately · (Kp=0.5, LA=0.5) reaches ¾ of the track before the low lookahead blinds it · (Kp=0.5, LA=1.0) completes the lap cleanly.
