# Migration Guide: Edit Nodes to Code Nodes

This guide helps you transition your n8n workflow from using edit nodes to code nodes for better performance and flexibility.

## Why Code Nodes?

Code nodes offer several advantages over edit nodes:
- **Better Performance**: Direct JavaScript execution without transformation overhead
- **Enhanced Error Handling**: More granular control over error scenarios
- **Flexible Data Processing**: Native JavaScript capabilities for complex transformations
- **Improved Debugging**: Better logging and inspection capabilities
- **Custom Logic**: Ability to implement complex business logic directly

## Frontend Changes (Already Applied)

✅ **Enhanced Workflow Client**: Created `src/utils/workflowClient.ts` with:
- Optimized request handling for code nodes
- Enhanced error handling and retry logic
- Better response processing for various content types
- Structured metadata support

✅ **Updated ChatUI Component**: Modified `src/components/ChatUI.tsx` with:
- Integration with the new workflow client
- Enhanced error display with visual indicators
- Better audio response handling
- Metadata display for debugging

✅ **Enhanced Testing**: Created `test-code-nodes.js` with:
- Comprehensive testing for code node responses
- Performance metrics and validation
- Multiple test scenarios (text, audio, complex data)

## N8N Workflow Migration Steps

### 1. Replace Edit Nodes with Code Nodes

**Before (Edit Node Pattern):**
```javascript
// Edit node typically uses simple transformations
return {
  json: {
    message: $json.input,
    processed: true
  }
};
```

**After (Code Node Pattern):**
```javascript
// Code node with enhanced capabilities
const inputData = $input.all();
const timestamp = new Date().toISOString();

// Enhanced processing with error handling
try {
  const processedData = inputData.map(item => {
    const json = item.json;
    
    // Your processing logic here
    return {
      ...json,
      processed: true,
      timestamp,
      nodeType: 'code',
      metadata: {
        processedAt: timestamp,
        inputSize: JSON.stringify(json).length,
        version: '2.0'
      }
    };
  });
  
  return processedData;
} catch (error) {
  // Enhanced error handling
  return [{
    json: {
      error: true,
      message: `Processing failed: ${error.message}`,
      timestamp,
      nodeType: 'code'
    }
  }];
}
```

### 2. Enhanced Audio Response Handling

**Code Node for Audio Responses:**
```javascript
// In your n8n code node for audio generation
const message = $json.message;

try {
  // Your audio generation logic (e.g., ElevenLabs, OpenAI TTS)
  const audioResponse = await generateAudio(message);
  
  // Return audio with proper headers
  return {
    binary: {
      audio: {
        data: audioResponse.buffer,
        mimeType: 'audio/mpeg',
        fileName: `response_${Date.now()}.mp3`
      }
    },
    json: {
      success: true,
      nodeType: 'code',
      metadata: {
        audioSize: audioResponse.buffer.length,
        format: 'mp3',
        timestamp: new Date().toISOString()
      }
    }
  };
} catch (error) {
  return {
    json: {
      error: true,
      message: `Audio generation failed: ${error.message}`,
      nodeType: 'code'
    }
  };
}
```

### 3. Enhanced Text Response Processing

**Code Node for Text Responses:**
```javascript
// Enhanced text processing in code node
const userMessage = $json.message;
const metadata = $json.metadata || {};

try {
  // Your AI/LLM processing here
  const aiResponse = await processWithAI(userMessage);
  
  return [{
    json: {
      reply: aiResponse.text,
      success: true,
      nodeType: 'code',
      metadata: {
        ...metadata,
        responseTime: aiResponse.responseTime,
        model: aiResponse.model,
        tokens: aiResponse.tokens,
        timestamp: new Date().toISOString()
      },
      // Enhanced structure for frontend parsing
      data: {
        message: aiResponse.text,
        confidence: aiResponse.confidence,
        intent: aiResponse.intent
      }
    }
  }];
} catch (error) {
  return [{
    json: {
      error: true,
      reply: `I encountered an error: ${error.message}`,
      nodeType: 'code',
      metadata: {
        ...metadata,
        errorType: 'processing-error',
        timestamp: new Date().toISOString()
      }
    }
  }];
}
```

### 4. Webhook Configuration Updates

Update your webhook node to handle the enhanced payloads:

```javascript
// In your webhook response code node
const response = $json;

// Set appropriate headers for different response types
if (response.binary?.audio) {
  // Audio response
  $responseHeaders = {
    'Content-Type': 'audio/mpeg',
    'X-Response-Type': 'audio',
    'X-Node-Type': 'code'
  };
  return response.binary.audio;
} else {
  // JSON response
  $responseHeaders = {
    'Content-Type': 'application/json',
    'X-Response-Type': 'json',
    'X-Node-Type': 'code'
  };
  return response;
}
```

## Testing Your Migration

### 1. Run the Enhanced Test Suite

```bash
cd ironman-chatbot
node test-code-nodes.js
```

This will test:
- Text message processing
- Audio response generation
- Complex data handling
- Error scenarios
- Performance metrics

### 2. Frontend Testing

Start your development server and test the enhanced UI:

```bash
npm run dev
```

Test scenarios:
- Send text messages and verify enhanced error handling
- Test audio responses with metadata display
- Verify error states show properly with red highlighting
- Check that metadata (audio size, error types) displays correctly

### 3. Validation Checklist

- [ ] Code nodes replace all edit nodes
- [ ] Enhanced error handling implemented
- [ ] Metadata structure consistent across responses
- [ ] Audio responses include proper headers
- [ ] Text responses follow enhanced structure
- [ ] Frontend displays errors with visual indicators
- [ ] Performance metrics are within acceptable ranges
- [ ] All test scenarios pass

## Expected Benefits

After migration, you should see:

1. **Better Error Handling**: More descriptive errors with proper categorization
2. **Enhanced Performance**: Faster processing with optimized code execution
3. **Improved Debugging**: Better logging and metadata for troubleshooting
4. **More Reliable Audio**: Proper MIME types and error recovery
5. **Enhanced UI Feedback**: Visual error indicators and metadata display

## Rollback Plan

If issues arise, you can quickly rollback by:

1. Reverting the ChatUI component to use direct fetch calls
2. Switching n8n nodes back to edit nodes temporarily
3. Using the old test script (`test-n8n.js`) for validation

The enhanced workflow client is backward compatible, so gradual migration is possible.

## Next Steps

1. **Deploy code nodes** in your n8n workflow
2. **Test thoroughly** using the provided test suite
3. **Monitor performance** and error rates
4. **Iterate and optimize** based on real usage patterns

## Support

If you encounter issues during migration:
- Check the test results for specific failure patterns
- Review browser console for detailed error messages
- Validate n8n workflow logs for code node execution details
- Use the enhanced metadata for debugging specific scenarios