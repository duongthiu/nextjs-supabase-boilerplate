import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import AddClientForm from '@/components/misc/AddClientForm';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default async function EditClient({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const user = await getUser(supabase);
  
  if (!user) {
    redirect('/auth/signin');
  }

  return (
    <DashboardLayout user={user}>
      <AddClientForm clientId={params.id} />
    </DashboardLayout>
  );
}