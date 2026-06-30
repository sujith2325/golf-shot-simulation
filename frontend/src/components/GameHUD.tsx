import React from 'react';
import { useShotStore } from '../store/useShotStore';
import { 
  Wind, 
  Flag, 
  HelpCircle, 
  RefreshCw, 
  LogOut,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function GameHUD() {
  const ballPosition = useShotStore((state) => state.ballPosition);
  const pinPosition = useShotStore((state) => state.pinPosition);
  const shotCount = useShotStore((state) => state.shotCount);
  const score = useShotStore((state) => state.score);
  const windSpeed = useShotStore((state) => state.windSpeed);
  const windDir = useShotStore((state) => state.windDir);
  const clubUsed = useShotStore((state) => state.clubUsed);
  const setClub = useShotStore((state) => state.setClub);
  const terrain = useShotStore((state) => state.terrain);
  const resetHole = useShotStore((state) => state.resetHole);
  const returnToMenu = useShotStore((state) => state.returnToMenu);
  
  // Calculate distance in yards
  const dx = ballPosition.x - pinPosition.x;
  const dz = ballPosition.z - pinPosition.z;
  const distToPin = Math.sqrt(dx * dx + dz * dz);

  const clubs = ['Driver', '3-Wood', '5-Wood', '4-Iron', '7-Iron', '9-Iron', 'Wedge'];
  const activeClubIdx = clubs.indexOf(clubUsed);

  const handlePrevClub = () => {
    if (activeClubIdx > 0) {
      setClub(clubs[activeClubIdx - 1]);
    }
  };

  const handleNextClub = () => {
    if (activeClubIdx < clubs.length - 1) {
      setClub(clubs[activeClubIdx + 1]);
    }
  };

  // AI Caddie suggestions based on distance
  const getCaddieAdvice = () => {
    if (distToPin > 210) {
      return { club: 'Driver', power: '90-100%', note: 'Full swing. Account for wind carry.' };
    } else if (distToPin > 170) {
      return { club: '5-Wood', power: '85-95%', note: 'High launch profile to bypass rough.' };
    } else if (distToPin > 130) {
      return { club: '7-Iron', power: '80-90%', note: 'Clean iron compression needed.' };
    } else if (distToPin > 60) {
      return { club: 'Wedge', power: '60-80%', note: 'Approach shot. Control backswing.' };
    } else {
      return { club: 'Wedge', power: '20-40%', note: 'Pitching on green. Avoid sand hazard.' };
    }
  };

  const advice = getCaddieAdvice();

  return (
    <div className="absolute inset-x-0 inset-y-0 pointer-events-none flex flex-col justify-between p-6 z-35 select-none font-sans">
      
      {/* Top Section HUD */}
      <div className="flex justify-between items-start w-full">
        {/* Top Left: Score card */}
        <div className="glass-panel border border-slate-800/80 rounded-2xl p-4 flex gap-5 backdrop-blur-md pointer-events-auto shadow-lg text-left">
          <div className="border-r border-slate-800 pr-5">
            <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Course</p>
            <p className="text-white font-black text-sm mt-0.5">Hole 1 - Par 3</p>
          </div>
          <div className="border-r border-slate-800 pr-5">
            <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Strokes</p>
            <p className="text-golf-green font-black text-sm mt-0.5">{shotCount}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Score</p>
            <p className="text-white font-black text-sm mt-0.5">
              {score > 0 ? `+${score}` : score === 0 ? 'E' : score}
            </p>
          </div>
        </div>

        {/* Top Center: Distance flag */}
        <div className="glass-panel border border-slate-800/80 rounded-2xl py-3 px-6 text-center backdrop-blur-md pointer-events-auto flex items-center gap-3.5 shadow-lg">
          <div className="w-8 h-8 rounded-lg bg-neon-cyan/15 border border-neon-cyan/25 flex items-center justify-center text-neon-cyan">
            <Flag size={16} />
          </div>
          <div className="text-left">
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Distance remaining</p>
            <p className="text-xl font-black text-white leading-none mt-1">
              {distToPin.toFixed(0)} <span className="text-xs font-bold text-slate-400">YDS</span>
            </p>
          </div>
        </div>

        {/* Top Right: Wind and Settings */}
        <div className="flex gap-3 pointer-events-auto">
          {/* Wind gauge */}
          <div className="glass-panel border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3 backdrop-blur-md shadow-lg text-left">
            <div className="p-2 bg-slate-900 border border-slate-800 rounded-xl relative flex items-center justify-center text-neon-cyan">
              <Wind size={16} />
              {/* Rotating direction arrow */}
              <div 
                className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-300"
                style={{ transform: `rotate(${windDir}deg)` }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-neon-cyan"></div>
                <div className="absolute top-0.5 w-0.5 h-2 bg-neon-cyan rounded-full"></div>
              </div>
            </div>
            <div>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Wind</p>
              <p className="text-xs font-black text-white mt-0.5">{windSpeed} MPH</p>
            </div>
          </div>

          {/* Reset / Quit */}
          <div className="flex flex-col gap-1.5">
            <button
              onClick={resetHole}
              className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white cursor-pointer transition-all shadow-md"
              title="Reset Hole"
            >
              <RefreshCw size={14} />
            </button>
            <button
              onClick={returnToMenu}
              className="p-3 rounded-xl bg-slate-950/80 border border-slate-850 hover:border-rose-500/20 text-slate-500 hover:text-rose-400 cursor-pointer transition-all shadow-md"
              title="Exit Game"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Middle Section HUD: Swing Guide */}
      <div className="my-auto flex flex-col items-center justify-center">
        {shotCount === 0 && ballPosition.z === 0 && (
          <div className="py-2.5 px-5 rounded-full bg-slate-950/70 border border-slate-850 backdrop-blur-sm animate-pulse text-[11px] font-bold text-slate-400 shadow-md">
            🖱️ SWING CONTROLS: Click & Drag mouse down, then swipe forward quickly and release!
          </div>
        )}
      </div>

      {/* Bottom Section HUD */}
      <div className="flex justify-between items-end w-full">
        {/* Bottom Left: Club Selector */}
        <div className="glass-panel border border-slate-800/80 rounded-2xl p-4 backdrop-blur-md pointer-events-auto flex items-center gap-4 shadow-lg text-left">
          <div>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Active Club</p>
            <p className="text-base font-black text-white mt-0.5">{clubUsed}</p>
            <span className="text-[9px] font-semibold text-slate-500 capitalize">{terrain} lie</span>
          </div>
          
          <div className="flex items-center gap-1 border-l border-slate-800 pl-4">
            <button
              onClick={handlePrevClub}
              disabled={activeClubIdx === 0}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={handleNextClub}
              disabled={activeClubIdx === clubs.length - 1}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Bottom Center: AI Caddie advice card */}
        <div className="glass-panel border border-slate-800/80 rounded-2xl py-3 px-5 backdrop-blur-md pointer-events-auto flex items-center gap-4.5 shadow-lg text-left max-w-sm">
          <div className="p-2.5 rounded-xl bg-golf-green/10 text-golf-green border border-golf-green/20">
            <Sparkles size={16} />
          </div>
          <div>
            <p className="text-[9px] text-golf-green font-extrabold uppercase tracking-widest flex items-center gap-1">
              AI Caddie Suggestions
            </p>
            <p className="text-xs font-extrabold text-white mt-1">
              Use {advice.club} at {advice.power} power
            </p>
            <p className="text-[10px] text-slate-400 leading-none mt-0.5">{advice.note}</p>
          </div>
        </div>

        {/* Bottom Right: Spacer for Swing Meter overlays */}
        <div className="w-48"></div>

      </div>

    </div>
  );
}
