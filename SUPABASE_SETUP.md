# Supabase Integration Setup

This document provides instructions for setting up Supabase database integration with the JARVIS Iron Man website.

## Prerequisites

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new Supabase project
3. Obtain your project URL and API keys

## Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Update the environment variables in `.env.local`:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

## Database Setup

1. Open your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the SQL commands from `src/lib/database-schema.sql`
4. This will create the necessary tables and security policies

## Database Tables

The schema includes the following tables:

- **users**: Extended user profiles (linked to Supabase auth)
- **chat_messages**: Store chat conversations with JARVIS
- **system_logs**: Track user interactions and system events
- **user_sessions**: Monitor user session data

## Usage

The Supabase client is configured in `src/lib/supabase.js` and includes:

- Authentication helpers
- Chat message management
- System logging functions
- Database query utilities

### Example Usage

```javascript
import { supabase, supabaseHelpers } from './lib/supabase'

// Sign up a new user
const { data, error } = await supabaseHelpers.signUp(
  'user@example.com', 
  'password123',
  { full_name: 'Tony Stark' }
)

// Save a chat message
await supabaseHelpers.saveChatMessage(
  userId, 
  'Hello JARVIS!', 
  'user'
)

// Get chat history
const { data: messages } = await supabaseHelpers.getChatHistory(userId)
```

## Security

- Row Level Security (RLS) is enabled on all tables
- Users can only access their own data
- Authentication is required for all database operations
- API keys should never be exposed in client-side code

## Integration with n8n

When integrating with n8n workflows:

1. Use the service role key for server-side operations
2. Set up webhooks for real-time chat responses
3. Configure n8n to handle JARVIS AI responses
4. Implement proper error handling and logging

## Deployment Notes

- Environment variables must be set in your deployment platform
- Ensure Supabase project is in the same region as your deployment
- Configure CORS settings in Supabase for your domain
- Set up proper backup and monitoring for production use

