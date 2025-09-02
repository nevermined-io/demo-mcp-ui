/**
 * Simple script to test debugging
 * Run: node debug-test.js
 */

const http = require('http');

function testServer() {
  console.log('🧪 Testing server...');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/agent',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test-key'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`📊 Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('📄 Response:', data);
    });
  });

  req.on('error', (error) => {
    console.error('❌ Error:', error.message);
  });

  req.write(JSON.stringify({
    input_query: 'Test message for debugging'
  }));
  
  req.end();
}

// Run the test after 2 seconds to give the server time to start
setTimeout(testServer, 2000); 