import React, { useState, useRef, KeyboardEvent } from 'react';
import { Message } from '../types';
import { MessageList } from './MessageList';
import { sanitizeInput } from '../utils/helpers';
import { LIMITS } from '../utils/constants';
import { useVoiceRecording } from '../hooks/useVoiceRecording';
import { checkMicrophonePermission } from '../utils/helpers';
import { UI_MESSAGES } from '../utils/constants';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  onVoiceMessage?: (audioBlob: Blob) => void;
  isProcessing: boolean;
  onClearMessages?: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  onVoiceMessage,
  isProcessing,
  onClearMessages,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [hasPermission, setHasPermission] = useState(true);
  const [isHolding, setIsHolding] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { 
    isRecording, 
    recordingDuration, 
    startRecording, 
    stopRecording,
    cancelRecording 
  } = useVoiceRecording();

  React.useEffect(() => {
    checkMicrophonePermission().then(setHasPermission);
  }, []);

  const handleSend = () => {
    const sanitized = sanitizeInput(inputValue);
    if (sanitized && !isProcessing) {
      onSendMessage(sanitized);
      setInputValue('');
      setCharCount(0);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= LIMITS.maxMessageLength) {
      setInputValue(value);
      setCharCount(value.length);
    }
  };

  const handleVoiceStart = async (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    
    if (isProcessing) return;
    
    if (!hasPermission) {
      alert(UI_MESSAGES.microphonePermissionDenied);
      const permission = await checkMicrophonePermission();
      setHasPermission(permission);
      return;
    }

    setIsHolding(true);
    try {
      await startRecording();
    } catch (error) {
      console.error('Failed to start recording:', error);
      setIsHolding(false);
    }
  };

  const handleVoiceStop = async (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    
    if (!isHolding || !isRecording) return;
    
    setIsHolding(false);
    const audioBlob = await stopRecording();
    
    if (audioBlob && audioBlob.size > 0 && onVoiceMessage) {
      onVoiceMessage(audioBlob);
    }
  };

  const handleVoiceCancel = () => {
    setIsHolding(false);
    if (isRecording) {
      cancelRecording();
    }
  };

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleClear = () => {
    if (onClearMessages) {
      onClearMessages();
    }
  };

  return (
    <div className="relative flex flex-col h-full bg-black/40 backdrop-blur-sm rounded-xl border border-white/20 shadow-xl font-['Inter',system-ui,-apple-system,sans-serif]">
      {/* Left Blue Glow Border */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-jarvis-blue rounded-l-xl shadow-[0_0_8px_rgba(0,212,255,0.6)]"></div>
      
      {/* Compact Header Bar */}
      <div className="flex items-center justify-between p-3 border-b border-jarvis-blue/40 bg-black/60">
        <h2 className="text-base font-semibold text-jarvis-blue tracking-wide">
          Communication Interface
        </h2>
        <button
          onClick={handleClear}
          className="text-white px-2 py-1 rounded text-xs hover:bg-white/10 transition-colors font-medium"
        >
          Clear
        </button>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <MessageList messages={messages} />
      </div>
      
      {/* Compact Input Area */}
      <div className="p-3 border-t border-white/20 bg-black/30">
        <div className="relative">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type your message to JARVIS..."
            disabled={isProcessing}
            rows={1}
            className="
              w-full px-3 py-2 pr-28
              bg-black/50 text-white placeholder-white/50
              border border-white/20 rounded-lg
              focus:outline-none focus:border-jarvis-blue focus:ring-2 focus:ring-jarvis-blue/30
              disabled:opacity-50 disabled:cursor-not-allowed
              resize-none
              transition-all duration-200
              text-sm font-medium
            "
            data-testid="message-input"
          />
          
          {/* Action Buttons */}
          <div className="absolute right-2 bottom-2 flex items-center space-x-2">
            {/* Voice Button */}
            <button
              onMouseDown={handleVoiceStart}
              onMouseUp={handleVoiceStop}
              onMouseLeave={handleVoiceCancel}
              onTouchStart={handleVoiceStart}
              onTouchEnd={handleVoiceStop}
              onTouchCancel={handleVoiceCancel}
              disabled={isProcessing || !hasPermission}
              className={`
                w-8 h-8 rounded-full flex items-center justify-center
                ${isRecording 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'bg-cyan-500 text-white hover:bg-cyan-400'
                }
                ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
                transition-all duration-200
              `}
              data-testid="voice-button"
              title={isRecording ? 'Recording...' : 'Hold to talk'}
            >
              {isRecording ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              )}
            </button>
            
            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isProcessing}
              className="
                px-3 py-1.5 bg-teal-500 text-white rounded-md
                hover:bg-teal-400 transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center space-x-1 font-semibold text-sm
                hover:scale-105 transition-transform duration-200
              "
              data-testid="send-button"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="text-xs">Processing</span>
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span className="text-xs">Send</span>
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Compact Status Indicators */}
        {isRecording && (
          <div className="mt-2 flex items-center justify-center space-x-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg py-1.5 px-3">
            <div className="flex space-x-1">
              <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-xs font-medium">Recording... {formatDuration(recordingDuration)}</span>
          </div>
        )}
        
        {isProcessing && (
          <div className="mt-2 flex items-center space-x-2 text-jarvis-blue bg-jarvis-blue/10 border border-jarvis-blue/20 rounded-lg py-1.5 px-3" data-testid="processing-indicator">
            <div className="flex space-x-1">
              <div className="w-1.5 h-1.5 bg-jarvis-blue rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 bg-jarvis-blue rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 bg-jarvis-blue rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-xs font-medium">JARVIS is thinking...</span>
          </div>
        )}
        
        {!hasPermission && (
          <div className="mt-2 text-red-400 text-xs text-center bg-red-500/10 border border-red-500/20 rounded-lg py-1.5 px-3 font-medium">
            {UI_MESSAGES.microphonePermissionDenied}
          </div>
        )}
      </div>
    </div>
  );
};