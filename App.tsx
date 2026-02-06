
import React, { useState, useEffect, useCallback } from 'react';
import CosmosScene from './components/CosmosScene';
import UIOverlay from './components/UIOverlay';
import { AppState, QualityLevel, NavigationMode } from './types';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    showConstellations: true,
    showMilkyWay: true,
    showEvents: true,
    sensorsEnabled: true,
    postProcessing: true,
    quality: QualityLevel.MEDIUM,
    qualityLock: false,
    fps: 0,
    motionEnabled: false,
    currentPOI: 'Origin',
    navigationMode: NavigationMode.EXPLORE,
    scaleLabel: 'LOCAL SPACE',
    planetRealismDebug: true,
    motionEnergy: 0,
    motionImpulse: 0
  });

  const [showMotionPrompt, setShowMotionPrompt] = useState(false);

  useEffect(() => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      setShowMotionPrompt(true);
    } else {
      setState(prev => ({ ...prev, motionEnabled: true }));
    }
  }, []);

  const handleRequestMotion = async () => {
    try {
      const permission = await (DeviceOrientationEvent as any).requestPermission();
      if (permission === 'granted') {
        setState(prev => ({ ...prev, motionEnabled: true }));
        setShowMotionPrompt(false);
      }
    } catch (e) {
      console.error('Motion permission denied', e);
      setShowMotionPrompt(false);
    }
  };

  const updateState = useCallback((updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  return (
    <div className="relative w-full h-screen bg-[#010103] select-none overflow-hidden">
      <CosmosScene 
        state={state} 
        onFPSUpdate={(fps) => updateState({ fps })}
      />
      
      <UIOverlay 
        state={state} 
        onUpdate={updateState} 
      />

      {showMotionPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl max-w-sm w-full text-center shadow-[0_0_50px_rgba(79,70,229,0.2)]">
            <div className="w-16 h-16 bg-indigo-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-indigo-500/30">
              <Zap className="w-8 h-8 text-indigo-400" />
            </div>
            <h2 className="text-2xl font-black mb-4 uppercase tracking-tight text-white">Motion Sync</h2>
            <p className="text-zinc-400 mb-8 leading-relaxed text-sm">
              Enable hardware motion sensors for immersive space-drift navigation. Tilt your device to steer through the cosmos.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleRequestMotion}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase py-4 px-6 rounded-2xl transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
              >
                Initialize Sensors
              </button>
              <button 
                onClick={() => setShowMotionPrompt(false)}
                className="w-full bg-zinc-800/50 hover:bg-zinc-700 text-zinc-400 font-bold py-3 px-6 rounded-2xl transition-all"
              >
                Manual Control Only
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Zap = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 L3 14 H12 L11 22 L21 10 H12 L13 2 Z"/></svg>
);

export default App;
