<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->string('address')->nullable();
            $table->string('city')->default('Dubai');
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('locations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')
                ->constrained('companies')
                ->restrictOnDelete();
            $table->string('name');
            $table->string('code')->unique();
            $table->string('address')->nullable();
            $table->string('city')->default('Dubai');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::table('employees', function (Blueprint $table) {
            $table->date('passport_issue_date')->nullable()->after('passport_number');
            $table->string('labour_card_id')->nullable()->after('passport_issue_date');
            $table->string('home_phone')->nullable()->after('phone');
            $table->string('address')->nullable()->after('home_phone');

            $table->string('father_name')->nullable()->after('address');
            $table->string('religion')->nullable()->after('father_name');
            $table->string('blood_group')->nullable()->after('religion');

            $table->string('emergency_contact_person')->nullable()->after('blood_group');
            $table->string('emergency_contact_number')->nullable()->after('emergency_contact_person');
            $table->string('emergency_contact_email')->nullable()->after('emergency_contact_number');

            $table->string('company_visa_mol_id')->nullable()->after('emergency_contact_email');

            $table->foreignId('company_id')
                ->nullable()
                ->after('company_visa_mol_id')
                ->constrained('companies')
                ->nullOnDelete();

            $table->foreignId('location_id')
                ->nullable()
                ->after('company_id')
                ->constrained('locations')
                ->nullOnDelete();

            $table->string('employment_type')->nullable()->after('contract_type');
            $table->string('salary_transfer_method')->nullable()->after('employment_type');
        });
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->dropForeign(['company_id']);
            $table->dropForeign(['location_id']);

            $table->dropColumn([
                'passport_issue_date',
                'labour_card_id',
                'home_phone',
                'address',
                'father_name',
                'religion',
                'blood_group',
                'emergency_contact_person',
                'emergency_contact_number',
                'emergency_contact_email',
                'company_visa_mol_id',
                'company_id',
                'location_id',
                'employment_type',
                'salary_transfer_method',
            ]);
        });

        Schema::dropIfExists('locations');
        Schema::dropIfExists('companies');
    }
};