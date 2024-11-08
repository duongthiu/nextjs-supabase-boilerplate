import { SupabaseClient } from '@supabase/supabase-js';
import { cache } from 'react';

export const getUser = cache(async (supabase: SupabaseClient) => {
  const {
    data: { user }
  } = await supabase.auth.getUser();
  return user;
});

export async function getEmployees(
  supabase: SupabaseClient,
  page?: number,
  itemsPerPage?: number
) {
  let query = supabase
    .from('Employees')
    .select('*', { count: 'exact' })
    .eq('is_deleted', false)
    .order('surname', { ascending: true });

  // Apply pagination only if both page and itemsPerPage are provided
  if (page !== undefined && itemsPerPage !== undefined) {
    const startRow = (page - 1) * itemsPerPage;
    query = query.range(startRow, startRow + itemsPerPage - 1);
  }

  const { data: employees, error, count } = await query;

  if (error) {
    console.error('Error fetching employees:', error);
    return { employees: null, count: 0 };
  }

  return { employees, count };
}

export async function getEmployee(supabase: SupabaseClient, id: string) {
  const { data: employee, error } = await supabase
    .from('Employees')
    .select('*')
    .eq('id', id)
    .eq('is_deleted', false)
    .single();

  if (error) {
    console.error('Error fetching employee:', error);
    return null;
  }

  return employee;
}

export async function addEmployee(supabase: SupabaseClient, employeeData: any) {
  const { data, error } = await supabase
    .from('Employees')
    .insert([{
      ...employeeData,
      is_deleted: false
    }])
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
    .update([{
      ...employeeData,
      updated_at: new Date().toISOString()
    }])
    .eq('id', employeeData.id)
    .select();

  if (error) {
    console.error('Error updating employee:', error);
    throw error;
  }

  return data;
}

export async function getClients(
  supabase: SupabaseClient,
  page?: number,
  itemsPerPage?: number
) {
  let query = supabase
    .from('Clients')
    .select('*', { count: 'exact' })
    .eq('is_deleted', false)
    .order('name', { ascending: true });

  // Apply pagination only if both page and itemsPerPage are provided
  if (page !== undefined && itemsPerPage !== undefined) {
    const startRow = (page - 1) * itemsPerPage;
    query = query.range(startRow, startRow + itemsPerPage - 1);
  }

  const { data: clients, error, count } = await query;

  if (error) {
    console.error('Error fetching clients:', error);
    return { clients: null, count: 0 };
  }

  return { clients, count };
}

export async function getClient(supabase: SupabaseClient, id: string) {
  const { data: client, error } = await supabase
    .from('Clients')
    .select('*')
    .eq('id', id)
    .eq('is_deleted', false)
    .single();

  if (error) {
    console.error('Error fetching client:', error);
    return null;
  }

  return client;
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

export async function getProjects(
  supabase: SupabaseClient,
  page?: number,
  itemsPerPage?: number
) {
  let query = supabase
    .from('Projects')
    .select('*, Clients(name)', { count: 'exact' })
    .order('name', { ascending: true });

  // Apply pagination only if both page and itemsPerPage are provided
  if (page !== undefined && itemsPerPage !== undefined) {
    const startRow = (page - 1) * itemsPerPage;
    query = query.range(startRow, startRow + itemsPerPage - 1);
  }

  const { data: projects, error, count } = await query;

  if (error) {
    console.error('Error fetching projects:', error);
    return { projects: null, count: 0 };
  }

  const projectsWithClientName = projects?.map((project) => ({ 
    ...project,
    client_name: project.Clients ? project.Clients.name : 'Unknown Client',
  }));

  return { projects: projectsWithClientName, count };
}

export async function getProject(supabase: SupabaseClient, id: string) {
  const { data: project, error } = await supabase
    .from('Projects')
    .select('*')
    .eq('id', id)
    // .eq('is_deleted', false)
    .single();

  if (error) {
    console.error('Error fetching project:', error);
    return null;
  }

  return project;
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

// Add a new function specifically for searching clients
export async function searchClients(
  supabase: SupabaseClient,
  searchTerm: string
) {
  const { data: clients, error } = await supabase
    .from('Clients')
    .select('*')
    .eq('is_deleted', false)
    .ilike('name', `%${searchTerm}%`)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error searching clients:', error);
    return null;
  }

  return clients;
}

export async function getAllocations(
  supabase: SupabaseClient,
  page?: number,
  itemsPerPage?: number
) {
  let query = supabase
    .from('Allocations')
    .select(`
      *,
      Employees(given_name, surname),
      Projects(name, code)
    `, { count: 'exact' })
    .eq('is_deleted', false)
    .order('start_date', { ascending: false });

  if (page !== undefined && itemsPerPage !== undefined) {
    const startRow = (page - 1) * itemsPerPage;
    query = query.range(startRow, startRow + itemsPerPage - 1);
  }

  const { data: allocations, error, count } = await query;

  if (error) {
    console.error('Error fetching allocations:', error);
    return { allocations: null, count: 0 };
  }

  const formattedAllocations = allocations?.map(allocation => ({
    ...allocation,
    employee_name: `${allocation.Employees.given_name} ${allocation.Employees.surname}`,
    project_name: `${allocation.Projects.code} - ${allocation.Projects.name}`
  }));

  return { allocations: formattedAllocations, count };
}

export async function getAllocation(supabase: SupabaseClient, id: string) {
  // First, get the basic allocation data
  const { data: allocation, error: allocationError } = await supabase
    .from('Allocations')
    .select('*')
    .eq('id', id)
    .eq('is_deleted', false)
    .single();

  if (allocationError) {
    console.error('Error fetching allocation:', allocationError);
    return null;
  }

  // Then get the employee and project details separately
  const { data: employee } = await supabase
    .from('Employees')
    .select('given_name, surname')
    .eq('id', allocation.employee_id)
    .single();

  const { data: project } = await supabase
    .from('Projects')
    .select('name, code')
    .eq('id', allocation.project_id)
    .single();

  return {
    ...allocation,
    Employees: employee,
    Projects: project
  };
}

export async function addAllocation(supabase: SupabaseClient, allocationData: any) {
  const { data, error } = await supabase
    .from('Allocations')
    .insert([{
      ...allocationData,
      is_deleted: false
    }])
    .select();

  if (error) {
    console.error('Error adding allocation:', error);
    throw error;
  }

  return data;
}

export async function updateAllocation(supabase: SupabaseClient, allocationData: any) {
  // Remove nested objects before update
  const { Employees, Projects, employee_name, project_name, ...updateData } = allocationData;
  
  const { data, error } = await supabase
    .from('Allocations')
    .update({
      ...updateData,
      updated_at: new Date().toISOString()
    })
    .eq('id', updateData.id)
    .select();

  if (error) {
    console.error('Error updating allocation:', error);
    throw error;
  }

  return data;
}