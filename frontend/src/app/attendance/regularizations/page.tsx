'use client';

import React, { useState, useEffect } from 'react';
import { CheckSquare, Check, X, ArrowLeft, Plus } from 'lucide-react';
import DataTable, { Column } from '@/components/common/DataTable';
import Badge from '@/components/common/Badge';
import Modal from '@/components/common/Modal';
import api from '@/lib/api';
import { showToast, confirmDialog, successAlert } from '@/lib/swal';

export default function RegularizationsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    regularization_date: new Date().toISOString().slice(0, 10),
    requested_check_in: '09:00',
    requested_check_out: '18:00',
    request_type: 'missed_both',
    reason: '',
  });

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/attendance/regularizations');
      setRequests(res.data.data.data || []);
    } catch {
      showToast('Could not load regularizations', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleProcess = async (id: number, action: 'approved' | 'rejected') => {
    const result = await confirmDialog(
      `${action === 'approved' ? 'Approve' : 'Reject'} Regularization?`,
      `Are you sure you want to mark this request as ${action}?`,
      action === 'approved' ? 'Yes, Approve' : 'Yes, Reject',
      action === 'approved' ? 'question' : 'warning'
    );

    if (result.isConfirmed) {
      try {
        await api.post(`/attendance/regularizations/${id}/process`, { action });
        successAlert(`Request ${action === 'approved' ? 'Approved' : 'Rejected'}`);
        fetchRequests();
      } catch (err: any) {
        showToast(err.response?.data?.message || 'Action failed', 'error');
      }
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/attendance/regularize', formData);
      successAlert('Request Submitted', 'Your attendance regularization request has been sent for approval.');
      setIsModalOpen(false);
      fetchRequests();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Submission failed', 'error');
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'employee',
      header: 'Employee',
      render: (req) => (
        <div>
          <p className="font-semibold text-xs text-[#18213A]">{req.employee?.full_name || 'Staff'}</p>
          <p className="text-[10px] text-[#9AA1B5]">{req.employee?.department?.name || '—'}</p>
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      render: (req) => <span className="font-mono text-xs text-[#18213A]">{req.regularization_date}</span>,
    },
    {
      key: 'type',
      header: 'Request Type',
      render: (req) => (
        <Badge variant="blue" size="sm">
          {req.request_type?.replace(/_/g, ' ').toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'timings',
      header: 'Requested Time',
      render: (req) => (
        <span className="font-mono text-xs text-[#18213A]">
          {req.requested_check_in} - {req.requested_check_out}
        </span>
      ),
    },
    {
      key: 'reason',
      header: 'Reason / Justification',
      render: (req) => <p className="text-xs text-[#68708A] max-w-xs truncate">{req.reason}</p>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (req) => (
        <Badge
          variant={req.status === 'approved' ? 'teal' : req.status === 'rejected' ? 'rose' : 'amber'}
          dot
        >
          {req.status?.toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (req) =>
        req.status === 'pending' ? (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => handleProcess(req.id, 'approved')}
              className="p-1.5 bg-[#E4F5F2] hover:bg-[#0E7C74] text-[#0E7C74] hover:text-white rounded-lg transition"
              title="Approve"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleProcess(req.id, 'rejected')}
              className="p-1.5 bg-[#FBEAEA] hover:bg-[#C64550] text-[#C64550] hover:text-white rounded-lg transition"
              title="Reject"
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
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-[#E6E9F0]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => (window.location.href = '/attendance')}
            className="p-2 rounded-xl bg-[#F2F4F8] hover:bg-[#E6E9F0] text-[#18213A] transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="font-display font-bold text-xl text-[#18213A]">Attendance Regularization Workflow</h2>
            <p className="text-xs text-[#68708A]">Review, approve or submit missed punch corrections.</p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#B8862E] hover:bg-[#9E7124] text-white rounded-lg text-xs font-semibold shadow-xs transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Regularization</span>
        </button>
      </div>

      <DataTable
        title="Pending & Historical Requests"
        columns={columns}
        data={requests}
        isLoading={isLoading}
      />

      {/* New Regularization Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Submit Attendance Regularization"
        subtitle="Request correction for missed check-in/check-out."
      >
        <form onSubmit={handleApply} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#18213A] mb-1">Incident Date *</label>
            <input
              type="date"
              required
              value={formData.regularization_date}
              onChange={(e) => setFormData({ ...formData, regularization_date: e.target.value })}
              className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#18213A] mb-1">Correction Type *</label>
            <select
              value={formData.request_type}
              onChange={(e) => setFormData({ ...formData, request_type: e.target.value })}
              className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E]"
            >
              <option value="missed_both">Missed Both Check-In & Check-Out</option>
              <option value="missed_check_in">Missed Check-In Only</option>
              <option value="missed_check_out">Missed Check-Out Only</option>
              <option value="late_regularization">Late Arrival Regularization</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#18213A] mb-1">Check In Time *</label>
              <input
                type="time"
                required
                value={formData.requested_check_in}
                onChange={(e) => setFormData({ ...formData, requested_check_in: e.target.value })}
                className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#18213A] mb-1">Check Out Time *</label>
              <input
                type="time"
                required
                value={formData.requested_check_out}
                onChange={(e) => setFormData({ ...formData, requested_check_out: e.target.value })}
                className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#18213A] mb-1">Reason / Explanation *</label>
            <textarea
              required
              rows={3}
              placeholder="e.g. VIP Client fitting on site in Abu Dhabi, biometric reader offline..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E]"
            />
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
              Submit Request
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
