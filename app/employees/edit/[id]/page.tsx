import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import AddEmployeeForm from '@/components/misc/AddEmployeeForm';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default async function EditEmployee({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const user = await getUser(supabase);
  
  if (!user) {
    redirect('/auth/signin');
  }

  return (
    <DashboardLayout user={user}>
      <AddEmployeeForm employeeId={params.id} />
    </DashboardLayout>
  );
}