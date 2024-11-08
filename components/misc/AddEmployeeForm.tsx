'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from '@/utils/supabase/client'
import { addEmployee, updateEmployee, getEmployee } from '@/utils/supabase/queries';
import { useEffect } from 'react';
import { Employee } from '@/utils/types';
import { SupabaseClient } from '@supabase/supabase-js';
import { CustomCheckbox } from '@/components/ui/custom-checkbox';

export default function AddEmployeeForm({ employeeId }: { employeeId: string | null }) {
  const [formData, setFormData] = useState<Employee | {}>({
    given_name: '',
    surname: '',
    company_email: '',
    personal_email: '',
    citizenship: '',
    tax_residence: '',
    location: '',
    mobile_number: '',
    home_address: '',
    birth_date: '',
    is_active: true,
    is_deleted: false,
});
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchEmployee = async () => {
      if (employeeId) {
        const supabase: SupabaseClient = createClient();
        const employee = await getEmployee(supabase, employeeId);
        setFormData(employee);
      }
    };

    fetchEmployee();
  }, [employeeId]);  

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

    if (!(formData as Employee).given_name || !(formData as Employee).company_email || !(formData as Employee).personal_email) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      const supabase = createClient();
      let data;

      if (employeeId) {
        data = await updateEmployee(supabase, {id: employeeId, ...formData});
      } else {
        const { id, ...employeeData } = formData as Employee;
        data = await addEmployee(supabase, employeeData);
      }

      console.log('Employee added/updated successfully:', data);
      router.push('/employees');
    } catch (error: any) {
      setError(error.message || 'Failed to add/update employee.');
      console.error('Error adding/updating employee:', error);
    }
  };

  return (
    <div className="container mx-auto">
      <main className="flex-1 p-8">
        <Card>
          <CardHeader>
            <CardTitle>{employeeId ? 'Edit Employee' : 'Add New Employee'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">

              <div>
                <Label htmlFor="given_name">Given Name *</Label>
                <Input
                  id="given_name"
                  name="given_name"
                  value={(formData as Employee).given_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="surname">Surname</Label>
                <Input
                  id="surname"
                  name="surname"
                  value={(formData as Employee).surname}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="company_email">Company Email *</Label>
                <Input
                  id="company_email"
                  name="company_email"
                  type="email"
                  value={(formData as Employee).company_email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="personal_email">Personal Email *</Label>
                <Input
                  id="personal_email"
                  name="personal_email"
                  type="email"
                  value={(formData as Employee).personal_email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="citizenship">Citizenship (2-letter code)</Label>
                <Input
                  id="citizenship"
                  name="citizenship"
                  value={(formData as Employee).citizenship}
                  onChange={handleInputChange}
                  maxLength={2}
                />
              </div>
              <div>
                <Label htmlFor="tax_residence">Tax Residence (2-letter code)</Label>
                <Input
                  id="tax_residence"
                  name="tax_residence"
                  value={(formData as Employee).tax_residence}
                  onChange={handleInputChange}
                  maxLength={2}
                />
              </div>
              <div>
                <Label htmlFor="location">Location (2-letter code)</Label>
                <Input
                  id="location"
                  name="location"
                  value={(formData as Employee).location}
                  onChange={handleInputChange}
                  maxLength={2}
                />
              </div>
              <div>
                <Label htmlFor="mobile_number">Mobile Number</Label>
                <Input
                  id="mobile_number"
                  name="mobile_number"
                  value={(formData as Employee).mobile_number}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="home_address">Home Address</Label>
                <Input
                  id="home_address"
                  name="home_address"
                  value={(formData as Employee).home_address}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="birth_date">Birth Date</Label>
                <Input
                  id="birth_date"
                  name="birth_date"
                  type="date"
                  value={(formData as Employee).birth_date}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <CustomCheckbox
                  id="is_active"
                  label="Active"
                  checked={(formData as Employee).is_active}
                  onChange={(checked) => 
                    setFormData(prev => ({ ...prev, is_active: checked }))
                  }
                />
              </div>
                {error && <div className="text-red-500 bg-red-100 p-2 rounded">{error}</div>}
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => router.push('/employees')}>Cancel</Button>
                  <Button type="submit">Submit</Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}