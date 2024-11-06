'use client'

import { Button } from "@/components/ui/button";
import { Bell, Users, Briefcase, Settings } from "lucide-react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoIcon } from '../landing/Icons';

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-card p-4 shadow-md flex flex-col">
      {/* Logo and Title */}
      <div className="mb-8">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <LogoIcon />
          <span className="font-bold">NextJS Supabase Boilerplate</span>
        </Link>
      </div>

      {/* Navigation */}
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
      </nav>
    </aside>
  );
}