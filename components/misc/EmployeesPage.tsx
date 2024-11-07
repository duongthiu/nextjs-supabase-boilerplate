'use client'

import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import { getEmployees } from '@/utils/supabase/queries';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EmployeesPageProps {
  user: User;
}

export default function EmployeesPage({ user }: EmployeesPageProps) {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    async function loadEmployees() {
      try {
        const supabase = createClient();
        const employeesData = await getEmployees(supabase);
        if (employeesData) {
          setEmployees(employeesData);
        }
      } catch (error) {
        console.error('Error loading employees:', error);
      } finally {
        setLoading(false);
      }
    }

    loadEmployees();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4">
      <main className="flex-1 p-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Employee List</CardTitle>
            <Link href="/employees/add">
              <Button variant="default">+ Add New</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <table className="w-full">
              <thead>
                <tr className="text-left bg-muted">
                  <th className="p-2">Given Name</th>
                  <th className="p-2">Surname</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Phone</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees?.map((employee) => (
                  <tr 
                    key={employee.id} 
                    className="border-b hover:bg-muted/50 cursor-pointer"
                    onClick={() => router.push(`/employees/edit/${employee.id}`)}
                  >
                    <td className="p-2">{employee.given_name}</td>
                    <td className="p-2">{employee.surname}</td>
                    <td className="p-2">{employee.company_email}</td>
                    <td className="p-2">{employee.mobile_number}</td>
                    <td className="p-2">
                      <span className={`bg-${employee.is_active ? 'green' : 'red'}-100 text-${employee.is_active ? 'green' : 'red'}-800 text-xs font-medium px-2 py-1 rounded`}>
                        {employee.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-2">
                      <Button variant="ghost" size="icon">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}