import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import AddProjectForm from '@/components/misc/AddProjectForm';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default async function EditProject({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const user = await getUser(supabase);
  
  if (!user) {
    redirect('/auth/signin');
  }

  return (
    <DashboardLayout user={user}>
      <AddProjectForm projectId={params.id} />
    </DashboardLayout>
  );
}