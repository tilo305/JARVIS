import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Volume2, VolumeX, Play, Users } from 'lucide-react';
import { Conversation } from '@elevenlabs/client';
import chatbotVideo from '../assets/chatbot-video.mp4';
import { jarvisService } from '../services/jarvisService';

const JarvisChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState('jarvis');
  const [showCharacterSelect, setShowCharacterSelect] = useState(false);
  const videoRef = useRef(null);
  const messagesEndRef = useRef(null);
  const elevenWidgetRef = useRef(null);
  const [isElevenWidgetReady, setIsElevenWidgetReady] = useState(false);
  const conversationRef = useRef(null);

  // Try to programmatically trigger the ElevenLabs widget
  const handleMicWidgetTrigger = async () => {
    // Request mic first
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      alert(`Microphone permission error: ${err?.name || 'Unknown'}${err?.message ? ` - ${err.message}` : ''}`);
      return;
    }

    // If already in a session, stop it
    if (conversationRef.current) {
      try { await conversationRef.current.endSession(); } catch {}
      conversationRef.current = null;
      setIsListening(false);
      return;
    }

    try {
      setIsListening(true);
      const conv = await Conversation.startSession({
        agentId: 'agent_7601k23b460aeejb2pvyfcvw6atk',
        onConnect: () => setIsListening(true),
        onDisconnect: () => setIsListening(false),
        onError: (error) => {
          console.error('ElevenLabs conversation error', error);
          alert(`Voice error: ${error?.message || 'Unknown error'}`);
          setIsListening(false);
        },
        onModeChange: (mode) => {
          if (mode?.mode === 'speaking') setIsSpeaking(true); else setIsSpeaking(false);
        },
      });
      conversationRef.current = conv;
    } catch (e) {
      console.error(e);
      alert(`Failed to start voice session: ${e?.message || 'Unknown error'}`);
      setIsListening(false);
    }
  };

  // Character configurations
  const characters = {
    jarvis: {
      name: 'JARVIS',
      greeting: "Good day, sir. JARVIS at your service. How may I assist you today?",
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-500',
      borderColor: 'border-blue-500'
    },
    friday: {
      name: 'FRIDAY',
      greeting: "Hey there! FRIDAY here, ready to help out. What can I do for you?",
      color: 'purple',
      gradient: 'from-purple-500 to-pink-500',
      borderColor: 'border-purple-500'
    },
    edith: {
      name: 'EDITH',
      greeting: "EDITH systems online. Advanced threat detection active. How may I assist?",
      color: 'red',
      gradient: 'from-red-500 to-orange-500',
      borderColor: 'border-red-500'
    },
    karen: {
      name: 'KAREN',
      greeting: "KAREN network interface ready. All systems operational. What do you need?",
      color: 'green',
      gradient: 'from-green-500 to-emerald-500',
      borderColor: 'border-green-500'
    }
  };

  const currentCharacter = characters[selectedCharacter];

  // Initialize with greeting
  useEffect(() => {
    const initialMessage = {
      id: Date.now(),
      text: currentCharacter.greeting,
      sender: 'ai',
      timestamp: new Date()
    };
    setMessages([initialMessage]);
  }, [selectedCharacter]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load ElevenLabs ConvAI widget script once
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const existing = document.querySelector('script[src="https://unpkg.com/@elevenlabs/convai-widget-embed"]');
    const checkReady = () => {
      try {
        if (window.customElements && window.customElements.get('elevenlabs-convai')) {
          setIsElevenWidgetReady(true);
          return true;
        }
      } catch (_) {}
      return false;
    };
    if (existing) {
      // If script already present, wait for custom element registration
      if (!checkReady()) {
        const id = setInterval(() => { if (checkReady()) clearInterval(id); }, 200);
        return () => clearInterval(id);
      }
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
    s.async = true;
    s.type = 'text/javascript';
    document.body.appendChild(s);
    const id = setInterval(() => { if (checkReady()) clearInterval(id); }, 200);
    return () => {
      clearInterval(id);
    };
  }, []);

  const handleCharacterChange = (characterKey) => {
    setSelectedCharacter(characterKey);
    setShowCharacterSelect(false);
  };

  const playJarvisVoiceSample = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(
        "Voice sample activated. All systems operational, sir."
      );
      utterance.rate = 0.9;
      utterance.pitch = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const toggleSpeaking = () => {
    setVoiceEnabled(!voiceEnabled);
    if (voiceEnabled && isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      // Add speech recognition logic here
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isProcessing) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsProcessing(true);

    try {
      const response = await jarvisService.sendMessage(inputMessage, selectedCharacter);
      
      const aiMessage = {
        id: Date.now() + 1,
        text: response,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);

      if (voiceEnabled && 'speechSynthesis' in window) {
        setIsSpeaking(true);
        const utterance = new SpeechSynthesisUtterance(response);
        utterance.rate = 0.9;
        utterance.pitch = 0.8;
        utterance.onend = () => setIsSpeaking(false);
        speechSynthesis.speak(utterance);
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: "I apologize, sir, but I seem to be experiencing a minor technical difficulty. Perhaps we could try that again?",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 w-[600px] h-[400px]">
      {/* Character Selection Dropdown */}
      {showCharacterSelect && (
        <div className="absolute -top-48 left-0 right-0 bg-black/90 backdrop-blur-sm rounded-xl border border-gray-700 p-4 z-50">
          <h3 className="text-white font-semibold mb-3">Select AI Assistant</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(characters).map(([key, char]) => (
              <button
                key={key}
                onClick={() => handleCharacterChange(key)}
                className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                  selectedCharacter === key
                    ? `bg-gradient-to-r ${char.gradient} ${char.borderColor} text-white`
                    : `bg-gray-800/50 border-gray-600 text-gray-300 hover:${char.borderColor} hover:text-white`
                }`}
              >
                <div className="font-semibold">{char.name}</div>
                <div className="text-xs opacity-75 mt-1">
                  {key === 'jarvis' && 'Original AI Assistant'}
                  {key === 'friday' && 'Friendly & Casual'}
                  {key === 'edith' && 'Advanced Defense'}
                  {key === 'karen' && 'Network Specialist'}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Chat Interface */}
      <div className={`glass rounded-2xl border ${currentCharacter.borderColor} shadow-2xl h-full flex flex-col`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${currentCharacter.borderColor}`}>
          <div className="flex items-center space-x-3">
            {/* AI Avatar */}
            <div className={`relative w-12 h-12 rounded-full bg-gradient-to-r ${currentCharacter.gradient} flex items-center justify-center overflow-hidden`}>
              <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-70"
              >
                <source src={chatbotVideo} type="video/mp4" />
              </video>
              <div className={`absolute inset-0 bg-${currentCharacter.color}-500/20 rounded-full`}></div>
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">{currentCharacter.name}</h3>
              <p className={`text-${currentCharacter.color}-400 text-sm`}>
                {isProcessing ? 'Processing...' :
                 isSpeaking ? 'Speaking...' :
                 isListening ? 'Listening...' :
                 'AI Assistant'}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex space-x-2 items-center">
            <button
              type="button"
              className={`p-2 rounded-full transition-all duration-300 ${
                isElevenWidgetReady ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-600 cursor-not-allowed'
              }`}
              aria-label="Voice (ElevenLabs)"
              title={isElevenWidgetReady ? 'Start voice' : 'Loading voice widget...'}
              onClick={handleMicWidgetTrigger}
            >
              <Mic className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-64">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-md">
                <div className={`px-4 py-3 rounded-lg text-sm leading-relaxed ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : `bg-gray-800/80 text-gray-300 border ${currentCharacter.borderColor}`
                }`}>
                  {message.text}
                </div>
                {message.timestamp && (
                  <div className={`text-xs text-gray-500 mt-1 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                    {formatTime(message.timestamp)}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="flex justify-start">
              <div className={`bg-gray-800/80 border ${currentCharacter.borderColor} px-4 py-3 rounded-lg`}>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className={`p-4 border-t ${currentCharacter.borderColor}`}>
          <div className="flex space-x-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Speak with ${currentCharacter.name}...`}
              disabled={isProcessing}
              className={`flex-1 px-4 py-3 bg-gray-800/50 border ${currentCharacter.borderColor} rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm`}
            />
            <button
              onClick={sendMessage}
              disabled={isProcessing || !inputMessage.trim()}
              className={`px-4 py-3 bg-gradient-to-r ${currentCharacter.gradient} text-white rounded-lg hover:opacity-80 transition-all duration-300 flex items-center justify-center min-w-[50px] ${
                (isProcessing || !inputMessage.trim()) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ElevenLabs widget not required when using SDK; keeping code minimal */}

      {/* Status Indicator */}
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
        <div className={`bg-black/80 px-4 py-1 rounded-full border ${currentCharacter.borderColor} flex items-center space-x-2`}>
          <div className={`w-2 h-2 rounded-full ${
            isProcessing ? 'bg-yellow-400 animate-pulse' :
            isListening ? 'bg-red-400 animate-pulse' :
            isSpeaking ? 'bg-green-400 animate-pulse' :
            `bg-${currentCharacter.color}-400`
          }`}></div>
          <span className={`text-${currentCharacter.color}-400 text-xs font-semibold`}>
            {isProcessing ? 'PROCESSING' :
             isListening ? 'LISTENING' :
             isSpeaking ? 'SPEAKING' :
             'ONLINE'}
          </span>
          {voiceEnabled && <span className="text-green-400 text-xs">🔊</span>}
        </div>
      </div>
    </div>
  );
};

export default JarvisChatbot;
