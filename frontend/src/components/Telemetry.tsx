import React from 'react';
import { useShotStore } from '../store/useShotStore';
import { 
  Navigation, 
  ArrowUp, 
  Clock, 
  Compass, 
  Activity,
  RotateCw,
  Zap,
  Bookmark
} from 'lucide-react';

export default function Telemetry() {
  const currentShot = useShotStore((state) => state.currentShot);
  const token = useShotStore((state) => state.token);
  const saveCurrentShot = useShotStore((state) => state.saveCurrentShot);

  if (!currentShot) {
    return (
      <div className="flex-1 glass-card rounded-2xl border border-slate-800/80 p-8 flex flex-col items-center justify-center text-center text-slate-500 min-h-[140px]">
        <Activity size={28} className="text-slate-700 animate-pulse mb-2.5" />
        <p className="text-sm font-semibold tracking-wide text-slate-400">Launch Telemetry Offline</p>
        <p className="text-xs text-slate-600 mt-1">Configure launch variables and click "LAUNCH SIMULATION" to record parameters.</p>
      </div>
    );
  }

  const ballSpeedMPH = currentShot.clubSpeed * currentShot.spinTilt; // wait, ball speed is club speed * smash factor
  const calculatedBallSpeed = currentShot.clubSpeed * 1.49; // fallback approx, but let's grab it from trajectory if available
  const initialSpeed = currentShot.trajectory.length > 0 ? (currentShot.trajectory[0].speed * 2.23694).toFixed(1) : (calculatedBallSpeed).toFixed(1);

  const metrics = [
    { 
      label: 'Carry Distance', 
      value: `${currentShot.carryDistance.toFixed(1)} yds`, 
      icon: Navigation, 
      color: 'text-golf-green shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
    },
    { 
      label: 'Total Distance', 
      value: `${currentShot.totalDistance.toFixed(1)} yds`, 
      icon: Zap, 
      color: 'text-neon-cyan shadow-[0_0_15px_rgba(14,165,233,0.15)]' 
    },
    { 
      label: 'Apex (Max Height)', 
      value: `${currentShot.maxHeight.toFixed(1)} yds`, 
      icon: ArrowUp, 
      color: 'text-neon-orange shadow-[0_0_15px_rgba(249,115,22,0.15)]' 
    },
    { 
      label: 'Hang Time', 
      value: `${currentShot.hangTime.toFixed(2)} s`, 
      icon: Clock, 
      color: 'text-purple-400' 
    },
    { 
      label: 'Ball Speed', 
      value: `${initialSpeed} MPH`, 
      icon: Activity, 
      color: 'text-indigo-400' 
    },
    { 
      label: 'Backspin Rate', 
      value: `${currentShot.spinRate.toFixed(0)} RPM`, 
      icon: RotateCw, 
      color: 'text-pink-400' 
    },
    { 
      label: 'Spin Axis Tilt', 
      value: `${currentShot.spinTilt > 0 ? `+${currentShot.spinTilt}` : currentShot.spinTilt}°`, 
      icon: Compass, 
      color: 'text-teal-400' 
    },
    { 
      label: 'Launch Angle', 
      value: `${currentShot.launchAngle.toFixed(1)}°`, 
      icon: ArrowUp, 
      color: 'text-amber-400' 
    }
  ];

  return (
    <div className="flex-1 space-y-4">
      {/* Telemetry Header */}
      <div className="flex justify-between items-center px-1">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            📊 Launch Telemetry
          </h3>
        </div>
        
        {token && (
          <button
            onClick={saveCurrentShot}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700/80 hover:border-golf-green bg-slate-900/50 hover:bg-golf-green/10 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <Bookmark size={14} />
            Save Shot to Log
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div 
              key={idx} 
              className="glass-card rounded-2xl p-4.5 border border-slate-800/80 flex items-center gap-4 hover:border-slate-700/85 transition-all shadow-[inset_1px_1px_0_rgba(255,255,255,0.02)]"
            >
              <div className={`p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 ${m.color}`}>
                <Icon size={18} />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">{m.label}</p>
                <p className="text-lg font-extrabold text-white mt-0.5 tracking-tight">{m.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
