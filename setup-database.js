#!/usr/bin/env node

/**
 * Database Setup Script
 * Sets up the Laravel backend database with migrations and sample data
 */

const { spawn } = require('child_process');
const path = require('path');

const BACKEND_DIR = path.join(__dirname, 'backend');

console.log('🚀 Setting up database for development...\n');

function runCommand(command, args, cwd = BACKEND_DIR) {
  return new Promise((resolve, reject) => {
    console.log(`📝 Running: ${command} ${args.join(' ')}`);
    
    const child = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: true
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function setupDatabase() {
  try {
    console.log('1️⃣ Running database migrations...');
    await runCommand('php', ['artisan', 'migrate', '--force']);
    
    console.log('\n2️⃣ Seeding database with sample data...');
    await runCommand('php', ['artisan', 'db:seed', '--force']);
    
    console.log('\n✅ Database setup completed successfully!');
    console.log('\n📊 Your backend now has:');
    console.log('   • Admin user: admin@rcng.local / Admin@2025');
    console.log('   • Sample members and blog posts');
    console.log('   • API endpoints ready for frontend');
    
  } catch (error) {
    console.error('\n❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

setupDatabase();
