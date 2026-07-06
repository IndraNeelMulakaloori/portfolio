---
title: Real Time GPS Data Logger
desc: ESP32 + NEO-6M GPS system using FreeRTOS task scheduling to parse NMEA satellite streams in real time, publish encrypted telemetry over MQTT, and visualize live tracking on a Leaflet.js cloud dashboard.
tags: [{"label":"Embedded Systems","color":"purple"},{"label":"FreeRTOS","color":"purple"},{"label":"ESP-IDF","color":"purple"},{"label":"C","color":"green"},{"label":"MQTT","color":"green"},{"label":"WiFi","color":"green"}]
filters: ["Hardware"]
youtube: 8swYhXtw61w
demo: https://youtu.be/8swYhXtw61w
github: https://github.com/IndraNeelMulakaloori/rtos-gps-logger
---

## overview

Deployed an ESP32 microcontroller paired with a u-blox NEO-6M UART GPS receiver to capture and transmit satellite positioning data in real time. The system uses **FreeRTOS task scheduling** within the ESP-IDF framework to parse NMEA data streams natively — no external GPS library. Upon power-up, the device acquires satellite lock, validates incoming sentences with CRC checking, and immediately begins streaming telemetry without any local interface.

## hardware

The GPS module communicates with the ESP32 over UART on GPIO 16 (RX) and GPIO 17 (TX) at 3.3V. The status LED pulses once per second on satellite lock. The ceramic patch antenna requires outdoor or clear-window line-of-sight for acquisition.

## firmware architecture

FreeRTOS tasks handle the two concurrent concerns independently — NMEA parsing runs in one task, WiFi/MQTT transmission in another. The NMEA parser validates each sentence's checksum before extracting the state vector: latitude, longitude, altitude, ground speed, satellite count, and HDOP (horizontal dilution of precision). Parsed data is serialized to JSON and published to a **HiveMQ cloud MQTT broker** over WiFi Station mode.

## cloud pipeline

The frontend is a **Leaflet.js** map deployed on Netlify that subscribes to the MQTT broker via secure WebSockets (`wss://`), rendering the position trace and telemetry metrics asynchronously in the browser. No page refresh needed — position updates push directly to the map as the device moves.

## status

All five requirements complete: hardware operational, FreeRTOS deployed, GPS parsing functional, MQTT telemetry pipeline active, cloud visualization live at [rtos-gps-logger.netlify.app](https://rtos-gps-logger.netlify.app/).
