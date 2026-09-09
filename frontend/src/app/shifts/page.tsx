'use client';

import React, { useState, useEffect } from 'react';
import { CalendarRange, Plus, Clock, Users } from 'lucide-react';
import DataTable, { Column } from '@/components/common/DataTable';
import Badge from '@/components/common/Badge';
import Modal from '@/components/common/Modal';
import api from '@/lib/api';
import { showToast, successAlert, errorAlert } from '@/lib/swal';

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    start_time: '09:00',
    end_time: '18:00',
    break_minutes: 60,
    grace_period_minutes: 15,
    is_rotational: false,
    status: 'active',
  });

  const fetchShifts = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/shifts');
      setShifts(res.data.data || []);
    } catch {
      showToast('Could not load shifts', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/shifts', formData);
      successAlert('Shift Created', `Shift ${formData.name} has been added.`);
      setIsModalOpen(false);
      fetchShifts();
    } catch (err: any) {
      errorAlert('Failed to Create Shift', err.response?.data?.message || 'Error occurred.');
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'code',
      header: 'Code',
      render: (s) => (
        <span className="font-mono text-xs font-bold text-[#152244] bg-[#F2F4F8] px-2 py-1 rounded">
          {s.code}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Shift Name',
      render: (s) => <span className="font-semibold text-xs text-[#18213A]">{s.name}</span>,
    },
    {
      key: 'timings',
      header: 'Working Hours',
      render: (s) => (
        <span className="font-mono text-xs font-semibold text-[#0E7C74]">
          {s.start_time?.slice(0, 5)} — {s.end_time?.slice(0, 5)}
        </span>
      ),
    },
    {
      key: 'break_minutes',
      header: 'Break Duration',
      render: (s) => <span className="text-xs text-[#68708A]">{s.break_minutes} Minutes</span>,
    },
    {
      key: 'grace_period_minutes',
      header: 'Late Grace Period',
      render: (s) => (
        <Badge variant="amber" size="sm">
          +{s.grace_period_minutes} mins grace
        </Badge>
      ),
    },
    {
      key: 'employees_count',
      header: 'Assigned Staff',
      render: (s) => <span className="font-mono text-xs text-[#18213A]">{s.employees_count || 0} Staff</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (s) => (
        <Badge variant={s.status === 'active' ? 'teal' : 'neutral'} dot>
          {s.status?.toUpperCase()}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E6E9F0]">
        <div>
          <h2 className="font-display font-bold text-xl text-[#18213A]">Shift Masters & Rosters</h2>
          <p className="text-xs text-[#68708A]">
            Define shift timings, rotational rosters, and punctuality grace thresholds.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#B8862E] hover:bg-[#9E7124] text-white rounded-xl text-xs font-semibold shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Define New Shift</span>
        </button>
      </div>

      <DataTable
        title="Shift Masters"
        columns={columns}
        data={shifts}
        isLoading={isLoading}
      />

      {/* Add Shift Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Define Shift Schedule"
        subtitle="Set working hours, meal breaks, and late grace periods."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#18213A] mb-1">Shift Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Production Morning Shift"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#18213A] mb-1">Shift Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. PRD-MORN"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#18213A] mb-1">Start Time *</label>
              <input
                type="time"
                required
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#18213A] mb-1">End Time *</label>
              <input
                type="time"
                required
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#18213A] mb-1">Break Duration (Mins)</label>
              <input
                type="number"
                value={formData.break_minutes}
                onChange={(e) => setFormData({ ...formData, break_minutes: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#18213A] mb-1">Late Grace Period (Mins)</label>
              <input
                type="number"
                value={formData.grace_period_minutes}
                onChange={(e) => setFormData({ ...formData, grace_period_minutes: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-[#F2F4F8] text-xs font-semibold text-[#68708A] rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#B8862E] hover:bg-[#9E7124] text-xs font-semibold text-white rounded-lg shadow-sm"
            >
              Save Shift
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
