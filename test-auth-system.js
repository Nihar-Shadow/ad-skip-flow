// Test the authentication system
const { auth } = require('./src/lib/auth.ts');

console.log('Testing Authentication System...');

// Test login with admin credentials
console.log('\n1. Testing Admin Login:');
const adminResult = auth.login('pikachu', 'Ad@123');
console.log('Admin login result:', adminResult);

if (adminResult.success) {
  console.log('✓ Admin login successful');
  console.log('Current user:', auth.getCurrentUser());
  console.log('Is authenticated:', auth.isAuthenticated());
  console.log('Has admin role:', auth.hasRole('admin'));
  
  // Test logout
  console.log('\n2. Testing Logout:');
  auth.logout();
  console.log('After logout - Is authenticated:', auth.isAuthenticated());
  console.log('Current user:', auth.getCurrentUser());
}

// Test login with developer credentials
console.log('\n3. Testing Developer Login:');
const devResult = auth.login('fkingdev', 'Fd@123');
console.log('Developer login result:', devResult);

if (devResult.success) {
  console.log('✓ Developer login successful');
  console.log('Current user:', auth.getCurrentUser());
  console.log('Is authenticated:', auth.isAuthenticated());
  console.log('Has developer role:', auth.hasRole('developer'));
}

// Test invalid credentials
console.log('\n4. Testing Invalid Credentials:');
const invalidResult = auth.login('wronguser', 'wrongpass');
console.log('Invalid login result:', invalidResult);

console.log('\n✅ Authentication system test completed!');