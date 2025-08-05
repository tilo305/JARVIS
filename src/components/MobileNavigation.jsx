import React from 'react';
import { Home, User, Settings, MessageCircle } from 'lucide-react';

const MobileNavigation = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm border-t border-cyan-400/30 z-40">
      <div className="flex justify-around items-center py-2">
        <button className="flex flex-col items-center p-2 text-cyan-400 hover:text-white transition-colors">
          <Home className="w-5 h-5" />
          <span className="text-xs mt-1">Home</span>
        </button>
        <button className="flex flex-col items-center p-2 text-cyan-400 hover:text-white transition-colors">
          <MessageCircle className="w-5 h-5" />
          <span className="text-xs mt-1">Chat</span>
        </button>
        <button className="flex flex-col items-center p-2 text-cyan-400 hover:text-white transition-colors">
          <User className="w-5 h-5" />
          <span className="text-xs mt-1">Profile</span>
        </button>
        <button className="flex flex-col items-center p-2 text-cyan-400 hover:text-white transition-colors">
          <Settings className="w-5 h-5" />
          <span className="text-xs mt-1">Settings</span>
        </button>
      </div>
    </nav>
  );
};

export default MobileNavigation;
