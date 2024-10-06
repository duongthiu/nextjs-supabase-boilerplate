'use client'

import { SupabaseClient, User } from '@supabase/supabase-js';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import LoadingIndicator from "@/components/ui/loading-indicator";
import { createClient } from "@/utils/supabase/client";
import { getClients } from "@/utils/supabase/queries";

interface Client {
  id: string;
  name: string;
  client_code: string;
  address: string;
  postal_code: string;
  country_code_iso_2: string;
}

export default function ClientsPage({
  user
}: {
  user: User;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [clients, setClients] = useState<Client[] | null>(null);

  const fetchClients = async () => {
    setIsLoading(true);
    const supabase: SupabaseClient = createClient();
    const clients = await getClients(supabase);
    setClients(clients);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
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
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients?.map((client) => (
                  <tr key={client.id} className="border-b">
                    <td className="p-2">{client.name}</td>
                    <td className="p-2">{client.client_code}</td>
                    <td className="p-2">{client.address}</td>
                    <td className="p-2">{client.country_code_iso_2}</td>
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