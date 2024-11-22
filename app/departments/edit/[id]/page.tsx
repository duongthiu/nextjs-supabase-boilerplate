import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import AddDepartmentForm from '@/components/misc/AddDepartmentForm';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default async function EditDepartment({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const user = await getUser(supabase);
  
  if (!user) {
    redirect('/auth/signin');
  }

  return (
    <DashboardLayout user={user}>
      <AddDepartmentForm departmentId={params.id} />
    </DashboardLayout>
  );
} 