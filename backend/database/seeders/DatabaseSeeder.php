<?php

namespace Database\Seeders;

use App\Models\Attendance;
use App\Models\Branch;
use App\Models\Company;
use App\Models\ComplianceDocument;
use App\Models\Department;
use App\Models\Designation;
use App\Models\Employee;
use App\Models\LeaveBalance;
use App\Models\Location;
use App\Models\LeaveType;
use App\Models\PayrollRun;
use App\Models\Payslip;
use App\Models\Permission;
use App\Models\Policy;
use App\Models\PublicHoliday;
use App\Models\Role;
use App\Models\SalaryStructure;
use App\Models\Shift;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Companies & Locations
        $companyBespoke = Company::create([
            'name' => 'Bespoke Haute Couture Tailoring LLC',
            'code' => 'BHC',
            'address' => 'Business Bay, Dubai, UAE',
            'city' => 'Dubai',
            'phone' => '+971 4 398 2200',
            'email' => 'info@tailoringhrms.ae',
            'is_active' => true,
        ]);

        $companyAtelier = Company::create([
            'name' => 'Bespoke Fashion Atelier FZ-LLC',
            'code' => 'BFA',
            'address' => 'Al Maryah Island, Abu Dhabi, UAE',
            'city' => 'Abu Dhabi',
            'phone' => '+971 2 445 1100',
            'email' => 'atelier@tailoringhrms.ae',
            'is_active' => true,
        ]);

        $locationDubai = Location::create([
            'company_id' => $companyBespoke->id,
            'name' => 'Dubai Headquarters',
            'code' => 'BHC-DXB',
            'address' => 'Bay Square, Business Bay, Dubai, UAE',
            'city' => 'Dubai',
            'is_active' => true,
        ]);

        $locationSharjah = Location::create([
            'company_id' => $companyBespoke->id,
            'name' => 'Sharjah Tailoring Workshop',
            'code' => 'BHC-SHJ',
            'address' => 'Al Majaz, Sharjah, UAE',
            'city' => 'Sharjah',
            'is_active' => true,
        ]);

        $locationAbuDhabi = Location::create([
            'company_id' => $companyAtelier->id,
            'name' => 'Abu Dhabi Atelier',
            'code' => 'BFA-AUH',
            'address' => 'Al Maryah Island, Abu Dhabi, UAE',
            'city' => 'Abu Dhabi',
            'is_active' => true,
        ]);
        // 2. Create Branches
        $branchDubai = Branch::create([
            'name' => 'Dubai Headquarters (Business Bay)',
            'code' => 'DXB-HQ',
            'city' => 'Dubai',
            'address' => 'Floor 18, Bay Square Building 07, Business Bay, Dubai, UAE',
            'phone' => '+971 4 398 2200',
            'email' => 'dubai@tailoringhrms.ae',
            'is_active' => true,
        ]);

        $branchAbudhabi = Branch::create([
            'name' => 'Abu Dhabi Branch (Al Maryah)',
            'code' => 'AUH-01',
            'city' => 'Abu Dhabi',
            'address' => 'Sowwah Square, Al Maryah Island, Abu Dhabi, UAE',
            'phone' => '+971 2 445 1100',
            'email' => 'abudhabi@tailoringhrms.ae',
            'is_active' => true,
        ]);

        $branchSharjah = Branch::create([
            'name' => 'Sharjah Operations (Al Majaz)',
            'code' => 'SHJ-01',
            'city' => 'Sharjah',
            'address' => 'Corniche Street, Al Majaz 3, Sharjah, UAE',
            'phone' => '+971 6 554 9900',
            'email' => 'sharjah@tailoringhrms.ae',
            'is_active' => true,
        ]);

        // 3. Create Roles
        $superAdminRole = Role::create([
            'name' => 'Super Admin',
            'slug' => 'super-admin',
            'description' => 'Unrestricted access to all HRMS modules, settings, and workflows.',
            'is_system' => true,
        ]);

        $hrManagerRole = Role::create([
            'name' => 'HR Manager',
            'slug' => 'hr-manager',
            'description' => 'Full control over employee master, attendance, leaves, payroll, and compliance.',
            'is_system' => true,
        ]);

        $deptManagerRole = Role::create([
            'name' => 'Department Manager',
            'slug' => 'department-manager',
            'description' => 'Team overview, shift approval, attendance regularization, and leave sign-offs.',
            'is_system' => true,
        ]);

        $employeeRole = Role::create([
            'name' => 'Employee',
            'slug' => 'employee',
            'description' => 'Employee Self-Service (ESS) access for attendance, leave requests, payslips.',
            'is_system' => true,
        ]);

        // 4. Create Granular Permissions for 13 Modules
        $modules = [
            'dashboard' => 'Dashboard Overview',
            'departments' => 'Departments Management',
            'designations' => 'Designations & Grades',
            'employees' => 'Employee Master',
            'attendance' => 'Daily Attendance & Check-in',
            'attendance_approvals' => 'Attendance Regularization Approvals',
            'leave_management' => 'Leave Management & Workflow',
            'compliance' => 'UAE Legal Documents & Expiry',
            'reports' => 'Reports & Analytics',
            'policies' => 'HR Policies & Acknowledgment',
            'shifts' => 'Shift Scheduling & Rosters',
            'payroll_dashboard' => 'Payroll Dashboard & Cost Overview',
            'payroll_payslips' => 'Monthly Payslips & Gratuity (EOSB)',
            'roles_permissions' => 'Roles & Permissions Matrix',
        ];

        $actions = ['view', 'create', 'edit', 'delete', 'approve', 'export'];

        $allPermissionIds = [];
        $hrPermissionIds = [];
        $deptPermissionIds = [];
        $empPermissionIds = [];

        foreach ($modules as $moduleKey => $moduleName) {
            foreach ($actions as $action) {
                $perm = Permission::create([
                    'module' => $moduleKey,
                    'action' => $action,
                    'name' => ucfirst($action) . ' ' . $moduleName,
                    'slug' => "{$moduleKey}.{$action}",
                    'description' => "Allows user to {$action} {$moduleName}",
                ]);

                $allPermissionIds[] = $perm->id;

                // Assign to HR Manager
                if ($moduleKey !== 'roles_permissions' || $action === 'view') {
                    $hrPermissionIds[] = $perm->id;
                }

                // Assign to Dept Manager
                if (in_array($moduleKey, ['dashboard', 'attendance', 'attendance_approvals', 'leave_management', 'policies', 'shifts', 'reports'])) {
                    if (in_array($action, ['view', 'approve', 'export', 'create'])) {
                        $deptPermissionIds[] = $perm->id;
                    }
                }

                // Assign to Employee (ESS)
                if (in_array($moduleKey, ['dashboard', 'attendance', 'leave_management', 'policies', 'payroll_payslips'])) {
                    if (in_array($action, ['view', 'create'])) {
                        $empPermissionIds[] = $perm->id;
                    }
                }
            }
        }

        $superAdminRole->permissions()->sync($allPermissionIds);
        $hrManagerRole->permissions()->sync($hrPermissionIds);
        $deptManagerRole->permissions()->sync($deptPermissionIds);
        $employeeRole->permissions()->sync($empPermissionIds);

        // 5. Create Shifts
        $shiftGeneral = Shift::create([
            'name' => 'General Corporate Shift (9AM - 6PM)',
            'code' => 'GEN-01',
            'start_time' => '09:00:00',
            'end_time' => '18:00:00',
            'break_minutes' => 60,
            'grace_period_minutes' => 15,
            'work_days' => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            'is_rotational' => false,
            'status' => 'active',
        ]);

        $shiftMorning = Shift::create([
            'name' => 'Production Morning Shift (7AM - 4PM)',
            'code' => 'PRD-MORN',
            'start_time' => '07:00:00',
            'end_time' => '16:00:00',
            'break_minutes' => 60,
            'grace_period_minutes' => 10,
            'work_days' => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            'is_rotational' => true,
            'status' => 'active',
        ]);

        $shiftEvening = Shift::create([
            'name' => 'Production Evening Shift (3:30PM - 12AM)',
            'code' => 'PRD-EVE',
            'start_time' => '15:30:00',
            'end_time' => '23:59:00',
            'break_minutes' => 45,
            'grace_period_minutes' => 10,
            'work_days' => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            'is_rotational' => true,
            'status' => 'active',
        ]);

        // 6. Create Departments
        $deptExec = Department::create(['branch_id' => $branchDubai->id, 'name' => 'Executive Leadership', 'code' => 'EXEC', 'description' => 'C-Suite and executive steering board', 'status' => 'active']);
        $deptHR = Department::create(['branch_id' => $branchDubai->id, 'name' => 'Human Resources & Talent', 'code' => 'HR', 'description' => 'Talent acquisition, payroll, compliance, and staff welfare', 'status' => 'active']);
        $deptTailoring = Department::create(['branch_id' => $branchSharjah->id, 'name' => 'Bespoke Tailoring & Haute Couture', 'code' => 'TAILOR', 'description' => 'Master cutting, bespoke stitching, pattern making, and quality control', 'status' => 'active']);
        $deptDesign = Department::create(['branch_id' => $branchDubai->id, 'name' => 'Fashion Design & Styling', 'code' => 'DESIGN', 'description' => 'Apparel concepts, fabric selection, and haute couture curation', 'status' => 'active']);
        $deptSales = Department::create(['branch_id' => $branchAbudhabi->id, 'name' => 'Retail & Client Relations', 'code' => 'RETAIL', 'description' => 'Luxury boutique sales, VIP customer fitting, and order coordination', 'status' => 'active']);
        $deptFinance = Department::create(['branch_id' => $branchDubai->id, 'name' => 'Finance & Accounts', 'code' => 'FIN', 'description' => 'WPS banking, cost accounting, cashflow, and VAT filings', 'status' => 'active']);

        // 7. Create Designations
        $desigCEO = Designation::create(['department_id' => $deptExec->id, 'title' => 'Chief Executive Officer', 'code' => 'CEO', 'level_grade' => 'Executive']);
        $desigHRD = Designation::create(['department_id' => $deptHR->id, 'title' => 'Director of Human Resources', 'code' => 'HR-DIR', 'level_grade' => 'Management']);
        $desigHRM = Designation::create(['department_id' => $deptHR->id, 'title' => 'HR Operations Specialist', 'code' => 'HR-SPEC', 'level_grade' => 'Senior']);
        $desigMasterTailor = Designation::create(['department_id' => $deptTailoring->id, 'title' => 'Master Tailor & Pattern Draper', 'code' => 'M-TAILOR', 'level_grade' => 'Senior']);
        $desigCutter = Designation::create(['department_id' => $deptTailoring->id, 'title' => 'Senior Garment Cutter', 'code' => 'SR-CUT', 'level_grade' => 'Specialist']);
        $desigFinisher = Designation::create(['department_id' => $deptTailoring->id, 'title' => 'Hand Embroiderer & Finisher', 'code' => 'EMB-FIN', 'level_grade' => 'Junior']);
        $desigLeadDesigner = Designation::create(['department_id' => $deptDesign->id, 'title' => 'Lead Fashion Stylist', 'code' => 'FASH-LEAD', 'level_grade' => 'Management']);
        $desigBoutiqueMgr = Designation::create(['department_id' => $deptSales->id, 'title' => 'Luxury Boutique Manager', 'code' => 'BTQ-MGR', 'level_grade' => 'Management']);
        $desigFinSpecialist = Designation::create(['department_id' => $deptFinance->id, 'title' => 'Senior Payroll & WPS Accountant', 'code' => 'WPS-ACC', 'level_grade' => 'Senior']);

        // 8. Create UAE Public Holidays (2026)
        $holidays = [
            ['name' => "New Year's Day", 'date' => '2026-01-01', 'days_count' => 1, 'year' => 2026, 'description' => 'Gregorian New Year public holiday'],
            ['name' => 'Eid Al Fitr Holiday', 'date' => '2026-03-20', 'days_count' => 4, 'year' => 2026, 'description' => 'Official Islamic Eid Al Fitr celebration (29 Ramadan - 3 Shawwal)'],
            ['name' => 'Arafat Day', 'date' => '2026-05-26', 'days_count' => 1, 'year' => 2026, 'description' => 'Day of Arafat (9 Dhu Al Hijjah)'],
            ['name' => 'Eid Al Adha Holiday', 'date' => '2026-05-27', 'days_count' => 3, 'year' => 2026, 'description' => 'Feast of Sacrifice (10-12 Dhu Al Hijjah)'],
            ['name' => 'Islamic New Year (Hijri 1448)', 'date' => '2026-06-16', 'days_count' => 1, 'year' => 2026, 'description' => '1 Muharram'],
            ['name' => "Prophet's Birthday (PBUH)", 'date' => '2026-08-25', 'days_count' => 1, 'year' => 2026, 'description' => '12 Rabi Al Awwal'],
            ['name' => 'UAE National Day (55th Commemoration)', 'date' => '2026-12-02', 'days_count' => 2, 'year' => 2026, 'description' => 'Union Day 2 & 3 December'],
        ];

        foreach ($holidays as $h) {
            PublicHoliday::create($h);
        }

        // 9. Create UAE Standard Leave Types
        $leaveAnnual = LeaveType::create(['name' => 'Annual Leave', 'code' => 'ANNUAL', 'days_per_year' => 30, 'is_paid' => true, 'paid_percentage' => 100, 'requires_attachment' => false, 'uae_law_type' => 'annual', 'description' => '30 calendar days per completed year of service as per UAE Labour Law (Federal Decree Law No. 33 of 2021)']);
        $leaveSick1 = LeaveType::create(['name' => 'Sick Leave (Full Pay)', 'code' => 'SICK-100', 'days_per_year' => 15, 'is_paid' => true, 'paid_percentage' => 100, 'requires_attachment' => true, 'uae_law_type' => 'sick_tier1', 'description' => 'First 15 days of sick leave with 100% full pay upon certified medical report']);
        $leaveSick2 = LeaveType::create(['name' => 'Sick Leave (Half Pay)', 'code' => 'SICK-50', 'days_per_year' => 30, 'is_paid' => true, 'paid_percentage' => 50, 'requires_attachment' => true, 'uae_law_type' => 'sick_tier2', 'description' => 'Next 30 days of sick leave with 50% half pay']);
        $leaveSick3 = LeaveType::create(['name' => 'Sick Leave (Unpaid)', 'code' => 'SICK-0', 'days_per_year' => 45, 'is_paid' => false, 'paid_percentage' => 0, 'requires_attachment' => true, 'uae_law_type' => 'sick_tier3', 'description' => 'Subsequent 45 days unpaid sick leave within a single service year']);
        $leaveMaternity = LeaveType::create(['name' => 'Maternity Leave', 'code' => 'MATERNITY', 'days_per_year' => 60, 'is_paid' => true, 'paid_percentage' => 100, 'requires_attachment' => true, 'uae_law_type' => 'maternity', 'description' => '45 days full pay + 15 days half pay for female staff']);
        $leavePaternity = LeaveType::create(['name' => 'Paternity Leave', 'code' => 'PATERNITY', 'days_per_year' => 5, 'is_paid' => true, 'paid_percentage' => 100, 'requires_attachment' => true, 'uae_law_type' => 'paternity', 'description' => '5 working days paid leave for fathers within 6 months of childbirth']);
        $leaveBereavement = LeaveType::create(['name' => 'Compassionate / Bereavement Leave', 'code' => 'BEREAVE', 'days_per_year' => 5, 'is_paid' => true, 'paid_percentage' => 100, 'requires_attachment' => true, 'uae_law_type' => 'bereavement', 'description' => '5 days for spouse death, 3 days for parent/child/sibling death']);
        $leaveHajj = LeaveType::create(['name' => 'Hajj Pilgrimage Leave', 'code' => 'HAJJ', 'days_per_year' => 30, 'is_paid' => false, 'paid_percentage' => 0, 'requires_attachment' => true, 'uae_law_type' => 'hajj', 'description' => 'Special unpaid leave granted once during full tenure (up to 30 days)']);
        $leaveUnpaid = LeaveType::create(['name' => 'Unpaid Leave (Discretionary)', 'code' => 'UNPAID', 'days_per_year' => 30, 'is_paid' => false, 'paid_percentage' => 0, 'requires_attachment' => false, 'uae_law_type' => 'unpaid', 'description' => 'Approved unpaid leave upon management discretion']);

        // 10. Create Users & Employees
        // Admin User
        $userAdmin = User::create([
            'name' => 'Sultan Al Marzooqi',
            'email' => 'admin@hrms.ae',
            'password' => Hash::make('password'),
            'role_id' => $superAdminRole->id,
            'branch_id' => $branchDubai->id,
            'phone' => '+971 50 123 4567',
            'status' => 'active',
            'is_active' => true,
        ]);

        $empAdmin = Employee::create([
            'user_id' => $userAdmin->id,
            'employee_code' => 'UAE-1001',
            'first_name' => 'Sultan',
            'last_name' => 'Al Marzooqi',
            'email' => 'admin@hrms.ae',
            'phone' => '+971 50 123 4567',
            'gender' => 'Male',
            'date_of_birth' => '1984-04-12',
            'nationality' => 'United Arab Emirates',
            'marital_status' => 'Married',
            'emirates_id_number' => '784-1984-1234567-1',
            'passport_number' => 'N98765432',
            'visa_type' => 'Citizen',
            'visa_expiry_date' => '2030-12-31',
            'designation_id' => $desigCEO->id,
            'department_id' => $deptExec->id,
            'branch_id' => $branchDubai->id,
            'company_id' => $companyBespoke->id,
            'location_id' => $locationDubai->id,
            'shift_id' => $shiftGeneral->id,
            'joining_date' => '2018-01-15',
            'contract_type' => 'Unlimited',
            'basic_salary' => 35000.00,
            'housing_allowance' => 15000.00,
            'transport_allowance' => 5000.00,
            'other_allowances' => 5000.00,
            'bank_name' => 'Emirates NBD',
            'iban' => 'AE290260000123456789012',
            'status' => 'active',
        ]);

        // HR Manager User
        $userHR = User::create([
            'name' => 'Fatima Al Nuaimi',
            'email' => 'hr@hrms.ae',
            'password' => Hash::make('password'),
            'role_id' => $hrManagerRole->id,
            'branch_id' => $branchDubai->id,
            'phone' => '+971 52 987 6543',
            'status' => 'active',
            'is_active' => true,
        ]);

        $empHR = Employee::create([
            'user_id' => $userHR->id,
            'employee_code' => 'UAE-1002',
            'first_name' => 'Fatima',
            'last_name' => 'Al Nuaimi',
            'email' => 'hr@hrms.ae',
            'phone' => '+971 52 987 6543',
            'gender' => 'Female',
            'date_of_birth' => '1990-09-24',
            'nationality' => 'United Arab Emirates',
            'marital_status' => 'Married',
            'emirates_id_number' => '784-1990-9876543-2',
            'passport_number' => 'N11223344',
            'visa_type' => 'Citizen',
            'visa_expiry_date' => '2031-08-30',
            'designation_id' => $desigHRD->id,
            'department_id' => $deptHR->id,
            'branch_id' => $branchDubai->id,
            'company_id' => $companyBespoke->id,
            'location_id' => $locationDubai->id,
            'shift_id' => $shiftGeneral->id,
            'reporting_to_id' => $empAdmin->id,
            'joining_date' => '2020-03-01',
            'contract_type' => 'Unlimited',
            'basic_salary' => 22000.00,
            'housing_allowance' => 8000.00,
            'transport_allowance' => 3000.00,
            'other_allowances' => 2000.00,
            'bank_name' => 'First Abu Dhabi Bank (FAB)',
            'iban' => 'AE350330000987654321098',
            'status' => 'active',
        ]);

        // Employee User
        $userEmp = User::create([
            'name' => 'Tariq Mansoor',
            'email' => 'employee@hrms.ae',
            'password' => Hash::make('password'),
            'role_id' => $employeeRole->id,
            'branch_id' => $branchSharjah->id,
            'phone' => '+971 55 456 7890',
            'status' => 'active',
            'is_active' => true,
        ]);

        $empTariq = Employee::create([
            'user_id' => $userEmp->id,
            'employee_code' => 'UAE-1003',
            'first_name' => 'Tariq',
            'last_name' => 'Mansoor',
            'email' => 'employee@hrms.ae',
            'phone' => '+971 55 456 7890',
            'gender' => 'Male',
            'date_of_birth' => '1988-11-15',
            'nationality' => 'Pakistan',
            'marital_status' => 'Married',
            'emirates_id_number' => '784-1988-5544332-9',
            'passport_number' => 'PK8899001',
            'visa_type' => 'Employment',
            'visa_expiry_date' => Carbon::now()->addDays(42)->format('Y-m-d'), // Expiring soon! (42 days)
            'designation_id' => $desigMasterTailor->id,
            'department_id' => $deptTailoring->id,
            'branch_id' => $branchSharjah->id,
            'company_id' => $companyBespoke->id,
            'location_id' => $locationSharjah->id,
            'shift_id' => $shiftMorning->id,
            'reporting_to_id' => $empAdmin->id,
            'joining_date' => '2021-06-10',
            'contract_type' => 'Limited',
            'basic_salary' => 9500.00,
            'housing_allowance' => 3500.00,
            'transport_allowance' => 1500.00,
            'other_allowances' => 1000.00,
            'bank_name' => 'Mashreq Bank',
            'iban' => 'AE440310000456123789045',
            'status' => 'active',
        ]);

        // Additional realistic UAE employees for tailoring business
        $demoEmployeesData = [
            [
                'name' => 'Rashid Al Shamsi', 'email' => 'rashid.shamsi@tailoringhrms.ae', 'phone' => '+971 50 334 5566',
                'gender' => 'Male', 'dob' => '1992-05-18', 'nat' => 'United Arab Emirates', 'role' => $deptManagerRole->id,
                'desig' => $desigBoutiqueMgr->id, 'dept' => $deptSales->id, 'branch' => $branchAbudhabi->id,
                'shift' => $shiftGeneral->id, 'join' => '2021-02-15', 'contract' => 'Unlimited',
                'basic' => 16000, 'housing' => 6000, 'transport' => 2500, 'other' => 1500,
                'bank' => 'Abu Dhabi Commercial Bank (ADCB)', 'iban' => 'AE120300000554433221100',
                'eid' => '784-1992-1239874-5', 'passport' => 'N55667788', 'visa_type' => 'Citizen', 'visa_exp' => '2032-01-01',
                'status' => 'active',
            ],
            [
                'name' => 'Maria Elena Santos', 'email' => 'maria.santos@tailoringhrms.ae', 'phone' => '+971 54 887 6655',
                'gender' => 'Female', 'dob' => '1995-07-22', 'nat' => 'Philippines', 'role' => $employeeRole->id,
                'desig' => $desigLeadDesigner->id, 'dept' => $deptDesign->id, 'branch' => $branchDubai->id,
                'shift' => $shiftGeneral->id, 'join' => '2022-09-01', 'contract' => 'Limited',
                'basic' => 12500, 'housing' => 4500, 'transport' => 1800, 'other' => 1200,
                'bank' => 'Dubai Islamic Bank (DIB)', 'iban' => 'AE670240000889977665544',
                'eid' => '784-1995-4433221-7', 'passport' => 'PH9988776', 'visa_type' => 'Employment',
                'visa_exp' => Carbon::now()->addDays(24)->format('Y-m-d'), // Expiring soon! (24 days)
                'status' => 'active',
            ],
            [
                'name' => 'Farhan Qureshi', 'email' => 'farhan.q@tailoringhrms.ae', 'phone' => '+971 56 776 5544',
                'gender' => 'Male', 'dob' => '1987-03-14', 'nat' => 'India', 'role' => $employeeRole->id,
                'desig' => $desigCutter->id, 'dept' => $deptTailoring->id, 'branch' => $branchSharjah->id,
                'shift' => $shiftMorning->id, 'join' => '2019-11-20', 'contract' => 'Limited',
                'basic' => 6800, 'housing' => 2200, 'transport' => 1000, 'other' => 500,
                'bank' => 'Emirates Islamic', 'iban' => 'AE880400000112233445566',
                'eid' => '784-1987-6655443-1', 'passport' => 'IN4455667', 'visa_type' => 'Employment',
                'visa_exp' => Carbon::now()->addDays(180)->format('Y-m-d'),
                'status' => 'active',
            ],
            [
                'name' => 'Ayesha Al Zaabi', 'email' => 'ayesha.zaabi@tailoringhrms.ae', 'phone' => '+971 52 665 4433',
                'gender' => 'Female', 'dob' => '1996-12-05', 'nat' => 'United Arab Emirates', 'role' => $employeeRole->id,
                'desig' => $desigFinSpecialist->id, 'dept' => $deptFinance->id, 'branch' => $branchDubai->id,
                'shift' => $shiftGeneral->id, 'join' => '2023-01-10', 'contract' => 'Unlimited',
                'basic' => 14000, 'housing' => 5000, 'transport' => 2000, 'other' => 1000,
                'bank' => 'Abu Dhabi Islamic Bank (ADIB)', 'iban' => 'AE990500000998877665511',
                'eid' => '784-1996-3322114-8', 'passport' => 'N33445566', 'visa_type' => 'Citizen', 'visa_exp' => '2030-05-15',
                'status' => 'active',
            ],
            [
                'name' => 'Kamal Hossain', 'email' => 'kamal.h@tailoringhrms.ae', 'phone' => '+971 58 221 3344',
                'gender' => 'Male', 'dob' => '1993-08-30', 'nat' => 'Bangladesh', 'role' => $employeeRole->id,
                'desig' => $desigFinisher->id, 'dept' => $deptTailoring->id, 'branch' => $branchSharjah->id,
                'shift' => $shiftEvening->id, 'join' => '2022-04-18', 'contract' => 'Limited',
                'basic' => 4500, 'housing' => 1800, 'transport' => 700, 'other' => 500,
                'bank' => 'Commercial Bank of Dubai (CBD)', 'iban' => 'AE220200000445566778899',
                'eid' => '784-1993-8877665-3', 'passport' => 'BD2233445', 'visa_type' => 'Employment',
                'visa_exp' => Carbon::now()->addDays(75)->format('Y-m-d'), // Expiring in 75 days
                'status' => 'active',
            ],
            [
                'name' => 'Layla Bint Yousef', 'email' => 'layla.yousef@tailoringhrms.ae', 'phone' => '+971 50 778 9900',
                'gender' => 'Female', 'dob' => '1994-02-19', 'nat' => 'Jordan', 'role' => $employeeRole->id,
                'desig' => $desigHRM->id, 'dept' => $deptHR->id, 'branch' => $branchDubai->id,
                'shift' => $shiftGeneral->id, 'join' => '2022-10-01', 'contract' => 'Limited',
                'basic' => 11000, 'housing' => 4000, 'transport' => 1500, 'other' => 1000,
                'bank' => 'Emirates NBD', 'iban' => 'AE110260000778899001122',
                'eid' => '784-1994-9988776-4', 'passport' => 'JO5566778', 'visa_type' => 'Employment',
                'visa_exp' => Carbon::now()->addDays(240)->format('Y-m-d'),
                'status' => 'active',
            ],
            [
                'name' => 'Bilal Ahmed Siddiqui', 'email' => 'bilal.s@tailoringhrms.ae', 'phone' => '+971 55 998 8776',
                'gender' => 'Male', 'dob' => '1990-10-10', 'nat' => 'Pakistan', 'role' => $employeeRole->id,
                'desig' => $desigMasterTailor->id, 'dept' => $deptTailoring->id, 'branch' => $branchSharjah->id,
                'shift' => $shiftMorning->id, 'join' => '2020-08-15', 'contract' => 'Limited',
                'basic' => 8800, 'housing' => 3000, 'transport' => 1200, 'other' => 800,
                'bank' => 'RAKBANK', 'iban' => 'AE550250000334455667788',
                'eid' => '784-1990-2211334-6', 'passport' => 'PK6677889', 'visa_type' => 'Employment',
                'visa_exp' => Carbon::now()->subDays(5)->format('Y-m-d'), // EXPIRED 5 days ago!
                'status' => 'active',
            ],
        ];

        $allCreatedEmployees = [$empAdmin, $empHR, $empTariq];

        $codeSeq = 1004;

        foreach ($demoEmployeesData as $data) {
            $companyId = $data['branch'] === $branchAbudhabi->id
                ? $companyAtelier->id
                : $companyBespoke->id;

            $locationId = match ($data['branch']) {
                $branchAbudhabi->id => $locationAbuDhabi->id,
                $branchSharjah->id => $locationSharjah->id,
                default => $locationDubai->id,
            };

            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make('password'),
                'role_id' => $data['role'],
                'branch_id' => $data['branch'],
                'company_id' => $companyId,
                'location_id' => $locationId,
                'phone' => $data['phone'],
                'status' => 'active',
                'is_active' => true,
            ]);

            $parts = explode(' ', $data['name']);
            $firstName = $parts[0];
            $lastName = implode(' ', array_slice($parts, 1));

            $emp = Employee::create([
                'user_id' => $user->id,
                'employee_code' => 'UAE-' . $codeSeq++,
                'first_name' => $firstName,
                'last_name' => $lastName,
                'email' => $data['email'],
                'phone' => $data['phone'],
                'gender' => $data['gender'],
                'date_of_birth' => $data['dob'],
                'nationality' => $data['nat'],
                'marital_status' => 'Single',
                'emirates_id_number' => $data['eid'],
                'passport_number' => $data['passport'],
                'visa_type' => $data['visa_type'],
                'visa_expiry_date' => $data['visa_exp'],
                'designation_id' => $data['desig'],
                'department_id' => $data['dept'],
                'branch_id' => $data['branch'],
                'company_id' => $companyId,
                'location_id' => $locationId,
                'shift_id' => $data['shift'],
                'reporting_to_id' => $empAdmin->id,
                'joining_date' => $data['join'],
                'contract_type' => $data['contract'],
                'basic_salary' => $data['basic'],
                'housing_allowance' => $data['housing'],
                'transport_allowance' => $data['transport'],
                'other_allowances' => $data['other'],
                'bank_name' => $data['bank'],
                'iban' => $data['iban'],
                'status' => $data['status'],
            ]);

            $allCreatedEmployees[] = $emp;
        }

        // 11. Create Compliance Documents per Employee
        foreach ($allCreatedEmployees as $e) {
            // Emirates ID doc
            $eidStatus = 'valid';
            $eidExp = Carbon::parse($e->visa_expiry_date);
            $daysLeft = Carbon::now()->diffInDays($eidExp, false);
            if ($daysLeft < 0) $eidStatus = 'expired';
            elseif ($daysLeft <= 90) $eidStatus = 'expiring_soon';

            ComplianceDocument::create([
                'employee_id' => $e->id,
                'document_type' => 'Emirates ID',
                'document_number' => $e->emirates_id_number,
                'issue_date' => Carbon::parse($e->visa_expiry_date)->subYears(2)->format('Y-m-d'),
                'expiry_date' => $e->visa_expiry_date,
                'issuing_authority' => 'Federal Authority for Identity and Citizenship (ICP)',
                'sponsor_name' => 'Bespoke Haute Couture Tailoring LLC',
                'status' => $eidStatus,
                'alert_90_sent' => $daysLeft <= 90,
                'alert_60_sent' => $daysLeft <= 60,
                'alert_30_sent' => $daysLeft <= 30,
            ]);

            // Passport doc
            ComplianceDocument::create([
                'employee_id' => $e->id,
                'document_type' => 'Passport',
                'document_number' => $e->passport_number,
                'issue_date' => '2021-01-10',
                'expiry_date' => Carbon::now()->addMonths(rand(6, 48))->format('Y-m-d'),
                'issuing_authority' => 'Immigration Authority',
                'status' => 'valid',
            ]);

            // Labour Card
            ComplianceDocument::create([
                'employee_id' => $e->id,
                'document_type' => 'Labour Card',
                'document_number' => 'LC-' . rand(10000000, 99999999),
                'issue_date' => '2023-01-01',
                'expiry_date' => $e->visa_expiry_date,
                'issuing_authority' => 'Ministry of Human Resources and Emiratisation (MOHRE)',
                'sponsor_name' => 'Bespoke Haute Couture Tailoring LLC',
                'status' => $eidStatus,
            ]);

            // Medical Insurance
            ComplianceDocument::create([
                'employee_id' => $e->id,
                'document_type' => 'Medical Insurance',
                'document_number' => 'MED-UAE-' . rand(100000, 999999),
                'issue_date' => '2026-01-01',
                'expiry_date' => '2027-01-01',
                'issuing_authority' => 'Daman Health Insurance UAE',
                'status' => 'valid',
            ]);

            // Salary Structure
            SalaryStructure::create([
                'employee_id' => $e->id,
                'basic_salary' => $e->basic_salary,
                'housing_allowance' => $e->housing_allowance,
                'transport_allowance' => $e->transport_allowance,
                'other_allowances' => $e->other_allowances,
                'gross_salary' => $e->total_gross_salary,
                'standard_deductions' => 0.00,
                'payment_method' => 'WPS_Bank_Transfer',
                'bank_name' => $e->bank_name,
                'iban' => $e->iban,
                'effective_date' => $e->joining_date,
            ]);

            // Leave Balances
            LeaveBalance::create([
                'employee_id' => $e->id,
                'leave_type_id' => $leaveAnnual->id,
                'year' => 2026,
                'total_allocated' => 30.0,
                'used_days' => rand(0, 5),
                'pending_days' => rand(0, 2),
                'remaining_days' => 25.0,
                'carry_forward' => 0.0,
            ]);

            LeaveBalance::create([
                'employee_id' => $e->id,
                'leave_type_id' => $leaveSick1->id,
                'year' => 2026,
                'total_allocated' => 15.0,
                'used_days' => rand(0, 2),
                'pending_days' => 0.0,
                'remaining_days' => 13.0,
                'carry_forward' => 0.0,
            ]);
        }

        // 12. Create Sample Attendances for Today & Recent Days
        $today = Carbon::today();
        foreach ($allCreatedEmployees as $index => $e) {
            $statuses = ['present', 'present', 'present', 'late', 'present', 'present', 'on_leave', 'present', 'late', 'present'];
            $status = $statuses[$index % count($statuses)];

            $checkIn = '08:55:00';
            $lateMin = 0;
            if ($status === 'late') {
                $checkIn = '09:28:00';
                $lateMin = 28;
            } elseif ($status === 'on_leave') {
                $checkIn = null;
            }

            Attendance::create([
                'employee_id' => $e->id,
                'shift_id' => $e->shift_id,
                'date' => $today->format('Y-m-d'),
                'check_in' => $checkIn,
                'check_out' => $status === 'present' || $status === 'late' ? '18:05:00' : null,
                'check_in_latitude' => 25.1882,
                'check_in_longitude' => 55.2764,
                'check_in_ip' => '192.168.1.' . (10 + $index),
                'status' => $status,
                'working_hours' => $status === 'on_leave' ? 0 : 8.5,
                'late_minutes' => $lateMin,
                'early_leaving_minutes' => 0,
                'overtime_hours' => $index % 3 === 0 ? 1.5 : 0.0,
                'notes' => $status === 'late' ? 'Dubai Sheikh Zayed Road traffic delay' : null,
            ]);
        }

        // 13. Create Policies
        $policyLeave = Policy::create([
            'title' => 'UAE Annual & Sick Leave Policy 2026',
            'category' => 'Leave Policy',
            'version' => '2.1',
            'description' => 'Comprehensive guidelines regarding 30-day annual leave accrual, certified sick leave tiers, carry-forward limits, and public holiday encashment.',
            'effective_date' => '2026-01-01',
            'is_active' => true,
            'created_by' => $userAdmin->id,
        ]);

        $policyCode = Policy::create([
            'title' => 'Bespoke Atelier Code of Conduct & Confidentiality',
            'category' => 'Code of Conduct',
            'version' => '1.4',
            'description' => 'Standards of professional ethics, VIP client privacy, haute couture pattern security, and non-disclosure obligations.',
            'effective_date' => '2026-01-01',
            'is_active' => true,
            'created_by' => $userAdmin->id,
        ]);

        $policySafety = Policy::create([
            'title' => 'Tailoring Workshop Health & Safety Guidelines',
            'category' => 'Health & Safety',
            'version' => '3.0',
            'description' => 'Safe operation of industrial fabric laser cutters, steam presses, eye protection, ergonomic seating, and emergency fire evacuation routes.',
            'effective_date' => '2026-01-01',
            'is_active' => true,
            'created_by' => $userAdmin->id,
        ]);

        // 14. Create Past Month Payroll Run & Payslips
        $prevMonth = Carbon::now()->subMonth();
        $payrollRun = PayrollRun::create([
            'batch_name' => 'Payroll Run — ' . $prevMonth->format('F Y'),
            'month' => $prevMonth->month,
            'year' => $prevMonth->year,
            'pay_period_start' => $prevMonth->copy()->startOfMonth()->format('Y-m-d'),
            'pay_period_end' => $prevMonth->copy()->endOfMonth()->format('Y-m-d'),
            'total_employees' => count($allCreatedEmployees),
            'total_gross' => 148300.00,
            'total_allowances' => 52000.00,
            'total_deductions' => 1250.00,
            'total_net' => 147050.00,
            'status' => 'paid',
            'approved_by' => $userAdmin->id,
            'approved_at' => Carbon::now()->subDays(10),
            'wps_sif_exported' => true,
            'wps_file_name' => 'SIF_' . $prevMonth->format('Ym') . '_BESPOKE.sif',
        ]);

        foreach ($allCreatedEmployees as $e) {
            $basic = $e->basic_salary;
            $housing = $e->housing_allowance;
            $transport = $e->transport_allowance;
            $other = $e->other_allowances;
            $gross = $basic + $housing + $transport + $other;
            $otHours = rand(0, 4);
            $otAmt = $otHours * ($basic / 240 * 1.25);
            $deductions = 0.00;
            $net = $gross + $otAmt - $deductions;

            Payslip::create([
                'payroll_run_id' => $payrollRun->id,
                'employee_id' => $e->id,
                'payslip_number' => 'PS-' . $prevMonth->format('Ym') . '-' . $e->employee_code,
                'month' => $prevMonth->month,
                'year' => $prevMonth->year,
                'basic_salary' => $basic,
                'housing_allowance' => $housing,
                'transport_allowance' => $transport,
                'other_allowances' => $other,
                'gross_salary' => $gross,
                'overtime_hours' => $otHours,
                'overtime_amount' => $otAmt,
                'deductions_amount' => $deductions,
                'deductions_breakdown' => ['absent_days' => 0, 'loan_deduction' => 0],
                'net_salary' => $net,
                'payment_status' => 'Paid',
                'payment_date' => $prevMonth->copy()->endOfMonth()->format('Y-m-d'),
                'generated_at' => Carbon::now()->subDays(10),
            ]);
        }
    }
}




