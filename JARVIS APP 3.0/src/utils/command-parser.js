function parseCommand(input) {
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

module.exports = { parseCommand };