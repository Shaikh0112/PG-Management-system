'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useManagerPropertyContext } from '@/app/manager/components/ManagerPropertyContext';
import { Archive, Plus, Minus, AlertTriangle, CheckCircle, Clock, ShoppingCart } from 'lucide-react';
import { getSession } from '@/lib/auth/session';
import { stockRequestsApi } from '@/app/staff/lib/api/stockRequests';

export default function ManagerInventoryPage() {
  const { selectedPropertyId, loading: ctxLoading } = useManagerPropertyContext();
  const [inventory, setInventory] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'live' | 'requests'>('requests');
  const user = typeof window !== 'undefined' ? getSession() : null;

  const [formData, setFormData] = useState({ name: '', quantity: '', threshold: '', category: 'Groceries' });
  const [purchaseCost, setPurchaseCost] = useState<{ [key: string]: string }>({});

  const loadData = () => {
    if (!ctxLoading && selectedPropertyId) {
      setInventory(api.managerOperations.listInventory(selectedPropertyId));
      setRequests(stockRequestsApi.getByProperty(selectedPropertyId).filter(r => r.status !== 'verified'));
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedPropertyId, ctxLoading]);

  const handleUpdateQty = (id: string, delta: number) => {
    if (!user) return;
    api.managerOperations.updateInventory(id, delta, user.id);
    loadData();
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedPropertyId) return;
    api.managerOperations.addInventoryItem({
      propertyId: selectedPropertyId,
      name: formData.name,
      quantity: parseInt(formData.quantity) || 0,
      threshold: parseInt(formData.threshold) || 0,
      category: formData.category,
      managerId: user.id
    });
    setFormData({ name: '', quantity: '', threshold: '', category: 'Groceries' });
    loadData();
  };

  const handleMarkPurchased = (id: string) => {
    if (!user || !selectedPropertyId) return;
    const cost = parseInt(purchaseCost[id]);
    if (!cost || isNaN(cost) || cost <= 0) {
      alert('Please enter a valid cost.');
      return;
    }
    stockRequestsApi.markPurchased(id, cost, user.id);
    loadData();
  };

  if (ctxLoading) return <div className="p-6 text-[var(--text-secondary)]">Loading...</div>;
  if (!selectedPropertyId) return <div className="p-6 text-center text-[var(--text-secondary)]">Property Required</div>;

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-[24px] font-bold text-[var(--text-primary)]">Inventory & Kitchen Requests</h1>
        <p className="text-sm text-[var(--text-secondary)]">Manage live stock and fulfill cook requests.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--border)] mb-6">
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${
            activeTab === 'requests' 
              ? 'border-[var(--primary)] text-[var(--primary)]' 
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          Kitchen Requests
          {pendingCount > 0 && (
            <span className="bg-[var(--danger)] text-white text-[10px] px-2 py-0.5 rounded-full ml-1">{pendingCount}</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('live')}
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${
            activeTab === 'live' 
              ? 'border-[var(--primary)] text-[var(--primary)]' 
              : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Archive className="w-4 h-4" />
          Live Inventory
        </button>
      </div>

      {activeTab === 'requests' && (
        <div className="space-y-4">
          {requests.map(req => (
            <div key={req.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                    req.status === 'pending' ? 'bg-[var(--warning-bg)] text-[var(--warning)]' : 'bg-[var(--success-bg)] text-[var(--success)]'
                  }`}>
                    {req.status === 'pending' ? 'New Request' : 'Purchased & Sent to Kitchen'}
                  </span>
                  <span className="text-xs text-[var(--text-secondary)]">{new Date(req.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">{req.itemName}</h3>
                <p className="text-sm font-medium text-[var(--text-secondary)]">Requested: <span className="text-[var(--text-primary)]">{req.quantityRequested} {req.unit}</span></p>
              </div>

              {req.status === 'pending' ? (
                <div className="flex items-center gap-3 bg-[var(--bg-input)] p-2 rounded-xl border border-[var(--border)]">
                  <div className="flex items-center bg-[var(--bg-card)] px-3 rounded-lg border border-[var(--border)] focus-within:border-[var(--primary)] transition-colors">
                    <span className="text-[var(--text-secondary)] font-medium">₹</span>
                    <input 
                      type="number"
                      placeholder="Total Cost"
                      value={purchaseCost[req.id] || ''}
                      onChange={e => setPurchaseCost({...purchaseCost, [req.id]: e.target.value})}
                      className="bg-transparent border-none outline-none w-24 p-2 text-sm text-[var(--text-primary)] font-bold"
                    />
                  </div>
                  <button 
                    onClick={() => handleMarkPurchased(req.id)}
                    className="bg-[var(--primary)] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[var(--primary-hover)] transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    <CheckCircle className="w-4 h-4" /> Fulfill
                  </button>
                </div>
              ) : (
                <div className="text-sm font-bold text-[var(--success)] flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Awaiting Cook Verification
                </div>
              )}
            </div>
          ))}

          {requests.length === 0 && (
            <div className="text-center p-12 text-[var(--text-secondary)] bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl">
              <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="font-medium text-lg">No pending requests</p>
              <p className="text-sm mt-1">The kitchen has not requested any groceries recently.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'live' && (
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-[rgba(99,102,241,0.02)] border-b border-[var(--border)] text-[var(--text-secondary)]">
                <tr>
                  <th className="p-4 font-medium">Item Name</th>
                  <th className="p-4 font-medium">Category</th>
                  <th className="p-4 font-medium">Quantity</th>
                  <th className="p-4 font-medium text-right">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {inventory.map(item => (
                  <tr key={item.id} className="hover:bg-[var(--bg-input)] transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-[var(--text-primary)]">{item.name}</div>
                      {item.expiryDate && (
                         <div className="text-xs text-[var(--text-secondary)] mt-0.5">Expires: {new Date(item.expiryDate).toLocaleDateString()}</div>
                      )}
                      {item.quantity <= item.threshold && (
                         <div className="text-xs text-[var(--danger)] flex items-center gap-1 mt-1"><AlertTriangle className="w-3 h-3"/> Low Stock</div>
                      )}
                    </td>
                    <td className="p-4 text-[var(--text-secondary)]">{item.category}</td>
                    <td className="p-4">
                      <span className={`font-bold text-lg ${item.quantity <= item.threshold ? 'text-[var(--danger)]' : 'text-[var(--text-primary)]'}`}>
                        {item.quantity} {item.unit || ''}
                      </span>
                    </td>
                    <td className="p-4 flex justify-end gap-2">
                      <button onClick={() => handleUpdateQty(item.id, -1)} className="p-1.5 bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] rounded hover:bg-[var(--danger-bg)] hover:text-[var(--danger)] hover:border-[var(--danger)]">
                        <Minus className="w-4 h-4"/>
                      </button>
                      <button onClick={() => handleUpdateQty(item.id, 1)} className="p-1.5 bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] rounded hover:bg-[var(--success-bg)] hover:text-[var(--success)] hover:border-[var(--success)]">
                        <Plus className="w-4 h-4"/>
                      </button>
                    </td>
                  </tr>
                ))}
                {inventory.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-[var(--text-secondary)]">No inventory items.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Quick Add Form */}
          <div className="lg:w-80 space-y-4">
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] p-6">
              <h2 className="font-bold text-lg text-[var(--text-primary)] mb-4">Add Misc Stock</h2>
              <p className="text-xs text-[var(--text-secondary)] mb-4 leading-relaxed">Directly add maintenance items. For Groceries, the kitchen will send requests.</p>
              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Item Name</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded p-2 text-sm text-[var(--text-primary)]" placeholder="e.g. Light Bulbs" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Qty</label>
                    <input type="number" required value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded p-2 text-sm text-[var(--text-primary)]" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Min Threshold</label>
                    <input type="number" required value={formData.threshold} onChange={e => setFormData({...formData, threshold: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded p-2 text-sm text-[var(--text-primary)]" placeholder="0" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Category</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded p-2 text-sm text-[var(--text-primary)]">
                    <option>Maintenance</option>
                    <option>Cleaning</option>
                    <option>Misc</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-[var(--primary)] text-white py-2 rounded font-medium hover:bg-[var(--primary-hover)] transition-colors">
                  Add Stock
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
