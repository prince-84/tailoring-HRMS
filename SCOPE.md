# HRMS Development Prompt — UAE Company

Use this prompt as-is when instructing an AI coding assistant (Claude, Cursor, v0, etc.) or a development team to build the system.

---

## PROJECT OVERVIEW

Build a **full-featured Human Resource Management System (HRMS)** for a company based in the **United Arab Emirates (UAE)**. The system must comply with common UAE Labour Law practices (leave types, Wage Protection System-style payroll, gratuity calculation) and support Arabic-friendly date/number formatting (Gregorian calendar, AED currency).

## TECH STACK (STRICT)

- **Frontend:** Next.js (latest stable version, App Router), TypeScript preferred
- **Styling:** Tailwind CSS
- **Backend / API:** Laravel (latest stable version) — REST API, Laravel Sanctum/Passport for auth
- **Database:** MySQL (latest stable version)
- **Alerts / Notifications (UI):** SweetAlert2 for all confirmations, success/error messages, and toasts (no native `alert()`/`confirm()` anywhere)
- **State Management:** React Context or Zustand (frontend)
- **Charts:** Recharts or Chart.js (for Dashboard & Payroll Dashboard)
- **Icons:** Lucide or Heroicons

## UI / UX REQUIREMENTS

- **Theme:** Light theme only (no dark mode). Clean, bright, **premium/corporate** look — not a generic flat white SaaS template.
- Modern, clean, **attractive** admin dashboard layout: colored sidebar, top navbar with profile/notifications, breadcrumbs.
- Fully responsive (desktop, tablet, mobile).
- Reusable components: DataTable (with search, sort, pagination, export), Modal, Card, Badge, StatCard, FormInput, FileUpload.
- All destructive actions (delete, reject, terminate) → **SweetAlert2 confirmation dialogs**.
- All success/error/validation feedback → **SweetAlert2 toast or alert popups**.
- Loading states (skeletons/spinners) for all async data.
- Empty states designed properly (not blank tables).

### Design Direction (Color, Type, Layout)

Use this as the visual identity — a premium Gulf-corporate look (navy + gold), not a generic light SaaS template.

**Color palette**
| Token | Hex | Usage |
|---|---|---|
| Navy (primary/brand) | `#152244` → `#101B36` gradient | Sidebar background |
| Gold (accent) | `#B8862E` | Active nav indicator, primary buttons, key stat icons, highlight badges |
| Gold soft | `#FBF1DE` | Badge/icon backgrounds for gold accent |
| Teal | `#0E7C74` | Secondary accent — success states, secondary chart series |
| Teal soft | `#E4F5F2` | Success badge backgrounds |
| Blue | `#3562C9` | Info accents, tertiary chart series |
| Blue soft | `#E9EFFC` | Info badge backgrounds |
| Amber | `#C98A1D` | Warning states |
| Amber soft | `#FCF1DD` | Warning badge backgrounds |
| Rose | `#C64550` | Danger/error/absent states |
| Rose soft | `#FBEAEA` | Danger badge backgrounds |
| Background | `#F2F4F8` | Page/app background |
| Surface | `#FFFFFF` | Cards, tables, modals |
| Border | `#E6E9F0` | Card borders, dividers |
| Text primary | `#18213A` | Headings, primary text |
| Text muted | `#68708A` | Secondary text, labels |
| Text faint | `#9AA1B5` | Placeholder, timestamps, meta text |

**Typography**
- Headings/display: **Poppins** (medium/semibold weights) — gives a distinct, slightly geometric personality to page titles, card titles, and stat numbers.
- Body/UI/tables: a clean neutral sans (e.g. **Inter** or system sans) — used for table data, form labels, body copy, nav items.
- Don't use all-caps for every label; reserve it only for small section eyebrows (e.g. sidebar group labels like "WORKSPACE", "PAYROLL").

**Layout concept**
- Fixed **navy sidebar** (not white) on the left — creates strong visual anchor and brand presence without needing a dark theme for the whole app. Sidebar nav items grouped under section labels (Workspace, Time & Leave, Governance, Payroll, System). Active item marked with a **gold left-border indicator**, not a full pill/background block.
- Top bar: white background, search input (soft grey), a contextual pill (e.g. "98% Payroll Processed"), notification bell, and profile block on the right, separated by a vertical divider.
- Main content on a very light cool-grey background (`#F2F4F8`) so white cards lift off the page with a subtle border (no heavy drop shadows — flat elevation via border + background contrast only).
- Dashboard grid: 4 stat cards on top row, a 2-column row below (wide line/bar chart + donut chart), then a 3-column row of list-style cards (compliance alerts, celebrations, pending approvals).
- Status/priority is always color-coded consistently across the whole app: gold = primary/neutral-positive, teal = success/approved, amber = warning/pending, rose = danger/rejected/absent, blue = informational.

**Principles**
- Avoid generic "SaaS card kit" look: don't put an identical border-radius + soft grey shadow on every single element — vary radius intentionally (larger radius on cards, smaller/pill on badges) and use border-based flat elevation instead of shadows.
- Avoid decorative gradients except the intentional sidebar gradient (navy to darker navy) — everything else stays flat and clean.
- Keep one bold visual signature (the navy sidebar + gold accent) and keep everything else quiet and disciplined around it.

## AUTHENTICATION & GLOBAL SETUP

- Login, Forgot Password, Reset Password (email-based OTP or link).
- Multi-tenant ready structure is optional; assume single-company setup with **branches/locations** support (useful for UAE companies with multiple emirates offices — Dubai, Abu Dhabi, Sharjah, etc.).
- Employee Self-Service (ESS) portal vs Admin/HR portal (role-based views of the same app).
- Company settings: company profile, logo, working days, timezone (Asia/Dubai), currency (AED), fiscal year.

---

## MODULES (DETAILED SPECIFICATION)

### 1. Dashboard
- Role-based dashboards (Admin/HR view vs Employee view).
- **Admin/HR Dashboard widgets:**
  - Total employees, active/inactive count
  - Today's attendance summary (present, absent, late, on leave)
  - Pending leave approvals count
  - Pending attendance approvals count
  - Upcoming birthdays & work anniversaries
  - Department-wise employee distribution (chart)
  - Payroll summary for current month (processed vs pending)
  - Compliance alerts (expiring visas/labour cards/Emirates ID — see Compliance module)
- **Employee Dashboard widgets:**
  - Check-in/Check-out quick action
  - Leave balance summary
  - My attendance this month (chart)
  - My latest payslip
  - Announcements/notice board

### 2. Departments
- CRUD for departments (Name, Code, Head of Department, Description, Status).
- Department hierarchy support (parent/sub-department) — optional but preferred.
- Assign employees to departments; show employee count per department.
- SweetAlert confirmation on delete (block delete if employees are assigned; show warning).

### 3. Designations
- CRUD for designations/job titles (Title, Department link, Level/Grade, Description).
- Link designations to departments (a designation can belong to a department or be general).
- Used in employee profile, org chart, and payroll grade mapping.

### 4. Attendance (with Check-in / Check-out)
- Employee-facing **Check-in / Check-out** button on dashboard/attendance page:
  - Capture timestamp, geolocation (lat/long) and/or IP address, optional selfie/photo capture, optional office/site selection.
  - Show live working-hours timer after check-in.
  - Prevent duplicate check-ins per day; handle multiple shifts if applicable.
- Admin/HR Attendance view:
  - Daily/monthly attendance table per employee (Present, Absent, Late, Half-day, On Leave, Holiday, Weekend).
  - Manual attendance entry/correction by HR.
  - Filters: by department, designation, date range, status.
  - Late arrival & early departure detection based on shift timing.
  - Export attendance report (Excel/PDF).
- Biometric/device integration hook (optional API endpoint placeholder for future biometric machine sync).

### 5. Attendance Approvals
- Workflow for employee attendance regularization requests (e.g., missed check-out, manual entry request, correction request).
- Employee submits request with reason + supporting note; HR/Manager approves/rejects with SweetAlert confirmation.
- Status tracking: Pending, Approved, Rejected.
- Notification/email on status change.
- Approval hierarchy configurable (Manager → HR, or direct HR approval).

### 6. Leave Management
- Leave types configurable, pre-seeded with **common UAE Labour Law leave types**:
  - Annual Leave (typically 30 calendar days/year)
  - Sick Leave (with paid/half-paid/unpaid tiers as per UAE law)
  - Maternity Leave
  - Paternity Leave
  - Compassionate/Bereavement Leave
  - Hajj Leave (once during service)
  - Unpaid Leave
  - Public Holiday (UAE official holidays calendar, configurable per year)
- Leave balance calculation (accrual-based or annual allocation), carry-forward rules configurable.
- Employee leave application form (date range, type, reason, attachment for sick leave/medical certificate).
- Approval workflow (Manager → HR) with SweetAlert confirm/reject dialogs.
- Leave calendar view (team calendar showing who's on leave).
- Leave balance report per employee.

### 7. Compliance
- Track UAE-specific compliance documents per employee:
  - Passport (number, expiry)
  - Visa (type, number, expiry)
  - Emirates ID (number, expiry)
  - Labour Card / Work Permit (number, expiry)
  - Medical Insurance (provider, policy number, expiry)
  - Emirates ID / Visa sponsor details
- Automated **expiry alerts** (e.g., 90/60/30 days before expiry) shown on Dashboard and sent via email/notification.
- Document upload & secure storage (PDF/image) per record.
- Compliance status report (expired, expiring soon, valid) — filterable by department.

### 8. Reports
- Centralized reports module with export to Excel/PDF:
  - Attendance report
  - Leave report
  - Payroll report
  - Compliance/document expiry report
  - Employee master report (headcount, department-wise, gender, nationality distribution — useful for UAE Emiratization reporting)
  - Turnover/attrition report
- Filters: date range, department, designation, branch.
- Scheduled report option (optional — email report on interval).

### 9. Policies
- HR Policy document management: upload, categorize (e.g., Leave Policy, Code of Conduct, IT Policy), version control.
- Employee acknowledgment tracking (employee must "read & accept" — log timestamp + user).
- Policy list view for employees (ESS portal) with search.

### 10. Shifts
- Shift master: define shift name, start time, end time, break duration, grace period (late marking threshold), working days pattern.
- Assign shifts to employees or departments (default shift + override per employee).
- Support rotational shifts / shift roster/scheduling calendar.
- Link shifts to Attendance module for late/early/absent calculation logic.

### 11. Payroll Dashboard
- Visual payroll overview per pay period:
  - Total payroll cost, total employees paid, pending payroll runs
  - Breakdown by department (chart)
  - Basic salary vs allowances vs deductions summary
  - WPS (Wage Protection System) file generation status/export (SIF file format placeholder for UAE banks)
- Salary structure setup: Basic, Housing Allowance, Transport Allowance, Other Allowances, Deductions.
- Payroll run workflow: Draft → Review → Approve → Process → Paid, with SweetAlert confirmations at each stage.
- **Gratuity calculation** module (End of Service Benefits per UAE Labour Law — based on basic salary and years of service, unlimited/limited contract logic).

### 12. Payroll Payslips
- Generate monthly payslips per employee (PDF download) showing: Basic, Allowances, Deductions, Overtime, Net Pay, Employer contributions.
- Payslip history per employee (ESS portal — employees can view/download their own payslips only).
- Bulk payslip generation & bulk email/download (zip) for HR.
- Payslip template should be clean, branded with company logo, in AED currency format.

### 13. Roles & Permissions (with Granular Feature-Level Control)
- Role-based access control (RBAC): create custom roles (e.g., Super Admin, HR Manager, Department Manager, Employee).
- **Granular permissions** — not just per-module but per-action (View, Create, Edit, Delete, Approve, Export) for every module listed above.
- Permission matrix UI (checkbox grid: Modules × Actions) for easy assignment.
- Assign one or multiple roles to a user; support permission override at individual user level (optional advanced feature).
- Middleware-level enforcement on both Laravel API routes and Next.js UI (hide/disable UI elements user isn't permitted to use).

---

## DATABASE NOTES

- Design normalized MySQL schema: `employees`, `departments`, `designations`, `shifts`, `attendance`, `attendance_regularizations`, `leave_types`, `leave_applications`, `leave_balances`, `compliance_documents`, `policies`, `policy_acknowledgements`, `payroll_runs`, `payslips`, `salary_structures`, `roles`, `permissions`, `role_permissions`, `users`.
- Use Laravel migrations & seeders (seed UAE public holidays and default leave types).
- Soft deletes on core HR tables (employees, departments, etc.).

## DELIVERABLE EXPECTATIONS

- Laravel backend: RESTful API with proper validation, form requests, API resources, and Sanctum authentication.
- Next.js frontend: consuming the API, with protected routes based on role/permissions.
- Seed data for demo (sample departments, designations, shifts, leave types, and 10–15 dummy employees).
- README with setup instructions for both Laravel (.env, migrate, seed) and Next.js (.env.local, API base URL).

---

**Instruction to AI/Developer:** Build this system module by module, starting with Auth → Roles & Permissions → Departments/Designations → Employees → Attendance/Shifts → Leave → Compliance → Payroll → Reports/Policies → Dashboard (last, since it aggregates data from all other modules). Confirm the dark theme design direction with a sample login + dashboard screen before proceeding to build out all modules.
