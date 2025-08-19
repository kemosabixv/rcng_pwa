const { execSync } = require('child_process');

console.log('🚀 Running database migrations...');

try {
  // Run the migration command
  console.log('📦 Running migrations...');
  execSync('cd backend && php artisan migrate:refresh', { stdio: 'inherit' });
  
  console.log('✅ Migrations completed successfully!');
  
  // Optional: Run seeders to populate with sample data
  console.log('🌱 Running seeders...');
  execSync('cd backend && php artisan db:seed --class=DatabaseSeeder', { stdio: 'inherit' });
  
  console.log('✅ Database setup completed successfully!');
  console.log('🎉 Events table is now ready to use');
  
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}
