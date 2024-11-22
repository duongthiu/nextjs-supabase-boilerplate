import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import AddKnowledgeForm from '@/components/misc/AddKnowledgeForm';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default async function EditKnowledge({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const user = await getUser(supabase);
  
  if (!user) {
    redirect('/auth/signin');
  }

  return (
    <DashboardLayout user={user}>
      <AddKnowledgeForm knowledgeId={params.id} />
    </DashboardLayout>
  );
} 