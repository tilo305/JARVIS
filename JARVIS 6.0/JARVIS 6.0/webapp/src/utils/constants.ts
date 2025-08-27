export const N8N_WEBHOOKS = {
  TEXT: 'https://n8n.hempstarai.com/webhook/jarvis-text',
  VOICE: 'https://n8n.hempstarai.com/webhook/jarvis-voice'
};

export const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:5678/ws';
export const DEBUG_MODE = process.env.REACT_APP_DEBUG === 'true';

export const AUDIO_CONFIG = {
  mimeType: 'audio/webm;codecs=opus',
  sampleRate: 44100,
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};

export const LIMITS = {
  maxMessageLength: 500,
  maxAudioDuration: 30000, // 30 seconds
  maxFileSize: 10 * 1024 * 1024, // 10MB
  rateLimit: 60, // requests per minute
};

export const UI_MESSAGES = {
  microphonePermissionDenied: 'Please enable microphone access to use voice features.',
  recordingInProgress: 'Recording... Release to send',
  processing: 'Processing your request...',
  errorGeneric: 'I apologize, sir. I seem to be experiencing technical difficulties.',
  welcome: 'Good day, sir. How may I assist you today?',
};