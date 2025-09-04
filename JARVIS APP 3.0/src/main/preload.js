const { contextBridge, ipcRenderer } = require('electron');

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
});