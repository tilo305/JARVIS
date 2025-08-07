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
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://n8n.hempstarai.com/webhook/n8n';

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

// n8n webhook proxy
app.all('/api/webhook/n8n', async (req, res) => {
  try {
    const targetUrl = new URL(N8N_WEBHOOK_URL);
    // Forward query params
    for (const [key, value] of Object.entries(req.query)) {
      targetUrl.searchParams.append(key, value);
    }

    // Build headers
    const headers = {};
    const keepHeader = (name) => ['content-type', 'authorization', 'x-api-key'].includes(name.toLowerCase());
    for (const [name, value] of Object.entries(req.headers)) {
      if (keepHeader(name)) headers[name] = value;
    }

    // Choose body depending on content-type
    let body;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      if (headers['content-type'] && headers['content-type'].includes('application/json')) {
        body = JSON.stringify(req.body);
      } else {
        // For non-JSON, rely on raw body via text
        body = typeof req.body === 'string' ? req.body : undefined;
      }
    }

    const resp = await fetch(targetUrl.toString(), {
      method: req.method,
      headers,
      body,
    });

    const contentType = resp.headers.get('content-type') || 'application/json';
    const buffer = Buffer.from(await resp.arrayBuffer());
    res.status(resp.status).set('Content-Type', contentType).send(buffer);
  } catch (err) {
    console.error('n8n webhook proxy error:', err);
    res.status(502).json({ error: 'Failed to reach n8n webhook', details: err.message });
  }
});

// Handle all other routes by serving the React app
// This is important for React Router to work properly
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error handling middleware
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
  console.log(`🔗 n8n webhook proxy: ALL http://localhost:${PORT}/api/webhook/n8n -> ${N8N_WEBHOOK_URL}`);
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