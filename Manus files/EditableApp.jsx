import { useState } from 'react';
import Hero from './components/Hero';
import SimpleEditableHero from './components/SimpleEditableHero';
import ContentSection from './components/ContentSection';
import EditableContentSection from './components/EditableContentSection';
import HUDElements from './components/HUDElements';
import JarvisChatbot from './components/JarvisChatbot';
import EditModeToggle from './components/EditModeToggle';
import './App.css';

function EditableApp() {
  const [isEditMode, setIsEditMode] = useState(false);

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  return (
    <div className="min-h-screen bg-black">
      <EditModeToggle isEditMode={isEditMode} onToggle={toggleEditMode} />
      
      {isEditMode ? <SimpleEditableHero /> : <Hero />}
      {isEditMode ? <EditableContentSection /> : <ContentSection />}
      <HUDElements />
      <JarvisChatbot />
    </div>
  );
}

export default EditableApp;

