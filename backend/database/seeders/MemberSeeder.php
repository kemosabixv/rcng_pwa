<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class MemberSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create additional realistic members
        if (app()->environment(['local', 'development'])) {
            // Create 15 additional random members
            User::factory(15)->create();
            
            $this->command->info('Created 15 additional sample members.');
        }
    }
}
