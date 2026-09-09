'use client';

import React, { useState, useEffect } from 'react';
import { Search, Bell, MapPin, ShieldCheck, ChevronDown, Clock as ClockIcon, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { showToast } from '@/lib/swal';

export default function Navbar() {
  const { user, login } = useAuth();
  const [uaeTime, setUaeTime] = useState<string>('');
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Dubai',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      };
      setUaeTime(new Intl.DateTimeFormat('en-US', options).format(new Date()));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const switchDemoRole = async (email: string) => {
    try {
      const res = await api.post('/login', {
        email,
        password: 'password',
      });
      login(res.data.token, res.data.user);
      setShowRoleMenu(false);
    } catch {
      showToast('Could not switch demo user', 'error');
    }
  };

  return (
    <header className="h-18 bg-white border-b border-[#E6E9F0] sticky top-0 z-30 flex items-center justify-between px-8 shadow-xs">
      {/* Search Bar */}
      <div className="flex items-center gap-3 w-96">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-[#9AA1B5] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search employee, designation, policy..."
            className="w-full pl-10 pr-4 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-sm text-[#18213A] placeholder-[#9AA1B5] focus:outline-none focus:border-[#B8862E] focus:bg-white transition"
          />
        </div>
      </div>

      {/* Right Controls & Info */}
      <div className="flex items-center gap-4">
        {/* Contextual UAE Status Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E4F5F2] border border-[#0E7C74]/20 text-[#0E7C74] text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#0E7C74] animate-pulse"></span>
          <span>98% Payroll Processed</span>
        </div>

        {/* Live Dubai Time */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#F2F4F8] rounded-lg text-xs font-medium text-[#18213A] border border-[#E6E9F0]">
          <ClockIcon className="w-3.5 h-3.5 text-[#B8862E]" />
          <span>Dubai (GST):</span>
          <span className="font-semibold text-[#152244]">{uaeTime || '09:00 AM'}</span>
        </div>

        {/* Branch Pin */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-[#68708A] font-medium bg-[#F2F4F8] px-2.5 py-1.5 rounded-lg border border-[#E6E9F0]">
          <MapPin className="w-3.5 h-3.5 text-[#3562C9]" />
          <span>{user?.branch?.code || 'DXB-HQ'}</span>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button className="p-2 rounded-lg text-[#68708A] hover:bg-[#F2F4F8] hover:text-[#18213A] transition relative border border-[#E6E9F0]">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#C64550]"></span>
          </button>
        </div>

        <div className="h-7 w-[1px] bg-[#E6E9F0]"></div>

        {/* User Profile & Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-[#F2F4F8] transition"
          >
            <div className="w-9 h-9 rounded-xl bg-[#152244] text-[#B8862E] font-bold text-sm flex items-center justify-center border border-[#B8862E]/30">
              {user?.name?.slice(0, 2) || 'AD'}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-semibold text-[#18213A] leading-tight">{user?.name || 'Administrator'}</p>
              <p className="text-[11px] font-medium text-[#B8862E]">{user?.role?.name || 'Super Admin'}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#9AA1B5]" />
          </button>

          {/* Quick Demo Role Switch Dropdown */}
          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-[#E6E9F0] py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2 border-b border-[#E6E9F0]">
                <p className="text-xs font-bold text-[#18213A]">Switch Active Demo Role</p>
                <p className="text-[10px] text-[#68708A]">Test role-based views instantly</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => switchDemoRole('admin@hrms.ae')}
                  className="w-full text-left px-4 py-2 text-xs hover:bg-[#F2F4F8] flex items-center justify-between text-[#18213A]"
                >
                  <div>
                    <span className="font-semibold block">Super Admin</span>
                    <span className="text-[10px] text-[#9AA1B5]">admin@hrms.ae</span>
                  </div>
                  {user?.role?.slug === 'super-admin' && <ShieldCheck className="w-4 h-4 text-[#B8862E]" />}
                </button>

                <button
                  onClick={() => switchDemoRole('hr@hrms.ae')}
                  className="w-full text-left px-4 py-2 text-xs hover:bg-[#F2F4F8] flex items-center justify-between text-[#18213A]"
                >
                  <div>
                    <span className="font-semibold block">HR Manager</span>
                    <span className="text-[10px] text-[#9AA1B5]">hr@hrms.ae</span>
                  </div>
                  {user?.role?.slug === 'hr-manager' && <ShieldCheck className="w-4 h-4 text-[#0E7C74]" />}
                </button>

                <button
                  onClick={() => switchDemoRole('employee@hrms.ae')}
                  className="w-full text-left px-4 py-2 text-xs hover:bg-[#F2F4F8] flex items-center justify-between text-[#18213A]"
                >
                  <div>
                    <span className="font-semibold block">Employee (Tariq M.)</span>
                    <span className="text-[10px] text-[#9AA1B5]">employee@hrms.ae</span>
                  </div>
                  {user?.role?.slug === 'employee' && <ShieldCheck className="w-4 h-4 text-[#3562C9]" />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
