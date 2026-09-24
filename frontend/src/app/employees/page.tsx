'use client';

import React, { useState, useEffect } from 'react';
import { UserPlus, Eye, Mail, Pencil } from 'lucide-react';
import DataTable, { Column } from '@/components/common/DataTable';
import Badge from '@/components/common/Badge';
import Modal from '@/components/common/Modal';
import api from '@/lib/api';
import { showToast, successAlert, errorAlert } from '@/lib/swal';

interface Employee {
  id: number;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  status: string;
  basic_salary?: number | string;
  housing_allowance?: number | string;
  transport_allowance?: number | string;
  other_allowances?: number | string;
  nationality?: string;
  visa_type?: string;
  department?: { id: number; name: string; };
  designation?: { id: number; title: string; };
  branch?: { id: number; name: string; };
  shift?: { id: number; name: string; };
  company?: { id: number; name: string; };
  location?: { id: number; name: string; };
  emirates_id_number?: string;
  passport_number?: string;
  visa_expiry_date?: string;
  bank_name?: string;
}
interface Department { id: number; name: string; }
interface Designation { id: number; title: string; }
interface Branch { id: number; name: string; }
interface Shift { id: number; name: string; }
interface Location { id: number; name: string; }
interface Company { id: number; name: string; locations?: Location[]; }

const emptyFormData = {
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
  joining_date: '',
  contract_type: 'Limited',
  basic_salary: '',
  housing_allowance: '',
  transport_allowance: '',
  other_allowances: '',
  standard_deductions: '',
  bank_name: '',
  iban: 'AE',
  passport_issue_date: '',
  labour_card_id: '',
  home_phone: '',
  address: '',
  father_name: '',
  religion: '',
  blood_group: '',
  emergency_contact_person: '',
  emergency_contact_number: '',
  emergency_contact_email: '',
  company_visa_mol_id: '',
  company_id: '',
  location_id: '',
  employment_type: '',
  salary_transfer_method: '',
  marital_status: '',
  date_of_birth: '',
  status: 'active',
};

const formatDateForInput = (value?: string | null) =>
  value ? value.slice(0, 10) : '';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState<number | null>(null);
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState(emptyFormData);

  const fetchData = async () => {
  try {
      const [empRes, deptRes, desigRes, compRes, branchRes, shiftRes] = await Promise.all([
        api.get('/employees?per_page=100'),
        api.get('/departments'),
        api.get('/designations'),
        api.get('/companies'),
        api.get('/branches'),
        api.get('/shifts'),
      ]);
      setEmployees(empRes.data.data.data || []);
      setDepartments(deptRes.data.data || []);
      setDesignations(desigRes.data.data || []);
      setCompanies(compRes.data.data || []);
      setBranches(branchRes.data.data || []);
      setShifts(shiftRes.data.data || []);
    } catch {
      showToast('Could not load employees', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (employeeId: number) => {
  try {
    const response = await api.get(`/employees/${employeeId}`);
    const employee = response.data.data;
    const salary = employee.salary_structure;

    setFormData({
      first_name: employee.first_name || '',
      last_name: employee.last_name || '',
      email: employee.email || '',
      phone: employee.phone || '',
      gender: employee.gender || 'Male',
      nationality: employee.nationality || 'United Arab Emirates',
      emirates_id_number: employee.emirates_id_number || '',
      passport_number: employee.passport_number || '',
      visa_type: employee.visa_type || 'Employment',
      visa_expiry_date: formatDateForInput(employee.visa_expiry_date),
      department_id: employee.department_id?.toString() || '',
      designation_id: employee.designation_id?.toString() || '',
      branch_id: employee.branch_id?.toString() || '',
      shift_id: employee.shift_id?.toString() || '',
      joining_date: formatDateForInput(employee.joining_date),
      contract_type: employee.contract_type || 'Limited',
      basic_salary: salary?.basic_salary?.toString() || '',
      housing_allowance: salary?.housing_allowance?.toString() || '',
      transport_allowance: salary?.transport_allowance?.toString() || '',
      other_allowances: salary?.other_allowances?.toString() || '',
      standard_deductions: salary?.standard_deductions?.toString() || '',
      bank_name: salary?.bank_name || employee.bank_name || '',
      iban: salary?.iban || employee.iban || 'AE',
      passport_issue_date: formatDateForInput(employee.passport_issue_date),
      labour_card_id: employee.labour_card_id || '',
      home_phone: employee.home_phone || '',
      address: employee.address || '',
      father_name: employee.father_name || '',
      religion: employee.religion || '',
      blood_group: employee.blood_group || '',
      emergency_contact_person: employee.emergency_contact_person || '',
      emergency_contact_number: employee.emergency_contact_number || '',
      emergency_contact_email: employee.emergency_contact_email || '',
      company_visa_mol_id: employee.company_visa_mol_id || '',
      company_id: employee.company_id?.toString() || '',
      location_id: employee.location_id?.toString() || '',
      employment_type: employee.employment_type || '',
      salary_transfer_method: employee.salary_transfer_method || '',
      marital_status: employee.marital_status || '',
      date_of_birth: formatDateForInput(employee.date_of_birth),
      status: employee.status || 'active',
    });

    setEditingEmployeeId(employeeId);
    setIsModalOpen(true);
  } catch {
    errorAlert('Error Loading Employee', 'Could not load the employee details for editing.');
  }
  };

  const selectedCompany = companies.find((company) => String(company.id) === String(formData.company_id));
  const locations = selectedCompany?.locations || [];

  const handleCompanyChange = (companyId: string) => {
    setFormData({ ...formData, company_id: companyId, location_id: '' });
  };

  useEffect(() => {
  const loadData = async () => {
    try {
      const [empRes, deptRes, desigRes, compRes, branchRes, shiftRes] = await Promise.all([
        api.get('/employees?per_page=100'),
        api.get('/departments'),
        api.get('/designations'),
        api.get('/companies'),
        api.get('/branches'),
        api.get('/shifts'),
      ]);

      setEmployees(empRes.data.data.data || []);
      setDepartments(deptRes.data.data || []);
      setDesignations(desigRes.data.data || []);
      setCompanies(compRes.data.data || []);
      setBranches(branchRes.data.data || []);
      setShifts(shiftRes.data.data || []);
    } catch {
      showToast('Could not load employees', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  void loadData();
}, []);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    if (editingEmployeeId) {
      await api.put(`/employees/${editingEmployeeId}`, formData);

      successAlert(
        'Employee Updated',
        'Employee profile and WPS salary structure updated successfully.'
      );
    } else {
      await api.post('/employees', formData);

      successAlert(
        'Employee Enrolled',
        'New employee profile and WPS salary structure created successfully.'
      );
    }

    setIsModalOpen(false);
    setEditingEmployeeId(null);
    fetchData();
    } catch (err: unknown) {
  const axiosError = err as {
    response?: {
      data?: {
        message?: string;
        errors?: Record<string, string[]>;
      };
    };
  };

  const validationErrors = axiosError.response?.data?.errors;

  const message = validationErrors
    ? Object.entries(validationErrors)
        .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
        .join('\n')
    : axiosError.response?.data?.message ||
      'Please check form input fields.';

  errorAlert(
    editingEmployeeId ? 'Error Updating Employee' : 'Error Creating Employee',
    message
  );
}
};

  const columns: Column<Employee>[] = [
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
      <div className="flex items-center justify-end gap-1">
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

        <button
          onClick={() => {
            void handleEdit(emp.id);
          }}
          className="p-1.5 text-[#68708A] hover:text-[#152244] hover:bg-[#F2F4F8] rounded-lg transition"
          title="Edit Employee"
        >
          <Pencil className="w-4 h-4" />
        </button>
      </div>
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
            onClick={() => {
              setFormData(emptyFormData);
              setEditingEmployeeId(null);
              setIsModalOpen(true);
            }}
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
        onClose={() => {
          setIsModalOpen(false);
          setEditingEmployeeId(null);
        }}
        title={editingEmployeeId ? 'Edit Employee' : 'Enroll New Employee'}
        subtitle={
          editingEmployeeId
            ? 'Update employee, employment, compliance and WPS salary details.'
            : 'Complete employee, employment, compliance and WPS details.'
        }
        maxWidth="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <section>
            <div className="mb-3">
              <h3 className="text-sm font-bold text-[#18213A]">Personal Information</h3>
              <p className="text-[11px] text-[#68708A] mt-0.5">
                Basic identity, contact and personal details.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

              <div>
                <label className="block text-xs font-medium text-[#18213A] mb-1">Employee Status *</label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E] focus:bg-white"
                >
                  <option value="active">Active</option>
                  <option value="probation">Probation</option>
                  <option value="on_leave">On Leave</option>
                  <option value="resigned">Resigned</option>
                  <option value="terminated">Terminated</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#18213A] mb-1">Birth Date</label>
                <input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#18213A] mb-1">Gender *</label>
                <select
                  required
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E] focus:bg-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#18213A] mb-1">Date of Joining *</label>
                <input
                  type="date"
                  required
                  value={formData.joining_date}
                  onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#18213A] mb-1">Marital Status</label>
                <select
                  value={formData.marital_status}
                  onChange={(e) => setFormData({ ...formData, marital_status: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E] focus:bg-white"
                >
                  <option value="">Select Marital Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#18213A] mb-1">Country *</label>
                <input
                  type="text"
                  required
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  placeholder="e.g. United Arab Emirates"
                  className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#18213A] mb-1">Passport ID</label>
                <input
                  type="text"
                  value={formData.passport_number}
                  onChange={(e) => setFormData({ ...formData, passport_number: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#18213A] mb-1">Passport Issue Date</label>
                <input
                  type="date"
                  value={formData.passport_issue_date}
                  onChange={(e) => setFormData({ ...formData, passport_issue_date: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#18213A] mb-1">Emirates ID</label>
                <input
                  type="text"
                  value={formData.emirates_id_number}
                  onChange={(e) => setFormData({ ...formData, emirates_id_number: e.target.value })}
                  placeholder="784-YYYY-XXXXXXX-X"
                  className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#18213A] mb-1">Labour Card ID</label>
                <input
                  type="text"
                  value={formData.labour_card_id}
                  onChange={(e) => setFormData({ ...formData, labour_card_id: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#18213A] mb-1">Phone *</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+971 50 000 0000"
                  className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#18213A] mb-1">Home Phone Number</label>
                <input
                  type="text"
                  value={formData.home_phone}
                  onChange={(e) => setFormData({ ...formData, home_phone: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E] focus:bg-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-[#18213A] mb-1">Address</label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E] focus:bg-white resize-none"
                />
              </div>
            </div>
          </section>

          {/* Employment & Additional Information */}
          <section className="border-t border-[#E6E9F0] pt-5">
            <div className="mb-3">
              <h3 className="text-sm font-bold text-[#18213A]">Employment & Additional Information</h3>
              <p className="text-[11px] text-[#68708A] mt-0.5">
                Employment assignment, emergency contact and company information.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#18213A] mb-1">Father Name</label>
                <input
                  type="text"
                  value={formData.father_name}
                  onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#18213A] mb-1">Religion</label>
                <input
                  type="text"
                  value={formData.religion}
                  onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#18213A] mb-1">Blood Group</label>
                <select
                  value={formData.blood_group}
                  onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E] focus:bg-white"
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#18213A] mb-1">Emergency Contact Person</label>
                <input
                  type="text"
                  value={formData.emergency_contact_person}
                  onChange={(e) => setFormData({ ...formData, emergency_contact_person: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#18213A] mb-1">Emergency Contact Number</label>
                <input
                  type="text"
                  value={formData.emergency_contact_number}
                  onChange={(e) => setFormData({ ...formData, emergency_contact_number: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#18213A] mb-1">Emergency Contact Email</label>
                <input
                  type="email"
                  value={formData.emergency_contact_email}
                  onChange={(e) => setFormData({ ...formData, emergency_contact_email: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#18213A] mb-1">Company Visa MOL ID</label>
                <input
                  type="text"
                  value={formData.company_visa_mol_id}
                  onChange={(e) => setFormData({ ...formData, company_visa_mol_id: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#18213A] mb-1">Company *</label>
                <select
                  required
                  value={formData.company_id}
                  onChange={(e) => handleCompanyChange(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E] focus:bg-white"
                >
                  <option value="">Select Company</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#18213A] mb-1">Location *</label>
                <select
                  required
                  value={formData.location_id}
                  onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
                  disabled={!formData.company_id}
                  className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E] focus:bg-white disabled:opacity-60"
                >
                  <option value="">
                    {formData.company_id ? 'Select Location' : 'Select Company First'}
                  </option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#18213A] mb-1">Department *</label>
                <select
                  required
                  value={formData.department_id}
                  onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E] focus:bg-white"
                >
                  <option value="">Select Department</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
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
                  {designations.map((designation) => (
                    <option key={designation.id} value={designation.id}>
                      {designation.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#18213A] mb-1">Contract Type *</label>
                <select
                  required
                  value={formData.contract_type}
                  onChange={(e) => setFormData({ ...formData, contract_type: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E] focus:bg-white"
                >
                  <option value="Limited">Limited</option>
                  <option value="Unlimited">Unlimited</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#18213A] mb-1">Employment Type</label>
                <select
                  value={formData.employment_type}
                  onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E] focus:bg-white"
                >
                  <option value="">Select Employment Type</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#18213A] mb-1">Salary Transfer Method</label>
                <select
                  value={formData.salary_transfer_method}
                  onChange={(e) => setFormData({ ...formData, salary_transfer_method: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E] focus:bg-white"
                >
                  <option value="">Select Transfer Method</option>
                  <option value="SIF - General">SIF - General</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
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
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#18213A] mb-1">Shift</label>
                <select
                  value={formData.shift_id}
                  onChange={(e) => setFormData({ ...formData, shift_id: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E] focus:bg-white"
                >
                  <option value="">Select Shift</option>
                  {shifts.map((shift) => (
                    <option key={shift.id} value={shift.id}>
                      {shift.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Immigration & WPS */}
          <section className="border-t border-[#E6E9F0] pt-5">
            <div className="mb-3">
              <h3 className="text-sm font-bold text-[#18213A]">Immigration & WPS</h3>
              <p className="text-[11px] text-[#68708A] mt-0.5">
                UAE visa and salary information used by the existing HRMS payroll structure.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#18213A] mb-1">Visa Type</label>
                <select
                  value={formData.visa_type}
                  onChange={(e) => setFormData({ ...formData, visa_type: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E] focus:bg-white"
                >
                  <option value="Employment">Employment</option>
                  <option value="Family">Family</option>
                  <option value="Visit">Visit</option>
                  <option value="Other">Other</option>
                </select>
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

              <div>
                <label className="block text-xs font-medium text-[#18213A] mb-1">Bank Name</label>
                <input
                  type="text"
                  value={formData.bank_name}
                  onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#18213A] mb-1">IBAN</label>
                <input
                  type="text"
                  value={formData.iban}
                  onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                  placeholder="AE..."
                  className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E] focus:bg-white"
                />
              </div>
            </div>

            <div className="mt-3 p-3 bg-[#F2F4F8] rounded-xl border border-[#E6E9F0]">
              <p className="text-xs font-bold text-[#18213A] uppercase tracking-wider mb-2">
                Salary Structure (AED)
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                <div>
                  <label className="block text-[11px] text-[#68708A] mb-1">Basic *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={formData.basic_salary}
                    onChange={(e) => setFormData({ ...formData, basic_salary: e.target.value })}
                    className="w-full px-2 py-1.5 bg-white border border-[#E6E9F0] rounded text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#68708A] mb-1">Housing</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.housing_allowance}
                    onChange={(e) => setFormData({ ...formData, housing_allowance: e.target.value })}
                    className="w-full px-2 py-1.5 bg-white border border-[#E6E9F0] rounded text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#68708A] mb-1">Transport</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.transport_allowance}
                    onChange={(e) => setFormData({ ...formData, transport_allowance: e.target.value })}
                    className="w-full px-2 py-1.5 bg-white border border-[#E6E9F0] rounded text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#68708A] mb-1">Other</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.other_allowances}
                    onChange={(e) => setFormData({ ...formData, other_allowances: e.target.value })}
                    className="w-full px-2 py-1.5 bg-white border border-[#E6E9F0] rounded text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#68708A] mb-1">Deductions</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.standard_deductions}
                    onChange={(e) => setFormData({ ...formData, standard_deductions: e.target.value })}
                    className="w-full px-2 py-1.5 bg-white border border-[#E6E9F0] rounded text-xs"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Account Details */}
          <section className="border-t border-[#E6E9F0] pt-5">
            <div className="mb-3">
              <h3 className="text-sm font-bold text-[#18213A]">Account Details</h3>
              <p className="text-[11px] text-[#68708A] mt-0.5">
                Login and communication details for the employee profile.
              </p>
            </div>

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
          </section>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#E6E9F0]">
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
              {editingEmployeeId ? 'Save & Update Employee' : 'Create Employee Profile'}
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











