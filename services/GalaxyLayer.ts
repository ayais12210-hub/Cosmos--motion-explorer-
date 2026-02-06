
import * as THREE from 'three';
import { GalaxyShader } from './Shaders';

export class GalaxyLayer {
  public group: THREE.Group;
  private galaxies: THREE.Mesh[] = [];

  constructor() {
    this.group = new THREE.Group();
  }

  generate(count: number = 40) {
    this.clear();
    
    for (let i = 0; i < count; i++) {
      const isSpiral = Math.random() > 0.4;
      const size = 50 + Math.random() * 150;
      
      const geo = new THREE.PlaneGeometry(size, size);
      const mat = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          coreColor: { value: new THREE.Color().setHSL(Math.random() * 0.1 + 0.05, 0.8, 0.9) },
          armColor: { value: new THREE.Color().setHSL(Math.random() * 0.2 + 0.5, 0.6, 0.6) },
          type: { value: isSpiral ? 0 : 1 },
          swirl: { value: 2.0 + Math.random() * 5.0 }
        },
        vertexShader: GalaxyShader.vertexShader,
        fragmentShader: GalaxyShader.fragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
      });

      const mesh = new THREE.Mesh(geo, mat);
      
      // Place in 3D space far away
      const r = 800 + Math.random() * 1500;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      mesh.position.set(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );
      
      mesh.lookAt(0, 0, 0);
      mesh.rotation.z = Math.random() * Math.PI;

      this.galaxies.push(mesh);
      this.group.add(mesh);
    }
  }

  update(time: number) {
    this.galaxies.forEach(g => {
      (g.material as THREE.ShaderMaterial).uniforms.time.value = time;
    });
  }

  private clear() {
    while(this.group.children.length > 0) {
      const child = this.group.children[0] as THREE.Mesh;
      child.geometry.dispose();
      (child.material as THREE.Material).dispose();
      this.group.remove(child);
    }
    this.galaxies = [];
  }
}
