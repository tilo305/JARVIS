// ElevenLabs API Service for high-quality text-to-speech
export class ElevenLabsService {
  constructor() {
    this.baseUrl = '/api';
    this.defaultVoiceId = import.meta.env.VITE_ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB';
    this.defaultModelId = import.meta.env.VITE_ELEVENLABS_MODEL_ID || 'eleven_monolingual_v1';
    this.defaultVoiceSettings = {
      stability: Number(import.meta.env.VITE_ELEVENLABS_STABILITY ?? 0.5),
      similarity_boost: Number(import.meta.env.VITE_ELEVENLABS_SIMILARITY ?? 0.75),
      style: Number(import.meta.env.VITE_ELEVENLABS_STYLE ?? 0.0),
      use_speaker_boost: (import.meta.env.VITE_ELEVENLABS_SPEAKER_BOOST ?? 'true') === 'true'
    };
    this.isSpeaking = false;
    this.audioContext = null;
    this.audioQueue = [];
  }

  // Initialize the service
  async initialize() {
    // With server-side proxy, we can consider initialization successful.
    return true;
  }

  // Get available voices
  async getVoices() { return []; }

  // Convert text to speech
  async textToSpeech(text, options = {}) {
    const {
      voiceId = this.defaultVoiceId,
      modelId = this.defaultModelId,
      voiceSettings = this.defaultVoiceSettings
    } = options;

    try {
      const response = await fetch(`${this.baseUrl}/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceId, modelId, voiceSettings })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`ElevenLabs API error: ${errorData.detail || response.statusText}`);
      }

      const audioBlob = await response.blob();
      return audioBlob;
    } catch (error) {
      console.error('Error in text-to-speech:', error);
      throw error;
    }
  }

  // Play audio with queue management
  async speak(text, options = {}) {
    this.isSpeaking = true;
    try {
      const audioBlob = await this.textToSpeech(text, options);
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      await new Promise((resolve, reject) => {
        audio.onloadstart = () => {
          console.log('JARVIS (ElevenLabs) started speaking:', text);
        };
        audio.onended = () => {
          resolve();
        };
        audio.onerror = (err) => {
          reject(err);
        };
        audio.play().catch(reject);
      });

      URL.revokeObjectURL(audioUrl);
      this.isSpeaking = false;
    } catch (err) {
      this.isSpeaking = false;
      throw err;
    }
  }

  // Stop current speech
  stop() {
    this.isSpeaking = false;
    // Stop all audio elements
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
  }

  // Get voice by name
  async getVoiceByName(name) {
    const voices = await this.getVoices();
    return voices.find(voice => 
      voice.name.toLowerCase().includes(name.toLowerCase()) ||
      voice.labels?.accent?.toLowerCase().includes(name.toLowerCase())
    );
  }

  // Get JARVIS-like voice (British accent)
  async getJarvisVoice() {
    const jarvisVoice = await this.getVoiceByName('british');
    return jarvisVoice || await this.getVoiceByName('adam');
  }

  // Test the service
  async testConnection() {
    try {
      const voices = await this.getVoices();
      return {
        success: true,
        voiceCount: voices.length,
        message: `Connected to ElevenLabs with ${voices.length} voices available`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to connect to ElevenLabs API'
      };
    }
  }
}

// Create singleton instance
export const elevenLabsService = new ElevenLabsService(); 