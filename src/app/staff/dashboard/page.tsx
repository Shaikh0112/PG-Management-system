'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStaffContext } from '@/app/staff/components/StaffContext';
import { Utensils, ListTodo, Package, AlertTriangle, Send } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { FoodMenu } from '@/lib/api/food';
import { StockItem } from '@/lib/api/stock';
import { StockRequest } from '@/lib/api/stockRequests';
import { getSession } from '@/lib/auth/session';

export default function StaffDashboard() {
  const router = useRouter();
  const { staffRole, propertyId, loading } = useStaffContext();
  const [menu, setMenu] = useState<FoodMenu | null>(null);
  
  // Stock State
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [requests, setRequests] = useState<StockRequest[]>([]);
  const [selectedStock, setSelectedStock] = useState('');
  const [usageQty, setUsageQty] = useState('');

  const loadData = () => {
    if (staffRole === 'cook' && propertyId) {
      setMenu(api.food.getByProperty(propertyId));
      setStockItems(api.stock.getByProperty(propertyId));
      setRequests(api.stockRequests.getByProperty(propertyId).filter(r => r.status !== 'resolved'));
    }
  };

  useEffect(() => {
    loadData();
  }, [staffRole, propertyId]);

  const handleNotifyManager = (item: StockItem, requestType: 'low_stock' | 'expiry' = 'low_stock') => {
    const user = getSession();
    if (!user) return;
    
    api.stockRequests.create({
      propertyId: propertyId!,
      stockItemId: item.id,
      itemName: item.name,
      requestType,
      requestedBy: user.id
    });
    loadData();
  };

  const handleResolveRequest = (req: StockRequest) => {
    // Usually they should update the stock amount first, but let's navigate to stock page or just resolve it
    api.stockRequests.resolve(req.id);
    router.push('/staff/stock');
  };

  const handleLogUsage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStock || !usageQty) return;
    
    const item = stockItems.find(i => i.id === selectedStock);
    if (!item) return;

    const used = parseFloat(usageQty);
    if (used > 0 && item.quantity >= used) {
      api.stock.update(item.id, { quantity: item.quantity - used });
      setSelectedStock('');
      setUsageQty('');
      loadData(); // Reload stock
    } else {
      alert('Invalid quantity or not enough stock available!');
    }
  };

  if (loading) return <div className="p-6 animate-pulse">Loading dashboard...</div>;

  const roles = [
    { role: 'cook', title: 'Food & Menu', icon: Utensils, href: '/staff/cook', desc: 'View the full weekly food schedule.', highlight: staffRole === 'cook' },
    { role: 'cook', title: 'Kitchen Stock', icon: Package, href: '/staff/stock', desc: 'Manage kitchen inventory.', highlight: staffRole === 'cook' },
  ];

  // Helper to get today's day key and data
  const getTodayMenu = () => {
    if (!menu) return null;
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof FoodMenu;
    const rawVal = menu[today] as string;
    
    let dayData = { breakfast: '', lunch: '', dinner: rawVal || 'No menu set' };
    try {
      if (rawVal) {
        const parsed = JSON.parse(rawVal);
        if (parsed.breakfast !== undefined) dayData = parsed;
      }
    } catch (e) {}

    return { day: today, data: dayData };
  };

  const todayMenu = getTodayMenu();
  const isMonthEnd = (() => {
    const d = new Date();
    const nextDay = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
    return nextDay.getMonth() !== d.getMonth();
  })();

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
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-[24px] font-bold text-[var(--text-primary)]">Staff Overview</h1>
        <p className="text-sm text-[var(--text-secondary)]">Your daily dashboard and quick actions.</p>
      </div>

      {/* Expiry Alerts */}
      {staffRole === 'cook' && expiryAlerts.length > 0 && (
        <div className="bg-[rgba(239,68,68,0.05)] border border-[rgba(239,68,68,0.3)] rounded-[var(--radius-md,8px)] p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[var(--danger)] shrink-0 mt-0.5" />
          <div className="space-y-2 w-full">
            <h3 className="font-bold text-[var(--danger)]">Expiry Alert!</h3>
            <div className="flex flex-col gap-2">
              {expiryAlerts.map(i => {
                const activeReq = requests.find(r => r.stockItemId === i.id && r.requestType === 'expiry');
                const diffDays = Math.ceil((new Date(i.expiryDate!).getTime() - new Date().setHours(0,0,0,0)) / (1000 * 60 * 60 * 24));
                const statusText = diffDays < 0 ? 'is EXPIRED!' : `expires in ${diffDays} days!`;
                
                return (
                  <div key={`exp-${i.id}`} className="bg-white dark:bg-black/20 border border-[rgba(239,68,68,0.2)] text-[var(--danger)] text-sm rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <strong>{i.name}</strong> {statusText}
                    </div>
                    {!activeReq ? (
                      <button onClick={() => handleNotifyManager(i, 'expiry')} className="bg-[var(--danger)] text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-[var(--danger-hover)]">
                        Request Fresh Stock
                      </button>
                    ) : (
                      <span className="text-xs font-bold px-2 py-1 rounded bg-[rgba(239,68,68,0.1)] uppercase">
                        {activeReq.status.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Low Stock Alerts */}
      {staffRole === 'cook' && lowStockAlerts.length > 0 && (
        <div className="bg-[rgba(239,68,68,0.05)] border border-[rgba(239,68,68,0.3)] rounded-[var(--radius-md,8px)] p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[var(--danger)] shrink-0 mt-0.5" />
          <div className="space-y-2 w-full">
            <h3 className="font-bold text-[var(--danger)]">Low Stock Alert!</h3>
            <div className="flex flex-col gap-2">
              {lowStockAlerts.map(i => {
                const activeReq = requests.find(r => r.stockItemId === i.id && (r.requestType === 'low_stock' || !r.requestType));
                return (
                  <div key={i.id} className="bg-white dark:bg-black/20 border border-[rgba(239,68,68,0.2)] text-[var(--danger)] text-sm rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <strong>{i.name}</strong> is low ({i.quantity} {i.unit} left).
                    </div>
                    {!activeReq ? (
                      <button onClick={() => handleNotifyManager(i, 'low_stock')} className="bg-[var(--danger)] text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-[var(--danger-hover)]">
                        Notify Manager
                      </button>
                    ) : (
                      <span className="text-xs font-bold px-2 py-1 rounded bg-[rgba(239,68,68,0.1)] uppercase">
                        {activeReq.status.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Active Stock Requests Tracker */}
      {staffRole === 'cook' && requests.length > 0 && (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] p-5 shadow-sm">
          <h3 className="font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
            <Package className="w-5 h-5 text-[var(--primary)]" /> Stock Refill Status
          </h3>
          <div className="space-y-2">
            {requests.map(req => (
              <div key={req.id} className="flex items-center justify-between p-3 border border-[var(--border)] rounded-[var(--radius-md,8px)] bg-[var(--bg-page)]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-[var(--text-primary)] text-sm">{req.itemName}</p>
                    <span className="text-[10px] bg-[rgba(99,102,241,0.1)] text-[var(--primary)] px-2 py-0.5 rounded-full font-bold uppercase">
                      {req.requestType === 'expiry' ? 'Replacement' : 'Refill'}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">Status: <span className="uppercase font-bold">{req.status.replace('_', ' ')}</span></p>
                </div>
                {req.status === 'refilled' && (
                  <button onClick={() => handleResolveRequest(req)} className="bg-[var(--success)] text-white px-4 py-2 rounded text-xs font-bold hover:bg-[var(--success-hover)]">
                    Update Stock
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {staffRole === 'cook' && todayMenu && (
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] p-6 shadow-sm relative overflow-hidden h-full">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[var(--primary)] to-transparent opacity-[0.05] rounded-bl-full pointer-events-none"></div>
          
          <div className="flex items-center gap-3 mb-6 border-b border-[var(--border)] pb-4">
            <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Today's Menu</h2>
              <p className="text-sm text-[var(--text-secondary)] capitalize">{todayMenu.day} {isMonthEnd ? ' (Month End Special!)' : ''}</p>
            </div>
          </div>

          {isMonthEnd && menu?.monthEndSpecial ? (
            <div className="bg-gradient-to-br from-[var(--primary-subtle)] to-[var(--bg-page)] border border-[var(--primary)] border-opacity-30 p-5 rounded-[var(--radius-md,8px)]">
              <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--primary)] mb-2">Month End Special Meal</p>
              <p className="text-base font-medium text-[var(--text-primary)] whitespace-pre-wrap">{menu.monthEndSpecial}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
              <div className="bg-[var(--bg-page)] border border-[var(--border)] rounded-[var(--radius-md,8px)] p-4">
                <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--text-secondary)] mb-1">Breakfast</p>
                <p className="text-sm font-medium text-[var(--text-primary)]">{todayMenu.data.breakfast || '-'}</p>
              </div>
              <div className="bg-[var(--bg-page)] border border-[var(--border)] rounded-[var(--radius-md,8px)] p-4">
                <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--text-secondary)] mb-1">Lunch</p>
                <p className="text-sm font-medium text-[var(--text-primary)]">{todayMenu.data.lunch || '-'}</p>
              </div>
              <div className="bg-[var(--bg-page)] border border-[var(--border)] rounded-[var(--radius-md,8px)] p-4">
                <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--text-secondary)] mb-1">Dinner</p>
                <p className="text-sm font-medium text-[var(--text-primary)]">{todayMenu.data.dinner || '-'}</p>
              </div>
            </div>
          )}
        </div>
      )}

          {staffRole === 'cook' && !menu && (
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] p-6 shadow-sm flex flex-col items-center justify-center text-center h-full">
              <Utensils className="w-12 h-12 text-[var(--text-secondary)] opacity-50 mb-3" />
              <h2 className="text-lg font-bold text-[var(--text-primary)]">No Menu Set</h2>
              <p className="text-sm text-[var(--text-secondary)]">The owner has not set a food menu for this property yet.</p>
            </div>
          )}
        </div>

        {/* Daily Usage Widget */}
        {staffRole === 'cook' && (
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] p-6 shadow-sm flex flex-col">
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-[var(--border)]">
              <div className="w-8 h-8 rounded-full bg-[rgba(99,102,241,0.1)] text-[var(--primary)] flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Log Daily Usage</h2>
            </div>
            
            <form onSubmit={handleLogUsage} className="flex-1 flex flex-col">
              <div className="space-y-4 flex-1">
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] mb-1 block">Select Item</label>
                  <select 
                    value={selectedStock}
                    onChange={e => setSelectedStock(e.target.value)}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded px-3 py-2 text-sm focus:border-[var(--primary)] outline-none"
                    required
                  >
                    <option value="">-- Choose item --</option>
                    {stockItems.map(i => (
                      <option key={i.id} value={i.id}>{i.name} (Avail: {i.quantity} {i.unit})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] mb-1 block">Quantity Used Today</label>
                  <input 
                    type="number"
                    step="0.01"
                    min="0"
                    value={usageQty}
                    onChange={e => setUsageQty(e.target.value)}
                    placeholder="e.g. 2.5"
                    className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded px-3 py-2 text-sm focus:border-[var(--primary)] outline-none"
                    required
                  />
                </div>
              </div>
              <button 
                type="submit"
                disabled={!selectedStock || !usageQty}
                className="w-full mt-6 bg-[var(--primary)] text-white px-4 py-2.5 rounded-[var(--radius-md,8px)] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send className="w-4 h-4" />
                Update Stock
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roles.filter(r => r.role === staffRole).map(r => {
          const Icon = r.icon;
          return (
            <Link key={r.href} href={r.href} className="block p-6 border rounded-[var(--radius-lg,12px)] transition-all bg-[var(--bg-card)] text-[var(--text-primary)] border-[var(--border)] hover:border-[var(--primary)]">
              <Icon className="w-8 h-8 mb-4 text-[var(--primary)]" />
              <h2 className="text-xl font-bold mb-2">{r.title}</h2>
              <p className="text-sm text-[var(--text-secondary)]">{r.desc}</p>
            </Link>
          );
        })}
      </div>

      <Link href="/staff/tasks" className="block mt-6 p-6 bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--primary)] rounded-[var(--radius-lg,12px)] transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[var(--bg-input)] flex items-center justify-center">
            <ListTodo className="w-6 h-6 text-[var(--text-primary)]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">General Tasks</h2>
            <p className="text-sm text-[var(--text-secondary)]">View other assigned tasks and checklists.</p>
          </div>
        </div>
      </Link>
    </div>
  );
}
