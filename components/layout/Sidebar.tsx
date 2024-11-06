'use client'

import { Button } from "@/components/ui/button";
import { Bell, Users, Briefcase, Settings, X } from "lucide-react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoIcon } from '../landing/Icons';

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-card p-4 shadow-md flex flex-col h-full">
      {/* Logo and Title */}
      <div className="mb-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <LogoIcon />
          <span className="font-bold text-base lg:text-xl">NextJS Supabase</span>
        </Link>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
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