
import React, { useMemo } from 'react';
import { Eye, EyeOff, Zap, RefreshCw, Compass, ShieldCheck, ShieldAlert, Rocket, MousePointer2, Layers, Activity, Sparkles, MilkyWay as MilkyWayIcon } from 'lucide-react';
import { AppState, QualityLevel, POIS, NavigationMode } from '../types';

interface UIOverlayProps {
  state: AppState;
  onUpdate: (updates: Partial<AppState>) => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ state, onUpdate }) => {
  const scaleLabel = useMemo(() => {
    if (state.currentPOI.includes('Galaxy')) return 'EXTRAGALACTIC';
    if (state.currentPOI.includes('Milky')) return 'GALACTIC';
    return 'LOCAL SPACE';
  }, [state.currentPOI]);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 overflow-hidden">
      {/* Top Section */}
      <div className="flex justify-between items-start">
        <div className="pointer-events-auto bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-xl w-48">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center border border-indigo-500/30">
              <Zap className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-wider uppercase text-zinc-100 leading-tight">Cosmos</h1>
              <p className="text-[10px] text-zinc-400 font-mono">{state.fps} FPS</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex bg-zinc-900/50 p-1 rounded-lg border border-white/5 mb-2">
              <button 
                onClick={() => onUpdate({ navigationMode: NavigationMode.EXPLORE })}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md transition-all ${state.navigationMode === NavigationMode.EXPLORE ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500'}`}
              >
                <MousePointer2 className="w-3 h-3" />
                <span className="text-[9px] font-black uppercase">Orbit</span>
              </button>
              <button 
                onClick={() => onUpdate({ navigationMode: NavigationMode.WARP })}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md transition-all ${state.navigationMode === NavigationMode.WARP ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500'}`}
              >
                <Rocket className="w-3 h-3" />
                <span className="text-[9px] font-black uppercase">Warp</span>
              </button>
            </div>

            <button 
              onClick={() => onUpdate({ showMilkyWay: !state.showMilkyWay })}
              className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-colors border ${state.showMilkyWay ? 'bg-indigo-500/20 text-indigo-200 border-indigo-500/30' : 'bg-zinc-800/50 text-zinc-400 border-zinc-700/50'}`}
            >
              <Activity className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Deep Space</span>
            </button>

            <button 
              onClick={() => onUpdate({ showEvents: !state.showEvents })}
              className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-colors border ${state.showEvents ? 'bg-indigo-500/20 text-indigo-200 border-indigo-500/30' : 'bg-zinc-800/50 text-zinc-400 border-zinc-700/50'}`}
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Events</span>
            </button>

            <button 
              onClick={() => onUpdate({ sensorsEnabled: !state.sensorsEnabled })}
              className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-colors border ${state.sensorsEnabled ? 'bg-blue-500/20 text-blue-200 border-blue-500/30' : 'bg-zinc-800/50 text-zinc-400 border-zinc-700/50'}`}
            >
              <Activity className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Sensors</span>
            </button>
          </div>
        </div>

        <div className="pointer-events-auto bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-xl">
          <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2 font-black">POI JUMP</label>
          <select 
            value={state.currentPOI}
            onChange={(e) => onUpdate({ currentPOI: e.target.value })}
            className="bg-zinc-900/90 text-white text-[10px] font-bold rounded-lg px-3 py-2 border border-zinc-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full mb-4"
          >
            {POIS.map(poi => <option key={poi.name} value={poi.name}>{poi.name}</option>)}
          </select>

          <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2 font-black">PRESET</label>
          <div className="grid grid-cols-3 gap-1">
            {[QualityLevel.LOW, QualityLevel.MEDIUM, QualityLevel.HIGH].map(lvl => (
              <button
                key={lvl}
                onClick={() => onUpdate({ quality: lvl })}
                className={`text-[9px] font-black py-1.5 rounded transition-all ${state.quality === lvl ? 'bg-indigo-500 text-white' : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
              >
                {lvl.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="flex justify-between items-end">
        <div className="pointer-events-none space-y-2">
          <div className="bg-black/60 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-1 flex items-center gap-2">
              Motion Energy: {(state.motionEnergy || 0).toFixed(2)}
            </span>
            <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden mb-2">
              <div 
                className="bg-indigo-500 h-full transition-all duration-75" 
                style={{ width: `${(state.motionEnergy || 0) * 100}%` }}
              />
            </div>
            <div className="flex items-center gap-4 text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">
              <span>Starfield: Infinite ✓</span>
              <span>Layer: {state.showMilkyWay ? 'Galactic' : 'Empty'} ✓</span>
            </div>
            <span className="text-xs font-black text-indigo-300 tracking-tight">{scaleLabel}</span>
          </div>
          {state.sensorsEnabled && (
            <div className="bg-blue-900/60 text-blue-100 text-[10px] font-black px-4 py-1.5 rounded-full border border-blue-600/50 backdrop-blur-md animate-pulse flex items-center gap-2 tracking-widest uppercase">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
              Sensors Armed
            </div>
          )}
        </div>

        <button 
          onClick={() => onUpdate({ currentPOI: 'Origin' })}
          className="pointer-events-auto w-12 h-12 bg-white/5 hover:bg-white/15 text-white rounded-full flex items-center justify-center border border-white/10 transition-all active:scale-90 backdrop-blur-md shadow-2xl"
          title="Reset View"
        >
          <RefreshCw className="w-5 h-5 text-indigo-300" />
        </button>
      </div>
    </div>
  );
};

export default UIOverlay;
