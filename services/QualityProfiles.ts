
import { QualityLevel, QualityProfile } from '../types';

export const QUALITY_PROFILES: Record<QualityLevel, QualityProfile> = {
  [QualityLevel.LOW]: {
    pixelRatioCap: 1.0,
    starCount: 3000,
    starLayers: 1,
    nebulaOctaves: 2,
    nebulaWarp: 0.1,
    bloomStrength: 0.5,
    distortionDetail: 0.5,
    useAntialias: false,
  },
  [QualityLevel.MEDIUM]: {
    pixelRatioCap: 1.5,
    starCount: 8000,
    starLayers: 2,
    nebulaOctaves: 4,
    nebulaWarp: 0.25,
    bloomStrength: 1.0,
    distortionDetail: 1.0,
    useAntialias: true,
  },
  [QualityLevel.HIGH]: {
    pixelRatioCap: window.devicePixelRatio || 2.0,
    starCount: 20000,
    starLayers: 3,
    nebulaOctaves: 6,
    nebulaWarp: 0.5,
    bloomStrength: 1.5,
    distortionDetail: 2.0,
    useAntialias: true,
  }
};
