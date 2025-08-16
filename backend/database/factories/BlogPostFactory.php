<?php

namespace Database\Factories;

use App\Models\BlogPost;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\BlogPost>
 */
class BlogPostFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = fake()->sentence(6, true);
        $content = fake()->paragraphs(8, true);
        $excerpt = fake()->paragraph(3);
        
        // Calculate read time based on content
        $wordCount = str_word_count(strip_tags($content));
        $readTime = max(1, ceil($wordCount / 200));

        return [
            'title' => $title,
            'slug' => Str::slug($title),
            'excerpt' => $excerpt,
            'content' => $content,
            'category' => fake()->randomElement(BlogPost::getCategories()),
            'featured_image' => 'https://images.unsplash.com/photo-' . fake()->numberBetween(1580000000000, 1699999999999) . '?auto=format&fit=crop&w=600&h=300',
            'is_featured' => false,
            'is_published' => fake()->boolean(85), // 85% chance of being published
            'published_at' => fake()->boolean(85) ? fake()->dateTimeBetween('-6 months', 'now') : null,
            'views' => fake()->numberBetween(50, 1000),
            'read_time' => $readTime,
            'tags' => fake()->randomElements(['Rotary', 'Community Service', 'International', 'Youth', 'Education', 'Service', 'Volunteer', 'Charity'], fake()->numberBetween(1, 4)),
            'meta_description' => fake()->paragraph(1),
            'author_id' => User::whereIn('role', ['admin', 'blog_manager'])->inRandomOrder()->first()?->id ?? User::factory(),
        ];
    }

    /**
     * Indicate that the post is featured.
     */
    public function featured(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_featured' => true,
            'is_published' => true,
            'published_at' => fake()->dateTimeBetween('-1 month', 'now'),
        ]);
    }

    /**
     * Indicate that the post is a draft.
     */
    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_published' => false,
            'published_at' => null,
        ]);
    }

    /**
     * Indicate that the post is published.
     */
    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_published' => true,
            'published_at' => fake()->dateTimeBetween('-6 months', 'now'),
        ]);
    }

    /**
     * Create a post with specific category.
     */
    public function category(string $category): static
    {
        return $this->state(fn (array $attributes) => [
            'category' => $category,
        ]);
    }
}
