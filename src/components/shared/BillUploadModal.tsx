import React, { useState } from 'react';
import { X, Upload, IndianRupee } from 'lucide-react';

interface BillUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number, imageUrl: string) => void;
  invoiceTitle: string;
}

export function BillUploadModal({ isOpen, onClose, onSubmit, invoiceTitle }: BillUploadModalProps) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    setLoading(true);
    // Simulate image upload by providing a dummy URL
    // In a real app, we would upload the file to S3/Cloudinary here
    const dummyImageUrl = 'https://images.unsplash.com/photo-1544256718-3bcf237f3974?q=80&w=500&auto=format&fit=crop';
    
    setTimeout(() => {
      onSubmit(Number(amount), dummyImageUrl);
      setLoading(false);
      setAmount('');
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[var(--bg-card)] w-full max-w-md rounded-[var(--radius-lg,12px)] shadow-2xl overflow-hidden border border-[var(--border)]">
        <div className="flex justify-between items-center p-5 border-b border-[var(--border)] bg-[var(--bg-input)]">
          <div>
            <h2 className="text-lg font-black text-[var(--text-primary)]">Add Electricity Bill</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-1">For {invoiceTitle}</p>
          </div>
          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-[var(--text-secondary)]">Bill Amount</label>
            <div className="relative">
              <IndianRupee className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
              <input
                type="number"
                required
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-page)] border border-[var(--border)] rounded-[var(--radius-md,8px)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-[var(--text-secondary)]">Upload Bill Image</label>
            <div className="border-2 border-dashed border-[var(--border)] rounded-[var(--radius-md,8px)] p-6 flex flex-col items-center justify-center text-center hover:bg-[var(--bg-input)] transition-colors cursor-pointer group">
              <div className="w-12 h-12 rounded-full bg-[var(--primary-subtle)] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6 text-[var(--primary)]" />
              </div>
              <p className="text-sm font-bold text-[var(--text-primary)]">Click to upload image</p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">PNG, JPG up to 5MB (Simulation)</p>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-input)] rounded-[var(--radius-md,8px)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !amount}
              className="px-6 py-2 bg-[var(--primary)] text-white font-bold rounded-[var(--radius-md,8px)] hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? 'Saving...' : 'Save Bill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
