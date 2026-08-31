import { StudentLayout } from '@/app/student/components/StudentLayout';
import { ToastProvider } from '@/lib/ui/ToastContext';
import { StudentI18nProvider } from './i18n';

export const metadata = {
  title: 'Student Portal | ApnaPG',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <StudentI18nProvider>
      <ToastProvider>
        <StudentLayout>{children}</StudentLayout>
      </ToastProvider>
    </StudentI18nProvider>
  );
}
