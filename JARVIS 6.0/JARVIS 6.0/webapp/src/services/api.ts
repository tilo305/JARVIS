import axios, { AxiosInstance } from 'axios';
import { LIMITS } from '../utils/constants';
import { ChatResponse, VoiceResponse } from '../types';
import { Logger } from '../utils/helpers';

export class JarvisAPI {
  private static instance: JarvisAPI;
  private axiosInstance: AxiosInstance;
  private requestCount: Map<string, number[]> = new Map();
  
  private constructor() {
    this.axiosInstance = axios.create({
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for logging
    this.axiosInstance.interceptors.request.use(
      (config) => {
        Logger.debug('API Request', { url: config.url, data: config.data });
        return config;
      },
      (error) => {
        Logger.error('API Request Error', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for logging
    this.axiosInstance.interceptors.response.use(
      (response) => {
        Logger.debug('API Response', response.data);
        return response;
      },
      (error) => {
        Logger.error('API Response Error', error);
        return Promise.reject(error);
      }
    );
  }

  static getInstance(): JarvisAPI {
    if (!JarvisAPI.instance) {
      JarvisAPI.instance = new JarvisAPI();
    }
    return JarvisAPI.instance;
  }

  private checkRateLimit(userId: string = 'default'): boolean {
    const now = Date.now();
    const userRequests = this.requestCount.get(userId) || [];
    
    // Remove requests older than 1 minute
    const recentRequests = userRequests.filter(time => now - time < 60000);
    
    if (recentRequests.length >= LIMITS.rateLimit) {
      Logger.warn('Rate limit exceeded for user', userId);
      return false;
    }
    
    recentRequests.push(now);
    this.requestCount.set(userId, recentRequests);
    return true;
  }

  async sendTextMessage(message: string, conversationId?: string): Promise<ChatResponse> {
    if (!this.checkRateLimit()) {
      throw new Error('Rate limit exceeded. Please wait a moment before sending another message.');
    }

    try {
      const response = await this.axiosInstance.post('https://n8n.hempstarai.com/webhook/jarvis-text', {
        body: {
          query: message,
          sessionId: conversationId || this.generateConversationId(),
          timestamp: new Date().toISOString(),
        }
      });

      return {
        text: response.data.output || response.data.response || 'I apologize, sir. I seem to be experiencing technical difficulties.',
        audioUrl: null,
        audioBase64: null,
        conversationId: conversationId || this.generateConversationId(),
        timestamp: new Date().toISOString(),
        status: 'success'
      };
    } catch (error) {
      Logger.error('Error sending text message', error);
      throw this.handleError(error);
    }
  }

  async sendVoiceMessage(audioBlob: Blob, conversationId?: string): Promise<VoiceResponse> {
    if (!this.checkRateLimit()) {
      throw new Error('Rate limit exceeded. Please wait a moment before sending another message.');
    }

    if (audioBlob.size > LIMITS.maxFileSize) {
      throw new Error('Audio file is too large. Please keep recordings under 30 seconds.');
    }

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('sessionId', conversationId || this.generateConversationId());
      formData.append('timestamp', new Date().toISOString());

      const response = await this.axiosInstance.post('https://n8n.hempstarai.com/webhook/jarvis-voice', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        text: response.data.output || response.data.response || 'I apologize, sir. I seem to be experiencing technical difficulties.',
        audioUrl: null,
        audioBase64: null,
        conversationId: conversationId || this.generateConversationId(),
        timestamp: new Date().toISOString(),
        status: 'success'
      };
    } catch (error) {
      Logger.error('Error sending voice message', error);
      throw this.handleError(error);
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      // Since your workflow doesn't have a health endpoint, we'll test the text webhook
      const response = await this.axiosInstance.post('https://n8n.hempstarai.com/webhook/jarvis-text', {
        body: {
          query: 'health check',
          sessionId: 'health-check',
          timestamp: new Date().toISOString(),
        }
      });
      return response.status === 200;
    } catch (error) {
      Logger.error('Health check failed', error);
      return false;
    }
  }

  private generateConversationId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server responded with error
        return new Error(error.response.data?.message || 'Server error occurred');
      } else if (error.request) {
        // No response received
        return new Error('Unable to connect to JARVIS servers. Please check your connection.');
      }
    }
    return new Error('An unexpected error occurred');
  }
}