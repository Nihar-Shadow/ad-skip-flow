// Debug login script
const { auth } = require('./src/lib/auth.ts');

async function testLogin() {
  console.log('Testing login with pikachu / Ad@123');
  
  // Test the exact credentials you're using
  const result = await auth.login('pikachu', 'Ad@123');
  
  console.log('Login result:', result);
  
  if (result) {
    console.log('✅ Login successful!');
    console.log('User data:', result);
  } else {
    console.log('❌ Login failed');
    
    // Let's check what users are available
    console.log('\nAvailable hardcoded users:');
    console.log('- pikachu / Ad@123 (admin)');
    console.log('- fkingdev / Fd@123 (developer)');
  }
}

testLogin().catch(console.error);