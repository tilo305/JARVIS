import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database table names (for future use)
export const TABLES = {
  USERS: 'users',
  CHAT_MESSAGES: 'chat_messages',
  SYSTEM_LOGS: 'system_logs',
  USER_SESSIONS: 'user_sessions'
}

// Helper functions for common operations
export const supabaseHelpers = {
  // Authentication helpers
  async signUp(email, password, metadata = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    return { data, error }
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // Chat message helpers (for future chatbot integration)
  async saveChatMessage(userId, message, sender = 'user') {
    const { data, error } = await supabase
      .from(TABLES.CHAT_MESSAGES)
      .insert([
        {
          user_id: userId,
          message: message,
          sender: sender,
          timestamp: new Date().toISOString()
        }
      ])
    return { data, error }
  },

  async getChatHistory(userId, limit = 50) {
    const { data, error } = await supabase
      .from(TABLES.CHAT_MESSAGES)
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit)
    return { data, error }
  },

  // System logs helpers
  async logSystemEvent(eventType, eventData, userId = null) {
    const { data, error } = await supabase
      .from(TABLES.SYSTEM_LOGS)
      .insert([
        {
          event_type: eventType,
          event_data: eventData,
          user_id: userId,
          timestamp: new Date().toISOString()
        }
      ])
    return { data, error }
  }
}

export default supabase

