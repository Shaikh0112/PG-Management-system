import { Metadata } from 'next';
import { RequireOwner } from '@/app/owner/components/RequireOwner';
import { OwnerPropertyProvider } from '@/app/owner/components/OwnerPropertyContext';
import { OwnerLayout } from '@/app/owner/components/OwnerLayout';
import { ToastProvider } from '@/lib/ui/ToastContext';
import { OwnerI18nProvider } from './i18n';

export const metadata: Metadata = {
  title: 'Owner Portal | SmartPG',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RequireOwner>
      <OwnerI18nProvider>
        <ToastProvider>
          <OwnerPropertyProvider>
            <OwnerLayout>
              {children}
            </OwnerLayout>
          </OwnerPropertyProvider>
        </ToastProvider>
      </OwnerI18nProvider>
    </RequireOwner>
  );
}
