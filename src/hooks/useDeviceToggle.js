import { useState, useEffect } from 'react';

export const useDeviceToggle = () => {
  const [device, setDevice] = useState(() => {
    return localStorage.getItem('jarvis-device') || 'desktop';
  });

  useEffect(() => {
    console.log('Device changed to:', device);
    localStorage.setItem('jarvis-device', device);
  }, [device]);

  const setDeviceType = (type) => {
    console.log('setDeviceType called with:', type);
    if (['desktop', 'tablet', 'mobile'].includes(type)) {
      console.log('Setting device to:', type);
      setDevice(type);
    } else {
      console.log('Invalid device type:', type);
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