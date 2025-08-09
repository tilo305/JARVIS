# ElevenLabs Voice Integration Setup

This guide explains how to set up ElevenLabs AI voice synthesis for the JARVIS chatbot.

## 🎯 What is ElevenLabs?

ElevenLabs provides high-quality AI voice synthesis that sounds much more natural than browser speech synthesis. Each AI assistant (JARVIS, FRIDAY, EDITH, KAREN) now has its own unique voice.

## 📋 Prerequisites

1. **ElevenLabs Account**: Sign up at [elevenlabs.io](https://elevenlabs.io/)
2. **API Key**: Get your API key from the ElevenLabs dashboard
3. **Free Credits**: ElevenLabs provides free credits for testing

## 🔧 Setup Instructions

### 1. Get Your API Key

1. Go to [elevenlabs.io](https://elevenlabs.io/) and create an account
2. Navigate to your profile settings
3. Copy your API key

### 2. Configure Environment Variables

Create a `.env` file in your project root:

```bash
# ElevenLabs API Configuration
VITE_ELEVENLABS_API_KEY=your_actual_api_key_here
```

### 3. Voice Assignments

Each AI assistant has been assigned a specific ElevenLabs voice:

- **JARVIS**: Adam (British accent) - `pNInz6obpgDQGcFmaJgB`
- **FRIDAY**: Rachel (American accent) - `21m00Tcm4TlvDq8ikWAM`
- **EDITH**: Domi (American accent) - `AZnzlk1XvdvUeBnXmlld`
- **KAREN**: Bella (British accent) - `EXAVITQu4vr4xnSDxMaL`

## 🚀 Features

### ✅ What's New

- **High-Quality Voices**: Natural-sounding AI voices for each character
- **Voice Sample Button**: Test each character's voice with the purple play button
- **Fallback System**: Automatically falls back to browser speech if ElevenLabs is unavailable
- **Status Indicator**: Shows connection status (ElevenLabs/Browser Speech)
- **Character-Specific Voices**: Each AI assistant has its own unique voice

### 🔄 How It Works

1. **Initialization**: The app tries to connect to ElevenLabs on startup
2. **Voice Synthesis**: When enabled, uses ElevenLabs for high-quality speech
3. **Fallback**: If ElevenLabs fails, automatically uses browser speech synthesis
4. **Status Display**: Shows current voice system status in the chatbot header

## 💰 Pricing

- **Free Tier**: 10,000 characters per month
- **Paid Plans**: Start at $5/month for more characters
- **Character Usage**: Each word spoken consumes characters from your quota

## 🛠️ Troubleshooting

### Common Issues

1. **"ElevenLabs API key not found"**
   - Make sure you've created a `.env` file
   - Check that the API key is correct
   - Restart your development server

2. **"Failed to connect to ElevenLabs API"**
   - Verify your API key is valid
   - Check your internet connection
   - Ensure you have available credits

3. **Voice not playing**
   - Check browser console for errors
   - Verify microphone permissions
   - Try the voice sample button

### Debug Mode

Open browser console (F12) to see:
- ElevenLabs connection status
- Voice synthesis logs
- Error messages

## 🎮 Usage

1. **Test Voices**: Click the purple play button to hear each character's voice
2. **Enable Voice**: The voice will automatically play when you send messages
3. **Switch Characters**: Each character has a unique voice
4. **Monitor Status**: Check the status indicator in the chatbot header

## 🔧 Customization

### Change Voice Assignments

Edit `src/components/JarvisChatbot.jsx` and modify the `voiceId` in the characters object:

```javascript
jarvis: {
  // ... other properties
  voiceId: 'your_preferred_voice_id'
}
```

### Get Available Voices

The service automatically fetches available voices from your ElevenLabs account. Check the browser console for the list of available voices.

## 📝 Notes

- The app gracefully falls back to browser speech if ElevenLabs is unavailable
- Voice synthesis is only active when the voice is enabled
- Each character maintains its unique voice across sessions
- API calls are made only when speech is actually needed

## 🆘 Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your API key is correct
3. Ensure you have available ElevenLabs credits
4. Try refreshing the page to reinitialize the service 