'use client';

import React, { useState, useEffect } from 'react';
import { Plus, UserPlus, Eye, Mail, Phone, MapPin, Building2, Briefcase } from 'lucide-react';
import DataTable, { Column } from '@/components/common/DataTable';
import Badge from '@/components/common/Badge';
import Modal from '@/components/common/Modal';
import api from '@/lib/api';
import { showToast, successAlert, errorAlert } from '@/lib/swal';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<any | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    gender: 'Male',
    nationality: 'United Arab Emirates',
    emirates_id_number: '784-',
    passport_number: '',
    visa_type: 'Employment',
    visa_expiry_date: '',
    department_id: '',
    designation_id: '',
    branch_id: '',
    shift_id: '',
    joining_date: new Date().toISOString().slice(0, 10),
    contract_type: 'Limited',
    basic_salary: '',
    housing_allowance: '',
    transport_allowance: '',
    other_allowances: '',
    bank_name: '',
    iban: 'AE',
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [empRes, deptRes, desigRes] = await Promise.all([
        api.get('/employees?per_page=100'),
        api.get('/departments'),
        api.get('/designations'),
      ]);
      setEmployees(empRes.data.data.data || []);
      setDepartments(deptRes.data.data || []);
      setDesignations(desigRes.data.data || []);
    } catch {
      showToast('Could not load employees', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/employees', formData);
      successAlert('Employee Enrolled', 'New employee profile and WPS salary structure created successfully.');
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      errorAlert('Error Creating Employee', err.response?.data?.message || 'Please check form input fields.');
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'employee_code',
      header: 'Code',
      render: (emp) => (
        <span className="font-mono text-xs font-bold text-[#152244] bg-[#F2F4F8] px-2 py-1 rounded">
          {emp.employee_code}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Employee Name',
      render: (emp) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#152244] text-[#B8862E] font-bold text-xs flex items-center justify-center border border-[#B8862E]/20">
            {emp.first_name?.[0]}
            {emp.last_name?.[0]}
          </div>
          <div>
            <p className="font-semibold text-xs text-[#18213A]">{emp.first_name} {emp.last_name}</p>
            <p className="text-[11px] text-[#9AA1B5] flex items-center gap-1">
              <Mail className="w-3 h-3" /> {emp.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      render: (emp) => (
        <div>
          <p className="text-xs font-medium text-[#18213A]">{emp.department?.name || '—'}</p>
          <p className="text-[10px] text-[#68708A]">{emp.designation?.title || '—'}</p>
        </div>
      ),
    },
    {
      key: 'nationality',
      header: 'Nationality / Visa',
      render: (emp) => (
        <div>
          <p className="text-xs font-semibold text-[#18213A]">{emp.nationality}</p>
          <Badge variant={emp.visa_type === 'Citizen' ? 'teal' : 'blue'} size="sm">
            {emp.visa_type || 'Employment'}
          </Badge>
        </div>
      ),
    },
    {
      key: 'salary',
      header: 'Gross Salary (AED)',
      render: (emp) => {
        const gross =
          Number(emp.basic_salary || 0) +
          Number(emp.housing_allowance || 0) +
          Number(emp.transport_allowance || 0) +
          Number(emp.other_allowances || 0);
        return (
          <div className="font-mono text-xs font-semibold text-[#18213A]">
            AED {gross.toLocaleString('en-US')}
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (emp) => (
        <Badge variant={emp.status === 'active' ? 'teal' : 'neutral'} dot>
          {emp.status?.toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      align: 'right',
      render: (emp) => (
        <button
          onClick={() => {
            setSelectedEmp(emp);
            setIsViewModalOpen(true);
          }}
          className="p-1.5 text-[#68708A] hover:text-[#B8862E] hover:bg-[#F2F4F8] rounded-lg transition"
          title="View Employee Profile"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <DataTable
        title="Employee Directory"
        columns={columns}
        data={employees}
        searchKey="first_name"
        isLoading={isLoading}
        actionButton={
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#B8862E] hover:bg-[#9E7124] text-white rounded-lg text-xs font-semibold shadow-xs transition"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Employee</span>
          </button>
        }
      />

      {/* Add Employee Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Enroll New Employee"
        subtitle="Complete UAE Labour Law details and WPS salary breakdown."
        maxWidth="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#18213A] mb-1">First Name *</label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E] focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#18213A] mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E] focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#18213A] mb-1">Corporate Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E] focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#18213A] mb-1">UAE Phone</label>
              <input
                type="text"
                placeholder="+971 50 000 0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E] focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#18213A] mb-1">Department *</label>
              <select
                required
                value={formData.department_id}
                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E] focus:bg-white"
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#18213A] mb-1">Designation *</label>
              <select
                required
                value={formData.designation_id}
                onChange={(e) => setFormData({ ...formData, designation_id: e.target.value })}
                className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E] focus:bg-white"
              >
                <option value="">Select Designation</option>
                {designations.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#18213A] mb-1">Branch *</label>
              <select
                required
                value={formData.branch_id}
                onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E] focus:bg-white"
              >
                <option value="">Select Branch</option>
                <option value="1">Dubai HQ (Business Bay)</option>
                <option value="2">Abu Dhabi Branch</option>
                <option value="3">Sharjah Operations</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#18213A] mb-1">Nationality *</label>
              <input
                type="text"
                required
                value={formData.nationality}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E] focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#18213A] mb-1">Emirates ID</label>
              <input
                type="text"
                placeholder="784-YYYY-XXXXXXX-X"
                value={formData.emirates_id_number}
                onChange={(e) => setFormData({ ...formData, emirates_id_number: e.target.value })}
                className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E] focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#18213A] mb-1">Visa Expiry Date</label>
              <input
                type="date"
                value={formData.visa_expiry_date}
                onChange={(e) => setFormData({ ...formData, visa_expiry_date: e.target.value })}
                className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E] focus:bg-white"
              />
            </div>
          </div>

          {/* Compensation Breakdown */}
          <div className="p-3 bg-[#F2F4F8] rounded-xl border border-[#E6E9F0] space-y-2">
            <p className="text-xs font-bold text-[#18213A] uppercase tracking-wider">Salary Structure (AED)</p>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="text-[11px] text-[#68708A]">Basic *</label>
                <input
                  type="number"
                  required
                  placeholder="0.00"
                  value={formData.basic_salary}
                  onChange={(e) => setFormData({ ...formData, basic_salary: e.target.value })}
                  className="w-full px-2 py-1.5 bg-white border border-[#E6E9F0] rounded text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] text-[#68708A]">Housing</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={formData.housing_allowance}
                  onChange={(e) => setFormData({ ...formData, housing_allowance: e.target.value })}
                  className="w-full px-2 py-1.5 bg-white border border-[#E6E9F0] rounded text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] text-[#68708A]">Transport</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={formData.transport_allowance}
                  onChange={(e) => setFormData({ ...formData, transport_allowance: e.target.value })}
                  className="w-full px-2 py-1.5 bg-white border border-[#E6E9F0] rounded text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] text-[#68708A]">Other</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={formData.other_allowances}
                  onChange={(e) => setFormData({ ...formData, other_allowances: e.target.value })}
                  className="w-full px-2 py-1.5 bg-white border border-[#E6E9F0] rounded text-xs"
                />
              </div>
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
              Create Employee Profile
            </button>
          </div>
        </form>
      </Modal>

      {/* View Employee Profile Modal */}
      {selectedEmp && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`${selectedEmp.first_name} ${selectedEmp.last_name}`}
          subtitle={`Employee Code: ${selectedEmp.employee_code} • ${selectedEmp.designation?.title || 'Staff'}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-[#F2F4F8] rounded-xl">
                <span className="text-[#9AA1B5] block">Department</span>
                <span className="font-semibold text-[#18213A]">{selectedEmp.department?.name || '—'}</span>
              </div>
              <div className="p-3 bg-[#F2F4F8] rounded-xl">
                <span className="text-[#9AA1B5] block">Emirates ID</span>
                <span className="font-semibold text-[#18213A]">{selectedEmp.emirates_id_number || '—'}</span>
              </div>
              <div className="p-3 bg-[#F2F4F8] rounded-xl">
                <span className="text-[#9AA1B5] block">Passport No.</span>
                <span className="font-semibold text-[#18213A]">{selectedEmp.passport_number || '—'}</span>
              </div>
              <div className="p-3 bg-[#F2F4F8] rounded-xl">
                <span className="text-[#9AA1B5] block">Visa Expiry</span>
                <span className="font-semibold text-[#18213A]">{selectedEmp.visa_expiry_date || '—'}</span>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-[#FBF1DE]/40 to-white rounded-xl border border-[#B8862E]/20">
              <span className="text-xs font-bold text-[#B8862E] uppercase">WPS Salary Breakdown (AED)</span>
              <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                <div>
                  <span className="text-[#9AA1B5] block">Basic Salary</span>
                  <span className="font-bold text-[#18213A]">AED {Number(selectedEmp.basic_salary).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[#9AA1B5] block">Allowances</span>
                  <span className="font-bold text-[#18213A]">
                    AED {(Number(selectedEmp.housing_allowance) + Number(selectedEmp.transport_allowance) + Number(selectedEmp.other_allowances)).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[#9AA1B5] block">Bank / IBAN</span>
                  <span className="font-bold text-[#18213A] truncate block">{selectedEmp.bank_name || 'Emirates NBD'}</span>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
