/**
 * Test script for checking if /api/agent works
 * Ejecuta: node test-debug.js
 */

const fetch = require('node-fetch');

async function testAgentEndpoint() {
  try {
    console.log('🧪 Testing task creation /api/agent...');
    
    const response = await fetch('http://localhost:3000/api/agent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-api-key'
      },
      body: JSON.stringify({
        input_query: 'Test message for debugging'
      })
    });
    
    console.log('📊 Status:', response.status);
    console.log('📋 Headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.text();
    console.log('📄 Response:', data);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the test
testAgentEndpoint(); 