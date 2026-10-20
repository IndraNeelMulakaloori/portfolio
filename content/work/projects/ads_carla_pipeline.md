---
title: Stereo Vision Pipeline for CARLA
desc: ROS 2 and CARLA integration that brings synchronized stereo vision and vehicle sensor data into a colored 3D point cloud — with RGB cameras, LiDAR, GNSS, and IMU data visualized in RViz2.
tags: [{"label":"CARLA","color":"purple"},{"label":"ROS 2","color":"green"},{"label":"Stereo Vision","color":"purple"},{"label":"Python","color":"green"},{"label":"Point Clouds","color":"green"}]
filters: ["Autonomous Systems", "Perception / CV", "Python", "Simulation", "ROS 2", "Math"]
image: https://raw.githubusercontent.com/IndraNeelMulakaloori/ads_carla_pipeline/main/results/stereo_vision_rviz.png
youtube: ojKTuq8QztQ
demo: https://youtu.be/ojKTuq8QztQ
github: https://github.com/IndraNeelMulakaloori/ads_carla_pipeline
---

## overview

An autonomous-driving development pipeline integrating the **CARLA simulator** with **ROS 2**. It spawns an ego vehicle and sensor suite in CARLA, publishes the sensor streams as ROS topics, and processes synchronized left/right RGB images into a colored 3D stereo point cloud for visualization in RViz2.

The repository is organized as two ROS 2 packages:
- **`l2_carla_demo`** provides CARLA-to-ROS message conversion utilities.
- **`stereo_vision`** configures and spawns the sensors, publishes the TF tree, synchronizes camera images, and computes stereo depth.

## stereo depth and sensor suite

The stereo node estimates depth from image disparity using the pinhole-camera relationship:

$$Z = \frac{fB}{d}$$

Here, $f$ is focal length in pixels, $B$ is the camera baseline, and $d$ is disparity in pixels. The default stereo baseline is **0.5 m**, with focal length derived from the configured camera width and field of view. The system also publishes LiDAR, GNSS, and IMU streams.

| Data | ROS topic |
|---|---|
| Left RGB camera | `/carla/camera/rgb/left/image` |
| Right RGB camera | `/carla/camera/rgb/right/image` |
| Stereo point cloud | `/carla/stereo/points` |
| LiDAR point cloud | `/carla/lidar/points` |
| GNSS fix | `/carla/gnss/fix` |
| IMU data | `/carla/imu/data` |

## visualization

The configured RViz2 view displays the ego vehicle's sensor setup and the generated stereo point cloud. The fixed frame is `ego_vehicle`; CARLA, the sensor manager, and the stereo processing node must all be running for the point cloud to appear.

![RViz2 view of the CARLA sensor suite and stereo point cloud](https://raw.githubusercontent.com/IndraNeelMulakaloori/ads_carla_pipeline/main/results/stereo_vision_rviz.png)

## requirements

Requires ROS 2 with `colcon` and `rosdep`, a compatible CARLA simulator and Python API, and Python dependencies including OpenCV, NumPy, and `message_filters`. Build the workspace with `colcon`, source its `install/setup.bash`, launch `stereo_vision`'s `sensors_launch.py`, and run the `stereo_camera` node alongside CARLA.

## roadmap

Current milestones include CARLA sensor spawning, ROS topic publication for synchronized RGB, LiDAR, GNSS, and IMU data, and colored stereo point-cloud generation. Planned work includes a C++ port, benchmarking against LiDAR ground truth, EKF-based estimation, 3D detection and tracking, and planning and motion-control tasks.