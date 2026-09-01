'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStaffContext } from '@/app/staff/components/StaffContext';
import { Utensils, ListTodo, Package, AlertTriangle, Send, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { FoodMenu } from '@/app/staff/lib/api/food';
import { StockItem } from '@/app/staff/lib/api/stock';
import { StockRequest } from '@/app/staff/lib/api/stockRequests';
import { getSession } from '@/lib/auth/session';
import { attendanceApi } from '@/app/owner/lib/api/attendance';

export default function StaffDashboard() {
  const router = useRouter();
  const { staffRole, propertyId, loading } = useStaffContext();
  const user = typeof window !== 'undefined' ? getSession() : null;
  const [menu, setMenu] = useState<FoodMenu | null>(null);
  const [isPresent, setIsPresent] = useState(false);
  
  // Stock State
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [requests, setRequests] = useState<StockRequest[]>([]);
  const [selectedStockName, setSelectedStockName] = useState('');
  const [usageQty, setUsageQty] = useState('');
  const [usageMeal, setUsageMeal] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Other'>('Breakfast');

  // Custom Request State
  const [customReqName, setCustomReqName] = useState('');
  const [customReqQty, setCustomReqQty] = useState('');

  const loadData = () => {
    if (staffRole === 'cook' && propertyId) {
      setMenu(api.food.getByProperty(propertyId));
      setStockItems(api.stock.getByProperty(propertyId));
      setRequests(api.stockRequests.getByProperty(propertyId).filter(r => r.status !== 'verified'));
    }
    if (propertyId && user) {
      setIsPresent(attendanceApi.getTodayStatus(propertyId, user.id));
    }
  };

  useEffect(() => {
    loadData();
  }, [staffRole, propertyId]);

  const handleNotifyManager = (item: StockItem) => {
    if (!user) return;
    
    api.stockRequests.create({
      propertyId: propertyId!,
      itemName: item.name,
      quantityRequested: item.lowStockThreshold && item.lowStockThreshold > 0 ? item.lowStockThreshold * 2 : 10, // reasonable default request
      unit: item.unit,
      requestedBy: user.id
    });
    loadData();
  };

  const handleCustomRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !propertyId || !customReqName || !customReqQty) return;
    
    const item = stockItems.find(i => `${i.name} (Avail: ${i.quantity} ${i.unit})` === customReqName || i.name === customReqName);
    
    api.stockRequests.create({
      propertyId,
      itemName: item ? item.name : customReqName, // Use existing item name or new name
      quantityRequested: parseFloat(customReqQty),
      unit: item ? item.unit : 'kg', // Default to kg if new item
      requestedBy: user.id
    });
    setCustomReqName('');
    setCustomReqQty('');
    loadData();
    alert('Request sent to manager!');
  };

  const handleMarkPresent = () => {
    if (propertyId && user) {
      attendanceApi.markPresent(propertyId, user.id);
      setIsPresent(true);
    }
  };

  const handleResolveRequest = (req: StockRequest) => {
    // Usually they should update the stock amount first, but let's navigate to stock page or just resolve it
    if (req.status === 'purchased') {
      api.stockRequests.verifyReceipt(req.id, req.purchasedQuantity || req.quantityRequested, req.unit);
    }
    router.push('/staff/stock');
  };

  const handleLogUsage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStockName || !usageQty) return;
    
    const item = stockItems.find(i => `${i.name} (Avail: ${i.quantity} ${i.unit})` === selectedStockName || i.name === selectedStockName);
    if (!item) {
      alert('Please select a valid item from the list.');
      return;
    }

    const used = parseFloat(usageQty);
    if (used > 0 && item.quantity >= used) {
      api.stock.update(item.id, { quantity: item.quantity - used });
      
      // Log usage record
      api.usageLogs.create({
        propertyId: propertyId!,
        itemName: item.name,
        quantity: used,
        unit: item.unit,
        mealType: usageMeal,
        loggedBy: user!.id,
        date: new Date().toISOString().split('T')[0]
      });

      setSelectedStockName('');
      setUsageQty('');
      setUsageMeal('Breakfast');
      loadData(); // Reload stock
    } else {
      alert('Invalid quantity or not enough stock available!');
    }
  };

  if (loading) return <div className="p-6 animate-pulse">Loading dashboard...</div>;

  const roles = [
    { role: 'cook', title: 'Food & Menu', icon: Utensils, href: '/staff/cook', desc: 'View the full weekly food schedule.', highlight: staffRole === 'cook' },
    { role: 'cook', title: 'Kitchen Stock', icon: Package, href: '/staff/stock', desc: 'Manage kitchen inventory.', highlight: staffRole === 'cook' },
    { role: 'cook', title: 'Alerts & Refills', icon: AlertTriangle, href: '/staff/alerts', desc: 'View low stock and expiry alerts.', highlight: staffRole === 'cook' },
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-[var(--text-primary)]">Staff Overview</h1>
          <p className="text-sm text-[var(--text-secondary)]">Your daily dashboard and quick actions.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-md,8px)] p-2 pr-4 shadow-sm">
          {isPresent ? (
            <>
              <div className="w-10 h-10 rounded bg-[var(--success-bg)] text-[var(--success)] flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--text-secondary)] uppercase">Attendance</p>
                <p className="text-sm font-bold text-[var(--success)]">Marked Present ✅</p>
              </div>
            </>
          ) : (
            <>
              <button 
                onClick={handleMarkPresent}
                className="bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] px-6 py-2.5 rounded-[var(--radius-md,8px)] font-bold text-sm transition-colors shadow-sm"
              >
                Mark Attendance for Today
              </button>
            </>
          )}
        </div>
      </div>



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
                  <label className="text-xs font-bold text-[var(--text-secondary)] mb-1 block">Search & Select Item</label>
                  <input 
                    list="stock-items-list"
                    value={selectedStockName}
                    onChange={e => setSelectedStockName(e.target.value)}
                    placeholder="Type to search items..."
                    className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded px-3 py-2 text-sm focus:border-[var(--primary)] outline-none"
                    required
                  />
                  <datalist id="stock-items-list">
                    {stockItems.map(i => (
                      <option key={i.id} value={`${i.name} (Avail: ${i.quantity} ${i.unit})`} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] mb-1 block">Quantity Used</label>
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
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] mb-1 block">Meal Type</label>
                  <select 
                    value={usageMeal}
                    onChange={(e: any) => setUsageMeal(e.target.value)}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded px-3 py-2 text-sm focus:border-[var(--primary)] outline-none"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <button 
                type="submit"
                disabled={!selectedStockName || !usageQty}
                className="w-full mt-6 bg-[var(--primary)] text-white px-4 py-2.5 rounded-[var(--radius-md,8px)] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send className="w-4 h-4" />
                Update Stock
              </button>
            </form>
          </div>
        )}
        
        {/* Custom Stock Request Widget */}
        {staffRole === 'cook' && (
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] p-6 shadow-sm flex flex-col">
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-[var(--border)]">
              <div className="w-8 h-8 rounded-full bg-[rgba(239,68,68,0.1)] text-[var(--danger)] flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Request Stock Manually</h2>
            </div>
            
            <form onSubmit={handleCustomRequest} className="flex-1 flex flex-col">
              <div className="space-y-4 flex-1">
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] mb-1 block">Item Name</label>
                  <input 
                    list="stock-items-list-2"
                    value={customReqName}
                    onChange={e => setCustomReqName(e.target.value)}
                    placeholder="Type new or select existing..."
                    className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded px-3 py-2 text-sm focus:border-[var(--primary)] outline-none"
                    required
                  />
                  <datalist id="stock-items-list-2">
                    {stockItems.map(i => (
                      <option key={i.id} value={i.name} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] mb-1 block">Quantity Needed</label>
                  <input 
                    type="number"
                    step="0.01"
                    min="0"
                    value={customReqQty}
                    onChange={e => setCustomReqQty(e.target.value)}
                    placeholder="e.g. 10"
                    className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded px-3 py-2 text-sm focus:border-[var(--primary)] outline-none"
                    required
                  />
                </div>
              </div>
              <button 
                type="submit"
                disabled={!customReqName || !customReqQty}
                className="w-full mt-6 bg-[var(--danger)] text-white px-4 py-2.5 rounded-[var(--radius-md,8px)] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[var(--danger-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send className="w-4 h-4" />
                Submit Request
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
