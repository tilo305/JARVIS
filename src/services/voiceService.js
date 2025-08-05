import jarvisVoiceMP3 from '../assets/jarvis-voice.mp3';

// Voice Service - Handles speech recognition and synthesis
export class VoiceService {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.isListening = false;
    this.isSpeaking = false;
    this.jarvisVoice = null;
    this.audioContext = null;
    this.jarvisAudioBuffer = null;
    
    this.initializeSpeechRecognition();
    this.initializeTextToSpeech();
    this.loadJarvisVoice();
  }

  // Initialize Web Speech API for speech recognition
  initializeSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
      this.recognition.maxAlternatives = 1;
      
      this.recognition.onstart = () => {
        this.isListening = true;
        console.log('Voice recognition started');
      };
      
      this.recognition.onend = () => {
        this.isListening = false;
        console.log('Voice recognition ended');
      };
      
      this.recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        this.isListening = false;
      };
    } else {
      console.warn('Speech recognition not supported in this browser');
    }
  }

  // Initialize Text-to-Speech
  initializeTextToSpeech() {
    if ('speechSynthesis' in window) {
      // Wait for voices to load
      const loadVoices = () => {
        const voices = this.synthesis.getVoices();
        // Try to find a British accent voice for JARVIS
        this.jarvisVoice = voices.find(voice => 
          voice.lang.includes('en-GB') || 
          voice.name.toLowerCase().includes('british') ||
          voice.name.toLowerCase().includes('daniel') ||
          voice.name.toLowerCase().includes('oliver')
        ) || voices.find(voice => voice.lang.includes('en-US')) || voices[0];
        
        console.log('Selected JARVIS voice:', this.jarvisVoice?.name);
      };

      if (this.synthesis.getVoices().length > 0) {
        loadVoices();
      } else {
        this.synthesis.addEventListener('voiceschanged', loadVoices);
      }
    } else {
      console.warn('Speech synthesis not supported in this browser');
    }
  }

  // Load JARVIS voice audio for reference
  async loadJarvisVoice() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      const response = await fetch(jarvisVoiceMP3);
      const arrayBuffer = await response.arrayBuffer();
      this.jarvisAudioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      console.log('JARVIS voice audio loaded successfully');
    } catch (error) {
      console.error('Failed to load JARVIS voice audio:', error);
    }
  }

  // Start speech recognition
  startListening() {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      if (this.isListening) {
        reject(new Error('Already listening'));
        return;
      }

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const confidence = event.results[0][0].confidence;
        
        console.log('Speech recognized:', transcript, 'Confidence:', confidence);
        resolve({
          transcript: transcript.trim(),
          confidence: confidence
        });
      };

      this.recognition.onerror = (event) => {
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      try {
        this.recognition.start();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Stop speech recognition
  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  // Speak text using JARVIS-like voice
  speak(text, options = {}) {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Cancel any ongoing speech
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configure JARVIS voice characteristics
      utterance.voice = this.jarvisVoice;
      utterance.rate = options.rate || 0.9; // Slightly slower for sophistication
      utterance.pitch = options.pitch || 0.8; // Lower pitch for authority
      utterance.volume = options.volume || 0.8;
      
      utterance.onstart = () => {
        this.isSpeaking = true;
        console.log('JARVIS started speaking:', text);
      };
      
      utterance.onend = () => {
        this.isSpeaking = false;
        console.log('JARVIS finished speaking');
        resolve();
      };
      
      utterance.onerror = (event) => {
        this.isSpeaking = false;
        console.error('Speech synthesis error:', event.error);
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      try {
        this.synthesis.speak(utterance);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Stop speaking
  stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.isSpeaking = false;
    }
  }

  // Play JARVIS voice sample
  playJarvisVoiceSample() {
    if (this.audioContext && this.jarvisAudioBuffer) {
      const source = this.audioContext.createBufferSource();
      source.buffer = this.jarvisAudioBuffer;
      source.connect(this.audioContext.destination);
      source.start(0);
      
      console.log('Playing JARVIS voice sample');
      return true;
    }
    return false;
  }

  // Check if voice features are supported
  isVoiceSupported() {
    return {
      speechRecognition: !!this.recognition,
      speechSynthesis: !!this.synthesis,
      audioContext: !!(window.AudioContext || window.webkitAudioContext)
    };
  }

  // Get current status
  getStatus() {
    return {
      isListening: this.isListening,
      isSpeaking: this.isSpeaking,
      hasJarvisVoice: !!this.jarvisVoice,
      hasJarvisAudio: !!this.jarvisAudioBuffer,
      support: this.isVoiceSupported()
    };
  }

  // Process voice command with JARVIS personality
  processVoiceCommand(transcript) {
    // Add voice-specific processing here
    // For now, return the transcript for text processing
    return {
      command: transcript,
      type: 'voice',
      confidence: 1.0
    };
  }

  // Enhanced speak method with JARVIS characteristics
  async speakAsJarvis(text, options = {}) {
    try {
      // Add JARVIS-specific speech patterns
      const processedText = this.addJarvisSpeechPatterns(text);
      
      await this.speak(processedText, {
        rate: 0.85, // Measured pace
        pitch: 0.75, // Authoritative tone
        volume: 0.9,
        ...options
      });
    } catch (error) {
      console.error('Failed to speak as JARVIS:', error);
      throw error;
    }
  }

  // Add JARVIS speech patterns and emphasis
  addJarvisSpeechPatterns(text) {
    // Add pauses and emphasis for JARVIS-like delivery
    let processedText = text;
    
    // Add slight pause after "sir"
    processedText = processedText.replace(/sir[,.]?/gi, 'sir...');
    
    // Add emphasis to certain words
    processedText = processedText.replace(/\b(certainly|absolutely|indeed|naturally)\b/gi, '$1...');
    
    // Add pause before witty remarks
    processedText = processedText.replace(/—/g, '... ');
    
    return processedText;
  }
}

// Create singleton instance
export const voiceService = new VoiceService();

export default voiceService;

