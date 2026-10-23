---
title: Stereo Vision Pipeline for CARLA
desc: ROS 2 + CARLA pipeline for synchronized stereo depth and colored point clouds, evaluated against projected LiDAR depth over 332 frames (4.16 m mean absolute error).
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

| Data | ROS topic | Message type |
|---|---|---|
| Left RGB camera | `/carla/camera/rgb/left/image` | `sensor_msgs/Image` |
| Right RGB camera | `/carla/camera/rgb/right/image` | `sensor_msgs/Image` |
| Stereo point cloud | `/carla/stereo/points` | `sensor_msgs/PointCloud2` |
| LiDAR point cloud | `/carla/lidar/points` | `sensor_msgs/PointCloud2` |
| GNSS fix | `/carla/gnss/fix` | `sensor_msgs/NavSatFix` |
| IMU data | `/carla/imu/data` | `sensor_msgs/Imu` |

## stereo evaluation

An offline evaluator compared stereo depth against LiDAR depth projected into the camera image over **332 frames**. The following are means of per-frame metrics from this recorded run:

| Metric | Result | Interpretation |
|---|---:|---|
| Mean absolute error (MAE) | 4.16 m | Mean absolute depth error on pixels valid in both maps |
| Root mean square error (RMSE) | 11.82 m | Penalizes larger depth errors more heavily |
| Stereo depth fill rate | 50.08% | Image pixels with a valid stereo depth estimate |
| Valid comparisons | 1,680 pixels/frame | Shared valid pixels used for MAE and RMSE |
| Depth computation latency | 142.83 ms/frame | Stereo depth computation only; excludes synchronization, LiDAR projection, and ROS publishing |
| Depth computation throughput | 7.00 FPS | Derived from depth-computation latency |

These measurements describe this capture, not a general performance guarantee. Fill rate is calculated over image pixels, while MAE and RMSE use only pixels with valid stereo and projected LiDAR depth. The complete [per-frame evaluation metrics](https://github.com/IndraNeelMulakaloori/ads_carla_pipeline/blob/main/results/stereo_evaluation_metrics.csv) are available in the repository.

### evaluation setup

- NVIDIA GeForce RTX 3090
- RGB cameras at 1280 × 720 with 90° horizontal field of view
- 32-channel LiDAR with 100 m range, 560,000 points/s, and 20 Hz rotation
- Synchronous simulation at 20 Hz, with camera and LiDAR sensor ticks of 0.05 s

The sensor cadence is the data acquisition rate; it is distinct from the measured stereo-processing throughput. Camera settings are defined in [`carla_config.yaml`](https://github.com/IndraNeelMulakaloori/ads_carla_pipeline/blob/main/stereo_vision/config/carla_config.yaml).

## visualization

The configured RViz2 view displays the ego vehicle's sensor setup and the generated stereo point cloud. The fixed frame is `ego_vehicle`; CARLA, the sensor manager, and the stereo processing node must all be running for the point cloud to appear.

![RViz2 view of the CARLA sensor suite and stereo point cloud](https://raw.githubusercontent.com/IndraNeelMulakaloori/ads_carla_pipeline/main/results/stereo_vision_rviz.png)

## requirements and run

Requires ROS 2 with `colcon` and `rosdep`, a compatible CARLA simulator with its Python API available in the ROS environment, the `l2_carla_demo` package, and Python dependencies including OpenCV, NumPy, and `message_filters`. Build with `colcon build --symlink-install --packages-up-to l2_carla_demo stereo_vision`, then source `install/setup.bash` in each terminal. Start CARLA first, launch the sensor manager with `ros2 launch stereo_vision sensors_launch.py` (autopilot is enabled by default), and run stereo processing with `ros2 run stereo_vision stereo_camera`. RViz2 can load the package's `stereo_vision.rviz` configuration; its fixed frame is `ego_vehicle`.

The default sensor setup is `stereo_vision/config/carla_config.yaml`. The left/right cameras use a horizontal baseline; the sensor manager publishes static transforms from the configured mounts. Stereo processing reuses CARLA message-conversion helpers from `l2_carla_demo`.

## roadmap

Completed milestones include spawning the CARLA ego vehicle and sensor suite, publishing synchronized RGB, LiDAR, GNSS, and IMU topics, and generating a colored stereo point cloud. The README also reports an offline stereo-versus-LiDAR evaluation; broader benchmarking remains planned, along with a C++ port, EKF-based estimation, 3D detection and tracking, and planning and motion-control tasks.
