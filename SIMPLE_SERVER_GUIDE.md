# JARVIS Simple Local Server

This is a lightweight local server for hosting your JARVIS React application using only Node.js built-in modules.

## 🚀 Quick Start

### 1. Build Your React App
```bash
npm run build
```

### 2. Start the Server
```bash
npm run start
```

### 3. Access Your App
Open your browser and navigate to: `http://localhost:3000`

## 📋 Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite development server |
| `npm run build` | Build the React app for production |
| `npm run start` | Start the simple HTTP server |
| `npm run serve` | Build and start the server in one command |

## 🔧 Server Features

### ✅ What's Included:
- **Static File Serving**: Serves your built React app from the `dist` directory
- **React Router Support**: Handles client-side routing properly
- **API Health Endpoint**: `/api/health` for server status
- **CORS Support**: Enabled for cross-origin requests
- **MIME Type Detection**: Automatically sets correct content types
- **Error Handling**: Proper error handling and logging
- **Graceful Shutdown**: Handles SIGTERM and SIGINT signals

### 🌐 API Endpoints:
- `GET /api/health` - Server health check

## 🛠️ Usage Examples

### Build and Serve
```bash
npm run serve
```

### Start Server Only (requires build first)
```bash
npm run start
```

### Check Server Health
```bash
curl http://localhost:3000/api/health
```

## 📁 File Structure

```
ironman-app/
├── simple-server.js    # Built-in Node.js HTTP server
├── dist/               # Built React app (created after build)
├── src/                # React source code
├── public/             # Static assets
└── package.json        # Dependencies and scripts
```

## 🔍 Troubleshooting

### Common Issues:

1. **Port already in use**
   ```bash
   # Change the port using environment variable
   PORT=3001 npm run start
   ```

2. **Build directory not found**
   ```bash
   # Make sure to build first
   npm run build
   npm run start
   ```

3. **Server not starting**
   ```bash
   # Check if Node.js is installed
   node --version
   ```

## 🎯 What This Server Does

1. **Serves Static Files**: All files from the `dist` directory
2. **Handles SPA Routing**: Serves `index.html` for all non-API routes
3. **API Endpoints**: Provides `/api/health` endpoint
4. **CORS Support**: Allows cross-origin requests
5. **Proper MIME Types**: Sets correct content types for different file types
6. **Error Handling**: Graceful error handling and logging

## 🚀 Deployment Ready

This simple server can be easily deployed to:
- **Vercel** (as a serverless function)
- **Netlify** (with redirects for SPA)
- **Railway**
- **Render**
- **Any Node.js hosting platform**

## 📝 Next Steps

1. **Add More API Routes**: Extend the server with your backend functionality
2. **Authentication**: Add user authentication endpoints (if needed)
3. **File Upload**: Add file upload capabilities

---

**No additional dependencies required! This server uses only Node.js built-in modules. 🎉** 