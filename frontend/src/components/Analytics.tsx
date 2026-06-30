import React, { useState } from 'react';
import { useShotStore } from '../store/useShotStore';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line as RechartsLine, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { 
  TrendingUp, 
  RotateCw, 
  Activity, 
  TrendingDown 
} from 'lucide-react';

export default function Analytics() {
  const currentShot = useShotStore((state) => state.currentShot);
  const [chartType, setChartType] = useState<'height' | 'speed' | 'spin'>('height');

  if (!currentShot) {
    return (
      <div className="flex-1 glass-card rounded-2xl border border-slate-800/80 p-8 flex flex-col items-center justify-center text-center text-slate-500 min-h-[300px]">
        <TrendingUp size={32} className="text-slate-700 animate-pulse mb-3" />
        <p className="text-sm font-semibold tracking-wide text-slate-400">Flight Analytics Offline</p>
        <p className="text-xs text-slate-600 mt-1">Run a simulation to generate flight decay curves and apex graphs.</p>
      </div>
    );
  }

  // Downsample data for better Recharts rendering (max 100 points)
  const step = Math.max(1, Math.round(currentShot.trajectory.length / 100));
  const chartData = currentShot.trajectory
    .filter((_, idx) => idx % step === 0)
    .map((point) => ({
      time: point.time.toFixed(2),
      distance: (point.position.z * 1.09361).toFixed(0), // convert to yards
      height: (point.position.y * 1.09361).toFixed(1), // convert to yards
      speed: (point.speed * 2.23694).toFixed(0), // convert to MPH
      spin: (point.spin * 9.5493).toFixed(0) // rad/s to RPM
    }));

  const chartTabs = [
    { id: 'height', label: 'Apex Trajectory', desc: 'Height vs Distance', icon: TrendingUp, color: 'text-golf-green' },
    { id: 'speed', label: 'Velocity Decay', desc: 'Speed vs Time', icon: Activity, color: 'text-neon-cyan' },
    { id: 'spin', label: 'Spin Decay', desc: 'Backspin vs Time', icon: RotateCw, color: 'text-pink-400' }
  ];

  return (
    <div className="flex-1 glass-card rounded-2xl border border-slate-800/80 p-6 flex flex-col gap-6 shadow-[inset_1px_1px_0_rgba(255,255,255,0.02)]">
      {/* Chart Toggles */}
      <div className="flex justify-between items-center border-b border-slate-850 pb-4">
        <div>
          <h2 className="text-white font-bold text-base tracking-wide">Interactive Analytics</h2>
          <p className="text-xs text-slate-500 mt-0.5">Explore the aerodynamics decay variables of the last swing.</p>
        </div>
        <div className="flex gap-2">
          {chartTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = chartType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setChartType(tab.id as any)}
                className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                  isActive 
                    ? 'bg-slate-900 border border-slate-700 text-white' 
                    : 'text-slate-400 hover:text-white border border-transparent'
                }`}
              >
                <Icon size={14} className={isActive ? tab.color : 'text-slate-500'} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chart viewport */}
      <div className="h-[280px] w-full text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.03)" />
            
            {chartType === 'height' ? (
              <>
                <XAxis dataKey="distance" name="Distance" unit=" yds" stroke="#475569" tickLine={false} />
                <YAxis name="Height" unit=" yds" stroke="#475569" tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}
                  labelStyle={{ color: '#94a3b8' }}
                  itemStyle={{ color: '#10b981' }}
                />
                <RechartsLine type="monotone" dataKey="height" stroke="#10b981" strokeWidth={2} dot={false} name="Ball Height" />
              </>
            ) : chartType === 'speed' ? (
              <>
                <XAxis dataKey="time" name="Time" unit=" s" stroke="#475569" tickLine={false} />
                <YAxis name="Speed" unit=" MPH" stroke="#475569" tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}
                  labelStyle={{ color: '#94a3b8' }}
                  itemStyle={{ color: '#0ea5e9' }}
                />
                <RechartsLine type="monotone" dataKey="speed" stroke="#0ea5e9" strokeWidth={2} dot={false} name="Ball Speed" />
              </>
            ) : (
              <>
                <XAxis dataKey="time" name="Time" unit=" s" stroke="#475569" tickLine={false} />
                <YAxis name="Spin" unit=" RPM" stroke="#475569" tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}
                  labelStyle={{ color: '#94a3b8' }}
                  itemStyle={{ color: '#ec4899' }}
                />
                <RechartsLine type="monotone" dataKey="spin" stroke="#ec4899" strokeWidth={2} dot={false} name="Spin Rate" />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
