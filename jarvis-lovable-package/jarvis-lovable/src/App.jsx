import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Mic } from 'lucide-react'
import './App.css'
import ironManVideo from './assets/Ironmanmoving.mp4'
import jarvisChatbotVideo from './assets/JarvisChatbot.mp4'

function App() {
  const [isTextActive, setIsTextActive] = useState(false)
  const [isVoiceActive, setIsVoiceActive] = useState(false)
  const chatbotVideoRef = useRef(null)
  const backgroundVideoRef = useRef(null)

  useEffect(() => {
    // Auto-play videos when component mounts
    if (backgroundVideoRef.current) {
      backgroundVideoRef.current.play().catch(console.error)
    }
    if (chatbotVideoRef.current) {
      chatbotVideoRef.current.play().catch(console.error)
    }
  }, [])

  const toggleText = () => {
    setIsTextActive(!isTextActive)
  }

  const toggleVoice = () => {
    setIsVoiceActive(!isVoiceActive)
  }

  return (
    <div className="jarvis-container">
      {/* Background Video */}
      <video
        ref={backgroundVideoRef}
        className="background-video"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src={ironManVideo} type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="overlay" />

      {/* Main Content */}
      <div className="main-content">
        {/* JARVIS Chatbot Interface - Clean without text */}
        <div className="jarvis-interface-exact">
          {/* Outer mechanical ring structure */}
          <div className="mechanical-ring">
            {/* Top JARVIS label */}
            <div className="top-label-section">
              <div className="jarvis-top-label">JARVIS</div>
            </div>
            
            {/* Mechanical details and segments */}
            <div className="mechanical-details">
              {/* Blue indicator segments in arc */}
              <div className="blue-arc-segments">
                <div className="arc-segment seg-1"></div>
                <div className="arc-segment seg-2"></div>
                <div className="arc-segment seg-3"></div>
                <div className="arc-segment seg-4"></div>
                <div className="arc-segment seg-5"></div>
                <div className="arc-segment seg-6"></div>
                <div className="arc-segment seg-7"></div>
                <div className="arc-segment seg-8"></div>
                <div className="arc-segment seg-9"></div>
                <div className="arc-segment seg-10"></div>
              </div>
              
              {/* Corner mechanical elements */}
              <div className="corner-mech top-left-mech"></div>
              <div className="corner-mech top-right-mech"></div>
              <div className="corner-mech bottom-left-mech"></div>
              <div className="corner-mech bottom-right-mech"></div>
              
              {/* Side mechanical details */}
              <div className="side-detail left-detail"></div>
              <div className="side-detail right-detail"></div>
            </div>
            
            {/* Orange/red glowing ring */}
            <div className="glow-ring"></div>
          </div>
          
          {/* Main display screen - Clean without text */}
          <div className="main-screen">
            <div className="screen-content">
              <div className="mic-indicator">
                <Mic className="w-8 h-8" />
              </div>
            </div>
          </div>
          
          {/* Bottom control panel */}
          <div className="bottom-control-panel">
            <Button
              onClick={toggleText}
              className={`panel-button text-btn ${isTextActive ? 'active' : ''}`}
            >
              TEXT
            </Button>
            
            <Button
              onClick={toggleVoice}
              className={`panel-button voice-btn ${isVoiceActive ? 'active' : ''}`}
            >
              VOICE
            </Button>
          </div>
        </div>

        {/* HUD Elements */}
        <div className="hud-elements">
          <div className="hud-corner top-left"></div>
          <div className="hud-corner top-right"></div>
          <div className="hud-corner bottom-left"></div>
          <div className="hud-corner bottom-right"></div>
        </div>
      </div>
    </div>
  )
}

export default App

