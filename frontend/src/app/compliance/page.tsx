'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Plus, AlertCircle, FileText, CheckCircle2, Building, Download } from 'lucide-react';
import DataTable, { Column } from '@/components/common/DataTable';
import Badge from '@/components/common/Badge';
import Modal from '@/components/common/Modal';
import api from '@/lib/api';
import { showToast, successAlert, errorAlert } from '@/lib/swal';

export default function CompliancePage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Add Document Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: '',
    document_type: 'Emirates ID',
    document_number: '',
    issue_date: '',
    expiry_date: '',
    issuing_authority: 'Federal Authority for Identity and Citizenship (ICP)',
    sponsor_name: 'Bespoke Haute Couture Tailoring LLC',
    notes: '',
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const statusParam = activeFilter !== 'all' ? `&status=${activeFilter}` : '';
      const [docRes, empRes] = await Promise.all([
        api.get(`/compliance?per_page=100${statusParam}`),
        api.get('/employees?per_page=100'),
      ]);
      setDocuments(docRes.data.data.data || []);
      setEmployees(empRes.data.data.data || []);
    } catch {
      showToast('Could not load compliance records', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/compliance', formData);
      successAlert('Document Recorded', 'UAE compliance record has been securely saved with automated expiry alerts.');
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      errorAlert('Error Recording Document', err.response?.data?.message || 'Please check form inputs.');
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'employee',
      header: 'Employee',
      render: (doc) => (
        <div>
          <p className="font-semibold text-xs text-[#18213A]">{doc.employee?.full_name || 'Staff'}</p>
          <p className="text-[10px] text-[#9AA1B5]">
            {doc.employee?.employee_code} • {doc.employee?.department?.name || '—'}
          </p>
        </div>
      ),
    },
    {
      key: 'document_type',
      header: 'Document Type',
      render: (doc) => (
        <span className="text-xs font-semibold text-[#152244] bg-[#F2F4F8] px-2 py-1 rounded">
          {doc.document_type}
        </span>
      ),
    },
    {
      key: 'document_number',
      header: 'Document Number',
      render: (doc) => (
        <span className="font-mono text-xs font-semibold text-[#18213A]">{doc.document_number}</span>
      ),
    },
    {
      key: 'issuing_authority',
      header: 'Authority / Sponsor',
      render: (doc) => (
        <div>
          <p className="text-xs text-[#18213A] font-medium truncate max-w-xs">{doc.issuing_authority || '—'}</p>
          <p className="text-[10px] text-[#68708A]">{doc.sponsor_name || 'Direct Employer'}</p>
        </div>
      ),
    },
    {
      key: 'expiry_date',
      header: 'Expiry Date',
      render: (doc) => {
        const days = Math.floor((new Date(doc.expiry_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
        const isExpired = days < 0;
        const isCritical = days <= 30;
        return (
          <div>
            <span className="font-mono text-xs font-bold text-[#18213A]">{doc.expiry_date}</span>
            <span
              className={`block text-[10px] font-bold mt-0.5 ${
                isExpired
                  ? 'text-[#C64550]'
                  : isCritical
                  ? 'text-[#C64550]'
                  : days <= 90
                  ? 'text-[#C98A1D]'
                  : 'text-[#0E7C74]'
              }`}
            >
              {isExpired ? `EXPIRED (${Math.abs(days)}d ago)` : `${days} Days Remaining`}
            </span>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (doc) => {
        const days = Math.floor((new Date(doc.expiry_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
        const variant = days < 0 ? 'rose' : days <= 90 ? 'amber' : 'teal';
        return (
          <Badge variant={variant} dot>
            {days < 0 ? 'EXPIRED' : days <= 90 ? 'EXPIRING SOON' : 'VALID'}
          </Badge>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E6E9F0]">
        <div>
          <h2 className="font-display font-bold text-xl text-[#18213A]">UAE Legal & Visa Compliance</h2>
          <p className="text-xs text-[#68708A]">
            Mandatory tracking of Passports, Visas, Emirates IDs, MOHRE Labour Cards, and Medical Insurance.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#B8862E] hover:bg-[#9E7124] text-white rounded-xl text-xs font-semibold shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Record Document</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {[
          { key: 'all', label: 'All Documents' },
          { key: 'expiring_soon', label: 'Expiring Soon (≤ 90 Days)' },
          { key: 'expired', label: 'Expired Documents' },
          { key: 'valid', label: 'Valid & Active' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeFilter === tab.key
                ? 'bg-[#152244] text-white shadow-xs'
                : 'bg-white text-[#68708A] hover:bg-[#F2F4F8] border border-[#E6E9F0]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <DataTable
        title="Compliance Register"
        columns={columns}
        data={documents}
        isLoading={isLoading}
      />

      {/* Add Document Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Compliance Document"
        subtitle="Track UAE statutory expiry dates and auto-alerts."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#18213A] mb-1">Employee *</label>
            <select
              required
              value={formData.employee_id}
              onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
              className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E]"
            >
              <option value="">Select Employee</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.employee_code} — {e.first_name} {e.last_name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#18213A] mb-1">Document Type *</label>
              <select
                value={formData.document_type}
                onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
                className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E]"
              >
                <option value="Emirates ID">Emirates ID</option>
                <option value="Passport">Passport</option>
                <option value="Visa">Employment / Residence Visa</option>
                <option value="Labour Card">MOHRE Labour Card</option>
                <option value="Medical Insurance">Medical Insurance Card</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#18213A] mb-1">Document / Card Number *</label>
              <input
                type="text"
                required
                value={formData.document_number}
                onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
                placeholder="784-XXXX-XXXXXXX-X"
                className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#18213A] mb-1">Issue Date</label>
              <input
                type="date"
                value={formData.issue_date}
                onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#18213A] mb-1">Expiry Date *</label>
              <input
                type="date"
                required
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#18213A] mb-1">Issuing Authority / Sponsor</label>
            <input
              type="text"
              value={formData.issuing_authority}
              onChange={(e) => setFormData({ ...formData, issuing_authority: e.target.value })}
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
              Save Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
