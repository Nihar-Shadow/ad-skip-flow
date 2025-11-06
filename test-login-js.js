// Simple JavaScript version for testing
const HARDCODED_USERS = [
  {
    id: "1",
    username: "pikachu",
    password: "Ad@123",
    role: "admin"
  },
  {
    id: "2",
    username: "fkingdev",
    password: "Fd@123",
    role: "developer"
  }
];

function login(username, password) {
  console.log('Attempting login for username:', username);
  
  const user = HARDCODED_USERS.find(
    u => u.username === username && u.password === password
  );

  console.log('Login result:', { user: user ? 'found' : 'not found' });

  if (!user) {
    console.log('Login failed - invalid credentials');
    return null;
  }

  // Create user object without password
  const userData = {
    id: user.id,
    username: user.username,
    role: user.role,
    created_at: new Date().toISOString()
  };

  // Store session in localStorage (skip in Node.js)
  const authUser = {
    username: userData.username,
    role: userData.role,
    loggedIn: true
  };
  // localStorage.setItem('auth_user', JSON.stringify(authUser)); // Commented out for Node.js test

  return userData;
}

// Test the login
console.log('Testing login with pikachu / Ad@123');
const result = login('pikachu', 'Ad@123');
console.log('Final result:', result);

if (result) {
  console.log('✅ Login successful!');
  console.log('User data:', result);
} else {
  console.log('❌ Login failed');
}