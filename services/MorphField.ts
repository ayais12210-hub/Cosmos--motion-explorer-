
import * as THREE from 'three';
import { MorphParticleShader } from './Shaders';

export class MorphField {
  public group: THREE.Group;
  private particles: THREE.Points;
  private seeds: THREE.Group[] = [];
  private plasmaKnots: THREE.Mesh[] = [];
  private time: number = 0;

  constructor() {
    this.group = new THREE.Group();
    this.particles = this.createParticleCloud();
    this.group.add(this.particles);
    this.createSeeds();
    this.createPlasma();
  }

  private createParticleCloud(): THREE.Points {
    const count = 3000;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const size = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      const r = 15 + Math.random() * 60;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      size[i] = 2.0 + Math.random() * 6.0;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(size, 1));

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        energy: { value: 0 }
      },
      vertexShader: MorphParticleShader.vertexShader,
      fragmentShader: MorphParticleShader.fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    return new THREE.Points(geo, mat);
  }

  private createSeeds() {
    for (let i = 0; i < 4; i++) {
      const seed = new THREE.Group();
      const isPortal = i >= 2;
      
      if (isPortal) {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(5, 0.15, 16, 100),
          new THREE.MeshBasicMaterial({ color: 0x0088ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending })
        );
        seed.add(ring);
      } else {
        const sphere = new THREE.Mesh(
          new THREE.SphereGeometry(3.5, 32, 32),
          new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, wireframe: true, blending: THREE.AdditiveBlending })
        );
        seed.add(sphere);
      }
      
      seed.position.set(
        (Math.random() - 0.5) * 120,
        (Math.random() - 0.5) * 120,
        (Math.random() - 0.5) * 120
      );
      seed.visible = false;
      this.seeds.push(seed);
      this.group.add(seed);
    }
  }

  private createPlasma() {
    for (let i = 0; i < 3; i++) {
      const geo = new THREE.IcosahedronGeometry(2, 4);
      const mat = new THREE.MeshBasicMaterial({ color: 0xff3300, transparent: true, opacity: 0, wireframe: true, blending: THREE.AdditiveBlending });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set((Math.random()-0.5)*150, (Math.random()-0.5)*150, (Math.random()-0.5)*150);
      mesh.visible = false;
      this.plasmaKnots.push(mesh);
      this.group.add(mesh);
    }
  }

  public update(delta: number, energy: number, impulse: number, camera: THREE.Camera) {
    this.time += delta;
    
    const mat = this.particles.material as THREE.ShaderMaterial;
    mat.uniforms.time.value = this.time;
    mat.uniforms.energy.value = energy;

    this.seeds.forEach((seed, i) => {
      const threshold = 0.25 + (i * 0.15);
      const active = energy > threshold;
      
      seed.visible = active;
      if (active) {
        const targetOpacity = THREE.MathUtils.clamp((energy - threshold) * 2.5, 0, 0.8);
        seed.traverse((child) => {
          if ((child as any).material) {
            (child as any).material.opacity = THREE.MathUtils.lerp((child as any).material.opacity, targetOpacity, 0.1);
          }
        });
        seed.rotation.x += delta * (0.5 + energy);
        seed.rotation.y += delta * (1.0 + energy * 2.0);
        
        if (impulse > 0.4) {
          seed.position.x += (Math.random() - 0.5) * impulse * 2.0;
          seed.position.y += (Math.random() - 0.5) * impulse * 2.0;
        }
      }
    });

    this.plasmaKnots.forEach((knot, i) => {
      const threshold = 0.7 + (i * 0.1);
      const active = energy > threshold;
      knot.visible = active;
      if (active) {
        knot.material.opacity = THREE.MathUtils.lerp(knot.material.opacity, (energy - threshold) * 3.0, 0.1);
        knot.rotation.y -= delta * 5.0;
        knot.scale.setScalar(1.0 + Math.sin(this.time * 10.0) * 0.2);
      }
    });

    this.group.position.copy(camera.position);
  }
}
