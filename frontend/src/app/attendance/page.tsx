'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Calendar, CheckCircle, AlertTriangle, UserCheck, ShieldAlert } from 'lucide-react';
import DataTable, { Column } from '@/components/common/DataTable';
import Badge from '@/components/common/Badge';
import api from '@/lib/api';
import { showToast, successAlert } from '@/lib/swal';

export default function AttendancePage() {
  const [attendances, setAttendances] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [isLoading, setIsLoading] = useState(true);

  const fetchAttendance = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/attendance?date=${selectedDate}&per_page=100`);
      setAttendances(res.data.data.data || []);
    } catch {
      showToast('Could not fetch attendance records', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  const columns: Column<any>[] = [
    {
      key: 'employee',
      header: 'Employee',
      render: (att) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#152244] text-[#B8862E] font-bold text-xs flex items-center justify-center">
            {att.employee?.first_name?.[0]}
            {att.employee?.last_name?.[0]}
          </div>
          <div>
            <p className="font-semibold text-xs text-[#18213A]">{att.employee?.full_name || `${att.employee?.first_name} ${att.employee?.last_name}`}</p>
            <p className="text-[10px] text-[#9AA1B5]">{att.employee?.department?.name || '—'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'shift',
      header: 'Assigned Shift',
      render: (att) => (
        <span className="text-xs text-[#18213A] font-medium">
          {att.shift?.name?.split('(')[0] || 'General Shift'}
        </span>
      ),
    },
    {
      key: 'check_in',
      header: 'Check In',
      render: (att) => (
        <span className="font-mono text-xs font-semibold text-[#18213A]">
          {att.check_in ? att.check_in.slice(0, 5) : '—'}
        </span>
      ),
    },
    {
      key: 'check_out',
      header: 'Check Out',
      render: (att) => (
        <span className="font-mono text-xs font-semibold text-[#18213A]">
          {att.check_out ? att.check_out.slice(0, 5) : '—'}
        </span>
      ),
    },
    {
      key: 'working_hours',
      header: 'Working Hours',
      render: (att) => (
        <span className="font-mono text-xs font-bold text-[#0E7C74]">
          {att.working_hours ? `${att.working_hours} hrs` : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (att) => {
        const variant =
          att.status === 'present'
            ? 'teal'
            : att.status === 'late'
            ? 'amber'
            : att.status === 'on_leave'
            ? 'blue'
            : 'rose';
        return (
          <Badge variant={variant} dot>
            {att.status?.toUpperCase()}
            {att.late_minutes > 0 && ` (+${att.late_minutes}m)`}
          </Badge>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E6E9F0]">
        <div>
          <h2 className="font-display font-bold text-xl text-[#18213A]">Daily Attendance Register</h2>
          <p className="text-xs text-[#68708A] mt-0.5">
            Real-time biometric, geolocation and shift punctuality tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#F2F4F8] px-3 py-1.5 rounded-xl border border-[#E6E9F0] text-xs">
            <Calendar className="w-4 h-4 text-[#B8862E]" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs text-[#18213A] font-semibold focus:outline-none"
            />
          </div>

          <button
            onClick={() => (window.location.href = '/attendance/regularizations')}
            className="px-3.5 py-1.5 bg-[#F2F4F8] hover:bg-[#E6E9F0] text-xs font-semibold text-[#18213A] rounded-xl border border-[#E6E9F0] transition"
          >
            Regularization Requests
          </button>
        </div>
      </div>

      <DataTable
        title={`Attendance Log — ${selectedDate}`}
        columns={columns}
        data={attendances}
        isLoading={isLoading}
      />
    </div>
  );
}
