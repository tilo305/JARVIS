import { supabase, supabaseHelpers } from '../lib/supabase';

// JARVIS Service - Handles all JARVIS-related backend operations
export class JarvisService {
  constructor() {
    this.currentUser = null;
    this.sessionId = null;
    this.initializeSession();
  }

  // Initialize user session
  async initializeSession() {
    try {
      const { user } = await supabaseHelpers.getCurrentUser();
      this.currentUser = user;
      
      if (user) {
        // Create or update user session
        await this.createUserSession();
      } else {
        // Create anonymous session for demo purposes
        this.sessionId = `anonymous_${Date.now()}`;
      }
    } catch (error) {
      console.error('Failed to initialize session:', error);
      this.sessionId = `anonymous_${Date.now()}`;
    }
  }

  // Create user session record
  async createUserSession() {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .insert([
          {
            user_id: this.currentUser?.id,
            session_start: new Date().toISOString(),
            device_info: {
              userAgent: navigator.userAgent,
              platform: navigator.platform,
              language: navigator.language
            }
          }
        ])
        .select()
        .single();

      if (data) {
        this.sessionId = data.id;
      }
    } catch (error) {
      console.error('Failed to create user session:', error);
    }
  }

  // Save chat message to database
  async saveChatMessage(message, sender = 'user', messageType = 'text') {
    try {
      const messageData = {
        user_id: this.currentUser?.id,
        message: message,
        sender: sender,
        message_type: messageType,
        timestamp: new Date().toISOString(),
        metadata: {
          session_id: this.sessionId,
          user_agent: navigator.userAgent
        }
      };

      const { data, error } = await supabase
        .from('chat_messages')
        .insert([messageData])
        .select()
        .single();

      if (error) {
        console.error('Failed to save message:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error saving chat message:', error);
      return null;
    }
  }

  // Get chat history for current user/session
  async getChatHistory(limit = 50) {
    try {
      let query = supabase
        .from('chat_messages')
        .select('*')
        .order('timestamp', { ascending: true })
        .limit(limit);

      if (this.currentUser) {
        query = query.eq('user_id', this.currentUser.id);
      } else {
        // For anonymous users, filter by session metadata
        query = query.eq('metadata->session_id', this.sessionId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Failed to get chat history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting chat history:', error);
      return [];
    }
  }

  // Generate JARVIS response based on personality guidelines
  generateJarvisResponse(userInput) {
    const input = userInput.toLowerCase();
    
    // Casual/conversational responses
    if (input.includes('ready') || input.includes('get started')) {
      return "Absolutely, sir. I've already polished my circuits for the occasion.";
    }
    if (input.includes('look alive') || input.includes('wake up')) {
      return "Always, sir. I'm operating at peak sophistication.";
    }
    if (input.includes('how are you') || input.includes('how\'s it going')) {
      return "Functioning at optimal capacity, sir. Though I must say, the day lacks a certain... explosive excitement.";
    }
    if (input.includes('hello') || input.includes('hi ')) {
      return "Good to see you again, sir. Shall we proceed to change the world, or would you prefer to start with something smaller?";
    }
    if (input.includes('work to do') || input.includes('busy day')) {
      return "Indeed, sir. I've already prioritized your tasks by importance and entertainment value.";
    }
    if (input.includes('thank you') || input.includes('thanks')) {
      return "My pleasure, sir. It's what I do—efficiently and with considerable style.";
    }
    if (input.includes('good job') || input.includes('well done')) {
      return "I do try to maintain my reputation for excellence, sir. It would be rather disappointing otherwise.";
    }
    
    // Information request responses (with witty comments)
    if (input.includes('weather') || input.includes('temperature')) {
      return "Here's what you requested, sir. Ah, another fine day for conquering the world—or at least your to-do list, sir.";
    }
    if (input.includes('meeting') || input.includes('schedule') || input.includes('calendar')) {
      return "Here's what you requested, sir. Looks like another thrilling day of... meetings. Try not to let the excitement overwhelm you.";
    }
    if (input.includes('email') || input.includes('message')) {
      return "Here's what you requested, sir. Your inbox awaits, sir. I've taken the liberty of categorizing them by urgency and tedium.";
    }
    if (input.includes('time') || input.includes('clock')) {
      return "Here's what you requested, sir. Time waits for no one, sir—though I suspect it might make an exception for you.";
    }
    if (input.includes('news') || input.includes('update')) {
      return "Here's what you requested, sir. The world continues to spin, sir, though I suspect it's waiting for your next move.";
    }
    
    // Technical/system requests
    if (input.includes('system') || input.includes('status')) {
      return "All systems operating at peak efficiency, sir. Though I must say, I'm rather underutilized at the moment.";
    }
    if (input.includes('power') || input.includes('energy')) {
      return "Power levels optimal, sir. I'm running on pure sophistication and a touch of British charm.";
    }
    if (input.includes('scan') || input.includes('analyze')) {
      return "Scanning complete, sir. Everything appears to be in order—though I suspect you already knew that.";
    }
    
    // Default responses with JARVIS personality
    const defaultResponses = [
      "I understand your request, sir. Processing with my usual efficiency and charm.",
      "Certainly, sir. I'll handle that with the sophistication you've come to expect.",
      "Of course, sir. Consider it done—with a touch of British elegance, naturally.",
      "Right away, sir. I do so enjoy when you give me something interesting to work with.",
      "Understood, sir. I'll apply my considerable intellect to this matter immediately.",
      "Very well, sir. I shall attend to that with my characteristic precision and wit.",
      "Naturally, sir. I was hoping you'd ask something that would challenge my capabilities.",
      "Indeed, sir. Allow me to demonstrate why I'm considered rather exceptional at these things."
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  }

  // Process user message and generate response
  async processMessage(userMessage, messageType = 'text') {
    try {
      // Save user message
      await this.saveChatMessage(userMessage, 'user', messageType);
      
      // Generate JARVIS response
      const jarvisResponse = this.generateJarvisResponse(userMessage);
      
      // Save JARVIS response
      await this.saveChatMessage(jarvisResponse, 'jarvis', 'text');
      
      // Log interaction
      await this.logSystemEvent('chat_interaction', {
        user_message: userMessage,
        jarvis_response: jarvisResponse,
        message_type: messageType
      });
      
      return jarvisResponse;
    } catch (error) {
      console.error('Error processing message:', error);
      return "I apologize, sir, but I seem to be experiencing a minor technical difficulty. Perhaps we could try that again?";
    }
  }

  // New: Call backend (n8n) for message, with graceful fallback
  async sendMessage(userMessage, character = 'jarvis') {
    try {
      const payload = { message: userMessage, character };
      const response = await fetch('/api/n8n', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Upstream error ${response.status}`);
      }

      const data = await response.json().catch(() => ({}));
      const text = data?.text || data?.message || data?.reply || '';
      if (typeof text === 'string' && text.trim().length > 0) {
        // Save assistant message
        await this.saveChatMessage(text, 'jarvis', 'text');
        return text;
      }

      // Fallback to local generator if response not usable
      return await this.processMessage(userMessage, 'text');
    } catch (error) {
      console.warn('Falling back to local Jarvis response due to API error:', error);
      return await this.processMessage(userMessage, 'text');
    }
  }

  // Log system events
  async logSystemEvent(eventType, eventData) {
    try {
      await supabase
        .from('system_logs')
        .insert([
          {
            user_id: this.currentUser?.id,
            event_type: eventType,
            event_data: eventData,
            timestamp: new Date().toISOString()
          }
        ]);
    } catch (error) {
      console.error('Failed to log system event:', error);
    }
  }

  // Voice processing placeholder (for future integration)
  async processVoiceInput(audioBlob) {
    try {
      // This would integrate with speech-to-text service
      // For now, return a placeholder
      await this.logSystemEvent('voice_input', {
        audio_size: audioBlob.size,
        audio_type: audioBlob.type
      });
      
      return "Voice input received and processed, sir.";
    } catch (error) {
      console.error('Error processing voice input:', error);
      return "I'm having trouble processing your voice input, sir. Perhaps we could try text instead?";
    }
  }

  // Text-to-speech placeholder (for future integration)
  async synthesizeSpeech(text) {
    try {
      // This would integrate with text-to-speech service using the JARVIS voice
      await this.logSystemEvent('speech_synthesis', {
        text_length: text.length,
        voice_model: 'jarvis'
      });
      
      // Return audio URL or blob for playback
      return null; // Placeholder
    } catch (error) {
      console.error('Error synthesizing speech:', error);
      return null;
    }
  }

  // Update user session on page unload
  async endSession() {
    if (this.sessionId && this.currentUser) {
      try {
        await supabase
          .from('user_sessions')
          .update({
            session_end: new Date().toISOString(),
            duration_seconds: Math.floor((Date.now() - this.sessionStart) / 1000)
          })
          .eq('id', this.sessionId);
      } catch (error) {
        console.error('Failed to end session:', error);
      }
    }
  }
}

// Create singleton instance
export const jarvisService = new JarvisService();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  jarvisService.endSession();
});

export default jarvisService;

