import React, { useEffect, useState } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { useChat } from './hooks/useChat';
import { JarvisAPI } from './services/api';

function App() {
  const {
    messages,
    isProcessing,
    error,
    sendTextMessage,
    sendVoiceMessage,
    clearMessages,
  } = useChat();

  const [isHealthy, setIsHealthy] = useState(true);

  // Health check on mount
  useEffect(() => {
    const checkHealth = async () => {
      const api = JarvisAPI.getInstance();
      const healthy = await api.checkHealth();
      setIsHealthy(healthy);
    };

    checkHealth();
    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="jarvis-app">
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Main Content - Iron Man video is the hero */}
        <main className="flex-1 flex items-center justify-center px-4">
          {/* Iron Man video is the hero - no additional content needed */}
        </main>

        {/* Chat Interface - Small, centered at bottom */}
        <div className="flex-shrink-0 pb-2 px-4">
          <div className="max-w-md mx-auto">
            {/* Compact Chat Window */}
            <div className="glass-panel p-3 h-[240px] flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-jarvis-blue">
                  Communication Interface
                </h2>
                <button
                  onClick={clearMessages}
                  className="text-gray-400 hover:text-jarvis-blue transition-colors text-xs"
                >
                  Clear
                </button>
              </div>
              
              <ChatInterface
                messages={messages}
                onSendMessage={sendTextMessage}
                onVoiceMessage={sendVoiceMessage}
                isProcessing={isProcessing}
              />
            </div>
            
            {error && (
              <div className="mt-3 p-2 bg-red-900/30 border border-red-500/50 rounded text-xs">
                <p className="text-red-300">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-gray-500 text-sm py-4 flex-shrink-0">
          {/* Footer text removed for cleaner visual interface */}
        </footer>
      </div>
    </div>
  );
}

export default App;