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
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  onVoiceMessage,
  isProcessing,
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

  return (
    <div className="chat-interface flex flex-col h-full bg-jarvis-dark rounded-lg border border-jarvis-blue/20">
      <MessageList messages={messages} />
      
      <div className="chat-input-container border-t border-jarvis-blue/20 p-4">
        <div className="relative">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type your message to JARVIS..."
            disabled={isProcessing}
            rows={2}
            className="
              w-full px-4 py-3 pr-24
              bg-jarvis-gray text-white placeholder-gray-500
              border border-jarvis-blue/30 rounded-lg
              focus:outline-none focus:border-jarvis-blue focus:ring-1 focus:ring-jarvis-blue
              disabled:opacity-50 disabled:cursor-not-allowed
              resize-none
            "
            data-testid="message-input"
          />
          
          <div className="absolute right-2 bottom-2 flex items-center space-x-2">
            <span className={`text-xs ${charCount > LIMITS.maxMessageLength * 0.9 ? 'text-red-500' : 'text-gray-500'}`}>
              {charCount}/{LIMITS.maxMessageLength}
            </span>
            
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
                relative w-8 h-8 rounded-full 
                ${isRecording ? 'bg-red-600 animate-pulse' : 'bg-jarvis-blue/80'} 
                ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-jarvis-blue hover:shadow-lg hover:shadow-jarvis-blue/50'}
                transition-all duration-300 transform
                ${isHolding ? 'scale-110' : 'scale-100'}
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center
              `}
              data-testid="voice-button"
              title={isRecording ? 'Recording...' : 'Hold to talk'}
            >
              {isRecording ? (
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              )}
            </button>
            
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isProcessing}
              className="
                px-4 py-2 bg-jarvis-blue text-white rounded-md
                hover:bg-jarvis-blue/80 transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center space-x-2
              "
              data-testid="send-button"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="text-sm">Processing</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span className="text-sm">Send</span>
                </>
              )}
            </button>
          </div>
        </div>
        
                  {/* Voice Recording Status */}
          {isRecording && (
            <div className="mt-3 flex items-center justify-center space-x-2 text-jarvis-blue">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm text-red-400">Recording... {formatDuration(recordingDuration)}</span>
            </div>
          )}
          
          {isProcessing && (
            <div className="mt-3 flex items-center space-x-2 text-jarvis-blue" data-testid="processing-indicator">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-jarvis-blue rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-jarvis-blue rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-jarvis-blue rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm">JARVIS is thinking...</span>
            </div>
          )}
          
          {!hasPermission && (
            <div className="mt-3 text-red-500 text-sm text-center">
              {UI_MESSAGES.microphonePermissionDenied}
            </div>
          )}
      </div>
    </div>
  );
};