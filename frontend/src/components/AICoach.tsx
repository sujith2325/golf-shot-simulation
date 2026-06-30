import React from 'react';
import { useShotStore } from '../store/useShotStore';
import { 
  Award, 
  ThumbsUp, 
  AlertTriangle, 
  Lightbulb, 
  HelpCircle,
  TrendingUp,
  Sliders
} from 'lucide-react';

export default function AICoach() {
  const currentShot = useShotStore((state) => state.currentShot);
  const targetDistance = useShotStore((state) => state.targetDistance);

  if (!currentShot) {
    return (
      <div className="flex-1 glass-card rounded-2xl border border-slate-800/80 p-8 flex flex-col items-center justify-center text-center text-slate-500 min-h-[300px]">
        <Award size={32} className="text-slate-700 animate-pulse mb-3" />
        <p className="text-sm font-semibold tracking-wide text-slate-400">AI Coach Offline</p>
        <p className="text-xs text-slate-600 mt-1">Simulate a shot to receive AI-driven swing scores and club adjustments.</p>
      </div>
    );
  }

  const coach = currentShot.aiCoach || {
    score: 85,
    strengths: ["Clean contact preset."],
    weaknesses: ["None analyzed."],
    recommendation: "Maintain standard setup.",
    expectedGain: 0
  };

  const recClub = currentShot.clubRecommendation || {
    club: 'Driver',
    loft: 10.5,
    speed: 100,
    spin: 2500
  };

  return (
    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* 1. Score Panel */}
      <div className="glass-card rounded-2xl border border-slate-800/80 p-6 flex flex-col items-center justify-between text-center relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-10 -left-10 w-24 h-24 rounded-full bg-golf-green/10 blur-xl"></div>
        <div className="absolute -bottom-10 -right-10 w-24 h-24 rounded-full bg-neon-cyan/10 blur-xl"></div>

        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Swing Accuracy Score</h3>
        
        {/* Large Score Circle */}
        <div className="my-6 relative flex items-center justify-center">
          <div className="w-32 h-32 rounded-full border-4 border-slate-800 flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-white">{coach.score}</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">/ 100</span>
          </div>
          
          {/* Glowing Border overlay */}
          <div className="absolute inset-0 w-32 h-32 rounded-full border-4 border-golf-green/40 animate-ping opacity-25"></div>
        </div>

        <div>
          <span className="px-3.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-golf-green/10 text-golf-green border border-golf-green/20">
            {coach.score >= 90 ? 'Elite Tier' : coach.score >= 80 ? 'Advanced Tier' : 'Needs Practice'}
          </span>
          <p className="text-[10px] text-slate-500 font-medium mt-3.5">Metrics compared against Trackman average data.</p>
        </div>
      </div>

      {/* 2. Insights Panel (Strengths / Weaknesses) */}
      <div className="glass-card rounded-2xl border border-slate-800/80 p-6 flex flex-col gap-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-850 pb-2">
          Swing Signature analysis
        </h3>
        
        {/* Strengths */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-golf-green uppercase tracking-wide flex items-center gap-1.5">
            <ThumbsUp size={12} />
            Key Strengths
          </p>
          <ul className="text-xs text-slate-300 space-y-1.5 pl-1 list-inside list-disc">
            {coach.strengths.map((str, idx) => (
              <li key={idx} className="leading-relaxed">{str}</li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="space-y-2 pt-2 border-t border-slate-850">
          <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wide flex items-center gap-1.5">
            <AlertTriangle size={12} />
            Areas to Correct
          </p>
          <ul className="text-xs text-slate-300 space-y-1.5 pl-1 list-inside list-disc">
            {coach.weaknesses.map((weak, idx) => (
              <li key={idx} className="leading-relaxed">{weak}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* 3. AI Club & Recommendations */}
      <div className="glass-card rounded-2xl border border-slate-800/80 p-6 flex flex-col justify-between gap-4">
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-850 pb-2 flex items-center gap-2">
            <Lightbulb size={14} className="text-neon-orange" />
            Coach Recommendations
          </h3>
          
          <div className="mt-3.5 space-y-3">
            <p className="text-xs text-slate-300 leading-relaxed">
              <span className="font-bold text-white">Advice: </span>
              {coach.recommendation}
            </p>
            
            {coach.expectedGain > 0 && (
              <div className="p-3 rounded-xl bg-golf-green/5 border border-golf-green/20 flex items-center gap-2.5">
                <TrendingUp size={16} className="text-golf-green shrink-0" />
                <p className="text-xs text-slate-300">
                  Estimated distance gain: <span className="font-bold text-white">+{coach.expectedGain} yds</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Club Recommendation card */}
        <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-850/80 space-y-2">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Best Club for {targetDistance} yd Target</p>
          <div className="flex justify-between items-baseline">
            <p className="text-lg font-black text-white">{recClub.club}</p>
            <p className="text-xs text-golf-green font-bold">Loft: {recClub.loft}°</p>
          </div>
          <p className="text-[10px] text-slate-400">
            Suggested Swing: <span className="text-white font-semibold">{recClub.speed} MPH</span>, expect ~<span className="text-white font-semibold">{recClub.spin} RPM</span> spin.
          </p>
        </div>
      </div>

    </div>
  );
}
