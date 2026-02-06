
import * as THREE from 'three';
import { NebulaShader, BlackHoleShader, PortalShader, StarShader, AtmosphereShader, PlanetSurfaceShader, CloudShader, MilkyWayShader, ShootingStarShader, EtherShader, RingShader, SunShader } from './Shaders';
import { QualityLevel, QualityProfile } from '../types';
import { QUALITY_PROFILES } from './QualityProfiles';
import { GalaxyLayer } from './GalaxyLayer';
import { InfiniteStarfield } from './InfiniteStarfield';

interface ShootingStar {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
}

export class UniverseGenerator {
  public group: THREE.Group;
  private starPoints: THREE.Points[] = [];
  private nebulae: THREE.Mesh[] = [];
  private planetGroups: THREE.Group[] = [];
  private galaxyLayer: GalaxyLayer;
  public infiniteStarfield: InfiniteStarfield;
  private milkyWayMesh: THREE.Mesh | null = null;
  private etherMesh: THREE.Mesh | null = null;
  private sunMesh: THREE.Mesh | null = null;
  private shootingStars: ShootingStar[] = [];
  private time = 0;
  private sunDirection = new THREE.Vector3(1, 1, 1);

  constructor() {
    this.group = new THREE.Group();
    this.galaxyLayer = new GalaxyLayer();
    this.infiniteStarfield = new InfiniteStarfield();
    this.group.add(this.galaxyLayer.group);
    this.group.add(this.infiniteStarfield.group);
  }

  generate(quality: QualityLevel, showConstellations: boolean, planetRealism: boolean = true, showMilkyWay: boolean = true, showEvents: boolean = true) {
    this.clear();
    const profile = QUALITY_PROFILES[quality];

    this.createEther();
    this.createSun();
    this.createStars(profile);
    this.createNebulae(profile);
    this.createBlackHole(profile);
    this.createPortal(profile);
    this.createPlanets(quality, planetRealism);
    
    if (showMilkyWay) this.createMilkyWayBand();
    
    this.galaxyLayer.generate(quality === QualityLevel.HIGH ? 60 : 30);
    this.infiniteStarfield.generate(profile);

    if (showConstellations) {
      this.createConstellations();
    }
  }

  private clear() {
    this.group.children.forEach(child => {
      if (child !== this.galaxyLayer.group && child !== this.infiniteStarfield.group) {
        this.deepDispose(child);
      }
    });
    
    const toRemove = this.group.children.filter(c => c !== this.galaxyLayer.group && c !== this.infiniteStarfield.group);
    toRemove.forEach(c => this.group.remove(c));
    
    this.starPoints = [];
    this.nebulae = [];
    this.planetGroups = [];
    this.milkyWayMesh = null;
    this.etherMesh = null;
    this.sunMesh = null;
    this.shootingStars = [];
  }

  private deepDispose(obj: THREE.Object3D) {
    if ((obj as any).geometry) (obj as any).geometry.dispose();
    if ((obj as any).material) {
      if (Array.isArray((obj as any).material)) {
        (obj as any).material.forEach((m: any) => m.dispose());
      } else {
        (obj as any).material.dispose();
      }
    }
    if (obj.children) {
      obj.children.forEach(c => this.deepDispose(c));
    }
  }

  private createEther() {
    const geo = new THREE.SphereGeometry(2000, 32, 32);
    const mat = new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 }, energy: { value: 0 } },
      vertexShader: EtherShader.vertexShader,
      fragmentShader: EtherShader.fragmentShader,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false
    });
    this.etherMesh = new THREE.Mesh(geo, mat);
    this.group.add(this.etherMesh);
  }

  private createSun() {
    const geo = new THREE.PlaneGeometry(300, 300);
    const mat = new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 } },
      vertexShader: SunShader.vertexShader,
      fragmentShader: SunShader.fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.sunMesh = new THREE.Mesh(geo, mat);
    this.sunMesh.position.set(1000, 500, -1000);
    this.sunMesh.lookAt(0,0,0);
    this.group.add(this.sunMesh);
    this.sunDirection.copy(this.sunMesh.position).normalize();
  }

  private createStars(profile: QualityProfile) {
    const starsPerLayer = Math.floor(profile.starCount / profile.starLayers);
    for (let layer = 0; layer < profile.starLayers; layer++) {
      const geometry = new THREE.BufferGeometry();
      const count = starsPerLayer;
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const sizes = new Float32Array(count);
      const twinkleSpeeds = new Float32Array(count);

      const radiusMin = 300 + layer * 200;
      const radiusMax = 600 + layer * 400;

      for (let i = 0; i < count; i++) {
        const r = radiusMin + Math.random() * (radiusMax - radiusMin);
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);
        const color = new THREE.Color().setHSL(Math.random() * 0.1 + 0.55, 0.4, 0.8 + Math.random() * 0.2);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
        sizes[i] = (Math.random() * 1.5 + 0.5) * (layer + 1);
        twinkleSpeeds[i] = 0.5 + Math.random() * 2.0;
      }
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
      geometry.setAttribute('twinkleSpeed', new THREE.BufferAttribute(twinkleSpeeds, 1));
      const material = new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 } },
        vertexShader: StarShader.vertexShader,
        fragmentShader: StarShader.fragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const points = new THREE.Points(geometry, material);
      this.starPoints.push(points);
      this.group.add(points);
    }
  }

  private createMilkyWayBand() {
    const geo = new THREE.TorusGeometry(800, 300, 32, 100);
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        energy: { value: 0 }
      },
      vertexShader: MilkyWayShader.vertexShader,
      fragmentShader: MilkyWayShader.fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    this.milkyWayMesh = new THREE.Mesh(geo, mat);
    this.milkyWayMesh.rotation.x = Math.PI / 4;
    this.group.add(this.milkyWayMesh);
  }

  private createNebulae(profile: QualityProfile) {
    const count = profile.nebulaOctaves > 4 ? 6 : 3;
    const colors = [
      [new THREE.Color(0x330088), new THREE.Color(0x0022ff)],
      [new THREE.Color(0xcc3300), new THREE.Color(0xffaa00)],
      [new THREE.Color(0x008844), new THREE.Color(0x001144)],
    ];
    for (let i = 0; i < count; i++) {
      const geometry = new THREE.SphereGeometry(150 + Math.random() * 100, 32, 32);
      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          opacity: { value: 0.12 },
          warp: { value: profile.nebulaWarp },
          octaves: { value: profile.nebulaOctaves },
          color1: { value: colors[i % colors.length][0] },
          color2: { value: colors[i % colors.length][1] }
        },
        vertexShader: NebulaShader.vertexShader,
        fragmentShader: NebulaShader.fragmentShader,
        transparent: true,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set((Math.random() - 0.5) * 800, (Math.random() - 0.5) * 800, (Math.random() - 0.5) * 800);
      this.nebulae.push(mesh);
      this.group.add(mesh);
    }
  }

  private createBlackHole(profile: QualityProfile) {
    const container = new THREE.Group();
    container.position.set(-80, -30, -100);
    const geo = new THREE.PlaneGeometry(120, 120);
    const mat = new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 }, detail: { value: profile.distortionDetail } },
      vertexShader: BlackHoleShader.vertexShader,
      fragmentShader: BlackHoleShader.fragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const mesh = new THREE.Mesh(geo, mat);
    container.add(mesh);
    this.group.add(container);
  }

  private createPortal(profile: QualityProfile) {
    const geo = new THREE.PlaneGeometry(100, 100);
    const mat = new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 } },
      vertexShader: PortalShader.vertexShader,
      fragmentShader: PortalShader.fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(0, -60, -200);
    this.group.add(mesh);
  }

  private createPlanets(quality: QualityLevel, planetRealism: boolean) {
    const planetConfigs = [
      { radius: 15, color: 0x1133aa, pos: [50, 0, -50], glow: 0x44aaff, hasRings: false, moons: 1 },
      { radius: 25, color: 0xaa6622, pos: [120, 40, 20], glow: 0xffaa44, hasRings: true, moons: 2 },
      { radius: 10, color: 0xaa2244, pos: [-40, 60, 80], glow: 0xff44aa, hasRings: false, moons: 0 }
    ];
    
    planetConfigs.forEach(p => {
      const group = new THREE.Group();
      group.position.set(p.pos[0], p.pos[1], p.pos[2]);

      const geo = new THREE.SphereGeometry(p.radius, 64, 64);
      
      if (planetRealism) {
        const surfaceMat = new THREE.ShaderMaterial({
          uniforms: {
            baseColor: { value: new THREE.Color(p.color) },
            sunDirection: { value: this.sunDirection },
            time: { value: 0 }
          },
          vertexShader: PlanetSurfaceShader.vertexShader,
          fragmentShader: PlanetSurfaceShader.fragmentShader
        });
        const mesh = new THREE.Mesh(geo, surfaceMat);
        group.add(mesh);

        const glowGeo = new THREE.SphereGeometry(p.radius * 1.05, 64, 64);
        const glowMat = new THREE.ShaderMaterial({
          uniforms: {
            color: { value: new THREE.Color(p.glow) },
            power: { value: 4.5 }
          },
          vertexShader: AtmosphereShader.vertexShader,
          fragmentShader: AtmosphereShader.fragmentShader,
          side: THREE.BackSide,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });
        const glowMesh = new THREE.Mesh(glowGeo, glowMat);
        group.add(glowMesh);

        const cloudGeo = new THREE.SphereGeometry(p.radius * 1.08, 64, 64);
        const cloudMat = new THREE.ShaderMaterial({
          uniforms: {
            time: { value: 0 },
            sunDirection: { value: this.sunDirection }
          },
          vertexShader: CloudShader.vertexShader,
          fragmentShader: CloudShader.fragmentShader,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });
        const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
        group.add(cloudMesh);
        
        if (p.hasRings) {
          const ringGeo = new THREE.PlaneGeometry(p.radius * 5, p.radius * 5);
          const ringMat = new THREE.ShaderMaterial({
            uniforms: { color: { value: new THREE.Color(p.color).lerp(new THREE.Color(0xffffff), 0.5) } },
            vertexShader: RingShader.vertexShader,
            fragmentShader: RingShader.fragmentShader,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false
          });
          const ringMesh = new THREE.Mesh(ringGeo, ringMat);
          ringMesh.rotation.x = Math.PI / 2.5;
          group.add(ringMesh);
        }

        for (let m = 0; m < p.moons; m++) {
          const moonGroup = new THREE.Group();
          const moonRadius = 1 + Math.random() * 2;
          const moonGeo = new THREE.SphereGeometry(moonRadius, 16, 16);
          const moonMat = new THREE.MeshStandardMaterial({ color: 0x888888 });
          const moonMesh = new THREE.Mesh(moonGeo, moonMat);
          const orbitDist = p.radius * (2 + m * 0.5);
          moonMesh.position.x = orbitDist;
          moonGroup.add(moonMesh);
          moonGroup.rotation.z = Math.random() * Math.PI;
          moonGroup.userData = { speed: 0.1 + Math.random() * 0.5 };
          group.add(moonGroup);
        }

      } else {
        const mat = new THREE.MeshStandardMaterial({
          color: p.color,
          roughness: 0.7,
          metalness: 0.2
        });
        const mesh = new THREE.Mesh(geo, mat);
        group.add(mesh);
      }

      this.planetGroups.push(group);
      this.group.add(group);
    });
  }

  private createConstellations() {
    if (this.starPoints.length === 0) return;
    const points: THREE.Vector3[] = [];
    const count = 60;
    const layer = this.starPoints[0];
    const positions = (layer.geometry.getAttribute('position') as THREE.BufferAttribute).array;
    for (let i = 0; i < count; i++) {
      const idx1 = Math.floor(Math.random() * (positions.length / 3));
      const idx2 = Math.floor(Math.random() * (positions.length / 3));
      const v1 = new THREE.Vector3(positions[idx1 * 3], positions[idx1 * 3 + 1], positions[idx1 * 3 + 2]);
      const v2 = new THREE.Vector3(positions[idx2 * 3], positions[idx2 * 3 + 1], positions[idx2 * 3 + 2]);
      if (v1.distanceTo(v2) < 60) {
        points.push(v1, v2);
      }
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: 0x5599ff,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending
    });
    const lines = new THREE.LineSegments(geometry, material);
    this.group.add(lines);
  }

  private spawnShootingStar() {
    const geo = new THREE.PlaneGeometry(10, 0.2);
    const mat = new THREE.ShaderMaterial({
      uniforms: { opacity: { value: 0.8 } },
      vertexShader: ShootingStarShader.vertexShader,
      fragmentShader: ShootingStarShader.fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(geo, mat);
    
    const r = 400 + Math.random() * 200;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    mesh.position.set(r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi));
    mesh.lookAt(0, 0, 0);
    
    const velocity = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(50 + Math.random() * 100);
    this.shootingStars.push({ mesh, velocity, life: 0, maxLife: 1.0 + Math.random() });
    this.group.add(mesh);
  }

  update(delta: number, velocity: number, cameraPosition: THREE.Vector3, energy: number, showEvents: boolean) {
    this.time += delta;
    this.group.rotation.y += delta * 0.01 + velocity * 0.001;
    
    this.starPoints.forEach(sp => {
      (sp.material as THREE.ShaderMaterial).uniforms.time.value = this.time;
    });
    
    if (this.milkyWayMesh) {
      const mat = this.milkyWayMesh.material as THREE.ShaderMaterial;
      mat.uniforms.time.value = this.time;
      mat.uniforms.energy.value = energy;
    }

    if (this.etherMesh) {
      const mat = this.etherMesh.material as THREE.ShaderMaterial;
      mat.uniforms.time.value = this.time;
      mat.uniforms.energy.value = energy;
    }

    if (this.sunMesh) {
      (this.sunMesh.material as THREE.ShaderMaterial).uniforms.time.value = this.time;
      this.sunMesh.lookAt(cameraPosition);
    }

    if (showEvents && Math.random() < (0.01 + energy * 0.1)) {
      this.spawnShootingStar();
    }

    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const s = this.shootingStars[i];
      s.life += delta;
      s.mesh.position.add(s.velocity.clone().multiplyScalar(delta));
      (s.mesh.material as THREE.ShaderMaterial).uniforms.opacity.value = 1.0 - (s.life / s.maxLife);
      
      if (s.life >= s.maxLife) {
        this.group.remove(s.mesh);
        s.mesh.geometry.dispose();
        (s.mesh.material as THREE.ShaderMaterial).dispose();
        this.shootingStars.splice(i, 1);
      }
    }
    
    this.galaxyLayer.update(this.time);
    this.infiniteStarfield.update(cameraPosition, this.time);
    
    this.group.traverse(child => {
      if ((child as any).material && (child as any).material.uniforms && (child as any).material.uniforms.time) {
        (child as any).material.uniforms.time.value = this.time;
      }
      // Update moon rotations
      if (child.userData && child.userData.speed) {
        child.rotation.y += delta * child.userData.speed;
      }
    });

    this.planetGroups.forEach(g => {
      g.rotation.y += delta * 0.05;
    });
  }
}
