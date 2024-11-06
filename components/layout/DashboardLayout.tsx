import { Navbar } from '../landing/Navbar';
import { Sidebar } from './Sidebar';
import { User } from '@supabase/supabase-js';

interface DashboardLayoutProps {
  user: User;
  children: React.ReactNode;
}

export function DashboardLayout({ user, children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Navbar user={user} />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}