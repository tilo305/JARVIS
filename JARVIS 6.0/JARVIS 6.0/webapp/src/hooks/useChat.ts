import { useState, useCallback, useEffect } from 'react';
import { Message } from '../types';
import { JarvisAPI } from '../services/api';
import { generateId, Logger, playAudioSafely } from '../utils/helpers';
import { UI_MESSAGES } from '../utils/constants';

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationId] = useState(() => generateId());
  const [error, setError] = useState<string | null>(null);

  const api = JarvisAPI.getInstance();

  // Add welcome message on mount
  useEffect(() => {
    const welcomeMessage: Message = {
      id: generateId(),
      text: UI_MESSAGES.welcome,
      sender: 'jarvis',
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []);

  const addMessage = useCallback((text: string, sender: 'user' | 'jarvis', audioUrl?: string) => {
    const message: Message = {
      id: generateId(),
      text,
      sender,
      timestamp: new Date(),
      audioUrl,
    };
    setMessages(prev => [...prev, message]);
    return message;
  }, []);

  const sendTextMessage = useCallback(async (text: string) => {
    if (!text.trim() || isProcessing) return;

    setError(null);
    
    // Add user message
    addMessage(text, 'user');
    
    setIsProcessing(true);

    try {
      const response = await api.sendTextMessage(text, conversationId);
      
      // Add JARVIS response
      const jarvisMessage = addMessage(response.text, 'jarvis', response.audioUrl || undefined);
      
      // Auto-play audio if available
      if (response.audioUrl) {
        try {
          await playAudioSafely(response.audioUrl);
        } catch (audioError) {
          Logger.warn('Audio playback failed', audioError);
          // Don't throw - text response is still valid
        }
      }

      return jarvisMessage;
    } catch (error: any) {
      Logger.error('Error sending text message', error);
      setError(error.message);
      
      // Add error message
      addMessage(
        error.message || UI_MESSAGES.errorGeneric,
        'jarvis'
      );
    } finally {
      setIsProcessing(false);
    }
  }, [conversationId, isProcessing, addMessage]);

  const sendVoiceMessage = useCallback(async (audioBlob: Blob) => {
    if (!audioBlob || isProcessing) return;

    setError(null);
    setIsProcessing(true);

    try {
      const response = await api.sendVoiceMessage(audioBlob, conversationId);
      
      // Add user's transcribed message if available
      if (response.transcription) {
        addMessage(response.transcription, 'user');
      }
      
      // Add JARVIS response
      const jarvisMessage = addMessage(response.text, 'jarvis', response.audioUrl || undefined);
      
      // Auto-play audio response
      if (response.audioUrl) {
        try {
          await playAudioSafely(response.audioUrl);
        } catch (audioError) {
          Logger.warn('Audio playback failed', audioError);
        }
      }

      return jarvisMessage;
    } catch (error: any) {
      Logger.error('Error sending voice message', error);
      setError(error.message);
      
      // Add error message
      addMessage(
        error.message || UI_MESSAGES.errorGeneric,
        'jarvis'
      );
    } finally {
      setIsProcessing(false);
    }
  }, [conversationId, isProcessing, addMessage]);

  const clearMessages = useCallback(() => {
    setMessages([{
      id: generateId(),
      text: UI_MESSAGES.welcome,
      sender: 'jarvis',
      timestamp: new Date(),
    }]);
    setError(null);
  }, []);

  const retryLastMessage = useCallback(async () => {
    const lastUserMessage = [...messages].reverse().find(m => m.sender === 'user');
    if (lastUserMessage) {
      await sendTextMessage(lastUserMessage.text);
    }
  }, [messages, sendTextMessage]);

  return {
    messages,
    isProcessing,
    error,
    conversationId,
    sendTextMessage,
    sendVoiceMessage,
    clearMessages,
    retryLastMessage,
  };
};