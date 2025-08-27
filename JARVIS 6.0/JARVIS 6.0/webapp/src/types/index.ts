export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'jarvis';
  timestamp: Date;
  audioUrl?: string;
  isError?: boolean;
}

export interface ChatResponse {
  text: string;
  audioUrl?: string | null;
  audioBase64?: string | null;
  conversationId: string;
  timestamp: string;
  status: 'success' | 'error';
}

export interface VoiceResponse extends ChatResponse {
  transcription?: string;
}

export interface N8nResponse {
  output?: string;
  response?: string;
  text?: string;
  sessionId?: string;
  timestamp?: string;
}

export interface WebhookResponse {
  success: boolean;
  data?: ChatResponse | VoiceResponse;
  error?: string;
}