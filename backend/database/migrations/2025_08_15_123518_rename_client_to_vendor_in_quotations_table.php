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
            $table->renameColumn('client_name', 'vendor_name');
            $table->renameColumn('client_email', 'vendor_email');
            $table->renameColumn('client_phone', 'vendor_phone');
            $table->renameColumn('client_company', 'vendor_company');
            $table->renameColumn('client_address', 'vendor_address');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('quotations', function (Blueprint $table) {
            $table->renameColumn('vendor_name', 'client_name');
            $table->renameColumn('vendor_email', 'client_email');
            $table->renameColumn('vendor_phone', 'client_phone');
            $table->renameColumn('vendor_company', 'client_company');
            $table->renameColumn('vendor_address', 'client_address');
        });
    }
};
