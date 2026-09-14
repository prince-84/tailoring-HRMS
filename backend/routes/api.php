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
    Route::get('/dashboard/summary', [DashboardController::class, 'summary']);

    // 2. Departments
    Route::apiResource('departments', DepartmentController::class);

    // 3. Designations
    Route::apiResource('designations', DesignationController::class);

    // 4. Employees
    Route::apiResource('employees', EmployeeController::class);

    // 5. Companies
    Route::get('/companies', [CompanyController::class, 'index']);
    Route::get('/branches', [BranchController::class, 'index']);

    // 6. Shifts
    Route::apiResource('shifts', ShiftController::class);

    // 7. Attendance & Regularization
    Route::get('/attendance', [AttendanceController::class, 'index']);
    Route::post('/attendance/check-in', [AttendanceController::class, 'checkIn']);
    Route::post('/attendance/check-out', [AttendanceController::class, 'checkOut']);
    Route::get('/attendance/regularizations', [AttendanceController::class, 'regularizations']);
    Route::post('/attendance/regularize', [AttendanceController::class, 'regularize']);
    Route::post('/attendance/regularizations/{regularization}/process', [AttendanceController::class, 'approveRegularization']);

    // 8. Leave Management & Public Holidays
    Route::get('/leave/types', [LeaveController::class, 'types']);
    Route::get('/leave/balances', [LeaveController::class, 'balances']);
    Route::get('/leave/applications', [LeaveController::class, 'applications']);
    Route::post('/leave/apply', [LeaveController::class, 'apply']);
    Route::post('/leave/applications/{leaveApplication}/process', [LeaveController::class, 'processApplication']);
    Route::get('/public-holidays', [LeaveController::class, 'publicHolidays']);

    // 9. Compliance
    Route::get('/compliance', [ComplianceController::class, 'index']);
    Route::post('/compliance', [ComplianceController::class, 'store']);
    Route::put('/compliance/{complianceDocument}', [ComplianceController::class, 'update']);
    Route::get('/compliance/alerts', [ComplianceController::class, 'alerts']);

    // 10. Policies
    Route::get('/policies', [PolicyController::class, 'index']);
    Route::post('/policies', [PolicyController::class, 'store']);
    Route::post('/policies/{policy}/acknowledge', [PolicyController::class, 'acknowledge']);

    // 11. Payroll & Gratuity
    Route::get('/payroll/summary', [PayrollController::class, 'summary']);
    Route::get('/payroll/runs', [PayrollController::class, 'runs']);
    Route::get('/payroll/runs/{payrollRun}', [PayrollController::class, 'runDetails']);
    Route::post('/payroll/runs/generate', [PayrollController::class, 'generateRun']);
    Route::get('/payroll/payslips', [PayrollController::class, 'payslips']);
    Route::get('/payroll/my-payslips', [PayrollController::class, 'myPayslips']);
    Route::post('/payroll/gratuity/calculate', [PayrollController::class, 'calculateGratuity']);

    // 12. Roles & Permissions
    Route::get('/roles', [RolePermissionController::class, 'roles']);
    Route::get('/permissions', [RolePermissionController::class, 'permissions']);
    Route::put('/roles/{role}/permissions', [RolePermissionController::class, 'updateRolePermissions']);

    // 13. Reports
    Route::get('/reports/employee-master', [ReportController::class, 'employeeMaster']);
    Route::get('/reports/attendance', [ReportController::class, 'attendanceReport']);
    Route::get('/reports/leaves', [ReportController::class, 'leaveReport']);
});


