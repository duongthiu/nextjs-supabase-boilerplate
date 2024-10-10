'use client'

import { User } from '@supabase/supabase-js';
import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import LoadingIndicator from "@/components/ui/loading-indicator";
import { getEmployees } from "@/utils/supabase/queries";
import { useRouter } from 'next/navigation';
import { Employee } from '@/utils/types';

export default function EmployeesPage({
  user
}: {
  user: User;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[] | null>(null);
  
  const fetchEmployees = async () => {
    setIsLoading(true);
    const supabase:SupabaseClient = createClient();
    const employees = await getEmployees(supabase);
    setEmployees(employees);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 p-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Employee List</CardTitle>
            <Link href="/employees/add">
              <Button variant="default">+ Add New</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {/* <div className="flex space-x-2 mb-4">
              <Button variant="default">Active</Button>
              <Button variant="secondary">Inactive</Button>
            </div> */}
            <table className="w-full">
              <thead>
                <tr className="text-left bg-muted">
                  <th className="p-2">Name</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Citizenship</th>
                  <th className="p-2">Active</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees?.map((employee) => (
                  <tr key={employee.id} className="border-b" onClick={() => {
                    router.push(`/employees/edit/${employee.id}`); 
                  }}>
                    <td className="p-2">
                      <div className="flex items-center space-x-2">
                        <Avatar>
                          <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${employee.given_name} ${employee.surname}`} alt={`${employee.given_name} ${employee.surname}`} />
                          <AvatarFallback>{employee.given_name[0]}{employee.surname?.[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div>{`${employee.given_name} ${employee.surname}`}</div>
                          <div className="text-sm text-muted-foreground">{employee.company_email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-2">{employee.company_email}</td>
                    <td className="p-2">{employee.citizenship}</td>
                    <td className="p-2">
                      <span className={`bg-${employee.is_active ? 'green' : 'red'}-100 text-${employee.is_active ? 'green' : 'red'}-800 text-xs font-medium px-2 py-1 rounded`}>
                        {employee.is_active ? 'Yes' : 'No'}
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