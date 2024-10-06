import { SupabaseClient } from '@supabase/supabase-js';
import { cache } from 'react';

export const getUser = cache(async (supabase: SupabaseClient) => {
  const {
    data: { user }
  } = await supabase.auth.getUser();
  return user;
});

export const getSubscription = cache(async (supabase: SupabaseClient) => {
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*, prices(*, products(*))')
    .in('status', ['trialing', 'active'])
    .order('created', { ascending: false })
    .limit(1)
    .maybeSingle();

  return subscription;
});

// export const getProducts = cache(async (supabase: SupabaseClient) => {
//   const { data: products } = await supabase
//     .from('products')
//     .select('*, prices(*)')
//     .eq('active', true)
//     .eq('prices.active', true)
//     .order('metadata->index')
//     .order('unit_amount', { referencedTable: 'prices' });

//   return products;
// });

// export const getUserDetails = cache(async (supabase: SupabaseClient) => {
//   const { data: userDetails } = await supabase
//     .from('users')
//     .select('*')
//     .single();
//   return userDetails;
// });

export async function getEmployees(supabase: SupabaseClient) {
  const { data: employees, error } = await supabase
    .from('Employees')
    .select('*')
    .order('surname', { ascending: true });

  if (error) {
    console.error('Error fetching employees:', error);
    return null;
  }

  return employees;
};

export async function getEmployee(supabase: SupabaseClient, id: string) {
  const { data: employee, error } = await supabase
    .from('Employees')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching employee:', error);
    return null;
  }

  return employee;
}

export async function getClients(supabase: SupabaseClient) {
  const { data: clients, error } = await supabase
    .from('Clients')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching clients:', error);
    return null;
  }

  return clients;
};

export async function getProjects(supabase: SupabaseClient) {
  const { data: projects, error } = await supabase
    .from('Projects')
    .select('*, Clients(name)')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching projects:', error);
    return null;
  }

  const projectsWithClientName = projects.map((project) => ({ 
    ...project,
    client_name: project.Clients ? project.Clients.name : 'Unknown Client',
  }));

  return projectsWithClientName;
};

export async function addEmployee(supabase: SupabaseClient, employeeData: any) {
  const { data, error } = await supabase
    .from('Employees')
    .insert([employeeData])
    .select();

  if (error) {
    console.error('Error adding employee:', error);
    throw error;
  }

  return data;
}

export async function updateEmployee(supabase: SupabaseClient, employeeData: any) {
  const { data, error } = await supabase
    .from('Employees')
    .update([employeeData])
    .eq('id', employeeData.id)
    .select();

  if (error) {
    console.error('Error updating employee:', error);
    throw error;
  }

  return data;
}

export async function addClient(supabase: SupabaseClient, clientData: any) {
  const { data, error } = await supabase
    .from('Clients')
    .insert([clientData])
    .select();

  if (error) {
    console.error('Error adding client:', error);
    throw error;
  }

  return data;
}

export async function updateClient(supabase: SupabaseClient, clientData: any) {
  const { data, error } = await supabase
    .from('Clients')
    .update([clientData])
    .eq('id', clientData.id)
    .select();

  if (error) {
    console.error('Error updating client:', error);
    throw error;
  }

  return data;
}

export async function addProject(supabase: SupabaseClient, projectData: any) {
  const { data, error } = await supabase
    .from('Projects')
    .insert([projectData])
    .select();

  if (error) {
    console.error('Error adding project:', error);
    throw error;
  }

  return data;
}

export async function updateProject(supabase: SupabaseClient, projectData: any) {
  const { data, error } = await supabase
    .from('Projects')
    .update([projectData])
    .eq('id', projectData.id)
    .select();

  if (error) {
    console.error('Error updating project:', error);
    throw error;
  }

  return data;
}