// Create a simple test audio file for n8n testing
const fs = require('fs');

// Create a minimal valid MP3 file (just headers for testing)
const mp3Header = Buffer.from([
    0xFF, 0xFB, 0x90, 0x00, // MP3 frame header
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // Padding
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
]);

fs.writeFileSync('test-audio-sample.mp3', mp3Header);
console.log('✅ Created test-audio-sample.mp3 for testing');

// Also create base64 version for n8n testing
const base64Audio = mp3Header.toString('base64');
console.log('Base64 audio for n8n testing:');
console.log(base64Audio);

// Test what a proper audio response should look like
console.log('\n=== This is what your n8n should return ===');
console.log('Content-Type: audio/mpeg');
console.log('Content-Length:', mp3Header.length);
console.log('Binary data: [' + mp3Header.length + ' bytes]');