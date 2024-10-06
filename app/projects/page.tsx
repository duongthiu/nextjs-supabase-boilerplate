import ProjectsPage from '@/components/misc/ProjectsPage';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { getUser } from '@/utils/supabase/queries';
import { SupabaseClient } from '@supabase/supabase-js';

export default async function Projects() {
  const supabase: SupabaseClient = createClient();
  const user = await getUser(supabase);
  if (!user) {
    redirect('/login');
  }

  return (
    <DashboardLayout user={user}>
      <ProjectsPage user={user} />
    </DashboardLayout>
  );
}
