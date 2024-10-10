import { createClient } from '@/utils/supabase/server';
import { getUser, getClient } from '@/utils/supabase/queries';
import AddClientForm from '@/components/misc/AddClientForm';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SupabaseClient } from '@supabase/supabase-js';

export default async function EditClient({ params }: { params: { id: string } }) {
  const supabase: SupabaseClient = createClient();
  const { id } = params;

  const user = await getUser(supabase);
  if (!user) {
    return redirect('/auth/signin');
  }

  return (
    <DashboardLayout user={user}>
      <AddClientForm clientId={id}/>
    </DashboardLayout>
  );
}