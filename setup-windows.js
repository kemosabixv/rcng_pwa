const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting RCNG setup...');

try {
  // Step 1: Install dependencies
  console.log('📦 Installing frontend dependencies...');
  execSync('cd frontend && npm install', { stdio: 'inherit' });
  
  console.log('📦 Installing backend dependencies...');
  execSync('cd backend && composer install', { stdio: 'inherit' });
  
  // Step 2: Copy .env file
  console.log('⚙️  Setting up environment file...');
  const envExamplePath = path.join(__dirname, 'backend', '.env.example');
  const envPath = path.join(__dirname, 'backend', '.env');
  
  if (fs.existsSync(envExamplePath)) {
    if (!fs.existsSync(envPath)) {
      fs.copyFileSync(envExamplePath, envPath);
      console.log('✅ Created .env file from .env.example');
    } else {
      console.log('ℹ️  .env file already exists');
    }
  } else {
    console.log('⚠️  .env.example not found');
  }
  
  // Step 3: Generate application key
  console.log('🔑 Generating application key...');
  execSync('cd backend && php artisan key:generate', { stdio: 'inherit' });
  
  console.log('✅ Setup completed successfully!');
  console.log('🎉 You can now run "npm run dev" to start the application');
  
} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
}
