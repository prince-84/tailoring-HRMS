'use client';

import React, { useState } from 'react';
import { Sparkles, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, Briefcase } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { showToast, errorAlert } from '@/lib/swal';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@hrms.ae');
  const [password, setPassword] = useState('password');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await api.post('/login', { email, password });
      login(res.data.token, res.data.user);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Invalid email or password. Please verify credentials.';
      errorAlert('Authentication Failed', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const setDemoCredentials = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password');
    showToast(`Loaded ${demoEmail}`, 'info');
  };

  return (
    <div className="min-h-screen bg-[#F2F4F8] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-[#E6E9F0] overflow-hidden">
        {/* Top Header Card Banner */}
        <div className="bg-gradient-to-r from-[#152244] to-[#101B36] p-8 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#B8862E]/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-[#B8862E] to-[#E5B55E] flex items-center justify-center text-[#101B36] shadow-lg shadow-[#B8862E]/30 mb-4">
            <Sparkles className="w-7 h-7 font-bold" />
          </div>

          <h2 className="font-display text-2xl font-bold tracking-tight">BESPOKE HRMS</h2>
          <p className="text-xs text-[#9AA1B5] mt-1 font-medium tracking-wide">
            UAE Enterprise HR Management & WPS Portal
          </p>
        </div>

        {/* Login Form */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#18213A] mb-1.5 uppercase tracking-wider">
                Corporate Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#9AA1B5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.ae"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F2F4F8] border border-[#E6E9F0] rounded-xl text-sm text-[#18213A] focus:outline-none focus:border-[#B8862E] focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#18213A] uppercase tracking-wider">
                  Password
                </label>
                <span className="text-xs text-[#B8862E] font-medium cursor-pointer hover:underline">
                  Forgot Password?
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#9AA1B5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F2F4F8] border border-[#E6E9F0] rounded-xl text-sm text-[#18213A] focus:outline-none focus:border-[#B8862E] focus:bg-white transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-[#B8862E] hover:bg-[#9E7124] text-white font-semibold text-sm rounded-xl shadow-md shadow-[#B8862E]/25 flex items-center justify-center gap-2 transition disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-8 pt-6 border-t border-[#E6E9F0]">
            <p className="text-xs font-bold text-[#68708A] uppercase tracking-wider text-center mb-3">
              1-Click Demo Accounts (Password: <code className="text-[#18213A] bg-[#F2F4F8] px-1 py-0.5 rounded">password</code>)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDemoCredentials('admin@hrms.ae')}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                  email === 'admin@hrms.ae'
                    ? 'border-[#B8862E] bg-[#FBF1DE]/50'
                    : 'border-[#E6E9F0] bg-white hover:bg-[#F2F4F8]'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-[#B8862E] mb-1" />
                <div>
                  <p className="text-[11px] font-bold text-[#18213A]">Admin</p>
                  <p className="text-[9px] text-[#9AA1B5] truncate">admin@hrms.ae</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('hr@hrms.ae')}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                  email === 'hr@hrms.ae'
                    ? 'border-[#0E7C74] bg-[#E4F5F2]/50'
                    : 'border-[#E6E9F0] bg-white hover:bg-[#F2F4F8]'
                }`}
              >
                <Briefcase className="w-4 h-4 text-[#0E7C74] mb-1" />
                <div>
                  <p className="text-[11px] font-bold text-[#18213A]">HR Manager</p>
                  <p className="text-[9px] text-[#9AA1B5] truncate">hr@hrms.ae</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('employee@hrms.ae')}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                  email === 'employee@hrms.ae'
                    ? 'border-[#3562C9] bg-[#E9EFFC]/50'
                    : 'border-[#E6E9F0] bg-white hover:bg-[#F2F4F8]'
                }`}
              >
                <UserCheck className="w-4 h-4 text-[#3562C9] mb-1" />
                <div>
                  <p className="text-[11px] font-bold text-[#18213A]">Employee</p>
                  <p className="text-[9px] text-[#9AA1B5] truncate">employee@hrms.ae</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
