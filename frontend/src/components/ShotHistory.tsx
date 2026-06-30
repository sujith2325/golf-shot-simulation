import React from 'react';
import { useShotStore, ShotResult } from '../store/useShotStore';
import { 
  Play, 
  Trash2, 
  Layers, 
  History,
  Info 
} from 'lucide-react';

export default function ShotHistory() {
  const shotHistory = useShotStore((state) => state.shotHistory);
  const deleteShot = useShotStore((state) => state.deleteShot);
  const currentShot = useShotStore((state) => state.currentShot);
  const setField = useShotStore((state) => state.setField);
  const setActiveTab = useShotStore((state) => state.setActiveTab);
  const addToComparison = useShotStore((state) => state.addToComparison);
  const token = useShotStore((state) => state.token);

  if (!token) {
    return (
      <div className="flex-1 glass-card rounded-2xl border border-slate-800/80 p-8 flex flex-col items-center justify-center text-center text-slate-500 min-h-[300px]">
        <History size={32} className="text-slate-700 animate-pulse mb-3" />
        <p className="text-sm font-semibold tracking-wide text-slate-400">Shot History Unavailable</p>
        <p className="text-xs text-slate-600 mt-1">Please sign in to save shots and access your historical performance logs.</p>
      </div>
    );
  }

  if (shotHistory.length === 0) {
    return (
      <div className="flex-1 glass-card rounded-2xl border border-slate-800/80 p-8 flex flex-col items-center justify-center text-center text-slate-500 min-h-[300px]">
        <History size={32} className="text-slate-700 mb-3" />
        <p className="text-sm font-semibold tracking-wide text-slate-400">Performance Log is Empty</p>
        <p className="text-xs text-slate-600 mt-1">You haven't saved any shot simulations yet. Run simulations and click "Save Shot" to log entries here.</p>
      </div>
    );
  }

  const handleReplay = (shot: ShotResult) => {
    setField('currentShot', shot);
    setActiveTab('simulator');
  };

  return (
    <div className="flex-1 glass-card rounded-2xl border border-slate-800/80 p-6 flex flex-col gap-4 shadow-[inset_1px_1px_0_rgba(255,255,255,0.02)]">
      <div>
        <h2 className="text-white font-bold text-base tracking-wide flex items-center gap-2">
          <History size={18} className="text-golf-green" />
          Performance Logs
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Replay, delete, or compare past logged shots.</p>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-850">
              <th className="pb-3 px-4">Date</th>
              <th className="pb-3 px-4">Club</th>
              <th className="pb-3 px-4">Speed</th>
              <th className="pb-3 px-4">Launch/Spin</th>
              <th className="pb-3 px-4">Terrain</th>
              <th className="pb-3 px-4">Carry</th>
              <th className="pb-3 px-4">Total Dist</th>
              <th className="pb-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850 text-slate-300">
            {shotHistory.map((shot) => {
              const dateStr = shot.createdAt 
                ? new Date(shot.createdAt).toLocaleDateString()
                : 'Recent';
              return (
                <tr key={shot.id} className="hover:bg-slate-900/30 transition-all">
                  <td className="py-3 px-4 font-semibold text-slate-400">{dateStr}</td>
                  <td className="py-3 px-4 text-white font-bold">{shot.clubUsed}</td>
                  <td className="py-3 px-4">{shot.clubSpeed.toFixed(0)} MPH</td>
                  <td className="py-3 px-4">
                    {shot.launchAngle.toFixed(1)}° / {shot.spinRate.toFixed(0)} RPM
                  </td>
                  <td className="py-3 px-4 text-slate-400">{shot.terrain}</td>
                  <td className="py-3 px-4 font-medium">{shot.carryDistance.toFixed(1)} yds</td>
                  <td className="py-3 px-4 text-golf-green font-bold">{shot.totalDistance.toFixed(1)} yds</td>
                  <td className="py-3 px-4 text-right space-x-1">
                    <button
                      onClick={() => handleReplay(shot)}
                      className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-golf-green hover:border-golf-green cursor-pointer transition-all inline-flex"
                      title="Replay in Simulator"
                    >
                      <Play size={12} />
                    </button>
                    <button
                      onClick={() => addToComparison(shot)}
                      className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-neon-cyan hover:border-neon-cyan cursor-pointer transition-all inline-flex"
                      title="Add to Comparison"
                    >
                      <Layers size={12} />
                    </button>
                    <button
                      onClick={() => shot.id && deleteShot(shot.id)}
                      className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-500 hover:border-rose-500 cursor-pointer transition-all inline-flex"
                      title="Delete Record"
                    >
                      <Trash2 size={12} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
