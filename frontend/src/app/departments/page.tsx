'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Briefcase, Plus, Users, Trash2 } from 'lucide-react';
import DataTable, { Column } from '@/components/common/DataTable';
import Badge from '@/components/common/Badge';
import Modal from '@/components/common/Modal';
import api from '@/lib/api';
import { showToast, successAlert, errorAlert, deleteConfirm } from '@/lib/swal';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'departments' | 'designations'>('departments');
  const [isLoading, setIsLoading] = useState(true);

  // Department Modal
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [deptForm, setDeptForm] = useState({
    name: '',
    code: '',
    description: '',
    status: 'active',
  });

  // Designation Modal
  const [isDesigModalOpen, setIsDesigModalOpen] = useState(false);
  const [desigForm, setDesigForm] = useState({
    title: '',
    code: '',
    department_id: '',
    level_grade: 'Senior',
    description: '',
    status: 'active',
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [deptRes, desigRes] = await Promise.all([api.get('/departments'), api.get('/designations')]);
      setDepartments(deptRes.data.data || []);
      setDesignations(desigRes.data.data || []);
    } catch {
      showToast('Could not load departments', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/departments', deptForm);
      successAlert('Department Created', `Department ${deptForm.name} has been added.`);
      setIsDeptModalOpen(false);
      fetchData();
    } catch (err: any) {
      errorAlert('Failed to Create Department', err.response?.data?.message || 'Error occurred.');
    }
  };

  const handleCreateDesig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/designations', desigForm);
      successAlert('Designation Created', `Designation ${desigForm.title} has been added.`);
      setIsDesigModalOpen(false);
      fetchData();
    } catch (err: any) {
      errorAlert('Failed to Create Designation', err.response?.data?.message || 'Error occurred.');
    }
  };

  const handleDeleteDept = async (id: number) => {
    const res = await deleteConfirm('Department');
    if (res.isConfirmed) {
      try {
        await api.delete(`/departments/${id}`);
        successAlert('Department Deleted');
        fetchData();
      } catch (err: any) {
        errorAlert('Cannot Delete', err.response?.data?.message || 'Department has assigned staff.');
      }
    }
  };

  const deptColumns: Column<any>[] = [
    {
      key: 'code',
      header: 'Code',
      render: (d) => (
        <span className="font-mono text-xs font-bold text-[#152244] bg-[#F2F4F8] px-2 py-1 rounded">
          {d.code}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Department Name',
      render: (d) => (
        <div>
          <p className="font-semibold text-xs text-[#18213A]">{d.name}</p>
          <p className="text-[11px] text-[#9AA1B5] truncate max-w-xs">{d.description || '—'}</p>
        </div>
      ),
    },
    {
      key: 'branch',
      header: 'Branch Location',
      render: (d) => <span className="text-xs text-[#18213A] font-medium">{d.branch?.name || 'Dubai HQ'}</span>,
    },
    {
      key: 'employees_count',
      header: 'Staff Count',
      render: (d) => (
        <span className="font-mono text-xs font-bold text-[#0E7C74] bg-[#E4F5F2] px-2 py-0.5 rounded">
          {d.employees_count || 0} Staff
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (d) => (
        <Badge variant={d.status === 'active' ? 'teal' : 'neutral'} dot>
          {d.status?.toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (d) => (
        <button
          onClick={() => handleDeleteDept(d.id)}
          className="p-1.5 text-[#68708A] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
          title="Delete Department"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  const desigColumns: Column<any>[] = [
    {
      key: 'code',
      header: 'Code',
      render: (d) => (
        <span className="font-mono text-xs font-bold text-[#152244] bg-[#F2F4F8] px-2 py-1 rounded">
          {d.code}
        </span>
      ),
    },
    {
      key: 'title',
      header: 'Designation Title',
      render: (d) => <span className="font-semibold text-xs text-[#18213A]">{d.title}</span>,
    },
    {
      key: 'department',
      header: 'Department',
      render: (d) => <span className="text-xs text-[#68708A]">{d.department?.name || 'General'}</span>,
    },
    {
      key: 'level_grade',
      header: 'Grade / Level',
      render: (d) => (
        <Badge variant="blue" size="sm">
          {d.level_grade || 'Executive'}
        </Badge>
      ),
    },
    {
      key: 'employees_count',
      header: 'Assigned Staff',
      render: (d) => <span className="font-mono text-xs text-[#18213A]">{d.employees_count || 0} Staff</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E6E9F0]">
        <div>
          <h2 className="font-display font-bold text-xl text-[#18213A]">Organization Structure</h2>
          <p className="text-xs text-[#68708A]">Departments, designations, job grades, and hierarchy.</p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'departments' ? (
            <button
              onClick={() => setIsDeptModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#B8862E] hover:bg-[#9E7124] text-white rounded-xl text-xs font-semibold shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Department</span>
            </button>
          ) : (
            <button
              onClick={() => setIsDesigModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#B8862E] hover:bg-[#9E7124] text-white rounded-xl text-xs font-semibold shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Designation</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab('departments')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'departments'
              ? 'bg-[#152244] text-white shadow-xs'
              : 'bg-white text-[#68708A] hover:bg-[#F2F4F8] border border-[#E6E9F0]'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Departments ({departments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('designations')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'designations'
              ? 'bg-[#152244] text-white shadow-xs'
              : 'bg-white text-[#68708A] hover:bg-[#F2F4F8] border border-[#E6E9F0]'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Designations ({designations.length})</span>
        </button>
      </div>

      {activeTab === 'departments' ? (
        <DataTable
          title="Departments Directory"
          columns={deptColumns}
          data={departments}
          isLoading={isLoading}
        />
      ) : (
        <DataTable
          title="Job Designations & Levels"
          columns={desigColumns}
          data={designations}
          isLoading={isLoading}
        />
      )}

      {/* Add Department Modal */}
      <Modal
        isOpen={isDeptModalOpen}
        onClose={() => setIsDeptModalOpen(false)}
        title="Create Department"
        subtitle="Add a new business unit to the organization."
      >
        <form onSubmit={handleCreateDept} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#18213A] mb-1">Department Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Bespoke Tailoring & Haute Couture"
              value={deptForm.name}
              onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
              className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#18213A] mb-1">Department Code *</label>
            <input
              type="text"
              required
              placeholder="e.g. TAILOR-01"
              value={deptForm.code}
              onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
              className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#18213A] mb-1">Description</label>
            <textarea
              rows={3}
              value={deptForm.description}
              onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
              className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsDeptModalOpen(false)}
              className="px-4 py-2 bg-[#F2F4F8] text-xs font-semibold text-[#68708A] rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#B8862E] hover:bg-[#9E7124] text-xs font-semibold text-white rounded-lg shadow-sm"
            >
              Create Department
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Designation Modal */}
      <Modal
        isOpen={isDesigModalOpen}
        onClose={() => setIsDesigModalOpen(false)}
        title="Create Job Designation"
        subtitle="Map role titles to departments and job grades."
      >
        <form onSubmit={handleCreateDesig} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#18213A] mb-1">Designation Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Master Pattern Draper"
              value={desigForm.title}
              onChange={(e) => setDesigForm({ ...desigForm, title: e.target.value })}
              className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#18213A] mb-1">Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. M-DRAPER"
                value={desigForm.code}
                onChange={(e) => setDesigForm({ ...desigForm, code: e.target.value })}
                className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#18213A] mb-1">Department</label>
              <select
                value={desigForm.department_id}
                onChange={(e) => setDesigForm({ ...desigForm, department_id: e.target.value })}
                className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E]"
              >
                <option value="">General (All Depts)</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsDesigModalOpen(false)}
              className="px-4 py-2 bg-[#F2F4F8] text-xs font-semibold text-[#68708A] rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#B8862E] hover:bg-[#9E7124] text-xs font-semibold text-white rounded-lg shadow-sm"
            >
              Create Designation
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
