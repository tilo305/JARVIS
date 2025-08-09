import Hero from './components/Hero'
import JarvisChatbot from './components/JarvisChatbot'   
import HUDElements from './components/HUDElements'       
import ContentSection from './components/ContentSection' 
import DeviceToggle from './components/DeviceToggle'     
import { useDeviceToggle } from './hooks/useDeviceToggle'
import './App.css'

function App() {
  const { device } = useDeviceToggle();

  // Simple device container styles
  const getDeviceContainerStyle = () => {
    const baseStyle = {
      margin: '0 auto',
      transition: 'all 0.3s ease-in-out',
      position: 'relative',
      overflow: 'hidden',
      minHeight: '100vh'
    };

    switch (device) {
      case 'mobile':
        return {
          ...baseStyle,
          maxWidth: '375px',
          width: '375px',
          border: '2px solid #3b82f6',
          borderRadius: '20px',
          boxShadow: '0 0 20px rgba(59,130,246,0.2)',
          backgroundColor: '#000'
        };
      case 'tablet':
        return {
          ...baseStyle,
          maxWidth: '768px',
          width: '768px',
          border: '2px solid #06b6d4',
          borderRadius: '20px',
          boxShadow: '0 0 20px rgba(6,182,212,0.15)',
          backgroundColor: '#000'
        };
      default: // desktop
        return {
          ...baseStyle,
          maxWidth: '100%',
          width: '100%',
          border: 'none',
          borderRadius: '0',
          boxShadow: 'none',
          backgroundColor: 'transparent'
        };
    }
  };

  const deviceStyle = getDeviceContainerStyle();
  const deviceClass = `device-${device}`;

  // Debug logging
  console.log('Current device:', device);
  console.log('Device style:', deviceStyle);

  return (
    <div className="min-h-screen bg-black relative">     
      <DeviceToggle />
      
      {/* Device simulation container */}
      <div 
        className={deviceClass}
        style={deviceStyle}
        data-device={device}
      >  
        <Hero />
        <ContentSection />
        <HUDElements />
        <JarvisChatbot />
      </div>

      {/* Device info overlay (only in development) */}
      {import.meta.env.DEV && (
        <div className="fixed bottom-4 left-4 z-40 bg-gray-900/90 backdrop-blur-md px-3 py-2 rounded-lg border border-blue-400/30">
          <p className="text-blue-400 text-xs font-medium">
            {device === 'desktop' ? 'Desktop' : device === 'tablet' ? 'Tablet' : 'Mobile'} Mode
          </p>
          <p className="text-gray-400 text-xs">
            {device === 'desktop' ? 'Full viewport' : device === 'tablet' ? '768px width' : '375px width'}
          </p>
        </div>
      )}
    </div>
  )
}

export default App
