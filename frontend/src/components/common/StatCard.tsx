'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  colorScheme?: 'gold' | 'teal' | 'blue' | 'amber' | 'rose';
}

export default function StatCard({
  title,
  value,
  subtitle,
  trend,
  trendType = 'positive',
  icon: Icon,
  colorScheme = 'gold',
}: StatCardProps) {
  const schemeStyles = {
    gold: {
      bg: 'bg-[#FBF1DE]',
      text: 'text-[#B8862E]',
      border: 'border-[#B8862E]/20',
    },
    teal: {
      bg: 'bg-[#E4F5F2]',
      text: 'text-[#0E7C74]',
      border: 'border-[#0E7C74]/20',
    },
    blue: {
      bg: 'bg-[#E9EFFC]',
      text: 'text-[#3562C9]',
      border: 'border-[#3562C9]/20',
    },
    amber: {
      bg: 'bg-[#FCF1DD]',
      text: 'text-[#C98A1D]',
      border: 'border-[#C98A1D]/20',
    },
    rose: {
      bg: 'bg-[#FBEAEA]',
      text: 'text-[#C64550]',
      border: 'border-[#C64550]/20',
    },
  };

  const current = schemeStyles[colorScheme];

  return (
    <div className="bg-white rounded-xl p-5 border border-[#E6E9F0] shadow-xs flex flex-col justify-between hover:border-[#B8862E]/40 transition duration-200">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#68708A] tracking-wider uppercase">{title}</span>
        <div className={`w-10 h-10 rounded-xl ${current.bg} ${current.text} flex items-center justify-center border ${current.border}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4">
        <div className="font-display text-2xl font-bold text-[#18213A] tracking-tight">{value}</div>
        {(subtitle || trend) && (
          <div className="flex items-center gap-2 mt-1.5 text-xs">
            {trend && (
              <span
                className={`font-semibold px-1.5 py-0.5 rounded text-[11px] ${
                  trendType === 'positive'
                    ? 'bg-[#E4F5F2] text-[#0E7C74]'
                    : trendType === 'negative'
                    ? 'bg-[#FBEAEA] text-[#C64550]'
                    : 'bg-[#F2F4F8] text-[#68708A]'
                }`}
              >
                {trend}
              </span>
            )}
            {subtitle && <span className="text-[#9AA1B5] truncate">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
