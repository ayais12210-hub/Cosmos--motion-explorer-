
export enum QualityLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export enum NavigationMode {
  EXPLORE = 'Explore',
  WARP = 'Warp'
}

export interface QualityProfile {
  pixelRatioCap: number;
  starCount: number;
  starLayers: number;
  nebulaOctaves: number;
  nebulaWarp: number;
  bloomStrength: number;
  distortionDetail: number;
  useAntialias: boolean;
}

export interface AppState {
  showConstellations: boolean;
  showMilkyWay: boolean;
  showEvents: boolean;
  sensorsEnabled: boolean;
  postProcessing: boolean;
  quality: QualityLevel;
  qualityLock: boolean;
  fps: number;
  motionEnabled: boolean;
  currentPOI: string;
  navigationMode: NavigationMode;
  scaleLabel: string;
  planetRealismDebug: boolean;
  motionEnergy: number;
  motionImpulse: number;
}

export interface POI {
  name: string;
  position: [number, number, number];
  description: string;
}

export const POIS: POI[] = [
  { name: 'Origin', position: [0, 0, 100], description: 'The galactic center viewpoint' },
  { name: 'Nebula Core', position: [50, 20, -50], description: 'A dense region of ionized gas' },
  { name: 'Singularity', position: [-80, -30, -100], description: 'The Great Devourer' },
  { name: 'Milky Way Band', position: [200, 0, 0], description: 'The dense star-lane of our home galaxy' },
  { name: 'Spiral Galaxy Field', position: [800, 400, -1200], description: 'A cluster of distant spiral galaxies' },
  { name: 'The Void Portal', position: [0, -60, -200], description: 'An ancient gateway' }
];
