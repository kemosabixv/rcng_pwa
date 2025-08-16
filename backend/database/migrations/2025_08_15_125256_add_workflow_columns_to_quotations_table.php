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
        Schema::table('quotations', function (Blueprint $table) {
            $table->timestamp('sent_at')->nullable()->after('status');
            $table->timestamp('accepted_at')->nullable()->after('sent_at');
            $table->foreignId('accepted_by')->nullable()->after('accepted_at')->constrained('users')->onDelete('set null');
            $table->text('accepted_notes')->nullable()->after('accepted_by');
            $table->timestamp('rejected_at')->nullable()->after('accepted_notes');
            $table->foreignId('rejected_by')->nullable()->after('rejected_at')->constrained('users')->onDelete('set null');
            $table->string('rejection_reason')->nullable()->after('rejected_by');
            $table->text('rejection_notes')->nullable()->after('rejection_reason');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('quotations', function (Blueprint $table) {
            $table->dropForeign(['accepted_by']);
            $table->dropForeign(['rejected_by']);
            $table->dropColumn([
                'sent_at',
                'accepted_at',
                'accepted_by',
                'accepted_notes',
                'rejected_at',
                'rejected_by',
                'rejection_reason',
                'rejection_notes'
            ]);
        });
    }
};
