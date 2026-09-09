'use client';

import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Receipt,
  FileSpreadsheet,
  Download,
  Plus,
  ArrowRight,
  Sparkles,
  Building,
  CheckCircle2,
} from 'lucide-react';
import DataTable, { Column } from '@/components/common/DataTable';
import Badge from '@/components/common/Badge';
import Modal from '@/components/common/Modal';
import api from '@/lib/api';
import { showToast, successAlert, errorAlert } from '@/lib/swal';

export default function PayrollPage() {
  const [runs, setRuns] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Generate Run Modal
  const [isRunModalOpen, setIsRunModalOpen] = useState(false);
  const [runMonth, setRunMonth] = useState(new Date().getMonth() + 1);
  const [runYear, setRunYear] = useState(new Date().getFullYear());

  // Gratuity Calculator State
  const [isGratuityModalOpen, setIsGratuityModalOpen] = useState(false);
  const [gratuityForm, setGratuityForm] = useState({
    employee_id: '',
    end_date: new Date().toISOString().slice(0, 10),
    contract_type: 'Limited',
    termination_type: 'end_of_contract',
  });
  const [gratuityResult, setGratuityResult] = useState<any | null>(null);

  const fetchPayroll = async () => {
    setIsLoading(true);
    try {
      const [runsRes, empRes] = await Promise.all([api.get('/payroll/runs'), api.get('/employees?per_page=100')]);
      setRuns(runsRes.data.data.data || []);
      setEmployees(empRes.data.data.data || []);
    } catch {
      showToast('Could not load payroll runs', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, []);

  const handleGenerateRun = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/payroll/runs/generate', {
        month: Number(runMonth),
        year: Number(runYear),
      });
      successAlert('Payroll Batch Generated', res.data.message);
      setIsRunModalOpen(false);
      fetchPayroll();
    } catch (err: any) {
      errorAlert('Generation Error', err.response?.data?.message || 'Could not generate payroll run.');
    }
  };

  const handleCalculateGratuity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/payroll/gratuity/calculate', gratuityForm);
      setGratuityResult(res.data.data);
    } catch (err: any) {
      errorAlert('Calculation Error', err.response?.data?.message || 'Could not calculate gratuity.');
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'batch_name',
      header: 'Payroll Batch',
      render: (run) => (
        <div>
          <p className="font-semibold text-xs text-[#18213A]">{run.batch_name}</p>
          <p className="text-[10px] text-[#9AA1B5]">
            Period: {run.pay_period_start} to {run.pay_period_end}
          </p>
        </div>
      ),
    },
    {
      key: 'total_employees',
      header: 'Staff Count',
      render: (run) => (
        <span className="font-mono text-xs font-semibold text-[#18213A]">
          {run.total_employees} Employees
        </span>
      ),
    },
    {
      key: 'total_gross',
      header: 'Gross Salary (AED)',
      render: (run) => (
        <span className="font-mono text-xs text-[#68708A]">
          AED {Number(run.total_gross).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'total_net',
      header: 'Net Pay (AED)',
      render: (run) => (
        <span className="font-mono text-xs font-bold text-[#0E7C74]">
          AED {Number(run.total_net).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'wps_sif_exported',
      header: 'WPS SIF Export',
      render: (run) => (
        <Badge variant={run.wps_sif_exported ? 'teal' : 'amber'} size="sm">
          {run.wps_sif_exported ? 'SIF Dispatched' : 'Pending SIF'}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (run) => (
        <Badge
          variant={run.status === 'paid' ? 'teal' : run.status === 'processed' ? 'blue' : 'amber'}
          dot
        >
          {run.status?.toUpperCase()}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E6E9F0]">
        <div>
          <h2 className="font-display font-bold text-xl text-[#18213A]">Payroll Dashboard & WPS Center</h2>
          <p className="text-xs text-[#68708A]">
            UAE Wage Protection System compliance, monthly payslips, and End-of-Service Benefits (EOSB).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsGratuityModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#F2F4F8] hover:bg-[#E6E9F0] text-[#18213A] rounded-xl text-xs font-semibold border border-[#E6E9F0] transition"
          >
            <Calculator className="w-4 h-4 text-[#B8862E]" />
            <span>Gratuity (EOSB) Calculator</span>
          </button>

          <button
            onClick={() => setIsRunModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#B8862E] hover:bg-[#9E7124] text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Monthly Run</span>
          </button>
        </div>
      </div>

      <DataTable
        title="Monthly Payroll Runs"
        columns={columns}
        data={runs}
        isLoading={isLoading}
        actionButton={
          <button
            onClick={() => (window.location.href = '/payroll/payslips')}
            className="px-3.5 py-1.5 rounded-lg border border-[#E6E9F0] text-xs font-medium text-[#18213A] hover:bg-[#F2F4F8] transition"
          >
            <span>View All Payslips</span>
          </button>
        }
      />

      {/* Generate Run Modal */}
      <Modal
        isOpen={isRunModalOpen}
        onClose={() => setIsRunModalOpen(false)}
        title="Generate Monthly Payroll Run"
        subtitle="Calculates gross, allowances, deductions and WPS net pay."
      >
        <form onSubmit={handleGenerateRun} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#18213A] mb-1">Month *</label>
              <select
                value={runMonth}
                onChange={(e) => setRunMonth(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E]"
              >
                {[
                  'January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December',
                ].map((m, i) => (
                  <option key={m} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#18213A] mb-1">Year *</label>
              <input
                type="number"
                required
                value={runYear}
                onChange={(e) => setRunYear(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E]"
              />
            </div>
          </div>

          <div className="p-3 bg-[#F2F4F8] rounded-xl border border-[#E6E9F0] text-xs space-y-1">
            <span className="font-semibold text-[#18213A] block">Auto-Processing Included:</span>
            <p className="text-[#68708A]">• Calculates Basic + Housing + Transport + Other Allowances</p>
            <p className="text-[#68708A]">• Prepares individual downloadable payslips</p>
            <p className="text-[#68708A]">• Formats UAE Central Bank WPS SIF file</p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsRunModalOpen(false)}
              className="px-4 py-2 bg-[#F2F4F8] text-xs font-semibold text-[#68708A] rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#B8862E] hover:bg-[#9E7124] text-xs font-semibold text-white rounded-lg shadow-sm"
            >
              Process Payroll Batch
            </button>
          </div>
        </form>
      </Modal>

      {/* Gratuity Calculator Modal */}
      <Modal
        isOpen={isGratuityModalOpen}
        onClose={() => {
          setIsGratuityModalOpen(false);
          setGratuityResult(null);
        }}
        title="UAE Labour Law Gratuity (EOSB) Calculator"
        subtitle="Federal Decree-Law No. 33 of 2021 Article 51 compliant."
        maxWidth="xl"
      >
        <form onSubmit={handleCalculateGratuity} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#18213A] mb-1">Select Employee *</label>
            <select
              required
              value={gratuityForm.employee_id}
              onChange={(e) => setGratuityForm({ ...gratuityForm, employee_id: e.target.value })}
              className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E]"
            >
              <option value="">Choose Employee</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.employee_code} — {e.first_name} {e.last_name} (Basic: AED {Number(e.basic_salary).toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#18213A] mb-1">Contract Type</label>
              <select
                value={gratuityForm.contract_type}
                onChange={(e) => setGratuityForm({ ...gratuityForm, contract_type: e.target.value })}
                className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E]"
              >
                <option value="Limited">Limited Contract</option>
                <option value="Unlimited">Unlimited Contract</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#18213A] mb-1">Separation Type</label>
              <select
                value={gratuityForm.termination_type}
                onChange={(e) => setGratuityForm({ ...gratuityForm, termination_type: e.target.value })}
                className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E]"
              >
                <option value="end_of_contract">End of Contract</option>
                <option value="resignation">Resignation</option>
                <option value="termination">Employer Termination</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#18213A] mb-1">Last Working Day *</label>
              <input
                type="date"
                required
                value={gratuityForm.end_date}
                onChange={(e) => setGratuityForm({ ...gratuityForm, end_date: e.target.value })}
                className="w-full px-3 py-2 bg-[#F2F4F8] border border-[#E6E9F0] rounded-lg text-xs focus:border-[#B8862E]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-[#152244] hover:bg-[#101B36] text-white text-xs font-semibold rounded-xl transition"
          >
            Calculate End of Service Entitlement
          </button>

          {/* Result Card */}
          {gratuityResult && (
            <div className="p-4 rounded-xl bg-gradient-to-tr from-[#FBF1DE]/60 to-white border border-[#B8862E]/30 space-y-3 mt-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-[#B8862E]/20 pb-2">
                <span className="text-xs font-bold text-[#18213A]">{gratuityResult.employee}</span>
                <span className="text-[10px] font-bold text-[#B8862E] bg-white px-2 py-0.5 rounded border border-[#B8862E]/20">
                  {gratuityResult.service_years} Years of Service
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[#9AA1B5] block">Basic Monthly Salary</span>
                  <span className="font-bold text-[#18213A]">AED {Number(gratuityResult.basic_salary_aed).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[#9AA1B5] block">Daily Basic Rate (30d base)</span>
                  <span className="font-bold text-[#18213A]">AED {gratuityResult.daily_basic_rate_aed}</span>
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-[#B8862E]/30 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#68708A] uppercase">Total Gratuity Entitlement</span>
                  <p className="text-[10px] text-[#9AA1B5]">{gratuityResult.law_reference}</p>
                </div>
                <div className="font-display font-bold text-xl text-[#B8862E]">
                  AED {Number(gratuityResult.gratuity_amount_aed).toLocaleString()}
                </div>
              </div>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
}
