import Hero from './components/Hero'
import JarvisChatbot from './components/JarvisChatbot'
import HUDElements from './components/HUDElements'
import ContentSection from './components/ContentSection'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-black">
      <Hero />
      <ContentSection />
      <HUDElements />
      <JarvisChatbot />
    </div>
  )
}

export default App
