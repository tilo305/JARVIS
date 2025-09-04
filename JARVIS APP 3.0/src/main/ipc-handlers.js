const { ipcMain, shell } = require('electron');
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

module.exports = { setupIpcHandlers };