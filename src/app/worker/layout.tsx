import { NotificationProvider } from '@/context/NotificationContext';

export default function WorkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NotificationProvider>
      {children}
    </NotificationProvider>
  );
}
