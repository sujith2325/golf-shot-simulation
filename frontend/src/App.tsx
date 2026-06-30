import React, { useState, useEffect } from 'react';
import { useShotStore } from './store/useShotStore';
import Sidebar from './components/Sidebar';
import ControlPanel from './components/ControlPanel';
import Simulator3D from './components/Simulator3D';
import Telemetry from './components/Telemetry';
import Analytics from './components/Analytics';
import CompareShots from './components/CompareShots';
import AICoach from './components/AICoach';
import ShotHistory from './components/ShotHistory';
import GameMenu from './components/GameMenu';
import GameHUD from './components/GameHUD';
import { 
  X, 
  User, 
  Mail, 
  Lock, 
  Sparkles,
  Trophy,
  RefreshCw,
  LogOut
} from 'lucide-react';

export default function App() {
  const activeTab = useShotStore((state) => state.activeTab);
  const runSimulation = useShotStore((state) => state.runSimulation);
  const loadHistory = useShotStore((state) => state.loadHistory);
  const token = useShotStore((state) => state.token);
  const authError = useShotStore((state) => state.authError);
  const loginUser = useShotStore((state) => state.loginUser);
  const registerUser = useShotStore((state) => state.registerUser);
  const setField = useShotStore((state) => state.setField);
  
  // Game states
  const gameMode = useShotStore((state) => state.gameMode);
  const gameState = useShotStore((state) => state.gameState);
  const shotCount = useShotStore((state) => state.shotCount);
  const startNewGame = useShotStore((state) => state.startNewGame);
  const returnToMenu = useShotStore((state) => state.returnToMenu);

  // Auth Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  
  // Auth Inputs
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Initial simulation load
  useEffect(() => {
    runSimulation();
    if (token) {
      loadHistory();
    }
  }, [token]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    
    if (authTab === 'login') {
      const ok = await loginUser(username, password);
      if (ok) {
        setShowAuthModal(false);
        setUsername('');
        setPassword('');
      }
    } else {
      const ok = await registerUser(username, email, password);
      if (ok) {
        setSuccessMsg('Registration successful! Please sign in.');
        setAuthTab('login');
        setEmail('');
        setPassword('');
      }
    }
  };

  const handleOpenAuth = () => {
    setField('authError', null);
    setSuccessMsg('');
    setShowAuthModal(true);
  };

  return (
    <div className="flex h-screen bg-[#070a13] text-slate-100 overflow-hidden font-sans bg-grid-animation select-none">
      
      {/* Sidebar Navigation - only active in Simulator mode or Game Menu */}
      {(gameMode === 'simulator' || gameState === 'menu') && (
        <Sidebar onOpenAuth={handleOpenAuth} />
      )}

      {/* Main Container */}
      <main className="flex-1 flex flex-col h-screen min-w-0 relative">
        
        {/* Top Header - only active in Simulator mode or Game Menu */}
        {(gameMode === 'simulator' || gameState === 'menu') && (
          <header className="h-16 border-b border-slate-900 px-8 flex items-center justify-between shrink-0 bg-slate-950/20 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Workspace</span>
              <span className="text-xs text-slate-400">/</span>
              <span className="text-xs text-white font-semibold">Tee Box 1</span>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
              <button
                onClick={() => setField('gameMode', gameMode === 'game' ? 'simulator' : 'game')}
                className="px-3.5 py-1.5 rounded-xl border border-slate-800 hover:border-golf-green bg-slate-900 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                Switch to {gameMode === 'game' ? 'Analytics Portal' : 'Play Mode 🏌️'}
              </button>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-slate-800/80 bg-slate-900/40">
                <span className="w-1.5 h-1.5 rounded-full bg-golf-green shadow-[0_0_8px_#10b981]"></span>
                API Status: Online
              </div>
            </div>
          </header>
        )}

        {/* Workspace Body */}
        {gameMode === 'game' ? (
          // --- PLAY MODE GAMEPLAY INTERFACE ---
          <div className="flex-1 w-full h-full relative flex flex-col">
            
            {/* Main Menu Overlay */}
            {gameState === 'menu' && <GameMenu />}

            {/* Gameplay overlay HUD */}
            {gameState !== 'menu' && <GameHUD />}

            {/* Viewport Canvas (Render full height/width during game play) */}
            {gameState !== 'menu' && (
              <div className="w-full h-full">
                <Simulator3D />
              </div>
            )}

            {/* Celebration Holed-Out Dialog */}
            {gameState === 'hole_out' && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50">
                <div className="w-full max-w-sm glass-panel border border-slate-800 rounded-3xl p-6.5 text-center shadow-2xl relative overflow-hidden">
                  {/* Glowing light effect */}
                  <div className="absolute -top-12 -left-12 w-24 h-24 bg-golf-green/20 rounded-full blur-2xl"></div>
                  <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-neon-cyan/20 rounded-full blur-2xl"></div>

                  <div className="p-3.5 rounded-2xl bg-golf-green/10 border border-golf-green/20 text-golf-green w-fit mx-auto mb-4 animate-bounce">
                    <Trophy size={32} />
                  </div>

                  <h2 className="text-2xl font-black text-white tracking-wide">HOLE OUT!</h2>
                  <p className="text-xs font-semibold text-golf-green uppercase tracking-widest mt-1">Hole Completed</p>
                  
                  <div className="my-6 p-4 rounded-2xl bg-slate-900 border border-slate-850 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-semibold">Total Strokes:</span>
                      <span className="text-white font-extrabold">{shotCount} shots</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-semibold">Score:</span>
                      <span className="text-white font-extrabold">Par 3 ({shotCount === 3 ? 'Even' : shotCount < 3 ? `-${3 - shotCount}` : `+${shotCount - 3}`})</span>
                    </div>
                    <div className="flex justify-between text-xs pt-1.5 border-t border-slate-800">
                      <span className="text-golf-green font-bold flex items-center gap-1"><Sparkles size={12} /> XP Reward:</span>
                      <span className="text-white font-extrabold">+300 XP</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-neon-cyan font-bold flex items-center gap-1">🪙 Coins Awarded:</span>
                      <span className="text-white font-extrabold">+100</span>
                    </div>
                  </div>

                  <div className="flex gap-2.5">
                    <button
                      onClick={() => startNewGame('quick_play')}
                      className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-golf-green to-emerald-600 hover:from-emerald-500 hover:to-emerald-600 text-slate-900 font-black text-xs tracking-wider cursor-pointer shadow-[0_4px_15px_rgba(16,185,129,0.2)] active:scale-97 transition-all"
                    >
                      PLAY NEXT HOLE
                    </button>
                    <button
                      onClick={returnToMenu}
                      className="py-3 px-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs font-bold cursor-pointer transition-all"
                    >
                      MAIN MENU
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        ) : (
          // --- ANALYTICS SIMULATOR INTERFACE ---
          <div className="flex-1 flex min-h-0">
            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {activeTab === 'simulator' && (
                <>
                  <Simulator3D />
                  <Telemetry />
                </>
              )}

              {activeTab === 'analytics' && <Analytics />}
              {activeTab === 'compare' && <CompareShots />}
              {activeTab === 'coach' && <AICoach />}
              {activeTab === 'history' && <ShotHistory />}
            </div>

            {/* Configurator Controls Sidebar */}
            <ControlPanel />
          </div>
        )}

      </main>

      {/* Glass Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in">
          <div className="w-full max-w-sm glass-panel rounded-2xl border border-slate-800 p-6 relative shadow-2xl">
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white cursor-pointer transition-all"
            >
              <X size={16} />
            </button>

            <div className="text-center mb-6">
              <h2 className="text-white font-extrabold text-lg tracking-wide">GolfVision AI</h2>
              <p className="text-[10px] text-golf-green font-bold uppercase tracking-wider mt-0.5">Secure Dashboard Access</p>
            </div>

            <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-950 border border-slate-900 mb-6">
              <button
                onClick={() => { setAuthTab('login'); setField('authError', null); }}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  authTab === 'login' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setAuthTab('register'); setField('authError', null); }}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  authTab === 'register' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authError && (
                <div className="p-3 text-xs rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-semibold leading-relaxed">
                  {authError}
                </div>
              )}
              {successMsg && (
                <div className="p-3 text-xs rounded-xl bg-golf-green/10 border border-golf-green/20 text-golf-green font-semibold leading-relaxed">
                  {successMsg}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Username</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full glass-input rounded-xl py-2 pl-9.5 pr-4 text-xs"
                    placeholder="Enter username"
                  />
                </div>
              </div>

              {authTab === 'register' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full glass-input rounded-xl py-2 pl-9.5 pr-4 text-xs"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full glass-input rounded-xl py-2 pl-9.5 pr-4 text-xs"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-2.5 px-4 rounded-xl bg-gradient-to-r from-golf-green to-emerald-600 hover:from-emerald-500 hover:to-emerald-600 text-slate-900 font-extrabold text-xs tracking-wider shadow-[0_4px_15px_rgba(16,185,129,0.25)] hover:shadow-[0_4px_20px_rgba(16,185,129,0.4)] transition-all cursor-pointer"
              >
                {authTab === 'login' ? 'SIGN IN TO PORTAL' : 'CREATE NEW ACCOUNT'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
