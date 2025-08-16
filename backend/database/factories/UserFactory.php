<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $professions = [
            'Doctor', 'Lawyer', 'Engineer', 'Teacher', 'Business Owner',
            'Accountant', 'Architect', 'Consultant', 'Marketing Manager',
            'Financial Advisor', 'Real Estate Agent', 'IT Specialist'
        ];

        $companies = [
            'Kenya Medical Center', 'Nairobi Law Associates', 'Tech Solutions Ltd',
            'Educational Services Kenya', 'Business Consulting Group', 'Financial Partners',
            'Design & Architecture Studio', 'Marketing Excellence Agency', 'Property Plus',
            'IT Systems Kenya', 'Healthcare Partners', 'Legal Advisors LLP'
        ];

        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'phone' => '+254-' . fake()->numerify('7##-###-###'),
            'profession' => fake()->randomElement($professions),
            'company' => fake()->randomElement($companies),
            'role' => 'member',
            'status' => 'active',
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
