# Bespoke HRMS — UAE Enterprise Human Resource System

A full-featured, enterprise-grade Human Resource Management System (HRMS) built specifically for UAE businesses according to UAE Labour Law (Federal Decree-Law No. 33 of 2021) and Central Bank Wage Protection System (WPS) standards.

---

## 🏗️ Architecture & Tech Stack

- **Backend (`/backend`)**: Laravel 12 REST API, Laravel Sanctum, MySQL (`tailoring_hrms`), Form Requests, Seeders, API Resources.
- **Frontend (`/frontend`)**: Next.js 15+ App Router, TypeScript, Tailwind CSS, SweetAlert2, Lucide React, Recharts.
- **Design Aesthetic**: Premium Gulf-Corporate Navy (`#152244` → `#101B36`) + Gold (`#B8862E`) theme on light canvas (`#F2F4F8`).

---

## 🚀 Quick Start Instructions

### 1. Backend Setup (`/backend`)

```bash
cd backend

# 1. Environment is already configured with:
# DB_DATABASE=tailoring_hrms
# DB_USERNAME=root
# DB_PASSWORD=ok123456

# 2. Run migrations and seed data
php artisan migrate:fresh --seed

# 3. Start the Laravel API server (Port 8000)
php artisan serve
```

Backend API will be accessible at: `http://localhost:8000/api`

---

### 2. Frontend Setup (`/frontend`)

```bash
cd frontend

# 1. Install dependencies (already completed)
npm install

# 2. Start the Next.js development server (Port 3000)
npm run dev
```

Frontend will be accessible at: `http://localhost:3000`

---

## 🔑 Demo User Accounts

All demo accounts use the standard password: `password`

| Role | Email | Password | Scope & Access |
|---|---|---|---|
| **Super Admin** | `admin@hrms.ae` | `password` | Complete unrestricted access across all 13 modules & settings |
| **HR Manager** | `hr@hrms.ae` | `password` | Staff enrollment, leave approvals, WPS payroll batch, compliance |
| **Employee** | `employee@hrms.ae` | `password` | ESS Portal (Check-in/out, apply leave, my payslips, read policies) |

---

## 📋 13 In-Scope Modules Included

1. **Dashboard**: Live UAE time (GST), workforce stats, weekly attendance area chart, department donut, compliance alerts.
2. **Departments**: Organization hierarchy, staff count, branch mapping.
3. **Designations**: Job grades, titles, department associations.
4. **Attendance**: Daily punch log, GPS/IP capture, shift grace period calculations.
5. **Attendance Approvals**: Regularization request workflow (Approve/Reject with SweetAlert2).
6. **Leave Management**: UAE standard leave types (Annual 30d, Sick Leave 3 Tiers, Maternity, Paternity, Bereavement, Hajj, UAE Public Holidays 2026).
7. **Compliance & Visas**: Passport, Visa, Emirates ID, MOHRE Labour Card, Insurance tracking with 90/60/30-day alerts.
8. **Payroll Dashboard**: Gross/Net cost analysis, WPS SIF export formatting.
9. **Payslips & Gratuity**: Monthly payslip viewer/printer + UAE Labour Law Article 51 Gratuity (EOSB) calculator.
10. **Policies**: Corporate guidelines repository with employee acknowledgment tracking.
11. **Shift Masters**: Schedule timings, meal breaks, late grace periods.
12. **Reports & Analytics**: UAE Emiratization metrics, nationality diversity, headcount distribution.
13. **Roles & Permissions**: Granular RBAC matrix (13 modules × 6 actions: View, Create, Edit, Delete, Approve, Export).
