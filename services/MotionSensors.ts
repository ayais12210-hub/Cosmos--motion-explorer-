
import * as THREE from 'three';

export class MotionSensors {
  public motionEnergy: number = 0;
  public motionImpulse: number = 0;
  private lastRotation = new THREE.Euler();
  private lastPosition = new THREE.Vector3();
  
  constructor() {}

  public update(delta: number, velocity: number, rotation: THREE.Euler, cameraPos: THREE.Vector3) {
    // 1. Compute delta based energy
    const rotDelta = Math.abs(rotation.x - this.lastRotation.x) + Math.abs(rotation.y - this.lastRotation.y);
    const posDelta = cameraPos.distanceTo(this.lastPosition);
    
    // 2. Combine inputs (velocity, drag, warp speed)
    let rawEnergy = (velocity * 2.0) + (rotDelta * 5.0) + (posDelta * 0.1);
    rawEnergy = Math.min(rawEnergy, 1.0);

    // 3. Smoothing and Impulse
    const targetEnergy = THREE.MathUtils.clamp(rawEnergy, 0, 1);
    
    // Impulse is the sudden change in energy
    const diff = targetEnergy - this.motionEnergy;
    if (diff > 0.3) {
      this.motionImpulse = THREE.MathUtils.lerp(this.motionImpulse, 1.0, 0.5);
    } else {
      this.motionImpulse = THREE.MathUtils.lerp(this.motionImpulse, 0, 0.1);
    }

    this.motionEnergy = THREE.MathUtils.lerp(this.motionEnergy, targetEnergy, diff > 0 ? 0.2 : 0.05);

    // Store state
    this.lastRotation.copy(rotation);
    this.lastPosition.copy(cameraPos);
  }
}
