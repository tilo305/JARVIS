const { app, session } = require('electron');

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

module.exports = { initializeSecurity };