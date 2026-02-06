
import * as THREE from 'three';
import { UniverseGenerator } from './UniverseGenerator';
import { InputController } from './InputController';
import { AppState, POIS, QualityLevel, NavigationMode } from '../types';
import { QUALITY_PROFILES } from './QualityProfiles';
import { MotionSensors } from './MotionSensors';
import { MorphField } from './MorphField';

export class SceneManager {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private universe: UniverseGenerator;
  private input: InputController;
  private sensors: MotionSensors;
  private morphField: MorphField;
  private container: HTMLElement;
  private onFPS: (fps: number) => void;
  
  private clock = new THREE.Clock();
  private lastTime = 0;
  private frames = 0;
  private state: AppState | null = null;

  constructor(container: HTMLElement, onFPS: (fps: number) => void) {
    this.container = container;
    this.onFPS = onFPS;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x010103);
    this.camera = new THREE.PerspectiveCamera(70, container.clientWidth / container.clientHeight, 0.1, 10000);
    this.camera.position.z = 100;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.3;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(this.renderer.domElement);
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
    sunLight.position.set(100, 100, 100);
    this.scene.add(sunLight);
    
    this.universe = new UniverseGenerator();
    this.scene.add(this.universe.group);
    
    this.sensors = new MotionSensors();
    this.morphField = new MorphField();
    this.scene.add(this.morphField.group);

    this.input = new InputController(container);
    window.addEventListener('resize', this.onResize.bind(this));
  }

  public syncState(state: AppState) {
    const prevQuality = this.state?.quality;
    const prevPOI = this.state?.currentPOI;
    const prevMode = this.state?.navigationMode;
    const prevRealism = this.state?.planetRealismDebug;
    const prevMilkyWay = this.state?.showMilkyWay;
    const prevEvents = this.state?.showEvents;
    
    this.state = state;
    const profile = QUALITY_PROFILES[state.quality];
    
    if (prevQuality !== state.quality || 
        prevRealism !== state.planetRealismDebug || 
        prevMilkyWay !== state.showMilkyWay || 
        prevEvents !== state.showEvents) {
      this.universe.generate(state.quality, state.showConstellations, state.planetRealismDebug, state.showMilkyWay, state.showEvents);
      this.renderer.setPixelRatio(profile.pixelRatioCap);
    }
    if (prevMode !== state.navigationMode) {
      this.input.setMode(state.navigationMode);
    }
    if (prevPOI !== state.currentPOI) {
      const poi = POIS.find(p => p.name === state.currentPOI);
      if (poi) this.input.reset(poi.position);
    }

    this.morphField.group.visible = state.sensorsEnabled;
  }

  private onResize() {
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  }

  public update() {
    const delta = Math.min(this.clock.getDelta(), 0.1);
    const time = this.clock.getElapsedTime();
    this.input.update(delta, this.camera);
    
    // Update Sensors
    this.sensors.update(delta, this.input.velocity, this.input.rotation, this.camera.position);
    
    // Sync energy to external world (for UI)
    if (this.state) {
      (this.state as any).motionEnergy = this.sensors.motionEnergy;
      (this.state as any).motionImpulse = this.sensors.motionImpulse;
    }

    // Update Morph Field
    if (this.state?.sensorsEnabled) {
      this.morphField.update(delta, this.sensors.motionEnergy, this.sensors.motionImpulse, this.camera);
    }

    this.universe.update(delta, this.input.velocity, this.camera.position, this.sensors.motionEnergy, this.state?.showEvents || false);
    this.universe.group.position.copy(this.input.worldPosition);

    const orbitRadius = this.input.zoom;
    this.camera.position.x = orbitRadius * Math.sin(this.input.rotation.y) * Math.cos(this.input.rotation.x);
    this.camera.position.y = orbitRadius * Math.sin(this.input.rotation.x);
    this.camera.position.z = orbitRadius * Math.cos(this.input.rotation.y) * Math.cos(this.input.rotation.x);
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
    this.frames++;
    if (time > this.lastTime + 1) {
      this.onFPS(Math.round(this.frames / (time - this.lastTime)));
      this.lastTime = time;
      this.frames = 0;
    }
  }

  public dispose() {
    this.renderer.dispose();
    this.input.dispose();
    window.removeEventListener('resize', this.onResize);
  }
}
