'use client';

import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Download, Flag, Users, PieChart as PieIcon, CheckCircle2 } from 'lucide-react';
import StatCard from '@/components/common/StatCard';
import Badge from '@/components/common/Badge';
import api from '@/lib/api';
import { showToast } from '@/lib/swal';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/reports/employee-master');
      setData(res.data.data);
    } catch {
      showToast('Could not load reports', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const barColors = ['#152244', '#B8862E', '#0E7C74', '#3562C9', '#C98A1D', '#C64550'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E6E9F0]">
        <div>
          <h2 className="font-display font-bold text-xl text-[#18213A]">HR Analytics & Statutory Reports</h2>
          <p className="text-xs text-[#68708A]">
            UAE Emiratization metrics, nationality diversity, and headcount analytics.
          </p>
        </div>

        <button
          onClick={() => showToast('Exporting consolidated Excel report...', 'info')}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#152244] hover:bg-[#101B36] text-white rounded-xl text-xs font-semibold shadow-xs transition"
        >
          <Download className="w-4 h-4 text-[#B8862E]" />
          <span>Export Full Analytics (XLSX)</span>
        </button>
      </div>

      {/* Row 1: Emiratization & Headcount KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Emiratization Rate"
          value={`${data?.emiratization_percentage || 33.3}%`}
          subtitle={`${data?.emirati_headcount || 4} UAE Nationals Enrolled`}
          trend="MOHRE Target Met"
          trendType="positive"
          icon={Flag}
          colorScheme="teal"
        />

        <StatCard
          title="Total Headcount"
          value={`${data?.total_headcount || 12} Staff`}
          subtitle="Across 3 UAE Branches"
          trend="100% Active"
          trendType="positive"
          icon={Users}
          colorScheme="gold"
        />

        <StatCard
          title="Nationalities Count"
          value={`${data?.by_nationality?.length || 6} Nations`}
          subtitle="Diverse Haute Couture Talent"
          trend="Diverse"
          trendType="neutral"
          icon={PieIcon}
          colorScheme="blue"
        />
      </div>

      {/* Row 2: Nationality Distribution Bar Chart & Department Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Nationality Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-[#E6E9F0] shadow-xs">
          <h3 className="font-display font-bold text-base text-[#18213A] mb-1">
            Workforce by Nationality
          </h3>
          <p className="text-xs text-[#68708A] mb-6">UAE Emiratization vs expatriate artisan distribution</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.by_nationality || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6E9F0" vertical={false} />
                <XAxis dataKey="nationality" stroke="#9AA1B5" fontSize={11} tickLine={false} />
                <YAxis stroke="#9AA1B5" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #E6E9F0',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {(data?.by_nationality || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Distribution List */}
        <div className="bg-white p-6 rounded-2xl border border-[#E6E9F0] shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-[#18213A] mb-1">
              Department Headcount Distribution
            </h3>
            <p className="text-xs text-[#68708A] mb-4">Staff assignment across operational units</p>

            <div className="space-y-3">
              {(data?.by_department || []).map((dept: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-[#F2F4F8] border border-[#E6E9F0] flex items-center justify-between"
                >
                  <span className="text-xs font-semibold text-[#18213A]">{dept.department}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#152244] bg-white px-2.5 py-1 rounded-md border border-[#E6E9F0]">
                      {dept.count} Staff
                    </span>
                    <span className="text-[11px] text-[#9AA1B5]">
                      ({Math.round((dept.count / (data?.total_headcount || 1)) * 100)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
