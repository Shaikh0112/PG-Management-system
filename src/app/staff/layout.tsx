import { StaffLayout } from '@/components/staff/StaffLayout';
import { ToastProvider } from '@/lib/ui/ToastContext';
import { StaffI18nProvider } from './i18n';

export const metadata = {
  title: 'Staff Portal | Smart PG',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <StaffI18nProvider>
      <ToastProvider>
        <StaffLayout>{children}</StaffLayout>
      </ToastProvider>
    </StaffI18nProvider>
  );
}
