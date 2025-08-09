import express from 'express';
import path from 'path';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for development
}));

// Enable CORS for development
app.use(cors());

// Compression middleware
app.use(compression());

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the dist directory (built React app)
app.use(express.static(path.join(__dirname, 'dist')));

// API routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ElevenLabs TTS proxy (server-side key)
app.post('/api/tts', async (req, res) => {
  try {
    const elevenKey = process.env.ELEVENLABS_API_KEY;
    if (!elevenKey) return res.status(500).json({ error: 'Server TTS not configured: ELEVENLABS_API_KEY missing' });

    const { text, voiceId, modelId, voiceSettings } = req.body || {};
    if (!text) return res.status(400).json({ error: 'Missing text' });

    const resolvedVoiceId = voiceId || process.env.ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB';
    const resolvedModelId = modelId || process.env.ELEVENLABS_MODEL_ID || 'eleven_monolingual_v1';
    const resolvedSettings = voiceSettings || {
      stability: Number(process.env.ELEV_STABILITY ?? 0.5),
      similarity_boost: Number(process.env.ELEV_SIMILARITY ?? 0.75),
      style: Number(process.env.ELEV_STYLE ?? 0.0),
      use_speaker_boost: (process.env.ELEV_SPEAKER_BOOST ?? 'true') === 'true'
    };

    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${resolvedVoiceId}`, {
      method: 'POST',
      headers: { 'xi-api-key': elevenKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, model_id: resolvedModelId, voice_settings: resolvedSettings })
    });
    if (!r.ok) {
      const errText = await r.text();
      return res.status(r.status).type('text/plain').send(errText);
    }
    const buf = Buffer.from(await r.arrayBuffer());
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', buf.length);
    return res.send(buf);
  } catch (err) {
    console.error('TTS proxy error:', err);
    return res.status(500).json({ error: 'TTS proxy error', details: err.message });
  }
});

// Handle all other routes by serving the React app
// This is important for React Router to work properly
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error handling middleware
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 JARVIS server running on http://localhost:${PORT}`);
  console.log(`📁 Serving static files from: ${path.join(__dirname, 'dist')}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  console.log(`🔊 TTS endpoint: POST http://localhost:${PORT}/api/tts`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
}); 