import { useState, useEffect } from 'react';
import { Activity, Zap, Shield, Cpu } from 'lucide-react';

const HUDElements = () => {
  const [systemStats, setSystemStats] = useState({
    power: 98,
    shield: 85,
    processing: 92,
    network: 100
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStats(prev => ({
        power: Math.max(85, Math.min(100, prev.power + (Math.random() - 0.5) * 4)),
        shield: Math.max(80, Math.min(100, prev.shield + (Math.random() - 0.5) * 3)),
        processing: Math.max(88, Math.min(100, prev.processing + (Math.random() - 0.5) * 2)),
        network: Math.max(95, Math.min(100, prev.network + (Math.random() - 0.5) * 1))
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const StatCircle = ({ value, label, icon: Icon, color }) => (
    <div className="relative w-24 h-24">
      <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="rgba(59, 130, 246, 0.1)"
          strokeWidth="2"
          fill="none"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke={color}
          strokeWidth="2"
          fill="none"
          strokeDasharray={`${2 * Math.PI * 45}`}
          strokeDashoffset={`${2 * Math.PI * 45 * (1 - value / 100)}`}
          className="transition-all duration-1000 ease-out"
          style={{
            filter: `drop-shadow(0 0 8px ${color})`
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Icon className="w-4 h-4 text-blue-400 mb-1" />
        <span className="text-xs text-blue-400 font-semibold">{Math.round(value)}%</span>
      </div>
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
        <span className="text-xs text-gray-400 uppercase tracking-wide">{label}</span>
      </div>
    </div>
  );

  return (
    <>
      {/* Top Left HUD */}
      <div className="fixed top-6 left-6 z-30 glass rounded-lg p-4 border border-blue-500/20">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-sm font-semibold">SYSTEM ONLINE</span>
        </div>
        <div className="text-xs text-gray-400">
          <div>STATUS: OPERATIONAL</div>
          <div>VERSION: JARVIS 3.0.1</div>
          <div>UPTIME: 99.7%</div>
        </div>
      </div>

      {/* Top Right HUD */}
      <div className="fixed top-6 right-6 z-30 glass rounded-lg p-4 border border-blue-500/20">
        <div className="grid grid-cols-2 gap-4">
          <StatCircle 
            value={systemStats.power} 
            label="POWER" 
            icon={Zap} 
            color="#10B981" 
          />
          <StatCircle 
            value={systemStats.shield} 
            label="SHIELD" 
            icon={Shield} 
            color="#3B82F6" 
          />
          <StatCircle 
            value={systemStats.processing} 
            label="CPU" 
            icon={Cpu} 
            color="#8B5CF6" 
          />
          <StatCircle 
            value={systemStats.network} 
            label="NETWORK" 
            icon={Activity} 
            color="#06B6D4" 
          />
        </div>
      </div>

      {/* Bottom Left Data Stream */}
      <div className="fixed bottom-6 left-6 z-30 glass rounded-lg p-4 border border-blue-500/20 w-64">
        <div className="text-xs text-blue-400 mb-2 font-semibold">DATA STREAM</div>
        <div className="space-y-1 text-xs text-gray-400 font-mono">
          <div className="animate-matrix">SCANNING: ENVIRONMENTAL</div>
          <div className="animate-matrix" style={{animationDelay: '0.5s'}}>ANALYZING: THREAT LEVEL</div>
          <div className="animate-matrix" style={{animationDelay: '1s'}}>PROCESSING: USER INPUT</div>
          <div className="animate-matrix" style={{animationDelay: '1.5s'}}>OPTIMIZING: PERFORMANCE</div>
        </div>
      </div>

      {/* Floating Holographic Elements */}
      <div className="fixed top-1/3 left-1/4 z-10 pointer-events-none hidden lg:block">
        <div className="w-32 h-32 border border-blue-400/20 rounded-full animate-spin-slow">
          <div className="w-24 h-24 border border-cyan-400/30 rounded-full m-auto mt-4">
            <div className="w-16 h-16 border border-blue-500/40 rounded-full m-auto mt-4 animate-pulse"></div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-1/3 right-1/4 z-10 pointer-events-none hidden lg:block">
        <div className="w-20 h-20 border border-blue-400/15 rotate-45 animate-float">
          <div className="w-12 h-12 bg-blue-500/10 m-auto mt-4 animate-glow"></div>
        </div>
      </div>

      {/* Scanning Lines */}
      <div className="fixed inset-0 pointer-events-none z-5">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent animate-matrix"></div>
        <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent animate-matrix" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-2/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/25 to-transparent animate-matrix" style={{animationDelay: '4s'}}></div>
      </div>
    </>
  );
};

export default HUDElements;

