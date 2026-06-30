import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Line, Html } from '@react-three/drei';
import { useShotStore, ShotResult } from '../store/useShotStore';
import * as THREE from 'three';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ArrowUp,
  Activity,
  Award,
  TrendingUp,
  Volume2
} from 'lucide-react';

// --- Sound Effects System (HTML5 Audio Synthesis) ---
const playSound = (type: 'swing' | 'impact' | 'sand' | 'applause') => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    if (type === 'swing') {
      // Wind-like woosh noise
      const bufferSize = ctx.sampleRate * 0.4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(100, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);
      filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.35);
      
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } 
    
    else if (type === 'impact') {
      // Sharp high-pitch click with low-end thud
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.05);
      
      gain.gain.setValueAtTime(0.8, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } 
    
    else if (type === 'sand') {
      // Soft rustle noise
      const bufferSize = ctx.sampleRate * 0.3;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(400, ctx.currentTime);
      
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    }
    
    else if (type === 'applause') {
      // Crowd clapping (repeated noise bursts)
      const duration = 2.0;
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1000, ctx.currentTime);
      
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    }
  } catch (e) {
    console.error("Audio Context failed to initialize", e);
  }
};

// --- Code-Animated 3D Humanoid Golfer ---
function Golfer({ 
  swingState, 
  power 
}: { 
  swingState: 'idle' | 'backswing' | 'followthrough'; 
  power: number;
}) {
  const golferGroup = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const clubRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!golferGroup.current) return;
    const t = state.clock.getElapsedTime();
    
    // Subtle breathing animation
    golferGroup.current.position.y = Math.sin(t * 2.5) * 0.003;

    if (swingState === 'backswing') {
      const rot = (power / 100) * 1.8; // Rotate arms/club back
      if (leftArmRef.current) leftArmRef.current.rotation.x = -0.5 - rot;
      if (rightArmRef.current) rightArmRef.current.rotation.x = -0.4 - rot * 0.9;
      if (clubRef.current) clubRef.current.rotation.x = -0.8 - rot * 1.2;
    } else if (swingState === 'idle') {
      // Normal stance
      if (leftArmRef.current) leftArmRef.current.rotation.x = -0.5;
      if (rightArmRef.current) rightArmRef.current.rotation.x = -0.4;
      if (clubRef.current) clubRef.current.rotation.x = -0.8;
    } else if (swingState === 'followthrough') {
      // Swing completion pose
      if (leftArmRef.current) leftArmRef.current.rotation.x = 1.1;
      if (rightArmRef.current) rightArmRef.current.rotation.x = 0.9;
      if (clubRef.current) clubRef.current.rotation.x = 1.4;
    }
  });

  return (
    <group ref={golferGroup} position={[-0.9, 0.0, 0.1]} rotation={[0, Math.PI / 2, 0]}>
      {/* Shoes */}
      <mesh position={[-0.2, 0.05, 0]}>
        <boxGeometry args={[0.15, 0.1, 0.25]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </mesh>
      <mesh position={[0.2, 0.05, 0]}>
        <boxGeometry args={[0.15, 0.1, 0.25]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </mesh>

      {/* Pants (Dark grey) */}
      <mesh position={[-0.2, 0.5, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.9, 8]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh position={[0.2, 0.5, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.9, 8]} />
        <meshStandardMaterial color="#334155" />
      </mesh>

      {/* Torso/Polo (Neon Green) */}
      <mesh position={[0, 1.25, 0]}>
        <cylinderGeometry args={[0.18, 0.14, 0.65, 10]} />
        <meshStandardMaterial color="#10b981" roughness={0.4} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.7, 0]}>
        <sphereGeometry args={[0.11, 16, 16]} />
        <meshStandardMaterial color="#fed7aa" roughness={0.7} />
      </mesh>

      {/* Arm Joints & Golf Club */}
      <group ref={leftArmRef} position={[-0.2, 1.5, 0]} rotation={[-0.5, 0, 0]}>
        <mesh position={[0, -0.22, 0]}>
          <cylinderGeometry args={[0.05, 0.04, 0.45, 8]} />
          <meshStandardMaterial color="#10b981" />
        </mesh>
        
        {/* Forearm */}
        <group position={[0, -0.45, 0]}>
          <mesh position={[0, -0.22, 0]}>
            <cylinderGeometry args={[0.04, 0.035, 0.45, 8]} />
            <meshStandardMaterial color="#fed7aa" />
          </mesh>

          {/* Hands holding club */}
          <group ref={clubRef} position={[0, -0.45, 0]} rotation={[-0.8, 0, 0]}>
            {/* Club shaft */}
            <mesh position={[0, -0.55, 0]}>
              <cylinderGeometry args={[0.015, 0.015, 1.1, 8]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Club head */}
            <mesh position={[0, -1.1, 0.07]}>
              <boxGeometry args={[0.07, 0.06, 0.1]} />
              <meshStandardMaterial color="#1e293b" metalness={0.8} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}

// --- 3D Interactive Game Course ---
function GameCourse({ pinPosition }: { pinPosition: { x: number; y: number; z: number } }) {
  const gridWidth = 120; // yards
  const gridLength = 480; // yards
  
  return (
    <group>
      {/* Base Rough Floor Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, gridLength / 2 - 20]}>
        <planeGeometry args={[gridWidth + 100, gridLength + 100]} />
        <meshStandardMaterial color="#14532d" roughness={0.95} /> {/* Dark forest rough */}
      </mesh>

      {/* Fairway path strip */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, gridLength / 2 - 20]}>
        <planeGeometry args={[40, gridLength - 20]} />
        <meshStandardMaterial color="#166534" roughness={0.9} /> {/* Green fairway */}
      </mesh>

      {/* Tee Box Plate */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[5, 4]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} />
      </mesh>

      {/* Bunkers (Sand pits) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[4, 0.005, 140]}>
        <ringGeometry args={[0, 8, 30]} />
        <meshStandardMaterial color="#fef08a" roughness={0.95} /> {/* Sand bunker 1 */}
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-5, 0.005, 230]}>
        <ringGeometry args={[0, 10, 30]} />
        <meshStandardMaterial color="#fef08a" roughness={0.95} /> {/* Sand bunker 2 */}
      </mesh>

      {/* Circular Putting Green */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[pinPosition.x, 0.005, pinPosition.z]}>
        <ringGeometry args={[0, 14, 32]} />
        <meshStandardMaterial color="#22c55e" roughness={0.8} /> {/* Smooth Green */}
      </mesh>

      {/* Flagstick (Pin) */}
      <group position={[pinPosition.x, 0.01, pinPosition.z]}>
        {/* Hole cup */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
          <ringGeometry args={[0, 0.3, 16]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        {/* Shaft */}
        <mesh position={[0, 2.5, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 5, 8]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        {/* Red Flag */}
        <mesh position={[0.4, 4.6, 0]}>
          <boxGeometry args={[0.8, 0.5, 0.01]} />
          <meshStandardMaterial color="#ef4444" roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
}

// --- Visual layout of the driving range grid (Simulator Mode) ---
function DrivingRangeGrid() {
  const yardages = [50, 100, 150, 200, 250, 300, 350, 400];
  const gridWidth = 100;
  const gridLength = 450;

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, gridLength / 2 - 20]}>
        <planeGeometry args={[gridWidth + 100, gridLength + 100]} />
        <meshStandardMaterial color="#0b0f19" roughness={0.9} />
      </mesh>
      <gridHelper 
        args={[gridLength, 45, '#334155', '#1e293b']} 
        position={[0, 0, gridLength / 2]} 
      />
      {yardages.map((yd) => (
        <group key={yd} position={[0, 0, yd]}>
          <Line 
            points={[new THREE.Vector3(-gridWidth / 2, 0.05, 0), new THREE.Vector3(gridWidth / 2, 0.05, 0)]} 
            color="#334155" 
            lineWidth={1.5} 
          />
          <Html position={[gridWidth / 2 + 6, 0.5, 0]} center>
            <div className="text-[10px] font-extrabold text-neon-cyan px-2 py-0.5 rounded border border-neon-cyan/30 bg-slate-950/80 shadow-[0_0_10px_rgba(14,165,233,0.3)]">
              {yd} YDS
            </div>
          </Html>
        </group>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[6, 4]} />
        <meshStandardMaterial color="#1e293b" roughness={0.5} />
      </mesh>
    </group>
  );
}

// --- R3F Scene Manager ---
function SceneManager({ 
  shot, 
  compareShots, 
  cameraMode, 
  playIndex, 
  setPlayIndex, 
  isPlaying, 
  speedMultiplier,
  ballPosition,
  gameMode
}: { 
  shot: ShotResult | null;
  compareShots: ShotResult[];
  cameraMode: string;
  playIndex: number;
  setPlayIndex: React.Dispatch<React.SetStateAction<number>>;
  isPlaying: boolean;
  speedMultiplier: number;
  ballPosition: { x: number; y: number; z: number };
  gameMode: string;
}) {
  const { camera } = useThree();
  const ballRef = useRef<THREE.Mesh>(null);

  // Flight path calculations
  useFrame((state, delta) => {
    if (!shot || !isPlaying) return;
    const steps = Math.round(delta * 1000 * speedMultiplier);
    
    setPlayIndex((prev) => {
      const next = prev + steps;
      if (next >= shot.trajectory.length) {
        return shot.trajectory.length - 1;
      }
      return next;
    });
  });

  // Track camera position based on view
  useEffect(() => {
    // Starting coordinates or flying coordinates
    let targetPos = new THREE.Vector3(ballPosition.x, ballPosition.y, ballPosition.z);
    
    if (shot && shot.trajectory[playIndex]) {
      const p = shot.trajectory[playIndex];
      targetPos.set(p.position.x * 1.09361, p.position.y * 1.09361, p.position.z * 1.09361);
    }

    if (ballRef.current) {
      ballRef.current.position.copy(targetPos);
    }

    if (cameraMode === 'follow') {
      camera.position.set(targetPos.x, targetPos.y + 3, targetPos.z - 12);
      camera.lookAt(targetPos);
    } else if (cameraMode === 'behind') {
      camera.position.set(ballPosition.x, ballPosition.y + 2.5, ballPosition.z - 10);
      camera.lookAt(new THREE.Vector3(ballPosition.x, ballPosition.y + 1, ballPosition.z + 100));
    } else if (cameraMode === 'top') {
      camera.position.set(targetPos.x, targetPos.y + 110, targetPos.z + 20);
      camera.lookAt(targetPos);
    } else if (cameraMode === 'tv') {
      camera.position.set(ballPosition.x + 40, ballPosition.y + 15, ballPosition.z + 80);
      camera.lookAt(targetPos);
    }
  }, [playIndex, cameraMode, shot, camera, ballPosition]);

  const activeLinePoints = shot 
    ? shot.trajectory
        .slice(0, playIndex + 1)
        .map(p => new THREE.Vector3(p.position.x * 1.09361, p.position.y * 1.09361, p.position.z * 1.09361))
    : [];

  return (
    <>
      {/* Active Trajectory */}
      {activeLinePoints.length > 1 && (
        <Line 
          points={activeLinePoints} 
          color="#10b981" 
          lineWidth={3.5} 
        />
      )}

      {/* Comparisons */}
      {gameMode === 'simulator' && compareShots.map((compShot, idx) => {
        const compPoints = compShot.trajectory.map(
          p => new THREE.Vector3(p.position.x * 1.09361, p.position.y * 1.09361, p.position.z * 1.09361)
        );
        return (
          <Line 
            key={idx} 
            points={compPoints} 
            color={compShot.color || '#ec4899'} 
            lineWidth={2} 
            opacity={0.6}
            transparent
          />
        );
      })}

      {/* Golf Ball */}
      <mesh ref={ballRef}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.1} roughness={0.1} />
      </mesh>
    </>
  );
}

// --- Main Viewport Component ---
export default function Simulator3D() {
  const currentShot = useShotStore((state) => state.currentShot);
  const compareShots = useShotStore((state) => state.compareShots);
  const gameMode = useShotStore((state) => state.gameMode);
  const gameState = useShotStore((state) => state.gameState);
  const ballPosition = useShotStore((state) => state.ballPosition);
  const pinPosition = useShotStore((state) => state.pinPosition);
  const executeGameSwing = useShotStore((state) => state.executeGameSwing);
  const advanceToNextShot = useShotStore((state) => state.advanceToNextShot);

  // Playback Control States
  const [isPlaying, setIsPlaying] = useState(true);
  const [playIndex, setPlayIndex] = useState(0);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [cameraMode, setCameraMode] = useState('behind');

  // Mouse Swing States
  const [swingState, setSwingState] = useState<'idle' | 'backswing' | 'followthrough'>('idle');
  const [swingPower, setSwingPower] = useState(0);
  const [swingTempo, setSwingTempo] = useState(0); // -1: hook, +1: slice
  const [dragStartY, setDragStartY] = useState<number | null>(null);
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [maxPowerReached, setMaxPowerReached] = useState(0);

  // Reset timeline on new shots
  useEffect(() => {
    if (currentShot) {
      setPlayIndex(0);
      setIsPlaying(true);
      
      // Synthesis Sound impact
      playSound('swing');
      setTimeout(() => playSound('impact'), 100);
      
      // Auto follow ball on shot trigger
      setCameraMode('follow');
      setSwingState('followthrough');
    }
  }, [currentShot]);

  // Hook into animation end to advance turn
  useEffect(() => {
    if (gameMode === 'game' && currentShot && playIndex === currentShot.trajectory.length - 1) {
      // Play sound
      const finalPoint = currentShot.trajectory[playIndex];
      const distanceToPin = Math.sqrt(
        Math.pow(finalPoint.position.x * 1.09361 - pinPosition.x, 2) +
        Math.pow(finalPoint.position.z * 1.09361 - pinPosition.z, 2)
      );
      
      if (distanceToPin <= 2.2) {
        playSound('applause');
      } else if (currentShot.terrain === 'Sand') {
        playSound('sand');
      }
      
      // Auto delay and advance next turn
      const timer = setTimeout(() => {
        const p = currentShot.trajectory[playIndex].position;
        advanceToNextShot({
          x: p.x * 1.09361,
          y: p.y * 1.09361,
          z: p.z * 1.09361
        });
        setSwingState('idle');
        setSwingPower(0);
        setSwingTempo(0);
        setCameraMode('behind');
      }, 2500);
      
      return () => clearTimeout(timer);
    }
  }, [playIndex, currentShot, gameMode]);

  const handleRestart = () => {
    setPlayIndex(0);
    setIsPlaying(true);
  };

  // --- Mouse Swing Handlers (AAA Game mechanics) ---
  const handleSwingStart = (e: React.MouseEvent) => {
    if (gameMode !== 'game' || gameState !== 'playing') return;
    setDragStartY(e.clientY);
    setDragStartX(e.clientX);
    setSwingState('backswing');
    setMaxPowerReached(0);
  };

  const handleSwingMove = (e: React.MouseEvent) => {
    if (dragStartY === null || dragStartX === null) return;
    
    // Y-drag down charges power (approx 150px drag is full charge)
    const dragY = e.clientY - dragStartY;
    if (dragY > 0) {
      const power = Math.min(100, Math.round((dragY / 160) * 100));
      setSwingPower(power);
      if (power > maxPowerReached) {
        setMaxPowerReached(power);
      }
    }
    
    // X-drag calculates side tempo (slice vs hook)
    const dragX = e.clientX - dragStartX;
    const tempo = Math.min(1.0, Math.max(-1.0, dragX / 40.0));
    setSwingTempo(tempo);
  };

  const handleSwingEnd = (e: React.MouseEvent) => {
    if (dragStartY === null || dragStartX === null) return;
    
    // Verify forward swing swipe speed
    const endY = e.clientY;
    const releaseTime = Date.now();
    
    // Speed: did they swipe back up past the tee start?
    const swipeUp = dragStartY - endY;
    
    if (swipeUp > 15 && maxPowerReached > 10) {
      // Trigger swing!
      executeGameSwing(maxPowerReached, swingTempo);
    } else {
      // Cancel swing (too slow or short)
      setSwingState('idle');
      setSwingPower(0);
      setSwingTempo(0);
    }
    
    setDragStartY(null);
    setDragStartX(null);
  };

  const cameraOptions = [
    { id: 'behind', label: 'Tee View' },
    { id: 'follow', label: 'Ball Track' },
    { id: 'top', label: 'Overhead' },
    { id: 'tv', label: 'Broadcast' }
  ];

  return (
    <div 
      className="flex-1 min-h-[400px] h-[55vh] rounded-2xl overflow-hidden glass-card border border-slate-800/80 relative"
      onMouseDown={handleSwingStart}
      onMouseMove={handleSwingMove}
      onMouseUp={handleSwingEnd}
      onMouseLeave={handleSwingEnd}
    >
      
      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 10, -20], fov: 48 }} shadows>
        <color attach="background" args={['#080c18']} />
        
        {/* Lights */}
        <ambientLight intensity={0.55} />
        <directionalLight 
          position={[30, 90, 50]} 
          intensity={1.25} 
          castShadow 
          shadow-mapSize={[2048, 2048]}
        />
        <hemisphereLight groundColor="#064e3b" intensity={0.3} />

        {/* Dynamic Terrain Selection */}
        {gameMode === 'game' ? (
          <>
            <GameCourse pinPosition={pinPosition} />
            <Golfer swingState={swingState} power={swingPower} />
          </>
        ) : (
          <DrivingRangeGrid />
        )}
        
        <SceneManager 
          shot={currentShot} 
          compareShots={compareShots}
          cameraMode={cameraMode}
          playIndex={playIndex}
          setPlayIndex={setPlayIndex}
          isPlaying={isPlaying}
          speedMultiplier={speedMultiplier}
          ballPosition={ballPosition}
          gameMode={gameMode}
        />
        
        {cameraMode === 'orbit' && <OrbitControls maxPolarAngle={Math.PI / 2 - 0.05} />}
      </Canvas>

      {/* Floating HUD overlays */}
      
      {/* Camera Mode Toggles */}
      <div className="absolute top-4 left-4 flex gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-slate-800 backdrop-blur-md z-10 pointer-events-auto">
        {cameraOptions.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setCameraMode(opt.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              cameraMode === opt.id 
                ? 'bg-golf-green text-slate-900 shadow-[0_0_10px_rgba(16,185,129,0.3)]' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Replay Controls (Only visible in Shot Result screen) */}
      {currentShot && (
        <div className="absolute bottom-4 left-4 right-4 bg-slate-950/85 border border-slate-850 backdrop-blur-md py-3 px-4.5 rounded-xl flex items-center justify-between z-10 pointer-events-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-white hover:text-golf-green cursor-pointer transition-all"
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <button
              onClick={handleRestart}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer transition-all"
            >
              <RotateCcw size={14} />
            </button>
            
            <div className="flex items-center gap-1.5 ml-2 border-l border-slate-850 pl-3.5">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Replay Speed</span>
              {[0.5, 1, 2, 5].map((sp) => (
                <button
                  key={sp}
                  onClick={() => setSpeedMultiplier(sp)}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded cursor-pointer ${
                    speedMultiplier === sp ? 'bg-golf-green/20 text-golf-green' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {sp}x
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 mx-6 flex items-center gap-3">
            <span className="text-[10px] text-slate-500 font-bold">0s</span>
            <input
              type="range"
              min="0"
              max={currentShot.trajectory.length - 1}
              value={playIndex}
              onChange={(e) => {
                setPlayIndex(parseInt(e.target.value));
                setIsPlaying(false);
              }}
              className="flex-1 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-golf-green"
            />
            <span className="text-[10px] text-slate-300 font-bold">
              {(currentShot.trajectory[playIndex]?.time || currentShot.hangTime).toFixed(1)}s
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest bg-slate-900/60 border border-slate-800 py-1 px-3.5 rounded-full">
              {playIndex === currentShot.trajectory.length - 1 ? "LANDED" : "IN FLIGHT"}
            </span>
          </div>
        </div>
      )}

      {/* Curved Swing Power Meter (Bottom Right overlay, pointer-events-none) */}
      {gameMode === 'game' && gameState === 'playing' && (
        <div className="absolute bottom-4 right-4 flex flex-col items-center gap-2 p-4.5 rounded-2xl bg-slate-950/85 border border-slate-800 backdrop-blur-md pointer-events-none z-10 w-44">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Swing Power</span>
          
          {/* Curved Meter container */}
          <div className="w-32 h-16 relative overflow-hidden flex items-end justify-center">
            {/* Curved Gauge border */}
            <div className="absolute inset-0 w-32 h-32 rounded-full border-8 border-slate-850/80"></div>
            {/* Accent sectors (Green=Perfect, Red=Over) */}
            <div className="absolute inset-0 w-32 h-32 rounded-full border-8 border-transparent border-t-golf-green border-r-golf-green/50 transform rotate-[-45deg]"></div>
            
            {/* Real-time charging bar overlay */}
            <div 
              className="absolute inset-0 w-32 h-32 rounded-full border-8 border-transparent border-t-neon-cyan border-r-neon-cyan transition-transform duration-75"
              style={{ transform: `rotate(${-135 + (swingPower / 100) * 180}deg)` }}
            ></div>

            {/* Numeric readout */}
            <div className="text-center z-10">
              <span className="text-lg font-black text-white">{swingPower}%</span>
            </div>
          </div>

          {/* Tempo/Timing slider */}
          <div className="w-full space-y-1">
            <div className="flex justify-between text-[8px] font-bold text-slate-500 uppercase tracking-widest">
              <span>HOOK</span>
              <span className={Math.abs(swingTempo) < 0.15 ? "text-golf-green" : "text-slate-500"}>PERFECT</span>
              <span>SLICE</span>
            </div>
            <div className="h-1 w-full bg-slate-850 rounded-full relative overflow-hidden">
              <div 
                className="absolute top-0 bottom-0 w-1.5 bg-neon-cyan rounded-full transition-all duration-75"
                style={{ left: `calc(${50 + swingTempo * 50}% - 3px)` }}
              ></div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
