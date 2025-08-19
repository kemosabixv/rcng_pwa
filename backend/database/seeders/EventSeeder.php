<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Event;
use App\Models\User;
use Carbon\Carbon;

class EventSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first();
        if (!$admin) {
            $admin = User::factory()->create(['role' => 'admin']);
        }

        $events = [
            [
                'title' => 'Weekly Club Meeting',
                'description' => 'Regular club meeting with guest speaker Dr. Sarah Johnson on Global Water Crisis Solutions. Join us for an informative session about current global challenges and how we can make a difference through our service projects.',
                'excerpt' => 'Regular club meeting with guest speaker Dr. Sarah Johnson on Global Water Crisis Solutions.',
                'type' => 'meeting',
                'category' => 'club_service',
                'start_date' => Carbon::now()->addDays(7)->setHour(12)->setMinute(0),
                'end_date' => Carbon::now()->addDays(7)->setHour(13)->setMinute(30),
                'location' => 'Downtown Community Center',
                'address' => '123 Main Street, Downtown',
                'status' => 'published',
                'visibility' => 'public',
                'is_featured' => true,
                'tags' => ['meeting', 'speaker', 'water-crisis'],
                'contact_info' => [
                    'email' => 'meetings@rcng.org',
                    'phone' => '+254 700 123 456'
                ],
                'created_by' => $admin->id,
            ],
            [
                'title' => 'Community Food Drive',
                'description' => 'Annual food drive to support local food banks. Volunteers needed to collect and sort donations. We aim to collect 1000+ food items to support families in need during this season.',
                'excerpt' => 'Annual food drive to support local food banks. Volunteers needed to collect and sort donations.',
                'type' => 'service',
                'category' => 'community_service',
                'start_date' => Carbon::now()->addDays(14)->setHour(9)->setMinute(0),
                'end_date' => Carbon::now()->addDays(14)->setHour(16)->setMinute(0),
                'location' => 'City Mall Parking Lot',
                'address' => 'City Mall, Ruiru',
                'max_attendees' => 50,
                'requires_registration' => true,
                'registration_deadline' => Carbon::now()->addDays(12),
                'status' => 'published',
                'visibility' => 'public',
                'is_featured' => true,
                'tags' => ['food-drive', 'community', 'volunteer'],
                'contact_info' => [
                    'email' => 'volunteer@rcng.org',
                    'phone' => '+254 700 123 456'
                ],
                'created_by' => $admin->id,
            ],
            [
                'title' => 'Scholarship Fundraiser Gala',
                'description' => 'Annual gala to raise funds for our youth scholarship program. Featuring dinner, auction, and entertainment. Help us support local students achieve their educational dreams.',
                'excerpt' => 'Annual gala to raise funds for our youth scholarship program. Featuring dinner, auction, and entertainment.',
                'type' => 'fundraiser',
                'category' => 'community_service',
                'start_date' => Carbon::now()->addDays(28)->setHour(18)->setMinute(0),
                'end_date' => Carbon::now()->addDays(28)->setHour(22)->setMinute(0),
                'location' => 'Grand Hotel Ballroom',
                'address' => 'Grand Hotel, Thika Road',
                'max_attendees' => 200,
                'registration_fee' => 5000.00,
                'requires_registration' => true,
                'registration_deadline' => Carbon::now()->addDays(25),
                'status' => 'published',
                'visibility' => 'public',
                'is_featured' => true,
                'tags' => ['fundraiser', 'gala', 'scholarship', 'education'],
                'contact_info' => [
                    'email' => 'events@rcng.org',
                    'phone' => '+254 700 123 456'
                ],
                'created_by' => $admin->id,
            ],
            [
                'title' => 'Park Cleanup Day',
                'description' => 'Join us for our quarterly park cleanup initiative. All supplies provided. Let\'s work together to keep our community green spaces beautiful and accessible for everyone.',
                'excerpt' => 'Join us for our quarterly park cleanup initiative. All supplies provided.',
                'type' => 'service',
                'category' => 'community_service',
                'start_date' => Carbon::now()->addDays(35)->setHour(8)->setMinute(0),
                'end_date' => Carbon::now()->addDays(35)->setHour(12)->setMinute(0),
                'location' => 'Riverside Park',
                'address' => 'Riverside Park, Ruiru',
                'max_attendees' => 30,
                'requires_registration' => true,
                'registration_deadline' => Carbon::now()->addDays(33),
                'status' => 'published',
                'visibility' => 'public',
                'tags' => ['cleanup', 'environment', 'community'],
                'contact_info' => [
                    'email' => 'cleanup@rcng.org',
                    'phone' => '+254 700 123 456'
                ],
                'created_by' => $admin->id,
            ],
            [
                'title' => 'Rotary Youth Leadership Workshop',
                'description' => 'A comprehensive leadership development workshop for young people aged 18-30. Topics include public speaking, project management, and community engagement.',
                'excerpt' => 'A comprehensive leadership development workshop for young people aged 18-30.',
                'type' => 'training',
                'category' => 'vocational_service',
                'start_date' => Carbon::now()->addDays(42)->setHour(9)->setMinute(0),
                'end_date' => Carbon::now()->addDays(42)->setHour(17)->setMinute(0),
                'location' => 'RCNG Conference Room',
                'address' => 'RCNG Offices, Ruiru',
                'max_attendees' => 25,
                'registration_fee' => 1000.00,
                'requires_registration' => true,
                'registration_deadline' => Carbon::now()->addDays(38),
                'status' => 'published',
                'visibility' => 'public',
                'tags' => ['leadership', 'youth', 'training', 'workshop'],
                'contact_info' => [
                    'email' => 'youth@rcng.org',
                    'phone' => '+254 700 123 456'
                ],
                'created_by' => $admin->id,
            ],
            [
                'title' => 'Global Water Initiative Planning Meeting',
                'description' => 'Strategic planning session for our international water access project in rural Kenya. Members only event to discuss project timelines and funding requirements.',
                'excerpt' => 'Strategic planning session for our international water access project in rural Kenya.',
                'type' => 'meeting',
                'category' => 'international_service',
                'start_date' => Carbon::now()->addDays(21)->setHour(14)->setMinute(0),
                'end_date' => Carbon::now()->addDays(21)->setHour(16)->setMinute(0),
                'location' => 'RCNG Boardroom',
                'address' => 'RCNG Offices, Ruiru',
                'status' => 'published',
                'visibility' => 'members_only',
                'tags' => ['international', 'water', 'planning'],
                'contact_info' => [
                    'email' => 'international@rcng.org',
                    'phone' => '+254 700 123 456'
                ],
                'created_by' => $admin->id,
            ],
        ];

        foreach ($events as $eventData) {
            Event::create($eventData);
        }
    }
}
