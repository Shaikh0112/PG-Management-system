'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useManagerPropertyContext } from '@/app/manager/components/ManagerPropertyContext';
import { UtensilsCrossed, Calendar } from 'lucide-react';
import { FoodMenu } from '@/app/staff/lib/api/food';

export default function ManagerFoodPage() {
  const { selectedPropertyId, loading: ctxLoading } = useManagerPropertyContext();
  
  const [loading, setLoading] = useState(true);
  const [menu, setMenu] = useState<FoodMenu | null>(null);

  useEffect(() => {
    if (!ctxLoading && selectedPropertyId) {
      setLoading(true);
      const data = api.food.getByProperty(selectedPropertyId);
      setMenu(data);
      setLoading(false);
    }
  }, [selectedPropertyId, ctxLoading]);

  if (ctxLoading || loading) {
    return <div className="p-6 animate-pulse">Loading menu...</div>;
  }

  if (!selectedPropertyId) {
    return <div className="p-6 text-center text-[var(--text-secondary)]">Property Required</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--text-primary)]">PG Food Menu</h1>
          <p className="text-sm text-[var(--text-secondary)]">View the weekly food schedule set by the owner.</p>
        </div>
      </div>

      {!menu ? (
        <div className="flex flex-col items-center justify-center py-16 bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] text-center">
          <UtensilsCrossed className="w-12 h-12 text-[var(--text-secondary)] opacity-50 mb-4" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">No Menu Available</h3>
          <p className="text-[var(--text-secondary)] text-sm max-w-sm">
            The owner hasn't set a food menu for this property yet.
          </p>
        </div>
      ) : (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] overflow-hidden shadow-sm">
          <div className="p-6 border-b border-[var(--border)] bg-[rgba(99,102,241,0.02)] flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[rgba(99,102,241,0.1)] flex items-center justify-center text-[var(--primary)]">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[var(--text-primary)]">Weekly Schedule</h2>
                <p className="text-xs text-[var(--text-secondary)]">Standard items for each day</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                const rawValue = (menu as any)[day] || '';
                let dayData = { breakfast: '', lunch: '', dinner: rawValue };
                try {
                  const parsed = JSON.parse(rawValue);
                  if (parsed.breakfast !== undefined) dayData = parsed;
                } catch (e) {}

                return (
                  <div key={day} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] p-5 shadow-sm hover:shadow-md hover:border-[var(--primary)]/50 transition-all relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[var(--primary)] to-transparent opacity-[0.03] group-hover:opacity-[0.06] rounded-bl-full pointer-events-none transition-opacity"></div>
                    
                    <h3 className="text-sm font-black text-[var(--text-primary)] capitalize mb-4 flex items-center gap-2 pb-3 border-b border-[var(--border)]">
                      <div className="w-2 h-2 rounded-full bg-[var(--primary)] shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>
                      {day}
                    </h3>
                    
                    <div className="space-y-4 relative z-10">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--text-secondary)] mb-1">Breakfast</p>
                        <p className="text-sm font-medium text-[var(--text-primary)]">{dayData.breakfast || '-'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--text-secondary)] mb-1">Lunch</p>
                        <p className="text-sm font-medium text-[var(--text-primary)]">{dayData.lunch || '-'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--text-secondary)] mb-1">Dinner</p>
                        <p className="text-sm font-medium text-[var(--text-primary)]">{dayData.dinner || '-'}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {menu.monthEndSpecial && (
              <div className="mt-8 border-t border-[var(--border)] pt-8">
                <div className="bg-gradient-to-br from-[var(--primary-subtle)] to-[var(--bg-card)] border border-[var(--primary)] border-opacity-30 rounded-[var(--radius-lg,12px)] p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                    <UtensilsCrossed className="w-24 h-24" />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2 flex items-center gap-2">
                      🎉 Month End Special
                    </h3>
                    <div className="w-full max-w-2xl bg-white dark:bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-md,8px)] p-4 text-sm text-[var(--text-primary)] shadow-sm whitespace-pre-wrap">
                      {menu.monthEndSpecial}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
