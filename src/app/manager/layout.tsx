'use client';
import { RequireManager } from '@/app/manager/components/RequireManager';
import { ManagerPropertyProvider } from '@/app/manager/components/ManagerPropertyContext';
import { ManagerLayout as LayoutShell } from '@/app/manager/components/ManagerLayout';
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
