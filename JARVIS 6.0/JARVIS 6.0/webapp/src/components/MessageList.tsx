import React, { useEffect, useRef } from 'react';
import { Message } from '../types';
import { formatTimestamp } from '../utils/helpers';

interface MessageListProps {
  messages: Message[];
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 font-['Inter',system-ui,-apple-system,sans-serif]" data-testid="message-list">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-white/30">
            <p className="text-base font-medium">No messages yet</p>
            <p className="text-sm opacity-60 mt-1 font-medium">Start a conversation with JARVIS</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`
                  max-w-sm px-3 py-2 rounded-lg
                  ${message.sender === 'user' 
                    ? 'bg-jarvis-blue text-white' 
                    : 'bg-white/10 text-white border border-white/20'
                  }
                  ${message.isError ? 'border-red-400 bg-red-500/10' : ''}
                  transition-all duration-200 hover:scale-[1.02]
                `}
              >
                <div className="flex items-start space-x-2">
                  {message.sender === 'jarvis' && (
                    <div className="w-5 h-5 rounded-full bg-jarvis-blue/30 flex items-center justify-center flex-shrink-0">
                      <div className="w-2.5 h-2.5 rounded-full bg-jarvis-blue"></div>
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
                      {message.text}
                    </p>
                    
                    {message.audioUrl && (
                      <button 
                        onClick={() => {
                          const audio = new Audio(message.audioUrl);
                          audio.play();
                        }}
                        className="mt-1 flex items-center space-x-1 text-xs opacity-70 hover:opacity-100 transition-opacity bg-white/10 hover:bg-white/20 px-2 py-1 rounded border border-white/20 font-medium"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        </svg>
                        <span>Play</span>
                      </button>
                    )}
                    
                    <div className="mt-1 text-xs opacity-50 font-medium">
                      {formatTimestamp(message.timestamp)}
                    </div>
                  </div>
                  
                  {message.sender === 'user' && (
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};