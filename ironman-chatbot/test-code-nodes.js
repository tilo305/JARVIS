/**
 * Enhanced test utility for n8n workflows using code nodes
 * This replaces the old edit node patterns with code node optimized testing
 */

const fs = require('fs');
const path = require('path');

// Configuration for different test scenarios
const TEST_CONFIGS = {
  text: {
    name: 'Text Message Test',
    payload: { 
      message: 'Hello, this is a test message for code nodes',
      nodeType: 'code',
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'test-utility',
        testType: 'text-response'
      }
    },
    expectedResponseType: 'text'
  },
  
  audio: {
    name: 'Audio Response Test',
    payload: { 
      message: 'Generate an audio response please',
      nodeType: 'code',
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'test-utility',
        testType: 'audio-response'
      }
    },
    expectedResponseType: 'audio'
  },
  
  complex: {
    name: 'Complex Data Test',
    payload: {
      message: 'Process this complex request with structured data',
      nodeType: 'code',
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'test-utility',
        testType: 'complex-data',
        customData: {
          userId: 'test-user-123',
          preferences: ['audio', 'text'],
          sessionData: { previous: 'none' }
        }
      }
    },
    expectedResponseType: 'json'
  }
};

/**
 * Test a specific workflow endpoint with code node optimizations
 */
async function testWorkflowEndpoint(url, config) {
  console.log(`\n🧪 Running ${config.name}...`);
  console.log('📤 Payload:', JSON.stringify(config.payload, null, 2));
  
  try {
    const startTime = Date.now();
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Workflow-Type': 'code-node',
        'User-Agent': 'Code-Node-Tester/1.0'
      },
      body: JSON.stringify(config.payload)
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log('⏱️  Response Time:', `${responseTime}ms`);
    console.log('📊 Status:', response.status, response.statusText);
    console.log('📋 Headers:', Object.fromEntries(response.headers));
    
    const contentType = response.headers.get('content-type') || '';
    console.log('🏷️  Content-Type:', contentType);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error Response:', errorText);
      return { success: false, error: errorText, responseTime };
    }
    
    // Handle different response types optimized for code nodes
    if (contentType.startsWith('audio/') || contentType.includes('octet-stream')) {
      console.log('🔊 Processing audio response...');
      const buffer = await response.arrayBuffer();
      const audioSize = buffer.byteLength;
      console.log('📏 Audio Size:', audioSize, 'bytes');
      
      // Save audio for verification
      const filename = `test-audio-${config.payload.metadata.testType}-${Date.now()}.mp3`;
      fs.writeFileSync(filename, Buffer.from(buffer));
      console.log('💾 Audio saved to:', filename);
      
      return { 
        success: true, 
        type: 'audio', 
        size: audioSize, 
        filename,
        responseTime,
        contentType 
      };
    }
    
    // Handle JSON responses from code nodes
    if (contentType.includes('application/json')) {
      const jsonData = await response.json();
      console.log('📄 JSON Response:', JSON.stringify(jsonData, null, 2));
      
      // Enhanced validation for code node responses
      const validation = validateCodeNodeResponse(jsonData, config.expectedResponseType);
      console.log('✅ Validation:', validation.valid ? 'PASSED' : 'FAILED');
      if (!validation.valid) {
        console.log('⚠️  Issues:', validation.issues);
      }
      
      return { 
        success: true, 
        type: 'json', 
        data: jsonData, 
        validation,
        responseTime,
        contentType 
      };
    }
    
    // Handle text responses
    const textData = await response.text();
    console.log('📝 Text Response:', textData);
    
    return { 
      success: true, 
      type: 'text', 
      data: textData, 
      responseTime,
      contentType 
    };
    
  } catch (error) {
    console.error('❌ Request Failed:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Validate code node response structure
 */
function validateCodeNodeResponse(data, expectedType) {
  const issues = [];
  
  // Check for common code node response patterns
  const hasReply = data?.reply || data?.message || data?.response || data?.text;
  const hasStructuredData = data?.data || data?.result || data?.output;
  
  if (!hasReply && !hasStructuredData) {
    issues.push('No recognizable response content found');
  }
  
  // Check for metadata that code nodes should include
  if (!data?.timestamp && !data?.metadata?.timestamp) {
    issues.push('Missing timestamp metadata');
  }
  
  // Validate expected response type
  if (expectedType === 'text' && !hasReply) {
    issues.push('Expected text response but found none');
  }
  
  if (expectedType === 'json' && !hasStructuredData) {
    issues.push('Expected structured data but found none');
  }
  
  return {
    valid: issues.length === 0,
    issues: issues,
    hasReply: !!hasReply,
    hasStructuredData: !!hasStructuredData
  };
}

/**
 * Run comprehensive workflow tests
 */
async function runCodeNodeTests() {
  console.log('🚀 Starting Code Node Workflow Tests');
  console.log('=' * 50);
  
  // Test endpoints
  const endpoints = [
    'https://n8n.hempstarai.com/webhook/n8n',
    'https://n8n.hempstarai.com/webhook-test/n8n'
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    console.log(`\n🌐 Testing Endpoint: ${endpoint}`);
    console.log('-' * 40);
    
    for (const [testName, config] of Object.entries(TEST_CONFIGS)) {
      const result = await testWorkflowEndpoint(endpoint, config);
      results.push({
        endpoint,
        testName,
        config: config.name,
        ...result
      });
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Generate summary report
  console.log('\n📊 TEST SUMMARY REPORT');
  console.log('=' * 50);
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Successful Tests: ${successful.length}/${results.length}`);
  console.log(`❌ Failed Tests: ${failed.length}/${results.length}`);
  
  if (successful.length > 0) {
    console.log('\n🎉 Successful Tests:');
    successful.forEach(r => {
      console.log(`  • ${r.config} (${r.endpoint}) - ${r.responseTime}ms`);
    });
  }
  
  if (failed.length > 0) {
    console.log('\n💥 Failed Tests:');
    failed.forEach(r => {
      console.log(`  • ${r.config} (${r.endpoint}) - ${r.error}`);
    });
  }
  
  // Performance analysis
  const responseTimes = successful.map(r => r.responseTime).filter(t => t);
  if (responseTimes.length > 0) {
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const maxResponseTime = Math.max(...responseTimes);
    const minResponseTime = Math.min(...responseTimes);
    
    console.log('\n⚡ Performance Metrics:');
    console.log(`  • Average Response Time: ${Math.round(avgResponseTime)}ms`);
    console.log(`  • Max Response Time: ${maxResponseTime}ms`);
    console.log(`  • Min Response Time: ${minResponseTime}ms`);
  }
  
  // Save detailed results
  const reportPath = `test-results-${Date.now()}.json`;
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n💾 Detailed results saved to: ${reportPath}`);
  
  return results;
}

/**
 * Test specific scenarios that code nodes excel at
 */
async function testCodeNodeFeatures() {
  console.log('\n🔬 Testing Code Node Specific Features');
  console.log('=' * 50);
  
  const codeNodeTests = [
    {
      name: 'Error Handling',
      payload: {
        message: 'trigger-error-test',
        nodeType: 'code',
        metadata: { testType: 'error-handling' }
      }
    },
    {
      name: 'Data Transformation',
      payload: {
        message: 'transform this data',
        nodeType: 'code',
        inputData: [1, 2, 3, 4, 5],
        transformation: 'square',
        metadata: { testType: 'data-transformation' }
      }
    },
    {
      name: 'Custom Headers Support',
      payload: {
        message: 'test custom headers',
        nodeType: 'code',
        metadata: { testType: 'custom-headers' }
      }
    }
  ];
  
  for (const test of codeNodeTests) {
    await testWorkflowEndpoint('https://n8n.hempstarai.com/webhook/n8n', test);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

// Run tests if called directly
if (require.main === module) {
  (async () => {
    try {
      await runCodeNodeTests();
      await testCodeNodeFeatures();
      console.log('\n🏁 All tests completed!');
    } catch (error) {
      console.error('💥 Test runner failed:', error);
      process.exit(1);
    }
  })();
}

module.exports = {
  testWorkflowEndpoint,
  runCodeNodeTests,
  testCodeNodeFeatures,
  validateCodeNodeResponse,
  TEST_CONFIGS
};