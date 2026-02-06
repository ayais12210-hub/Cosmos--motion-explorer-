# 🌌 Cosmos: Motion-Sensed Explorer

A high-performance, interactive procedural universe built with **Three.js** and **React**. Experience a deep-space simulation that leverages hardware motion sensors for immersive navigation through a procedurally generated cosmos.

![Cosmos Preview](https://img.shields.io/badge/Render-WebGL-blueviolet?style=for-the-badge)
![Tech](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white)
![Tech](https://img.shieldui.com/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)

## 🚀 Key Features

### 1. Infinite Procedural Universe
- **Parallax Starfield:** A multi-layered, infinite background system that ensures you never hit an "edge" of space.
- **Deep Space Objects:** Procedurally generated nebulae, spiral galaxies, and stellar clusters.
- **Celestial Bodies:** High-fidelity planets featuring dynamic atmospheres, cloud layers, and rings, all shaded with custom GLSL.
- **Anomalies:** Encounter singularites (Black Holes) and ancient Portals with unique distortion effects.

### 2. Immersive Navigation
- **Warp Mode:** Transition from orbital observation to high-speed interstellar travel.
- **Motion Sync:** Leverages device orientation sensors (Beta/Gamma tilt) to steer the camera naturally.
- **Energy Feedback:** The "Motion Energy" system tracks your movement speed and rotation to pulse the environment and trigger visual events.

### 3. Visual Tech Stack (Custom Shaders)
- **Soft Sprites:** Star particles use circular falloff algorithms to prevent square-pixel artifacts.
- **Ether Haze:** An interstellar medium layer that reacts to motion energy, creating a sense of "fluid" space.
- **Morph Field:** High-energy particle clusters that coalesce into geometric "seeds" (spheres/rings) when motion energy is peaked.

### 4. Performance & Scalability
- **Quality Profiles:** Supports Low, Medium, and High presets adjusting star counts, shader complexity, and pixel ratios.
- **Adaptive FPS:** Real-time monitoring for smooth playback across mobile and desktop devices.

## 🕹️ Controls

| Mode | Input | Action |
| :--- | :--- | :--- |
| **Orbit** | Drag / Tilt | Rotate around current focus |
| **Orbit** | Scroll / Pinch | Zoom in/out |
| **Warp** | Drag / Tilt | Change travel direction |
| **Warp** | Scroll / Pinch | Throttle velocity |
| **All** | Sensors Button | Toggle hardware motion control |

## 🛠️ Technical Implementation

- **Framework:** React 19 (ESM)
- **Engine:** Three.js R182
- **Shaders:** GLSL (Vertex/Fragment) for all custom materials.
- **State Management:** React Hooks (useState, useCallback) for UI/Scene synchronization.
- **Asset Pipeline:** 100% Procedural. No external textures or models required.

## 📜 License

Project developed as a high-performance vibe-coded experiment in autonomous architecture.

---

*“The cosmos is within us. We are made of star-stuff. We are a way for the cosmos to know itself.”* — **Carl Sagan**