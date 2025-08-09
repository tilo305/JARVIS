import React from 'react';
import { Monitor, Tablet, Smartphone } from 'lucide-react';
import { useDeviceToggle } from '../hooks/useDeviceToggle';
import { useState, useEffect } from 'react';

const DeviceToggle = () => {
  const { device, setDeviceType, isDevelopment } = useDeviceToggle();
  const [showNotification, setShowNotification] = useState(false);
  const [lastDevice, setLastDevice] = useState(device);

  // Show notification when device changes
  useEffect(() => {
    if (device !== lastDevice) {
      console.log('Device changed from', lastDevice, 'to', device);
      setShowNotification(true);
      setLastDevice(device);
      
      setTimeout(() => {
        setShowNotification(false);
      }, 1000);
    }
  }, [device, lastDevice]);

  if (!isDevelopment) return null;

  const buttons = [
    { 
      type: 'desktop', 
      icon: Monitor, 
      label: 'Desktop',
      description: 'Full viewport',
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      type: 'tablet', 
      icon: Tablet, 
      label: 'Tablet',
      description: '768px width',
      color: 'from-cyan-500 to-blue-600'
    },
    { 
      type: 'mobile', 
      icon: Smartphone, 
      label: 'Mobile',
      description: '375px width',
      color: 'from-purple-500 to-pink-500'
    },
  ];

  const handleDeviceChange = (type) => {
    console.log('Button clicked:', type);
    setDeviceType(type);
  };

  return (
    <>
      <div className="fixed top-4 right-4 z-50 bg-gray-900/90 backdrop-blur-md p-3 rounded-xl shadow-2xl border border-blue-400/30">
        <div className="flex flex-col gap-2">
          <div className="text-center mb-2">
            <h3 className="text-blue-400 text-xs font-semibold uppercase tracking-wide">Device Preview</h3>
            <p className="text-gray-400 text-xs">Toggle viewport simulation</p>
          </div>
          
          <div className="flex gap-2">
            {buttons.map((btn) => (
              <button
                key={btn.type}
                onClick={() => handleDeviceChange(btn.type)}
                className={`group relative flex flex-col items-center justify-center w-14 h-14 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95
                  ${device === btn.type 
                    ? `bg-gradient-to-r ${btn.color} text-white shadow-lg shadow-blue-500/25 scale-110` 
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white'
                  }
                  border-2 ${device === btn.type ? 'border-blue-400' : 'border-gray-600 hover:border-blue-400/50'}
                `}
                aria-label={`Switch to ${btn.label} view`}
                title={`${btn.label}: ${btn.description}`}
              >
                {React.createElement(btn.icon, { size: 20, className: 'mb-1' })}
                <span className="text-xs font-medium">{btn.label}</span>
                
                {/* Active indicator */}
                {device === btn.type && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                )}
                
                {/* Hover tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  {btn.description}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              </button>
            ))}
          </div>
          
          {/* Current device info */}
          <div className="text-center mt-2 pt-2 border-t border-gray-700">
            <p className="text-blue-400 text-xs font-medium">
              Current: {device.charAt(0).toUpperCase() + device.slice(1)}
            </p>
            <p className="text-gray-400 text-xs">
              {device === 'desktop' ? 'Full viewport' : device === 'tablet' ? '768px width' : '375px width'}
            </p>
          </div>
        </div>
      </div>

      {/* Device change notification */}
      {showNotification && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999] bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-lg shadow-2xl border border-blue-400/30">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="font-semibold text-sm">
              Switched to {device.charAt(0).toUpperCase() + device.slice(1)} Mode
            </span>
          </div>
        </div>
      )}
    </>
  );
};

export default DeviceToggle;
