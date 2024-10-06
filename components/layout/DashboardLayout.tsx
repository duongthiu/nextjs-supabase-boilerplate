import { Navbar } from '../landing/Navbar';
import { Sidebar } from './Sidebar';
import { User } from '@supabase/supabase-js';

interface DashboardLayoutProps {
  user: User;
  children: React.ReactNode;
}

export function DashboardLayout({ user, children }: DashboardLayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-background">
      <Navbar user={user} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}