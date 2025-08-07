import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://n8n.hempstarai.com/webhook/n8n';

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
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

  // n8n webhook proxy: forwards any method and body to external webhook
  if (req.url.startsWith('/api/webhook/n8n')) {
    try {
      // Build target URL preserving query string
      const incomingUrl = new URL(req.url, `http://localhost:${PORT}`);
      const targetUrl = new URL(N8N_WEBHOOK_URL);
      // Append incoming query params to target
      incomingUrl.searchParams.forEach((value, key) => {
        targetUrl.searchParams.append(key, value);
      });

      // Read request body (if any)
      const chunks = [];
      await new Promise((resolve) => {
        req.on('data', (chunk) => chunks.push(chunk));
        req.on('end', resolve);
      });
      const bodyBuffer = Buffer.concat(chunks);
      const hasBody = bodyBuffer.length > 0 && !['GET', 'HEAD'].includes(req.method);

      // Prepare headers: forward content-type and auth, drop host/content-length to let fetch set them
      const forwardHeaders = {};
      const keepHeader = (name) => ['content-type', 'authorization', 'x-api-key'].includes(name.toLowerCase());
      for (const [name, value] of Object.entries(req.headers)) {
        if (keepHeader(name)) forwardHeaders[name] = value;
      }

      const response = await fetch(targetUrl.toString(), {
        method: req.method,
        headers: forwardHeaders,
        body: hasBody ? bodyBuffer : undefined
      });

      // Relay response
      const respContentType = response.headers.get('content-type') || 'application/json';
      const respStatus = response.status;
      const respBody = await response.arrayBuffer();

      res.writeHead(respStatus, { 'Content-Type': respContentType });
      res.end(Buffer.from(respBody));
      return;
    } catch (error) {
      console.error('n8n webhook proxy error:', error);
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to reach n8n webhook', details: error.message }));
      return;
    }
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
  console.log(`4. n8n webhook proxy: POST http://localhost:${PORT}/api/webhook/n8n`);
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