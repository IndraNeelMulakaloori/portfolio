---
title: RRT*N - Gaussian-Biased Path Planning
desc: An improved RRT* that replaces uniform random sampling with a Normal distribution centered on the start-to-goal line, converging faster, finding smoother paths, and handling dynamic obstacles.
tags: [{"label":"Path Planning","color":"purple"},{"label":"ROS 2","color":"purple"},{"label":"Gazebo","color":"purple"},{"label":"Python","color":"green"},{"label":"NumPy","color":"green"}]
github: https://github.com/IndraNeelMulakaloori/RRT_N_PRM
youtube : Y8cgWP0WHBg
demo: https://youtu.be/Y8cgWP0WHBg
---

## overview

RRT\*N is an improved version of RRT\* that replaces uniform random sampling with a **Gaussian (Normal) distribution** centered on the straight-line path from start to goal. Instead of exploring the entire configuration space blindly, the algorithm biases its samples toward the optimal corridor — finding smoother, shorter paths in fewer iterations. Three variants were implemented and compared: fixed σ, dynamic adaptive σ, and dynamic obstacles.

Compared to vanilla RRT\*:
- Fewer iterations needed to reach the goal in open spaces
- Smoother, more optimal paths
- Better performance in narrow corridors and structured maps

## algorithm: gaussian-biased sampling

Traditional RRT\* samples uniformly, leading to slow convergence in large or cluttered spaces. RRT\*N samples points **perpendicular to the start-goal line** using a Gaussian offset:

> z_sample = z_start + t · L + δ · n_L

Where `t ~ Uniform(0, 1)` samples **along** the centerline, and `δ ~ N(0, σ²)` applies a **Gaussian lateral offset** perpendicular to the line. The probability density peaks directly on the start-goal line and falls off with distance, naturally biasing exploration toward the optimal region.

## sigma adaptation strategy

A fixed σ works well in open maps but can get stuck in cluttered environments. The dynamic variant adapts σ based on planning progress:

- **Increase σ** when the planner is stuck (many failed samples in a row)
- **Decrease σ** when making progress toward the goal

This makes sampling **adaptive** — tight corridor focus during progress, broader exploration when trapped, without manual tuning per map.

## results: fixed σ traversal

Four algorithms run side-by-side (RRT, RRT\*, RRT\*N fixed, RRT\*N dynamic) on the same map. The stacked output makes the convergence difference visible.

![Fixed sigma stacked comparison](https://raw.githubusercontent.com/IndraNeelMulakaloori/RRT_N_PRM/master/media/stacked_output.gif)

## results: dynamic σ traversal

The adaptive sigma variant on the same parameters — tighter initial focus, automatic widening when stuck.

![Dynamic sigma traversal](https://raw.githubusercontent.com/IndraNeelMulakaloori/RRT_N_PRM/master/media/stacked_output_2.gif)

## results: moving obstacles

The dynamic obstacles variant replans around obstacles that move during execution.

![Moving obstacles traversal](https://raw.githubusercontent.com/IndraNeelMulakaloori/RRT_N_PRM/master/media/RRT_star_N_Dynamic_obstacles.gif)

## gazebo simulation

The planned path is executed on a **TurtleBot3 Waffle** in a ROS 2 + Gazebo simulation via a `path_follow_executor` node. The planner outputs waypoints, and the robot follows them in the simulated competition world.
