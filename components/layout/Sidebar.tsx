'use client'

import { Button } from "@/components/ui/button";
import { Bell, Users, Briefcase, Settings } from "lucide-react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-card p-4 shadow-md">
      <nav className="space-y-2">
        <Link href="/employees">
          <Button 
            variant={pathname.startsWith('/employees') ? "secondary" : "ghost"} 
            className="w-full justify-start"
          >
            <Users className="mr-2 h-4 w-4" />
            Employees
          </Button>
        </Link>
        <Link href="/clients">
          <Button 
            variant={pathname.startsWith('/clients') ? "secondary" : "ghost"} 
            className="w-full justify-start"
          >
            <Users className="mr-2 h-4 w-4" />
            Clients
          </Button>
        </Link>
        <Link href="/projects">
          <Button 
            variant={pathname.startsWith('/projects') ? "secondary" : "ghost"} 
            className="w-full justify-start"
          >
            <Briefcase className="mr-2 h-4 w-4" />
            Projects
          </Button>
        </Link>
        {/* <Button variant="ghost" className="w-full justify-start">
          <Bell className="mr-2 h-4 w-4" />
          Notifications
          <span className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">12</span>
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button> */}
      </nav>
    </aside>
  );
}