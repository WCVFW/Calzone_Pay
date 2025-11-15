import fetch from 'node-fetch';

async function testAPI() {
  try {
    console.log('Testing server health check...\n');
    const response = await fetch('http://localhost:3000/', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const data = await response.json();
    console.log('✅ Server is responding!');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    // Now test signup
    console.log('\n\nTesting signup endpoint...\n');
    const signupResponse = await fetch('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phone: '9876543210',
        password: 'Test@123'
      })
    });
    
    const signupData = await signupResponse.json();
    console.log('✅ Signup endpoint works!');
    console.log('Status:', signupResponse.status);
    console.log('Response:', JSON.stringify(signupData, null, 2));
    
  } catch (err) {
    console.error('❌ Error testing API:');
    console.error(err.message);
    process.exit(1);
  }
}

testAPI();
