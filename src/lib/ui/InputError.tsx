import React from 'react';
import { AlertCircle } from 'lucide-react';

export function InputError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-1 mt-1 text-[var(--danger)] animate-in slide-in-from-top-1 fade-in duration-200">
      <AlertCircle className="w-3 h-3" />
      <span className="text-xs font-medium">{message}</span>
    </div>
  );
}
