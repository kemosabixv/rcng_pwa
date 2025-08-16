#!/usr/bin/env node

/**
 * API Test Script
 * Tests the Laravel backend API endpoints to ensure they're working
 */

const API_BASE = 'http://localhost:8000/api';

async function testEndpoint(endpoint, description) {
  try {
    console.log(`🔍 Testing: ${description}`);
    console.log(`   URL: ${API_BASE}${endpoint}`);
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log(`   ✅ Status: ${response.status}`);
      console.log(`   📊 Data: ${data.success ? 'Success' : 'No success flag'}`);
      if (data.data && Array.isArray(data.data.data)) {
        console.log(`   📝 Items: ${data.data.data.length} items found`);
      } else if (data.data) {
        console.log(`   📝 Data: ${typeof data.data} returned`);
      }
    } else {
      console.log(`   ❌ Status: ${response.status}`);
      console.log(`   ⚠️  Error: ${data.message || data.error || 'Unknown error'}`);
    }
    
    console.log('');
    return response.ok;
    
  } catch (error) {
    console.log(`   💥 Network Error: ${error.message}`);
    console.log('');
    return false;
  }
}

async function runTests() {
  console.log('🚀 Testing Laravel API Endpoints\n');
  
  const tests = [
    ['/public/blog-posts', 'Public Blog Posts List'],
    ['/public/blog-posts/featured/current', 'Featured Blog Post'],
    ['/public/blog-posts?category=Community Service', 'Blog Posts by Category'],
    ['/public/blog-posts?page=1&per_page=5', 'Paginated Blog Posts'],
    ['/public/members', 'Public Members Directory'],
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const [endpoint, description] of tests) {
    const success = await testEndpoint(endpoint, description);
    if (success) passed++;
  }
  
  console.log('📊 Test Results:');
  console.log(`   ✅ Passed: ${passed}/${total}`);
  console.log(`   ❌ Failed: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 All API endpoints are working correctly!');
  } else {
    console.log('\n⚠️  Some API endpoints have issues.');
  }
}

runTests().catch(console.error);
