'use client';

import { useState, useEffect } from 'react';
import { useStaffContext } from '@/app/staff/components/StaffContext';
import { api } from '@/lib/api';
import { getSession } from '@/lib/auth/session';
import { StockItem } from '@/app/staff/lib/api/stock';
import { StockRequest } from '@/app/staff/lib/api/stockRequests';
import { AlertTriangle, Package, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CookAlertsPage() {
  const { propertyId, staffRole, loading: ctxLoading } = useStaffContext();
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [requests, setRequests] = useState<StockRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const user = typeof window !== 'undefined' ? getSession() : null;
  const router = useRouter();

  const loadData = () => {
    if (staffRole === 'cook' && propertyId) {
      setLoading(true);
      setStockItems(api.stock.getByProperty(propertyId));
      setRequests(api.stockRequests.getByProperty(propertyId));
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!ctxLoading && propertyId) {
      if (staffRole !== 'cook') {
        router.push('/staff/dashboard');
        return;
      }
      loadData();
    }
  }, [ctxLoading, propertyId, staffRole]);

  if (loading || ctxLoading) {
    return <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" /></div>;
  }

  const lowStockAlerts = stockItems.filter(i => i.lowStockThreshold !== undefined && i.quantity <= i.lowStockThreshold);
  
  const expiryAlerts = stockItems.filter(i => {
    if (!i.expiryDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(i.expiryDate);
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 3; // Expired or expiring in 3 days
  });

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)]">Alerts & Refills</h1>
          <p className="text-[var(--text-secondary)]">Monitor inventory alerts and active requests.</p>
        </div>
        <Link href="/staff/dashboard" className="px-4 py-2 border border-[var(--border)] rounded-md text-sm font-bold hover:bg-[var(--bg-card)]">
          &larr; Back
        </Link>
      </div>

      {expiryAlerts.length === 0 && lowStockAlerts.length === 0 && requests.length === 0 && (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] p-10 text-center">
          <div className="w-16 h-16 bg-[rgba(34,197,94,0.1)] text-[var(--success)] rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">All Good!</h2>
          <p className="text-[var(--text-secondary)]">No active alerts, low stock, or pending requests.</p>
        </div>
      )}

      {/* Expiry Alerts */}
      {expiryAlerts.length > 0 && (
        <div className="bg-[var(--bg-card)] border border-[rgba(239,68,68,0.3)] rounded-[var(--radius-lg,12px)] p-5 shadow-sm">
          <h3 className="font-bold text-[var(--danger)] mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Expiry Alerts
          </h3>
          <div className="space-y-3">
            {expiryAlerts.map(i => {
              const activeReq = requests.find(r => r.itemName === i.name);
              const diffDays = Math.ceil((new Date(i.expiryDate!).getTime() - new Date().setHours(0,0,0,0)) / (1000 * 60 * 60 * 24));
              const statusText = diffDays < 0 ? 'is EXPIRED!' : `expires in ${diffDays} days!`;
              
              return (
                <div key={`exp-${i.id}`} className="bg-[rgba(239,68,68,0.05)] border border-[rgba(239,68,68,0.2)] text-[var(--danger)] text-sm rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <strong>{i.name}</strong> {statusText}
                  </div>
                  <div className="text-xs font-medium text-[var(--text-secondary)]">
                    Manager will handle this automatically.
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Low Stock Alerts */}
      {lowStockAlerts.length > 0 && (
        <div className="bg-[var(--bg-card)] border border-[rgba(239,68,68,0.3)] rounded-[var(--radius-lg,12px)] p-5 shadow-sm">
          <h3 className="font-bold text-[var(--danger)] mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Low Stock Alerts
          </h3>
          <div className="space-y-3">
            {lowStockAlerts.map(i => {
              const activeReq = requests.find(r => r.itemName === i.name);
              return (
                <div key={i.id} className="bg-[rgba(239,68,68,0.05)] border border-[rgba(239,68,68,0.2)] text-[var(--danger)] text-sm rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <strong>{i.name}</strong> is running low ({i.quantity} {i.unit} left).
                  </div>
                  {activeReq ? (
                    <span className="text-xs font-bold px-2 py-1 rounded bg-[rgba(239,68,68,0.1)] uppercase w-fit">
                      {activeReq.status}
                    </span>
                  ) : (
                    <div className="text-xs font-medium text-[var(--text-secondary)]">
                      Auto-notified to Manager.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Stock Requests Tracker */}
      {requests.length > 0 && (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] p-5 shadow-sm">
          <h3 className="font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-[var(--primary)]" /> Stock Refill Status
          </h3>
          <div className="space-y-3">
            {requests.map(req => (
              <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-[var(--border)] rounded-[var(--radius-md,8px)] bg-[var(--bg-page)] gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-[var(--text-primary)]">{req.itemName}</p>
                    <span className="text-[10px] bg-[rgba(99,102,241,0.1)] text-[var(--primary)] px-2 py-0.5 rounded-full font-bold uppercase">
                      Request
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">Status: <span className="uppercase font-bold">{req.status}</span></p>
                </div>
                {req.status === 'purchased' && (
                  <button 
                    onClick={() => {
                      api.stockRequests.verifyReceipt(req.id, req.purchasedQuantity || req.quantityRequested, req.unit);
                      loadData();
                    }} 
                    className="bg-[var(--success)] text-white px-5 py-2 rounded-md text-sm font-bold hover:bg-[var(--success-hover)] w-full sm:w-auto text-center"
                  >
                    Receive & Update Stock
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
