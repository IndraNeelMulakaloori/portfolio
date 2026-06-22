---
title: Learning-Augmented MPPI Controller for Autonomous Navigation
desc: PPO supervisor dynamically adapts MPPI cost weights + LiDAR safety bubble online — 2,000 GPU rollouts per 50 ms, pushing the 1/10-scale motor near its physical limit of ~8.5 m/s.
tags: [{"label":"PPO","color":"green"},{"label":"F1Tenth","color":"purple"},{"label":"PyTorch","color":"green"},{"label":"CUDA","color":"green"},{"label":"Stable-Baselines3","color":"green"},{"label":"Python","color":"green"},{"label":"Reinforcement Learning","color":"purple"}]
youtube: qJhP0GkZjAA
demo: https://youtu.be/qJhP0GkZjAA
confidential: true
---

## overview

Developed a hybrid control architecture for the F1TENTH 1:10-scale autonomous racing platform that eliminates the need for manual, environment-specific tuning. The system uses a **Proximal Policy Optimization (PPO)** agent as a high-level supervisor to dynamically adapt **Model Predictive Path Integral (MPPI)** cost weights and a LiDAR safety bubble online — removing the need to hand-tune these parameters per track.

## high-performance GPU rollouts

Implemented a vectorized PyTorch MPPI controller that evaluates up to **2,000 parallel trajectories every 50 ms** on an RTX 3090 GPU. Computing this many rollouts at real-time frequency required restructuring the trajectory sampling loop as a batched tensor operation — no Python-level iteration over individual rollouts. This optimization pushed the 1/10-scale motor near its physical limit of approximately **8.5 m/s**.

## safe exploration architecture

Identified a critical failure mode where unconstrained cost adaptation caused **PPO critic collapse** — the value network diverged as the environment dynamics appeared non-stationary from the agent's perspective. Solved this by engineering a **safe-pivot variant** that uses bounded action mapping as a safe-RL shielding constraint, guaranteeing collision-free exploration by clamping cost weight adjustments to a region where the MPPI rollouts remain feasible.

## track-agnostic generalization

Designed a purely relational state representation using a **54-ray downsampled 270° LiDAR scan** and cross-track error. By encoding the environment as relative geometry rather than absolute coordinates, the agent cannot memorize specific track layouts — it generalizes to new maps without retraining.

## training results

The shielded architecture successfully stabilized training, achieving a clean monotonic improvement in episode reward. Explained variance of approximately **0.97** confirms the critic accurately models the value function throughout training — no collapse observed with the safe-pivot constraint active.

## status

Currently private.
