# 🤖 JARVIS - AI-Powered Personal Assistant

A modern, Iron Man-inspired personal assistant built with React, featuring voice interaction, chatbot capabilities, and a sleek UI design.

![JARVIS Demo](https://img.shields.io/badge/Status-Live%20Demo-brightgreen)
![React](https://img.shields.io/badge/React-19.1.0-blue)
![Vite](https://img.shields.io/badge/Vite-6.3.5-purple)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.7-cyan)

## 🚀 Live Demo

**Access JARVIS:** [http://localhost:3000](http://localhost:3000)

## ✨ Features

### 🎯 Core Features
- **Voice Interaction** - Talk to JARVIS with speech recognition
- **AI Chatbot** - Intelligent conversation capabilities
- **Modern UI** - Iron Man-inspired design with animations
- **Responsive Design** - Works on desktop and mobile
- **Real-time Updates** - Live data and status updates

### 🎨 UI Components
- **Hero Section** - Animated video background
- **HUD Elements** - Heads-up display interface
- **Interactive Chatbot** - Voice and text interaction
- **Content Sections** - Modular content display
- **Smooth Animations** - Framer Motion powered

### 🔧 Technical Features
- **React 19** - Latest React with concurrent features
- **Vite** - Fast build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations
- **Radix UI** - Accessible component library
- **Supabase** - Backend database integration

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.1.0 | Frontend framework |
| Vite | 6.3.5 | Build tool & dev server |
| TailwindCSS | 4.1.7 | Styling framework |
| Framer Motion | 12.15.0 | Animations |
| Radix UI | Latest | UI components |
| Supabase | 2.52.1 | Backend services |
| React Router | 7.6.1 | Client-side routing |

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm package manager

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/jarvis.git
   cd jarvis/ironman-app
   ```

2. **Install dependencies**
   ```bash
   # Using pnpm (recommended)
   pnpm install
   
   # Or using npm
   npm install
   ```

3. **Start development server**
   ```bash
   # Development mode
   pnpm run dev
   
   # Or production build and serve
   pnpm run serve
   ```

4. **Access JARVIS**
   Open your browser and navigate to `http://localhost:3000`

## 🎮 Usage

### Development Commands

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start Vite development server |
| `pnpm run build` | Build for production |
| `pnpm run serve` | Build and serve with local server |
| `pnpm run start` | Start production server only |
| `pnpm run lint` | Run ESLint |

### Server Features

- **Static File Serving** - Serves built React app
- **API Endpoints** - Health check and future APIs
- **CORS Support** - Cross-origin requests
- **SPA Routing** - Client-side routing support
- **Error Handling** - Graceful error management

## 🏗️ Project Structure

```
ironman-app/
├── src/                    # React source code
│   ├── components/         # React components
│   │   ├── ui/            # UI components (Radix)
│   │   ├── Hero.jsx       # Hero section
│   │   ├── JarvisChatbot.jsx # Chatbot component
│   │   └── ...
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API services
│   ├── lib/               # Utilities and config
│   └── assets/            # Static assets
├── public/                # Public assets
├── server.js              # Express server (optional)
├── simple-server.js       # Built-in HTTP server
└── package.json           # Dependencies and scripts
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Server Configuration
PORT=3000
NODE_ENV=development
```

### Supabase Setup

1. Create a Supabase project
2. Get your project URL and anon key
3. Add them to your `.env` file
4. See `SUPABASE_SETUP.md` for detailed instructions

## 🚀 Deployment

### Local Production Server

```bash
# Build and serve locally
pnpm run serve
```

### Deployment Platforms

This project can be deployed to:

- **Vercel** - Serverless deployment
- **Netlify** - Static site hosting
- **Railway** - Full-stack deployment
- **Render** - Cloud platform
- **Heroku** - Container deployment

### Build for Production

```bash
# Build the app
pnpm run build

# The built files will be in the `dist/` directory
```

## 🧪 Testing

```bash
# Run linting
pnpm run lint

# Check for build errors
pnpm run build
```

## 📝 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Server health check |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Iron Man** - Inspiration for the JARVIS concept
- **React Team** - Amazing frontend framework
- **Vite Team** - Fast build tool
- **TailwindCSS** - Utility-first CSS framework
- **Radix UI** - Accessible component library

## 📞 Support

If you have any questions or need help:

- Create an issue on GitHub
- Check the documentation in the `/docs` folder
- Review the setup guides in the project

---

**Built with ❤️ and React**

![JARVIS](https://img.shields.io/badge/JARVIS-AI%20Assistant-red)

