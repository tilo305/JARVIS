// Debug script to test ElevenLabs TTS binary output
const fs = require('fs');

async function testElevenLabsDirectly() {
    console.log('Testing ElevenLabs TTS API directly...');
    
    const ELEVENLABS_API_KEY = 'your_api_key_here'; // Replace with your API key
    const VOICE_ID = 'JBFqnCBsd6RMkjVDRZzb'; // Default voice
    
    try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': ELEVENLABS_API_KEY
            },
            body: JSON.stringify({
                text: "Hello, this is a test of ElevenLabs TTS",
                model_id: "eleven_multilingual_v2",
                output_format: "mp3_44100_128"
            })
        });
        
        console.log('ElevenLabs Response status:', response.status);
        console.log('ElevenLabs Response headers:', Object.fromEntries(response.headers));
        
        if (response.ok) {
            const buffer = await response.arrayBuffer();
            console.log('✅ ElevenLabs audio size:', buffer.byteLength, 'bytes');
            
            fs.writeFileSync('elevenlabs-test.mp3', Buffer.from(buffer));
            console.log('✅ ElevenLabs audio saved to elevenlabs-test.mp3');
        } else {
            const error = await response.text();
            console.log('❌ ElevenLabs error:', error);
        }
        
    } catch (error) {
        console.error('❌ ElevenLabs error:', error.message);
    }
}

// Don't run automatically - requires API key
console.log('To test ElevenLabs directly:');
console.log('1. Add your ElevenLabs API key to this file');
console.log('2. Uncomment the line below');
// testElevenLabsDirectly();