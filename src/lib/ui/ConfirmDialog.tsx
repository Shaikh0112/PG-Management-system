'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isDestructive = false
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="p-6">
          <div className="flex gap-4">
            <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${isDestructive ? 'bg-[var(--danger-bg)] text-[var(--danger)]' : 'bg-[rgba(99,102,241,0.1)] text-[var(--primary)]'}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">{title}</h3>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{message}</p>
            </div>
          </div>
        </div>
        <div className="bg-[var(--bg-page)] border-t border-[var(--border)] px-6 py-4 flex justify-end gap-3">
          <button 
            onClick={onCancel}
            className="px-4 py-2 border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium rounded-[var(--radius-md,8px)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--border)]"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            className={`px-4 py-2 font-medium rounded-[var(--radius-md,8px)] text-white shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-page)] ${
              isDestructive 
                ? 'bg-[var(--danger)] hover:bg-red-600 focus:ring-[var(--danger)]' 
                : 'bg-[var(--primary)] hover:bg-[var(--primary-hover)] focus:ring-[var(--primary)]'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
