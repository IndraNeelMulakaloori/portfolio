---
title: On-Road Obstacle Detection & Distance Estimation
desc: YOLOv8 ensemble that detects traffic cones, stop signs, and barrier structures with geometric distance estimation — reaching 123 FPS on GPU via ONNX quantization.
tags: [{"label":"Computer Vision","color":"purple"},{"label":"YOLOv8","color":"purple"},{"label":"Python","color":"green"},{"label":"ONNX","color":"green"},{"label":"CUDA","color":"green"}]
filters: ["Perception / CV", "Python", "Autonomous Systems", "Learning"]
image: https://raw.githubusercontent.com/IndraNeelMulakaloori/road-obstacles/main/testing_samples/test_image.jpg
github: https://github.com/IndraNeelMulakaloori/road-obstacles
---

## overview

An ensemble YOLOv8 pipeline that detects three road-obstacle categories — **traffic cones**, **stop signs**, and **barrier structures** (traffic lights, billboards, road signs) — with real-time bounding-box distance estimation. The system combines a custom fine-tuned model trained on GPU with a pretrained COCO variant, merging their detections and applying confidence-based filtering to suppress false positives.

## model architecture

Two models run in parallel on each frame:
- **Custom YOLOv8n** fine-tuned on a filtered subset of BDD100K + Roboflow cone + barrier datasets (Google Colab GPU)
- **Pretrained YOLOv8 COCO** for stop sign detection out of the box

Outputs are merged and filtered by a confidence threshold before distance estimation. Distance is computed geometrically from bounding box height — no depth sensor required.

## performance

| Model | Device | FPS |
|---|---|---|
| YOLOv8 baseline | CPU | 15.78 |
| YOLOv8 baseline | Colab GPU | 82.33 |
| ONNX quantized | CPU | 113.24 |
| ONNX quantized | Colab GPU | 123.76 |

ONNX export with quantization delivers a **7× CPU speedup** over the PyTorch baseline, making the pipeline viable for edge deployment without GPU.

## test samples

![Test image 1](https://raw.githubusercontent.com/IndraNeelMulakaloori/road-obstacles/main/testing_samples/1.jpg)

![Test image 2](https://raw.githubusercontent.com/IndraNeelMulakaloori/road-obstacles/main/testing_samples/2.jpg)

![Test image 3](https://raw.githubusercontent.com/IndraNeelMulakaloori/road-obstacles/main/testing_samples/3.jpg)

## dataset & limitations

Training data sourced from **BDD100K** (Kaggle), **Roboflow barrier objects**, and **Roboflow cone datasets**. The barrier class is a broad superset — traffic lights, billboards, and signs all fall under it — which causes some inter-class false positives managed through confidence thresholding.
