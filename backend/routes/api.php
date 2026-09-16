<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DepartmentController;
use App\Http\Controllers\Api\DesignationController;
use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\LeaveController;
use App\Http\Controllers\Api\ComplianceController;
use App\Http\Controllers\Api\PayrollController;
use App\Http\Controllers\Api\PolicyController;
use App\Http\Controllers\Api\ShiftController;
use App\Http\Controllers\Api\RolePermissionController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\BranchController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public Authentication
Route::post('/login', [AuthController::class, 'login']);

// Authenticated Routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth & Session
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // 1. Dashboard
    Route::get('/dashboard/summary', [DashboardController::class, 'summary'])
        ->middleware('permission:dashboard,view');

    // 2. Departments
    Route::apiResource('departments', DepartmentController::class)
        ->middlewareFor('index', 'permission:departments,view')
        ->middlewareFor('store', 'permission:departments,create')
        ->middlewareFor('update', 'permission:departments,edit')
        ->middlewareFor('destroy', 'permission:departments,delete');

    // 3. Designations
    Route::apiResource('designations', DesignationController::class)
        ->middlewareFor('index', 'permission:designations,view')
        ->middlewareFor('store', 'permission:designations,create')
        ->middlewareFor('update', 'permission:designations,edit')
        ->middlewareFor('destroy', 'permission:designations,delete');

    // 4. Employees
    Route::apiResource('employees', EmployeeController::class)
        ->middlewareFor('index', 'permission:employees,view')
        ->middlewareFor('show', 'permission:employees,view')
        ->middlewareFor('store', 'permission:employees,create')
        ->middlewareFor('update', 'permission:employees,edit')
        ->middlewareFor('destroy', 'permission:employees,delete');

    // 5. Companies
    Route::get('/companies', [CompanyController::class, 'index'])
        ->middleware('permission:employees,view');
    Route::get('/branches', [BranchController::class, 'index'])
        ->middleware('permission:employees,view');

    // 6. Shifts
    Route::apiResource('shifts', ShiftController::class)
        ->middlewareFor('index', 'permission:shifts,view')
        ->middlewareFor('store', 'permission:shifts,create')
        ->middlewareFor('update', 'permission:shifts,edit');

    // 7. Attendance & Regularization
    Route::get('/attendance', [AttendanceController::class, 'index'])
        ->middleware('permission:attendance,view');

    Route::post('/attendance/check-in', [AttendanceController::class, 'checkIn'])
        ->middleware('permission:attendance,create');

    Route::post('/attendance/check-out', [AttendanceController::class, 'checkOut'])
        ->middleware('permission:attendance,create');

    Route::get('/attendance/regularizations', [AttendanceController::class, 'regularizations'])
        ->middleware('permission:attendance_approvals,view');

    Route::post('/attendance/regularize', [AttendanceController::class, 'regularize'])
        ->middleware('permission:attendance,create');

    Route::post('/attendance/regularizations/{regularization}/process', [AttendanceController::class, 'approveRegularization'])
        ->middleware('permission:attendance_approvals,approve');

    // 8. Leave Management & Public Holidays
    Route::get('/leave/types', [LeaveController::class, 'types'])
        ->middleware('permission:leave_management,view');

    Route::get('/leave/balances', [LeaveController::class, 'balances'])
        ->middleware('permission:leave_management,view');

    Route::get('/leave/applications', [LeaveController::class, 'applications'])
        ->middleware('permission:leave_management,view');

    Route::post('/leave/apply', [LeaveController::class, 'apply'])
        ->middleware('permission:leave_management,create');

    Route::post('/leave/applications/{leaveApplication}/process', [LeaveController::class, 'processApplication'])
        ->middleware('permission:leave_management,approve');

    Route::get('/public-holidays', [LeaveController::class, 'publicHolidays'])
        ->middleware('permission:leave_management,view');

    // 9. Compliance
    Route::get('/compliance', [ComplianceController::class, 'index'])
        ->middleware('permission:compliance,view');

    Route::post('/compliance', [ComplianceController::class, 'store'])
        ->middleware('permission:compliance,create');

    Route::put('/compliance/{complianceDocument}', [ComplianceController::class, 'update'])
        ->middleware('permission:compliance,edit');

    Route::get('/compliance/alerts', [ComplianceController::class, 'alerts'])
        ->middleware('permission:compliance,view');

    // 10. Policies
    Route::get('/policies', [PolicyController::class, 'index'])
        ->middleware('permission:policies,view');

    Route::post('/policies', [PolicyController::class, 'store'])
        ->middleware('permission:policies,create');

    Route::post('/policies/{policy}/acknowledge', [PolicyController::class, 'acknowledge'])
        ->middleware('permission:policies,create');

    // 11. Payroll & Gratuity
    Route::get('/payroll/summary', [PayrollController::class, 'summary'])
        ->middleware('permission:payroll_dashboard,view');

    Route::get('/payroll/runs', [PayrollController::class, 'runs'])
        ->middleware('permission:payroll_dashboard,view');

    Route::get('/payroll/runs/{payrollRun}', [PayrollController::class, 'runDetails'])
        ->middleware('permission:payroll_dashboard,view');
    Route::post('/payroll/runs/generate', [PayrollController::class, 'generateRun'])
        ->middleware('permission:payroll_dashboard,create');

    Route::get('/payroll/payslips', [PayrollController::class, 'payslips'])
        ->middleware('permission:payroll_payslips,view');

    Route::get('/payroll/my-payslips', [PayrollController::class, 'myPayslips'])
        ->middleware('permission:payroll_payslips,view');
    Route::post('/payroll/gratuity/calculate', [PayrollController::class, 'calculateGratuity'])
        ->middleware('permission:payroll_payslips,create');

    // 12. Roles & Permissions
    Route::get('/roles', [RolePermissionController::class, 'roles'])
        ->middleware('permission:roles_permissions,view');
    Route::get('/permissions', [RolePermissionController::class, 'permissions'])
        ->middleware('permission:roles_permissions,view');
    Route::put('/roles/{role}/permissions', [RolePermissionController::class, 'updateRolePermissions'])->middleware('permission:roles_permissions,edit');

    // 13. Reports
    Route::get('/reports/employee-master', [ReportController::class, 'employeeMaster'])
        ->middleware('permission:reports,view');

    Route::get('/reports/attendance', [ReportController::class, 'attendanceReport'])
        ->middleware('permission:reports,view');

    Route::get('/reports/leaves', [ReportController::class, 'leaveReport'])
        ->middleware('permission:reports,view');
});




















