'use client'

import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import { getClients } from '@/utils/supabase/queries';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ClientsPageProps {
  user: User;
}

export default function ClientsPage({ user }: ClientsPageProps) {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    async function loadClients() {
      try {
        const supabase = createClient();
        const clientsData = await getClients(supabase);
        if (clientsData) {
          setClients(clientsData);
        }
      } catch (error) {
        console.error('Error loading clients:', error);
      } finally {
        setLoading(false);
      }
    }

    loadClients();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4">
      <main className="flex-1 p-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Client List</CardTitle>
            <Link href="/clients/add">
              <Button variant="default">+ Add New</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <table className="w-full">
              <thead>
                <tr className="text-left bg-muted">
                  <th className="p-2">Name</th>
                  <th className="p-2">Client Code</th>
                  <th className="p-2">Address</th>
                  <th className="p-2">Country</th>
                  <th className="p-2">Active</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients?.map((client) => (
                  <tr 
                    key={client.id} 
                    className="border-b hover:bg-muted/50 cursor-pointer"
                    onClick={() => router.push(`/clients/edit/${client.id}`)}
                  >
                    <td className="p-2">{client.name}</td>
                    <td className="p-2">{client.client_code}</td>
                    <td className="p-2">{client.address}</td>
                    <td className="p-2">{client.country_code_iso_2}</td>
                    <td className="p-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                        client.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {client.is_active ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="p-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/clients/edit/${client.id}`);
                        }}
                      >
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