'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from '@/utils/supabase/client';
import { getClients, addProject, getProject, updateProject, searchClients } from '@/utils/supabase/queries';
import { SupabaseClient } from '@supabase/supabase-js';
import { Autocomplete } from '@/components/ui/autocomplete';

interface Client {
  id: string;
  name: string;
}

export default function AddProjectForm({ projectId }: { projectId: string | null }) {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    client_id: '',
    currency: '',
    contract_owner: '',
    start_date: '',
    end_date: '',
    deal_status: '',
    billable: 'false',
    engagement_manager_email: '',
    note: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchResults, setSearchResults] = useState<Client[]>([]);
  const router = useRouter();
  const supabase: SupabaseClient = createClient();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { clients: clientsData } = await getClients(supabase);
        if (clientsData) {
          setClients(clientsData);
        } else {
          setError('Failed to fetch clients.');
        }
      } catch (error) {
        setError('Failed to fetch clients.');
      }
    };

    const fetchProject = async () => {
      if (projectId) {
        const project = await getProject(supabase, projectId);
        console.log('Project:', project);
        if (project) {
          setFormData(project);
        } else {
          setError('Failed to fetch project.');
        }
      }
    };

    fetchClients();
    fetchProject();
  }, [projectId]);

  useEffect(() => {
    const handleSearch = async () => {
      if (isSearchMode && clientSearchTerm.length >= 2) {
        const results = await searchClients(supabase, clientSearchTerm);
        setSearchResults(results || []);
      }
    };

    handleSearch();
  }, [clientSearchTerm, isSearchMode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    console.log('Selected value:', value);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.code || !formData.name || !formData.client_id || !formData.contract_owner || !formData.engagement_manager_email) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      if (projectId) {
        await updateProject(supabase, { id: projectId, ...formData });
      } else {
        await addProject(supabase, formData);
      }
      router.push('/projects');
    } catch (error: any) {
      setError(error.message || 'Failed to add project.');
      console.error('Error adding project:', error);
    }
  };

  const ClientSelector = () => {
    if (!isSearchMode) {
      return (
        <Select 
          value={formData.client_id}
          onValueChange={(value) => setFormData(prev => ({ ...prev, client_id: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a client" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    return (
      <Autocomplete
        options={clients}
        value={formData.client_id}
        onChange={(value) => setFormData(prev => ({ ...prev, client_id: value }))}
        placeholder="Search clients..."
      />
    );
  };

  return (
    <div className="container mx-auto">
      <main className="flex-1 p-8">
        <Card>
          <CardHeader>
            <CardTitle>{projectId ? 'Edit Project' : 'Add New Project'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="code">Project Code *</Label>
                  <Input
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    required
                    maxLength={50}
                  />
                </div>
                <div>
                  <Label htmlFor="name">Project Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    maxLength={255}
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label htmlFor="client_id">Client *</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsSearchMode(!isSearchMode)}
                    >
                      {isSearchMode ? 'Show All' : 'Search Mode'}
                    </Button>
                  </div>
                  <ClientSelector />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    maxLength={6}
                  />
                </div>
                <div>
                  <Label htmlFor="contract_owner">Contract Owner *</Label>
                  <Input
                    id="contract_owner"
                    name="contract_owner"
                    value={formData.contract_owner}
                    onChange={handleInputChange}
                    required
                    maxLength={50}
                  />
                </div>
                <div>
                  <Label htmlFor="engagement_manager_email">Engagement Manager Email *</Label>
                  <Input
                    id="engagement_manager_email"
                    name="engagement_manager_email"
                    type="email"
                    value={formData.engagement_manager_email}
                    onChange={handleInputChange}
                    required
                    maxLength={255}
                  />
                </div>
                <div>
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    name="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    name="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="deal_status">Deal Status *</Label>
                  <Select 
                    name="deal_status" 
                    onValueChange={(value) => handleSelectChange('deal_status', value)} 
                    required 
                    value={formData.deal_status}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select deal status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="WON">Won</SelectItem>
                      <SelectItem value="LOST">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="billable">Billable *</Label>
                  <Input
                    id="billable"
                    name="billable"
                    type="checkbox"
                    checked={formData.billable ? true : false}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="note">Note</Label>
                  <Input
                    id="note"
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                  />
                </div>
                {error && <div className="text-red-500 bg-red-100 p-2 rounded">{error}</div>}
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => router.push('/projects')}>Cancel</Button>
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