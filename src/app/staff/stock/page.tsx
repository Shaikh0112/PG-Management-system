'use client';

import { useState, useEffect } from 'react';
import { useStaffContext } from '@/app/staff/components/StaffContext';
import { api } from '@/lib/api';
import { Package, Plus, Search, Edit2, Trash2, Check, X } from 'lucide-react';
import { StockItem } from '@/app/staff/lib/api/stock';

export default function StockPage() {
  const { propertyId, loading: ctxLoading } = useStaffContext();
  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('Kg');
  const [newItemThreshold, setNewItemThreshold] = useState('');
  const [newItemExpiry, setNewItemExpiry] = useState('');
  
  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState('');

  const loadStock = () => {
    if (propertyId) {
      setLoading(true);
      const data = api.stock.getByProperty(propertyId);
      setItems(data);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!ctxLoading && propertyId) {
      loadStock();
    }
  }, [ctxLoading, propertyId]);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyId || !newItemName.trim() || !newItemQty) return;
    
    api.stock.add({
      propertyId,
      name: newItemName.trim(),
      quantity: parseFloat(newItemQty),
      unit: newItemUnit,
      lowStockThreshold: newItemThreshold ? parseFloat(newItemThreshold) : undefined,
      expiryDate: newItemExpiry ? newItemExpiry : undefined
    });
    
    setNewItemName('');
    setNewItemQty('');
    setNewItemThreshold('');
    setNewItemExpiry('');
    setShowAddForm(false);
    loadStock();
  };

  const handleUpdateQty = (id: string) => {
    if (!editQty) return;
    api.stock.update(id, { quantity: parseFloat(editQty) });
    setEditingId(null);
    setEditQty('');
    loadStock();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this item?')) {
      api.stock.delete(id);
      loadStock();
    }
  };

  if (ctxLoading || loading) return <div className="p-6 animate-pulse">Loading stock...</div>;
  if (!propertyId) return <div className="p-6 text-center text-[var(--text-secondary)]">Property Required</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--text-primary)]">Kitchen Stock</h1>
          <p className="text-sm text-[var(--text-secondary)]">Manage your daily and monthly kitchen inventory.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-[var(--primary)] text-white px-5 py-2.5 rounded-[var(--radius-md,8px)] text-sm font-bold hover:bg-[var(--primary-hover)] transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      {showAddForm && (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] p-6 shadow-sm animate-fade-in">
          <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4">Add New Stock Item</h3>
          <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-[var(--text-secondary)] mb-1 block">Item Name</label>
              <input 
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="e.g. Rice, Oil, Dal"
                className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded px-3 py-2 text-sm focus:border-[var(--primary)] outline-none"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[var(--text-secondary)] mb-1 block">Quantity</label>
              <input 
                type="number"
                step="0.01"
                min="0"
                value={newItemQty}
                onChange={(e) => setNewItemQty(e.target.value)}
                placeholder="0"
                className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded px-3 py-2 text-sm focus:border-[var(--primary)] outline-none"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[var(--text-secondary)] mb-1 block">Threshold</label>
              <input 
                type="number"
                step="0.01"
                min="0"
                value={newItemThreshold}
                onChange={(e) => setNewItemThreshold(e.target.value)}
                placeholder="e.g. 2"
                className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded px-3 py-2 text-sm focus:border-[var(--primary)] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[var(--text-secondary)] mb-1 block">Unit</label>
              <select 
                value={newItemUnit}
                onChange={(e) => setNewItemUnit(e.target.value)}
                className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded px-3 py-2 text-sm focus:border-[var(--primary)] outline-none"
              >
                <option value="Kg">Kg</option>
                <option value="Liters">Liters</option>
                <option value="Packets">Packets</option>
                <option value="Pieces">Pieces</option>
                <option value="Grams">Grams</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-[var(--text-secondary)] mb-1 block">Expiry Date</label>
              <input 
                type="date"
                value={newItemExpiry}
                onChange={(e) => setNewItemExpiry(e.target.value)}
                className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded px-3 py-2 text-sm focus:border-[var(--primary)] outline-none"
              />
            </div>
            <div className="md:col-span-6 flex items-center justify-end gap-3 mt-2">
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)}
                className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium px-4 py-2"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="bg-[var(--primary)] text-white px-6 py-2 rounded text-sm font-bold hover:bg-[var(--primary-hover)]"
              >
                Save Item
              </button>
            </div>
          </form>
        </div>
      )}

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] text-center">
          <Package className="w-12 h-12 text-[var(--text-secondary)] opacity-50 mb-4" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">Stock is Empty</h3>
          <p className="text-[var(--text-secondary)] text-sm max-w-sm mb-4">
            You have not added any items to your kitchen inventory yet.
          </p>
          <button 
            onClick={() => setShowAddForm(true)}
            className="text-[var(--primary)] text-sm font-bold hover:underline"
          >
            Click here to add your first item
          </button>
        </div>
      ) : (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[rgba(99,102,241,0.02)] border-b border-[var(--border)]">
                  <th className="px-6 py-4 text-xs uppercase tracking-wider font-bold text-[var(--text-secondary)]">Item Name</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider font-bold text-[var(--text-secondary)]">Available Qty</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider font-bold text-[var(--text-secondary)]">Threshold</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider font-bold text-[var(--text-secondary)]">Expiry</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider font-bold text-[var(--text-secondary)] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {items.map(item => {
                  const isLowStock = item.lowStockThreshold !== undefined && item.quantity <= item.lowStockThreshold;
                  
                  let isExpiringSoon = false;
                  let isExpired = false;
                  if (item.expiryDate) {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const expiry = new Date(item.expiryDate);
                    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    if (diffDays < 0) isExpired = true;
                    else if (diffDays <= 3) isExpiringSoon = true;
                  }

                  const rowAlertClass = (isLowStock || isExpired || isExpiringSoon) ? 'bg-[rgba(239,68,68,0.05)] hover:bg-[rgba(239,68,68,0.08)]' : 'hover:bg-[rgba(0,0,0,0.01)] dark:hover:bg-[rgba(255,255,255,0.01)]';

                  return (
                  <tr key={item.id} className={`transition-colors ${rowAlertClass}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${(isLowStock || isExpired || isExpiringSoon) ? 'bg-[rgba(239,68,68,0.1)] text-[var(--danger)]' : 'bg-[rgba(99,102,241,0.1)] text-[var(--primary)]'}`}>
                          <Package className="w-4 h-4" />
                        </div>
                        <span className={`font-bold text-sm ${(isLowStock || isExpired || isExpiringSoon) ? 'text-[var(--danger)]' : 'text-[var(--text-primary)]'}`}>{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {editingId === item.id ? (
                        <div className="flex items-center gap-2">
                          <input 
                            type="number"
                            step="0.01"
                            min="0"
                            value={editQty}
                            onChange={(e) => setEditQty(e.target.value)}
                            className="w-20 bg-[var(--bg-input)] border border-[var(--border)] rounded px-2 py-1 text-sm focus:border-[var(--primary)] outline-none"
                            autoFocus
                          />
                          <span className="text-sm font-medium text-[var(--text-secondary)]">{item.unit}</span>
                          <button onClick={() => handleUpdateQty(item.id)} className="text-[var(--success)] ml-2 p-1 hover:bg-[var(--success-bg)] rounded">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => setEditingId(null)} className="text-[var(--danger)] p-1 hover:bg-[var(--danger-bg)] rounded">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-medium ${isLowStock ? 'bg-[rgba(239,68,68,0.1)] border-[rgba(239,68,68,0.2)] text-[var(--danger)]' : 'bg-[var(--bg-input)] border-[var(--border)] text-[var(--text-primary)]'}`}>
                          {item.quantity} <span className="text-xs opacity-70">{item.unit}</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-[var(--text-secondary)]">
                        {item.lowStockThreshold !== undefined ? `${item.lowStockThreshold} ${item.unit}` : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {item.expiryDate ? (
                        <span className={`text-sm font-bold ${(isExpired || isExpiringSoon) ? 'text-[var(--danger)]' : 'text-[var(--text-primary)]'}`}>
                          {new Date(item.expiryDate).toLocaleDateString()}
                          {isExpired && ' (Expired)'}
                          {isExpiringSoon && !isExpired && ' (Expiring soon)'}
                        </span>
                      ) : <span className="text-sm font-medium text-[var(--text-secondary)]">-</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {editingId !== item.id && (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => {
                              setEditingId(item.id);
                              setEditQty(item.quantity.toString());
                            }}
                            className="p-2 text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--primary-subtle)] rounded-full transition-colors"
                            title="Update Quantity"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-[var(--text-secondary)] hover:text-[var(--danger)] hover:bg-[var(--danger-bg)] rounded-full transition-colors"
                            title="Delete Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
