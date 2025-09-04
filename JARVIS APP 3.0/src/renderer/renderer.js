// Renderer process JavaScript
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
});