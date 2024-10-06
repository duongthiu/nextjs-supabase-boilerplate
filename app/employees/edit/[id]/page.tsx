import { createClient } from '@/utils/supabase/server';
import { getUser, getEmployee } from '@/utils/supabase/queries';
import AddEmployeeForm from '@/components/misc/AddEmployeeForm';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SupabaseClient } from '@supabase/supabase-js';

export default async function EditEmployee({ params }: { params: { id: string } }) {
  const supabase: SupabaseClient = createClient();
  const { id } = params;

  const user = await getUser(supabase);
  if (!user) {
    return redirect('/auth/signin');
  }

  return (
    <DashboardLayout user={user}>
      <AddEmployeeForm employeeId={id}/>
    </DashboardLayout>
  );
}