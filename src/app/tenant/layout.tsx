import { TenantLayout } from '@/app/tenant/components/TenantLayout';
import { ToastProvider } from '@/lib/ui/ToastContext';
import { TenantI18nProvider } from './i18n';

export const metadata = {
  title: 'Tenant Portal | ApnaPG',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <TenantI18nProvider>
      <ToastProvider>
        <TenantLayout>{children}</TenantLayout>
      </ToastProvider>
    </TenantI18nProvider>
  );
}
