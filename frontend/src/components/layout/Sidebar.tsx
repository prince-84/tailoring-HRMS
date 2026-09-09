'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  Clock,
  CheckSquare,
  CalendarDays,
  ShieldAlert,
  FileSpreadsheet,
  FileText,
  CalendarRange,
  Calculator,
  Receipt,
  Lock,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  module: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout, can } = useAuth();

  const navGroups: NavGroup[] = [
    {
      label: 'WORKSPACE',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, module: 'dashboard' },
        { name: 'Employees', href: '/employees', icon: Users, module: 'employees' },
        { name: 'Departments', href: '/departments', icon: Building2, module: 'departments' },
      ],
    },
    {
      label: 'TIME & LEAVE',
      items: [
        { name: 'Attendance', href: '/attendance', icon: Clock, module: 'attendance' },
        { name: 'Regularizations', href: '/attendance/regularizations', icon: CheckSquare, module: 'attendance_approvals' },
        { name: 'Leave Management', href: '/leaves', icon: CalendarDays, module: 'leave_management' },
        { name: 'Shift Rosters', href: '/shifts', icon: CalendarRange, module: 'shifts' },
      ],
    },
    {
      label: 'GOVERNANCE',
      items: [
        { name: 'Compliance & Visas', href: '/compliance', icon: ShieldAlert, module: 'compliance' },
        { name: 'Policies', href: '/policies', icon: FileText, module: 'policies' },
        { name: 'Reports & Analytics', href: '/reports', icon: FileSpreadsheet, module: 'reports' },
      ],
    },
    {
      label: 'PAYROLL',
      items: [
        { name: 'Payroll Dashboard', href: '/payroll', icon: Calculator, module: 'payroll_dashboard' },
        { name: 'Payslips & Gratuity', href: '/payroll/payslips', icon: Receipt, module: 'payroll_payslips' },
      ],
    },
    {
      label: 'SYSTEM',
      items: [
        { name: 'Roles & Permissions', href: '/roles', icon: Lock, module: 'roles_permissions' },
      ],
    },
  ];

  return (
    <aside className="w-64 min-h-screen bg-gradient-to-b from-[#152244] to-[#101B36] text-white flex flex-col fixed left-0 top-0 bottom-0 z-40 shadow-xl border-r border-[#1e2f57]">
      {/* Brand Header */}
      <div className="h-18 px-6 flex items-center gap-3 border-b border-white/10">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#B8862E] to-[#E5B55E] flex items-center justify-center shadow-lg shadow-[#B8862E]/20 text-[#101B36]">
          <Sparkles className="w-5 h-5 font-bold" />
        </div>
        <div>
          <h1 className="font-display font-bold text-base tracking-wide text-white flex items-center gap-1.5">
            BESPOKE <span className="text-[#B8862E] text-xs font-semibold px-1.5 py-0.5 rounded bg-[#B8862E]/20">HRMS</span>
          </h1>
          <p className="text-[11px] text-[#9AA1B5] font-medium tracking-wider">UAE ENTERPRISE</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter((item) => can(item.module, 'view'));
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.label} className="space-y-1">
              <div className="px-3 text-[10px] font-bold text-[#68708A] tracking-wider uppercase">
                {group.label}
              </div>
              <nav className="space-y-0.5 mt-1.5">
                {visibleItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-r-lg text-sm font-medium transition-all duration-150 ${
                        isActive
                          ? 'text-white bg-white/[0.07] font-semibold border-l-4 border-[#B8862E]'
                          : 'text-[#9AA1B5] hover:text-white hover:bg-white/[0.03] border-l-4 border-transparent'
                      }`}
                    >
                      <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-[#B8862E]' : 'text-[#68708A]'}`} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          );
        })}
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-white/10 bg-black/20">
        <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-[#B8862E] text-white flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
              {user?.name?.slice(0, 2) || 'UA'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{user?.name || 'Guest User'}</p>
              <p className="text-[10px] text-[#B8862E] font-medium truncate">{user?.role?.name || 'Employee'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Sign Out"
            className="p-1.5 text-[#9AA1B5] hover:text-rose-400 hover:bg-white/10 rounded-md transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
