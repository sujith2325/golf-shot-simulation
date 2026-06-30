import React from 'react';
import { useShotStore } from '../store/useShotStore';
import { 
  Layers, 
  Trash2, 
  Plus, 
  TrendingUp,
  X 
} from 'lucide-react';

export default function CompareShots() {
  const compareShots = useShotStore((state) => state.compareShots);
  const currentShot = useShotStore((state) => state.currentShot);
  const removeFromComparison = useShotStore((state) => state.removeFromComparison);
  const clearComparison = useShotStore((state) => state.clearComparison);
  const addToComparison = useShotStore((state) => state.addToComparison);

  const handleAddActive = () => {
    if (currentShot) {
      addToComparison(currentShot);
    }
  };

  const metricsRow = [
    { label: 'Carry Distance (Yds)', key: 'carryDistance', precision: 1 },
    { label: 'Total Distance (Yds)', key: 'totalDistance', precision: 1 },
    { label: 'Max Apex Height (Yds)', key: 'maxHeight', precision: 1 },
    { label: 'Hang Time (Sec)', key: 'hangTime', precision: 2 },
    { label: 'Backspin Rate (RPM)', key: 'spinRate', precision: 0 },
    { label: 'Launch Angle (Deg)', key: 'launchAngle', precision: 1 },
    { label: 'Spin Axis Tilt (Deg)', key: 'spinTilt', precision: 1 }
  ];

  return (
    <div className="flex-1 space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center px-1">
        <div>
          <h2 className="text-white font-bold text-base tracking-wide flex items-center gap-2">
            <Layers size={18} className="text-golf-green" />
            Shot Comparison Center
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Overlay multiple trajectory lines in the 3D range and contrast stats.</p>
        </div>
        
        <div className="flex gap-2">
          {currentShot && (
            <button
              onClick={handleAddActive}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-xs font-semibold text-slate-300 hover:text-white hover:border-golf-green cursor-pointer transition-all"
            >
              <Plus size={14} className="text-golf-green" />
              Compare Active Shot
            </button>
          )}
          {compareShots.length > 0 && (
            <button
              onClick={clearComparison}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-xs font-semibold text-rose-400 cursor-pointer transition-all"
            >
              <Trash2 size={14} />
              Clear All Comparison
            </button>
          )}
        </div>
      </div>

      {compareShots.length === 0 ? (
        <div className="glass-card rounded-2xl border border-slate-800/80 p-10 flex flex-col items-center justify-center text-center text-slate-500 min-h-[300px]">
          <Layers size={32} className="text-slate-700 mb-3 animate-bounce" />
          <p className="text-sm font-semibold tracking-wide text-slate-400">Comparison Center Empty</p>
          <p className="text-xs text-slate-600 mt-1 max-w-md">
            Click "Compare Active Shot" or navigate to "Shot History" and click the layer icon to overlay multiple flight paths.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          
          {/* Comparison Cards list */}
          <div className="flex flex-wrap gap-3">
            {compareShots.map((shot, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between gap-3 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800/80 text-xs font-bold text-white shadow-inner"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: shot.color }}></span>
                  <span>{shot.clubUsed} ({shot.totalDistance.toFixed(0)} yds)</span>
                </div>
                <button
                  onClick={() => removeFromComparison(idx)}
                  className="text-slate-500 hover:text-rose-400 cursor-pointer transition-all"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>

          {/* Comparison Table */}
          <div className="glass-card rounded-2xl border border-slate-800/80 p-5 overflow-x-auto shadow-[inset_1px_1px_0_rgba(255,255,255,0.02)]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-850">
                  <th className="pb-3 px-3">Performance Metric</th>
                  {compareShots.map((shot, idx) => (
                    <th key={idx} className="pb-3 px-4 text-center" style={{ color: shot.color }}>
                      Shot {String.fromCharCode(65 + idx)} ({shot.clubUsed})
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/80 text-slate-300">
                {metricsRow.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-900/10">
                    <td className="py-3 px-3 font-semibold text-slate-400">{row.label}</td>
                    {compareShots.map((shot, sIdx) => {
                      const val = (shot as any)[row.key];
                      return (
                        <td key={sIdx} className="py-3 px-4 text-center font-extrabold text-white">
                          {typeof val === 'number' ? val.toFixed(row.precision) : val}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

    </div>
  );
}
