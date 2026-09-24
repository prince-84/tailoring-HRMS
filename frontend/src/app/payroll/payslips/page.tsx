'use client';

import React, { useState, useEffect } from 'react';
import { Receipt, Eye, Download, Printer, ArrowLeft, Building2, Sparkles } from 'lucide-react';
import DataTable, { Column } from '@/components/common/DataTable';
import Badge from '@/components/common/Badge';
import Modal from '@/components/common/Modal';
import api from '@/lib/api';
import { showToast } from '@/lib/swal';

export default function PayslipsPage() {
  const [payslips, setPayslips] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSlip, setSelectedSlip] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPayslips = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/payroll/payslips?per_page=100');
      setPayslips(res.data.data.data || []);
    } catch {
      showToast('Could not load payslips', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayslips();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const columns: Column<any>[] = [
    {
      key: 'payslip_number',
      header: 'Payslip Ref',
      render: (slip) => (
        <span className="font-mono text-xs font-bold text-[#152244] bg-[#F2F4F8] px-2 py-1 rounded">
          {slip.payslip_number}
        </span>
      ),
    },
    {
      key: 'employee',
      header: 'Employee',
      render: (slip) => (
        <div>
          <p className="font-semibold text-xs text-[#18213A]">{slip.employee?.full_name || 'Staff'}</p>
          <p className="text-[10px] text-[#9AA1B5]">
            {slip.employee?.employee_code} • {slip.employee?.department?.name || '—'}
          </p>
        </div>
      ),
    },
    {
      key: 'period',
      header: 'Pay Period',
      render: (slip) => (
        <span className="text-xs text-[#18213A] font-medium">
          {slip.month}/{slip.year}
        </span>
      ),
    },
    {
      key: 'basic_salary',
      header: 'Basic (AED)',
      render: (slip) => (
        <span className="font-mono text-xs text-[#68708A]">
          AED {Number(slip.basic_salary).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'net_salary',
      header: 'Net Pay (AED)',
      render: (slip) => (
        <span className="font-mono text-xs font-bold text-[#0E7C74]">
          AED {Number(slip.net_salary).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'payment_status',
      header: 'Status',
      render: (slip) => (
        <Badge variant={slip.payment_status === 'Paid' ? 'teal' : 'amber'} dot>
          {slip.payment_status?.toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      align: 'right',
      render: (slip) => (
        <button
          onClick={() => {
            setSelectedSlip(slip);
            setIsModalOpen(true);
          }}
          className="p-1.5 text-[#68708A] hover:text-[#B8862E] hover:bg-[#F2F4F8] rounded-lg transition"
          title="View Payslip"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-[#E6E9F0]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => (window.location.href = '/payroll')}
            className="p-2 rounded-xl bg-[#F2F4F8] hover:bg-[#E6E9F0] text-[#18213A] transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="font-display font-bold text-xl text-[#18213A]">Employee Payslip Archives</h2>
            <p className="text-xs text-[#68708A]">
              Monthly salary statements with itemized UAE allowances and deductions.
            </p>
          </div>
        </div>
      </div>

      <DataTable
        title="Dispatched Payslips"
        columns={columns}
        data={payslips}
        isLoading={isLoading}
      />

      {/* Printable Payslip Modal */}
      {selectedSlip && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Payslip — ${selectedSlip.payslip_number}`}
          subtitle={`Employee: ${selectedSlip.employee?.full_name} (${selectedSlip.employee?.employee_code})`}
          maxWidth="xl"
        >
          <div className="p-6 bg-white rounded-2xl border border-[#E6E9F0] space-y-6 text-sm">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#E6E9F0] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#152244] text-[#B8862E] flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-base text-[#152244]">BESPOKE HAUTE COUTURE LLC</h4>
                  <p className="text-[11px] text-[#9AA1B5]">Business Bay, Dubai, United Arab Emirates</p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="teal" size="md">PAID VIA WPS</Badge>
                <p className="text-xs text-[#68708A] mt-1 font-mono">{selectedSlip.payslip_number}</p>
              </div>
            </div>

            {/* Employee Details Grid */}
            <div className="grid grid-cols-3 gap-3 p-3.5 bg-[#F2F4F8] rounded-xl text-xs">
              <div>
                <span className="text-[#9AA1B5] block">Employee Name</span>
                <span className="font-bold text-[#18213A]">
                  {[selectedSlip.employee?.first_name, selectedSlip.employee?.last_name]
                    .filter(Boolean)
                    .join(' ') || 'Unknown'}
                </span>
              </div>
              <div>
                <span className="text-[#9AA1B5] block">Designation</span>
                <span className="font-bold text-[#18213A]">{selectedSlip.employee?.designation?.title || 'Staff'}</span>
              </div>
              <div>
                <span className="text-[#9AA1B5] block">Department</span>
                <span className="font-bold text-[#18213A]">{selectedSlip.employee?.department?.name || '—'}</span>
              </div>
              <div>
                <span className="text-[#9AA1B5] block">Emirates ID</span>
                <span className="font-bold text-[#18213A]">{selectedSlip.employee?.emirates_id_number || '—'}</span>
              </div>
              <div>
                <span className="text-[#9AA1B5] block">Pay Period</span>
                <span className="font-bold text-[#18213A]">{selectedSlip.month}/{selectedSlip.year}</span>
              </div>
              <div>
                <span className="text-[#9AA1B5] block">Bank Account / IBAN</span>
                <span className="font-bold text-[#18213A] truncate block">{selectedSlip.employee?.iban || 'AE290260...'}</span>
              </div>
            </div>

            {/* Earnings vs Deductions Breakdown */}
            <div className="grid grid-cols-2 gap-4">
              {/* Earnings */}
              <div className="border border-[#E6E9F0] rounded-xl p-4 space-y-2">
                <span className="text-xs font-bold text-[#0E7C74] uppercase tracking-wider block border-b border-[#E6E9F0] pb-1">
                  Earnings (AED)
                </span>
                <div className="flex justify-between text-xs">
                  <span className="text-[#68708A]">Basic Salary</span>
                  <span className="font-bold text-[#18213A]">AED {Number(selectedSlip.basic_salary).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#68708A]">Housing Allowance</span>
                  <span className="font-bold text-[#18213A]">AED {Number(selectedSlip.housing_allowance).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#68708A]">Transport Allowance</span>
                  <span className="font-bold text-[#18213A]">AED {Number(selectedSlip.transport_allowance).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#68708A]">Other Allowances</span>
                  <span className="font-bold text-[#18213A]">AED {Number(selectedSlip.other_allowances).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs pt-2 border-t border-[#E6E9F0] font-bold text-[#18213A]">
                  <span>Gross Earnings</span>
                  <span>AED {Number(selectedSlip.gross_salary).toLocaleString()}</span>
                </div>
              </div>

              {/* Deductions */}
              <div className="border border-[#E6E9F0] rounded-xl p-4 space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-[#C64550] uppercase tracking-wider block border-b border-[#E6E9F0] pb-1">
                    Deductions (AED)
                  </span>
                    <div className="flex justify-between text-xs mt-2">
                    <span className="text-[#68708A]">Standard Deductions</span>
                    <span className="font-bold text-[#18213A]">
                      AED {Number(selectedSlip.deductions_amount || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between text-xs pt-2 border-t border-[#E6E9F0] font-bold text-[#18213A]">
                  <span>Total Deductions</span>
                  <span>AED {Number(selectedSlip.deductions_amount || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Net Pay Banner */}
            <div className="p-4 bg-gradient-to-r from-[#152244] to-[#101B36] text-white rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-[#B8862E] font-bold uppercase tracking-wider block">Net Take-Home Pay</span>
                <p className="text-[11px] text-[#9AA1B5]">Dispatched through UAE Central Bank WPS</p>
              </div>
              <div className="font-display font-bold text-2xl text-white">
                AED {Number(selectedSlip.net_salary).toLocaleString()}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-2 border-t border-[#E6E9F0]">
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#152244] text-white text-xs font-semibold rounded-xl hover:bg-[#101B36] transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Payslip</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
