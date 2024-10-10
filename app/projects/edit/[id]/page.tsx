import { createClient } from '@/utils/supabase/server';
import { getUser, getProject } from '@/utils/supabase/queries';
import AddProjectForm from '@/components/misc/AddProjectForm';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SupabaseClient } from '@supabase/supabase-js';

export default async function EditProject({ params }: { params: { id: string } }) {
  const supabase: SupabaseClient = createClient();
  const { id } = params;

  const user = await getUser(supabase);
  if (!user) {
    return redirect('/auth/signin');
  }

  return (
    <DashboardLayout user={user}>
      <AddProjectForm projectId={id} />
    </DashboardLayout>
  );
}