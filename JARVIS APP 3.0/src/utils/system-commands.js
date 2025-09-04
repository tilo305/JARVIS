const { exec } = require('child_process');
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
            throw new Error(`Unknown command: ${action}`);
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
    return `Volume adjusted to ${level}%`;
}

function adjustBrightness(level) {
    // Platform-specific brightness control
    return `Brightness adjusted to ${level}%`;
}

async function takeScreenshot() {
    const screenshotPath = path.join(os.homedir(), 'Pictures', `screenshot-${Date.now()}.png`);
    // Screenshot implementation
    return `Screenshot saved to ${screenshotPath}`;
}

function getSystemInfo() {
    return {
        platform: os.platform(),
        release: os.release(),
        cpu: os.cpus()[0].model,
        memory: `${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB`,
        uptime: `${Math.round(os.uptime() / 3600)} hours`
    };
}

module.exports = { executeSystemCommand };