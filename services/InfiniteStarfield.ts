
import * as THREE from 'three';
import { StarShader } from './Shaders';
import { QualityProfile } from '../types';

export class InfiniteStarfield {
  public group: THREE.Group;
  private layers: THREE.Points[] = [];
  private parallaxRates = [0.99, 0.995, 0.999]; // 1.0 would be skybox (no parallax)

  constructor() {
    this.group = new THREE.Group();
  }

  generate(profile: QualityProfile) {
    this.clear();
    
    // Create 3 shells: Deep, Mid, Far
    const layerConfigs = [
      { count: profile.starCount * 0.5, radius: 1500, size: 0.8, color: 0x88aaff },
      { count: profile.starCount * 0.3, radius: 2500, size: 1.2, color: 0xffccaa },
      { count: profile.starCount * 0.2, radius: 3500, size: 2.0, color: 0xffffff }
    ];

    layerConfigs.forEach((config, idx) => {
      const geo = new THREE.BufferGeometry();
      const positions = new Float32Array(config.count * 3);
      const colors = new Float32Array(config.count * 3);
      const sizes = new Float32Array(config.count);
      const twinkleSpeeds = new Float32Array(config.count);

      for (let i = 0; i < config.count; i++) {
        // Sphere surface distribution
        const r = config.radius + (Math.random() - 0.5) * 500;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        // Bias for Milky Way Band in the largest shell
        let x, y, z;
        if (idx === 2 && Math.random() > 0.4) {
          const bandR = config.radius + (Math.random() - 0.5) * 200;
          const bandTheta = Math.random() * Math.PI * 2;
          const bandSpread = 100 + Math.random() * 150;
          x = bandR * Math.cos(bandTheta);
          y = (Math.random() - 0.5) * bandSpread;
          z = bandR * Math.sin(bandTheta);
        } else {
          x = r * Math.sin(phi) * Math.cos(theta);
          y = r * Math.sin(phi) * Math.sin(theta);
          z = r * Math.cos(phi);
        }

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        const color = new THREE.Color(config.color);
        if (idx === 2) color.lerp(new THREE.Color(0x221144), Math.random() * 0.5); // Dust extinction
        
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;

        sizes[i] = config.size * (0.5 + Math.random());
        twinkleSpeeds[i] = 0.5 + Math.random() * 1.5;
      }

      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
      geo.setAttribute('twinkleSpeed', new THREE.BufferAttribute(twinkleSpeeds, 1));

      const mat = new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 } },
        vertexShader: StarShader.vertexShader,
        fragmentShader: StarShader.fragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false // Ensure background stays behind everything
      });

      const points = new THREE.Points(geo, mat);
      this.layers.push(points);
      this.group.add(points);
    });
  }

  update(cameraPosition: THREE.Vector3, time: number) {
    this.layers.forEach((layer, idx) => {
      // Each layer follows camera but stays far away
      // We apply a slight scalar offset to simulate movement parallax
      const rate = this.parallaxRates[idx];
      layer.position.copy(cameraPosition).multiplyScalar(rate);
      (layer.material as THREE.ShaderMaterial).uniforms.time.value = time;
    });
  }

  private clear() {
    this.layers.forEach(l => {
      l.geometry.dispose();
      (l.material as THREE.ShaderMaterial).dispose();
      this.group.remove(l);
    });
    this.layers = [];
  }
}
