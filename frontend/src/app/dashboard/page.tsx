'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Clock,
  Calendar,
  ShieldAlert,
  Cake,
  TrendingUp,
  MapPin,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import StatCard from '@/components/common/StatCard';
import Badge from '@/components/common/Badge';
import api from '@/lib/api';
import { showToast, successAlert } from '@/lib/swal';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [liveDuration, setLiveDuration] = useState('00:00:00');

  const fetchSummary = async () => {
    try {
      const res = await api.get('/dashboard/summary');
      setData(res.data.data);
    } catch {
      showToast('Could not load dashboard statistics', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleCheckIn = async () => {
    setIsCheckingIn(true);
    try {
      const res = await api.post('/attendance/check-in', {
        latitude: 25.1882,
        longitude: 55.2764,
      });
      successAlert('Check-in Logged', res.data.message);
      fetchSummary();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Check-in failed', 'error');
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    setIsCheckingIn(true);
    try {
      const res = await api.post('/attendance/check-out', {
        latitude: 25.1882,
        longitude: 55.2764,
      });
      successAlert('Check-out Recorded', res.data.message);
      fetchSummary();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Check-out failed', 'error');
    } finally {
      setIsCheckingIn(false);
    }
  };

  const stats = data?.stats || {
    total_employees: 12,
    active_employees: 12,
    present_today: 9,
    late_today: 2,
    on_leave_today: 1,
    pending_leave_approvals: 2,
    pending_attendance_regularizations: 1,
  };

  const deptColors = ['#152244', '#B8862E', '#0E7C74', '#3562C9', '#C98A1D', '#C64550'];

  const formattedDeptData =
    data?.department_distribution?.map((d: any, idx: number) => ({
      name: d.name,
      value: d.count,
      color: deptColors[idx % deptColors.length],
    })) || [];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E6E9F0] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display font-bold text-2xl text-[#18213A]">HR & Operations Overview</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#FBF1DE] text-[#B8862E] text-xs font-semibold border border-[#B8862E]/20">
              UAE Labour Law Compliant
            </span>
          </div>
          <p className="text-xs text-[#68708A] mt-1">
            Real-time workforce metrics, Wage Protection System status, and compliance tracking.
          </p>
        </div>

        {/* Quick Check-in/out trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleCheckIn}
            disabled={isCheckingIn}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#B8862E] hover:bg-[#9E7124] text-white text-xs font-semibold rounded-xl shadow-md shadow-[#B8862E]/20 transition disabled:opacity-50"
          >
            <Clock className="w-4 h-4" />
            <span>Clock In (Work)</span>
          </button>

          <button
            onClick={handleCheckOut}
            disabled={isCheckingIn}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#F2F4F8] hover:bg-[#E6E9F0] text-[#18213A] text-xs font-semibold rounded-xl border border-[#E6E9F0] transition disabled:opacity-50"
          >
            <span>Clock Out</span>
          </button>
        </div>
      </div>

      {/* Row 1: 4 Key Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Workforce"
          value={`${stats.total_employees} Staff`}
          subtitle={`${stats.active_employees} Active on Payroll`}
          trend="+8% QoQ"
          trendType="positive"
          icon={Users}
          colorScheme="gold"
        />

        <StatCard
          title="Today's Attendance"
          value={`${stats.present_today} Present`}
          subtitle={`${stats.late_today} Late • ${stats.on_leave_today} On Leave`}
          trend="92% Rate"
          trendType="positive"
          icon={CheckCircle2}
          colorScheme="teal"
        />

        <StatCard
          title="Pending Approvals"
          value={`${stats.pending_leave_approvals + stats.pending_attendance_regularizations} Requests`}
          subtitle={`${stats.pending_leave_approvals} Leaves • ${stats.pending_attendance_regularizations} Regularizations`}
          trend="Needs Action"
          trendType="negative"
          icon={AlertTriangle}
          colorScheme="amber"
        />

        <StatCard
          title="Monthly Payroll Cost"
          value={
            data?.payroll_summary?.total_net_aed
              ? `AED ${Number(data.payroll_summary.total_net_aed).toLocaleString('en-US')}`
              : 'AED 147,050'
          }
          subtitle="WPS File Dispatched"
          trend="Processed"
          trendType="neutral"
          icon={Receipt}
          colorScheme="blue"
        />
      </div>

      {/* Row 2: Charts (2-Column Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Attendance Trend (Area Chart) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#E6E9F0] shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display font-bold text-base text-[#18213A]">Weekly Attendance Trends</h3>
              <p className="text-xs text-[#68708A]">Present vs Late vs Leave log across UAE branches</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-[#0E7C74] font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0E7C74]"></span> Present
              </span>
              <span className="flex items-center gap-1 text-[#C98A1D] font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C98A1D]"></span> Late
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.weekly_trend || []}>
                <defs>
                  <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0E7C74" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0E7C74" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorLate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C98A1D" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#C98A1D" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6E9F0" vertical={false} />
                <XAxis dataKey="day" stroke="#9AA1B5" fontSize={11} tickLine={false} />
                <YAxis stroke="#9AA1B5" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E6E9F0',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="present"
                  stroke="#0E7C74"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPresent)"
                />
                <Area
                  type="monotone"
                  dataKey="late"
                  stroke="#C98A1D"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorLate)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Distribution (Donut Chart) */}
        <div className="bg-white p-6 rounded-2xl border border-[#E6E9F0] shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-[#18213A]">Department Distribution</h3>
            <p className="text-xs text-[#68708A]">Headcount by operational sector</p>
          </div>

          <div className="h-56 my-2 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={formattedDeptData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {formattedDeptData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #E6E9F0',
                    fontSize: '11px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold font-display text-[#18213A]">{stats.total_employees}</span>
              <span className="text-[10px] text-[#9AA1B5] uppercase font-semibold">Total Staff</span>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-[#E6E9F0]">
            {formattedDeptData.slice(0, 4).map((d: any) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-[#68708A] truncate max-w-[170px]">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }}></span>
                  <span className="truncate">{d.name}</span>
                </span>
                <span className="font-semibold text-[#18213A]">{d.value} Staff</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: 3-Column Bottom Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Compliance & Visa Expiry Alerts */}
        <div className="bg-white p-6 rounded-2xl border border-[#E6E9F0] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#C64550]" />
              <h3 className="font-display font-bold text-sm text-[#18213A]">Compliance & Visa Alerts</h3>
            </div>
            <Badge variant="rose" size="sm">
              {data?.compliance_alerts?.length || 0} Alerts
            </Badge>
          </div>

          <div className="space-y-3">
            {data?.compliance_alerts?.length > 0 ? (
              data.compliance_alerts.map((alert: any) => (
                <div
                  key={alert.id}
                  className="p-3 rounded-xl bg-[#F2F4F8] border border-[#E6E9F0] flex items-center justify-between gap-3"
                >
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-[#18213A] truncate">{alert.employee_name}</p>
                    <p className="text-[11px] text-[#68708A] truncate">
                      {alert.document_type} • {alert.document_number}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        alert.days_remaining < 0
                          ? 'bg-[#FBEAEA] text-[#C64550]'
                          : alert.days_remaining <= 30
                          ? 'bg-[#FBEAEA] text-[#C64550]'
                          : 'bg-[#FCF1DD] text-[#C98A1D]'
                      }`}
                    >
                      {alert.days_remaining < 0 ? 'EXPIRED' : `${alert.days_remaining}d Left`}
                    </span>
                    <p className="text-[9px] text-[#9AA1B5] mt-0.5">{alert.expiry_date}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#9AA1B5] text-center py-6">All UAE employee documents are valid.</p>
            )}
          </div>
        </div>

        {/* Quick Pending Approvals */}
        <div className="bg-white p-6 rounded-2xl border border-[#E6E9F0] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#C98A1D]" />
                <h3 className="font-display font-bold text-sm text-[#18213A]">Pending Approvals</h3>
              </div>
              <Badge variant="amber" size="sm">
                Action Required
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl border border-[#E6E9F0] bg-white hover:border-[#B8862E] transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#18213A]">Annual Leave Request</span>
                  <span className="text-[10px] font-semibold text-[#0E7C74] bg-[#E4F5F2] px-2 py-0.5 rounded">
                    3 Days
                  </span>
                </div>
                <p className="text-xs text-[#68708A] mt-1">Maria Elena Santos (Fashion Stylist)</p>
                <p className="text-[11px] text-[#9AA1B5]">Period: 15 Sep - 18 Sep 2026</p>
              </div>

              <div className="p-3.5 rounded-xl border border-[#E6E9F0] bg-white hover:border-[#B8862E] transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#18213A]">Attendance Regularization</span>
                  <span className="text-[10px] font-semibold text-[#C98A1D] bg-[#FCF1DD] px-2 py-0.5 rounded">
                    Missed Check-out
                  </span>
                </div>
                <p className="text-xs text-[#68708A] mt-1">Farhan Qureshi (Senior Cutter)</p>
                <p className="text-[11px] text-[#9AA1B5]">Date: Yesterday • Reason: SZR Road Client Fitting</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => (window.location.href = '/leaves')}
            className="w-full mt-4 py-2 bg-[#F2F4F8] hover:bg-[#E6E9F0] text-xs font-semibold text-[#18213A] rounded-xl border border-[#E6E9F0] transition flex items-center justify-center gap-1.5"
          >
            <span>Review All Approvals</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#B8862E]" />
          </button>
        </div>

        {/* Celebrations & Anniversaries */}
        <div className="bg-white p-6 rounded-2xl border border-[#E6E9F0] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Cake className="w-4 h-4 text-[#B8862E]" />
              <h3 className="font-display font-bold text-sm text-[#18213A]">Anniversaries & Celebrations</h3>
            </div>
            <span className="text-[10px] font-bold text-[#B8862E] bg-[#FBF1DE] px-2 py-0.5 rounded-full">
              This Month
            </span>
          </div>

          <div className="space-y-3">
            {data?.celebrations?.map((item: any, idx: number) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-gradient-to-r from-[#FBF1DE]/40 to-white border border-[#B8862E]/20 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#B8862E]/10 text-[#B8862E] flex items-center justify-center text-xs font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#18213A]">{item.name}</p>
                    <p className="text-[10px] text-[#68708A]">{item.designation}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-[#B8862E]">{item.years}</span>
                  <p className="text-[9px] text-[#9AA1B5]">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
