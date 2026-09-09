'use client';

import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle2, Plus, ShieldCheck, Download, Calendar } from 'lucide-react';
import Badge from '@/components/common/Badge';
import Modal from '@/components/common/Modal';
import api from '@/lib/api';
import { showToast, successAlert, errorAlert } from '@/lib/swal';

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Leave Policy',
    version: '1.0',
    description: '',
    effective_date: new Date().toISOString().slice(0, 10),
  });

  const fetchPolicies = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/policies');
      setPolicies(res.data.data || []);
    } catch {
      showToast('Could not load company policies', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleAcknowledge = async (id: number) => {
    try {
      const res = await api.post(`/policies/${id}/acknowledge`);
      successAlert('Policy Acknowledged', res.data.message);
      fetchPolicies();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Acknowledgment failed', 'error');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/policies', formData);
      successAlert('Policy Published', 'HR Policy has been uploaded and made visible to all employees.');
      setIsModalOpen(false);
      fetchPolicies();
    } catch (err: any) {
      errorAlert('Failed to Publish Policy', err.response?.data?.message || 'Error occurred.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E6E9F0]">
        <div>
          <h2 className="font-display font-bold text-xl text-[#18213A]">HR Policies & Governance</h2>
          <p className="text-xs text-[#68708A]">
            Corporate guidelines, code of conduct, and mandatory staff acknowledgment tracking.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#B8862E] hover:bg-[#9E7124] text-white rounded-xl text-xs font-semibold shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Publish Policy</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {policies.map((p) => (
          <div
            key={p.id}
            className="p-6 rounded-2xl bg-white border border-[#E6E9F0] shadow-xs flex flex-col justify-between hover:border-[#B8862E]/40 transition"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <Badge variant="gold" size="sm">
                  {p.category}
                </Badge>
                <span className="text-[11px] font-mono text-[#9AA1B5]">v{p.version}</span>
              </div>

              <h3 className="font-display font-bold text-base text-[#18213A]">{p.title}</h3>
              <p className="text-xs text-[#68708A] mt-2 line-clamp-3 leading-relaxed">{p.description}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E6E9F0]">
              <div className="flex items-center justify-between mb-3 text-[11px] text-[#9AA1B5]">
                <span>Effective: {p.effective_date}</span>
                {p.is_acknowledged ? (
                  <span className="text-[#0E7C74] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Acknowledged
                  </span>
                ) : (
                  <span className="text-[#C98A1D] font-semibold">Pending Acknowledgment</span>
                )}
              </div>

              {!p.is_acknowledged ? (
                <button
                  onClick={() => handleAcknowledge(p.id)}
                  className="w-full py-2 bg-[#152244] hover:bg-[#101B36] text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4 text-[#B8862E]" />
                  <span>Read & Acknowledge</span>
                </button>
              ) : (
                <div className="p-2 rounded-xl bg-[#E4F5F2] text-center text-xs font-semibold text-[#0E7C74]">
                  Signed on {p.acknowledged_at || 'Recorded'}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Publish Policy Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Publish HR Policy"
        subtitle="Make a new corporate standard document visible for acknowledgment."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#18213A] mb-1">Policy Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. UAE Maternity & Paternity Policy 2026"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#18213A] mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E]"
              >
                <option value="Leave Policy">Leave Policy</option>
                <option value="Code of Conduct">Code of Conduct & Ethics</option>
                <option value="Health & Safety">Health & Safety (HSE)</option>
                <option value="IT & Data Security">IT & Data Security</option>
                <option value="General">General Administrative</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#18213A] mb-1">Version</label>
              <input
                type="text"
                placeholder="1.0"
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#18213A] mb-1">Effective Date *</label>
            <input
              type="date"
              required
              value={formData.effective_date}
              onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
              className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#18213A] mb-1">Policy Summary & Guidelines *</label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Outline the core provisions, employee obligations, and administrative procedures..."
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
              Publish Policy Document
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
