'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from '@/utils/supabase/client';
import { addClient } from '@/utils/supabase/queries';

export default function AddClientForm() {
  const [formData, setFormData] = useState({
    name: '',
    client_code: '',
    address: '',
    postal_code: '',
    country_code_iso_2: '',
  });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name || !formData.client_code || !formData.country_code_iso_2) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.client_code.length > 8) {
      setError('Client Code must be 8 characters or less.');
      return;
    }

    if (formData.country_code_iso_2.length !== 2) {
      setError('Country Code must be exactly 2 characters.');
      return;
    }

    try {
      const supabase = createClient();
      const data = await addClient(supabase, formData);

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
        <CardTitle>Add New Client</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="client_code">Client Code * (max 8 characters)</Label>
              <Input
                id="client_code"
                name="client_code"
                value={formData.client_code}
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
                value={formData.address}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="postal_code">Postal Code (max 8 characters)</Label>
              <Input
                id="postal_code"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleInputChange}
                maxLength={8}
              />
            </div>
            <div>
              <Label htmlFor="country_code_iso_2">Country Code (ISO-2) *</Label>
              <Input
                id="country_code_iso_2"
                name="country_code_iso_2"
                value={formData.country_code_iso_2}
                onChange={handleInputChange}
                required
                maxLength={2}
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