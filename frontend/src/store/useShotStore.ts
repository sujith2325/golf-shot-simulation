import { create } from 'zustand';

export interface TrajectoryPoint {
  time: number;
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  angularVelocity: { x: number; y: number; z: number };
  speed: number;
  spin: number;
}

export interface AICoachFeedback {
  score: number;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
  expectedGain: number;
}

export interface ClubRecommendation {
  club: string;
  loft: number;
  speed: number;
  spin: number;
}

export interface ShotResult {
  id?: number;
  clubUsed: string;
  clubSpeed: number;
  launchAngle: number;
  pathAngle: number;
  spinRate: number;
  spinTilt: number;
  windSpeed: number;
  windDir: number;
  temp: number;
  humidity: number;
  altitude: number;
  terrain: string;
  carryDistance: number;
  totalDistance: number;
  maxHeight: number;
  hangTime: number;
  trajectory: TrajectoryPoint[];
  aiCoach?: AICoachFeedback;
  clubRecommendation?: ClubRecommendation;
  createdAt?: string;
  color?: string; // used for overlay comparison
  label?: string; // e.g. "Shot 1"
}

interface User {
  id: number;
  username: string;
  email: string;
  handicap: number;
  avatar: string | null;
}

interface ShotState {
  // Navigation & Core Modes
  activeTab: string;
  setActiveTab: (tab: string) => void;
  gameMode: 'simulator' | 'game';
  setGameMode: (mode: 'simulator' | 'game') => void;
  
  // Game States
  gameState: 'menu' | 'playing' | 'shot_result' | 'hole_out';
  ballPosition: { x: number; y: number; z: number };
  pinPosition: { x: number; y: number; z: number };
  shotCount: number;
  score: number;
  xp: number;
  coins: number;
  swingPower: number;
  swingTempo: number;
  
  // Simulator Inputs
  clubUsed: string;
  clubSpeed: number;
  launchAngle: number;
  pathAngle: number;
  spinRate: number;
  spinTilt: number;
  windSpeed: number;
  windDir: number;
  temp: number;
  humidity: number;
  altitude: number;
  terrain: string;
  smashFactor: number;
  mode: 'pro' | 'legacy';
  targetDistance: number;
  
  // App States
  simulating: boolean;
  currentShot: ShotResult | null;
  compareShots: ShotResult[];
  shotHistory: ShotResult[];
  
  // Auth
  token: string | null;
  user: User | null;
  authError: string | null;
  
  // Setters
  setField: (field: string, value: any) => void;
  setClub: (club: string) => void;
  
  // Actions
  runSimulation: () => Promise<void>;
  saveCurrentShot: () => Promise<void>;
  loadHistory: () => Promise<void>;
  deleteShot: (id: number) => Promise<void>;
  addToComparison: (shot: ShotResult) => void;
  removeFromComparison: (index: number) => void;
  clearComparison: () => void;
  
  // Play Mode Actions
  startNewGame: (type: 'practice' | 'quick_play') => void;
  executeGameSwing: (power: number, tempo: number) => Promise<void>;
  advanceToNextShot: (finalPos: { x: number; y: number; z: number }) => void;
  resetHole: () => void;
  returnToMenu: () => void;
  
  // Auth Actions
  loginUser: (username: string, password: string) => Promise<boolean>;
  registerUser: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const BACKEND_URL = 'http://127.0.0.1:5000';

const CLUB_PRESETS: Record<string, { loft: number; speed: number; spin: number; smash: number }> = {
  'Driver': { loft: 10.5, speed: 100.0, spin: 2600, smash: 1.49 },
  '3-Wood': { loft: 15.0, speed: 95.0, spin: 3200, smash: 1.45 },
  '5-Wood': { loft: 18.0, speed: 90.0, spin: 3600, smash: 1.42 },
  '4-Iron': { loft: 22.0, speed: 85.0, spin: 4500, smash: 1.38 },
  '7-Iron': { loft: 34.0, speed: 80.0, spin: 6500, smash: 1.33 },
  '9-Iron': { loft: 42.0, speed: 75.0, spin: 8000, smash: 1.28 },
  'Wedge': { loft: 52.0, speed: 70.0, spin: 9500, smash: 1.20 }
};

export const useShotStore = create<ShotState>((set, get) => ({
  // Core Settings Defaults
  activeTab: 'simulator',
  setActiveTab: (tab) => set({ activeTab: tab }),
  gameMode: 'game', // Default to game mode (Main Menu)
  setGameMode: (mode) => set({ gameMode: mode }),
  
  // Play Mode Defaults
  gameState: 'menu',
  ballPosition: { x: 0, y: 0, z: 0 },
  pinPosition: { x: 0, y: 0, z: 285 },
  shotCount: 0,
  score: 0,
  xp: 180,
  coins: 650,
  swingPower: 0,
  swingTempo: 0,
  
  // Simulator Input Defaults
  clubUsed: 'Driver',
  clubSpeed: 100,
  launchAngle: 10.5,
  pathAngle: 0,
  spinRate: 2600,
  spinTilt: 0,
  windSpeed: 8,
  windDir: 45,
  temp: 72,
  humidity: 45,
  altitude: 50,
  terrain: 'Fairway',
  smashFactor: 1.49,
  mode: 'pro',
  targetDistance: 250,
  
  // App States
  simulating: false,
  currentShot: null,
  compareShots: [],
  shotHistory: [],
  
  // Auth Defaults
  token: localStorage.getItem('gv_token'),
  user: localStorage.getItem('gv_user') ? JSON.parse(localStorage.getItem('gv_user')!) : null,
  authError: null,
  
  setField: (field, value) => set({ [field]: value }),
  
  setClub: (club) => {
    const preset = CLUB_PRESETS[club];
    if (preset) {
      set({
        clubUsed: club,
        launchAngle: preset.loft,
        clubSpeed: preset.speed,
        spinRate: preset.spin,
        smashFactor: preset.smash
      });
    } else {
      set({ clubUsed: club });
    }
  },
  
  runSimulation: async () => {
    set({ simulating: true });
    try {
      const state = get();
      const response = await fetch(`${BACKEND_URL}/api/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: state.mode,
          clubSpeed: state.clubSpeed,
          launchAngle: state.launchAngle,
          pathAngle: state.pathAngle,
          spinRate: state.spinRate,
          spinTilt: state.spinTilt,
          windSpeed: state.windSpeed,
          windDir: state.windDir,
          temp: state.temp,
          humidity: state.humidity,
          altitude: state.altitude,
          terrain: state.terrain,
          smashFactor: state.smashFactor,
          clubUsed: state.clubUsed,
          targetDistance: state.targetDistance,
          dt: 0.001
        })
      });
      
      if (!response.ok) throw new Error('Simulation failed');
      const data = await response.json();
      
      const newShot: ShotResult = {
        clubUsed: state.clubUsed,
        clubSpeed: state.clubSpeed,
        launchAngle: state.launchAngle,
        pathAngle: state.pathAngle,
        spinRate: state.spinRate,
        spinTilt: state.spinTilt,
        windSpeed: state.windSpeed,
        windDir: state.windDir,
        temp: state.temp,
        humidity: state.humidity,
        altitude: state.altitude,
        terrain: state.terrain,
        carryDistance: data.carryDistance,
        totalDistance: data.totalDistance,
        maxHeight: data.maxHeight,
        hangTime: data.hangTime,
        trajectory: data.trajectory,
        aiCoach: data.aiCoach,
        clubRecommendation: data.clubRecommendation,
        color: '#10b981',
        label: `Active: ${state.clubUsed} (${data.totalDistance.toFixed(0)} yds)`
      };
      
      set({ currentShot: newShot });
    } catch (error) {
      console.error(error);
    } finally {
      set({ simulating: false });
    }
  },
  
  saveCurrentShot: async () => {
    const state = get();
    if (!state.currentShot || !state.token) return;
    try {
      const response = await fetch(`${BACKEND_URL}/api/shots`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`
        },
        body: JSON.stringify(state.currentShot)
      });
      
      if (response.ok) {
        state.loadHistory();
      }
    } catch (error) {
      console.error(error);
    }
  },
  
  loadHistory: async () => {
    const state = get();
    if (!state.token) return;
    try {
      const response = await fetch(`${BACKEND_URL}/api/shots`, {
        headers: {
          'Authorization': `Bearer ${state.token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        set({ shotHistory: data.shots });
      }
    } catch (error) {
      console.error(error);
    }
  },
  
  deleteShot: async (id) => {
    const state = get();
    if (!state.token) return;
    try {
      const response = await fetch(`${BACKEND_URL}/api/shots/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${state.token}`
        }
      });
      if (response.ok) {
        set({
          shotHistory: state.shotHistory.filter(s => s.id !== id)
        });
      }
    } catch (error) {
      console.error(error);
    }
  },
  
  addToComparison: (shot) => {
    const compareColors = ['#0ea5e9', '#ec4899', '#f59e0b', '#a855f7', '#3b82f6'];
    const currentList = get().compareShots;
    const color = compareColors[currentList.length % compareColors.length];
    const labeledShot = {
      ...shot,
      color,
      label: `${shot.clubUsed} - ${shot.totalDistance.toFixed(0)} yds`
    };
    
    set({ compareShots: [...currentList, labeledShot] });
  },
  
  removeFromComparison: (index) => {
    const list = get().compareShots.filter((_, i) => i !== index);
    set({ compareShots: list });
  },
  
  clearComparison: () => set({ compareShots: [] }),
  
  // Play Mode Action Handlers
  startNewGame: (type) => {
    const randomPinZ = 240 + Math.random() * 60; // pin distance: 240-300 yds
    const randomPinX = Math.random() * 16 - 8; // lateral deviation
    set({
      gameMode: 'game',
      gameState: 'playing',
      ballPosition: { x: 0, y: 0, z: 0 },
      pinPosition: { x: randomPinX, y: 0, z: randomPinZ },
      shotCount: 0,
      terrain: 'Fairway',
      currentShot: null,
      clubUsed: 'Driver',
      launchAngle: 10.5,
      clubSpeed: 100,
      spinRate: 2600,
      smashFactor: 1.49
    });
  },
  
  executeGameSwing: async (power, tempo) => {
    set({ simulating: true, swingPower: power, swingTempo: tempo });
    try {
      const state = get();
      const preset = CLUB_PRESETS[state.clubUsed] || CLUB_PRESETS['Driver'];
      
      // Calculate speeds based on swing quality (0.3 to 1.15 multiplier)
      const mappedPowerMult = 0.3 + (power / 100) * 0.85;
      const speed = preset.speed * mappedPowerMult;
      const spin = preset.spin * (0.5 + (power / 100) * 0.7);
      
      // Calculate spin tilt based on tempo (-1 represents pull hook, +1 represents push slice)
      const tilt = tempo * 38.0;
      
      // Pull/push horizontal flight path deviation
      const horizAngle = state.pathAngle + (tempo * 6.0);
      
      const response = await fetch(`${BACKEND_URL}/api/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'pro',
          clubSpeed: speed,
          launchAngle: state.launchAngle,
          pathAngle: horizAngle,
          spinRate: spin,
          spinTilt: tilt,
          windSpeed: state.windSpeed,
          windDir: state.windDir,
          temp: state.temp,
          humidity: state.humidity,
          altitude: state.altitude,
          terrain: state.terrain,
          smashFactor: preset.smash,
          clubUsed: state.clubUsed,
          targetDistance: state.targetDistance,
          dt: 0.001
        })
      });
      
      if (!response.ok) throw new Error('Simulation failed');
      const data = await response.json();
      
      // Offset trajectory path by the starting position of the ball!
      const offsetTrajectory = data.trajectory.map((p: any) => ({
        ...p,
        position: {
          x: p.position.x + state.ballPosition.x,
          y: p.position.y + state.ballPosition.y,
          z: p.position.z + state.ballPosition.z
        }
      }));
      
      const newShot: ShotResult = {
        clubUsed: state.clubUsed,
        clubSpeed: speed,
        launchAngle: state.launchAngle,
        pathAngle: horizAngle,
        spinRate: spin,
        spinTilt: tilt,
        windSpeed: state.windSpeed,
        windDir: state.windDir,
        temp: state.temp,
        humidity: state.humidity,
        altitude: state.altitude,
        terrain: state.terrain,
        carryDistance: data.carryDistance,
        totalDistance: data.totalDistance,
        maxHeight: data.maxHeight,
        hangTime: data.hangTime,
        trajectory: offsetTrajectory,
        aiCoach: data.aiCoach,
        clubRecommendation: data.clubRecommendation,
        color: '#10b981',
        label: `Stroke ${state.shotCount + 1}: ${state.clubUsed}`
      };
      
      set({
        currentShot: newShot,
        shotCount: state.shotCount + 1,
        gameState: 'shot_result'
      });
    } catch (err) {
      console.error(err);
    } finally {
      set({ simulating: false });
    }
  },
  
  advanceToNextShot: (finalPos) => {
    const state = get();
    const pin = state.pinPosition;
    
    // Calculate remaining distance in yards
    const dx = finalPos.x - pin.x;
    const dz = finalPos.z - pin.z;
    const distToPin = Math.sqrt(dx * dx + dz * dz);
    
    if (distToPin <= 2.2) { // Within putting range (holed out!)
      const finalScore = state.shotCount;
      const coinsEarned = Math.max(20, 150 - (finalScore - 3) * 30); // par-based reward
      const xpEarned = 300;
      
      set({
        gameState: 'hole_out',
        coins: state.coins + coinsEarned,
        xp: state.xp + xpEarned,
        score: state.score + (finalScore - 3) // score relative to par 3
      });
    } else {
      // Determine new terrain condition
      let nextTerrain = 'Fairway';
      const absX = Math.abs(finalPos.x);
      
      if (absX > 22.0) {
        nextTerrain = 'Rough';
      } else if (finalPos.z > 130 && finalPos.z < 155 && absX < 14) {
        nextTerrain = 'Sand';
      } else if (finalPos.z > 220 && finalPos.z < 245 && absX < 12) {
        nextTerrain = 'Sand';
      }
      
      // Auto recommend club based on remaining yards
      let suggestedClub = 'Driver';
      if (distToPin < 30) suggestedClub = 'Wedge';
      else if (distToPin < 80) suggestedClub = 'Wedge';
      else if (distToPin < 130) suggestedClub = '9-Iron';
      else if (distToPin < 160) suggestedClub = '7-Iron';
      else if (distToPin < 195) suggestedClub = '4-Iron';
      else if (distToPin < 235) suggestedClub = '5-Wood';
      
      set({
        ballPosition: finalPos,
        terrain: nextTerrain,
        gameState: 'playing',
        currentShot: null
      });
      
      get().setClub(suggestedClub);
    }
  },
  
  resetHole: () => {
    const state = get();
    get().startNewGame('practice');
  },
  
  returnToMenu: () => {
    set({ gameState: 'menu', currentShot: null });
  },
  
  // Auth API Calls
  loginUser: async (username, password) => {
    set({ authError: null });
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      if (!response.ok) {
        set({ authError: data.message || 'Login failed' });
        return false;
      }
      
      localStorage.setItem('gv_token', data.token);
      localStorage.setItem('gv_user', JSON.stringify(data.user));
      set({ token: data.token, user: data.user });
      
      get().loadHistory();
      return true;
    } catch (err) {
      set({ authError: 'Network error occurred' });
      return false;
    }
  },
  
  registerUser: async (username, email, password) => {
    set({ authError: null });
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      
      const data = await response.json();
      if (!response.ok) {
        set({ authError: data.message || 'Registration failed' });
        return false;
      }
      
      return true;
    } catch (err) {
      set({ authError: 'Network error occurred' });
      return false;
    }
  },
  
  logout: () => {
    localStorage.removeItem('gv_token');
    localStorage.removeItem('gv_user');
    set({ token: null, user: null, shotHistory: [] });
  }
}));
