import { Monitor, Tablet, Smartphone } from 'lucide-react';
import { useDeviceToggle } from '../hooks/useDeviceToggle';

const DeviceToggle = () => {
  const { device, setDeviceType, isDevelopment } = useDeviceToggle();

  if (!isDevelopment) return null;

  const buttons = [
    { type: 'desktop', icon: Monitor, label: 'Desktop' },
    { type: 'tablet', icon: Tablet, label: 'Tablet' },
    { type: 'mobile', icon: Smartphone, label: 'Mobile' },
  ];

  return (
    <div className="fixed top-4 right-4 z-50 flex gap-2 bg-gray-900/80 p-2 rounded-xl shadow-lg border border-blue-400/30">
      {buttons.map(({ type, icon: Icon, label }) => (
        <button
          key={type}
          onClick={() => setDeviceType(type)}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg transition-all duration-200
            ${device === type ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white scale-110 shadow-md' : 'bg-gray-800 text-gray-300 hover:bg-blue-500/20'}
            border-2 border-blue-400/30 hover:border-blue-400/50
          `}
          aria-label={label}
        >
          <Icon size={22} />
          <span className="text-xs mt-1 font-medium">{label}</span>
        </button>
      ))}
    </div>
  );
};

export default DeviceToggle;
