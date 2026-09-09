'use client';

import React from 'react';

export type BadgeVariant = 'gold' | 'teal' | 'rose' | 'amber' | 'blue' | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
}

export default function Badge({ children, variant = 'neutral', size = 'sm', dot = false }: BadgeProps) {
  const variantStyles = {
    gold: 'bg-[#FBF1DE] text-[#B8862E] border-[#B8862E]/30',
    teal: 'bg-[#E4F5F2] text-[#0E7C74] border-[#0E7C74]/30',
    rose: 'bg-[#FBEAEA] text-[#C64550] border-[#C64550]/30',
    amber: 'bg-[#FCF1DD] text-[#C98A1D] border-[#C98A1D]/30',
    blue: 'bg-[#E9EFFC] text-[#3562C9] border-[#3562C9]/30',
    neutral: 'bg-[#F2F4F8] text-[#68708A] border-[#E6E9F0]',
  };

  const dotColors = {
    gold: 'bg-[#B8862E]',
    teal: 'bg-[#0E7C74]',
    rose: 'bg-[#C64550]',
    amber: 'bg-[#C98A1D]',
    blue: 'bg-[#3562C9]',
    neutral: 'bg-[#68708A]',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2.5 py-0.5',
    md: 'text-xs px-3 py-1',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${variantStyles[variant]} ${sizeStyles[size]}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`}></span>}
      {children}
    </span>
  );
}
