import Hero from './components/Hero'
import JarvisChatbot from './components/JarvisChatbot'
import HUDElements from './components/HUDElements'
import ContentSection from './components/ContentSection'
import DeviceToggle from './components/DeviceToggle'
import { useDeviceToggle } from './hooks/useDeviceToggle'
import './App.css'

function App() {
  const { device } = useDeviceToggle();

  // Simulate viewport width for each device
  let deviceClass = '';
  let deviceStyle = {};
  if (device === 'mobile') {
    deviceClass = 'device-mobile';
    deviceStyle = { maxWidth: 375, margin: '0 auto', border: '2px solid #3b82f6', borderRadius: 20, boxShadow: '0 0 20px rgba(59,130,246,0.2)' };
  } else if (device === 'tablet') {
    deviceClass = 'device-tablet';
    deviceStyle = { maxWidth: 768, margin: '0 auto', border: '2px solid #06b6d4', borderRadius: 20, boxShadow: '0 0 20px rgba(6,182,212,0.15)' };
  } else {
    deviceClass = 'device-desktop';
    deviceStyle = { maxWidth: '100%', margin: '0 auto' };
  }

  return (
    <div className="min-h-screen bg-black relative">
      <DeviceToggle />
      <div className={deviceClass} style={deviceStyle}>
        <Hero />
        <ContentSection />
        <HUDElements />
        <JarvisChatbot />
      </div>
    </div>
  )
}

export default App
