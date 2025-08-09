import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { request as httpsRequest } from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || '';

// MIME types for different file extensions
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

const server = createServer(async (req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // API health endpoint
  if (req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    }));
    return;
  }

  // Proxy to n8n webhook for chatbot/voice
  if (req.url === '/api/n8n' && req.method === 'POST') {
    if (!N8N_WEBHOOK_URL) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'N8N_WEBHOOK_URL not configured on server' }));
      return;
    }

    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      // Simple guard against very large payloads
      if (body.length > 5 * 1024 * 1024) {
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Payload too large' }));
        req.destroy();
      }
    });

    req.on('end', async () => {
      try {
        const jsonBody = body ? JSON.parse(body) : {};

        // Prefer global fetch if available (Node >= 18)
        if (typeof fetch === 'function') {
          const upstream = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jsonBody)
          });
          const contentType = upstream.headers.get('content-type') || '';
          const isJson = contentType.includes('application/json');
          const text = await upstream.text();
          const payload = isJson ? JSON.parse(text) : { text };

          res.writeHead(upstream.status, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(payload));
          return;
        }

        // Fallback to https module if fetch is unavailable
        const url = new URL(N8N_WEBHOOK_URL);
        const options = {
          hostname: url.hostname,
          port: url.port || 443,
          path: url.pathname + url.search,
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        };

        const proxyReq = httpsRequest(options, (proxyRes) => {
          let responseBody = '';
          proxyRes.on('data', (d) => { responseBody += d; });
          proxyRes.on('end', () => {
            const contentType = proxyRes.headers['content-type'] || '';
            const isJson = typeof contentType === 'string' && contentType.includes('application/json');
            const payload = isJson ? safeJsonParse(responseBody) ?? { text: responseBody } : { text: responseBody };
            res.writeHead(proxyRes.statusCode || 200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(payload));
          });
        });

        proxyReq.on('error', (err) => {
          console.error('n8n proxy error:', err);
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Failed to reach n8n webhook' }));
        });

        proxyReq.write(JSON.stringify(jsonBody));
        proxyReq.end();
      } catch (error) {
        console.error('Error handling /api/n8n:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request body' }));
      }
    });

    return;
  }

  let filePath = '';

  // Handle different routes
  if (req.url === '/' || req.url === '/index.html') {
    filePath = path.join(__dirname, 'dist', 'index.html');
  } else {
    // Remove leading slash and serve from dist directory
    filePath = path.join(__dirname, 'dist', req.url.replace(/^\//, ''));
  }

  try {
    // Check if file exists
    if (!existsSync(filePath)) {
      // For SPA routing, serve index.html for all routes
      if (req.url.startsWith('/api/')) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'API endpoint not found' }));
      } else {
        // Serve index.html for client-side routing
        filePath = path.join(__dirname, 'dist', 'index.html');
        if (!existsSync(filePath)) {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end('<h1>404 - File Not Found</h1><p>Please build the React app first using: npm run build</p>');
          return;
        }
      }
    }

    // Read and serve the file
    const content = await readFile(filePath);
    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);

  } catch (error) {
    console.error('Error serving file:', error);
    res.writeHead(500, { 'Content-Type': 'text/html' });
    res.end('<h1>500 - Internal Server Error</h1>');
  }
});

server.listen(PORT, () => {
  console.log(`🚀 JARVIS server running on http://localhost:${PORT}`);
  console.log(`📁 Serving static files from: ${path.join(__dirname, 'dist')}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  console.log(`\n📝 Instructions:`);
  console.log(`1. Build your React app: npm run build`);
  console.log(`2. Your app will be available at: http://localhost:${PORT}`);
  console.log(`3. API health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
}); 