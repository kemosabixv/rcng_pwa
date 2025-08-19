<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description');
            $table->text('excerpt')->nullable();
            $table->enum('type', ['meeting', 'service', 'fundraiser', 'social', 'training', 'conference']);
            $table->enum('category', ['club_service', 'community_service', 'international_service', 'vocational_service']);
            $table->datetime('start_date');
            $table->datetime('end_date');
            $table->boolean('all_day')->default(false);
            $table->string('location')->nullable();
            $table->string('address')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->integer('max_attendees')->nullable();
            $table->decimal('registration_fee', 8, 2)->default(0);
            $table->datetime('registration_deadline')->nullable();
            $table->boolean('requires_registration')->default(false);
            $table->string('featured_image')->nullable();
            $table->json('gallery')->nullable();
            $table->enum('status', ['draft', 'published', 'cancelled', 'completed'])->default('draft');
            $table->enum('visibility', ['public', 'members_only', 'private'])->default('public');
            $table->boolean('is_featured')->default(false);
            $table->json('tags')->nullable();
            $table->text('notes')->nullable();
            $table->json('contact_info')->nullable();
            $table->json('custom_fields')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
            
            $table->index(['status', 'visibility']);
            $table->index(['start_date', 'end_date']);
            $table->index(['type', 'category']);
            $table->index('is_featured');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
