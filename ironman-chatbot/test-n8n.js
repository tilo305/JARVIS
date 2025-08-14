// Test script to verify n8n workflow
const fs = require('fs');

async function testN8N() {
    console.log('🔄 Testing n8n workflow...');
    console.log('📍 Endpoint: https://n8n.hempstarai.com/webhook/n8n');
    
    try {
        // Test text message
        const response = await fetch('https://n8n.hempstarai.com/webhook/n8n', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: 'Hello, this is a test message from updated script' })
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers));
        
        const contentType = response.headers.get('content-type');
        console.log('Content-Type:', contentType);
        
        if (contentType && contentType.startsWith('audio/')) {
            console.log('✅ Got audio response!');
            const buffer = await response.arrayBuffer();
            console.log('Audio size:', buffer.byteLength, 'bytes');
            
            // Save to file for testing
            fs.writeFileSync('test-audio.mp3', Buffer.from(buffer));
            console.log('✅ Audio saved to test-audio.mp3');
        } else {
            console.log('❌ No audio response');
            const text = await response.text();
            console.log('Response body:', text);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testN8N();