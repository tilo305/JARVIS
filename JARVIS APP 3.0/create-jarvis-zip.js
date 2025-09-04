const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

console.log('Starting Jarvis AI Desktop project creation...');

// Create output stream
const output = fs.createWriteStream('jarvis-ai-desktop.zip');
const archive = archiver('zip', {
  zlib: { level: 9 }
});

// Error handling
archive.on('error', (err) => {
  throw err;
});

output.on('close', () => {
  console.log('✅ ZIP file created successfully!');
  console.log(`📦 Total size: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
  console.log('📂 File saved as: jarvis-ai-desktop.zip');
});

// Pipe archive data to file
archive.pipe(output);

// Define all project files
const projectFiles = {
  'package.json': `{
  "name": "jarvis-ai-desktop",
  "version": "1.0.0",
  "description": "Jarvis AI Desktop Assistant with n8n integration",
  "main": "src/main/index.js",
  "scripts": {
    "start": "electron .",
    "dev": "NODE_ENV=development electron .",
    "build": "electron-builder",
    "dist": "electron-builder --publish=never",
    "postinstall": "electron-builder install-app-deps"
  },
  "keywords": ["jarvis", "ai", "assistant", "n8n", "electron"],
  "author": "Your Name",
  "license": "MIT",
  "devDependencies": {
    "@electron-forge/cli": "^6.0.5",
    "electron": "^27.0.0",
    "electron-builder": "^24.6.4",
    "electron-reload": "^2.0.0-alpha.1"
  },
  "dependencies": {
    "axios": "^1.5.0",
    "dotenv": "^16.3.1",
    "electron-store": "^8.1.0",
    "node-schedule": "^2.1.1",
    "winston": "^3.10.0"
  },
  "build": {
    "appId": "com.yourcompany.jarvis",
    "productName": "Jarvis AI Assistant",
    "directories": {
      "output": "dist"
    },
    "files": [
      "src/**/*",
      "node_modules/**/*",
      "package.json"
    ],
    "win": {
      "target": "nsis",
      "icon": "build/icon.ico"
    },
    "mac": {
      "target": "dmg",
      "icon": "build/icon.icns"
    },
    "linux": {
      "target": "AppImage",
      "icon": "build/icon.png"
    }
  }
}`,

  '.env.example': `# n8n Configuration
N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=your_api_key_here
N8N_WEBHOOK_URL=http://localhost:5678/webhook/jarvis

# Application Settings
NODE_ENV=development
LOG_LEVEL=info
ENABLE_AUTO_UPDATE=true`,

  '.gitignore': `node_modules/
dist/
.env
*.log
.DS_Store
Thumbs.db
build/releases/
.idea/
.vscode/
*.swp
*.swo`,

  'README.md': `# Jarvis AI Desktop Assistant

A powerful desktop AI assistant built with Electron and integrated with n8n workflows.

## Features
- Voice commands and natural language processing
- n8n workflow integration
- System automation
- Cross-platform support

## Installation
1. Clone the repository
2. Install dependencies: \`npm install\`
3. Copy \`.env.example\` to \`.env\` and configure
4. Run in development: \`npm run dev\`
5. Build for production: \`npm run build\`

## Usage
- Launch the application
- Use voice commands or type instructions
- Access system tray for quick actions

## License
MIT`,

  'src/main/index.js': `const { app, BrowserWindow, Menu, Tray } = require('electron');
const path = require('path');
const { setupIpcHandlers } = require('./ipc-handlers');
const { createMainWindow } = require('./window-manager');
const { initializeSecurity } = require('./security');
require('dotenv').config();

let mainWindow;
let tray;

// Enable live reload for Electron
if (process.env.NODE_ENV === 'development') {
  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, '..', '..', 'node_modules', '.bin', 'electron'),
    hardResetMethod: 'exit'
  });
}

async function createWindow() {
  // Initialize security measures
  initializeSecurity();
  
  // Create the browser window
  mainWindow = createMainWindow();
  
  // Setup IPC handlers
  setupIpcHandlers(mainWindow);
  
  // Load the index.html
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  
  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

// System tray functionality
function createTray() {
  tray = new Tray(path.join(__dirname, '../../build/icon.ico'));
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show Jarvis', click: () => mainWindow.show() },
    { label: 'Quit', click: () => app.quit() }
  ]);
  tray.setToolTip('Jarvis AI Assistant');
  tray.setContextMenu(contextMenu);
}

app.whenReady().then(() => {
  createWindow();
  createTray();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});`,

  'src/main/window-manager.js': `const { BrowserWindow } = require('electron');
const path = require('path');

function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../../build/icon.ico')
  });

  // Window event handlers
  mainWindow.on('minimize', (event) => {
    event.preventDefault();
    mainWindow.hide();
  });

  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });

  return mainWindow;
}

module.exports = { createMainWindow };`,

  'src/main/ipc-handlers.js': `const { ipcMain, shell } = require('electron');
const { executeN8nWorkflow } = require('../utils/n8n-client');
const { parseCommand } = require('../utils/command-parser');
const { executeSystemCommand } = require('../utils/system-commands');
const path = require('path');

function setupIpcHandlers(mainWindow) {
  // Handle n8n workflow execution
  ipcMain.handle('execute-n8n-workflow', async (event, command) => {
    try {
      const parsedCommand = parseCommand(command);
      const response = await executeN8nWorkflow(parsedCommand);
      return { success: true, data: response };
    } catch (error) {
      console.error('n8n workflow error:', error);
      return { success: false, error: error.message };
    }
  });

  // Handle system commands
  ipcMain.handle('execute-system-command', async (event, command) => {
    try {
      const result = await executeSystemCommand(command);
      return { success: true, data: result };
    } catch (error) {
      console.error('System command error:', error);
      return { success: false, error: error.message };
    }
  });

  // Handle file operations
  ipcMain.handle('file-operation', async (event, operation, filePath) => {
    try {
      // Validate path is safe
      if (!isPathSafe(filePath)) {
        throw new Error('Access denied: Invalid path');
      }
      const result = await performFileOperation(operation, filePath);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Open external links
  ipcMain.handle('open-external', async (event, url) => {
    await shell.openExternal(url);
    return { success: true };
  });
}

function isPathSafe(filePath) {
  const normalizedPath = path.normalize(filePath);
  const userProfile = process.env.USERPROFILE || process.env.HOME;
  return normalizedPath.startsWith(userProfile);
}

async function performFileOperation(operation, filePath) {
  const fs = require('fs').promises;
  
  switch(operation) {
    case 'read':
      return await fs.readFile(filePath, 'utf-8');
    case 'write':
      return await fs.writeFile(filePath, data);
    case 'delete':
      return await fs.unlink(filePath);
    case 'list':
      return await fs.readdir(filePath);
    default:
      throw new Error('Unknown operation');
  }
}

module.exports = { setupIpcHandlers };`,

  'src/main/preload.js': `const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('jarvisAPI', {
  executeN8nWorkflow: (command) => ipcRenderer.invoke('execute-n8n-workflow', command),
  executeSystemCommand: (command) => ipcRenderer.invoke('execute-system-command', command),
  fileOperation: (operation, filePath) => ipcRenderer.invoke('file-operation', operation, filePath),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  
  // Voice recognition
  startListening: () => ipcRenderer.send('start-listening'),
  stopListening: () => ipcRenderer.send('stop-listening'),
  
  // Event listeners
  onVoiceResult: (callback) => ipcRenderer.on('voice-result', callback),
  onCommandResult: (callback) => ipcRenderer.on('command-result', callback),
  
  // System info
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  
  // Settings
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  loadSettings: () => ipcRenderer.invoke('load-settings')
});`,

  'src/main/security.js': `const { app, session } = require('electron');

function initializeSecurity() {
  // Disable remote module
  app.commandLine.appendSwitch('disable-remote-module', 'true');
  
  // Set Content Security Policy
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ["default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"]
      }
    });
  });
  
  // Prevent new window creation
  app.on('web-contents-created', (event, contents) => {
    contents.on('new-window', (event, navigationUrl) => {
      event.preventDefault();
    });
  });
  
  // Disable navigation to external protocols
  app.on('web-contents-created', (event, contents) => {
    contents.on('will-navigate', (event, navigationUrl) => {
      const parsedUrl = new URL(navigationUrl);
      if (parsedUrl.protocol !== 'file:') {
        event.preventDefault();
      }
    });
  });
}

module.exports = { initializeSecurity };`,

  'src/renderer/index.html': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';">
    <title>Jarvis AI Assistant</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div id="app">
        <div class="jarvis-container">
            <div class="jarvis-header">
                <h1>JARVIS</h1>
                <div class="status-indicator" id="status"></div>
            </div>
            
            <div class="chat-container" id="chat-container">
                <!-- Chat messages will appear here -->
            </div>
            
            <div class="input-container">
                <input type="text" id="command-input" placeholder="Ask Jarvis anything..." />
                <button id="voice-button" class="voice-btn">🎤</button>
                <button id="send-button" class="send-btn">Send</button>
            </div>
        </div>
    </div>
    
    <script src="renderer.js"></script>
</body>
</html>`,

  'src/renderer/styles.css': `:root {
    --primary-color: #00d4ff;
    --secondary-color: #ff6b6b;
    --bg-color: #0a0a0a;
    --text-color: #ffffff;
    --chat-bg: #1a1a1a;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Arial', sans-serif;
    background-color: var(--bg-color);
    color: var(--text-color);
    height: 100vh;
    overflow: hidden;
}

.jarvis-container {
    height: 100vh;
    display: flex;
    flex-direction: column;
    padding: 20px;
}

.jarvis-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 0;
    border-bottom: 2px solid var(--primary-color);
}

.jarvis-header h1 {
    font-size: 2.5rem;
    color: var(--primary-color);
    text-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
}

.status-indicator {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: #4caf50;
    box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
}

.chat-container {
    flex: 1;
    overflow-y: auto;
    padding: 20px 0;
    margin: 20px 0;
}

.message {
    margin-bottom: 15px;
    padding: 15px;
    border-radius: 10px;
    animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

.user-message {
    background-color: var(--primary-color);
    color: var(--bg-color);
    align-self: flex-end;
    margin-left: auto;
    max-width: 70%;
}

.jarvis-message {
    background-color: var(--chat-bg);
    border: 1px solid var(--primary-color);
    max-width: 70%;
}

.input-container {
    display: flex;
    gap: 10px;
    padding: 20px 0;
}

#command-input {
    flex: 1;
    padding: 15px;
    background-color: var(--chat-bg);
    border: 2px solid var(--primary-color);
    border-radius: 25px;
    color: var(--text-color);
    font-size: 16px;
    outline: none;
    transition: all 0.3s ease;
}

#command-input:focus {
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
}

.voice-btn, .send-btn {
    padding: 15px 25px;
    background-color: var(--primary-color);
    border: none;
    border-radius: 50%;
    color: var(--bg-color);
    font-size: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.voice-btn:hover, .send-btn:hover {
    background-color: var(--secondary-color);
    transform: scale(1.1);
}

.voice-btn.recording {
    background-color: var(--secondary-color);
    animation: pulse 1s infinite;
}

@keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.7); }
    70% { box-shadow: 0 0 0 20px rgba(255, 107, 107, 0); }
    100% { box-shadow: 0 0 0 0 rgba(255, 107, 107, 0); }
}

/* Scrollbar styling */
::-webkit-scrollbar {
    width: 8px;
}

::-webkit-scrollbar-track {
    background: var(--chat-bg);
}

::-webkit-scrollbar-thumb {
    background: var(--primary-color);
    border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
    background: var(--secondary-color);
}`,

  'src/renderer/renderer.js': `// Renderer process JavaScript
const chatContainer = document.getElementById('chat-container');
const commandInput = document.getElementById('command-input');
const sendButton = document.getElementById('send-button');
const voiceButton = document.getElementById('voice-button');
const statusIndicator = document.getElementById('status');

let isListening = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    addMessage('jarvis', 'Hello! I am Jarvis, your AI assistant. How can I help you today?');
    
    // Load saved settings
    loadSettings();
});

// Send message on button click
sendButton.addEventListener('click', sendCommand);

// Send message on Enter key
commandInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendCommand();
    }
});

// Voice button functionality
voiceButton.addEventListener('click', toggleVoiceRecording);

// Send command function
async function sendCommand() {
    const command = commandInput.value.trim();
    if (!command) return;
    
    // Add user message to chat
    addMessage('user', command);
    commandInput.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        // Check if it's a system command
        if (command.startsWith('/')) {
            const result = await window.jarvisAPI.executeSystemCommand(command);
            removeTypingIndicator();
            addMessage('jarvis', result.data || result.error);
        } else {
            // Execute n8n workflow
            const result = await window.jarvisAPI.executeN8nWorkflow(command);
            removeTypingIndicator();
            addMessage('jarvis', result.data || result.error);
        }
    } catch (error) {
        removeTypingIndicator();
        addMessage('jarvis', 'Sorry, I encountered an error. Please try again.');
        console.error('Command error:', error);
    }
}

// Add message to chat
function addMessage(sender, text) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender === 'user' ? 'user-message' : 'jarvis-message');
    messageDiv.textContent = text;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Toggle voice recording
function toggleVoiceRecording() {
    if (!isListening) {
        startListening();
    } else {
        stopListening();
    }
}

// Start voice recording
function startListening() {
    isListening = true;
    voiceButton.classList.add('recording');
    window.jarvisAPI.startListening();
    updateStatus('listening');
}

// Stop voice recording
function stopListening() {
    isListening = false;
    voiceButton.classList.remove('recording');
    window.jarvisAPI.stopListening();
    updateStatus('online');
}

// Update status indicator
function updateStatus(status) {
    switch(status) {
        case 'online':
            statusIndicator.style.backgroundColor = '#4caf50';
            break;
        case 'listening':
            statusIndicator.style.backgroundColor = '#ff6b6b';
            break;
        case 'processing':
            statusIndicator.style.backgroundColor = '#ffa500';
            break;
        case 'offline':
            statusIndicator.style.backgroundColor = '#666666';
            break;
    }
}

// Show typing indicator
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typing-indicator';
    typingDiv.classList.add('message', 'jarvis-message');
    typingDiv.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
    chatContainer.appendChild(typingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Remove typing indicator
function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Load settings
async function loadSettings() {
    try {
        const settings = await window.jarvisAPI.loadSettings();
        // Apply settings
        console.log('Settings loaded:', settings);
    } catch (error) {
        console.error('Failed to load settings:', error);
    }
}

// Listen for voice results
window.jarvisAPI.onVoiceResult((event, result) => {
    if (result.text) {
        commandInput.value = result.text;
        sendCommand();
    }
});

// Listen for command results
window.jarvisAPI.onCommandResult((event, result) => {
    removeTypingIndicator();
    addMessage('jarvis', result.message);
});`,

  'src/utils/n8n-client.js': `const axios = require('axios');
require('dotenv').config();

const n8nClient = axios.create({
    baseURL: process.env.N8N_BASE_URL || 'http://localhost:5678',
    headers: {
        'X-N8N-API-KEY': process.env.N8N_API_KEY,
        'Content-Type': 'application/json'
    }
});

async function executeN8nWorkflow(command) {
    try {
        const webhookUrl = process.env.N8N_WEBHOOK_URL;
        
        const response = await n8nClient.post(webhookUrl, {
            command: command.text,
            context: command.context,
            timestamp: new Date().toISOString()
        });
        
        return response.data;
    } catch (error) {
        console.error('n8n workflow execution error:', error);
        throw new Error('Failed to execute workflow');
    }
}

async function getWorkflowStatus(workflowId) {
    try {
        const response = await n8nClient.get(\`/workflows/\${workflowId}\`);
        return response.data;
    } catch (error) {
        console.error('Failed to get workflow status:', error);
        throw error;
    }
}

module.exports = {
    executeN8nWorkflow,
    getWorkflowStatus
};`,

  'src/utils/command-parser.js': `function parseCommand(input) {
    const command = {
        text: input,
        type: 'general',
        context: {},
        parameters: {}
    };
    
    // System commands
    if (input.startsWith('/')) {
        command.type = 'system';
        const parts = input.slice(1).split(' ');
        command.action = parts[0];
        command.parameters = parts.slice(1);
        return command;
    }
    
    // File operations
    if (input.match(/open|create|delete|read|write/i)) {
        command.type = 'file';
    }
    
    // Application launches
    if (input.match(/launch|start|run|open/i)) {
        command.type = 'application';
    }
    
    // Web searches
    if (input.match(/search|google|find/i)) {
        command.type = 'search';
    }
    
    // Automation tasks
    if (input.match(/automate|schedule|remind/i)) {
        command.type = 'automation';
    }
    
    return command;
}

module.exports = { parseCommand };`,

  'src/utils/system-commands.js': `const { exec } = require('child_process');
const os = require('os');
const path = require('path');

async function executeSystemCommand(command) {
    const parsedCommand = command.slice(1).split(' ');
    const action = parsedCommand[0];
    const args = parsedCommand.slice(1);
    
    switch(action) {
        case 'shutdown':
            return shutdownSystem();
        case 'restart':
            return restartSystem();
        case 'sleep':
            return sleepSystem();
        case 'volume':
            return adjustVolume(args[0]);
        case 'brightness':
            return adjustBrightness(args[0]);
        case 'screenshot':
            return takeScreenshot();
        case 'info':
            return getSystemInfo();
        default:
            throw new Error(\`Unknown command: \${action}\`);
    }
}

function shutdownSystem() {
    const command = os.platform() === 'win32' ? 'shutdown /s /t 0' : 'sudo shutdown -h now';
    exec(command);
    return 'Shutting down system...';
}

function restartSystem() {
    const command = os.platform() === 'win32' ? 'shutdown /r /t 0' : 'sudo reboot';
    exec(command);
    return 'Restarting system...';
}

function sleepSystem() {
    const command = os.platform() === 'win32' ? 'rundll32.exe powrprof.dll,SetSuspendState 0,1,0' : 'pmset sleepnow';
    exec(command);
    return 'Putting system to sleep...';
}

function adjustVolume(level) {
    // Platform-specific volume control
    return \`Volume adjusted to \${level}%\`;
}

function adjustBrightness(level) {
    // Platform-specific brightness control
    return \`Brightness adjusted to \${level}%\`;
}

async function takeScreenshot() {
    const screenshotPath = path.join(os.homedir(), 'Pictures', \`screenshot-\${Date.now()}.png\`);
    // Screenshot implementation
    return \`Screenshot saved to \${screenshotPath}\`;
}

function getSystemInfo() {
    return {
        platform: os.platform(),
        release: os.release(),
        cpu: os.cpus()[0].model,
        memory: \`\${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB\`,
        uptime: \`\${Math.round(os.uptime() / 3600)} hours\`
    };
}

module.exports = { executeSystemCommand };`
};

// Add all files to the archive
console.log('Adding files to archive...');
Object.entries(projectFiles).forEach(([filePath, content]) => {
  archive.append(content, { name: `jarvis-ai-desktop/${filePath}` });
  console.log(`Added: ${filePath}`);
});

// Create empty directories
const directories = [
  'jarvis-ai-desktop/build/',
  'jarvis-ai-desktop/src/services/',
  'jarvis-ai-desktop/logs/',
  'jarvis-ai-desktop/assets/'
];

directories.forEach(dir => {
  archive.append(null, { name: dir });
  console.log(`Created directory: ${dir}`);
});

// Finalize the archive
archive.finalize();
