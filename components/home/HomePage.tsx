'use client'

import { User } from '@supabase/supabase-js'
import { useState } from 'react'
import EmployeesPage from "@/components/misc/EmployeesPage"
import ClientsPage from "@/components/misc/ClientsPage"
import ProjectsPage from "@/components/misc/ProjectsPage"
import { DashboardLayout } from "@/components/layout/DashboardLayout"

export default function HomePage({ user }: { user: User }) {
  const [activeTab, setActiveTab] = useState('employees');

  return (
    <DashboardLayout user={user}>
      {activeTab === 'employees' && <EmployeesPage user={user} />}
      {activeTab === 'clients' && <ClientsPage user={user} />}
      {activeTab === 'projects' && <ProjectsPage user={user} />}
    </DashboardLayout>
  );
} 