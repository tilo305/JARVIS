import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());
app.use(express.static('dist'));

app.post('/api/tts', async (req, res) => {
  try {
    console.log('📥 Received TTS request:', JSON.stringify(req.body, null, 2));
    
    const { text, model_id = 'eleven_turbo_v2_5', voice_settings } = req.body;
    
    if (!text) {
      console.log('❌ No text provided');
      return res.status(400).json({ error: 'Text is required' });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = process.env.VITE_ELEVENLABS_VOICE_ID || 'MDVSvwVsP5rjXJ2po49l';

    console.log('🔑 Using API Key:', apiKey ? 'Present' : 'Missing');
    console.log('🎤 Using Voice ID:', voiceId);

    if (!apiKey) {
      console.log('❌ API key missing');
      return res.status(500).json({ error: 'ElevenLabs API key not configured' });
    }

    const defaultVoiceSettings = {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0.0,
      use_speaker_boost: true
    };

    const finalSettings = voice_settings || defaultVoiceSettings;
    console.log('🎛️ Voice settings:', JSON.stringify(finalSettings, null, 2));

    const requestBody = {
      text: text,
      model_id: model_id,
      voice_settings: finalSettings
    };

    console.log('📤 Sending to ElevenLabs:', JSON.stringify(requestBody, null, 2));

    const url = 'https://api.elevenlabs.io/v1/text-to-speech/' + voiceId;
    const ttsResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📥 ElevenLabs response status:', ttsResponse.status);

    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text();
      console.error('❌ ElevenLabs API Error:', errorText);
      return res.status(500).json({ error: 'TTS generation failed', details: errorText });
    }

    const audioBuffer = await ttsResponse.arrayBuffer();
    console.log('✅ Audio generated, size:', audioBuffer.byteLength, 'bytes');
    
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.byteLength
    });
    
    res.send(Buffer.from(audioBuffer));
    console.log('✅ TTS audio sent successfully');

  } catch (error) {
    console.error('❌ TTS Error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log('🚀 JARVIS Server running on http://localhost:' + port);
  console.log('🔑 API Key:', process.env.ELEVENLABS_API_KEY ? 'Configured' : 'Missing');
  console.log('🎤 Voice ID:', process.env.VITE_ELEVENLABS_VOICE_ID || 'Using default');
});
