'use client';

import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'lg',
}: ModalProps) {
  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`bg-white w-full ${maxWidthStyles[maxWidth]} rounded-2xl shadow-2xl border border-[#E6E9F0] overflow-hidden transform animate-in zoom-in-95 duration-200`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E6E9F0] flex items-center justify-between bg-gradient-to-r from-white to-[#F2F4F8]">
          <div>
            <h3 className="font-display font-bold text-lg text-[#18213A]">{title}</h3>
            {subtitle && <p className="text-xs text-[#68708A] mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#9AA1B5] hover:text-[#18213A] hover:bg-[#E6E9F0] rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
