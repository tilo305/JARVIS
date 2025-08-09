# JARVIS Local Server Setup

This guide will help you set up a local Express server to host your JARVIS React application.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
# Install the server dependencies
pnpm install
```

### 2. Build and Serve
```bash
# Build the React app and start the server
pnpm run serve
```

### 3. Access Your App
Open your browser and navigate to: `http://localhost:3000`

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start Vite development server |
| `pnpm run build` | Build the React app for production |
| `pnpm run start` | Start the Express server (requires build first) |
| `pnpm run serve` | Build and start the server in one command |
| `pnpm run dev:server` | Start server with nodemon for development |

## 🔧 Server Features

### ✅ What's Included:
- **Static File Serving**: Serves your built React app from the `dist` directory
- **React Router Support**: Handles client-side routing properly
- **API Endpoints**: Ready for future backend functionality
- **Security**: Helmet middleware for security headers
- **Compression**: Gzip compression for better performance
- **CORS**: Enabled for development
- **Error Handling**: Proper error handling and logging
- **Graceful Shutdown**: Handles SIGTERM and SIGINT signals

### 🌐 API Endpoints:
- `GET /api/health` - Server health check

## 🛠️ Development Workflow

### Option 1: Development Mode (Recommended for development)
```bash
# Terminal 1: Start Vite dev server
pnpm run dev

# Terminal 2: Start Express server (for API development)
pnpm run dev:server
```

### Option 2: Production Mode (Recommended for testing production build)
```bash
# Build and serve the production version
pnpm run serve
```

## 🔍 Troubleshooting

### Common Issues:

1. **Port already in use**
   ```bash
   # Change the port in server.js or set environment variable
   PORT=3001 pnpm run serve
   ```

2. **Build directory not found**
   ```bash
   # Make sure to build first
   pnpm run build
   pnpm run start
   ```

3. **Dependencies not installed**
   ```bash
   # Reinstall dependencies
   pnpm install
   ```

## 📁 File Structure

```
ironman-app/
├── server.js          # Express server
├── dist/              # Built React app (created after build)
├── src/               # React source code
├── public/            # Static assets
└── package.json       # Dependencies and scripts
```

## 🔒 Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# API Configuration
API_BASE_URL=http://localhost:3000/api
```

## 🚀 Deployment Ready

This server setup is ready for deployment to platforms like:
- **Vercel**
- **Netlify**
- **Heroku**
- **Railway**
- **DigitalOcean App Platform**

## 📝 Next Steps

1. **Add API Routes**: Extend the server with your backend functionality
2. **Authentication**: Add user authentication endpoints (if needed)
3. **File Upload**: Add file upload capabilities
4. **WebSocket**: Add real-time features with Socket.io

## 🎯 Usage Examples

### Start Development Server
```bash
pnpm run dev:server
```

### Build and Deploy
```bash
pnpm run serve
```

### Check Server Health
```bash
curl http://localhost:3000/api/health
```

---

**Happy coding! 🎉** 