'use client';

import React, { useState, useEffect } from 'react';
import { CalendarDays, Plus, Check, X, Palmtree, Thermometer, Flag, AlertCircle } from 'lucide-react';
import DataTable, { Column } from '@/components/common/DataTable';
import Badge from '@/components/common/Badge';
import CreateLeaveRequestModal from '@/components/leave/CreateLeaveRequestModal';
import api from '@/lib/api';
import { showToast, confirmDialog, successAlert, errorAlert } from '@/lib/swal';

export default function LeavesPage() {
  const [balances, setBalances] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [holidays, setHolidays] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [employees, setEmployees] = useState<any[]>([]);

  // Apply Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    leave_type_id: '',
    start_date: new Date().toISOString().slice(0, 10),
    end_date: new Date().toISOString().slice(0, 10),
    reason: '',
    emergency_contact: '+971 50 ',
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [typeRes, balRes, appRes, holRes, employeeRes] = await Promise.all([
      api.get('/leave/types'),
      api.get('/leave/balances'),
      api.get('/leave/applications'),
      api.get('/public-holidays'),
      api.get('/employees?per_page=100'),
    ]);
      setTypes(typeRes.data.data || []);
      setBalances(balRes.data.data || []);
      setApplications(appRes.data.data.data || []);
      setHolidays(holRes.data.data || []);
      setEmployees(employeeRes.data.data?.data || employeeRes.data.data || []);
    } catch {
      showToast('Could not load leave records', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApply = async (values: {
  leave_type_id: string;
  start_date: string;
  end_date: string;
  reason: string;
  emergency_contact: string;
  }) => {
    try {
      await api.post('/leave/apply', values);
      successAlert(
        'Leave Application Submitted',
        'Your request has been routed to your department manager.'
      );
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      errorAlert(
        'Application Failed',
        err.response?.data?.message || 'Please verify leave balance and dates.'
      );
    }
  };

  const handleProcess = async (id: number, action: 'approved' | 'rejected') => {
    const res = await confirmDialog(
      `${action === 'approved' ? 'Approve' : 'Reject'} Leave Request?`,
      `Are you sure you want to ${action} this leave request?`,
      action === 'approved' ? 'Yes, Approve' : 'Yes, Reject',
      action === 'approved' ? 'question' : 'warning'
    );

    if (res.isConfirmed) {
      try {
        await api.post(`/leave/applications/${id}/process`, { action });
        successAlert(`Leave ${action === 'approved' ? 'Approved' : 'Rejected'}`);
        fetchData();
      } catch (err: any) {
        showToast(err.response?.data?.message || 'Processing failed', 'error');
      }
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'employee',
      header: 'Employee',
      render: (app) => (
        <div>
          <p className="font-semibold text-xs text-[#18213A]">{app.employee?.full_name || 'Staff'}</p>
          <p className="text-[10px] text-[#9AA1B5]">{app.employee?.department?.name || '—'}</p>
        </div>
      ),
    },
    {
      key: 'leave_type',
      header: 'Leave Type',
      render: (app) => (
        <span className="text-xs font-semibold text-[#152244]">
          {app.leave_type?.name}
        </span>
      ),
    },
    {
      key: 'duration',
      header: 'Duration',
      render: (app) => (
        <div>
          <span className="font-mono text-xs font-bold text-[#0E7C74] bg-[#E4F5F2] px-2 py-0.5 rounded">
            {app.total_days} Days
          </span>
          <p className="text-[10px] text-[#9AA1B5] mt-1">
            {app.start_date} → {app.end_date}
          </p>
        </div>
      ),
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (app) => <p className="text-xs text-[#68708A] max-w-xs truncate">{app.reason}</p>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (app) => (
        <Badge
          variant={app.status === 'approved' ? 'teal' : app.status === 'rejected' ? 'rose' : 'amber'}
          dot
        >
          {app.status?.toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (app) =>
        app.status === 'pending' ? (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => handleProcess(app.id, 'approved')}
              className="p-1.5 bg-[#E4F5F2] hover:bg-[#0E7C74] text-[#0E7C74] hover:text-white rounded-lg transition"
              title="Approve Leave"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleProcess(app.id, 'rejected')}
              className="p-1.5 bg-[#FBEAEA] hover:bg-[#C64550] text-[#C64550] hover:text-white rounded-lg transition"
              title="Reject Leave"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <span className="text-[11px] text-[#9AA1B5]">Processed</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E6E9F0]">
        <div>
          <h2 className="font-display font-bold text-xl text-[#18213A]">Leave & Vacation Management</h2>
          <p className="text-xs text-[#68708A]">
            UAE standard 30-day statutory leave, sick leave tiers, and public holiday schedule.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#B8862E] hover:bg-[#9E7124] text-white rounded-xl text-xs font-semibold shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Apply for Leave</span>
        </button>
      </div>

      {/* Leave Balances Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {balances.map((bal) => (
          <div
            key={bal.id}
            className="p-5 rounded-2xl bg-white border border-[#E6E9F0] shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#68708A]">{bal.leave_type?.name}</span>
              <Palmtree className="w-4 h-4 text-[#B8862E]" />
            </div>
            <div className="mt-3">
              <div className="font-display text-2xl font-bold text-[#18213A]">
                {bal.remaining_days} <span className="text-xs font-normal text-[#9AA1B5]">/ {bal.total_allocated} Days</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#68708A] mt-2 pt-2 border-t border-[#E6E9F0]">
                <span>Used: {bal.used_days}d</span>
                <span>Pending: {bal.pending_days}d</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Leave Applications Table */}
      <DataTable
        title="Leave Applications & Approval Workflow"
        columns={columns}
        data={applications}
        isLoading={isLoading}
      />

      {/* UAE Public Holidays Calendar Card */}
      <div className="bg-white p-6 rounded-2xl border border-[#E6E9F0] shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Flag className="w-4 h-4 text-[#0E7C74]" />
          <h3 className="font-display font-bold text-base text-[#18213A]">UAE Official Public Holidays (2026)</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {holidays.map((h) => (
            <div key={h.id} className="p-3.5 rounded-xl bg-[#F2F4F8] border border-[#E6E9F0] flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#0E7C74] bg-[#E4F5F2] px-2 py-0.5 rounded">
                  {h.days_count} {h.days_count > 1 ? 'Days Off' : 'Day Off'}
                </span>
                <p className="text-xs font-bold text-[#18213A] mt-2">{h.name}</p>
                <p className="text-[11px] text-[#68708A] mt-0.5">{h.description}</p>
              </div>
              <span className="font-mono text-xs font-semibold text-[#B8862E] mt-2 block">{h.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Apply Leave Modal */}
      <CreateLeaveRequestModal  
        open={isModalOpen}
        employees={employees}
        leaveTypes={types}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(values) => {
          handleApply({
            leave_type_id: values.leaveType,
            start_date: values.startDate,
            end_date: values.endDate,
            reason: values.description,
            emergency_contact: '',
          });
        }}
      />
    </div>
  );
}
