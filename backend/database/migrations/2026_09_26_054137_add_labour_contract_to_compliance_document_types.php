<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            ALTER TABLE compliance_documents
            MODIFY COLUMN document_type
            ENUM('Passport', 'Visa', 'Emirates ID', 'Labour Card', 'Medical Insurance', 'Labour Contract', 'Other')
            NOT NULL
        ");
    }

    public function down(): void
    {
        DB::statement("
            ALTER TABLE compliance_documents
            MODIFY COLUMN document_type
            ENUM('Passport', 'Visa', 'Emirates ID', 'Labour Card', 'Medical Insurance', 'Other')
            NOT NULL
        ");
    }
};
