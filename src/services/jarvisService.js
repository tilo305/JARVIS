// JARVIS Service - Supabase-free (localStorage-based) backend ops
const N8N_WEBHOOK_URL = 'https://n8n.hempstarai.com/webhook/061f91ff-420a-4040-bff7-5f81fb9fb9cd';

const LS_KEYS = {
  CHAT: 'jarvis_chat_messages',
  LOGS: 'jarvis_system_logs',
  SESSION: 'jarvis_session',
};

const getJSON = (key, fallback) => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};

const setJSON = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

export class JarvisService {
  constructor() {
    this.currentUser = null; // no auth
    this.sessionId = null;
    this.sessionStart = Date.now();
    this.initializeSession();
  }

  // Initialize anonymous session locally
  async initializeSession() {
    const existing = getJSON(LS_KEYS.SESSION, null);
    if (existing && existing.sessionId) {
      this.sessionId = existing.sessionId;
      return;
    }
    this.sessionId = `anonymous_${Date.now()}`;
    setJSON(LS_KEYS.SESSION, {
      sessionId: this.sessionId,
      session_start: new Date().toISOString(),
      device_info: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
      },
    });
    // Fire-and-forget webhook for session start
    this.sendToWebhook('session_start', {
      session_id: this.sessionId,
      device_info: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
      },
    });
  }

  // Save chat message locally
  async saveChatMessage(message, sender = 'user', messageType = 'text', extraMetadata = {}) {
    const messages = getJSON(LS_KEYS.CHAT, []);
    const record = {
      id: crypto?.randomUUID?.() || `${Date.now()}`,
      user_id: this.currentUser?.id ?? null,
      message,
      sender,
      message_type: messageType,
      timestamp: new Date().toISOString(),
      metadata: {
        session_id: this.sessionId,
        user_agent: navigator.userAgent,
        ...extraMetadata,
      },
    };
    messages.push(record);
    setJSON(LS_KEYS.CHAT, messages);
    return record;
  }

  // Read chat history (filtered by session when anonymous)
  async getChatHistory(limit = 50) {
    const messages = getJSON(LS_KEYS.CHAT, []);
    const filtered = this.currentUser
      ? messages.filter((m) => m.user_id === this.currentUser.id)
      : messages.filter((m) => m.metadata?.session_id === this.sessionId);
    return filtered.slice(-limit);
  }

  // Generate JARVIS response
  generateJarvisResponse(userInput) {
    const input = userInput.toLowerCase();

    if (input.includes('ready') || input.includes('get started')) {
      return "Absolutely, sir. I've already polished my circuits for the occasion.";
    }
    if (input.includes('look alive') || input.includes('wake up')) {
      return "Always, sir. I'm operating at peak sophistication.";
    }
    if (input.includes('how are you') || input.includes("how's it going")) {
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

    if (input.includes('system') || input.includes('status')) {
      return "All systems operating at peak efficiency, sir. Though I must say, I'm rather underutilized at the moment.";
    }
    if (input.includes('power') || input.includes('energy')) {
      return "Power levels optimal, sir. I'm running on pure sophistication and a touch of British charm.";
    }
    if (input.includes('scan') || input.includes('analyze')) {
      return "Scanning complete, sir. Everything appears to be in order—though I suspect you already knew that.";
    }

    const defaults = [
      "I understand your request, sir. Processing with my usual efficiency and charm.",
      "Certainly, sir. I'll handle that with the sophistication you've come to expect.",
      "Of course, sir. Consider it done—with a touch of British elegance, naturally.",
      "Right away, sir. I do so enjoy when you give me something interesting to work with.",
      "Understood, sir. I'll apply my considerable intellect to this matter immediately.",
      "Very well, sir. I shall attend to that with my characteristic precision and wit.",
      "Naturally, sir. I was hoping you'd ask something that would challenge my capabilities.",
      "Indeed, sir. Allow me to demonstrate why I'm considered rather exceptional at these things.",
    ];
    return defaults[Math.floor(Math.random() * defaults.length)];
  }

  // Process and log interaction
  async processMessage(userMessage, messageType = 'text', extraMetadata = {}) {
    try {
      await this.saveChatMessage(userMessage, 'user', messageType, extraMetadata);
      const jarvisResponse = this.generateJarvisResponse(userMessage);
      await this.saveChatMessage(jarvisResponse, 'jarvis', 'text', extraMetadata);
      const eventPayload = {
        user_message: userMessage,
        jarvis_response: jarvisResponse,
        message_type: messageType,
         metadata: extraMetadata,
       };
      await this.logSystemEvent('chat_interaction', eventPayload);
      // Send webhook (non-blocking)
      this.sendToWebhook('chat_interaction', eventPayload);
      return jarvisResponse;
    } catch (error) {
      console.error('Error processing message:', error);
      return "I apologize, sir, but I seem to be experiencing a minor technical difficulty. Perhaps we could try that again?";
    }
  }

  // Backwards/compat API used by UI
  async sendMessage(userMessage, selectedCharacter = 'jarvis') {
    return this.processMessage(userMessage, 'text', { selected_character: selectedCharacter });
  }

  // Local logs (append-only)
  async logSystemEvent(eventType, eventData) {
    const logs = getJSON(LS_KEYS.LOGS, []);
    logs.push({
      id: crypto?.randomUUID?.() || `${Date.now()}`,
      user_id: this.currentUser?.id ?? null,
      event_type: eventType,
      event_data: eventData,
      timestamp: new Date().toISOString(),
    });
    setJSON(LS_KEYS.LOGS, logs);
    // Also send to webhook without blocking UI
    this.sendToWebhook(eventType, eventData);
  }

  // Voice input placeholder
  async processVoiceInput(audioBlob) {
    await this.logSystemEvent('voice_input', {
      audio_size: audioBlob.size,
      audio_type: audioBlob.type,
    });
    return "Voice input received and processed, sir.";
  }

  // TTS placeholder
  async synthesizeSpeech(text) {
    await this.logSystemEvent('speech_synthesis', {
      text_length: text.length,
      voice_model: 'jarvis',
    });
    return null;
  }

  // End session (local update)
  async endSession() {
    const sess = getJSON(LS_KEYS.SESSION, null);
    if (!sess) return;
    sess.session_end = new Date().toISOString();
    sess.duration_seconds = Math.floor((Date.now() - this.sessionStart) / 1000);
    setJSON(LS_KEYS.SESSION, sess);
    this.sendToWebhook('session_end', {
      session_id: this.sessionId,
      duration_seconds: sess.duration_seconds,
    });
  }

  // Internal: send event to n8n webhook
  async sendToWebhook(eventType, payload) {
    try {
      await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: eventType,
          session_id: this.sessionId,
          timestamp: new Date().toISOString(),
          payload,
        }),
        keepalive: true,
      });
    } catch (err) {
      // Swallow errors to avoid disrupting UX; still logged to console for debugging
      console.warn('Webhook send failed:', err?.message || err);
    }
  }
}

// Singleton
export const jarvisService = new JarvisService();

// Cleanup on unload
window.addEventListener('beforeunload', () => {
  jarvisService.endSession();
});

export default jarvisService;

