import React from 'react';
import { useShotStore } from '../store/useShotStore';
import { 
  Play, 
  Target, 
  Award, 
  HelpCircle, 
  Settings, 
  Compass, 
  Activity, 
  ChevronRight 
} from 'lucide-react';

export default function GameMenu() {
  const startNewGame = useShotStore((state) => state.startNewGame);
  const setGameMode = useShotStore((state) => state.setGameMode);
  const coins = useShotStore((state) => state.coins);
  const xp = useShotStore((state) => state.xp);

  const handleStartGame = () => {
    startNewGame('quick_play');
  };

  return (
    <div className="absolute inset-0 bg-[#070a13]/80 backdrop-blur-xl flex items-center justify-center z-40 p-6">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        
        {/* Left Side: Game Details & Features */}
        <div className="space-y-6 text-left">
          <div>
            <span className="px-3.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-golf-green/10 text-golf-green border border-golf-green/20">
              New Mode Active
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mt-3">
              GolfVision <span className="text-golf-green">Play</span>
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed mt-2.5 max-w-sm">
              An immersive 3D browser golf game. Control your swing tempo naturally with the mouse and compete in courses powered by professional aerodynamics.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-850">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Level Progress</p>
              <p className="text-white font-extrabold text-lg mt-0.5">Lv. 3 Amateur</p>
              <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                <div className="w-[60%] h-full bg-golf-green"></div>
              </div>
              <p className="text-[9px] text-slate-500 mt-1">{xp} XP Saved</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-850">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Coins Balance</p>
              <p className="text-white font-extrabold text-lg mt-0.5">🪙 {coins}</p>
              <p className="text-[9px] text-golf-green font-bold mt-2 hover:underline cursor-pointer">Visit Pro Shop →</p>
            </div>
          </div>

          <div className="flex gap-4 items-center text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <Activity size={14} className="text-neon-cyan" />
              PBR Graphics
            </div>
            <div className="flex items-center gap-1.5">
              <Compass size={14} className="text-neon-orange" />
              Dynamic Wind
            </div>
          </div>
        </div>

        {/* Right Side: Game Selector List */}
        <div className="glass-panel border border-slate-800/80 rounded-3xl p-6.5 space-y-4 shadow-2xl">
          <h2 className="text-white font-bold text-sm uppercase tracking-wider border-b border-slate-850 pb-2">
            Select Game Session
          </h2>

          <div className="space-y-3">
            {/* Play Golf */}
            <button
              onClick={handleStartGame}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-golf-green/20 to-emerald-950/20 hover:from-golf-green/30 hover:to-emerald-950/30 border border-golf-green/30 text-left cursor-pointer transition-all hover:scale-[1.02] shadow-[0_4px_20px_rgba(16,185,129,0.1)] group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-golf-green text-slate-900 shadow-[0_0_12px_rgba(16,185,129,0.4)] group-hover:scale-110 transition-transform">
                  <Play size={18} fill="currentColor" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Start Match</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Play Hole 1 (Par 3 - Forest Course)</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-golf-green" />
            </button>

            {/* Target Challenge */}
            <button
              onClick={handleStartGame}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-900/50 hover:bg-slate-850/50 border border-slate-800/80 text-left cursor-pointer transition-all hover:scale-[1.02] group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-slate-800 text-neon-cyan group-hover:scale-110 transition-transform">
                  <Target size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Closest to the Pin</p>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">Accuracy target contest. Earn medals.</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-500 group-hover:text-white" />
            </button>

            {/* Analytics Simulator */}
            <button
              onClick={() => setGameMode('simulator')}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-900/50 hover:bg-slate-850/50 border border-slate-800/80 text-left cursor-pointer transition-all hover:scale-[1.02] group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-slate-800 text-neon-orange group-hover:scale-110 transition-transform">
                  <Award size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Analytics Simulator</p>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">Manual variable simulator and plots.</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-500 group-hover:text-white" />
            </button>
          </div>
          
          <div className="flex justify-between items-center text-[10px] font-semibold text-slate-600 pt-3 border-t border-slate-850">
            <span>Server: local-dev-v1</span>
            <span className="flex items-center gap-1">
              <Settings size={10} />
              Settings
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
