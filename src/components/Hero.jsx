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

      {/* Holographic UI Elements - Only top left one remains */}
      <div className="absolute top-1/4 left-10 z-15 hidden lg:block">
        <div className="w-32 h-32 border-2 border-blue-400/30 rounded-full animate-spin-slow">
          <div className="w-16 h-16 border-2 border-cyan-400/50 rounded-full m-auto mt-8 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default Hero;

