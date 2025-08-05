import { useState, useEffect } from 'react';

export const useDeviceToggle = () => {
  const [isMobilePreview, setIsMobilePreview] = useState(() => {
    // Get initial state from localStorage
    const saved = localStorage.getItem('jarvis-device-preview');
    return saved ? JSON.parse(saved) : false;
  });

  const [actualDevice, setActualDevice] = useState(() => {
    return window.innerWidth < 768;
  });

  useEffect(() => {
    // Save to localStorage whenever it changes
    localStorage.setItem('jarvis-device-preview', JSON.stringify(isMobilePreview));
  }, [isMobilePreview]);

  useEffect(() => {
    const handleResize = () => {
      setActualDevice(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleDevicePreview = () => {
    setIsMobilePreview(prev => !prev);
  };

  // In development mode, use the toggle state
  // In production, always use actual device detection
  const isDevelopment = import.meta.env.DEV;
  const effectiveDevice = isDevelopment ? isMobilePreview : actualDevice;

  return {
    isMobilePreview,
    actualDevice,
    effectiveDevice,
    toggleDevicePreview,
    isDevelopment
  };
}; 