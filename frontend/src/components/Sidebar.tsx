import React from 'react';
import { useShotStore } from '../store/useShotStore';
import { 
  Play, 
  BarChart2, 
  Layers, 
  Award, 
  History, 
  User, 
  LogOut,
  Target,
  Settings
} from 'lucide-react';

interface SidebarProps {
  onOpenAuth: () => void;
}

export default function Sidebar({ onOpenAuth }: SidebarProps) {
  const activeTab = useShotStore((state) => state.activeTab);
  const setActiveTab = useShotStore((state) => state.setActiveTab);
  const user = useShotStore((state) => state.user);
  const logout = useShotStore((state) => state.logout);

  const menuItems = [
    { id: 'simulator', label: '3D Simulator', icon: Play },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'compare', label: 'Compare Shots', icon: Layers },
    { id: 'coach', label: 'AI Swing Coach', icon: Award },
    { id: 'history', label: 'Shot History', icon: History }
  ];

  return (
    <aside className="w-64 glass-panel border-r border-slate-800 flex flex-col justify-between h-screen shrink-0 text-slate-300">
      <div className="flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-golf-green flex items-center justify-center text-slate-900 font-extrabold shadow-[0_0_15px_rgba(16,185,129,0.5)]">
            GV
          </div>
          <div>
            <h1 className="font-extrabold text-white text-lg tracking-wider">GolfVision AI</h1>
            <span className="text-[10px] text-golf-green font-semibold uppercase tracking-widest">Pro Analytics</span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive 
                    ? 'bg-gradient-to-r from-golf-green/20 to-golf-green/5 text-white border-l-3 border-golf-green shadow-[inset_1px_0_0_rgba(255,255,255,0.05)]' 
                    : 'hover:bg-slate-800/40 hover:text-white border-l-3 border-transparent'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-golf-green' : 'text-slate-400'} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Section / Bottom */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/20">
        {user ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-golf-green text-lg uppercase shadow-inner">
                {user.username.substring(0, 2)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user.username}</p>
                <p className="text-[10px] text-slate-500 font-medium">HCP: {user.handicap || '18.0'}</p>
              </div>
            </div>
            
            <button 
              onClick={logout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        ) : (
          <button 
            onClick={onOpenAuth}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-golf-green to-emerald-600 hover:from-emerald-500 hover:to-emerald-600 text-slate-900 font-extrabold text-sm shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_4px_25px_rgba(16,185,129,0.45)] active:scale-98 transition-all"
          >
            <User size={16} />
            Access Account
          </button>
        )}
      </div>
    </aside>
  );
}
