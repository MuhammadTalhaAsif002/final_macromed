<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // PostgreSQL-compatible enum modification
        DB::statement("ALTER TYPE interaction_type_enum ADD VALUE IF NOT EXISTS 'lifecycle';");
    }

    public function down()
    {
        // Note: PostgreSQL doesn't support removing enum values easily
        // This would require recreating the enum type
        // For now, we'll leave it as is since removing enum values is complex in PostgreSQL
    }
};
