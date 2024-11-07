'use client'

import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import { getProjects } from '@/utils/supabase/queries';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProjectsPageProps {
  user: User;
}

export default function ProjectsPage({ user }: ProjectsPageProps) {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    async function loadProjects() {
      try {
        const supabase = createClient();
        const projectsData = await getProjects(supabase);
        if (projectsData) {
          setProjects(projectsData);
        }
      } catch (error) {
        console.error('Error loading projects:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4">
      <main className="flex-1 p-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Project List</CardTitle>
            <Link href="/projects/add">
              <Button variant="default">+ Add New</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <table className="w-full">
              <thead>
                <tr className="text-left bg-muted">
                  <th className="p-2">Project Code</th>
                  <th className="p-2">Project Name</th>
                  <th className="p-2">Client</th>
                  <th className="p-2">Start Date</th>
                  <th className="p-2">End Date</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects?.map((project) => (
                  <tr 
                    key={project.id} 
                    className="border-b hover:bg-muted/50 cursor-pointer"
                    onClick={() => router.push(`/projects/edit/${project.id}`)}
                  >
                    <td className="p-2">{project.code}</td>
                    <td className="p-2">{project.name}</td>
                    <td className="p-2">{project.client_name}</td>
                    <td className="p-2">{new Date(project.start_date).toLocaleDateString()}</td>
                    <td className="p-2">{project.end_date ? new Date(project.end_date).toLocaleDateString() : '-'}</td>
                    <td className="p-2">
                      <span className={`bg-${project.status === 'active' ? 'green' : 'yellow'}-100 text-${project.status === 'active' ? 'green' : 'yellow'}-800 text-xs font-medium px-2 py-1 rounded`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="p-2">
                      <Button variant="ghost" size="icon">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}