import { useState, useEffect } from 'react';

const DEVICE_TYPES = ['desktop', 'tablet', 'mobile'];

export const useDeviceToggle = () => {
  const [device, setDevice] = useState(() => {
    return localStorage.getItem('jarvis-device') || 'desktop';
  });

  useEffect(() => {
    localStorage.setItem('jarvis-device', device);
  }, [device]);

  const setDeviceType = (type) => {
    if (DEVICE_TYPES.includes(type)) {
      setDevice(type);
    }
  };

  // For development only: allow toggling
  const isDevelopment = import.meta.env.DEV;

  return {
    device, // 'desktop' | 'tablet' | 'mobile'
    setDeviceType,
    isDevelopment
  };
}; 