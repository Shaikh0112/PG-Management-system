'use client';
import { RequireManager } from '@/components/manager/RequireManager';
import { ManagerPropertyProvider } from '@/components/manager/ManagerPropertyContext';
import { ManagerLayout as LayoutShell } from '@/components/manager/ManagerLayout';
import { ToastProvider } from '@/lib/ui/ToastContext';
import { ManagerI18nProvider } from './i18n';

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireManager>
      <ManagerI18nProvider>
        <ToastProvider>
          <ManagerPropertyProvider>
            <LayoutShell>
              {children}
            </LayoutShell>
          </ManagerPropertyProvider>
        </ToastProvider>
      </ManagerI18nProvider>
    </RequireManager>
  );
}
