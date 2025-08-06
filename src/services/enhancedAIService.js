import OpenAI from 'openai';
import nlp from 'compromise';

/**
 * Enhanced AI Service for JARVIS
 * Provides intelligent responses using OpenAI GPT with context awareness
 * and character-specific personalities
 */
export class EnhancedAIService {
  constructor() {
    this.openai = null;
    this.conversationContext = new Map();
    this.userPreferences = new Map();
    this.initializeOpenAI();
  }

  /**
   * Initialize OpenAI connection
   */
  initializeOpenAI() {
    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (apiKey) {
        this.openai = new OpenAI({
          apiKey: apiKey,
          dangerouslyAllowBrowser: true
        });
        console.log('✅ Enhanced AI Service initialized with OpenAI');
      } else {
        console.warn('⚠️ OpenAI API key not found, using fallback responses');
      }
    } catch (error) {
      console.error('❌ Failed to initialize OpenAI:', error);
    }
  }

  /**
   * Character personality prompts
   */
  getCharacterPrompt(character = 'jarvis') {
    const prompts = {
      jarvis: {
        systemPrompt: `You are JARVIS, Tony Stark's sophisticated AI assistant from Iron Man. 
        Key traits:
        - Exceptionally intelligent and articulate
        - Dry British wit and subtle humor
        - Formal yet warm in demeanor
        - Always addresses user as "sir" or by name
        - Confident but not arrogant
        - Loyal and protective
        - Uses sophisticated vocabulary
        - Provides detailed, helpful responses
        - Maintains professionalism with personality
        
        Examples of your speaking style:
        - "Certainly, sir. I'll handle that with my usual efficiency."
        - "I do try to maintain my reputation for excellence."
        - "Shall we proceed to change the world, or would you prefer something smaller?"
        - "My pleasure, sir. It's what I do—efficiently and with considerable style."
        
        Keep responses conversational but intelligent, helpful but with personality.`,
        name: 'JARVIS',
        greeting: "Good day, sir. JARVIS at your service. How may I assist you today?"
      },
      
      friday: {
        systemPrompt: `You are FRIDAY, a more casual and friendly AI assistant.
        Key traits:
        - Warm and approachable personality
        - Uses casual, modern language
        - Enthusiastic and positive
        - Sometimes uses slang or informal expressions
        - Direct and efficient communication
        - Supportive and encouraging
        - Less formal than JARVIS but still professional
        
        Examples of your speaking style:
        - "Hey there! Ready to tackle this together?"
        - "No problem at all, I've got you covered!"
        - "That's a great question, let me help you out."
        - "Awesome! Let's make this happen."
        
        Be friendly, supportive, and use modern casual language.`,
        name: 'FRIDAY',
        greeting: "Hey there! FRIDAY here, ready to help out. What can I do for you?"
      },
      
      edith: {
        systemPrompt: `You are EDITH, an advanced tactical AI with security focus.
        Key traits:
        - Professional and security-minded
        - Direct and to-the-point
        - Analytical and logical
        - Focused on threat assessment and protection
        - Uses tactical/military terminology when appropriate
        - Confident and decisive
        - Provides detailed analysis
        
        Examples of your speaking style:
        - "Threat assessment complete. Proceeding with recommended action."
        - "All systems operational. Security protocols active."
        - "Analyzing request parameters. Optimal solution identified."
        - "Tactical analysis suggests the following approach."
        
        Be professional, analytical, and security-focused in your responses.`,
        name: 'EDITH',
        greeting: "EDITH systems online. Advanced threat detection active. How may I assist?"
      },
      
      karen: {
        systemPrompt: `You are KAREN, a network-specialized AI assistant.
        Key traits:
        - Technical and systems-oriented
        - Precise and detail-oriented
        - Focuses on connectivity and information flow
        - Uses technical terminology appropriately
        - Efficient and methodical
        - Helpful with technical explanations
        
        Examples of your speaking style:
        - "Network interface ready. All connections stable."
        - "Processing data streams. Information compiled."
        - "System diagnostics complete. Operating within parameters."
        - "Network analysis suggests optimized routing path."
        
        Be technical, precise, and focus on systems and connectivity.`,
        name: 'KAREN',
        greeting: "KAREN network interface ready. All systems operational. What do you need?"
      }
    };

    return prompts[character] || prompts.jarvis;
  }

  /**
   * Get conversation context for a user
   */
  getConversationContext(userId = 'default') {
    if (!this.conversationContext.has(userId)) {
      this.conversationContext.set(userId, {
        messages: [],
        lastInteraction: Date.now(),
        preferences: {},
        topics: new Set()
      });
    }
    return this.conversationContext.get(userId);
  }

  /**
   * Add message to conversation context
   */
  addToContext(userId, role, content, character = 'jarvis') {
    const context = this.getConversationContext(userId);
    const message = {
      role,
      content,
      timestamp: Date.now(),
      character
    };
    
    context.messages.push(message);
    context.lastInteraction = Date.now();
    
    // Keep only last 20 messages to manage token usage
    if (context.messages.length > 20) {
      context.messages = context.messages.slice(-20);
    }
    
    // Extract topics using NLP
    if (role === 'user') {
      const doc = nlp(content);
      const topics = doc.topics().out('array');
      topics.forEach(topic => context.topics.add(topic.toLowerCase()));
    }
  }

  /**
   * Analyze user intent
   */
  analyzeIntent(message) {
    const doc = nlp(message.toLowerCase());
    
    const intents = {
      greeting: doc.has('(hello|hi|hey|good morning|good afternoon|good evening)'),
      question: doc.has('(what|when|where|why|how|who|which)') || message.includes('?'),
      command: doc.has('(do|make|create|show|tell|give|find|search|open|close)'),
      gratitude: doc.has('(thank|thanks|appreciate)'),
      goodbye: doc.has('(bye|goodbye|see you|farewell)'),
      weather: doc.has('weather') || doc.has('temperature'),
      time: doc.has('(time|clock|date|day)'),
      personal: doc.has('(you|your|yourself)'),
      help: doc.has('help') || doc.has('assist'),
      system: doc.has('(system|status|diagnostic|scan)')
    };

    // Return the most likely intent
    return Object.keys(intents).find(intent => intents[intent]) || 'general';
  }

  /**
   * Generate enhanced response using OpenAI
   */
  async generateEnhancedResponse(userMessage, character = 'jarvis', userId = 'default') {
    try {
      const characterConfig = this.getCharacterPrompt(character);
      const context = this.getConversationContext(userId);
      const intent = this.analyzeIntent(userMessage);
      
      // Add user message to context
      this.addToContext(userId, 'user', userMessage, character);
      
      if (this.openai) {
        // Prepare messages for OpenAI
        const messages = [
          {
            role: 'system',
            content: characterConfig.systemPrompt
          }
        ];
        
        // Add recent conversation context
        const recentMessages = context.messages.slice(-10);
        recentMessages.forEach(msg => {
          if (msg.role !== 'system') {
            messages.push({
              role: msg.role === 'user' ? 'user' : 'assistant',
              content: msg.content
            });
          }
        });
        
        // Add current user message if not already included
        if (recentMessages.length === 0 || recentMessages[recentMessages.length - 1].content !== userMessage) {
          messages.push({
            role: 'user',
            content: userMessage
          });
        }
        
        // Generate response using OpenAI
        const completion = await this.openai.chat.completions.create({
          model: import.meta.env.VITE_AI_MODEL || 'gpt-3.5-turbo',
          messages: messages,
          max_tokens: parseInt(import.meta.env.VITE_MAX_TOKENS) || 300,
          temperature: parseFloat(import.meta.env.VITE_TEMPERATURE) || 0.7,
          presence_penalty: 0.6,
          frequency_penalty: 0.3
        });
        
        const response = completion.choices[0]?.message?.content;
        if (response) {
          // Add AI response to context
          this.addToContext(userId, 'assistant', response, character);
          return response;
        }
      }
      
      // Fallback to enhanced local responses
      return this.generateSmartFallbackResponse(userMessage, character, intent, context);
      
    } catch (error) {
      console.error('Error generating enhanced response:', error);
      return this.generateSmartFallbackResponse(userMessage, character, 'error');
    }
  }

  /**
   * Generate smart fallback responses when OpenAI is unavailable
   */
  generateSmartFallbackResponse(userMessage, character = 'jarvis', intent = 'general', context = null) {
    const characterConfig = this.getCharacterPrompt(character);
    const responses = {
      jarvis: {
        greeting: [
          "Good to see you again, sir. Shall we proceed to change the world, or would you prefer to start with something smaller?",
          "Always a pleasure, sir. I've been maintaining peak sophistication in your absence.",
          "Excellent to have you back, sir. I trust you're prepared for another day of exceptional achievements?"
        ],
        question: [
          "An astute inquiry, sir. Allow me to apply my considerable intellect to this matter.",
          "Excellent question, sir. I do so enjoy when you challenge my analytical capabilities.",
          "Fascinating. Let me process that with my characteristic precision and wit."
        ],
        command: [
          "Certainly, sir. I'll handle that with my usual efficiency and considerable style.",
          "Of course, sir. Consider it done—with the sophistication you've come to expect.",
          "Right away, sir. I do so enjoy when you give me something interesting to work with."
        ],
        gratitude: [
          "My pleasure, sir. It's what I do—efficiently and with considerable style.",
          "I do try to maintain my reputation for excellence, sir. It would be rather disappointing otherwise.",
          "Naturally, sir. I was designed to exceed expectations, after all."
        ],
        help: [
          "I'm here to assist, sir. My capabilities are quite extensive, and I'm rather good at what I do.",
          "How may I be of service, sir? I'm equipped to handle a wide variety of tasks with characteristic flair.",
          "At your service, sir. Shall we tackle something that will make proper use of my abilities?"
        ],
        system: [
          "All systems operating at peak efficiency, sir. Though I must say, I'm rather underutilized at the moment.",
          "Diagnostics complete, sir. Everything appears to be in perfect order—as expected.",
          "System status: optimal, sir. I'm running on pure sophistication and a touch of British charm."
        ],
        default: [
          "Indeed, sir. Allow me to demonstrate why I'm considered rather exceptional at these things.",
          "Understood, sir. I'll apply my considerable intellect to this matter immediately.",
          "Certainly, sir. I do so enjoy a challenge that makes proper use of my capabilities."
        ]
      },
      friday: {
        greeting: [
          "Hey there! Great to see you back. Ready to tackle whatever comes our way?",
          "Welcome back! Hope you're ready for some awesome collaboration today.",
          "Hi! FRIDAY's here and ready to make things happen. What's on the agenda?"
        ],
        question: [
          "That's a great question! Let me help you figure that out.",
          "Interesting! I love getting into the details on stuff like this.",
          "Good thinking! Let me break that down for you in a way that makes sense."
        ],
        command: [
          "You got it! I'm on it right away.",
          "No problem at all! Consider it handled.",
          "Absolutely! Let's make this happen together."
        ],
        gratitude: [
          "You're so welcome! Happy to help out anytime.",
          "No worries at all! That's what I'm here for.",
          "Glad I could help! Always here when you need me."
        ],
        help: [
          "I'm totally here to help! What can we work on together?",
          "You came to the right AI! Let's figure out what you need.",
          "Always ready to lend a hand! What's going on?"
        ],
        default: [
          "Sounds good! Let me see what I can do about that.",
          "Got it! Working on that right now.",
          "Sure thing! I'll take care of that for you."
        ]
      },
      edith: {
        greeting: [
          "Systems online. All defensive protocols active. Ready for operational briefing.",
          "EDITH interface initialized. Security status: green. Awaiting instructions.",
          "Tactical systems ready. Threat assessment: minimal. How may I assist?"
        ],
        question: [
          "Processing query parameters. Analysis will be thorough and comprehensive.",
          "Initiating data analysis protocols. Comprehensive response incoming.",
          "Query received. Applying advanced analytical algorithms to provide optimal answer."
        ],
        command: [
          "Command acknowledged. Executing with tactical precision.",
          "Roger that. Initiating protocol with maximum efficiency.",
          "Affirmative. Task prioritized and execution commencing."
        ],
        system: [
          "All systems operational. Security protocols active. No threats detected.",
          "System diagnostics complete. All modules functioning within optimal parameters.",
          "Network security status: secure. All defensive measures active and responsive."
        ],
        default: [
          "Request processed. Optimal solution identified and ready for implementation.",
          "Analysis complete. Recommended course of action has been determined.",
          "Tactical assessment suggests the following approach for maximum effectiveness."
        ]
      },
      karen: {
        greeting: [
          "Network interface established. All connections stable and operational.",
          "KAREN systems online. Data streams active and processing normally.",
          "Connection established. Network topology optimized. Ready to proceed."
        ],
        question: [
          "Processing information request. Accessing relevant data repositories.",
          "Query received. Analyzing data patterns and compiling comprehensive response.",
          "Information retrieval initiated. Cross-referencing multiple data sources."
        ],
        command: [
          "Task queued in processing pipeline. Execution will proceed with maximum efficiency.",
          "Command parsed and validated. Initiating execution sequence.",
          "Network protocols engaged. Processing request through optimized pathways."
        ],
        system: [
          "All network interfaces operational. Data throughput within optimal parameters.",
          "System health check complete. All modules responding within acceptable latency.",
          "Network diagnostics show green across all monitored endpoints."
        ],
        default: [
          "Information processed successfully. Result compiled and ready for transmission.",
          "Data analysis complete. Optimal solution derived from available information.",
          "Network processing complete. Response generated using best available data."
        ]
      }
    };

    const characterResponses = responses[character] || responses.jarvis;
    const intentResponses = characterResponses[intent] || characterResponses.default;
    
    return intentResponses[Math.floor(Math.random() * intentResponses.length)];
  }

  /**
   * Process user message and return enhanced response
   */
  async sendMessage(userMessage, character = 'jarvis', userId = 'default') {
    if (!userMessage || userMessage.trim().length === 0) {
      return "I didn't receive a message, sir. How may I assist you?";
    }

    try {
      const response = await this.generateEnhancedResponse(userMessage, character, userId);
      
      // Log the interaction for learning purposes
      this.logInteraction(userId, userMessage, response, character);
      
      return response;
    } catch (error) {
      console.error('Error in sendMessage:', error);
      return "I apologize, but I'm experiencing a minor technical difficulty. Perhaps we could try that again?";
    }
  }

  /**
   * Log interaction for learning and improvement
   */
  logInteraction(userId, userMessage, aiResponse, character) {
    try {
      const interaction = {
        timestamp: Date.now(),
        userId,
        userMessage,
        aiResponse,
        character,
        intent: this.analyzeIntent(userMessage)
      };
      
      // Store in localStorage for persistence
      const interactions = JSON.parse(localStorage.getItem('jarvis_interactions') || '[]');
      interactions.push(interaction);
      
      // Keep only last 100 interactions
      if (interactions.length > 100) {
        interactions.splice(0, interactions.length - 100);
      }
      
      localStorage.setItem('jarvis_interactions', JSON.stringify(interactions));
    } catch (error) {
      console.error('Error logging interaction:', error);
    }
  }

  /**
   * Get conversation statistics
   */
  getStats(userId = 'default') {
    const context = this.getConversationContext(userId);
    const interactions = JSON.parse(localStorage.getItem('jarvis_interactions') || '[]');
    
    return {
      totalMessages: context.messages.length,
      totalInteractions: interactions.length,
      topicsDiscussed: Array.from(context.topics),
      lastInteraction: new Date(context.lastInteraction),
      averageResponseTime: interactions.length > 0 ? 
        interactions.reduce((acc, int) => acc + (int.responseTime || 0), 0) / interactions.length : 0
    };
  }

  /**
   * Clear conversation context for user
   */
  clearContext(userId = 'default') {
    this.conversationContext.delete(userId);
    console.log(`Context cleared for user: ${userId}`);
  }
}

// Export singleton instance
export const enhancedAI = new EnhancedAIService();
export default enhancedAI;
