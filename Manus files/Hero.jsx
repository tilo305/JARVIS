import { useState, useEffect } from 'react';
import heroVideoHD from '../assets/hero-video-hd.mp4';
import heroVideoMobile from '../assets/hero-video-mobile.mp4';

const Hero = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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
          {/* Main Title */}
          <h1 className="text-6xl md:text-8xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 animate-pulse">
            JARVIS
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl mb-8 text-gray-300 font-light tracking-wide">
            Just A Rather Very Intelligent System
          </p>
          
          {/* Description */}
          <p className="text-lg md:text-xl mb-12 text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Advanced AI Interface System - Your gateway to the future of human-computer interaction
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25">
              Initialize System
            </button>
            <button className="px-8 py-4 border-2 border-blue-500 text-blue-400 font-semibold rounded-lg hover:bg-blue-500 hover:text-white transition-all duration-300 transform hover:scale-105">
              Learn More
            </button>
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
    </div>
  );
};

export default Hero;

