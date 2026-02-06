
import * as THREE from 'three';
import { NavigationMode } from '../types';

export class InputController {
  public rotation = new THREE.Euler(0, 0, 0);
  public zoom = 100;
  public velocity = 0;
  public worldPosition = new THREE.Vector3(0, 0, 0);
  
  private targetRotation = new THREE.Euler(0, 0, 0);
  private targetZoom = 100;
  private mode: NavigationMode = NavigationMode.EXPLORE;
  
  private isPointerDown = false;
  private lastPointerPos = { x: 0, y: 0 };
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
    this.initListeners();
  }

  public setMode(mode: NavigationMode) {
    this.mode = mode;
  }

  private initListeners() {
    this.container.addEventListener('pointerdown', this.onPointerDown.bind(this));
    window.addEventListener('pointermove', this.onPointerMove.bind(this));
    window.addEventListener('pointerup', this.onPointerUp.bind(this));
    this.container.addEventListener('wheel', this.onWheel.bind(this), { passive: false });
    window.addEventListener('deviceorientation', this.onDeviceOrientation.bind(this));
  }

  private onPointerDown(e: PointerEvent) {
    this.isPointerDown = true;
    this.lastPointerPos = { x: e.clientX, y: e.clientY };
  }

  private onPointerMove(e: PointerEvent) {
    if (!this.isPointerDown) return;

    const dx = e.clientX - this.lastPointerPos.x;
    const dy = e.clientY - this.lastPointerPos.y;

    if (this.mode === NavigationMode.EXPLORE) {
      this.targetRotation.y += dx * 0.005;
      this.targetRotation.x += dy * 0.005;
    } else {
      // Warp Mode: Dragging adjusts direction of warp
      this.targetRotation.y += dx * 0.002;
      this.targetRotation.x += dy * 0.002;
    }

    const speed = Math.sqrt(dx * dx + dy * dy);
    this.velocity = THREE.MathUtils.lerp(this.velocity, speed * 0.01, 0.2);
    this.lastPointerPos = { x: e.clientX, y: e.clientY };
  }

  private onPointerUp() {
    this.isPointerDown = false;
  }

  private onWheel(e: WheelEvent) {
    e.preventDefault();
    if (this.mode === NavigationMode.EXPLORE) {
      this.targetZoom = THREE.MathUtils.clamp(this.targetZoom + e.deltaY * 0.05, 20, 2000);
    } else {
      // Warp Mode: Zoom acts as throttle
      this.velocity = THREE.MathUtils.lerp(this.velocity, Math.abs(e.deltaY) * 0.005, 0.2);
    }
  }

  private onDeviceOrientation(e: DeviceOrientationEvent) {
    if (e.beta !== null && e.gamma !== null) {
      const tiltX = (e.beta - 45) * (Math.PI / 180) * 0.2;
      const tiltY = e.gamma * (Math.PI / 180) * 0.2;
      this.targetRotation.x += tiltX * 0.005;
      this.targetRotation.y += tiltY * 0.005;
      this.velocity = THREE.MathUtils.lerp(this.velocity, (Math.abs(tiltX) + Math.abs(tiltY)) * 0.5, 0.1);
    }
  }

  public reset(position: [number, number, number] = [0, 0, 100]) {
    this.targetRotation.set(0, 0, 0);
    this.targetZoom = Math.sqrt(position[0]**2 + position[1]**2 + position[2]**2);
    this.worldPosition.set(0, 0, 0); // Reset warp travel
  }

  public update(delta: number, camera: THREE.Camera) {
    this.rotation.x = THREE.MathUtils.lerp(this.rotation.x, this.targetRotation.x, 0.1);
    this.rotation.y = THREE.MathUtils.lerp(this.rotation.y, this.targetRotation.y, 0.1);
    this.zoom = THREE.MathUtils.lerp(this.zoom, this.targetZoom, 0.1);
    
    if (this.mode === NavigationMode.WARP && this.velocity > 0.01) {
      // Move worldPosition in camera forward direction
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      const warpSpeed = this.velocity * this.zoom * 0.5; // Scaled by current perspective depth
      this.worldPosition.add(forward.multiplyScalar(warpSpeed));
    }

    this.velocity = THREE.MathUtils.lerp(this.velocity, 0, 0.03);
  }

  public dispose() {
    this.container.removeEventListener('pointerdown', this.onPointerDown.bind(this));
    window.removeEventListener('pointermove', this.onPointerMove.bind(this));
    window.removeEventListener('pointerup', this.onPointerUp.bind(this));
    this.container.removeEventListener('wheel', this.onWheel.bind(this));
    window.removeEventListener('deviceorientation', this.onDeviceOrientation.bind(this));
  }
}
