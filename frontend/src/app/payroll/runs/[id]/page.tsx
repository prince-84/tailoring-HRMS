'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Printer } from 'lucide-react';
import api from '@/lib/api';
import PayrollSlip from '@/components/payroll/PayrollSlip';
import type { PayrollSlipData } from '@/components/payroll/payroll-slip.types';

export default function PayrollRunPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [payroll, setPayroll] = useState<PayrollSlipData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPayroll = async () => {
      try {
        const response = await api.get(`/payroll/runs/${params.id}`);
        setPayroll(response.data.data);
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            'Could not load this payroll run.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchPayroll();
    }
  }, [params.id]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#B8862E] border-t-transparent" />
          <span className="text-sm text-[#68708A]">
            Loading payroll...
          </span>
        </div>
      </div>
    );
  }

  if (error || !payroll) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => router.push('/payroll')}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#18213A] hover:text-[#B8862E]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Payroll
        </button>

        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error || 'Payroll run not found.'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between print:hidden">
        <button
          type="button"
          onClick={() => router.push('/payroll')}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#18213A] hover:text-[#B8862E]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Payroll
        </button>

        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-2 rounded-lg bg-[#152244] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#101B36]"
        >
          <Printer className="h-4 w-4" />
          Print Payroll
        </button>
      </div>

      <PayrollSlip payroll={payroll} />
    </div>
  );
}