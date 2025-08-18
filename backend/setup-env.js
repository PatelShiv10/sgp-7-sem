const fs = require('fs');
const path = require('path');

// Environment variables template
const envTemplate = `# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/lawmate

# JWT Secret for authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Email Configuration (for password reset and notifications)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Server Configuration
PORT=5000

# Optional: Node Environment
NODE_ENV=development
`;

const envPath = path.join(__dirname, '.env');

// Check if .env file already exists
if (fs.existsSync(envPath)) {
  console.log('✅ .env file already exists');
  console.log('Please make sure it contains the following variables:');
  console.log('- MONGO_URI');
  console.log('- JWT_SECRET');
  console.log('- EMAIL_USER');
  console.log('- EMAIL_PASS');
  console.log('- PORT (optional, defaults to 5000)');
  console.log('- NODE_ENV (optional, defaults to development)');
} else {
  // Create .env file
  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ Created .env file with template values');
  console.log('⚠️  Please update the values in backend/.env with your actual configuration:');
  console.log('1. Set MONGO_URI to your MongoDB connection string');
  console.log('2. Set JWT_SECRET to a secure random string');
  console.log('3. Set EMAIL_USER and EMAIL_PASS for email functionality');
  console.log('4. Optionally set PORT and NODE_ENV');
}

console.log('\n📝 Instructions:');
console.log('1. Edit backend/.env and replace placeholder values with your actual configuration');
console.log('2. For MongoDB: Use mongodb://localhost:27017/lawmate for local development');
console.log('3. For JWT_SECRET: Generate a secure random string (at least 32 characters)');
console.log('4. For email: Use Gmail with App Password or other SMTP provider');
console.log('5. Restart your backend server after making changes');
