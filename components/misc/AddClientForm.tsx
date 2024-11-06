'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from '@/utils/supabase/client';
import { addClient, updateClient, getClient } from '@/utils/supabase/queries';
import { Client } from '@/utils/types';
import { SupabaseClient } from '@supabase/supabase-js';

export default function AddClientForm({ clientId }: { clientId: string | null}) {
  const [formData, setFormData] = useState<Client | {}>({
    name: '',
    client_code: '',
    address: '',
    postal_code: '',
    country_code_iso_2: '',
    is_active: true,
    is_deleted: false,
  });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchClient = async () => {
      if (clientId) {
        const supabase: SupabaseClient = createClient();
        const client = await getClient(supabase, clientId);
        setFormData(client);
      }
    };

    fetchClient();
  }, [clientId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!(formData as Client).name || !(formData as Client).client_code || !(formData as Client).country_code_iso_2) {
      setError('Please fill in all required fields.');
      return;
    }

    if ((formData as Client).client_code.length > 8) {
      setError('Client Code must be 8 characters or less.');
      return;
    }

    if ((formData as Client).country_code_iso_2.length !== 2) {
      setError('Country Code must be exactly 2 characters.');
      return;
    }

    try {
      const supabase = createClient();
      let data;

      if (clientId) {
        data = await updateClient(supabase, { id: clientId, ...formData });
      } else {
        const { id, ...clientData } = formData as Client;
        data = await addClient(supabase, clientData);
      }

      console.log('Client added successfully:', data);
      router.push('/clients');
    } catch (error: any) {
      setError(error.message || 'Failed to add client.');
      console.error('Error adding client:', error);
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>{clientId ? 'Edit Client' : 'Add New Client'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                value={(formData as Client).name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="client_code">Client Code * (max 8 characters)</Label>
              <Input
                id="client_code"
                name="client_code"
                value={(formData as Client).client_code}
                onChange={handleInputChange}
                required
                maxLength={8}
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={(formData as Client).address}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="postal_code">Postal Code (max 8 characters)</Label>
              <Input
                id="postal_code"
                name="postal_code"
                value={(formData as Client).postal_code}
                onChange={handleInputChange}
                maxLength={8}
              />
            </div>
            <div>
              <Label htmlFor="country_code_iso_2">Country Code (ISO-2) *</Label>
              <Input
                id="country_code_iso_2"
                name="country_code_iso_2"
                value={(formData as Client).country_code_iso_2}
                onChange={handleInputChange}
                required
                maxLength={2}
              />
            </div>
            <div>
              <Label htmlFor="is_active">Is Active</Label>
              <Input
                id="is_active"
                name="is_active"
                type="checkbox"
                checked={(formData as Client).is_active}
                onChange={handleInputChange}
              />
            </div>
            {error && <div className="text-red-500 bg-red-100 p-2 rounded">{error}</div>}
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => router.push('/clients')}>Cancel</Button>
              <Button type="submit">Submit</Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}