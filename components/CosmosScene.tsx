
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { SceneManager } from '../services/SceneManager';
import { AppState } from '../types';

interface CosmosSceneProps {
  state: AppState;
  onFPSUpdate: (fps: number) => void;
}

const CosmosScene: React.FC<CosmosSceneProps> = ({ state, onFPSUpdate }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const managerRef = useRef<SceneManager | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const manager = new SceneManager(containerRef.current, onFPSUpdate);
    managerRef.current = manager;

    const animate = () => {
      manager.update();
      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      manager.dispose();
    };
  }, []);

  // Sync state to the manager
  useEffect(() => {
    if (managerRef.current) {
      managerRef.current.syncState(state);
    }
  }, [state]);

  return <div ref={containerRef} className="w-full h-full" />;
};

export default CosmosScene;
