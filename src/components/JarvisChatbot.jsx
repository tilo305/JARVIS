import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Volume2, VolumeX, Play } from 'lucide-react';
import chatbotVideo from '../assets/chatbot-video.mp4';
import { jarvisService } from '../services/jarvisService';
import { voiceService } from '../services/voiceService';

const JarvisChatbot = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [messages, setMessages] = useState([
    { id: 1, text: "Good day, sir. JARVIS at your service. How may I assist you today?", sender: 'jarvis', timestamp: new Date() }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const videoRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(console.error);
    }
    
    // Initialize JARVIS service and load chat history
    initializeChatHistory();
    
    // Check voice support
    const voiceSupport = voiceService.isVoiceSupported();
    console.log('Voice support:', voiceSupport);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChatHistory = async () => {
    try {
      const history = await jarvisService.getChatHistory(20);
      if (history.length > 0) {
        const formattedHistory = history.map(msg => ({
          id: msg.id,
          text: msg.message,
          sender: msg.sender,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(prev => [...prev, ...formattedHistory]);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleListening = async () => {
    if (isListening) {
      // Stop listening
      voiceService.stopListening();
      setIsListening(false);
    } else {
      // Start listening
      setIsListening(true);
      try {
        const result = await voiceService.startListening();
        setIsListening(false);
        
        if (result.transcript) {
          handleUserMessage(result.transcript, 'voice');
        }
      } catch (error) {
        console.error('Voice recognition error:', error);
        setIsListening(false);
        
        // Show error message
        const errorMessage = {
          id: Date.now(),
          text: "I'm having trouble hearing you, sir. Perhaps we could try text instead?",
          sender: 'jarvis',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    }
  };

  const toggleSpeaking = () => {
    if (isSpeaking) {
      voiceService.stopSpeaking();
      setIsSpeaking(false);
    } else {
      setVoiceEnabled(!voiceEnabled);
    }
  };

  const playJarvisVoiceSample = () => {
    const played = voiceService.playJarvisVoiceSample();
    if (!played) {
      console.log('JARVIS voice sample not available');
    }
  };

  const sendMessage = () => {
    if (inputMessage.trim()) {
      handleUserMessage(inputMessage.trim());
      setInputMessage('');
    }
  };

  const handleUserMessage = async (messageText, messageType = 'text') => {
    // Add user message to UI immediately
    const userMessage = {
      id: Date.now(),
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    
    // Show processing state
    setIsProcessing(true);
    
    try {
      // Process message through JARVIS service
      const jarvisResponse = await jarvisService.processMessage(messageText, messageType);
      
      // Add JARVIS response to UI
      const jarvisMessage = {
        id: Date.now() + 1,
        text: jarvisResponse,
        sender: 'jarvis',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, jarvisMessage]);
      
      // Speak the response if voice is enabled
      if (voiceEnabled && jarvisResponse) {
        setIsSpeaking(true);
        try {
          await voiceService.speakAsJarvis(jarvisResponse);
        } catch (error) {
          console.error('Speech synthesis error:', error);
        } finally {
          setIsSpeaking(false);
        }
      }
      
    } catch (error) {
      console.error('Error processing message:', error);
      
      // Add error response
      const errorMessage = {
        id: Date.now() + 1,
        text: "I apologize, sir, but I seem to be experiencing a minor technical difficulty. Perhaps we could try that again?",
        sender: 'jarvis',
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
      {/* Main Chat Interface - Always Open */}
      <div className="glass rounded-2xl border border-blue-500/30 shadow-2xl h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-blue-500/20">
          <div className="flex items-center space-x-3">
            {/* JARVIS Avatar with Video */}
            <div className="relative w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center overflow-hidden">
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
              <div className="absolute inset-0 bg-blue-500/20 rounded-full"></div>
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">JARVIS</h3>
              <p className="text-blue-400 text-sm">
                {isProcessing ? 'Processing...' : 
                 isSpeaking ? 'Speaking...' : 
                 isListening ? 'Listening...' : 
                 'AI Assistant'}
              </p>
            </div>
          </div>
          
          {/* Voice Controls */}
          <div className="flex space-x-2">
            {/* Voice Sample Button */}
            <button
              onClick={playJarvisVoiceSample}
              className="p-2 rounded-full bg-purple-600 hover:bg-purple-700 transition-all duration-300"
              title="Play JARVIS Voice Sample"
            >
              <Play className="w-4 h-4 text-white" />
            </button>
            
            {/* Speech Output Toggle */}
            <button
              onClick={toggleSpeaking}
              className={`p-2 rounded-full transition-all duration-300 ${
                voiceEnabled 
                  ? isSpeaking
                    ? 'bg-green-500 hover:bg-green-600 animate-pulse'
                    : 'bg-green-600 hover:bg-green-700'
                  : 'bg-gray-600 hover:bg-gray-700'
              }`}
              title={voiceEnabled ? 'Voice Output Enabled' : 'Voice Output Disabled'}
            >
              {voiceEnabled ? (
                <Volume2 className="w-4 h-4 text-white" />
              ) : (
                <VolumeX className="w-4 h-4 text-white" />
              )}
            </button>
            
            {/* Voice Input Button */}
            <button
              onClick={toggleListening}
              disabled={isProcessing}
              className={`p-2 rounded-full transition-all duration-300 ${
                isListening 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                  : 'bg-blue-500 hover:bg-blue-600'
              } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={isListening ? 'Stop Listening' : 'Start Voice Input'}
            >
              {isListening ? (
                <MicOff className="w-4 h-4 text-white" />
              ) : (
                <Mic className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-64">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="max-w-md">
                <div
                  className={`px-4 py-3 rounded-lg text-sm leading-relaxed ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800/80 text-gray-300 border border-blue-500/20'
                  }`}
                >
                  {message.text}
                </div>
                {message.timestamp && (
                  <div className={`text-xs text-gray-500 mt-1 ${
                    message.sender === 'user' ? 'text-right' : 'text-left'
                  }`}>
                    {formatTime(message.timestamp)}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Processing indicator */}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-gray-800/80 border border-blue-500/20 px-4 py-3 rounded-lg">
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
        <div className="p-4 border-t border-blue-500/20">
          <div className="flex space-x-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Speak with JARVIS..."
              disabled={isProcessing}
              className={`flex-1 px-4 py-3 bg-gray-800/50 border border-blue-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm ${
                isProcessing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            />
            <button
              onClick={sendMessage}
              disabled={isProcessing || !inputMessage.trim()}
              className={`px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 flex items-center justify-center min-w-[50px] ${
                (isProcessing || !inputMessage.trim()) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
        <div className="bg-black/80 px-4 py-1 rounded-full border border-blue-500/30 flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            isProcessing ? 'bg-yellow-400 animate-pulse' :
            isListening ? 'bg-red-400 animate-pulse' : 
            isSpeaking ? 'bg-green-400 animate-pulse' : 
            'bg-blue-400'
          }`}></div>
          <span className="text-blue-400 text-xs font-semibold">
            {isProcessing ? 'PROCESSING' :
             isListening ? 'LISTENING' : 
             isSpeaking ? 'SPEAKING' : 
             'ONLINE'}
          </span>
          {voiceEnabled && (
            <span className="text-green-400 text-xs">🔊</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default JarvisChatbot;

