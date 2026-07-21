---
title: SLAM, Particle Filter & Pure Pursuit
subtitle: Building a full autonomous racing stack on F1Tenth — from mapping with SLAM to particle filter localization and a velocity-adaptive Pure Pursuit controller.
tags: [{"label":"F1Tenth · Lab 5","color":"purple"},{"label":"ROS 2","color":"green"},{"label":"C++","color":"green"},{"label":"SLAM","color":"green"},{"label":"Particle Filter","color":"green"},{"label":"Pure Pursuit","color":"green"}]
github: https://github.com/IndraNeelMulakaloori/roboracer_upenn/tree/main/lab5_ws
youtube: fRDWK5XB1nE
demo: https://www.youtube.com/watch?v=fRDWK5XB1nE
---

## overview

Lab 5 closes the loop on the autonomous racing stack: map the environment, localize within it, record a reference raceline, then track it at speed using Pure Pursuit. Each component feeds the next — a bad map breaks localization, bad localization breaks path tracking. The challenge is getting all three right simultaneously in a simulated F1Tenth environment built around the Levine Hall track.

## mapping with slam toolbox

The first step is generating a 2D occupancy map of the track. `slam_toolbox` in lifelong mapping mode subscribes to the LiDAR scan and odometry, builds a pose graph, and produces a pgm/yaml map pair. Without access to the physical hardware, the `levine_hall` simulation environment was used directly — the mapper runs identically whether the scan comes from a real sensor or a physics sim. The resulting map assets land in `particle_filter/maps/` and serve as the static reference frame for everything downstream.

## localization with particle filter

Ground-truth odometry from the simulator is convenient but unrealistic — real racecars deal with wheel slip, IMU drift, and sensor noise. The particle filter replaces it with a probabilistic pose estimator that has to earn its state estimate from laser scans and noisy odometry, just like the real thing.

The MIT Particle Filter (ROS 2 port) maintains a cloud of pose hypotheses. Each particle is propagated forward using the odometry motion model, then weighted by how well its predicted scan matches the actual LiDAR returns against the known map. The highest-weight cluster collapses into a pose estimate published as `particle_pose`.

One critical detail: the filter needs a cold-start. Before it converges, you supply an initial guess via the **2D Pose Estimate** tool in RViz — this seeds the particle cloud around the robot's actual starting position. Without this, the filter disperses across the map and never converges. The `odometry_topic` in `particle_filter/config/localize.yaml` also must point to `/ego_racecar/odom` to match the simulator's published frame.

## logging the raceline

Pure Pursuit needs a reference trajectory to follow. Rather than hand-crafting waypoints, the raceline is driven manually and logged:

- **`joy_teleop.py`** — maps joystick axes to `AckermannDriveStamped` commands, giving smooth throttle and steering control for circuit driving.
- **`waypoint_logger.py`** — subscribes to the vehicle state and records `(x, y, yaw, speed)` tuples to a `.csv`. A Euclidean distance gate filters consecutive waypoints — a new point is only saved when the vehicle has moved beyond a minimum threshold, preventing data bloat at low speeds or while stationary.

The result is a dense-enough raceline to represent the track geometry without redundant points.

## visualizing the raceline

Before handing the `.csv` to the controller, `waypoint_visualizer.py` sanity-checks it. The node reads the file via a dynamic relative package path (no hardcoded absolute paths), then publishes the entire trajectory as a `LINE_STRIP` marker to RViz using `visualization_msgs`. If the line traces the track cleanly without jumps or reversed segments, the coordinate frames are aligned and the raceline is ready.

## pure pursuit controller

The core tracker is a C++ ROS 2 node. The algorithm is geometrically simple — find a target point on the raceline at lookahead distance $l_d$ ahead, transform it into the vehicle's local frame, compute the required steering curvature — but the implementation adds two key adaptations that make it actually fast.

### dynamic lookahead

A fixed lookahead is a compromise: too short and the controller oscillates; too long and it cuts corners. The solution is to tie lookahead to current velocity:

$$l_d = \max\left(l_{\min},\ \min\left(k_{ld} \cdot v_{\text{current}},\ l_{\max}\right)\right)$$

At low speeds the lookahead collapses toward $l_{\min}$, keeping the car on the line through tight corners. At high speeds it extends toward $l_{\max}$, smoothing the pursuit arc and preventing oscillation on straights.

### velocity profiling

Maximum speed through every section of the track isn't achievable — corners require braking. Instead of a hardcoded slow-corner speed, the controller derives target velocity continuously from the required steering angle:

$$v_{\text{target}} = v_{\max} - \left(\frac{|\delta|}{\delta_{\max}}\right)\left(v_{\max} - v_{\min}\right)$$

Large steering angle → high $|\delta|/\delta_{\max}$ ratio → velocity decays toward $v_{\min}$. Zero steering → full $v_{\max}$. The decay is proportional and immediate, so the car starts braking exactly as the geometry demands it.

### coordinate transform & curvature

The node iterates through the waypoint array to find the point closest to the target lookahead distance in the global frame, then transforms it into the vehicle's local frame using the current pose from the particle filter. Steering curvature $\kappa$ follows from the lateral offset $y_L$ of the target point:

$$\kappa = \frac{2 y_L}{l_d^2}$$

This maps directly to the Ackermann steering angle via the vehicle wheelbase.

### real-time debug visualization

A `SPHERE` marker is published each control cycle at the active target waypoint — visible in RViz as the point the car is actively chasing. This makes tuning intuitive: if the sphere is jumping erratically between waypoints, the lookahead or distance threshold needs adjustment.

### configuration

All parameters — velocity bounds, lookahead bounds, wheelbase, topic names — are ROS 2 parameters overridable via `config/pure_pursuit.yaml` or launch arguments. Waypoint file paths resolve automatically through `ament_index_cpp`, so the node works across machines without path editing.

## two localization modes

The launch files expose both localization backends side by side:

| Mode | Launch file | 
|---|---|
|Odometry       |       `pure_pursuit_odom.launch.py` |         
| Particle filter |         `pure_pursuit_pf.launch.py` |       

The odometry mode is useful for isolating Pure Pursuit tuning from localization error. Once the controller tracks cleanly in odom mode, switching to particle filter mode reveals how much localization noise the controller can absorb before tracking degrades.
