import React, { useEffect, useState } from 'react';

export function ApiTest() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    testApi();
  }, []);

  const testApi = async () => {
    const results: string[] = [];
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      results.push(`🔧 API Base URL: ${apiUrl}`);
      
      // Test 1: Basic connectivity
      results.push('\n🌐 Testing basic connectivity...');
      try {
        const response = await fetch(`${apiUrl}/public/blog-posts`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        
        results.push(`✅ Response Status: ${response.status}`);
        results.push(`✅ Response OK: ${response.ok}`);
        
        if (response.ok) {
          const data = await response.json();
          results.push(`✅ Data Success: ${data.success}`);
          results.push(`✅ Data Type: ${typeof data.data}`);
          if (data.data && data.data.data) {
            results.push(`✅ Blog Posts Count: ${data.data.data.length}`);
          }
        } else {
          const errorText = await response.text();
          results.push(`❌ Error Response: ${errorText}`);
        }
      } catch (error) {
        results.push(`❌ Network Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      // Test 2: Featured post
      results.push('\n🌟 Testing featured post...');
      try {
        const response = await fetch(`${apiUrl}/public/blog-posts/featured/current`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        
        results.push(`✅ Featured Status: ${response.status}`);
        if (response.ok) {
          const data = await response.json();
          results.push(`✅ Featured Success: ${data.success}`);
          results.push(`✅ Featured Data: ${data.data ? 'Available' : 'None'}`);
        }
      } catch (error) {
        results.push(`❌ Featured Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
    } catch (error) {
      results.push(`💥 General Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    setTestResults(results);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        <p>🔄 Testing API connectivity...</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="font-bold mb-2">🧪 API Test Results</h3>
      <pre className="text-sm whitespace-pre-wrap">
        {testResults.join('\n')}
      </pre>
      <button 
        onClick={() => { setLoading(true); testApi(); }}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        🔄 Run Test Again
      </button>
    </div>
  );
}
