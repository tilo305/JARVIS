import { useState, useEffect } from 'react';
import heroVideoHD from '../assets/hero-video-hd.mp4';
import heroVideoMobile from '../assets/hero-video-mobile.mp4';
import EditableText from './EditableText';

const EditableHero = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  // State for editable content
  const [content, setContent] = useState({
    title: 'JARVIS',
    subtitle: 'Just A Rather Very Intelligent System',
    description: 'Advanced AI Interface System - Your gateway to the future of human-computer interaction',
    primaryButtonText: 'Initialize System',
    secondaryButtonText: 'Learn More'
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Save handlers for each editable field
  const handleSave = (field) => (value) => {
    setContent(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Optional: Save to localStorage for persistence
    const updatedContent = { ...content, [field]: value };
    localStorage.setItem('heroContent', JSON.stringify(updatedContent));
  };

  // Load content from localStorage on component mount
  useEffect(() => {
    const savedContent = localStorage.getItem('heroContent');
    if (savedContent) {
      try {
        const parsed = JSON.parse(savedContent);
        setContent(parsed);
      } catch (error) {
        console.error('Error loading saved content:', error);
      }
    }
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover"
        preload="auto"
      >
        <source src={isMobile ? heroVideoMobile : heroVideoHD} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Dark Overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/40 z-10"></div>

      {/* Hero Content */}
      <div className="relative z-20 h-full flex items-center justify-center">
        <div className="text-center text-white px-4 max-w-4xl mx-auto">
          {/* Main Title - Editable */}
          <EditableText
            value={content.title}
            onSave={handleSave('title')}
            displayClassName="text-6xl md:text-8xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 animate-pulse"
            editClassName="text-6xl md:text-8xl font-bold text-white bg-transparent border-2"
            instructions="Click to edit title"
            placeholder="Enter title..."
          />
          
          {/* Subtitle - Editable */}
          <EditableText
            value={content.subtitle}
            onSave={handleSave('subtitle')}
            displayClassName="text-xl md:text-2xl mb-8 text-gray-300 font-light tracking-wide"
            editClassName="text-xl md:text-2xl text-white bg-transparent"
            instructions="Click to edit subtitle"
            placeholder="Enter subtitle..."
          />
          
          {/* Description - Editable */}
          <EditableText
            value={content.description}
            onSave={handleSave('description')}
            displayClassName="text-lg md:text-xl mb-12 text-gray-400 max-w-2xl mx-auto leading-relaxed"
            editClassName="text-lg md:text-xl text-white bg-transparent"
            instructions="Click to edit description"
            placeholder="Enter description..."
            multiline={true}
          />

          {/* CTA Buttons - Editable */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <EditableText
              value={content.primaryButtonText}
              onSave={handleSave('primaryButtonText')}
              displayClassName="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25 inline-block"
              editClassName="px-8 py-4 text-white bg-transparent border-2"
              instructions="Click to edit primary button text"
              placeholder="Primary button text..."
            />
            <EditableText
              value={content.secondaryButtonText}
              onSave={handleSave('secondaryButtonText')}
              displayClassName="px-8 py-4 border-2 border-blue-500 text-blue-400 font-semibold rounded-lg hover:bg-blue-500 hover:text-white transition-all duration-300 transform hover:scale-105 inline-block"
              editClassName="px-8 py-4 text-white bg-transparent border-2"
              instructions="Click to edit secondary button text"
              placeholder="Secondary button text..."
            />
          </div>
        </div>
      </div>

      {/* Holographic UI Elements */}
      <div className="absolute top-1/4 left-10 z-15 hidden lg:block">
        <div className="w-32 h-32 border-2 border-blue-400/30 rounded-full animate-spin-slow">
          <div className="w-16 h-16 border-2 border-cyan-400/50 rounded-full m-auto mt-8 animate-pulse"></div>
        </div>
      </div>

      <div className="absolute bottom-1/4 right-10 z-15 hidden lg:block">
        <div className="w-24 h-24 border border-blue-400/20 rounded-full animate-ping">
          <div className="w-12 h-12 bg-blue-500/20 rounded-full m-auto mt-6 animate-pulse"></div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="w-6 h-10 border-2 border-blue-400/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-blue-400 rounded-full mt-2 animate-bounce"></div>
        </div>
      </div>

      {/* Edit Mode Indicator */}
      <div className="absolute top-4 right-4 z-30">
        <div className="bg-blue-500/20 border border-blue-400/50 rounded-lg px-3 py-2 text-blue-300 text-sm">
          ✏️ Edit Mode Active - Click any text to edit
        </div>
      </div>
    </div>
  );
};

export default EditableHero;

