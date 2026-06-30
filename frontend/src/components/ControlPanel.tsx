import React from 'react';
import { useShotStore } from '../store/useShotStore';
import { 
  Wind, 
  CloudSun, 
  Zap, 
  Map, 
  Target, 
  HelpCircle 
} from 'lucide-react';

export default function ControlPanel() {
  const store = useShotStore();

  const handleClubChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    store.setClub(e.target.value);
  };

  const handleSimulate = () => {
    store.runSimulation();
  };

  const clubs = ['Driver', '3-Wood', '5-Wood', '4-Iron', '7-Iron', '9-Iron', 'Wedge'];
  const terrains = ['Fairway', 'Rough', 'Sand', 'Wet Grass'];

  return (
    <div className="w-80 glass-panel border-l border-slate-800 p-5 flex flex-col justify-between overflow-y-auto max-h-screen text-slate-300">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-bold text-base tracking-wide flex items-center gap-2">
            <Zap size={18} className="text-golf-green" />
            Configurator
          </h2>
          <select
            value={store.mode}
            onChange={(e) => store.setField('mode', e.target.value)}
            className="text-xs bg-slate-900 border border-slate-800 text-slate-400 py-1 px-2.5 rounded-lg font-semibold cursor-pointer outline-none hover:text-white transition-all"
          >
            <option value="pro">Pro Engine</option>
            <option value="legacy">Legacy JS</option>
          </select>
        </div>

        {/* Club Select Preset */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Select ClubPreset</label>
          <select
            value={store.clubUsed}
            onChange={handleClubChange}
            className="w-full glass-input rounded-xl py-2 px-3 text-sm focus:border-golf-green outline-none"
          >
            {clubs.map((c) => (
              <option key={c} value={c} className="bg-slate-900">{c}</option>
            ))}
          </select>
        </div>

        <hr className="border-slate-800/80" />

        {/* Ball & Launch Telemetry */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            🏌️ Launch Parameters
          </h3>

          {/* Club Speed */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-400">Club Speed</span>
              <span className="text-white font-semibold">{store.clubSpeed} MPH</span>
            </div>
            <input
              type="range"
              min="40"
              max="150"
              value={store.clubSpeed}
              onChange={(e) => store.setField('clubSpeed', parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-golf-green"
            />
          </div>

          {/* Launch Angle (Vertical) */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-400">Launch Angle (Loft)</span>
              <span className="text-white font-semibold">{store.launchAngle}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              step="0.5"
              value={store.launchAngle}
              onChange={(e) => store.setField('launchAngle', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-golf-green"
            />
          </div>

          {/* Path Angle (Horizontal) */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-400">Swing Path (In-Out)</span>
              <span className="text-white font-semibold">{store.pathAngle > 0 ? `+${store.pathAngle}` : store.pathAngle}°</span>
            </div>
            <input
              type="range"
              min="-30"
              max="30"
              value={store.pathAngle}
              onChange={(e) => store.setField('pathAngle', parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-golf-green"
            />
          </div>

          {/* Spin Rate */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-400">Backspin Rate</span>
              <span className="text-white font-semibold">{store.spinRate} RPM</span>
            </div>
            <input
              type="range"
              min="500"
              max="12000"
              step="100"
              value={store.spinRate}
              onChange={(e) => store.setField('spinRate', parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-golf-green"
            />
          </div>

          {/* Spin Axis Tilt */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-400">Spin Axis Tilt (Side)</span>
              <span className="text-white font-semibold">{store.spinTilt > 0 ? `+${store.spinTilt}` : store.spinTilt}°</span>
            </div>
            <input
              type="range"
              min="-45"
              max="45"
              value={store.spinTilt}
              onChange={(e) => store.setField('spinTilt', parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-golf-green"
            />
          </div>
        </div>

        <hr className="border-slate-800/80" />

        {/* Environment Settings (Wind + Climate) */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Wind size={14} className="text-neon-cyan" />
            Environment & Weather
          </h3>

          {/* Wind Settings */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase">Wind Speed</span>
              <input
                type="number"
                min="0"
                max="50"
                value={store.windSpeed}
                onChange={(e) => store.setField('windSpeed', Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full glass-input rounded-xl py-1.5 px-3 text-xs focus:border-neon-cyan outline-none"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase">Wind Dir (°)</span>
              <input
                type="number"
                min="0"
                max="359"
                value={store.windDir}
                onChange={(e) => store.setField('windDir', Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full glass-input rounded-xl py-1.5 px-3 text-xs focus:border-neon-cyan outline-none"
                placeholder="0-360"
              />
            </div>
          </div>

          {/* Climate (Temp / Altitude) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase">Temp (°F)</span>
              <input
                type="number"
                min="0"
                max="120"
                value={store.temp}
                onChange={(e) => store.setField('temp', parseInt(e.target.value) || 70)}
                className="w-full glass-input rounded-xl py-1.5 px-3 text-xs focus:border-neon-cyan outline-none"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase">Altitude (Ft)</span>
              <input
                type="number"
                min="0"
                max="10000"
                value={store.altitude}
                onChange={(e) => store.setField('altitude', parseInt(e.target.value) || 0)}
                className="w-full glass-input rounded-xl py-1.5 px-3 text-xs focus:border-neon-cyan outline-none"
              />
            </div>
          </div>

          {/* Terrain & Target */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase">Terrain Condition</span>
              <select
                value={store.terrain}
                onChange={(e) => store.setField('terrain', e.target.value)}
                className="w-full glass-input rounded-xl py-1.5 px-2 text-xs focus:border-neon-cyan outline-none"
              >
                {terrains.map((t) => (
                  <option key={t} value={t} className="bg-slate-900">{t}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase">Target (Yds)</span>
              <input
                type="number"
                min="10"
                max="500"
                value={store.targetDistance}
                onChange={(e) => store.setField('targetDistance', parseInt(e.target.value) || 250)}
                className="w-full glass-input rounded-xl py-1.5 px-3 text-xs focus:border-neon-cyan outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-6">
        <button
          onClick={handleSimulate}
          disabled={store.simulating}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-golf-green to-emerald-600 hover:from-emerald-500 hover:to-emerald-600 text-slate-900 font-extrabold text-sm tracking-wide shadow-[0_4px_25px_rgba(16,185,129,0.35)] hover:shadow-[0_4px_30px_rgba(16,185,129,0.5)] active:scale-97 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {store.simulating ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
              Calculating Flight...
            </div>
          ) : (
            "LAUNCH SIMULATION"
          )}
        </button>
      </div>
    </div>
  );
}
