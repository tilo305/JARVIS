import React from 'react';
import { Monitor, Smartphone } from 'lucide-react';

const DeviceToggle = ({ isMobile, onToggle }) => {
  return (
    <div className="fixed top-4 right-4 z-50"> 
      <button
        onClick={onToggle}
        className={`flex items-center justify-center px-4 py-2 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 border-2 ${
          isMobile 
            ? 'bg-blue-600 text-white border-blue-400 hover:bg-blue-500' 
            : 'bg-gray-800 text-cyan-400 border-cyan-400 hover:bg-cyan-400 hover:text-black'
        }`}
        title={`Switch to ${isMobile ? 'Desktop' : 'Mobile'} view`}
      >
        {isMobile ? (
          <>
            <Monitor className="w-4 h-4 mr-2" />
            Desktop
          </>
        ) : (
          <>
            <Smartphone className="w-4 h-4 mr-2" />
            Mobile
          </>
        )}
      </button>
    </div>
  );
};

export default DeviceToggle;
