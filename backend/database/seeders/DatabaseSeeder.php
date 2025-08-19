<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create default admin user
        $adminEmail = 'admin@rcng.local';
        $adminPassword = 'Admin@2025'; // Consistent admin password
        
        $admin = User::firstOrCreate(
            ['email' => $adminEmail],
            [
                'name' => 'System Administrator',
                'password' => Hash::make($adminPassword),
                'phone' => '+254700000000',
                'role' => 'admin',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        $this->command->info('==============================================');
        $this->command->info('DEFAULT ADMIN CREDENTIALS');
        $this->command->info('Email: ' . $adminEmail);
        $this->command->info('Password: ' . $adminPassword);
        $this->command->info('==============================================');
        $this->command->info('IMPORTANT: Save these credentials in a secure place.');
        $this->command->info('You should change the password after first login.');
        $this->command->info('==============================================');

        // Create test users if in local environment
        if (app()->environment('local')) {
            // Create realistic Rotary Club members
            $members = [
                [
                    'name' => 'Dr. Michael Chen',
                    'email' => 'michael.chen@example.com',
                    'phone' => '+254-700-123-456',
                    'profession' => 'Physician',
                    'company' => 'Nairobi Medical Center',
                    'role' => 'member',
                    'status' => 'active',
                ],
                [
                    'name' => 'Jennifer Adams',
                    'email' => 'jennifer.adams@example.com',
                    'phone' => '+254-700-234-567',
                    'profession' => 'Attorney',
                    'company' => 'Adams & Associates Law Firm',
                    'role' => 'member',
                    'status' => 'active',
                ],
                [
                    'name' => 'David Brown',
                    'email' => 'david.brown@example.com',
                    'phone' => '+254-700-345-678',
                    'profession' => 'Financial Advisor',
                    'company' => 'Brown Financial Services',
                    'role' => 'member',
                    'status' => 'active',
                ],
                [
                    'name' => 'Sarah Wilson',
                    'email' => 'sarah.wilson@example.com',
                    'phone' => '+254-700-456-789',
                    'profession' => 'Engineer',
                    'company' => 'Wilson Engineering Solutions',
                    'role' => 'member',
                    'status' => 'active',
                ],
                [
                    'name' => 'Robert Johnson',
                    'email' => 'robert.johnson@example.com',
                    'phone' => '+254-700-567-890',
                    'profession' => 'Business Owner',
                    'company' => 'Johnson Trading Company',
                    'role' => 'member',
                    'status' => 'active',
                ],
                [
                    'name' => 'Emily Davis',
                    'email' => 'emily.davis@example.com',
                    'phone' => '+254-700-678-901',
                    'profession' => 'Educator',
                    'company' => 'Nairobi International School',
                    'role' => 'member',
                    'status' => 'active',
                ],
                [
                    'name' => 'James Miller',
                    'email' => 'james.miller@example.com',
                    'phone' => '+254-700-789-012',
                    'profession' => 'Architect',
                    'company' => 'Miller Design Studio',
                    'role' => 'member',
                    'status' => 'active',
                ],
                [
                    'name' => 'Maria Garcia',
                    'email' => 'maria.garcia@example.com',
                    'phone' => '+254-700-890-123',
                    'profession' => 'Marketing Director',
                    'company' => 'Garcia Marketing Agency',
                    'role' => 'member',
                    'status' => 'active',
                ],
            ];

            foreach ($members as $memberData) {
                User::factory()->create($memberData);
            }

            $this->command->info('Created ' . count($members) . ' sample members for local development.');

            // Call additional seeders
            $this->call([
                MemberSeeder::class,
                BlogSeeder::class,
                EventSeeder::class,
            ]);
        }
    }
}
