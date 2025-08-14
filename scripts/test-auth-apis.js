
#!/usr/bin/env node

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const TEST_ENDPOINTS = [
  '/api/auth/check-token',
  '/api/auth/cookie-check',
  '/api/auth/user'
];

console.log('🧪 Auth API Testing Script');
console.log('==========================');
console.log(`Base URL: ${BASE_URL}`);
console.log('');

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.request(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'PathPiper-Auth-Tester/1.0',
        'Accept': 'application/json',
        ...options.headers
      },
      ...options
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData,
            success: res.statusCode >= 200 && res.statusCode < 300
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data,
            success: res.statusCode >= 200 && res.statusCode < 300,
            parseError: error.message
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

// Test individual endpoint
async function testEndpoint(endpoint) {
  const url = `${BASE_URL}${endpoint}`;
  const startTime = Date.now();
  
  try {
    console.log(`Testing: ${endpoint}`);
    const result = await makeRequest(url);
    const responseTime = Date.now() - startTime;
    
    console.log(`  Status: ${result.status}`);
    console.log(`  Response Time: ${responseTime}ms`);
    console.log(`  Success: ${result.success ? '✅' : '❌'}`);
    
    if (result.parseError) {
      console.log(`  Parse Error: ${result.parseError}`);
    }
    
    if (result.data) {
      console.log(`  Response Preview:`, JSON.stringify(result.data, null, 2).slice(0, 200) + '...');
    }
    
    console.log('');
    return result;
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.log(`  Error: ${error.message}`);
    console.log(`  Response Time: ${responseTime}ms`);
    console.log(`  Success: ❌`);
    console.log('');
    return { success: false, error: error.message, responseTime };
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting API tests...\n');
  
  const results = [];
  
  for (const endpoint of TEST_ENDPOINTS) {
    const result = await testEndpoint(endpoint);
    results.push({ endpoint, ...result });
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Summary
  console.log('📊 Test Summary');
  console.log('===============');
  
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log(`Total Tests: ${total}`);
  console.log(`Successful: ${successful}`);
  console.log(`Failed: ${total - successful}`);
  console.log(`Success Rate: ${((successful / total) * 100).toFixed(1)}%`);
  console.log('');
  
  // Detailed results
  results.forEach(result => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${result.endpoint} (${result.status || 'ERROR'})`);
  });
  
  console.log('\n🏁 Testing completed!');
  
  if (successful === total) {
    console.log('🎉 All tests passed! Your auth APIs are working correctly.');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Check the results above.');
    process.exit(1);
  }
}

// Run the tests
runAllTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
