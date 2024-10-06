import ClientsPage from '@/components/misc/ClientsPage';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { getUser } from '@/utils/supabase/queries';
import { SupabaseClient } from '@supabase/supabase-js';

export default async function Clients() {
  const supabase: SupabaseClient = createClient();
  const user = await getUser(supabase);
  
  if (!user) {
    return redirect('/auth/signin');
  }

  return (
    <DashboardLayout user={user}>
      <ClientsPage user={user} />
    </DashboardLayout>
  );
}